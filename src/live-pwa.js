/* Events file. A weekly task commits events.json to the repository; the app reads it on every open
   and keeps the last copy on the device for offline use. */
EVENT_DOCS = store.get("events", null) || {"dogparade": {"city": "nyc", "start": "2026-10-17", "time": "Listed as 1 pm to 4 pm. The start time may change", "source": "https://www.nycforfree.co/events/tompkins-square-halloween-dog-parade-2026"}, "halloween": {"city": "nyc", "start": "2026-10-31", "time": "Starts at 7 pm", "where": "Sixth Av, Canal St to 15 St", "source": "https://www.nycforfree.co/events/nyc-village-halloween-parade-2026"}, "tree": {"city": "nyc", "start": "2026-12-02", "source": "https://www.timeout.com/newyork/news/the-2026-rockefeller-center-christmas-tree-lighting-has-officially-been-announced-and-its-happening-earlier-than-you-think-092926"}};
/* Camera prices: the twice-weekly check commits prices.json (prices per camera, "_status", and "_targets", the alert prices). */
PRICE_FILE=true;
{ const pj=store.get("prices",null); if(pj){ PRICE_TARGETS=pj._targets||{}; PRICE_DOCS=pj; } }
fetch("prices.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&typeof j==="object"&&!Array.isArray(j)){ PRICE_TARGETS=j._targets||{}; PRICE_DOCS=j; store.set("prices",j); rerenderPrices(); } }).catch(()=>{});
fetch("events.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&typeof j==="object"&&!Array.isArray(j)){ EVENT_DOCS=j; store.set("events",j); if(state.view==="events") renderEvents(); } }).catch(()=>{});
/* Live weather, fetched straight from Open-Meteo. The last reading is kept on the device for offline use. */
const WMO = c => c===0?"Clear":c===1?"Mainly clear":c===2?"Partly cloudy":c===3?"Overcast":(c===45||c===48)?"Fog":(c>=51&&c<=57)?"Drizzle":(c>=61&&c<=67)?"Rain":(c>=71&&c<=77)?"Snow":(c>=80&&c<=82)?"Rain showers":(c===85||c===86)?"Snow showers":c>=95?"Thunderstorm":"";
WEATHER = store.get("weather",{}) || {};
let weatherBusy=false;
const WX_Q="&current=temperature_2m,weather_code,is_day&daily=precipitation_probability_max&hourly=precipitation_probability,precipitation,cloud_cover,weather_code,temperature_2m,apparent_temperature,uv_index&timezone=auto&forecast_days=7";
function wxParse(j){ const cur=j.current||{}, txt=WMO(cur.weather_code); if(typeof cur.temperature_2m!=="number"||!txt) return null;
  return {updated:new Date().toISOString(),temp_c:cur.temperature_2m,condition:txt,condition_text:txt,is_day:!!cur.is_day,
    precip_chance_today:j.daily&&j.daily.precipitation_probability_max?j.daily.precipitation_probability_max[0]:undefined,
    hourly:j.hourly&&j.hourly.time?{time:j.hourly.time,pop:j.hourly.precipitation_probability,mm:j.hourly.precipitation,cc:j.hourly.cloud_cover,code:j.hourly.weather_code,t:j.hourly.temperature_2m,at:j.hourly.apparent_temperature,uv:j.hourly.uv_index}:null}; }
async function loadWeather(){
  const id=state.city, c=CITIES[id]; if(weatherBusy||typeof c.lat!=="number") return; weatherBusy=true;
  try{
    const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+c.lat+"&longitude="+c.lon+WX_Q);
    if(!r.ok) throw new Error("weather "+r.status);
    const v=wxParse(await r.json()); if(v){ const old=WEATHER[id]; if(old&&old.aq) v.aq=old.aq; if(old&&old.nws) v.nws=old.nws; WEATHER[id]=v; store.set("weather",WEATHER); }
  }catch(e){} finally{ weatherBusy=false; }
  await loadHealth(id);
  renderNow(); if(state.view==="today") renderToday(); if(state.view==="map"&&$("mapSvg")){ mapDraw(); mapPanel(); } if(state.view==="shoot"&&state.tab==="settings"&&openTip===null&&document.activeElement.id!=="camera") renderCard();
}
/* Health on an outing: the hourly air quality (US AQI, from Open-Meteo's air-quality forecast) and the National Weather Service's
   active alerts for the city (heat, air quality, wind chill, winter storms, coastal floods). Both free, no account; kept with the weather. */
let healthAt=0;
async function loadHealth(id){ const c=CITIES[id]; if(!c||typeof c.lat!=="number"||Date.now()-healthAt<20*60*1000) return; healthAt=Date.now(); const W=WEATHER[id]; if(!W) return;
  try{ const r=await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude="+c.lat+"&longitude="+c.lon+"&hourly=us_aqi,pm2_5&timezone=auto&forecast_days=5");
    if(r.ok){ const j=await r.json(); if(j.hourly&&j.hourly.time) W.aq={time:j.hourly.time,aqi:j.hourly.us_aqi,pm:j.hourly.pm2_5,at:new Date().toISOString()}; } }catch(e){}
  try{ const r=await fetch("https://api.weather.gov/alerts/active?point="+c.lat.toFixed(4)+","+c.lon.toFixed(4),{headers:{Accept:"application/geo+json"}});
    if(r.ok){ const j=await r.json(); W.nws={at:new Date().toISOString(),list:(j.features||[]).map(f=>f.properties||{}).filter(p=>p.event&&p.status!=="Test").map(p=>({ev:p.event,sev:p.severity||"",s:p.onset||p.effective||p.sent,e:p.ends||p.expires,head:p.headline||"",inst:String(p.instruction||"").replace(/\s+/g," ").trim().slice(0,400)}))}; } }catch(e){}
  try{ store.set("weather",WEATHER); }catch(e){} if(state.view==="today") renderToday(); if(state.view==="map"&&$("mapSvg")) mapPanel(); }
/* The forecast for where you are, for Light here away from the city. Kept as WEATHER.here with its position; fetched at most every 10 minutes. */
let wxHereAt=0;
async function loadWeatherAt(pos){ if(Date.now()-wxHereAt<10*60*1000) return; wxHereAt=Date.now();
  try{ const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+pos.lat.toFixed(3)+"&longitude="+pos.lon.toFixed(3)+WX_Q); if(!r.ok) return;
    const v=wxParse(await r.json()); if(!v) return; v.lat=+pos.lat.toFixed(3); v.lon=+pos.lon.toFixed(3); WEATHER.here=v; store.set("weather",WEATHER);
    if(typeof LF!=="undefined"&&LF.open) lfRender(); }catch(e){} }
loadWeather(); setInterval(loadWeather, 15*60*1000);
/* Today's Refresh and pull down: the weather now, and the events and prices files again. */
window.liveRefresh=()=>{ loadWeather();
  fetch("events.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&typeof j==="object"&&!Array.isArray(j)){ EVENT_DOCS=j; store.set("events",j); if(state.view==="today") renderToday(); } }).catch(()=>{});
  fetch("prices.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&typeof j==="object"&&!Array.isArray(j)){ PRICE_TARGETS=j._targets||{}; PRICE_DOCS=j; store.set("prices",j); rerenderPrices(); } }).catch(()=>{}); };
document.addEventListener("visibilitychange",()=>{ if(!document.hidden){ const w=WEATHER[state.city]; if(!w||Date.now()-new Date(w.updated)>10*60*1000) loadWeather(); } });
$("city").addEventListener("change",loadWeather);
/* Place photos for offline use: once per set of photos, a few seconds after opening and only when online, fetch each pin
   photo in the background so the service worker keeps a copy. About 30 small images. */
function warmPhotos(){ try{ if(!navigator.onLine||!navigator.serviceWorker||!navigator.serviceWorker.controller) return;
  const list=Object.values(PLACE_PHOTO).map(p=>p.src), key=list.length+":"+list.join("").length; if(store.get("photosWarm","")===key) return;
  let i=0; const next=()=>{ if(i>=list.length){ store.set("photosWarm",key); return; } fetch(list[i++],{mode:"no-cors"}).catch(()=>{}).finally(()=>setTimeout(next,150)); }; next(); }catch(e){} }
window.addEventListener("load",()=>setTimeout(warmPhotos,6000));
if("serviceWorker" in navigator){
  const hadSw=!!navigator.serviceWorker.controller; let reloaded=false;
  // When a new version takes over, reload once so it shows now rather than on the next launch
  // Never reload under your fingers: if the app is open, offer it, and apply it the next time the app comes back to the front
  let pending=false; const apply=()=>{ if(!reloaded){ reloaded=true; location.reload(); } };
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(!hadSw||reloaded) return; if(document.hidden){ apply(); return; } pending=true;
    try{ if(typeof evToast==="function") evToast('<span>A new version is ready.</span><button type="button" class="linkbtn" onclick="location.reload()">Reload</button>'); }catch(e){} });
  document.addEventListener("visibilitychange",()=>{ if(pending&&!document.hidden) apply(); });
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
  // An app opened from the home screen is often resumed rather than reopened, and then never looks for a new version.
  // Look when it comes back to the front (at most every 10 minutes), and on demand from Settings › App health.
  let swLook=0; const swCheck=()=>navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{});
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&Date.now()-swLook>10*60*1000){ swLook=Date.now(); swCheck(); } });
  window.appUpdate=async msg=>{ msg("Looking for a new version…"); try{ const r=await navigator.serviceWorker.getRegistration(); if(!r){ msg("Updates are not available here."); return; }
      const before=navigator.serviceWorker.controller; reloaded=false; pending=false;
      const wait=new Promise(res=>{ const t=setTimeout(()=>res(false),15000); navigator.serviceWorker.addEventListener("controllerchange",()=>{ clearTimeout(t); res(true); },{once:true}); });
      await r.update(); if(r.installing||r.waiting){ msg("Downloading the new version…"); if(r.waiting) r.waiting.postMessage&&r.waiting.postMessage("skip"); if(await wait){ reloaded=true; location.reload(); return; } }
      msg(before?"You have the latest version.":"Updates start working after the app is opened once more."); }catch(e){ msg("Could not check right now. Are you online?"); } };
}