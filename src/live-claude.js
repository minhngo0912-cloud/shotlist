(async()=>{ try{
  const db = await (window.claude && window.claude.use ? window.claude.use("db") : null); if(!db) return;
  db.collection("weather").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const v=d.data(); if(v) m[d.id]=v; }); WEATHER=m; renderNow(); if(state.view==="today") renderToday(); if(state.view==="shoot"&&state.tab==="settings"&&openTip===null&&document.activeElement.id!=="camera") renderCard(); }, ()=>{});
  PRICE_DB=db;
  db.collection("prices").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const v=d.data(); if(v) m[d.id]=v; }); PRICE_DOCS=m; rerenderPrices(); }, ()=>{});
  db.collection("pricetargets").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const v=d.data(); if(v&&v.target) m[d.id]=v; }); PRICE_TARGETS=m; rerenderPrices(); }, ()=>{});
  db.collection("events").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const v=d.data(); if(v) m[d.id]=v; }); EVENT_DOCS=m; if(state.view==="events") renderEvents(); if(state.view==="today") renderToday(); }, ()=>{});
}catch(e){} })();