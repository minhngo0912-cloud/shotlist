(async()=>{ try{
  const db = await (window.claude && window.claude.use ? window.claude.use("db") : null); if(!db) return;
  db.collection("weather").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const v=d.data(); if(v) m[d.id]=v; }); WEATHER=m; renderNow(); if(state.view==="shoot"&&state.tab==="settings"&&openTip===null&&document.activeElement.id!=="camera") renderCard(); }, ()=>{});
  db.collection("events").onSnapshot(snap=>{ const m={}; snap.docs.forEach(d=>{ const v=d.data(); if(v) m[d.id]=v; }); EVENT_DOCS=m; if(state.view==="events") renderEvents(); }, ()=>{});
}catch(e){} })();