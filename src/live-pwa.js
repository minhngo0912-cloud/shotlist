/* Events file. A weekly task commits events.json to the repository; the app reads it on every open
   and keeps the last copy on the device for offline use. */
EVENT_DOCS = store.get("events", null) || {"dogparade": {"city": "nyc", "start": "2026-10-17", "time": "Listed as 1 pm to 4 pm. The start time may change", "source": "https://www.nycforfree.co/events/tompkins-square-halloween-dog-parade-2026"}, "halloween": {"city": "nyc", "start": "2026-10-31", "time": "Starts at 7 pm", "where": "Sixth Av, Canal St to 15 St", "source": "https://www.nycforfree.co/events/nyc-village-halloween-parade-2026"}, "tree": {"city": "nyc", "start": "2026-12-02", "source": "https://www.timeout.com/newyork/news/the-2026-rockefeller-center-christmas-tree-lighting-has-officially-been-announced-and-its-happening-earlier-than-you-think-092926"}};
fetch("events.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(j&&typeof j==="object"&&!Array.isArray(j)){ EVENT_DOCS=j; store.set("events",j); if(state.view==="events") renderEvents(); } }).catch(()=>{});
/* Live weather, fetched straight from Open-Meteo. The last reading is kept on the device for offline use. */
const WMO = c => c===0?"Clear":c===1?"Mainly clear":c===2?"Partly cloudy":c===3?"Overcast":(c===45||c===48)?"Fog":(c>=51&&c<=57)?"Drizzle":(c>=61&&c<=67)?"Rain":(c>=71&&c<=77)?"Snow":(c>=80&&c<=82)?"Rain showers":(c===85||c===86)?"Snow showers":c>=95?"Thunderstorm":"";
WEATHER = store.get("weather",{}) || {};
let weatherBusy=false;
async function loadWeather(){
  const id=state.city, c=CITIES[id]; if(weatherBusy||typeof c.lat!=="number") return; weatherBusy=true;
  try{
    const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude="+c.lat+"&longitude="+c.lon+"&current=temperature_2m,weather_code,is_day&daily=precipitation_probability_max&hourly=precipitation_probability,precipitation,cloud_cover,weather_code&timezone=auto&forecast_days=2");
    if(!r.ok) throw new Error("weather "+r.status);
    const j=await r.json(), cur=j.current||{}, txt=WMO(cur.weather_code);
    if(typeof cur.temperature_2m==="number" && txt){
      WEATHER[id]={updated:new Date().toISOString(),temp_c:cur.temperature_2m,condition:txt,condition_text:txt,is_day:!!cur.is_day,
        precip_chance_today:j.daily&&j.daily.precipitation_probability_max?j.daily.precipitation_probability_max[0]:undefined,
        hourly:j.hourly&&j.hourly.time?{time:j.hourly.time,pop:j.hourly.precipitation_probability,mm:j.hourly.precipitation,cc:j.hourly.cloud_cover,code:j.hourly.weather_code}:null};
      store.set("weather",WEATHER);
    }
  }catch(e){} finally{ weatherBusy=false; }
  renderNow(); if(state.view==="map"&&$("mapSvg")){ mapDraw(); mapPanel(); } if(state.view==="shoot"&&state.tab==="settings"&&openTip===null&&document.activeElement.id!=="camera") renderCard();
}
loadWeather(); setInterval(loadWeather, 15*60*1000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden){ const w=WEATHER[state.city]; if(!w||Date.now()-new Date(w.updated)>10*60*1000) loadWeather(); } });
$("city").addEventListener("change",loadWeather);
if("serviceWorker" in navigator){
  const hadSw=!!navigator.serviceWorker.controller; let reloaded=false;
  // When a new version takes over, reload once so it shows now rather than on the next launch
  navigator.serviceWorker.addEventListener("controllerchange",()=>{ if(hadSw&&!reloaded){ reloaded=true; location.reload(); } });
  window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
}