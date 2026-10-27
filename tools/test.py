import re
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
        import math as _m
        _kx=111320*_m.cos(40.723*_m.pi/180); _ll=lambda x,y:[-73.999+x/_kx, 40.723+y/110540]
        _bld=[{"height_roof":"200","ground_elevation":"30","the_geom":{"type":"MultiPolygon","coordinates":[[[_ll(-40,-40),_ll(-15,-40),_ll(-15,-15),_ll(-40,-15),_ll(-40,-40)]]]}}]
        pg.route("**/data.cityofnewyork.us/**", lambda r: r.fulfill(status=200, content_type="application/json", body=_j.dumps(_bld)))
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
        check("Today gives the light and places to go", pg.evaluate("[!!document.querySelector('.tverdict').textContent, document.querySelectorAll('.twin').length>=4, document.querySelectorAll('.tpick').length, document.querySelectorAll('#today .tprow').length]")==[True,True,1,2])
        tw=pg.evaluate("(()=>{ const c=[...document.querySelectorAll('#today > section, #today > header')].map(e=>e.classList.contains('tnow')?'now':(e.querySelector('.tlabel')||{textContent:e.tagName}).textContent); return c; })()")
        check("Today runs Right now, then Where to go, before the light and the week", tw[0]=="HEADER" and tw[1]=="now" and tw.index("Where to go")<tw.index("The light today")<tw.index("Plan an outing"), tw)
        check("Today says when it was updated and has Refresh", pg.evaluate("[/Updated \\d/.test(document.querySelector('#today .tasof').textContent), !!document.querySelector('#today [data-trefresh]')]")==[True,True])
        o2=pg.evaluate("(()=>{ const r=document.querySelector('#today .tprow'), id=r.dataset.tpick; r.click(); return [state.tpOpen===id, document.querySelectorAll('#today .tpick').length, document.querySelectorAll('#today .tprow').length]; })()")
        check("Tapping another place opens it in full and folds the first", o2==[True,1,2], o2)
        pg.evaluate("state.tpOpen=null; renderToday()")
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
        # After dark: tomorrow morning on top, the outing card steps aside, one tap adds it to Google Calendar (Claude version)
        pg.clock.set_system_time("2026-10-11T21:30:00"); pg.evaluate("state.view='today'; state.weekSel=null; render()"); pg.wait_for_timeout(100)
        tm=pg.evaluate("[!!document.querySelector('#today .ttmr'), /Tomorrow morning/.test((document.querySelector('#today .ttmr .tlabel')||{}).textContent||''), !!document.querySelector('#today .ttmr [data-planoff=\"1\"]'), !!document.querySelector('#today .tplan'), [...document.querySelectorAll('#today > section')].indexOf(document.querySelector('#today .ttmr'))]")
        check("After dark Today shows tomorrow morning second, with a plan button, and no separate outing card", tm[:4]==[True,True,True,False] and tm[4]==1, tm)
        ca=pg.evaluate("(async()=>{ const had=!!document.querySelector('#today .ttmr [data-caladd]'); CAL_MCP={callTool:async(s,t,i)=>{ window._cal=[s,t,i]; return {content:[]}; }}; renderToday(); document.querySelector('#today .ttmr [data-caladd]').click(); await new Promise(r=>setTimeout(r,30)); const c=window._cal; renderToday(); const ok=!!document.querySelector('#today .ttmr .calok'); CAL_MCP=null; renderToday(); return [had, c[0], c[1], /^2026-10-12T0[5-7]:/.test(c[2].startTime), c[2].overrideReminders[0].minutes, ok]; })()")
        check("Add to Google Calendar appears only with the connector, adds tomorrow morning with a reminder, and stays marked as added", ca==[False,"Google Calendar","create_event",True,60,True], ca)
        pg.clock.set_system_time("2026-10-11T15:00:00"); pg.evaluate("render()")
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
        bl=pg.evaluate("(()=>{ const g=document.querySelectorAll('#list .group').length, open=document.querySelectorAll('#list .group:not(.folded)').length, meta=(document.querySelector('#list .ghmeta')||{}).textContent||''; document.querySelector('#list [data-pfold=open]').click(); const all=document.querySelectorAll('#list .row').length; document.querySelector('#list [data-pfold=close]').click(); const none=document.querySelectorAll('#list .row').length; document.querySelector('#list .group-head[data-pid]').click(); const one=document.querySelectorAll('#list .group:not(.folded)').length; return [g>15, open, /\\d+ ideas? .*\\d+ of \\d+ shot/.test(meta), all>100, none, one, /of \\d+ ideas/.test(document.querySelector('#list .iprog').textContent)]; })()")
        check("Browse folds places to one open, headers give ideas, suits now and shot counts, Open all and Fold all work, a header tap opens it, and a progress line tops the list", bl==[True,1,True,True,0,1,True], bl)
        sw=pg.evaluate("""(()=>{ const row=document.querySelector('#list .row'), id=row.dataset.id, r=row.getBoundingClientRect(), y=r.top+r.height/2, x=r.left+60, n0=(state.log[id]||[]).length, s0=state.saved.has(id);
          const go=(dx)=>{ const el=document.querySelector('#list .row[data-id=\"'+id+'\"]'); const ev=(t,x2)=>el.dispatchEvent(new PointerEvent(t,{bubbles:true,pointerType:'touch',clientX:x2,clientY:y,pointerId:1})); ev('pointerdown',x); ev('pointermove',x+dx/4); ev('pointermove',x+dx); ev('pointerup',x+dx); el.dispatchEvent(new MouseEvent('click',{bubbles:true})); };
          go(120); const shot=[(state.log[id]||[]).length===n0+1, state.view]; document.querySelector('#rowToast [data-undo]').click(); const undone=(state.log[id]||[]).length===n0;
          go(-120); const sv=state.saved.has(id)!==s0; document.querySelector('#rowToast [data-undo]').click(); return [shot, undone, sv, state.saved.has(id)===s0]; })()""")
        check("Swiping a row right logs it as shot and left saves it, without opening it, and Undo puts each back", sw==[[True,"browse"],True,True,True], sw)
        pg.evaluate("state.openPlaces=new Set(placeOrder()); renderList()")
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
        # street names on the map when zoomed in
        sn=pg.evaluate("""(()=>{ const was=state.view; state.view='map'; render(); const [x,y]=mapXY(40.7215,-73.9990); const out=[];
          for(const w of [10,30,120]){ mapV=mapClamp({cx:x,cy:y,w}); mapDraw(); out.push([...document.querySelectorAll('#mapDyn .m-sn')].map(e=>e.textContent)); }
          state.mapShowNames=false; mapV=mapClamp({cx:x,cy:y,w:10}); mapDraw(); out.push(document.querySelectorAll('#mapDyn .m-sn').length); state.mapShowNames=true; state.view=was; render(); return out; })()""")
        check("Map: zoomed in, every street gets its name along it (none when zoomed out or with names off)",
              len(sn[0])>=6 and "Broome St" in sn[0] and "Mercer St" in sn[0] and not any(re.match(r"^(W |E )?\d+ (St|Av)$",n) for n in sn[1]) and len(sn[1])>=10 and len(set(sn[1]))==len(sn[1]) and sn[2]==[] and sn[3]==0, sn)
        # an idea's other place to stand: Herald Square from across the street
        va=pg.evaluate("""(()=>{ const was=state.camera, v=state.view, out={}; state.camera='q343'; show('ktown-energy'); state.view='shoot'; state.tab='idea'; render();
          out.hint=!!document.querySelector('#card [data-vgo]'); document.querySelector('#card [data-vgo]').click();
          out.on=[state.tab, document.querySelector('#card .vals').textContent, document.querySelectorAll('#card .vsteps li').length, ideaRec(IDEAS.find(x=>x.id==='ktown-energy'),'q343').su[0]];
          state.camera='iphone'; render(); out.iphone=[document.querySelector('#card .vals').textContent, document.querySelector('#card .vsteps li').textContent];
          state.camera='other'; render(); out.other=ideaRec(IDEAS.find(x=>x.id==='ktown-energy'),'other').su[0];
          state.camera='q343'; render(); streetOpen(); out.street=[...document.querySelectorAll('#street .strow')].map(r=>r.innerText).join(' / '); streetClose();
          document.querySelector('#card .vsw [data-variant="0"]').click(); out.off=[document.querySelector('#card .vals').textContent, !!document.querySelector('#card .vsteps'), Object.keys(store.get('ideaVariant',{})).length];
          out.others=IDEAS.filter(x=>x.id!=='ktown-energy').every(x=>!VARIANTS[x.id]); state.camera=was; state.view=v; state.tab='idea'; render(); return out; })()""")
        check("Herald Square crossing has a 'from across the street' setting: slower shutter, crop, manual focus with peaking, steps for each camera, in street mode too",
              va["hint"] and va["on"]==["settings","1/6 s · S mode · Auto ISO · 60 or 75 crop",4,"MF · focus peaking and magnifier on"] and "2×" in va["iphone"][0] and "Zoom" in va["iphone"][1]
              and va["other"].startswith("Manual focus") and "about 15 m" in va["street"] and va["off"]==["1/15 s · S mode · Auto ISO",False,0] and va["others"], va)
        # search, sort and On now
        pg.fill("#q","steam"); pg.wait_for_timeout(300)
        q1=pg.evaluate("[matches(false).map(x=>x.t), !!document.querySelector('#list .row mark'), !!document.querySelector('#list .qsnip mark')]")
        pg.fill("#q","reflection"); pg.wait_for_timeout(300); q2=pg.evaluate("matches(false).some(x=>/reflections/i.test(x.look+x.work+x.t))")
        pg.fill("#q","golden hour"); pg.wait_for_timeout(300); q3=pg.evaluate("matches(false).length>0&&matches(false).every(x=>x.w.includes('gold'))")
        pg.fill("#q","zzzz"); pg.wait_for_timeout(300); q4=pg.evaluate("[matches(false).length, !!document.querySelector('#list [data-qclear=q]')]")
        pg.click("#list [data-qclear=q]"); pg.wait_for_timeout(150); q5=pg.evaluate("[state.q, document.getElementById('q').value, matches(false).length>100&&document.querySelectorAll('#list .group').length>15]")
        check("Ideas search: words match titles and text (plurals folded, golden hour finds late-afternoon ideas), with highlights and a way out when nothing matches",
              "Steam and neon" in q1[0] and q1[1] and q1[2] and q2 and q3 and q4==[0,True] and q5==["","",True], [q1,q2,q3,q4,q5])
        pg.select_option("#isort","now"); pg.wait_for_timeout(150)
        so=pg.evaluate("""(()=>{ const ids=[...document.querySelectorAll('#list .row')].map(r=>r.dataset.id), t=new Date(), k=lightAt(t), sk=skyAt(t), r=ids.map(id=>nowRank(IDEAS.find(x=>x.id===id),t,k,sk));
          return [r.every((v,i)=>i===0||r[i-1]<=v), !document.querySelector('#list .group-head'), store.get('isort')]; })()""")
        pg.click("#onNow"); pg.wait_for_timeout(200)
        on=pg.evaluate("[matches(false).length, cityIdeas().length, matches(false).every(x=>onNowIdea(x)), document.getElementById('onNow').getAttribute('aria-pressed')]")
        pg.click("#onNow"); pg.select_option("#isort","place"); pg.wait_for_timeout(150)
        check("Ideas list sorts by best right now (flat list, remembered), and On now keeps only ideas that are on and suit the light",
              so==[True,True,"now"] and 0<on[0]<on[1] and on[2] and on[3]=="true" and pg.evaluate("!!document.querySelector('#list .group-head')"), [so,on])
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
        check("Events carry arrival advice and quick filters", pg.evaluate("[document.querySelectorAll('#events .evquick .chip').length, [...document.querySelectorAll('#events .label')].some(l=>l.textContent==='Getting there and when')]")==[4,True])
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
        pg.evaluate("store.set('learnSeen',[]); store.set('learnLast',null); state.learnId=null; renderLearn()"); pg.wait_for_timeout(50)
        lh=pg.evaluate("[document.querySelectorAll('#learn .ltile').length, LEARN.length, document.querySelectorAll('#learn .lgroup').length, (document.querySelector('#learn .lcont')||{}).dataset?.lopen, !!document.querySelector('#learn .lpage')]")
        check("Learn opens on a contents page: every lesson as a tile in three groups, with a place to start", lh[0]==lh[1] and lh[2]==3 and lh[3]=="exposure" and not lh[4], lh)
        no_overflow("Learn contents"); shot("learn")
        bad=[]
        for lid in pg.evaluate("LEARN.map(L=>L.id)"):
            pg.evaluate("openLearn('%s')"%lid); pg.wait_for_timeout(60)
            r=pg.evaluate("[document.querySelectorAll('#learn .lpage').length, document.querySelector('#learn .lpage').dataset.id, document.documentElement.scrollWidth<=innerWidth+1, [...document.querySelectorAll('#learn .ljump [data-ljump]')].every(c=>document.querySelector('#learn .lpage '+c.dataset.ljump))]")
            if r!=[1,lid,True,True]: bad.append([lid,r])
        check("Each lesson opens on its own page, fits the screen, and every jump link has a target", not bad, bad)
        pg.evaluate("openLearn('compose')"); pg.wait_for_timeout(60)
        pg.click("#learn .ljump [data-ljump='.ltry']"); pg.wait_for_timeout(700)
        jp=pg.evaluate("[Math.round(document.querySelector('#learn .ltry').getBoundingClientRect().top)>=60, document.querySelector('#learn .lbar').getBoundingClientRect().top<=1]")
        pg.click("#learn .lnav-b.nx"); pg.wait_for_timeout(60); nx=pg.evaluate("state.learnId")
        pg.click("#vLearn"); pg.wait_for_timeout(60)
        hm=pg.evaluate("[state.learnId, document.querySelector('#learn .lprog').textContent.startsWith(String(LEARN.length)+' of'), document.querySelectorAll('#learn .ltile.seen').length]")
        check("Lesson pages: the bar stays at the top and jumps to a part, Next opens the next lesson, the Learn tab goes back to the contents with every lesson marked read", jp==[True,True] and nx=="light" and hm==[None,True,10], [jp,nx,hm])
        pg.evaluate("openLearn('exposure')"); pg.wait_for_timeout(60)
        # Exposure simulator: the presets come out correctly exposed, and changing a setting moves the result the right way
        xp=pg.evaluate("""(()=>{ const r=[]; XPRE.forEach(([n,P,bad])=>{ Object.assign(expoState(),{max:6400,slow:1/250},P); const s=expoCalc().stops; r.push([n, bad? s>2 : Math.abs(s)<0.34]); });
          Object.assign(expoState(),{mode:'M',L:'cloud',f:43,N:8,t:1/500,iso:400}); const a=expoCalc().stops; expoState().iso=1600; const b=expoCalc().stops; expoState().t=1/15; const w=expoCalc().walk; expoState().t=1/1000; const w2=expoCalc().walk;
          expoState().N=2; const bg2=expoCalc().bg; expoState().N=11; const bg11=expoCalc().bg; return [r, Math.round(b-a), w>w2*30, bg2>bg11*4]; })()""")
        check("Exposure simulator: every preset is correct, ISO adds stops, slow shutters blur the walker, wide apertures soften the background", all(x[1] for x in xp[0]) and xp[1]==2 and xp[2] and xp[3], xp)
        pg.click(".xp [data-xpre='3']"); pg.wait_for_timeout(80)
        check("The simulator shows the scene and its readout", pg.evaluate("[!!document.querySelector('.xp svg #xExp'), document.querySelector('.xp .xout').textContent.includes('The walker: blurred')]")==[True,True])
        # Modes: the camera sets the other setting, rounds it to third stops, and the trade is explained
        xm=pg.evaluate("""(()=>{ const X=expoState(); Object.assign(X,{mode:'A',L:'shade',f:43,N:4,iso:0,max:6400,slow:1/250}); const a=expoCalc();
          Object.assign(X,{mode:'S',L:'sun',t:1/15}); const s=expoCalc(); Object.assign(X,{mode:'A',L:'night',N:8}); const n=expoCalc();
          Object.assign(X,{mode:'M',L:'cloud',N:8,t:1/250,iso:0}); const m=expoCalc();
          return [SH3.includes(a.t), ISO3.includes(m.iso), a.iso, s.N, s.lim.includes('nMax'), n.lim.includes('slowPast'), n.t>1/250, Math.abs(a.stops)<0.34]; })()""")
        check("Exposure modes: A picks a real shutter speed, S stops at f/16 in sun with a 1/15 s shutter, A at night goes below the slowest setting once ISO is at its maximum", xm==[True,True,100,16,True,True,True,True], xm)
        pg.evaluate("Object.assign(expoState(),{mode:'M',L:'cloud',f:43,N:8,t:1/250,iso:0}); state.xpTrade=''; document.querySelector('.xp').outerHTML=learnExpo()")
        pg.click(".xp [data-xmode='A']"); pg.wait_for_timeout(60); pg.click(".xp [data-xstep='N:1']"); pg.wait_for_timeout(60)
        tr=pg.evaluate("[document.querySelector('.xp .xtrade')?.textContent||'', document.querySelectorAll('.xp .xr.cam').length, document.querySelector('.xp [data-xmode=A]').getAttribute('aria-pressed')]")
        check("Moving the aperture in A mode shows the camera answering with the ISO, and marks which settings the camera controls", "f/8 → f/5.6" in tr[0] and "ISO 400 → 200" in tr[0] and "stays as bright" in tr[0] and tr[1]==2 and tr[2]=="true", tr)
        no_overflow("Exposure ladder")
        # Subjects, equivalent exposures, the light now and the camera line
        sq=pg.evaluate("""(()=>{ const X=expoState(); Object.assign(X,{mode:'M',L:'cloud',f:43,N:8,t:1/250,iso:0,subj:'walk',dist:4}); const w=expoCalc().walk;
          X.subj='cycle'; const c=expoCalc().walk; X.dist=2; const c2=expoCalc().walk; X.dist=4; const C=expoCalc(), E=xEquiv(C);
          return [c>w*3, c2>c*1.9, E.length, E.every(e=>Math.abs(e.stops-C.stops)<0.2), E[0].bg>E[E.length-1].bg, E[0].walk<E[E.length-1].walk, !!XL[(xNowLight()||{}).key], xCamLine(C).includes('aperture ring <b>f/8</b>')]; })()""")
        check("Exposure: a cyclist blurs more than a walker and more when closer; the same-light pictures are equally bright, from soft and frozen to sharp and blurred", sq==[True,True,4,True,True,True,True,True], sq)
        pg.evaluate("state.xpTrade=''; document.querySelector('.xp').outerHTML=learnExpo()"); pg.click(".xp [data-xeq]"); pg.wait_for_timeout(60)
        eq=pg.evaluate("[document.querySelectorAll('.xp .xeq-b').length, document.querySelectorAll('.xp svg filter[id^=xExp]').length, new Set([...document.querySelectorAll('.xp svg filter')].map(f=>f.id)).size===document.querySelectorAll('.xp svg filter').length, document.querySelector('.xp .xeq-b[aria-pressed=true] b').textContent, (document.querySelector('.xp .xtrade')||{}).textContent||'']")
        check("Tapping a same-light picture uses it, and every picture has its own filters", eq[0]==4 and eq[1]==5 and eq[2] and eq[3].startswith("f/2") and "Same light" in eq[4], eq)
        # Zone focusing scene, the techniques gallery and the photo deck
        pg.evaluate("state.lfF=43; state.lfN=8; state.lfS=3; openLearn('focus')"); pg.wait_for_timeout(100)
        z1=pg.evaluate("[document.querySelector('.zf .dofout').textContent, document.querySelectorAll('.zf svg .zf-t.in').length, document.querySelectorAll('.zf svg filter').length]")
        pg.click(".zf [data-zflens='28']"); pg.wait_for_timeout(50)
        z2=pg.evaluate("[document.querySelector('.zf .dofout').textContent, document.querySelectorAll('.zf svg .zf-t.in').length]")
        pg.click(".zf [data-zf='N:-1']"); pg.click(".zf [data-zfh]"); pg.wait_for_timeout(50)
        z3=pg.evaluate("[state.lfN, state.lfS, document.querySelector('.zf .dofout').textContent, document.querySelector('.zf .zf-split').textContent.includes('hyperfocal')]")
        check("Zone focusing: 43 mm at f/8 and 3 m keeps only the 3 m person sharp, the 28 mm keeps 3 to 25 m, and hyperfocal reaches infinity", z1[0]=="Sharp from 2.2 m to 4.9 m" and z1[1]==1 and z1[2]==4 and z2[0]=="Sharp from 1.6 m to 33 m" and z2[1]==4 and z3[0]==5.6 and abs(z3[1]-4.7)<0.11 and "infinity" in z3[2] and z3[3], [z1,z2,z3])
        check("Zone focusing uses the corrected distance cue", "two sidewalk flags" in pg.evaluate("document.querySelector('#learn .lesson[data-id=focus]').textContent") and "four paving slabs" not in pg.evaluate("document.querySelector('#learn').textContent"))
        pg.evaluate("openLearn('compose')"); pg.wait_for_timeout(80)
        pg.click(".tgrid [data-techsel='layers']"); pg.wait_for_timeout(50)
        tg=pg.evaluate("[document.querySelectorAll('.tgrid .tg-c').length, document.querySelectorAll('.tgrid .tg-c svg').length, !!document.querySelector('.tgrid .tg-p'), [...document.querySelector('.tgrid').children].findIndex(e=>e.classList.contains('tg-p')), document.querySelectorAll('.tgrid .tg-p .row').length>0]")
        pg.click(".tgrid [data-techsel='layers']"); pg.wait_for_timeout(50)
        check("Composition shows the techniques as a gallery of diagrams; tapping one opens its ideas under its row, tapping again closes it", tg[0]==11 and tg[1]==11 and tg[2] and tg[3]==4 and tg[4] and not pg.evaluate("!!document.querySelector('.tgrid .tg-p')"), tg)
        pg.evaluate("state.whySel=null; document.querySelector('.learnwhy').outerHTML=learnWhy()"); pg.click(".learnwhy [data-whynav='-1']"); pg.wait_for_timeout(50)
        wd=pg.evaluate("[document.querySelector('.wdeck-t span').textContent, document.querySelector('.learnwhy figure').classList.contains('why')]")
        check("Example photos page through with prev and next, wrapping round, lines shown", wd[0].startswith("11 of 11") and wd[1], wd)
        # Cameras lesson: chips, what each lens sees, bars with each sensor's own depth of field
        pg.evaluate("state.camCmp=['q343','griv']; openLearn('cameras')"); pg.wait_for_timeout(80)
        pg.click(".camcmp [data-campick='q328']"); pg.wait_for_timeout(50); pg.click(".camcmp [data-campick='x100vi']"); pg.wait_for_timeout(50)
        cm=pg.evaluate("[state.camCmp, document.querySelectorAll('.camcmp .camfov rect[stroke]').length, document.querySelectorAll('.camcmp .cb').length, [...document.querySelectorAll('.camcmp .cb')[2].querySelectorAll('.cb-v')].map(e=>e.textContent), !!document.querySelector('.camcmp .cam-phone')]")
        check("Cameras: up to three picked by chips (a fourth replaces the last), their frames on one street, and zone focusing per sensor", cm[0]==["q343","griv","x100vi"] and cm[1]==3 and cm[2]==4 and cm[3][0]=="2.2–5 m" and cm[3][1].endswith("∞ m") and cm[4], cm)
        no_overflow("Cameras lesson")
        # Camera prices: cards from the data, deals and alert hits first, a Today card when a camera is at or below its alert
        pd=pg.evaluate("""(()=>{ PRICE_DOCS={_status:{checked:'2026-10-17'},q343:{new:{price:6000,seller:'A',url:'https://example.com/a'},used:{low:5000,seller:'U',url:'https://example.com/u'},history:[{d:'2026-10-10',new:6100,used:5200},{d:'2026-10-17',new:6000,used:5000}]},
            x100vi:{new:{price:1700,seller:'B',stock:'Backordered'},deal:{price:1600,was:1700,what:'$100 off',seller:'B'},used:{low:1800,seller:'U'}},m11:{used:{low:6600,seller:'U'},notes:'Discontinued new'},griv:{new:{price:1600,seller:'A'},used:{low:1550,seller:'MPB'},ebay:{low:1400,cond:'Used - Excellent',n:5},sold:{median:1450,n:4}}};
          PRICE_TARGETS={q343:{target:5100,kind:'used'},x100vi:{target:1500,kind:'new'},griv:{target:1420,kind:'used'}}; state.priceOpen=null;
          openLearn('prices','.prices'); const rows=[...document.querySelectorAll('.prices .pc')], txt=id=>document.querySelector('.pc[data-pc='+id+'] .pr-row').textContent;
          const r=[rows.length, rows[0].dataset.pc, rows.slice(0,2).map(x=>x.dataset.pc).sort().join(), rows[2].dataset.pc, txt('q343').includes('▼$100')&&txt('q343').includes('▼$200'), txt('x100vi').includes('Backordered')&&txt('x100vi').includes('Used costs more than new'), txt('m11').includes('not sold')&&txt('m11').includes('Discontinued new'), txt('griv').includes('$1,400')&&txt('griv').includes('eBay'), !document.querySelector('.pc-d')];
          document.querySelector('.pc[data-pc=griv] .pr-row').click(); const dd=document.querySelector('.pc[data-pc=griv] .pc-d');
          r.push(!!dd&&dd.querySelectorAll('.pscale circle').length===4&&!!dd.querySelector('.psc-lnch')&&dd.textContent.includes('At or below your alert: used $1,400 at eBay')&&!!dd.querySelector('.pc-al.ro a[href^="https://claude.ai/"]'));
          state.view='today'; render(); r.push((document.querySelector('.tdeal')||{}).textContent||''); PRICE_DOCS={}; PRICE_TARGETS={}; return r; })()""")
        check("Camera prices: a board row per camera, alert hits first, change marks, badges, best used from eBay; a row opens its price scale, sellers and alert; Today card on a hit", pd[:10]==[9,pd[1],"griv,q343","x100vi",True,True,True,True,True,True] and pd[1] in ("griv","q343") and "Leica Q3 43: used $5,000" in pd[10], pd)
        # Events near me now: within 1 or 2 miles of you, today first, nearest first
        pg.evaluate("""(()=>{ const d=new Date(), ymd=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'), plus=n=>ymd(new Date(d.getFullYear(),d.getMonth(),d.getDate()+n));
          window._evKeep=EVENT_DOCS; EVENT_DOCS=Object.assign({},EVENT_DOCS,{'near-a':{city:'nyc',name:'Near A',type:'festival',start:plus(0),time:'all day',lat:40.7262,lon:-73.9990,map:'x'},'near-b':{city:'nyc',name:'Near B',type:'market',start:plus(3),lat:40.7230,lon:-73.9900,map:'x'},
            'far-c':{city:'nyc',name:'Far C',type:'parade',start:plus(1),lat:40.7450,lon:-73.9900,map:'x'},'late-d':{city:'nyc',name:'Later D',type:'music',start:plus(10),lat:40.7231,lon:-73.9991,map:'x'}});
          state.pos={lat:40.7230,lon:-73.9990}; state.evNear=false; state.evRadius=1; state.view='events'; render(); })()""")
        pg.click("#events [data-evnear]"); pg.wait_for_timeout(300)
        en=pg.evaluate("[...document.querySelectorAll('#events .evgroup, #events details.event')].map(d=>d.classList.contains('evgroup')?'#'+d.textContent:d.querySelector('.t b').textContent+'|'+((d.querySelector('.evdist')||{}).textContent||''))")
        pg.click("#events [data-evr='2']"); pg.wait_for_timeout(100)
        en2=pg.evaluate("[...document.querySelectorAll('#events details.event .t b')].map(b=>b.textContent)")
        pg.evaluate("state.pos={lat:40.58,lon:-74.15}; renderEvents()"); en3=pg.evaluate("[!!document.querySelector('#events [data-ideasnear]'), document.querySelectorAll('#events details.event').length]")
        pg.evaluate("EVENT_DOCS=window._evKeep; state.evNear=false; store.set('evNear',false); state.pos=null")
        check("Events near me now: today first then the coming week, nearest first with distance and walk, 2 miles adds more, nothing nearby offers ideas instead", en[0]=="#On today" and en[1].startswith("Near A|0.2 mi") and en[2]=="#Coming up nearby" and en[3].startswith("Near B|0.5 mi") and len(en)==4 and "Far C" in en2 and "Later D" not in en2 and en3==[True,0], [en,en2,en3])
        # Music series: show nights from the weekly check's dates or a weekday pattern, not the whole season
        ms=pg.evaluate("""(()=>{ const t=new Date(2026,6,14), keep=EVENT_DOCS; EVENT_DOCS=Object.assign({},keep,{bryantpicnic:{city:'nyc',start:'2026-06-01',end:'2026-09-15',dates:['2026-07-15','2026-07-17']}});
          const rows=eventRows(t), L=id=>evOngoingLabel(rows.find(r=>r.e.id===id),t), r=[L('bryantpicnic'), L('seaside'), L('summerstage'), L('foliage')||'', evShowOn(rows.find(r=>r.e.id==='seaside'),new Date(2026,6,16))];
          EVENT_DOCS=keep; return r; })()""")
        check("Music series show their next show night, not On now all season", ms==["Next show Wed","Next show Thu","Season on, check tonight","Next show Wed" if False else ms[3],True] and ms[0]=="Next show Wed" and ms[1]=="Next show Thu", ms)
        # Navigation and sheets: tab bar at the bottom, Settings, Filters, Events grouped with a detail sheet
        pg.evaluate("state.view='today'; render(); window.scrollTo(0,0)"); pg.wait_for_timeout(60)
        tb=pg.evaluate("(()=>{ const r=$('views').getBoundingClientRect(); return [Math.round(r.bottom)===innerHeight, document.querySelectorAll('#views button svg').length, getComputedStyle($('views')).position]; })()")
        pg.click("#setOpen"); pg.wait_for_timeout(250); pg.click("#setSheet [data-cam=q328]"); pg.wait_for_timeout(60)
        st=pg.evaluate("[state.camera, store.get('camera'), document.querySelectorAll('#setCams [aria-checked=true]').length, !!document.querySelector('#setSheet #syncbox'), !!document.querySelector('#setSheet footer')]")
        pg.keyboard.press("Escape"); pg.wait_for_timeout(250); st.append(pg.evaluate("$('setSheet').hidden"))
        pg.evaluate("state.camera='q343'; store.set('camera','q343')")
        pg.click("#vIdeas"); pg.wait_for_timeout(100); pg.evaluate("state.ideasMode='card'; state.view='shoot'; render()")
        pg.click("#fOpen"); pg.wait_for_timeout(250); pg.click("#intents [data-i=odd]"); pg.wait_for_timeout(80)
        fs=pg.evaluate("[$('fCount').textContent, $('fShow').textContent.startsWith('Show '), !$('fActive').hidden]")
        pg.click("#fShow"); pg.wait_for_timeout(250); fs.append(pg.evaluate("$('fSheet').hidden")); pg.click("#fActive [data-fclear]"); pg.wait_for_timeout(80); fs.append(pg.evaluate("[state.intent, $('fCount').hidden]"))
        pg.click("#vEvents"); pg.wait_for_timeout(150)
        eg=pg.evaluate("[document.querySelectorAll('#events .evgroup').length>=2, document.querySelectorAll('#events details[open]').length]")
        pg.click("#events details.event summary"); pg.wait_for_timeout(250)
        eg.append(pg.evaluate("[!!document.getElementById('evSheet'), !!document.querySelector('#evSheet .event-body .when')]"))
        pg.keyboard.press("Escape"); pg.wait_for_timeout(100); eg.append(pg.evaluate("!!document.getElementById('evSheet')"))
        check("Navigation: tab bar fixed at the bottom with icons; Settings changes the camera and closes with Escape; Filters count, show and clear; Events grouped, opening in a sheet", tb==[True,5,"fixed"] and st==["q328","q328",1,True,True,True] and fs[0]=="1" and fs[1] and fs[2] and fs[3] and fs[4]==["all",True] and eg[0] and eg[1]==0 and eg[2]==[True,True] and eg[3]==False, [tb,st,fs,eg])
        # Search around here: one-tap searches for events near you anywhere, by town once it is known
        pg.evaluate("NEARBY.key='40.96,-73.96'; NEARBY.town='Demarest'; NEARBY.st='NJ'; NEARBY.cc='US'; NEARBY.busy=false; state.pos={lat:40.9573,lon:-73.9632}; state.evNear=true; state.evRadius=1; state.view='events'; render._evFix=true; render()"); pg.wait_for_timeout(100)
        sa=pg.evaluate("[...document.querySelectorAll('#events .evsearch .evlink')].map(a=>a.getAttribute('href'))")
        pg.evaluate("NEARBY.key=null; NEARBY.busy=true; renderEvents()"); sb=pg.evaluate("[...document.querySelectorAll('#events .evsearch .evlink')].map(a=>a.getAttribute('href'))")
        pg.evaluate("NEARBY.busy=false; state.evNear=false; store.set('evNear',false); state.pos=null")
        check("Search around here: town-based searches (Google, Maps at your position, Eventbrite, Meetup, Patch) and near-me ones before the town is known", len(sa)==6 and "events%20today%20in%20Demarest%2C%20NJ" in sa[0] and "@40.9573,-73.9632,15z" in sa[2] and "/d/nj--demarest/events--today/" in sa[3] and "us--nj--Demarest" in sa[4] and len(sb)==4 and "events%20near%20me%20today" in sb[0], [sa,sb])
        # Today: the plan card never plans tomorrow before golden hour has ended; a sunset on the hour reads 6:00
        pg.evaluate("state.view='today'; render()")
        tdp=pg.evaluate("""(()=>{ const b=document.querySelector('#today [data-planday]'), g=todayWindows().list.find(x=>x.name==='Golden hour'); return [b.textContent, b.dataset.planoff, !!(g&&g.e>dayMin(new Date()))]; })()""")
        check("Today's plan card plans tonight or from now while golden hour is still ahead or on", (tdp[2] and tdp[1]=="0" and "tomorrow" not in tdp[0]) or (not tdp[2] and tdp[1]=="1"), tdp)
        check("A sunset on the hour reads with its minutes in the week strip", pg.evaluate("[...document.querySelectorAll('#today .wds')].every(e=>/:/.test(e.textContent))"))
        # Light here outside the city: real sun for the place, no building shade or street direction from NYC data
        ny=pg.evaluate("[inNYC({lat:40.758,lon:-73.9855}), inNYC({lat:40.7178,lon:-74.0431}), inNYC({lat:40.9573,lon:-73.9632}), inNYC({lat:40.7615,lon:-74.0035}), inNYC({lat:40.58,lon:-74.15}), inNYC({lat:42.3555,lon:-71.0565})]")
        check("Knows the five boroughs: Midtown, a Hudson pier and Staten Island are in; Jersey City, Demarest and Boston are out", ny==[True,False,False,True,True,False], ny)
        pg.evaluate("lfOpen({lat:42.3555,lon:-71.0565,name:'Boston'})"); pg.wait_for_timeout(200)
        lo=pg.evaluate("[document.getElementById('lightf').innerText.includes('Outside New York City'), document.getElementById('lightf').innerText.includes('building heights'), document.getElementById('lightf').innerText.includes('Your street runs'), Math.round(sunPos(new Date(),42.3555,-71.0565).az)===Math.round(LF.cur?sunPos(new Date(),42.3555,-71.0565).az:-1)]")
        pg.evaluate("lfClose()")
        check("Light here away from the city says what is missing and shows no building shade or street direction", lo[:3]==[True,False,False], lo)
        # Crop frames: megapixels and distances for each frame
        pg.evaluate("state.lcBody='q343'; state.lcF=75; openLearn('camera')"); pg.wait_for_timeout(80)
        cr=pg.evaluate("document.querySelector('.cropw .xout').textContent")
        check("Crop frames: the 75 mm crop on the Q3 43 leaves about 20 MP; a full figure is about 5.6 m away", "20 MP" in cr and "5.6 m" in cr, cr)
        pg.evaluate("state.camera='q343'; state.view='shoot'; show('rockaway-energy'); state.tab='work'; render()"); pg.wait_for_timeout(80)
        pg.click("#card [data-learncrop]"); pg.wait_for_timeout(300)
        check("A card that recommends a crop frame opens it in Learn", pg.evaluate("[state.view, state.learnId==='camera', document.querySelector('.cropw [data-lcf][aria-pressed=true]').dataset.lcf]")==["learn",True,"90"])
        # Why this frame works: every example photo is explained, and the explanation opens and closes
        fw=pg.evaluate("""(()=>{ const keys=Object.keys(TECH_PHOTO).concat(Object.keys(IDEA_PHOTO).filter(k=>IDEA_PHOTO[k]));
          const bad=keys.filter(k=>{ const W=FRAME_WHY[k]; return !W||W.why.length!==3||!W.marks.length||W.marks.some(m=>m[0]!=='t'&&m.slice(1,5).some(v=>typeof v==='number'&&(v<0||v>100))); }); return bad; })()""")
        check("Every example and reference photo has a 'why this frame works' with marks inside the photo", not fw, fw)
        pg.evaluate("state.whySel=null; openLearn('compose')"); pg.wait_for_timeout(100)
        lw=pg.evaluate("[!!document.querySelector('.learnwhy figure.why'), document.querySelectorAll('.learnwhy .whylist li').length, document.querySelectorAll('.learnwhy [data-whysel]').length]")
        pg.click(".learnwhy [data-whysel=juxta]"); pg.wait_for_timeout(80)
        pg.click(".learnwhy [data-whyf]"); pg.wait_for_timeout(80)
        lw2=pg.evaluate("[document.querySelector('.learnwhy [data-whysel][aria-pressed=true]').dataset.whysel, document.querySelector('.learnwhy figure').classList.contains('why'), document.querySelector('.learnwhy .whylist').hidden]")
        check("Learn shows the example photos explained, one at a time, and the explanation toggles", lw[0] and lw[1]==3 and lw[2]==11 and lw2==["juxta",False,True], [lw,lw2])
        # Assignments on location: start, count frames, finish, logged
        pg.evaluate("state.drillRun=null; state.drillLog=[]; state.drills.delete('36'); openLearn('practice')"); pg.wait_for_timeout(80)
        pg.click("#learn [data-drillstart='36']"); pg.wait_for_timeout(80)
        pg.click("#drillBar [data-drillfr]"); pg.click("#drillBar [data-drillfr]"); pg.wait_for_timeout(80)
        db=pg.evaluate("[!document.getElementById('drillBar').hidden, document.querySelector('#drillBar .dr-fr').textContent, !!document.querySelector('#learn .drills2 .pill')]")
        pg.evaluate("state.view='shoot'; show('tsq-mood'); render(); streetOpen()"); pg.wait_for_timeout(150)
        st=pg.evaluate("!!document.querySelector('#street .st-drill [data-drilldone]')")
        pg.click("#street [data-drilldone]"); pg.wait_for_timeout(80); pg.evaluate("streetClose(true)")
        dl=pg.evaluate("[state.drillRun, state.drillLog.length, state.drillLog[0].frames, state.drills.has('36'), document.getElementById('drillBar').hidden, JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.endsWith('drillLog'))||'null')||'[]').length]")
        check("An assignment runs with a frame counter on every page and in Street mode, and Done logs it and ticks it", db==[True,"+1 · 2 of 36",True] and st and dl[:5]==[None,1,2,True,True], [db,st,dl])
        pg.evaluate("openLearn('practice'); document.querySelector('[data-drillstart=\"same-place\"]').click()"); pg.wait_for_timeout(80)
        check("Same place, three times logs a visit at once and counts the week", pg.evaluate("[state.drillRun, document.querySelector('#learn').textContent.includes('1 of 3 visits this week')]")==[None,True])
        # Light here: where to point the camera and the settings, from your position
        pg.evaluate("state.view='today'; render()"); pg.wait_for_timeout(80)
        pg.click("#today [data-lightf]"); pg.wait_for_timeout(400)
        lf=pg.evaluate("""[!document.getElementById('lightf').hidden, !!document.querySelector('#lightf .lf-dial'), document.querySelectorAll('#lightf [data-lfopt]').length, document.querySelector('#lightf .lf-h').textContent,
          /Auto ISO will sit near|shutter will land near|Auto ISO stays/.test(document.querySelector('#lightf .st-exp').textContent), (document.querySelector('#lightf .lf-st')||{textContent:''}).textContent, document.querySelector('#lightf .st-where').textContent]""")
        check("Light here opens with a dial, the ways to point the camera, settings with the expected ISO, and your street", lf[0] and lf[1] and lf[2]>=1 and lf[3] and lf[4] and "Your street runs" in lf[5] and lf[6].count(" · ")==2, lf)
        if name=="Installed app": check("In the rain it says the light is soft and points to reflections", lf[3].startswith("Any direction works") and pg.evaluate("[...document.querySelectorAll('#lightf [data-lfopt]')].map(b=>b.textContent).join('|')")=="Best: Soft light|Reflections", lf[3])
        if pg.evaluate("document.querySelectorAll('#lightf [data-lfopt]').length")>1:
            pg.click("#lightf [data-lfopt='1']"); pg.wait_for_timeout(80)
            check("Choosing another way to point changes the advice", pg.evaluate("document.querySelector('#lightf [data-lfopt][aria-pressed=true]').dataset.lfopt")=="1" and pg.evaluate("document.querySelector('#lightf .lf-h').textContent")!=lf[3])
        # the compass: a phone lying flat with its top to the east, then raised with the camera to the west-southwest and turned a little sideways
        feed="(a,b,g)=>{ for(let i=0;i<40;i++) dispatchEvent(new DeviceOrientationEvent('deviceorientationabsolute',{alpha:a,beta:b,gamma:g,absolute:true})); }"
        pg.evaluate("("+feed+")(270,0,0)"); pg.wait_for_timeout(60)
        f1=pg.evaluate("[Math.round(oriHeading()), ORI.mode, document.getElementById('lfRot').style.transform, document.getElementById('lfTurn').textContent]")
        pg.evaluate("("+feed+")(192.6,105.1,-82.3)"); pg.wait_for_timeout(60)
        f2=pg.evaluate("[Math.round(oriHeading()), ORI.mode, Math.round(ORI.elev), Math.round(ORI.roll), document.querySelector('#lightf .lf-mode').textContent]")
        check("The compass in Light here: flat, the dial follows the top of the phone; raised and tilted, it follows the camera", f1[:3]==[90,"flat","rotate(-90deg)"] and ("Turn" in f1[3] or "facing it" in f1[3]) and f2[:4]==[250,"raised",2,-15] and "camera" in f2[4], [f1,f2])
        pg.click("#lightf [data-lfcam=q328]"); pg.wait_for_timeout(80)
        cs=pg.evaluate("[state.camera, document.querySelector('#lightf .st-exp .stk').textContent, document.querySelector('#lightf [data-lfcam=q328]').getAttribute('aria-pressed')]")
        pg.click("#lightf [data-lfcam=q343]"); pg.wait_for_timeout(80)
        check("Light here switches between the Leica Q3 and the Q3 43, and the settings follow", cs==["q328","Leica Q3 (28 mm)","true"] and pg.evaluate("[state.camera, document.querySelector('#lightf .st-exp .stk').textContent]")==["q343","Leica Q3 43"], cs)
        # look ahead: the coming changes, the time slider, the subject and the moon
        nx=pg.evaluate("[document.querySelectorAll('#lightf .lf-nx, #lightf .lf-next p').length, !!document.getElementById('lfTime')]")
        pg.evaluate("LF.off=60; lfRender()"); pg.wait_for_timeout(50)
        la=pg.evaluate("[document.querySelector('#lightf .st-where').textContent.includes('(in 1 h'), !!document.querySelector('#lightf [data-lfat=\"0\"]'), document.getElementById('lfTime').value]")
        pg.click("#lightf [data-lfat='0']"); pg.wait_for_timeout(50)
        check("Light here looks ahead: what changes in the next three hours, and a slider to see the light then", nx[0]>=1 and nx[1] and la==[True,True,"60"] and pg.evaluate("LF.off")==0, [nx,la])
        sj={}
        for k in ("walk","portrait","blur","silhouette"):
            pg.evaluate("LF.subj='%s'; lfRender()" % k); sj[k]=pg.evaluate("document.querySelector('#lightf .st-exp b').textContent")
        check("Settings follow the subject: walkers, a portrait wide open, motion blur at 1/15 s, silhouettes at ISO 100", "Auto ISO" in sj["walk"] and sj["portrait"].startswith("f/2 ") and "1/15 s" in sj["blur"] or "f/16" in sj["blur"], sj)
        check("Silhouettes are metered at ISO 100", "ISO 100" in sj["silhouette"], sj)
        pg.evaluate("LF.subj='auto'; store.set('lfSubj','auto'); lfRender()")
        mn=pg.evaluate("(()=>{ const t=new Date(2026,9,20,21,30), m=moonPos(t,40.723,-73.999); return [Math.round(m.frac*100), lfDial(sunPos(t,40.723,-73.999),null,m).includes('lf-moonlit'), lfLights({lat:40.723,lon:-73.999}).includes('subway entrance')]; })()")
        check("At night the dial shows the moon, and the nearest lit avenue and subway entrance are named", mn[0]>50 and mn[1] and mn[2], mn)
        # the light log: I shot this, rate it, and the summary by light
        pg.evaluate("state.lightLog=[]; LF.justLogged=false; lfRender()")
        pg.click("#lightf [data-lf=log]"); pg.wait_for_timeout(60); pg.click("#lightf [data-lf=rate][data-r=keep]"); pg.wait_for_timeout(60)
        lg=pg.evaluate("[state.lightLog.length, state.lightLog[0].r, !!state.lightLog[0].line, document.querySelector('#lightf .lf-log').textContent.includes('Your light'), document.querySelectorAll('#lightf .lf-bar').length]")
        pg.click("#lightf [data-lf=undo]"); pg.wait_for_timeout(60)
        check("I shot this logs the light, direction and settings; rating and undo work; Your light sums it up", lg==[1,"keep",True,True,1] and pg.evaluate("state.lightLog.length")==0, lg)
        # camera view: opens over Light here, draws the sun and the way to point from the compass and tilt, and closes
        if name=="Installed app":
            pg.evaluate("lfcOpen()"); pg.wait_for_timeout(300)
            pg.evaluate("ORI.cam=LF.cur&&LF.cur.face!=null?LF.cur.face:200; ORI.elev=5; ORI.mode='raised'; lfcDraw()"); pg.wait_for_timeout(50)
            cm=pg.evaluate("[!!document.getElementById('lfcam'), document.querySelectorAll('#lfcOv .lfc-m.aim, #lfcOv .lfc-edge.aim').length, document.getElementById('lfcTurn').textContent, !!document.querySelector('#lfcBot b')]")
            pg.click("#lfcam [data-lf=camclose]"); pg.wait_for_timeout(60)
            check("Camera view draws where to point over the camera picture, and closes", cm[0] and cm[1]==1 and ("On it" in cm[2] or cm[2]) and cm[3] and pg.evaluate("[!!document.getElementById('lfcam'), LFC.on]")==[False,False], cm)
            # with a camera (a canvas stands in for it): markers land where a pinhole camera puts them, the horizon tilts with the phone,
            # and the camera is let go on close, in the background and when opened and closed quickly
            cv=pg.evaluate("""(async()=>{ const live=[]; const fake=()=>{ const c=document.createElement('canvas'); c.width=1080; c.height=1920; c.getContext('2d').fillRect(0,0,9,9); const st=c.captureStream(5); live.push(st.getVideoTracks()[0]); return st; };
              const real=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia; if(!navigator.mediaDevices) Object.defineProperty(navigator,'mediaDevices',{value:{},configurable:true});
              navigator.mediaDevices.getUserMedia=async()=>{ await new Promise(r=>setTimeout(r,40)); return fake(); };
              const n=()=>live.filter(t=>t.readyState==='live').length, wait=ms=>new Promise(r=>setTimeout(r,ms)), out={};
              await lfcOpen(); await wait(150); out.open=n();
              const sp=sunPos(new Date(Date.now()+(LF.off||0)*6e4),40.7230,-73.9990); ORI.cam=sp.az; ORI.elev=sp.alt; ORI.roll=0; ORI.mode='raised'; ORI.uncal=false; lfcDraw();
              const ov=document.getElementById('lfcOv'), m=()=>{ const e=document.querySelector('#lfcOv .lfc-m.sun'); return e?[Math.round(parseFloat(e.style.left)-ov.clientWidth/2),Math.round(parseFloat(e.style.top)-ov.clientHeight/2)]:null; };
              out.center=m(); ORI.cam=sp.az-10; lfcDraw(); out.right=m(); const f=LFC.f; const d=Math.PI/180, D=(az,al)=>[Math.sin(az*d)*Math.cos(al*d),Math.cos(az*d)*Math.cos(al*d),Math.sin(al*d)], w=D(sp.az,sp.alt), c=D(sp.az-10,sp.alt), u=D(sp.az-10,sp.alt+90), rt=[Math.cos((sp.az-10)*d),-Math.sin((sp.az-10)*d),0], dt=(p,q)=>p[0]*q[0]+p[1]*q[1]+p[2]*q[2];
              out.rightWant=[Math.round(f*dt(w,rt)/dt(w,c)), Math.round(-f*dt(w,u)/dt(w,c))];
              ORI.cam=sp.az; ORI.roll=20; lfcDraw(); const l=document.querySelector('#lfcHz line'); out.hz=l?Math.round(Math.atan2(l.getAttribute('y2')-l.getAttribute('y1'),l.getAttribute('x2')-l.getAttribute('x1'))*180/Math.PI):null; ORI.roll=0;
              Object.defineProperty(document,'hidden',{value:true,configurable:true}); document.dispatchEvent(new Event('visibilitychange')); await wait(20); out.bg=n();
              Object.defineProperty(document,'hidden',{value:false,configurable:true}); document.dispatchEvent(new Event('visibilitychange')); await wait(150); out.back=n();
              lfcStop(); await wait(20); out.closed=n();
              lfcOpen(); lfcStop(); lfcOpen(); await wait(200); out.race=n(); lfcStop(); await wait(20); out.end=n();
              navigator.mediaDevices.getUserMedia=async()=>{ throw new Error('NotAllowedError'); }; await lfcOpen(); out.denied=(document.querySelector('#lfcBot .lfc-err')||{}).textContent||''; lfcStop();
              if(real) navigator.mediaDevices.getUserMedia=real; return out; })()""")
            check("Camera view: the sun sits where the camera sees it, the horizon tilts with the phone, and the camera is let go when closed or in the background",
                  cv["open"]==1 and cv["center"]==[0,0] and cv["right"] and abs(cv["right"][0]-cv["rightWant"][0])<=1 and abs(cv["right"][1]-cv["rightWant"][1])<=1 and cv["hz"]==20 and cv["bg"]==0 and cv["back"]==1 and cv["closed"]==0 and cv["race"]==1 and cv["end"]==0 and "camera" in cv["denied"], cv)
            # Leica frame lines and the contrast check, with an upright 4:3 picture from a canvas
            fr=pg.evaluate("""(async()=>{ const c=document.createElement('canvas'); c.width=1440; c.height=1920; const g=c.getContext('2d'); const paint=()=>{ g.fillStyle='#fff'; g.fillRect(0,0,1440,960); g.fillStyle='#000'; g.fillRect(0,960,1440,960); }; paint(); const iv=setInterval(paint,100);
              const real=navigator.mediaDevices.getUserMedia; navigator.mediaDevices.getUserMedia=async()=>c.captureStream(10); const wait=ms=>new Promise(r=>setTimeout(r,ms)), out={}, was=state.camera;
              state.camera='q343'; store.set('lfcFrame_q343',43); await lfcOpen(); await wait(400); lfcDraw(); const W=LFC.W, H=LFC.H, F=LFC.frame;
              out.f43=[LFC.fit, Math.round((F.x1-F.x0)/(F.y1-F.y0)*100), Math.round(F.x1-F.x0), Math.round(2*LFC.f*12/43), document.querySelectorAll('#lfcam .lfc-frs:not(.lfc-tools) .chip').length, !!document.querySelector('#lfcFr .lfc-line')];
              await wait(1500); out.cx=LFC.cxNow&&LFC.cxNow.k; out.cxShown=!document.getElementById('lfcCx').hidden;
              document.querySelector('#lfcam [data-lfcfr="0"]').click(); await wait(50); out.off=[!document.querySelector('#lfcFr .lfc-line'), Math.round(LFC.frame.x1-LFC.frame.x0)===W];
              lfcStop(); state.camera='q328'; store.set('lfcFrame_q328',28); await lfcOpen(); await wait(400); lfcDraw(); const G=LFC.frame;
              out.f28=[LFC.fit, G.x0>=0&&G.x1<=LFC.W+0.5, Math.round((G.x1-G.x0)/(G.y1-G.y0)*100)];
              lfcStop(); clearInterval(iv); navigator.mediaDevices.getUserMedia=real; state.camera=was; store.set('lfcFrame_q343',43); store.set('lfcFrame_q328',28);
              const px=(f)=>{ const a=new Uint8ClampedArray(64*64*4); for(let i=0;i<64*64;i++){ const v=f(i%64,Math.floor(i/64)); a[i*4]=a[i*4+1]=a[i*4+2]=v; a[i*4+3]=255; } return a; };
              out.adv=[lfcAdvice(lfcStats(px(()=>128))).k, lfcAdvice(lfcStats(px((x,y)=>y<32?255:3))).k, lfcAdvice(lfcStats(px((x,y)=>60+y*1.6))).k, lfcAdvice(lfcStats(px((x,y)=>y<32?200:45))).k];
              return out; })()""")
            check("Camera view: Leica frame lines (43 mm fills the screen, 28 mm shows the whole picture so it fits), and the contrast check reads the picture",
                  fr["f43"][0]=="cover" and fr["f43"][1]==67 and abs(fr["f43"][2]-fr["f43"][3])<=1 and fr["f43"][4]==6 and fr["f43"][5] and fr["cx"]=="vhigh" and fr["cxShown"] and fr["off"]==[True,True]
                  and fr["f28"][0]=="contain" and fr["f28"][1] and fr["f28"][2]==67 and fr["adv"]==["flat","vhigh","ok","high"], fr)
            # composition: guides in the frame, the level and leaning verticals, and the stage finder on known pictures
            cp=pg.evaluate("""(async()=>{ const out={}, wait=ms=>new Promise(r=>setTimeout(r,ms)); const real=navigator.mediaDevices.getUserMedia; const c=document.createElement('canvas'); c.width=1440; c.height=1920; c.getContext('2d').fillRect(0,0,9,9);
              navigator.mediaDevices.getUserMedia=async()=>c.captureStream(5); state.camera='q343'; store.set('lfcFrame_q343',43); await lfcOpen(); await wait(300);
              const G=k=>{ store.set('lfcGuide',k); lfcDraw(); return document.querySelectorAll('#lfcGd line').length; }; out.guides=[G('thirds'),G('golden'),G('diag'),G('centre'),G('off')]; store.set('lfcGuide','thirds');
              const F=LFC.full, gl=[...document.querySelectorAll('#lfcGd line')]; G('thirds'); const l=document.querySelector('#lfcGd line'); out.third=Math.abs(+l.getAttribute('x1')-(F.x0+(F.x1-F.x0)/3))<0.6;
              ORI.cam=200; ORI.mode='raised'; ORI.roll=0; ORI.elev=0; lfcDraw(); out.level=[document.getElementById('lfcLv').classList.contains('ok'), document.getElementById('lfcLvT').hidden];
              ORI.roll=4; ORI.elev=10; lfcDraw(); out.tilted=[document.getElementById('lfcLv').classList.contains('ok'), document.getElementById('lfcLvBar').style.transform, document.getElementById('lfcLvT').textContent, +LFC.lv.lean.toFixed(1)];
              const half=Math.atan((F.x1-F.x0)/2/LFC.f); out.leanWant=+(Math.atan(Math.tan(half)*Math.tan(10*Math.PI/180))*180/Math.PI).toFixed(1);
              document.querySelector('#lfcam [data-lfctool=level]').click(); await wait(30); out.levelOff=document.getElementById('lfcLv').hidden; document.querySelector('#lfcam [data-lfctool=level]').click();
              lfcStop(); navigator.mediaDevices.getUserMedia=real;
              const cw=96, ch=144, mk=d=>{ const k=document.createElement('canvas'); k.width=cw; k.height=ch; const g=k.getContext('2d'); d(g); return g.getImageData(0,0,cw,ch).data; }, R={x0:0,y0:0,x1:300,y1:450};
              const vx=0.66*cw, vy=0.40*ch, st=mk(g=>{ g.fillStyle='#555'; g.fillRect(0,0,cw,ch); g.strokeStyle='#eee'; g.lineWidth=2; for(const [ex,ey] of [[0,ch*0.95],[cw*0.25,ch],[cw,ch*0.9],[0,ch*0.2],[cw,ch*0.15]]){ g.beginPath(); g.moveTo(vx,vy); g.lineTo(ex,ey); g.stroke(); } });
              let S=lfsAnalyze(st,cw,ch,3,'thirds'); out.vp=S.vp&&[+S.vp.x.toFixed(2),+S.vp.y.toFixed(2)]; out.vpAdv=lfsAdvice(S,R,600,'thirds')[0].t; out.vpPool=!!S.pool;
              const pl=mk(g=>{ g.fillStyle='#202020'; g.fillRect(0,0,cw,ch); g.fillStyle='#e8e0c8'; g.fillRect(cw*0.15,ch*0.62,cw*0.22,ch*0.12); });
              S=lfsAnalyze(pl,cw,ch,5,'thirds'); out.pool=S.pool&&[+S.pool.x.toFixed(2),+S.pool.y.toFixed(2)]; out.poolTarget=S.target.why; out.poolAdv=lfsAdvice(S,R,600,'thirds')[0].t;
              const sky=mk(g=>{ g.fillStyle='#303030'; g.fillRect(0,0,cw,ch); g.fillStyle='#f0f0f0'; g.beginPath(); g.moveTo(cw*0.2,0); g.lineTo(cw*0.8,0); g.lineTo(cw*0.55,ch*0.45); g.lineTo(cw*0.45,ch*0.45); g.fill(); });
              out.skyPool=!!lfsAnalyze(sky,cw,ch,5,'thirds').pool;
              const flat=mk(g=>{ g.fillStyle='#8a8a8a'; g.fillRect(0,0,cw,ch); }); S=lfsAnalyze(flat,cw,ch,0.5,'thirds'); out.flat=[S.vp,S.pool,lfsAdvice(S,R,600,'thirds')[0].k];
              const ed=mk(g=>{ g.fillStyle='#606060'; g.fillRect(0,0,cw,ch); g.fillStyle='#fff'; g.fillRect(cw-6,ch*0.4,6,ch*0.25); }); S=lfsAnalyze(ed,cw,ch,4,'thirds'); out.edge=[S.edge, lfsAdvice(S,R,600,'thirds').map(m=>m.k)];
              return out; })()""")
            check("Camera view composition: guides in the frame, level and leaning verticals, and the stage finder (lines and where they meet, pools of light, flat scenes, bright edges)",
                  cp["guides"]==[4,4,6,2,0] and cp["third"] and cp["level"]==[True,True] and cp["tilted"][0]==False and "rotate(4" in cp["tilted"][1] and "verticals lean" in cp["tilted"][2] and "tip down 10" in cp["tilted"][2] and abs(cp["tilted"][3]-cp["leanWant"])<0.05 and cp["levelOff"]
                  and cp["vp"] and abs(cp["vp"][0]-0.66)<=0.03 and abs(cp["vp"][1]-0.40)<=0.03 and cp["vpAdv"].startswith("Lines meet") and not cp["vpPool"]
                  and cp["pool"] and abs(cp["pool"][0]-0.26)<=0.02 and abs(cp["pool"][1]-0.68)<=0.02 and cp["poolTarget"]=="pool" and "turn 2° left" in cp["poolAdv"].lower()
                  and not cp["skyPool"] and cp["flat"]==[None,None,"none"] and cp["edge"][0]=="right" and "edge" in cp["edge"][1], cp)
            # the stage finder on the cases real photos showed: a cloud is not a pool and the target stays out of the sky;
            # a wall whose lines all slant one way meets off the frame; a horizon across the middle gets moved to a third
            rp=pg.evaluate("""(()=>{ const cw=128, ch=192, mk=d=>{ const k=document.createElement('canvas'); k.width=cw; k.height=ch; const g=k.getContext('2d'); d(g); return g.getImageData(0,0,cw,ch).data; }, R={x0:0,y0:0,x1:300,y1:450}, out={};
              const cloud=mk(g=>{ g.fillStyle='#6a9be0'; g.fillRect(0,0,cw,ch*0.5); g.fillStyle='#f6f6f6'; g.beginPath(); g.ellipse(cw*0.3,ch*0.18,14,8,0,0,7); g.fill(); g.fillStyle='#4a4038'; g.fillRect(0,ch*0.5,cw,ch*0.5); g.strokeStyle='#7a6a5a'; g.lineWidth=2; for(let i=0;i<6;i++){ g.beginPath(); g.moveTo(i*24,ch*0.6); g.lineTo(i*24+10,ch); g.stroke(); } });
              let S=lfsAnalyze(cloud,cw,ch,5,'thirds'); out.cloud=[!!S.pool, S.target?+S.target.y.toFixed(2):null, +S.sky.toFixed(2)];
              const wall=mk(g=>{ g.fillStyle='#d8d4cc'; g.fillRect(0,0,cw,ch); g.strokeStyle='#3a3530'; g.lineWidth=3; const vx=-0.4*cw, vy=0.8*ch; for(let k=0;k<7;k++){ const ey=ch*(-0.2+k*0.17); g.beginPath(); g.moveTo(vx,vy); g.lineTo(cw*1.2,ey); g.stroke(); } });
              S=lfsAnalyze(wall,cw,ch,4,'thirds'); out.wall=[S.vp&&+S.vp.x.toFixed(2), S.vp&&+S.vp.y.toFixed(2), S.vp&&S.vp.inF, lfsAdvice(S,R,600,'thirds')[0].t];
              const hz=mk(g=>{ g.fillStyle='#d2d4d8'; g.fillRect(0,0,cw,ch/2); g.fillStyle='#a08a64'; g.fillRect(0,ch/2,cw,ch/2); g.fillStyle='#5a4a34'; for(let i=0;i<40;i++) g.fillRect((i*37)%cw,ch/2+10+(i*53)%(ch/2-14),3,3); });
              S=lfsAnalyze(hz,cw,ch,3,'thirds'); out.hz=[S.horizon&&+S.horizon.y.toFixed(2), lfsAdvice(S,R,600,'thirds')[0].k, lfsAdvice(S,R,600,'thirds')[0].t];
              return out; })()""")
            check("Stage finder on the cases from real photos: a cloud is not a pool of light and the target stays out of the sky; a one-sided wall's lines meet off the frame; a horizon across the middle is moved to a third",
                  rp["cloud"][0]==False and (rp["cloud"][1] is None or rp["cloud"][1]>0.5) and rp["cloud"][2]>0.3
                  and rp["wall"][0] is not None and rp["wall"][0]<0 and rp["wall"][2]==False and "lead out to the left" in rp["wall"][3]
                  and rp["hz"][0] is not None and abs(rp["hz"][0]-0.5)<0.05 and rp["hz"][1]=="hz" and "third" in rp["hz"][2], rp)
            # the spot's day: direct sun past the buildings, the best window, saving the spot and adding it to a calendar
            pg.evaluate("LFB.cache.clear(); LFB.err=''; lfRender()"); pg.wait_for_timeout(400)
            dy=pg.evaluate("""(()=>{ const D=lfDay(LF.curPos); return [!!D, D&&D.hasB, D&&!!D.sun, D&&!!D.best, !!document.querySelector('#lightf .lfd .lfd-sky i'), (document.querySelector('#lightf .lfd-bl')||{textContent:''}).textContent]; })()""")
            pg.click("#lightf [data-lf=spot]"); pg.wait_for_timeout(60)
            sv=pg.evaluate("[state.lightSpots.length, document.querySelectorAll('#lightf .lfd-spot').length, (document.querySelector('#lightf [data-lf=spot]')||{}).textContent]")
            pg.click("#lightf [data-lfspot]"); pg.wait_for_timeout(100)
            vw=pg.evaluate("[LF.spot&&LF.spot.name, !!document.querySelector('#lightf [data-lf=unspot]'), !document.querySelector('#lightf [data-lf=cam]')]")
            ics=pg.evaluate("(()=>{ const D=lfDay(LF.curPos); return [lfIcs(LF.curPos,'Test, spot',D), lfGcal(LF.curPos,'Test',D)]; })()")
            pg.click("#lightf [data-lf=unspot]"); pg.wait_for_timeout(60); pg.click("#lightf [data-lfspotdel]"); pg.wait_for_timeout(60)
            check("Light here: the spot's day (sun past the buildings, best window), save a spot, view it, add it to a calendar, remove it",
                  dy[:5]==[True,True,True,True,True] and "Best light here" in dy[5] and sv[0]==1 and sv[1]==1 and "Saved" in sv[2] and vw[0] and vw[1] and vw[2]
                  and "DTSTART:" in ics[0] and "BEGIN:VALARM" in ics[0] and "SUMMARY:Light: Test\\, spot" in ics[0] and "action=TEMPLATE" in ics[1] and "&dates=" in ics[1]
                  and pg.evaluate("[state.lightSpots.length, LF.spot]")==[0,None], [dy,sv,vw,ics[0][:200]])
            # building shadows from the city's footprints (a made-up building stands in for the real data)
            sh=pg.evaluate("""(async()=>{ const pt={lat:40.7230,lon:-73.9990}; LFB.cache.clear(); LFB.err=""; await lfbLoad(pt); const T=lfbTile(pt); const r=lfbSun(T,pt,new Date()), far=lfbSun(T,{lat:40.7238,lon:-73.9970},new Date());
              return [!!T, T&&T.list.length, r.sun, r.by&&Math.round(r.by.h), far.sun, lfbHtml(pt,new Date(),null).includes('You are in shade')]; })()""")
            check("Building shadows: a tall building to the sun's side puts your spot in shade; a clear spot is in sun", sh[:6]==[True,1,False,61,True,True], sh)
        pg.evaluate("state.heading=null"); pg.click("#lightf [data-lf=close]"); pg.wait_for_timeout(80)
        check("Light here closes", pg.evaluate("[document.getElementById('lightf').hidden, LF.open]")==[True,False])
        pg.evaluate("state.view='map'; render()"); pg.wait_for_timeout(200)
        check("The map has a Light here button too", pg.evaluate("!!document.querySelector('#map .mapbtns [data-lightf]')"))
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
