#!/usr/bin/env python3
"""Make the map's base layers (src/mapdata.js) from public data.

Sources (download once, then point this script at the folder that holds them):
  git clone --depth 1 https://github.com/fillerwriter/nyc-streets     # US Census TIGER street centrelines for the five boroughs (GeoJSON)
  git clone --depth 1 https://github.com/kjhealy/nycroutes            # includes the MTA subway GTFS feed: data-raw/subway/gtfs_subway.zip

Usage: python3 tools/make_mapdata.py SOURCE_DIR
Writes src/mapdata.js with:
  MAPD_ROADS    SVG path data for avenues, local streets and footpaths, in map units x10 (draw inside scale(0.1))
  MAPD_SUBWAY   [colour, path] per subway trunk line, in MTA colours, same units
  MAPD_STATIONS [name, lat, lon, routes] for every subway station
  MAPD_STREETS  [name, label segment, [[lat,lon],...]] real centrelines of the streets the map labels (also used for the sunny side)
"""
import csv, io, json, math, os, re, sys, zipfile
from collections import defaultdict

SRC = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def xy(lat, lon):            # the app's projection (mapXY), in map units
    return ((lon + 74.30) * 0.758 * 2000, (40.95 - lat) * 2000)

def dp(pts, tol):            # Douglas-Peucker simplification
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1
    for k in range(1, len(pts)-1):
        p = pts[k]; d = abs(dy*(p[0]-a[0]) - dx*(p[1]-a[1])) / L
        if d > dmax: i, dmax = k, d
    if dmax <= tol: return [a, b]
    return dp(pts[:i+1], tol)[:-1] + dp(pts[i:], tol)

def path(lines, tol):        # lines in map units -> compact relative path in units x10
    out = []
    for ln in lines:
        q = [(round(x*10), round(y*10)) for x, y in dp(ln, tol)]
        q = [p for i, p in enumerate(q) if i == 0 or p != q[i-1]]
        if len(q) < 2: continue
        s = "M%d %d" % q[0]
        s += "l" + " ".join("%d %d" % (q[i][0]-q[i-1][0], q[i][1]-q[i-1][1]) for i in range(1, len(q)))
        out.append(s)
    return "".join(out).replace(" -", "-")

# ---------- streets ----------
roads = json.load(open(os.path.join(SRC, "fillerwriter_nyc-streets", "nyc-streets.geojson")))["features"]
AVE = re.compile(r"\b(Ave|Avenue|Blvd|Boulevard|Broadway|Pkwy|Parkway|Concourse|Expy|Hwy|Dr)\b|^(E|W) (14th|23rd|34th|42nd|57th|72nd|86th|96th|110th|116th|125th|145th) St$|Houston St|Canal St|Delancey St|Chambers St|Fordham Rd|Kings Hwy")
cls = defaultdict(list)
named = defaultdict(list)
for f in roads:
    p, g = f["properties"], f["geometry"]
    mt, name = p.get("MTFCC"), p.get("FULLNAME") or ""
    if mt in ("S1630", "S1640", "S1720", "S1740", "S1750", "S1780", "S1500", "S1730"): continue
    k = "hwy" if mt == "S1100" else "path" if mt == "S1710" else "ave" if (mt == "S1200" or AVE.search(name)) else "local"
    parts = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
    for part in parts:
        ln = [xy(lat, lon) for lon, lat in part]
        cls[k].append(ln)
        named[(p.get("COUNTYFP"), name)].append([(lat, lon) for lon, lat in part])
ROADS = {k: path(v, 0.08) for k, v in cls.items()}

# real centrelines for the streets the map labels: our label name -> (county, TIGER names)
LABELS = [("Broadway","061",["Broadway"]),("5 Av","061",["5th Ave"]),("Houston St","061",["E Houston St","W Houston St"]),("Canal St","061",["Canal St"]),
 ("14 St","061",["E 14th St","W 14th St"]),("23 St","061",["E 23rd St","W 23rd St"]),("34 St","061",["E 34th St","W 34th St"]),("42 St","061",["E 42nd St","W 42nd St"]),
 ("57 St","061",["E 57th St","W 57th St"]),("86 St","061",["E 86th St","W 86th St"]),("110 St","061",["E 110th St","W 110th St","Cathedral Pkwy","Central Park N"]),
 ("125 St","061",["E 125th St","W 125th St","Martin Luther King Jr Blvd"]),("Flatbush Av","047",["Flatbush Ave","Flatbush Ave Ext"]),("Atlantic Av","047",["Atlantic Ave"]),
 ("Ocean Pkwy","047",["Ocean Pkwy"]),("Queens Blvd","081",["Queens Blvd"]),("Roosevelt Av","081",["Roosevelt Ave"]),("Grand Concourse","005",["Grand Concourse"]),
 ("1 Av","061",["1st Ave"]),("3 Av","061",["3rd Ave"]),("Park Av","061",["Park Ave","Park Ave S"]),("Lexington Av","061",["Lexington Ave"]),("6 Av","061",["Avenue of the Americas","6th Ave"]),
 ("7 Av","061",["7th Ave","7th Ave S"]),("8 Av","061",["8th Ave"]),("Central Park West","061",["Central Park W"]),("10 Av","061",["10th Ave"]),("Amsterdam Av","061",["Amsterdam Ave"]),
 ("2 Av","061",["2nd Ave"]),("Madison Av","061",["Madison Ave"]),("Lenox Av","061",["Lenox Ave","Malcolm X Blvd"]),("Frederick Douglass Blvd","061",["Frederick Douglass Blvd"]),
 ("72 St","061",["E 72nd St","W 72nd St"]),("96 St","061",["E 96th St","W 96th St"]),("145 St","061",["E 145th St","W 145th St"]),("Delancey St","061",["Delancey St"]),
 ("Chambers St","061",["Chambers St"]),("Bedford Av","047",["Bedford Ave"]),("Eastern Pkwy","047",["Eastern Pkwy"]),("4 Av","047",["4th Ave"]),("Surf Av","047",["Surf Ave"]),
 ("Northern Blvd","081",["Northern Blvd"]),("Fordham Rd","005",["E Fordham Rd","W Fordham Rd"]),("West St","061",["West St"]),("Bowery","061",["Bowery"]),("Wall St","061",["Wall St"])]

def chain(pieces):           # join touching pieces into the longest polylines
    pieces = [p[:] for p in pieces if len(p) >= 2]; out = []
    key = lambda p: (round(p[0], 4), round(p[1], 4))
    while pieces:
        ln = pieces.pop(0); grown = True
        while grown:
            grown = False
            for i, p in enumerate(pieces):
                if key(p[0]) == key(ln[-1]): ln += p[1:]
                elif key(p[-1]) == key(ln[-1]): ln += p[::-1][1:]
                elif key(p[-1]) == key(ln[0]): ln = p[:-1] + ln
                elif key(p[0]) == key(ln[0]): ln = p[::-1][:-1] + ln
                else: continue
                pieces.pop(i); grown = True; break
        out.append(ln)
    return out

def length(ln): return sum(math.hypot(*(a-b for a, b in zip(xy(*ln[i]), xy(*ln[i-1])))) for i in range(1, len(ln)))

STREETS = []
for label, county, names in LABELS:
    pieces = [pc for n in names for pc in named.get((county, n), [])]
    if not pieces: print("no geometry for", label, file=sys.stderr); continue
    chains = sorted(chain(pieces), key=length, reverse=True)
    for n, c in enumerate(chains):
        if length(c) < 4: continue          # drop scraps shorter than about 200 m
        pts = dp([xy(*p) for p in c], 0.25)
        ll = [[round(40.95 - y/2000, 5), round(x/(0.758*2000) - 74.30, 5)] for x, y in pts]
        STREETS.append([label, (len(ll)-1)//2 if n == 0 else -1, ll])

# ---------- subway ----------
z = zipfile.ZipFile(os.path.join(SRC, "kjhealy_nycroutes", "data-raw", "subway", "gtfs_subway.zip"))
rd = lambda n: list(csv.DictReader(io.TextIOWrapper(z.open(n), "utf-8-sig")))
routes = {r["route_id"]: r for r in rd("routes.txt")}
trips = rd("trips.txt")
shape_route = {}
for t in trips: shape_route.setdefault(t["shape_id"], t["route_id"])
shapes = defaultdict(list)
for s in rd("shapes.txt"): shapes[s["shape_id"]].append((int(s["shape_pt_sequence"]), float(s["shape_pt_lat"]), float(s["shape_pt_lon"])))
by_colour = defaultdict(list)
for sid, pts in shapes.items():
    rid = shape_route.get(sid)
    if not rid or rid not in routes: continue
    colour = "#" + (routes[rid]["route_color"] or "808183")
    by_colour[colour].append([xy(la, lo) for _, la, lo in sorted(pts)])
SUBWAY = []
for colour, lines in by_colour.items():
    seen, keep = set(), []
    for ln in sorted(lines, key=len, reverse=True):
        cur = []
        for i in range(1, len(ln)):
            a, b = ln[i-1], ln[i]; k = tuple(sorted(((round(a[0]*2), round(a[1]*2)), (round(b[0]*2), round(b[1]*2)))))
            if k in seen:
                if len(cur) > 1: keep.append(cur)
                cur = []; continue
            seen.add(k); cur = cur or [a]; cur.append(b)
        if len(cur) > 1: keep.append(cur)
    SUBWAY.append([colour, path(keep, 0.1)])

stops = rd("stops.txt"); parent = {s["stop_id"]: (s["parent_station"] or s["stop_id"]) for s in stops}
trip_route = {t["trip_id"]: t["route_id"] for t in trips}
serve = defaultdict(set)
for st in rd("stop_times.txt"):
    r = trip_route.get(st["trip_id"])
    if r: serve[parent.get(st["stop_id"], st["stop_id"])].add(r)
ORDER = "1234567ACEBDFMGJZLNQRWS"
STATIONS = []
for s in stops:
    if s["location_type"] != "1": continue
    rs = "".join(sorted({r[0] for r in serve.get(s["stop_id"], ()) if r[0] in ORDER}, key=ORDER.index))
    if not rs: continue
    STATIONS.append([s["stop_name"], round(float(s["stop_lat"]), 5), round(float(s["stop_lon"]), 5), rs])

out = ("/* Base map layers, generated by tools/make_mapdata.py from US Census TIGER street centrelines and the MTA subway GTFS feed. Do not edit by hand. */\n"
       "const MAPD_ROADS = " + json.dumps(ROADS, separators=(",", ":")) + ";\n"
       "const MAPD_SUBWAY = " + json.dumps(SUBWAY, separators=(",", ":")) + ";\n"
       "const MAPD_STATIONS = " + json.dumps(STATIONS, ensure_ascii=False, separators=(",", ":")) + ";\n"
       "const MAPD_STREETS = " + json.dumps(STREETS, separators=(",", ":")) + ";\n")
open(os.path.join(ROOT, "src", "mapdata.js"), "w").write(out)
print("mapdata.js %d KB: roads %s, subway %d KB, %d stations, %d street lines" % (len(out)//1024, {k: len(v)//1024 for k, v in ROADS.items()}, sum(len(p) for _, p in SUBWAY)//1024, len(STATIONS), len(STREETS)))
