#!/usr/bin/env python3
"""Test Shot List: data integrity, then a smoke test of every view in a phone-sized browser.

Runs against both build outputs (build/claude.html and index.html), so run tools/build.py first.
Needs Playwright with Chromium. Exits non-zero if anything fails.

Usage: python3 tools/test.py [--shots DIR]   (--shots saves a screenshot of each view)
"""
import os, sys, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOTS = sys.argv[sys.argv.index("--shots")+1] if "--shots" in sys.argv else None
failures = []

def check(label, ok, detail=""):
    print(("  ok    " if ok else "  FAIL  ") + label + (("  " + str(detail)) if detail and not ok else ""))
    if not ok: failures.append(label)

INTEGRITY = r"""() => {
  const out = {};
  const ids = IDEAS.map(x=>x.id);
  out.uniqueIds = ids.length === new Set(ids).size;
  out.ideaRefs = IDEAS.filter(x=>!PLACES[x.p]||!INTENTS[x.i]||!SETUP[x.r]||!CAMERAS.q343.recipes[x.r]||!x.w.length||x.w.some(w=>!WHEN[w])).map(x=>x.id);
  out.compose = IDEAS.filter(x=>!COMPOSE[x.id]||!TECH[COMPOSE[x.id][0]]).map(x=>x.id);
  out.stance = IDEAS.filter(x=>!STANCE[STANCE_OF[x.id]]).map(x=>x.id);
  out.hashtags = IDEAS.filter(x=>igTags(x).length!==2).map(x=>x.id);
  out.techArt = Object.keys(TECH).filter(k=>!TECH_ART[k]);
  const mapped = Object.keys(PLACES).filter(id=>typeof PLACES[id].lat==="number");
  out.placeData = mapped.filter(id=>!START[id]||!START_GEO[id]||!STATION_GEO[id]||!AREA_OF[id]||!PLACE_NOTES[id]||!IG_PLACE[id]);
  out.placeIdeas = Object.keys(PLACES).filter(id=>IDEAS.filter(x=>x.p===id&&!x.m).length<5);
  const moving = ["july4","santacon"];   // location changes every year; the weekly task sets it
  out.events = EVENTS.filter(e=>!EVENT_TYPES[e.type]||(!moving.includes(e.id)&&(!e.map||!EVENT_GEO[e.id]))||!e.ideas.every(i=>INTENTS[i[0]]&&SETUP[i[3]])).map(e=>e.id);
  out.cameras = Object.values(CAMERAS).filter(c=>IDEAS.some(x=>!c.recipes[x.r])).map(c=>c.name);
  out.dof = dofCalc(43,8,3).map(v=>+v.toFixed(1));
  out.learn = LEARN.length;
  out.streetCams = STREET_CAMS.filter(c=>c.length!==15||!(c[8]>0&&c[9]>0&&c[10]>0&&c[11]>0)).map(c=>c[0]);
  return out; }"""

def run(path, name):
    print("\n" + name + ": " + os.path.relpath(path, ROOT))
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 900}, timezone_id="America/New_York",
                            geolocation={"latitude": 40.7230, "longitude": -73.9990}, permissions=["geolocation"])
        pg = ctx.new_page(); pg.set_default_timeout(8000)
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.clock.install(time="2026-10-11T15:00:00")
        # A fixed forecast for the installed app: rain from 3 pm to 6 pm, overcast before, clear after
        times=["2026-10-%sT%02d:00"%(d,h) for d in ("11","12") for h in range(24)]
        code=[61 if (d=="11" and 15<=h<18) else 3 if (d=="11" and 12<=h<15) else 1 for d in ("11","12") for h in range(24)]
        fake={"current":{"temperature_2m":14,"weather_code":3,"is_day":1},"daily":{"precipitation_probability_max":[80,10]},
              "hourly":{"time":times,"weather_code":code,"precipitation_probability":[80 if c==61 else 10 for c in code],"precipitation":[1.2 if c==61 else 0 for c in code],"cloud_cover":[100 if c in (3,61) else 20 for c in code]}}
        import json as _j
        import base64 as _b
        png=_b.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
        pg.route("**/upload.wikimedia.org/**", lambda r: r.fulfill(status=200, content_type="image/png", body=png))   # stand-in for the place photos
        pg.route("**/api.open-meteo.com/**", lambda r: r.fulfill(status=200, content_type="application/json", body=_j.dumps(fake)))
        pg.goto("file://" + path); pg.wait_for_timeout(700)

        d = pg.evaluate(INTEGRITY)
        check("idea ids unique", d["uniqueIds"])
        check("every idea has place, intent, recipe and light", not d["ideaRefs"], d["ideaRefs"])
        check("every idea has a compose line", not d["compose"], d["compose"])
        check("every idea has a stance diagram", not d["stance"], d["stance"])
        check("every idea has two hashtags", not d["hashtags"], d["hashtags"])
        check("every technique has an illustration", not d["techArt"], d["techArt"])
        check("every place has start, station, area, notes, tag", not d["placeData"], d["placeData"])
        check("every place has five ideas", not d["placeIdeas"], d["placeIdeas"])
        check("every built-in event is typed, mapped and placed", not d["events"], d["events"])
        check("every camera has a recipe for every idea", not d["cameras"], d["cameras"])
        check("depth of field: 43 mm f/8 at 3 m is 2.2 to 4.9 m", d["dof"] == [2.2, 4.9], d["dof"])
        check("camera comparison data complete", not d["streetCams"], d["streetCams"])

        def shot(n):
            if SHOTS:
                os.makedirs(SHOTS, exist_ok=True); pg.screenshot(path=os.path.join(SHOTS, name + "-" + n + ".png"), full_page=False)
        def no_overflow(label):
            w = pg.evaluate("document.documentElement.scrollWidth")
            check(label + ": no sideways scrolling", w <= 390, w)

        # Today: opens first, with the light, places to go and an outing
        check("App opens on Today", pg.evaluate("state.view")=="today" and pg.evaluate("!document.getElementById('viewToday').hidden"))
        check("Today gives the light and places to go", pg.evaluate("[!!document.querySelector('.tverdict').textContent, document.querySelectorAll('.twin').length>=4, document.querySelectorAll('.tpick').length]")==[True,True,3])
        if pg.evaluate("document.querySelectorAll('[data-tat]').length")>1:
            pg.click("[data-tat]:not([data-tat=now])"); pg.wait_for_timeout(100)
            check("Choosing a later light changes the picks", pg.evaluate("state.todayAt")!=None and pg.evaluate("document.querySelector('[data-tat][aria-pressed=true]').dataset.tat")!="now")
        no_overflow("Today"); shot("today")
        pg.click("[data-planday]"); pg.wait_for_timeout(500)
        check("Plan an outing builds it and opens the map", pg.evaluate("state.view")=="map" and pg.evaluate("!!(state.plan&&state.plan.stops.length)"))
        pg.evaluate("state.plan=null; savePlan(); state.view='today'; render()"); pg.wait_for_timeout(100)
        pg.click(".tpick .row"); pg.wait_for_timeout(100)
        check("A pick opens its idea in Shoot", pg.evaluate("state.view")=="shoot")
        # Shoot: every tab of a card
        for tab in ["idea", "work", "compose", "settings"]:
            pg.evaluate("t=>{state.view='shoot';state.tab=t;render()}", tab); pg.wait_for_timeout(80)
        no_overflow("Shoot"); shot("shoot")
        pg.evaluate("state.camera='q328'; show('ktown-moment'); state.tab='settings'; renderCard()")
        pg.click("[data-tip='6']"); pg.wait_for_timeout(250)
        check("A setting opens its explanation in a sheet, with this idea's option marked", pg.evaluate("[!document.getElementById('tipSheet').hidden, document.querySelector('.tsopts li.on b')?.textContent.startsWith('Mechanical')]")==[True,True])
        shot("settings-sheet")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
        check("The sheet closes with Escape", pg.evaluate("document.getElementById('tipSheet').hidden && !document.body.classList.contains('tipopen')"))
        pg.click("[data-tip='4']"); pg.click(".tsback", position={"x":20,"y":20}); pg.wait_for_timeout(100)
        check("The sheet closes when tapping outside", pg.evaluate("document.getElementById('tipSheet').hidden"))
        pg.evaluate("state.tab='idea'; show('ktown-moment'); state.tab='idea'; renderCard()"); pg.wait_for_timeout(100)
        check("The Idea tab has Street View and Guide me there", pg.evaluate("[!!document.querySelector('.stand a[href*=map_action]'), !!document.querySelector('.stand [data-guidego]')]")==[True,True])
        check("The Idea tab says where to stand, with a dial and walking link", pg.evaluate("[!!document.querySelector('.stand .sdial'), (document.querySelector('.stand')?.textContent||'').includes('Macy'), !!document.querySelector('.stand a[href*=travelmode]')]")==[True,True,True])
        shot("idea-stand")
        nowk=pg.evaluate("IDEAS.filter(x=>{ const W=WORKX[x.id]; return !W||!W[0]||!W[1]||!(W[2]>0)||!W[3]||Object.keys(CAMERAS).some(c=>!workFocus(x,c)); }).map(x=>x.id)")
        check("Every idea says what to keep sharp, how far, how high, how to focus and when to press", not nowk, nowk)
        pg.evaluate("state.camera='q328'; show('ktown-energy'); state.tab='work'; renderCard()"); pg.wait_for_timeout(100)
        wk=pg.evaluate("[...document.querySelectorAll('#card .wkrow .label')].map(l=>l.textContent)")
        check("Work it shows the five details, with focus for the chosen camera", len(wk)==5 and wk[3].endswith("Leica Q3 (28 mm)") and "still" in pg.evaluate("document.querySelector('#card .wk').textContent"), wk)
        check("Work it lists tips for the best shot", pg.evaluate("document.querySelectorAll('#card .wktips li').length")==3)
        notips=pg.evaluate("IDEAS.filter(x=>(WORK_TIPS[x.id]||[]).length<2||!WORK_REC_TIP[x.r]).map(x=>x.id)")
        check("Every idea has tips", not notips, notips)
        shot("work-details")
        pg.evaluate("state.tab='idea'; show('ktown-moment'); state.tab='idea'; renderCard()"); pg.wait_for_timeout(100)
        pg.click(".stand [data-spotmap]"); pg.wait_for_timeout(900)
        check("See it on the map opens that spot", pg.evaluate("[state.view, state.mapSpot && SPOTS.ktown[+state.mapSpot.split(':')[1]][5]]")==["map","ktown-moment"])
        shot("idea-stand-map")
        pg.evaluate("state.view='shoot'; render()"); pg.wait_for_timeout(100)
        pg.click("#next"); pg.wait_for_timeout(80)
        # Browse and Saved
        pg.click("#vBrowse"); pg.wait_for_timeout(150); no_overflow("Browse"); shot("browse")
        check("Browse lists ideas", pg.evaluate("document.querySelectorAll('#list .row').length") > 100)
        pg.click("[data-listv=saved]"); pg.wait_for_timeout(100)
        check("Saved ideas are a switch in Browse", pg.evaluate("state.view")=="saved" and pg.evaluate("document.getElementById('vBrowse').getAttribute('aria-selected')")=="true")
        # Plan
        pg.click("#vPlan"); pg.click("#pGo"); pg.wait_for_timeout(150)
        check("Plan makes an outing", pg.evaluate("!!(state.plan&&state.plan.stops.length)")); no_overflow("Plan"); shot("plan")
        # the plan keeps to days, hours and first light
        pg.evaluate("(()=>{ const now=new Date(); let n=1; while(new Date(now.getFullYear(),now.getMonth(),now.getDate()+n).getDay()!==2) n++; $('pDay').value=String(n); renderPlan(); $('pStart').value='harlem'; $('pTime').value='10'; $('pLen').value='90'; state.plan=makePlan(); })()")
        tue=pg.evaluate("[state.plan.start.getDay(), state.plan.stops.flatMap(s=>s.ideas.map(x=>x.id)), state.plan.skipped]")
        check("A Tuesday plan leaves out the Sunday church idea and says so", tue[0]==2 and "harlem-moment" not in tue[1] and "harlem-moment" in tue[2], tue)
        pg.evaluate("(()=>{ const now=new Date(); let n=1; while(new Date(now.getFullYear(),now.getMonth(),now.getDate()+n).getDay()!==0) n++; $('pDay').value=String(n); renderPlan(); $('pStart').value='harlem'; $('pTime').value='10'; $('pLen').value='90'; state.plan=makePlan(); })()")
        check("A Sunday morning plan in Harlem includes the church steps", pg.evaluate("state.plan.stops.flatMap(s=>s.ideas.map(x=>x.id)).includes('harlem-moment')"))
        pg.evaluate("$('pDay').value='1'; renderPlan(); $('pStart').value='cpark'; $('pTime').value='5'; $('pLen').value='240'; state.plan=makePlan()")
        dawn=pg.evaluate("[state.plan.notes.length, state.plan.start.getHours()*60+state.plan.start.getMinutes(), lightAt(state.plan.start)]")
        check("A start before first light moves to blue hour", dawn[0]==1 and dawn[1]>5*60+30 and dawn[2]!="night", dawn)
        pg.evaluate("$('pDay').value='1'; renderPlan(); $('pStart').value='midtown'; $('pTime').value='18'; $('pLen').value='90'; state.plan=makePlan()")
        check("An evening Midtown plan says the lunch ideas are out of hours", pg.evaluate("state.plan.notes.some(n=>n.startsWith('Nothing at Midtown'))"), pg.evaluate("state.plan.notes"))
        check("Availability shows on the card", pg.evaluate("availText(IDEAS.find(x=>x.id==='gct-energy'))")=="Weekdays · 5 pm to 6 pm")
        pg.evaluate("$('pDay').value='0'; renderPlan(); state.plan=makePlan(); savePlan(); renderPlan()")
        # Events
        pg.click("#vEvents"); pg.wait_for_timeout(150)
        check("Events lists events", pg.evaluate("document.querySelectorAll('#events details').length") > 10); no_overflow("Events"); shot("events")
        # Map
        pg.click("#vMap"); pg.wait_for_timeout(400)
        box=pg.evaluate("(()=>{const m=document.getElementById('map').getBoundingClientRect(); return [Math.round(m.height), Math.round(m.bottom)]})()")
        check("Map fills the screen under the header", box[0]>=500 and box[1]<=900, box)
        check("Real streets and subway lines are drawn", pg.evaluate("[document.querySelectorAll('.m-rd').length, document.querySelectorAll('.m-subway path').length]")==[4,len(pg.evaluate("MAPD_SUBWAY"))] and len(pg.evaluate("MAPD_SUBWAY"))>=8)
        check("Every subway station is listed with its lines", pg.evaluate("MAPD_STATIONS.length")>=470 and pg.evaluate("MAPD_STATIONS.every(s=>s[3]&&s[1]>40.5&&s[1]<40.92&&s[2]>-74.26&&s[2]<-73.7)"))
        pg.click("#mapLayersBtn"); pg.wait_for_timeout(150)
        check("Layers menu opens", pg.evaluate("!document.getElementById('mapLayers').hidden && document.querySelectorAll('#mapLayers [data-layer]').length")==7)
        pg.click("[data-z=man]"); pg.wait_for_timeout(500)
        check("Jump to Manhattan closes the menu", pg.evaluate("document.getElementById('mapLayers').hidden"))
        check("Map draws pins", pg.evaluate("document.querySelectorAll('.m-pin').length") > 10)
        pg.select_option("#mapGo", "union"); pg.wait_for_timeout(500)
        check("Map go-to selects a place", pg.evaluate("state.mapSel") == "union")
        check("Selecting a place opens the sheet halfway", pg.evaluate("state.sheet")=="half")
        pg.wait_for_timeout(900)
        check("Selecting a place zooms in to its spots", pg.evaluate("mapV.w")<=60 and pg.evaluate("document.querySelectorAll('.m-spotg').length")>=2, pg.evaluate("mapV.w"))
        pg.evaluate("state.plan=null; mapPanel()"); pg.click("[data-addplan]"); pg.wait_for_timeout(100)
        pg.evaluate("mapSelect('wsp')"); pg.click("[data-addplan]"); pg.wait_for_timeout(100)
        check("Map builds an outing", pg.evaluate("state.plan.stops.map(s=>s.place).join()") == "union,wsp")
        links=pg.evaluate("[...document.querySelectorAll('.planlinks a')].map(a=>a.href)")
        check("Outing opens in Google Maps", len(links)==2 and "destination=" in links[0] and "waypoints=" in links[1] and links[1].count("destination=")==1, links)
        pg.evaluate("setSheet('full')"); pg.wait_for_timeout(300)
        pg.click("[data-stop='1']"); pg.wait_for_timeout(500)
        check("Stop chip moves the slider", pg.evaluate("state.mapT") is not None)
        marks=pg.evaluate("[...document.querySelectorAll('#lightMarks [data-jump]')].map(b=>b.textContent)")
        check("Light marks on the slider", any(m.startswith("Golden hour") for m in marks) and any(m.startswith("Blue hour") for m in marks) and "--band" in pg.evaluate("document.getElementById('mapTime').getAttribute('style')||''"), marks)
        pg.evaluate("setSheet('full')"); pg.wait_for_timeout(300)
        pg.click("#lightMarks .lmark:has(.lk.blue)"); pg.wait_for_timeout(200)
        check("Blue hour mark moves the map to blue hour", "Blue hour" in pg.evaluate("document.getElementById('sunLine').textContent"), pg.evaluate("document.getElementById('sunLine').textContent")[:60])
        check("Real shoreline, land around the city, parks, cemeteries and airports", pg.evaluate("[MAPD_LAND.length>20000, MAPD_CTX.length>3000, MAPD_PARK.length>3000, MAPD_CEM.length>200, MAPD_AIR.length>200, document.querySelectorAll('.m-base path').length]")==[True,True,True,True,True,5])
        pg.evaluate("state.mapT=13*60; mapDraw()"); sky_day=pg.evaluate("document.getElementById('map').dataset.sky")
        pg.evaluate("state.mapT=21*60; mapDraw()"); sky_night=pg.evaluate("document.getElementById('map').dataset.sky")
        check("Map palette follows the time: light by day, dark at night", [sky_day,sky_night]==["day","night"] and pg.evaluate("getComputedStyle(document.querySelector('.m-land')).fill")!="", [sky_day,sky_night])
        pg.evaluate("cancelAnimationFrame(mapAnim); mapV=mapPreset('man'); mapDraw()")
        nph=pg.evaluate("[...document.querySelectorAll('#mapPhotos image')].filter(i=>i.style.display!=='none').length")
        check("Pins have idea rings and badges", pg.evaluate("document.querySelectorAll('.m-pin.big .m-arc').length")>40 and pg.evaluate("document.querySelectorAll('#mapOver .m-badge').length")>5)
        if name=="Installed app": check("Pins show place photos in the installed app", nph>=10 and pg.evaluate("Object.keys(PLACE_PHOTO).length")==23, nph)
        else: check("No outside photos in the Claude version", pg.evaluate("document.querySelectorAll('#mapPhotos image').length")==0)
        pg.evaluate("mapV={cx:mapXY(40.7355,-73.995)[0],cy:mapXY(40.7355,-73.995)[1],w:100}; mapDraw()")
        pg.evaluate("state.mapT=21*60; mapDraw(); mapPanel()")
        check("Night tint at 9 pm", "night" in pg.evaluate("document.querySelector('.m-tint').getAttribute('class')"))
        pg.evaluate("state.mapT=16*60; mapDraw(); mapPanel()")
        check("Sun and sunny sides at 4 pm", pg.evaluate("[!!document.querySelector('.m-sun'), document.querySelectorAll('.m-sunny').length>0]") == [True, True])
        if name=="Installed app":
            pg.wait_for_timeout(300); pg.evaluate("state.mapT=16*60; mapDraw(); mapPanel()")
            check("Forecast bar lists the rain", "Rain likely 3 pm to 6 pm" in pg.evaluate("document.getElementById('wxBar').textContent"), pg.evaluate("document.getElementById('wxBar').textContent"))
            check("Pins switch to rain ideas in wet hours", pg.evaluate("lightAt(mapNow())")=="rain")
            pg.evaluate("state.mapT=19*60; mapDraw(); mapPanel()")
            check("Dry evening is golden light again", pg.evaluate("lightAt(mapNow())")!="rain")
        else:
            check("Explains where the hourly forecast is", "installed app" in pg.evaluate("document.getElementById('wxBar').textContent"))
        no_overflow("Map"); shot("map")
        # Events on the map: on now, later today, over
        win=pg.evaluate("""()=>{ const d=new Date(2026,9,11), W=t=>evWindow({time:t},d); return [W("12 pm to 5 pm"),W("Starts at 7 pm"),W("Steps off at 11 am; festival block 10 am to 4 pm"),W("Wed to Sat 11 am to 6 pm, Sun noon to 5 pm"),W("Late morning"),W("Best in the first two hours and the last two hours of daylight")]; }""")
        check("Event times are read", win==[[720,1020],[1140,1320],[600,960],[660,1080],[630,720],None], win)
        pg.evaluate("""()=>{ EVENT_DOCS.testlive={name:"Test street fair",type:"festival",start:"2026-10-11",time:"12 pm to 5 pm",lat:40.6944,lon:-73.9213,ideas:[]}; state.mapShowEv=true; mapSelect(null); mapFly(mapPreset('city')); }""")
        def evk(t):
            pg.evaluate("t=>{state.mapT=t; mapDraw(); mapPanel()}", t); pg.wait_for_timeout(50)
            return pg.evaluate("(()=>{const g=document.querySelector('.m-ev[data-e=testlive]'); return g?g.getAttribute('class')+'|'+g.querySelector('.m-evday').textContent:''})()")
        pg.wait_for_timeout(600)
        check("Event on now is labelled and shown when zoomed out", evk(14*60)=="m-ev live|On now", evk(14*60))
        check("Status line and layers count events on now", "1 event on now" in pg.evaluate("document.getElementById('mapStatus').textContent") and "1 on now" in pg.evaluate("document.querySelector('[data-layer=mapShowEv]').textContent") and not pg.evaluate("document.getElementById('mapLiveDot').hidden"))
        check("Event later today shows its start", evk(10*60)=="m-ev today|Today 12 pm", evk(10*60))
        pg.evaluate("mapSelectEv('testlive')"); pg.evaluate("state.mapT=14*60; mapDraw(); mapPanel()")
        check("Event panel says it is on now", "On now, until about 5 pm" in pg.evaluate("document.querySelector('.evnow').textContent"))
        shot("map-event-live")
        pg.evaluate("mapSelectEv(null)")
        check("Event that has finished is marked over", evk(18*60).startswith("m-ev over"), evk(18*60))
        pg.evaluate("()=>{ delete EVENT_DOCS.testlive; state.mapT=null; mapDraw(); mapPanel(); }")
        # Light compass, where to stand, moon
        pg.evaluate("state.mapT=16*60; mapSelect('union'); cancelAnimationFrame(mapAnim); mapV={cx:mapXY(40.7359,-73.9906)[0],cy:mapXY(40.7359,-73.9906)[1],w:100}; mapDraw(); mapPanel()")
        check("Light compass round the selected place", pg.evaluate("document.querySelectorAll('.m-comp').length")==4 and "for backlight" in pg.evaluate("document.querySelector('.maplight').textContent"))
        check("Place lists where to stand", pg.evaluate("document.querySelectorAll('#mapPanel [data-spot]').length")>=2)
        pg.evaluate("setSheet('half')"); pg.wait_for_timeout(300)
        pg.click("#mapPanel [data-spot]"); pg.wait_for_timeout(900)
        check("Spot shows its lens wedge and panel", pg.evaluate("[!!document.querySelector('.m-spotg.on .m-cone'), !!document.querySelector('#mapPanel .spotfov'), !!document.querySelector('#mapPanel .row[data-id]')]")==[True,True,True])
        shot("map-spot")
        sv=pg.evaluate("document.querySelector('#mapPanel a[href*=map_action]')?.href||''")
        check("A spot opens a checked Street View panorama", ("pano=" in sv or "!2e10" in sv) and ("heading=" in sv or "h,90t" in sv), sv)
        nosv=pg.evaluate("Object.entries(SPOTS).flatMap(([pid,l])=>pid==='ferry'?[]:l.map((S,i)=>pid+':'+i).filter(id=>!SV_PANO[id]))")
        check("Every spot off the ferry has a checked panorama", not nosv, nosv)
        badsv=pg.evaluate("Object.entries(SV_PANO).filter(([id,P])=>!(SPOTS[id.split(':')[0]]||[])[+id.split(':')[1]]||(P[1]===1&&P[2]===null)).map(x=>x[0])")
        check("Panorama entries match spots, and visitor photos carry a position", not badsv, badsv)
        check("Spots are numbered on the map and in the place list", pg.evaluate("document.querySelectorAll('.m-spotn').length")>=2 and pg.evaluate("!!document.querySelector('#mapPanel .group-head .snum')"))
        pg.evaluate("""()=>{ navigator.geolocation.watchPosition=(ok)=>{ window._gok=ok; ok({coords:{latitude:40.7360,longitude:-73.9950,accuracy:12}}); return 7; }; navigator.geolocation.clearWatch=()=>{}; }""")
        pg.evaluate("guideStart(state.mapSpot)"); pg.wait_for_timeout(300)
        g1=pg.evaluate("[document.getElementById('mapGuide').hidden, document.getElementById('mapGuide').textContent, !!document.querySelector('.m-guide')]")
        check("Guide me there shows the distance, time and a line to the spot", g1[0]==False and " min" in g1[1] and "Head " in g1[1] and g1[2], g1)
        pg.evaluate("(()=>{ const S=SPOTS[state.guide.id.split(':')[0]][+state.guide.id.split(':')[1]]; window._gok({coords:{latitude:S[0],longitude:S[1]+0.0001,accuracy:10}}); })()"); pg.wait_for_timeout(200)
        check("Arriving says you are here and which way to face", "You are here. Face" in pg.evaluate("document.getElementById('mapGuide').textContent"))
        shot("map-guide")
        pg.click("#mapGuide [data-guidestop]"); pg.wait_for_timeout(100)
        check("The guide stops", pg.evaluate("state.guide===null && document.getElementById('mapGuide').hidden"))
        pg.evaluate("state.pos={lat:40.7355,lon:-73.9910}; showNear()"); pg.wait_for_timeout(300)
        nr=pg.evaluate("[state.mapNear, document.querySelectorAll('#mapPanel .nrow').length]")
        pg.click("[data-nearall='1']"); pg.wait_for_timeout(100)
        nr2=pg.evaluate("document.querySelectorAll('#mapPanel .nrow').length")
        check("Spots near me lists nearby spots, and All spots shows at least as many", nr[0] and nr2>=max(1,nr[1]), [nr,nr2])
        shot("map-near")
        pg.evaluate("state.mapNear=false; state.pos=null; mapSelect('union'); mapDraw(); mapPanel()"); pg.wait_for_timeout(300)
        bad=pg.evaluate("""Object.entries(SPOTS).flatMap(([pid,l])=>l.length<2||!PLACES[pid]?[pid]:l.filter(S=>!IDEAS.find(x=>x.id===S[5])||kmBetween({lat:S[0],lon:S[1]},PLACES[pid])>(pid==='ferry'?4:S[5]==='dumbo-place-s'?2.5:1.6)||!(S[2]>=0&&S[2]<360)||!S[4]).map(S=>pid+':'+S[3]))""")
        missing=pg.evaluate("Object.keys(PLACES).filter(id=>typeof PLACES[id].lat==='number'&&!SPOTS[id])")
        check("Every place has spots near it, each with a valid idea", not bad and not missing, [bad,missing])
        nospot=pg.evaluate("IDEAS.filter(x=>PLACES[x.p]&&typeof PLACES[x.p].lat==='number'&&!spotFor(x)).map(x=>x.id)")
        check("Every idea has its own place to stand", not nospot, nospot)
        dup=pg.evaluate("(()=>{ const c={}; Object.values(SPOTS).flat().forEach(S=>c[S[5]]=(c[S[5]]||0)+1); return Object.keys(c).filter(k=>c[k]>1); })()")
        check("No idea has two spots", not dup, dup)
        mo=pg.evaluate("(()=>{ const m=moonPos(new Date(2026,9,24,20,30),40.7128,-74.006), t=moonTimes(new Date(2026,9,24,12),40.7128,-74.006); return [Math.round(m.frac*100),m.alt,m.az,t.rise,moonName(m)]; })()")
        # Reference from the PyEphem library: 98% lit, 37.9 deg up, azimuth 113.4, rises 4:59 pm
        check("Moon matches an ephemeris", abs(mo[0]-98)<=2 and abs(mo[1]-37.9)<2.5 and abs(mo[2]-113.4)<3 and abs(mo[3]-(16*60+59))<=15 and mo[4]=="Full moon", mo)
        pg.evaluate("mapSelect(null)")
        # Landmarks
        pg.evaluate("mapSelect(null); cancelAnimationFrame(mapAnim); mapV=mapPreset('city'); mapDraw()"); pg.wait_for_timeout(200)
        n_city=pg.evaluate("document.querySelectorAll('.m-lm').length")
        pg.evaluate("mapV={cx:mapXY(40.745,-73.99)[0],cy:mapXY(40.745,-73.99)[1],w:150}; mapDraw()")
        n_close=pg.evaluate("document.querySelectorAll('.m-lm').length")
        check("Landmarks show, more when zoomed in", n_city>=3 and n_close>=8, [n_city,n_close])
        pg.evaluate("mapSelectLm(LANDMARKS.findIndex(l=>l[0]==='Flatiron Building'))"); pg.wait_for_timeout(150)
        check("Landmark panel has its tip and nearest place", "Flatiron" in pg.evaluate("document.getElementById('mapPanel').textContent") and pg.evaluate("!!document.querySelector('#mapPanel [data-gosel]')"))
        shot("map-landmark")
        pg.click("#mapLayersBtn"); pg.click("[data-layer=mapShowLm]"); pg.wait_for_timeout(150)
        check("Landmarks toggle off", pg.evaluate("document.querySelectorAll('.m-lm').length")==0 and pg.evaluate("state.mapLm")==None)
        pg.click("[data-layer=mapShowLm]"); pg.click("[data-layersclose]"); pg.wait_for_timeout(150)
        pg.click("#mapLayersBtn"); pg.click("[data-layer=mapShowSub]"); pg.wait_for_timeout(100)
        check("Subway lines toggle off", pg.evaluate("getComputedStyle(document.querySelector('.m-subway')).display")=="none")
        pg.click("[data-layer=mapShowSub]"); pg.click("[data-layersclose]")
        check("Every landmark has a symbol and a tip", pg.evaluate("LANDMARKS.filter(l=>!LM_GLYPH[l[3]]||!LM_KIND[l[3]]||!l[5]||l[1]<40.4||l[1]>41||l[2]>-73.6||l[2]<-74.3).map(l=>l[0])")==[])
        # Full screen
        pg.evaluate("mapSelect(null)"); pg.click("[data-full]"); pg.wait_for_timeout(300)
        shot("map-full-empty")
        fs=pg.evaluate("(()=>{const r=document.getElementById('mapSvg').getBoundingClientRect(); return [document.getElementById('map').classList.contains('full'), Math.round(r.width), Math.round(r.height)]})()")
        check("Full screen map fills the screen", fs[0] and fs[1]>=370 and fs[2]>=600, fs)
        pg.evaluate("mapSelect('union')"); pg.wait_for_timeout(200)
        check("Full screen shows a tapped place in the sheet", pg.evaluate("state.sheet!=='peek' && !!document.querySelector('#mapPanel .mapsel')"))
        shot("map-full")
        pg.click("[data-unsel]"); pg.wait_for_timeout(100)
        check("Closing a place clears the panel", pg.evaluate("!document.querySelector('#mapPanel .mapsel') && state.mapSel===null"))
        pg.click("[data-full]"); pg.wait_for_timeout(300)
        pg.wait_for_timeout(200)
        check("Leaving full screen restores the map", pg.evaluate("!document.getElementById('map').classList.contains('full') && !document.body.classList.contains('mapfull')"))
        # The sheet can be dragged
        g=pg.locator("#mapGrab").bounding_box(); pg.mouse.move(g["x"]+g["width"]/2, g["y"]+8); pg.mouse.down(); pg.mouse.move(g["x"]+g["width"]/2, g["y"]-300, steps=8); pg.mouse.up(); pg.wait_for_timeout(350)
        check("Dragging the sheet up opens it", pg.evaluate("state.sheet")!="peek", pg.evaluate("state.sheet"))
        # Learn
        pg.click("#vLearn"); pg.wait_for_timeout(150)
        pg.evaluate("document.querySelectorAll('details.lesson').forEach(d=>d.open=true)"); pg.wait_for_timeout(100)
        check("Learn shows every lesson", pg.evaluate("document.querySelectorAll('details.lesson').length") == pg.evaluate("LEARN.length"))
        no_overflow("Learn"); shot("learn")
        # Dark theme renders too
        pg.evaluate("document.documentElement.dataset.theme='dark'; state.view='shoot'; render()"); pg.wait_for_timeout(80)
        check("no script errors", not errors, errors[:3])
        b.close()

for path, name in [(os.path.join(ROOT, "build", "claude.html"), "Claude version"), (os.path.join(ROOT, "index.html"), "Installed app")]:
    if not os.path.exists(path): sys.exit("missing " + path + "; run tools/build.py first")
    run(path, name)

print("\n" + ("All checks passed." if not failures else "%d check(s) failed: %s" % (len(failures), "; ".join(failures))))
sys.exit(1 if failures else 0)
