#!/usr/bin/env python3
"""Merge a price check into the app's price data.

The twice-weekly price check researches current prices (one JSON object, keyed by camera id, in the shape the
check's instructions give), then runs this script to:
  - validate the new values (numbers, https links, plausible against launch prices),
  - add today's point to each camera's price history (kept to the last 60 checks),
  - work out which alert prices are hit and whether that is news (not already notified at that price),
  - write one file per database document, plus prices.json for the installed app and the push text.

Usage:
  python3 tools/prices.py --research research.json --current DIR --targets DIR --today YYYY-MM-DD --out OUTDIR

  --current  the "prices" collection as saved by ArtifactData list (one <doc id>.json per document); may be empty
  --targets  the "pricetargets" collection, saved the same way; may be empty
Outputs in OUTDIR: docs/<id>.json (the data to set for each document, including _status and _alerted),
prices.json (for the repository), push.txt (one notification line, or empty), summary.txt.
"""
import argparse, html, json, os, re, sys

CAMS = {  # id: (name, US launch price)
    "q343": ("Leica Q3 43", 6395), "q328": ("Leica Q3", 5995), "x100vi": ("Fujifilm X100VI", 1599),
    "griv": ("Ricoh GR IV", 1499), "griiix": ("Ricoh GR IIIx", 999), "rx1r3": ("Sony RX1R III", 5099),
    "xe5": ("Fujifilm X-E5", 1899), "m11": ("Leica M11", 8995), "a7c2": ("Sony A7C II", 2199),
}
HISTORY = 60
RENOTIFY_DAYS = 14

def load_dir(d):
    out = {}
    if d and os.path.isdir(d):
        for f in sorted(os.listdir(d)):
            if not f.endswith(".json"): continue
            try: v = json.load(open(os.path.join(d, f), encoding="utf-8"))
            except Exception as e: print("skip unreadable", f, e, file=sys.stderr); continue
            if isinstance(v, dict) and isinstance(v.get("data"), dict): v = v["data"]
            out[f[:-5]] = v
    return out

def num(v):
    if isinstance(v, bool): return None
    if isinstance(v, (int, float)) and v > 0: return int(round(v))
    if isinstance(v, str):
        m = re.sub(r"[^0-9.]", "", v)
        try: return int(round(float(m))) if m else None
        except ValueError: return None
    return None

def url(v): return v if isinstance(v, str) and v.startswith("https://") and len(v) < 600 else None
def txt(v, n=120): return html.unescape(v).strip()[:n] if isinstance(v, str) and v.strip() else None

def clean(cid, r, warn):
    launch = CAMS[cid][1]
    ok = lambda p, lo, hi: p is not None and lo * launch <= p <= hi * launch
    out = {}
    n = r.get("new") if isinstance(r.get("new"), dict) else None
    if n:
        p = num(n.get("price"))
        if ok(p, 0.4, 2.0): out["new"] = {k: v for k, v in {"price": p, "seller": txt(n.get("seller"), 40), "url": url(n.get("url")), "stock": txt(n.get("stock"), 40)}.items() if v}
        else: warn.append("%s: new price %s rejected" % (cid, n.get("price")))
    d = r.get("deal") if isinstance(r.get("deal"), dict) else None
    if d:
        p, was = num(d.get("price")), num(d.get("was"))
        if ok(p, 0.4, 2.0) and (was is None or was > p):
            ends = d.get("ends") if isinstance(d.get("ends"), str) and re.match(r"^\d{4}-\d\d-\d\d$", d.get("ends") or "") else None
            out["deal"] = {k: v for k, v in {"price": p, "was": was, "what": txt(d.get("what"), 80), "ends": ends, "seller": txt(d.get("seller"), 40), "url": url(d.get("url"))}.items() if v}
        else: warn.append("%s: deal %s rejected" % (cid, d.get("price")))
    u = r.get("used") if isinstance(r.get("used"), dict) else None
    if u:
        lo, hi = num(u.get("low")), num(u.get("high"))
        if ok(lo, 0.25, 1.6):
            out["used"] = {k: v for k, v in {"low": lo, "high": hi if hi and hi >= lo and ok(hi, 0.25, 2.0) else None, "seller": txt(u.get("seller"), 40), "url": url(u.get("url")), "cond": txt(u.get("cond"), 30), "n": num(u.get("n"))}.items() if v}
        else: warn.append("%s: used price %s rejected" % (cid, u.get("low")))
    s = r.get("sold") if isinstance(r.get("sold"), dict) else None
    if s:
        m = num(s.get("median"))
        if ok(m, 0.25, 1.8): out["sold"] = {k: v for k, v in {"median": m, "low": num(s.get("low")), "high": num(s.get("high")), "n": num(s.get("n")), "url": url(s.get("url")), "via": "search" if s.get("verified") == "search" else None}.items() if v}
        else: warn.append("%s: sold median %s rejected" % (cid, s.get("median")))
    e = r.get("ebay") if isinstance(r.get("ebay"), dict) else None
    if e:
        lo, hi = num(e.get("low")), num(e.get("high"))
        if ok(lo, 0.25, 1.6):
            out["ebay"] = {k: v for k, v in {"low": lo, "high": hi if hi and hi >= lo and ok(hi, 0.25, 2.0) else None, "cond": txt(e.get("cond"), 40), "n": num(e.get("n")), "url": url(e.get("url")), "via": "search" if e.get("verified") == "search" else None}.items() if v}
        else: warn.append("%s: eBay used price %s rejected" % (cid, e.get("low")))
    if txt(r.get("notes"), 200): out["notes"] = txt(r.get("notes"), 200)
    return out

def best_new(d):
    if d.get("deal", {}).get("price"): return d["deal"]["price"]
    return d.get("new", {}).get("price")

def hit(d, t):
    if not t or not num(t.get("target")): return None
    target, kind, opts = num(t.get("target")), t.get("kind") or "any", []
    if kind != "used" and best_new(d): src = d.get("deal") or d.get("new"); opts.append(("new", best_new(d), src.get("seller"), src.get("url")))
    if kind != "new" and d.get("used", {}).get("low"): opts.append(("used", d["used"]["low"], d["used"].get("seller"), d["used"].get("url")))
    if kind != "new" and d.get("ebay", {}).get("low"): opts.append(("used", d["ebay"]["low"], "eBay", d["ebay"].get("url")))
    opts.sort(key=lambda o: o[1])
    return {"kind": opts[0][0], "price": opts[0][1], "seller": opts[0][2], "url": opts[0][3], "target": target} if opts and opts[0][1] <= target else None

def days_between(a, b):
    from datetime import date
    try: return (date.fromisoformat(b) - date.fromisoformat(a)).days
    except Exception: return 999

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--research", required=True); ap.add_argument("--current"); ap.add_argument("--targets")
    ap.add_argument("--today", required=True); ap.add_argument("--out", required=True)
    a = ap.parse_args()
    research = json.load(open(a.research, encoding="utf-8"))
    cur, targets = load_dir(a.current), load_dir(a.targets)
    alerted = cur.get("_alerted", {}) if isinstance(cur.get("_alerted"), dict) else {}
    os.makedirs(os.path.join(a.out, "docs"), exist_ok=True)
    warn, docs, updated, missing = [], {}, [], []
    for cid in CAMS:
        prev = cur.get(cid, {}) if isinstance(cur.get(cid), dict) else {}
        r = research.get(cid) if isinstance(research.get(cid), dict) else None
        new = clean(cid, r, warn) if r else {}
        if new.get("new") or new.get("used") or new.get("deal") or new.get("ebay") or new.get("sold"):
            doc = dict(new); doc["checked"] = a.today; updated.append(cid)
        else:
            doc = {k: v for k, v in prev.items() if k != "history"}; missing.append(cid)
            if doc: doc["notes"] = "Not confirmed on " + a.today + "; showing the check of " + str(prev.get("checked", "earlier")) + "."
        hist = [h for h in prev.get("history", []) if isinstance(h, dict) and h.get("d") != a.today] if isinstance(prev.get("history"), list) else []
        if cid in updated:
            pt = {"d": a.today}
            if best_new(doc): pt["new"] = best_new(doc)
            if doc.get("used", {}).get("low"): pt["used"] = doc["used"]["low"]
            hist.append(pt)
        if hist: doc["history"] = hist[-HISTORY:]
        if doc: docs[cid] = doc
    # alerts: news when hit and not already notified at this price or lower in the last two weeks
    news, new_alerted = [], {}
    for cid, d in docs.items():
        h = hit(d, targets.get(cid))
        if not h: continue
        last = alerted.get(cid)
        fresh = not last or not num(last.get("price")) or h["price"] < num(last["price"]) or days_between(last.get("at", ""), a.today) >= RENOTIFY_DAYS
        new_alerted[cid] = {"price": h["price"], "kind": h["kind"], "at": a.today if fresh else (last or {}).get("at", a.today)}
        if fresh: news.append((cid, h))
    push = ""
    if news:
        news.sort(key=lambda x: x[1]["price"] / x[1]["target"])
        cid, h = news[0]
        push = "%s %s %s%s, at your $%s alert" % (CAMS[cid][0], h["kind"], "${:,}".format(h["price"]), " at " + h["seller"] if h.get("seller") else "", "{:,}".format(h["target"]))
        if len(news) > 1: push += " (+%d more)" % (len(news) - 1)
        push = push[:178]
    deals = [c for c, d in docs.items() if d.get("deal")]
    status = {"checked": a.today, "summary": "%d of %d cameras updated%s%s." % (len(updated), len(CAMS),
              "; deals on " + ", ".join(CAMS[c][0] for c in deals) if deals else "; no deals",
              "; not confirmed: " + ", ".join(CAMS[c][0] for c in missing) if missing else "")[:280]}
    docs["_status"] = status; docs["_alerted"] = new_alerted
    for k, v in docs.items():
        json.dump(v, open(os.path.join(a.out, "docs", k + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    pub = {k: v for k, v in docs.items() if k != "_alerted"}
    pub["_targets"] = {k: {"target": num(v.get("target")), "kind": v.get("kind") or "any"} for k, v in targets.items() if isinstance(v, dict) and num(v.get("target"))}
    json.dump(pub, open(os.path.join(a.out, "prices.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(a.out, "push.txt"), "w").write(push)
    summ = [status["summary"]] + ["warning: " + w for w in warn] + ["alert: %s %s $%s (target $%s)%s" % (CAMS[c][0], h["kind"], h["price"], h["target"], "" if (c, h) in news else " already notified") for c, h in [(c, hit(docs[c], targets.get(c))) for c in new_alerted]]
    summ.append("push: " + (push or "none"))
    open(os.path.join(a.out, "summary.txt"), "w").write("\n".join(summ) + "\n")
    print("\n".join(summ))

if __name__ == "__main__":
    main()
