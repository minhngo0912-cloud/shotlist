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
        pg = ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.clock.install(time="2026-10-11T15:00:00")
        # A fixed forecast for the installed app: rain from 3 pm to 6 pm, overcast before, clear after
        times=["2026-10-%sT%02d:00"%(d,h) for d in ("11","12") for h in range(24)]
        code=[61 if (d=="11" and 15<=h<18) else 3 if (d=="11" and 12<=h<15) else 1 for d in ("11","12") for h in range(24)]
        fake={"current":{"temperature_2m":14,"weather_code":3,"is_day":1},"daily":{"precipitation_probability_max":[80,10]},
              "hourly":{"time":times,"weather_code":code,"precipitation_probability":[80 if c==61 else 10 for c in code],"precipitation":[1.2 if c==61 else 0 for c in code],"cloud_cover":[100 if c in (3,61) else 20 for c in code]}}
        import json as _j
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

        # Shoot: every tab of a card
        for tab in ["idea", "work", "compose", "settings"]:
            pg.evaluate("t=>{state.view='shoot';state.tab=t;render()}", tab); pg.wait_for_timeout(80)
        no_overflow("Shoot"); shot("shoot")
        pg.click("#next"); pg.wait_for_timeout(80)
        # Browse and Saved
        pg.click("#vBrowse"); pg.wait_for_timeout(150); no_overflow("Browse"); shot("browse")
        check("Browse lists ideas", pg.evaluate("document.querySelectorAll('#list .row').length") > 100)
        pg.click("#vSaved"); pg.wait_for_timeout(100)
        # Plan
        pg.click("#vPlan"); pg.click("#pGo"); pg.wait_for_timeout(150)
        check("Plan makes an outing", pg.evaluate("!!(state.plan&&state.plan.stops.length)")); no_overflow("Plan"); shot("plan")
        # Events
        pg.click("#vEvents"); pg.wait_for_timeout(150)
        check("Events lists events", pg.evaluate("document.querySelectorAll('#events details').length") > 10); no_overflow("Events"); shot("events")
        # Map
        pg.click("#vMap"); pg.wait_for_timeout(250); pg.click("[data-z=man]"); pg.wait_for_timeout(500)
        check("Map draws pins", pg.evaluate("document.querySelectorAll('.m-pin').length") > 10)
        pg.select_option("#mapGo", "union"); pg.wait_for_timeout(500)
        check("Map go-to selects a place", pg.evaluate("state.mapSel") == "union")
        pg.evaluate("state.plan=null"); pg.click("[data-addplan]"); pg.wait_for_timeout(100)
        pg.evaluate("mapSelect('wsp')"); pg.click("[data-addplan]"); pg.wait_for_timeout(100)
        check("Map builds an outing", pg.evaluate("state.plan.stops.map(s=>s.place).join()") == "union,wsp")
        pg.click("[data-stop='1']"); pg.wait_for_timeout(500)
        check("Stop chip moves the slider", pg.evaluate("state.mapT") is not None)
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
        check("Toggle counts events on now", "1 on now" in pg.evaluate("document.querySelector('.evtoggle').textContent"))
        check("Event later today shows its start", evk(10*60)=="m-ev today|Today 12 pm", evk(10*60))
        pg.evaluate("mapSelectEv('testlive')"); pg.evaluate("state.mapT=14*60; mapDraw(); mapPanel()")
        check("Event panel says it is on now", "On now, until about 5 pm" in pg.evaluate("document.querySelector('.evnow').textContent"))
        shot("map-event-live")
        pg.evaluate("mapSelectEv(null)")
        check("Event that has finished is marked over", evk(18*60).startswith("m-ev over"), evk(18*60))
        pg.evaluate("()=>{ delete EVENT_DOCS.testlive; state.mapT=null; mapDraw(); mapPanel(); }")
        # Full screen
        pg.evaluate("mapSelect(null)"); pg.click("[data-full]"); pg.wait_for_timeout(300)
        shot("map-full-empty")
        fs=pg.evaluate("(()=>{const r=document.getElementById('mapSvg').getBoundingClientRect(); return [document.getElementById('map').classList.contains('full'), Math.round(r.width), Math.round(r.height)]})()")
        check("Full screen map fills the screen", fs[0] and fs[1]>=370 and fs[2]>=600, fs)
        pg.evaluate("mapSelect('union')"); pg.wait_for_timeout(200)
        check("Full screen shows a tapped place as a sheet", pg.evaluate("getComputedStyle(document.getElementById('mapPanel')).display")=="block")
        shot("map-full")
        pg.click("[data-unsel]"); pg.wait_for_timeout(100)
        check("Sheet closes", pg.evaluate("getComputedStyle(document.getElementById('mapPanel')).display")=="none")
        pg.click("[data-full]"); pg.wait_for_timeout(300)
        check("Leaving full screen restores the map", pg.evaluate("!document.getElementById('map').classList.contains('full') && Math.abs(MAP_ASPECT-1.35)<0.02"), pg.evaluate("MAP_ASPECT"))
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
