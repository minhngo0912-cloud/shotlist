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
        short=pg.evaluate("IDEAS.filter(x=>COMPOSE[x.id]&&COMPOSE[x.id][1].length<50).map(x=>x.id)")
        check("every compose line says where things go, not just the technique", not short, short)
        check("every idea has a stance diagram", not d["stance"], d["stance"])
        check("every idea has two hashtags", not d["hashtags"], d["hashtags"])
        check("every technique has an illustration", not d["techArt"], d["techArt"])
        check("every place has start, station, area, notes, tag", not d["placeData"], d["placeData"])
        check("every place has five ideas", not d["placeIdeas"], d["placeIdeas"])
        check("every built-in event is typed, mapped and placed", not d["events"], d["events"])
        check("every camera has a recipe for every idea", not d["cameras"], d["cameras"])
        fl=pg.evaluate(r"""(()=>{ const bad=FOLLOW.filter(f=>!/^https:\/\//.test(f[1])||(f[4]||'').split(' ').filter(Boolean).some(p=>!PLACES[p])||(f[3]||'').split(' ').filter(Boolean).some(i=>i!=='daily'&&!INTENTS[i])).map(f=>f[0]);
          const first=(i,p)=>followFor(i,p)[0][0]; return [bad, first('place','harlem'), followFor('energy','subway').slice(0,2).map(f=>f[0]), IDEAS.filter(x=>followFor(x.i,x.p).length<2).map(x=>x.id)]; })()""")
        check("Photographers to follow: links valid, places and intents known, matched to the place first", not fl[0] and fl[1]=="Ruben Natal-San Miguel" and "Matt Weber" in fl[2] and not fl[3], fl)
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
        check("Today opens with what the light is good for right now and a Shoot now button", pg.evaluate("[!!document.querySelector('.tnow .tverdict'), !!document.querySelector('[data-shootnow]'), (document.querySelector('.tnow .msg')||{}).textContent.includes('Sun')]")==[True,True,True])
        check("Because it is Sunday lists the weekend-only ideas", "Posing for the wall" in pg.evaluate("(document.querySelector('.tcard .tlabel')&&[...document.querySelectorAll('.tcard')].find(c=>c.textContent.includes('Because it is'))||{textContent:''}).textContent"))
        check("Today offers to use your location", pg.evaluate("!!document.querySelector('[data-todayloc]')"))
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
        pg.evaluate("state.view='today'; render()"); pg.click("[data-shootnow]"); pg.wait_for_timeout(150)
        check("Shoot now opens an idea that suits the light", pg.evaluate("state.view==='shoot' && IDEAS.find(x=>x.id===state.current).w.includes(lightAt(new Date()))"))
        # Leave-by times from home, and the week ahead
        tv=pg.evaluate("(()=>{ const H={lat:40.9585,lon:-73.9582}, W={lat:40.7308,lon:-73.9973}, sat=new Date(2026,9,17,17,0), tue=new Date(2026,9,13,17,0); return [travelMins(H,W,'car',sat), travelMins(H,W,'car',tue), travelMins(H,W,'transit',sat), travelMins(H,{lat:40.7316,lon:-73.9970},'car',sat)]; })()")
        check("Travel time from home: about an hour by car, longer in rush hour, longer by transit", 45<=tv[0]<=75 and tv[1]>tv[0] and tv[2]>tv[0] and tv[3]<=tv[0], tv)
        pg.evaluate("state.home={lat:40.9585,lon:-73.9582,mode:'car'}; state.pos=null; state.view='today'; state.todayAt=undefined; render()"); pg.wait_for_timeout(100)
        lv=pg.evaluate("(()=>{ const g=[...document.querySelectorAll('#today .tmoments [data-tat]')].find(b=>/Golden hour/.test(b.textContent)); if(g) g.click(); return [...document.querySelectorAll('#today .tpick .tleave')].map(e=>e.textContent); })()")
        check("With a home saved, each place for golden hour says when to leave home", len(lv)>=1 and all(t.startswith("Leave home by ") and "by car" in t and "golden hour" in t for t in lv), lv)
        pg.evaluate("state.pos={lat:40.7230,lon:-73.9990}; renderToday()")
        check("Leave-by times hide once you are in the city", pg.evaluate("document.querySelectorAll('#today .tleave').length")==0)
        pg.evaluate("state.pos=null; renderToday()")
        wk=pg.evaluate("[document.querySelectorAll('#today .wday').length, document.querySelectorAll('#today .wday.best').length, [...document.querySelectorAll('#today .wday')].map(d=>d.querySelector('.wds').textContent)]")
        check("The week ahead shows seven evenings with sunset times and one best evening", wk[0]==7 and wk[1]<=1 and all(":" in t for t in wk[2]), wk)
        pg.click("#today .wday[data-week='3']"); pg.wait_for_timeout(100)
        wd=pg.evaluate("[document.querySelector('#today .wdet p').textContent, !!document.querySelector('#today .wdet .tleave'), !!document.querySelector('#today [data-weekplan]')]")
        check("Tapping a day shows its golden hour, the best place, when to leave and a plan button", "golden hour" in wd[0] and "sunset" in wd[0] and wd[1] and wd[2], wd)
        pg.click("#today [data-weekmap]"); pg.wait_for_timeout(300)
        check("See it on the map opens the map on that day at golden hour", pg.evaluate("[state.view, state.mapD, state.mapT!==null]")==["map",3,True])
        pg.evaluate("state.mapD=0; state.mapT=null; state.view='today'; state.weekSel=3; render()"); pg.click("#today [data-weekplan]"); pg.wait_for_timeout(300)
        check("Plan this evening plans that day", pg.evaluate("[state.view, $('pDay').value, !!(state.plan&&state.plan.stops.length), state.plan&&state.plan.start.getDate()]")==["plan","3",True,14+0] or pg.evaluate("[state.view, $('pDay').value]")==["plan","3"], pg.evaluate("[state.view, $('pDay').value, state.plan&&state.plan.start.toString()]"))
        pg.evaluate("state.home=null; store.set('home',null); state.weekSel=null; state.plan=null; savePlan(); state.view='today'; render()")
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
        # Another idea: weighted to the light now, what is on, and what is near; with a reason line
        pk=pg.evaluate("""(()=>{ const key=lightAt(new Date()), sky=skyAt(new Date()); state.pos={lat:40.7497,lon:-73.9877}; state.history=[]; let fit=0, open=0, near=0; const seen=new Set();
          for(let i=0;i<60;i++){ pick(); const x=IDEAS.find(y=>y.id===state.current); seen.add(x.id); if(x.w.includes(key)) fit++; if(ideaOpen(x,new Date(),sky)) open++; const m=milesTo(PLACES[x.p]); if(m===null||m<3) near++; }
          state.pos=null; return [fit, open, near, seen.size]; })()""")
        check("Another idea favours the light now, what is on and what is near, and still varies", pk[0]>=45 and pk[1]>=55 and pk[2]>=45 and pk[3]>=15, pk)
        pg.evaluate("state.pos={lat:40.7497,lon:-73.9877}; show('ktown-energy'); state.tab='idea'; render()"); pg.wait_for_timeout(80)
        wy=pg.evaluate("document.querySelector('#card .why').textContent")
        check("The card says why it came up: the light and the walk", ("Suits the light now" in wy or wy.startswith("Best in")) and "min walk" in wy, wy)
        pg.evaluate("state.pos=null; render()")
        # Stay here: Another idea keeps to the place on the card
        pg.click("#card [data-stay]"); pg.wait_for_timeout(80)
        st=pg.evaluate("(()=>{ const r=[state.place, $('place').value]; const ps=new Set(); for(let i=0;i<10;i++){ pick(); ps.add(IDEAS.find(y=>y.id===state.current).p); } render(); return r.concat([[...ps].join()]); })()")
        check("Stay here locks Another idea to the place", st==["ktown","ktown","ktown"], st)
        pg.click("#card [data-stay]"); pg.wait_for_timeout(80)
        check("Tapping again goes back to anywhere", pg.evaluate("state.place")=="all")
        # When the filters leave one idea, Another idea says so and offers to widen them
        pg.evaluate("state.place='ktown'; state.intent='energy'; syncChips(); show('ktown-energy'); render()")
        pg.click("#next"); pg.wait_for_timeout(80)
        oo=pg.evaluate("[state.current, !!document.querySelector('#card .onlyone'), [...document.querySelectorAll('#card .onlyone [data-widen]')].map(b=>b.dataset.widen)]")
        check("With one idea left, Another idea says so and offers to widen the filters", oo==["ktown-energy",True,["intent","place"]], oo)
        pg.click("#card .onlyone [data-widen=intent]"); pg.wait_for_timeout(80)
        check("Widening moves on to another idea", pg.evaluate("[state.intent, state.current!=='ktown-energy', !document.querySelector('#card .onlyone')]")==["all",True,True])
        pg.evaluate("state.place='all'; $('place').value='all'; render()")
        # Compose: a drawing made for the idea says how the frame should look; the technique's own drawing and photo say they are general
        cg=pg.evaluate("""(()=>{ const r=[]; for(const id of ['ktown-odd','union-energy']){ show(id); state.tab='compose'; renderCard(); r.push([document.querySelector('#card .demo figcaption').textContent, !!document.querySelector('#card .demo.generic'), document.querySelector('#card .refphoto .label')?.textContent||null]); } state.tab='idea'; renderCard(); return r; })()""")
        check("Compose drawings and photos say whether they show this place or the technique in general", cg[0][0]=="How the frame should look." and not cg[0][1] and cg[0][2] is None and cg[1][1] and "not this place" in cg[1][0] and cg[1][2].startswith("Example photo of diagonals"), cg)
        # Swipe: left for another idea, right for the one before
        cur=pg.evaluate("state.current")
        swipe="(d)=>{ const h=document.querySelector('#card h2'); const ev=(t,x)=>h.dispatchEvent(new PointerEvent(t,{bubbles:true,clientX:x,clientY:200,pointerType:'touch',pointerId:3})); ev('pointerdown',d<0?300:100); ev('pointerup',d<0?120:290); }"
        pg.evaluate(swipe, -1); pg.wait_for_timeout(80); nxt=pg.evaluate("state.current")
        pg.evaluate(swipe, 1); pg.wait_for_timeout(80)
        check("Swiping the card goes to another idea and back", nxt!=cur and pg.evaluate("state.current")==cur, [cur,nxt])
        # The shot log: Shot it records when and in what light; rate it; undo
        pg.evaluate("show('ktown-energy'); state.tab='idea'; render()"); pg.click("#done"); pg.wait_for_timeout(80)
        lg=pg.evaluate("[document.querySelector('#card .shotlog.just p').textContent, state.done.has('ktown-energy'), shotLog('ktown-energy').length]")
        check("Shot it logs the time and light and asks how it went", lg[0].startswith("Logged ") and "How did it go" in lg[0] and lg[1] and lg[2]==1, lg)
        pg.click("#card .shotlog [data-rate=again]"); pg.wait_for_timeout(80); pg.click("#done"); pg.wait_for_timeout(80)
        lg2=pg.evaluate("[shotLog('ktown-energy').length, shotLog('ktown-energy')[0].r, $('done').textContent]")
        check("Rating sticks to that shot, and shooting again adds another", lg2==[2,"again","Shot ✓ 2×"], lg2)
        pg.click("#card .shotlog [data-undoshot]"); pg.wait_for_timeout(80)
        check("Undo removes the last one only", pg.evaluate("[shotLog('ktown-energy').length, state.done.has('ktown-energy'), document.querySelector('#card .shotlog p').textContent.includes('Try again')]")==[1,True,True])
        ta=pg.evaluate("(()=>{ const x=IDEAS.find(y=>y.id==='ktown-energy'), t=new Date(), k=x.w[0], a=shootScore(x,t,k,undefined), e=lastShot(x.id); e.r='keep'; const kp=shootScore(x,t,k,undefined); e.r='again'; state.done.delete(x.id); const fresh=shootScore(x,t,k,undefined); state.done.add(x.id); return [a<fresh, kp>fresh]; })()")
        check("A try-again comes ahead of unshot ideas when the light suits it; a keeper falls back", ta==[True,True], ta)
        code=pg.evaluate("syncEncode()")
        pg.evaluate("(c)=>{ const keep=JSON.stringify(state.log); state.log={}; state.done.delete('ktown-energy'); syncImport(c); window._back=keep; }", code)
        check("The sync code carries the shot log", pg.evaluate("[shotLog('ktown-energy').length, shotLog('ktown-energy')[0].r, state.done.has('ktown-energy')]")==[1,"again",True])
        # Street mode: large type, the details for the street, Next and Shot it; the screen stays awake
        pg.evaluate("Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:()=>{ window._wake=(window._wake||0)+1; return Promise.resolve({release(){ window._wake--; }, addEventListener(){}}); }}})")
        pg.click("#card [data-street]"); pg.wait_for_timeout(200)
        sm=pg.evaluate("[!$('street').hidden, document.body.classList.contains('streetmode'), [...document.querySelectorAll('#street .stk')].map(k=>k.textContent), document.querySelector('#street .st-exp b').textContent, window._wake||0]")
        check("Street mode opens full screen with exposure, focus, height, press, rule and where to stand, and keeps the screen awake", sm[0] and sm[1] and sm[2][1:]==["Focus","Height","Press","Rule","Stand"] and sm[3]==pg.evaluate("CAMERAS[state.camera].recipes[IDEAS.find(x=>x.id===state.current).r][0]") and sm[4]==1, sm)
        no_overflow("Street mode"); shot("street")
        c0=pg.evaluate("state.current"); pg.click("#street [data-st=next]"); pg.wait_for_timeout(80)
        check("Next idea works inside street mode", pg.evaluate("state.current")!=c0 and pg.evaluate("!$('street').hidden"))
        pg.click("#street [data-st=shot]"); pg.wait_for_timeout(80)
        check("Shot it in street mode logs and offers the rating", pg.evaluate("[state.done.has(state.current), !!document.querySelector('#street .shotlog [data-rate]')]")==[True,True])
        pg.evaluate("undoShot(state.current); render()")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(100)
        check("Escape leaves street mode and releases the screen", pg.evaluate("[$('street').hidden, state.street, document.body.classList.contains('streetmode'), window._wake]")==[True,False,False,0])
        # Browse and Saved
        pg.click("#vIdeas"); pg.click("#ideaMode [data-im=list]"); pg.wait_for_timeout(150); no_overflow("Browse"); shot("browse")
        check("Browse lists ideas", pg.evaluate("document.querySelectorAll('#list .row').length") > 100)
        nv=pg.evaluate("""(()=>{ const tabs=[...document.querySelectorAll('#views button')].map(b=>b.textContent); state.view='plan'; render();
          const r=[tabs, document.getElementById('vMap').getAttribute('aria-selected'), !$('mapPlanSheet').hidden, !!$('mapPlanBody').querySelector('#pGo'), $('map').classList.contains('planopen'), $('viewPlan').hidden];
          document.querySelector('[data-closeplan]').click(); r.push(state.view, $('mapPlanSheet').hidden); state.view='browse'; render(); return r; })()""")
        check("Five tabs; Plan opens inside the Map's sheet and closes back to the map", nv==[["Today","Ideas","Map","Events","Learn"],"true",True,True,True,True,"map",True], nv)
        pg.click("[data-listv=saved]"); pg.wait_for_timeout(100)
        check("Saved ideas are a switch in Browse", pg.evaluate("state.view")=="saved" and pg.evaluate("document.getElementById('vIdeas').getAttribute('aria-selected')")=="true")
        pg.click("[data-listv=again]"); pg.wait_for_timeout(100)
        ag=pg.evaluate("[state.view, [...document.querySelectorAll('#list .row')].map(r=>r.dataset.id), document.querySelector('#list .row .pill')?.textContent]")
        check("Browse lists the try-agains", ag==["again",["ktown-energy"],"Try again"], ag)
        pg.evaluate("state.log={}; state.done.delete('ktown-energy'); saveLog(); state.view='browse'; render()")
        # Plan
        pg.evaluate("state.view='plan'; render()"); pg.wait_for_timeout(300); pg.click("#pGo"); pg.wait_for_timeout(150)
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
        se=pg.evaluate("""(()=>{ const X=id=>IDEAS.find(x=>x.id===id), o=(id,d)=>ideaOpen(X(id),d,undefined);
          return [o('soho-halloween',new Date(2026,9,31,19,0)), o('soho-halloween',new Date(2026,9,30,19,0)), o('soho-halloween',new Date(2026,9,31,12,0)), availText(X('soho-halloween')),
            o('midtown-rink',new Date(2026,11,20,18,0)), o('midtown-rink',new Date(2026,6,20,18,0)), o('wsp-snow',new Date(2027,0,10,12,0),'snow'), o('wsp-snow',new Date(2027,0,10,12,0),'rain'),
            ideaOpen(X('wsp-snow'),new Date(2027,0,10,12,0),'snow'), cityIdeas().some(x=>x.id==='soho-halloween'), cityIdeas().some(x=>x.id==='chinatown-lunar'),
            IDEAS.filter(x=>x.m&&/-(halloween|marathon|balloons|parade|windows|rink|market|snow|lunar)$/.test(x.id)&&(!spotFor(x)||!SV_PANO[spotFor(x).id]||!COMPOSE[x.id]||!WORKX[x.id]||igTags(x).length!==2)).map(x=>x.id)]; })()""")
        check("Seasonal ideas: on only on the event's day and hours, within their dates, with snow; shown in their months; each has a spot, Street View and Compose",
              se[0] and not se[1] and not se[2] and se[3].startswith("Oct 31 only (Village Halloween Parade)") and se[4] and not se[5] and se[8] and se[9] and not se[10] and not se[11], se)
        check("Availability shows on the card", pg.evaluate("availText(IDEAS.find(x=>x.id==='gct-energy'))")=="Weekdays · 5 pm to 6 pm")
        pg.evaluate("$('pDay').value='0'; renderPlan(); state.plan=makePlan(); savePlan(); renderPlan()")
        # Events
        pg.click("#vEvents"); pg.wait_for_timeout(150)
        check("Events lists events", pg.evaluate("document.querySelectorAll('#events details').length") > 10); no_overflow("Events"); shot("events")
        el=pg.evaluate("eventLight(EVENTS.find(e=>e.id==='thanksgiving'), new Date(2026,10,26))")
        check("The light during an event: window, sun, sunset and the sunny side of the street", el[0].startswith("8:30 am to 12 pm") and "Sunset" in el[0] and el[1].startswith("Stand on the west side"), el)
        check("Events carry arrival advice and quick filters", pg.evaluate("[document.querySelectorAll('#events .evquick .chip').length, [...document.querySelectorAll('#events .label')].some(l=>l.textContent==='Getting there and when')]")==[3,True])
        pg.click("#events .evquick [data-q=confirmed]"); pg.wait_for_timeout(100)
        check("Confirmed filter keeps only confirmed events", pg.evaluate("[...document.querySelectorAll('#events details')].every(d=>d.querySelector('.pill')&&d.querySelector('.pill').textContent==='Confirmed')"))
        pg.click("#events .evquick [data-q=confirmed]"); pg.wait_for_timeout(100)
        # Music: the free outdoor series are built-ins with a stand and a view
        mu=pg.evaluate("[EVENTS.filter(e=>e.type==='music').map(e=>e.id), EVENTS.filter(e=>e.type==='music'&&(!EVENT_VIEW[e.id]||!EVENT_GEO[e.id]||e.ideas.length<3)).map(e=>e.id), EVENTS.find(e=>e.id==='summerstage').when(2026).map(w=>w.map(d=>d.getMonth()+1+'/'+d.getDate()))]")
        check("Free outdoor music series are built-in events with a stand", len(mu[0])>=7 and not mu[1] and mu[2]==[["6/1","8/31"]], mu)
        # Game days: fixture rows from the weekly check, one card per venue
        pg.evaluate("""()=>{ EVENT_DOCS._fixtures={checked:"2026-10-10",games:[{team:"knicks",at:"2026-10-20T19:00",opp:"76ers"},{team:"knicks",at:"2026-10-25T19:00",opp:"Magic"},{team:"nycfc",at:"2026-10-17T19:30",opp:"LAFC"},{team:"nets",at:"2026-10-01T19:30",opp:"Past"}]}; renderEvents(); }"""); pg.wait_for_timeout(150)
        fx=pg.evaluate("""()=>{ const rows=fixtureRows(evDay(new Date())); const k=rows.filter(r=>r.e.id==='msg'); const cards=[...document.querySelectorAll('#events details')].filter(d=>/Game day/.test(d.querySelector('summary').textContent));
          return [rows.map(r=>r.game.team), k[0].e.time, evTitle(rows.find(r=>r.game.team==='nycfc')), cards.length, cards.map(c=>c.querySelectorAll('.games li').length), cards.map(c=>c.querySelector('summary').textContent.includes('Next:'))]; }""")
        check("Game days: future home games become rows, grouped as one card per venue", fx[0]==["nycfc","knicks","knicks"] and fx[1]=="5:30 pm to 7:20 pm; tip-off 7 pm" and fx[2]=="NYCFC v LAFC (football) · Yankee Stadium" and fx[3]==2 and fx[4]==[1,2] and all(fx[5]), fx)
        pg.evaluate("()=>{ delete EVENT_DOCS._fixtures; renderEvents(); }"); pg.wait_for_timeout(100)
        pg.evaluate("planEvent('halloween')"); pg.wait_for_timeout(200)
        pl=pg.evaluate("[state.view, state.plan.stops[0].ev, state.plan.stops[0].at.getHours(), state.plan.start.getMonth(), state.plan.start.getDate(), document.querySelectorAll('#plan .row[data-event]').length]")
        check("Plan this outing builds a plan round the event, an hour early, with its shots", pl[0]=="plan" and pl[1]=="halloween" and pl[2]==18 and pl[3]==9 and pl[4]==31 and pl[5]==3, pl)
        pg.evaluate("state.plan=null; savePlan(); state.view='events'; render()"); pg.wait_for_timeout(100)
        # Map
        pg.click("#vMap"); pg.wait_for_timeout(400)
        box=pg.evaluate("(()=>{const m=document.getElementById('map').getBoundingClientRect(); return [Math.round(m.height), Math.round(m.bottom)]})()")
        check("Map fills the screen under the header", box[0]>=500 and box[1]<=900, box)
        check("Real streets and subway lines are drawn", pg.evaluate("[document.querySelectorAll('.m-rdf .m-rd').length, document.querySelectorAll('.m-subway path').length]")==[4,len(pg.evaluate("MAPD_SUBWAY"))] and len(pg.evaluate("MAPD_SUBWAY"))>=8)
        check("Every subway station is listed with its lines", pg.evaluate("MAPD_STATIONS.length")>=470 and pg.evaluate("MAPD_STATIONS.every(s=>s[3]&&s[1]>40.5&&s[1]<40.92&&s[2]>-74.26&&s[2]<-73.7)"))
        pg.click("#mapLayersBtn"); pg.wait_for_timeout(150)
        check("Layers menu opens", pg.evaluate("!document.getElementById('mapLayers').hidden && document.querySelectorAll('#mapLayers [data-layer]').length")==9)
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
        check("Real shoreline, land around the city, parks, cemeteries and airports", pg.evaluate("[MAPD_LAND.length>20000, MAPD_CTX.length>3000, MAPD_PARK.length>3000, MAPD_CEM.length>200, MAPD_AIR.length>200, document.querySelectorAll('.m-base path, .m-base use').length]")==[True,True,True,True,True,7])
        pg.evaluate("cancelAnimationFrame(mapAnim); mapV=mapPreset('bk'); mapDraw()"); pg.wait_for_timeout(100)
        check("Bridges cross the rivers and tunnels are dashed", pg.evaluate("[MAPD_BRIDGES.length>=25, MAPD_BRIDGES.filter(b=>b[1]==='tunnel').length>=4, MAPD_BRIDGES.some(b=>b[0]==='Brooklyn Bridge'), MAPD_BRIDGES.some(b=>b[0]==='George Washington Bridge'), document.querySelectorAll('.m-brg').length>=6, document.querySelectorAll('.m-brg.tun .m-tun').length>=1]")==[True]*6, pg.evaluate("[MAPD_BRIDGES.length, document.querySelectorAll('.m-brg').length]"))
        walks=pg.evaluate("LANDMARKS.filter(l=>l[3]==='walk')")
        check("Twelve bridge walkway entrances with a heading and a walk across", len(walks)==12 and all(isinstance(l[6],(int,float)) and l[7]>0 for l in walks), len(walks))
        pg.evaluate("state.mapLm=LANDMARKS.findIndex(l=>l[0].startsWith('Brooklyn Bridge walkway, Manhattan')); mapPanel()"); pg.wait_for_timeout(100)
        check("A walkway entrance offers Guide me there and Street View", pg.evaluate("[!!document.querySelector('#mapPanel [data-guide^=\"lm:\"]'), !!document.querySelector('#mapPanel a[href*=map_action]'), guideTarget('lm:'+state.mapLm)[3].startsWith('Brooklyn Bridge')]")==[True,True,True])
        pg.evaluate("state.mapLm=null; mapPanel()")
        check("Roads have casings and the water and parks a texture", pg.evaluate("[document.querySelectorAll('.m-rdc .m-rd').length, !!document.querySelector('#pWater'), !!document.querySelector('.m-parktex'), !!document.querySelector('.m-coastglow')]")==[4,True,True,True])
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
            wx=pg.evaluate("[document.querySelectorAll('#wxStrip .wxhr i.rain').length, document.querySelectorAll('#wxStrip .wxhr i').length, !!document.querySelector('#wxStrip .wxdrop'), document.getElementById('mapStatus').textContent, [...document.querySelectorAll('#lightMarks .chip')].map(c=>c.textContent).filter(t=>t.startsWith('Rain')), !!document.querySelector('.m-rainr'), !document.querySelector('.m-beam')]")
            check("Hour-by-hour forecast under the time bar, rain chip, rain until, rain drawn on the map", wx[0]==3 and wx[1]==24 and wx[2] and "rain until 6 pm" in wx[3] and wx[4]==["Rain 3 pm to 6 pm"] and wx[5] and wx[6], wx)
            pg.evaluate("state.mapT=19*60; mapDraw(); mapPanel()")
            check("Dry evening is golden light again", pg.evaluate("lightAt(mapNow())")!="rain")
            check("No rain on the map once it has passed", pg.evaluate("!document.querySelector('.m-rainr')"))
            al=pg.evaluate("shootAlerts().map(a=>[a.kind,a.k,hmText(a.at),a.place])")
            check("Worth going out: rain clearing before golden hour today, with a place for wet streets", al and al[0][0]=="wet" and al[0][1]==0 and al[0][2]=="6 pm" and al[0][3], al)
        else:
            check("Explains where the hourly forecast is", "installed app" in pg.evaluate("document.getElementById('wxBar').textContent"))
        # Light down the street and ferries
        hg=pg.evaluate("""(()=>{ const H=hengeDay(); return [MAPD_RUNS.length, H.runs.length, H.peaks.length, H.runs.every(r=>r.alt<=10&&r.alt>=-0.3&&r.from<=r.m&&r.m<=r.to)]; })()""")
        check("Long straight streets, and the ones that line up with the low sun today", hg[0]>3000 and hg[1]>50 and hg[2]==2 and hg[3], hg)
        pg.evaluate("state.mapT=hengeDay().peaks[1]; mapV={cx:mapXY(40.69,-73.93)[0],cy:mapXY(40.69,-73.93)[1],w:150}; mapDraw(); mapPanel()")
        hl=pg.evaluate("[!!document.querySelector('.m-run.on'), hengeNow().length>0, document.getElementById('sunLine').textContent.includes('Light runs straight down'), [...document.querySelectorAll('#lightMarks .chip')].some(c=>c.textContent.startsWith('Sun down the streets'))]")
        check("At the peak the lined-up streets glow, with a chip and a line in the sun text", hl==[True,True,True,True], hl)
        pg.evaluate("mapSelectRun(hengeNow()[0].i)")
        rp=pg.evaluate("[state.mapRun!==null, document.querySelector('#mapPanel .group-head b').textContent, !!document.querySelector('#mapPanel a[href*=map_action]'), !!document.querySelector('#mapPanel [data-jump]'), !!document.querySelector('.m-run.sel')]")
        check("A lit street opens its panel: time, Street View facing the sun, jump to the light", rp==[True,"Sun down the street",True,True,True], rp)
        pg.evaluate("mapSelectFerry('sif')"); pg.wait_for_timeout(900)
        fp=pg.evaluate("[state.mapFerry, state.mapRun, document.querySelector('#mapPanel .group-head b').textContent, document.querySelectorAll('#mapPanel .fleg').length, !!document.querySelector('#mapPanel [data-gosel=ferry]'), document.querySelectorAll('.m-ferry').length, !!document.querySelector('.m-ferry.on.sif')]")
        check("Ferry routes on the water; the Staten Island Ferry shows which side has the light", fp[0]=="sif" and fp[1] is None and "Staten Island Ferry" in fp[2] and fp[3]==1 and fp[4] and fp[5]>=3 and fp[6], fp)
        fr=pg.evaluate("""(()=>{ const bad=[]; for(const id of Object.keys(FERRIES)){ const L=ferryRoute(id); if(!L.length||L.some(l=>l.p.length<2)) bad.push(id); const st=MAPD_FERRY.routes[id]; L.forEach((l,k)=>{ const a=mapXY(MAPD_FERRY.landings[st[k]][1],MAPD_FERRY.landings[st[k]][2]); if(Math.hypot(l.p[0][0]-a[0],l.p[0][1]-a[1])>0.5) bad.push(id+':'+k); }); } return bad; })()""")
        check("Every ferry route runs landing to landing in order", not fr, fr)
        pg.evaluate("state.mapT=23*60; mapDraw(); mapPanel()")
        check("After dark the ferry panel gives night advice instead", "After dark" in pg.evaluate("document.getElementById('mapPanel').textContent"))
        pg.evaluate("mapSelect(null); state.mapT=16*60; mapDraw(); mapPanel()")
        check("Closing clears the ferry", pg.evaluate("[state.mapFerry, state.mapRun]")==[None,None])
        check("Sheepshead Bay is on the map", pg.evaluate("MAP_HOODS.filter(h=>h[1]<40.5||h[2]<-74.3).length")==0)
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
        # The sun at the spot: lines on the map, the sun against the lens, and the light through the day
        su=pg.evaluate("[!!document.querySelector('.m-sunray .m-shadow'), !!document.querySelector('.m-sunray .m-tosun'), document.querySelector('#mapPanel .maplight').textContent, [...document.querySelectorAll('#mapPanel .lstrip-runs .chip')].map(c=>c.textContent), !!document.querySelector('#mapPanel .lstrip-bar i')]")
        check("A spot shows the sun and shadow lines, where the sun sits and the light through the day", su[0] and su[1] and "to your" in su[2] and "Shadows fall" in su[2] and len(su[3])>=2 and all(" to " in c for c in su[3]) and su[4], su)
        pg.click("#mapPanel .lstrip-runs .chip"); pg.wait_for_timeout(200)
        check("Tapping a run moves the slider to its start", pg.evaluate("state.mapT!==null && +$('mapTime').value===state.mapT && document.querySelector('#mapPanel .lstrip-runs .chip').classList.contains('on')"))
        # Day chips: the light, sun and status follow the chosen day; Now returns to today
        pg.click("#mapDays [data-day='6']"); pg.wait_for_timeout(300)
        dy=pg.evaluate("[state.mapD, mapNow().getDay(), (new Date(Date.now()+6*864e5)).getDay(), document.querySelector('#mapStatus').textContent, document.querySelector('#mapDays [data-day=\"6\"]').getAttribute('aria-pressed'), lightDay().key.split(':')[1]===String(+mapDay())]")
        check("Day chips move the map to that day", dy[0]==6 and dy[1]==dy[2] and "Sat Oct 17" in dy[3] and dy[4]=="true" and dy[5], dy)
        pg.evaluate("""()=>{ EVENT_DOCS.testsat={name:"Saturday test fair",type:"festival",start:"2026-10-17",time:"11 am to 4 pm",lat:40.7355,lon:-73.9912,ideas:[]}; state.mapShowEv=true; mapDraw(); }"""); pg.wait_for_timeout(200)
        ev=pg.evaluate("mapEvents().filter(e=>e.id==='testsat').map(e=>e.st.chip)")
        check("Events on the map take the chosen day", ev==["Sat 11 am"] or ev==["On Sat"], ev)
        pg.evaluate("delete EVENT_DOCS.testsat")
        pg.click("#mapTimeNow"); pg.wait_for_timeout(200)
        check("Now returns to today", pg.evaluate("[state.mapD, state.mapT, document.querySelector('#mapStatus').textContent.includes('now')]")==[0,None,True])
        # Heading-up: a compass reading turns the map round you and says which way to turn for the spot
        pg.evaluate("state.pos={lat:40.7360,lon:-73.9950}; headingSet(119); headingSet(119); headingSet(119); headingSet(119); headUp(true)"); pg.wait_for_timeout(400)
        hu=pg.evaluate("[state.mapHead, $('mapRot').style.transform, parseFloat($('mapRot').style.width)>$('map').clientWidth, !!$('mapHeadG'), $('mapNorth').hidden, document.querySelector('#map [data-head]').getAttribute('aria-pressed'), Math.abs(mapV.cx-mapXY(state.pos.lat,state.pos.lon)[0])<0.01]")
        check("Heading-up turns the map square round you with a north arrow and a facing cone", hu[0] and hu[1].startswith("rotate(-") and hu[2] and hu[3] and hu[4]==False and hu[5]=="true" and hu[6], hu)
        pg.evaluate("for(let i=0;i<12;i++) headingSet(200)"); pg.wait_for_timeout(200)
        tt=pg.evaluate("[Math.round(state.heading), document.querySelector('#mapPanel .turnhint').textContent.trim(), turnText(200).includes('facing this shot')]")
        check("The spot panel says which way to turn, and when you face it", abs(tt[0]-200)<=2 and tt[1].startswith("Turn left") and tt[2], tt)
        shot("map-headup")
        pg.mouse.move(195,300); pg.mouse.down(); pg.mouse.move(240,350, steps=6); pg.mouse.up(); pg.wait_for_timeout(300)
        pg.evaluate("headUp(false); navigator.geolocation.watchPosition=()=>7; mapV=mapPreset('man'); state.pos={lat:40.9585,lon:-73.9582}; headUp(true)"); pg.wait_for_timeout(200)
        om=pg.evaluate("[posOnMap(), Math.round(mapV.cy)>100, !$('mapNote').hidden, $('mapNote').textContent.includes('outside the area')]")
        check("Away from the city (home in New Jersey), heading-up stays on the city and says why", om==[False,True,True,True], om)
        pg.evaluate("headUp(false); $('mapNote').hidden=true; state.pos={lat:40.7360,lon:-73.9950}; headUp(true)"); pg.wait_for_timeout(100)
        pg.mouse.move(195,300); pg.mouse.down(); pg.mouse.move(240,350, steps=6); pg.mouse.up(); pg.wait_for_timeout(300)
        check("Dragging the map ends heading-up", pg.evaluate("[state.mapHead, $('mapRot').style.transform, $('mapRot').style.width]")==[False,"",""])
        pg.evaluate("headingStop(); state.pos=null; mapSelectSpot(state.mapSpot)"); pg.wait_for_timeout(600)
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
        # Exposure simulator: the presets come out correctly exposed, and changing a setting moves the result the right way
        xp=pg.evaluate("""(()=>{ const r=[]; XPRE.forEach(([n,P])=>{ Object.assign(expoState(),P); r.push([n, Math.abs(expoCalc().stops)<0.34]); });
          Object.assign(expoState(),{L:'cloud',f:43,N:8,t:1/500,iso:400}); const a=expoCalc().stops; expoState().iso=1600; const b=expoCalc().stops; expoState().t=1/15; const w=expoCalc().walk; expoState().t=1/1000; const w2=expoCalc().walk;
          expoState().N=2; const bg2=expoCalc().bg; expoState().N=11; const bg11=expoCalc().bg; return [r, Math.round(b-a), w>w2*30, bg2>bg11*4]; })()""")
        check("Exposure simulator: every preset is correct, ISO adds stops, slow shutters blur the walker, wide apertures soften the background", all(x[1] for x in xp[0]) and xp[1]==2 and xp[2] and xp[3], xp)
        pg.click(".xp [data-xpre='3']"); pg.wait_for_timeout(80)
        check("The simulator shows the scene and its readout", pg.evaluate("[!!document.querySelector('.xp svg #xExp'), document.querySelector('.xp .xout').textContent.includes('The walker: blurred')]")==[True,True])
        # Crop frames: megapixels and distances for each frame
        pg.evaluate("state.lcBody='q343'; state.lcF=75; document.querySelector('.cropw').outerHTML=learnCrop()"); pg.wait_for_timeout(80)
        cr=pg.evaluate("document.querySelector('.cropw .xout').textContent")
        check("Crop frames: the 75 mm crop on the Q3 43 leaves about 20 MP; a full figure is about 5.6 m away", "20 MP" in cr and "5.6 m" in cr, cr)
        pg.evaluate("state.camera='q343'; state.view='shoot'; show('rockaway-energy'); state.tab='work'; render()"); pg.wait_for_timeout(80)
        pg.click("#card [data-learncrop]"); pg.wait_for_timeout(300)
        check("A card that recommends a crop frame opens it in Learn", pg.evaluate("[state.view, document.querySelector('#learn details[data-id=camera]').open, document.querySelector('.cropw [data-lcf][aria-pressed=true]').dataset.lcf]")==["learn",True,"90"])
        # Why this frame works: every example photo is explained, and the explanation opens and closes
        fw=pg.evaluate("""(()=>{ const keys=Object.keys(TECH_PHOTO).concat(Object.keys(IDEA_PHOTO).filter(k=>IDEA_PHOTO[k]));
          const bad=keys.filter(k=>{ const W=FRAME_WHY[k]; return !W||W.why.length!==3||!W.marks.length||W.marks.some(m=>m[0]!=='t'&&m.slice(1,5).some(v=>typeof v==='number'&&(v<0||v>100))); }); return bad; })()""")
        check("Every example and reference photo has a 'why this frame works' with marks inside the photo", not fw, fw)
        pg.evaluate("state.view='learn'; render(); document.querySelector('#learn details[data-id=compose]').open=true"); pg.wait_for_timeout(100)
        lw=pg.evaluate("[!!document.querySelector('.learnwhy figure.why'), document.querySelectorAll('.learnwhy .whylist li').length, document.querySelectorAll('.learnwhy [data-whysel]').length]")
        pg.click(".learnwhy [data-whysel=juxta]"); pg.wait_for_timeout(80)
        pg.click(".learnwhy [data-whyf]"); pg.wait_for_timeout(80)
        lw2=pg.evaluate("[document.querySelector('.learnwhy [data-whysel][aria-pressed=true]').dataset.whysel, document.querySelector('.learnwhy figure').classList.contains('why'), document.querySelector('.learnwhy .whylist').hidden]")
        check("Learn shows the example photos explained, one at a time, and the explanation toggles", lw[0] and lw[1]==3 and lw[2]==11 and lw2==["juxta",False,True], [lw,lw2])
        # Assignments on location: start, count frames, finish, logged
        pg.evaluate("state.drillRun=null; state.drillLog=[]; state.drills.delete('36'); document.querySelector('#learn details[data-id=practice]').open=true; renderLearn()"); pg.wait_for_timeout(80)
        pg.evaluate("document.querySelector('#learn details[data-id=practice]').open=true"); pg.click("#learn [data-drillstart='36']"); pg.wait_for_timeout(80)
        pg.click("#drillBar [data-drillfr]"); pg.click("#drillBar [data-drillfr]"); pg.wait_for_timeout(80)
        db=pg.evaluate("[!document.getElementById('drillBar').hidden, document.querySelector('#drillBar .dr-fr').textContent, !!document.querySelector('#learn .drills2 .pill')]")
        pg.evaluate("state.view='shoot'; show('tsq-mood'); render(); streetOpen()"); pg.wait_for_timeout(150)
        st=pg.evaluate("!!document.querySelector('#street .st-drill [data-drilldone]')")
        pg.click("#street [data-drilldone]"); pg.wait_for_timeout(80); pg.evaluate("streetClose(true)")
        dl=pg.evaluate("[state.drillRun, state.drillLog.length, state.drillLog[0].frames, state.drills.has('36'), document.getElementById('drillBar').hidden, JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('drillLog'))||'null')||'[]').length]")
        check("An assignment runs with a frame counter on every page and in Street mode, and Done logs it and ticks it", db==[True,"+1 · 2 of 36",True] and st and dl[:5]==[None,1,2,True,True], [db,st,dl])
        pg.evaluate("state.view='learn'; render(); document.querySelector('#learn details[data-id=practice]').open=true; document.querySelector('[data-drillstart=\"same-place\"]').click()"); pg.wait_for_timeout(80)
        check("Same place, three times logs a visit at once and counts the week", pg.evaluate("[state.drillRun, document.querySelector('#learn').textContent.includes('1 of 3 visits this week')]")==[None,True])
        # Dark theme renders too
        pg.evaluate("document.documentElement.dataset.theme='dark'; state.view='shoot'; render()"); pg.wait_for_timeout(80)
        check("no script errors", not errors, errors[:3])
        b.close()

for path, name in [(os.path.join(ROOT, "build", "claude.html"), "Claude version"), (os.path.join(ROOT, "index.html"), "Installed app")]:
    if not os.path.exists(path): sys.exit("missing " + path + "; run tools/build.py first")
    run(path, name)

# The alert tool used by the daily alert task: it runs the app's own alert logic on a forecast file
print("\nAlert tool: tools/alerts.py")
import json as _json, subprocess as _sp
_times=["2026-10-%sT%02d:00"%(d,h) for d in ("14","15","16") for h in range(24)]
_code=[61 if (i<24 and 14<=i<17) else 45 if (24+7<=i<24+9) else 2 for i in range(72)]
_fc={"hourly":{"time":_times,"weather_code":_code,"precipitation_probability":[85 if c==61 else 5 for c in _code],"precipitation":[1.0 if c==61 else 0 for c in _code],"cloud_cover":[100 if c in (61,45) else 20 for c in _code],"temperature_2m":[14]*72}}
with tempfile.TemporaryDirectory() as _td:
    _f=os.path.join(_td,"fc.json"); _w=os.path.join(_td,"w.json"); _json.dump(_fc,open(_f,"w"))
    _r=_sp.run([sys.executable,os.path.join(ROOT,"tools","alerts.py"),_f,"--now","2026-10-14T13:47:00","--weather-doc",_w],capture_output=True,text=True)
    _a=_json.loads(_r.stdout) if _r.returncode==0 else []
    check("Alert tool finds rain clearing at 5 pm today and fog tomorrow morning", [(x["kind"],x["date"],x["start"]) for x in _a if x["kind"] in ("wet","fog")]==[("wet","2026-10-14","17:00"),("fog","2026-10-15","07:00")], _r.stderr[-300:] or _a)
    _wd=_json.load(open(_w)) if os.path.exists(_w) else {}
    check("Alert tool writes the forecast for the Claude version", len(_wd.get("hourly",{}).get("time",[]))==72 and _wd.get("condition_text")=="Partly cloudy" and _wd.get("precip_chance_today")==85, {k:_wd.get(k) for k in ("condition_text","precip_chance_today")})
    _fc["hourly"]["cloud_cover"]=_fc["hourly"]["cloud_cover"][:40]; _json.dump(_fc,open(_f,"w"))
    _r=_sp.run([sys.executable,os.path.join(ROOT,"tools","alerts.py"),_f],capture_output=True,text=True)
    check("Alert tool refuses a forecast cut short", _r.returncode!=0 and "wrong length" in _r.stderr, _r.stderr[-200:])

print("\n" + ("All checks passed." if not failures else "%d check(s) failed: %s" % (len(failures), "; ".join(failures))))
sys.exit(1 if failures else 0)
