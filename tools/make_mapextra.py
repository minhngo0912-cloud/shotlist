#!/usr/bin/env python3
"""Make src/mapextra.js from src/mapdata.js: long straight street runs, and ferry routes.

  MAPD_RUNS    straight stretches of street at least ~550 m long, as [x0,y0,x1,y1] in map units x10.
               The app works out, for any day, which of them line up with the low sun ("light down the street").
  MAPD_FERRY   NYC Ferry and Staten Island Ferry landings, and the path on the water between each pair of
               landings a route sails between. Paths are found on a raster of the land, keeping to the middle
               of channels, so they never cross land.

Landing positions are placed by hand from the operators' landing pages; route orders are from ferry.nyc
(routes in effect from December 8, 2025) and the Staten Island Ferry.

Usage: python3 tools/make_mapextra.py      (needs numpy and scipy)
"""
import json, math, os, re, heapq
import numpy as np
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, "src", "mapdata.js"), encoding="utf-8").read()

def const(name):
    m = re.search(r"const %s = (.*?);\n" % name, SRC, re.S)
    return json.loads(m.group(1))

def polylines(d):
    """Parse an 'M x y l dx dy ...' path (absolute M, relative l) into lists of points."""
    out, cur, x, y = [], None, 0, 0
    for cmd, args in re.findall(r"([Mlz])([^Mlz]*)", d):
        n = [int(v) for v in re.findall(r"-?\d+", args)]
        if cmd == "M":
            x, y = n[0], n[1]; cur = [(x, y)]; out.append(cur)
            for i in range(2, len(n) - 1, 2):   # implicit lineto after M is relative in our data only via l, so ignore
                pass
        elif cmd == "l":
            for i in range(0, len(n) - 1, 2):
                x += n[i]; y += n[i + 1]; cur.append((x, y))
        elif cmd == "z" and cur:
            cur.append(cur[0])
    return out

# ---------------------------------------------------------------- straight street runs
def runs():
    roads = const("MAPD_ROADS")
    lines = polylines(roads["ave"]) + polylines(roads["local"])
    edges, adj = [], {}
    for pl in lines:
        for a, b in zip(pl, pl[1:]):
            if a == b: continue
            k = len(edges); edges.append((a, b))
            adj.setdefault(a, []).append(k); adj.setdefault(b, []).append(k)
    used = [False] * len(edges)
    TOL = 2.6      # x10 units: every corner of the run within ~14 m of the straight line
    MINLEN = 100   # x10 units: ~550 m

    def straight(pts):
        (ax, ay), (bx, by) = pts[0], pts[-1]; L = math.hypot(bx - ax, by - ay)
        if L == 0: return False
        return all(abs((px - ax) * (by - ay) - (py - ay) * (bx - ax)) / L <= TOL for px, py in pts)

    def extend(pts, at_end):
        while True:
            node = pts[-1] if at_end else pts[0]
            prev = pts[-2] if at_end else pts[1]
            ref = (pts[-1][0] - pts[0][0], pts[-1][1] - pts[0][1]) if at_end else (pts[0][0] - pts[-1][0], pts[0][1] - pts[-1][1])
            if math.hypot(*ref) < 30: ref = (node[0] - prev[0], node[1] - prev[1])
            rl = math.hypot(*ref); best = None
            for k in adj.get(node, []):
                if used[k]: continue
                a, b = edges[k]; nxt = b if a == node else a
                v = (nxt[0] - node[0], nxt[1] - node[1]); vl = math.hypot(*v)
                if vl == 0: continue
                cos = (v[0] * ref[0] + v[1] * ref[1]) / (vl * rl)
                if cos < math.cos(math.radians(7)): continue
                cand = pts + [nxt] if at_end else [nxt] + pts
                if not straight(cand): continue
                if best is None or cos > best[0]: best = (cos, k, nxt)
            if not best: return pts
            used[best[1]] = True
            pts = pts + [best[2]] if at_end else [best[2]] + pts

    out = []
    order = sorted(range(len(edges)), key=lambda k: -math.dist(*edges[k]))   # start from long blocks
    for k in order:
        if used[k]: continue
        used[k] = True; a, b = edges[k]
        pts = extend(extend([a, b], True), False)
        if math.dist(pts[0], pts[-1]) >= MINLEN:
            out.append([pts[0][0], pts[0][1], pts[-1][0], pts[-1][1]])
    return out

# ---------------------------------------------------------------- ferries
mapXY = lambda lat, lon: ((lon + 74.30) * 0.758 * 2000 * 10, (40.95 - lat) * 2000 * 10)   # x10 units

LANDINGS = {
    "pier11":  ["Wall St/Pier 11", 40.70325, -74.00560],
    "dumbo":   ["DUMBO/Fulton Ferry", 40.70365, -73.99470],
    "swburg":  ["South Williamsburg", 40.70960, -73.96950],
    "nwburg":  ["North Williamsburg", 40.72110, -73.96270],
    "gpoint":  ["Greenpoint", 40.73060, -73.96120],
    "e34":     ["East 34th Street", 40.74390, -73.97130],
    "hps":     ["Hunters Point South", 40.74060, -73.96060],
    "lic":     ["Long Island City", 40.74560, -73.95930],
    "rooseve": ["Roosevelt Island", 40.75580, -73.95250],
    "astoria": ["Astoria", 40.77170, -73.93530],
    "e90":     ["East 90th Street", 40.77790, -73.94260],
    "navyyd":  ["Brooklyn Navy Yard", 40.70180, -73.97420],
    "stuy":    ["Stuyvesant Cove", 40.73370, -73.97400],
    "corlear": ["Corlears Hook", 40.71160, -73.97850],
    "soundv":  ["Soundview", 40.80500, -73.84860],
    "throgs":  ["Throgs Neck (Ferry Point Park)", 40.80830, -73.82700],
    "bat":     ["Sunset Park/BAT", 40.64560, -74.02560],
    "rockaw":  ["Rockaway", 40.58440, -73.82210],
    "pier6":   ["Atlantic Ave/BBP Pier 6", 40.69290, -74.00150],
    "redhook": ["Red Hook", 40.68350, -74.01250],
    "govisl":  ["Governors Island", 40.69280, -74.01330],
    "bayrdg":  ["Bay Ridge", 40.63620, -74.03720],
    "stgeo":   ["St. George", 40.64390, -74.07250],
    "bpc":     ["Battery Park City", 40.71460, -74.01850],
    "mtwest":  ["Midtown West/Pier 79", 40.76090, -74.00340],
    "whitehl": ["Whitehall Terminal", 40.70120, -74.01310],
    "sigeorge":["St. George Terminal", 40.64370, -74.07340],
}
ROUTES = {
    "er":   ["pier11", "dumbo", "swburg", "nwburg", "gpoint", "e34", "hps"],
    "ast":  ["pier11", "navyyd", "e34", "lic", "rooseve", "astoria", "e90"],
    "sb":   ["e34", "corlear", "pier11", "pier6", "redhook", "govisl"],
    "rws":  ["rockaw", "bat", "pier11", "stuy", "e34", "e90", "soundv", "throgs"],
    "sg":   ["pier11", "pier6", "bayrdg", "stgeo", "bpc", "mtwest"],
    "sif":  ["whitehl", "sigeorge"],
}

def ferries():
    land = polylines(const("MAPD_LAND")) + polylines(const("MAPD_CTX"))
    xs = [p[0] for pl in land for p in pl]; ys = [p[1] for pl in land for p in pl]
    S = 4.0   # x10 units per raster cell (~22 m)
    x0, y0 = min(xs) - 200, min(ys) - 200
    W, H = int((max(xs) - x0) / S) + 200, int((max(ys) - y0) / S) + 200
    from PIL import Image, ImageDraw
    img = Image.new("L", (W, H), 0); dr = ImageDraw.Draw(img)
    # even-odd fill of all rings: land polygons may contain holes (lakes)
    for pl in land:
        if len(pl) < 3: continue
        ring = Image.new("L", (W, H), 0); ImageDraw.Draw(ring).polygon([((x - x0) / S, (y - y0) / S) for x, y in pl], fill=1)
        img = Image.fromarray((np.asarray(img) ^ np.asarray(ring)).astype(np.uint8))
    landm = np.asarray(img).astype(bool)
    water = ~landm
    dist = ndimage.distance_transform_edt(water)          # cells to the nearest land
    cost = 1.0 + 6.0 / (1.0 + dist)                        # prefer the middle of a channel
    cost[~water] = np.inf

    def cell(lat, lon):
        x, y = mapXY(lat, lon); cx, cy = int((x - x0) / S), int((y - y0) / S)
        if water[cy, cx]: return (cy, cx)
        best = None
        for r in range(1, 60):
            for dy in range(-r, r + 1):
                for dx in range(-r, r + 1):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < H and 0 <= xx < W and water[yy, xx] and dist[yy, xx] >= 1.5:
                        d = dx * dx + dy * dy
                        if best is None or d < best[0]: best = (d, (yy, xx))
            if best: return best[1]
        raise SystemExit("no water near %s,%s" % (lat, lon))

    NB = [(-1, 0, 1), (1, 0, 1), (0, -1, 1), (0, 1, 1), (-1, -1, 1.4142), (-1, 1, 1.4142), (1, -1, 1.4142), (1, 1, 1.4142)]
    def path(a, b):
        ga = np.full((H, W), np.inf); ga[a] = 0; prev = {}
        hq = [(0, 0, a)]; ty, tx = b
        while hq:
            f, g, (y, x) = heapq.heappop(hq)
            if (y, x) == b: break
            if g > ga[y, x]: continue
            for dy, dx, w in NB:
                yy, xx = y + dy, x + dx
                if not (0 <= yy < H and 0 <= xx < W) or not water[yy, xx]: continue
                ng = g + w * (cost[y, x] + cost[yy, xx]) / 2
                if ng < ga[yy, xx]:
                    ga[yy, xx] = ng; prev[(yy, xx)] = (y, x)
                    heapq.heappush(hq, (ng + math.hypot(ty - yy, tx - xx), ng, (yy, xx)))
        out = [b]
        while out[-1] != a: out.append(prev[out[-1]])
        return out[::-1]

    def clear(p, q):
        n = int(max(abs(p[0] - q[0]), abs(p[1] - q[1])) * 2) + 1
        for i in range(n + 1):
            y = p[0] + (q[0] - p[0]) * i / n; x = p[1] + (q[1] - p[1]) * i / n
            if not water[int(round(y)), int(round(x))]: return False
        return True

    def simplify(pts):
        # Douglas-Peucker, but never across land
        def rec(i, j):
            a, b = pts[i], pts[j]; L = math.dist(a, b) or 1; worst, wi = 0, -1
            for k in range(i + 1, j):
                p = pts[k]; d = abs((p[1] - a[1]) * (b[0] - a[0]) - (p[0] - a[0]) * (b[1] - a[1])) / L
                if d > worst: worst, wi = d, k
            if (worst <= 2.5 and clear(a, b)) or wi < 0: return [i, j]
            return rec(i, wi)[:-1] + rec(wi, j)
        return [pts[k] for k in rec(0, len(pts) - 1)]

    legs = {}
    for r, stops in ROUTES.items():
        for a, b in zip(stops, stops[1:]):
            key = "-".join(sorted([a, b]))
            if key in legs: continue
            la, lb = LANDINGS[a], LANDINGS[b]
            ca, cb = cell(la[1], la[2]), cell(lb[1], lb[2])
            p = simplify(path(ca, cb))
            pts = [mapXY(la[1], la[2])] + [(x0 + c[1] * S + S / 2, y0 + c[0] * S + S / 2) for c in p] + [mapXY(lb[1], lb[2])]
            if a != sorted([a, b])[0]: pts = pts[::-1]
            legs[key] = [[round(x), round(y)] for x, y in pts]
            print("  leg", key, len(pts), "points")
    return {"landings": LANDINGS, "routes": ROUTES, "legs": legs}

if __name__ == "__main__":
    R = runs(); print("straight runs:", len(R))
    F = ferries()
    with open(os.path.join(ROOT, "src", "mapextra.js"), "w", encoding="utf-8") as f:
        f.write("/* Generated by tools/make_mapextra.py from src/mapdata.js. Do not edit by hand. */\n")
        f.write("const MAPD_RUNS = " + json.dumps(R, separators=(",", ":")) + ";\n")
        f.write("const MAPD_FERRY = " + json.dumps(F, separators=(",", ":")) + ";\n")
    print("wrote src/mapextra.js", os.path.getsize(os.path.join(ROOT, "src", "mapextra.js")), "bytes")
