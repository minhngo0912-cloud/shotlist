"""Bridges and tunnels for the map: the named road lines that cross water, from the same TIGER street file as the roads.
Appends MAPD_BRIDGES to src/mapdata.js (replacing an earlier line). Run after make_mapdata.py, with the same geo/ checkouts.

  MAPD_BRIDGES  [[name, kind, [[lat,lon],...]], ...]   kind is "bridge" or "tunnel"; one entry per crossing
"""
import json, math, os, re, sys
from collections import defaultdict
import numpy as np, shapefile, shapely
from shapely.geometry import LineString, Polygon, LinearRing, Point, box
from shapely.ops import unary_union, transform
from shapely.validation import make_valid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "geo")

from pyproj import Transformer
SP = Transformer.from_crs("EPSG:2263", "EPSG:4326", always_xy=True)     # the borough file is in State Plane feet
def xy(lat, lon): return ((lon + 74.30) * 0.758 * 2000, (40.95 - lat) * 2000)
def sp_xy(arr):
    lon, lat = SP.transform(arr[:, 0], arr[:, 1]); return [xy(a, b) for a, b in zip(lat, lon)]
def ll_xy(part): return [xy(la, lo) for lo, la in part]

# land: the five boroughs clipped to the shoreline, plus OpenStreetMap land around them
r = shapefile.Reader(os.path.join(SRC, "nycehs", "nybb_20a", "nybb")); parts_all = []
for sh in r.shapes():
    pts = np.array(sh.points); idx = list(sh.parts) + [len(pts)]; outers, holes = [], []
    for i in range(len(idx) - 1):
        raw = pts[idx[i]:idx[i+1]]
        if len(raw) < 4: continue
        ring = sp_xy(raw)
        (holes if LinearRing(raw).is_ccw else outers).append(ring)
    for o in outers:
        P = Polygon(o); parts_all.append(Polygon(o, [h for h in holes if P.contains(Point(h[0]))]))
NYC = unary_union([make_valid(p) for p in parts_all])
# land outside the city: the map's own context layer (MAPD_CTX in src/mapdata.js), which make_mapdata.py already cut along the rivers
def path_polys(d):
    # tokens come as "M x y l dx dy dx dy ..."
    rings, cur, mode, nums, x, y = [], [], None, [], 0, 0
    for tok in re.findall(r"[Ml]|-?\d+", d):
        if tok in "Ml":
            if mode == "l" and cur: rings.append(cur); cur = []
            mode = tok; nums = []; continue
        nums.append(int(tok))
        if len(nums) == 2:
            if mode == "M": x, y = nums
            else: x, y = x + nums[0], y + nums[1]
            cur.append((x / 10, y / 10)); nums = []
    if cur: rings.append(cur)
    polys = [Polygon(r) for r in rings if len(r) >= 4]
    polys = [make_valid(p) for p in polys if p.is_valid or True]
    # evenodd: rings inside another ring are holes
    out = []
    for i, P in enumerate(polys):
        inside = sum(1 for j, Q in enumerate(polys) if i != j and Q.contains(P.representative_point()))
        if inside % 2 == 0: out.append(P)
    holes = [P for i, P in enumerate(polys) if sum(1 for j, Q in enumerate(polys) if i != j and Q.contains(P.representative_point())) % 2 == 1]
    return unary_union(out).difference(unary_union(holes)) if holes else unary_union(out)
mapdata = open(os.path.join(ROOT, "src", "mapdata.js")).read()
CTX = path_polys(json.loads(re.search(r"const MAPD_CTX = (\".*?\");", mapdata).group(1)))
OSM = CTX
LAND = unary_union([NYC, OSM]).buffer(0.12)     # a little slack so quay walls and pier roads do not count as crossings

roads = json.load(open(os.path.join(SRC, "fillerwriter_nyc-streets", "nyc-streets.geojson")))["features"]
WORDS = {"Brg": "Bridge", "Tunl": "Tunnel", "Mem": "Memorial", "Vets": "Veterans", "Pkwy": "Parkway", "Hts": "Heights", "Ave": "Avenue", "St": "Street", "Blvd": "Boulevard", "Expy": "Expressway", "Rd": "Road", "Dr": "Drive"}
RENAME = {"Verrazano Bridge": "Verrazzano-Narrows Bridge", "Triborough Bridge": "RFK (Triborough) Bridge", "Brooklyn Battery Tunnel": "Hugh L. Carey Tunnel", "Queensboro Bridge": "Queensboro (59th Street) Bridge", "Crossbay Boulevard": "Cross Bay Bridge"}
def pretty(n): n = " ".join(WORDS.get(w, w) for w in n.split()); return RENAME.get(n, n)
NAMED = re.compile(r"\bBrg\b|Bridge|\bTunl\b|Tunnel")
# every piece of named road over water; interstates count too, because the big bridges and tunnels carry on under a route number
segs = []
for f in roads:
    p, g = f["properties"], f["geometry"]
    mt, name = p.get("MTFCC"), (p.get("FULLNAME") or "").strip()
    if not name or mt not in ("S1100", "S1200", "S1400", "S1630", "S1640"): continue
    parts = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
    for part in parts:
        ln = LineString(ll_xy(part))
        if ln.length < 0.2 or LAND.contains(ln): continue
        over = ln.difference(LAND)
        for seg in getattr(over, "geoms", [over]):
            if seg.geom_type == "LineString" and seg.length >= 0.3: segs.append((name, seg))
# join the pieces into whole crossings, whatever they are called along the way
merged = shapely.line_merge(unary_union([sg for _, sg in segs]))
lines = [l for l in getattr(merged, "geoms", [merged]) if l.geom_type == "LineString"]
def to_latlon(x, y): return (round(40.95 - y / 2000, 5), round(x / (0.758 * 2000) - 74.30, 5))
# the street file stops at the county line in mid-river, so: join lines whose loose ends nearly meet, then run any end still
# in the water straight on until it reaches the shore (the New Jersey side of the Hudson crossings)
def loose(ln): return [i for i, c in enumerate([ln.coords[0], ln.coords[-1]]) if LAND.distance(Point(c)) > 0.6]
changed = True
while changed:
    changed = False
    for i, A in enumerate(lines):
        for ia in loose(A):
            pa = Point(A.coords[0] if ia == 0 else A.coords[-1])
            best = None
            for j, B in enumerate(lines):
                if j == i: continue
                for ib in loose(B):
                    pb = Point(B.coords[0] if ib == 0 else B.coords[-1]); d = pa.distance(pb)
                    if d < 1.2 and (best is None or d < best[0]): best = (d, j, ib)
            if best:
                d, j, ib = best; B = lines[j]
                ca = list(A.coords) if ia == 1 else list(A.coords)[::-1]
                cb = list(B.coords) if ib == 0 else list(B.coords)[::-1]
                lines[i] = LineString(ca + cb); lines.pop(j); changed = True; break
        if changed: break
def extend(ln):
    c = list(ln.coords)
    for end in (0, 1):
        p = Point(c[0] if end == 0 else c[-1])
        if LAND.distance(p) <= 0.6: continue
        q = c[1] if end == 0 else c[-2]; dx, dy = p.x - q[0], p.y - q[1]; L = math.hypot(dx, dy) or 1; dx, dy = dx / L, dy / L
        hit = None
        for k in range(1, 400):
            t = Point(p.x + dx * k * 0.1, p.y + dy * k * 0.1)
            if LAND.contains(t): hit = t; break
        if hit is None: return None
        if end == 0: c.insert(0, (hit.x, hit.y))
        else: c.append((hit.x, hit.y))
    return LineString(c)
OUT = []
for ln in lines:
    if ln.length < 1.6: continue
    ln = extend(ln)
    if ln is None: continue
    a, b = Point(ln.coords[0]), Point(ln.coords[-1]); mid = ln.interpolate(0.5, normalized=True)
    if LAND.distance(a) > 0.6 or LAND.distance(b) > 0.6: continue          # starts and ends on land
    # the name: a bridge or tunnel name carried by the pieces along it, else the longest-running name
    along = defaultdict(float)
    for name, sg in segs:
        if sg.distance(ln) < 0.05: along[name] += sg.length
    if not along: continue
    named = [n for n in along if NAMED.search(n)]
    name = max(named, key=lambda n: along[n]) if named else max(along, key=lambda n: along[n])
    if not named: continue     # only crossings that carry a bridge or tunnel name
    if named and not NAMED.search(name): continue
    kind = "tunnel" if re.search(r"\bTunl\b|Tunnel", name) else "bridge"
    OUT.append([pretty(name), kind, [list(to_latlon(x, y)) for x, y in ln.simplify(0.06).coords], round(ln.length, 2)])
OUT.sort(key=lambda o: -o[3])
keep = []
for o in OUT:
    if any(k[0] == o[0] and LineString([xy(a, b) for a, b in o[2]]).distance(LineString([xy(a, b) for a, b in k[2]])) < 0.8 for k in keep): continue
    keep.append(o)
keep = [o for o in keep if not (re.match(r"^(I- |State )", o[0]) and any(NAMED.search(k[0]) and LineString([xy(a, b) for a, b in o[2]]).distance(LineString([xy(a, b) for a, b in k[2]])) < 3 for k in keep))]
keep = [[n, k, c] for n, k, c, L in keep if n != "Lincoln Tunnel"]     # the Lincoln Tunnel line stops at the portal, so it is placed by hand below
# Newtown Creek and the Harlem River Ship Canal are not water in the borough file, so these are placed by hand
keep += [["Lincoln Tunnel", "tunnel", [[40.7603, -74.0082], [40.7641, -74.0192]]], ["Pulaski Bridge", "bridge", [[40.7352, -73.9536], [40.7372, -73.9537], [40.7405, -73.9537], [40.7428, -73.9536]]],
         ["Kosciuszko Bridge", "bridge", [[40.7243, -73.9318], [40.7273, -73.9288], [40.7303, -73.9257]]]]
print(len(keep), "crossings:", ", ".join(sorted(set(n for n, k, c in keep)))[:1500], file=sys.stderr)
path = os.path.join(ROOT, "src", "mapdata.js"); s = open(path).read()
s = re.sub(r"\nconst MAPD_BRIDGES = .*?;\n", "\n", s)
s = s.rstrip("\n") + "\nconst MAPD_BRIDGES = " + json.dumps(keep, separators=(",", ":")) + ";\n"
open(path, "w").write(s)
print("bridges", len(json.dumps(keep)) // 1024, "KB", file=sys.stderr)
