#!/usr/bin/env python3
"""Shoot alerts: what is worth going out for in the next three days, worked out by the app itself.

Loads index.html in a headless browser, gives it the Open-Meteo forecast from a file (the same request the app
makes), and prints the app's own "Worth going out" list (shootAlerts in src/app.js) as JSON, one alert per item:
  kind, score, date, start, end (local New York times), title, why, place, ideas.

Used by the daily alert task, which fetches the forecast and then turns strong alerts into calendar events.

Usage: python3 tools/alerts.py FORECAST.json [--now 2026-10-13T07:45:00] [--weather-doc OUT.json]
       python3 tools/alerts.py --no-forecast          (only the alerts that need no forecast: Manhattanhenge, events)
       FORECAST.json is the Open-Meteo response for New York (hourly precipitation_probability, precipitation,
       cloud_cover, weather_code, temperature_2m; timezone America/New_York).
       --weekend-out FILE writes the "This weekend" line (events on Saturday and Sunday with times and forecast), or an empty file.
       --weather-doc writes the forecast in the shape the Claude version of the app reads from its database
       (collection "weather", document "nyc"), so the artifact gets the hourly forecast too.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WMO = lambda c: ("Clear" if c == 0 else "Mainly clear" if c == 1 else "Partly cloudy" if c == 2 else "Overcast" if c == 3 else "Fog" if c in (45, 48)
                 else "Drizzle" if 51 <= c <= 57 else "Rain" if 61 <= c <= 67 else "Snow" if 71 <= c <= 77 else "Rain showers" if 80 <= c <= 82
                 else "Snow showers" if c in (85, 86) else "Thunderstorm" if c >= 95 else "")

def check(h):
    """Refuse a forecast that is not a whole, sensible Open-Meteo hourly block (for example one cut short in transit)."""
    t = h.get("time") or []
    if len(t) < 24: sys.exit("alerts: the forecast has %d hours; need at least 24" % len(t))
    for k, lo, hi in (("precipitation_probability", 0, 100), ("cloud_cover", 0, 100), ("weather_code", 0, 99)):
        v = h.get(k)
        if not isinstance(v, list) or len(v) != len(t): sys.exit("alerts: hourly %s missing or the wrong length" % k)
        if any(x is not None and not (isinstance(x, (int, float)) and lo <= x <= hi) for x in v): sys.exit("alerts: hourly %s has values out of range" % k)
    if not all(isinstance(x, str) and len(x) == 16 and x[10] == "T" for x in t): sys.exit("alerts: hourly time is not in YYYY-MM-DDTHH:MM form")

def weather_doc(fc, path, now):
    import datetime, zoneinfo
    tz = zoneinfo.ZoneInfo("America/New_York"); n = datetime.datetime.fromisoformat(now).replace(tzinfo=tz) if now else datetime.datetime.now(tz)
    h = fc["hourly"]; key = n.strftime("%Y-%m-%dT%H:00"); i = h["time"].index(key) if key in h["time"] else 0
    code = h["weather_code"][i]; temp = (h.get("temperature_2m") or [None] * len(h["time"]))[i]; day = n.strftime("%Y-%m-%d")
    doc = {"updated": n.isoformat(timespec="minutes"), "condition": WMO(code), "condition_text": WMO(code), "is_day": 7 <= n.hour < 19,
           "precip_chance_today": max([p for t, p in zip(h["time"], h["precipitation_probability"]) if t.startswith(day) and p is not None] or [0]),
           "hourly": {"time": h["time"], "pop": h["precipitation_probability"], "mm": h.get("precipitation") or [0] * len(h["time"]),
                      "cc": h["cloud_cover"], "code": h["weather_code"], "t": h.get("temperature_2m") or [None] * len(h["time"])}}
    if temp is not None: doc["temp_c"] = temp
    json.dump(doc, open(path, "w"), separators=(",", ":"))

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    nofc = sys.argv[1] == "--no-forecast"
    fc = {} if nofc else json.load(open(sys.argv[1], encoding="utf-8"))
    h = fc.get("hourly") or {}
    if not nofc: check(h)
    if "--weather-doc" in sys.argv and not nofc: weather_doc(fc, sys.argv[sys.argv.index("--weather-doc") + 1], sys.argv[sys.argv.index("--now") + 1] if "--now" in sys.argv else None)
    if not nofc and not fc.get("current"):   # the app only stores a forecast that comes with a current reading
        fc["current"] = {"temperature_2m": (h.get("temperature_2m") or [15])[0], "weather_code": (h.get("weather_code") or [1])[0], "is_day": 1}
    if not nofc: fc.setdefault("daily", {"precipitation_probability_max": [max(h.get("precipitation_probability") or [0])]})
    now = sys.argv[sys.argv.index("--now") + 1] if "--now" in sys.argv else None
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 390, "height": 844}, timezone_id="America/New_York")
        pg = ctx.new_page(); errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        if now: pg.clock.install(time=now)
        if nofc: pg.route("**/api.open-meteo.com/**", lambda r: r.abort())
        else: pg.route("**/api.open-meteo.com/**", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(fc)))
        pg.route("**/upload.wikimedia.org/**", lambda r: r.abort())
        pg.route("**/events.json", lambda r: r.continue_())
        pg.goto("file://" + os.path.join(ROOT, "index.html"))
        if nofc: pg.wait_for_timeout(800)
        else: pg.wait_for_function("WEATHER.nyc && WEATHER.nyc.hourly", timeout=15000)
        ev_path = os.path.join(ROOT, "events.json")   # the page cannot fetch files from disk, so hand it the events
        if os.path.exists(ev_path): pg.evaluate("j=>{ EVENT_DOCS=j; }", json.load(open(ev_path, encoding="utf-8")))
        if "--weekend-out" in sys.argv:
            wk = pg.evaluate("weekendPreview().text")
            open(sys.argv[sys.argv.index("--weekend-out") + 1], "w", encoding="utf-8").write(wk or "")
        out = pg.evaluate("""(()=>{ const p2=n=>String(n).padStart(2,'0'), hm=m=>p2(Math.floor(m/60)%24)+':'+p2(m%60),
            ymd=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
          return shootAlerts().map(a=>({kind:a.kind, score:a.score, date:ymd(a.day), start:hm(a.at), end:hm(Math.min(a.end,1439)),
            when:(a.k===0?'Today':a.k===1?'Tomorrow':DAY_NAMES[a.day.getDay()])+' '+hmText(a.at), title:a.title, why:a.why,
            place:a.place?PLACES[a.place].name:null, ideas:a.ideas.map(id=>{ const x=IDEAS.find(i=>i.id===id); return x?x.t+' ('+PLACES[x.p].name+')':id; })})); })()""")
        b.close()
    if errors: print("page errors: " + "; ".join(errors), file=sys.stderr)
    print(json.dumps(out, indent=1))

if __name__ == "__main__":
    main()
