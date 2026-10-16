#!/usr/bin/env python3
"""Make the map's street names (src/mapnames.js) from the US Census TIGER street centrelines.

Source: git clone --depth 1 https://github.com/fillerwriter/nyc-streets fillerwriter_nyc-streets
Usage:  python3 tools/make_streetnames.py SOURCE_DIR

Each named street's pieces are joined end to end into longer lines, simplified, and stored with the name, so the map can put
one label on the middle of whatever part of each street is on screen, at any zoom. Ramps, driveways, alleys, trails and
walkways are left out.
Writes MAPD_SN = {n: [names], d: base64 data}. The data is a run of lines, each: name index (varint), point count (varint),
first point x*8, y*8 (varints), then zigzag varint deltas, in map units (the app's mapXY).
"""
import base64, json, math, os, re, sys
from collections import defaultdict
SRC = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOL = float(os.environ.get("TOL", "0.09"))   # simplification, map units (1 unit is about 55 m)
def xy(lat, lon): return ((lon+74.30)*0.758*2000, (40.95-lat)*2000)
SKIP = {"S1630","S1640","S1720","S1740","S1750","S1780","S1500","S1730","S1710"}
def dp(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy) or 1e-9
    i, dmax = 0, -1
    for k in range(1, len(pts)-1):
        p = pts[k]; d = abs(dy*(p[0]-a[0]) - dx*(p[1]-a[1])) / L
        if d > dmax: i, dmax = k, d
    if dmax <= tol: return [a, b]
    return dp(pts[:i+1], tol)[:-1] + dp(pts[i:], tol)
RENAME = {"State Rte 9a": "West Side Hwy", "Fdr Dr": "FDR Dr", "Belt Parlway": "Belt Pkwy"}
def short(n):
    n = RENAME.get(n, n); n = re.sub(r"^I- ", "I-", n)
    # numbered streets the usual way: "W 4 St" and "W 4th St" are one street, written "W 4th St"
    ordn = lambda m: m.group(1) + ("th" if 10 <= int(m.group(1)) % 100 <= 20 else {1: "st", 2: "nd", 3: "rd"}.get(int(m.group(1)) % 10, "th"))
    n = re.sub(r"\b(\d+)(?:st|nd|rd|th)?(?= (St|Ave|Av|Pl|Rd|Dr|Ter|Ct|Ln|Blvd|Way|Walk|Loop|Path)\b)", ordn, n)
    return re.sub(r"\bAve\b", "Av", n).strip()
roads = json.load(open(os.path.join(SRC, "fillerwriter_nyc-streets", "nyc-streets.geojson")))["features"]
pieces = defaultdict(list)
for f in roads:
    p, g = f["properties"], f["geometry"]; name = (p.get("FULLNAME") or "").strip()
    if not name or p.get("MTFCC") in SKIP or re.search(r"\b(Ramp|Exit|Entrance|Unnamed|Driveway|Pvt)\b", name, re.I): continue
    for part in (g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]):
        pts = [tuple(round(v*8) for v in xy(lat, lon)) for lon, lat in part]
        pts = [q for i, q in enumerate(pts) if i == 0 or q != pts[i-1]]
        if len(pts) >= 2: pieces[short(name)].append(pts)
def chains(ps):   # join pieces that share an end point into longer lines
    ends = defaultdict(list)
    for i, p in enumerate(ps): ends[p[0]].append(i); ends[p[-1]].append(i)
    used, out = set(), []
    for i in range(len(ps)):
        if i in used: continue
        used.add(i); line = list(ps[i])
        for front in (False, True):
            while True:
                e = line[0] if front else line[-1]
                nxt = [j for j in ends[e] if j not in used]
                if not nxt: break
                j = nxt[0]; used.add(j); q = ps[j]
                if front: q = q if q[-1] == e else q[::-1]; line = list(q[:-1]) + line
                else: q = q if q[0] == e else q[::-1]; line = line + list(q[1:])
        out.append(line)
    return out
def varint(n, out):
    while True:
        b = n & 0x7f; n >>= 7
        if n: out.append(b | 0x80)
        else: out.append(b); break
zz = lambda v: (v << 1) ^ (v >> 31) if v >= 0 else ((-v) << 1) - 1
names, buf, nlines, npts = [], bytearray(), 0, 0
for name in sorted(pieces):
    ls = [dp(l, TOL*8) for l in chains(pieces[name])]
    ls = [l for l in ls if sum(math.dist(l[i], l[i+1]) for i in range(len(l)-1))/8*55.6 >= 40]
    if not ls: continue
    idx = len(names); names.append(name)
    for l in ls:
        varint(idx, buf); varint(len(l), buf); varint(l[0][0], buf); varint(l[0][1], buf)
        for i in range(1, len(l)): varint(zz(l[i][0]-l[i-1][0]), buf); varint(zz(l[i][1]-l[i-1][1]), buf)
        nlines += 1; npts += len(l)
out = "/* Street names for the map, from US Census TIGER centrelines: tools/make_streetnames.py */\nconst MAPD_SN = " + json.dumps({"n": names, "d": base64.b64encode(bytes(buf)).decode()}, separators=(",", ":")) + ";\n"
open(os.path.join(ROOT, "src", "mapnames.js"), "w").write(out)
print("mapnames.js %d KB: %d names, %d lines, %d points" % (len(out)//1024, len(names), nlines, npts))
