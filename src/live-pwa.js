/* Events file. A weekly task commits events.json to the repository; the app reads it on every open
   and keeps the last copy on the device for offline use. */
EVENT_DOCS = store.get("events", null) || {"dogparade": {"city": "nyc", "start": "2026-10-17", "time": "Listed as 1 pm to 4 pm. The start time may change", "source": "https://www.nycforfree.co/events/tompkins-square-halloween-dog-parade-2026"}, "halloween": {"city": "nyc", "start": "2026-10-31", "time": "Starts at 7 pm", "where": "Sixth Av, Canal St to 15 St", "source": "https://www.nycforfree.co/events/nyc-village-halloween-parade-2026"}, "tree": {"city": "nyc", "start": "2026-12-02", "source": "https://www.timeout.com/newyork/news/the-2026-rockefeller-center-christmas-tree-lighting-has-officially-been-announced-and-its-happening-earlier-than-you-think-092926"}};
fetch("events.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&typeof j==="object"&&!Array.isArray(j)){ EVENT_DOCS=j; store.set("events",j); if(state.view==="events") renderEvents(); } }).catch(()=>{});
/* Live weather, fetched straight from Open-Meteo. The last reading is kept on the device for offline use. */
const WMO = c => c===0?"Clear":c===1?"Mainly clear":c===2?"Partly cloudy":c===3?"Overcast":(c===45||c===48)?"Fog":(c>=51&&c<=57)?"Drizzle":(c>=61&&c<=67)?"Rain":(c>=71&&c<=77)?"Snow":(c>=80&&c<=82)?"Rain showers":(c===85||c===86)?"Snow showers":c>=95?"Thunderstorm":"";
WEATHER = store.get("weather",{}) || {};
let weatherBusy=false;
const WX_Q="&current=temperature_2m,weather_code,is_day&daily=precipitation_probability_max&hourly=precipitation_probability,precipitation,cloud_cover,weather_code,temperature_2m&timezone=auto&forecast_days=7";
function wxParse(j){ const cur=j.current||{}, txt=WMO(cur.weather_code); if(typeof cur.temperature_2m!=="number"||!txt) return null;
  return {updated:new Date().toISOString(),temp_c:cur.temperature_2m,condition:txt,condition_text:txt,is_day:!!cur.is_day,
    precip_chance_today:j.daily&&j.daily.precipitation_probability_max?j.daily.precipitation_probability_max[0]:undefined,
    hourly:j.hourly&&j.hourly.time?{time:j.hourly.time,pop:j.hourly.precipitation_probability,mm:j.hourly.precipitation,cc:j.hourly.cloud_cover,code:j.hourly.weather_code,t:j.hourly.temperature_2m}:null}; }
async function loadWeather(){
  const id=state.city, c=CITIES[id]; if(weatherBusy||typeof c.lat!=="number") return; weatherBusy=true;
  try{
    const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+c.lat+"&longitude="+c.lon+WX_Q);
    if(!r.ok) throw new Error("weather "+r.status);
    const v=wxParse(await r.json()); if(v){ WEATHER[id]=v; store.set("weather",WEATHER); }
  }catch(e){} finally{ weatherBusy=false; }
  renderNow(); if(state.view==="today") renderToday(); if(state.view==="map"&&$("mapSvg")){ mapDraw(); mapPanel(); } if(state.view==="shoot"&&state.tab==="settings"&&openTip===null&&document.activeElement.id!=="camera") renderCard();
}
/* The forecast for where you are, for Light here away from the city. Kept as WEATHER.here with its position; fetched at most every 10 minutes. */
let wxHereAt=0;
async function loadWeatherAt(pos){ if(Date.now()-wxHereAt<10*60*1000) return; wxHereAt=Date.now();
  try{ const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+pos.lat.toFixed(3)+"&longitude="+pos.lon.toFixed(3)+WX_Q); if(!r.ok) return;
    const v=wxParse(await r.json()); if(!v) return; v.lat=+pos.lat.toFixed(3); v.lon=+pos.lon.toFixed(3); WEATHER.here=v; store.set("weather",WEATHER);
    if(typeof LF!=="undefined"&&LF.open) lfRender(); }catch(e){} }
loadWeather(); setInterval(loadWeather, 15*60*1000);
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
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(hadSw&&!reloaded){ reloaded=true; location.reload(); } });
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}