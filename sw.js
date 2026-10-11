// Offline support. The app files are cached on first visit; each later visit refreshes them in the background.
const CACHE="shotlist-a577a3e3a6";
const SHELL=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=="shotlist-photos").map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method==="GET" && u.hostname==="upload.wikimedia.org"){   // reference photos: keep a copy once seen, so they show offline
    e.respondWith(caches.open("shotlist-photos").then(async c=>{ const hit=await c.match(e.request); if(hit) return hit;
      const r=await fetch(e.request); if(r.ok||r.type==="opaque") c.put(e.request,r.clone()); return r; }));
    return;
  }
  if(e.request.method!=="GET" || u.origin!==location.origin) return;   // weather and other sites go straight to the network
  if(u.pathname.endsWith("/events.json")){   // always try for the newest events, fall back to the stored copy offline
    e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put("events.json",cp)); } return r; }).catch(()=>caches.match("events.json")));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{ if(r.ok) c.put(e.request,r.clone()); return r; }).catch(()=>hit);
    return hit || net;
  }));
});
