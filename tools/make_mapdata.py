#!/usr/bin/env python3
"""Make the map's base layers (src/mapdata.js) from public data.

Sources (download once into one folder, then point this script at it):
  git clone --depth 1 https://github.com/fillerwriter/nyc-streets fillerwriter_nyc-streets   # US Census TIGER street centrelines (GeoJSON)
  git clone --depth 1 https://github.com/kjhealy/nycroutes kjhealy_nycroutes                 # MTA subway GTFS feed: data-raw/subway/gtfs_subway.zip
  git clone --depth 1 https://github.com/nycehs/NYC_geography nycehs                         # NYC Planning borough boundaries clipped to the shoreline (nybb_20a)
  git clone --depth 1 https://github.com/kjhealy/nycmaps nycmaps                             # NYC Planning shoreline and Neighborhood Tabulation Areas (parks, cemeteries, airports)
  npm pack @geo-maps/earth-lands-10m, unpacked into lands/package                           # OpenStreetMap land, for New Jersey, Westchester and Nassau
Needs: pip install pyshp pyproj shapely rdata

Usage: python3 tools/make_mapdata.py SOURCE_DIR
Writes src/mapdata.js with:
  MAPD_ROADS    SVG path data for avenues, local streets and footpaths, in map units x10 (draw inside scale(0.1))
  MAPD_SUBWAY   [colour, path] per subway trunk line, in MTA colours, same units
  MAPD_STATIONS [name, lat, lon, routes] for every subway station
  MAPD_STREETS  [name, label segment, [[lat,lon],...]] real centrelines of the streets the map labels (also used for the sunny side)
  MAPD_LAND     the five boroughs, piers included; MAPD_CTX the land around them; MAPD_PARK, MAPD_CEM, MAPD_AIR parks, cemeteries, airports
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

# ---------- land, shoreline, parks ----------
import warnings, pickle; warnings.filterwarnings("ignore")
import numpy as np, shapefile, rdata, shapely
from pyproj import Transformer
from shapely.geometry import Polygon, LinearRing, LineString, Point, box
from shapely.ops import unary_union, transform, polygonize
from shapely import make_valid
SP = Transformer.from_crs("EPSG:2263", "EPSG:4326", always_xy=True)
def sp_xy(arr):
    lon, lat = SP.transform(arr[:, 0], arr[:, 1]); return [xy(a, b) for a, b in zip(lat, lon)]
def rda(name, folder="nycmaps/data"):
    return rdata.conversion.convert(rdata.parser.parse_file(os.path.join(SRC, folder, name + ".rda")))[name]
def poly_path(geom, tol):     # polygons (with holes) -> closed path in units x10, drawn with fill-rule evenodd
    out = []
    for p in getattr(geom, "geoms", [geom]):
        if p.geom_type != "Polygon" or p.area < 0.02: continue
        p = p.simplify(tol, preserve_topology=True)
        if p.is_empty or p.geom_type != "Polygon": continue
        for r in [p.exterior] + list(p.interiors):
            if Polygon(r).area < 0.02: continue
            q = [(round(x*10), round(y*10)) for x, y in list(r.coords)[:-1]]
            q = [pt for i, pt in enumerate(q) if i == 0 or pt != q[i-1]]
            if len(q) < 3: continue
            out.append("M%d %d" % q[0] + "l" + " ".join("%d %d" % (q[i][0]-q[i-1][0], q[i][1]-q[i-1][1]) for i in range(1, len(q))) + "z")
    return "".join(out).replace(" -", "-")
def closed(d): return d

# the five boroughs, clipped to the shoreline (piers included)
r = shapefile.Reader(os.path.join(SRC, "nycehs", "nybb_20a", "nybb")); parts_all = []
for sh in r.shapes():
    pts = np.array(sh.points); idx = list(sh.parts) + [len(pts)]; outers, holes = [], []
    for i in range(len(idx) - 1):
        raw = pts[idx[i]:idx[i+1]]
        if len(raw) < 4: continue
        ring = sp_xy(raw)
        (holes if LinearRing(raw).is_ccw else outers).append(ring)     # shapefile outer rings run clockwise
    for o in outers:
        P = Polygon(o); parts_all.append(Polygon(o, [h for h in holes if P.contains(Point(h[0]))]))
NYC = unary_union([make_valid(p) for p in parts_all])

# land outside the city from OpenStreetMap, with the New Jersey shore redrawn from NYC Planning's shoreline survey
osm = json.load(open(os.path.join(SRC, "lands", "package", "map.geo.json")))["geometries"][0]["coordinates"]
bb = (-74.32, 40.44, -73.62, 41.02); osm_parts = []
for poly in osm:
    ext = poly[0]; xs = [p[0] for p in ext]; ys = [p[1] for p in ext]
    if max(xs) < bb[0] or min(xs) > bb[2] or max(ys) < bb[1] or min(ys) > bb[3]: continue
    c = make_valid(shapely.clip_by_rect(Polygon(ext), *bb))      # outer ring only: drops inland lakes
    if not c.is_empty: osm_parts.append(transform(lambda lon, lat, z=None: xy(lat, lon), c))
OSM = unary_union(osm_parts)
CTX = OSM.difference(NYC.buffer(0.5))
shore = []
for g in rda("nyc_shoclip_sf")["geometry"]:
    arrs = [np.array(g)] if np.array(g, dtype=object).ndim == 2 and not isinstance(g, list) else [np.array(x) for x in g]
    for a in arrs:
        if a.ndim == 2 and len(a) >= 2: shore.append(LineString(sp_xy(a)))
def refine(ctx, R, B=0.7):     # inside box R, rebuild the land edge from the shoreline survey
    barrier = unary_union([l.buffer(B) for l in shore if l.intersects(R)] + [NYC.buffer(0.6)])
    pcs = R.difference(barrier); pcs = list(getattr(pcs, "geoms", [pcs])); inner = ctx.buffer(-1)
    land = [p for p in pcs if inner.contains(p.representative_point()) or (ctx.contains(p.representative_point()) and p.area < 50)]
    det = unary_union(land).buffer(B).intersection(R).difference(NYC)
    return unary_union([ctx.difference(R), det])
CTX = refine(CTX, box(250, 100, 560, 720))     # Hudson waterfront: Edgewater, Hoboken, Jersey City, Bayonne

# parks, cemeteries and airports from the Neighborhood Tabulation Areas, plus the small parks the street grid encloses
nta = rda("nyc_nta20_sf")
def nta_geom(row):
    polys = []
    for poly in row["geometry"]:
        rings = [sp_xy(np.array(rg)) for rg in poly]
        if len(rings[0]) >= 4: polys.append(make_valid(Polygon(rings[0], [r for r in rings[1:] if len(r) >= 4])))
    return unary_union(polys)
PARK, CEM, AIR = [], [], []
for _, row in nta.iterrows():
    t, n = str(row["nta_type"]), str(row["nta_name"])
    if t == "9" and "Jamaica Bay" not in n: PARK.append(nta_geom(row))
    elif t == "7": CEM.append(nta_geom(row))
    elif t == "8": AIR.append(nta_geom(row))
SMALL = [("Washington Square Park",40.7308,-73.9973),("Union Square",40.7359,-73.9906),("Madison Square Park",40.7420,-73.9880),("Bryant Park",40.7537,-73.9840),
 ("Tompkins Square Park",40.7265,-73.9818),("City Hall Park",40.7127,-74.0068),("Columbus Park",40.7158,-73.9998),("Seward Park",40.7146,-73.9894),("Sara D. Roosevelt Park",40.7200,-73.9922),
 ("Gramercy Park",40.7379,-73.9859),("Marcus Garvey Park",40.8045,-73.9440),("Morningside Park",40.8050,-73.9590),("St. Nicholas Park",40.8175,-73.9465),("Jackie Robinson Park",40.8246,-73.9420),
 ("Thomas Jefferson Park",40.7935,-73.9350),("Fort Greene Park",40.6912,-73.9755),("McCarren Park",40.7210,-73.9520),("McGolrick Park",40.7245,-73.9432),("Maria Hernandez Park",40.7031,-73.9235),
 ("Herbert Von King Park",40.6897,-73.9466),("Sunset Park",40.6475,-74.0040),("Cooper Park",40.7160,-73.9370),("Travers Park",40.7556,-73.8873)]
streets_xy = [ln for k in ("hwy", "ave", "local") for ln in cls[k]]
for name, la, lo in SMALL:
    x, y = xy(la, lo); W = box(x-14, y-14, x+14, y+14)
    near = [LineString(l) for l in streets_xy if len(l) >= 2 and LineString(l).intersects(W)]
    face = [f for f in polygonize(unary_union(near)) if f.contains(Point(x, y))]
    if not face or not (0.5 < face[0].area < 200): print("no park face for", name, round(face[0].area, 1) if face else None, file=sys.stderr); continue
    PARK.append(face[0].buffer(-0.12))     # pull in from the street centrelines a little
LAND_D = closed(poly_path(NYC, 0.1)); CTX_D = closed(poly_path(CTX, 0.25))
PARK_D = closed(poly_path(unary_union(PARK).intersection(NYC), 0.12)); CEM_D = closed(poly_path(unary_union(CEM), 0.15)); AIR_D = closed(poly_path(unary_union(AIR), 0.15))

out = ("/* Base map layers, generated by tools/make_mapdata.py from US Census TIGER street centrelines, the MTA subway GTFS feed, NYC Planning boundaries and shoreline, and OpenStreetMap land (ODbL). Do not edit by hand. */\n"
       "const MAPD_ROADS = " + json.dumps(ROADS, separators=(",", ":")) + ";\n"
       "const MAPD_SUBWAY = " + json.dumps(SUBWAY, separators=(",", ":")) + ";\n"
       "const MAPD_STATIONS = " + json.dumps(STATIONS, ensure_ascii=False, separators=(",", ":")) + ";\n"
       "const MAPD_STREETS = " + json.dumps(STREETS, separators=(",", ":")) + ";\n"
       "const MAPD_LAND = " + json.dumps(LAND_D) + ";\nconst MAPD_CTX = " + json.dumps(CTX_D) + ";\nconst MAPD_PARK = " + json.dumps(PARK_D) + ";\nconst MAPD_CEM = " + json.dumps(CEM_D) + ";\nconst MAPD_AIR = " + json.dumps(AIR_D) + ";\n")
open(os.path.join(ROOT, "src", "mapdata.js"), "w").write(out)
print("land %d KB, context %d KB, parks %d KB, cemeteries %d KB, airports %d KB" % (len(LAND_D)//1024, len(CTX_D)//1024, len(PARK_D)//1024, len(CEM_D)//1024, len(AIR_D)//1024))
print("mapdata.js %d KB: roads %s, subway %d KB, %d stations, %d street lines" % (len(out)//1024, {k: len(v)//1024 for k, v in ROADS.items()}, sum(len(p) for _, p in SUBWAY)//1024, len(STATIONS), len(STREETS)))
