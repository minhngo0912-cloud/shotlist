#!/usr/bin/env python3
"""Build Shot List from src/.

Outputs
  index.html, sw.js      the installable app served by GitHub Pages (committed)
  build/claude.html      the Claude artifact version (not committed; publish it to the artifact)

The two versions share everything except the live-data block: the artifact reads events and
weather from its Claude database, the installed app fetches events.json and Open-Meteo directly.

Usage: python3 tools/build.py      (run from the repository root, or anywhere)
"""
import hashlib, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

def read(name):
    with open(os.path.join(SRC, name), encoding="utf-8") as f:
        return f.read()

def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        sys.exit("build: expected one '%s' in %s, found %d" % (old[:50], label, n))
    return text.replace(old, new)

def page(live):
    app = read("mapdata.js") + replace_once(read("app.js"), "/*@LIVE@*/", live, "app.js")
    return read("head.html") + "<style>" + read("styles.css") + "</style>" + read("markup.html") + "<script>" + app + "</script>" + read("tail.html")

def build():
    # Claude artifact
    claude = page(read("live-claude.js"))
    os.makedirs(os.path.join(ROOT, "build"), exist_ok=True)
    with open(os.path.join(ROOT, "build", "claude.html"), "w", encoding="utf-8") as f:
        f.write(claude)

    # Installed app
    body = page(read("live-pwa.js"))
    body = replace_once(body, "Saved and shot marks are kept in this browser on this device only.",
                        "Saved and shot marks are kept on this device only. Weather data by Open-Meteo.com.", "page")
    body = replace_once(body, "<title>Shot List</title>\n", "", "page")
    body = replace_once(body, "const PHOTOS_INLINE = false;", "const PHOTOS_INLINE = true;", "page")
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(read("pwa-head.html") + body + "\n</body>\n</html>\n")
    ver = hashlib.sha1(body.encode()).hexdigest()[:10]
    with open(os.path.join(ROOT, "sw.js"), "w", encoding="utf-8") as f:
        f.write(read("sw.template.js").replace("@VERSION@", ver))
    print("built", ver, "index.html %d bytes, build/claude.html %d bytes" % (len(body), len(claude)))

if __name__ == "__main__":
    build()
