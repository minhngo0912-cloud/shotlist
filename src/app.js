
const INTENTS = {
  place:  {name:"Show the place",        color:"var(--blue)"},
  moment: {name:"Capture a moment",      color:"var(--red)"},
  energy: {name:"Show energy",           color:"var(--orange)"},
  mood:   {name:"Create a mood",         color:"var(--purple)"},
  odd:    {name:"Find something unusual",color:"var(--yellow)"}
};
/* Cities. Adding a city means adding one entry here (its places, and optionally its
   transit line colours) plus idea rows below that use the new place ids.
   Place ids must be unique across all cities. `lines` values are a colour token name or a hex colour. */
const CITIES = {
 nyc:{name:"New York City",lat:40.7128,lon:-74.006,
  lines:{A:"blue",C:"blue",E:"blue",B:"orange",D:"orange",F:"orange",M:"orange",N:"yellow",Q:"yellow",R:"yellow",W:"yellow",
  "1":"red","2":"red","3":"red","4":"green","5":"green","6":"green","7":"purple",J:"brown",Z:"brown",S:"gray",L:"gray"},
  places:{
  chinatown:{lat:40.7144,lon:-73.9981,name:"Chinatown", stop:"Canal St", lines:"NQRW6JZ"},
  gct:{lat:40.7527,lon:-73.9772,name:"Grand Central", stop:"Grand Central–42 St", lines:"4567S"},
  tsq:{lat:40.758,lon:-73.9855,name:"Times Square", stop:"Times Sq–42 St", lines:"1237NQRWS"},
  wsp:{lat:40.7308,lon:-73.9973,name:"Washington Square", stop:"W 4 St–Wash Sq", lines:"ACEBDFM"},
  dumbo:{lat:40.7033,lon:-73.9894,name:"DUMBO", stop:"York St", lines:"F"},
  coney:{lat:40.5749,lon:-73.9796,name:"Coney Island", stop:"Stillwell Av", lines:"DFNQ"},
  soho:{lat:40.7254,lon:-73.999,name:"SoHo", stop:"Prince St", lines:"RW"},
  jh:{lat:40.7468,lon:-73.8913,name:"Jackson Heights", stop:"74 St–Broadway", lines:"7EFMR"},
  ferry:{lat:40.7013,lon:-74.0132,name:"Staten Island Ferry", stop:"South Ferry", lines:"1RW"},
  harlem:{"name": "Harlem", "stop": "125 St (two stations, at St Nicholas Av and Lenox Av)", "lines": "ABCD23", "lat": 40.808, "lon": -73.9454},
  les:{"name": "Lower East Side", "stop": "Delancey St–Essex St", "lines": "FMJZ", "lat": 40.7186, "lon": -73.9883},
  flushing:{"name": "Flushing", "stop": "Flushing–Main St", "lines": "7", "lat": 40.7596, "lon": -73.8301},
  wburg:{"name": "Williamsburg", "stop": "Bedford Av", "lines": "L", "lat": 40.7172, "lon": -73.9571},
  midtown:{"name": "Midtown at lunch", "stop": "5 Av/53 St", "lines": "EF", "lat": 40.7605, "lon": -73.976},
  cpark:{"name": "Central Park", "stop": "72 St", "lines": "BC", "lat": 40.774, "lon": -73.9708},
  rockaway:{"name": "Rockaway Beach", "stop": "Beach 90 St (A to Broad Channel, then the shuttle)", "lines": "S", "lat": 40.5846, "lon": -73.8128},
  arthur:{"name": "Arthur Avenue", "stop": "Fordham Rd, then a 16-minute walk or the Bx12 bus", "lines": "BD", "lat": 40.8551, "lon": -73.8878},
  union:{"name": "Union Square", "stop": "14 St–Union Sq", "lines": "456LNQRW", "lat": 40.7359, "lon": -73.9906},
  fidi:{"name": "Financial District", "stop": "Fulton St, or Wall St", "lines": "2345ACJZ", "lat": 40.7074, "lon": -74.0104},
  ktown:{"name": "Koreatown and Herald Square", "stop": "34 St–Herald Sq", "lines": "BDFMNQRW", "lat": 40.7481, "lon": -73.9869},
  bushwick:{"name": "Bushwick", "stop": "Jefferson St", "lines": "L", "lat": 40.706, "lon": -73.9225},
  chelsea:{"name": "Chelsea and the High Line", "stop": "14 St / 8 Av", "lines": "ACEL", "lat": 40.742, "lon": -74.006},
  brighton:{"name": "Brighton Beach", "stop": "Brighton Beach", "lines": "BQ", "lat": 40.577, "lon": -73.9612},
  subway:{name:"On the subway", stop:"Any station", lines:""}
 }}
};
const PLACES = {};
for(const [cid,c] of Object.entries(CITIES)) for(const [pid,p] of Object.entries(c.places)) PLACES[pid] = Object.assign({city:cid},p);
const WHEN = {am:"Morning", mid:"Midday sun", gold:"Late afternoon", night:"Night", rain:"Rain or overcast"};

/* Camera profiles. Each idea names a recipe; the profile turns it into settings.
   Adding a camera means adding one entry here. */
// Per recipe: [focus mode, focus area, metering, exposure compensation], in Leica Q3 menu terms.
const SETUP = {
  // then [Scene Mode menu setting · exposure mode, aspect ratio, shutter type, white balance]
  zone:["MF","Not used (focus ring pre-set)","Multi-Field","0 (if ISO reads 100 and the highlights flash, turn the shutter dial to 1/1000 s)","PASM · M with Auto ISO","3:2","Hybrid","Auto"],
  freeze:["AFc","Eye/Face/Body Detection","Multi-Field","0 (in full sun close down to f/5.6: Auto ISO cannot go below 100)","PASM · M with Auto ISO","3:2","Mechanical (no skew on fast movement)","Auto"],
  drag:["AFs","Field, on the still subject","Multi-Field","0","PASM · S (shutter priority)","3:2","Mechanical","Auto"],
  deep:["AFs","Field, on what the card says to keep sharp","Multi-Field","0, or −0.3 to hold the sky","PASM · A (aperture priority)","3:2, or 16:9 for a skyline","Hybrid","Auto, or Daylight to keep a set consistent"],
  shallow:["AFs","Eye/Face/Body Detection","Center-Weighted","0, or +0.7 to +1 if the face is backlit","PASM · A (aperture priority)","3:2","Hybrid (wide open in sun needs the electronic range)","Auto"],
  night:["AFs","Field, on a lit edge or sign","Multi-Field","−0.7","PASM · M with Auto ISO","3:2","Mechanical (LED screens can band with electronic)","Daylight, so neon keeps its colour"],
  silhouette:["AFs","Field, on the edge of the figure","Multi-Field","−1.3 (or Highlight-Weighted metering at 0 to −0.7)","PASM · A (aperture priority)","3:2","Hybrid","Daylight, to keep the warmth"],
  interior:["AFs","Field","Center-Weighted","0","PASM · M with Auto ISO","3:2","Mechanical (artificial light can band with electronic)","Auto"],
  detail:["AFs","Spot","Multi-Field","0","PASM · A (aperture priority)","3:2, or 1:1 for a single sign","Mechanical","Auto"]
};
/* The Q3's own scene modes are fully automatic and ignore the dials, so every card uses PASM. Where one comes close to the recipe,
   it is offered as a shortcut; where none does (zone focus, slow shutter), the card says to stay on PASM. */
const SCENE_ALT = {zone:null, freeze:"Sport", drag:null, deep:"Landscape", shallow:"Portrait", night:"Night Portrait, if a person is close with the lights behind", silhouette:"Sunset", interior:null, detail:null};
const SETUP_LABELS = ["Focus mode","Focus area","Metering","Exposure comp.","Scene mode","Aspect ratio","Shutter type","White balance"];
// Explanations shown when a setting is tapped. Index matches SETUP_LABELS; "exp" is the aperture/shutter/ISO line.
const TIPS = {
  exp:{t:"Aperture · shutter · ISO", what:"Three settings decide how bright the picture is, and two of them also change how it looks.",
    opts:[["Aperture (f-number)","How much is sharp front to back. f/2 blurs the background; f/8 keeps most of the scene sharp."],["Shutter speed","How movement looks. 1/500 s freezes walkers; 1/15 s blurs them."],["ISO","Sensitivity. Auto ISO raises it so the aperture and shutter stay where you put them."]],
    more:"In A mode the shutter speed shown is the slowest to allow: set it as the Auto ISO shutter speed limit, and the camera raises ISO instead of going slower. Once ISO reaches your maximum, it goes slower anyway. An ND filter is a dark filter that cuts the light so a slow shutter works in sun; DNG is the raw file, which keeps more detail to recover later."},
  0:{t:"Focus mode", what:"How the camera focuses when you half-press.",
    opts:[["AFs","Locks focus once. For still subjects."],["AFc","Keeps refocusing while you hold. For people moving toward or away from you."],["MF","You set the distance on the lens ring, so there is no delay when you press."],["Intelligent AF (iAF)","Switches between AFs and AFc on its own. It does not always pick right, so cards name one or the other."]]},
  1:{t:"Focus area", what:"Where in the frame the camera looks for focus.",
    opts:[["Field","One movable box you place on the subject."],["Spot","A smaller box, for precise targets."],["Eye/Face/Body Detection","Finds a person and follows them."],["Multi-Field","The camera chooses. Fast, but can pick the wrong thing in a crowd."],["Zone","A block of points, for fast action."],["Tracking","Follows whatever you place the box on."]]},
  2:{t:"Metering", what:"How the camera measures brightness to set the exposure.",
    opts:[["Multi-Field","Reads the whole frame. Right most of the time."],["Center-Weighted","Favours the middle. For a central subject with much brighter or darker edges."],["Spot","Reads one small point."],["Highlight-Weighted","Protects the brightest areas from blowing out."]]},
  3:{t:"Exposure compensation", what:"Makes the picture brighter or darker than the meter suggests.",
    opts:[["+ (plus)","Brighter. When a backlit face comes out too dark."],["− (minus)","Darker. When bright lights or sky are washed out."]],
    more:"It only works when the camera chooses at least one of shutter, aperture or ISO. In M with Auto ISO it changes the ISO, which cannot go below 100, so in full sun minus may do nothing. To change it quickly, assign Exposure Compensation to the thumbwheel in the menu. One step of 1 EV doubles or halves the brightness."},
  4:{t:"Scene mode", what:"The Scene Mode item in the Q3 menu. Use PASM: the dials control exposure, and the settings on this card only work there.",
    opts:[["P","Shutter dial and aperture ring both on A."],["A (aperture priority)","Shutter dial on A, aperture set on the ring."],["S (shutter priority)","Aperture ring on A, speed set on the dial."],["M","Both set by hand. Here with ISO on Auto."]],
    group:["Scene modes: the camera sets the exposure for you",[["Auto","General snapshots, or handing the camera to someone."],["Sport","Moving subjects and action."],["Portrait","A person."],["Landscape","Broad outdoor scenes."],["Night Portrait","A person against night lights."],["Snow / Beach","Bright, reflective surroundings."],["Fireworks","Bursts and light trails."],["Candlelight","Dim, candle-lit scenes."],["Sunset","Sunset skies."],["Digiscoping","Through a spotting scope."]]],
    more:"Switch back to PASM after using a scene mode."},
  5:{t:"Aspect ratio", what:"The shape of the picture. Other ratios show crop lines while you frame.",
    opts:[["3:2","The whole sensor."],["16:9","Wider. Suits skylines."],["1:1","Square. Suits a single centred subject."]]},
  6:{t:"Shutter type", what:"Which shutter takes the picture.",
    opts:[["Mechanical","A physical shutter, up to 1/2000 s. Reliable under artificial light and with fast movement."],["Electronic","Silent, up to 1/16000 s, but fast subjects can lean or bend, and LED light can show dark stripes (banding)."],["Hybrid","Mechanical normally; electronic only when the light needs a faster speed."]]},
  7:{t:"White balance", what:"The overall colour cast, so whites look white. With DNG files you can change it afterwards without losing quality.",
    opts:[["Auto","Adjusts for each scene."],["Daylight","Fixed, so warm light stays warm, neon keeps its colour and a set of frames matches."],["Cloudy","Warmer. Flatters skin in flat light."]]}
};
// The value on a card is a main setting plus, often, a note: "Mechanical (no skew on fast movement)", "3:2, or 16:9 for a skyline".
function splitVal(v){ const m=/^(.*?)(?: \((.*)\)|, (or .*))$/.exec(v); return m ? [m[1], m[2]||m[3]] : [v,""]; }
/* The explanation for a setting, as a sheet over the page: this idea's value first, then the options, with this idea's one marked. */
function tipSheet(){ const box=$("tipSheet"); if(!box) return; const T=openTip!==null&&openTip!=="c"&&TIPS[openTip];
  if(!T||state.view!=="shoot"||state.tab!=="settings"){ box.hidden=true; document.body.classList.remove("tipopen"); return; }
  const x=IDEAS.find(i=>i.id===state.current), R=x?ideaRec(x,state.camera):{}, cam=CAMERAS[state.camera], su=R.su, val=openTip==="exp" ? (R.rec||[])[0] : su&&su[+openTip], [main,note]=splitVal(val||"");
  const isOn=name=>{ const n=name.split(" (")[0]; return main.startsWith(n+" ")||main===n||main.startsWith(n+" ·")||(openTip==="4"&&main.includes("· "+n)); };
  const list=opts=>'<ul class="tsopts">'+opts.map(([n,d])=>'<li'+(isOn(n)?' class="on"':'')+'><b>'+esc(n)+(isOn(n)?' <span class="pill">This idea</span>':'')+'</b><span>'+esc(d)+'</span></li>').join("")+'</ul>';
  const alt=openTip==="4"&&cam.setup==="leica" ? (SCENE_ALT[x.r]?'<p class="tsalt"><b>Shortcut for this idea:</b> '+esc(SCENE_ALT[x.r])+'. Use it only when there is no time to set the dials.</p>':'<p class="tsalt">No scene mode matches this idea. Stay on PASM.</p>') : '';
  box.innerHTML='<div class="tsback" data-tipclose="1"></div><section class="tsheet" role="dialog" aria-modal="true" aria-labelledby="tsTitle"><div class="tsgrab"></div>'+
    '<header><h3 id="tsTitle">'+esc(T.t)+'</h3><button type="button" class="mapselx" data-tipclose="1" aria-label="Close">×</button></header>'+
    '<div class="tsbody"><div class="tsval"><span class="label">This idea</span><b>'+esc(main)+'</b>'+(note?'<span>'+esc(note)+'</span>':'')+'</div>'+
    '<p class="tswhat">'+esc(T.what)+'</p>'+list(T.opts)+alt+(T.group?'<p class="tsgroup">'+esc(T.group[0])+'</p>'+list(T.group[1]):'')+(T.more?'<p class="tsmore">'+esc(T.more)+'</p>':'')+'</div></section>';
  box.hidden=false; document.body.classList.add("tipopen"); const c=box.querySelector("header .mapselx"); if(c) c.focus({preventScroll:true}); }
let openTip = null;
const GENERIC_TERMS =[["PASM · ","Mode dial: "],["AFs","Single AF"],["AFc","Continuous AF"],["MF","Manual focus"],["Multi-Field","Evaluative / matrix"],["Field","Single point"],["Spot","Small single point"],["Hybrid","Auto (mechanical + electronic)"]];
/* Other places to stand for an idea, with what changes: the exposure line per camera, settings that differ from the recipe
   (by SETUP_LABELS index, in Leica terms; other cameras get the generic words), the steps for focusing, and the short focus line
   for street mode. The card remembers which one you chose. */
const VARIANTS = {
  "ktown-energy":{base:"At the corner", name:"From across the street", dist:15,
    where:"Stand on the far side of 34th Street, 10 to 20 m from your still person, with the crossing between you.",
    cams:{
      q343:["1/6 s · S mode · Auto ISO · 60 or 75 crop","From across the street the walkers are about five times smaller in the frame than from the corner, so 1/15 s barely blurs them: slow to 1/6 s, or 1/4 s for long streaks, braced on the pole. After dark the camera opens to about f/2; focused at 12 m that still keeps roughly 8.5 to 20 m sharp, so focus only has to avoid the crowd, not be exact. At 43 mm a standing person fills about a fifth of the frame height: the 60 or 75 crop makes them the subject."],
      q328:["1/6 s · S mode · Auto ISO · 50 or 75 crop","From across the street the walkers are about five times smaller in the frame than from the corner, so 1/15 s barely blurs them: slow to 1/6 s, or 1/4 s for long streaks, braced on the pole. After dark the camera opens to about f/1.7; focused at 12 m that keeps roughly 7 to 55 m sharp, so focus only has to avoid the crowd. At 28 mm a standing person fills only about an eighth of the frame height: the 50 or 75 crop makes them the subject."],
      iphone:["Live Photo → Long Exposure · 2× or 3×","Zoom to 2× or 3× so the still person is not tiny. Tap and hold on them until AE/AF Lock shows, so the focus stays on them while the crowd passes, then turn the Live Photo into a Long Exposure in Photos. Brace on the pole."],
      other:["1/6 s · S mode · Auto ISO","From across the street the walkers are about five times smaller in the frame, so slow to 1/6 s, or 1/4 s for long streaks, braced on a pole. At 10 to 20 m the depth of field is deep even wide open, so focus only has to avoid the crowd."]},
    setup:{0:"MF · focus peaking and magnifier on",1:"None: set the ring once on the still person, in a gap in the crowd"},
    steps:["Turn the lens to MF and switch on focus peaking and the automatic magnifier.","Wait for a gap in the crowd, then turn the ring until the still person's outline lights up.","Leave it there: the focus stays put while the crowd streams past. Check again only if they move or you do.","Prefer autofocus? Put a Spot field on the person, focus in a gap, and hold it with AF-L."],
    stepsIphone:["Zoom to 2× or 3×.","Wait for a gap in the crowd, then tap and hold on the still person until AE/AF Lock shows.","Shoot a Live Photo as the crowd crosses; choose Long Exposure in Photos afterwards."],
    short:"MF, peaking on the still person, set once in a gap"}
};
function ideaVariant(x){ const V=VARIANTS[x.id]; if(!V) return null; const m=store.get("ideaVariant",{})||{}; return m[x.id]?V:null; }
/* The exposure line and settings for an idea on this camera, with the chosen place to stand applied. */
function ideaRec(x,camKey){ const cam=CAMERAS[camKey], V=ideaVariant(x); let rec=cam.recipes[x.r], su=setupFor(cam,x.r); const I=IDEA_SET[x.id];
  if(I&&cam.setup){ const rv=camPick(I.rec,camKey); if(rv) rec=rv; const nr=camPick(I.noteSet,camKey); if(nr) rec=[rec[0],nr]; const na=camPick(I.note,camKey); if(na) rec=[rec[0],rec[1]+" "+na];
    if(I.setup&&su){ su=su.slice(); for(const [k,v] of Object.entries(I.setup)){ let t=v; if(cam.setup!=="leica") for(const [a,b] of GENERIC_TERMS){ if(t.startsWith(a)){ t=b+t.slice(a.length); break; } } su[+k]=t; } } }
  if(V){ rec=V.cams[camKey]||V.cams.other||rec; if(su){ su=su.slice(); for(const [k,v] of Object.entries(V.setup)){ let t=v; if(cam.setup!=="leica") for(const [a,b] of GENERIC_TERMS){ if(t.startsWith(a)){ t=b+t.slice(a.length); break; } } su[+k]=t; } } }
  return {cam,rec,su,V}; }
function variantSwitch(x){ const V=VARIANTS[x.id]; if(!V) return ""; const on=!!ideaVariant(x);
  return '<div class="vsw" role="group" aria-label="Where you stand"><button type="button" data-variant="0" aria-pressed="'+!on+'">'+esc(V.base)+'</button><button type="button" data-variant="1" aria-pressed="'+on+'">'+esc(V.name)+'</button></div>'+(on?'<p class="note vwhere">'+esc(V.where)+'</p>':''); }
function setupFor(cam, recipe){
  if(!cam.setup) return null;
  const s = SETUP[recipe];
  if(cam.setup==="leica") return s;
  return s.map(v=>{ for(const [a,b] of GENERIC_TERMS){ if(v.startsWith(a)) return b+v.slice(a.length); } return v; });
}
const CAMERAS = {
  q343:{name:"Leica Q3 43", setup:"leica", recipes:{
    zone:["f/8 · 1/500 s · Auto ISO","Switch to manual focus and set the ring to the distance you will work at: about 2 m for people from the waist up (sharp from roughly 1.6 to 2.7 m), about 3 m for whole figures (2.2 to 4.9 m). Then you never wait for autofocus."],
    freeze:["f/4 · 1/1000 s · Auto ISO","Continuous AF with body and eye detection. Shoot short bursts through the peak of the action. In full sun use f/5.6: Auto ISO cannot go below 100, so f/4 at 1/1000 s comes out a stop too bright."],
    drag:["1/15 s · S mode · Auto ISO","Shutter priority: you set 1/15 s, the camera sets the aperture (about f/11 to f/16 outdoors in shade, wide open indoors) and Auto ISO fills in where the light is dim. Stabilization on, elbows in, braced on a pole or railing. These settings suit shade, deep streets and dusk. In full sun 1/15 s is out of reach: even f/16 only gets to about 1/125 s at ISO 100 (1/60 s if you set ISO 50 by hand), which barely blurs walkers. Wait for shade, or fit a 3-stop ND filter (a dark 49 mm filter that cuts the light to an eighth) for about 1/15 s."],
    deep:["f/8 · A mode · Auto ISO, slowest 1/250 s","Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. 43 mm will not take in the whole scene, so step back or choose the part that says the most. Use the level to keep verticals and the horizon straight."],
    shallow:["f/2 · A mode · Auto ISO, slowest 1/500 s","Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. Eye/Face/Body detection AF. Within about 2 m, f/2 lifts one person clearly off the background; further away the background stays readable, so choose a plain or distant one."],
    night:["f/2 · 1/125 s · Auto ISO, max 6400","Expose for the lights: dial in −0.7 EV so lit signs, windows and screens keep their colour."],
    silhouette:["f/5.6 · A mode, auto shutter · ISO 100 · −1.3 EV","Multi-Field metering with −1.3 EV holds the bright area and lets people go black. The DNG (raw file) keeps shadow detail if you change your mind."],
    interior:["f/2.8 · 1/125 s · Auto ISO, max 6400","Stabilization steadies the building, not the people. Hold 1/125 s whenever faces matter."],
    detail:["f/4 · A mode · Auto ISO, slowest 1/250 s","Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. For anything closer than 60 cm, twist the macro ring; it focuses down to about 27 cm. The 60, 75 or 90 mm crop frames help isolate a detail."]
  }},
  q328:{name:"Leica Q3 (28 mm)", setup:"leica", recipes:{
    zone:["f/8 · 1/500 s · Auto ISO","Switch to manual focus and set the ring to about 3 m: everything from roughly 1.6 m to the far distance is sharp. For people from the waist up, set 2 m (about 1.25 to 5 m). Work at 1.5 to 2 m from people or they will be small in the frame."],
    freeze:["f/4 · 1/1000 s · Auto ISO","Continuous AF with body and eye detection. Get closer than feels natural, then shoot short bursts through the peak. In full sun use f/5.6: Auto ISO cannot go below 100, so f/4 at 1/1000 s comes out a stop too bright."],
    drag:["1/15 s · S mode · Auto ISO","Shutter priority: you set 1/15 s, the camera sets the aperture (about f/11 to f/16 outdoors in shade, wide open indoors) and Auto ISO fills in where the light is dim. Stabilization on, elbows in. These settings suit shade, deep streets and dusk; in full sun even f/16 only gets to about 1/125 s at ISO 100, so wait for shade or fit a 3-stop ND filter (a dark 49 mm filter that cuts the light to an eighth). Blur shows less at 28 mm, so try 1/8 s as well."],
    deep:["f/8 · A mode · Auto ISO, slowest 1/250 s","Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. 28 mm takes in the whole scene, so check the edges for clutter and put something in the foreground. Keep the camera level or buildings lean."],
    shallow:["f/1.7 · A mode · Auto ISO, slowest 1/500 s","Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. Eye/Face/Body detection AF. Background blur is modest at 28 mm: get within about 1 m, or keep the subject far from what is behind them."],
    night:["f/1.7 · 1/125 s · Auto ISO, max 6400","Expose for the lights: dial in −0.7 EV so lit signs, windows and screens keep their colour."],
    silhouette:["f/5.6 · A mode, auto shutter · ISO 100 · −1.3 EV","Multi-Field metering with −1.3 EV holds the bright area and lets people go black. The DNG (raw file) keeps shadow detail if you change your mind."],
    interior:["f/2.8 · 1/125 s · Auto ISO, max 6400","Stabilization steadies the building, not the people. Hold 1/125 s whenever faces matter."],
    detail:["f/4 · A mode · Auto ISO, slowest 1/250 s","Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. For anything closer than 30 cm, twist the macro ring; it focuses down to about 17 cm. The 50, 75 or 90 mm crop frames help isolate a detail without moving in."]
  }},
  iphone:{name:"iPhone", recipes:{
    zone:["Main 1× lens · burst","Hold the phone low at chest height and slide the shutter left for a burst as people enter the frame."],
    freeze:["Main 1× lens · burst","Bright light gives a fast shutter on its own. Burst through the peak and pick the frame later."],
    drag:["Live Photo → Long Exposure","Brace against a pole, shoot a Live Photo, then choose Long Exposure in Photos. Keep one still subject in the frame."],
    deep:["Main 1× or 0.5× lens","Turn on the grid and level. Keep the phone upright so buildings do not lean."],
    shallow:["2× lens · Portrait mode","Stand about 2 m away. Tap the face to set focus and exposure."],
    night:["Main 1× lens · Night mode off or 1 s","Tap a bright sign and drag the sun icon down so lights keep their colour."],
    silhouette:["Main 1× lens · exposure pulled down","Tap the brightest area, hold to lock, then drag exposure down until people go black."],
    interior:["Main 1× lens","Lock exposure on the mid-tones. Hold still and take three frames; one will be sharp."],
    detail:["2× lens, or macro up close","Move in until the sign fills the frame. Keep the phone square to the surface."]
  }},
  other:{name:"Other camera", setup:"generic", recipes:{
    zone:["f/8 · 1/500 s · Auto ISO","Use a 35 to 50 mm lens, manual focus pre-set to about 3 m, and shoot without bringing the camera up slowly."],
    freeze:["f/4 · 1/1000 s · Auto ISO","Continuous AF and short bursts through the peak of the action."],
    drag:["f/11 · 1/15 s · lowest ISO","Shutter priority. Brace on a pole or railing and keep one subject still in the frame. In full sun 1/15 s needs an ND filter; without one, shoot in shade."],
    deep:["f/8 · 1/250 s · Auto ISO","Any focal length from 24 to 50 mm. Keep the camera level so verticals stay straight."],
    shallow:["Widest aperture · 1/500 s · Auto ISO","A 50 mm or longer lens at f/2 or wider, focused on the nearest eye."],
    night:["Widest aperture · 1/125 s · Auto ISO","Underexpose by about two thirds of a stop so signs and screens keep their colour."],
    silhouette:["f/5.6 · 1/1000 s · low ISO · −1.3 EV","Meter for the bright area and let people go black."],
    interior:["f/2.8 · 1/125 s · Auto ISO","Hold 1/125 s whenever faces matter, even if the ISO climbs."],
    detail:["f/4 · 1/250 s · Auto ISO","Get square to the surface and fill the frame. Use macro or a longer lens if you have one."]
  }}
};

// [place, intent, title, look for, work it, rule, recipe, best light]
const IDEAS = [
["chinatown","place","The bend on Doyers Street","The curve of the street with signs stacked on both sides and the pavement leading the eye around the corner.","Stand at the Pell Street end and keep the buildings upright. Wait for one person at the bend to give the street its scale.","Ten frames at most, one for each person who rounds the bend.","deep",["am","rain"]],
["chinatown","moment","The handoff","Money, bags and fish changing hands at the pavement stalls on Mott Street, between Grand and Hester Street.","Stand beside the scale, not in front of the stall. Frame both people from the waist up so hands and faces share the picture.","Press only when two hands are in the frame.","zone",["am","mid"]],
["chinatown","energy","Canal Street current","Shoppers squeezing past vendors and stacked boxes, all moving in different directions.","Plant yourself against a pole and let the crowd flow around you. Keep one vendor standing still while everyone else blurs.","Stay in one spot for fifteen minutes.","drag",["gold"]],
["chinatown","mood","Steam and neon","Fogged restaurant windows, kitchen steam and red signs on Mott and Bayard after dark.","Shoot through the glass and let the reflections sit on top of the people inside. Get close to the window to control what reflects.","Every frame must include glass.","night",["night","rain"]],
["chinatown","odd","Columbus Park spectators","Card games, xiangqi boards and erhu players, each with a ring of onlookers.","Photograph the watchers, not the players. Look for the one face reacting differently from the rest of the ring.","No frames of the board itself.","zone",["am","mid"]],

["gct","place","Concourse from the west stairs","The clock on the information booth and the departure boards above a busy marble floor, with the tall windows and the ceiling above if your frame is wide enough.","Go up the west staircase and shoot handheld from the top of the stairs. Choose either floor and clock, or windows and ceiling, unless your lens is wide enough to hold both.","Make one picture that says Grand Central without the ceiling.","interior",["am","mid","gold","night","rain"]],
["gct","moment","Meeting at the clock","People scanning the crowd, then the wave, the hug or the missed connection at the information booth.","Stand about five metres from the booth with the clock in the upper third. Pick one waiting person and stay with them.","Follow one person until their meeting happens or they leave.","interior",["gold","night"]],
["gct","energy","Rush-hour river","Evening commuters crossing the marble floor in every direction.","Brace on the stair rail at the top of the west staircase and find one person standing still to check the departures board.","Shoot only between 5 and 6 pm on a weekday.","drag",["gold"]],
["gct","mood","Pools of light","The brightest patches of the marble floor, with people crossing them as dark shapes. Direct sun rarely reaches the floor now that towers surround the building.","Find the brightest patch you can, expose for it and wait at its edge. Press when a single figure is fully inside it.","One figure per frame, never two.","silhouette",["am","gold"]],
["gct","odd","The whispering corners","People facing the tiled corners outside the Oyster Bar, talking to the wall while a friend listens across the arch.","Frame one corner tightly so the person appears to be speaking to the tiles. A second frame can show both ends of the arch.","Do not explain the picture; leave the listener out of at least one frame.","interior",["am","mid","gold","night","rain"]],

["tsq","place","From the red steps","Broadway and Seventh Avenue converging under the screens, seen from above the crowd.","Climb the red steps at Duffy Square and look south. Put the crowd along the bottom edge and let the screens fill the rest.","Shoot it at dusk, when the sky and the screens are the same brightness.","deep",["gold","night"]],
["tsq","moment","The first look up","The face of someone seeing the square for the first time.","Stand near a subway exit with your back to the screens and watch the people coming up the stairs.","Faces only; no screens in the frame.","freeze",["gold","night"]],
["tsq","energy","Colour wash","A crowd changing colour every few seconds as the billboards change.","Hold one composition and take the same frame under red, blue and white light. A slow shutter turns the walkers into streaks of that colour.","Three frames, same spot, three colours.","drag",["night"]],
["tsq","mood","Rain mirror","The screens repeated in wet pavement and puddles, with umbrellas cutting through them.","Get the camera low to the ground at a puddle's edge. Let the reflection take two thirds of the frame.","No sky and no real billboard, only its reflection.","night",["rain","night"]],
["tsq","odd","Characters off duty","Costumed performers with the head off, eating lunch, counting cash or on the phone.","Look at the edges of the plaza and the side streets, where they take breaks. Keep a respectful distance and do not ask for a pose.","The costume and the ordinary act must both be in the frame.","zone",["mid","gold"]],

["wsp","place","The arch and Fifth Avenue","The arch with the fountain in front of it, or Fifth Avenue running north through it.","Stand south of the fountain and centre the arch. Then walk toward it and stop where its opening frames Fifth Avenue, with the curve just inside the top of the picture.","One symmetrical frame and one deliberately off-centre.","deep",["am","gold"]],
["wsp","moment","Chess corner","A hand hovering over a piece, a slap on the clock, the look across the table.","Work the tables in the southwest corner. Sit down at the next table so the camera is at the players' eye level.","Wait for hands; no frames of people only thinking.","zone",["mid","gold"]],
["wsp","energy","The fountain ring","Dancers, skaters and musicians with a crowd around them.","Get to the front of the ring and crouch. Catch the performer at the top of a jump or spin with the crowd behind.","Feet off the ground in every frame.","freeze",["mid","gold"]],
["wsp","mood","Bench light","Low sun through the trees, long shadows across the paths and someone alone with a book.","Shoot toward the sun along the western paths. Let the reader be a small dark shape in a large bright frame.","The person takes up less than a tenth of the picture.","silhouette",["gold"]],
["wsp","odd","The regulars","The grand piano wheeled into the park, the men covered in pigeons, and poets typing verses to order.","Spend time before you shoot. Ask what they are doing; the picture after the conversation is usually better.","Talk to one stranger before photographing them.","shallow",["mid","gold"]],

["dumbo","place","Washington Street frame","The Manhattan Bridge tower between brick warehouses, with the Empire State Building visible through its base.","Stand on Washington Street between Front and Water Street. Move left and right until the Empire State Building sits inside the opening in the tower.","Be there before 8 am, before the crowd arrives.","deep",["am"]],
["dumbo","moment","Between the poses","Couples, wedding parties and tourists posing in the middle of the street, and what happens just after the pose ends.","Stand to one side of someone else's shoot. Wait for the laugh, the dress being fixed or the dash away from a car.","Press only after their photographer lowers the camera.","zone",["mid","gold"]],
["dumbo","energy","Under the bridge","Trains crossing overhead, cyclists and skaters coming through the archway on Water Street.","Stand inside the arch facing the light. Blur a cyclist against the still stone.","Every frame needs something moving and something that has not moved in a century.","drag",["gold"]],
["dumbo","mood","Blue hour at Pebble Beach","The lower Manhattan skyline switching on while the carousel glows in its glass box.","Use the rocks or a railing as a support. Put a single person at the water's edge in front of the lights.","Shoot only in the twenty minutes after sunset.","night",["gold","night"]],
["dumbo","odd","Rails in the cobbles","Old freight tracks running through the Belgian block and stopping at nothing.","Follow the rails on Plymouth Street, between Pearl and Bridge Street. Get low and let them lead to a modern detail such as a scooter or a stroller.","Old and new must share the frame.","deep",["am","rain"]],

["coney","place","Boardwalk and Wonder Wheel","The wheel, the parachute tower and the boardwalk planks running to the horizon.","Shoot along the boardwalk with the planks as leading lines. Keep the wheel large by walking toward it, not by cropping.","One frame with people, one with none.","deep",["am","gold"]],
["coney","moment","The drop","Faces on the Cyclone as it goes over the first hill.","Stand along West 10th Street, which runs beside the long side of the ride, and aim up at the first drop.","Open mouths only.","freeze",["mid","gold"]],
["coney","energy","Rides in motion","Spinning rides turning into rings of light at dusk.","Brace on a fence in Luna Park and keep the ticket booth or a waiting parent sharp while the ride blurs.","Try 1/15 and 1/8 s on the same ride and keep one; use 1/4 s only with the camera resting on the rail and the booth as the sharp subject.","drag",["gold","night"]],
["coney","mood","Out of season","Shuttered stands, fog over the beach and one walker on a mile of empty boardwalk.","Go on a weekday morning outside summer. Leave most of the frame empty and place the walker near an edge.","Go only when the weather is bad.","deep",["am","rain"]],
["coney","odd","Hand-painted signs","Sideshow banners, painted clams and corn dogs, and lettering no computer made.","Fill the frame with one sign, then make a second frame where a passer-by echoes its colour or its pose.","Collect five signs, each with a person who matches it.","detail",["am","gold"]],

["soho","place","Cast-iron canyon","The facades, fire escapes and cobblestones of Greene Street.","Stand in the crosswalk at the end of a quiet block of Greene Street, only while traffic is stopped, and shoot straight down the street. Then cross over and shoot one facade square-on.","Keep every vertical line vertical.","deep",["am","rain"]],
["soho","moment","Doorway pause","People stepping out of a shop and stopping to check a phone, adjust a bag or light a cigarette.","Pick one doorway with a good frame around it and wait across the pavement. The pause lasts two seconds.","One doorway for twenty minutes.","shallow",["mid","gold"]],
["soho","energy","Stepping off the curb","The crowd at Broadway and Prince launching into the crossing when the light changes.","Stand on the corner the crowd is leaving, at the kerb edge just to one side of the crosswalk, and shoot across the front of the crowd in the first two seconds of each walk signal.","Shoot five light cycles and keep one frame from each.","zone",["mid","gold"]],
["soho","mood","Fire-escape shadows","Hard diagonal shadows laid across the building fronts by strong sun.","Expose for the sunlit wall. Wait for a person to cross a bright strip at street level beneath the shadow pattern.","The shadow is the subject; the person is punctuation.","silhouette",["mid","gold"]],
["soho","odd","Window doubles","Mannequins and passers-by merged in the shop glass.","Stand at an angle to the window until a mannequin and a reflected walker line up. Shift a step to change what the glass shows.","A real person and a fake one in every frame.","zone",["mid","gold","rain"]],

["jh","place","Under the 7","Roosevelt Avenue running beneath the elevated tracks, with shop signs in several alphabets.","Stand on a corner near 74th Street and include the steel overhead as the top third of the frame.","A train must be in the picture.","deep",["am","mid"]],
["jh","moment","Street food exchange","Momo carts and other street-food stalls around the station, and the moment the food is passed over.","Buy something first. Then stand at the side of the cart and photograph the next three customers.","Eat before you shoot.","zone",["gold","night"]],
["jh","energy","Roosevelt at dusk","Trains overhead, traffic below and lit signs on both sides.","Brace against a steel column. Let a train or a bus blur past a person waiting to cross.","Stay under the tracks for the whole set.","drag",["gold","night"]],
["jh","mood","Ladder light","Sun through the track ties, laying stripes across the street and everyone on it.","Expose for the stripes. Press when a face lands in a bright band and the body stays dark.","A face in light, nothing else.","silhouette",["am","mid"]],
["jh","odd","Stacked languages","Shopfronts with signs in Spanish, Bengali, Nepali and English within a few doors of each other.","Frame a run of signs square-on, then wait for someone to walk through.","At least three alphabets in the frame.","deep",["am","mid","gold"]],

["ferry","place","Skyline off the stern","Lower Manhattan pulling away, with the wake as a line back to it.","Go to the back of the boat as it leaves Whitehall; how much open deck there is depends on the boat. Put a railing or a passenger in the foreground for depth.","Shoot in the first five minutes after departure.","deep",["am","gold"]],
["ferry","moment","The statue side","On the trip to Staten Island, everyone crossing to the right-hand rail when the Statue of Liberty comes into view. Coming back, it is on the left.","Stay back from the rail and photograph the row of raised phones and heads, with the statue small beyond them.","The statue stays smaller than any face.","zone",["mid","gold"]],
["ferry","energy","Boarding surge","The terminal doors opening and several hundred people walking at once.","Stand inside the waiting room about 5 m back from the doors, square to them and beside a pillar out of the flow. Keep the door frame sharp and let the crowd streak away from you.","One crossing, one attempt.","drag",["am","gold"]],
["ferry","mood","Window seat at sunset","A lone commuter beside a salt-streaked window with low sun behind.","Ride the boat that leaves Whitehall about half an hour before sunset and sit on the right-hand (west) side; coming back, sit on the left. Expose for the window and let the rider go dark.","Indoor seats only; stay off the deck.","silhouette",["gold"]],
["ferry","odd","The ones not looking","Regulars asleep, reading or doing a crossword while the tourists crowd the rail.","Sit across the aisle. Frame the commuter in the foreground with the tourists as a blur of backs behind.","Both groups in one frame.","shallow",["am","gold"]],

["subway","place","Platform vanishing point","Columns, tile name panels and the yellow edge strip running to a single point.","Stand at the end of the platform and shoot down its length. Wait for one person between two columns.","Find a station with its original mosaic name tablet.","interior",["am","mid","gold","night","rain"]],
["subway","moment","Doors closing","The face of someone left on the platform, looking in as the doors shut.","Stand inside by the door, facing out. The window frames the person left behind.","Shoot only through the door glass.","interior",["am","mid","gold","night","rain"]],
["subway","energy","Train arriving","A train streaking in behind someone who does not look up.","Brace against a column and keep the waiting rider sharp. Start shooting when you feel the air move.","One still person, one moving train.","drag",["am","mid","gold","night","rain"]],
["subway","mood","Last car, late","A nearly empty car, one rider and the flat fluorescent light.","Sit at the far end of the car and include the row of empty seats. Reflections in the dark windows add a second layer.","Ride after 10 pm and stay in one car for three stops.","interior",["night"]],
["subway","odd","Platform concert","A cellist, a bucket drummer or a mariachi trio, and the commuters pretending not to listen.","Frame the musician from the side so the audience is in the background. Leave a dollar.","The listener's face matters more than the instrument.","interior",["gold","night"]],
["harlem", "place", "125th Street and the Apollo", "The Apollo Theater marquee with the street life of 125th Street passing beneath it.", "Stand across 125th Street from the theater so the marquee and the pavement below both fit. Wait for a passer-by who fills the foreground.", "The sign and a person in every frame.", "deep", ["gold"]],
["harlem", "moment", "Sunday best", "Churchgoers in hats and suits greeting each other on the steps before and after Sunday morning services.", "Stand on the public pavement outside one of the large churches near Adam Clayton Powell Jr. Boulevard as the late-morning service ends. Photograph from the street and do not take the camera inside.", "Keep your distance and lower the camera if anyone objects.", "deep", ["am", "mid"]],
["harlem", "energy", "Sidewalk commerce", "Vendors' tables, shoppers and music from speakers along 125th Street.", "Plant yourself against a lamppost and let the crowd pass on both sides. Keep one vendor still while the walkers blur.", "Stay in one spot for fifteen minutes.", "drag", ["gold"]],
["harlem", "mood", "Brownstone stoops at dusk", "Rows of brownstones in the Mount Morris Park historic district, with stoop railings and warm windows.", "From the kerb across the street, angle the camera down the block so the stoops on the far side repeat into the distance. Walk the side streets west of Marcus Garvey Park, around 120th to 123rd Street.", "One lit window in every frame.", "night", ["gold", "night"]],
["harlem", "odd", "Painted walls", "Memorial murals and hand-lettered shop signs, and the people who walk past them without looking.", "Frame a mural square-on, then wait for a passer-by whose clothes or pose echo something in the painting.", "A real person and a painted one in every frame.", "deep", ["mid", "gold"]],
["les", "place", "Orchard Street fire escapes", "Tenement fire escapes zigzagging above old shop signs and new boutiques.", "Stand in the middle of a quiet block of Orchard Street and shoot along it. Keep the buildings upright and wait for one person in the road.", "Keep every vertical line vertical.", "deep", ["am", "gold"]],
["les", "moment", "Essex Market counters", "Orders being weighed, wrapped and handed across the counters at the indoor market on Essex Street.", "Buy something first. Then stand at the end of a counter so the stallholder and the customer are both in view.", "Press only when two hands are in the frame.", "interior", ["am", "mid", "gold", "rain"]],
["les", "energy", "Off the bridge", "Cyclists, scooters and traffic coming off the Williamsburg Bridge onto Delancey Street.", "Stand by the end of the bridge's bike path at Clinton Street and brace on a railing. Blur a cyclist against the still steel.", "Something moving and something fixed in every frame.", "drag", ["am", "gold"]],
["les", "mood", "Neon in the window", "Bar and deli neon on Ludlow, Rivington and Orchard Street after dark, with people outside.", "Shoot through the window glass so the neon, the reflections and a face inside sit in layers.", "Every frame must include glass.", "night", ["night", "rain"]],
["les", "odd", "Old signs, new tenants", "Faded shop names from an earlier business still showing above whatever trades there now.", "Frame the old sign and the new shopfront together, square-on. Wait for a customer to walk in.", "Two eras in one frame.", "deep", ["am", "gold"]],
["flushing", "place", "Main Street and Roosevelt Avenue", "Signs in Chinese stacked up the buildings above one of the busiest crossings in the city.", "Stand at the kerb on Main Street and shoot along it, with the signs filling the upper half and the crowd below.", "At least ten signs in the frame.", "deep", ["mid", "gold"]],
["flushing", "moment", "Food court trays", "Bowls passed over counters and strangers sharing tables in the basement food court at New World Mall.", "Order, sit down, and photograph from your seat at table height. The counters are lit; the tables are dimmer.", "Shoot only while seated.", "interior", ["mid", "gold", "night", "rain"]],
["flushing", "energy", "The 7 lets out", "The crowd climbing the stairs from the Main Street terminal at rush hour and spreading across the pavement.", "Stand to one side of a station exit, out of the flow, braced on something solid. Focus on the far stair railing about 2 m away and let the crowd streak past it.", "Shoot three trainloads, then stop.", "drag", ["gold"]],
["flushing", "mood", "Street-food windows", "Skewers, dumplings and steam behind small serving windows lit by bare bulbs after dark.", "Stand at an angle to a window so the vendor is lit and the queue is in shadow. Expose for the vendor.", "A lit face and a dark crowd.", "night", ["night", "rain"]],
["flushing", "odd", "Produce on the pavement", "Durian, dragon fruit and tanks of live seafood spilling out of shopfronts onto the street.", "Get low and close to the display, with a shopper's hand reaching in.", "A hand in every frame.", "detail", ["am", "mid"]],
["wburg", "place", "Skyline from Domino Park", "The Williamsburg Bridge and the Manhattan skyline from the waterfront walkway, with the old sugar refinery behind you.", "Walk the elevated walkway and shoot along the railing toward the bridge. Put a person at the rail for scale.", "Bridge, skyline and one person.", "deep", ["am", "gold"]],
["wburg", "moment", "McCarren Park games", "Handball, kickball and softball games, and the players waiting their turn.", "Stand at the side of a court or field, level with the players, and watch the ones who are not playing.", "Photograph the bench, not the ball.", "shallow", ["mid", "gold"]],
["wburg", "energy", "Bedford Avenue on Saturday", "Crowds, bikes and buskers around the Bedford Avenue station.", "Crouch at the kerb near the station entrance so the nearest walker is large and the rest stack up behind.", "Feet and faces in the same frame.", "zone", ["mid", "gold"]],
["wburg", "mood", "Under the Williamsburg Bridge", "Steel, hard shadow bands and trains rumbling overhead where the bridge lands in Brooklyn.", "Stand in the shade under the approach and shoot out toward the light. Wait for a figure to cross a bright strip.", "One figure per frame.", "silhouette", ["am", "mid"]],
["wburg", "odd", "People in front of murals", "Large painted walls, and passers-by who briefly become part of them.", "Frame a mural square-on from across the street. Wait for someone to line up with a painted shape.", "The person must touch the painting's edge or shape.", "deep", ["mid", "gold"]],
["midtown", "place", "Sixth Avenue canyon", "The wall of office towers and their plazas along Sixth Avenue in the high 40s and low 50s.", "Stand at a plaza edge and shoot along the avenue. Keep the verticals straight and let the towers fill the frame to the top.", "Only a thin slot of sky above the avenue, narrowing toward the vanishing point.", "deep", ["mid"]],
["midtown", "moment", "Lunch on the ledge", "Office workers eating alone on plaza steps and ledges, and at the tables in Paley Park on 53rd Street.", "Pick one ledge with a clean background and wait across the pavement. The moment is the first bite or the glance at the phone.", "One person per frame.", "deep", ["mid"]],
["midtown", "energy", "Noon crosswalk", "The lunch-hour crowd stepping off the kerb on Fifth Avenue in the low 50s.", "Crouch at the kerb on your side, a step to one side of the crossing and level with the front of the waiting crowd, aiming across their path. Shoot as they step off and stride across your frame, about 2 m away, in the first two seconds of the walk signal.", "Five light cycles, one frame from each.", "zone", ["mid"]],
["midtown", "mood", "Bounced light", "Patches of sunlight reflected off glass towers onto shaded streets, lighting one person at a time.", "Find a bright patch on a shaded side street, expose for it and wait at its edge.", "The lit person and nothing else bright.", "silhouette", ["am", "mid"]],
["midtown", "odd", "Suits at the food cart", "Office workers in suits queuing at a halal cart, such as the one at 53rd Street and Sixth Avenue.", "Stand to the side of the queue so the cart, the cook and the line are all in view.", "A tie and a foil container in the same frame.", "zone", ["mid"]],
["cpark", "place", "Bethesda Terrace arcade", "The arches of the arcade framing the terrace and the Lake beyond. The fountain is fenced off for restoration until about summer 2027.", "Stand inside the arcade and shoot out through the centre arch toward the Lake. Wait for one person to walk into the light.", "Shoot from the shade into the light.", "deep", ["am", "gold"]],
["cpark", "moment", "On Bow Bridge", "Couples and families stopping at the middle of the bridge: the photo, the kiss, the proposal.", "Stand on the path along the east shore of the Lake, north of Bethesda Terrace, and frame the bridge side-on so its curve runs across the frame with the people at its crown.", "Wait for people to stop walking.", "deep", ["am", "gold"]],
["cpark", "energy", "Runners on the drive", "Runners and cyclists streaming around the park drive in the early morning and after work.", "Brace against a lamppost at a bend in the drive. Keep one person standing still, or a bench, sharp while the runners blur.", "One still thing, everything else moving.", "drag", ["am", "gold"]],
["cpark", "mood", "The Mall in bad weather", "The tunnel of elms and the rows of benches along the Mall in fog, rain or snow.", "Stand in the centre of the path at the south end and shoot along it. A single figure far down the path completes it.", "Go only when the weather is bad.", "deep", ["am", "rain"]],
["cpark", "odd", "Under the arcade", "Musicians, singers and wedding parties who use the tiled arcade at Bethesda Terrace for its sound and light.", "Go down the steps from the Mall into the arcade: the long hall under the road, with a tiled ceiling and a row of arches opening onto the fountain. Stand with your back to the wall opposite the arches, about two metres from the performer and a little to one side, and shoot along the hall. The performer takes one side of the frame, the listeners stand further along, and the arches glow along the far side. Expose for the performer's face and let the arches go bright.", "A performer and a listener in every frame.", "interior", ["mid", "gold", "rain"]],
["rockaway", "place", "Boardwalk to the horizon", "The concrete boardwalk, the dunes and the Atlantic running out of sight.", "Shoot along the boardwalk with the railing as a line. Keep the horizon level and put one walker in the distance.", "One frame with people, one with none.", "deep", ["am", "gold"]],
["rockaway", "moment", "Out of the water", "Surfers walking up the sand with their boards after a session.", "Stand on the sand near the surfing beach around Beach 90th Street, between the water and the boardwalk, and let them walk toward you.", "Board, face and water in one frame.", "freeze", ["am", "gold"]],
["rockaway", "energy", "On the wave", "Surfers taking off beside the rock jetties.", "Shoot from the sand beside a jetty, as close to the waterline as you can keep the camera dry. Use the 90 mm crop frame.", "Press only when someone is standing on a board.", "freeze", ["am", "gold"]],
["rockaway", "mood", "Winter beach", "Empty sand, fog over the water and one person walking a dog.", "Go on a cold weekday morning. Leave most of the frame empty and place the walker near an edge.", "The person takes up less than a tenth of the picture.", "deep", ["am", "rain"]],
["rockaway", "odd", "Surfboards on the shuttle", "Surfers carrying boards through the elevated station at Beach 90th Street.", "Wait on the platform at Beach 90th Street. Frame the board against the station signs.", "A surfboard and a station sign in the same frame.", "zone", ["am", "mid"]],
["arthur", "place", "The avenue", "Italian flags, striped awnings and salumeria signs along Arthur Avenue around East 187th Street.", "Stand at the corner of 187th Street and shoot along the avenue, with the awnings as a line down one side.", "At least three shop signs in the frame.", "deep", ["am", "mid"]],
["arthur", "moment", "Across the counter", "Bread, cheese and sausage being cut, weighed and handed over inside the Arthur Avenue Retail Market.", "Buy something first. Then stand at the end of a counter so both faces are in view.", "Press only when something changes hands.", "interior", ["am", "mid", "rain"]],
["arthur", "energy", "Saturday shopping", "Shoppers with full bags, double-parked cars and neighbours stopping to talk in the middle of the pavement.", "Crouch at the kerb so the nearest shopper is large and the street stacks up behind.", "Bags in every frame.", "zone", ["mid"]],
["arthur", "mood", "Café window", "Regulars at small tables inside a pastry shop or espresso bar, seen from the street.", "Shoot through the window so the lettering on the glass, the reflections and the faces inside sit in layers.", "Every frame must include glass.", "deep", ["mid", "gold"]],
["arthur", "odd", "Hand-rolled cigars", "Cigar rollers working at a bench inside the Retail Market.", "Ask first. Then get close to the hands and the leaf, with the roller's face soft behind.", "Hands sharp, face soft.", "detail", ["am", "mid", "rain"]],
["union", "place", "Greenmarket morning", "White tents, crates of produce and the queue at the bread stand along the north and west sides of the square, four mornings a week.", "Stand at the north end of the market and shoot down the aisle between the tents so the stalls stack up. Wait for a shopper carrying something that reads from a distance: flowers, a pumpkin, a full bag.", "Market days only: Monday, Wednesday, Friday and Saturday.", "deep", ["am", "mid"]],
["union", "moment", "Chess on the south side", "The chess tables near the south plaza: the player's hands, the clock, and the onlookers who lean in.", "Stand behind the challenger's shoulder so the regular's face is across the board from you. Shoot when a piece is lifted, not when it lands.", "Ask with a nod before the first frame; a dollar on the table is the custom if you stay.", "zone", ["mid", "gold"]],
["union", "energy", "The steps at rush hour", "Skaters on the south steps, commuters pouring out of the 14th Street station, and the crowd that forms around anyone with a speaker.", "Stand at the west end of the south steps, brace on the rail and shoot east along the steps. Keep one seated person sharp while the skaters and walkers blur past.", "Stay with one seated person through several passes; do not chase the skaters.", "drag", ["gold"]],
["union", "mood", "Metronome at dusk", "The glowing digits of the Metronome (now the Climate Clock) on the building across 14th Street, with the dark shapes of people on the steps in front.", "Stand at the top of the south steps and shoot across 14th Street at the moment the digits are brighter than the sky. Crouch a little so the people on the steps below show as dark shapes against the traffic lights.", "The clock must be readable in the frame.", "night", ["gold", "night"]],
["union", "odd", "The soapbox", "Preachers, petitioners and people with hand-lettered signs, and the one passer-by who stops to read.", "Frame the sign and the reader together and leave the speaker out. The reaction is the picture.", "Every frame needs a sign and a face.", "zone", ["mid", "gold"]],
["fidi", "place", "Wall Street from Federal Hall", "The columns of the Stock Exchange under its flags, the Washington statue, and the suits crossing Broad Street between them.", "Climb the Federal Hall steps, stand beside the Washington statue and look south down Broad Street, with the Exchange's columns and flags on your right. Keep the columns upright and wait for a figure to cross the gap below the flags.", "Shoot on a weekday morning; at weekends the suits are gone and tourists fill the street.", "deep", ["am", "mid"]],
["fidi", "moment", "Lunch on Stone Street", "The cobbled block of Stone Street with its long tables, waiters weaving through and office workers eating in the open air.", "Walk the block slowly from the Coenties Alley end and shoot along the tables. Look for the moment a plate arrives or a glass is raised.", "Weekday lunch, 12:30 to 2 pm, in warm weather.", "zone", ["mid"]],
["fidi", "energy", "Inside the Oculus", "The white ribs of the Oculus with commuters crossing the floor far below.", "Go to the upper balcony and shoot straight down the length of the hall. Brace on the rail and let the crowd blur between the ribs.", "Keep the ribs symmetrical in every frame.", "drag", ["am", "mid", "gold", "rain"]],
["fidi", "mood", "Canyon light", "A slot of sun reaching the pavement where a gap between towers or a cross street lets it through, for example along Broad Street around midday, with one person crossing it. Scout it the day before; each slot lasts only minutes.", "Find the slot, expose for the lit wall and wait at its edge. Press when a single figure is fully in the light.", "One figure per frame, never two.", "silhouette", ["mid"]],
["fidi", "odd", "The queue for the bull", "The line of tourists waiting to pose with the Charging Bull at Bowling Green, and the hands reaching for it.", "Stand at the bull's flank, not the front, and photograph the queue and the reaching hands with the bull's flank in a corner.", "No frame of the bull on its own.", "zone", ["mid", "gold"]],
["ktown", "place", "Korea Way stacked", "West 32nd Street between Fifth Avenue and Broadway, with restaurant signs stacked four storeys high and lit from the inside.", "Stand on the south pavement near Broadway and shoot up the street at a slight angle so the signs climb away from you. Hold the camera level.", "Shoot after dark, when every sign is lit.", "night", ["gold", "night", "rain"]],
["ktown", "moment", "The first bag", "People coming out of the Macy's doors on 34th Street with the day's first shopping bag, checking their phone or looking for a friend.", "Stand across the pavement from the doors with your back to the kerb. Frame the doorway and wait for a face that is doing something.", "Faces, not bags.", "freeze", ["mid", "gold"]],
["ktown", "energy", "Herald Square crossing", "The crowds crossing Broadway and Sixth Avenue at 34th Street, with the Empire State Building rising to the east.", "Stand at the south tip of Herald Square, where Broadway and Sixth Avenue cross 34th Street, and look east along 34th Street toward the Empire State Building. Lean your shoulder on a signal pole or lamppost. Pick one person who stays put, such as a traffic agent or a vendor, and keep them sharp while the crowd on the crossing streams past and blurs.", "Stay for three full light cycles before moving.", "drag", ["gold", "night"]],
["ktown", "mood", "Karaoke hour", "Groups spilling out of restaurants and karaoke bars on 32nd Street after midnight, with steam from the barbecue vents and neon in the wet.", "Shoot through and along the restaurant windows so reflections of the street lie over the diners inside. Get close to the glass.", "Every frame must include glass.", "night", ["night", "rain"]],
["ktown", "odd", "Souvenirs under the Empire State", "Stalls selling I Love NY shirts and foam crowns on 34th Street, with the Empire State Building directly above them.", "Get low beside a stall and tilt up so the merchandise fills the bottom of the frame and the tower rises out of it.", "Both must be in the frame: the tat and the tower.", "deep", ["mid", "gold"]],
["bushwick", "place", "Troutman Street walls", "The murals of the Bushwick Collective along Troutman Street and St Nicholas Avenue, wall after wall, with the street in front of them.", "Stand across the street from a wall and frame it with the kerb, a parked car and the pavement, not just the painting. Wait for someone to walk through.", "A person in every frame; the mural is the background.", "deep", ["mid", "gold"]],
["bushwick", "moment", "Posing for the wall", "People photographing each other in front of the murals: the pose, the phone, and the friend giving directions.", "Stand to one side so the poser, the photographer and the mural all fit. Shoot the instruction, not the pose.", "Never between the phone and its subject.", "zone", ["mid", "gold"]],
["bushwick", "energy", "Knickerbocker Avenue", "Shoppers, vendors and music from shopfront speakers along Knickerbocker Avenue on a Saturday afternoon.", "Plant yourself against a shopfront and let the pavement traffic pass on both sides. Keep one vendor still while the shoppers blur.", "Stay in one spot for fifteen minutes.", "drag", ["gold"]],
["bushwick", "mood", "Warehouse dusk", "The industrial blocks around Johnson and Morgan Avenues at dusk: loading docks, roll-down gates covered in graffiti, and the glow of loading-dock lamps.", "Walk the blocks north of Flushing Avenue as the street lights come on. Keep people small and let the walls carry the frame.", "No frame with more than one person.", "night", ["gold", "night"]],
["bushwick", "odd", "Painted eyes", "Murals with faces and eyes that seem to watch the street, and the people who walk past without looking back.", "Frame a painted face square-on, then wait for a passer-by whose glance, hat or colour answers it.", "The painted face and the real one must both be in focus.", "deep", ["mid"]],
["chelsea", "place", "The Tenth Avenue window", "The High Line's amphitheatre at 17th Street, where a glass window frames the traffic on Tenth Avenue below.", "Stand at the back of the steps and shoot through the window so the people seated on the steps and the avenue beyond stack up. Keep the window frame square.", "Shoot at dusk, when headlights and the sky balance.", "deep", ["gold", "night"]],
["chelsea", "moment", "Opening night", "Gallery openings in the West 20s between Tenth and Eleventh Avenues: people with a plastic cup of wine on the pavement outside, looking at each other rather than the art.", "Stand on the pavement opposite a lit gallery doorway and frame the door. Shoot the conversations outside, not the room inside.", "Thursday evenings, 6 to 8 pm.", "night", ["gold", "night"]],
["chelsea", "energy", "Chelsea Market concourse", "The long brick concourse of Chelsea Market at lunchtime, packed from wall to wall.", "Brace against a pillar near the Ninth Avenue entrance and shoot down the length of the hall. Keep one person still at a counter while the walkers blur past.", "Stay in one spot for ten minutes.", "drag", ["mid", "rain"]],
["chelsea", "mood", "Little Island at sunset", "The tulip columns of Little Island with the Hudson behind, and visitors reduced to shapes against the sky.", "Stand on the Hudson River Park walkway or Pier 54 just south of Little Island and shoot west into the light, so the tulip columns and the people on the paths above stand against the sky. Expose for the sky and let everyone go black.", "One or two figures, never a crowd.", "silhouette", ["gold"]],
["chelsea", "odd", "Vessel reflections", "The copper skin of the Vessel at Hudson Yards, bending the people and towers reflected in it.", "Get close to the base and shoot the reflections rather than the structure. Look for a person doubled or stretched in the metal.", "The reflection, not the object.", "zone", ["mid", "gold"]],
["brighton", "place", "Under the el on Brighton Beach Avenue", "The B and Q tracks overhead, produce stalls spilling onto the pavement and shop signs in Cyrillic.", "Stand in the middle of the pavement and shoot along the avenue so the steel columns repeat into the distance. Wait for a train to pass overhead.", "A column, a sign and a person in every frame.", "deep", ["mid", "gold"]],
["brighton", "moment", "Boardwalk benches", "Older residents on the boardwalk benches, in fur hats in winter and sun hats in summer, deep in conversation.", "Walk the boardwalk slowly on the sea side and shoot across to the benches. Frame two people mid-conversation, hands included.", "Keep your distance and respect a wave-off.", "shallow", ["am", "gold"]],
["brighton", "energy", "Boardwalk dinner", "The restaurant terraces on the boardwalk on a summer evening: waiters, music, families at long tables and strollers passing in front.", "Stand on the boardwalk at the edge of the terrace and shoot along the row of tables as the strollers pass between you and the diners.", "Summer evenings only; the terraces close in the cold.", "zone", ["gold"]],
["brighton", "mood", "Grey sea, one figure", "The wide winter beach with a single walker or swimmer against a flat grey sea.", "Shoot from the boardwalk steps straight out to sea, with the figure small and low in the frame.", "Most of the frame must be sky and water.", "deep", ["am", "rain"]],
["brighton", "odd", "Caviar and kitsch", "Shop windows stacked with tins of caviar, smoked fish, Soviet-era ornaments and nesting dolls.", "Get square to the glass and fill the frame with the window. Include your own reflection or a passer-by only if it adds something.", "Square to the window, shelves level, no tin cut in half at the edges.", "detail", ["mid", "rain"]],
["cpark", "mood", "Yellow elms on the Mall", "The American elms over the Mall turn yellow in early to mid November, and the walkers beneath them wear dark coats.", "Stand at the south end of the Mall and shoot along it so the canopy closes over the path. Wait for one figure in a dark coat against the yellow.", "Dark clothes against yellow leaves, nothing else.", "deep", ["am", "gold", "rain"], [10, 11]],
["cpark", "moment", "Leaf-catchers", "Children and couples trying to catch falling leaves, and people photographing each other in the colour.", "Find a tree that is dropping leaves in the wind and wait beside it. Shoot the reach and the miss, not the catch.", "Hands in the air in every frame.", "freeze", ["mid", "gold"], [10, 11]],
["wsp", "mood", "Leaves over the chess tables", "The trees on the south-west side of the square in colour, over the chess players and the fallen leaves on the ground.", "Crouch at the end of a table, beside the board, and aim slightly up so the leaves fill the top of the frame and the board the bottom.", "Colour above, concentration below.", "shallow", ["mid", "gold"], [10, 11]],
["harlem", "place", "Brownstones in colour", "The street trees along the brownstone blocks west of Marcus Garvey Park turning orange against the brown stone.", "Shoot along a row from the kerb so the stoops repeat under the canopy. One person on a stoop or walking is enough.", "A stoop, a tree and a person.", "deep", ["am", "gold"], [10, 11]],
["dumbo", "place", "Fort Greene Park in colour", "The slopes of Fort Greene Park, about 25 minutes' walk south-east of DUMBO, with the Prison Ship Martyrs' Monument above the autumn trees.", "Enter from Myrtle Avenue and stop on the lower slope. Look up the hill so the paths climb through the colour to the monument column at the top, and wait for a walker on the path.", "Include a path and someone on it.", "deep", ["am", "gold"], [10, 11]],
["brighton", "mood", "Autumn on the boardwalk", "Low autumn light along the boardwalk, long shadows and the first fur hats of the year.", "Walk west into the low sun in the late afternoon and shoot the benches and walkers against it, so their shadows run back toward you.", "Shadows longer than the people who cast them.", "silhouette", ["gold"], [10, 11]],
["union", "odd", "Pumpkins and skateboards", "The pumpkin stalls at the 14th Street end of the market, where skaters ride past within a few metres on their way to the south steps.", "Frame a pumpkin stall with the steps behind it and wait for a skater to pass through the gap.", "A pumpkin and a skateboard in one frame.", "zone", ["mid", "gold"], [10, 11]],
/* Seasonal and event ideas: shown only in their months; the last field names them, as several can share a place and intent. */
["soho", "moment", "Before the Halloween Parade", "Thousands of marchers in costume lining up on Sixth Avenue below Spring Street before the 7 pm start: puppets being assembled, last touches to make-up, a skeleton checking a phone.", "Go to Sixth Avenue between Canal and Spring Street from about 6 pm, where the marchers gather. Work along the line-up rather than the packed barriers further north, and ask before going close; most marchers are glad to be photographed.", "Photograph the person inside the costume, not just the costume.", "night", ["night"], [10], "halloween"],
["wburg", "energy", "Marathon on Bedford Avenue", "The New York City Marathon pouring up Bedford Avenue through Williamsburg around mile 12, with the crowd, bands and hand-made signs pressed against the barriers.", "Stand at the barrier on Bedford Avenue in north Williamsburg, facing south so the runners come toward you. Brace on the barrier and hold one still spectator or sign sharp at 1/15 s while the field streams past.", "One runner, one face or one sign per frame, not the whole field.", "drag", ["am", "mid"], [11], "marathon"],
["cpark", "odd", "Balloons the night before", "The giant Thanksgiving balloons lying under nets on West 77th and 81st Street the afternoon before the parade, half-inflated, with handlers in jackets and a slow line of visitors filing past.", "Join the public viewing line (in recent years it has started at West 72nd Street and Columbus Avenue; check Macy's site for this year's route) and shoot as you walk. Look for scale: a child against a giant face, a handler ducking under a net.", "Every frame needs a person for scale.", "deep", ["mid", "gold"], [11], "balloons"],
["midtown", "place", "Balloons over Sixth Avenue", "The Thanksgiving Day Parade balloons coming down Sixth Avenue between the towers, the handlers leaning on the ropes and the crowd craning up.", "Find a place at the barrier on Sixth Avenue in the high 40s or 50s by about 6:30 am. Shoot up the avenue so the towers frame the balloon, then turn and photograph the faces looking up.", "Balloon and people in the same frame.", "deep", ["am", "mid"], [11], "parade"],
["midtown", "mood", "Holiday windows on Fifth Avenue", "Faces lit by the holiday windows on Fifth Avenue at Saks and Bergdorf Goodman: children lifted up to see, couples turning to each other, the street reflected over the displays.", "Stand at the edge of the crowd at a window and a little to the side, so you see the faces lit by the window rather than the display itself. Expose for the faces and let the street go dark.", "Photograph the people looking, not the window.", "night", ["night", "gold"], [11, 12, 1], "windows"],
["midtown", "energy", "Skaters at Bryant Park", "The ice rink of Bryant Park's Winter Village, skaters circling under the lights with the towers along 42nd Street behind.", "Brace on the rink rail and set a slow shutter. Keep one skater who has stopped at the rail sharp while the others circle past as streaks of colour.", "One still skater, the rest in motion.", "drag", ["gold", "night"], [10, 11, 12, 1, 2, 3], "rink"],
["union", "mood", "Holiday market lanterns", "The red-and-white stalls of the Union Square Holiday Market after dark, steam from the cider stands, and shoppers lit by the stalls in the narrow lanes.", "Walk the lanes after dark and stop where a stall's light falls on a face from the side. Shoot across the lane with that light, not into the bare bulbs.", "One lit face, the rest in shadow.", "night", ["night"], [11, 12], "market"],
["wsp", "place", "Snow under the arch", "Washington Square Arch in falling snow, the paths white and a few walkers leaving tracks.", "Go while it is still snowing. Stand south of the fountain, centre the arch and add about one stop of exposure so the snow stays white; wait for one walker on the path.", "Falling snow, not just snow on the ground: go while it is coming down.", "deep", ["rain"], [12, 1, 2, 3], "snow"],
["chinatown", "moment", "Lion dance at the shop door", "Lion dancers going from shop to shop on Mott and Bayard Street for Lunar New Year, drums behind them, shopkeepers holding out red envelopes, confetti in the air.", "Follow the drums. Stand to one side of the shop door the lion is facing, so the lion's head and the shopkeeper with the envelope are in the frame together, and shoot a short burst as it rears up.", "The lion and a human face in the same frame.", "freeze", ["am", "mid"], [1, 2], "lunar"],
].map((a,n)=>({id:a[9]?a[0]+"-"+a[9]:a[0]+"-"+a[1]+(a[8]?"-s":""),p:a[0],i:a[1],t:a[2],look:a[3],work:a[4],rule:a[5],r:a[6],w:a[7],m:a[8]||null}));

/* Work it details per idea: [what to keep sharp, camera height, distance to it in metres, when to press, crop frame in mm when the subject is far].
   The focus advice is built from these and the idea's recipe, for the chosen camera. */
const WORKX = {"chinatown-place":["the person rounding the bend","Eye level, camera held level so the buildings stay upright",15,"When the person is right at the bend, where the street disappears"],
"chinatown-moment":["the hands and the faces just above them","Chest height, level with the scale",2,"With money or a bag halfway between two hands"],
"chinatown-energy":["one vendor standing behind their stall","Eye level through the viewfinder, shoulder against the pole",3,"When the crowd is thickest between you and the vendor"],
"chinatown-mood":["a face inside, behind the steam", "Eye level, lens 30 to 50 cm from the glass and angled a little, so a red sign across the street reflects over part of the window; move closer to cut reflections, back to add them", 2, "When a face lines up with a clear patch between the reflections"],
"chinatown-odd":["the watchers' faces, not the board", "Eye level with the standing onlookers", 3, "When one face reacts differently: a wince, a laugh, a pointing finger"],
"gct-place":["the clock on the information booth","Eye level at the top of the stairs, elbows on the balustrade",30,"When the walkers around the clock are spread out, not bunched"],
"gct-moment":["your one waiting person","Eye level",5,"On the wave, the hug, or the moment they spot each other"],
"gct-energy":["the one person standing still at the departures board","Eye level, elbows planted on the stair rail",20,"When a stream of walkers crosses close to the still person",50],
"gct-mood":["the figure inside the bright patch","Eye level, or from the balcony looking down when the patch is below you",10,"When one figure is fully inside the patch, mid-stride"],
"gct-odd":["the person speaking into the corner","Eye level, square to the tiled corner",3,"While their face is turned into the tiles"],
"tsq-place":["the crowd along the bottom edge","Eye level from the top step, camera level",30,"At dusk, when the sky is as bright as the screens"],
"tsq-moment":["the face of the person coming up the stairs", "Chest height, a little below their eyes as they rise", 3, "The moment their eyes lift to the screens", 75],
"tsq-energy":["the dark figure or lamppost on the third","Eye level, shoulder against a lamppost",4,"Each time the screens change colour: three frames, same framing"],
"tsq-mood":["the reflected screens, with feet and umbrellas along the top","On the ground: camera a few centimetres above the puddle, screen tilted up",4,"When an umbrella crosses the brightest part of the reflection"],
"tsq-odd":["the performer: costume and face together","Chest height, from the side",3,"When the costume head and the human head are both in view"],
"wsp-place":["the arch","Eye level, centred on the arch, camera level",40,"When a single walker is centred under the arch"],
"wsp-moment":["the hand over the piece, then the face", "Seated at the next table, camera at the players' eye level", 2, "As the hand hovers over a piece or slaps the clock"],
"wsp-energy":["the performer","Crouched at the front of the ring, aiming slightly up",4,"At the top of the jump or spin; shoot a short burst through it"],
"wsp-mood":["the reader's outline against the bright path","Eye level, facing the sun",15,"When the reader is still and the shadows reach toward you"],
"wsp-odd":["the regular's eyes", "Eye level, after you have talked", 3, "After the conversation, when they go back to what they were doing"],
"dumbo-place":["the bridge tower and the Empire State Building","Eye level, camera level; step left or right to line them up",100,"When one person crosses the street below the tower"],
"dumbo-moment":["the couple, or whoever is fixing the dress","Chest height, to one side of their photographer",3,"Just after their photographer lowers the camera"],
"dumbo-energy":["the stone edges of the arch","Eye level, shoulder against the arch wall",6,"When a cyclist is inside the bright opening"],
"dumbo-mood":["the figure at the water's edge","Low, with the camera resting on a rock or the railing",6,"In the 20 minutes after sunset, while the figure stands still"],
"dumbo-odd":["the rails from about 2 m out to the modern detail", "On the ground: camera just above the cobbles, screen tilted up", 4, "When the modern detail sits where the rails meet"],
"coney-place":["the planks about 8 m ahead", "Eye level, or lower to stretch the planks", 8, "Once with a walker on the boardwalk, once with nobody"],
"coney-moment":["the faces in the front car","Eye level, aimed up at the first drop",25,"As the front car tips over the top; hold a burst through the drop",90],
"coney-energy":["the ticket booth or the waiting parent","Eye level, camera braced on the fence",5,"When the ride is at full speed"],
"coney-mood":["the walker","Eye level",30,"When the walker is near the edge of the frame, heading out of it"],
"coney-odd":["the painted sign","Square-on, with the centre of the sign at lens height",3,"When a passer-by matches the sign's colour or pose"],
"soho-place":["the facades a third of the way down the block","Eye level, camera level",20,"Once with the street empty, once with one person in it"],
"soho-moment":["the face of the person in the doorway","Eye level, from across the pavement",4,"In the two-second pause: phone out, bag adjusted, lighter up"],
"soho-energy":["the front walker as they step off","Crouched at the kerb, screen tilted up",2,"In the first two seconds of the walk signal"],
"soho-mood":["the sunlit wall","Eye level",10,"When the person is inside the bright strip"],
"soho-odd":["the reflected walker and the mannequin","Eye level, at an angle to the window",3,"When the reflected walker and the mannequin line up"],
"jh-place":["the street a third of the way down","Eye level, camera level",15,"When a train is overhead"],
"jh-moment":["the hands and the food","Chest height, at the side of the cart",2,"As the food passes from the vendor to the customer"],
"jh-energy":["the person waiting to cross","Eye level, shoulder against a steel column",4,"As a train or bus passes behind them"],
"jh-mood":["the face in the bright band","Eye level",4,"When a bright band crosses the eyes"],
"jh-odd":["the signs","Square-on to the shopfronts, from across the street",15,"When a walker is centred below the signs"],
"ferry-place":["the railing or passenger in the foreground", "Eye level at the stern rail", 6, "In the first five minutes after leaving Whitehall"],
"ferry-moment":["the row of raised phones and the backs of heads", "Eye level, a few steps back from the rail", 3, "When the statue sits in a gap between heads"],
"ferry-energy":["the door frame", "Eye level, shoulder against a pillar", 5, "As the doors open and the crowd starts to move"],
"ferry-mood":["the rider's profile against the window","Seated, at the rider's eye level",3,"When the rider turns into profile"],
"ferry-odd":["the commuter's eyes","Seated across the aisle",2,"When the tourists crowd the rail behind"],
"subway-place":["the person between the columns","Eye level, camera level",15,"When one person stands between two columns"],
"subway-moment":["the face outside the door","Eye level, lens against the door glass",1.5,"As the doors close and the look happens"],
"subway-energy":["the waiting rider","Eye level, shoulder against a column",3,"When you feel the air move, before the train fills the frame"],
"subway-mood":["the lone rider at the far end","Seated, camera at seat height",10,"Between stations, when the rider is still"],
"subway-odd":["the listener's face","Eye level, from the side of the musician",3,"When a listener gives themselves away"],
"harlem-place":["the passer-by in the foreground","Eye level",4,"When a passer-by fills the foreground under the lit marquee"],
"harlem-moment":["the faces under the hats","Eye level, from the public pavement",6,"As people greet each other on the steps after the service",50],
"harlem-energy":["one vendor at their table","Eye level, shoulder against a lamppost",3,"When shoppers pass close between you and the vendor"],
"harlem-mood":["the stoop nearest the lit window","Eye level, camera level",8,"At blue hour, when the windows and the sky are equally bright"],
"harlem-odd":["the mural", "Eye level, square-on; step back until the mural fits so its edges stay straight", 6, "When the passer-by echoes the painting"],
"les-place":["the person in the road","Eye level, camera level",15,"When the person is where the fire escapes meet"],
"les-moment":["the hands and the goods","Chest height, at the end of the counter",1.5,"When the goods change hands"],
"les-energy":["the bridge steel and the edge of the path", "Eye level, braced on the railing", 5, "When a cyclist is halfway along the path"],
"les-mood":["a face inside", "Eye level, about an arm's length back from the glass so the street reflections show", 2, "When the neon reflection and a face line up"],
"les-odd":["the doorway","Square-on, from across the street",10,"When a customer is in the doorway"],
"flushing-place":["the crowd at the kerb","Eye level",10,"When the crowd fills the bottom of the frame"],
"flushing-moment":["the bowl and the hands","Seated, at table height",1.2,"As a bowl is set down or passed across"],
"flushing-energy":["the far stair railing", "Eye level, braced on the railing", 2, "As each trainload rises up the stairs"],
"flushing-mood":["the vendor's face in the window light","Eye level, at an angle to the window",3,"When the vendor hands food out"],
"flushing-odd":["the fruit or tank where the hand reaches in","Low, at the height of the display",0.8,"When a hand enters from a corner"],
"wburg-place":["the person at the rail","Eye level along the railing",10,"When the person at the rail stands still"],
"wburg-moment":["the waiting players' faces","Eye level, level with the players",4,"When a waiting player reacts to the game"],
"wburg-energy":["the nearest walker", "Crouched at the kerb, screen tilted up", 3, "When the nearest walker is large on one side"],
"wburg-mood":["the figure's outline in the bright strip","Eye level",10,"When the figure is inside the bright strip"],
"wburg-odd":["the mural", "Chest to eye level, camera level and square to the mural", 12, "When a person lines up with a painted shape"],
"midtown-place":["the avenue a third of the way down","Eye level, camera level",30,"When the crossing in front of you is busy"],
"midtown-moment":["the person's eyes","Eye level, from across the pavement",5,"On the first bite or the glance at the phone"],
"midtown-energy":["the front walker","Crouched at the kerb, screen tilted up",2,"In the first two seconds of each walk signal"],
"midtown-mood":["the person in the bright patch","Eye level",8,"When the person is fully inside the patch"],
"midtown-odd":["the suit and the cart", "Chest height, beside the queue", 5, "When the foil container changes hands"],
"cpark-place":["the person in the arch opening","Eye level, centred in the arcade",15,"When one person walks into the light"],
"cpark-moment":["the couple at the crown of the bridge", "Eye level", 60, "When they stop at the crown: the photo, the kiss", 60],
"cpark-energy":["the person standing still or the bench", "Eye level, shoulder against a lamppost", 5, "As a group of runners passes the still subject"],
"cpark-mood":["the lone figure", "Eye level, centred on the path", 40, "When one figure is on the centre line, about 40 m down the path"],
"cpark-odd":["the performer's face and hands","Eye level, back against the wall opposite the arches",2,"Mid-phrase, when a listener behind the performer reacts: a smile, closed eyes, a sway"],
"rockaway-place":["the railing about 8 m ahead", "Eye level, horizon level", 8, "With one walker in the distance"],
"rockaway-moment":["the surfer","Crouched on the sand",8,"As they walk toward you with the board",50],
"rockaway-energy":["the surfer on the wave","Low, at the waterline",50,"As they stand up on the board",90],
"rockaway-mood":["the walker and the dog","Eye level, horizon low in the frame",40,"When the walker is near an edge"],
"rockaway-odd":["the surfboard and the station sign","Eye level, on the platform",3,"When the board and the sign line up"],
"arthur-place":["the shopper at the near awning", "Eye level", 8, "When a shopper is at the near awning"],
"arthur-moment":["the hands and the goods","Chest height, at the end of the counter",1.5,"When something changes hands"],
"arthur-energy":["the nearest shopper and their bags","Crouched at the kerb, screen tilted up",2,"When the nearest shopper is large in the frame"],
"arthur-mood":["the faces inside","Eye level, close to the glass",3,"When a face sits inside a pane"],
"arthur-odd":["the hands and the leaf","At bench height, beside the roller",0.6,"As the leaf is rolled"],
"union-place":["the shopper carrying something","Eye level",8,"When a shopper with flowers, a pumpkin or a full bag walks down the aisle"],
"union-moment":["the regular's face and the hand on the piece","Standing, over the challenger's shoulder",2,"As a piece is lifted, before it lands"],
"union-energy":["one person sitting on the steps","Eye level, braced on the rail",5,"As skaters and walkers pass the seated person"],
"union-mood":["the Metronome digits","Eye level",60,"When the digits are brighter than the sky"],
"union-odd":["the reader's face and the sign", "Eye level", 3, "When the reader reacts", 35],
"fidi-place":["the suits crossing Broad Street","Eye level from the top steps, camera level",25,"When a figure crosses the gap below the flags"],
"fidi-moment":["the plate or the glass","Chest height, along the tables",2,"As a plate arrives or a glass is raised"],
"fidi-energy":["the white ribs","Eye level, braced on the balcony rail",30,"When the floor below is busiest"],
"fidi-mood":["the lit pavement in the slot","Eye level",15,"When a single figure is fully in the light"],
"fidi-odd":["the reaching hands","Chest height, at the bull's flank",2,"As a hand touches the bull"],
"ktown-place":["the lit signs about 30 m up the street", "Eye level, camera level", 30, "After dark, with every sign lit and a walker beneath them"],
"ktown-moment":["the face coming out of the doors", "Eye level", 4, "When someone stops: checks the phone, looks for a friend", 50],
"ktown-energy":["one person who stays put: a traffic agent or a vendor at a cart", "Eye level, camera to your eye, shoulder against a signal pole or lamppost", 4, "When the walk signal starts and the crossing fills with people"],
"ktown-mood":["the diner's face behind the reflection","Eye level, close to the glass",2,"When a reflection lands on a face"],
"ktown-odd":["the souvenirs at the bottom of the frame", "Low beside the stall, tilted up", 2, "When the souvenirs fill the bottom and the tower rises clear"],
"bushwick-place":["the walker","Eye level, from across the street",10,"When someone walks in front of the wall"],
"bushwick-moment":["the friend giving directions","Chest height, to one side",3,"When the photographer gives an instruction"],
"bushwick-energy":["one vendor","Eye level, back against a shopfront",3,"When shoppers pass close"],
"bushwick-mood":["the lit wall or gate","Eye level",10,"As the street lights come on, with one person small in the frame"],
"bushwick-odd":["both faces, the painted one and the real one","Eye level, square to the mural",5,"When the passer-by's glance answers the painted one"],
"chelsea-place":["the people seated on the steps", "Standing at the back of the steps, camera level", 10, "At dusk, when the headlights and the sky balance"],
"chelsea-moment":["the faces in conversation", "Eye level", 12, "When a conversation turns: a laugh, a gesture", 90],
"chelsea-energy":["one person standing still at a counter","Eye level, shoulder against a pillar",6,"When the hall is at its fullest"],
"chelsea-mood":["the edge of a column against the sky","Eye level, or lower for more sky",20,"When one or two figures stand clear of the columns"],
"chelsea-odd":["the reflected figure","Eye level, close to the base",3,"When a figure is doubled or stretched in the metal"],
"brighton-place":["the person under the el","Eye level",8,"When a train passes overhead"],
"brighton-moment":["the faces of the two people talking","Eye level, from across the boardwalk",6,"Mid-gesture, with hands up",50],
"brighton-energy":["the strollers passing in front","Eye level",3,"When a stroller is between you and the diners"],
"brighton-mood":["the figure","Eye level from the steps",40,"When the figure is small and low in the frame"],
"brighton-odd":["the window display","Square-on, with the centre of the window at lens height",1.5,"When the reflections are quiet"],
"cpark-mood-s":["the figure in the dark coat","Eye level, centred on the path",25,"When one dark figure is under the canopy"],
"cpark-moment-s":["the reaching hands and the face","Crouched, so the hands rise into the sky",3,"As the hands reach and miss"],
"wsp-mood-s":["the player's eyes","Low, across the table",1.5,"When the player studies the board"],
"harlem-place-s":["the person on the stoop","Eye level, from the kerb",10,"When one person is on a stoop or walking past"],
"dumbo-place-s":["the walker on the path","Crouched, aiming slightly up the slope",20,"When a walker is on the path below the monument"],
"brighton-mood-s":["the outlines of the benches and figures","Eye level",8,"When a figure's shadow stretches toward you"],
"union-odd-s":["the skater","Chest height",3,"As the skater passes through the gap"]};

/* Tips for the best shot: two per idea, plus one for the kind of shot (WORK_REC_TIP). */
const WORK_TIPS = {"chinatown-place":["Doyers is busiest around lunch; go early morning for a clean bend with one person in it.","Red signs and lanterns pop more under overcast light than in hard sun, which blows them out."],
"chinatown-moment":["Stalls are busiest on weekend mornings; bring small cash and buy something to earn a place beside the scale.","Watch the vendor's hands, not the customer: the handoff starts when the vendor reaches for the bag."],
"chinatown-energy":["The pole near the Mott Street corner works well: the crowd splits around it on both sides.","Choose a vendor in bright clothes or under an awning light so the still point stands out from the blur."],
"chinatown-mood":["Rain or cold nights fog the windows most; a warm, busy kitchen gives the best steam.","Wear dark clothes so your own reflection does not show in the glass."],
"chinatown-odd":["Arrive mid-morning when the games are underway and the rings of onlookers are deepest.","Stand in the second row of watchers; the players ignore you and the faces opposite are in full view."],
"gct-place":["Weekday mornings around 8:30 give a busy floor with walkers spread out; Sunday mornings are nearly empty.","Tripods need a permit, so brace your elbows on the stone balustrade instead."],
"gct-moment":["Late afternoon on Friday has the most meetings: people catching weekend trains and visitors arriving.","Watch for someone checking their phone and scanning the crowd at the same time; the meeting is usually seconds away."],
"gct-energy":["Shoot 5:15 to 5:45 pm on a weekday, when the floor is fullest.","Someone looking up at the departures board stands still longest; that is your sharp figure."],
"gct-mood":["Clear winter mornings, when the sun is low, give the best chance of light reaching the floor.", "Spot-meter the patch; the dark marble around it falls to black on its own."],
"gct-odd":["Go off-peak, mid-morning or mid-afternoon, when the arch is quieter and people take turns.", "Watch for the moment the listener across the arch reacts; it is the funniest frame.", {"q328": "Use the 50 mm crop frame, or step to 2 m, to keep the corner tight."}],
"tsq-place":["The red steps fill up at dusk; arrive 20 minutes early to take a spot at the top rail.","Shoot a series through blue hour: the best balance between sky and screens lasts only about ten minutes."],
"tsq-moment":["Tourists arriving from Penn Station and the airports come up the 42nd Street exits; weekend evenings are best.","Children and first-time visitors react the most; watch for groups pointing up."],
"tsq-energy":["Watch one big screen for a minute to learn its rhythm, then press on the change.","Pick a spot under one dominant screen so the colour of the whole frame shifts with it."],
"tsq-mood":["Go within an hour after rain stops, before the plaza dries and the puddles shrink.","Bring a small cloth: the camera ends up close to wet ground."],
"tsq-odd":["Performers take breaks in the early-afternoon lull, between the lunch and evening crowds.","Do not tip for a pose; a picture taken after a tip is a portrait, not a candid."],
"wsp-place":["Early morning has soft light on the arch and almost nobody in the way.", "On the second shot, move closer or further until the arch's curve just touches the top of the frame."],
"wsp-moment":["Players at the southwest corner tables play fast blitz; a five-minute game gives you plenty of hand moves.","Ask the player at the next table if you can sit; a nod is enough, and players tend to ignore you after the first minute."],
"wsp-energy":["Weekend afternoons in warm weather bring the big acts; the crowd gathers by about 2 pm.", "Watch a performer's routine once first: the big jump usually comes at the same point every time.", {"q343": "At 4 m the 43 mm frame is only about 2 m tall: turn the camera vertical, or step back to 6 m, so the whole jump and the crowd fit."}],
"wsp-mood":["The best light reaches the western paths in the last hour before sunset from autumn to spring.","Shade the lens with your hand so the sun does not cause flare across the reader."],
"wsp-odd":["The pianist, the pigeon man and the poets keep regular afternoon hours; return on the same day of the week.","Offer to email them a picture; it often opens a longer, better session."],
"dumbo-place":["Weekday mornings before 8 am are the only time the street is clear of crowds.","Fog or low cloud can hide the Empire State Building; check the view on a webcam or the forecast first."],
"dumbo-moment":["Weekend afternoons have the most wedding and engagement shoots.","Watch the other photographer: when they check their screen, the couple relaxes, and that is your moment."],
"dumbo-energy":["Late afternoon puts the brightest light at the open end of the archway.","Pan with a cyclist at 1/15 s for a sharp rider on a streaked background, as a second version."],
"dumbo-mood":["Arrive before sunset to find your rock, then shoot in the 20 minutes after it, while the sky still has colour and the skyline lights come on.", "Rest the camera on a rock and use the 2-second self-timer so pressing does not shake it."],
"dumbo-odd":["Overcast or wet days make the cobbles and rails shine; dry midday light flattens them.","Turn the screen up and shoot from cobble level; even 20 cm higher loses the drama."],
"coney-place":["Morning sun comes from the east, lighting the wheel from the side for shape.","Out of season the boardwalk is empty; in summer, shoot before 10 am."],
"coney-moment":["Weekend afternoons in summer have the longest lines and the most riders.","Learn the ride's rhythm: the front car reaches the top about the same time after each departure."],
"coney-energy":["Shoot at blue hour, when the ride lights show but the sky still has colour.","Rest the camera on the fence rail with your hand on top to stop it sliding."],
"coney-mood":["Fog rolls in most on spring mornings; check for fog advisories the night before.","Walk past the shuttered stands first: a closed sign or a lone gull makes a second frame."],
"coney-odd":["The sideshow banners on Surf Avenue and West 12th Street change each season; look for new ones in spring.","Shoot signs in open shade; hard sun washes out painted colour."],
"soho-place":["Sunday mornings before 9 am are quiet and the cobbles are empty.","After rain, the wet cobbles reflect the facades and add shine."],
"soho-moment":["Choose a shop with a strong doorway frame and few shoppers, so each exit is separate.","Stand still and let people get used to you; after five minutes they stop noticing."],
"soho-energy":["Weekend afternoons have the biggest crowds stepping off at Broadway and Prince.", "Get closer than feels natural: at 2 m the front walker fills one side of the frame."],
"soho-mood":["Late-morning sun on east-facing facades, or afternoon sun on west-facing ones, throws the cleanest fire-escape shadows.","Shadows move fast: find your frame first, then wait for the person."],
"soho-odd":["Windows in shade facing a sunlit pavement show the strongest reflections: the walker must be in light, the glass in shadow.", "Shoot a few frames as people pass and choose later; the alignment is often in the frame you did not expect."],
"jh-place":["Late morning puts sun through the tracks onto the street below.","Trains run every few minutes; frame first, then wait for one."],
"jh-moment":["Carts are busiest after 6 pm around Diversity Plaza and 74th Street.","Cart lights are warm and close: catch the customer's face near the light for the best glow."],
"jh-energy":["Dusk is ideal: signs lit, traffic headlights on, enough sky to separate the tracks.","Choose a person under a shop light so they stay bright while the street blurs."],
"jh-mood":["Midday on a clear day gives the sharpest stripes under the tracks.", "Highlight-Weighted metering already exposes for the bright bands, so leave compensation at 0 (−0.7 at most); the shade around them should be almost black."],
"jh-odd":["Weekday mornings have fewer parked vans blocking the shopfronts.","Shoot from across the street so the signs fill the frame without tilting up."],
"ferry-place":["Stand at the stern before the boat leaves; the rail fills up quickly.","Early morning ferries are quiet and the light is soft on the skyline."],
"ferry-moment":["Board early and claim a spot a few steps back from the right-hand rail before the crowd moves.","Stand on a bench or step behind the crowd so the raised phones line up against the water."],
"ferry-energy":["Rush-hour boats from Whitehall have the biggest crowd surge.","Ask a staff member where the doors open first; that is where to stand."],
"ferry-mood":["The windows are salty; choose one with streaks that catch the light rather than a clean one.", "Expose with −1.3 EV for the window so the rider goes dark.", "Wait for a clean profile: nose, lips and chin outlined against the glass."],
"ferry-odd":["Commuter-hour boats have the most regulars; weekend middays have the most tourists.","A sleeping commuter is the classic shot; take it quietly and only once."],
"subway-place":["Look for the original mosaic name tablets at Astor Place, Bowling Green, Wall Street and many stations on the 1 line.","Late-evening platforms are quieter, so one person stands alone more often."],
"subway-moment":["Stand by the door on the platform side of the train before it reaches a busy stop.", "Use the viewfinder rather than the rear screen and wear something dark; both make your reflection in the door glass fainter."],
"subway-energy":["Stand near the end of the platform where trains come in: they enter fastest and slow as they pass, so the blur is strongest there.", "Stand well back from the platform edge; brace on a column, never lean out."],
"subway-mood":["Late-night trains on long lines, such as the A or the F, empty out after Manhattan.","Sit at the end of the car so the empty seats line up in perspective."],
"subway-odd":["Music Under New York performers play at Times Square, Union Square, 34th Street and Grand Central.","Leave a dollar before you start shooting; musicians are friendlier and you blend in."],
"harlem-place":["The Apollo marquee lights up at dusk; arrive before sunset to frame it.","Wednesday evenings have Amateur Night crowds outside the theatre."],
"harlem-moment":["Late-morning services usually end between noon and 1:30 pm; be on the pavement before then.", "Dress respectfully and keep the camera low between frames; people relax when it is not pointed at them.", "Hat brims shade faces in sun: dial +0.7 EV, or wait for people who step into the open shade of the church."],
"harlem-energy":["Saturday afternoons are busiest on 125th Street.","Choose a vendor who stays in one spot, such as one selling books or oils from a table."],
"harlem-mood":["Weeknights after 7 pm have the most lit windows.","Shoot from the kerb on the opposite side so the whole row of stoops fits."],
"harlem-odd":["Murals are often on the side streets; walk a block either side of 125th Street.","Shoot in open shade so the painted colours stay rich."],
"les-place":["Sunday mornings are quietest on Orchard Street.", "Soft overcast light shows detail in the fire escapes without hard shadows.", {"q343": "Turn the camera vertical so more of the fire escapes fit while it stays level."}],
"les-moment":["Late morning on weekdays is when vendors are prepping and serving at the same time.","Ask the vendor if you can photograph while they work; most say yes after you have bought something."],
"les-energy":["Riders coming off the bridge peak in the morning rush, about 8 to 10 am; in the evening most are heading up onto it, so you see their backs.", "For a second version, switch to AFc, follow one rider with the camera and press as they pass level with you: rider sharp, steel streaked."],
"les-mood":["Rainy nights add reflections on the pavement as well as the glass.","Pick a bar with neon in the window and people sitting near it."],
"les-odd":["Old signs show best in raking light, early or late in the day.","Look up: many ghost signs are above the ground-floor shops."],
"flushing-place":["Weekend afternoons have the biggest crowds at Main Street and Roosevelt Avenue.","Overcast days show the sign colours better than hard sun."],
"flushing-moment":["Lunchtime on weekends is busiest; arrive around noon for a seat.","Order something photogenic, such as hand-pulled noodles, and keep it in the near foreground."],
"flushing-energy":["Evening rush, 5:30 to 7 pm, brings the biggest waves out of the station.","Each train empties in about a minute; shoot the first 20 seconds of each wave."],
"flushing-mood":["Rain makes the bare bulbs glow in the wet pavement.", "Spot-meter the vendor's lit face and let the queue fall into shadow."],
"flushing-odd":["Mornings have the freshest, fullest displays.", "Ask the shop owner before photographing inside; outside on the pavement is fair game.", "For tanks, put the lens against the glass to kill reflections; wait for the hand to come in from a corner, not the middle."],
"wburg-place":["The sun sets across the river: behind the bridge and Lower Manhattan in winter, moving north toward Midtown by midsummer.","Stay through blue hour for city lights against a glowing sky."],
"wburg-moment":["Weekend afternoons in warm weather have pickup games and long waits for the court.", "Watch the bench reactions to a good point; they are the shot.", {"q328": "Use the 50 mm crop frame, or move to about 2 m, for real blur behind the waiting players."}],
"wburg-energy":["Saturday afternoons around the Bedford Avenue station are busiest.","Buskers draw a crowd that stops and turns; use them as the back layer."],
"wburg-mood":["Late morning to midday puts strong shadow bands under the bridge.", "Expose for the bright strip: start at −1.3 EV and go to −2 if the strip is still white on the screen."],
"wburg-odd":["Murals change often; walk Wythe and Kent Avenues to see what is new.","Shoot from across the street with the camera level so the mural stays square."],
"midtown-place":["Around 1 pm from late spring to early autumn the high sun reaches the floor of the avenue.","Stand on a plaza edge so you have room to step back."],
"midtown-moment":["12:30 to 1:30 pm on warm weekdays has the most people eating outside.","Choose a ledge with a plain wall behind; a busy plaza background fights the person."],
"midtown-energy":["Lunch hour, 12 to 1 pm, gives the biggest crowds at each crossing.","Wear something plain; at a crossing you are in full view, and blending in keeps faces natural."],
"midtown-mood":["Late morning to early afternoon gives the most reflected light from glass towers onto side streets.", "Expose for the lit patch: with Highlight-Weighted metering start at 0 EV, and go to −0.7 only if the patch still burns out.", "Unlike a silhouette, the person here stays lit; it is the street that goes dark."],
"midtown-odd":["The lunch rush, 12 to 1:30 pm, has the longest queue.", "Stand upwind of the grill so the smoke blows away from you and drifts across the queue behind the cart."],
"cpark-place":["Early morning is quiet and soft; weekend afternoons have musicians and crowds under the arcade.","Expose for the bright terrace, about −0.7 EV, and let the arcade go dark around it."],
"cpark-moment":["Morning sun from the east lights the side of the bridge you face. In late afternoon the sun is behind it, so the couple reads as a silhouette on bright water: dial in −0.7 to −1 EV then.", "Proposals happen most on weekend afternoons; stay with the bridge for at least half an hour."],
"cpark-energy":["Early mornings, 6 to 8 am, and evenings after 5 pm bring the most runners.","Pick a bend where runners lean into the curve; it makes the blur look faster."],
"cpark-mood":["Snow or fog on a weekday morning gives an almost empty Mall. Add +0.7 to +1 EV, or the white turns grey.", "Protect the camera from rain with a plastic bag or rain cover; the Q3 is sealed, but the lens front still gets wet."],
"cpark-odd":["Weekend afternoons have the most performers under the arcade.", "Ask the performer before you stand close, and put something in the case; most are glad of the attention.", "Keep the performer's head off the brightest arch, or it turns into a dark cut-out.", "Set metering to Spot on the performer's face; Center-Weighted reads the middle of the hall, and the bright arches pull the face dark."],
"rockaway-place":["Early morning on weekdays has an empty boardwalk.", "Morning sun from the east rakes low along the boardwalk."],
"rockaway-moment":["Surfers come out in waves after the morning session, around 9 to 10 am.","Stand where the sand is firm so you can crouch without sinking."],
"rockaway-energy":["The best waves come with a swell after a storm; check a surf forecast.","Protect the camera from salt spray, and wipe the lens often."],
"rockaway-mood":["Fog is likeliest on late-spring and early-summer mornings; in winter a grey overcast morning gives the same empty mood. With this much sky or fog, add +0.7 EV.", "Dress warmly and be patient: one walker with a dog may take half an hour."],
"rockaway-odd":["Summer weekend mornings have the most surfers on the A train and the shuttle.", "Stand near the top of the stairs: in the morning surfers step off the train and head down to the beach; in the afternoon they come up to wait for the train home."],
"arthur-place":["Saturday mornings are busiest on the avenue.","Soft overcast light is best for the awnings and signs."],
"arthur-moment":["Saturday mornings are busiest at the counters.","Buy something and ask; vendors are proud of their work and usually say yes."],
"arthur-energy":["Saturday late morning has the most shoppers with full bags.","Bakery and butcher doors are where the full bags come out; stand near one."],
"arthur-mood":["Mid-morning has regulars at the café tables.", "Step left or right until a reflection sits beside the face, not across it. Faces inside are darker than the street: add +0.7 EV."],
"arthur-odd":["Ask the roller first; they often explain the process, which gives you better moments.", "Use the hands as the focus point and let the face soften behind.", "Shoot from beside and a little above the bench so the face sits soft behind the hands. Close up, only a few centimetres are sharp, so press when the hands are at the distance you focused on."],
"union-place":["Market days are Monday, Wednesday, Friday and Saturday; Saturday morning is busiest.","Arrive by 9 am for soft light and fewer crowds."],
"union-moment":["Watch a few games before shooting; each regular has habits, like a hand hovering before a move, that you can learn to anticipate.","Leave a dollar on the table if you stay; it is the custom."],
"union-energy":["Rush hour, 5 to 6:30 pm, has the most commuters and skaters; in September, October and early March that is also when the light turns gold, but from November to February it is already dark by then.", "Skaters repeat the same line along the steps; learn it and keep your still subject beside it."],
"union-mood":["Shoot about 15 minutes after sunset, when the digits glow against a blue sky.","Choose a spot with no streetlamp in the frame; a bright lamp competes with the digits."],
"union-odd":["Weekend afternoons have the most speakers and sign-holders.","Stay neutral and quiet; the reaction you want comes from someone else, not you."],
"fidi-place":["The Exchange's columns face east onto Broad Street, so morning sun lights them.","Wait for a gap in the tourists on the steps so the statue stands clear."],
"fidi-moment":["Warm weekday lunches, 12:30 to 2 pm, are the busiest.", "Walk slowly with the camera at chest height and the screen tilted up; raising it to your eye makes diners look up."],
"fidi-energy":["Rush hour, 8 to 9 am and 5 to 6 pm, fills the floor.","Brace on the balcony rail rather than bringing a tripod, which draws security."],
"fidi-mood":["Midday on a clear day is the only time sun reaches the street floor.", "With Highlight-Weighted metering start at 0 EV for the slot; the shade around it should go black on its own."],
"fidi-odd":["Weekend middays have the longest queue.","Watch for a child being lifted up to touch the bull; it is the best reach of the day."],
"ktown-place":["Friday and Saturday nights have the most people under the signs.","A light rain doubles the signs in the wet pavement."],
"ktown-moment":["Saturday afternoons have the most shoppers coming out of Macy's.","Stand still with your back to the kerb; people coming out are looking down or at their phones."],
"ktown-energy":["Shoot at dusk or after dark, when 1/15 s is easy and the lights add colour to the blur.","Pick a still figure under a light, such as a vendor's cart, so they stay bright while the crowd blurs."],
"ktown-mood":["After midnight on Friday and Saturday has the most people spilling out.", "Wear dark clothes and stand a little off to one side so your own reflection falls outside the frame, with the lit signs behind you."],
"ktown-odd":["Midday has the most stalls and shoppers.","Turn on the level: with the camera tilted up, a slight sideways tilt makes the tower lean."],
"bushwick-place":["Weekend afternoons have the most visitors posing in front of the walls.","Overcast light shows mural colours best."],
"bushwick-moment":["Weekend afternoons have the most photo shoots.","Instructions get loudest when a shoot is going badly; stay with one group for a few minutes."],
"bushwick-energy":["Saturday afternoons are busiest on Knickerbocker Avenue.","Pick a vendor who stays in one spot, such as one with a fruit stand."],
"bushwick-mood":["Shoot at dusk, as the street lights and loading-dock lamps come on.", "Expose for the lit walls, about −0.7 EV, so the shadows stay deep."],
"bushwick-odd":["Murals change often; walk Troutman Street and St Nicholas Avenue to see what is new.","Shoot square-on so the painted face is not distorted."],
"chelsea-place":["Weekday evenings are calmer than weekends, so you can hold a spot at the back of the steps.","Stand at the back of the steps so the seated people and the window line up."],
"chelsea-moment":["The galleries' websites list which openings are on that week.","Shoot from across the street with a longer crop so you are not noticed."],
"chelsea-energy":["Weekday lunch, 12 to 1:30 pm, is busiest.","Brace on a pillar and keep your elbows in; 1/15 s is easy to shake."],
"chelsea-mood":["Arrive 30 minutes before sunset for the best light over the Hudson.","Expose for the sky, about −1.3 EV, so the columns go black."],
"chelsea-odd":["Midday has the most visitors around the base.","Move slowly; the reflection changes with every step."],
"brighton-place":["Saturday mornings are busiest under the el.","Wait for a train; the shadow stripes move as it passes."],
"brighton-moment":["Late afternoon in autumn and spring has the most people on the benches.", "Keep your distance; a crop frame (60 or 75 mm on the Q3 43, 50 or 75 mm on the Q3) lets you stay back."],
"brighton-energy":["Summer evenings, 7 to 9 pm, have the busiest terraces.","Ask a waiter before standing at the terrace edge; a nod keeps you from being moved on."],
"brighton-mood":["Grey winter mornings give the flattest, emptiest sea.","Keep the horizon level; a tilted sea is the first thing people notice."],
"brighton-odd":["Shoot in open shade so the window is not washed out by sun.", "Square-on, your reflection lands in the middle of the frame: wear dark clothes and pick a window in deep shade under the el, so there is little light behind you to reflect."],
"cpark-mood-s":["The elms usually turn in early to mid November; check the Central Park Conservancy foliage map before you go.", "Overcast light makes the yellow glow; sun makes it patchy."],
"cpark-moment-s":["Windy autumn afternoons drop the most leaves.","Stand downwind of the tree so the leaves blow toward you and the people reaching for them."],
"wsp-mood-s":["The trees turn in late October to early November.", "Give the players a nod before you crouch; they are used to cameras and appreciate being asked.", {"q343": "Turn the camera vertical so the leaves and the board both fit."}],
"harlem-place-s":["The street trees turn in late October to early November.", "On the east–west side streets (West 120th to 122nd), morning sun comes down the block from the east: shoot west with it behind you, or east into it for glowing leaves."],
"dumbo-place-s":["The park trees turn in early to mid November.","Weekday mornings have dog walkers on the paths, which give scale without a crowd."],
"brighton-mood-s":["Late afternoon from October to November gives the longest shadows.","Expose for the low sun, about −1.3 EV, so the benches go to shape."],
"union-odd-s":["Pumpkins are at the market from late September to early November.", "Saturday afternoons have the most skaters on the steps.", "The Greenmarket runs Monday, Wednesday, Friday and Saturday, 8 am to 6 pm; Saturday afternoon has both the stalls and the most skaters."]};
const WORK_REC_TIP = {"zone": "Take a few frames as the moment builds rather than one; gestures peak and fade in under a second.", "freeze": "Use short bursts of three to five frames, not long ones, so the camera is ready for the next moment.", "drag": "Blur is different every time: take five to ten frames of each moment, and zoom in on the screen to check the still subject is sharp.", "deep": "Before pressing, run your eye round the four edges; a step to the side can remove a bin, a pole growing out of a head or a half-cut person.", "shallow": "Look behind your subject before you shoot: a step left or right can swap a busy background for a plain one.", "night": "Check the screen for signs that have burnt out to white; if they have, turn the exposure compensation down a notch.", "silhouette": "Shapes read best when the limbs separate from the body: wait for a stride, a profile or an outstretched arm, not someone walking straight at you.", "interior": "Indoor light is often mixed; if skin looks green or orange, set the white balance on the main light, or correct it later from the DNG.", "detail": "For flat things such as signs, get square to the surface so the edges run parallel; for objects, find the angle that shows their shape."};

// Composition techniques: [name, explanation shown on tap]
const TECH = {
  lines:["Leading lines","Lines in the scene, such as kerbs, rails, planks and shadows, pull the eye along them. Arrange them so they start near a corner and end at your subject."],
  frame:["Frame within a frame","Use a doorway, arch, window or gap to surround the subject. It hides clutter and tells the viewer where to look."],
  layers:["Layers","Put something near, something in the middle and something far. Keep the shapes from overlapping so each one reads on its own."],
  space:["Negative space","Leave most of the frame empty and keep the subject small. Emptiness gives quiet, loneliness or a sense of scale."],
  sym:["Symmetry","Centre the subject and balance both halves. It only works when it is exact, so keep the camera level and square to the scene."],
  fill:["Fill the frame","Get close enough that nothing irrelevant is left. If something does not help the picture, remove it by stepping in."],
  thirds:["Rule of thirds","Imagine the frame divided into three each way and put the subject on a line or a crossing, not in the centre. Leave room in the direction it faces or moves."],
  juxta:["Juxtaposition","Two things that contrast or echo each other in one frame: old and new, real and fake, still and moving. Keep them similar in size so the comparison is obvious."],
  diag:["Diagonals","A diagonal is a strong line that runs from one corner of the frame toward the opposite corner: a street, a kerb, a crossing, a rail or a stream of people. It makes a picture feel like it is moving, where a line straight across feels calm. To get one, step to the side or turn the camera until the main line tilts across the frame instead of running level or straight away from you."],
  reflect:["Reflection","Use glass or water as a second picture laid over or under the first. Move one step to change what the reflection shows."],
  light:["Light as subject","The eye goes to the brightest area. Expose for it, let the rest fall dark, and wait for the subject to step in."]
};
// Compose line per idea: id -> [technique, how to frame this shot]
const COMPOSE = {
"chinatown-place":["lines","Let the kerb and the row of signs curve in from the bottom corners to the bend, and put the person where the curve disappears."],
"chinatown-moment":["fill","Hands in the centre and both faces near the top edge. Leave out the awning and the street."],
"chinatown-energy":["diag","Stand so the crowd crosses the frame corner to corner, with the vendor on a third as the still point."],
"chinatown-mood":["layers","Three layers: reflections on the glass, the steam, then a face. Keep the red sign in a corner so it colours the frame without taking over."],
"chinatown-odd":["layers","A player's blurred shoulder in the foreground, the reacting face sharp behind it."],
"gct-place":["sym","Centre the clock and keep the floor line level across the bottom of the frame."],
"gct-moment":["thirds","Clock on the upper third, your waiting person on the opposite lower third, with clear floor between them and the crowd."],
"gct-energy":["juxta","Put the one still figure on a third, sharp, with the blurred crowd streaming past on both sides. Leave open floor in the direction they face, and keep the departure board in the frame so the reason they stopped is clear."],
"gct-mood":["light","The bright patch sits in the middle with darkness on all four edges. Keep the figure small and fully inside the light."],
"gct-odd":["frame", "Tight frame: the person at one side of the picture, face turned into the tiles, with the tiled curve rising over their head. For a second frame, step back to the centre under the arch so its curve spans the top."],
"tsq-place":["lines","The two avenues form a V. Put its point just above centre and the crowd along the bottom fifth."],
"tsq-moment":["fill", "Head and shoulders fill the frame, eyes on the top third, looking up and out of the frame. The background should be colour only."],
"tsq-energy":["thirds","Anchor a dark figure or lamppost on one third so the three frames differ only in colour."],
"tsq-mood":["reflect","Set the ground line high: reflection in the lower two thirds, feet and umbrellas along the top."],
"tsq-odd":["juxta","Costume head and human head side by side at the same height, against a plain background so the pairing reads at once."],
"wsp-place":["frame", "First frame: the arch centred and filling the middle of the picture, the fountain in front, and one walker under the arch. Second frame: walk toward it until the arch borders the top and both sides, with Fifth Avenue's vanishing point in the centre."],
"wsp-moment":["diag","Shoot along the table so the board runs diagonally from the near corner to the far player, with the hand at the centre."],
"wsp-energy":["layers","Go low so the performer rises above the crowd's heads into sky or trees, with the crowd as a band along the bottom."],
"wsp-mood":["space","Reader in a lower corner, long shadows running toward the camera across the rest of the frame."],
"wsp-odd":["thirds","The person on one third and the thing that makes them unusual on the other. Keep enough park in view to show it is a public place."],
"dumbo-place":["frame","Warehouses as walls left and right, the bridge tower centred, cobbles leading in from the bottom edge."],
"dumbo-moment":["layers","The couple mid-frame, the bridge behind, and a waiting photographer or passer-by in the near corner as the third layer."],
"dumbo-energy":["frame","The dark arch frames a bright opening. Place the blurred cyclist inside the opening, not against the dark stone."],
"dumbo-mood":["thirds","Skyline along the upper third, water in the middle, the figure a small dark shape on the lower third."],
"dumbo-odd":["lines","The rails start at the bottom corners and converge on your modern detail."],
"coney-place":["lines","Planks run from the bottom corners to a point under the wheel. Put the wheel on a side third, not in the centre."],
"coney-moment":["fill", "Frame the front car with the track as a diagonal behind it. At 25 m use the longest crop frame you have; the car stays a small part of it, so crop in further later if you want only the faces."],
"coney-energy":["juxta","Rings of light fill the upper two thirds, with the sharp booth or parent small at the bottom edge."],
"coney-mood":["space","Horizon across the middle, the walker at a far edge and heading out of the frame, everything else empty."],
"coney-odd":["juxta","The sign fills two thirds and the matching person stands in the remaining third, at the same scale as the painted figure."],
"soho-place":["sym","Centre the street's vanishing point with equal building on both sides and cobbles in the bottom third."],
"soho-moment":["frame","The doorway is the frame. Keep its edges parallel to the picture edges and the person's head clear of the top."],
"soho-energy":["layers","Low and close, so the front walker is large on one side and the rest of the crowd steps off in a row behind."],
"soho-mood":["diag","Shadow diagonals fill the upper frame, and the person crosses the one bright strip on the lower third."],
"soho-odd":["juxta","Line the reflected walker up at the same height and size as the mannequin, facing each other if you can."],
"jh-place":["frame","Steel overhead as a dark ceiling, columns as side frames, the bright street receding in the middle."],
"jh-moment":["fill","Cart light on the faces, food in the centre, the vendor's and customer's hands meeting on a third."],
"jh-energy":["lines","The columns run to a vanishing point. Stand the still person beside the nearest column and let traffic streak along the lines."],
"jh-mood":["light","Let the stripes run diagonally across the frame and wait until one bright band crosses the eyes."],
"jh-odd":["fill","Signs square-on like a page of text filling the frame, with the walker small at the bottom centre."],
"ferry-place":["lines","The wake leads from the bottom centre to the skyline on the upper third, with a railing or passenger in one lower corner."],
"ferry-moment":["layers","A row of backs and raised phones across the lower two thirds, the statue tiny in a gap between heads."],
"ferry-energy":["frame", "Door frame sharp on both sides, the crowd streaking through it away from you."],
"ferry-mood":["space","Window on one side, the rider in profile against it, the dark cabin taking the rest of the frame."],
"ferry-odd":["layers","The commuter large and sharp in the near third, the tourists' backs out of focus along the rail behind."],
"subway-place":["lines","Columns and the yellow strip converge on one point. Put that point on a third, with the person between two columns near it."],
"subway-moment":["frame","The door window frames the face outside. Press close to the glass to keep your own reflection out."],
"subway-energy":["thirds","Rider sharp on one third and facing into the frame, the train streaking across the other two thirds."],
"subway-mood":["space","Shoot down the car: empty seats as repeating shapes, the lone rider small at the far end."],
"subway-odd":["layers","The instrument in the near foreground, one listener's face sharp in the middle distance."],
"harlem-place":["thirds", "Marquee on the upper third, your passer-by on the opposite lower third, with the street between them."],
"harlem-moment":["frame", "Stand square to the church doors so their edges stay upright, and use the doorway as a frame behind the group on the steps. Keep the hats inside the opening, clear of its top edge."],
"harlem-energy":["diag", "Stand so the pavement crowd crosses the frame corner to corner, with the vendor's table as the still point on a third."],
"harlem-mood":["lines", "Stoop railings repeat from the near corner to a vanishing point. Place the lit window on a third."],
"harlem-odd":["juxta", "The painted figure and the passer-by at the same height and size, side by side."],
"les-place":["lines", "Fire escapes run down both sides to the street's vanishing point. Put the person where the lines meet."],
"les-moment":["fill", "Hands and the goods in the centre, both faces near the top edge, nothing else."],
"les-energy":["diag", "The bike path runs diagonally from a lower corner. Catch the cyclist halfway along it."],
"les-mood":["reflect", "Neon in an upper corner, reflections across the glass, one face inside on a third."],
"les-odd":["juxta", "Old sign across the top third, new shopfront below, the customer in the doorway between them."],
"flushing-place":["layers", "Crowd along the bottom, a band of awnings in the middle, stacked signs filling the top."],
"flushing-moment":["fill", "A bowl and two pairs of hands filling the frame, with one face at the top edge."],
"flushing-energy":["frame", "The stair opening frames the crowd as it rises. Keep the railing sharp along one side."],
"flushing-mood":["light", "The serving window is the only bright shape. Let the queue fall dark around it."],
"flushing-odd":["fill", "Fruit or tanks edge to edge, with the reaching hand entering from a corner."],
"wburg-place":["lines", "The railing leads from the bottom corner to the bridge tower. The person stands where the line meets the bridge."],
"wburg-moment":["layers", "Waiting players sharp in the foreground, the game softer behind them."],
"wburg-energy":["layers", "Nearest walker large on one side, the station crowd stacked behind, shopfronts as the back layer."],
"wburg-mood":["light", "Shadow fills most of the frame. The figure stands inside the one bright strip."],
"wburg-odd":["juxta", "Line the person up with a painted shape of the same size, so the two read as a pair."],
"midtown-place":["lines", "Both walls of towers run to the vanishing point. From the kerb the near wall is bigger: let it lead the eye down the avenue, and keep the camera level so the sky stays a thin slot."],
"midtown-moment":["space", "The person small on a lower third, with a large plain wall or empty steps around them; at f/8 the wall stays sharp, so choose a clean one."],
"midtown-energy":["layers", "The front walker large at one edge, the rest of the crowd stepping off in a row behind."],
"midtown-mood":["light", "Dark street on all sides, one lit person in the bright patch, placed off-centre."],
"midtown-odd":["juxta", "The suit and the cart side by side at the same scale, steam between them."],
"cpark-place":["frame", "The centre arch frames the terrace and the Lake. Keep the arch's sides equal and the person inside the opening."],
"cpark-moment":["thirds", "The bridge curves across the lower third and the couple stand at its crown, on a vertical third."],
"cpark-energy":["diag", "The drive bends diagonally through the frame. The still walker sits on a third while runners streak along the curve."],
"cpark-mood":["sym", "Centre the path, with equal rows of benches and elms on both sides and the lone figure at the vanishing point."],
"cpark-odd":["layers", "Three layers along the hall. Near: the performer, large on the left or right third and sharp. Middle: the listeners further along, smaller and softer. Back: the bright arches and the terrace beyond. Let the tiled ceiling run across the top of the frame."],
"rockaway-place":["lines", "The railing and the boardwalk edge run from the bottom corners to the horizon. Put the walker where they meet."],
"rockaway-moment":["thirds", "Surfer on one third, walking into the frame, with the waterline as a level line behind."],
"rockaway-energy":["thirds", "Surfer on a third, with room in front of the board in the direction of travel."],
"rockaway-mood":["space", "Horizon low, sky filling most of the frame, the walker and dog tiny near one edge."],
"rockaway-odd":["juxta", "The surfboard upright beside a station sign, both the same height in the frame."],
"arthur-place":["lines", "Awnings step down one side toward the vanishing point. A shopper at the near awning gives the scale."],
"arthur-moment":["fill", "The goods and both pairs of hands in the centre, faces at the top edge."],
"arthur-energy":["layers", "Shopper and bags large in front, the pavement crowd behind, awnings as the back layer."],
"arthur-mood":["frame", "The window is the frame. Keep its edges parallel to the picture edges and one face inside each pane."],
"arthur-odd":["fill", "Hands and tobacco leaf fill the lower two thirds, the face out of focus above."]
};

/* Visual demos. Schematic drawings by type, not pictures of the actual location.
   Compose: what the frame should look like, one drawing per technique.
   Work it: where to stand, one drawing per stance; each idea is assigned a stance. */
const dP = (x,y,h,c="d-fg",o=1) => '<g opacity="'+o+'"><circle cx="'+x+'" cy="'+(y-h*0.84)+'" r="'+(h*0.16)+'" class="'+c+'"/><rect x="'+(x-h*0.17)+'" y="'+(y-h*0.66)+'" width="'+(h*0.34)+'" height="'+(h*0.66)+'" rx="'+(h*0.1)+'" class="'+c+'"/></g>';
const dYou = (x,y,a,L=60) => { const r=d=>d*Math.PI/180, px=d=>(x+L*Math.cos(r(d))).toFixed(1)+" "+(y+L*Math.sin(r(d))).toFixed(1);
  return '<path d="M'+x+' '+y+' L'+px(a-20)+' L'+px(a+20)+' Z" class="d-cone"/><circle cx="'+x+'" cy="'+y+'" r="5" class="d-you"/>'; };
const dS = (x,y) => '<circle cx="'+x+'" cy="'+y+'" r="5" class="d-fg"/>';
const dArrow = (x1,y1,x2,y2) => { const a=Math.atan2(y2-y1,x2-x1), p=(d,l)=>(x2+l*Math.cos(a+d)).toFixed(1)+" "+(y2+l*Math.sin(a+d)).toFixed(1);
  return '<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" class="d-ln"/><path d="M'+x2+' '+y2+' L'+p(2.6,7)+' L'+p(-2.6,7)+' Z" class="d-mu"/>'; };
const dSvg = (inner,label,framed) => '<svg class="demo-svg" viewBox="0 0 150 100" role="img" aria-label="'+label+'">'+inner+'<rect x="1" y="1" width="148" height="98" class="'+(framed?"d-frame":"d-edge")+'"/></svg>';
const TECH_ART = {
  lines: '<path d="M1 99 L96 44 M149 99 L106 44 M45 99 L99 46 M112 99 L103 46" class="d-ln"/>'+dP(101,48,16),
  frame: '<rect x="1" y="1" width="148" height="98" class="d-bg"/><path d="M48 99 V42 a27 27 0 0 1 54 0 V99 Z" class="d-hole"/>'+dP(75,94,36),
  layers: '<path d="M1 62 H149" class="d-ln"/>'+dP(126,62,16,"d-mu")+dP(86,90,42)+'<path d="M-5 100 V48 q26 -22 46 6 V100 Z" class="d-mu" opacity=".5"/>',
  space: '<path d="M1 72 H149" class="d-ln"/>'+dP(22,90,16),
  sym: '<path d="M1 99 V18 L52 46 V99 Z M149 99 V18 L98 46 V99 Z" class="d-bg"/><path d="M75 1 V99" class="d-dash"/>'+dP(75,92,22),
  fill: '<circle cx="48" cy="56" r="40" class="d-fg"/><circle cx="120" cy="62" r="36" class="d-mu"/>',
  thirds: '<path d="M50 1 V99 M100 1 V99 M1 33.3 H149 M1 66.6 H149" class="d-dash"/>'+dP(50,86,38)+dArrow(66,56,96,56),
  juxta: dP(52,88,58)+'<circle cx="100" cy="39.3" r="9.3" class="d-out"/><rect x="90.1" y="49.7" width="19.8" height="38.3" rx="5.8" class="d-out"/>',
  diag: '<path d="M5 96 L145 12" class="d-ln"/>'+dP(124,34,18,"d-mu")+dP(94,54,22,"d-mu")+dP(62,74,26)+dP(30,94,30),
  reflect: '<rect x="24" y="8" width="22" height="22" class="d-fg"/><rect x="64" y="4" width="30" height="26" class="d-fg"/><rect x="110" y="12" width="18" height="18" class="d-fg"/>'+
    '<g opacity=".45"><rect x="24" y="32" width="22" height="46" class="d-fg"/><rect x="64" y="32" width="30" height="60" class="d-fg"/><rect x="110" y="32" width="18" height="38" class="d-fg"/></g><path d="M1 30 H149" class="d-ln"/>',
  light: '<rect x="1" y="1" width="148" height="98" class="d-bg"/><path d="M44 88 L68 28 H112 L106 88 Z" class="d-fg"/>'+dP(80,80,28,"d-hole")
};
// Reflection: a street scene along the top, its mirror image filling the lower two thirds, broken by ripples.
TECH_ART.reflect = (()=>{
  const scene = '<rect x="14" y="7" width="36" height="24" class="d-fg"/><rect x="102" y="12" width="30" height="19" class="d-mu"/><rect x="56" y="20" width="6" height="11" class="d-mu"/>'+
    dP(80,31,17)+'<path d="M67 15 a13 9 0 0 1 26 0 Z" class="d-fg"/>';
  return scene+
    '<g transform="translate(0,96.1) scale(1,-2.1)" opacity=".5">'+scene+'</g>'+
    '<path d="M1 31 H149" class="d-ln"/>'+
    '<path d="M8 44 H58 M70 44 H120 M20 55 H96 M108 55 H142 M6 67 H44 M58 67 H130 M24 80 H70 M84 80 H138 M10 91 H52 M66 91 H112" class="d-rip"/>';
})();
const STANCE = {
  down:["Top view","Stand at one end and shoot along its length; on a street, from the pavement or a traffic island.",
    '<rect x="20" y="5" width="18" height="90" class="d-bg"/><rect x="112" y="5" width="18" height="90" class="d-bg"/>'+dYou(75,90,-90,72)+dS(75,24)],
  side:["Top view","Stand to the side so both people are in view.",
    '<rect x="65" y="28" width="60" height="10" class="d-bg"/>'+dYou(18,34,0,105)+dS(95,18)+dS(95,50)],
  anchor:["Top view","Brace against something solid and let the movement pass you.",
    dYou(75,80,-90,62)+'<rect x="70" y="86" width="10" height="8" class="d-mu"/>'+dArrow(42,10,42,92)+dArrow(108,92,108,10)+dS(75,24)],
  glass:["Top view","Shoot through the glass: move closer to cut reflections, back to let them in.",
    dYou(75,66,-90,52)+'<path d="M12 54 H138" class="d-out"/>'+dS(75,24)],
  above:["Side view","Shoot from above, looking down on the scene.",
    '<path d="M1 46 H46 V99 H1 Z" class="d-bg"/><path d="M46 96 H149" class="d-ln"/>'+dYou(38,38,30,88)+dP(92,96,16)+dP(112,96,16)+dP(132,96,16)],
  low:["Side view","Get low and aim slightly up.",
    '<path d="M1 92 H149" class="d-ln"/>'+dYou(24,86,-24,90)+dP(100,92,62)],
  wait:["Top view","Fix the frame on a background and wait for someone to walk into it.",
    '<rect x="35" y="8" width="80" height="10" class="d-bg"/>'+dYou(75,92,-90,74)+dArrow(10,42,140,42)+'<circle cx="75" cy="42" r="8" class="d-out"/>'+dS(34,42)],
  backlight:["Top view","Face the light, with the subject between you and it.",
    dYou(75,92,-90,74)+'<circle cx="75" cy="13" r="7" class="d-fg"/><path d="M75 24 V30 M62 20 L57 25 M88 20 L93 25 M61 10 H54 M89 10 H96" class="d-ln"/>'+dS(75,52)],
  square:["Top view","Stand square-on to the surface.",
    dYou(75,90,-90,72)+'<rect x="25" y="10" width="100" height="8" class="d-fg"/><path d="M75 18 V84" class="d-dash"/><path d="M75 27 h9 v-9" class="d-ln"/>'],
  along:["Top view","Sit at their level and shoot along the table.",
    '<rect x="68" y="22" width="14" height="36" class="d-bg"/>'+dYou(75,94,-90,78)+dS(60,40)+dS(90,40)]
};
// Drawings made for one specific idea, used instead of the shared stance or technique drawing.
const dTx = (x,y,t,anchor="start") => '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" class="d-tx">'+t+'</text>';
/* Composition illustrations: small street scenes in greys, the subject in white, and a yellow guide layer that shows the technique. viewBox 0 0 150 100. */
const n1 = v => (+v).toFixed(1);
// A walking figure standing on (x,y), h tall; f=-1 faces left
const dW = (x,y,h,c="d-fg",f=1) => { const p=(a,b)=>n1(x+a*h*f)+" "+n1(y+b*h);
  return '<g class="'+c+'"><circle cx="'+n1(x+0.02*h*f)+'" cy="'+n1(y-0.895*h)+'" r="'+n1(0.088*h)+'"/>'+
    '<path d="M'+p(-0.1,-0.79)+'L'+p(0.09,-0.79)+'L'+p(0.12,-0.6)+'L'+p(0.2,-0.47)+'L'+p(0.16,-0.44)+'L'+p(0.11,-0.5)+'L'+p(0.12,-0.43)+'L'+p(0.21,0)+'L'+p(0.12,0)+'L'+p(0.01,-0.3)+'L'+p(-0.1,0)+'L'+p(-0.2,0)+'L'+p(-0.1,-0.43)+'L'+p(-0.12,-0.62)+'L'+p(-0.19,-0.47)+'L'+p(-0.23,-0.5)+'L'+p(-0.14,-0.72)+'Z"/></g>'; };
const gL = d => '<path d="'+d+'" class="d-guide"/>';
const gT = (x,y,t,a="start") => '<text x="'+x+'" y="'+y+'" text-anchor="'+a+'" class="d-gtx">'+t+'</text>';
const gDot = (x,y,r=1.8) => '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" class="d-gdot"/>';
const gArrow = (x1,y1,x2,y2) => { const a=Math.atan2(y2-y1,x2-x1), q=(d,l)=>n1(x2+l*Math.cos(a+d))+" "+n1(y2+l*Math.sin(a+d));
  return '<path d="M'+x1+' '+y1+' L'+x2+' '+y2+'" class="d-guide solid"/><path d="M'+x2+' '+y2+' L'+q(2.6,5)+' L'+q(-2.6,5)+' Z" class="d-gdot"/>'; };

const NEW_TECH_ART = {};

// Leading lines: a street receding to a vanishing point with the subject on it
(()=>{ const V=[98,47]; let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 0 H86 V50 L0 90 Z" class="d-bg"/><path d="M150 0 H108 V49 L150 80 Z" class="d-bg"/>';
  s+='<path d="M86 0 H108 V44 H86 Z" class="d-mu" opacity=".22"/>';
  s+='<path d="M0 90 L86 50 L108 49 L150 80 V100 H0 Z" class="d-mu" opacity=".16"/>';
  for(const y0 of [12,26,40,54,68]){ const y1=y0+(V[1]-y0)*86/98; s+='<path d="M0 '+y0+' L86 '+n1(y1)+'" class="d-feat" style="stroke-width:.8"/>'; }
  for(const y0 of [14,28,42,56,70]){ const y1=y0+(V[1]-y0)*42/52; s+='<path d="M150 '+y0+' L108 '+n1(y1)+'" class="d-feat" style="stroke-width:.8"/>'; }
  for(const x of [22,44,62,76]) s+='<path d="M'+x+' 0 V'+n1(90-40*x/86)+'" class="d-feat" style="stroke-width:.6"/>';
  for(const x of [140,128,118]) s+='<path d="M'+x+' 0 V'+n1(80-31*(150-x)/42)+'" class="d-feat" style="stroke-width:.6"/>';
  s+=dW(98,51,11);
  s+=gL("M3 99 L93 52 M147 99 L103 52 M48 99 L95 53 M122 99 L101 53")+gDot(98,45,2.4)+gT(92,40,"vanishing point","end");
  NEW_TECH_ART.lines=s; })();

// Frame within a frame: a dark arch opening onto a bright street
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  for(let y=8;y<100;y+=8){ s+='<path d="M0 '+y+' H150" class="d-feat" style="stroke-width:.5"/>'; for(let x=(y/8)%2?0:10;x<150;x+=20) s+='<path d="M'+x+' '+(y-8)+' V'+y+'" class="d-feat" style="stroke-width:.5"/>'; }
  s+='<path d="M44 100 V46 A31 31 0 0 1 106 46 V100 Z" class="d-mu"/>';
  s+='<path d="M48 100 V66 H58 V50 H70 V62 H84 V44 H96 V58 H102 V100 Z" class="d-bg" opacity=".55"/>';
  s+='<path d="M44 86 H106" class="d-feat" style="stroke-width:.8"/>';
  s+=dW(78,94,30,"d-hole");
  s+=gL("M39 100 V46 A36 36 0 0 1 111 46 V100")+gT(75,7,"the frame","middle");
  NEW_TECH_ART.frame=s; })();

// Layers: near, middle and far, all overlapping
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 50 V22 H18 V12 H40 V30 H62 V18 H86 V34 H112 V8 H134 V26 H150 V50 Z" class="d-bg"/>';
  s+='<path d="M0 50 H150 V100 H0 Z" class="d-mu" opacity=".14"/>';
  s+=dW(122,62,13,"d-mu");
  s+=dW(80,86,34);
  s+=dW(10,150,110,"d-mu");
  s+=gT(16,96,"near","middle")+gT(80,96,"middle","middle")+gT(122,70,"far","middle");
  s+=gL("M2 6 H148")+gT(4,5,"","");
  NEW_TECH_ART.layers=s.replace(gL("M2 6 H148"),""); })();

// Negative space: a big plain wall and a small figure walking into it
(()=>{ let s='<rect width="150" height="100" class="d-hole"/><rect width="150" height="74" class="d-bg"/>';
  s+='<path d="M0 74 H150" class="d-ln"/>';
  s+='<path d="M120 90 L82 98 L124 92 Z" class="d-bg" opacity=".8"/>';
  s+=dW(124,90,17,"d-fg",-1);
  s+=gL("M8 8 H104 V66 H8 Z")+gT(56,40,"space to walk into","middle")+gArrow(112,80,96,80);
  NEW_TECH_ART.space=s; })();

// Symmetry: a subway platform, columns receding in pairs, the figure on the axis
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 0 H150 L88 38 H62 Z" class="d-bg" opacity=".7"/><path d="M0 100 H150 L88 54 H62 Z" class="d-mu" opacity=".16"/>';
  s+='<path d="M20 100 L64 54 M130 100 L86 54" class="d-guide solid" style="stroke-width:1.6;stroke-dasharray:none"/>';
  for(const t of [0,0.32,0.54,0.7,0.81,0.88]){ const k=1-t, w=8*k, xl=75-62*k, top=46-44*k, bot=46+50*k;
    s+='<rect x="'+n1(xl-w/2)+'" y="'+n1(top)+'" width="'+n1(w)+'" height="'+n1(bot-top)+'" class="d-mu"/><rect x="'+n1(150-xl-w/2)+'" y="'+n1(top)+'" width="'+n1(w)+'" height="'+n1(bot-top)+'" class="d-mu"/>'; }
  s+=dW(75,74,22);
  s+=gL("M75 2 V98")+gT(78,8,"centre line");
  NEW_TECH_ART.sym=s.replace('class="d-guide solid" style="stroke-width:1.6;stroke-dasharray:none"','class="d-edgeline"'); })();

// Fill the frame: a face and hat so close the edges cut them
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  s+='<path d="M8 104 Q14 76 50 70 L58 60 H96 L102 70 Q138 76 144 104 Z" class="d-mu"/>';
  s+='<ellipse cx="77" cy="44" rx="28" ry="32" class="d-fg"/>';
  s+='<path d="M30 22 Q77 8 124 22 L118 28 Q77 18 36 28 Z" class="d-hole"/><path d="M48 23 Q50 -4 77 -4 Q104 -4 106 23 Z" class="d-hole"/>';
  s+='<ellipse cx="66" cy="44" rx="4.2" ry="2.4" class="d-hole"/><ellipse cx="88" cy="44" rx="4.2" ry="2.4" class="d-hole"/>';
  s+='<path d="M60 37 Q66 34 72 36 M82 36 Q88 34 94 37 M78 47 L80 57 L74 58 M68 65 Q77 69 86 65" class="d-feat"/>';
  s+=gL("M3 14 V3 H14 M136 3 H147 V14 M147 86 V97 H136 M14 97 H3 V86")+gT(75,96,"crop at the edges","middle");
  NEW_TECH_ART.fill=s; })();

// Rule of thirds: subject on a third line, looking into the open two thirds
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 66.6 V30 H22 V40 H40 V20 H70 V36 H96 V14 H124 V32 H150 V66.6 Z" class="d-bg"/>';
  for(const [x,y] of [[26,46],[46,30],[54,30],[46,40],[76,44],[84,44],[104,22],[112,22],[104,32],[112,32],[130,40],[138,40]]) s+='<rect x="'+x+'" y="'+y+'" width="4" height="5" class="d-mu" opacity=".5"/>';
  s+='<path d="M0 66.6 H150 V100 H0 Z" class="d-mu" opacity=".14"/>';
  s+=dW(50,90,34);
  s+=gL("M50 0 V100 M100 0 V100 M0 33.3 H150 M0 66.6 H150")+gDot(50,33.3)+gDot(100,33.3)+gDot(50,66.6)+gDot(100,66.6)+gArrow(60,56,90,56);
  NEW_TECH_ART.thirds=s; })();

// Juxtaposition: a billboard hand pointing at a real passer-by
(()=>{ let s='<rect width="150" height="100" class="d-hole"/><rect x="0" y="0" width="150" height="74" class="d-bg"/>';
  s+='<rect x="10" y="6" width="96" height="52" rx="2" class="d-mu"/><path d="M58 58 V74 M62 58 V74" class="d-ln"/>';
  s+='<path d="M22 22 Q20 12 32 12 H52 Q60 12 60 20 V24 H82 Q90 24 90 30 Q90 36 82 36 H64 L92 50 Q96 54 92 57 Q89 59 85 56 L56 42 Q42 46 32 42 Q22 38 22 22 Z" class="d-hole"/>';
  s+='<path d="M0 74 H150" class="d-ln"/>';
  s+=dW(118,92,28,"d-fg",-1);
  s+=gL("M94 56 Q110 60 116 64")+gDot(116,64,2)+gT(146,14,"the echo","end");
  NEW_TECH_ART.juxta=s; })();

// Diagonals: a street crossing running corner to corner, people streaming along it, a tower in the far corner
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 0 H64 V22 L0 52 Z" class="d-bg"/><path d="M150 0 V20 L96 44 V0 Z" class="d-bg" opacity=".55"/>';
  s+='<path d="M121 46 V10 H127 V4 H129 V-2 H131 V4 H133 V10 H139 V40 Z" class="d-bg"/>';
  s+='<path d="M0 100 L150 38 V28 L0 74 Z" class="d-mu" opacity=".18"/>';
  for(let k=0;k<11;k++){ const x=6+k*13, y1=97-x*0.413, y2=78-x*0.307; s+='<path d="M'+n1(x)+' '+n1(y1)+' L'+n1(x+5)+' '+n1(y2-2)+'" class="d-feat" style="stroke-width:2.2;opacity:.45"/>'; }
  s+='<path d="M8 93 L26 86 M10 99 L30 91 M50 77 L66 71 M54 82 L70 76" class="d-ln" style="stroke-width:1;opacity:.6"/>';
  s+=dW(40,92,24)+dW(80,72,19,"d-mu")+dW(110,59,15,"d-mu")+dW(132,50,11,"d-mu");
  s+=gL("M4 97 L146 32")+gDot(130,8,2)+gT(146,96,"corner to corner","end")+gT(114,8,"top corner","end");
  NEW_TECH_ART.diag=s; })();

// Reflection: lit buildings repeated in a puddle, the figure standing on the line
(()=>{ const top='<rect x="8" y="12" width="22" height="40" class="d-bg"/><rect x="34" y="4" width="26" height="48" class="d-bg"/><rect x="100" y="8" width="20" height="44" class="d-bg"/><rect x="124" y="20" width="22" height="32" class="d-bg"/>'+
    [[12,18],[20,18],[12,28],[20,36],[38,10],[48,10],[38,22],[48,30],[38,40],[104,14],[112,24],[104,34],[128,26],[136,36]].map(([x,y])=>'<rect x="'+x+'" y="'+y+'" width="5" height="5" class="d-mu"/>').join("")+
    dW(80,52,26)+'<path d="M66 22 Q80 10 94 22 Z" class="d-fg"/><path d="M80 22 V30" class="d-ln"/>';
  let s='<rect width="150" height="100" class="d-hole"/>'+top;
  s+='<g transform="translate(0,104) scale(1,-1)" opacity=".42">'+top+'</g>';
  s+='<path d="M0 52 H150 V100 H0 Z" class="d-mu" opacity=".08"/>';
  for(const [x,y,w] of [[10,62,30],[50,70,22],[96,66,34],[20,82,26],[70,88,40],[110,80,24]]) s+='<path d="M'+x+' '+y+' h'+w+'" class="d-rip" style="stroke:var(--sign);stroke-width:1.4"/>';
  s+=gL("M0 52 H150")+gT(4,49,"the waterline");
  NEW_TECH_ART.reflect=s; })();

// Light as subject: a shaft of light between towers, one figure inside it
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 0 H54 V70 L0 92 Z" class="d-bg"/><path d="M150 0 H92 V64 L150 84 Z" class="d-bg"/>';
  s+='<path d="M54 0 H92 L120 82 H70 Z" class="d-fg" opacity=".1"/>';
  s+='<path d="M60 82 H128 L118 96 H52 Z" class="d-fg"/>';
  s+='<path d="M92 92 L60 99 L96 93 Z" class="d-hole"/>';
  s+=dW(92,92,26,"d-hole");
  s+=gL("M48 78 H134 V100 H48 Z")+gT(45,88,"expose","end")+gT(45,95,"for this","end");
  NEW_TECH_ART.light=s; })();

Object.assign(TECH_ART, NEW_TECH_ART);
const WORK_ART = {
  "tsq-moment":["Top view","Stand between the subway stairs and the screens, facing the stairs. People look up at the screens behind you as they reach the street.",
    '<rect x="40" y="6" width="40" height="28" class="d-bg"/><path d="M40 13 H80 M40 20 H80 M40 27 H80" class="d-dash"/>'+
    '<circle cx="52" cy="16" r="3.5" class="d-mu"/><circle cx="69" cy="23" r="3.5" class="d-mu"/>'+
    dYou(60,76,-90,64)+dArrow(60,36,60,44)+dS(60,51)+
    '<rect x="8" y="90" width="34" height="6" class="d-fg"/><rect x="48" y="90" width="26" height="6" class="d-mu"/><rect x="80" y="90" width="30" height="6" class="d-fg"/><rect x="116" y="90" width="26" height="6" class="d-mu"/>'+
    dTx(86,18,"subway stairs")+dTx(70,54,"looks up")+dTx(70,79,"you")+dTx(8,86,"screens behind you")]
};
WORK_ART["cpark-odd"]=["Top view, north up","The arcade is a long hall under the road. Stand with your back to the wall opposite the arches, two metres from the performer and a little to one side, and shoot along the hall so the listeners and the arches are beyond them.",
  '<rect x="0" y="0" width="150" height="22" class="d-mu" opacity=".25"/><rect x="0" y="22" width="150" height="5" class="d-bg"/>'+[8,32,56,80,104,128].map(x=>'<rect x="'+x+'" y="22" width="16" height="5" class="d-hole"/>').join("")+
  '<rect x="0" y="27" width="150" height="50" class="d-bg" opacity=".35"/><rect x="0" y="77" width="150" height="5" class="d-bg"/><rect x="62" y="82" width="26" height="18" class="d-bg" opacity=".6"/>'+
  dYou(30,72,-12,104)+dS(52,62)+'<circle cx="92" cy="48" r="3.5" class="d-mu"/><circle cx="100" cy="56" r="3.5" class="d-mu"/><circle cx="108" cy="46" r="3.5" class="d-mu"/>'+
  dTx(4,12,"fountain and terrace")+dTx(4,20,"arches")+dTx(4,90,"you, back to the wall")+dTx(56,70,"performer")+dTx(112,62,"listeners")+dTx(92,94,"steps to the Mall")];
const IDEA_ART = {
  "ktown-odd":
    '<path d="M104 64 V50 H122 V44 H149 V64 Z" class="d-bg" opacity=".45"/>'+'<path d="M64 66 V30 H67 V22 H70 V15 H73.5 V8 H74.6 V2 H75.4 V8 H76.5 V15 H80 V22 H83 V30 H86 V66 Z" class="d-mu"/>'+'<path d="M69 34 V64 M75 34 V64 M81 34 V64" class="d-feat" style="stroke-width:.6"/>'+'<rect x="1" y="66.7" width="148" height="32.3" class="d-hole"/>'+'<path d="M1 66.7 H149 V70 H1 Z" class="d-bg"/>'+'<path d="M8 73 L13 71 Q16 73.5 19 71 L24 73 L27.5 78 L23.5 79.5 V91 H8.5 V79.5 L4.5 78 Z M33 73 L38 71 Q41 73.5 44 71 L49 73 L52.5 78 L48.5 79.5 V91 H33.5 V79.5 L29.5 78 Z" class="d-mu"/>'+'<path d="M16 84 l-2.2 -2.2 a1.4 1.4 0 0 1 2.2 -1.6 a1.4 1.4 0 0 1 2.2 1.6 Z M41 84 l-2.2 -2.2 a1.4 1.4 0 0 1 2.2 -1.6 a1.4 1.4 0 0 1 2.2 1.6 Z" class="d-hole"/>'+'<path d="M54 92 L54 84 L57 87 L60 82 L63 87 L66 82 L69 87 L71 84 V92 Z" class="d-mu"/>'+'<path d="M72 92 V80 H73.5 V76 H75 V71 H75.8 V67.5 H76.2 V71 H77 V76 H78.5 V80 H80 V92 Z" class="d-fg"/>'+'<path d="M100 92 L100 84 L103 87 L106 82 L109 87 L112 82 L115 87 L118 84 V92 Z M121 92 L121 85 L124 88 L127 83 L130 88 L133 83 L136 88 L139 85 V92 Z" class="d-mu"/>'+'<rect x="1" y="92" width="148" height="7" class="d-bg"/>'+'<path d="M1 66.7 H149" class="d-guide"/>'+'<text x="92" y="24" class="d-gtx">the real one</text><text x="83" y="77" class="d-gtx">the copy</text><text x="4" y="63.5" class="d-gtx">the stall</text>',
  "tsq-moment":
    '<circle cx="18" cy="22" r="13" class="d-bg"/><circle cx="128" cy="20" r="16" class="d-bg"/><circle cx="136" cy="68" r="11" class="d-bg"/><circle cx="14" cy="70" r="9" class="d-bg"/><circle cx="112" cy="52" r="6" class="d-bg"/>'+
    '<path d="M1 33.3 H149" class="d-dash"/>'+
    '<path d="M24 101 Q28 80 56 75 L62 62 H90 L95 75 Q122 80 126 101 Z" class="d-mu"/>'+
    '<g transform="translate(0,-4) rotate(-9 76 42)"><ellipse cx="76" cy="42" rx="26" ry="31" class="d-fg"/>'+
    '<path d="M50 40 Q48 8 78 9 Q106 10 102 40 Q96 22 76 23 Q58 24 50 40 Z" class="d-mu"/>'+
    '<ellipse cx="65" cy="37" rx="4.4" ry="2.6" class="d-hole"/><ellipse cx="87" cy="37" rx="4.4" ry="2.6" class="d-hole"/>'+
    '<path d="M59 31 Q65 27 71 30 M81 30 Q87 27 93 31 M77 40 L79 51 L73 52" class="d-feat"/>'+
    '<ellipse cx="76" cy="61" rx="6.5" ry="3.6" class="d-hole"/></g>'+
    dArrow(104,22,138,7)
};
WORK_ART["midtown-place"]=["Top view","Stand at the street edge of a plaza, where the pavement is widest, and aim straight along the avenue. Step sideways until both walls of towers take up the same amount of frame, and hold the camera level so the towers stay upright and run off the top of the frame with no sky.",
  "<rect x=\"60\" y=\"1\" width=\"30\" height=\"98\" class=\"d-bg\" opacity=\".35\"/><path d=\"M75 4 V74\" class=\"d-dash\"/><rect x=\"8\" y=\"5\" width=\"44\" height=\"24\" rx=\"1.5\" class=\"d-bg\" opacity=\"1\"/><rect x=\"8\" y=\"35\" width=\"44\" height=\"22\" rx=\"1.5\" class=\"d-bg\" opacity=\"1\"/><rect x=\"98\" y=\"5\" width=\"44\" height=\"18\" rx=\"1.5\" class=\"d-bg\" opacity=\"1\"/><rect x=\"98\" y=\"29\" width=\"44\" height=\"28\" rx=\"1.5\" class=\"d-bg\" opacity=\"1\"/><rect x=\"98\" y=\"63\" width=\"44\" height=\"32\" rx=\"1.5\" class=\"d-bg\" opacity=\"1\"/><rect x=\"8\" y=\"63\" width=\"17\" height=\"32\" rx=\"1.5\" class=\"d-bg\" opacity=\"1\"/><rect x=\"27\" y=\"63\" width=\"28\" height=\"32\" rx=\"1.5\" class=\"d-out\"/><circle cx=\"33\" cy=\"69\" r=\"2.2\" class=\"d-mu\"/><circle cx=\"41\" cy=\"69\" r=\"2.2\" class=\"d-mu\"/><circle cx=\"33\" cy=\"89\" r=\"2.2\" class=\"d-mu\"/><circle cx=\"41\" cy=\"89\" r=\"2.2\" class=\"d-mu\"/><rect x=\"71\" y=\"40\" width=\"5\" height=\"9\" rx=\"1.5\" class=\"d-mu\"/><rect x=\"79\" y=\"58\" width=\"5\" height=\"9\" rx=\"1.5\" class=\"d-mu\"/>"+dYou(57,84,-90,78)+dArrow(75,30,75,12)+dTx(30,19,'towers','middle')+dTx(120,45,'towers','middle')+dTx(120,81,'towers','middle')+dTx(38,81,'plaza','middle')+dTx(64,87,'you')+'<text transform="translate(94.5,52) rotate(90)" text-anchor="middle" class="d-tx">Sixth Avenue</text>'];
IDEA_ART["midtown-place"]="<rect x=\"65\" y=\"1\" width=\"20\" height=\"58.8\" class=\"d-mu\" opacity=\".28\"/><rect x=\"70\" y=\"1\" width=\"10\" height=\"58.8\" class=\"d-mu\" opacity=\".3\"/><path d=\"M1 1 H27 V81.9 L1 97.0 Z\" class=\"d-bg\" opacity=\"1\"/><path d=\"M1 80.0 L27 70.9\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M1 62.0 L27 59.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M1 44.0 L27 47.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M1 26.0 L27 35.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M1 8.0 L27 24.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M1 -12.0 L27 11.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M7.5 1 V93.2\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M14.0 1 V89.4\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M20.5 1 V85.7\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M27 1 V81.9\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M27 1 H44 V72.0 L27 81.9 Z\" class=\"d-mu\" opacity=\"0.55\"/><path d=\"M27 70.9 L44 64.9\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 59.2 L44 57.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 47.5 L44 49.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 35.8 L44 42.3\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 24.2 L44 34.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 11.2 L44 26.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 -3.1 L44 17.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M27 -19.9 L44 6.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M31.2 1 V79.4\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M35.5 1 V77.0\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M39.8 1 V74.5\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M44 1 V72.0\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M44 1 H56 V65.0 L44 72.0 Z\" class=\"d-bg\" opacity=\"0.8\"/><path d=\"M44 64.9 L56 60.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 57.4 L56 56.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 49.8 L56 51.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 42.3 L56 46.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 34.7 L56 42.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 26.4 L56 37.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 17.1 L56 31.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 6.2 L56 24.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 -7.2 L56 16.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M44 -25.2 L56 5.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M48.0 1 V69.7\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M52.0 1 V67.4\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M56 1 V65.0\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M56 1 H65 V59.8 L56 65.0 Z\" class=\"d-mu\" opacity=\"0.4\"/><path d=\"M56 60.7 L65 57.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 56.1 L65 55.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 51.4 L65 52.6\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 46.8 L65 50.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 42.2 L65 47.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 37.1 L65 45.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 31.4 L65 42.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 24.7 L65 38.6\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 16.5 L65 34.3\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 5.5 L65 28.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 -11.2 L65 19.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M56 -42.0 L65 3.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M59.0 1 V63.3\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M62.0 1 V61.6\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M65 1 V59.8\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M149 1 H123 V81.9 L149 97.0 Z\" class=\"d-bg\" opacity=\"1\"/><path d=\"M149 80.0 L123 70.9\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M149 62.0 L123 59.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M149 44.0 L123 47.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M149 26.0 L123 35.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M149 8.0 L123 24.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M149 -12.0 L123 11.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M142.5 1 V93.2\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M136.0 1 V89.4\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M129.5 1 V85.7\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M123 1 V81.9\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M123 1 H106 V72.0 L123 81.9 Z\" class=\"d-mu\" opacity=\"0.55\"/><path d=\"M123 70.9 L106 64.9\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 59.2 L106 57.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 47.5 L106 49.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 35.8 L106 42.3\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 24.2 L106 34.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 11.2 L106 26.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 -3.1 L106 17.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M123 -19.9 L106 6.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M118.8 1 V79.4\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M114.5 1 V77.0\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M110.2 1 V74.5\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M106 1 V72.0\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M106 1 H94 V65.0 L106 72.0 Z\" class=\"d-bg\" opacity=\"0.8\"/><path d=\"M106 64.9 L94 60.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 57.4 L94 56.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 49.8 L94 51.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 42.3 L94 46.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 34.7 L94 42.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 26.4 L94 37.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 17.1 L94 31.4\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 6.2 L94 24.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 -7.2 L94 16.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M106 -25.2 L94 5.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M102.0 1 V69.7\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M98.0 1 V67.4\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M94 1 V65.0\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M94 1 H85 V59.8 L94 65.0 Z\" class=\"d-mu\" opacity=\"0.4\"/><path d=\"M94 60.7 L85 57.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 56.1 L85 55.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 51.4 L85 52.6\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 46.8 L85 50.2\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 42.2 L85 47.8\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 37.1 L85 45.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 31.4 L85 42.1\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 24.7 L85 38.6\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 16.5 L85 34.3\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 5.5 L85 28.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 -11.2 L85 19.7\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M94 -42.0 L85 3.5\" class=\"d-feat\" style=\"stroke-width:.7\"/><path d=\"M91.0 1 V63.3\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M88.0 1 V61.6\" class=\"d-feat\" style=\"stroke-width:.5\"/><path d=\"M85 1 V59.8\" class=\"d-feat\" style=\"stroke-width:1.4\"/><path d=\"M1 97 L65 59.8 H85 L149 97 V99 H1 Z\" class=\"d-bg\" opacity=\".45\"/><path d=\"M48 99 L72 60.8 M102 99 L78 60.8\" class=\"d-dash\"/><rect x=\"57\" y=\"78\" width=\"9\" height=\"5\" rx=\"1.5\" class=\"d-you\"/><rect x=\"82\" y=\"70\" width=\"6\" height=\"3.5\" rx=\"1\" class=\"d-mu\"/><rect x=\"69\" y=\"65\" width=\"4\" height=\"2.5\" rx=\".8\" class=\"d-mu\"/><path d=\"M75 1 V99\" class=\"d-dash\"/><path d=\"M75 54 m-4 0 h8 m-4 -4 v8\" class=\"d-ln\"/>"+dP(24,97,13)+dP(31,98,11,'d-mu')+dP(124,97,13)+dP(117,98,11,'d-mu');
/* Compose drawings made for single ideas, where the technique's own drawing would mislead. Same vocabulary as the technique drawings:
   greys for the scene, white for the subject, a yellow guide layer with short labels. viewBox 0 0 150 100. */
// A figure blurred by a slow shutter: fading copies trailing behind it and a few streaks. dir 1 = moving right
const dBlur = (x,y,h,dir=1,c="d-mu") => [0.18,0.3,0.55].map((o,i)=>'<g opacity="'+o+'">'+dW(x-dir*(2-i)*h*0.16,y,h,c,dir)+'</g>').join("")+
  '<path d="M'+n1(x-dir*h*0.55)+' '+n1(y-h*0.62)+' h'+n1(dir*h*0.3)+' M'+n1(x-dir*h*0.62)+' '+n1(y-h*0.4)+' h'+n1(dir*h*0.34)+' M'+n1(x-dir*h*0.5)+' '+n1(y-h*0.18)+' h'+n1(dir*h*0.26)+'" class="d-ln" style="stroke-width:.8;opacity:.5"/>';
// A person standing still, a little more solid than the walking figure
const dStand = (x,y,h,c="d-fg") => '<g class="'+c+'"><circle cx="'+n1(x)+'" cy="'+n1(y-h*0.9)+'" r="'+n1(h*0.09)+'"/><path d="M'+n1(x-h*0.13)+' '+n1(y-h*0.79)+' H'+n1(x+h*0.13)+' L'+n1(x+h*0.15)+' '+n1(y-h*0.42)+' H'+n1(x+h*0.09)+' L'+n1(x+h*0.08)+' '+n1(y)+' H'+n1(x+h*0.01)+' V'+n1(y-h*0.36)+' H'+n1(x-h*0.01)+' V'+n1(y)+' H'+n1(x-h*0.08)+' L'+n1(x-h*0.09)+' '+n1(y-h*0.42)+' H'+n1(x-h*0.15)+' Z"/></g>';
// Empire State Building, base at (x,y), h tall
const dESB = (x,y,h,c="d-mu") => { const k=h/64, P=(a,b)=>n1(x+a*k)+' '+n1(y-b*k);
  return '<path d="M'+P(-11,0)+' L'+P(-11,36)+' L'+P(-8,36)+' L'+P(-8,44)+' L'+P(-5,44)+' L'+P(-5,51)+' L'+P(-1.5,51)+' L'+P(-1.5,58)+' L'+P(-0.4,58)+' L'+P(-0.4,64)+' L'+P(0.4,64)+' L'+P(0.4,58)+' L'+P(1.5,58)+' L'+P(1.5,51)+' L'+P(5,51)+' L'+P(5,44)+' L'+P(8,44)+' L'+P(8,36)+' L'+P(11,36)+' L'+P(11,0)+' Z" class="'+c+'"/>'; };
const IDEA_ART2 = {};

// Herald Square crossing: 34th Street and the crowd corner to corner, the Empire State in the top corner, one still person sharp
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 0 H62 V22 L0 52 Z" class="d-bg"/><path d="M150 0 V22 L98 44 V0 Z" class="d-bg" opacity=".55"/>';
  s+=dESB(128,46,44);
  s+='<path d="M0 100 L150 40 V28 L0 74 Z" class="d-mu" opacity=".18"/>';
  for(let k=0;k<11;k++){ const x=6+k*13, y1=98-x*0.4, y2=79-x*0.3; s+='<path d="M'+n1(x)+' '+n1(y1)+' L'+n1(x+5)+' '+n1(y2-2)+'" class="d-feat" style="stroke-width:2.2;opacity:.45"/>'; }
  s+=dBlur(84,72,19)+dBlur(108,61,15)+dBlur(128,52,11)+dBlur(62,82,22);
  s+='<rect x="38" y="46" width="2.4" height="54" class="d-mu"/><rect x="35" y="44" width="8" height="12" rx="1.2" class="d-bg"/><circle cx="39" cy="48" r="1.6" class="d-fg"/><circle cx="39" cy="52.5" r="1.6" class="d-hole"/>';
  s+=dStand(50,99,30);
  s+=gL("M4 98 L146 34")+gT(146,10,"Empire State","end")+gT(58,74,"still: sharp")+gT(146,92,"crowd blurs along the line","end");
  IDEA_ART2["ktown-energy"]=s; })();

// Rides in motion: rings of light filling the top two thirds, the ticket booth small and sharp along the bottom
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M75 38 L60 74 M75 38 L90 74" class="d-ln" style="stroke:var(--sign-line);stroke-width:3"/>';
  for(const [rx,ry,o,c] of [[66,24,.9,"var(--sign-fg)"],[58,20,.55,"var(--sign-muted)"],[48,16,.8,"var(--sign-fg)"],[38,12,.45,"var(--sign-muted)"],[26,8,.7,"var(--sign-fg)"]])
    s+='<ellipse cx="75" cy="36" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="'+c+'" stroke-width="1.6" opacity="'+o+'" stroke-dasharray="'+(rx/3).toFixed(0)+' 2"/>';
  s+='<circle cx="75" cy="36" r="4" class="d-fg"/>';
  s+='<path d="M0 78 H150" class="d-ln"/>'; for(let x=4;x<150;x+=8) s+='<path d="M'+x+' 78 V90" class="d-ln" style="stroke-width:.8;opacity:.6"/>';
  s+='<rect x="0" y="90" width="150" height="10" class="d-bg"/>';
  s+='<path d="M14 72 L28 64 L42 72 Z" class="d-mu"/><rect x="17" y="72" width="22" height="20" class="d-bg"/><rect x="21" y="75" width="14" height="8" class="d-fg"/>';
  s+=dStand(120,96,20);
  s+=gL("M1 66.7 H149")+gT(4,62,"rings of light: top two thirds")+gT(46,88,"booth: small, sharp")+gT(146,74,"or a waiting parent","end");
  IDEA_ART2["coney-energy"]=s; })();

// Hand-painted signs: the banner fills two thirds, the passer-by in the last third striking the same pose at the same size
(()=>{ const strong=(x,y,h,c)=>{ const k=h/40; const P=(a,b)=>n1(x+a*k)+' '+n1(y+b*k);
    return '<g class="'+c+'"><circle cx="'+P(0,-35).split(' ')[0]+'" cy="'+P(0,-35).split(' ')[1]+'" r="'+n1(3.6*k)+'"/><path d="M'+P(-5,-30)+' L'+P(5,-30)+' L'+P(6,-14)+' L'+P(4,0)+' L'+P(1,0)+' L'+P(0,-12)+' L'+P(-1,0)+' L'+P(-4,0)+' L'+P(-6,-14)+' Z"/>'+
      '<path d="M'+P(-5,-29)+' L'+P(-11,-31)+' L'+P(-12,-41)+' L'+P(-9,-41)+' L'+P(-8,-33)+' L'+P(-4,-32)+' Z M'+P(5,-29)+' L'+P(11,-31)+' L'+P(12,-41)+' L'+P(9,-41)+' L'+P(8,-33)+' L'+P(4,-32)+' Z"/></g>'; };
  let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<rect x="4" y="6" width="94" height="86" class="d-bg"/><rect x="7" y="9" width="88" height="80" fill="none" stroke="var(--sign-muted)" stroke-width="1"/>';
  s+='<rect x="14" y="14" width="74" height="9" rx="2" class="d-mu"/>';
  s+=strong(51,88,46,"d-mu");
  s+='<path d="M0 92 H150 V100 H0 Z" class="d-bg" opacity=".6"/>';
  s+=strong(124,92,46,"d-fg");
  s+=gL("M100 1 V99")+gL("M38 41 H138")+gT(51,95,"the painted figure","middle")+gT(124,96,"the passer-by","middle")+gT(124,36,"same height","middle")+gT(4,7,"the sign: two thirds");
  IDEA_ART2["coney-odd"]=s; })();

// Rush-hour river: one still figure on a third, the crowd streaming past on both sides, the departure board in view
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  for(const x of [10,58,106]) s+='<path d="M'+x+' 60 V22 A17 17 0 0 1 '+(x+34)+' 22 V60 Z" class="d-bg"/><path d="M'+(x+17)+' 6 V60 M'+x+' 34 H'+(x+34)+'" class="d-feat" style="stroke-width:.6"/>';
  s+='<rect x="36" y="44" width="54" height="14" class="d-mu"/>'; for(let y=47;y<57;y+=3) s+='<path d="M40 '+y+' H86" class="d-feat" style="stroke-width:.8"/>';
  s+='<path d="M0 64 H150 V100 H0 Z" class="d-bg" opacity=".35"/>';
  s+=dBlur(24,90,24,1)+dBlur(70,96,26,1)+dBlur(132,94,25,-1)+dBlur(52,78,18,-1)+dBlur(120,79,17,1);
  s+=dStand(100,92,28);
  s+=gL("M100 1 V99")+gArrow(94,70,72,70)+gT(104,62,"still: sharp")+gT(63,42,"departure board","middle")+gT(4,98,"crowd blurs both sides");
  IDEA_ART2["gct-energy"]=s; })();

// Characters off duty: the costume head and the human head side by side at the same height, plain wall behind
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  s+='<path d="M0 78 H150 V100 H0 Z" class="d-hole" opacity=".6"/>';
  s+='<path d="M60 100 V64 Q60 52 74 50 H98 Q112 52 112 64 V100 Z" class="d-mu"/>';
  s+='<circle cx="88" cy="36" r="11" class="d-fg"/><path d="M80 28 Q88 20 97 29 Q90 25 80 28 Z" class="d-hole"/><path d="M84 38 h2 M91 38 h2 M85 43 Q88.5 45 92 43" class="d-feat" style="stroke-width:1.2"/>';
  s+='<rect x="96" y="66" width="10" height="14" rx="2" class="d-hole"/>';
  s+='<circle cx="44" cy="36" r="21" class="d-fg"/><path d="M28 18 L32 8 L38 17 Z M60 18 L56 8 L50 17 Z" class="d-fg"/>';
  s+='<circle cx="36" cy="33" r="5" class="d-hole"/><circle cx="52" cy="33" r="5" class="d-hole"/><circle cx="37" cy="32" r="1.6" class="d-fg"/><circle cx="53" cy="32" r="1.6" class="d-fg"/><path d="M36 45 Q44 52 52 45" class="d-feat" style="stroke-width:2"/>';
  s+='<path d="M56 54 Q62 60 66 62" class="d-ln" style="stroke:var(--sign-muted);stroke-width:4"/>';
  s+=gL("M20 36 H106")+gT(44,68,"costume head","middle")+gT(88,20,"the person","middle")+gT(146,38,"same height","end");
  IDEA_ART2["tsq-odd"]=s; })();
// Window doubles: a mannequin in the shop window and a reflected walker lined up at the same size, facing each other
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  s+='<rect x="8" y="6" width="134" height="88" class="d-hole"/><path d="M8 6 H142 V94 H8 Z" fill="none" stroke="var(--sign-muted)" stroke-width="2.5"/>';
  s+='<rect x="40" y="10" width="70" height="7" rx="2" class="d-mu" opacity=".5"/>';
  s+='<path d="M8 6 L60 94 H96 L44 6 Z" class="d-fg" opacity=".05"/>';
  s+='<rect x="56" y="80" width="2" height="12" class="d-mu"/><rect x="48" y="91" width="18" height="2" class="d-mu"/>'+dStand(57,80,48,"d-mu");
  s+='<g opacity=".45">'+dW(98,90,52,"d-fg",-1)+'</g>';
  s+=gL("M28 36.5 H126")+gT(52,30,"mannequin","end")+gT(105,30,"reflection")+gT(14,44,"same height");
  IDEA_ART2["soho-odd"]=s; })();

// Old signs, new tenants: the faded painted sign across the top third, the new shopfront below, a customer in the doorway
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  for(let y=6;y<100;y+=6) s+='<path d="M0 '+y+' H150" class="d-feat" style="stroke-width:.4;opacity:.6"/>';
  s+='<rect x="12" y="8" width="126" height="20" class="d-mu" opacity=".28"/>';
  for(const [x,w] of [[18,14],[36,10],[50,18],[72,8],[84,16],[104,12],[120,12]]) s+='<rect x="'+x+'" y="13" width="'+w+'" height="10" rx="1" class="d-mu" opacity=".55"/>';
  s+='<rect x="0" y="40" width="150" height="10" class="d-fg"/><path d="M0 50 L6 56 L12 50 L18 56 L24 50 L30 56 L36 50 L42 56 L48 50 L54 56 L60 50 L66 56 L72 50 L78 56 L84 50 L90 56 L96 50 L102 56 L108 50 L114 56 L120 50 L126 56 L132 50 L138 56 L144 50 L150 56 V50 Z" class="d-fg"/>';
  s+='<rect x="8" y="60" width="44" height="34" class="d-hole"/><rect x="98" y="60" width="44" height="34" class="d-hole"/><rect x="62" y="58" width="26" height="40" class="d-hole"/>';
  s+=dW(75,96,30,"d-fg",-1);
  s+='<rect x="0" y="96" width="150" height="4" class="d-mu" opacity=".5"/>';
  s+=gL("M1 33.3 H149")+gT(75,36,"old sign: top third","middle")+gT(4,58,"new shop")+gT(91,70,"customer in")+gT(91,78,"the doorway");
  IDEA_ART2["les-odd"]=s; })();

// Suits at the food cart: the cart and the suit side by side at the same scale, steam rising between them
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<rect x="0" y="0" width="26" height="72" class="d-bg"/><rect x="30" y="0" width="22" height="60" class="d-bg" opacity=".6"/><rect x="118" y="0" width="32" height="70" class="d-bg"/>';
  s+='<path d="M0 86 H150 V100 H0 Z" class="d-bg" opacity=".5"/>';
  s+='<path d="M14 26 L50 18 L86 26 Z" class="d-mu"/><rect x="49" y="24" width="2" height="16" class="d-mu"/>';
  s+='<rect x="18" y="40" width="64" height="40" rx="2" class="d-mu"/><rect x="22" y="44" width="56" height="10" class="d-hole"/><rect x="24" y="58" width="52" height="18" class="d-bg"/>';
  s+='<circle cx="28" cy="84" r="4" class="d-bg"/><circle cx="72" cy="84" r="4" class="d-bg"/>';
  s+='<path d="M88 46 q-4 -6 0 -12 q4 -6 0 -12 M95 48 q-4 -6 0 -12 q4 -6 0 -12" fill="none" stroke="var(--sign-fg)" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>';
  s+='<g class="d-fg"><circle cx="118" cy="30" r="5.4"/><path d="M110 38 H126 L128 64 H122 L121 88 H116 L115.5 66 H114.5 L114 88 H109 L108 64 Z"/></g><path d="M118 38 L116 46 L118 52 L120 46 Z" class="d-hole"/><rect x="128" y="56" width="8" height="10" rx="1" class="d-mu"/>';
  s+=gL("M14 24 V88 M128 24 V88")+gT(50,96,"the cart","middle")+gT(118,96,"the suit","middle")+gT(98,16,"steam between","middle");
  IDEA_ART2["midtown-odd"]=s; })();

// Surfboards on the shuttle: the board held upright beside the station sign, tops level
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 74 H150 V82 H0 Z" class="d-fg" opacity=".85"/><path d="M0 82 H150 V100 H0 Z" class="d-bg"/>';
  s+='<rect x="0" y="0" width="150" height="10" class="d-bg"/><path d="M10 10 V74 M140 10 V74" class="d-ln" style="stroke:var(--sign-line);stroke-width:3"/>';
  s+='<rect x="26" y="18" width="2.4" height="56" class="d-mu"/><rect x="58" y="18" width="2.4" height="56" class="d-mu"/><rect x="18" y="18" width="50" height="18" rx="1.5" class="d-fg"/>';
  s+='<rect x="24" y="23" width="38" height="4" rx="1" class="d-hole"/><rect x="24" y="29" width="22" height="3" rx="1" class="d-hole"/>';
  s+='<path d="M98 74 V30 Q98 18 103 18 Q108 18 108 30 V74 Q103 77 98 74 Z" class="d-mu"/><path d="M103 22 V72" class="d-feat" style="stroke-width:.6"/>';
  s+=dStand(116,74,40);
  s+=gL("M14 18 H112")+gT(43,44,"station sign","middle")+gT(103,88,"the board","middle")+gT(146,14,"tops level","end");
  IDEA_ART2["rockaway-odd"]=s; })();

// The soapbox: the hand-lettered sign and the reader's face, similar in size, the speaker left out
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  s+='<rect x="10" y="12" width="64" height="58" rx="1" class="d-fg"/>';
  for(const [y,w] of [[20,50],[30,42],[40,54],[50,36],[60,46]]) s+='<path d="M16 '+y+' h'+w+'" stroke="var(--sign)" stroke-width="4" stroke-linecap="round" opacity=".8"/>';
  s+='<rect x="38" y="70" width="3" height="30" class="d-mu"/>';
  s+='<path d="M86 100 V82 Q88 68 104 66 H118 Q134 68 136 82 V100 Z" class="d-mu"/><circle cx="111" cy="46" r="17" class="d-fg"/><path d="M95 40 Q100 26 112 28 Q126 28 128 42 Q118 34 104 36 Z" class="d-hole"/>';
  s+='<circle cx="102" cy="47" r="1.6" class="d-hole"/><circle cx="112" cy="47" r="1.6" class="d-hole"/><path d="M103 56 Q107 57.5 111 56" class="d-feat" style="stroke-width:1.3"/>';
  s+=gArrow(96,46,80,44)+gT(42,8,"the sign","middle")+gT(111,24,"the reader","middle")+gT(146,96,"speaker out of frame","end");
  IDEA_ART2["union-odd"]=s; })();

// Pumpkins and skateboards: pumpkins large in front, the grey steps behind, a skater crossing the gap
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  for(let i=0;i<6;i++){ const y=20+i*8; s+='<rect x="0" y="'+y+'" width="150" height="8" class="d-bg" opacity="'+(0.45+i*0.08).toFixed(2)+'"/><path d="M0 '+y+' H150" class="d-feat" style="stroke-width:.6"/>'; }
  s+='<rect x="0" y="68" width="150" height="32" class="d-bg" opacity=".9"/>';
  const pk=(x,y,r)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+r+'" ry="'+(r*0.8).toFixed(1)+'" class="d-mu"/><path d="M'+(x-r*0.4).toFixed(1)+' '+(y-r*0.75).toFixed(1)+' Q'+(x-r*0.55).toFixed(1)+' '+y+' '+(x-r*0.4).toFixed(1)+' '+(y+r*0.75).toFixed(1)+' M'+x+' '+(y-r*0.8).toFixed(1)+' V'+(y+r*0.8).toFixed(1)+' M'+(x+r*0.4).toFixed(1)+' '+(y-r*0.75).toFixed(1)+' Q'+(x+r*0.55).toFixed(1)+' '+y+' '+(x+r*0.4).toFixed(1)+' '+(y+r*0.75).toFixed(1)+'" class="d-feat" style="stroke-width:1"/><rect x="'+(x-1.5).toFixed(1)+'" y="'+(y-r*0.95).toFixed(1)+'" width="3" height="'+(r*0.3).toFixed(1)+'" class="d-bg"/>';
  s+=pk(18,82,16)+pk(48,88,13)+pk(30,62,11)+pk(58,68,9);
  s+='<g transform="rotate(-8 104 70)">'+dW(104,70,30,"d-fg",1)+'</g><rect x="92" y="72" width="22" height="2.4" rx="1.2" class="d-fg"/><circle cx="96" cy="76" r="1.6" class="d-fg"/><circle cx="110" cy="76" r="1.6" class="d-fg"/>';
  s+=gL("M76 30 V96 M132 30 V96")+gT(4,50,"pumpkins: large, near")+gT(104,26,"skater in the gap","middle")+gT(146,8,"grey steps behind","end");
  IDEA_ART2["union-odd-s"]=s; })();

// The handoff: two hands meeting in the frame with the goods, faces cut by the top edge, nothing of the street
const dHandoff = (item,faces,hx) => { let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 78 H150 V100 H0 Z" class="d-bg"/>';
  s+='<path d="M-4 0 H44 Q48 22 30 30 Q14 34 -4 28 Z" class="d-mu"/><path d="M-4 30 Q20 36 42 34 L56 100 H-4 Z" class="d-bg" opacity=".9"/>';
  if(faces>1) s+='<path d="M154 0 H106 Q102 22 120 30 Q136 34 154 28 Z" class="d-mu"/><path d="M154 30 Q130 36 108 34 L94 100 H154 Z" class="d-bg" opacity=".9"/>';
  else s+='<path d="M154 40 Q130 44 108 48 L94 100 H154 Z" class="d-bg" opacity=".9"/>';
  // forearms in sleeves reaching in from both sides, hands meeting at hx
  s+='<path d="M14 84 L'+(hx-20)+' 58 L'+(hx-14)+' 66 L24 92 Z" class="d-mu"/><path d="M136 84 L'+(hx+20)+' 58 L'+(hx+14)+' 66 L126 92 Z" class="d-mu"/>';
  s+='<path d="M'+(hx-20)+' 58 Q'+(hx-16)+' 52 '+(hx-9)+' 54 L'+(hx-5)+' 57 Q'+(hx-6)+' 63 '+(hx-12)+' 66 L'+(hx-14)+' 66 Z" class="d-fg"/><path d="M'+(hx+20)+' 58 Q'+(hx+16)+' 52 '+(hx+9)+' 54 L'+(hx+5)+' 57 Q'+(hx+6)+' 63 '+(hx+12)+' 66 L'+(hx+14)+' 66 Z" class="d-fg"/>';
  s+=item(hx,54);
  s+=gT(4,40,faces>1?"faces at the top edge":"one face at the top edge")+gT(hx,94,"hands and goods","middle");
  return s; };
const itemBag=(x,y)=>'<path d="M'+(x-9)+' '+(y-6)+' H'+(x+9)+' L'+(x+11)+' '+(y+14)+' H'+(x-11)+' Z" class="d-fg"/><path d="M'+(x-5)+' '+(y-6)+' Q'+x+' '+(y-14)+' '+(x+5)+' '+(y-6)+'" fill="none" stroke="var(--sign-fg)" stroke-width="1.6"/>';
const itemParcel=(x,y)=>'<rect x="'+(x-12)+'" y="'+(y-4)+'" width="24" height="12" rx="2" class="d-fg"/><path d="M'+(x-12)+' '+(y+2)+' H'+(x+12)+' M'+x+' '+(y-4)+' V'+(y+8)+'" class="d-feat" style="stroke-width:.8"/>';
const itemBowl=(x,y)=>'<path d="M'+(x-14)+' '+(y-2)+' H'+(x+14)+' Q'+(x+12)+' '+(y+12)+' '+x+' '+(y+12)+' Q'+(x-12)+' '+(y+12)+' '+(x-14)+' '+(y-2)+' Z" class="d-fg"/><path d="M'+(x-4)+' '+(y-6)+' q-3 -5 0 -10 M'+(x+4)+' '+(y-6)+' q-3 -5 0 -10" fill="none" stroke="var(--sign-fg)" stroke-width="1.2" opacity=".6"/>';
const itemTray=(x,y)=>'<rect x="'+(x-12)+'" y="'+(y-2)+'" width="24" height="9" rx="1.5" class="d-fg"/><circle cx="'+(x-5)+'" cy="'+(y-3)+'" r="3.4" class="d-mu"/><circle cx="'+(x+4)+'" cy="'+(y-3)+'" r="3.4" class="d-mu"/>';
IDEA_ART2["chinatown-moment"]=dHandoff(itemBag,2,75);
IDEA_ART2["les-moment"]=dHandoff(itemParcel,2,75);
IDEA_ART2["arthur-moment"]=dHandoff(itemParcel,2,75);
IDEA_ART2["flushing-moment"]=dHandoff(itemBowl,1,75);
IDEA_ART2["jh-moment"]=dHandoff(itemTray,2,100)+gL("M100 1 V99");

// Neon in the window: reflections across the glass, the neon sign in an upper corner, one face inside on a third
const dWindowNeon = steam => { let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<rect x="0" y="62" width="150" height="38" class="d-bg" opacity=".7"/>';
  s+='<circle cx="100" cy="48" r="10" class="d-mu"/><path d="M86 70 Q88 58 100 58 Q112 58 114 70 Z" class="d-mu"/><circle cx="30" cy="52" r="8" class="d-bg"/><path d="M18 70 Q20 60 30 60 Q40 60 42 70 Z" class="d-bg"/><circle cx="134" cy="54" r="7" class="d-bg"/>';
  if(steam) s+='<g fill="none" stroke="var(--sign-fg)" stroke-linecap="round" opacity=".25" stroke-width="5"><path d="M60 70 q-8 -12 2 -22 q8 -10 -2 -22"/><path d="M74 72 q-8 -12 2 -22"/></g>';
  s+='<path d="M10 0 L44 0 L92 100 H58 Z M118 0 H134 L150 40 V70 Z" class="d-fg" opacity=".07"/>';
  s+='<rect x="12" y="10" width="40" height="16" rx="8" fill="none" stroke="var(--sign-fg)" stroke-width="2.4" opacity=".9"/><path d="M20 18 h8 M32 18 h12" stroke="var(--sign-fg)" stroke-width="2" stroke-linecap="round" opacity=".9"/>';
  s+='<path d="M0 0 H150 V100 H0 Z" fill="none" stroke="var(--sign-line)" stroke-width="4"/>';
  s+=gL("M100 1 V99")+gT(56,16,"neon in a corner")+gT(96,32,"face on a third","end")+gT(146,96,"reflections over the glass","end");
  return s; };
IDEA_ART2["les-mood"]=dWindowNeon(false);
IDEA_ART2["ktown-mood"]=dWindowNeon(false);

// Under the arcade: looking along the tiled hall, performer near on a third, listeners further along, arches bright down the right
(()=>{ const V=[104,52]; let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 0 H150 V8 L'+V[0]+' 40 H86 L0 18 Z" class="d-bg"/>';
  for(let k=1;k<6;k++){ const t=k/6; s+='<path d="M'+n1(V[0]*t)+' '+n1(18*(1-t)+40*t)+' L'+n1(150-(150-V[0])*t)+' '+n1(8*(1-t)+40*t)+'" class="d-feat" style="stroke-width:.5;opacity:.7"/>'; }
  for(const x of [10,30,50,70,90,110,130]) s+='<path d="M'+x+' 0 L'+n1(86+(x/150)*18)+' 40" class="d-feat" style="stroke-width:.5;opacity:.7"/>';
  s+='<path d="M0 18 L86 40 V64 L0 100 Z" class="d-bg" opacity=".7"/>';
  s+='<path d="M150 8 L104 40 V64 L150 100 Z" class="d-bg"/>';
  for(const [x0,x1] of [[150,136],[132,122],[119,113],[110,107]]){ const top=y=>8+(40-8)*(150-y)/46, bot=y=>100-(100-64)*(150-y)/46;
    s+='<path d="M'+x0+' '+n1(bot(x0))+' V'+n1(top(x0)+(x0-x1)*0.9)+' Q'+n1((x0+x1)/2)+' '+n1(top(x0)-1)+' '+x1+' '+n1(top(x1)+(x0-x1)*0.9)+' V'+n1(bot(x1))+' Z" class="d-fg" opacity=".85"/>'; }
  s+='<path d="M0 100 L86 64 H104 L150 100 Z" class="d-mu" opacity=".14"/>';
  s+=dStand(92,64,20,"d-mu")+dStand(100,62,17,"d-mu")+dStand(84,66,22,"d-mu");
  s+=dStand(40,98,62)+'<path d="M44 70 L68 50" stroke="var(--sign-muted)" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="42" cy="73" rx="10" ry="8" class="d-mu"/><circle cx="43" cy="72" r="2.4" class="d-hole"/>';
  s+=gL("M50 1 V99")+gT(4,28,"performer: near, sharp")+gT(92,46,"listeners","middle")+gT(146,96,"bright arches","end")+gT(75,7,"tiled ceiling","middle");
  IDEA_ART2["cpark-odd"]=s; })();
// Stacked languages: shop signs square-on filling the frame like a page of text, one walker small at the bottom centre
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  const rows=[[4,[[4,40],[48,30],[82,64]]],[22,[[4,56],[64,38],[106,40]]],[40,[[4,30],[38,50],[92,54]]],[58,[[4,46],[54,44],[102,44]]]];
  rows.forEach(([y,cells],r)=>cells.forEach(([x,w],k)=>{ s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="15" rx="1" class="'+((r+k)%2?'d-mu':'d-fg')+'"/>';
    for(let i=0;i<Math.floor(w/9);i++) s+='<rect x="'+(x+4+i*9)+'" y="'+(y+5)+'" width="'+(5+((i*7+r)%3))+'" height="5" rx="1" class="d-hole" opacity=".75"/>'; }));
  s+='<rect x="0" y="76" width="150" height="24" class="d-hole"/>';
  s+=dW(75,96,18,"d-fg",1);
  s+=gT(4,86,"signs fill the frame, square-on")+gT(84,95,"walker: small");
  IDEA_ART2["jh-odd"]=s; })();

// Caviar and kitsch: the display edge to edge, shelves level, one doll on a third where the eye lands
(()=>{ let s='<rect width="150" height="100" class="d-bg"/>';
  for(const y of [32,64,96]) s+='<rect x="0" y="'+y+'" width="150" height="3" class="d-mu"/>';
  for(let x=4;x<150;x+=14) s+='<rect x="'+x+'" y="20" width="11" height="12" rx="2" class="d-mu"/><rect x="'+x+'" y="24" width="11" height="3" class="d-hole" opacity=".6"/>';
  for(let x=6;x<150;x+=18){ if(x>40&&x<62) continue; s+='<ellipse cx="'+(x+6)+'" cy="58" rx="6" ry="5" class="d-mu"/><rect x="'+x+'" y="46" width="12" height="8" rx="3" class="d-mu" opacity=".8"/>'; }
  const doll=(x,y,h,c)=>'<ellipse cx="'+x+'" cy="'+(y-h*0.32)+'" rx="'+(h*0.3)+'" ry="'+(h*0.34)+'" class="'+c+'"/><circle cx="'+x+'" cy="'+(y-h*0.78)+'" r="'+(h*0.2)+'" class="'+c+'"/><circle cx="'+x+'" cy="'+(y-h*0.78)+'" r="'+(h*0.12)+'" class="d-hole" opacity=".5"/>';
  s+=doll(50,64,30,"d-fg");
  for(let x=10;x<150;x+=16) if(x<40||x>66) s+=doll(x,94,22,"d-mu");
  s+=gL("M50 1 V99")+gT(58,44,"one doll on a third")+gT(146,12,"shelves level, edge to edge","end");
  IDEA_ART2["brighton-odd"]=s; })();

// The drop: the first two rows of faces filling the frame, the track a diagonal behind them
(()=>{ let s='<rect width="150" height="100" class="d-hole"/>';
  s+='<path d="M0 64 L150 4" class="d-ln" style="stroke:var(--sign-line);stroke-width:7"/>'; for(let x=6;x<150;x+=12) s+='<path d="M'+x+' '+n1(64-x*0.4+5)+' L'+(x+4)+' '+n1(64-(x+4)*0.4-5)+'" class="d-ln" style="stroke:var(--sign-line);stroke-width:2"/>';
  const face=(x,y,r,c)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" class="'+c+'"/><ellipse cx="'+x+'" cy="'+(y+r*0.42)+'" rx="'+(r*0.3)+'" ry="'+(r*0.24)+'" class="d-hole"/><circle cx="'+(x-r*0.35)+'" cy="'+(y-r*0.15)+'" r="'+(r*0.12)+'" class="d-hole"/><circle cx="'+(x+r*0.35)+'" cy="'+(y-r*0.15)+'" r="'+(r*0.12)+'" class="d-hole"/>';
  s+=face(52,40,13,"d-mu")+face(98,40,13,"d-mu");
  s+='<path d="M14 26 l-6 -14 M90 26 l-4 -16" class="d-ln" style="stroke:var(--sign-muted);stroke-width:4;stroke-linecap:round"/>';
  s+='<rect x="0" y="58" width="150" height="10" class="d-bg"/>';
  s+=face(38,76,17,"d-fg")+face(110,76,17,"d-fg");
  s+='<path d="M20 70 l-10 -26 M128 70 l10 -26" class="d-ln" style="stroke:var(--sign-fg);stroke-width:5;stroke-linecap:round"/>';
  s+='<rect x="0" y="94" width="150" height="6" class="d-bg"/>';
  s+=gT(146,12,"track: a diagonal behind","end")+gT(75,56,"two rows of faces fill the frame","middle");
  IDEA_ART2["coney-moment"]=s; })();
Object.assign(IDEA_ART, IDEA_ART2);


const STANCE_OF = {};
Object.assign(COMPOSE, {"cpark-mood-s":["frame","The canopy closes over the path and frames the figure. Keep the path running to the far end."],"cpark-moment-s":["space", "Crouch and shoot up so sky and falling leaves fill most of the frame, with the reaching hands and face small near the bottom."],
 "wsp-mood-s":["layers","Leaves near and above, the player in the middle, the far side of the square behind."],"harlem-place-s":["lines","The stoop railings and the kerb lead down the block under the orange canopy. Put the one person on a stoop or the pavement on a third, a few houses in."],
 "dumbo-place-s":["diag","Let the path climb corner to corner toward the monument, with the walker on the line."],"brighton-mood-s":["light","Face west along the boardwalk with the sun just out of the frame or hidden behind a figure. Expose for the bright sky so the benches and people go dark, with their shadows running toward you along the bottom."],"union-odd-s":["juxta", "Put the orange pumpkins on one side at about 2.5 m so they stay sharp, the grey steps behind, and wait for a skater to cross the gap mid-push. The colour against the grey is the contrast."]});
Object.entries({down:"harlem-place-s",wait:"cpark-mood-s cpark-moment-s union-odd-s",low:"wsp-mood-s dumbo-place-s",backlight:"brighton-mood-s"}).forEach(([k,v])=>v.split(" ").forEach(id=>STANCE_OF[id]=k));
Object.assign(COMPOSE, {"union-place": ["layers", "Tents near, shoppers in the middle, the buildings on the square far. Keep the aisle running into the distance."], "union-moment": ["fill", "Hands, board and the regular's face fill the frame. Nothing of the square is needed."], "union-energy": ["diag", "Let the steps run corner to corner across the frame. Put the seated person sharp on a third, and let the skaters and walkers blur along the step lines past them."], "union-mood": ["light", "Put the Metronome digits in the upper third and the people on the steps along the bottom as dark shapes. Expose for the digits so the wall and the people fall to silhouette."], "union-odd": ["juxta", "Get the sign and the reader's face in the frame together, at a similar size: the sign on one side, the face on the other, both readable. Leave the speaker out."], "fidi-place": ["layers", "Three depths: the Federal Hall steps along the bottom edge, the suits crossing Broad Street in the middle, and the Exchange's columns and flags on the right behind them. Keep the columns upright."], "fidi-moment": ["thirds", "Put the arriving plate or raised glass on a third, with the tables running off the opposite side."], "fidi-energy": ["sym", "Centre the spine of the Oculus so the white ribs fan out equally on both sides, with the blurred commuters crossing the floor in the bottom third."], "fidi-mood": ["light", "Put the lit slot off centre and let shadow fill the rest of the frame. Press when one figure is fully inside the light."], "fidi-odd": ["fill", "Put the bull's flank in one corner, the reaching hands in the middle, and let the queue run out of the opposite edge."], "ktown-place": ["lines", "The stacked signs and the kerb lead up the street from the near side. Put a walker beneath the signs on the lower third, and keep the verticals straight."], "ktown-moment": ["frame", "Stand square to the doors so the door frame is upright, and put the person who has stopped in the middle of it, head clear of the top, with the shopping bag in view."], "ktown-energy": ["diag", "Turn until 34th Street and the crowd on the crossing run from a lower corner up to the opposite top corner, with the Empire State Building in that corner. The blurred walkers then stream along the line."], "ktown-mood": ["reflect", "Get close to the glass so the street's neon lies over the diners. Move a step at a time until a reflection lands on a face, and keep the bright sign reflections out of the middle."], "ktown-odd": ["juxta", "Crouch so the stall fills the bottom third: foam crowns, I Love NY shirts and the little Empire State models. The real tower rises out of the top of the stall and fills the rest. The picture is the cheap copies under the real thing, so put one of the models right below the tower to pair them. Keep the space above the stall clear of signs, heads and other buildings so nothing competes with the tower."], "bushwick-place": ["layers", "Three layers: the kerb and a parked car along the bottom, the walker in the middle, the mural behind. Wait until the walker is clear of the painting's main figure so the two do not merge."], "bushwick-moment": ["layers", "Three layers: the friend giving directions near you and sharp, the poser in the middle, the mural behind. Keep all three apart so none overlaps another."], "bushwick-energy": ["diag", "Shoot along the pavement so the shopfronts run away on a diagonal. Put the vendor sharp on a third, and let the shoppers blur along the line between you and them."], "bushwick-mood": ["space", "Let the wall and the light fill most of the frame. Keep the one person small, near a lower corner, walking into the picture."], "bushwick-odd": ["juxta", "The painted face and the real one, side by side at the same scale."], "chelsea-place": ["frame", "The window is the frame: keep all four of its edges in the picture and square to them. The seated people are a row of heads along the bottom, the avenue and its headlights inside the window."], "chelsea-moment": ["frame", "Put the lit gallery doorway in the middle as a bright shape behind the group, so their outlines and gestures read against it. Keep the conversation within the width of the door."], "chelsea-energy": ["lines", "The brick walls and the floor run to a vanishing point at the far end of the hall. Put the still person at a counter on a third, sharp, while the walkers blur along the lines."], "chelsea-mood": ["light", "Keep the horizon low and expose for the sky. The columns go dark along the bottom and one side, and one or two figures stand clear of them against the brightest part of the sky."], "chelsea-odd": ["reflect", "The reflection is the picture: leave out the edge of the Vessel. Tilt and step until the bent or doubled figure fills most of the frame."], "brighton-place": ["lines", "The el columns and the kerb lead down the avenue, with the dark track as a band across the top. Put the person under the el where the lines converge."], "brighton-moment": ["thirds", "Put the two heads on the upper thirds and let the boardwalk fill the bottom."], "brighton-energy": ["layers", "Strollers near, diners in the middle, the restaurant lights behind."], "brighton-mood": ["space", "Sky and sea take almost the whole frame; the figure sits low and small."], "brighton-odd": ["fill", "Stand square to the glass so the shelves run level, and fill the frame edge to edge with the display, leaving out the window frame. Let one tin or doll sit on a third as the place the eye lands."]});
Object.entries({"down": "union-place ktown-place bushwick-place brighton-place bushwick-mood", "side": "union-moment fidi-odd bushwick-moment brighton-moment", "anchor": "union-energy ktown-energy bushwick-energy chelsea-energy", "glass": "ktown-mood brighton-odd chelsea-odd", "above": "fidi-place fidi-energy chelsea-place", "low": "ktown-odd", "wait": "union-mood union-odd fidi-mood ktown-moment bushwick-odd chelsea-moment brighton-energy", "backlight": "chelsea-mood brighton-mood", "along": "fidi-moment"}).forEach(([k,v])=>v.split(" ").forEach(id=>STANCE_OF[id]=k));
Object.entries({
  down:"chinatown-place wsp-place dumbo-place coney-place coney-mood soho-place jh-place ferry-place subway-place subway-mood",
  side:"chinatown-moment chinatown-odd tsq-odd wsp-odd dumbo-moment jh-moment ferry-energy ferry-odd subway-odd",
  anchor:"chinatown-energy tsq-energy coney-energy jh-energy subway-energy",
  glass:"chinatown-mood soho-odd subway-moment",
  above:"gct-place gct-energy tsq-place",
  low:"tsq-mood wsp-energy dumbo-odd soho-energy",
  wait:"gct-moment gct-mood tsq-moment coney-moment soho-moment soho-mood jh-mood ferry-moment",
  backlight:"wsp-mood dumbo-energy dumbo-mood ferry-mood",
  square:"gct-odd coney-odd jh-odd",
  along:"wsp-moment"
}).forEach(([k,v])=>v.split(" ").forEach(id=>STANCE_OF[id]=k));
Object.entries({"down": "harlem-mood les-place flushing-place wburg-place midtown-place cpark-place cpark-mood rockaway-place arthur-place", "side": "les-moment flushing-mood wburg-moment midtown-odd cpark-odd rockaway-odd arthur-moment arthur-odd", "anchor": "harlem-energy les-energy flushing-energy cpark-energy", "glass": "les-mood arthur-mood", "low": "flushing-odd wburg-energy midtown-energy rockaway-moment rockaway-energy arthur-energy", "wait": "harlem-place harlem-moment midtown-moment midtown-mood cpark-moment rockaway-mood", "backlight": "wburg-mood", "square": "harlem-odd les-odd wburg-odd", "along": "flushing-moment"}).forEach(([k,v])=>v.split(" ").forEach(id=>STANCE_OF[id]=k));
/* Reference photos, one per composition technique, from Wikimedia Commons under free licences.
   The installed app shows them inline; inside Claude outside images are blocked, so a link is shown instead. */
const PHOTOS_INLINE = false;
const TECH_PHOTO = {
 "lines": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Sunrise_Walking_Lignano_Italy_Color_Street_Photography_%28216812003%29.jpeg/960px-Sunrise_Walking_Lignano_Italy_Color_Street_Photography_%28216812003%29.jpeg",
  "by": "Giuseppe Milo",
  "lic": "CC BY 3.0",
  "page": "https://commons.wikimedia.org/wiki/File:Sunrise_Walking_Lignano_Italy_Color_Street_Photography_(216812003).jpeg",
  "note": "The railings and planks all run to the walker, so the eye lands on the figure first."
 },
 "frame": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Embarking_on_an_adventure_%28Unsplash%29.jpg/960px-Embarking_on_an_adventure_%28Unsplash%29.jpg",
  "by": "Mantas Hesthaven",
  "lic": "CC0",
  "page": "https://commons.wikimedia.org/wiki/File:Embarking_on_an_adventure_(Unsplash).jpg",
  "note": "The dark doorway surrounds the figure and hides everything that is not the subject."
 },
 "layers": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/New_York%2C_New_York_%284302222880%29.jpg/960px-New_York%2C_New_York_%284302222880%29.jpg",
  "by": "Jazz Guy",
  "lic": "CC BY 2.0",
  "page": "https://commons.wikimedia.org/wiki/File:New_York,_New_York_(4302222880).jpg",
  "note": "Walkers in front, taxis in the middle, buildings behind: three depths that do not overlap."
 },
 "space": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/D%C3%BClmen%2C_Leuste%2C_B%C3%A4ume_im_Nebel_--_2020_--_5041.jpg/960px-D%C3%BClmen%2C_Leuste%2C_B%C3%A4ume_im_Nebel_--_2020_--_5041.jpg",
  "by": "Dietmar Rabich",
  "lic": "CC BY-SA 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Leuste,_B%C3%A4ume_im_Nebel_--_2020_--_5041.jpg",
  "note": "Most of the frame is empty fog, which is what gives the small subject its weight. Not a street scene, but the same idea applies to a lone walker."
 },
 "sym": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Nostrand_Av_IND_td_%282026-02-20%29_09b_-_Upper_Level.jpg/960px-Nostrand_Av_IND_td_%282026-02-20%29_09b_-_Upper_Level.jpg",
  "by": "Tdorante10",
  "lic": "CC BY-SA 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:Nostrand_Av_IND_td_(2026-02-20)_09b_-_Upper_Level.jpg",
  "note": "The camera is level and centred, so the columns and platform edge mirror each other."
 },
 "fill": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Fishmonger_smiling%2C_Maracaibo_street_market%2C_Venezuela.jpg/960px-Fishmonger_smiling%2C_Maracaibo_street_market%2C_Venezuela.jpg",
  "by": "Wilfredor",
  "lic": "CC0",
  "page": "https://commons.wikimedia.org/wiki/File:Fishmonger_smiling,_Maracaibo_street_market,_Venezuela.jpg",
  "note": "The face runs almost edge to edge. Nothing in the frame competes with it."
 },
 "thirds": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Cape_Shabla_Lighthouse_3.jpg/960px-Cape_Shabla_Lighthouse_3.jpg",
  "by": "MrPanyGoff",
  "lic": "CC BY-SA 3.0",
  "page": "https://commons.wikimedia.org/wiki/File:Cape_Shabla_Lighthouse_3.jpg",
  "note": "The subject sits on the left third and the horizon on the lower third. Not a street scene, but place a person where the lighthouse is."
 },
 "juxta": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/02025_0882_Street_photography_in_Bielsko-Bia%C5%82a.jpg/960px-02025_0882_Street_photography_in_Bielsko-Bia%C5%82a.jpg",
  "by": "Marsilar",
  "lic": "CC BY-SA 4.0",
  "page": "https://commons.wikimedia.org/wiki/File:02025_0882_Street_photography_in_Bielsko-Bia%C5%82a.jpg",
  "note": "A passer-by lines up with the portraits on display, so the real person and the pictured ones read as a set."
 },
 "diag": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Tooting_Bec_escalators.jpg/960px-Tooting_Bec_escalators.jpg",
  "by": "Oxyman",
  "lic": "CC BY 2.5",
  "page": "https://commons.wikimedia.org/wiki/File:Tooting_Bec_escalators.jpg",
  "note": "An example from elsewhere, a London Underground station: the handrails run from the bottom corners up into the frame. Step to one side of centre and the same lines become one strong diagonal."
 },
 "reflect": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/K%C3%B6lnHBF_Empfangshalle_Winter2010_2641r.jpg/960px-K%C3%B6lnHBF_Empfangshalle_Winter2010_2641r.jpg",
  "by": "Túrelio",
  "lic": "CC BY-SA 3.0 DE",
  "page": "https://commons.wikimedia.org/wiki/File:K%C3%B6lnHBF_Empfangshalle_Winter2010_2641r.jpg",
  "note": "The wet floor repeats the crowd and the lights, and takes up more of the frame than the people do."
 },
 "light": {
  "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Child_and_wave_jump.jpg/960px-Child_and_wave_jump.jpg",
  "by": "Philippe Alès",
  "lic": "CC BY-SA 3.0",
  "page": "https://commons.wikimedia.org/wiki/File:Child_and_wave_jump.jpg",
  "note": "Exposed for the bright sky and spray, the figure goes fully dark and reads as a shape."
 }
};
TECH_PHOTO.reflect = {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/She_And_Her_Umbrella_%28125944719%29.jpeg/960px-She_And_Her_Umbrella_%28125944719%29.jpeg", "by": "Nicu Buculei", "lic": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:She_And_Her_Umbrella_(125944719).jpeg", "note": "The wet pavement takes two thirds of the frame and carries the colour. The figure with the umbrella sits small along the top edge."};
// A photo for one specific idea, used instead of its technique's photo.
const IDEA_PHOTO = {"ktown-odd": null, "midtown-place": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Theater_District%2C_New_York%2C_NY%2C_USA_-_panoramio_%281%29.jpg/960px-Theater_District%2C_New_York%2C_NY%2C_USA_-_panoramio_%281%29.jpg", "by": "Santi Garcia", "lic": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Theater_District,_New_York,_NY,_USA_-_panoramio_(1).jpg", "note": "The real wall of towers on the west side of Sixth Avenue, each one stepping back behind the last. This is one side of the canyon, shot looking up. For the idea above, turn to face along the avenue so a second wall like this closes the other side, and tilt down until the white sky is out of the frame."}, "tsq-moment": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Portrait_%282209648969%29.jpg/960px-Portrait_%282209648969%29.jpg", "by": "jehangreco", "lic": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Portrait_(2209648969).jpg", "note": "The face fills the frame and is lit by what the person is looking at, with the eyes turned up and out of the picture. The background has melted into spots of coloured light."}, "tsq-mood": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/THANK_YOU_NYC.jpg/960px-THANK_YOU_NYC.jpg", "by": "Jorge Jaramillo", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:THANK_YOU_NYC.jpg", "note": "Times Square after rain, shot from the edge of a puddle. The screens are repeated in the water, and the one figure with an umbrella sits on the line where the two halves meet."}};
function photoDemo(key,id,open){ const p=id in IDEA_PHOTO?IDEA_PHOTO[id]:TECH_PHOTO[key]; if(!p) return ""; const wk=id in IDEA_PHOTO?id:key;
  const credit='Photo: '+esc(p.by)+' · '+esc(p.lic)+' · <a href="'+esc(p.page)+'" target="_blank" rel="noopener">Wikimedia Commons ↗</a>';
  const own=id in IDEA_PHOTO;
  return '<figure class="refphoto'+(open&&FRAME_WHY[wk]?' why':'')+'"><span class="label">'+(own?'Reference photo':'Example photo of '+esc(TECH[key][0].toLowerCase())+', from another place')+'</span>'+
    (PHOTOS_INLINE ? '<span class="refimg"><img src="'+esc(p.src)+'" alt="Example photograph showing '+esc(TECH[key][0].toLowerCase())+'" loading="lazy" onerror="this.parentNode.hidden=true;this.parentNode.nextElementSibling.hidden=false">'+whyOverlay(wk)+'</span><a class="reflink" href="'+esc(p.page)+'" target="_blank" rel="noopener" hidden>Open the reference photo ↗ (not available offline yet)</a>'
                   : '<a class="reflink" href="'+esc(p.page)+'" target="_blank" rel="noopener">Open the reference photo ↗</a>')+
    '<figcaption>'+esc(p.note)+'<span>'+credit+'</span></figcaption>'+(open?whyBlock(wk).replace('aria-expanded="false">Why this frame works','aria-expanded="true">Hide the explanation').replace('<ol class="whylist" hidden>','<ol class="whylist">'):whyBlock(wk))+'</figure>'; }
const workDemo = id => { const s=WORK_ART[id]||STANCE[STANCE_OF[id]]; if(!s) return ""; const cap=STANCE_CAP[id]||s[1];
  return '<figure class="demo">'+dSvg(s[2],s[0]+": "+cap,false)+'<figcaption>'+s[0]+'. '+cap+' Yellow is you and what the lens sees; white is the subject.</figcaption></figure>'; };
/* The drawing: one made for this idea when there is one ("How the frame should look"); otherwise the technique's own drawing,
   labelled as the technique in general so it is not read as a picture of this place. */
const composeDemo = (key,id) => { const own=IDEA_ART[id], art=own||TECH_ART[key]; return art ? '<figure class="demo'+(own?'':' generic')+'">'+(own?'':'<span class="label">'+esc(TECH[key][0])+' in general</span>')+dSvg(art,TECH[key][0]+(own?" example frame":" in general"),true)+'<figcaption>'+(own?'How the frame should look.':'The technique on its own, not this place. How to use it here is described above.')+'</figcaption></figure>' : ""; };

/* Events. Dates are computed from each event's usual pattern, so the list stays current every year.
   when(year) returns a list of [start, end?] occurrences. approx:true means the date is announced each year.
   Adding a city's events means adding entries with that city id. */
const eD=(y,m,d)=>new Date(y,m-1,d);
const eNth=(y,m,wd,n)=>{const f=new Date(y,m-1,1); return eD(y,m,1+((wd-f.getDay()+7)%7)+(n-1)*7);};
const eLast=(y,m,wd)=>{const l=new Date(y,m,0); return eD(y,m,l.getDate()-((l.getDay()-wd+7)%7));};
const ePlus=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const eEaster=y=>{const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  return eD(y,Math.floor((h+l-7*m+114)/31),((h+l-7*m+114)%31)+1);};
const eTable=(t,fallback)=>y=>t[y]?[[eD(y,t[y][0],t[y][1])]]:(fallback?[[fallback(y)]]:[]);
const eThanks=y=>eNth(y,11,4,4);
const EVENTS = [
{id:"threekings",city:"nyc",name:"Three Kings Day Parade",approx:true,when:y=>[[eD(y,1,6)]],time:"Late morning",where:"East Harlem, around 106 St and Lexington Av",
 why:"Camels, giant puppets and school groups in crowns, on narrow streets where you can stand close.",
 spot:"The side streets near the start, where groups line up and adjust costumes.",
 ideas:[["moment","Crown adjustments","Children having crowns and capes fixed before they step off.","shallow"],["odd","Camel on Lexington","A live camel against bodegas and fire escapes. Keep the shopfronts in the frame.","deep"],["energy","Drummers","Marching drummers mid-strike with the crowd close behind.","freeze"]]},
{id:"lunar",city:"nyc",name:"Lunar New Year in Chinatown",approx:true,when:eTable({2027:[2,6],2028:[1,26],2029:[2,13],2030:[2,3]}),time:"Late morning to mid-afternoon",where:"Sara D. Roosevelt Park, Mott St and East Broadway",
 note:"The firecracker ceremony is on New Year's Day. The parade is usually a Sunday soon after.",
 why:"Lion dancers going from shop to shop, confetti cannons and red paper underfoot.",
 spot:"Skip the parade barricades. Follow one lion troupe along Mott or Bayard St as it visits each shop.",
 ideas:[["energy","Confetti burst","The instant a confetti cannon goes off over the crowd.","freeze"],["moment","Lion at the door","The lion bowing to a shopkeeper who feeds it lettuce or a red envelope.","zone"],["mood","After the confetti","Streets carpeted in red and gold paper once the crowd thins.","deep"]]},
{id:"stpat",city:"nyc",name:"St. Patrick's Day Parade",when:y=>{const d=eD(y,3,17);return [[d.getDay()===0?eD(y,3,16):d]];},time:"11 am to about 4:30 pm",where:"Fifth Av, 44 St to 79 St",
 why:"Pipe bands, uniforms and a sea of green. There are no floats, so it is all people.",
 spot:"The upper end in the 70s near the Met is thinner than Midtown.",
 ideas:[["place","Pipes past the cathedral","Bands passing St. Patrick's Cathedral at 50 St.","deep"],["moment","Tuning up","Bands waiting and warming up on the side streets in the 40s before they step off.","shallow"],["odd","Green on the subway","Kilts, sashes and green wigs on the platform on the way there.","interior"]]},
{id:"easter",city:"nyc",name:"Easter Parade and Bonnet Festival",when:y=>[[eEaster(y)]],time:"10 am to 4 pm",where:"Fifth Av, 49 St to 57 St",
 why:"It is a stroll, not a march: people in enormous handmade hats pose and expect to be photographed.",
 spot:"The steps of St. Patrick's Cathedral in the late morning.",
 ideas:[["odd","The hat","Fill the frame with one extraordinary bonnet and the face under it.","shallow"],["moment","Hat meets hat","Two bonnet-wearers admiring each other's work.","zone"],["place","Bonnets and the cathedral","A cluster of hats with the cathedral doors behind.","deep"]]},
{id:"dance",city:"nyc",name:"Dance Parade",approx:true,when:y=>[[eNth(y,5,6,3)]],time:"Midday to late afternoon",where:"Broadway and University Pl down to Tompkins Square Park",
 why:"Thousands of dancers in dozens of styles, moving the whole route.",
 spot:"The narrow stretch along St. Marks Pl, where dancers pass within arm's reach.",
 ideas:[["energy","Mid-leap","A dancer at the top of a jump with the troupe behind.","freeze"],["energy","Skirt blur","Folkloric skirts spinning, with one face kept sharp.","drag"],["moment","Catching breath","Dancers between songs: laughing, drinking water, fixing costumes.","shallow"]]},
{id:"henge",city:"nyc",name:"Manhattanhenge",approx:true,when:y=>[[eD(y,5,29),eD(y,5,30)],[eD(y,7,11),eD(y,7,12)]],time:"Sunset, about 8:15 pm. Arrive an hour early",where:"14, 23, 34, 42 or 57 St, facing west",
 why:"The setting sun lines up with the cross streets, and thousands of people stand in the road to see it.",
 spot:"The Tudor City overpass on 42 St fills by late afternoon. 34 St and 23 St are easier.",
 ideas:[["place","Sun in the canyon","The sun between the buildings with dark figures in the road.","silhouette"],["odd","The crowd in the crosswalk","Turn around: hundreds of raised phones, lit orange, with traffic stopped.","zone"],["mood","Last light on faces","Faces glowing in the low sun in the minute before it sets.","shallow"]]},
{id:"foliage",city:"nyc",name:"Fall colour at peak",approx:true,when:y=>[[eD(y,10,25),eD(y,11,15)]],time:"Best in the first two hours and the last two hours of daylight",where:"Central Park, Prospect Park, Fort Tryon Park, Riverside Drive and the tree-lined blocks of Harlem and Brooklyn",
 why:"For two or three weeks the city's trees turn yellow and orange, and every black coat and yellow cab reads against them.",
 spot:"The Mall in Central Park for the elms, Bow Bridge for the water, Prospect Park's Long Meadow for space, Fort Tryon for the view. Go on a weekday morning; weekends fill with people doing the same thing.",
 note:"Timing moves with the weather. The date here follows the I Love NY foliage report, updated weekly.",
 ideas:[["mood","Black coat, yellow canopy","One walker in dark clothes under the elms on the Mall, with the leaves closing over the path.","deep"],["energy","Leaves through the crosswalk","Wind blowing leaves across a busy crossing at Central Park West, with the walkers mid-stride.","freeze"],["odd","Everyone photographing the tree","The crowd around the most photographed tree, phones raised, with the tree itself cropped out.","zone"]]},
{id:"prday",city:"nyc",name:"National Puerto Rican Day Parade",when:y=>[[eNth(y,6,0,2)]],time:"11 am to about 5 pm",where:"Fifth Av, 44 St to 79 St",
 why:"Flags everywhere, music from every float and a crowd that dances as much as the marchers.",
 spot:"The 60s and 70s along Central Park have more room.",
 ideas:[["energy","Flags in motion","A flag at full stretch with a shouting face beneath it.","freeze"],["moment","Families on the kerb","Three generations in matching colours on folding chairs.","zone"],["place","Avenue of flags","Shoot down Fifth so the flags stack toward the horizon.","deep"]]},
{id:"mermaid",city:"nyc",name:"Coney Island Mermaid Parade",approx:true,when:y=>[[eNth(y,6,6,3)]],time:"1 pm",where:"Surf Av and the boardwalk, Coney Island",
 why:"Handmade sea-creature costumes, glitter and body paint, with the amusement park behind.",
 spot:"The staging area before the start is better than the route.",
 ideas:[["odd","Mermaid on the train","Full costume among ordinary riders on the way out to Stillwell Av.","interior"],["moment","Getting ready","Glitter being applied, tails being zipped.","shallow"],["place","Costumes and the Wonder Wheel","A marcher with the wheel or the Cyclone behind.","deep"]]},
{id:"pride",city:"nyc",name:"NYC Pride March",when:y=>[[eLast(y,6,0)]],time:"Noon into the evening",where:"Fifth Av from 25 St, then Christopher St and Seventh Av",
 why:"The biggest, loudest march of the year, and the West Village streets around it are as lively as the route.",
 spot:"Christopher St near the Stonewall Inn. Arrive before 11 am.",
 ideas:[["energy","Confetti and flags","A float passing with flags and confetti in the air.","freeze"],["moment","The embrace","People finding each other in the crowd.","zone"],["mood","After the march","West Village side streets at dusk: tired, glittered people on stoops.","night"]]},
{id:"july4",city:"nyc",name:"Fourth of July fireworks",when:y=>[[eD(y,7,4)]],time:"Fireworks at about 9:25 pm",where:"East River or Hudson waterfront. The location changes",
 why:"Crowds on piers, rooftops and closed highways all facing the same way.",
 spot:"Find out where this year's barges are, pick a waterfront park and arrive by 6 pm.",
 ideas:[["mood","Faces lit by fireworks","Turn away from the sky and photograph the watchers.","night"],["place","Burst over the skyline","Fireworks above the bridges, with the camera braced on a railing.","drag"],["moment","Children on shoulders","Small silhouettes raised above the crowd against the light.","silhouette"]]},
{id:"westindian",city:"nyc",name:"West Indian Day Parade",when:y=>[[eNth(y,9,1,1)]],time:"11 am to 6 pm",where:"Eastern Pkwy, Utica Av to Grand Army Plaza, Brooklyn",
 why:"Feathered carnival costumes several metres wide, steel bands and sound trucks.",
 spot:"Near the Brooklyn Museum toward the end, where masqueraders slow down and pose.",
 ideas:[["odd","Feathers fill the frame","One costume edge to edge, with the face at its centre.","shallow"],["energy","Behind the truck","Dancers following a sound truck, arms up.","freeze"],["moment","Costume repairs","Friends pinning and re-tying each other's pieces at the kerb.","zone"]]},
{id:"sangennaro",city:"nyc",name:"Feast of San Gennaro",when:y=>{const s=eNth(y,9,4,2);return [[s,ePlus(s,10)]];},time:"Eleven days. Evenings are best",where:"Mulberry St, Canal St to Houston St",
 why:"Food stalls, arches of lights and carnival games through Little Italy.",
 spot:"Weeknights are passable. Weekend nights are shoulder to shoulder.",
 ideas:[["mood","Under the light arches","The arches receding down Mulberry St with the crowd beneath.","night"],["moment","Sausage and peppers","Vendors working the grill in smoke and bare-bulb light.","zone"],["odd","Prize wall","Rows of stuffed toys and the person trying to win one.","detail"]]},
{id:"columbus",city:"nyc",name:"Columbus Day Parade",when:y=>[[eNth(y,10,1,2)]],time:"About 11:30 am to 3 pm",where:"Fifth Av, 44 St to 72 St",
 why:"Marching bands, Italian-American societies in sashes and vintage cars.",
 spot:"Above 60 St, along the park, the crowd is one row deep.",
 ideas:[["moment","Band at rest","Musicians waiting on a side street, instruments down.","shallow"],["energy","Brass section","Trumpets and trombones raised together.","freeze"],["place","Flags down Fifth","The avenue lined with flags, marchers small in the middle.","deep"]]},
{id:"dogparade",city:"nyc",name:"Tompkins Square Halloween Dog Parade",approx:true,when:eTable({2026:[10,17]},y=>eNth(y,10,6,3)),time:"Midday. Check the start time",where:"East Village, around Tompkins Square Park",
 why:"Hundreds of dogs in elaborate costumes, with owners dressed to match.",
 spot:"Get down to dog height near where the entrants line up.",
 ideas:[["odd","Dog and owner, same costume","Both in the frame at the same scale.","zone"],["moment","Unimpressed","The dog that has had enough of its outfit.","shallow"],["energy","Ring of phones","The circle of photographers around one small dog.","zone"]]},
{id:"halloween",city:"nyc",name:"Village Halloween Parade",when:y=>[[eD(y,10,31)]],time:"7 pm to about 11 pm",where:"Sixth Av, Canal St to 15 St",
 why:"Giant puppets, bands and thousands in costume. Anyone in costume can join and walk the route.",
 spot:"Join the line-up near Canal St in costume to shoot from inside, or stand north of 10 St where the crowd is thinner.",
 ideas:[["mood","Puppets against the night","Lit puppets above the crowd with dark buildings behind.","night"],["odd","Costumes on the platform","West 4 St and 14 St stations before and after the parade.","interior"],["energy","Inside the march","Walk with a band and shoot back at the dancers behind it.","night"]]},
{id:"marathon",city:"nyc",name:"New York City Marathon",when:y=>[[eNth(y,11,0,1)]],time:"Runners pass from about 8:30 am into the evening",where:"All five boroughs",
 why:"The emotion is in the faces on both sides of the barrier, not in the running.",
 spot:"Fourth Av in Brooklyn for easy access, First Av above 59 St for the noise, Central Park South for exhaustion.",
 ideas:[["moment","Spotting their runner","A spectator in the second they see the person they came for.","zone"],["energy","The pack","Runners streaming past one still spectator holding a sign.","drag"],["mood","Foil capes","Finishers wrapped in foil, walking slowly away from the park.","shallow"]]},
{id:"veterans",city:"nyc",name:"Veterans Day Parade",when:y=>[[eD(y,11,11)]],time:"About 12:30 pm to 3:30 pm",where:"Fifth Av, 26 St to 45 St",
 why:"Veterans of several generations, vintage vehicles and school bands.",
 spot:"Madison Square Park at the start, for the wreath-laying.",
 ideas:[["moment","The salute","A veteran saluting as a unit passes.","shallow"],["mood","Generations","An older veteran and a young cadet in the same frame.","zone"],["odd","Medals and hands","Close on a jacket of medals and the hands resting below it.","detail"]]},
{id:"balloons",city:"nyc",name:"Thanksgiving balloon inflation",when:y=>[[ePlus(eThanks(y),-1)]],time:"Afternoon to early evening",where:"Around the American Museum of Natural History, 77 St and 81 St",
 why:"Giant balloons being inflated under nets at street level, the day before the parade.",
 spot:"There is a marked one-way viewing path. Go early, before the queue builds.",
 ideas:[["odd","Giant under a net","A cartoon face pinned to the street by cargo nets, brownstones behind.","deep"],["mood","Balloons at dusk","Floodlit balloons after dark with handlers in silhouette.","night"],["moment","Looking up","Children seeing the scale of a balloon for the first time.","shallow"]]},
{id:"thanksgiving",city:"nyc",name:"Thanksgiving Day Parade",when:y=>[[eThanks(y)]],time:"8:30 am to noon",where:"Central Park West from 77 St, then Sixth Av to 34 St",
 why:"Balloons between the buildings and a crowd packed ten deep in the cold.",
 spot:"Central Park West by 6:30 am for a front-row place. Sixth Av fills later.",
 ideas:[["place","Balloon in the canyon","A balloon filling the gap between towers, handlers tiny beneath.","deep"],["moment","Faces looking up","A row of bundled-up spectators, all tilted the same way.","shallow"],["odd","Balloon in the glass","A balloon mirrored in office windows on Sixth Av.","deep"]]},
{id:"tree",city:"nyc",name:"Rockefeller Center tree lighting",when:y=>[[ePlus(eThanks(y),6)]],time:"Evening ceremony",where:"Rockefeller Plaza, 49 St to 50 St",
 why:"The lighting night is penned and packed. The evenings after give the same tree with room to work.",
 spot:"Come back any evening that week and approach through the Channel Gardens from Fifth Av.",
 ideas:[["place","Tree down the gardens","The tree framed by the angel figures along the Channel Gardens.","night"],["moment","The selfie","Couples and families lit by their own phone screens.","night"],["mood","Skaters under the tree","Blurred skaters on the rink with the tree sharp above.","drag"]]},
{id:"santacon",city:"nyc",name:"SantaCon",approx:true,when:y=>[[eNth(y,12,6,2)]],time:"From about 10 am",where:"Midtown and the East Village",
 why:"Thousands of Santas, elves and reindeer on ordinary streets and trains.",
 spot:"Go in the morning, before it gets rowdy: subway platforms and corners near the start.",
 ideas:[["odd","Santas on the subway","A car full of red suits and one commuter ignoring them.","interior"],["place","Sea of red","A block filled with red suits, shot from the top of a stoop.","deep"],["moment","Santa off duty","Beard pulled down, eating a slice or checking a phone.","zone"]]},
{id:"dyker",city:"nyc",name:"Dyker Heights Christmas lights",when:y=>[[eD(y,12,1),eD(y,12,31)]],time:"Dusk to about 9 pm, all month",where:"Dyker Heights, Brooklyn: 11 to 13 Av, 83 to 86 St",
 why:"Whole blocks of houses buried in lights and life-size figures.",
 spot:"Weeknights. 84 St between 11 Av and 12 Av has the biggest displays.",
 ideas:[["place","House of lights","One house square-on, with a passer-by for scale.","night"],["moment","Faces in the glow","Children lit by the displays, looking up.","night"],["odd","Giant toy soldiers","Life-size figures on a front lawn with the family car parked beside them.","night"]]},
{id:"nye",city:"nyc",name:"New Year's Eve in Times Square",when:y=>[[eD(y,12,31)]],time:"Pens fill from early afternoon. Ball drop at midnight",where:"Times Square",
 why:"A million people waiting for hours, then one minute of confetti.",
 spot:"Inside the pens you cannot leave or carry a bag. The streets feeding the pens show the same crowd with freedom to move.",
 ideas:[["mood","The wait","Faces in the pens at hour six: cold, bored, hopeful.","night"],["energy","Confetti at midnight","Confetti filling the air between the screens.","night"],["odd","The morning after","Drifts of confetti and sanitation crews at dawn on 1 January.","deep"]]},
{id:"aipad",city:"nyc",type:"photoshow",approx:true,name:"The Photography Show (AIPAD)",when:y=>{const a=eNth(y,4,3,4); return [[a,eD(y,4,a.getDate()+4)]];},time:"Daytime, ticketed",where:"Park Avenue Armory, Park Av at 67 St",
 why:"Dozens of photography dealers under one roof, with classic street photography prints you can study from a foot away.",
 spot:"Go on a weekday afternoon when the booths are quiet enough to stand in front of a print.",map:["Park Avenue Armory","Park Avenue Armory, 643 Park Ave, New York, NY"],ideas:[]},
{id:"bild",city:"nyc",type:"camera",name:"B&H Bild Expo",when:y=>y===2027?[[eD(2027,5,25),eD(2027,5,26)]]:[],time:"Two days. Free, registration opens in January 2027",where:"Javits Center, Eleventh Av at 35 St",
 why:"B&H's free photo show: more than 300 brands with cameras to handle, over 150 talks and portfolio reviews, and photo walks around Manhattan.",
 spot:"Register early and book the photo walks first, since they have limited places.",map:["Javits Center","Javits Center, 429 11th Ave, New York, NY"],ideas:[]},
{id:"photoville",city:"nyc",type:"photoshow",approx:true,name:"Photoville Festival",when:y=>{const a=eNth(y,6,6,1); return [[a,eD(y,6,a.getDate()+15)]];},time:"Outdoors, open all day. Free",where:"Brooklyn Bridge Park, DUMBO, with exhibitions in all five boroughs",
 why:"Free outdoor photography exhibitions under the Brooklyn Bridge, with artist talks and walks on the weekends.",
 spot:"Opening weekend has the most talks and the biggest crowd. The exhibitions put you a few steps from the DUMBO ideas in this app.",map:["Emily Warren Roebling Plaza","Emily Warren Roebling Plaza, Brooklyn Bridge Park, Brooklyn, NY"],
 ideas:[["moment","Reading the wall","One visitor stopped in front of a print, with the bridge filling the frame behind.","shallow"],["odd","Photo of a photo","A printed face on a banner next to a real passer-by in the same pose or colours.","zone"]]}
];
// Event types. Built-in events are typed here; events added by the weekly task carry a "type" field,
// and older ones without it are typed from their name.
const EVENT_TYPES = {parade:"Parade",festival:"Street festival",cultural:"Cultural celebration",holiday:"Holiday",sports:"Sport",game:"Game day",music:"Music",light:"Light",fireworks:"Fireworks",gathering:"Gathering",market:"Market",photowalk:"Photo walk or workshop",photoshow:"Photo festival or show",camera:"Camera event"};
/* For each event: which way to face at the viewing spot, the bearing of the street it runs along (for the sunny side), and how to
   arrive. face and street are compass bearings; the Manhattan grid runs 29° (avenues) and 119° (streets). Hand-written. */
const EVENT_VIEW = {
  threekings:{face:299,street:119,arrive:"Be at 106th Street and Park Avenue by 10:30 am, where groups and animals line up; the walk along 106th is short, so the lining-up is most of the picture. The 6 train to 103rd Street."},
  lunar:{face:20,street:20,arrive:"Come for the firecracker ceremony mid-morning, then follow a lion troupe rather than the parade line. Mott and Bayard fill by noon; Canal Street station on the N, Q, R, W, 6, J or Z."},
  stpat:{face:209,street:29,arrive:"The crowd is thickest from 44th to 59th; above 72nd there is room at the barriers. Arrive by 10:30 am for a front spot. Fifth Avenue is closed, so come by the 6 to 68th Street or the Q to 72nd."},
  easter:{face:209,street:29,arrive:"No barriers: the street itself is the parade, and the best hats gather outside St. Patrick's from about 11 am. Come by 10:30 am and work the steps and the crossing at 51st Street."},
  dance:{face:20,street:20,arrive:"The parade starts at 21st Street and Broadway around 1 pm and reaches St. Marks Place about an hour later; the DanceFest in Tompkins Square follows. Union Square station for the start."},
  henge:{face:299,street:119,arrive:"Stand in the crossing at Park Avenue on 34th or 42nd Street, step out only on the red light, and arrive an hour early: the photographers fill the crossings first. The 6 to 33rd Street."},
  foliage:{face:null,street:null,arrive:"The Mall, Bethesda Terrace and the Pond colour first; the Ramble a week later. Go on a weekday morning for empty paths; weekends after noon are crowded."},
  prday:{face:209,street:29,arrive:"Arrive by 10 am for a barrier spot in the 60s; the floats and flags are densest after 1 pm. Fifth Avenue and the side streets near it close; the 6 to 68th Street."},
  mermaid:{face:75,street:75,arrive:"Line-up is on West 21st Street from about 11 am and is better than the parade: no barriers and everyone posing. Surf Avenue is barricaded by 12:30. The D, F, N or Q to Stillwell Avenue."},
  pride:{face:110,street:120,arrive:"The march reaches Christopher Street mid-afternoon; the Stonewall block is barriered and packed by noon. Arrive before 11 am there, or shoot the start on Fifth Avenue at 25th Street around noon."},
  july4:{face:null,street:null,arrive:"The viewing zones open mid-afternoon and fill by 6 pm. Decide on the river in advance and get there before the entry points close; carry water."},
  westindian:{face:100,street:100,arrive:"The parade is huge and slow: stand anywhere along Eastern Parkway after noon and the bands keep coming. The 2 or 3 to Franklin Avenue or Eastern Parkway; expect closures on the Parkway all day."},
  sangennaro:{face:200,street:20,arrive:"Evenings from 7 pm are best, when the lights are on and the street is full. Mulberry Street is closed to cars for the festival; the 6 to Spring Street or Canal Street."},
  columbus:{face:209,street:29,arrive:"Arrive by 11 am for the 60s; the crowd is lighter than St. Patrick's and the floats are the subject. Fifth Avenue is closed from 44th to 72nd; the 6 to 68th Street."},
  dogparade:{face:29,street:null,arrive:"Entrants gather from about noon; the costumes are best before the judging, in the park and on Avenue B. The L to First Avenue."},
  halloween:{face:209,street:29,arrive:"Sixth Avenue below 14th is barriered and packed by 6 pm. For room, stand north of 14th Street where it ends, or shoot the line-up on Canal Street before 7 pm. The side streets are the way in; subways are crowded afterwards."},
  marathon:{face:205,street:25,arrive:"Fourth Avenue in Brooklyn from about 9:30 am has the mass of runners with room at the kerb; First Avenue in Manhattan after noon is louder and tighter. Cross the course only at marshalled points."},
  veterans:{face:209,street:29,arrive:"Smaller crowds than the other Fifth Avenue parades; arrive by noon anywhere from 26th to 45th Street. The ceremony at Madison Square Park is before the march."},
  balloons:{face:299,street:119,arrive:"The inflation viewing line forms on 72nd Street and Columbus Avenue from mid-afternoon and can take an hour; the balloons are at their best between 4 and 6 pm. The 1, B or C to 79th Street."},
  thanksgiving:{face:29,street:29,arrive:"Central Park West fills by 6:30 am; Sixth Avenue in the 40s by 7:30. The balloons come first and the light is low and from the side on Central Park West. Many stations near the route are exit-only."},
  tree:{face:299,street:119,arrive:"The lighting itself is ticketed and fenced; the week after, come before 8 am or after 10 pm for the tree without the crowd. Rockefeller Center on the B, D, F or M."},
  santacon:{face:null,street:null,arrive:"Starts around 10 am where it is announced that morning; by 1 pm Midtown bars have queues of Santas outside, which is the picture."},
  dyker:{face:20,street:null,arrive:"Dusk to about 9 pm; weeknights are far quieter than weekends. The D to 79th Street or the R to 86th Street, then a 15-minute walk; coaches clog 12th Avenue on weekends."},
  nye:{face:209,street:29,arrive:"The pens fill from early afternoon and you cannot leave and return. For pictures of the crowd rather than the ball, work the side streets and the edges of the closures from 5 pm, and leave before midnight."},
  aipad:{face:null,street:null,arrive:"Ticketed; weekday afternoons are quietest. The 6 to 68th Street."},
  bild:{face:null,street:null,arrive:"Register in advance; the keynote mornings are busiest. The 7 to 34th Street–Hudson Yards."},
  photoville:{face:null,street:null,arrive:"Free and outdoors; the containers are on Emily Warren Roebling Plaza under the Brooklyn Bridge. Go on a weekday afternoon, and stay for blue hour on the waterfront."}
};
const compass8 = b => ["north","north-east","east","south-east","south","south-west","west","north-west"][Math.round((((b%360)+360)%360)/45)%8];
const compass4 = b => ["north","east","south","west"][Math.round((((b%360)+360)%360)/90)%4];
const stopName = s => s.ev ? (EVENTS.find(x=>x.id===s.ev)||{name:s.ev}).name : PLACES[s.place].name;
/* The light during an event: the sun through its window, sunset, and for a parade which side of the street is lit. */
function eventLight(e,day){ const c=CITIES[state.city], w=evWindow(e,day)||[13*60,16*60], at=m=>new Date(day.getFullYear(),day.getMonth(),day.getDate(),0,m), V=EVENT_VIEW[e.id]||{};
  const t0=at(w[0]), t1=at(Math.min(w[1],1439)), mid=at(Math.round((w[0]+Math.min(w[1],1439))/2)), set=sunTimes(day,c.lat,c.lon)[1], setM=set.getHours()*60+set.getMinutes();
  const ph=t=>sunPhase(sunPos(t,c.lat,c.lon).alt), p0=ph(t0), p1=ph(t1), pm=ph(mid), spm=sunPos(mid,c.lat,c.lon), spm0=sunPos(t0,c.lat,c.lon);
  const name={day:"daylight",gold:"golden hour",blue:"blue hour",night:"dark"};
  let line=hmText(w[0])+' to '+hmText(Math.min(w[1],1439))+': ';
  if(p0==="night"&&p1==="night") line+='after dark the whole time. Street lights, signs and the event\'s own lighting.';
  else if(p0===p1) line+=name[p0]+(p0==="day"?(spm.alt>50?', with the sun high and shadows short.':spm.alt>25?', with the sun fairly high.':', with a low sun and long shadows.'):'.');
  else line+=name[p0]+' at the start, '+name[p1]+' by the end.';
  if(spm.alt>0) line+=' Sun to the '+compass8(spm.az)+', '+Math.round(spm.alt)+'° up at '+hmText(Math.round((w[0]+Math.min(w[1],1439))/2))+'.';
  if(w[0]<setM&&w[1]>setM) line+=' Sunset is at '+hmText(setM)+', during the event.'; else if(w[1]<=setM) line+=' Sunset '+hmText(setM)+'.';
  const parts=[line];
  if(V.street!==null&&V.street!==undefined&&spm.alt>0){ const r=Math.PI/180, S=[Math.sin(spm.az*r),Math.cos(spm.az*r)], n1=V.street+90, n2=V.street-90, dot=b=>Math.sin(b*r)*S[0]+Math.cos(b*r)*S[1];
    const along=Math.abs(Math.sin((spm.az-V.street)*r));   // 1 when the sun is square to the street, 0 when it runs along it
    if(spm.alt>58) parts.push('The sun is almost overhead, so both sides of the street are lit and faces are in shadow under hats.');
    else if(along<0.3) parts.push('The sun runs almost along the street, so both sides are lit and shadows stretch along it. Shoot into the light from the shaded side for rim-lit figures.');
    else { const lit=dot(n1)<0?n1:n2, shade=lit===n1?n2:n1, lf=lightFacing(V.face||0,mid);
      parts.push('Stand on the '+compass4(lit)+' side of the street: the sun reaches that pavement and the faces coming toward you. The '+compass4(shade)+' side is in shade'+(spm.alt<25?', and the low sun will be in your eyes from there':'')+'.'); } }
  if(V.face!==null&&V.face!==undefined){ const lf=lightFacing(V.face,mid); parts.push('Facing '+compass(V.face)+' at the viewing spot: '+lf.txt.toLowerCase()+' in the middle of the event.'); }
  const fc=hourlyAt(mid); if(fc){ const sky=skyAt(mid)||(fc.cc>=50?"partly":"sun"); parts.push('Forecast: '+(WX_WORD[sky]||(sky==="partly"?"Sun and cloud":"Clear"))+(fc.pop!=null?', '+fc.pop+'% chance of rain':'')+'.'); }
  return parts; }
const PHOTO_TYPES = new Set(["photowalk","photoshow","camera"]);
const EVENT_TYPE_OF = {foliage:"light",threekings:"parade",lunar:"cultural",stpat:"parade",easter:"parade",dance:"parade",henge:"light",prday:"parade",mermaid:"parade",pride:"parade",july4:"fireworks",westindian:"parade",sangennaro:"festival",columbus:"parade",dogparade:"parade",halloween:"parade",marathon:"sports",veterans:"parade",balloons:"holiday",thanksgiving:"parade",tree:"holiday",santacon:"gathering",dyker:"holiday",nye:"holiday"};
EVENTS.forEach(e=>{ e.type=e.type||EVENT_TYPE_OF[e.id]; });
// Suggested viewing spot per event: [label, Google Maps search text]. Events whose location changes each year have none.
const EVENT_MAP = {"foliage": ["The Mall, Central Park", "The Mall, Central Park, New York, NY"], "threekings": ["106 St at Lexington Av", "E 106th St & Lexington Ave, New York, NY"], "lunar": ["Mott St at Bayard St", "Mott St & Bayard St, New York, NY"], "stpat": ["Fifth Av at 72 St", "5th Ave & E 72nd St, New York, NY"], "easter": ["The steps of St. Patrick's Cathedral", "St. Patrick's Cathedral, 5th Ave, New York, NY"], "dance": ["St. Marks Pl at Second Av", "St Marks Pl & 2nd Ave, New York, NY"], "henge": ["34 St at Park Av, facing west", "E 34th St & Park Ave, New York, NY"], "prday": ["Fifth Av at 68 St", "5th Ave & E 68th St, New York, NY"], "mermaid": ["Surf Av at West 21 St", "Surf Ave & W 21st St, Brooklyn, NY"], "pride": ["Christopher St by the Stonewall Inn", "The Stonewall Inn, 53 Christopher St, New York, NY"], "westindian": ["Eastern Pkwy at the Brooklyn Museum", "Brooklyn Museum, 200 Eastern Pkwy, Brooklyn, NY"], "sangennaro": ["Mulberry St at Grand St", "Mulberry St & Grand St, New York, NY"], "columbus": ["Fifth Av at 65 St", "5th Ave & E 65th St, New York, NY"], "dogparade": ["Avenue B at 9 St", "Avenue B & E 9th St, New York, NY"], "halloween": ["Sixth Av at 12 St", "6th Ave & W 12th St, New York, NY"], "marathon": ["Fourth Av at 9 St, Brooklyn", "4th Ave & 9th St, Brooklyn, NY"], "veterans": ["Madison Square Park", "Madison Square Park, New York, NY"], "balloons": ["American Museum of Natural History", "American Museum of Natural History, New York, NY"], "thanksgiving": ["Central Park West at 72 St", "Central Park West & W 72nd St, New York, NY"], "tree": ["Channel Gardens, Rockefeller Center", "Channel Gardens, Rockefeller Center, New York, NY"], "dyker": ["84 St at 12 Av, Dyker Heights", "84th St & 12th Ave, Brooklyn, NY"], "nye": ["Times Square", "Times Square, New York, NY"]};
EVENTS.forEach(e=>{ e.map=EVENT_MAP[e.id]||e.map||null; });
const docMap = (d,fallback) => (d && typeof d.map==="string" && d.map.trim()) ? ["",d.map.trim().slice(0,200)] : fallback;
function eventTypeFor(d){ if(d && EVENT_TYPES[d.type]) return d.type; const n=String((d&&d.name)||"").toLowerCase();
  return /parade|march\b/.test(n)?"parade":/market|village|bazaar/.test(n)?"market":/firework/.test(n)?"fireworks":/marathon|race|run\b/.test(n)?"sports":
    /diwali|day of the dead|lunar|eid|holi\b|festival of lights|d[ií]a de/.test(n)?"cultural":/festival|fair|feast|block party/.test(n)?"festival":/christmas|holiday|tree|new year/.test(n)?"holiday":"gathering"; }
function eventNext(ev, today){
  for(const y of [today.getFullYear(), today.getFullYear()+1]){
    const occ=(ev.when(y)||[]).filter(o=>(o[1]||o[0])>=today).sort((a,b)=>a[0]-b[0]);
    if(occ.length) return occ[0];
  }
  return null;
}
function eventSoon(o, today){
  if(o[0]<=today) return "On now";
  const n=Math.round((o[0]-today)/864e5);
  if(n===0) return "Today"; if(n===1) return "Tomorrow"; if(n<14) return "In "+n+" days"; if(n<70) return "In "+Math.round(n/7)+" weeks"; return "In "+Math.round(n/30.4)+" months";
}

/* Conditions now. Time of day is worked out on the device from sunrise and sunset for the city.
   The weather reading comes from the artifact database (collection "weather", doc id = city id),
   refreshed by a scheduled task. The user can override it by hand. */
let WEATHER = {};
function sunTimes(date,lat,lon){
  const rad=Math.PI/180, dayMs=864e5, J1970=2440588, J2000=2451545;
  const lw=-lon*rad, phi=lat*rad, d=date/dayMs-0.5+J1970-J2000;
  const n=Math.round(d-0.0009-lw/(2*Math.PI)), ds=0.0009+lw/(2*Math.PI)+n;
  const M=rad*(357.5291+0.98560028*ds), C=rad*(1.9148*Math.sin(M)+0.02*Math.sin(2*M)+0.0003*Math.sin(3*M));
  const L=M+C+rad*102.9372+Math.PI, dec=Math.asin(Math.sin(L)*Math.sin(rad*23.4397));
  const Jnoon=J2000+ds+0.0053*Math.sin(M)-0.0069*Math.sin(2*L);
  const w=Math.acos((Math.sin(-0.833*rad)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec)));
  const Jset=J2000+0.0009+(w+lw)/(2*Math.PI)+n+0.0053*Math.sin(M)-0.0069*Math.sin(2*L), Jrise=Jnoon-(Jset-Jnoon);
  const fromJ=j=>new Date((j+0.5-J1970)*dayMs);
  return [fromJ(Jrise),fromJ(Jset)];
}
// Times when the sun crosses a given altitude (degrees) on the day around `date`: [morning, evening].
function sunAlt(date,lat,lon,alt){
  const rad=Math.PI/180, dayMs=864e5, J1970=2440588, J2000=2451545;
  const lw=-lon*rad, phi=lat*rad, d=date/dayMs-0.5+J1970-J2000;
  const n=Math.round(d-0.0009-lw/(2*Math.PI)), ds=0.0009+lw/(2*Math.PI)+n;
  const M=rad*(357.5291+0.98560028*ds), C=rad*(1.9148*Math.sin(M)+0.02*Math.sin(2*M)+0.0003*Math.sin(3*M));
  const L=M+C+rad*102.9372+Math.PI, dec=Math.asin(Math.sin(L)*Math.sin(rad*23.4397));
  const Jnoon=J2000+ds+0.0053*Math.sin(M)-0.0069*Math.sin(2*L);
  const x=(Math.sin(alt*rad)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec)); if(x<-1||x>1) return null;
  const w=Math.acos(x), Jset=J2000+0.0009+(w+lw)/(2*Math.PI)+n+0.0053*Math.sin(M)-0.0069*Math.sin(2*L), Jrise=Jnoon-(Jset-Jnoon);
  const fromJ=j=>new Date((j+0.5-J1970)*dayMs);
  return [fromJ(Jrise),fromJ(Jset)];
}
// Good-light windows: golden hour is the sun between 6° above and 4° below the horizon, blue hour between 4° and 6° below.
function lightWindows(t){
  const c=CITIES[state.city]; if(typeof c.lat!=="number") return [];
  const out=[]; for(const day of [t, new Date(+t+864e5)]){
    const hi=sunAlt(day,c.lat,c.lon,6), lo=sunAlt(day,c.lat,c.lon,-4), bl=sunAlt(day,c.lat,c.lon,-6); if(!hi||!lo||!bl) continue;
    out.push({k:"blue",name:"Blue hour",s:bl[0],e:lo[0]},{k:"gold",name:"Golden hour",s:lo[0],e:hi[0]},{k:"gold",name:"Golden hour",s:hi[1],e:lo[1]},{k:"blue",name:"Blue hour",s:lo[1],e:bl[1]});
  }
  return out.sort((a,b)=>a.s-b.s);
}
function lightLine(i){
  const t=i.t, ws=lightWindows(t), tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  const cur=ws.find(w=>w.s<=t&&t<w.e), next=ws.find(w=>w.k==="gold"&&w.s>t); if(!cur&&!next) return {text:"",on:false};
  const dull=/rain|cloud|fog|snow|storm/.test(i.sky||""), clear=/sun|partly/.test(i.sky||"");
  // In rain or under cloud there is no golden light; the evening window that matters is dusk, when lights reflect.
  const wet=/rain|storm|snow/.test(i.sky||""), eve=w=>!!w&&w.s.getHours()>=12, c0=CITIES[state.city];
  if(dull && (cur ? eve(cur) : (eve(next) && next.s-t<6*36e5))){
    const g=(cur&&cur.k==="gold")?cur:next, st=sunAlt(g?g.s:t,c0.lat,c0.lon,-0.833), dusk=st?st[1]:null, blueW=ws.find(w=>w.k==="blue"&&eve(w)&&w.e>t);
    if(cur&&cur.k==="blue") return {on:wet,text:wet?"Dusk in the rain now, until "+tf(cur.e)+". This is the best time for reflections on wet streets.":"Blue hour now, until "+tf(cur.e)+"."};
    if(dusk&&blueW&&wet) return {on:false,text:"No golden light in the rain. The window that matters today is dusk, "+tf(dusk)+" to "+tf(blueW.e)+", when signs and headlights reflect on wet streets."};
    if(dusk&&g) return {on:false,text:"Overcast, so golden hour ("+tf(g.s)+" to "+tf(g.e)+") will be muted. Dusk from "+tf(dusk)+" still works for lit windows and signs."};
  }
  if(cur){ const after=cur.k==="gold" ? ws.find(w=>w.k==="blue"&&w.s>=cur.e&&w.s-cur.e<6e5) : null;
    return {on:true,text:cur.name+" now, until "+tf(cur.e)+"."+(after?" Blue hour follows until "+tf(after.e)+".":"")+(dull&&cur.k==="gold"?" Cloud is flattening it, so use the overcast ideas.":"")}; }
  const mins=Math.round((next.s-t)/6e4), sameDay=next.s.toDateString()===t.toDateString();
  const when = mins<60 ? "starts in "+mins+" min" : mins<360 ? "starts in "+Math.floor(mins/60)+" h "+(mins%60?(mins%60)+" min":"") : "";
  return {on:false,text:"Golden hour "+(sameDay?"today ":"tomorrow ")+tf(next.s)+" to "+tf(next.e)+(when?", "+when.trim():"")+"."+
    (mins<180 ? (dull?" Cloud is likely to flatten it.":clear?" The sky looks clear enough to be worth it.":"") : "")}; }
function skyOf(w){
  const s=(String(w.condition||"")+" "+String(w.condition_text||"")).toLowerCase();
  if(/thunder|storm/.test(s)) return "storm";
  if(/snow|sleet|ice|flurr|hail/.test(s)) return "snow";
  if(/rain|drizzle|shower/.test(s)) return "rain";
  if(/fog|mist|haze/.test(s)) return "fog";
  if(/partly|mostly sunny|mostly clear|few clouds/.test(s)) return "partly";
  if(/overcast|cloud/.test(s)) return "cloud";
  if(/clear|sun|fair/.test(s)) return "sun";
  return null;
}
const SKY_NAME={sun:"Bright sun",partly:"Sun and cloud",cloud:"Overcast",rain:"Rain",fog:"Fog",snow:"Snow",storm:"Thunderstorm"};
const PHASE_NAME={am:"Morning light",mid:"Midday light",gold:"Late afternoon light",dusk:"Dusk",night:"After dark"};
function nowInfo(){
  const c=CITIES[state.city], t=new Date(), m=6e4;
  let phase="mid", rise=null, set=null;
  if(typeof c.lat==="number"){ [rise,set]=sunTimes(t,c.lat,c.lon);
    phase = (t<rise-30*m||t>+set+30*m) ? "night" : t>set-30*m ? "dusk" : t>set-120*m ? "gold" : t<+rise+180*m ? "am" : "mid"; }
  const w=WEATHER[state.city]; let sky=null, age=null;
  if(w && w.updated){ const u=new Date(w.updated); if(!isNaN(u)){ age=(t-u)/36e5; if(age<12 && age>-1) sky=skyOf(w); } }
  const manual=state.cond!=="auto";
  if(manual){ if(state.cond==="dusk"||state.cond==="night"){ phase=state.cond; sky=null; } else { sky=state.cond; if(phase==="night"||phase==="dusk") phase="mid"; } }
  return {phase,sky,w:(sky&&!manual)?w:null,age,rise,set,manual,t};
}
const lightKey = i => i.phase==="night" ? "night" : /rain|cloud|fog|snow|storm/.test(i.sky||"") ? "rain" : i.phase==="dusk" ? "gold" : i.phase;
function nowLabel(i){ return (i.sky?SKY_NAME[i.sky]:"")+(i.sky&&(i.phase==="dusk"||i.phase==="night")?", ":"")+((i.phase==="dusk"||i.phase==="night"||!i.sky)?PHASE_NAME[i.phase].toLowerCase():""); }
// Setting changes for the current conditions, by recipe.
const INDOOR = new Set(["gct-energy","subway-energy","ferry-energy","fidi-energy","chelsea-energy"]);   // drag ideas shot indoors, where the weather does not change the light
function adjustFor(recipe,i,leica,id){
  const out=[], low=recipe==="night"||recipe==="interior", wet=i.sky==="rain"||i.sky==="storm";
  if(INDOOR.has(id)){ out.push("Indoors, the weather and time of day barely change the light. At 1/15 s in S mode the camera opens the aperture and Auto ISO covers the rest; check the first frame for blur."); return out; }
  if(low){
    if(wet && recipe==="night") out.push("Wet ground doubles every light. Get low and include the reflections.");
    if(recipe==="night" && i.phase!=="night" && i.phase!=="dusk") out.push("These settings are for after dark. In daylight they come out too bright even at the lowest ISO: use f/8 at 1/500 s instead.");
    return out;
  }
  if(i.phase==="night"){
    out.push(recipe==="drag" ? "It is dark, so long exposures are easy: try 1/8 s at f/4 and ISO 400." : "It is dark and this shot assumes daylight. Use the widest aperture, 1/125 s and Auto ISO up to 6400, or save it for tomorrow.");
    if(wet) out.push("Wet ground doubles every light. Get low and include the reflections.");
    return out;
  }
  if(i.phase==="dusk"){ if(recipe==="drag") out.push("Dusk is the easiest time for this: 1/15 s lands around f/8 with Auto ISO near its floor, and the lights coming on add streaks."); else { out.push("The light is fading fast. Open up two stops (f/8 becomes f/4) and let Auto ISO climb to 3200."); out.push("Keep the shutter at 1/250 s or faster for people."); } }
  if(i.sky==="sun"){
    if(recipe==="silhouette") out.push("Hard sun is ideal for this shot. Keep the exposure compensation as shown.");
    else if(recipe==="zone"||recipe==="freeze") out.push("Hard light: in M, Auto ISO is already at its floor of 100, so minus compensation does nothing. Protect highlights with one click faster on the shutter, and use the shadows as shapes.");
    else out.push("Hard light: set −0.3 EV to protect highlights, and use the shadows as shapes.");
    if(recipe==="freeze") out.push("f/4 at 1/1000 s is a stop too bright in full sun at ISO 100: use f/5.6, or 1/2000 s.");
    if(recipe==="shallow") out.push("Wide open in sun needs speeds past 1/2000 s. Keep the shutter type on Hybrid.");
    if(recipe==="drag") out.push("Full sun: 1/15 s is out of reach. Even f/16 gives only about 1/125 s at ISO 100, a little blur on fast walkers. For real streaks wait for shade or use a 3-stop ND filter.");
  }
  if(i.sky==="partly") out.push("The light will swing by about two stops as clouds pass. Auto ISO covers it; recheck exposure compensation when the sun comes out.");
  if(/cloud|rain|storm/.test(i.sky||"")){
    if(recipe==="silhouette") out.push("There is no hard light now, so silhouettes will be weak. Shoot against a bright doorway, window or screen instead.");
    else if(recipe==="drag") out.push("Cloud helps here: f/16 at 1/15 s and ISO 100 is about right under heavy cloud. Under lighter cloud set ISO 50 by hand.");
    else out.push("Cloud costs about two to three stops. Open up one stop (f/8 becomes f/5.6) and expect ISO 400 to 1600.");
    out.push("The light is flat: set +0.3 EV and white balance to Cloudy for warmer skin.");
  }
  if(wet){
    out.push("To show rain as streaks, use 1/60 to 1/125 s against a dark background. At 1/500 s the drops freeze into dots.");
    out.push(leica ? "Keep the hood on and a cloth in your pocket. The Q3 is sealed against light rain, not a downpour." : "Keep the hood on and a cloth in your pocket.");
  }
  if(i.sky==="storm") out.push("With lightning nearby, shoot from under cover.");
  if(i.sky==="fog"){ out.push("Fog makes the meter underexpose: set +0.7 EV."); out.push("Autofocus can hunt in fog. Put the Field box on a hard edge, or focus manually."); }
  if(i.sky==="snow"){ out.push("Snow comes out grey unless you add about +1 EV."); out.push("Cloud and snow together are bright: stay at base ISO and keep the shutter fast."); }
  if(i.w && typeof i.w.temp_c==="number" && i.w.temp_c<=0) out.push("It is below freezing. Batteries drain quickly, so keep a spare in an inside pocket.");
  return out;
}
const WX_ICON = {
  sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/>',
  partly:'<circle cx="8" cy="8" r="3"/><path d="M8 2.2v1.6M2.2 8h1.6M3.9 3.9L5 5M12.1 3.9L11 5"/><path d="M8.5 19.5h9a3.6 3.6 0 0 0 .4-7.2 5.3 5.3 0 0 0-10 1.3 3 3 0 0 0 .6 5.9z"/>',
  cloud:'<path d="M7 18.5h10a4.2 4.2 0 0 0 .5-8.4 6.2 6.2 0 0 0-11.7 1.6A3.5 3.5 0 0 0 7 18.5z"/>',
  rain:'<path d="M7 15h10a4.2 4.2 0 0 0 .5-8.4A6.2 6.2 0 0 0 5.8 8.2 3.5 3.5 0 0 0 7 15z"/><path d="M8.5 17.5l-1 3M12.5 17.5l-1 3M16.5 17.5l-1 3"/>',
  storm:'<path d="M7 14.5h10a4.2 4.2 0 0 0 .5-8.4A6.2 6.2 0 0 0 5.8 7.7 3.5 3.5 0 0 0 7 14.5z"/><path d="M12.5 13l-2.5 4h3l-2 4.5"/>',
  snow:'<path d="M7 14.5h10a4.2 4.2 0 0 0 .5-8.4A6.2 6.2 0 0 0 5.8 7.7 3.5 3.5 0 0 0 7 14.5z"/><path d="M8 18h.01M12 18h.01M16 18h.01M10 21h.01M14 21h.01" stroke-width="2.4"/>',
  fog:'<path d="M4 8h16M3 12h13M6 16h15M4 20h11"/>',
  dusk:'<path d="M3 17h18M6.5 21h11"/><path d="M7.5 17a4.5 4.5 0 0 1 9 0"/><path d="M12 6.5v2.6M5 10l1.8 1.8M19 10l-1.8 1.8"/>',
  night:'<path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z"/>'
};
// In-app alert for rainy evenings: shown from three hours before sunset until the end of blue hour while it is wet.
function rainAlert(i){
  const box=$("rainAlert"), c=CITIES[state.city], t=i.t, today=t.toDateString();
  const hide=()=>{ box.hidden=true; box.innerHTML=""; };
  if(state.view==="events"||state.view==="plan"||typeof c.lat!=="number") return hide();
  if(store.get("rainAlertOff","")===today) return hide();
  const wetNow=/rain|storm/.test(i.sky||""), likely=i.w && typeof i.w.precip_chance_today==="number" && i.w.precip_chance_today>=70 && /cloud|fog/.test(i.sky||"");
  const st=sunAlt(t,c.lat,c.lon,-0.833), bl=sunAlt(t,c.lat,c.lon,-6); if(!st||!bl||!(wetNow||likely)) return hide();
  const dusk=st[1], end=bl[1]; if(t<dusk-3*36e5 || t>end) return hide();
  const tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase(), on=t>=dusk;
  const order=placeOrder(), refl=x=>(COMPOSE[x.id]&&COMPOSE[x.id][0]==="reflect")?0:1, picks=cityIdeas().filter(x=>x.w.includes("rain")&&x.w.includes("night")&&x.w.length<=3).sort((a,b)=>refl(a)-refl(b)||order.indexOf(a.p)-order.indexOf(b.p)).slice(0,3);
  box.innerHTML='<div class="alert-head"><span class="now-ico"><svg viewBox="0 0 24 24">'+WX_ICON.rain+'</svg></span>'+
    '<div class="alert-text"><b>'+(on?"Rain at dusk now":wetNow?"Rain at dusk tonight":"Rain likely at dusk tonight")+'</b><span>'+(on?"Until "+tf(end)+".":tf(dusk)+" to "+tf(end)+".")+' Wet streets mirror signs and headlights, so this is the time for reflections.</span></div>'+
    '<button type="button" class="alert-x" aria-label="Hide this alert for today">×</button></div>'+
    (picks.length?'<div class="alert-ideas">'+picks.map(x=>'<button type="button" class="arow" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span><span class="t"><b>'+esc(x.t)+'</b><span>'+esc(PLACES[x.p].name)+(milesTo(PLACES[x.p])!==null?' · '+milesText(milesTo(PLACES[x.p])):'')+'</span></span><span class="go" aria-hidden="true">›</span></button>').join("")+'</div>':'')+
    '<button type="button" class="alert-all" id="rainIdeas">Show all rain ideas</button>';
  box.hidden=false;
}
function renderNow(){
  const i=nowInfo(), tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  let head, sub=[];
  if(i.manual) head="Set by you: "+(SKY_NAME[state.cond]||PHASE_NAME[state.cond]);
  else if(i.w) head=(i.w.condition_text?String(i.w.condition_text):SKY_NAME[i.sky])+(typeof i.w.temp_c==="number"?", "+Math.round(i.w.temp_c*9/5+32)+"°F":"");
  else head=PHASE_NAME[i.phase];
  if(i.w||i.manual) sub.push(PHASE_NAME[i.phase]);
  if(i.rise) sub.push(i.t<i.rise ? "sunrise "+tf(i.rise) : i.t<i.set ? "sunset "+tf(i.set) : "sun set at "+tf(i.set));
  if(i.w && typeof i.w.precip_chance_today==="number") sub.push("rain chance today "+Math.round(i.w.precip_chance_today)+"%");
  if(!i.manual){ if(i.w) sub.push("reading from "+(i.age<1?Math.max(1,Math.round(i.age*60))+" min":Math.round(i.age)+" h")+" ago"); else sub.push(i.age!==null?"weather reading is out of date":"weather not loaded"); }
  $("nowHead").textContent=head; $("nowSub").textContent=sub.join(" · ");
  const k=lightKey(i); $("useLight").dataset.k=k;
  $("useLight").textContent = state.when===k ? "Showing ideas for "+WHEN[k].toLowerCase()+" ✓ Tap to show all" : "Show ideas for "+WHEN[k].toLowerCase();
  rainAlert(i);
  const ll=lightLine(i); if(!$("rainAlert").hidden){ ll.text=""; ll.on=false; }   // the alert already says it $("lightLine").textContent=ll.text; $("lightLine").hidden=!ll.text; $("now").classList.toggle("glow",ll.on);
  const ik = i.phase==="night" ? "night" : (i.sky || (i.phase==="dusk"||i.phase==="gold" ? "dusk" : "sun"));
  $("nowIco").innerHTML='<svg viewBox="0 0 24 24">'+(WX_ICON[ik]||WX_ICON.sun)+'</svg>';
  $("useLight").setAttribute("aria-pressed", state.when===k);
}
const store = {
  get(k,d){ try{ const v=localStorage.getItem("shotlist."+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem("shotlist."+k,JSON.stringify(v)); }catch(e){} }
};
const state = {
  city: store.get("city","nyc"), intent: store.get("intent","all"), place: store.get("place","all"), when: store.get("when","all"),
  camera: store.get("camera","q343"), view:"today", tab:"idea", cond:"auto", camCmp:store.get("camCmp",["q343","x100vi","griv"]), evNear:!!store.get("evNear",false), evRadius:store.get("evRadius",1)===2?2:1, lfF:43, lfN:8, lfS:3, drills:new Set(store.get("drills",[])), evType:"all", mapZoom:store.get("mapZoom","city"), ideasMode:store.get("ideasMode","card")==="list"?"list":"card", listView:"browse", home:(h=>h&&typeof h.lat==="number"&&typeof h.lon==="number"?h:null)(store.get("home",null)), homeEdit:false, weekSel:null, mapSel:null, mapEv:null, mapT:null, mapD:0, mapHead:false, heading:null, mapIntent:"all", mapShowEv:store.get("mapShowEv",true)!==false, mapShowLm:store.get("mapShowLm",true)!==false, mapShowSub:store.get("mapShowSub",true)!==false, mapShowStn:store.get("mapShowStn",true)!==false, mapShowSunny:store.get("mapShowSunny",true)!==false, mapShowSpots:store.get("mapShowSpots",true)!==false, mapShowNames:store.get("mapShowNames",true)!==false, mapShowHenge:store.get("mapShowHenge",true)!==false, mapShowFerry:store.get("mapShowFerry",true)!==false, mapRun:null, mapFerry:null, sheet:"peek", mapLm:null, mapSpot:null, notes: store.get("notes",{}) || {}, pos:null, plan:null,
  saved: new Set(store.get("saved",[])), done: new Set(store.get("done",[])), current:null, history:[],
  log: (o=>o&&typeof o==="object"&&!Array.isArray(o)?o:{})(store.get("log",{})), justShot:null, street:false, stayPrev:null
};
if(!CAMERAS[state.camera]) state.camera="q343";
if(!CITIES[state.city]) state.city=Object.keys(CITIES)[0];
if(state.place!=="all" && (!PLACES[state.place] || PLACES[state.place].city!==state.city)) state.place="all";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const inSeason = x => !x.m || x.m.includes(new Date().getMonth()+1);
const seasonText = x => x.m ? "In season "+x.m.map(n=>["January","February","March","April","May","June","July","August","September","October","November","December"][n-1]).join(" and ") : "";
const cityIdeas = () => IDEAS.filter(x=>PLACES[x.p].city===state.city && inSeason(x));
/* When an idea is actually on: days of the week (0 Sunday to 6 Saturday), hours (start inclusive, end exclusive; past midnight when
   start > end), extra months, and the weather it needs. sun: needs direct sun. rain: needs rain or wet ground. dull: best in bad weather.
   Ideas not listed are open whenever their light is right. The plan and Today keep to these; the card shows them under Best light. */
const AVAIL = {
  "gct-energy":{d:[1,2,3,4,5],h:[[17,18]]},"gct-mood":{wx:"sun"},"tsq-mood":{wx:"rain"},
  "coney-moment":{m:[4,5,6,7,8,9,10]},"coney-energy":{m:[4,5,6,7,8,9,10]},"coney-mood":{d:[1,2,3,4,5],h:[[6,12]],m:[10,11,12,1,2,3,4],wx:"dull"},
  "soho-moment":{h:[[11,20]]},"soho-mood":{wx:"sun"},"soho-energy":{h:[[11,19]]},
  "jh-moment":{h:[[17,23]]},"jh-mood":{h:[[10,15]],wx:"sun"},
  "subway-mood":{h:[[22,4]]},"subway-odd":{h:[[8,22]]},
  "harlem-moment":{d:[0],h:[[10,14]]},
  "les-moment":{h:[[8,20]]},"les-energy":{d:[1,2,3,4,5],h:[[7,9],[16,19]]},
  "flushing-moment":{h:[[10,21]]},"flushing-energy":{d:[1,2,3,4,5],h:[[17,19]]},"flushing-mood":{h:[[18,23]]},"flushing-odd":{h:[[8,20]]},
  "wburg-moment":{h:[[10,19]],m:[4,5,6,7,8,9,10]},"wburg-mood":{wx:"sun"},
  "midtown-place":{h:[[11,15]]},"midtown-moment":{d:[1,2,3,4,5],h:[[11,15]]},"midtown-energy":{d:[1,2,3,4,5],h:[[11,15]]},"midtown-mood":{h:[[10,15]],wx:"sun"},"midtown-odd":{d:[1,2,3,4,5],h:[[11,15]]},
  "cpark-energy":{h:[[6,9],[17,19]]},"cpark-mood":{wx:"dull"},
  "rockaway-mood":{d:[1,2,3,4,5],h:[[6,12]],m:[11,12,1,2,3],wx:"dull"},"rockaway-odd":{h:[[7,11]],m:[5,6,7,8,9,10]},
  "arthur-moment":{d:[1,2,3,4,5,6],h:[[8,18]]},"arthur-odd":{d:[1,2,3,4,5,6],h:[[9,17]]},"arthur-energy":{d:[6],h:[[10,16]]},
  "union-place":{d:[1,3,5,6],h:[[8,18]]},"union-odd-s":{d:[1,3,5,6],h:[[8,18]]},"union-energy":{d:[1,2,3,4,5],h:[[16,19]]},
  "fidi-place":{d:[1,2,3,4,5],h:[[8,18]]},"fidi-moment":{d:[1,2,3,4,5],h:[[12,14]],m:[4,5,6,7,8,9,10]},"fidi-mood":{h:[[11,14]],wx:"sun"},
  "ktown-moment":{h:[[10,21]]},"ktown-mood":{d:[5,6],h:[[21,3]]},
  "bushwick-moment":{d:[0,6],h:[[11,18]]},"bushwick-energy":{d:[6],h:[[11,18]]},
  "chelsea-moment":{d:[4],h:[[18,20]]},"chelsea-energy":{h:[[8,21]]},"chelsea-odd":{h:[[10,21]]},
  "brighton-energy":{m:[5,6,7,8,9],h:[[17,22]]},"brighton-mood":{m:[11,12,1,2,3]},"brighton-mood-s":{wx:"sun"},
  "wsp-mood":{wx:"sun"},"dumbo-place":{h:[[5,9]]},"dumbo-moment":{h:[[10,19]]}
};
const DAY_NAMES=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], DAY_SHORT=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const hourText = h => h===0||h===24 ? "midnight" : h===12 ? "noon" : (h%12)+(h<12?" am":" pm");
/* Is the idea on at this moment? sky is the forecast for then (undefined when unknown). Weather is a soft test: "sun" fails only when
   rain or heavy cloud is forecast, "rain" needs rain in the forecast or now, "dull" never blocks. */
function ideaOpen(x,t,sky){ const a=AVAIL[x.id]; if(!a) return true;
  if(a.ev){ const E=EVENTS.find(e=>e.id===a.ev); if(E&&E.when){ const day=new Date(t.getFullYear(),t.getMonth(),t.getDate()); if(!E.when(t.getFullYear()).some(([s0,e0])=>day>=new Date(s0.getFullYear(),s0.getMonth(),s0.getDate())&&day<=new Date((e0||s0).getFullYear(),(e0||s0).getMonth(),(e0||s0).getDate()))) return false; } }
  if(a.span){ const md=(t.getMonth()+1)*100+t.getDate(), s0=a.span[0][0]*100+a.span[0][1], e0=a.span[1][0]*100+a.span[1][1]; if(s0<=e0?(md<s0||md>e0):(md<s0&&md>e0)) return false; }
  if(a.wx==="snow"&&!(sky==="snow"||(sky===undefined&&nowInfo().sky==="snow"&&Math.abs(t-Date.now())<6*36e5))) return false;
  if(a.d&&!a.d.includes(t.getDay())) return false;
  if(a.m&&!a.m.includes(t.getMonth()+1)) return false;
  if(a.h){ const hr=t.getHours()+t.getMinutes()/60; if(!a.h.some(([s,e])=>s<e?(hr>=s&&hr<e):(hr>=s||hr<e))) return false; }
  if(a.wx==="sun"&&/rain|storm|snow|fog|cloud/.test(sky||"")) return false;
  if(a.wx==="rain"&&!(sky==="rain"||sky==="storm"||(sky===undefined&&nowInfo().sky==="rain"&&Math.abs(t-Date.now())<6*36e5))) return false;
  return true; }
function availText(x){ const a=AVAIL[x.id]; if(!a) return ""; const out=[], MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if(a.ev){ const E=EVENTS.find(e=>e.id===a.ev); if(E&&E.when){ const now=new Date(), d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()), y=now.getFullYear(), o=E.when(y).concat(E.when(y+1)).find(([s0,e0])=>(e0||s0)>=d0);
    if(o) out.push(MO[o[0].getMonth()]+' '+o[0].getDate()+(o[1]&&(o[1].getMonth()!==o[0].getMonth()||o[1].getDate()!==o[0].getDate())?' to '+MO[o[1].getMonth()]+' '+o[1].getDate():'')+' only ('+E.name+')'); } }
  if(a.span) out.push(MO[a.span[0][0]-1]+' '+a.span[0][1]+' to '+MO[a.span[1][0]-1]+' '+a.span[1][1]);
  if(a.d){ const d=a.d.slice().sort(); out.push(d.join()==="1,2,3,4,5"?"Weekdays":d.join()==="0,6"?"Weekends":d.join()==="1,2,3,4,5,6"?"Monday to Saturday":d.length===1?DAY_NAMES[d[0]]+"s":d.map(n=>DAY_SHORT[n]).join(", ")); }
  if(a.h) out.push(a.h.map(([s,e])=>hourText(s)+" to "+hourText(e)).join(" and "));
  if(a.m&&!x.m){ const M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], m=a.m; out.push(m.length>=5&&m[0]<=m[m.length-1]?M[m[0]-1]+" to "+M[m[m.length-1]-1]:m.length>=5?M[m[0]-1]+" to "+M[m[m.length-1]-1]:m.map(n=>M[n-1]).join(", ")); }
  if(a.wx==="sun") out.push("needs sun"); if(a.wx==="rain") out.push("needs rain"); if(a.wx==="snow") out.push("needs falling snow"); if(a.wx==="dull") out.push("best in bad weather");
  return out.join(" · "); }


/* Search: every word typed must start a word somewhere in the idea (title, what to look for, how to work it, the rule, the place,
   the intent, its light and the composition technique). Plurals and -ing/-ed endings are folded, so "reflection" finds
   "reflections" and "steam" finds "steaming". */
const qNorm = t => " "+String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim().split(" ").map(qStem).join(" ")+" ";
function qStem(w){ if(w.length>4){ if(/ies$/.test(w)) return w.slice(0,-3)+"y"; if(/(ches|shes|sses|xes)$/.test(w)) return w.slice(0,-2); if(/ing$/.test(w)&&w.length>5) return w.slice(0,-3); if(/ed$/.test(w)&&w.length>5) return w.slice(0,-2); if(/s$/.test(w)&&!/ss$/.test(w)) return w.slice(0,-1); } return w; }
const QHAY = new Map();
const QLIGHT = {am:"sunrise early dawn", mid:"noon harsh hard light", gold:"golden hour sunset low sun warm", night:"dark after dark evening", rain:"wet overcast cloudy grey gray umbrella puddle"};
function ideaHay(x){ let h=QHAY.get(x.id); if(h) return h; const co=COMPOSE[x.id];
  h=qNorm([x.t,x.look,x.work,x.rule,PLACES[x.p].name,INTENTS[x.i].name,x.w.map(w=>WHEN[w]+" "+(QLIGHT[w]||"")).join(" "),co?co.map(k=>TECH[k]?TECH[k][0]:"").join(" "):"",seasonText(x)].join(" ")); QHAY.set(x.id,h); return h; }
const qTokens = () => qNorm(state.q).trim().split(" ").filter(Boolean);
const qHit = x => { const T=qTokens(); if(!T.length) return true; const h=ideaHay(x); return T.every(t=>h.includes(" "+t)); };
/* On now: the idea is open (days, hours, season, weather) and suits the light at this moment. */
function onNowIdea(x,t,sky){ t=t||new Date(); return ideaOpen(x,t,sky===undefined?skyAt(t):sky)&&x.w.includes(lightAt(t)); }
function matches(savedOnly){ const t=new Date(), sky=state.onNow?skyAt(t):undefined;
  return cityIdeas().filter(x => (state.intent==="all"||x.i===state.intent) && (state.place==="all"||(state.place==="near"?nearSet().has(x.p):x.p===state.place))
    && (state.when==="all"||x.w.includes(state.when)) && (!savedOnly||state.saved.has(x.id)) && qHit(x) && (!state.onNow||onNowIdea(x,t,sky)));
}
/* What to say when search or On now leaves nothing, with a way out. */
function qEmptyHtml(){ if(!state.q&&!state.onNow) return ""; const b=[];
  if(state.q) b.push('<button type="button" class="chip" data-qclear="q">Clear the search</button>'); if(state.onNow) b.push('<button type="button" class="chip" data-qclear="now">Show all times</button>');
  return '<p class="plain">Nothing'+(state.q?' matches “'+esc(state.q.trim())+'”':'')+(state.onNow?(state.q?' that is':'')+' on right now':'')+' with these filters.</p><div class="intents">'+b.join("")+'</div>'; }
/* A short piece of the idea's text around the first search word, for list rows when the title alone does not show the match. */
function qSnippet(x){ const T=qTokens(); if(!T.length) return ""; if(T.every(t=>qNorm(x.t).includes(" "+t))) return "";
  for(const src of [x.look,x.work,x.rule]){ const words=String(src).split(/\s+/); for(let i=0;i<words.length;i++){ if(T.some(t=>qNorm(words[i]).includes(" "+t))){ const a=Math.max(0,i-5), z=Math.min(words.length,i+7);
    return (a?"…":"")+words.slice(a,z).map(w=>T.some(t=>qNorm(w).includes(" "+t))?"<mark>"+esc(w)+"</mark>":esc(w)).join(" ")+(z<words.length?"…":""); } } }
  return ""; }
const qMarkTitle = x => { const T=qTokens(); if(!T.length) return esc(x.t); return x.t.split(/(\s+)/).map(w=>/\S/.test(w)&&T.some(t=>qNorm(w).includes(" "+t))?"<mark>"+esc(w)+"</mark>":esc(w)).join(""); };
/* How well an idea fits right now, for the list's "Best right now" order: the card's score without the randomness or the repeats. */
function nowRank(x,t,key,sky){ let s=0; const fit=x.w.includes(key), last=lastShot(x.id);
  if(!fit) s+=2.2; if(!ideaOpen(x,t,sky)) s+=4;
  if(state.done.has(x.id)) s+= last&&last.r==="again" ? (fit?-0.3:0.9) : last&&last.r==="keep" ? 2.4 : 1.8;
  if(state.pos){ const mi=milesTo(PLACES[x.p]); if(mi!==null) s+=Math.min(mi,10)*0.22; } return s; }
const agoText = t => { const d=Math.floor((new Date().setHours(0,0,0,0)-new Date(t).setHours(0,0,0,0))/864e5); return d<=0?"today":d===1?"yesterday":d<7?d+" days ago":d<60?Math.round(d/7)+" wk ago":new Date(t).toLocaleDateString("en-US",{month:"short",year:"numeric"}); };
const ISORT = {place:"By place", now:"Best right now", near:"Nearest", fresh:"Not shot yet", recent:"Recently shot"};
function show(id){
  if(state.current && state.current!==id){ state.history.push(state.current); if(state.history.length>40) state.history.shift(); }
  state.current=id; state.tab="idea"; state.justShot=null; state.onlyOne=false;
  const c=document.getElementById("card"); if(c){ c.classList.remove("swap"); void c.offsetWidth; c.classList.add("swap"); }
}
/* Another idea: not a plain random pick. Each idea that passes the filters is scored on the light and forecast now, whether it is on
   (days, hours, weather), how far it is from you, whether you have shot it (a "try again" comes back when the light suits it) and
   whether it came up a moment ago. A little randomness keeps it from showing the same few. Lower is better. */
function shootScore(x,t,key,sky){ let s=0; const fit=x.w.includes(key), last=lastShot(x.id);
  if(!fit) s+=2.2;
  if(!ideaOpen(x,t,sky)) s+=4;
  if(state.done.has(x.id)) s+= last&&last.r==="again" ? (fit?-0.3:0.9) : last&&last.r==="keep" ? 2.4 : 1.8;
  if(state.pos){ const mi=milesTo(PLACES[x.p]); if(mi!==null) s+=Math.min(mi,10)*0.22; }
  const k=state.history.lastIndexOf(x.id); if(k>=0&&k>=state.history.length-20) s+=2.5;
  return s; }
function pick(){
  const m = matches(false); if(!m.length){ state.current=null; return; }
  let pool = m.filter(x=>x.id!==state.current); if(!pool.length) pool = m;
  const t=new Date(), key=state.when!=="all"?state.when:lightAt(t), sky=skyAt(t);
  const best=pool.map(x=>({x,s:shootScore(x,t,key,sky)+Math.random()*1.2})).sort((a,b)=>a.s-b.s)[0];
  show(best.x.id);
}
function goNext(){ const m=matches(false), before=state.current; state.onlyOne=m.length<=1&&!!before&&m.some(x=>x.id===before);
  if(state.onlyOne){ render(); const c=$("card"); if(c){ c.classList.remove("swap"); void c.offsetWidth; c.classList.add("swap"); } return; }
  pick(); render(); if(!state.street) cardToTop(); }
/* When the filters leave only the idea on screen, say so and offer to widen them, rather than doing nothing. */
function onlyOneHtml(x){ if(!state.onlyOne||!x) return ""; const bits=[];
  if(state.intent!=="all") bits.push(['intent','Any intent']); if(state.place!=="all") bits.push(['place','Anywhere']); if(state.when!=="all") bits.push(['when','Any light']);
  const what=[state.intent!=="all"?INTENTS[state.intent].name.toLowerCase():"", state.place==="near"?"near you":state.place!=="all"&&PLACES[state.place]?"at "+PLACES[state.place].name:"", state.when!=="all"?"in "+WHEN[state.when].toLowerCase():""].filter(Boolean).join(" ");
  return '<div class="onlyone" role="status"><p>This is the only idea'+(what?' for '+esc(what):'')+'.'+(bits.length?' Widen the filters to see more:':'')+'</p>'+(bits.length?'<div class="intents">'+bits.map(([k,l])=>'<button type="button" class="chip" data-widen="'+k+'">'+l+'</button>').join("")+'</div>':'')+'</div>'; }
function goBack(){ const id=state.history.pop(); if(!id) return; state.current=id; state.tab="idea"; state.justShot=null; render(); if(!state.street) cardToTop(); }
function bullets(lines, cityId){
  const map = CITIES[cityId].lines || {};
  return [...(lines||"")].map(l=>{const c=map[l]||"gray"; const bg=c.charAt(0)==="#"?c:"var(--"+c+")";
    return '<span class="bullet" style="background:'+bg+';'+(c==="yellow"?'color:var(--on-yellow)':'')+'">'+esc(l)+'</span>';}).join("");
}
// Suggested starting point per place: [label, Google Maps search text]. Adding a city means adding its places here.
const START = {"chinatown": ["Doyers St at Pell St", "Doyers St & Pell St, New York, NY"], "gct": ["Main Concourse, Grand Central Terminal", "Grand Central Terminal Main Concourse, New York, NY"], "tsq": ["The red steps at Duffy Square", "TKTS red steps, Father Duffy Square, Times Square, New York, NY"], "wsp": ["Washington Square Arch", "Washington Square Arch, New York, NY"], "dumbo": ["Washington St at Water St", "Washington St & Water St, Brooklyn, NY"], "coney": ["The boardwalk by the Wonder Wheel", "Deno's Wonder Wheel Amusement Park, Brooklyn, NY"], "soho": ["Prince St at Greene St", "Prince St & Greene St, New York, NY"], "jh": ["Roosevelt Av at 74 St", "74th St & Roosevelt Ave, Jackson Heights, NY"], "ferry": ["Whitehall Terminal", "Staten Island Ferry Whitehall Terminal, New York, NY"], "harlem": ["Apollo Theater, 125 St", "Apollo Theater, 253 W 125th St, New York, NY"], "les": ["Essex Market, Essex St at Delancey St", "Essex Market, 88 Essex St, New York, NY"], "flushing": ["Main St at Roosevelt Av", "Main St & Roosevelt Ave, Flushing, NY"], "wburg": ["Bedford Av at North 7 St", "Bedford Ave & N 7th St, Brooklyn, NY"], "midtown": ["Paley Park, East 53 St", "Paley Park, 3 E 53rd St, New York, NY"], "cpark": ["Bethesda Terrace", "Bethesda Terrace, Central Park, New York, NY"], "rockaway": ["The boardwalk at Beach 90 St", "Beach 90th St & Shore Front Pkwy, Rockaway Beach, NY"], "arthur": ["Arthur Av at East 187 St", "Arthur Ave & E 187th St, Bronx, NY"]};
Object.assign(START, {"union": ["The south steps at 14th Street", "Union Square Park, E 14th St & Broadway, New York, NY"], "fidi": ["The Federal Hall steps on Wall Street", "Federal Hall, 26 Wall St, New York, NY"], "ktown": ["West 32nd Street at Broadway", "W 32nd St & Broadway, New York, NY"], "bushwick": ["Troutman Street at St Nicholas Avenue", "Troutman St & St Nicholas Ave, Brooklyn, NY"], "chelsea": ["The High Line entrance at Gansevoort Street", "The High Line, Gansevoort St & Washington St, New York, NY"], "brighton": ["Brighton Beach Avenue at Brighton 6th Street", "Brighton Beach Ave & Brighton 6th St, Brooklyn, NY"]});
const mapUrl = pid => START[pid] ? "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(START[pid][1]) : "";
const startHtml = pid => START[pid] ? '<a class="start" href="'+mapUrl(pid)+'" target="_blank" rel="noopener"><small>Start at</small> '+esc(START[pid][0])+' <span aria-hidden="true">↗</span></a>' : '';
const startLink = pid => START[pid] ? '<a class="maplink" href="'+mapUrl(pid)+'" target="_blank" rel="noopener" aria-label="Open the starting point for '+esc(PLACES[pid].name)+' in Google Maps">Map ↗</a>' : '';
const mapAddr = pid => START[pid] ? START[pid][1] : PLACES[pid].lat+","+PLACES[pid].lon;
const dirUrl = (from,to,mode,via) => "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(mapAddr(from))+"&destination="+encodeURIComponent(mapAddr(to))+
  (via&&via.length?"&waypoints="+encodeURIComponent(via.map(mapAddr).join("|")):"")+"&travelmode="+(mode==="walk"?"walking":"transit");
function planRoute(p){ const st=p.stops.map(s=>s.place).filter((id,n,a)=>id!==a[n-1]&&typeof PLACES[id].lat==="number"); if(st.length<2) return "";
  if(p.stops.every(s=>!s.leg||s.leg.mode==="walk") && st.length<=10) return '<a class="check" href="'+dirUrl(st[0],st[st.length-1],"walk",st.slice(1,-1))+'" target="_blank" rel="noopener">Open this outing in Google Maps ↗</a>';
  return '<p class="msg">This outing uses the subway between some stops, and Google Maps cannot chain subway rides in one link. Use Directions on each leg below.</p>'; }
const whereHtml = pl => '<span class="where">'+esc(pl.stop||"")+' '+bullets(pl.lines, pl.city)+'</span>';

/* Where to stand, on the idea itself: the spot for this idea (or the place's starting point), which way to face,
   what the light is doing that way now, and one tap to walk there or see it on the map. */
/* How to focus for this idea on this camera, from the recipe, what must be sharp and how far away it is. */
const CAM_FL = {q343:43, q328:28, other:35};
// Ideas where the general rule for the recipe would mislead. {s}, {box} and {m} become the camera's own terms.
const FOCUS_OVERRIDE = {"gct-energy": "{s}, with {box} on the person standing still at the departures board. Half-press and keep holding while the crowd passes; at 1/4 s the walkers smear across the frame and your still subject shows through. At 20 m nearly everything is sharp even wide open, so the held half-press is all it takes.", "tsq-energy": {"q343": "{m}: set the ring to 4 m once and stand so the lamppost or figure is exactly 4 m away. At night S mode opens the lens wide, so only about 1 m around 4 m is sharp.", "q328": "{m}: set the ring to 4 m once and stand so the lamppost or figure is exactly 4 m away. At night S mode opens the lens wide, so only about 2 m around 4 m is sharp."}, "tsq-mood": {"q343": "{m}, not autofocus, which locks onto the wet ground. A reflection is as far away as the thing it reflects, so set the ring to 8 m at f/8: everything from about 3.9 m to infinity is sharp, the feet at 4 m and the reflected screens together.", "q328": "{m}, not autofocus, which locks onto the wet ground. A reflection is as far away as the thing it reflects, so set the ring to 5 m at f/5.6: everything from about 2.4 m to infinity is sharp, the feet and the reflected screens together.", "other": "{s}, with {box} on the reflection of the screens, not on the wet ground: a reflection is as far away as the thing it reflects. Stop down to f/5.6 to f/8 so the feet and umbrellas stay sharp as well."}, "chinatown-energy": {"q343": "{m}: set the ring to 3 m before you start, since you stay at one spot. In daylight S mode closes to about f/11, so everything from about 2 m to 6.5 m is sharp. At dusk the aperture opens up: switch to {s} with {box} on the vendor and hold the half-press while the crowd passes.", "q328": "{m}: set the ring to 3 m before you start, since you stay at one spot. In daylight S mode closes to about f/11, so everything from about 1.3 m to infinity is sharp. At dusk the aperture opens up: switch to {s} with {box} on the vendor and hold the half-press while the crowd passes."}, "gct-moment": {"q343": "{s}, with {box} on your waiting person's face; half-press again whenever they shift. At f/2.8 and 5 m everything from about 4.1 m to 6.4 m is sharp, so a step either way stays sharp. When the other person arrives, refocus on the nearer face.", "q328": "{s}, with {box} on your waiting person's face; half-press again whenever they shift. At f/2.8 and 5 m everything from about 3.3 m to 11 m is sharp, so a step either way stays sharp. When the other person arrives, refocus on the nearer face."}, "dumbo-odd": {"q343": "{s}, with {box} on the rails about 4 m ahead. At f/11 everything from about 2.3 m to 14 m is sharp, the rails and the modern detail together.", "q328": "{s}, with {box} on the rails about 4 m ahead. At f/8 everything from about 1.8 m to infinity is sharp, the rails and the modern detail together."}, "ferry-place": {"q343": "{s}, with {box} on the railing or a passenger about 6 m away. At f/11 everything from about 2.9 m to infinity is sharp, the skyline included; keep that distance by moving your feet.", "q328": "{s}, with {box} on the railing or a passenger about 6 m away. At f/8 everything from about 2.1 m to infinity is sharp, the skyline included."}, "soho-moment": {"q343": "{s} with {eye}. When the person stops in the doorway, half-press, check the box is on the nearest eye, then press. At f/2 and 4 m about 1 m front to back is sharp, so the doorway stays sharp too; the background separates only if it is well behind them.", "q328": "{s} with {eye}. When the person stops in the doorway, half-press, check the box is on the nearest eye, then press. At f/1.7 and 4 m about 2 m front to back is sharp, so the doorway stays sharp too; the background separates only if it is well behind them."}, "soho-mood": {"q343": "{s}, with {box} on a sharp shadow edge on the wall. At f/5.6 and 10 m almost everything from about 5 m back is sharp, so the person will be too; lock it and keep holding.", "q328": "{s}, with {box} on a sharp shadow edge on the wall. At f/5.6 and 10 m everything from about 3 m back is sharp, so the person will be too; lock it and keep holding."}, "harlem-place": {"q343": "{s}, with {box} on the kerb about 8 m away (or {m} at 8 m). At f/8 that keeps about 4 m to infinity sharp, so the passer-by in the foreground and the marquee across the street both hold. Half-press, reframe, then wait for the passer-by.", "q328": "{s}, with {box} on the kerb about 8 m away (or {m} at 8 m). At f/8 that keeps about 2.3 m to infinity sharp, so the passer-by in the foreground and the marquee across the street both hold. Half-press, reframe, then wait for the passer-by."}, "rockaway-energy": {"q343": "{c} with the Zone area on the surfer, or switch to {m} and set infinity: at f/4 everything beyond about 15 m is sharp. Face detection will not find someone 50 m away. Press a short burst as they stand up.", "q328": "{c} with the Zone area on the surfer, or switch to {m} and set infinity: at f/4 everything beyond about 7 m is sharp. Face detection will not find someone 50 m away. Press a short burst as they stand up."}, "midtown-mood": "{s}, with {box} on the person as they step into the bright patch; they are lit, so the camera locks fast. To be ready, half-press on the ground in the middle of the patch and keep holding.", "midtown-moment": {"q343": "{s}, with {box} on the person's face; they are already seated, so focus once you have framed them and keep holding until the bite. At f/8 and 5 m, about 3 m to 14 m is sharp.", "q328": "{s}, with {box} on the person's face; they are already seated, so focus once you have framed them and keep holding until the bite. At f/8 and 5 m, about 2 m to infinity is sharp."}, "chelsea-place": {"q343": "{s}, with {box} on the people seated on the steps, about 10 m away. At f/5.6 and 10 m, about 5 m to 105 m is sharp, the steps and the avenue together.", "q328": "{s}, with {box} on the people seated on the steps, about 10 m away. At f/5.6 and 10 m, everything from about 3 m to infinity is sharp, the steps and the avenue together."}, "fidi-energy": "{s}, with {box} on the ribs. At 30 m nearly everything is sharp even wide open, so focus once and hold the half-press.", "ktown-odd": {"q343": "{s}, with {box} on something about 4 m away (or {m} at 4 m). At f/16 everything from about 2 m to infinity is sharp, so stand at least 2 m from the stall and both the souvenirs and the tower will be sharp.", "q328": "{s}, with {box} on something about 2.5 m away (or {m} at 2.5 m). At f/11 everything from about 1.2 m to infinity is sharp, souvenirs and tower both."}, "ktown-place": {"q343": "{s}, with {box} on a lit sign about 30 m up the street. At f/2 and 30 m, about 15 m to the far end of the block is sharp.", "q328": "{s}, with {box} on a lit sign about 30 m up the street. At f/1.7 and 30 m, about 10 m to infinity is sharp."}, "bushwick-odd": {"q343": "{s}, with {box} on the mural just beside the painted face. At f/8 and 5 m, about 3 m to 14 m is sharp, so a passer-by in front of the wall is sharp too. Half-press while you wait and keep holding.", "q328": "{s}, with {box} on the mural just beside the painted face. At f/8 and 5 m, about 2 m to infinity is sharp, so a passer-by in front of the wall is sharp too. Half-press while you wait and keep holding."}, "chelsea-odd": "{s} with {spot} on the reflected figure, not on the metal. A reflection sits as far behind the surface as the person stands in front of it, so it focuses further away than the copper; a ring pre-set to 3 m would leave it soft. At f/4 the metal's edges go soft too, which keeps the eye on the figure.", "brighton-odd": {"q343": "{s}, with {spot} on a label or tin edge in the display. Through glass, autofocus can lock onto the pane or a reflection; if the display comes out soft, move the box to a high-contrast label, or switch to {m} and set 1.5 m.", "q328": "{s}, with {spot} on a label or tin edge in the display. Through glass, autofocus can lock onto the pane or a reflection; if the display comes out soft, move the box to a high-contrast label, or switch to {m} and set 1.5 m."}, "chinatown-lunar": "{c} with {eye} on the shopkeeper's face; the camera will not track the lion's head, so shoot when the lion is at about the shopkeeper's distance. Half-press as the lion nears the door and keep holding; check the box has not jumped to a face in the crowd, then shoot a short burst as it rears.", "wsp-odd": {"q343": "{s} with {eye}: check the box is on the nearest eye before you press. At f/4 and 3 m, about 2.5 m to 3.7 m is sharp, enough for the person and the piano, typewriter or pigeons beside them.", "q328": "{s} with {eye}: check the box is on the nearest eye before you press. At f/4 and 3 m, about 2.1 m to 5.5 m is sharp, so the person and their piano, typewriter or pigeons are sharp together."}};
/* Added after the general focus text for these ideas. */
const FOCUS_APPEND = {"cpark-mood": {"q343": "In fog the camera can hunt on a faint figure: put the box on a bench edge about 10 m away instead; at f/8 that keeps about 4.4 m to infinity sharp.", "q328": "In fog the camera can hunt on a faint figure: put the box on a bench edge about 10 m away instead; at f/8 that keeps about 2.5 m to infinity sharp."}, "rockaway-mood": {"q343": "In fog the camera can hunt on a faint figure: switch to {m} and set 10 m (about 4.4 m to infinity sharp).", "q328": "In fog the camera can hunt on a faint figure: switch to {m} and set 5 m (about 2 m to infinity sharp)."}, "wsp-snow": {"q343": "Falling snow can pull autofocus onto near flakes; if the walker comes out soft, switch to {m} and set 10 m (about 4.4 m to infinity sharp at f/8).", "q328": "Falling snow can pull autofocus onto near flakes; if the walker comes out soft, switch to {m} and set 5 m (about 2 m to infinity sharp at f/8)."}, "wsp-mood-s": {"q343": "If the player is looking down and no eye box appears, put a Field box on the near eyelid or brow, or stop down to f/2.8 for a little more depth."}};
/* Per-idea camera settings: an exposure line for a camera (rec), a note added to or replacing the recipe's (note, noteSet), and settings that differ from the recipe (setup, by SETUP_LABELS index). */
const IDEA_SET = {"gct-energy": {"rec": {"q343": ["1/4 s · S mode · Auto ISO · 75 mm crop", "From 20 m, walkers cross only a little of the frame in 1/15 s, so slow down: 1/4 s, or 1/2 s with your elbows firmly on the rail. Stabilization and the rail keep the still figure sharp. Use the 75 mm crop frame: at 20 m the figure is small in the full 43 mm frame."], "q328": ["1/4 s · S mode · Auto ISO · 50 mm crop", "From 20 m, walkers cross only a little of the frame in 1/15 s, so slow down: 1/4 s, or 1/2 s with your elbows firmly on the rail. Stabilization and the rail keep the still figure sharp."]}}, "tsq-energy": {"setup": {"3": "−0.7, so the screens keep their colour", "7": "Daylight, so each screen's colour stays in the picture"}}, "tsq-mood": {"rec": {"q343": ["f/8 · 1/125 s · Auto ISO, max 6400", "Stop down so the feet along the top of the frame and the reflected screens are both sharp; Times Square is bright enough for the ISO this needs."], "q328": ["f/5.6 · 1/125 s · Auto ISO, max 6400", "Stop down so the feet along the top of the frame and the reflected screens are both sharp; Times Square is bright enough for the ISO this needs."]}, "setup": {"0": "MF", "1": "Not used (focus ring pre-set, see How to focus)"}}, "tsq-moment": {"note": "After dark use f/2.8 · 1/500 s · Auto ISO, max 6400: 1/500 s is plenty for someone climbing stairs.", "noteSet": {"q328": "Continuous AF with body and eye detection. Shoot short bursts through the peak. In full sun use f/5.6: Auto ISO cannot go below 100, so f/4 at 1/1000 s comes out a stop too bright."}}, "gct-mood": {"setup": {"2": "Spot, on the brightest part of the patch", "3": "+0.7 to +1, so the patch stays bright while the marble around it falls to black"}}, "wsp-odd": {"rec": {"q343": ["f/4 · A mode · Auto ISO, slowest 1/250 s", "Use f/4 here, not wide open, so the piano, typewriter or pigeons stay readable beside the person: at 3 m about 2.5 to 3.7 m is sharp."], "q328": ["f/4 · A mode · Auto ISO, slowest 1/250 s", "Use f/4 here, not wide open, so the piano, typewriter or pigeons stay readable beside the person: at 3 m about 2.1 to 5.5 m is sharp."]}}, "gct-place": {"noteSet": "Stabilization steadies the building, not the people. If faces in the crowd matter, stay at f/2.8 and 1/125 s; if only the scene matters, use f/5.6: the floor from the balustrade out is sharp, and Auto ISO rises to about 1600 to 3200, which is fine."}, "tsq-place": {"note": "At dusk set f/5.6 and Auto ISO's slowest shutter to 1/125 s: from 30 m everything is still sharp and ISO stays near 1600 to 3200."}, "dumbo-mood": {"note": {"q343": "With the camera resting on a rock, use f/5.6 and 1/30 s and focus about 11 m away: everything from about 5.5 m to infinity is sharp, so keep the figure at least 6 m out; they only need to stand still. Use the 2-second self-timer at that speed.", "q328": "With the camera resting on a rock, use f/5.6 and 1/30 s so the skyline is sharp too; the figure only needs to stand still. Use the 2-second self-timer at that speed."}}, "dumbo-odd": {"rec": {"q343": ["f/11 · A mode · Auto ISO, slowest 1/125 s", "Stop down to f/11 so the rails near you and the modern detail further off are both sharp."]}}, "ferry-place": {"rec": {"q343": ["f/11 · A mode · Auto ISO, slowest 1/250 s", "Stop down to f/11 so the railing or passenger and the skyline are both sharp."]}}, "jh-moment": {"note": "After dark, set f/2.8 and 1/250 s yourself (Auto ISO, max 6400), switch to AFs with the Field box on the hands, and stay about 2 m away."}, "coney-mood": {"note": "In fog, dial +0.7 EV so the fog stays white rather than grey.", "setup": {"3": "+0.7 in fog, so it stays white"}}, "subway-place": {"note": {"q343": "For a standing figure use f/5.6 and 1/60 s and focus at about 8 m (about 4.6 m to 29 m sharp); go back to 1/125 s if they are walking."}}, "harlem-place": {"note": {"q343": "Once the marquee is lit at dusk, open to f/4, set Auto ISO's slowest shutter to 1/125 s and refocus at about 16 m (about 7.9 m to infinity sharp); at 8 m, f/4 holds only about 5.3 m to 17 m.", "q328": "Once the marquee is lit at dusk, open to f/4, set Auto ISO's slowest shutter to 1/125 s and refocus at about 8 m (about 3.6 m to infinity sharp)."}}, "flushing-mood": {"setup": {"2": "Spot, on the vendor's face"}}, "harlem-mood": {"note": "Nothing here moves fast: stop down to f/5.6 and turn the shutter dial to 1/30 s so the whole row stays sharp; stabilization holds it."}, "flushing-odd": {"rec": {"q343": ["f/8 · A mode · Auto ISO, slowest 1/250 s", "Stop down to f/8 here: at 80 cm, f/4 keeps only about 8 cm sharp; f/8 about 17 cm, enough for the fruit and the hand."], "q328": ["f/8 · A mode · Auto ISO, slowest 1/250 s", "Stop down to f/8 here: at 80 cm, f/4 keeps about 20 cm sharp; f/8 about 40 cm, enough for the fruit and the hand."]}}, "flushing-moment": {"note": "Use 1/250 s here: hands passing a bowl blur at 1/125 s this close."}, "wburg-place": {"note": "After sunset, open to f/4 and set Auto ISO's slowest shutter to 1/60 s; wait for the person at the rail to hold still."}, "rockaway-energy": {"noteSet": "Continuous AF with the Zone area on the surfer. Shoot short bursts as they stand up. In full sun use f/5.6, and on bright sand and water f/8, at 1/1000 s: Auto ISO cannot go below 100, so at f/4 the frame comes out too bright and the glare burns out.", "setup": {"1": "Zone, on the surfer"}}, "midtown-mood": {"noteSet": "Highlight-Weighted metering exposes for the bright patch, so the lit person keeps their detail and the shaded street around them goes dark.", "setup": {"2": "Highlight-Weighted", "3": "0 to −0.7"}}, "fidi-mood": {"noteSet": "Highlight-Weighted metering exposes for the sunlit slot, so the shade goes black and the person in the light keeps their detail.", "setup": {"2": "Highlight-Weighted", "3": "0 to −0.7"}}, "jh-mood": {"noteSet": "Highlight-Weighted metering exposes for the bright bands, so a face in the light keeps its detail and the shade goes almost black.", "setup": {"2": "Highlight-Weighted", "3": "0 to −0.7"}}, "cpark-mood": {"note": "In fog or snow add +0.7 to +1 EV, or the white turns grey.", "setup": {"3": "+0.7 to +1 in fog or snow, so it stays white"}}, "rockaway-mood": {"note": "With this much fog or sky, add +0.7 EV so it stays light, not grey.", "setup": {"3": "+0.7 with fog or a big sky"}, "noteSet": {"q328": "Aperture priority: you set the aperture, the camera picks the shutter speed. Keep the foreground empty; the figure and the horizon are the picture. Keep the horizon level."}}, "cpark-place": {"setup": {"3": "−0.7, to hold the bright terrace"}}, "cpark-odd": {"setup": {"2": "Spot, on the performer's face"}}, "chelsea-place": {"rec": ["f/5.6 · A mode · Auto ISO, slowest 1/60 s, max 6400", "At dusk, f/8 at 1/250 s needs more ISO than is clean. f/5.6 with a 1/60 s floor is enough: the seated people hold still."]}, "fidi-energy": {"rec": ["1/4 s · S mode · Auto ISO", "Rest the camera on the balcony rail and set 1/4 s (try 1/2 s). From 30 m, 1/15 s barely blurs the commuters."]}, "ktown-odd": {"rec": {"q343": ["f/16 · A mode · Auto ISO, slowest 1/250 s", "Stop down to f/16 so the souvenirs at 2 m and the tower are both sharp."], "q328": ["f/11 · A mode · Auto ISO, slowest 1/250 s", "Stop down to f/11 so the souvenirs near you and the tower are both sharp."]}}, "ktown-mood": {"note": {"q343": "At f/2 the reflections become soft glows over a sharp face; for crisper reflections set f/5.6 and focus just beyond the face.", "q328": "At f/1.7 the reflections become soft glows over a sharp face; for crisper reflections set f/5.6 and focus just beyond the face."}}, "wsp-snow": {"setup": {"3": "+0.7 to +1, so the snow stays white"}}, "brighton-moment": {"noteSet": {"q343": "Aperture priority: you set the aperture, the camera picks the shutter speed. In the Auto ISO settings set the slowest shutter speed shown here, so the camera raises ISO instead of going slower. Use Eye/Face/Body detection AF. At 6 m, f/2 keeps both faces on the bench sharp, but the background stays readable, so choose a plain or distant one."}}, "brighton-mood": {"noteSet": {"q328": "Aperture priority: you set the aperture, the camera picks the shutter speed. Keep the foreground empty; the figure and the horizon are the picture. Keep the horizon level."}}, "wburg-marathon": {"noteSet": {"q343": "Shutter priority: you set 1/15 s, the camera sets the aperture and Auto ISO fills in. Stabilization on, elbows in, braced on the barrier. The runners pass in daylight, usually in sun, where even f/16 only gets to about 1/125 s at ISO 100: bring a 3-stop ND filter (a dark 49 mm filter that cuts the light to an eighth) for about 1/15 s, or find a shaded stretch. Without one, pick runners crossing the frame at an angle, not running straight at you.", "q328": "Shutter priority: you set 1/15 s, the camera sets the aperture and Auto ISO fills in. Stabilization on, elbows in, braced on the barrier. The runners pass in daylight, usually in sun, where even f/16 only gets to about 1/125 s at ISO 100: bring a 3-stop ND filter (a dark 49 mm filter that cuts the light to an eighth) for about 1/15 s, or find a shaded stretch. Blur shows less at 28 mm, so try 1/8 s as well. Without the filter, pick runners crossing the frame at an angle."}}, "chinatown-lunar": {"rec": ["f/5.6 · 1/1000 s · Auto ISO", "Use f/5.6 so both the lion's head and the shopkeeper are sharp; Mott Street is shaded, so expect ISO 1600 to 3200."]}, "harlem-moment": {"setup": {"3": "0, or +0.7 when hat brims shade faces", "5": "3:2"}}, "midtown-moment": {"setup": {"3": "0", "5": "3:2"}}, "chelsea-moment": {"setup": {"1": "Field, on the faces (a lit edge at the same distance if it hunts)"}}, "chelsea-odd": {"rec": ["f/4 · 1/250 s · Auto ISO, max 3200", "Copper is a dark mirror: it gives back only part of the light, so f/8 at 1/500 s pushes Auto ISO past 2000 here. Nothing in a reflection moves fast, so f/4 at 1/250 s lets in three stops more: ISO 2000 becomes about 250. For still reflections 1/125 s is enough, a stop lower again."], "setup": {"0": "AFs", "1": "Spot, on the reflected figure", "3": "−0.7, so the copper stays rich and the ISO lower"}}};
/* Short names for what to focus on, where the keep-sharp text is too long to drop into a sentence. */
const FOCUS_ON = {"gct-energy": "the still person", "tsq-moment": "the face coming up the stairs", "tsq-mood": "the reflected screens", "wsp-mood": "the reader's outline", "dumbo-place": "the bridge tower", "dumbo-moment": "the couple", "soho-place": "the facades a third of the way down", "ferry-place": "the railing or passenger in the foreground", "flushing-odd": "the fruit where the hand reaches in", "union-moment": "the regular's face", "ktown-place": "a lit sign about 30 m up the street", "ktown-energy": "the person standing still", "bushwick-odd": "the mural beside the painted face", "wburg-marathon": "the still spectator or sign", "chinatown-lunar": "the shopkeeper's face", "chinatown-odd": "the watchers' faces", "tsq-odd": "the performer", "ferry-moment": "the raised phones", "les-energy": "the bridge steel", "flushing-energy": "the far stair railing", "wsp-moment": "the player's hand and face"};
/* Ideas whose subject is already in place, so "half-press where they will stand" does not apply. */
const NO_PRE = new Set(["union-mood","midtown-moment","gct-moment","soho-moment","wsp-mood-s","chelsea-moment","harlem-mood"]);
/* Ideas where the recipe's general tip contradicts the card. */
const NO_REC_TIP = new Set(["ferry-mood","soho-odd","flushing-odd","arthur-odd","brighton-odd","midtown-mood","fidi-mood","jh-mood"]);
/* The diagram caption, where the stance's general one does not fit this place. */
const STANCE_CAP = {"subway-mood":"Sit at one end and shoot along the length of the car.","harlem-mood":"From the kerb across the street, shoot down the block.","flushing-place":"Stand at the kerb and shoot along the street.","cpark-place":"Stand at the back wall of the arcade and shoot straight out through the centre arch.","rockaway-odd":"Stand to the side so the board and the sign are both in view.","chelsea-odd":"Stand close to the metal and shoot the reflection in it.","fidi-moment":"Walk along the tables at chest height.","ktown-place":"Stand on the pavement and shoot along the street.","bushwick-place":"Stand across the street, facing the wall.","bushwick-mood":"Stand on the pavement and shoot along the block.","midtown-moment":"Frame the ledge from across the pavement and wait for the moment.","ferry-energy":"Stand back from the doors, square to them, beside a pillar out of the flow.","midtown-place":"Stand at the kerb or a plaza edge and shoot along the avenue.","soho-place":"Stand in the crosswalk while traffic is stopped and shoot straight down the block."};
const LEICA_CROPS = {43:[60,75,90,150],28:[35,50,75,90]};
const cropFor = (fl,crop) => crop&&crop>fl*1.2 ? (LEICA_CROPS[fl]||[crop]).reduce((b,c)=>b==null||Math.abs(Math.log(c/crop))<Math.abs(Math.log(b/crop))?c:b,null) : null;
const camPick = (v,cam) => v==null?null:(typeof v==="string"||Array.isArray(v))?v:(v[cam]!=null?v[cam]:v.other!=null?v.other:null);
const REC_F = {zone:8, freeze:4, drag:11, deep:8, shallow:0, night:0, silhouette:5.6, interior:2.8, detail:4};
const mText = v => v===Infinity ? "infinity" : v<1 ? Math.round(v*100)+" cm" : v<10 ? (Math.round(v*10)/10)+" m" : Math.round(v)+" m";
function workFocus(x, camKey){
  const W=WORKX[x.id]; if(!W) return "";
  const [full,,d,,crop]=W, sharp=FOCUS_ON[x.id]||(full.length>40?'your subject':full), cam=CAMERAS[camKey], r=x.r, wait=STANCE_OF[x.id]==="wait"&&!NO_PRE.has(x.id);
  if(camKey==="iphone"){
    const tap='On the screen, tap '+sharp;
    if(r==="zone"||r==="freeze") return tap+' before they arrive, then hold the shutter button for a burst; the phone keeps refocusing as they move.'+(crop?' Use the '+(crop>=75?'telephoto':'2×')+' lens: at '+mText(d)+' they are small on the main lens.':'');
    if(r==="shallow") return d<=2.5 ? 'Portrait mode finds the face on its own; tap the nearest eye to be sure, and stay within about 2.5 m.' : 'At '+mText(d)+' Portrait mode will not switch on, so use the '+(d>=8?'telephoto':'2×')+' lens and tap the face.';
    if(r==="drag") return tap+', then press and hold until AE/AF Lock appears so it stays put while the crowd passes. Keep the phone braced until the Live Photo finishes.';
    if(r==="detail") return tap+'. Closer than about 15 cm the iPhone switches to its macro lens on its own; let it.';
    return tap+', then press and hold until AE/AF Lock appears, so the phone does not refocus on someone passing.'+(crop?' Use the '+(crop>=75?'telephoto':'2×')+' lens.':'');
  }
  const leica=cam.setup==="leica", fl=CAM_FL[camKey]||35, N=REC_F[r]||(fl===28?1.7:2), [nr,fr]=dofCalc(fl,N,Math.min(d,200)), range=mText(nr)+' to '+mText(fr);
  const T=leica?{s:"AFs",c:"AFc",m:"MF",box:"the Field box",spot:"the Spot box",eye:"Eye/Face/Body detection"}:{s:"Single AF",c:"Continuous AF",m:"Manual focus",box:"a single AF point",spot:"a small single AF point",eye:"face and eye detection"};
  const lens=leica?'':' (figures for a 35 mm lens)';
  const cr=leica?cropFor(fl,crop):null, cropTxt=cr?' Use the '+cr+' mm crop frame: at '+mText(d)+', '+sharp+' would be small in the full '+fl+' mm frame.':'';
  const pre=wait&&["shallow","interior","night"].includes(r)?' While you wait, half-press on the spot where they will stand and keep holding, so the camera is ready when they arrive.':'';
  let t;
  if(r==="zone") t=T.m+'. Before you start, turn the focus ring to '+mText(d)+(leica?' (read it on the lens scale or the distance shown on screen)':'')+'. At f/8 everything from '+range+' is sharp'+lens+', so do not refocus: move your feet to stay about '+mText(d)+' from '+sharp+'.'+(x.w.includes('night')?' After dark, f/8 at 1/500 s needs far more ISO than is usable: open up to f/2.8 at 1/250 s and switch to '+T.s+' with '+T.box+' on '+sharp+'.':'');
  else if(r==="freeze") t=T.c+' with '+T.eye+', aimed at '+sharp+'. Half-press as your subject enters the frame and keep holding: the box follows them. Press for a short burst through the peak.';
  else if(r==="drag") t=T.s+', with '+T.box+' on '+sharp+'. Half-press to focus and keep holding while the movement passes, then press; letting go between frames lets it refocus on a passer-by. Someone crossing in front of your still subject does not move the focus while you hold: at 1/15 s they smear across the frame and the subject shows through, which is usually the picture. If they stop and block the subject, wait for the next pass. For a long session at one spot, switch to '+T.m+' and set '+mText(d)+' once. '+(INDOOR.has(x.id)?'Indoors the aperture opens wide at 1/15 s, so the focus has to be exact.':'Outdoors in daylight the aperture closes to about f/11, which keeps '+range+' sharp'+lens+'; after dark it opens up, so the focus has to be exact.');
  else if(r==="shallow"){ const [a,b]=dofCalc(fl,N,d); t=T.s+' with '+T.eye+': check the box is on the nearest eye before you press. At f/'+N+' and '+mText(d)+', '+(b-a<1?'only about '+mText(b-a):'about '+mText(b-a))+' front to back is sharp'+lens+(b-a<1?', so move the box onto the eye rather than focusing and then reframing.':'. That is plenty for a face, but the background stays fairly sharp at this distance; separation comes from a plain, distant background.'); }
  else if(r==="night") t=T.s+', with '+T.box+' on '+sharp+'. Autofocus needs light and contrast: if it hunts, focus on a lit edge at the same distance and hold the half-press. At f/'+N+' and '+mText(d)+', '+range+' is sharp'+lens+'.';
  else if(r==="silhouette") t=T.s+', with '+T.box+' on '+sharp+'. Aim it at a point of strong contrast, such as an outline against the light; a dark shape on its own gives the camera nothing to focus on.'+(wait?' To be ready before someone arrives, half-press on the ground where they will be and keep holding.':'');
  else if(r==="interior") t=T.s+', with '+T.box+' on '+sharp+'. At f/2.8 and '+mText(d)+', '+range+' is sharp'+lens+'.';
  else if(r==="detail") t=T.s+', with '+T.spot+' on '+sharp+'.'+(leica?' Closer than '+(fl===43?'60':'30')+' cm, turn the macro ring first.':' Closer than the lens allows, step back and crop later.');
  else t=T.s+', with '+T.box+' on '+sharp+'. At f/8 and '+mText(d)+', '+range+' is sharp'+lens+'. Half-press, reframe if you need to, then press.';
  const fo=camPick(FOCUS_OVERRIDE[x.id],camKey), fa=camPick(FOCUS_APPEND[x.id],camKey), sub=v=>v.replace(/\{s\}/g,T.s).replace(/\{c\}/g,T.c).replace(/\{box\}/g,T.box).replace(/\{spot\}/g,T.spot).replace(/\{m\}/g,T.m).replace(/\{eye\}/g,T.eye);
  if(fo) t=sub(fo); if(fa) t+=' '+sub(fa);
  const glass=STANCE_OF[x.id]==="glass"&&!fo ? (r==="zone" ? ' In a reflection, the person is as far away as the glass plus their distance from it: set the ring for that total, not for the glass.' : ' Through glass, autofocus can lock onto the pane or a reflection. If your subject comes out soft, put the box back on them, or switch to '+T.m+' and set the distance.') : '';
  return t+glass+pre+cropTxt;
}
function workTips(x){ const t=(WORK_TIPS[x.id]||[]).map(v=>camPick(v,state.camera)).filter(Boolean).concat(WORK_REC_TIP[x.r]&&!NO_REC_TIP.has(x.id)?[WORK_REC_TIP[x.r]]:[]); if(!t.length) return "";
  return '<div class="part wktips"><span class="label">Tips for the best shot</span><ul>'+t.map(v=>'<li>'+esc(v)+'</li>').join("")+'</ul></div>'; }
function workDetails(x){
  const W=WORKX[x.id]; if(!W) return "";
  const cam=CAMERAS[state.camera], row=(k,v)=>'<div class="wkrow"><span class="label">'+k+'</span><p>'+v+'</p></div>';
  return '<div class="wk">'+row("Keep sharp",esc(W[0].charAt(0).toUpperCase()+W[0].slice(1))+'.')+row("Distance","About "+esc(mText(W[2]))+(W[2]>=50?', far enough that everything beyond is sharp too':'')+'.')+row("Camera height",esc(W[1])+'.')+
    row("How to focus · "+esc(cam.name),esc(workFocus(x,state.camera))+(cam.setup==="leica"&&cropFor(CAM_FL[state.camera]||35,W[4])?' <button type="button" class="linkbtn" data-learncrop="'+cropFor(CAM_FL[state.camera]||35,W[4])+'">See the '+cropFor(CAM_FL[state.camera]||35,W[4])+' mm frame</button>':''))+row("Press",esc(W[3])+'.')+'</div>'+workTips(x);
}
/* Spots: numbers that match the map, Street View, walking to a spot, and the spots near you. */
const spotNum = id => +String(id).split(":")[1]+1;
const spotShort = S => S[3].split(",")[0];
/* Street View panorama for each spot, checked by eye. kind 0 is Google's own imagery, 1 a visitor's photo sphere (Google's cars
   never reach inside Grand Central, on the sand or onto Little Island). lat/lon is where the camera stood when it is not at the spot;
   the view is then aimed at the spot. A note explains when the picture is not quite the spot. */
const SV_PANO = {"chinatown:0":["Nozhzjl9Q6UV7wUXZwT5YQ",0,null,null],
"chinatown:1":["4Q6oKGiiB256PZ5cVXYAuQ",0,null,null],
"chinatown:2":["-aKPagm39695n5I328OxPw",0,null,null],
"chinatown:3":["VycETDsjWOVm9pnpWnJUWQ",0,40.718901,-73.995995],
"chinatown:4":["v5vR8CCY8nFtcYS__94h1Q",0,null,null],
"gct:0":["CIHM0ogKEICAgID45_a81AE",1,40.75272,-73.977604,"A visitor's photo of the concourse; the balcony is above and behind this view."],
"gct:1":["CIHM0ogKEICAgIC6js-0xAE",1,40.752703,-73.97703],
"gct:2":["CIHM0ogKEICAgIDqxfncvgE",1,40.752354,-73.977049,"The nearest photo is on the main concourse; the gallery is one level down, outside the Oyster Bar."],
"gct:3":["CIHM0ogKEICAgIC6tt2c5QE",1,40.752697,-73.977703],
"gct:4":["CIHM0ogKEICAgID45_a81AE",1,40.75272,-73.977604],
"tsq:0":["-S2sEvwlWsmRFIRD3MZD1A",0,null,null],
"tsq:1":["kSMIAGIHbesu_JB0pChqAA",0,null,null],
"tsq:2":["PQvwZBT5v6TPYq5388-0pQ",0,null,null],
"tsq:3":["LnCxJX-3o2w3FO5_THWxog",0,null,null],
"tsq:4":["2wBMnsvQeKVbYDrrCZuHfA",0,null,null],
"wsp:0":["lo-W8SAE8TzV5B1HtwVFcw",0,null,null],
"wsp:1":["qQ0qjNoa9eWXN-XHEiMxwg",0,null,null],
"wsp:2":["EnH84w2Bhm4vwL7l4Xcw5A",0,null,null],
"wsp:3":["2Pxxh-knIkEUlxO9w9xLNA",0,null,null],
"wsp:4":["KObPWmrk96UgAk5zi0d7Hw",0,null,null],
"wsp:5":["qQ0qjNoa9eWXN-XHEiMxwg",0,null,null],
"dumbo:0":["L4kFiqdPQJnskd6Yli9nrw",0,null,null],
"dumbo:1":["sEuO7KlPtZbLER_UQkIkBQ",0,null,null],
"dumbo:2":["KvYZRyHvemQCSFfq2iJIPw",0,null,null],
"dumbo:3":["f4D4zx7KOyRZ7pCjsgb6Ag",0,null,null],
"dumbo:4":["CiWWcR9cjXzSyDE3wGH-2g",0,null,null],
"coney:0":["d4Qm9scUv4HcyW3EvUZTZA",0,40.571424,-73.984931],
"coney:1":["0g7IURziSHHPlhXakUn4mg",0,null,null],
"coney:2":["yOjN6KBCd6LBPMyVSCuBJQ",0,null,null],
"coney:3":["oVXWx6cOU7QTx4Vbm3c_qw",0,null,null],
"coney:4":["2NLxdKenwFaIqH5F-2V2BQ",0,40.575617,-73.980092],
"soho:0":["7-VLTVFS0syYZue-FLMqmg",0,null,null],
"soho:1":["3bYDMafbFpepO_bRKgjUhw",0,null,null],
"soho:2":["_GM5WhSYBGS3lyCJeqVc2w",0,null,null],
"soho:3":["a4Qp8jN5u3e_UWTckZhs8w",0,null,null],
"soho:4":["5QAXSl4d1PjAAk--Y0tfyQ",0,null,null],
"jh:0":["zUjTeItGe6gxXcJcfoRsiA",0,null,null],
"jh:1":["tqEx_-fpWb6I5zCutDtdYg",0,null,null],
"jh:2":["X9pgFIgJBu4hc4Df_NK-qQ",0,null,null],
"jh:3":["p0ziUl0RyX_3s0wDIY3wKw",0,null,null],
"jh:4":["lmoQjv6-adqThbYrV9IE0Q",0,null,null],
"harlem:0":["MMiUcPhP6IZytsTVC97aOw",0,null,null],
"harlem:1":["DjRICiYo95hEgd7oLPbhFA",0,40.815915,-73.941108],
"harlem:2":["LHLA-XCOl_FZpLS0nTiJlg",0,null,null],
"harlem:3":["iXxoxNVEZCDjj9ZCM6g4FA",0,40.808262,-73.946666],
"harlem:4":["d0p1PPb5WjuPYMZhxZEynQ",0,null,null],
"harlem:5":["IfnBNHpAQEuY1rxLVDtVwA",0,null,null],
"les:0":["_Sh3QpwuMvgL_npFbWDeAw",0,null,null],
"les:1":["sAF-ycS96pNYUWVRLQRg_g",0,null,null,"Shows the street outside; the counters are inside Essex Market."],
"les:2":["rBuZZl8PbnPSq8qOSVPZJQ",0,null,null],
"les:3":["EppMz4afuK6FNP1wKzYvQw",0,null,null],
"les:4":["4HMDh9U2Yq2VwQk7JxAbQg",0,null,null],
"flushing:0":["cS5WtfWZMPCg1t4KtCw2Xw",0,null,null],
"flushing:1":["mam9JwP0KwXmb1gaCkjXxQ",0,40.758864,-73.830145],
"flushing:2":["I9hEw4UwGsXxsn_1RnN1HA",0,null,null,"Shows Main Street outside; the food court is downstairs inside the mall."],
"flushing:3":["Jj6aEZkLBr-Pz2pEqfJISg",0,40.757268,-73.829699],
"flushing:4":["qbCMIM1Vjba2VG5_kwFjMQ",0,null,null],
"wburg:0":["9wF49PHRoVXaZcmgS-wRbA",0,null,null],
"wburg:1":["yaLH5FR1poGitb_WMRhEGw",0,null,null],
"wburg:2":["wdMn8AySmK_bELns59FvVQ",0,null,null],
"wburg:3":["_83MG3R6m-rLsW4_ApCFtw",0,null,null],
"wburg:4":["UFJ2zF9TV6wRZUJB2-u6Yg",0,null,null],
"midtown:0":["ZRsUeJPYbJasIwcip9Tlwg",0,null,null],
"midtown:1":["5sBQEuCOlTFh96dI4Fwmaw",0,40.758663,-73.971671],
"midtown:2":["42ZwuodlrDjLMATpTTJjZQ",0,null,null],
"midtown:3":["D4j1gmhZGMJCMJBuShnVXg",0,null,null],
"midtown:4":["ZmR4nlAuJWGwhJ5gBO1ITQ",0,null,null],
"cpark:0":["4qN5fACdYIApY6Zzclf87g",0,null,null],
"cpark:1":["-_TcbuB50k_0kUiOTYXj9g",0,40.77501,-73.970416],
"cpark:2":["nSTTtsH_k2UVoNkXJPh95w",0,null,null],
"cpark:3":["KmOw8SaKjczvOhfDikUuQg",0,null,null],
"cpark:4":["nENpWsiSphZYitivAWQrgQ",0,null,null],
"cpark:5":["nSTTtsH_k2UVoNkXJPh95w",0,null,null],
"rockaway:0":["hpJhB1vS1oFMvySuJZYeEA",0,null,null],
"rockaway:4":["rStK0cjYPFybUaOYgf8V7Q",0,null,null],
"arthur:0":["1C8pRp30BrgOetn9c1VEmQ",0,null,null],
"arthur:1":["4fn6OVKQgvsnJK87b5snCw",0,null,null,"Shows the corner outside; the counters are inside the Retail Market."],
"arthur:2":["4fn6OVKQgvsnJK87b5snCw",0,null,null,"Shows the corner outside; the cigar bench is at the back of the Retail Market."],
"arthur:3":["ay9nn8FFSzhkJJeA8DB4uw",0,null,null],
"arthur:4":["f9VbBk1HOPWZ2nnTYVvhFw",0,null,null],
"union:0":["kVbFdGXAMqAv_1b20mJxoQ",0,40.736752,-73.991271],
"union:1":["nzG02EV2ibclsG61ODPEXw",0,null,null],
"union:2":["DRIAxsCyXkApa5cIaNld4g",0,null,null],
"union:3":["Lkt1niqtIBNcajIZBnKQaA",0,null,null],
"union:4":["6lWJ5WhDolEGy3F4Uuz6MA",0,null,null],
"union:5":["f6wJB4mQtLv0z4KSlbQLLw",0,null,null],
"fidi:0":["jHsUbKEs3vHp_gohy-CZ5g",0,null,null],
"fidi:1":["HB9Lf1pmsSZIKZYhZAC8jg",0,null,null],
"fidi:2":["CIHM0ogKEICAgICE1ums-QE",1,40.711385,-74.011036],
"fidi:3":["BRqwSebnhyOu4r-zqgO7ow",0,null,null],
"fidi:4":["myBZOjXL7Ys5qyoN0KVeMw",0,null,null],
"ktown:0":["E0T1uNMYCcV1fO2l1wyElQ",0,null,null],
"ktown:1":["IusbvL_M6p3IYQ1q93teHA",0,null,null],
"ktown:2":["yPIeDGd5k7OW37kGqitc8A",0,null,null],
"ktown:3":["DbAx0ajWkPRZT4HzWvqY2A",0,40.750221,-73.988792],
"ktown:4":["ApZVFBv8mx0YyI3G__6fmw",0,null,null],
"bushwick:0":["ryywB1yBGIsLk_zU4gmckQ",0,null,null],
"bushwick:1":["PsiBaE1ox4mQ7q70Uac0Tg",0,null,null],
"bushwick:2":["wx_yYnxzX0ZOCo6GOIoKYQ",0,40.705422,-73.922828],
"bushwick:3":["RsC4cCYWimqYtetVfGqTDg",0,null,null],
"bushwick:4":["bC8B0_MLKfrkGDeEt6geeg",0,40.704725,-73.92236],
"chelsea:0":["O9S_hsHemcrjx9SHCQ0YLw",0,null,null],
"chelsea:1":["CIHM0ogKEICAgIC12vKFxQE",1,40.742606,-74.005761],
"chelsea:3":["YXsorrJjRwE04c_QGBCxUw",0,null,null],
"chelsea:4":["X_xDvvTfymQo7Dqbqebivw",0,40.753572,-74.001751],
"brighton:0":["LGOxR3ThUc8yrNlMwVQLxw",0,null,null],
"brighton:1":["TQ2ej6yfLEMiQDaqMDEBjQ",0,null,null],
"brighton:2":["jEa4QhJxsHlSyKLbTeNIhA",0,null,null],
"brighton:3":["NaVF02LGoyKi0xAi6CBDHg",0,null,null],
"brighton:4":["ryXne1odTzGCRHRsyUjYRQ",0,null,null],
"brighton:5":["GFAfTkZk4MPED64Rzc1i9w",0,null,null],
"dumbo:5":["CIHM0ogKEICAgID-1MC_gwE",1,40.692334,-73.975411],
"cpark:6":["_1L-ZC4dUqpCLy4oqBGhpw",0,40.77221,-73.973534,"The nearest imagery is on the Mall, about 90 m away."],
"rockaway:1":["CIHM0ogKEICAgIDqo8-A0gE",1,40.583558,-73.812771],
"rockaway:2":["CIHM0ogKEICAgIDqo8-A0gE",1,40.583558,-73.812771,"The photo is on the sand about 50 m east of the jetty."],
"rockaway:3":["CIHM0ogKEICAgIDqvYGhSQ",1,40.583708,-73.808209,"The nearest photo is on the jetty just east of the steps."],
"chelsea:2":["CIABIhC7STCT9YCAultfC-SOaMAt",1,40.741597,-74.01,"A visitor's photo from the entrance bridge."]};
const svUrl = (S,id) => { const P=id&&SV_PANO[id], far=P&&P[2]!==null&&kmBetween({lat:P[2],lon:P[3]},{lat:S[0],lon:S[1]})>0.025;
  const h=Math.round(far?bearingTo({lat:P[2],lon:P[3]},{lat:S[0],lon:S[1]}):S[2]);
  if(!P) return 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+S[0].toFixed(6)+','+S[1].toFixed(6)+'&heading='+h+'&pitch=0&fov=80';
  if(P[1]===1) return 'https://www.google.com/maps/@'+P[2].toFixed(6)+','+P[3].toFixed(6)+',3a,80y,'+h+'h,90t/data=!3m6!1e1!3m4!1s'+P[0]+'!2e10!7i5376!8i2688';
  return 'https://www.google.com/maps/@?api=1&map_action=pano&pano='+P[0]+'&viewpoint='+S[0].toFixed(6)+','+S[1].toFixed(6)+'&heading='+h+'&pitch=0&fov=80'; };
const svNote = id => { const P=SV_PANO[id]; return P&&P[4] ? '<p class="hint svnote">Street View: '+esc(P[4])+'</p>' : ''; };
const svLink = (pid,S,id) => pid==="ferry" ? '' : '<a class="chip" href="'+svUrl(S,id)+'" target="_blank" rel="noopener">Street View ↗</a>';
function bearingTo(a,b){ const r=Math.PI/180, y=Math.sin((b.lon-a.lon)*r)*Math.cos(b.lat*r), x=Math.cos(a.lat*r)*Math.sin(b.lat*r)-Math.sin(a.lat*r)*Math.cos(b.lat*r)*Math.cos((b.lon-a.lon)*r); return (Math.atan2(y,x)/r+360)%360; }
const walkMin = km => Math.max(1,Math.round(km*1000*1.25/80));
const mDist = km => km<1 ? Math.max(10,Math.round(km*100)*10)+' m' : (km/1.609).toFixed(1)+' mi';
const arrowSvg = deg => '<svg class="garrow" viewBox="-12 -12 24 24" aria-hidden="true"><g transform="rotate('+Math.round(deg)+')"><path d="M0 -10 L7 7 L0 3 L-7 7 Z"/></g></svg>';

/* Guide me there: follows your position to a spot, then tells you which way to face. The arrow turns with the phone when it has a compass. */
function guideStart(id){
  if(!guideTarget(id)) return; guideStop(true); const g={id, watch:null, fix:false, err:false, acc:null}; state.guide=g;
  headingStart();
  const fail=()=>{ if(state.guide!==g) return; if(!g.fix){ g.err=true; } guideRender(); };
  if(!navigator.geolocation){ g.err=true; guideRender(); return; }
  try{ g.watch=navigator.geolocation.watchPosition(p=>{ if(state.guide!==g) return; state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; g.acc=p.coords.accuracy; g.err=false;
      if(!g.fix){ g.fix=true; guideFit(); } mapDraw(); guideRender(); }, fail, {enableHighAccuracy:true, maximumAge:5000, timeout:20000}); }catch(e){ g.err=true; }
  guideRender(); mapPanel(); }
function guideStop(silent){ const g=state.guide; if(!g) return; try{ if(g.watch!=null) navigator.geolocation.clearWatch(g.watch); }catch(e){}
  state.guide=null; if(!state.mapHead) headingStop(); if(!silent){ guideRender(); mapDraw(); mapPanel(); } }
function eventGeo(id){ const d=EVENT_DOCS[id]; return (d&&typeof d.lat==="number"&&typeof d.lon==="number"&&d.lat>40.4&&d.lat<41&&d.lon>-74.3&&d.lon<-73.6)?[d.lat,d.lon]:EVENT_GEO[id]||null; }
function guideTarget(id){ if(id.startsWith("ev:")){ const e=EVENTS.find(x=>x.id===id.slice(3))||{id:id.slice(3),name:id.slice(3)}, g=eventGeo(id.slice(3)); const V=EVENT_VIEW[e.id]||{}; return g?[g[0],g[1],V.face||29,e.map&&e.map[0]?e.map[0]:e.name,e.spot||""]:null; }
  if(id.startsWith("lm:")){ const L=LANDMARKS[+id.slice(3)]; return L?[L[1],L[2],L[6]||0,L[0],L[5]]:null; } const [pid,i]=id.split(":"); return SPOTS[pid]&&SPOTS[pid][+i]||null; }
function guideInfo(){ const g=state.guide; if(!g||!state.pos) return null; const S=guideTarget(g.id); if(!S) return null;
  const to={lat:S[0],lon:S[1]}, km=kmBetween(state.pos,to); return {S, km, brg:bearingTo(state.pos,to), here:km*1000<=Math.max(20,Math.min(40,g.acc||0))}; }
function guideFit(){ const G=guideInfo(); if(!G) return; const [ax,ay]=mapXY(state.pos.lat,state.pos.lon), [bx,by]=mapXY(G.S[0],G.S[1]);
  if(G.km>6){ mapFly(mapAim({cx:bx,cy:by,w:12})); return; }
  mapFly(mapAim({cx:(ax+bx)/2, cy:(ay+by)/2, w:Math.min(330,Math.max(10,Math.max(Math.abs(ax-bx),Math.abs(ay-by)*MAP_ASPECT)*1.7))})); }
function guideRender(){ const box=$("mapGuide"); if(!box) return; const g=state.guide; if(!g){ box.hidden=true; box.innerHTML=""; return; }
  const S=guideTarget(g.id), G=guideInfo(), stop='<button type="button" class="gstop" data-guidestop="1" aria-label="Stop guiding">×</button>', num=g.id.startsWith("lm:")?'':'<span class="snum">'+spotNum(g.id)+'</span>';
  let h;
  if(g.err&&!G) h='<div class="gtxt"><b>Your location is not available here</b><span>Guide me there works in the installed app on your phone, with location allowed for Shot List.</span></div>';
  else if(!G) h='<div class="gtxt"><b>Finding you…</b><span>Heading to '+esc(S[3])+'</span></div>';
  else if(G.here){ const hd=state.heading, rel=hd===null?S[2]:S[2]-hd, lf=lightFacing(S[2],new Date()), d=hd===null?null:((S[2]-hd)%360+540)%360-180;
    h=arrowSvg(rel)+'<div class="gtxt"><b>'+(d===null?'You are here. Face '+compass(S[2])+'.':Math.abs(d)<=12?'You are here, facing the shot.':'You are here. Turn '+(d>0?'right':'left')+' '+Math.round(Math.abs(d))+'°.')+'</b><span>'+(hd===null?'The arrow points that way on the map, with north up; your phone has not shared a compass.':'Face '+compass(S[2])+'; the arrow points straight up when you do.')+' '+esc(lf.txt)+' now.</span></div>'; }
  else { const hd=state.heading, rel=hd===null?G.brg:G.brg-hd;
    h=arrowSvg(rel)+'<div class="gtxt"><b>'+mDist(G.km)+' · about '+walkMin(G.km)+' min</b><span>Head '+compass(G.brg)+' to '+num+' '+esc(spotShort(S))+(hd===null?' (arrow on map north)':'')+(g.acc>40?'. GPS is rough here, ±'+Math.round(g.acc)+' m':'')+'</span></div>'; }
  box.innerHTML=h+stop; box.hidden=false; box.classList.toggle("here",!!(G&&G.here)); }

/* The phone's compass: which way you are facing. Shared by Guide me there and the heading-up map. iPhones ask once for permission, which has to
   come from a tap. Android gives the absolute heading from the deviceorientationabsolute event; alpha counts anticlockwise, so it is reversed. */
const HEAD = {on:false, fn:null, raf:0, watch:null, why:"", acc:null, last:-1, txt:0, drawn:false};
const inFrame = (()=>{ try{ return window.self!==window.top; }catch(e){ return true; } })();
function headingStart(){ if(HEAD.on) return Promise.resolve(true); const D=window.DeviceOrientationEvent; if(!D){ HEAD.why="none"; return Promise.resolve(false); }
  HEAD.fn=e=>{ let h=null; if(typeof e.webkitCompassHeading==="number"&&!isNaN(e.webkitCompassHeading)){ h=e.webkitCompassHeading; HEAD.acc=typeof e.webkitCompassAccuracy==="number"?e.webkitCompassAccuracy:null; } else if(e.absolute&&typeof e.alpha==="number"){ h=(360-e.alpha)%360; try{ const a=(screen.orientation&&screen.orientation.angle)||window.orientation||0; h=(h+a+360)%360; }catch(x){} }
    if(h!==null) headingSet(h); };
  const listen=()=>{ try{ addEventListener("deviceorientationabsolute",HEAD.fn); addEventListener("deviceorientation",HEAD.fn); }catch(e){ return false; } HEAD.on=true; return true; };
  HEAD.why="";
  try{ if(typeof D.requestPermission==="function") return D.requestPermission().then(r=>{ if(r==="granted") return listen(); HEAD.why="denied"; return false; }).catch(()=>{ HEAD.why=inFrame?"frame":"denied"; return false; }); }catch(e){ HEAD.why=inFrame?"frame":"none"; return Promise.resolve(false); }
  return Promise.resolve(listen()); }
/* What to tell the user when the compass is not turning the map. */
function headMsg(){ const w=HEAD.why;
  if(w==="frame") return "The compass is not available inside Claude. Open Shot List from your home screen (the installed app) to use it.";
  if(w==="denied") return "Motion access was turned off for Shot List, so the map cannot read the compass. On iPhone, close Shot List completely (swipe it away), open it again and tap the compass button; choose Allow when asked. If it no longer asks, go to Settings › Apps › Safari › Advanced › Website Data, remove the site, and try again.";
  if(w==="none") return "This device has no compass the app can read. The map stays north up; Guide me there still gives the direction as a bearing.";
  if(HEAD.on&&state.heading===null) return inFrame?"No compass reading. Inside Claude the compass is usually blocked: open Shot List from your home screen.":"Waiting for the compass. Hold the phone flat in front of you and turn slowly; if nothing happens, close and reopen the app.";
  if(HEAD.acc!==null&&(HEAD.acc<0||HEAD.acc>25)) return "The compass is unsure here (steel, cars and the subway throw it off). Move the phone in a slow figure of eight to calibrate it.";
  return ""; }
function headMsgShow(){ const pnl=$("mapPanel"); if(!pnl) return; let el=pnl.querySelector(".headmsg"); const t=state.mapHead?headMsg():"";
  if(!t){ if(el) el.remove(); return; } if(!el){ pnl.insertAdjacentHTML("afterbegin",'<p class="msg headmsg" role="status"></p>'); el=pnl.querySelector(".headmsg"); } if(el.textContent!==t) el.textContent=t; }
function headingStop(){ if(HEAD.on){ try{ removeEventListener("deviceorientationabsolute",HEAD.fn); removeEventListener("deviceorientation",HEAD.fn); }catch(e){} HEAD.on=false; } state.heading=null; headingApply(); }
function headingSet(h){ const p=state.heading; if(p!==null){ const d=((h-p)%360+540)%360-180; h=(p+d*0.3+360)%360; } state.heading=h;
  if(!HEAD.raf) HEAD.raf=requestAnimationFrame(()=>{ HEAD.raf=0; headingApply(); }); }
/* Move only what the heading changes: the cone at your position, the map's rotation, the north arrow and any "turn left" lines. */
function headingApply(){ if(LF.open) lfHeading(); const h=state.heading, g=$("mapHeadG"), rot=$("mapRot"), nr=$("mapNorth"), now=performance.now();
  // the cone at your position is drawn with the map; the first reading after a draw needs one redraw to add it
  if(h!==null&&!g&&state.pos&&!HEAD.drawn&&$("mapSvg")){ HEAD.drawn=true; mapDraw(); }
  const g2=$("mapHeadG"); if(g2){ if(h===null) g2.remove(); else g2.setAttribute("transform","rotate("+h.toFixed(1)+" "+g2.dataset.x+" "+g2.dataset.y+")"); }
  if(rot&&(h===null||HEAD.last<0||Math.abs(((h-HEAD.last)%360+540)%360-180)>=0.4)){ HEAD.last=h===null?-1:h; rot.style.transform=state.mapHead&&h!==null?"rotate("+(-h).toFixed(1)+"deg)":""; if(nr) nr.style.transform="rotate("+(state.mapHead&&h!==null?-h:0).toFixed(1)+"deg)"; }
  if(nr) nr.hidden=!state.mapHead;
  // words change at most four times a second
  if(now-HEAD.txt>250||h===null){ HEAD.txt=now; document.querySelectorAll(".turnhint").forEach(el=>{ const t=turnText(+el.dataset.face); if(el.innerHTML!==t) el.innerHTML=t; }); if(state.guide) guideRender(); headMsgShow(); } }
const turnText = face => { const hd=state.heading; if(hd===null||isNaN(face)) return ""; const d=((face-hd)%360+540)%360-180, a=Math.abs(d); return ' <b class="turn">'+(a<=12?'You are facing this shot.':'Turn '+(d>0?'right':'left')+' '+Math.round(a)+'° to face it.')+'</b>'; };
/* Heading-up: the map turns so the way you face is up, centred on you, at street zoom. Dragging the map turns it off. */
function headSize(){ const m=$("map"), rot=$("mapRot"); if(!m||!rot||!state.mapHead) return; const W=m.clientWidth, H=m.clientHeight, oy=(topPx()+(H-sheetPx()))/2, R=Math.hypot(W/2,Math.max(oy,H-oy)), side=Math.ceil(2*R+8);
  rot.style.width=rot.style.height=side+"px"; rot.style.left=Math.round(W/2-side/2)+"px"; rot.style.top=Math.round(oy-side/2)+"px"; }
function headUp(on){ on=!!on; if(state.mapHead===on&&!on) return; state.mapHead=on; HEAD.drawn=false; HEAD.last=-1; const m=$("map"), svg=$("mapSvg"), rot=$("mapRot"); if(!m||!svg||!rot) return; const b=m.querySelector("[data-head]"); if(b){ b.setAttribute("aria-pressed",String(on)); b.title=on?"Back to north up":"Turn the map the way I am facing"; }
  m.classList.toggle("headup",on); cancelAnimationFrame(mapAnim);
  if(on){ headSize(); if(posOnMap()){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); mapV=mapClamp({cx:x,cy:y,w:Math.min(mapV.w,24)}); } else if(state.pos) offMapMsg();
    try{ if(HEAD.watch==null&&navigator.geolocation) HEAD.watch=navigator.geolocation.watchPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; if(state.mapHead&&posOnMap()){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); mapV=mapClamp({cx:x,cy:y,w:mapV.w}); mapDraw(); } },()=>{},{enableHighAccuracy:true,maximumAge:3000,timeout:20000}); }catch(e){}
    setTimeout(headMsgShow,3000); }
  else { rot.style.transform=""; rot.style.width=rot.style.height=rot.style.left=rot.style.top=""; try{ if(HEAD.watch!=null){ navigator.geolocation.clearWatch(HEAD.watch); HEAD.watch=null; } }catch(e){} if(!state.guide) headingStop(); const hm=$("mapPanel")&&$("mapPanel").querySelector(".headmsg"); if(hm) hm.remove();
    if(state.pos&&mapV){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); mapV=mapClamp(mapAim({cx:x,cy:y,w:mapV.w})); } }
  mapDraw(); headingApply(); }

/* Spots near you: within about a 20-minute walk, those whose idea suits the light now first. */
function nearSpots(all){ if(!state.pos) return []; const key=lightAt(mapNow()), out=[];
  for(const [pid,list] of Object.entries(SPOTS)) list.forEach((S,i)=>{ const km=kmBetween(state.pos,{lat:S[0],lon:S[1]}); if(km>1.6) return;
    const x=IDEAS.find(y=>y.id===S[5]), fit=!!(x&&x.w.includes(key)); if(!all&&!fit) return; out.push({id:pid+":"+i, S, pid, km, x, fit}); });
  return out.sort((a,b)=>a.km-b.km).slice(0,15); }
function nearPanel(){ const all=!!state.mapNearAll, list=nearSpots(all), key=lightAt(mapNow()), t=mapNow();
  const rows=list.map(o=>{ const lf=lightFacing(o.S[2],t); return '<button type="button" class="row nrow" data-spot="'+o.id+'"><span class="snum '+lf.k+'">'+spotNum(o.id)+'</span><span class="t"><b>'+esc(o.x?o.x.t:o.S[3])+'</b><span>'+esc(spotShort(o.S))+' · '+esc(PLACES[o.pid].name)+'</span><span>'+mDist(o.km)+', '+walkMin(o.km)+' min walk · '+esc(lf.txt.toLowerCase())+(all&&o.fit?' · suits the light':'')+'</span></span><span class="go" aria-hidden="true">›</span></button>'; }).join("");
  let empty='';
  if(!list.length){ let best=null; for(const [pid,l] of Object.entries(SPOTS)) l.forEach((S,i)=>{ const km=kmBetween(state.pos,{lat:S[0],lon:S[1]}); if(!best||km<best.km) best={id:pid+":"+i,S,pid,km}; });
    empty='<p class="msg">'+(all?'No spots within a 20-minute walk.':'No spots within a 20-minute walk suit '+esc((WHEN[key]||key).toLowerCase())+'. Try All spots, or move the time slider.')+'</p>'+
      (best&&!all?'':best?'<button type="button" class="row" data-spot="'+best.id+'"><span class="snum">'+spotNum(best.id)+'</span><span class="t"><b>Nearest: '+esc(best.S[3])+'</b><span>'+esc(PLACES[best.pid].name)+' · '+mDist(best.km)+'</span></span><span class="go" aria-hidden="true">›</span></button>':''); }
  return '<section class="group mapsel"><button type="button" class="mapselx" data-nearclose="1" aria-label="Close">×</button><div class="group-head"><b>Spots near you</b><span class="where">Within about a 20-minute walk, nearest first</span></div>'+
    '<div class="intents nearf"><button type="button" class="chip" data-nearall="0" aria-pressed="'+!all+'">Suit the light now</button><button type="button" class="chip" data-nearall="1" aria-pressed="'+all+'">All spots</button></div>'+rows+empty+'</section>'; }
function showNear(){ state.mapNear=true; state.mapSel=null; state.mapSpot=null; state.mapEv=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; mapPanel(); mapDraw(); if(posOnMap()) mapFly(mapAim({...mapPreset("me"), w:30})); setSheet("half"); }
function needPos(then){ if(state.pos){ then(); return; } const fail=()=>{ $("mapPanel").insertAdjacentHTML("afterbegin",'<p class="msg">Your location is not available here. In the installed app, allow location access for Shot List when asked.</p>'); };
  if(!navigator.geolocation){ fail(); return; }
  try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; fillPlaces(); syncNear(); then(); }, fail, {timeout:10000,maximumAge:120000}); }catch(e){ fail(); } }
function spotFor(x){ const list=SPOTS[x.p]||[], i=list.findIndex(S=>S[5]===x.id); return i<0?null:{id:x.p+":"+i,S:list[i]}; }
function standDial(bearing,t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon), fov=camFov(), R=34, C=40, P=(a,r)=>[(C+Math.sin(a*Math.PI/180)*r).toFixed(1),(C-Math.cos(a*Math.PI/180)*r).toFixed(1)];
  const a0=P(bearing-fov/2,R), a1=P(bearing+fov/2,R), lf=lightFacing(bearing,t);
  let sun=""; if(sp.alt>-0.8){ const [sx,sy]=P(sp.az,R+1); sun='<circle cx="'+sx+'" cy="'+sy+'" r="6" class="sd-sun"/>'; }
  return '<svg class="sdial" viewBox="0 0 80 80" role="img" aria-label="Facing '+compass(bearing)+(sp.alt>-0.8?', sun to the '+compass(sp.az):'')+'"><circle cx="40" cy="40" r="'+R+'" class="sd-ring"/>'+
    '<path d="M40 40 L'+a0.join(" ")+' A'+R+' '+R+' 0 0 1 '+a1.join(" ")+'Z" class="sd-cone '+lf.k+'"/><circle cx="40" cy="40" r="3.5" class="sd-me"/>'+
    '<text x="40" y="12" text-anchor="middle" class="sd-n">N</text>'+sun+'</svg>'; }
function standBlock(x){ const sp=spotFor(x), t=new Date(), pl=PLACES[x.p];
  if(sp){ const S=sp.S, lf=lightFacing(S[2],t), c=CITIES[state.city], sun=sunPos(t,c.lat,c.lon);
    return '<div class="part stand"><span class="label">Where to stand</span><div class="standrow">'+standDial(S[2],t)+'<div class="standtxt"><b><span class="snum">'+spotNum(sp.id)+'</span> '+esc(S[3])+'</b>'+
      '<span>Face '+compass(S[2])+' · <span class="sdk '+lf.k+'">'+lf.txt+' now</span>'+(sun.alt>-0.8?' (sun to the '+compass(sun.az)+')':'')+'</span><p>'+esc(S[4])+'</p></div></div>'+
      '<div class="callinks"><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+S[0].toFixed(5)+','+S[1].toFixed(5)+'&travelmode=walking" target="_blank" rel="noopener">Walk there ↗</a>'+svLink(x.p,S,sp.id)+'<button type="button" class="chip" data-spotmap="'+sp.id+'">See it on the map</button><button type="button" class="chip" data-guidego="'+sp.id+'">Guide me there</button></div>'+svNote(sp.id)+'</div>'; }
  if(typeof pl.lat!=="number") return '';
  const g=START_GEO[x.p], st=START[x.p];
  return '<div class="part stand"><span class="label">Where to stand</span><p>'+esc(x.work.split(/(?<=\.)\s/)[0])+'</p>'+(st?'<p class="hint">Start at '+esc(st[0])+'.</p>':'')+
    '<div class="callinks">'+(g?'<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+g[0]+','+g[1]+'&travelmode=walking" target="_blank" rel="noopener">Walk to the start ↗</a>':'')+'<button type="button" class="chip" data-placemap="'+x.p+'">See it on the map</button></div></div>'; }
function renderCard(){ qCount();
  const x = IDEAS.find(y=>y.id===state.current), card=$("card");
  $("save").disabled=$("done").disabled=!x; $("back").disabled=!state.history.length;
  if(!x){ card.innerHTML='<div class="pane"><h2>No idea fits these filters</h2>'+(qEmptyHtml()||'<p class="plain">Choose Any, or widen the place or the light.</p>')+'</div>';
    $("save").textContent="Save"; $("done").textContent="Shot it"; return; }
  const it=INTENTS[x.i], pl=PLACES[x.p], {cam,rec,su,V:vr}=ideaRec(x,state.camera), co=COMPOSE[x.id], st=STANCE[STANCE_OF[x.id]];
  const ni=nowInfo(), adv=su?adjustFor(x.r,ni,cam.setup==="leica",x.id):[];
  const tabs=[["idea","Idea"],["work","Work it"],["compose","Compose"],["settings","Settings"]];
  let pane;
  if(state.tab==="work"){
    pane='<div class="split"><div class="part"><span class="label">How to work it</span><p>'+esc(x.work)+'</p></div>'+workDemo(x.id)+'</div>'+workDetails(x)+standBlock(x);
  } else if(state.tab==="compose" && co){
    pane='<div class="split"><div class="part"><div><button type="button" class="label tipbtn" data-tip="c" aria-expanded="'+(openTip==="c")+'">'+esc(TECH[co[0]][0])+'</button></div><p>'+esc(co[1])+'</p>'+
      '<p class="tdef"><b>What it means:</b> '+esc(TECH[co[0]][1])+'</p></div>'+composeDemo(co[0],x.id)+'</div>'+photoDemo(co[0],x.id);
  } else if(state.tab==="settings"){
    pane=variantSwitch(x)+'<p class="camline">For your <b>'+esc(cam.name)+'</b> <button type="button" class="linkbtn" data-setopen="1">Change camera</button></p>'+
      (su ? '<div><button type="button" class="vals tipbtn" data-tip="exp" aria-expanded="'+(openTip==="exp")+'">'+esc(rec[0])+'</button></div>' : '<span class="vals">'+esc(rec[0])+'</span>')+
      '<p class="note">'+esc(rec[1])+'</p>'+
      (adv.length ? '<div class="adjust"><span class="label">Adjust for now · '+esc(nowLabel(ni))+'</span><ul>'+adv.map(a=>'<li>'+esc(a)+'</li>').join("")+'</ul></div>' : '')+
      (su ? '<div class="setup">'+SETUP_LABELS.map((l,n)=>{ const [mv,nt]=splitVal(su[n]); return '<button type="button" data-tip="'+n+'" aria-haspopup="dialog" aria-expanded="'+(openTip===String(n))+'"><span class="label">'+l+'</span><span class="sv"><b>'+esc(mv)+'</b>'+(nt?'<small>'+esc(nt)+'</small>':'')+'</span><span class="si" aria-hidden="true">i</span></button>'; }).join("")+'</div>'+
        '<p class="hint">Tap a setting to see what it does and the other options.</p>' : '')+
      (vr?'<div class="vsteps"><span class="label">Focus '+esc(vr.name.toLowerCase())+'</span><ol>'+(state.camera==="iphone"&&vr.stepsIphone?vr.stepsIphone:vr.steps).map(t=>'<li>'+esc(t)+'</li>').join("")+'</ol></div>':'');
  } else {
    pane=shotLogHtml(x)+'<div class="part"><span class="label">Look for</span><p>'+esc(x.look)+'</p></div>'+standBlock(x)+
      (VARIANTS[x.id]?'<p class="hint vhint">'+(vr?'Settings are for <b>'+esc(vr.name.toLowerCase())+'</b>. <button type="button" class="linkbtn" data-variant="0">Back to '+esc(VARIANTS[x.id].base.toLowerCase())+'</button>':'Standing '+esc(VARIANTS[x.id].name.toLowerCase().replace(/^from /,""))+' instead? <button type="button" class="linkbtn" data-variant="1" data-vgo="1">Use those settings</button>')+'</p>':'')+
      '<div class="part"><span class="label">Your rule</span><p>'+esc(x.rule)+'</p></div>'+
      '<div class="part"><span class="label">Best light</span><div class="times">'+x.w.map(w=>'<span class="time">'+WHEN[w]+'</span>').join("")+(x.m?'<span class="time season">'+seasonText(x)+'</span>':'')+(availText(x)?'<span class="time avail">'+esc(availText(x))+'</span>':'')+'</div></div>'+
      '<div class="part"><label class="label" for="note">Your notes</label><textarea id="note" rows="2" placeholder="What worked, what was different, what to try next time">'+esc(state.notes[x.id]||"")+'</textarea></div>'+followIdea(x.i,x.p)+igRow(x)+
      '<div class="jumps">'+
      (st ? '<button type="button" class="jump" data-tab="work"><span><small>Work it</small>'+esc(st[1])+'</span><span class="go" aria-hidden="true">›</span></button>' : '')+
      (co ? '<button type="button" class="jump" data-tab="compose"><span><small>Compose</small>'+esc(TECH[co[0]][0])+'</span><span class="go" aria-hidden="true">›</span></button>' : '')+
      '<button type="button" class="jump" data-tab="settings"><span><small>'+esc(cam.name)+(adv.length?' · adjust for now':'')+'</small><span class="mono">'+esc(rec[0])+'</span></span><span class="go" aria-hidden="true">›</span></button></div>';
  }
  card.innerHTML =
    '<div class="band" style="background:'+it.color+'"></div>'+
    '<div class="sign-head"><div class="sign-top"><span class="intent-tag"><span class="dot" style="background:'+it.color+'"></span>'+esc(it.name)+'</span>'+
    '<span class="where">'+esc(pl.name)+' · '+esc(pl.stop||"")+' '+bullets(pl.lines, pl.city)+'</span></div><h2>'+esc(x.t)+'</h2><p class="why">'+shootWhy(x)+'</p>'+onlyOneHtml(x)+startHtml(x.p)+
    '<div class="cardacts"><button type="button" class="chip" data-stay="1" aria-pressed="'+(state.place===x.p)+'">'+(state.place===x.p?'Staying at '+esc(pl.name)+' ✓':'Stay here')+'</button><button type="button" class="chip" data-street="1">Street mode</button></div></div>'+
    '<div class="tabs" role="tablist">'+tabs.map(t=>'<button type="button" role="tab" data-tab="'+t[0]+'" aria-selected="'+(state.tab===t[0])+'">'+t[1]+'</button>').join("")+'</div>'+
    '<div class="pane">'+pane+'</div>';
  const s=state.saved.has(x.id), d=state.done.has(x.id);
  $("save").setAttribute("aria-pressed",s); $("save").textContent = s?"Saved ✓":"Save";
  const n=shotLog(x.id).length;
  $("done").setAttribute("aria-pressed",d); $("done").textContent = d?"Shot ✓"+(n>1?" "+n+"×":""):"Shot it"; $("done").setAttribute("aria-label",d?"Shot it again: log another time":"Shot it: log it");
}
/* Why this idea came up: the light, whether it is on now, and how far it is. */
function shootWhy(x){ const t=new Date(), key=lightAt(t), sky=skyAt(t), a=AVAIL[x.id], out=[];
  out.push(x.w.includes(key)?'<span class="ok">Suits the light now</span>':'Best in '+x.w.slice(0,2).map(w=>WHEN[w].toLowerCase()).join(" or "));
  if(!ideaOpen(x,t,sky)) out.push('<span class="off">Not on now: '+esc(availText(x))+'</span>');
  else if(a&&a.h){ const hr=t.getHours()+t.getMinutes()/60, on=a.h.find(([s0,e0])=>s0<e0?(hr>=s0&&hr<e0):(hr>=s0||hr<e0)); if(on) out.push('On until '+hourText(on[1])); }
  if(state.pos&&typeof PLACES[x.p].lat==="number"){ const km=kmBetween(state.pos,PLACES[x.p]); out.push(km<=2.4?walkMin(km)+' min walk':milesText(km/1.609)+' away'); }
  const l=lastShot(x.id); if(l&&l.r==="again") out.push('<span class="again">You marked it try again</span>');
  return out.join(' · '); }
/* The shot log: each Shot it records when, and in what light; the last one can be rated keeper or try again. Kept on the device. */
const shotLog = id => state.log[id]||[];
const lastShot = id => { const l=state.log[id]; return l&&l.length?l[l.length-1]:null; };
function saveLog(){ store.set("log",state.log); store.set("done",[...state.done]); }
function logShot(id){ const t=new Date(), i=nowInfo(), l=state.log[id]=state.log[id]||[]; l.push({t:+t,k:lightAt(t),s:i.sky||null}); if(l.length>50) l.shift(); state.done.add(id); state.justShot=id; saveLog(); }
function rateShot(id,r){ const e=lastShot(id); if(!e) return; if(e.r===r) delete e.r; else e.r=r; saveLog(); }
function undoShot(id){ const l=state.log[id]; if(l&&l.length) l.pop(); if(!l||!l.length){ delete state.log[id]; state.done.delete(id); } state.justShot=null; saveLog(); }
const shotWhen = e => { const d=new Date(e.t), today=new Date(); today.setHours(0,0,0,0); const tm=hmText(d.getHours()*60+d.getMinutes());
  return d>=today?'today at '+tm:d>=new Date(+today-864e5)?'yesterday at '+tm:d.toLocaleDateString("en-US",{month:"short",day:"numeric"})+(d.getFullYear()!==today.getFullYear()?', '+d.getFullYear():''); };
const SHOT_LIGHT = {am:"morning light",mid:"midday light",gold:"late afternoon light",night:"after dark",rain:"rain or overcast"};
const shotLight = e => e.s&&SKY_NAME[e.s] ? SKY_NAME[e.s].toLowerCase() : SHOT_LIGHT[e.k]||"";
function shotLogHtml(x){ if(!state.done.has(x.id)) return ""; const l=shotLog(x.id), e=lastShot(x.id), just=state.justShot===x.id;
  const line=!e ? 'Marked as shot.' : just ? 'Logged '+shotWhen(e).replace(/^today at /,'')+(shotLight(e)?', '+shotLight(e):'')+'. How did it go?' :
    'Shot '+(l.length>1?l.length+' times, last ':'')+shotWhen(e)+(shotLight(e)?', '+shotLight(e):'')+'.'+(e.r==="keep"?' A keeper.':e.r==="again"?' Try again.':'');
  return '<div class="shotlog'+(just?' just':'')+'"><p>'+line+'</p>'+(e?'<div class="intents"><button type="button" class="chip" data-rate="keep" aria-pressed="'+(e.r==="keep")+'">Keeper</button><button type="button" class="chip" data-rate="again" aria-pressed="'+(e.r==="again")+'">Try again</button><button type="button" class="chip" data-undoshot="1">Undo'+(l.length>1?' last':'')+'</button></div>':'<div class="intents"><button type="button" class="chip" data-undoshot="1">Unmark</button></div>')+'</div>'; }
/* Street mode: the card for glancing at with the camera in hand. Exposure in large type, how to focus, height and when to press, the rule,
   which way to face (with the compass, how far to turn), Next and Shot it within thumb reach. The screen is kept awake while it is open. */
const FOCUS_SHORT = {"tsq-mood": {"q343": "{m} at 8 m · f/8, sharp from about 3.9 m", "q328": "{m} at 5 m · f/5.6, sharp from about 2.4 m", "other": "{s} on the reflection of the screens, not the wet ground · f/5.6 to f/8"}, "midtown-mood": "{s} on the lit patch · keep the half-press held", "chelsea-odd": "{s}, Spot on the figure in the metal", "rockaway-energy": "{c}, Zone area on the surfer, or {m} at infinity", "gct-energy": "{s} on the still person · keep the half-press held"};
function shortFocus(x,camKey){ const W=WORKX[x.id], cam=CAMERAS[camKey], r=x.r; if(!W||!cam) return "";
  if(camKey==="iphone") return r==="drag"||!["zone","freeze","shallow","detail"].includes(r)?"Tap the subject, hold for AE/AF Lock":r==="shallow"?"Portrait mode, tap the nearest eye":r==="detail"?"Tap the detail; macro switches on by itself":"Tap where they will be, hold the shutter for a burst";
  const leica=cam.setup==="leica", fl=CAM_FL[camKey]||35, N=REC_F[r]||(fl===28?1.7:2), d=W[2], T=leica?{s:"AFs",c:"AFc",m:"MF"}:{s:"Single AF",c:"Continuous AF",m:"Manual focus"};
  const fsh=camPick(FOCUS_SHORT[x.id],camKey); if(fsh) return fsh.replace(/\{s\}/g,T.s).replace(/\{m\}/g,T.m).replace(/\{c\}/g,T.c);
  const glass=STANCE_OF[x.id]==="glass";
  if(r==="zone"){ const [a,b]=dofCalc(fl,N,Math.min(d,200)); return T.m+" at "+mText(d)+(glass?" (glass plus their distance from it)":"")+" · sharp "+mText(a)+" to "+mText(b)+" at f/8"; }
  if(r==="freeze") return T.c+" with face detection · half-press as they enter · short burst";
  if(r==="drag") return T.s+" on the still subject · keep the half-press held";
  if(r==="shallow") return T.s+" with eye detection · box on the nearest eye";
  if(r==="detail") return T.s+", small box"+(leica?" · macro ring under "+(fl===43?"60":"30")+" cm":"");
  if(r==="night") return T.s+" on a lit edge · hold the half-press if it hunts";
  if(r==="silhouette") return T.s+" on the outline against the light";
  return T.s+" on "+(W[0].length>40?"the subject":W[0]); }
let WAKE=null;
async function wakeOn(){ try{ if(state.street&&navigator.wakeLock&&!document.hidden&&!WAKE){ WAKE=await navigator.wakeLock.request("screen"); WAKE.addEventListener("release",()=>{ WAKE=null; }); } }catch(e){ WAKE=null; } }
function wakeOff(){ try{ if(WAKE) WAKE.release(); }catch(e){} WAKE=null; }
document.addEventListener("visibilitychange",()=>{ if(!document.hidden&&state.street) wakeOn(); });
function streetOpen(){ if(!state.current) return; state.street=true; const el=$("street"); el.hidden=false; document.body.classList.add("streetmode"); renderStreet(); wakeOn(); headingStart();
  try{ if(!state.pos&&navigator.permissions) navigator.permissions.query({name:"geolocation"}).then(r=>{ if(r.state==="granted"&&state.street) navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; if(state.street) renderStreet(); },()=>{},{timeout:10000,maximumAge:60000}); }).catch(()=>{}); }catch(e){}
  const c=el.querySelector("[data-st=next]"); if(c) c.focus(); }
function streetClose(quiet){ if(!state.street) return; state.street=false; $("street").hidden=true; $("street").innerHTML=""; document.body.classList.remove("streetmode"); wakeOff(); if(!state.mapHead&&!state.guide) headingStop(); if(!quiet){ render(); const s=document.querySelector('#card [data-street]'); if(s) s.focus(); } }
function renderStreet(){ const el=$("street"); if(!el||!state.street) return; const x=IDEAS.find(y=>y.id===state.current); if(!x){ streetClose(); return; }
  const it=INTENTS[x.i], pl=PLACES[x.p], {cam,rec,su,V:vr}=ideaRec(x,state.camera), ni=nowInfo(), adv=su?adjustFor(x.r,ni,cam.setup==="leica",x.id):[], W=WORKX[x.id], sp=spotFor(x), t=new Date();
  const row=(k,v)=>v?'<div class="strow"><span class="stk">'+k+'</span><span class="stv">'+v+'</span></div>':'';
  let face=""; if(sp){ const S=sp.S, lf=lightFacing(S[2],t), km=state.pos?kmBetween(state.pos,{lat:S[0],lon:S[1]}):null;
    face='<b>'+esc(spotShort(S))+'</b> · face '+compass(S[2])+' · <span class="sdk '+lf.k+'">'+lf.txt+' now</span>'+(km!==null?' · '+(km*1000<40?'you are here':mDist(km)+' away'):'')+'<span class="turnhint" data-face="'+S[2]+'">'+turnText(S[2])+'</span>'; }
  const d=state.done.has(x.id), n=shotLog(x.id).length;
  el.innerHTML='<div class="st-in"><div class="st-top"><span class="intent-tag"><span class="dot" style="background:'+it.color+'"></span>'+esc(it.name)+'</span><span class="st-where">'+esc(pl.name)+'</span>'+
      '<button type="button" class="chip st-stay" data-st="stay" aria-pressed="'+(state.place===x.p)+'">'+(state.place===x.p?'Staying ✓':'Stay here')+'</button><button type="button" class="st-x" data-st="close" aria-label="Leave street mode">×</button></div>'+
    (state.drillRun?'<div class="st-drill">'+drillLine()+'</div>':'')+'<h2>'+esc(x.t)+'</h2><p class="why">'+shootWhy(x)+'</p>'+onlyOneHtml(x)+
    '<div class="st-exp"><span class="stk">'+esc(cam.name)+'</span><b>'+esc(rec[0])+'</b>'+(adv.length?'<span class="st-adj">Now: '+esc(adv[0])+'</span>':'')+'</div>'+
    row("Focus",vr?esc(state.camera==="iphone"?"Tap and hold for AE/AF Lock, in a gap in the crowd":vr.short)+' · about '+esc(mText(vr.dist)):esc(shortFocus(x,state.camera))+(W?' · about '+esc(mText(W[2])):''))+(vr?row("Where",esc(vr.name)):"")+
    row("Height",W?esc(W[1]):"")+row("Press",W?esc(W[3]):"")+row("Rule",esc(x.rule))+row("Stand",face)+
    (d?'<div class="st-log">'+shotLogHtml(x)+'</div>':'')+
    '</div><div class="st-bar"><button type="button" class="btn" data-st="back" aria-label="Previous idea"'+(state.history.length?'':' disabled')+'>‹</button><button type="button" class="btn primary" data-st="next">Next idea</button><button type="button" class="btn" data-st="shot" aria-pressed="'+d+'">'+(d?'Shot ✓'+(n>1?' '+n+'×':''):'Shot it')+'</button></div>'; }
$("street").addEventListener("click",e=>{ const wd=e.target.closest("[data-widen]"); if(wd){ widen(wd.dataset.widen); return; } const b=e.target.closest("[data-st],[data-rate],[data-undoshot]"); if(!b) return; const x=state.current, k=b.dataset.st;
  if(k==="close"){ streetClose(); return; } if(k==="next"){ goNext(); return; } if(k==="back"){ goBack(); return; }
  if(k==="shot"&&x){ logShot(x); render(); return; } if(k==="stay"&&x){ toggleStay(IDEAS.find(y=>y.id===x).p); return; }
  if(b.dataset.rate&&x){ rateShot(x,b.dataset.rate); state.justShot=null; renderStreet(); renderCard(); return; }
  if(b.dataset.undoshot!==undefined&&x){ undoShot(x); render(); } });
document.addEventListener("keydown",e=>{ if(!state.street) return; if(e.key==="Escape") streetClose(); else if(e.key==="ArrowRight") goNext(); else if(e.key==="ArrowLeft") goBack(); });
function widen(k){ if(k==="intent"){ state.intent="all"; store.set("intent",state.intent); syncChips(); }
  else if(k==="place"){ state.place="all"; state.stayPrev=null; store.set("place",state.place); const sel=$("place"); if(sel) sel.value="all"; }
  else if(k==="when"){ state.when="all"; store.set("when",state.when); const sel=$("when"); if(sel) sel.value="all"; }
  state.onlyOne=false; goNext(); }
/* Stay here: lock Another idea to the place on the card, and back to the previous choice when tapped again. */
function toggleStay(pid){ if(state.place===pid){ state.place=state.stayPrev&&state.stayPrev!==pid?state.stayPrev:"all"; state.stayPrev=null; } else { state.stayPrev=state.place; state.place=pid; }
  store.set("place",state.place); const sel=$("place"); if(sel){ sel.value=state.place; if(sel.value!==state.place) sel.value="all"; } render(); }
/* Swipe a card: left for another idea, right for the one before. Taps, vertical scrolling and the controls inside are left alone. */
function swipeable(el,left,right){ let st=null;
  el.addEventListener("pointerdown",e=>{ st=null; if(e.pointerType==="mouse") return; if(e.target.closest("textarea,select,input,.setup,.intents,svg,.tipbtn")) return; st={x:e.clientX,y:e.clientY,t:Date.now()}; });
  el.addEventListener("pointerup",e=>{ if(!st) return; const dx=e.clientX-st.x, dy=e.clientY-st.y, dt=Date.now()-st.t; st=null; if(Math.abs(dx)>64&&Math.abs(dx)>Math.abs(dy)*1.8&&dt<800){ (dx<0?left:right)(); } });
  el.addEventListener("pointercancel",()=>{ st=null; }); }
function renderList(){ qCount();
  const again=state.view==="again", saved=state.view==="saved"||again, box=$("list"), m=again?matches(false).filter(x=>(lastShot(x.id)||{}).r==="again"):matches(state.view==="saved");
  const nAgain=cityIdeas().filter(x=>(lastShot(x.id)||{}).r==="again").length, nSaved0=cityIdeas().filter(x=>state.saved.has(x.id)).length;
  const sw='<div class="intents savedswitch"><button type="button" class="chip" data-listv="browse" aria-pressed="'+!saved+'">All ideas</button><button type="button" class="chip" data-listv="saved" aria-pressed="'+(state.view==="saved")+'">Saved ('+nSaved0+')</button>'+(nAgain||again?'<button type="button" class="chip" data-listv="again" aria-pressed="'+again+'">Try again ('+nAgain+')</button>':'')+'</div>';
  if(!m.length&&!again&&!saved&&(state.q||state.onNow)){ box.innerHTML=sw+'<div class="empty">'+qEmptyHtml()+'</div>'; return; }
  if(!m.length){ box.innerHTML=sw+'<p class="empty">'+(again?"Nothing marked try again here. After Shot it, tap Try again on the card to bring an idea back when the light suits it.":saved?"Nothing saved here yet. Tap Save on an idea in Shoot to keep it in this list.":"No ideas fit these filters. Choose Any, or widen the place or the light.")+'</p>'; return; }
  const noted=cityIdeas().filter(x=>state.notes[x.id]);
  const nSaved=cityIdeas().filter(x=>state.saved.has(x.id)).length;
  let sort=ISORT[state.sort]?state.sort:"place"; if(sort==="near"&&!state.pos) sort="place";
  const sortSel='<label class="isort"><span>Sort</span><select id="isort">'+Object.entries(ISORT).filter(([k])=>k!=="near"||state.pos).map(([k,v])=>'<option value="'+k+'"'+(k===sort?' selected':'')+'>'+v+'</option>').join("")+'</select></label>';
  const head = sw+'<div class="notesbar"><span class="msg">'+m.length+' idea'+(m.length===1?'':'s')+(sort==="place"&&state.pos?', nearest first':'')+'</span>'+sortSel+
    (noted.length?'<button type="button" class="chip" id="copyNotes">Copy my notes ('+noted.length+')</button>':'')+'</div>';
  const t0=new Date(), key0=lightAt(t0), sky0=skyAt(t0);
  const rowHtml=(x,flat)=>{ const pl=PLACES[x.p], last=lastShot(x.id), open=ideaOpen(x,t0,sky0), fit=x.w.includes(key0), snip=qSnippet(x), mi=milesTo(pl);
    const status=flat?(fit&&open?'<span class="ok">Suits the light now</span>':!open?'<span class="off">Not on now</span>':'Best: '+esc(x.w.slice(0,2).map(w=>WHEN[w].toLowerCase()).join(" or "))):'';
    return '<button type="button" class="row'+(state.done.has(x.id)?" done":"")+'" data-id="'+x.id+'">'+
      '<span class="dot" style="background:'+INTENTS[x.i].color+'"></span>'+
      '<span class="t"><b>'+qMarkTitle(x)+'</b><span>'+(flat?esc(pl.name)+(mi!==null?' · '+milesText(mi):'')+' · '+status+(sort==="recent"&&last?' · shot '+esc(agoText(last.t)):''):esc(INTENTS[x.i].name)+(COMPOSE[x.id]?' · '+esc(TECH[COMPOSE[x.id][0]][0]):''))+'</span>'+(snip?'<span class="qsnip">'+snip+'</span>':'')+'</span>'+
      '<span class="marks">'+(state.saved.has(x.id)?'<span class="pill">Saved</span>':'')+(state.done.has(x.id)?'<span class="pill">'+((last||{}).r==="keep"?'Keeper':(last||{}).r==="again"?'Try again':'Shot')+'</span>':'')+(state.notes[x.id]?'<span class="pill">Note</span>':'')+'</span>'+
      '<span class="go" aria-hidden="true">›</span></button>'; };
  if(sort!=="place"){ const R=m.map(x=>({x,n:nowRank(x,t0,key0,sky0),d:milesTo(PLACES[x.p]),l:lastShot(x.id)}));
    if(sort==="now") R.sort((a,b)=>a.n-b.n);
    if(sort==="near") R.sort((a,b)=>(a.d===null?1e9:a.d)-(b.d===null?1e9:b.d)||a.n-b.n);
    if(sort==="fresh") R.sort((a,b)=>(state.done.has(a.x.id)?1:0)-(state.done.has(b.x.id)?1:0)||a.n-b.n);
    if(sort==="recent") R.sort((a,b)=>(b.l?b.l.t:0)-(a.l?a.l.t:0)||a.n-b.n);
    box.innerHTML=head+(sort==="recent"&&!R.some(r=>r.l)?'<p class="msg">Nothing shot yet: these are in order of how well they fit now.</p>':'')+'<section class="group flat">'+R.map(r=>rowHtml(r.x,true)).join("")+'</section>'+(saved?"":followAll()); return; }
  box.innerHTML = head+
  (state.pos||state.place!=="all"?"":'<div class="intents areajump">'+Object.keys(AREAS).filter(a=>placeOrder().some(pid=>areaOf(pid)===a&&m.some(x=>x.p===pid))).map(a=>'<a class="chip" href="#area-'+a+'">'+AREAS[a]+'</a>').join("")+'</div>')+
  placeOrder().map((pid,n,arr)=>{ const p=PLACES[pid];
    const rows=m.filter(x=>x.p===pid); if(!rows.length) return "";
    const first=!state.pos && !arr.slice(0,n).some(q=>areaOf(q)===areaOf(pid)&&m.some(x=>x.p===q));
    return (first?'<h3 class="label areahead" id="area-'+areaOf(pid)+'">'+AREAS[areaOf(pid)]+'</h3>':'')+'<section class="group"><div class="group-head"><b>'+esc(p.name)+(milesTo(p)!==null?'<span class="dist">'+milesText(milesTo(p))+'</span>':'')+'</b>'+whereHtml(PLACES[pid])+startLink(pid)+'</div>'+rows.map(x=>rowHtml(x,false)).join("")+'</section>';
  }).join("")+(saved?"":followAll());
}
/* Accounts to follow for inspiration. Links only: the photos belong to the photographers, so the app sends you to them.
   [name, link, what to look for, intents it helps with ("" = general)] */
const IG = h => "https://www.instagram.com/"+h+"/";
/* Photographers to follow, checked October 2026: each mainly photographs New York streets and people, and each handle was confirmed on the
   photographer's own site, a gallery or a published interview. [name, link, what to look for, intents ("daily" for daily life, "" for feeds),
   places in this app they are known for]. Links only: the photos belong to the photographers. */
const FOLLOW = [
 ["Daniel Arnold",IG("arnold_daniel"),"Fast, funny, unposed Manhattan crowds, mostly in colour.","moment odd","midtown union soho"],
 ["Jeff Mermelstein",IG("jeffmermelstein"),"Absurd details at close range; his #nyc series photographs strangers' phone screens on the pavement.","odd moment","midtown ktown"],
 ["Melissa O'Shaughnessy",IG("melissaoshaughnessy"),"Layered colour crowds on Fifth Avenue and Midtown pavements.","energy place","midtown ktown"],
 ["Joel Meyerowitz",IG("joel_meyerowitz"),"A pioneer of colour street photography; his 1960s and 70s Fifth Avenue work is the reference for crowds in light.","place energy","midtown gct"],
 ["Andre D. Wagner",IG("photodre"),"Black-and-white Brooklyn and subway life. Watch the hands and gestures.","moment mood","subway wburg bushwick"],
 ["Gus Powell",IG("dirtywhitebucks"),"Lyrical colour from Manhattan lunch hours and street corners; books The Company of Strangers and The Lonely Ones.","moment mood","midtown fidi"],
 ["Matt Weber",IG("matt.weber.photos"),"A former cab driver photographing the city since the 1970s, including decades of the subway.","energy moment","subway tsq"],
 ["Jamel Shabazz",IG("jamelshabazz"),"Warm street portraits of Brooklyn and New York style since the 1980s.","moment","harlem bushwick"],
 ["Phil Penman",IG("philpenman"),"Classic black-and-white Manhattan in snow, steam and rain, shot on Leica.","mood place","midtown fidi gct"],
 ["Nina Welch-Kling",IG("ninakling"),"Hard light, deep shadow and paired pictures; she holds a compact camera low.","odd mood","soho midtown"],
 ["Jonathan Higbee",IG("aliveisthecity"),"His Coincidences series lines passers-by up with billboards and murals.","odd place","tsq midtown"],
 ["Mathias Wasik",IG("mathiaswasik"),"Colourful, well-timed humour on crowded pavements: commuters, dogs, basketball.","odd energy","wburg union"],
 ["Paulie B",IG("paulie.b"),"A daily New York project on film since 2015: commuters, fairs, the ordinary day.","moment energy","subway coney"],
 ["Bruce Gilden",IG("bruce_gilden"),"In-your-face flash close-ups, made famous on Fifth Avenue.","energy","midtown"],
 ["Aaron Berger",IG("aaronbergerfoto"),"Colour film from Manhattan pavements: small dramas between strangers.","moment energy","midtown les"],
 ["Ruddy Roye",IG("ruddyroye"),"Brooklyn street portraits with long captions about the people in them.","moment","bushwick"],
 ["Ruben Natal-San Miguel",IG("rubennatalsanmiguel"),"Colour street and portraits of Harlem and El Barrio: people, storefronts, murals.","place moment","harlem"],
 ["Martha Cooper",IG("marthacoopergram"),"Street culture in colour since the 1970s: children at play, graffiti, breakdancing.","energy odd","bushwick les"],
 ["Meryl Meisler",IG("merylmeisler"),"Black-and-white 1970s and 80s New York, from disco nights to Bushwick blocks.","mood","bushwick"],
 ["Boogie",IG("boogiephotographer"),"Raw black-and-white Brooklyn street and its margins.","mood energy","wburg bushwick"],
 ["Dina Litovsky",IG("dina_litovsky"),"New York social life and leisure in colour and flash.","energy","chelsea brighton"],
 ["Lanna Apisukh",IG("apisukh"),"Neighbourhood life in Chinatown and Queens: shopkeepers, elders, skaters.","daily","chinatown jh flushing"],
 ["An Rong Xu",IG("anrizzy"),"Chinatown and Chinese American daily life, warm and cinematic.","daily","chinatown flushing"],
 ["Humans of New York",IG("humansofny"),"Street portraits of strangers, each with their own story in the caption.","daily",""],
 ["NYC Street Photography Collective",IG("nycspc"),"Work by local members, plus their shows, walks and zine.","",""],
 ["Walkie Talkie by Paulie B (YouTube)","https://www.youtube.com/@PaulieB","He walks New York with a different street photographer each episode while they shoot.","",""]
];
/* Instagram hashtag links: the place (or a narrower tag for one idea) and a street-photography tag for the intent. */
const IG_PLACE = {"chinatown":"chinatownnyc","gct":"grandcentralterminal","tsq":"timessquare","wsp":"washingtonsquarepark","dumbo":"dumbobrooklyn","coney":"coneyisland","soho":"sohonyc","jh":"jacksonheights","ferry":"statenislandferry","harlem":"harlemnyc","les":"lowereastside","flushing":"flushingqueens","wburg":"williamsburgbrooklyn","midtown":"midtownmanhattan","cpark":"centralpark","rockaway":"rockaways","arthur":"arthuravenue","union":"unionsquarenyc","fidi":"financialdistrictnyc","ktown":"koreatownnyc","bushwick":"bushwickbrooklyn","chelsea":"highlinenyc","brighton":"brightonbeachbrooklyn","subway":"nycsubway"}, IG_IDEA = {"chinatown-place":"doyersstreet","chinatown-moment":"mottstreet","coney-place":"wonderwheel","coney-moment":"coneyislandcyclone","dumbo-place":"manhattanbridge","dumbo-mood":"brooklynbridgepark","les-place":"orchardstreet","les-moment":"essexmarket","flushing-moment":"newworldmall","wburg-place":"dominopark","wburg-moment":"mccarrenpark","wburg-mood":"williamsburgbridge","midtown-moment":"paleypark","midtown-odd":"halalguys","cpark-place":"bethesdaterrace","cpark-moment":"bowbridge","cpark-odd":"bethesdaterrace","harlem-place":"apollotheater","harlem-mood":"harlembrownstones","union-place":"unionsquaregreenmarket","fidi-place":"federalhall","fidi-moment":"stonestreet","fidi-energy":"oculus","fidi-odd":"chargingbull","ktown-moment":"heraldsquare","ktown-energy":"heraldsquare","ktown-odd":"empirestatebuilding","bushwick-place":"bushwickcollective","bushwick-moment":"bushwickcollective","bushwick-odd":"bushwickcollective","chelsea-moment":"chelseagalleries","chelsea-energy":"chelseamarket","chelsea-mood":"littleisland","chelsea-odd":"vesselnyc"}, IG_INTENT = {"place":"streetsofnewyork","moment":"nycstreetphotography","energy":"nycstreets","mood":"streetphotographynyc","odd":"streetphotographynyc"};
const IG_SEASON = {"soho-halloween":["villagehalloweenparade","nychalloween"],"wburg-marathon":["nycmarathon","williamsburg"],"cpark-balloons":["ballooninflation","macysparade"],
  "midtown-parade":["macysparade","thanksgivingdayparade"],"midtown-windows":["holidaywindows","fifthavenue"],"midtown-rink":["bryantpark","winterinthecity"],
  "union-market":["unionsquareholidaymarket","holidaymarket"],"wsp-snow":["washingtonsquarepark","nycsnow"],"chinatown-lunar":["lunarnewyear","chinatownnyc"]};
const igTags = x => IG_SEASON[x.id] ? IG_SEASON[x.id] : [IG_IDEA[x.id.replace(/-s$/,"")]&&!x.m?IG_IDEA[x.id]:IG_PLACE[x.p], x.m?"nycfoliage":IG_INTENT[x.i]].filter(Boolean);
const igRow = x => { const t=igTags(x); return t.length ? '<div class="part"><span class="label">See it on Instagram</span><div class="callinks">'+t.map(h=>'<a class="chip" href="https://www.instagram.com/explore/tags/'+h+'/" target="_blank" rel="noopener">#'+h+' ↗</a>').join("")+'</div><p class="hint igh">Hashtags show everyone\u2019s posts, so expect tourists alongside street work.</p></div>' : ""; };
// For an idea: photographers known for this place and intent first, then the place, then the intent
const followFor = (i,pid) => { const has=(f,k,v)=>(f[k]||"").split(" ").includes(v), sc=f=>(pid&&has(f,4,pid)?2:0)+(has(f,3,i)?1:0)+(pid&&has(f,4,pid)&&f[3]==="daily"?0.5:0);
  return FOLLOW.map((f,n)=>({f,n,s:sc(f)})).filter(o=>o.s>0&&o.f[3]).sort((a,b)=>b.s-a.s||a.n-b.n).map(o=>o.f); };
const followLink = f => '<a class="chip" href="'+esc(f[1])+'" target="_blank" rel="noopener">'+esc(f[0])+' ↗</a>';
const followIdea = (i,pid) => { const l=followFor(i,pid).slice(0,3); return l.length ? '<div class="part"><span class="label">See how others do it</span><div class="callinks">'+l.map(followLink).join("")+'</div></div>' : ""; };
const followItem = f => '<li><a href="'+esc(f[1])+'" target="_blank" rel="noopener"><b>'+esc(f[0])+' ↗</b></a><span>'+esc(f[2])+'</span>'+
    (f[3]&&f[3]!=="daily"?'<span class="tags">'+f[3].split(" ").map(i=>'<span class="tag"><span class="dot" style="background:'+INTENTS[i].color+'"></span>'+INTENTS[i].name+'</span>').join("")+'</span>':'')+'</li>';
const followGroup = (title,list) => '<h3 class="label followhead">'+title+'</h3><ul class="follow">'+list.map(followItem).join("")+'</ul>';
const followAll = () => '<details class="syncbox followbox"><summary>Photographers to follow</summary><div class="syncbody"><p class="hint">New York street photographers, checked October 2026. These open Instagram or YouTube; the photos stay with the photographers.</p>'+
  followGroup("Street photography",FOLLOW.filter(f=>f[3]&&f[3]!=="daily"))+followGroup("Daily life",FOLLOW.filter(f=>f[3]==="daily"))+followGroup("Feeds and video",FOLLOW.filter(f=>!f[3]))+'</div></details>';
/* Live event updates. A weekly scheduled task writes confirmed dates and newly found events to the
   artifact database (collection "events"); the page merges them over the built-in pattern dates.
   Doc id = built-in event id to confirm it, or a new slug to add an event. "_status" holds the last check. */
let EVENT_DOCS = {};
let PRICE_DOCS = {}, PRICE_TARGETS = {}, PRICE_DB = null, PRICE_FILE = false;   // camera prices, see learnPrices
const eParse = s => { const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||"")); return m?new Date(+m[1],+m[2]-1,+m[3]):null; };
function eventRows(today){
  const rows=[], builtin=new Set(EVENTS.map(e=>e.id));
  for(const e of EVENTS){ if(e.city!==state.city) continue;
    const d=EVENT_DOCS[e.id], s=d&&eParse(d.start), en=d&&(eParse(d.end)||s);
    if(s && en>=today) rows.push({e:Object.assign({},e,{time:d.time||e.time,where:d.where||e.where,note:d.note||e.note,approx:false,map:docMap(d,e.map)}),o:[s,eParse(d.end)||undefined],confirmed:true,source:d.source,cancelled:!!d.cancelled});
    else rows.push({e,o:eventNext(e,today)});
  }
  for(const [id,d] of Object.entries(EVENT_DOCS)){
    if(id.charAt(0)==="_"||builtin.has(id)||!d||(d.city||"nyc")!==state.city||!d.name) continue;
    const s=eParse(d.start), en=eParse(d.end)||s; if(!s||en<today) continue;
    const ideas=(Array.isArray(d.ideas)?d.ideas:[]).filter(i=>i&&INTENTS[i.intent]&&SETUP[i.recipe]).map(i=>[i.intent,i.title||"",i.text||"",i.recipe]);
    rows.push({e:{id,city:state.city,type:eventTypeFor(d),map:docMap(d,d.where?["area",String(d.where).slice(0,160)+", "+CITIES[state.city].name]:null),name:d.name,time:d.time||"",where:d.where||"",why:d.why||"",spot:d.spot||"",note:d.note,ideas},o:[s,eParse(d.end)||undefined],confirmed:true,added:true,source:d.source,cancelled:!!d.cancelled});
  }
  rows.push(...fixtureRows(today));
  return rows.sort((a,b)=>(a.o?a.o[0]:Infinity)-(b.o?b.o[0]:Infinity));
}
// Save an event to a calendar. Events are all-day entries because start times are given as text and can change.
const calYmd = d => d.getFullYear()+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0");
function calInfo(e,o){
  const end=new Date((o[1]||o[0]).getFullYear(),(o[1]||o[0]).getMonth(),(o[1]||o[0]).getDate()+1);   // calendar end dates are exclusive
  const loc=e.map ? e.map[1] : (e.where ? e.where+", "+CITIES[e.city].name : CITIES[e.city].name);
  const lines=[]; if(e.time) lines.push("Time: "+e.time); if(e.where) lines.push("Where: "+e.where); if(e.spot) lines.push((PHOTO_TYPES.has(e.type)?"Good to know: ":"Where to be: ")+e.spot);
  if(e.ideas&&e.ideas.length) lines.push("Shots to look for: "+e.ideas.map(i=>i[1]).join("; "));
  lines.push("From Shot List. Dates, times and routes can change, so confirm before you go.");
  return {title:e.name+(PHOTO_TYPES.has(e.type)?"":" (street photography)"),start:calYmd(o[0]),end:calYmd(end),loc,desc:lines.join("\n")};
}
function calLinks(e,o){ if(!o) return "";
  const c=calInfo(e,o), esc2=t=>String(t).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
  const g="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(c.title)+"&dates="+c.start+"/"+c.end+"&details="+encodeURIComponent(c.desc)+"&location="+encodeURIComponent(c.loc);
  const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Shot List//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT","UID:"+e.id+"-"+c.start+"@shotlist",
    "DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d+/,""),"DTSTART;VALUE=DATE:"+c.start,"DTEND;VALUE=DATE:"+c.end,"SUMMARY:"+esc2(c.title),"LOCATION:"+esc2(c.loc),"DESCRIPTION:"+esc2(c.desc),
    "BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+esc2(e.name+" is tomorrow"),"TRIGGER:-PT15H","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
  return '<div class="part"><span class="label">Save to your calendar</span><div class="callinks">'+
    '<a class="chip" href="'+esc(g)+'" target="_blank" rel="noopener">Google Calendar ↗</a>'+
    (PHOTOS_INLINE ? '<a class="chip" href="data:text/calendar;charset=utf-8,'+encodeURIComponent(ics)+'">Apple Calendar</a>' : '')+'</div></div>';
}
// Where you are, for Near me now: a fresh fix each time it is switched on or the Events tab opens with it on
/* Music series are listed by season. Their show nights come from the weekly check ("dates" on the event's document, from the
   official schedule) or a fixed weekday pattern ("days"); with neither, the app does not claim a show is on. */
const evSeason = r => r.e.type==="music" && r.o && r.o[1] && (r.o[1]-r.o[0])>3*864e5;
function evShows(r){ const d=EVENT_DOCS[r.e.id]; if(d&&Array.isArray(d.dates)&&d.dates.length) return {dates:new Set(d.dates.filter(x=>typeof x==="string"))};
  const days=(d&&Array.isArray(d.days)&&d.days)||r.e.days; return Array.isArray(days)&&days.length?{days}:null; }
const ymdOf = d => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
function evShowOn(r,day){ const S=evShows(r); if(!S) return null; if(day<evDay(r.o[0])||(r.o[1]&&day>evDay(r.o[1]))) return false; return S.dates?S.dates.has(ymdOf(day)):S.days.includes(day.getDay()); }
function evNextShow(r,today,days){ if(!evShows(r)) return null; for(let i=0;i<=days;i++){ const d=new Date(today.getFullYear(),today.getMonth(),today.getDate()+i); if(evShowOn(r,d)) return d; } return null; }
// What to call an event that has already started: a show tonight, the next show, a season, a condition in season, or simply on now
function evOngoingLabel(r,today){ if(evSeason(r)){ const sh=evShows(r); if(!sh) return "Season on, check tonight";
    const n=evNextShow(r,today,30); return !n?"No shows listed":+n===+today?"Show tonight":"Next show "+n.toLocaleDateString("en-US",{weekday:"short"})+(n-today>6*864e5?" "+n.getDate():""); }
  if(r.e.type==="light"&&r.o[1]&&(r.o[1]-r.o[0])>3*864e5) return "In season"; return "On now"; }
function evLocate(){ state.evPosErr=false; if(!navigator.geolocation){ state.evPosErr=true; return; }
  try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; if(state.view==="events") renderEvents(); },()=>{ if(!state.pos){ state.evPosErr=true; if(state.view==="events") renderEvents(); } },{timeout:10000,maximumAge:60000}); }catch(e){ state.evPosErr=true; } }
function renderEvents(){
  const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate()), cam=CAMERAS[state.camera], box=$("events");
  const fmt=(d,o)=>d.toLocaleDateString("en-US",o), dm={weekday:"short",month:"short",day:"numeric"};
  const wk7=new Date(today.getFullYear(),today.getMonth(),today.getDate()+7), wk42=new Date(today.getFullYear(),today.getMonth(),today.getDate()+42);
  const grpOf = r => !r.o?3 : r.o[0]<=today?0 : r.o[0]<wk7?1 : r.o[0]<wk42?2 : 3, GRP=["On now","This week","Next few weeks","Later"];
  const all=eventRows(today), kinds=Object.keys(EVENT_TYPES).filter(k=>all.some(r=>r.e.type===k));
  if(state.evType!=="all" && !kinds.includes(state.evType)) state.evType="all";
  const Q=state.evQuick||(state.evQuick=new Set()), lim30=new Date(today.getFullYear(),today.getMonth(),today.getDate()+30);
  const quick=r=>(!Q.has("soon")||(r.o&&r.o[0]<=lim30))&&(!Q.has("confirmed")||r.confirmed)&&(!Q.has("photo")||PHOTO_TYPES.has(r.e.type));
  let list=(state.evType==="all"?all:all.filter(r=>r.e.type===state.evType)).filter(quick);
  const chips='<div class="intents evquick"><button type="button" class="chip evnearbtn" data-evnear="1" aria-pressed="'+!!state.evNear+'">◎ Near me now</button>'+[["soon","Next 30 days"],["confirmed","Confirmed"],["photo","Photo events"]].filter(([k])=>!(state.evNear&&k==="soon")).map(([k,l])=>'<button type="button" class="chip" data-q="'+k+'" aria-pressed="'+Q.has(k)+'">'+l+'</button>').join("")+'</div>'+
    '<div class="intents" id="evTypes"><button type="button" class="chip" data-t="all" aria-pressed="'+(state.evType==="all")+'">All types</button>'+
    kinds.map(k=>'<button type="button" class="chip" data-t="'+k+'" aria-pressed="'+(state.evType===k)+'">'+EVENT_TYPES[k]+' · '+all.filter(r=>r.e.type===k).length+'</button>').join("")+'</div>';
  // Near me now: events within 1 or 2 miles, on today or in the next 7 days, nearest first
  const R=state.evRadius===2?2:1, NEAR=!!state.evNear, wk=new Date(today.getFullYear(),today.getMonth(),today.getDate()+7), nm=now.getHours()*60+now.getMinutes(), evMi={}, evWhen={};
  const nearCtl=NEAR?'<div class="evnear"><span>Within</span>'+[1,2].map(m=>'<button type="button" class="chip" data-evr="'+m+'" aria-pressed="'+(R===m)+'">'+m+' mile'+(m>1?'s':'')+'</button>').join("")+'<span class="msg">'+(state.pos?'of you · on today and the next 7 days':'')+'</span></div>':'';
  if(NEAR){
    if(!state.pos){ box.innerHTML='<p class="lead">Events worth shooting near you.</p>'+chips+nearCtl+'<p class="empty">'+(state.evPosErr?'Your location is not available. Allow location access for Shot List, then tap Near me now again.':'Finding where you are…')+'</p>'; return; }
    list=list.filter(r=>r.o&&!r.cancelled&&r.o[0]<wk&&(r.o[1]||r.o[0])>=today).map(r=>{ const g=r.e.geo||eventGeo(r.e.id); if(!g) return null; const mi=kmBetween(state.pos,{lat:g[0],lon:g[1]})/1.609; if(mi>R) return null;
        const onDay=r.o[0]<=today, w=onDay?evWindow(r.e,today):null, game=r.game&&evDay(r.game.at)<=today;
        let k, lab;
        if(onDay&&evSeason(r)){   // a music season: only a show night counts as today
          const sh=evShows(r), tn=sh&&evShowOn(r,today), nx=sh&&evNextShow(r,today,7);
          if(tn&&!(w&&nm>w[1])){ k=0; lab=w&&nm<w[0]?'Show tonight, from '+hmText(w[0]):'Show on now'; }
          else if(nx&&+nx!==+today){ k=1; lab='Next show '+nx.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}); }
          else if(!sh){ k=1; lab='Season on, check tonight'; } else return null; }
        else if(game||onDay){ if(w&&nm>w[1]) return null; k=0; lab=w&&nm<w[0]?'Later today, from '+hmText(w[0]):evOngoingLabel(r,today); if(game&&!w) lab='Today'; } else { k=1; lab=eventSoon(r.o,today); }
        evMi[r.e.id]=mi; evWhen[r.e.id]=[k,lab]; return r; }).filter(Boolean)
      .sort((a,b)=>(evWhen[a.e.id][0]-evWhen[b.e.id][0])||(evMi[a.e.id]-evMi[b.e.id])); }
  const seenVenue=new Set(), shown=list.filter(r=>{ if(!r.game) return true; if(seenVenue.has(r.e.id)) return false; seenVenue.add(r.e.id); return true; });
  if(!shown.length){ box.innerHTML=NEAR?'<p class="lead">Events worth shooting near you.</p>'+chips+nearCtl+'<p class="empty">Nothing within '+R+' mile'+(R>1?'s':'')+' of you today or in the next 7 days'+(R===1?'. Try 2 miles.':'.')+'</p><button type="button" class="chip" data-ideasnear="1">See shot ideas near you ›</button>'
      :(all.length?'<p class="lead">Events worth shooting, soonest first.</p>'+chips+'<p class="empty">Nothing matches these filters.</p>':'<p class="empty">No events listed for this city yet.</p>'); return; }
  const st=EVENT_DOCS._status, chk=st&&eParse(st.checked);
  let lastK=-1;
  box.innerHTML=(NEAR?'<p class="lead">Events worth shooting near you, nearest first. Distances are straight-line from where you are; walking takes a little longer.</p>'
      :'<p class="lead">Events worth shooting, plus photo walks, shows and camera events for photographers, soonest first. '+
    (chk?'Dates were last checked on '+fmt(chk,{month:"short",day:"numeric"})+' and the list is rechecked every week. ':'')+
    'Events marked Confirmed were matched to a published listing. The rest follow each event\'s usual pattern, so confirm before you go.</p>')+chips+nearCtl+shown.map((r,n)=>{
    const head=NEAR?(evWhen[r.e.id][0]!==lastK?(lastK=evWhen[r.e.id][0],'<p class="evgroup">'+(lastK===0?'On today':'Coming up nearby')+'</p>'):'')
      :(grpOf(r)!==lastK?(lastK=grpOf(r),'<p class="evgroup">'+GRP[lastK]+'</p>'):'');
    const e=r.e, o=r.o, yr=o?o[0].getFullYear():today.getFullYear(), other=o&&yr!==today.getFullYear(), games=r.game?list.filter(x=>x.game&&x.e.id===e.id):[];
    const full=o ? fmt(o[0],dm)+(o[1]?" to "+fmt(o[1],dm):"")+(other?", "+yr:"") : "Date not announced";
    const soon=r.cancelled?"Cancelled":NEAR&&evWhen[e.id]?evWhen[e.id][1]:(o?(o[0]<=today?evOngoingLabel(r,today):eventSoon(o,today)):"");
    const mi=NEAR?evMi[e.id]:null, dist=mi!=null?'<span class="evdist">'+(mi<0.1?'Right here':milesText(mi)+' · about '+Math.max(1,Math.round(mi*1.25*20))+' min walk')+'</span>':'';
    const q="https://www.google.com/search?q="+encodeURIComponent(e.name+" "+CITIES[e.city].name+" "+yr+" date route");
    const src=typeof r.source==="string" && /^https:\/\//.test(r.source) ? r.source : null;
    return head+'<details class="event" data-id="'+esc(e.id)+'"><summary>'+
      '<span class="cal">'+(o?'<small>'+fmt(o[0],{month:"short"})+'</small><b>'+o[0].getDate()+'</b>':'<small>TBA</small><b>·</b>')+'</span>'+
      '<span class="t">'+(EVENT_TYPES[e.type]?'<span class="etag'+(PHOTO_TYPES.has(e.type)?" ph":"")+'">'+EVENT_TYPES[e.type]+'</span>':'')+'<b>'+esc(e.name)+'</b>'+dist+'<span>'+esc(r.game?'Next: '+r.game.title+', '+o[0].toLocaleDateString("en-US",{weekday:"short"})+' '+hmText(r.game.at.getHours()*60+r.game.at.getMinutes()):e.where)+'</span></span>'+
      '<span class="soon'+(/now|Today|today|Tomorrow|days|Cancelled/.test(soon)?" near":"")+'">'+soon+'</span></summary>'+
      '<div class="event-body"><p class="when">'+full+(e.approx?" (expected)":"")+
        (r.confirmed?' <span class="pill">Confirmed</span>':'')+(r.added?' <span class="pill">New</span>':'')+
        '<span>'+esc(e.time)+(e.approx?". This date is announced each year and may differ.":"")+(e.note?" "+esc(e.note):"")+'</span></p>'+
      (e.why?'<p>'+esc(e.why)+'</p>':'')+
      (games.length?'<div class="part"><span class="label">Home games from the league schedule</span><ul class="games">'+games.map(g=>'<li><b>'+g.game.at.toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})+'</b> '+hmText(g.game.at.getHours()*60+g.game.at.getMinutes())+' · '+esc(g.game.title)+'</li>').join("")+'</ul>'+(EVENT_DOCS._fixtures&&EVENT_DOCS._fixtures.checked?'<p class="msg">Schedule checked '+esc(EVENT_DOCS._fixtures.checked)+'; times can move for television.</p>':'')+'</div>':'')+
      (e.spot?'<div class="part"><span class="label">'+(PHOTO_TYPES.has(e.type)?"Good to know":"Where to be")+'</span><p>'+esc(e.spot)+'</p></div>':'')+
      (o&&!PHOTO_TYPES.has(e.type)?'<div class="part evlight"><span class="label">The light during the event</span>'+eventLight(e,evDay(o[0])).map(x=>'<p>'+esc(x)+'</p>').join("")+'</div>':'')+
      (EVENT_VIEW[e.id]&&EVENT_VIEW[e.id].arrive?'<div class="part"><span class="label">Getting there and when</span><p>'+esc(EVENT_VIEW[e.id].arrive)+'</p></div>':'')+
      (o&&(EVENT_GEO[e.id]||(EVENT_DOCS[e.id]&&typeof EVENT_DOCS[e.id].lat==="number"))&&!r.cancelled?'<div class="callinks"><button type="button" class="chip primary" data-planev="'+esc(e.id)+'">Plan this outing</button><button type="button" class="chip" data-mapev="'+esc(e.id)+'">Viewing spot on the map</button></div>':'')+
      (e.map?'<a class="check" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(e.map[1])+'" target="_blank" rel="noopener">'+(e.map[0]===""?(PHOTO_TYPES.has(e.type)?"Open the venue in Google Maps":"Open the viewing spot in Google Maps"):e.map[0]==="area"?"Open the area in Google Maps":(PHOTO_TYPES.has(e.type)?"Venue: ":"Viewing spot: ")+esc(e.map[0]))+' ↗</a>':'')+
      (e.ideas.length?'<div class="part"><span class="label">Shots to look for</span><ul class="eideas">'+e.ideas.map(i=>
        '<li><span class="tag"><span class="dot" style="background:'+INTENTS[i[0]].color+'"></span>'+INTENTS[i[0]].name+'</span><b>'+esc(i[1])+'</b><span>'+esc(i[2])+'</span><span class="set">'+esc(cam.recipes[i[3]][0])+'</span></li>').join("")+'</ul></div>':'')+
      calLinks(e,o)+(src?'<a class="check" href="'+esc(src)+'" target="_blank" rel="noopener">Source for this date ↗</a>':'<a class="check" href="'+q+'" target="_blank" rel="noopener">Check this year\'s date and route ↗</a>')+'</div></details>';
  }).join("");
  if(state.evOpen){ if(box.querySelector('details.event[data-id="'+CSS.escape(state.evOpen)+'"]')) evSheetOpen(state.evOpen,true); else state.evOpen=null; }
}
// An event opens in a sheet over the list; it lives inside #events so the buttons in it keep working
function evSheetOpen(id,quiet){ const box=$("events"), d=box.querySelector('details.event[data-id="'+CSS.escape(id)+'"]'); if(!d) return; evSheetClose(true);
  state.evOpen=id; const sm=d.querySelector("summary"), body=d.querySelector(".event-body");
  box.insertAdjacentHTML("beforeend",'<div class="sheet evsheet" id="evSheet"><div class="sh-back" data-esclose="1"></div><div class="sh-panel" role="dialog" aria-modal="true" aria-label="'+esc(d.querySelector(".t b").textContent)+'">'+
    '<header class="sh-head es-head event">'+sm.innerHTML+'<button type="button" class="sh-x" data-esclose="1" aria-label="Close">×</button></header><div class="sh-body"><div class="event-body es-b">'+body.innerHTML+'</div></div></div></div>');
  const el=$("evSheet"); document.body.classList.add("sheetopen"); if(quiet) el.classList.add("on"); else requestAnimationFrame(()=>{ el.classList.add("on"); el.querySelector(".sh-x").focus({preventScroll:true}); }); }
function evSheetClose(silent){ const el=document.getElementById("evSheet"); if(!el) return; el.remove(); if(!silent){ state.evOpen=null; document.body.classList.remove("sheetopen"); const d=document.querySelector('#events details.event[data-id="'+CSS.escape(state.evLast||"")+'"] summary'); if(d) d.focus({preventScroll:true}); } }
function showEvent(id){ state.view="events"; state.evNear=false; render(); evSheetOpen(id); }
/*@LIVE@*/
// Plan an outing: a few stops ordered as a walk, with ideas that suit the light at each stop's time.
function phaseAt(t){ const c=CITIES[state.city]; if(typeof c.lat!=="number") return "mid"; const [rise,set]=sunTimes(t,c.lat,c.lon), m=6e4;
  return (t<rise-30*m||t>+set+30*m) ? "night" : t>set-120*m ? "gold" : t<+rise+180*m ? "am" : "mid"; }
/* Hourly forecast (installed app only): rain and heavy cloud by hour, used by the map slider, the pins and Plan. */
/* Which forecast to read. Light here sets this while it draws: the city's forecast near the city, the forecast for where you are
   further out (installed app), or none when there is no forecast for that place. */
let WX_KEY=null;
function wxKeyFor(pos){ if(!pos||kmBetween(pos,CITIES[state.city])<30) return null; const w=WEATHER.here;
  if(w&&w.lat!=null&&kmBetween(pos,w)<15&&Date.now()-new Date(w.updated)<3*36e5) return "here";
  if(typeof loadWeatherAt==="function") loadWeatherAt(pos); return "none"; }
function withWx(pos,fn){ const was=WX_KEY; WX_KEY=wxKeyFor(pos); try{ return fn(); } finally{ WX_KEY=was; } }
function hourlyAt(t){ const w=WEATHER[WX_KEY||state.city], h=w&&w.hourly; if(!h||!h.time) return null;
  const key=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")+"T"+String(t.getHours()).padStart(2,"0")+":00", i=h.time.indexOf(key);
  return i<0?null:{pop:h.pop?h.pop[i]:null, mm:h.mm?h.mm[i]:null, cc:h.cc?h.cc[i]:null, code:h.code?h.code[i]:null, temp:h.t?h.t[i]:null}; }
function skyAt(t){ const f=hourlyAt(t); if(!f) return undefined; const c=f.code;
  if((c>=51&&c<=67)||(c>=80&&c<=82)||(c>=95)||(f.pop>=60&&f.mm>=0.2)) return "rain";
  if((c>=71&&c<=77)||c===85||c===86) return "snow";
  if(c===45||c===48) return "fog";
  if(f.cc>=85) return "cloud";
  return null; }
function lightAt(t){ const ph=phaseAt(t); if(ph==="night") return "night";
  if(state.cond==="auto"){ const s=skyAt(t); if(s!==undefined) return s ? "rain" : ph; }
  const i=nowInfo();
  return (Math.abs(t-Date.now())<3*36e5 && /rain|cloud|fog|snow|storm/.test(i.sky||"")) ? "rain" : ph; }
const WX_WORD = {rain:"Rain likely", snow:"Snow", fog:"Fog", cloud:"Overcast"};
const wxWet = k => k==="rain"||k==="snow";
function wxHours(){ const d=mapDay(), out=[]; for(let h=0;h<24;h++){ const t=new Date(+d+h*36e5); out.push({h,s:skyAt(t),f:hourlyAt(t)}); } return out; }
function wxRuns(){ const runs=[]; let cur=null; for(const x of wxHours()){ const s=x.s; if(s&&s!=="cloud"){ if(cur&&cur.k===s&&cur.e===x.h) cur.e=x.h+1; else { cur={k:s,s:x.h,e:x.h+1}; runs.push(cur); } } else cur=null; } return runs; }
/* What changes next, within 12 hours of the map's time: "rain from 6 pm", "rain until 9 pm". */
function wxNext(t){ const now=skyAt(t); if(now===undefined) return ""; const base=new Date(t); base.setMinutes(0,0,0);
  for(let k=1;k<=12;k++){ const tt=new Date(+base+k*36e5), s=skyAt(tt); if(s===undefined) return ""; const m=tt.getHours()*60;
    if(wxWet(now)&&!wxWet(s)) return WX_WORD[now].split(" ")[0].toLowerCase()+" until "+hmText(m); if(!wxWet(now)&&wxWet(s)) return (s==="snow"?"snow":"rain")+" from "+hmText(m); } return ""; }
function wxBar(){ const w=WEATHER[state.city];
  if((!w||!w.hourly)&&$("wxStrip")) $("wxStrip").innerHTML="";
  if(!w||!w.hourly) return '<p class="wxsum">'+(typeof loadWeather==="function" ? "The hourly rain and cloud forecast appears here once the app is online." : "The hourly rain and cloud forecast shows here in the installed app on your phone. This version only knows today\u2019s overall weather.")+'</p>';
  const hrs=wxHours(), runs=wxRuns(), hf=h=>((h%12)||12)+(h<12||h===24?" am":" pm");
  const bars=hrs.map(x=>{ if(x.s===undefined) return '<i class="none"></i>'; const k=x.s==="rain"||x.s==="snow"?x.s:x.s==="cloud"||x.s==="fog"?"cloud":"clear", pop=x.f&&x.f.pop!=null?x.f.pop:0;
    return '<i class="'+k+'" style="height:'+(k==="rain"||k==="snow"?Math.max(45,Math.min(100,pop)):k==="cloud"?60:35)+'%" title="'+hf(x.h)+(x.f&&x.f.pop!=null?', '+x.f.pop+'% rain':'')+'"></i>'; }).join("");
  const drops=runs.filter(r=>wxWet(r.k)).map(r=>'<b class="wxdrop '+r.k+'" style="left:'+((r.s+r.e)/48*100).toFixed(1)+'%"></b>').join("");
  const txt=runs.length?runs.map(r=>WX_WORD[r.k]+" "+hf(r.s)+" to "+hf(r.e)).join(" · "):hrs.every(x=>x.s===undefined)?"No hourly forecast yet for "+mapDayName().toLowerCase():"No rain expected "+(state.mapD?"on "+mapDayName():"today");
  if($("wxStrip")) $("wxStrip").innerHTML='<div class="wxbar wxhr" aria-hidden="true">'+bars+drops+'</div><div class="wxhrs" aria-hidden="true"><span style="left:25%">6 am</span><span style="left:50%">noon</span><span style="left:75%">6 pm</span></div>';
  return '<div class="wxlegend"><span><i class="wxk sun"></i>Clear or some cloud</span><span><i class="wxk cloud"></i>Overcast</span><span><i class="wxk rain"></i>Rain, taller when more likely</span></div><p class="wxsum">'+txt+'. The map shows rain, snow and overcast skies for the hour you pick. Forecast by Open-Meteo.</p>'; }
/* The sky over the map for the hour picked: rain streaks, snow, or a grey veil when it is overcast. */
function wxSvg(x0,y0,wb,h,u){ const s=skyAt(mapNow()); if(!s) return ""; const f=n=>n.toFixed(3), box='x="'+f(x0)+'" y="'+f(y0)+'" width="'+f(wb)+'" height="'+f(h)+'"';
  if(s==="rain") return '<defs><pattern id="rainP" patternUnits="userSpaceOnUse" width="'+f(10*u)+'" height="'+f(18*u)+'" patternTransform="rotate(14)"><path d="M'+f(2*u)+' 0v'+f(7*u)+'M'+f(7*u)+' '+f(9*u)+'v'+f(7*u)+'" stroke-width="'+f(1*u)+'" class="m-rainl"/></pattern></defs><rect '+box+' class="m-wx rain"/><rect '+box+' fill="url(#rainP)" class="m-rainr"/>';
  if(s==="snow") return '<defs><pattern id="snowP" patternUnits="userSpaceOnUse" width="'+f(14*u)+'" height="'+f(14*u)+'"><circle cx="'+f(3*u)+'" cy="'+f(4*u)+'" r="'+f(1.3*u)+'" class="m-snowd"/><circle cx="'+f(10*u)+'" cy="'+f(11*u)+'" r="'+f(1*u)+'" class="m-snowd"/></pattern></defs><rect '+box+' class="m-wx snow"/><rect '+box+' fill="url(#snowP)" class="m-rainr"/>';
  return '<rect '+box+' class="m-wx '+s+'"/>'; }
/* Inside the five boroughs? The map's land shape (MAPD_LAND) is the city, from NYC Planning's shoreline; MAPD_CTX is the land around it
   (New Jersey, Westchester, Nassau). On the water, the nearest land decides, so a pier or a ferry counts as the city. */
let NYC_HIT=null; const NYC_MEMO=new Map();
function inNYC(pos){ if(!pos||state.city!=="nyc") return false; if(typeof MAPD_LAND==="undefined"||kmBetween(pos,CITIES.nyc)>60) return false;
  const key=pos.lat.toFixed(4)+","+pos.lon.toFixed(4); if(NYC_MEMO.has(key)) return NYC_MEMO.get(key);
  let r=false;
  try{ if(!NYC_HIT){ const c=document.createElement("canvas").getContext("2d"); NYC_HIT={c,L:new Path2D(MAPD_LAND),X:new Path2D(MAPD_CTX)}; }
    const H=NYC_HIT, at=(la,lo)=>{ const [x,y]=mapXY(la,lo); return H.c.isPointInPath(H.L,x*10,y*10)?1:H.c.isPointInPath(H.X,x*10,y*10)?-1:0; };
    const h=at(pos.lat,pos.lon), kx=111320*Math.cos(pos.lat*Math.PI/180);
    if(h) r=h>0; else for(const d of [150,400,900]){ let v=0; for(let i=0;i<12;i++){ const a=i*Math.PI/6; v+=at(pos.lat+Math.cos(a)*d/110540,pos.lon+Math.sin(a)*d/kx); } if(v){ r=v>0; break; } }
  }catch(e){ r=kmBetween(pos,CITIES.nyc)<12; }
  if(NYC_MEMO.size>500) NYC_MEMO.clear(); NYC_MEMO.set(key,r); return r; }
function kmBetween(a,b){ const r=Math.PI/180, h=Math.sin((a.lat-b.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((a.lon-b.lon)*r/2)**2; return 6371*2*Math.asin(Math.sqrt(h)); }
function makePlan(){
  const withPos=Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number"); if(!withPos.length) return null;
  let cur=$("pStart").value; if(cur==="near"||!PLACES[cur]) cur=state.pos?placeOrder()[0]:withPos[0];
  const now=new Date(), hv=$("pTime").value, dayOff=+($("pDay")&&$("pDay").value||0); let t=new Date(now), notes=[];
  if(hv!=="now"){ t=new Date(now.getFullYear(),now.getMonth(),now.getDate()+dayOff,+hv); if(t<now) t=new Date(+t+864e5); }
  else if(dayOff>0){ t=new Date(now.getFullYear(),now.getMonth(),now.getDate()+dayOff,now.getHours(),now.getMinutes()); }
  // a start before first light moves to the start of blue hour
  const c=CITIES[state.city], dawn=sunAlt(t,c.lat,c.lon,-6); if(dawn&&dawn[0]&&t<dawn[0]&&t.getHours()>=3&&t.getHours()<9){ t=new Date(Math.ceil(+dawn[0]/3e5)*3e5); notes.push("Moved the start to "+hmText(t.getHours()*60+t.getMinutes())+", when the light begins."); }
  const start=new Date(t), end=new Date(+t+(+$("pLen").value)*6e4), stops=[], seen=new Set(), skipped=new Set();
  const horizon=Math.abs(t-now)<40*36e5, skyFor=tt=>horizon?skyAt(tt):undefined;
  const openHere=(id,tt)=>cityIdeas().filter(x=>x.p===id&&ideaOpen(x,tt,skyFor(tt)));
  while(t<end && stops.length<5){
    const key=lightAt(t), sky=skyFor(t), all=cityIdeas().filter(x=>x.p===cur), here=all.filter(x=>ideaOpen(x,t,sky));
    all.forEach(x=>{ const a=AVAIL[x.id]; if(!here.includes(x)&&a&&!a.ev&&!a.span&&a.wx!=="snow") skipped.add(x.id); });   // one-day and seasonal ideas are not worth a note
    const base=here.length?here:all;
    if(!here.length&&all.length) notes.push("Nothing at "+PLACES[cur].name+" is on at "+hmText(t.getHours()*60+t.getMinutes())+" on a "+DAY_NAMES[t.getDay()]+", so these ideas are out of their hours.");
    // ideas that suit the light first, not yet shot first, then luck
    const pool=base.map(x=>({x,r:Math.random()+(x.w.includes(key)?0:3)+(state.done.has(x.id)?1.5:0)+(AVAIL[x.id]&&AVAIL[x.id].wx==="dull"&&!/rain|cloud|fog|snow|storm/.test(sky||"")?1:0)})).sort((a,b)=>a.r-b.r).map(o=>o.x);
    const dur=n=>Math.max(1,n)*25;
    // the next place: close by, with ideas that suit the light when you would get there
    const cand=withPos.filter(id=>id!==cur&&!seen.has(id)).map(id=>{ const km=kmBetween(PLACES[cur],PLACES[id]), walk=Math.round(km*1.3/0.08), mins=walk<=30?Math.max(3,walk):Math.round(15+km*3);
      const arrive=new Date(+t+dur(2)*6e4+mins*6e4), fit=openHere(id,arrive).filter(x=>x.w.includes(lightAt(arrive))&&!state.done.has(x.id)).length;
      return {id,km,mins,walk,fit,score:fit*8-mins}; }).filter(o=>o.mins<=35).sort((a,b)=>b.score-a.score||a.mins-b.mins);
    const next=cand[0], left=(end-t)/6e4, canMove=!!next && left>=50+next.mins+20;   // isolated place or little time: stay and shoot more here
    const want=canMove?2:Math.min(4,Math.max(1,Math.floor(left/25)));
    const picks=[]; for(const x of pool){ if(picks.length<want && !picks.some(p=>p.i===x.i)) picks.push(x); }
    for(const x of pool){ if(picks.length<want && !picks.includes(x)) picks.push(x); }
    const stop={place:cur,at:new Date(t),key,ideas:picks}; stops.push(stop); seen.add(cur);
    t=new Date(+t+dur(picks.length)*6e4);
    if(!canMove) break;
    stop.leg={to:next.id,mins:next.mins,mode:next.walk<=30?"walk":"by subway"}; t=new Date(+t+next.mins*6e4); cur=next.id;
  }
  return {start,end:t,stops,notes,skipped:[...skipped].filter(id=>stops.some(s=>s.place===id.split("-")[0]))};
}
// "Before you leave": what to carry and set for this plan, from its places, times and the current weather.
const PLACE_NOTES = {"chinatown": "Buy something before photographing at a stall. In Columbus Park, keep to the spectators unless a player agrees.", "gct": "Handheld only. Tripods, lights and stabilizers need a permit.", "tsq": "Costumed characters expect a tip if they pose for you. Candid frames from a distance are a different matter.", "wsp": "Musicians and chess players often expect a tip. Carry a few small bills.", "dumbo": "The Washington Street view fills with people by mid-morning. Before 8 am it is clear.", "coney": "Most rides and food stands run from spring to October. Out of season, the empty boardwalk is the subject.", "soho": "Most shops open around 11 am. Before that the streets are empty, which suits the facades.", "jh": "Buy from a cart before you photograph it.", "ferry": "The ferry is free and the crossing takes about 25 minutes each way. You have to get off at Staten Island and board again.", "harlem": "Outside churches, stay on the public pavement and do not photograph inside.", "les": "Essex Market closes in the evening and earlier on Sunday, so do the counters first.", "flushing": "In the food court, order first and shoot from your seat.", "wburg": "McCarren Park games are busiest on weekend afternoons.", "midtown": "Paley Park is open 8 am to 8 pm and closed on national holidays. The lunch crowd peaks between noon and 2 pm on weekdays.", "cpark": "Bethesda Fountain is fenced off for restoration until about summer 2027. The arcade and terrace are open.", "rockaway": "Take the A to Broad Channel and change to the shuttle. Allow an hour or more from Midtown.", "arthur": "It is about a 16-minute walk from Fordham Rd station. The Retail Market is open daily until 8 pm.", "subway": "No flash, tripods or lights."};
Object.assign(PLACE_NOTES, {"union": "The greenmarket runs Monday, Wednesday, Friday and Saturday. Ask before photographing a stallholder close up; buying something helps. Chess players expect a nod first and a dollar if you stay.", "fidi": "The Federal Hall steps are public but patrolled; stay off the barriers around the Exchange. The Oculus allows handheld photography but not tripods. Stone Street tables are only out in warm weather.", "ktown": "32nd Street is busiest after 10 pm on Friday and Saturday. Shoot restaurant windows from the pavement; inside, ask first.", "bushwick": "The murals are on private walls and are repainted often, so a wall you saw last year may be gone. Artists at work will take a question better than a camera.", "chelsea": "The High Line allows handheld photography only; no tripods or monopods. Gallery openings are usually Thursday evenings, 6 to 8 pm, and free. Little Island closes at night; check the hours.", "brighton": "Many residents dislike being photographed; keep your distance on the boardwalk and respect a wave-off. Window shots from outside a shop are generally fine."});
function planPrep(p){
  const i=nowInfo(), c=CITIES[state.city], leica=CAMERAS[state.camera].setup==="leica", soon=Math.abs(p.start-Date.now())<6*36e5;
  const tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase(), W=[], L=[], P=[], T=[];
  const fc=hourlyAt(p.start), fsky=fc?(skyAt(p.start)||(fc.cc>=50?"partly":"sun")):undefined, fromFc=fsky!==undefined;
  const sky=fromFc?fsky:(soon?i.sky:null), dull=/rain|cloud|fog|snow|storm/.test(sky||"");
  const names=list=>[...new Set(list.map(o=>PLACES[o.s.place].name))].map(esc).join(" and ");
  // Weather
  if(fromFc) W.push("Forecast for "+tf(p.start)+": "+(WX_WORD[fsky]||(fsky==="partly"?"Sun and cloud":"Clear"))+(fc.pop!=null?", "+fc.pop+"% chance of rain":"")+".");
  if(!soon&&!fromFc) W.push("This plan starts more than six hours from now, so the current reading may not hold. Check the conditions panel before you leave.");
  else if(!sky) W.push("No weather reading is loaded. Check the conditions panel, or set the conditions by hand, before you leave.");
  else{
    const tc=i.w&&typeof i.w.temp_c==="number"?i.w.temp_c:null, f=tc===null?null:Math.round(tc*9/5+32), pc=i.w&&typeof i.w.precip_chance_today==="number"?i.w.precip_chance_today:null;
    if(sky==="rain"||sky==="storm"){ W.push("It is raining: lens hood on, a cloth in your pocket, and a bag or coat you can shoot from under."+(leica?" The Q3 is sealed against light rain, not a downpour.":""));
      if(sky==="storm") W.push("Thunderstorms are about, so favour the stops with cover."); }
    else if(sky==="snow") W.push("Snow: add about +1 EV, keep the hood on, and wear gloves you can work the dials in.");
    else if(sky==="fog") W.push("Fog: add +0.7 EV and expect autofocus to hunt. Take a cloth for condensation on the lens.");
    else if(sky==="cloud") W.push("Overcast: nothing extra to carry. Expect to work one stop wider and at ISO 400 to 1600.");
    else W.push((sky==="partly"?"Sun and cloud":"Clear")+": nothing extra to carry."+(leica?" Set the shutter type to Hybrid if you plan to shoot wide open.":""));
    if(pc!==null && pc>=50 && sky!=="rain" && sky!=="storm") W.push("Rain is likely today ("+Math.round(pc)+"% chance), so take the hood and a cloth anyway.");
    if(tc!==null && tc<=0) W.push("Below freezing ("+f+"°F): carry a spare battery in an inside pocket.");
    else if(tc!==null && tc<=6) W.push("Cold ("+f+"°F): thin gloves keep the dials usable for longer.");
    else if(tc!==null && tc>=30) W.push("Hot ("+f+"°F): take water, and keep the camera out of direct sun between stops.");
  }
  // Light
  const st=sunAlt(p.start,c.lat,c.lon,-0.833), sunset=st?st[1]:null, all=p.stops.flatMap(s=>s.ideas.map(x=>({x,s})));
  const gold=lightWindows(p.start).find(w=>w.k==="gold" && w.s<p.end && w.e>p.start);
  if(gold){ const at=[...p.stops].reverse().find(s=>s.at<=gold.s)||p.stops[0];
    L.push("Golden hour is "+tf(gold.s)+" to "+tf(gold.e)+", while you are at "+esc(stopName(at))+"."+(dull?" Cloud will mute it today.":" Be in position before it starts.")); }
  if(sunset && p.start<sunset && p.end>sunset) L.push("The plan runs past sunset ("+tf(sunset)+"). Raise the Auto ISO ceiling to 6400 and expect to open up to the widest aperture.");
  else if(sunset && p.start>=sunset) L.push("The whole plan is after dark. Set the Auto ISO ceiling to 6400 before you leave.");
  const drag=all.filter(o=>o.x.r==="drag"), sil=all.filter(o=>o.x.r==="silhouette"), ins=all.filter(o=>o.x.r==="interior");
  if(drag.length) L.push("Motion blur at "+names(drag)+": you will have no tripod, so look for a pole or railing to brace on.");
  if(sil.length && dull) L.push("The silhouette idea at "+names(sil)+" needs hard light. Under cloud, shoot it against a bright doorway or window, or swap it.");
  if(ins.length) L.push("Indoor shooting at "+names(ins)+": the light is low and mixed, so hold 1/125 s and let the ISO climb.");
  if(sky==="sun" && p.stops.some(s=>s.key==="mid")) L.push("Midday sun is hard. Dial in −0.3 EV and use the shadows as shapes.");
  // Places
  [...new Set(p.stops.map(s=>s.place))].forEach(pid=>{ if(PLACE_NOTES[pid]) P.push('<b>'+esc(PLACES[pid].name)+'.</b> '+esc(PLACE_NOTES[pid])); });
  // Timing
  const first=p.stops[0], fp=PLACES[first.place], now=new Date();
  if(state.pos && typeof fp.lat==="number"){ const km=kmBetween(state.pos,fp), walk=Math.round(km*1.3/0.08), mins=walk<=30?Math.max(3,walk):Math.round(15+km*3), leave=new Date(p.start-mins*6e4), how=walk<=30?"on foot":"by subway";
    T.push(leave>now ? "Leave by "+tf(leave)+". The first stop is about "+mins+" min away "+how+"." : "The first stop is about "+mins+" min away "+how+", so leaving now gets you there about "+tf(new Date(+now+mins*6e4))+"."); }
  if(first.ev){ const e=EVENTS.find(x=>x.id===first.ev); T.push("Start at "+tf(p.start)+" at "+esc(e&&e.map&&e.map[0]?e.map[0]:(e?e.name:first.ev))+", about an hour before the event, to take a spot before the crowd fills in."); }
  else T.push("Start at "+tf(p.start)+" at "+esc(START[first.place]?START[first.place][0]:fp.name)+"."+(START[first.place]?' <a href="'+mapUrl(first.place)+'" target="_blank" rel="noopener">Map ↗</a>':''));
  T.push("You should finish about "+tf(p.end)+"."+(sunset&&p.start<sunset&&sunset-p.end<3*36e5?" Sunset is at "+tf(sunset)+".":""));
  const part=(label,items)=>items.length?'<div class="part"><span class="label">'+label+'</span><ul>'+items.map(x=>'<li>'+x+'</li>').join("")+'</ul></div>':'';
  return '<section class="group prep"><div class="group-head"><b>Before you leave</b></div><div class="prepbody">'+part("Weather",W.map(esc))+part("Light",L)+part("Places",P)+part("Timing",T)+'</div></section>';
}
function renderPlan(){
  const ps=$("pStart"), pt=$("pTime"), keepS=ps.value, keepT=pt.value, tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  ps.innerHTML=(state.pos?'<option value="near">Nearest to me</option>':'')+groupOptions(placeOrder().filter(id=>typeof PLACES[id].lat==="number"), id=>'<option value="'+id+'">'+esc(PLACES[id].name)+'</option>');
  ps.value=keepS; if(!ps.value) ps.selectedIndex=0;
  const pd=$("pDay"), keepD=pd.value||"0", now=new Date();
  pd.innerHTML=[0,1,2,3,4,5,6,7].map(n=>{ const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+n); return '<option value="'+n+'">'+(n===0?"Today":n===1?"Tomorrow":DAY_NAMES[d.getDay()])+(n>1?" "+d.toLocaleDateString("en-US",{month:"short",day:"numeric"}):" ("+DAY_SHORT[d.getDay()]+")")+'</option>'; }).join("");
  pd.value=keepD; const today=pd.value==="0", h0=now.getHours(); let opts=today?'<option value="now">Now</option>':'';
  for(let h=5;h<=22;h++){ if(today&&h<=h0) continue; opts+='<option value="'+h+'">'+((h%12||12)+(h<12?" am":" pm"))+'</option>'; }
  pt.innerHTML=opts; pt.value=keepT; if(!pt.value) pt.selectedIndex=0;
  const box=$("plan"), p=state.plan;
  if(!p){ box.innerHTML='<p class="lead">Choose where you will start, when, and how long you have. The plan picks ideas that suit the light at each stop and orders the stops as a walk.</p>'; return; }
  const mins=Math.round((p.end-p.start)/6e4), n=p.stops.reduce((a,s)=>a+s.ideas.length+(s.ev?((EVENTS.find(x=>x.id===s.ev)||{ideas:[]}).ideas||[]).length:0),0);
  const dayLab=p.start.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const skipped=(p.skipped||[]).map(id=>IDEAS.find(x=>x.id===id)).filter(Boolean);
  box.innerHTML='<p class="lead">'+esc(dayLab)+', '+tf(p.start)+' to about '+tf(p.end)+' · '+p.stops.length+' stop'+(p.stops.length===1?'':'s')+' · '+n+' ideas. Tap an idea to open it.</p>'+
    (p.notes&&p.notes.length?'<p class="msg">'+p.notes.map(esc).join(" ")+'</p>':'')+
    (skipped.length?'<p class="msg">Left out because they are not on then: '+skipped.map(x=>'<b>'+esc(x.t)+'</b> ('+esc(availText(x))+')').join("; ")+'.</p>':'')+planRoute(p)+planPrep(p)+
    p.stops.map(s=>{ const pl=PLACES[s.place];
      if(s.ev){ const e=EVENTS.find(x=>x.id===s.ev)||{name:s.ev,ideas:[]}, g=eventGeo(s.ev), V=EVENT_VIEW[s.ev]||{}, cam=CAMERAS[state.camera];
        return '<section class="group"><div class="group-head"><b>'+tf(s.at)+' · '+esc(e.name)+'</b><span class="where">Event · '+esc(e.where||"")+(e.map&&e.map[0]?' · viewing spot: '+esc(e.map[0]):'')+(V.face!=null?' · face '+compass(V.face):'')+'</span></div>'+
          (e.spot?'<p class="leg">'+esc(e.spot)+'</p>':'')+
          (e.ideas||[]).map(i=>'<button type="button" class="row" data-event="'+esc(s.ev)+'"><span class="dot" style="background:'+INTENTS[i[0]].color+'"></span><span class="t"><b>'+esc(i[1])+'</b><span>'+esc(INTENTS[i[0]].name)+' · '+esc(cam.recipes[i[3]][0])+'</span></span><span class="go" aria-hidden="true">›</span></button>').join("")+
          '<div class="callinks"><button type="button" class="chip" data-mapev="'+esc(s.ev)+'">Viewing spot on the map</button>'+(g?'<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+g[0].toFixed(5)+','+g[1].toFixed(5)+'&travelmode=transit" target="_blank" rel="noopener">Directions ↗</a>':'')+'</div></section>'+
          (s.leg?'<p class="leg">↓ Then about '+s.leg.mins+' min walk to '+esc(PLACES[s.leg.to].name)+'</p>':''); }
      return '<section class="group"><div class="group-head"><b>'+tf(s.at)+' · '+esc(pl.name)+'</b><span class="where">'+esc(WHEN[s.key])+' · '+esc(pl.stop||"")+' '+bullets(pl.lines,pl.city)+'</span>'+startLink(s.place)+'</div>'+
        s.ideas.map(x=>'<button type="button" class="row'+(state.done.has(x.id)?" done":"")+'" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span>'+
          '<span class="t"><b>'+esc(x.t)+'</b><span>'+esc(INTENTS[x.i].name)+(COMPOSE[x.id]?' · '+esc(TECH[COMPOSE[x.id][0]][0]):'')+'</span></span><span class="go" aria-hidden="true">›</span></button>').join("")+'</section>'+
        (s.leg?'<p class="leg">↓ About '+s.leg.mins+' min '+(s.leg.mode==="walk"?"walk":s.leg.mode)+' to '+esc(PLACES[s.leg.to].name)+' · <a href="'+dirUrl(s.place,s.leg.to,s.leg.mode)+'" target="_blank" rel="noopener">Directions ↗</a></p>':'');
    }).join("")+'<p class="msg">Travel times are estimated from straight-line distance, so allow extra. Tap Make a plan again for a different set.</p>';
}
/* Map of the shooting places. The land outline is a simplified drawing of the five boroughs, so the map
   works offline and inside Claude, where outside map images are blocked. It is a schematic, not a street map. */
const mapXY = (lat,lon) => [(lon+74.30)*0.758*2000, (40.95-lat)*2000];
/* Map detail. Neighbourhood label points are centroids of the city's neighbourhood areas. Streets, parks and landmarks are
   placed by hand from known coordinates, so they are approximate guides, not survey lines. */
const MAP_HOODS = [["Howard Beach",40.658,-73.8448],["Jamaica",40.7046,-73.7928],["Forest Hills",40.7212,-73.8481],["Ridgewood",40.7069,-73.9008],["Rego Park",40.7265,-73.8635],["Maspeth",40.73,-73.8957],["Sunnyside",40.7409,-73.931],["Elmhurst",40.7397,-73.8768],["Astoria",40.762,-73.92],["Long Island City",40.7589,-73.9395],["Woodside",40.7504,-73.9033],["Corona",40.7428,-73.8585],["Steinway",40.7777,-73.9053],["Midwood",40.6211,-73.9564],["Sheepshead Bay",40.5925,-73.9441],["Flatbush",40.6377,-73.9609],["Crown Heights",40.6744,-73.939],["Borough Park",40.6309,-73.988],["Park Slope",40.6711,-73.9838],["Brighton Beach",40.581,-73.9613],["Bay Ridge",40.6244,-74.03],["Bensonhurst",40.6129,-73.9953],["Bedford",40.6914,-73.9503],["Greenpoint",40.7294,-73.9487],["Fort Greene",40.6902,-73.9744],["Red Hook",40.6784,-74.0036],["Sunset Park",40.652,-74.0113],["Brooklyn Heights",40.6958,-73.995],["Bushwick",40.6968,-73.9257],["East New York",40.6599,-73.8771],["Bed-Stuy",40.688,-73.9315],["Canarsie",40.6374,-73.8999],["Financial District",40.7085,-74.011],["East Village",40.7276,-73.9858],["West Village",40.7329,-74.0012],["Chelsea",40.7474,-73.9985],["Hell's Kitchen",40.7643,-73.9925],["Lincoln Square",40.775,-73.9845],["Upper West Side",40.7903,-73.974],["Yorkville",40.7774,-73.9489],["Upper East Side",40.775,-73.961],["East Harlem",40.7901,-73.9458],["Morningside Heights",40.8077,-73.9629],["Hamilton Heights",40.8269,-73.949],["Washington Heights",40.8418,-73.9416],["Inwood",40.8664,-73.9191],["Murray Hill",40.7442,-73.9771],["Stuyvesant Town",40.7318,-73.9766],["Gramercy",40.7366,-73.9841],["Highbridge",40.838,-73.9257],["Riverdale",40.8993,-73.9068],["Mott Haven",40.8071,-73.9167],["Hunts Point",40.8123,-73.8857],["Fordham",40.8586,-73.8996],["Parkchester",40.8374,-73.8577],["Hoboken",40.744,-74.04],["Jersey City",40.718,-74.068],["Tribeca",40.7163,-74.0086],["Midtown East",40.7545,-73.969]];
/* Landmarks: name, lat, lon, kind, tier (1 shows zoomed out, 2 when zoomed in), a photography tip. Positions are approximate. */
const LANDMARKS = [["Empire State Building",40.7484,-73.9857,"tower",1,"Lit in changing colours at night. Frame it down 33rd Street, or up Fifth Avenue from Madison Square Park."],["One World Trade Center",40.7127,-74.0134,"tower",1,"Its glass picks up the sky and the light. Shoot it from the 9/11 Memorial plaza or from Jersey City across the Hudson."],["Statue of Liberty",40.6892,-74.0445,"monument",1,"The free Staten Island Ferry passes close by. Stand on the right-hand side of the boat on the way out to Staten Island."],["Brooklyn Bridge",40.7061,-73.9969,"bridge",1,"Walk the promenade soon after sunrise, before the crowds. From Pebble Beach in DUMBO it frames the Lower Manhattan skyline."],["Manhattan Bridge",40.7075,-73.9908,"bridge",1,"The famous view is down Washington Street in DUMBO, with the Empire State Building framed under the arch. Expect a queue of photographers."],["Williamsburg Bridge",40.7134,-73.9719,"bridge",1,"The walkway is steel lattice and chain-link: strong lines, cyclists and the skyline ahead when walking west in late light."],["Queensboro Bridge",40.757,-73.9545,"bridge",1,"See it from Sutton Place Park, or ride the Roosevelt Island Tram, which runs right alongside it."],["Chrysler Building",40.7516,-73.9755,"tower",1,"The crown lights up after dark. Look up Lexington Avenue in the low 40s, or west along 42nd Street from the Tudor City overpass."],["Flatiron Building",40.7411,-73.9897,"tower",1,"The classic wedge view is from the plaza where Broadway crosses Fifth Avenue at 23rd Street."],["Rockefeller Center",40.7587,-73.9787,"view",1,"Flags and the rink on the plaza. The Top of the Rock deck (ticketed) looks north over Central Park and south to the Empire State."],["The Met",40.7794,-73.9632,"museum",1,"The front steps on Fifth Avenue are a stage for people-watching, busiest on weekend afternoons."],["Hudson Yards and the Vessel",40.7538,-74.0022,"tower",1,"The Vessel's honeycomb works best shot from below. The Edge deck next door (ticketed) has a glass floor over the streets."],["The Oculus",40.7114,-74.011,"transit",1,"White ribs and floor reflections. Handheld is fine; tripods are not allowed."],["Grand Army Plaza",40.6743,-73.9701,"monument",1,"The Soldiers and Sailors Arch at the top of Prospect Park, with a Greenmarket on Saturdays."],["Lincoln Center",40.7725,-73.9835,"venue",1,"The fountain plaza glows at dusk, and concert-goers dress up on performance nights."],["Prospect Park",40.6602,-73.969,"park",1,"Long Meadow, the boathouse and weekend crowds. At its best in autumn colour."],["Yankee Stadium",40.8296,-73.9262,"venue",1,"On game days, crowds pour along River Avenue under the elevated 4 train."],["Barclays Center",40.6826,-73.9754,"venue",1,"The rusted steel canopy and the subway entrance beneath it fill up before events."],["Unisphere",40.7463,-73.8451,"monument",1,"The steel globe from the 1964 World's Fair. The fountains run in summer; shoot from low so it fills the sky."],["The Cloisters",40.8649,-73.9319,"museum",1,"Medieval cloisters in Fort Tryon Park with Hudson views. Quiet, and good in soft light."],["9/11 Memorial",40.7115,-74.0134,"monument",2,"Two square pools in the footprints of the towers. It is a place of mourning: be respectful, and leave people's grief out of your pictures."],["Charging Bull",40.7056,-74.0134,"monument",2,"Crowded all day. Go early for an empty frame, or turn round and photograph the crowd instead."],["Wall Street",40.7069,-74.0113,"monument",2,"The Stock Exchange facade and its giant flag, and office workers at lunchtime."],["City Hall",40.7128,-74.006,"monument",2,"City Hall Park, with the Municipal Building's colonnade across Centre Street."],["South Street Seaport",40.7063,-74.0036,"view",2,"Cobbled streets, tall ships and views of the Brooklyn Bridge from Pier 17."],["Governors Island",40.6895,-74.0168,"park",2,"A short ferry ride from the Battery Maritime Building. Open lawns and harbour views of the skyline."],["Little Island",40.742,-74.0103,"park",2,"A park on tulip-shaped pillars in the Hudson. Busy at sunset; at peak times entry may need a reservation."],["High Line",40.748,-74.0048,"park",2,"A park on an old elevated rail line. Frame people against the streets below and the buildings alongside."],["Whitney Museum",40.7396,-74.0089,"museum",2,"Outdoor terraces look over the Meatpacking District and the start of the High Line."],["MoMA",40.7614,-73.9776,"museum",2,"Ticketed. The sculpture garden, and the city seen through big gallery windows."],["Guggenheim",40.783,-73.959,"museum",2,"The white spiral facade on Fifth Avenue, opposite Central Park."],["Columbus Circle",40.7681,-73.9819,"monument",2,"Traffic swirls round the column, with reflections in the towers above."],["Moynihan Train Hall",40.7527,-73.9962,"transit",2,"A huge skylit hall with a hanging clock. Travellers stream under it at rush hour."],["Bryant Park",40.7536,-73.9832,"park",2,"Lunch crowds on movable chairs; the Winter Village rink from late autumn."],["Madison Square Park",40.742,-73.9875,"park",2,"Benches, dogs and lunch queues, with the Flatiron Building at its southwest corner."],["Tompkins Square Park",40.7265,-73.9818,"park",2,"East Village life: chess players, dogs, musicians, and the Halloween dog parade."],["Stonewall Inn",40.7338,-74.0021,"monument",2,"A national monument on Christopher Street and the heart of Pride in June."],["Domino Park",40.7143,-73.968,"park",2,"Waterfront park under the Williamsburg Bridge, with the skyline across the river."],["McCarren Park",40.7205,-73.9515,"park",2,"Runners, softball games and Williamsburg weekend crowds."],["Gantry Plaza",40.7455,-73.9585,"view",2,"Old rail gantries and the Pepsi-Cola sign, with the Midtown skyline across the East River."],["MoMA PS1",40.7455,-73.947,"museum",2,"Contemporary art in a former school in Long Island City."],["Roosevelt Island Tram",40.7613,-73.9642,"transit",2,"Ride it for a moving view down the East River beside the Queensboro Bridge."],["Astoria Park",40.779,-73.922,"park",2,"Under the Hell Gate and RFK bridges, with summer crowds at the big public pool."],["Apollo Theater",40.8101,-73.95,"venue",2,"The marquee on 125th Street lights up at night."],["Columbia University",40.8075,-73.9626,"museum",2,"The Low Library steps and the campus lawns between classes."],["Brooklyn Museum",40.6712,-73.9636,"museum",2,"A grand Beaux-Arts building on Eastern Parkway, with fountains on the plaza."],["Brooklyn Botanic Garden",40.6694,-73.9624,"park",2,"Ticketed. Cherry blossoms in April draw big crowds."],["Green-Wood Cemetery",40.6529,-73.9906,"park",2,"Gothic gates and hills. From Battle Hill a statue of Minerva salutes the Statue of Liberty."],["Wonder Wheel",40.5741,-73.979,"venue",2,"Swinging cars against the sky; the lights come on at dusk."],["Citi Field",40.7571,-73.8458,"venue",2,"Mets crowds stream off the 7 train on game days."],["New York Botanical Garden",40.8623,-73.88,"park",2,"Ticketed gardens and a Victorian glasshouse conservatory."],["Bronx Zoo",40.8506,-73.877,"park",2,"Ticketed. Shown for orientation."],["LaGuardia Airport",40.7769,-73.874,"transit",2,"Shown for orientation."],["JFK Airport",40.6413,-73.7781,"transit",2,"Shown for orientation."]];
const LM_KIND = {tower:"Building",bridge:"Bridge",monument:"Monument",museum:"Museum or campus",park:"Park",view:"Viewpoint",venue:"Venue",transit:"Transport",walk:"Bridge walkway entrance"};
/* Where you get onto the bridges you can walk: entrance, which way the path heads, and the walk across. Placed by hand. */
LANDMARKS.push(
  ["Brooklyn Bridge walkway, Manhattan end",40.7124,-74.0047,"walk",2,"Start of the promenade at Centre Street and Park Row, across from City Hall. Walk early: by 10 am on a fine day the boards are a queue. Face Brooklyn for the cables and the sun behind you in the morning.",130,28],
  ["Brooklyn Bridge walkway, Tillary Street",40.6961,-73.9903,"walk",2,"The Brooklyn entrance at Tillary Street and Boerum Place. Walking towards Manhattan puts the skyline ahead and, in the afternoon, the sun behind you.",315,28],
  ["Brooklyn Bridge stairs, Washington Street",40.7001,-73.9898,"walk",2,"A staircase up from Washington Street in DUMBO, under the approach. The quick way onto the bridge from the Washington Street view.",300,25],
  ["Manhattan Bridge walkway, Canal Street",40.7153,-73.9933,"walk",2,"Pedestrians use the south side, from Canal Street at the Bowery. Trains run beside the path and shake it; the view is back to the Brooklyn Bridge and down to DUMBO.",135,30],
  ["Manhattan Bridge walkway, Jay Street",40.6995,-73.9872,"walk",2,"The Brooklyn end, at Jay Street and Sands Street. The cycle path is on the north side; walkers on the south, facing the Brooklyn Bridge.",320,30],
  ["Williamsburg Bridge walkway, Delancey Street",40.7177,-73.9848,"walk",2,"Up from Delancey Street at Clinton Street. The red steel frames the Lower East Side and the river; at sunset you walk into the light going back.",110,30],
  ["Williamsburg Bridge walkway, Bedford Avenue",40.7106,-73.9639,"walk",2,"The Brooklyn end near Bedford Avenue and South 5th Street. Facing Manhattan in the late afternoon is backlit; the morning is the time for the skyline.",295,30],
  ["Queensboro Bridge walkway, 1st Avenue",40.7615,-73.9608,"walk",2,"The north-side path starts at First Avenue and East 60th Street, under the tram. Cars pass close; the reward is Roosevelt Island and Midtown from the water.",70,25],
  ["Queensboro Bridge walkway, Queens Plaza",40.7515,-73.9407,"walk",2,"From Queens Plaza North at Crescent Street. Walking to Manhattan in the late afternoon puts the sun ahead; mornings light the towers.",250,25],
  ["George Washington Bridge walkway",40.8505,-73.9405,"walk",2,"The south sidewalk opens from West 178th Street at Cabrini Boulevard. Half a mile over the Hudson, the Palisades ahead and the city small behind.",290,20],
  ["High Bridge, Manhattan end",40.8420,-73.9305,"walk",2,"The oldest bridge in the city and walkers only, from Edgecombe Avenue at West 172nd Street across the Harlem River to the Bronx. Quiet, high and empty.",60,8],
  ["Pulaski Bridge walkway, Greenpoint",40.7363,-73.9533,"walk",2,"From McGuinness Boulevard at Eagle Street, a short climb to the best cheap skyline: Midtown across Newtown Creek, with the creek and the tanks in front.",20,10]);
const LM_GLYPH = {   // drawn in a box from -4 to 4
  tower:'<path d="M-1.6 4V-2.2H1.6V4M-0.6-2.2V-4.2M-3.2 4H3.2"/>',
  bridge:'<path d="M-4 1.6H4M-3.6 1.6Q0-4.4 3.6 1.6M-2 1.6V-0.6M0 1.6V-1.3M2 1.6V-0.6"/>',
  monument:'<path d="M-1 4L-0.6-3L0-4.2L0.6-3L1 4ZM-2.8 4H2.8"/>',
  museum:'<path d="M-3.6-1.4L0-3.8L3.6-1.4ZM-2.6-0.6V2.8M0-0.6V2.8M2.6-0.6V2.8M-3.6 3.6H3.6"/>',
  park:'<path d="M0 4V0.6"/><circle cx="0" cy="-1.2" r="2.6"/>',
  view:'<path d="M-4 0Q0-4 4 0Q0 4-4 0Z"/><circle cx="0" cy="0" r="1.2"/>',
  venue:'<ellipse cx="0" cy="0" rx="3.8" ry="2.6"/><ellipse cx="0" cy="0" rx="1.6" ry="0.9"/>',
  transit:'<rect x="-2.8" y="-3.8" width="5.6" height="6.4" rx="1.4"/><path d="M-2.8-0.4H2.8M-1.8 4L-1 2.6M1.8 4L1 2.6"/>',
  walk:'<circle cx="0.6" cy="-3.2" r="1"/><path d="M0.4-1.8L-1.2 0.6L-0.2 1.2L-1.4 4M0.4-1.8L1.6-0.4L3 0.2M-1.2 0.6L-2.6 0M-0.2 1.2L1.2 4"/>'};
const MAP_STREETS = MAPD_STREETS;   // real street centrelines (label segment, or -1 for no label)
/* Hand-placed points for each place's starting spot and each event's viewing spot. Events added by the weekly task carry their own lat and lon. */
const STATION_GEO = {"chinatown":[[40.7187,-74.0002,"NQRW6JZ"]],"gct":[[40.7527,-73.9772,"4567S"]],"tsq":[[40.7557,-73.987,"1237NQRWS"]],"wsp":[[40.7322,-74.0003,"ACEBDFM"]],"dumbo":[[40.7013,-73.9867,"F"]],"coney":[[40.5773,-73.9811,"DFNQ"]],"soho":[[40.7244,-73.9978,"RW"]],"jh":[[40.7465,-73.8912,"7EFMR"]],"ferry":[[40.7025,-74.0135,"1RW"]],"harlem":[[40.8111,-73.9522,"ABCD"],[40.8076,-73.9454,"23"]],"les":[[40.7185,-73.9879,"FMJZ"]],"flushing":[[40.7596,-73.8301,"7"]],"wburg":[[40.7172,-73.9567,"L"]],"midtown":[[40.7603,-73.9751,"EF"]],"cpark":[[40.7757,-73.9762,"BC"]],"rockaway":[[40.588,-73.8135,"S"]],"arthur":[[40.8613,-73.8907,"BD"]]};
Object.assign(STATION_GEO, {"union": [[40.7349, -73.99, "456LNQRW"]], "fidi": [[40.7103, -74.0079, "2345ACJZ"], [40.7071, -74.0119, "2345"]], "ktown": [[40.7497, -73.9877, "BDFMNQRW"]], "bushwick": [[40.7067, -73.9229, "L"]], "chelsea": [[40.7407, -74.0021, "ACEL"]], "brighton": [[40.5777, -73.9614, "BQ"]]});
const START_GEO = {"chinatown":[40.7146,-73.998],"gct":[40.7527,-73.9772],"tsq":[40.759,-73.9849],"wsp":[40.7312,-73.9971],"dumbo":[40.7033,-73.9895],"coney":[40.5738,-73.979],"soho":[40.7256,-73.9992],"jh":[40.7467,-73.8915],"ferry":[40.7013,-74.0131],"harlem":[40.8101,-73.95],"les":[40.7183,-73.9881],"flushing":[40.7596,-73.83],"wburg":[40.7172,-73.9567],"midtown":[40.7603,-73.9751],"cpark":[40.774,-73.9708],"rockaway":[40.5843,-73.8125],"arthur":[40.8553,-73.8877]};
const EVENT_GEO = {"foliage":[40.7725,-73.9718],"threekings":[40.7916,-73.9447],"lunar":[40.7155,-73.9983],"stpat":[40.7722,-73.9672],"easter":[40.7585,-73.976],"dance":[40.7284,-73.9872],"henge":[40.747,-73.9808],"prday":[40.7697,-73.969],"mermaid":[40.5757,-73.99],"pride":[40.7338,-74.0021],"westindian":[40.6712,-73.9636],"sangennaro":[40.7193,-73.9975],"columbus":[40.7678,-73.9705],"dogparade":[40.727,-73.9795],"halloween":[40.7357,-73.998],"marathon":[40.6706,-73.9886],"veterans":[40.742,-73.9875],"balloons":[40.7813,-73.974],"thanksgiving":[40.7765,-73.9761],"tree":[40.7587,-73.978],"dyker":[40.6155,-74.0125],"nye":[40.758,-73.9855],"aipad":[40.7676,-73.966],"bild":[40.7578,-74.0026],"photoville":[40.7038,-73.9941],"fujikina-nyc-2026":[40.718,-73.9886],"aperture-loves-new-york":[40.7811,-73.976],"bronx-halloween-parade":[40.8205,-73.891],"bryant-park-winter-village":[40.7536,-73.9832],"disability-pride-parade":[40.742,-73.9875],"diwali-times-square":[40.759,-73.985],"jackson-heights-halloween-parade":[40.7497,-73.884],"mano-a-mano-day-of-the-dead":[40.7302,-73.987]};
/* Free outdoor music, where the crowd on the lawn is the subject. Season dates follow each series' usual pattern until the weekly check confirms them. */
EVENTS.push(
{id:"summerstage",city:"nyc",type:"music",approx:true,name:"SummerStage in Central Park",when:y=>[[eD(y,6,1),eD(y,8,31)]],time:"Evenings, usually 6 or 7 pm; some weekend afternoons",where:"Rumsey Playfield, Central Park, enter at 69 St and Fifth Av",why:"Free shows all summer with the crowd on the grass, the queue along the park path and the skyline over the trees at dusk.",spot:"The queue on the path from Fifth Avenue is the picture before the gates open. Inside, stand at the back of the crowd and shoot across it towards the stage as the lights come on.",ideas:[["energy","Hands up","The front rows with arms raised against the stage lights at dusk.","freeze"],["moment","Queue on the path","People waiting on the park path with blankets and coolers, the trees behind.","zone"],["mood","Lawn at blue hour","The crowd as shapes against the stage glow and the last sky.","night"]],map:["Rumsey Playfield, Central Park","Rumsey Playfield, Central Park, New York, NY"]},
{id:"celebratebk",city:"nyc",type:"music",approx:true,name:"BRIC Celebrate Brooklyn!",when:y=>[[eNth(y,6,6,1),eD(y,8,15)]],time:"Evenings from about 7 pm, June to mid-August",where:"Lena Horne Bandshell, Prospect Park, enter at 9 St and Prospect Park West",why:"Brooklyn's free summer series: picnics on the slope, children dancing at the back, the bandshell lit under the trees.",spot:"Arrive before 6 pm and set up on the slope behind the seats, where families spread out and the light comes through the trees. Shoot the picnics before the music and the dancers after dark.",ideas:[["moment","Picnic on the slope","A family on a blanket, the bandshell small behind them.","shallow"],["energy","Dancing at the back","Children and couples dancing on the path behind the crowd.","freeze"],["mood","Bandshell under the trees","The lit stage seen through the crowd and the leaves at night.","night"]],map:["Lena Horne Bandshell, Prospect Park","Lena Horne Bandshell, Prospect Park, Brooklyn, NY"]},
{id:"lcsummer",city:"nyc",type:"music",approx:true,name:"Summer for the City at Lincoln Center",when:y=>[[eD(y,6,10),eD(y,8,10)]],time:"Evenings; the dance floor on the plaza runs from about 6:30 pm",where:"Josie Robertson Plaza, Lincoln Center, Broadway at 64 St",why:"A disco ball over the plaza fountain and hundreds of people of every age dancing in the open, with the Met's arches lit behind.",spot:"Stand on the steps up to the Met Opera and shoot down across the dancers with the fountain and the ball in the frame. Then get into the crowd for faces.",ideas:[["energy","Under the ball","Dancers mid-spin under the disco ball with the fountain behind.","drag"],["moment","First dance","An older couple dancing close while the crowd moves around them.","shallow"],["place","The plaza from the steps","The whole floor of dancers, the ball and the lit arches, at blue hour.","night"]],map:["Josie Robertson Plaza, Lincoln Center","Josie Robertson Plaza, Lincoln Center, New York, NY"]},
{id:"bryantpicnic",city:"nyc",type:"music",approx:true,name:"Bryant Park Picnic Performances",when:y=>[[eD(y,6,1),eD(y,9,15)]],time:"Evenings, usually 7 pm, several nights a week",where:"The Lawn, Bryant Park, 42 St between Fifth and Sixth Av",why:"Office workers on the lawn at dusk, the towers lit up all round, and a stage at the west end.",spot:"Sit at the edge of the lawn on the Sixth Avenue side and shoot across the blankets towards the lit towers on 42nd Street. Blue hour is the time.",ideas:[["place","Lawn and towers","The full lawn of picnics with the towers lit behind, at blue hour.","night"],["moment","After work","Someone in office clothes lying back on the grass with a cup of wine.","shallow"],["odd","Reading at a concert","A person reading or working a laptop while the band plays.","zone"]],map:["Bryant Park Lawn","Bryant Park, New York, NY"]},
{id:"makemusic",city:"nyc",type:"music",approx:true,name:"Make Music New York",when:y=>[[eD(y,6,21)]],time:"All day, from about 10 am into the evening",where:"Over a thousand free performances on streets, in parks and on stoops in every borough",why:"The one day a year when music is everywhere at street level: brass bands on corners, pianos on pavements, choirs on stoops.",spot:"Pick a dense cluster from the programme, usually the Lower East Side, Washington Square and Williamsburg, and walk between performances. The listeners are the subject as often as the players.",ideas:[["moment","Stoop concert","A band on a stoop with neighbours watching from the steps and windows.","zone"],["energy","Brass on the corner","A brass band mid-blast with passers-by stopped around them.","freeze"],["odd","Piano on the pavement","Someone playing a street piano as the crowd walks past without looking.","deep"]],map:["Washington Square Park","Washington Square Park, New York, NY"]},
{id:"charlieparker",city:"nyc",type:"music",approx:true,name:"Charlie Parker Jazz Festival",when:y=>{const a=eLast(y,8,0);return [[ePlus(a,-2),a]];},time:"Afternoons, about 3 pm to 7 pm, on the last weekend of August",where:"Marcus Garvey Park in Harlem on Saturday, Tompkins Square Park on Sunday",why:"Free jazz in two parks with the best-dressed listeners of the summer: hats, folding chairs and dancing in the aisles.",spot:"Work the chairs and the standing crowd at the sides rather than the stage. Marcus Garvey Park has the better light, with the sun coming over the rock in the late afternoon.",ideas:[["moment","Listening","A face lost in the music, eyes closed, in a folding chair.","shallow"],["energy","Dancing in the aisle","A couple dancing beside the chairs while the band plays.","freeze"],["mood","Hats in the sun","A row of hats and shoulders against the low sun.","silhouette"]],map:["Marcus Garvey Park","Marcus Garvey Park, New York, NY"]},
{id:"seaside",city:"nyc",type:"music",approx:true,days:[4],name:"Coney Island free summer concerts",when:y=>[[eNth(y,7,4,2),eD(y,8,28)]],time:"Thursday evenings from 7 pm, July and August",where:"Coney Island Amphitheater, Surf Av at West 21 St, and the boardwalk beside it",why:"A free crowd on the boardwalk and the beach outside the amphitheatre fence, with the Wonder Wheel lit behind.",spot:"Stay outside: the boardwalk and the sand beside the amphitheatre fill with people listening for free, and the rides light up behind them as the sun goes down.",ideas:[["mood","Boardwalk listeners","People along the boardwalk rail with the Wonder Wheel lit behind.","night"],["moment","Dancing on the sand","A couple dancing on the beach to music they cannot see.","silhouette"],["energy","Rides behind the crowd","The crowd at the fence with the rides spinning above them.","drag"]],map:["Coney Island Amphitheater","Coney Island Amphitheater, 3052 W 21st St, Brooklyn, NY"]});
Object.assign(EVENT_GEO,{summerstage:[40.7706,-73.9713],celebratebk:[40.6632,-73.9779],lcsummer:[40.7725,-73.9835],bryantpicnic:[40.7536,-73.9842],makemusic:[40.7308,-73.9973],charlieparker:[40.8043,-73.9437],seaside:[40.5751,-73.9847]});
Object.assign(EVENT_VIEW,{
  summerstage:{face:250,street:null,arrive:"Gates open about an hour before the show and the queue runs along the path from Fifth Avenue; the line is the first picture. Weekend shows fill the lawn; weeknights have room. The 6 to 68th Street."},
  celebratebk:{face:110,street:null,arrive:"Free shows are first come; arrive by 6 pm for the slope. Enter at 9th Street and Prospect Park West; the F or G to 7th Avenue. Bring something to sit on."},
  lcsummer:{face:290,street:null,arrive:"The dance floor opens about 6:30 pm with a lesson, and the plaza fills by 8. Free, no ticket. The 1 to 66th Street."},
  bryantpicnic:{face:299,street:119,arrive:"The lawn opens about 5 pm on performance nights and fills with blankets by 6:30. Free. Any train to 42nd Street or Bryant Park."},
  makemusic:{face:29,street:null,arrive:"The programme is published in June; plan a route through one neighbourhood rather than crossing the city. Evening performances have the best light and the best crowds."},
  charlieparker:{face:250,street:null,arrive:"Arrive early afternoon for a chair; the standing crowd at the sides is easier to work. The 2 or 3 to 125th Street for Marcus Garvey Park; the L to First Avenue for Tompkins Square."},
  seaside:{face:200,street:null,arrive:"The boardwalk outside the amphitheatre fills from about 6:30 pm. Free from the boardwalk and the sand; the D, F, N or Q to Stillwell Avenue."}});
/* Game nights, outside the stadium. Dates come from the weekly check (EVENT_DOCS._fixtures), one row per home game, shown as one card per venue. */
const VENUES = {
  yankee:{name:"Yankee Stadium on game day",teams:{yankees:"Yankees",nycfc:"NYCFC"},where:"River Av and 161 St, the Bronx, under the 4 train",why:"The crowd under the elevated tracks on River Avenue, the bars and the bootleg shirt sellers, and the surge out of the 4 train an hour before first pitch.",spot:"Stand on River Avenue between 157th and 161st Street, under the tracks, facing the stadium gate. The hour before the game is the picture; come back for the exit, when the crowd fills the street and the train platform above it.",ideas:[["energy","Under the 4 train","The crowd pouring down the station stairs onto River Avenue with the stadium behind.","zone"],["moment","Pinstripes and a hot dog","A fan in full kit at a cart outside the gate.","shallow"],["mood","Exit under the lights","The street after the game, the el lit above and the crowd moving towards the train.","night"]],map:["River Av at 161 St","River Ave & E 161st St, Bronx, NY"],geo:[40.8283,-73.9256],face:60,street:30,arrive:"Arrive 90 minutes before first pitch; the 4 train to 161st Street puts you in the middle of it. Weekend day games have families and better light; night games give you the lit el. River Avenue is closed to cars on game days, so you can work the middle of the street. NYCFC also plays home games here in some seasons; check the club's site for which stadium."},
  citi:{name:"Citi Field on game day",teams:{mets:"Mets"},where:"Mets–Willets Point station and the plaza outside Citi Field, Queens",why:"Fans coming off the 7 train onto the long boardwalk to the stadium, the Home Run Apple plaza, and the view back to the Unisphere and the Shea Bridge crowd.",spot:"The elevated walkway from the station to the rotunda is a river of fans for an hour before the game; stand to one side at the stadium end so they walk towards you. After the game, the platform at Mets–Willets Point is packed and lit.",ideas:[["energy","Walkway to the rotunda","The crowd coming off the 7 along the boardwalk with the stadium ahead.","zone"],["moment","Rotunda steps","Families stopping for a photo at the Jackie Robinson Rotunda.","freeze"],["mood","Platform after the game","The crowd on the elevated platform under the lights, trains arriving.","night"]],map:["Mets–Willets Point station","Mets-Willets Point Station, Queens, NY"],geo:[40.7546,-73.8457],face:200,street:null,arrive:"The 7 train to Mets–Willets Point; express trains run on game days. Arrive an hour before first pitch for the walkway, and stay for the exit if you can face the platform crowd. Weekday day games are quiet; Friday nights and weekends are full."},
  msg:{name:"Madison Square Garden on game night",teams:{knicks:"Knicks"},where:"Seventh Av and 33 St, outside Madison Square Garden",why:"The crowd on Seventh Avenue under the marquee, scalpers, jersey sellers and the Penn Station rush all at once, in the best lit block in Midtown.",spot:"Stand on the west side of Seventh Avenue at 32nd Street, facing the Garden entrance, from 90 minutes before tip-off. The marquee and the towers light the street; after the game the crowd spills across Seventh Avenue to the trains.",ideas:[["energy","Seventh Avenue surge","Fans crossing Seventh Avenue towards the marquee at dusk.","drag"],["moment","Jerseys at the cart","Fans in jerseys at a food cart with the marquee behind.","shallow"],["odd","Tickets, tickets","A seller working the crowd at the corner.","zone"]],map:["Seventh Av at 33 St","7th Ave & W 33rd St, New York, NY"],geo:[40.7503,-73.9933],face:60,street:29,arrive:"Any train to Penn Station or 34th Street. The crowd builds from 90 minutes before tip-off on the Seventh Avenue side; the 33rd Street side has the cars. After the final buzzer the whole street is the picture for twenty minutes."},
  barclays:{name:"Barclays Center on game night",teams:{nets:"Nets"},where:"Flatbush and Atlantic Avenues, Brooklyn",why:"The oculus of the arena over the plaza, the crowd pouring up from the Atlantic Avenue station, and Flatbush Avenue traffic lit behind it.",spot:"Stand on the plaza under the oculus, facing the Flatbush Avenue corner, from an hour before tip-off; the station exits are right there. The rust-coloured arena wall lights up at night and makes a background for anything in front of it.",ideas:[["place","Under the oculus","The plaza crowd under the ring of the arena roof at blue hour.","deep"],["energy","Up from the station","Fans coming up the stairs onto the plaza.","zone"],["mood","Rust wall at night","Figures against the lit arena wall with Flatbush traffic streaking past.","drag"]],map:["Barclays Center plaza","Barclays Center, 620 Atlantic Ave, Brooklyn, NY"],geo:[40.6827,-73.9754],face:150,street:null,arrive:"The 2, 3, 4, 5, B, D, N, Q or R to Atlantic Avenue–Barclays Center; the station opens onto the plaza. Arrive an hour before tip-off; the plaza is public, so you can work it freely."}
};
const TEAM_VENUE = {yankees:"yankee",mets:"citi",knicks:"msg",nets:"barclays",nycfc:"yankee"};
Object.entries(VENUES).forEach(([id,v])=>{ EVENT_GEO[id]=v.geo; EVENT_VIEW[id]={face:v.face,street:v.street,arrive:v.arrive}; });
/* The fixture list from the weekly check: {games:[{team, venue?, at:"YYYY-MM-DDTHH:MM" (local), opp}]} */
function fixtureRows(today){ const F=EVENT_DOCS._fixtures, out=[]; if(!F||!Array.isArray(F.games)) return out;
  for(const g of F.games){ const vid=g.venue&&VENUES[g.venue]?g.venue:TEAM_VENUE[g.team]; const V=VENUES[vid]; if(!V||!g.at) continue;
    const m=/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/.exec(g.at); if(!m) continue; const at=new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5]), day=evDay(at); if(day<today) continue;
    const mins=at.getHours()*60+at.getMinutes(), team=V.teams[g.team]||g.team, title=team+(g.opp?' v '+g.opp:'')+(g.team==="nycfc"?' (football)':'');
    out.push({e:Object.assign({},V,{id:vid,city:state.city,type:"game",time:hmText(Math.max(0,mins-90))+' to '+hmText(Math.min(1439,mins+20))+'; '+(g.team==="nycfc"?'kick-off':/yankee|citi/.test(vid)?'first pitch':'tip-off')+' '+hmText(mins),ideas:V.ideas,map:V.map}),o:[day],confirmed:true,game:{team:g.team,opp:g.opp||"",at,title}}); }
  return out.sort((a,b)=>a.game.at-b.game.at); }
const evTitle = r => r.game ? r.game.title+' · '+r.e.name.replace(/ on game (day|night)$/,'') : r.e.name;
Object.assign(START_GEO, {"union": [40.7351, -73.9906], "fidi": [40.7071, -74.0102], "ktown": [40.7478, -73.9876], "bushwick": [40.7055, -73.9236], "chelsea": [40.7393, -74.0081], "brighton": [40.5776, -73.9616]});
/* Is an event on at a given time? Reads the event's time text: "11 am to 4 pm", "Starts at 7 pm", "noon", "Dusk to about 9 pm", "Late morning". */
const EV_WORDS = [["early morning",420,540],["late morning",630,720],["morning",540,720],["midday",720,840],["early afternoon",780,900],["late afternoon",960,1080],["afternoon",780,1020],["early evening",1080,1200],["evening",1080,1260],["daytime",600,1080],["all day",480,1200]];
function evWindow(e,day){ const s=String(e.time||"").toLowerCase().replace(/\bnoon\b/g,"12 pm").replace(/\bmidnight\b/g,"11:59 pm"), toks=[];
  s.replace(/(\d{1,2})(?::(\d\d))?\s*(am|pm)\b/g,(m,h,mi,ap,idx)=>{ toks.push({min:(+h%12+(ap==="pm"?12:0))*60+(+mi||0),idx}); return m; });
  const c=CITIES[state.city], dusk=()=>{ const t=sunTimes(day,c.lat,c.lon)[1]; return t.getHours()*60+t.getMinutes()-20; };
  const words=[]; let rest=s; for(const [w,a,b] of EV_WORDS){ const i=rest.indexOf(w); if(i>=0){ words.push({i,a,b}); rest=rest.slice(0,i)+" ".repeat(w.length)+rest.slice(i+w.length); } }
  if(/\b(dusk|sunset)\b/.test(s)){ const d=dusk(); words.push({i:s.search(/\b(dusk|sunset)\b/),a:d,b:d+60}); } words.sort((x,y)=>x.i-y.i);
  if(toks.length>=2){ const ms=toks.map(t=>t.min); return [Math.min(...ms),Math.max(...ms)]; }
  if(toks.length===1){ const t=toks[0], before=words.filter(w=>w.i<t.idx);
    if(before.length) return [before[0].a,t.min];                                   // "Dusk to about 9 pm", "from early afternoon ... midnight"
    if(/\b(to|until|till) (about )?$/.test(s.slice(0,t.idx))) return null;          // an end time with no start
    return [t.min,Math.min(t.min+180,1439)]; }                                       // a start time: assume about three hours
  if(words.length) return [words[0].a,words[words.length-1].b];
  return null; }
const evDay = d => new Date(d.getFullYear(),d.getMonth(),d.getDate());
const hmText = m => { const h=Math.floor(m/60)%24, mm=m%60; return ((h%12)||12)+(mm?":"+String(mm).padStart(2,"0"):"")+(h<12?" am":" pm"); };
const shortDate = d => d.toLocaleDateString("en-US",{month:"short",day:"numeric"});
function evStatus(r,t){ const day=evDay(t), s=evDay(r.o[0]), en=evDay(r.o[1]||r.o[0]), multi=+en!==+s;
  if(day<s) return {k:"date",chip:shortDate(s),line:"Starts "+r.o[0].toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})};
  if(day>en) return {k:"over",chip:"Over",line:"This event has ended"};
  const w=evWindow(r.e,day), m=t.getHours()*60+t.getMinutes(), thru=multi?", through "+shortDate(en):"";
  if(!w) return multi?{k:"live",chip:"On now",line:"On now"+thru}:{k:"today",chip:"Today",line:"Today"+(r.e.time?". "+r.e.time:"")};
  if(m<w[0]) return {k:"today",chip:"Today "+hmText(w[0]),line:"Today from about "+hmText(w[0])+thru};
  if(m<=w[1]) return {k:"live",chip:"On now",line:"On now, until about "+hmText(w[1])+thru};
  return +day<+en?{k:"over",chip:"Done today",line:"Done for today, back tomorrow"+thru}:{k:"over",chip:"Over",line:"Over for today"}; }
function mapEvents(){ const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate()), lim=new Date(today.getFullYear(),today.getMonth(),today.getDate()+42);
  const seenV=new Set();
  return eventRows(today).filter(r=>r.o&&!r.cancelled&&r.o[0]<=lim).filter(r=>{ if(!r.game) return true; if(seenV.has(r.e.id)) return false; seenV.add(r.e.id); return true; }).map(r=>{ const d=EVENT_DOCS[r.e.id], g=(d&&typeof d.lat==="number"&&typeof d.lon==="number"&&d.lat>40.4&&d.lat<41&&d.lon>-74.3&&d.lon<-73.6)?[d.lat,d.lon]:EVENT_GEO[r.e.id];
    if(!g) return null; const [x,y]=mapXY(g[0],g[1]); let st=evStatus(r,mapNow());
    if(state.mapD&&(st.k==="today"||st.k==="live")){ const dn=DAY_SHORT[mapDay().getDay()]; st={k:st.k,chip:st.k==="live"?"On "+dn:st.chip.replace("Today",dn),line:st.line.replace(/^Today/,dn).replace(/^On now/,"On "+dn+" at "+hmText(state.mapT===null?0:state.mapT))}; }
    return {r,id:r.e.id,x,y,st,day:st.chip}; }).filter(Boolean); }
let MAP_ASPECT = 1.35; const MAP_LIM = {x:[250,880], y:[70,860], w:[6,560]};
const posOnMap = () => { if(!state.pos) return false; const [x,y]=mapXY(state.pos.lat,state.pos.lon); return x>=MAP_LIM.x[0]+10&&x<=MAP_LIM.x[1]-10&&y>=MAP_LIM.y[0]+10&&y<=MAP_LIM.y[1]-10; };
function offMapMsg(){ const c=CITIES[state.city], mi=state.pos&&typeof c.lat==="number"?kmBetween(state.pos,{lat:c.lat,lon:c.lon})/1.609:null;
  mapNote("You are "+(mi!==null?"about "+Math.round(mi)+" miles from "+c.name+", ":"")+"outside the area this map covers, so it stays on the city"+(state.mapHead?" and turns around the middle of the view":"")+". It centres on you once you are in town."); }
/* A short note floating over the top of the map, gone after a few seconds or on tap. */
function mapNote(t){ const m=$("map"); if(!m) return; let el=$("mapNote"); if(!el){ m.insertAdjacentHTML("beforeend",'<div class="mnote" id="mapNote" role="status"></div>'); el=$("mapNote"); el.addEventListener("click",()=>{ el.hidden=true; }); }
  el.textContent=t; el.hidden=false; clearTimeout(mapNote.tm); mapNote.tm=setTimeout(()=>{ el.hidden=true; },9000); }
const mapPreset = k => { if(k==="me"&&posOnMap()){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); return {cx:x,cy:y,w:110}; }
  return k==="man" ? {cx:486,cy:386,w:196} : k==="bk" ? {cx:520,cy:500,w:250} : {cx:576,cy:462,w:492}; };
const MAP_PRESETS = [["city","Whole city"],["man","Manhattan"],["bk","Downtown and Brooklyn"]];
let mapV = null, mapAnim = 0;
const mapClamp = v => { v.w=Math.min(MAP_LIM.w[1],Math.max(MAP_LIM.w[0],v.w)); v.cx=Math.min(MAP_LIM.x[1],Math.max(MAP_LIM.x[0],v.cx)); v.cy=Math.min(MAP_LIM.y[1],Math.max(MAP_LIM.y[0],v.cy)); return v; };
function mapFly(to){ if(state.mapHead) headUp(false); cancelAnimationFrame(mapAnim); const from=Object.assign({},mapV), t0=performance.now(), still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  mapClamp(to); if(still){ mapV=to; mapDraw(); return; }
  const step=now=>{ const k=Math.min(1,(now-t0)/380), e=1-Math.pow(1-k,3); mapV={cx:from.cx+(to.cx-from.cx)*e, cy:from.cy+(to.cy-from.cy)*e, w:from.w*Math.pow(to.w/from.w,e)}; mapDraw(); if(k<1) mapAnim=requestAnimationFrame(step); };
  mapAnim=requestAnimationFrame(step); }
const mapTxt = (lat,lon,t,cls,size,rot) => { const [x,y]=mapXY(lat,lon); return '<text x="'+x.toFixed(0)+'" y="'+y.toFixed(0)+'" font-size="'+size+'" text-anchor="middle" class="'+cls+'"'+(rot?' transform="rotate('+rot+' '+x.toFixed(0)+' '+y.toFixed(0)+')"':'')+'>'+t+'</text>'; };
const mapLine = (a,b) => { const p=mapXY(a[0],a[1]), q=mapXY(b[0],b[1]); return 'M'+p[0].toFixed(1)+' '+p[1].toFixed(1)+'L'+q[0].toFixed(1)+' '+q[1].toFixed(1); };
function mapShell(box){
  const R=MAPD_ROADS, road=(k,c)=>R[k]?'<use href="#rd-'+k+'" class="m-rd '+c+'"/>':'';
  const defs='<defs>'+Object.keys(R).map(k=>'<path id="rd-'+k+'" d="'+R[k]+'" class="m-rdp"/>').join("")+'<path id="ld-land" d="'+MAPD_LAND+'"/><path id="ld-park" d="'+MAPD_PARK+'"/>'+
    '<pattern id="pWater" patternUnits="userSpaceOnUse" width="1.2" height="0.6"><path d="M0 .3h.42M.7 .12h.36" class="m-texw"/></pattern>'+
    '<pattern id="pPark" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(20)"><circle cx="3" cy="3" r="1.1" class="m-texp"/><circle cx="9" cy="9" r="1.1" class="m-texp"/></pattern>'+
    '<radialGradient id="spotG"><stop offset="55%" stop-color="#000"/><stop offset="100%" stop-color="#fff"/></radialGradient></defs>';
  const LAYER_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 8.5 12 14l10-5.5L12 3Z"/><path d="m2 12.5 10 5.5 10-5.5M2 16.5 12 22l10-5.5"/></svg>';
  box.innerHTML=
    '<div class="mapwrap" id="mapWrap"><div class="maprot" id="mapRot"><svg class="mapsvg" id="mapSvg" role="group" aria-label="Map of shooting places. Drag to move, pinch to zoom."><rect x="-500" y="-500" width="2500" height="2500" class="m-sea"/>'+defs+'<rect x="-500" y="-500" width="2500" height="2500" class="m-tex m-seatex" fill="url(#pWater)"/>'+
    '<g transform="scale(0.1)" class="m-base"><path d="'+MAPD_CTX+'" class="m-ctx"/><use href="#ld-land" class="m-coastglow"/><use href="#ld-land" class="m-land"/><path d="'+MAPD_AIR+'" class="m-air"/><path d="'+MAPD_CEM+'" class="m-cem"/><use href="#ld-park" class="m-park"/><use href="#ld-park" class="m-tex m-parktex" fill="url(#pPark)"/></g>'+
    '<g transform="scale(0.1)" class="m-roads m-rdc">'+road("path","foot")+road("local","local")+road("ave","ave")+road("hwy","hwy")+'</g>'+
    '<g transform="scale(0.1)" class="m-roads m-rdf">'+road("path","foot")+road("local","local")+road("ave","ave")+road("hwy","hwy")+'</g>'+
    '<g transform="scale(0.1)" class="m-subway">'+MAPD_SUBWAY.map(([c,d])=>'<path d="'+d+'" stroke="'+c+'"/>').join("")+'</g>'+
    mapTxt(40.787,-73.957,"MANHATTAN","m-boro",15,-61)+mapTxt(40.648,-73.95,"BROOKLYN","m-boro",22)+mapTxt(40.705,-73.825,"QUEENS","m-boro",22)+mapTxt(40.845,-73.86,"THE BRONX","m-boro",18)+mapTxt(40.585,-74.14,"STATEN ISLAND","m-boro",16)+mapTxt(40.765,-74.085,"NEW JERSEY","m-boro",15)+
    mapTxt(40.772,-74.004,"Hudson River","m-water",7,-62)+mapTxt(40.672,-74.045,"Upper Bay","m-water",8)+mapTxt(40.612,-73.845,"Jamaica Bay","m-water",8)+mapTxt(40.558,-73.905,"Atlantic Ocean","m-water",9)+mapTxt(40.7385,-73.9665,"East River","m-water",5,-68)+
    '<g id="mapDyn"></g><g id="mapPhotos">'+(PHOTOS_INLINE?Object.entries(PLACE_PHOTO).map(([id,P])=>'<clipPath id="pc-'+id+'"><circle r="1"/></clipPath><image data-ph="'+id+'" href="'+esc(P.src)+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc-'+id+')" style="display:none" onerror="this.remove()"/>').join(""):'')+'</g><g id="mapOver"></g></svg></div></div>'+
    '<div class="mtop"><div class="mrow"><div class="mapgo"><select id="mapGo" aria-label="Go to a place"></select></div><button type="button" class="mlayersbtn" id="mapLayersBtn" aria-expanded="false" aria-controls="mapLayers" title="Map layers">'+LAYER_ICON+'<span>Layers</span><i id="mapLiveDot" hidden></i></button></div>'+
    '<div class="intents mchips" id="mapIntent"></div></div>'+
    '<div class="mlayers" id="mapLayers" hidden></div><div class="mguide" id="mapGuide" role="status" aria-live="polite" hidden></div>'+
    '<div class="mapbtns"><button type="button" data-full="1" aria-label="Full screen map" title="Full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="ico-open" d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path class="ico-close" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg></button><button type="button" data-zoom="0.6" aria-label="Zoom in">+</button><button type="button" data-zoom="1.6" aria-label="Zoom out">−</button><button type="button" data-fit="1" aria-label="Show the whole city" title="Whole city">⌂</button><button type="button" data-locate="1" aria-label="Find me on the map" title="Find me">◎</button><button type="button" data-lightf="1" aria-label="Best light where I am: where to point the camera and the settings" title="Light here"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg></button><button type="button" data-head="1" aria-pressed="false" aria-label="Turn the map the way I am facing" title="Turn the map the way I am facing"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path class="nd-n" d="M12 3.5 14.6 12H9.4Z"/><path class="nd-s" d="M12 20.5 9.4 12h5.2Z"/></svg></button></div>'+
    '<div class="mnorth" id="mapNorth" hidden aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2 17 14H7Z" class="n"/><path d="M12 22 7 14h10Z" class="s"/></svg><span>N</span></div>'+
    '<div class="mapscale" id="mapScale"></div>'+
    '<section class="msheet" id="mapSheet" aria-label="Map details"><div class="mgrab" id="mapGrab" role="button" tabindex="0" aria-label="Show more or less"><i></i></div>'+
      '<div class="sunbar"><div class="sunrow"><div class="slidecol"><input type="range" id="mapTime" min="0" max="1435" step="5" aria-label="Time of day on the map"><div id="lightTicks" class="lticks"></div><div id="wxStrip"></div></div><button type="button" class="chip" id="mapTimeNow">Now</button></div><div class="intents mdays" id="mapDays"></div><p id="mapStatus" class="mstatus"></p></div>'+
      '<div class="mbody" id="mapBody"><div id="mapPlanSheet" class="mplansheet" hidden><div class="mplanhead"><b>Plan an outing</b><button type="button" class="mapselx" data-closeplan="1" aria-label="Close the plan">×</button></div><div id="mapPlanBody"></div></div><div id="mapPanel"></div><div id="mapPlan"></div><div class="msec"><div id="lightMarks" class="intents lmarks"></div><div id="wxBar"></div><p id="sunLine" class="sunline"></p></div><div id="mapLegend" class="msec"></div></div></section>';
  mapGestures($("mapSvg")); sheetGestures();
}
/* A photograph for each place, shown in its pin (installed app only; the Claude version cannot load outside images). Wikimedia Commons, credited in the place panel. */
const PLACE_PHOTO = {"chinatown":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Chinatown-manhattan-2004.jpg/250px-Chinatown-manhattan-2004.jpg","page":"https://commons.wikimedia.org/wiki/File:Chinatown-manhattan-2004.jpg","by":"Derek Jensen (Tysto)","lic":"Public domain"},"gct":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Grand_Central_Terminal_main_concourse_looking_west_Jan_2025.jpg/250px-Grand_Central_Terminal_main_concourse_looking_west_Jan_2025.jpg","page":"https://commons.wikimedia.org/wiki/File:Grand_Central_Terminal_main_concourse_looking_west_Jan_2025.jpg","by":"4300streetcar","lic":"CC BY 4.0"},"tsq":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Times_Square%2C_New_York_2019_23.jpg/250px-Times_Square%2C_New_York_2019_23.jpg","page":"https://commons.wikimedia.org/wiki/File:Times_Square,_New_York_2019_23.jpg","by":"dconvertini","lic":"CC BY-SA 2.0"},"wsp":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Washington_Square_Arch_%281%29_01.jpg/250px-Washington_Square_Arch_%281%29_01.jpg","page":"https://commons.wikimedia.org/wiki/File:Washington_Square_Arch_(1)_01.jpg","by":"PortableNYCTours","lic":"CC BY-SA 4.0"},"dumbo":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Manhattan_Bridge_view_from_Washington_Street_DUMBO_Brooklyn_Morning_2022.jpg/250px-Manhattan_Bridge_view_from_Washington_Street_DUMBO_Brooklyn_Morning_2022.jpg","page":"https://commons.wikimedia.org/wiki/File:Manhattan_Bridge_view_from_Washington_Street_DUMBO_Brooklyn_Morning_2022.jpg","by":"Eugene Krasnaok","lic":"CC BY 4.0"},"coney":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Denos_Wonder_Wheel-2.jpg/250px-Denos_Wonder_Wheel-2.jpg","page":"https://commons.wikimedia.org/wiki/File:Denos_Wonder_Wheel-2.jpg","by":"Kris Arnold","lic":"CC BY-SA 2.0"},"soho":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/28_Greene_St%2C_New_York_City-L1002592.jpg/250px-28_Greene_St%2C_New_York_City-L1002592.jpg","page":"https://commons.wikimedia.org/wiki/File:28_Greene_St,_New_York_City-L1002592.jpg","by":"Frank Schulenburg","lic":"CC BY-SA 4.0"},"jh":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/82_Street_vc.jpg/250px-82_Street_vc.jpg","page":"https://commons.wikimedia.org/wiki/File:82_Street_vc.jpg","by":"Doug Letterman","lic":"CC BY 2.0"},"ferry":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Staten_Island_Ferry_%2851490632968%29.jpg/250px-Staten_Island_Ferry_%2851490632968%29.jpg","page":"https://commons.wikimedia.org/wiki/File:Staten_Island_Ferry_(51490632968).jpg","by":"Eden, Janine and Jim","lic":"CC BY 2.0"},"harlem":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Apollo_Theater%2C_Harlem_%282011%29.jpg/250px-Apollo_Theater%2C_Harlem_%282011%29.jpg","page":"https://commons.wikimedia.org/wiki/File:Apollo_Theater,_Harlem_(2011).jpg","by":"Jujus367","lic":"CC BY-SA 3.0"},"les":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/97_Orchard_Street_Front.jpg/250px-97_Orchard_Street_Front.jpg","page":"https://commons.wikimedia.org/wiki/File:97_Orchard_Street_Front.jpg","by":"Fletcher6","lic":"CC BY-SA 3.0"},"flushing":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Signageage_-_Flickr_-_Payton_Chung.jpg/250px-Signageage_-_Flickr_-_Payton_Chung.jpg","page":"https://commons.wikimedia.org/wiki/File:Signageage_-_Flickr_-_Payton_Chung.jpg","by":"Payton Chung","lic":"CC BY 2.0"},"wburg":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Willliamsburg_Bridge_towards_Manhattan.jpg/250px-Willliamsburg_Bridge_towards_Manhattan.jpg","page":"https://commons.wikimedia.org/wiki/File:Willliamsburg_Bridge_towards_Manhattan.jpg","by":"Sashimi-b","lic":"CC BY 4.0"},"midtown":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Sixth_Avenue_looking_north.jpg/250px-Sixth_Avenue_looking_north.jpg","page":"https://commons.wikimedia.org/wiki/File:Sixth_Avenue_looking_north.jpg","by":"Leifern (English Wikipedia)","lic":"CC BY-SA 3.0"},"cpark":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bethesda_Fountain_and_the_Lake%2C_Central_Park%2C_Manhattan%2C_New_York.jpg/250px-Bethesda_Fountain_and_the_Lake%2C_Central_Park%2C_Manhattan%2C_New_York.jpg","page":"https://commons.wikimedia.org/wiki/File:Bethesda_Fountain_and_the_Lake,_Central_Park,_Manhattan,_New_York.jpg","by":"Christian David","lic":"CC BY-SA 4.0"},"rockaway":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Rockaway_Beach_Boardwalk.jpg/250px-Rockaway_Beach_Boardwalk.jpg","page":"https://commons.wikimedia.org/wiki/File:Rockaway_Beach_Boardwalk.jpg","by":"Kidfly182","lic":"CC BY 4.0"},"arthur":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx%2C_New_York_City_001_crop.jpg/250px-Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx%2C_New_York_City_001_crop.jpg","page":"https://commons.wikimedia.org/wiki/File:Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx,_New_York_City_001_crop.jpg","by":"Leonard J. DeFrancisci","lic":"CC BY-SA 3.0"},"union":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/14th_St_Bway_td_%282018-03-22%29_05_-_Union_Square_Park.jpg/250px-14th_St_Bway_td_%282018-03-22%29_05_-_Union_Square_Park.jpg","page":"https://commons.wikimedia.org/wiki/File:14th_St_Bway_td_(2018-03-22)_05_-_Union_Square_Park.jpg","by":"Tdorante10","lic":"CC BY-SA 4.0"},"fidi":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Wall_Street_-_New_York_Stock_Exchange.jpg/250px-Wall_Street_-_New_York_Stock_Exchange.jpg","page":"https://commons.wikimedia.org/wiki/File:Wall_Street_-_New_York_Stock_Exchange.jpg","by":"Carlos Delgado","lic":"CC BY-SA 3.0"},"ktown":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Koreatown%2C_Manhattan_%2851877264332%29.jpg/250px-Koreatown%2C_Manhattan_%2851877264332%29.jpg","page":"https://commons.wikimedia.org/wiki/File:Koreatown,_Manhattan_(51877264332).jpg","by":"ajay_suresh","lic":"CC BY 2.0"},"bushwick":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Bushwick_Collective_103.jpg/250px-Bushwick_Collective_103.jpg","page":"https://commons.wikimedia.org/wiki/File:Bushwick_Collective_103.jpg","by":"Kidfly182","lic":"CC BY-SA 4.0"},"chelsea":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/High_Line%2C_Manhattan%2C_New_York_City%2C_20231001_1722_1459.jpg/250px-High_Line%2C_Manhattan%2C_New_York_City%2C_20231001_1722_1459.jpg","page":"https://commons.wikimedia.org/wiki/File:High_Line,_Manhattan,_New_York_City,_20231001_1722_1459.jpg","by":"Jakub Hałun","lic":"CC BY 4.0"},"brighton":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Brighton_Beach_Avenue_Elevated%2C_and_Tashkent_Supermarket_left_to_it.jpg/250px-Brighton_Beach_Avenue_Elevated%2C_and_Tashkent_Supermarket_left_to_it.jpg","page":"https://commons.wikimedia.org/wiki/File:Brighton_Beach_Avenue_Elevated,_and_Tashkent_Supermarket_left_to_it.jpg","by":"GK tramrunner RU","lic":"CC BY-SA 4.0"}};
/* The sheet over the bottom of the map: peek (time and a status line), half, or full. */
function sheetHeights(){ const m=$("map"), H=m.clientHeight||600, g=$("mapGrab"), sb=m.querySelector(".msheet .sunbar"), peek=Math.round((g?g.offsetHeight:20)+(sb?sb.offsetHeight:80)+6);
  return {peek, half:Math.max(peek+120,Math.round(H*0.5)), full:Math.max(peek+160,H-118), H}; }
function setSheet(st,instant){ const m=$("map"); if(!m||!$("mapSheet")) return; state.sheet=st; const h=sheetHeights()[st];
  const sh=$("mapSheet"); if(instant) sh.classList.add("nomove"); m.style.setProperty("--sheetH",h+"px"); sh.dataset.state=st; if(instant) requestAnimationFrame(()=>sh.classList.remove("nomove")); if(state.mapHead){ headSize(); mapDraw(); }
  $("mapGrab").setAttribute("aria-expanded",st!=="peek"); }
const sheetPx = () => { const m=$("map"); if(!m) return 0; const v=parseFloat(getComputedStyle(m).getPropertyValue("--sheetH")); return isNaN(v)?0:v; };
/* The search bar only moves when the screen changes size, so its height is read at most twice a second: reading it right after a redraw forces the browser to lay out the whole map again. */
let TOP_PX={t:-1e9,v:0};
const topPx = () => { const n=performance.now(); if(n-TOP_PX.t<500) return TOP_PX.v; const t=document.querySelector("#map .mtop"); TOP_PX={t:n,v:t?t.offsetTop+t.offsetHeight:0}; return TOP_PX.v; };
window.addEventListener("resize",()=>{ TOP_PX.t=-1e9; });
/* Aim the map so a point sits in the middle of the part you can see, between the search bar and the sheet. */
function mapAim(to){ const svg=$("mapSvg"); if(!svg) return to; const k=to.w/(svg.clientWidth||360); return {cx:to.cx, cy:to.cy+(sheetPx()-topPx())/2*k, w:to.w}; }
function sheetGestures(){ const g=$("mapGrab"), sh=$("mapSheet"), peek=sh.querySelector(".mstatus"); let d=null;
  const down=e=>{ if(e.button>0) return; d={y:e.clientY,h:sheetPx(),moved:false}; sh.classList.add("nomove"); try{ e.currentTarget.setPointerCapture(e.pointerId); }catch(err){} };
  const move=e=>{ if(!d) return; const dy=e.clientY-d.y; if(Math.abs(dy)>5) d.moved=true; if(!d.moved) return; const H=sheetHeights(); $("map").style.setProperty("--sheetH",Math.max(H.peek,Math.min(H.full,d.h-dy))+"px"); };
  const up=e=>{ if(!d) return; sh.classList.remove("nomove"); const H=sheetHeights(), now=sheetPx(), was=d; d=null;
    if(!was.moved){ setSheet(state.sheet==="peek"?"half":state.sheet==="half"?"full":"peek"); return; }
    const pick=["peek","half","full"].sort((a,b)=>Math.abs(H[a]-now)-Math.abs(H[b]-now))[0]; setSheet(pick); };
  for(const el of [g,peek]){ el.addEventListener("pointerdown",down); el.addEventListener("pointermove",move); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up); }
  g.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); setSheet(state.sheet==="peek"?"half":state.sheet==="half"?"full":"peek"); } }); }
/* Size the map to fill the screen under the header. */
function mapLayout(){ const m=$("map"); if(!m||state.view!=="map") return; if(state.mapFull) m.style.height=""; else { const top=m.getBoundingClientRect().top+window.scrollY; m.style.height=Math.max(440,Math.round(window.innerHeight-top-10-($("views").getBoundingClientRect().height||0)))+"px"; }
  setSheet(state.sheet||"peek",true); headSize(); mapDraw(); }
/* Map layers you can turn on and off */
const MAP_LAYERS = [["mapShowEv","Events","Upcoming events, and what is on now","lg ev"],["mapShowLm","Landmarks","Buildings, views and bridge walkway entrances, with tips","lg lmk"],["mapShowSub","Subway lines","In MTA colours","lg sub"],["mapShowStn","Stations","Every subway station when zoomed in","lg stn"],
  ["mapShowSunny","Sunny side","Which side of each street is in sun, while the sun is up","lg sunny"],["mapShowHenge","Light down the street","Streets that line up with the low sun on this day, and when","lg henge"],["mapShowFerry","Ferries","NYC Ferry and Staten Island Ferry routes, and which side of the boat has the light","lg ferry"],["mapShowSpots","Where to stand","Spots and lens wedges when zoomed in","lg spot"],["mapShowNames","Street and area names","","lg names"]];
function mapLayersHtml(nLive){ return '<div class="mlayers-head"><b>Map layers</b><button type="button" class="mapselx" data-layersclose="1" aria-label="Close">×</button></div>'+
  MAP_LAYERS.map(([k,t,sub,ic])=>'<button type="button" class="mlayer" data-layer="'+k+'" aria-pressed="'+!!state[k]+'"><span class="'+ic+'"></span><span class="t"><b>'+t+(k==="mapShowEv"&&nLive?' · '+nLive+' on now':'')+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</span><span class="sw" aria-hidden="true"></span></button>').join("")+
  '<p class="mlayers-sub">Jump to</p><div class="intents" id="mapZoom">'+MAP_PRESETS.concat(posOnMap()?[["me","Near me"]]:[]).map(z=>'<button type="button" class="chip" data-z="'+z[0]+'">'+z[1]+'</button>').join("")+'<button type="button" class="chip" data-nearspots="1">Spots near me</button></div>'; }

/* Sun on the map: position of the sun for the map's time (now, or a time picked on the slider). Azimuth in degrees from north. */
function sunPos(date,lat,lon){ const rad=Math.PI/180, e=rad*23.4397, d=date/864e5-0.5+2440588-2451545, M=rad*(357.5291+0.98560028*d),
  C=rad*(1.9148*Math.sin(M)+0.02*Math.sin(2*M)+0.0003*Math.sin(3*M)), L=M+C+rad*102.9372+Math.PI, dec=Math.asin(Math.sin(e)*Math.sin(L)), ra=Math.atan2(Math.sin(L)*Math.cos(e),Math.cos(L)),
  th=rad*(280.16+360.9856235*d)-rad*(-lon), H=th-ra, phi=lat*rad;
  const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi)), alt=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H));
  return {az:((az/rad+180)%360+360)%360, alt:alt/rad}; }
/* Moon: position, phase and rise/set (after the SunCalc formulas, accurate to a degree or so, plenty for planning). Azimuth in degrees from north. */
function moonPos(date,lat,lon){ const rad=Math.PI/180, e=rad*23.4397, d=date/864e5-0.5+2440588-2451545;
  const L=rad*(218.316+13.176396*d), M=rad*(134.963+13.064993*d), F=rad*(93.272+13.229350*d), l=L+rad*6.289*Math.sin(M), b=rad*5.128*Math.sin(F), dist=385001-20905*Math.cos(M);
  const ra=Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l)), dec=Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
  const H=rad*(280.16+360.9856235*d)+lon*rad-ra, phi=lat*rad;
  let alt=Math.asin(Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H)); const h=Math.max(alt,0); alt+=0.0002967/Math.tan(h+0.00312536/(h+0.08901179));
  const az=Math.atan2(Math.sin(H),Math.cos(H)*Math.sin(phi)-Math.tan(dec)*Math.cos(phi));
  // phase, from the sun's position
  const Ms=rad*(357.5291+0.98560028*d), C=rad*(1.9148*Math.sin(Ms)+0.02*Math.sin(2*Ms)+0.0003*Math.sin(3*Ms)), Ls=Ms+C+rad*102.9372+Math.PI;
  const sdec=Math.asin(Math.sin(e)*Math.sin(Ls)), sra=Math.atan2(Math.sin(Ls)*Math.cos(e),Math.cos(Ls)), sdist=149598000;
  const ph=Math.acos(Math.sin(sdec)*Math.sin(dec)+Math.cos(sdec)*Math.cos(dec)*Math.cos(sra-ra)), inc=Math.atan2(sdist*Math.sin(ph),dist-sdist*Math.cos(ph));
  const ang=Math.atan2(Math.cos(sdec)*Math.sin(sra-ra),Math.sin(sdec)*Math.cos(dec)-Math.cos(sdec)*Math.sin(dec)*Math.cos(sra-ra));
  return {az:((az/rad+180)%360+360)%360, alt:alt/rad, frac:(1+Math.cos(inc))/2, phase:0.5+0.5*inc*(ang<0?-1:1)/Math.PI}; }
/* Rise and set within the local day of `day`, in minutes after midnight (null if it does not happen that day). */
function moonTimes(day,lat,lon){ const d0=new Date(day); d0.setHours(0,0,0,0); const h0=0.133; let rise=null, set=null, prev=moonPos(d0,lat,lon).alt-h0;
  for(let m=10;m<=1440;m+=10){ const cur=moonPos(new Date(+d0+m*6e4),lat,lon).alt-h0;
    if(prev<0&&cur>=0&&rise===null) rise=Math.round(m-10+10*(-prev)/(cur-prev)); if(prev>=0&&cur<0&&set===null) set=Math.round(m-10+10*prev/(prev-cur)); prev=cur; }
  return {rise,set}; }
const moonName = m => { const wax=m.phase<0.5; return m.frac>=0.97?"Full moon":m.frac<=0.03?"New moon":m.frac>=0.45&&m.frac<=0.55?(wax?"First quarter":"Last quarter"):(wax?"Waxing ":"Waning ")+(m.frac<0.5?"crescent":"gibbous"); };
const COMPASS = ["north","north-northeast","northeast","east-northeast","east","east-southeast","southeast","south-southeast","south","south-southwest","southwest","west-southwest","west","west-northwest","northwest","north-northwest"];
const compass = a => COMPASS[Math.round(((a%360)+360)%360/22.5)%16];
/* The map's day and time: today and now unless a day chip (mapD, days ahead) or the slider (mapT, minutes) has been set. */
const mapDay = () => { const d=new Date(); d.setHours(0,0,0,0); if(state.mapD) d.setDate(d.getDate()+state.mapD); return d; };
const mapIsNow = () => state.mapT===null && !state.mapD;
const mapNow = () => { if(mapIsNow()) return new Date(); const n=new Date(); return new Date(+mapDay()+(state.mapT===null?n.getHours()*60+n.getMinutes():state.mapT)*6e4); };
const mapDayName = () => { const t=mapDay(); return !state.mapD?"Today":state.mapD===1?"Tomorrow":DAY_SHORT[t.getDay()]+" "+t.toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
function sunPhase(alt){ return alt>6?"day":alt>-4?"gold":alt>-6?"blue":"night"; }
const SUN_PHASE = {day:"Daylight",gold:"Golden hour",blue:"Blue hour",night:"Night"};
const cc_isNYC = () => state.city==="nyc";
function sunLine(){ const c=CITIES[state.city], t=mapNow(), sp=sunPos(t,c.lat,c.lon), ph=sunPhase(sp.alt), tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  const [rise,set]=sunTimes(t,c.lat,c.lon); let out='<b>'+(state.mapD?mapDayName()+', ':'')+tf(t)+(mapIsNow()?' (now)':'')+' · '+SUN_PHASE[ph]+'</b><br>';
  if(sp.alt>-0.8){ out+='Sun '+Math.max(0,Math.round(sp.alt))+'° up in the '+compass(sp.az)+'. Shadows fall to the '+compass(sp.az+180)+'.';
    const d=(a,b)=>{ const x=Math.abs(((a-b)%360+540)%360-180); return Math.min(x,180-x); };
    if(cc_isNYC()){ const lit=(face)=>Math.cos((sp.az-face)*Math.PI/180)>0.12, ave=lit(299)?"east side of the avenues":lit(119)?"west side of the avenues":"", st=lit(209)?"north side of the cross streets":lit(29)?"south side of the cross streets":"";
      if(ave||st) out+=' Sunny side: '+[ave,st].filter(Boolean).join(" and ")+(sp.alt<20?', on the upper floors more than the pavement while the sun is this low':'')+'.'; }
    const hn=hengeNow(); if(hn.length) out+=' Light runs straight down '+(hn.length===1?'one street':hn.length+' streets')+' in the city right now: the bright gold lines on the map.'; else if(sp.alt<25&&!state.mapShowHenge){ if(d(sp.az,119)<9) out+=' The sun is lined up with Manhattan\u2019s cross streets: light runs straight down them.'; else if(d(sp.az,29)<9) out+=' The sun is lined up with the Manhattan avenues: light runs straight down them.'; } }
  else out+='Sun is down, '+Math.round(-sp.alt)+'° below the horizon.';
  const f=hourlyAt(t), sk=skyAt(t); if(f) out+='<br>Forecast for this hour: '+(sk?WX_WORD[sk]:"no rain, "+(f.cc>=50?"some cloud":"mostly clear"))+(f.pop!=null?' ('+f.pop+'% chance of rain)':'')+'.'+(sk==="rain"&&ph!=="night"?' Pins show rain ideas for this hour.':'');
  const mo=moonPos(t,c.lat,c.lon), mt=moonTimes(t,c.lat,c.lon), mm=v=>v===null?null:hmText(Math.min(1439,v));
  out+='<br>Moon: '+moonName(mo).toLowerCase()+', '+Math.round(mo.frac*100)+'% lit, '+(mo.alt>0?Math.round(mo.alt)+'° up in the '+compass(mo.az):'below the horizon')+'.'+
    (mt.rise!==null?' Rises about '+mm(mt.rise)+(mt.rise>0?' in the '+compass(moonPos(new Date(new Date(t).setHours(0,mt.rise,0,0)),c.lat,c.lon).az):'')+'.':'')+(mt.set!==null?' Sets about '+mm(mt.set)+'.':'');
  return out+'<br><span class="sunrs">Sunrise '+tf(rise)+' · Sunset '+tf(set)+'</span>'; }
/* Where to stand: two or three spots per place, the way to face (degrees from north), and the idea each one serves. Positions are approximate. */
const SPOTS = {"chinatown":[[40.7146,-73.998,165,"Pell Street end of Doyers","Look down the bend in Doyers Street and wait for someone to walk into it.","chinatown-place"],[40.717,-73.9983,295,"Canal Street at Mott Street","Shoot into the stream of shoppers from the corner; the crowd thickens towards Broadway.","chinatown-energy"],[40.7157,-73.9997,220,"Columbus Park tables","Card and mahjong players with onlookers crowding round; ask before going close.","chinatown-odd"],[40.7187,-73.9962,299,"Mott Street stalls, Grand to Hester","Stand beside a stall's scale and face across it, so seller and buyer share the frame.","chinatown-moment"],[40.7155,-73.9984,299,"Mott Street at Bayard Street","Restaurant windows on Mott after dark; get close to the glass.","chinatown-mood"]],"gct":[[40.7527,-73.9776,119,"West balcony","From the top of the west stairs the whole concourse opens out, with the clock in the middle.","gct-place"],[40.7527,-73.977,299,"Beside the information booth","Five metres off the clock, facing the west stairs: people meeting, waving, hugging.","gct-moment"],[40.7524,-73.977,209,"Whispering gallery","The tiled arches outside the Oyster Bar, one level down. Two people whispering into opposite corners.","gct-odd"],[40.7527,-73.9777,119,"West stair rail","Brace on the rail at the top of the west stairs and look across the concourse.","gct-energy"],[40.7524,-73.9772,209,"Main concourse, south side","Watch the floor below the tall 42nd Street windows for the brightest patches.","gct-mood"]],"tsq":[[40.759,-73.9849,209,"Top of the red steps","Look down Broadway and Seventh Avenue over the crowd and the screens.","tsq-place"],[40.7559,-73.9871,209,"Subway exit at 42nd Street","Stand just north of the subway stairs, facing them, with the screens behind you. People look up past you as they reach the street.","tsq-moment"],[40.7577,-73.9858,29,"Plaza at 45th Street, low","Crouch low after rain so the plaza reflects the screens.","tsq-mood"],[40.7579,-73.9857,29,"Plaza at 45th Street, under the screens","Hold one frame while the screens change colour above the crowd.","tsq-energy"],[40.757,-73.9866,299,"Plaza edge at 44th Street","Performers take breaks at the edges of the plaza and on the side streets.","tsq-odd"]],"wsp":[[40.7307,-73.9973,29,"South of the fountain","The arch with Fifth Avenue running away behind it.","wsp-place"],[40.7302,-73.9993,60,"Chess tables","Southwest corner by MacDougal Street: players, clocks and onlookers.","wsp-moment"],[40.7309,-73.997,209,"The fountain rim","Performers and crowds round the fountain; shoot across the water.","wsp-energy"],[40.7311,-73.9985,255,"Western paths","Face into the afternoon sun along the paths on the west side of the park.","wsp-mood"],[40.7311,-73.9972,209,"Around the fountain and arch","The regulars set up near the fountain and the arch; talk first, shoot after.","wsp-odd"],[40.7302,-73.9993,60,"Chess tables, south-west corner","Get low across a table so the leaves fill the top of the frame.","wsp-mood-s"]],"dumbo":[[40.7033,-73.9895,340,"Washington Street at Water Street","The Manhattan Bridge with the Empire State Building framed under its arch. Busy all day.","dumbo-place"],[40.7038,-73.9907,255,"Pebble Beach","The Lower Manhattan skyline and the Brooklyn Bridge across the water; best at blue hour.","dumbo-mood"],[40.7034,-73.988,200,"Under the Manhattan Bridge arches","Light at the far end of the archway, people crossing it, the trains rumbling overhead.","dumbo-energy"],[40.7029,-73.9894,300,"Washington Street, beside the shoots","Stand to one side of the couples and wedding parties posing in the street.","dumbo-moment"],[40.704,-73.9873,90,"Plymouth Street at Pearl Street","Old freight rails run along the cobbles here; get low and follow them.","dumbo-odd"],[40.6927,-73.9753,180,"Fort Greene Park, north slope","Look up the slope from the Myrtle Avenue side to the monument column, with the paths climbing through the trees.","dumbo-place-s"]],"coney":[[40.5718,-73.985,80,"Boardwalk west of the Wonder Wheel","Shoot east along the planks with the wheel rising on the left third.","coney-place"],[40.5753,-73.9776,180,"Surf Avenue by the Cyclone","Faces and raised arms on the first drop.","coney-moment"],[40.5727,-73.9832,255,"Boardwalk at Stillwell Avenue","The boardwalk running away into the haze; best empty, out of season.","coney-mood"],[40.5748,-73.978,180,"Luna Park fence","Brace on the fence and keep someone waiting at the ride sharp while it spins.","coney-energy"],[40.5751,-73.9802,180,"Surf Avenue at West 12th Street","Hand-painted banners and signs along Surf Avenue around the sideshow.","coney-odd"]],"soho":[[40.7256,-73.9992,209,"Greene Street at Prince Street","Cast-iron facades lining up down the street.","soho-place"],[40.7224,-74.0017,29,"Greene Street at Broome Street","Fire-escape shadows across the facades when the sun is on them.","soho-mood"],[40.7243,-73.9976,299,"Prince Street at Broadway","People stepping off the curb into the crossing.","soho-energy"],[40.725,-73.9985,29,"Prince Street, Greene to Mercer","Stand at the kerb on the north side of Prince Street and frame a shop doorway across the pavement.","soho-moment"],[40.724,-74.0005,70,"Spring Street shop windows","Stand at an angle to a window until a mannequin and a reflected walker line up.","soho-odd"]],"jh":[[40.7467,-73.8915,80,"Roosevelt Avenue at 74th Street","Under the elevated 7: light falls through the tracks in stripes.","jh-place"],[40.7472,-73.8922,270,"Diversity Plaza","Food carts, shoppers and stacked signs in a dozen languages.","jh-moment"],[40.7474,-73.8846,260,"Roosevelt Avenue at 82nd Street","Neon, traffic and the train overhead at dusk.","jh-energy"],[40.747,-73.888,260,"Roosevelt Avenue at 78th Street","Sun through the elevated tracks lays stripes across the street around midday.","jh-mood"],[40.748,-73.8918,90,"74th Street, Roosevelt to 37th Avenue","A run of shopfronts with signs in several languages, shot square-on.","jh-odd"]],"ferry":[[40.693,-74.02,30,"The stern, heading out","The Lower Manhattan skyline pulling away behind the boat.","ferry-place"],[40.68,-74.03,310,"Right-hand rail, mid-harbour","The Statue of Liberty and the people pointing their phones at it.","ferry-moment"],[40.7013,-74.0131,209,"Whitehall waiting room","The surge when the doors open for boarding.","ferry-energy"],[40.675,-74.04,270,"West-side windows, heading out","Sit by a west-facing window on the boat before sunset.","ferry-mood"],[40.69,-74.023,300,"Inside the main cabin","Sit across the aisle from a regular, with the tourists at the rail behind.","ferry-odd"]],"harlem":[[40.8104,-73.9496,209,"125th Street across from the Apollo","The marquee and the busy sidewalk; the sign lights up at dusk.","harlem-place"],[40.8162,-73.9409,209,"Abyssinian Baptist Church, 138th Street","Hats and suits after Sunday morning service; be respectful.","harlem-moment"],[40.8049,-73.9455,299,"West 122nd Street, Mount Morris Park","Brownstone stoops west of Marcus Garvey Park; at dusk the sky behind Lenox Avenue holds the last light.","harlem-mood"],[40.8085,-73.9465,299,"125th Street near Lenox Avenue","Vendors' tables and music along the pavement; brace on a lamppost.","harlem-energy"],[40.8094,-73.9483,29,"Side streets off 125th Street","Look for murals and hand-lettered signs just off the main street.","harlem-odd"],[40.8044,-73.9458,299,"West 121st Street brownstones","Shoot along the row from the kerb so the stoops repeat under the trees.","harlem-place-s"]],"les":[[40.7188,-73.9905,29,"Orchard Street at Broome Street","Fire escapes zigzagging up the tenements.","les-place"],[40.7183,-73.9881,119,"Essex Market counters","Vendors and customers across the counters.","les-moment"],[40.7175,-73.9855,119,"Williamsburg Bridge ramp","Cyclists and walkers coming off the bridge at Delancey Street.","les-energy"],[40.7206,-73.9879,119,"Ludlow Street at Rivington Street","Bar and deli neon in the windows after dark.","les-mood"],[40.718,-73.991,119,"Orchard Street, Broome to Grand","Old shop names still painted above new tenants, shot square-on.","les-odd"]],"flushing":[[40.7596,-73.83,0,"Main Street at Roosevelt Avenue","One of the busiest crossings in the city; shoot into the crowd.","flushing-place"],[40.7591,-73.8303,20,"Subway stairs on Main Street","Waves of people rising out of the 7 train.","flushing-energy"],[40.759,-73.8318,90,"New World Mall food court","Trays, steam and counters downstairs.","flushing-moment"],[40.757,-73.8295,90,"Main Street at 41st Avenue","Small street-food windows lit after dark; stand at an angle to one.","flushing-mood"],[40.7563,-73.829,270,"Main Street produce stands","Fruit and seafood displays spilling onto the pavement; get low and close.","flushing-odd"]],"wburg":[[40.7143,-73.968,240,"Domino Park waterfront","The Williamsburg Bridge and the Manhattan skyline; the sun sets across the river.","wburg-place"],[40.7172,-73.9567,210,"Bedford Avenue at North 7th Street","Saturday crowds by the subway entrance.","wburg-energy"],[40.7106,-73.964,300,"Under the bridge at Broadway","Steel, shadow and the trains overhead.","wburg-mood"],[40.7205,-73.952,29,"McCarren Park, by the courts","Stand at the side of a court, level with the players waiting their turn.","wburg-moment"],[40.7208,-73.9591,299,"Wythe Avenue at North 6th Street","Large murals in the blocks around here; frame one from across the street.","wburg-odd"]],"midtown":[[40.76,-73.98,29,"Sixth Avenue at 50th Street","Towers on both sides; at midday the sun drops straight into the canyon.","midtown-place"],[40.7584,-73.9719,299,"Seagram Building plaza","Office workers eating lunch on the ledges.","midtown-moment"],[40.7588,-73.977,299,"Fifth Avenue at 50th Street","Crouch at the kerb by St Patrick's and shoot the crowd stepping off toward you across Fifth Avenue.","midtown-energy"],[40.7604,-73.9782,119,"West 52nd Street, off Sixth Avenue","A shaded side street where sun bounces off the glass towers onto the pavement.","midtown-mood"],[40.7616,-73.9792,209,"53rd Street and Sixth Avenue","The halal cart and its lunch queue; stand to the side of the line.","midtown-odd"]],"cpark":[[40.7737,-73.9711,0,"Bethesda Terrace arcade","Through the tiled arcade towards the fountain.","cpark-place"],[40.7752,-73.9706,280,"East shore of the Lake","Bow Bridge side-on, with couples and rowing boats.","cpark-moment"],[40.7712,-73.9737,20,"The Mall","Elms arching over the path; best in fog or rain.","cpark-mood"],[40.7745,-73.9675,29,"East Drive at Cat Hill","A bend in the drive where runners and cyclists stream past; brace on a lamppost.","cpark-energy"],[40.7739,-73.9712,90,"Inside the arcade, to one side","Back to the wall opposite the arches, two metres from the performer, shooting along the tiled hall.","cpark-odd"],[40.7712,-73.9737,20,"South end of the Mall","The elm canopy closes over the path; wait for one dark coat.","cpark-mood-s"],[40.7718,-73.9745,300,"Elms by the Mall","Find a tree dropping leaves in the wind and wait beside it.","cpark-moment-s"]],"rockaway":[[40.5843,-73.8125,70,"Boardwalk at Beach 90th Street","The boardwalk running to the horizon.","rockaway-place"],[40.5835,-73.8125,160,"Beach at Beach 90th Street","Surfers coming out of the water.","rockaway-moment"],[40.5833,-73.8133,160,"Beside the jetty, Beach 90th Street","Surfers take off beside the rock jetties; get as close to the waterline as you can stay dry.","rockaway-energy"],[40.5838,-73.809,160,"Boardwalk steps, Beach 86th Street","Empty winter sand and sea; place the walker near an edge of the frame.","rockaway-mood"],[40.588,-73.8137,270,"Beach 90th Street station platform","Surfers carrying boards through the elevated station.","rockaway-odd"]],"arthur":[[40.8553,-73.8877,180,"Arthur Avenue at 187th Street","Shopfronts, awnings and Saturday shoppers.","arthur-place"],[40.8547,-73.8879,90,"Arthur Avenue Retail Market","Counters inside the market, and cigar rolling at the back.","arthur-odd"],[40.8547,-73.8879,270,"Retail Market counters","Stand at the end of a counter inside the market so both faces are in view.","arthur-moment"],[40.8551,-73.888,180,"Kerb at 187th Street","Crouch at the kerb so the nearest shopper is large and the avenue stacks up behind.","arthur-energy"],[40.8552,-73.8893,0,"East 187th Street cafés","Pastry shops and espresso bars along 187th Street; shoot through the window.","arthur-mood"]],"union":[[40.7365,-73.9915,29,"Union Square West at 16th Street","The Greenmarket stalls and shoppers.","union-place"],[40.7351,-73.9913,119,"West end of the south steps","Brace on the rail at the west end and shoot east along the steps as skaters and commuters pass.","union-energy"],[40.7356,-73.9901,190,"Top of the south steps","The Metronome wall across the street at dusk.","union-mood"],[40.7349,-73.9911,29,"Chess tables, south-west plaza","Stand behind the challenger's shoulder, facing the regular across the board.","union-moment"],[40.735,-73.9902,0,"South plaza","Preachers and sign-holders gather on the south plaza by 14th Street.","union-odd"],[40.7357,-73.9912,170,"Greenmarket pumpkin stalls","Frame a pumpkin stall with the south steps behind it.","union-odd-s"]],"fidi":[[40.7071,-74.0102,200,"Federal Hall steps","Beside the Washington statue, looking south down Broad Street: the Exchange's columns and flags on the right.","fidi-place"],[40.7043,-74.0105,60,"Stone Street","Lunch crowds at the outdoor tables.","fidi-moment"],[40.7114,-74.011,90,"Inside the Oculus","White ribs and reflections on the floor. Handheld only.","fidi-energy"],[40.7064,-74.0098,119,"Exchange Place","A narrow street where a slot of midday sun reaches the pavement.","fidi-mood"],[40.7057,-74.0131,270,"Beside the Charging Bull","Stand at the bull's flank and photograph the queue and the reaching hands.","fidi-odd"]],"ktown":[[40.7478,-73.9876,119,"Korea Way from Broadway","Signs stacked up the buildings on 32nd Street.","ktown-place"],[40.7497,-73.9877,119,"Herald Square crossing","The crowd crossing at 34th Street and Broadway.","ktown-energy"],[40.7476,-73.9862,60,"33rd Street at Fifth Avenue","The Empire State Building above the souvenir shops.","ktown-odd"],[40.75,-73.9889,29,"34th Street, opposite Macy's doors","Stand at the kerb on 34th Street, facing the Macy's doors across the pavement.","ktown-moment"],[40.7476,-73.9868,29,"Korea Way restaurant windows","Restaurants and karaoke bars on 32nd Street; get close to the glass.","ktown-mood"]],"bushwick":[[40.7055,-73.9236,310,"Troutman Street at St Nicholas Avenue","Murals along the block, and people posing in front of them.","bushwick-place"],[40.7062,-73.9245,130,"Troutman Street, looking back","The next run of walls, and warehouse light at dusk.","bushwick-mood"],[40.7056,-73.9232,220,"Beside a wall shoot","Stand to one side so the poser, the photographer and the mural all fit.","bushwick-moment"],[40.6995,-73.9183,135,"Knickerbocker Avenue at Myrtle Avenue","The Saturday shopping street; plant yourself against a shopfront.","bushwick-energy"],[40.7045,-73.922,310,"Troutman Street murals","Painted faces along the Bushwick Collective walls; frame one square-on.","bushwick-odd"]],"chelsea":[[40.7428,-74.0071,29,"High Line over Tenth Avenue","The sunken window looking up Tenth Avenue.","chelsea-place"],[40.7424,-74.0061,119,"Chelsea Market concourse","The long brick hall and the crowd.","chelsea-energy"],[40.742,-74.0103,260,"Little Island","Sunset over the Hudson.","chelsea-mood"],[40.7493,-74.0066,29,"West 24th Street galleries","Stand on the south pavement opposite a lit gallery door on an opening night.","chelsea-moment"],[40.7538,-74.0021,29,"Base of the Vessel","Get close to the copper skin and shoot the reflections.","chelsea-odd"]],"brighton":[[40.5776,-73.9616,80,"Under the el on Brighton Beach Avenue","Stripes of light through the tracks, shoppers below.","brighton-place"],[40.5753,-73.9615,180,"Boardwalk at Brighton 6th Street","Benches, sea and the people on them.","brighton-moment"],[40.575,-73.9617,80,"Boardwalk at the restaurant terraces","Shoot along the row of tables as the strollers pass in front.","brighton-energy"],[40.5753,-73.9655,170,"Boardwalk steps, Brighton 2nd Street","Straight out to sea, with one figure small and low in the frame.","brighton-mood"],[40.5775,-73.9635,0,"Brighton Beach Avenue shop windows","Caviar, smoked fish and nesting dolls; get square to the glass.","brighton-odd"],[40.5752,-73.96,260,"Boardwalk, walking west","Face west into the low autumn sun along the benches.","brighton-mood-s"]]};
const CAM_FOCAL = {q343:43,q328:28,iphone:24,other:35};
const camFov = () => 2*Math.atan(18/(CAM_FOCAL[state.camera]||43))*180/Math.PI;   // horizontal angle of view, full frame equivalent
const angDiff = (a,b) => Math.abs(((a-b)%360+540)%360-180);
/* What light you get facing a direction at time t: into the sun (backlit), across it, or with it behind you. */
function lightFacing(bearing,t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon), ph=sunPhase(sp.alt);
  if(sp.alt<-0.8) return {k:"dark",txt:ph==="blue"?"Blue hour":"After dark"};
  const d=angDiff(bearing,sp.az); return d<=50?{k:"back",txt:"Backlit"}:d>=130?{k:"front",txt:"Front-lit"}:{k:"side",txt:"Side light"}; }
/* The sun relative to a spot: where it sits against the way you face, how high, and where shadows fall. */
function sunRel(face,t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon); if(sp.alt<=0) return null;
  const d=((sp.az-face)%360+540)%360-180, ad=Math.abs(d), where=ad<=12?"straight ahead":ad>=168?"straight behind you":Math.round(ad)+"° to your "+(d>0?"right":"left")+(ad>90?", behind your shoulder":"");
  const len=sp.alt<3?"very long":sp.alt<15?"long, about "+Math.round(1/Math.tan(sp.alt*Math.PI/180))+" times a person\u2019s height":sp.alt<30?"about twice a person\u2019s height":sp.alt<45?"about a person\u2019s height":"short";
  return {sp, d, txt:"Sun "+where+", "+Math.round(sp.alt)+"° up. Shadows fall "+compass(sp.az+180)+", "+len+"."}; }
/* The light facing one way through the map's day: a bar of backlit, side-lit, front-lit and dark, with the hours each one runs. */
function lightStrip(face){ const d=mapDay(), runs=[]; let cur=null;
  for(let m=0;m<1440;m+=5){ const lf=lightFacing(face,new Date(+d+m*6e4)), k=lf.k==="dark"&&lf.txt==="Blue hour"?"blue":lf.k; if(cur&&cur.k===k) cur.e=m+5; else { cur={k,s:m,e:m+5}; runs.push(cur); } }
  const col={back:"#f28a28",side:"#fccc0a",front:"#fff3c4",blue:"#3e63d8",dark:"#1c2340"}, name={back:"Backlit",side:"Side light",front:"Front-lit",blue:"Blue hour",dark:"Dark"};
  const bar='linear-gradient(to right,'+runs.map(r=>col[r.k]+' '+(r.s/1440*100).toFixed(2)+'%,'+col[r.k]+' '+(r.e/1440*100).toFixed(2)+'%').join(",")+')';
  const t=mapNow(), cur_m=t.getHours()*60+t.getMinutes();
  const chips=runs.filter(r=>r.k!=="dark"&&r.e-r.s>=30).map(r=>'<button type="button" class="chip lmark'+(cur_m>=r.s&&cur_m<r.e?' on':'')+'" data-jump="'+r.s+'"><span class="sdot '+(r.k==="blue"?"dark":r.k)+'"></span>'+name[r.k]+' '+hmText(r.s)+' to '+hmText(Math.min(1439,r.e))+'</button>').join("");
  return '<div class="lstrip" role="img" aria-label="Light facing '+compass(face)+' through the day"><div class="lstrip-bar" style="background:'+bar+'"><i style="left:'+(cur_m/1440*100).toFixed(2)+'%"></i></div><span class="lstrip-h">'+['12 am','6 am','noon','6 pm'].map(h=>'<b>'+h+'</b>').join("")+'</span></div><div class="intents lmarks lstrip-runs">'+chips+'</div>'; }
const LIGHT_TIP = {back:"Facing into the sun: silhouettes, rim light and glowing hair. Expose for the bright part.",side:"Sun from the side: texture, depth and long shadows.",front:"Sun behind you: even colour on faces, flatter light. Watch for your own shadow.",dark:"Light comes from windows, signs and street lamps."};
function lightHere(t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon), tf=hmText(t.getHours()*60+t.getMinutes());
  if(sp.alt<-0.8||sp.alt<=0){ const g=lightDay().runs.find(r=>r.ph==="gold"&&r.s>=720), at=g?Math.max(600,Math.round((g.s-90)/5)*5):960;
    return 'Light at '+tf+': the sun is down, so there is no sunny side to show. Light comes from windows, signs and street lamps.<br><button type="button" class="chip sunjump" data-jump="'+at+'">See the sunny side at '+hmText(at)+'</button>'; }
  return 'Light at '+tf+': orange lines on the map mark the sunny side of each street. Face <b>'+compass(sp.az)+'</b> for backlight, <b>'+compass(sp.az+90)+'</b> or <b>'+compass(sp.az-90)+'</b> for side light, <b>'+compass(sp.az+180)+'</b> for front light.'+(sp.alt>45?' The sun is high, so shadows are short and streets are in shade or full sun.':''); }
/* Light here: where you are, which way to point the camera for the best light right now, and the settings for it.
   Uses your position, the phone's compass when it gives one, the sun at your exact spot, the hourly forecast and the street you
   are standing on. Opens full screen, keeps the screen awake, and updates as you turn and every minute. */
const LF = {open:false, watch:null, sel:0, timer:0, wake:null, fallback:false};
/* The sky now, in the words the camera advice uses: clear, partly, cloud, rain, fog, snow or unknown. */
function lfSky(t){ if(WX_KEY==='none') return 'unknown'; const s=skyAt(t); if(s!==undefined){ if(s===null){ const f=hourlyAt(t); return f&&f.cc>=50?"partly":"clear"; } return s==="snow"?"snow":s; }
  const i=nowInfo(); return i.sky==="sun"?"clear":i.sky==="partly"?"partly":i.sky==="storm"?"rain":i.sky||"unknown"; }
/* Scene brightness as EV at ISO 100, from the sun's height and the sky (the sunny-16 rule and its relatives). */
function lfEV(alt,sky){ let ev = alt>=40?15:alt>=20?14.5:alt>=10?14:alt>=6?13:alt>=0?12:alt>=-4?10:alt>=-6?8:7;
  if(alt>=-4){ if(sky==="partly") ev-=0.5; else if(sky==="cloud"||sky==="fog") ev-=2; else if(sky==="rain"||sky==="snow") ev-=3; }
  return ev; }
/* What ISO the camera will pick for an aperture and shutter speed in that light, or the shutter speed for a fixed ISO. */
const lfISO = (N,t,ev) => 100*Math.pow(2,Math.log2(N*N/t)-ev);
const lfShutter = (N,iso,ev) => N*N/Math.pow(2,ev+Math.log2(iso/100));
const lfShutterText = t => t>=0.5?Math.round(t)+" s":"1/"+[8,15,30,60,125,250,500,1000,2000,4000,8000,16000].reduce((a,b)=>Math.abs(Math.log2(b*t))<Math.abs(Math.log2(a*t))?b:a)+" s";
const lfISOText = iso => { const steps=[50,100,200,400,800,1600,3200,6400,12500,25000]; return "ISO "+steps.reduce((a,b)=>Math.abs(Math.log2(b/iso))<Math.abs(Math.log2(a/iso))?b:a); };
/* The street under your feet: the nearest street line within about 70 m, its direction, and which side is in sun. */
function lfStreet(pos,sp){ if(state.city!=="nyc"||typeof MAPD_ROADS==="undefined"||!inNYC(pos)) return null; const G=streetGrid(), [px,py]=mapXY(pos.lat,pos.lon), gx=Math.floor(px/10), gy=Math.floor(py/10); let best=null;
  for(let x=gx-1;x<=gx+1;x++) for(let y=gy-1;y<=gy+1;y++){ const cell=G.cells.get(x+","+y); if(!cell) continue;
    for(const k of cell){ const ax=G.seg[k], ay=G.seg[k+1], bx=G.seg[k+2], by=G.seg[k+3], L2=(bx-ax)**2+(by-ay)**2; if(L2<0.04) continue;
      const u=Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/L2)), d=Math.hypot(ax+(bx-ax)*u-px,ay+(by-ay)*u-py); if(!best||d<best.d) best={d,ax,ay,bx,by}; } }
  if(!best||best.d>1.3) return null;   // map units are about 55 m
  const b=(Math.atan2(best.bx-best.ax,-(best.by-best.ay))*180/Math.PI+360)%180, out={b, dirs:[b,b+180]};
  if(sp.alt>0){ const n1=(b+90)%360, sunFacing=Math.cos((sp.az-n1)*Math.PI/180); if(Math.abs(sunFacing)>0.12) out.sunny=sunFacing>0?(b+90+180)%360:(b+90)%360; // the side whose wall faces the sun
    out.along=Math.min(angDiff(sp.az,b),angDiff(sp.az,b+180))<12; }
  return out; }
/* The ways to point the camera now, best first. Each has a bearing to face (or none), the light it gives, and the camera recipe. */
function lfOptions(t,pos){ const sp=sunPos(t,pos.lat,pos.lon), sky=lfSky(t), az=sp.az, back=az, front=(az+180)%360, opts=[];
  if(sp.alt<-6){
    opts.push({k:"lights",face:null,title:"Point at the light, not the dark",why:"After dark the light comes from signs, shop windows and street lamps. Put people between you and a lit window or sign, or wait for them to step into a pool of light.",recipe:"night",ev:7,comp:"−0.7 EV, so signs keep their colour"});
    if(sky==="rain") opts.push({k:"wet",face:null,title:"Get low over the wet pavement",why:"Rain turns the street into a mirror for every sign. Hold the camera a hand above a puddle and let the reflection fill the bottom of the frame.",recipe:"night",ev:7,comp:"−0.7 EV"});
  } else if(sp.alt<-0.8){
    opts.push({k:"glow",face:back,title:"Face "+compass(back)+", towards the afterglow",why:"The sky is brightest where the sun went down. People and street lamps go dark against it: silhouettes on deep blue.",recipe:"silhouette",ev:lfEV(sp.alt,sky)+1,comp:"−1 EV, metered on the sky"});
    opts.push({k:"lit",face:front,title:"Turn round, to the "+compass(front)+": lit windows against blue",why:"Away from the glow the sky turns deep blue, and for about twenty minutes it balances the lit windows and signs.",recipe:"night",ev:lfEV(sp.alt,sky),comp:"−0.3 EV"});
  } else if(sky==="cloud"||sky==="rain"||sky==="fog"||sky==="snow"){
    opts.push({k:"soft",face:front,title:"Any direction works; keep the bright sky behind you",why:"Cloud spreads the light evenly, so faces have no harsh shadows and colours stay rich. The brightest part of the sky is towards the "+compass(back)+": with it behind you, faces are evenly lit.",recipe:"zone",ev:lfEV(sp.alt,sky),comp:"+0.3 EV, white balance Cloudy"});
    if(sky==="rain") opts.push({k:"wet",face:back,title:"Face "+compass(back)+" for reflections",why:"Wet pavement mirrors the brightest part of the sky and every sign. Face that way and get low.",recipe:"zone",ev:lfEV(sp.alt,sky),comp:"0"});
    if(sky==="fog") opts.push({k:"fog",face:back,title:"Face "+compass(back)+" into the glow",why:"Fog lights up where the sun is behind it. Figures walking towards you become soft grey shapes.",recipe:"silhouette",ev:lfEV(sp.alt,sky)+1,comp:"+0.7 EV, or fog turns grey"});
  } else {
    const side=[(az+90)%360,(az+270)%360], low=sp.alt<20, high=sp.alt>=45;
    const sideO={k:"side",face:side[0],alt:side[1],title:"Face "+compass(side[0])+" or "+compass(side[1])+": side light",why:low?"Low sun from the side: long shadows, texture on faces and walls, and depth.":"Sun from the side gives faces shape and lets shadows draw lines across the street.",recipe:"zone",ev:lfEV(sp.alt,sky),comp:low?"0":"−0.3 EV"};
    const backO={k:"back",face:back,title:"Face "+compass(back)+", into the sun",why:low?"Backlight: silhouettes, rim light on hair, glowing steam and breath. Expose for the bright part and let people go dark.":"Into the sun, shadows run towards you and people become graphic shapes. Keep the sun just outside the frame, or behind a person.",recipe:"silhouette",ev:lfEV(sp.alt,sky)+1,comp:"−1.3 EV"};
    const frontO={k:"front",face:front,title:"Turn your back to the sun, to the "+compass(front),why:sp.alt<10?"Golden light falls full on faces and buildings: warm, even and saturated. Keep your own shadow out of the frame.":"The sun behind you gives clean colour and detail, but flat faces. Best for buildings and signs.",recipe:"deep",ev:lfEV(sp.alt,sky),comp:"−0.3 EV"};
    if(high){ opts.push({k:"shade",face:null,title:"Find open shade",why:"The sun is high and hard. Stand people in the shade of a building or an awning, lit by the bright street in front of them: soft light on faces, a bright background behind.",recipe:"shallow",ev:lfEV(sp.alt,sky)-3,comp:"+0.3 EV for faces"}); opts.push(Object.assign(backO,{title:"Or face "+compass(back)+" and shoot the shadows",why:"With the sun high, shadows are short and black: look for people walking through slices of light between buildings.",comp:"−0.7 EV"})); opts.push(sideO); }
    else { opts.push(sideO,backO,frontO); }
  }
  return {sp,sky,opts}; }
/* What you are shooting changes the settings: each subject has a starting aperture and shutter, and the slowest shutter it can
   take. In poor light the app opens the aperture first, then slows the shutter, to keep Auto ISO at or under 3200. */
const LF_SUBJ = {
  auto:{n:"For this light"},
  walk:{n:"People walking",recipe:"zone",N:8,t:250,minT:125},
  portrait:{n:"A portrait",recipe:"shallow",N:0,t:500,minT:125},
  building:{n:"Buildings, signs",recipe:"deep",N:8,t:125,minT:30},
  blur:{n:"Motion blur",recipe:"drag"},
  silhouette:{n:"Silhouettes",recipe:"silhouette"}
};
const LF_WIDE = {q343:2,q328:1.7};
/* Camera settings for an option and a subject: the exposure, what Auto ISO (or the shutter) will do in this light, and what to change. */
function lfSettings(o,sky,sp,subj){ const cam=CAMERAS[state.camera]||CAMERAS.q343, S=LF_SUBJ[subj]||LF_SUBJ.auto, recipe=S.recipe||o.recipe, rec=cam.recipes[recipe], su=setupFor(cam,recipe);
  const wide=LF_WIDE[state.camera]||2, stops=[1.7,2,2.8,4,5.6,8,11,16].filter(x=>x>=wide), fN=n=>"f/"+(Math.round(n*10)/10);
  const backlit=o.k==="back"||o.k==="glow"||o.k==="fog";
  // the light on the subject: backlit faces sit in their own shadow; silhouettes are metered on the bright part
  let ev=o.ev; if(subj==="silhouette") ev=backlit?o.ev:o.ev+1; else if(subj!=="auto"&&backlit) ev=o.ev-2.5;
  let line=rec[0], meter="", note="", comp=o.comp, adj=[];
  if(subj==="auto"){ const m=/f\/([\d.]+)/.exec(rec[0]), s=/1\/(\d+)\s*s/.exec(rec[0]), N=m?+m[1]:8;
    if(/auto shutter/.test(rec[0])) meter="The shutter will land near "+lfShutterText(lfShutter(N,100,ev))+".";
    else if(s){ const iso=lfISO(N,1/+s[1],ev); meter=iso<=100?"Auto ISO stays at its floor; "+(iso<50?"use a faster shutter, about "+lfShutterText(N*N/Math.pow(2,ev))+", or stop down.":"ISO 100."):iso>6400?"Too dark for this at "+rec[0].split(" · ").slice(0,2).join(" · ")+": open up and slow the shutter to 1/125 s.":"Auto ISO will sit near "+lfISOText(iso)+"."; }
    const i={phase:sp.alt<-6?"night":sp.alt<6?"dusk":"mid",sky:sky==="clear"?(sp.alt>=20?"sun":null):sky==="partly"?"partly":sky==="cloud"||sky==="fog"?"cloud":sky==="rain"||sky==="snow"?"rain":null};
    adj=adjustFor(recipe,i,cam.setup==="leica").filter(a=>!/compensation as shown/.test(a)).slice(0,2); }
  else if(subj==="blur"){ const t=1/15, N=Math.sqrt(t*Math.pow(2,ev)); comp="0";
    if(N>16&&N/Math.SQRT2<=16.5){ line="f/16 · 1/15 s · ISO 50 · S mode"; meter="Just reachable: f/16 at ISO 50."; note="Set ISO 50 by hand; Auto ISO stops at 100. Brace on something and pan with a walker."; }
    else if(N>16){ const tt=lfShutter(16,50,ev); line="f/16 · "+lfShutterText(tt)+" · ISO 50 · S mode"; meter="Too bright for 1/15 s here."; note="At f/16 and ISO 50 the camera only gets down to "+lfShutterText(tt)+", which blurs fast walkers a little. Step into shade, wait for dusk, or fit a 3-stop ND filter for real streaks."; }
    else if(N<wide){ const iso=lfISO(wide,t,ev); line=fN(wide)+" · 1/15 s · Auto ISO · S mode"; meter="Wide open, Auto ISO will sit near "+lfISOText(iso)+"."; note="Brace on a pole or railing; stabilization steadies the street, the people still blur."; }
    else { const n=stops.reduce((a,b)=>Math.abs(Math.log2(b/N))<Math.abs(Math.log2(a/N))?b:a); line="1/15 s · S mode · ISO 100"; meter="The camera will pick about "+fN(n)+"."; note="Elbows in, brace on something, and pan with a walker for a sharp face on a streaked street."; } }
  else if(subj==="silhouette"){ const tt=lfShutter(5.6,100,ev); line="f/5.6 · "+lfShutterText(tt)+" · ISO 100"; comp="−1.3 EV, metered on the bright part"; meter="People go black against the light.";
    // in dim light a slow shutter blurs the walkers: hold 1/125 s and let Auto ISO climb, opening up if it has to
    if(tt>1/60){ let N=5.6, iso=lfISO(N,1/125,ev); if(iso>3200){ N=wide; iso=lfISO(N,1/125,ev); } line=fN(N)+" · 1/125 s · Auto ISO"; meter="Auto ISO will sit near "+lfISOText(Math.max(100,iso))+". People go black against the light."; } if(tt>1/60) note="There is not much light behind them now. Use a lit window, a screen or the afterglow as the bright part."; }
  else { let N=S.N||wide, t=1/S.t, iso=lfISO(N,t,ev), opened=false, slowed=false, closed=false;
    while(iso>3200&&stops.indexOf(N)>0){ N=stops[stops.indexOf(N)-1]; iso=lfISO(N,t,ev); opened=true; }
    while(iso>3200&&1/t>S.minT){ t=Math.min(1/S.minT,t*2); iso=lfISO(N,t,ev); slowed=true; }
    if(subj!=="portrait") while(iso<100&&stops.indexOf(N)<stops.length-1&&N<11){ N=stops[stops.indexOf(N)+1]; iso=lfISO(N,t,ev); closed=true; }
    if(iso<100){ t=t*Math.max(iso,1)/100; iso=100; }
    line=fN(N)+" · "+lfShutterText(t)+" · Auto ISO"; meter=iso>6400?"Even like this, ISO would climb past 6400.":"Auto ISO will sit near "+lfISOText(Math.max(100,iso))+".";
    note=iso>6400?"Find more light: under a shop window or a street lamp, or wait for people to step into it.":opened&&slowed?"Opened up and slowed the shutter to hold ISO under 3200; that is the limit for this subject.":opened?"Opened up from "+fN(S.N||wide)+" to keep ISO under 3200.":closed?"Bright light: stopped down for more depth.":"";
    if(subj==="walk") note=(note?note+" ":"")+"Focus by distance: "+(state.camera==="q328"?"set the ring to 3 m":"set the ring to 3 m for whole figures, 2 m from the waist up")+(N<5.6?" (depth is shallow at this aperture, so be exact)":"")+".";
    if(subj==="portrait") comp=backlit?"+1 EV, so the face is not dark":o.comp;
    if(subj==="building") comp=backlit?"−0.7 EV to hold the sky":"−0.3 EV"; }
  return {cam,rec,su,line,meter,note,adj,comp,recipe}; }
function lfOpen(spot){ LF.open=true; LF.sel=0; LF.off=0; LF.spot=spot||null; LF.icsMsg=""; LF.subj=store.get("lfSubj","auto")||"auto"; if(!LF_SUBJ[LF.subj]) LF.subj="auto"; const el=$("lightf"); el.hidden=false; document.body.classList.add("lfopen");
  headingStart().then(()=>lfRender()); oriStart(); try{ if(navigator.wakeLock&&!LF.wake) navigator.wakeLock.request("screen").then(w=>{ LF.wake=w; }).catch(()=>{}); }catch(e){}
  LF.fallback=false;
  try{ if(navigator.geolocation&&LF.watch==null) LF.watch=navigator.geolocation.watchPosition(p=>{ const was=state.pos; state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; LF.acc=p.coords.accuracy; LF.fallback=false; if(!was||kmBetween(was,state.pos)>0.02) lfRender(); },()=>{ if(!state.pos){ LF.fallback=true; lfRender(); } },{enableHighAccuracy:true,maximumAge:10000,timeout:20000}); }catch(e){ LF.fallback=true; }
  clearInterval(LF.timer); LF.timer=setInterval(()=>{ if(LF.open&&!document.hidden) lfRender(); },60000); lfRender(); }
function lfClose(){ if(LFC.on) lfcStop(); LF.open=false; LF.justLogged=false; const el=$("lightf"); el.hidden=true; el.innerHTML=""; document.body.classList.remove("lfopen"); clearInterval(LF.timer);
  try{ if(LF.watch!=null) navigator.geolocation.clearWatch(LF.watch); }catch(e){} LF.watch=null; try{ if(LF.wake) LF.wake.release(); }catch(e){} LF.wake=null;
  oriStop(); if(!state.mapHead&&!state.street&&!state.guide) headingStop(); }
/* The dial: north at the top, or the way you face at the top when the compass works. Sun on the rim, the light sectors around it,
   and the direction to point the camera. */
/* The phone's orientation for Light here and the camera view, worked out from the full rotation (alpha, beta, gamma) rather
   than alpha alone, so it stays right when the phone is raised, tilted or turned a little sideways:
   - flat: the way the top of the phone points; raised: the way the back camera points, how far up, and how far it is rolled.
   - Android gives an absolute alpha (deviceorientationabsolute). iPhone gives alpha from an arbitrary start, plus
     webkitCompassHeading; the offset between the two is learnt while the phone is flat (where Safari's heading is reliable)
     and then applied in any position. */
const ORI = {on:false, fn:null, gotAbs:false, off:null, top:null, cam:null, elev:null, roll:0, mode:"flat", acc:null, ios:false, raf:0};
const oriNorm = x => (x%360+360)%360;
const oriMix = (p,v,k) => p==null?v:oriNorm(p+(((v-p)%360+540)%360-180)*k);
function devFrame(a,b,g){ const d=Math.PI/180, cA=Math.cos(a*d), sA=Math.sin(a*d), cB=Math.cos(b*d), sB=Math.sin(b*d), cG=Math.cos(g*d), sG=Math.sin(g*d);
  const cx=-(cA*sG+sA*sB*cG), cy=cA*sB*cG-sA*sG, cz=-cB*cG;   // where the back camera points: east, north, up
  return {top:oriNorm(Math.atan2(-sA*cB,cA*cB)/d), cam:oriNorm(Math.atan2(cx,cy)/d), elev:Math.asin(Math.max(-1,Math.min(1,cz)))/d, roll:Math.atan2(-cB*sG,sB)/d}; }
function oriStart(){ if(ORI.on) return; ORI.on=true;
  ORI.fn=e=>{ if(e.alpha==null||e.beta==null||e.gamma==null) return; const ios=typeof e.webkitCompassHeading==="number"&&!isNaN(e.webkitCompassHeading)&&e.webkitCompassHeading>=0;
    if(e.type==="deviceorientationabsolute") ORI.gotAbs=true; else if(ORI.gotAbs&&!ios) return;   // Android sends both: use the absolute one
    if(!ios&&!(e.type==="deviceorientationabsolute"||e.absolute===true)) return;                       // a reading not tied to north is no use
    const F=devFrame(e.alpha,e.beta,e.gamma); ORI.ios=ios; ORI.elev=ORI.elev==null?F.elev:ORI.elev*0.7+F.elev*0.3; ORI.roll=((oriMix(ORI.roll+180,F.roll+180,0.3))-180);
    // flat or raised, with a little hysteresis so it does not flicker between the two
    if(ORI.mode==="flat"&&Math.abs(F.elev)<40) ORI.mode="raised"; else if(ORI.mode==="raised"&&Math.abs(F.elev)>55) ORI.mode="flat";
    let off=0;
    if(ios){ ORI.acc=typeof e.webkitCompassAccuracy==="number"?e.webkitCompassAccuracy:null;
      if(Math.abs(F.elev)>50) ORI.off=oriMix(ORI.off,oriNorm(e.webkitCompassHeading-F.top),ORI.off==null?1:0.15);
      if(ORI.off==null){ ORI.top=ORI.cam=oriMix(ORI.cam,e.webkitCompassHeading,0.35); ORI.uncal=true; oriKick(); return; }
      off=ORI.off; ORI.uncal=false; }
    else { try{ const sa=(screen.orientation&&screen.orientation.angle)||window.orientation||0; ORI.screen=sa; }catch(x){} }
    ORI.top=oriMix(ORI.top,oriNorm(F.top+off+(ios?0:(ORI.screen||0))),0.35); ORI.cam=oriMix(ORI.cam,oriNorm(F.cam+off),0.35); oriKick(); };
  try{ addEventListener("deviceorientationabsolute",ORI.fn); addEventListener("deviceorientation",ORI.fn); }catch(e){} }
function oriStop(){ if(!ORI.on) return; try{ removeEventListener("deviceorientationabsolute",ORI.fn); removeEventListener("deviceorientation",ORI.fn); }catch(e){} Object.assign(ORI,{on:false,top:null,cam:null,elev:null,gotAbs:false}); }
function oriKick(){ if(!ORI.raf) ORI.raf=requestAnimationFrame(()=>{ ORI.raf=0; if(LF.open) lfHeading(); if(LFC.on) lfcDraw(); }); }
/* Where you are pointing now: the top of the phone when it lies flat, the camera when it is raised. */
const oriHeading = () => ORI.mode==="flat"?ORI.top:ORI.cam;
/* What to tell the user about the compass in Light here: nothing when it works. */
function lfCompassNote(){ if(oriHeading()!=null){ if(ORI.ios&&ORI.acc!=null&&(ORI.acc<0||ORI.acc>25)) return "The compass is unsure here (steel, cars and the subway throw it off). Move the phone in a slow figure of eight to calibrate it."; if(ORI.uncal) return "Lay the phone flat for a second so the compass can set itself; after that it works raised too."; return ""; }
  if(HEAD.why==="frame"||inFrame) return "The compass is not available inside Claude, so the dial shows north at the top. Open Shot List from your home screen to use it.";
  if(HEAD.why==="denied") return headMsg();
  if(HEAD.why==="none") return "This device has no compass the app can read, so the dial shows north at the top.";
  return "Hold the phone flat and turn slowly: the dial turns with you once the compass wakes up."; }
function lfDial(sp,face,mo){ const R=104, C=120, P=(a,r)=>[C+Math.sin(a*Math.PI/180)*r,C-Math.cos(a*Math.PI/180)*r], f=n=>n.toFixed(1);
  const arc=(a0,a1,r0,r1,cls)=>{ const [x0,y0]=P(a0,r1),[x1,y1]=P(a1,r1),[x2,y2]=P(a1,r0),[x3,y3]=P(a0,r0), big=((a1-a0+360)%360)>180?1:0; return '<path d="M'+f(x0)+' '+f(y0)+'A'+r1+' '+r1+' 0 '+big+' 1 '+f(x1)+' '+f(y1)+'L'+f(x2)+' '+f(y2)+'A'+r0+' '+r0+' 0 '+big+' 0 '+f(x3)+' '+f(y3)+'Z" class="'+cls+'"/>'; };
  let g='';
  if(sp.alt>-0.8){ g+=arc(sp.az-50,sp.az+50,R-26,R,"lf-sec back")+arc(sp.az+50,sp.az+130,R-26,R,"lf-sec side")+arc(sp.az+230,sp.az+310,R-26,R,"lf-sec side")+arc(sp.az+130,sp.az+230,R-26,R,"lf-sec front"); }
  g+='<circle cx="'+C+'" cy="'+C+'" r="'+R+'" class="lf-ring"/>';
  for(let a=0;a<360;a+=30){ const [x0,y0]=P(a,R-(a%90?6:10)),[x1,y1]=P(a,R); g+='<path d="M'+f(x0)+' '+f(y0)+'L'+f(x1)+' '+f(y1)+'" class="lf-tick"/>'; }
  ["N","E","S","W"].forEach((t,n)=>{ const [x,y]=P(n*90,R+11); g+='<text x="'+f(x)+'" y="'+f(y+4)+'" text-anchor="middle" class="lf-card'+(n?'':' n')+'">'+t+'</text>'; });
  if(sp.alt>-6){ const [sx,sy]=P(sp.az,R-13); g+='<g class="lf-sun'+(sp.alt<0?' low':'')+'"><circle cx="'+f(sx)+'" cy="'+f(sy)+'" r="8"/>'+[0,45,90,135,180,225,270,315].map(a=>{ const q=a*Math.PI/180; return '<path d="M'+f(sx+Math.cos(q)*10.5)+' '+f(sy+Math.sin(q)*10.5)+'L'+f(sx+Math.cos(q)*14)+' '+f(sy+Math.sin(q)*14)+'"/>'; }).join("")+'</g>'; }
  if(mo&&mo.alt>-1&&mo.frac>0.03){ const [mx,my]=P(mo.az,R-13), sh=(mo.phase<0.5?-1:1)*16*mo.frac;
    g+='<g class="lf-moon"><clipPath id="lfMoonC"><circle cx="'+f(mx)+'" cy="'+f(my)+'" r="7.5"/></clipPath><circle cx="'+f(mx)+'" cy="'+f(my)+'" r="7.5" class="lf-moonlit"/><circle cx="'+f(mx+sh)+'" cy="'+f(my)+'" r="7.5" class="lf-moondark" clip-path="url(#lfMoonC)"/><circle cx="'+f(mx)+'" cy="'+f(my)+'" r="7.5" class="lf-moonrim"/></g>'; }
  if(face!=null){ const [tx,ty]=P(face,R-34), [ax,ay]=P(face,R-50); g+='<path d="M'+C+' '+C+'L'+f(ax)+' '+f(ay)+'" class="lf-aim"/><g class="lf-target" transform="translate('+f(tx)+' '+f(ty)+') rotate('+f(face)+')"><path d="M0 -13 L10 7 L-10 7Z"/></g>'; }
  const hd=oriHeading(), you=hd!=null;
  return '<svg viewBox="-6 -6 252 252" class="lf-dial" role="img" aria-label="Compass: sun to the '+compass(sp.az)+(face!=null?', point the camera '+compass(face):'')+'"><g id="lfRot" style="transform-origin:120px 120px;transform:rotate('+(you?-hd:0).toFixed(1)+'deg)">'+g+'</g>'+
    '<g class="lf-you'+(you?'':' off')+'"><path d="M120 76 L131 104 L120 98 L109 104Z"/><circle cx="120" cy="120" r="5"/></g></svg>'; }
function lfTurn(face){ if(face==null) return ""; const hd=oriHeading(); if(hd==null) return 'Point the camera <b>'+compass(face)+'</b>'+(state.pos?'':'')+'.';
  const d=((face-hd)%360+540)%360-180, a=Math.abs(d); return a<=12?'<b class="lf-ok">You are facing it. Shoot.</b>':'Turn <b>'+(d>0?'right':'left')+' '+Math.round(a)+'°</b> to point the camera '+compass(face)+'.'; }
function lfHeading(){ if(!LF.open) return; const hd=oriHeading(), r=$("lfRot"), y=document.querySelector("#lightf .lf-you"), t=$("lfTurn"); if(r) r.style.transform="rotate("+(hd!=null?-hd:0).toFixed(1)+"deg)";
  if(y) y.classList.toggle("off",hd==null); const cn=document.querySelector("#lightf .lf-cmp"); if(cn){ const msg=lfCompassNote(); cn.hidden=!msg; if(msg&&cn.textContent!==msg) cn.textContent=msg; }
  const md=document.querySelector("#lightf .lf-mode"); if(md){ const m=hd==null?"":ORI.mode==="flat"?"Phone flat: the arrow is the top of the phone.":"Phone raised: the arrow is where the camera points."; if(md.textContent!==m) md.textContent=m; } if(t){ const o=LF.cur; const h=lfTurn(o?o.face:null); if(t.innerHTML!==h) t.innerHTML=h; } }
/* The next three hours at your spot: golden and blue hour, sunset, when the sun gets too low for the sidewalks, a street that
   lines up with it, the moon, and the rain. Each one moves the dial to that time. */
function lfNext(pos){ const now=new Date(), nm=now.getHours()*60+now.getMinutes(), d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()), out=[], add=(m,txt,k)=>{ if(m>nm&&m<=nm+180) out.push({m,txt,k}); };
  const {L,list}=todayWindows(d0); list.forEach(x=>{ add(x.s,x.name+" starts",x.k); if(!list.some(y=>y!==x&&Math.abs(y.s-x.e)<=2)) add(x.e,x.name+" ends",x.k); }); add(L.rise,"Sunrise","sun"); add(L.set,"Sunset","sun");
  // the sun getting too low for the sidewalks, on a street of five or six storeys
  let prev=sunPos(now,pos.lat,pos.lon).alt; for(let m=nm+5;m<=nm+180;m+=5){ const a=sunPos(new Date(+d0+m*6e4),pos.lat,pos.lon).alt; if(prev>=15&&a<15){ add(m,"Sun below 15°: most sidewalks fall into shade, except along streets that face it","shade"); break; } if(prev<15&&a>=15){ add(m,"Sun above 15°: it clears the low buildings and reaches the sidewalks","sun"); break; } prev=a; }
  // a long street near you lining up with the sun
  if(state.city==="nyc"){ const H=hengeDay(new Date()), near=H.runs.filter(r=>r.m>nm&&r.m<=nm+180).map(r=>{ const R=MAPD_RUNS[r.i], [la,lo]=mapLL((R[0]+R[2])/20,(R[1]+R[3])/20); return {r,km:kmBetween(pos,{lat:la,lon:lo})}; }).filter(x=>x.km<1.2).sort((a,b)=>a.km-b.km)[0];
    if(near) add(near.r.m,"A long street "+mDist(near.km)+" away lines up with the sun, looking "+compass(near.r.az),"henge"); }
  // the moon
  const mt=moonTimes(now,pos.lat,pos.lon), mo=moonPos(now,pos.lat,pos.lon); if(mo.frac>0.25){ if(mt.rise!==null) add(mt.rise,"Moonrise, "+Math.round(mo.frac*100)+"% lit, in the "+compass(moonPos(new Date(+d0+mt.rise*6e4),pos.lat,pos.lon).az),"moon"); if(mt.set!==null) add(mt.set,"Moonset","moon"); }
  // the rain
  const wx=wxNext(now); if(wx){ const mm=/(\d+)(?::(\d\d))?\s*(am|pm)/.exec(wx); if(mm){ let h=+mm[1]%12+(mm[3]==="pm"?12:0), m=h*60+(+mm[2]||0); if(m<nm) m+=1440; add(m,wx.charAt(0).toUpperCase()+wx.slice(1),"rain"); } }
  if(LF.shadeNext) add(LF.shadeNext.m,LF.shadeNext.txt,"sun");
  out.sort((a,b)=>a.m-b.m);
  if(!out.length){ const later=list.find(x=>x.s>nm); if(later) return [{m:null,txt:"Nothing changes in the next three hours. Next good light: "+later.name.toLowerCase()+" at "+hmText(later.s)+".",k:later.k}];
    const n=todayWindows(new Date(+d0+864e5)).list[0]; if(n) return [{m:null,txt:"Next good light: "+n.name.toLowerCase()+" tomorrow at "+hmText(n.s)+".",k:n.k}]; }
  return out; }
/* Lit places near you after dark: the nearest avenue (shop fronts) and subway entrance, with the direction to walk. */
let AVE_GRID=null;
function aveGrid(){ if(AVE_GRID) return AVE_GRID; const seg=[], cells=new Map(), d=MAPD_ROADS.ave||"", re=/([Ml])([^Ml]*)/g; let m, x=0, y=0;
  while((m=re.exec(d))){ const n=m[2].match(/-?\d+/g)||[]; if(m[1]==="M"){ x=+n[0]; y=+n[1]; } else for(let i=0;i+1<n.length;i+=2){ const nx=x+ +n[i], ny=y+ +n[i+1]; seg.push(x/10,y/10,nx/10,ny/10); x=nx; y=ny; } }
  for(let k=0;k<seg.length;k+=4){ const key=Math.floor((seg[k]+seg[k+2])/20)+","+Math.floor((seg[k+1]+seg[k+3])/20); let c=cells.get(key); if(!c){ c=[]; cells.set(key,c); } c.push(k); }
  return AVE_GRID={seg,cells}; }
function lfLights(pos){ if(state.city!=="nyc"||typeof MAPD_ROADS==="undefined") return ""; const [px,py]=mapXY(pos.lat,pos.lon), brg=(x,y)=>(Math.atan2(x-px,-(y-py))*180/Math.PI+360)%360, out=[];
  const G=aveGrid(), gx=Math.floor(px/10), gy=Math.floor(py/10); let best=null;
  for(let a=gx-1;a<=gx+1;a++) for(let b=gy-1;b<=gy+1;b++){ const cell=G.cells.get(a+","+b); if(!cell) continue; for(const k of cell){ const ax=G.seg[k], ay=G.seg[k+1], bx=G.seg[k+2], by=G.seg[k+3], L2=(bx-ax)**2+(by-ay)**2||1e-9, u=Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/L2)), qx=ax+(bx-ax)*u, qy=ay+(by-ay)*u, d=Math.hypot(qx-px,qy-py); if(!best||d<best.d) best={d,qx,qy}; } }
  if(best&&best.d<6){ const km=best.d*0.0556; out.push(km<0.03?"You are on an avenue: shop fronts and headlights light faces from the side.":"The nearest avenue is "+mDist(km)+" to the "+compass(brg(best.qx,best.qy))+": shop fronts, awnings and headlights."); }
  let st=null; for(const [name,lat,lon] of MAPD_STATIONS){ const km=kmBetween(pos,{lat,lon}); if(!st||km<st.km) st={name,lat,lon,km}; }
  if(st&&st.km<0.5){ const [sx,sy]=mapXY(st.lat,st.lon); out.push("The "+st.name+" subway entrance is "+mDist(st.km)+" to the "+compass(brg(sx,sy))+": lit globes and a steady stream of people."); }
  return out.length?'<p class="lf-st">'+out.map(esc).join(" ")+'</p>':""; }
const LF_KIND = {side:"Side light",back:"Into the sun",front:"Sun behind you",shade:"Open shade",lights:"Lights",wet:"Reflections",glow:"Afterglow",lit:"Lit windows",soft:"Soft light",fog:"Into the glow",moon:"The moon"};
/* Building shadows (installed app): the city's building footprints and roof heights (NYC Open Data), fetched for the blocks
   around you, say whether your spot and each sidewalk are in direct sun, which building is in the way, and when that changes. */
const LFB = {cache:new Map(), busy:false, err:"", key:""};
const LFB_URL = "https://data.cityofnewyork.us/resource/5zhs-2jue.json";
const lfbOn = pos => typeof loadWeather==="function" && state.city==="nyc" && !!pos && inNYC(pos);   // the Claude version cannot reach the city's data
const lfbKey = pos => (Math.round(pos.lat*500)/500).toFixed(4)+","+(Math.round(pos.lon*380)/380).toFixed(4);   // tiles of about 220 m
async function lfbLoad(pos){ const key=lfbKey(pos); if(LFB.cache.has(key)||LFB.busy||(LFB.err&&Date.now()-(LFB.errAt||0)<60000)) return; LFB.err=""; LFB.busy=true; LFB.key=key;
  try{ const [clat,clon]=key.split(",").map(Number), kx=111320*Math.cos(clat*Math.PI/180), ky=110540;
    const q=where=>fetch(LFB_URL+"?$select=height_roof,ground_elevation,the_geom&$limit=6000&$where="+encodeURIComponent(where)).then(r=>{ if(!r.ok) throw new Error("the city's building data answered "+r.status); return r.json(); });
    const [near,tall]=await Promise.all([q("within_circle(the_geom,"+clat+","+clon+",450) AND height_roof>15"),q("within_circle(the_geom,"+clat+","+clon+",1600) AND height_roof>300")]);
    const seen=new Set(), list=[];
    for(const b of near.concat(tall)){ const h=+b.height_roof*0.3048, g=(+b.ground_elevation||0)*0.3048, poly=b.the_geom&&b.the_geom.coordinates; if(!(h>4)||!poly) continue;
      for(const part of poly){ const ring=part&&part[0]; if(!ring||ring.length<4) continue; const id=ring[0].join(); if(seen.has(id)) continue; seen.add(id);
        const xy=ring.map(p=>[(p[0]-clon)*kx,(p[1]-clat)*ky]); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const [x,y] of xy){ if(x<x0)x0=x; if(y<y0)y0=y; if(x>x1)x1=x; if(y>y1)y1=y; }
        list.push({h,g,xy,bb:[x0,y0,x1,y1]}); } }
    LFB.cache.set(key,{clat,clon,kx,ky,list}); LFB.err="";
  }catch(e){ LFB.err=e&&e.name==='TypeError'?'no connection':String(e&&e.message||e); LFB.errAt=Date.now(); } finally{ LFB.busy=false; if(LF.open) lfRender(); } }
const lfbTile = pos => LFB.cache.get(lfbKey(pos))||null;
const lfbXY = (T,p) => [(p.lon-T.clon)*T.kx,(p.lat-T.clat)*T.ky];
function lfbInside(xy,x,y){ let c=false; for(let i=0,j=xy.length-1;i<xy.length;j=i++){ const [xi,yi]=xy[i],[xj,yj]=xy[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; }
/* Is this point in direct sun at time t? The ray towards the sun is tested against every footprint near it; a building blocks
   it when its roof is higher than the ray at the point where the ray enters it. */
function lfbSun(T,pt,t){ const sp=sunPos(t,pt.lat,pt.lon); if(sp.alt<=0.5) return {down:true,alt:sp.alt};
  const [px,py]=lfbXY(T,pt), a=sp.az*Math.PI/180, dx=Math.sin(a), dy=Math.cos(a), tn=Math.tan(sp.alt*Math.PI/180);
  let g0=null, gd=1e9; for(const b of T.list){ const cx=(b.bb[0]+b.bb[2])/2, cy=(b.bb[1]+b.bb[3])/2, d=Math.hypot(cx-px,cy-py); if(d<gd){ gd=d; g0=b.g; } } g0=g0||0;
  let best=null;
  for(const b of T.list){ const [x0,y0,x1,y1]=b.bb;
    // the ray against the box first: most buildings are nowhere near it
    let tmin=0, tmax=1e9; for(const [o,d,lo,hi] of [[px,dx,x0,x1],[py,dy,y0,y1]]){ if(Math.abs(d)<1e-9){ if(o<lo||o>hi){ tmin=1e9; break; } continue; } let t1=(lo-o)/d, t2=(hi-o)/d; if(t1>t2) [t1,t2]=[t2,t1]; tmin=Math.max(tmin,t1); tmax=Math.min(tmax,t2); if(tmin>tmax) break; }
    if(tmin>tmax||tmin>=1e9) continue; const top=b.h+b.g-g0-1.6; if(top<=0||top<tmin*tn) continue;
    if(lfbInside(b.xy,px,py)) continue;   // a position inside a footprint is the GPS being off by a few metres
    let s=1e9; const xy=b.xy; for(let i=0;i<xy.length-1;i++){ const [ax,ay]=xy[i],[bx,by]=xy[i+1], ex=bx-ax, ey=by-ay, den=dx*ey-dy*ex; if(Math.abs(den)<1e-12) continue; const u=((ax-px)*ey-(ay-py)*ex)/den, v=((ax-px)*dy-(ay-py)*dx)/den; if(u>0.3&&v>=0&&v<=1&&u<s) s=u; }
    if(s<1e9&&top>s*tn&&(!best||s<best.d)) best={d:s,h:b.h}; }
  return best?{sun:false,by:best,alt:sp.alt,az:sp.az}:{sun:true,alt:sp.alt,az:sp.az}; }
/* When the sun arrives at or leaves a point, looking ahead up to three hours. */
function lfbChange(T,pt,t){ const now=lfbSun(T,pt,t); if(now.down) return null; for(let m=2;m<=180;m+=2){ const r=lfbSun(T,pt,new Date(+t+m*6e4)); if(r.down) return now.sun?{m,txt:"sunset"}:null; if(r.sun!==now.sun) return {m,txt:r.sun?"arrives":"leaves"}; } return null; }
const storeys = h => Math.max(1,Math.round(h/3.3));
function lfbHtml(pos,t,st){ if(!lfbOn(pos)) return ""; const T=lfbTile(pos);
  if(!T){ lfbLoad(pos); if(LFB.err) return '<p class="lf-st lf-shade">Building shadows could not load ('+esc(LFB.err)+'). The sunny side above is worked out from the street direction only.</p>'; return '<p class="lf-st lf-shade">Checking the buildings around you…</p>'; }
  const here=lfbSun(T,pos,t); if(here.down) return "";
  const ch=lfbChange(T,pos,t), at=ch?hmText(((t.getHours()*60+t.getMinutes()+ch.m)%1440)):"";
  let out=here.sun?'<b>You are in direct sun.</b>'+(ch&&ch.txt==="leaves"?' It leaves this spot at <b>'+at+'</b>.':ch&&ch.txt==="sunset"?' It stays until sunset.':'')
    :'<b>You are in shade</b>, from a '+storeys(here.by.h)+'-storey building '+Math.round(here.by.d)+' m to the '+compass(here.az)+'.'+(ch&&ch.txt==="arrives"?' The sun reaches this spot at <b>'+at+'</b>.':' No direct sun here in the next three hours.');
  // the two sidewalks, about 9 m either side of the street's centre line
  if(st){ const n=(st.b+90)*Math.PI/180, kx=111320*Math.cos(pos.lat*Math.PI/180), side=s=>({lat:pos.lat+Math.cos(n)*9*s/110540,lon:pos.lon+Math.sin(n)*9*s/kx});
    const A=lfbSun(T,side(1),t), B=lfbSun(T,side(-1),t), nm=k=>compass(st.b+(k>0?90:270));
    if(!A.down&&!B.down) out+=A.sun===B.sun?' Both sidewalks of this street are in '+(A.sun?'sun':'shade')+'.':' On this street the <b>'+(A.sun?nm(1):nm(-1))+'</b> sidewalk is in sun; the '+(A.sun?nm(-1):nm(1))+' sidewalk is in shade.'; }
  LF.shadeNext=ch&&ch.txt!=="sunset"?{m:t.getHours()*60+t.getMinutes()+ch.m,txt:ch.txt==="arrives"?"Sun reaches your spot":"Sun leaves your spot"}:null;
  return '<p class="lf-st lf-shade">'+out+' <span class="lf-src">From the city’s building heights.</span></p>'; }

/* The light log: tap "I shot this" in Light here and the light, direction, subject and settings are kept with the time and place.
   Rate it, and the log shows which light your keepers come from. */
state.lightLog=store.get("lightLog",[])||[];
function lfLog(o,S,sky,sp,pos,place){ state.lightLog.push({t:Date.now(),lat:+pos.lat.toFixed(4),lon:+pos.lon.toFixed(4),place:place||"",k:o.k,face:o.face==null?null:Math.round(o.face),subj:LF.subj||"auto",cam:state.camera,line:S.line,sky,alt:Math.round(sp.alt)}); if(state.lightLog.length>500) state.lightLog.shift(); store.set("lightLog",state.lightLog); LF.justLogged=true; }
function lfLogHtml(){ const L=state.lightLog, last=L[L.length-1], recent=last&&Date.now()-last.t<3*36e5;
  let h='<div class="lf-log"><button type="button" class="btn primary lf-shot" data-lf="log">I shot this</button>';
  if(recent&&LF.justLogged) h+='<p class="lf-st">Logged at '+hmText(new Date(last.t).getHours()*60+new Date(last.t).getMinutes())+': '+esc((LF_KIND[last.k]||last.k).toLowerCase())+', '+esc(last.line)+'.</p><div class="lf-subj"><button type="button" class="chip" data-lf="rate" data-r="keep" aria-pressed="'+(last.r==="keep")+'">Keeper</button><button type="button" class="chip" data-lf="rate" data-r="again" aria-pressed="'+(last.r==="again")+'">Try again</button><button type="button" class="chip" data-lf="undo">Undo</button></div>';
  if(L.length){ const by={}; for(const e of L){ const k=e.k; by[k]=by[k]||{n:0,keep:0}; by[k].n++; if(e.r==="keep") by[k].keep++; }
    const rows=Object.entries(by).sort((a,b)=>b[1].keep-a[1].keep||b[1].n-a[1].n), keeps=L.filter(e=>e.r==="keep").length, top=rows[0];
    h+='<p class="stk lf-ideah">Your light</p><p class="lf-st">'+L.length+' shot'+(L.length>1?'s':'')+' logged'+(keeps?', '+keeps+' keeper'+(keeps>1?'s':''):'')+'.'+(keeps>=3&&top[1].keep?' Most of your keepers come from <b>'+esc((LF_KIND[top[0]]||top[0]).toLowerCase())+'</b> ('+top[1].keep+' of '+keeps+').':'')+'</p>'+
      '<div class="lf-bars">'+rows.map(([k,v])=>'<div class="lf-bar"><span>'+esc(LF_KIND[k]||k)+'</span><i style="width:'+Math.max(4,Math.round(v.n/L.length*100))+'%"><b style="width:'+Math.round(v.keep/v.n*100)+'%"></b></i><em>'+v.n+(v.keep?' · '+v.keep+' kept':'')+'</em></div>').join("")+'</div>'+
      '<details class="lf-recent"><summary>Recent</summary>'+L.slice(-8).reverse().map(e=>{ const d=new Date(e.t); return '<p class="lf-st"><b>'+d.toLocaleDateString("en-US",{month:"short",day:"numeric"})+' '+hmText(d.getHours()*60+d.getMinutes())+'</b> · '+esc(e.place||"")+' · '+esc((LF_KIND[e.k]||e.k).toLowerCase())+(e.face!=null?' facing '+compass(e.face):'')+' · '+esc(e.line)+(e.r==="keep"?' · <b>keeper</b>':e.r==="again"?' · try again':'')+'</p>'; }).join("")+'</details>'; }
  return h+'</div>'; }

/* Camera view: the phone's camera with the sun, the moon, the way to point and the light around you drawn over the picture.
   Uses the compass for direction and the tilt sensor for up and down. Installed app only: Claude's page blocks the camera. */
const LFC = {on:false, stream:null, raf:0, tok:0, f:null, hf:null};
/* A phone's main camera sees about 67° along the long side of the picture (a 24-26 mm equivalent lens); the short side
   follows from the shape of the video (4:3 or 16:9), and the picture is cropped to fill the screen. */
const LFC_LONG = 67;
async function lfcStream(){ const tok=++LFC.tok; let st=null;
  try{ st=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},aspectRatio:{ideal:4/3}},audio:false}); }
  catch(e){ if(tok!==LFC.tok||!LFC.on) return; const b=$("lfcBot"); if(b&&!b.querySelector(".lfc-err")) b.insertAdjacentHTML("afterbegin",'<p class="lfc-err">'+(inFrame||!navigator.mediaDevices?'The camera is blocked inside Claude. Open Shot List from your home screen to use the camera view.':'The camera could not start. Allow camera access for Shot List in Settings and try again.')+'</p>'); return; }
  const v=$("lfcVid"); if(tok!==LFC.tok||!LFC.on||!v||document.hidden){ st.getTracks().forEach(t=>t.stop()); return; }   // closed or replaced while the camera was starting
  LFC.stream=st; v.srcObject=st; v.onloadedmetadata=()=>lfcDraw(); await v.play().catch(()=>{}); lfcDraw(); clearInterval(LFC.cxT); LFC.cxT=setInterval(lfcContrast,600); }
function lfcRelease(){ LFC.tok++; clearInterval(LFC.cxT); LFC.cxT=0; LFC.cxRun=[]; try{ if(LFC.stream) LFC.stream.getTracks().forEach(t=>t.stop()); }catch(e){} LFC.stream=null; const v=$("lfcVid"); if(v) v.srcObject=null; }
async function lfcOpen(){ if(LFC.on) return; const el=document.createElement("div"); el.id="lfcam"; el.className="lfcam"; el.setAttribute("role","dialog"); el.setAttribute("aria-label","Camera view");
  el.innerHTML='<video id="lfcVid" playsinline autoplay muted></video><svg class="lfc-fr" id="lfcFr" aria-hidden="true"></svg><svg class="lfc-hz" id="lfcHz" aria-hidden="true"></svg><svg class="lfc-gd" id="lfcGd" aria-hidden="true"></svg><svg class="lfc-sg" id="lfcSg" aria-hidden="true"></svg><div class="lfc-lv" id="lfcLv" hidden><i class="lv-ref"></i><i class="lv-bar" id="lfcLvBar"></i><i class="lv-ref r"></i></div><div class="lfc-info"><div class="lfc-cx" id="lfcCx" hidden></div><div class="lfc-lvt" id="lfcLvT" hidden></div><div class="lfc-sgt" id="lfcSgT" hidden></div></div><div class="lfc-ov" id="lfcOv"></div><div class="lfc-top"><span id="lfcTurn" class="lfc-turn"></span><button type="button" class="st-x" data-lf="camclose" aria-label="Close the camera view">×</button></div><div class="lfc-tape" id="lfcTape"></div><div class="lfc-bot" id="lfcBot"></div>';
  document.body.appendChild(el); LFC.on=true; lfcBottom();
  headingStart(); oriStart(); lfcDraw(); await lfcStream(); }
function lfcStop(){ lfcRelease(); const el=$("lfcam"); if(el) el.remove(); LFC.on=false; }
// the camera stops when the app goes to the background (iOS stops it anyway); start it again on return
document.addEventListener("visibilitychange",()=>{ if(!LFC.on) return; if(document.hidden) lfcRelease(); else lfcStream(); });
addEventListener("resize",()=>{ if(LFC.on) lfcDraw(); });
/* Leica frame lines: what the Q3 43 or Q3 (28 mm) and their crop modes take in, drawn as bright lines with the rest dimmed.
   The full-frame sensor is 36 × 24 mm, so a lens of F mm covers 2·atan(18/F) across the long side and 2·atan(12/F) across the short. */
const LFC_FRAMES = {q343:[43,60,75,90,150], q328:[28,35,50,75,90]};
function lfcFrameNow(){ const L=LFC_FRAMES[state.camera]; if(!L) return null; const v=+store.get("lfcFrame_"+state.camera,L[0]); return v===0?0:L.includes(v)?v:L[0]; }
function lfcFrameDraw(fr,hw,hh,W,H,dw,dh){ const el=$("lfcFr"); const x0=W/2-Math.min(dw,W)/2, y0=H/2-Math.min(dh,H)/2;
  LFC.full=fr?{x0:W/2-hw,y0:H/2-hh,x1:W/2+hw,y1:H/2+hh}:null;
  LFC.frame=fr?{x0:Math.max(W/2-hw,x0),y0:Math.max(H/2-hh,y0),x1:Math.min(W/2+hw,W-x0),y1:Math.min(H/2+hh,H-y0)}:{x0,y0,x1:W-x0,y1:H-y0};
  if(!el) return; el.setAttribute("viewBox","0 0 "+W+" "+H); if(!fr){ el.innerHTML=""; return; }
  const a=(W/2-hw).toFixed(1), b=(H/2-hh).toFixed(1), w=(2*hw).toFixed(1), h=(2*hh).toFixed(1), cut=hw>W/2*1.01||hh>H/2*1.01;
  el.innerHTML='<path class="lfc-mask" fill-rule="evenodd" d="M0 0H'+W+'V'+H+'H0Z M'+a+' '+b+'h'+w+'v'+h+'h'+(-w)+'Z"/><rect class="lfc-line" x="'+a+'" y="'+b+'" width="'+w+'" height="'+h+'"/>'+
    '<text class="lfc-frl" x="'+(Math.max(8,W/2-hw)+6).toFixed(1)+'" y="'+(Math.max(8,H/2-hh)+18).toFixed(1)+'">'+fr+' mm'+(cut?' · wider than the phone sees':'')+'</text>'; }
/* The contrast check: the picture inside the frame lines, sampled small, gives the spread between its bright and dark parts.
   The phone's own exposure and tone curve squeeze the range, so this reads low against what the Leica's sensor records:
   treat it as a guide to which way to push the exposure, not a meter. */
function lfcStats(px){ const n=px.length/4, hist=new Array(24).fill(0), lin=new Float32Array(n); let hiN=0, loN=0;
  for(let i=0;i<n;i++){ const y=0.2126*px[i*4]+0.7152*px[i*4+1]+0.0722*px[i*4+2], m=Math.max(px[i*4],px[i*4+1],px[i*4+2]); lin[i]=Math.pow(y/255,2.2); hist[Math.min(23,Math.floor(y/256*24))]++; if(m>=250) hiN++; if(y<=8) loN++; }
  lin.sort(); const q=p=>lin[Math.min(n-1,Math.max(0,Math.floor(p*(n-1))))], fl=1/512;
  return {stops:Math.log2(Math.max(q(0.98),fl)/Math.max(q(0.05),fl)), clipHi:hiN/n, clipLo:loN/n, mean:lin.reduce((a,b)=>a+b,0)/n, hist}; }
function lfcAdvice(st){ if(st.clipHi>0.05||st.stops>=6.5) return {k:"vhigh",label:"Very high contrast",ev:"−1 EV or more",txt:st.clipHi>0.05?"Bright parts are burning out. Expose for them and let the shadows go black, or move so less sky is in the frame.":"Expose for the bright parts and let the shadows go black: shapes and silhouettes, not detail."};
  if(st.stops>=4.5) return {k:"high",label:"High contrast",ev:"−0.7 EV",txt:"Keep the highlights; the DNG lifts the shadows later."};
  if(st.stops<=2) return {k:"flat",label:"Flat light",ev:"0 to +0.3 EV",txt:"Even light: expose as metered, a touch over so it does not go grey. Colour and gesture carry the picture."};
  return {k:"ok",label:"Normal range",ev:"0 EV",txt:"Expose as metered."}; }
function lfcContrast(){ const v=$("lfcVid"), el=$("lfcCx"); if(!LFC.on||!v||!el||!v.videoWidth||v.readyState<2||document.hidden||!LFC.frame) return;
  const r=LFC.frame, ox=(LFC.W-LFC.vw*LFC.s)/2, oy=(LFC.H-LFC.vh*LFC.s)/2, sx=Math.max(0,(r.x0-ox)/LFC.s), sy=Math.max(0,(r.y0-oy)/LFC.s), sw=Math.min(LFC.vw-sx,(r.x1-r.x0)/LFC.s), sh=Math.min(LFC.vh-sy,(r.y1-r.y0)/LFC.s);
  if(!(sw>4&&sh>4)) return; const cw=128, ch=Math.max(40,Math.min(256,Math.round(128*sh/sw)));
  const c=LFC.cv||(LFC.cv=document.createElement("canvas")); c.width=cw; c.height=ch; const g=c.getContext("2d",{willReadFrequently:true});
  let st, px; try{ g.drawImage(v,sx,sy,sw,sh,0,0,cw,ch); px=g.getImageData(0,0,cw,ch).data; st=lfcStats(px); }catch(e){ return; }
  try{ lfsTick(px,cw,ch,st,{x0:r.x0,y0:r.y0,x1:r.x0+sw*LFC.s,y1:r.y0+sh*LFC.s}); }catch(e){}
  // a running average over the last three looks, so the advice does not flicker as you move
  LFC.cxRun=(LFC.cxRun||[]).concat([st]).slice(-3); const avg={stops:LFC.cxRun.reduce((a,b)=>a+b.stops,0)/LFC.cxRun.length, clipHi:LFC.cxRun.reduce((a,b)=>a+b.clipHi,0)/LFC.cxRun.length};
  const A=lfcAdvice(avg), mx=Math.max(...st.hist,1); LFC.cxNow=Object.assign({},A,{stops:avg.stops,clipHi:avg.clipHi});
  el.className="lfc-cx k-"+A.k+(lfcOpt("stage")?" short":""); el.hidden=false;
  el.innerHTML='<svg class="lfc-hist" viewBox="0 0 48 20" aria-hidden="true">'+st.hist.map((h,i)=>'<rect x="'+(i*2)+'" y="'+(20-h/mx*20).toFixed(1)+'" width="1.6" height="'+(h/mx*20).toFixed(1)+'"/>').join("")+'</svg><span><b>'+A.label+'</b> · '+A.ev+'</span><small>'+esc(A.txt)+'</small>'; }
/* Composition guides, drawn inside the Leica frame so they match what the camera will take. */
const LFC_GUIDES = [["thirds","Thirds"],["golden","Golden"],["diag","Diagonals"],["centre","Centre"],["off","No grid"]];
const lfcGuide = () => { const g=store.get("lfcGuide","thirds"); return LFC_GUIDES.some(x=>x[0]===g)?g:"thirds"; };
const lfcOpt = k => store.get("lfc_"+k,true)!==false;
function lfcToolsHtml(){ const g=lfcGuide(), n=LFC_GUIDES.find(x=>x[0]===g)[1];
  return '<div class="lfc-frs lfc-tools" role="group" aria-label="Composition"><button type="button" class="chip" data-lfctool="guide" aria-pressed="'+(g!=="off")+'">'+(g==="off"?'Grid off':'Grid: '+n)+'</button><button type="button" class="chip" data-lfctool="level" aria-pressed="'+lfcOpt("level")+'">Level</button><button type="button" class="chip" data-lfctool="stage" aria-pressed="'+lfcOpt("stage")+'">Stage finder</button></div>'; }
function lfcPowerPts(g){ const a=g==="golden"?[0.382,0.618]:[1/3,2/3], P=[]; for(const x of a) for(const y of a) P.push([x,y]); if(g==="centre") P.push([0.5,0.5]); return P; }
function lfcGuides(){ const el=$("lfcGd"); if(!el) return; const W=LFC.W, H=LFC.H, R=LFC.full||LFC.frame, g=lfcGuide(); el.setAttribute("viewBox","0 0 "+W+" "+H);
  if(!R||g==="off"){ el.innerHTML=""; return; } const w=R.x1-R.x0, h=R.y1-R.y0, X=k=>(R.x0+w*k).toFixed(1), Y=k=>(R.y0+h*k).toFixed(1), L=(a,b,c,d)=>'<line x1="'+a+'" y1="'+b+'" x2="'+c+'" y2="'+d+'"/>';
  let o="";
  if(g==="thirds"||g==="golden"){ const a=g==="golden"?[0.382,0.618]:[1/3,2/3]; for(const k of a) o+=L(X(k),Y(0),X(k),Y(1))+L(X(0),Y(k),X(1),Y(k)); }
  else if(g==="centre"){ o+=L(X(0.5),Y(0),X(0.5),Y(1))+L(X(0),Y(0.5),X(1),Y(0.5)); }
  else if(g==="diag"){ // the two diagonals, and from each corner the line square to the diagonal it does not lie on (dynamic symmetry)
    o+=L(X(0),Y(0),X(1),Y(1))+L(X(1),Y(0),X(0),Y(1));
    const clip=(px,py,dx,dy)=>{ let t=1e9; for(const [p,d,lo,hi] of [[px,dx,R.x0,R.x1],[py,dy,R.y0,R.y1]]){ if(d>1e-9) t=Math.min(t,(hi-p)/d); else if(d<-1e-9) t=Math.min(t,(lo-p)/d); } return [px+dx*t,py+dy*t]; };
    for(const [cx,cy,dx,dy] of [[R.x1,R.y0,-h,w],[R.x0,R.y1,h,-w],[R.x0,R.y0,h,w],[R.x1,R.y1,-h,-w]]){ const [ex,ey]=clip(cx,cy,dx,dy); o+=L(cx.toFixed(1),cy.toFixed(1),ex.toFixed(1),ey.toFixed(1)); } }
  el.innerHTML=o; }
/* The level: the true horizontal from the tilt sensors, against marks that are level with the screen. And leaning buildings:
   with the phone tipped up or down by p, vertical lines at the frame's edge lean by about atan(tan(half width) · tan p). */
function lfcLevel(){ const el=$("lfcLv"); if(!el) return; const p=ORI.elev, R=LFC.frame;
  if(!lfcOpt("level")||p==null||!R||Math.abs(p)>50){ el.hidden=true; LFC.lv=null; const t=$("lfcLvT"); if(t) t.hidden=true; return; }
  let ang=0; try{ ang=((screen.orientation&&screen.orientation.angle)||window.orientation||0); }catch(x){}
  const tilt=((((ORI.roll||0)-ang)%360)+540)%360-180, F=LFC.full||R, half=Math.atan((F.x1-F.x0)/2/LFC.f), lean=Math.atan(Math.tan(half)*Math.tan(Math.abs(p)*Math.PI/180))*180/Math.PI, lvl=Math.abs(tilt)<1;
  LFC.lv={tilt,lean,pitch:p};
  el.hidden=false; el.style.left=((R.x0+R.x1)/2).toFixed(0)+"px"; el.style.top=((R.y0+R.y1)/2).toFixed(0)+"px"; el.classList.toggle("ok",lvl);
  const bar=$("lfcLvBar"); if(bar) bar.style.transform="rotate("+tilt.toFixed(1)+"deg)";
  const t=$("lfcLvT"), bld=LF.subj==="building"; if(t){ const bits=[lvl?"Level":Math.round(Math.abs(tilt))+"° off level"];
    if(lean>=1) bits.push("verticals lean "+Math.round(lean)+"°: tip "+(p>0?"down":"up")+" "+Math.round(Math.abs(p))+"°"+(bld?", step back":""));
    else if(bld&&Math.abs(p)<1.5) bits.push("verticals straight");
    t.textContent=bits.join(" · "); t.classList.toggle("warn",!lvl||lean>=(bld?1:3)); t.hidden=lvl&&lean<1&&!bld; } }
/* The stage finder. On a small grey copy of what is inside the frame lines it looks for:
   - straight lines (edges voted into a Hough transform) and, when the slanting ones agree, the point where they meet;
   - pools of light: patches clearly brighter than what surrounds them (not the sky along the top);
   - where the eye goes first: the strongest difference between a spot and its surroundings;
   - bright patches on the left, right or bottom edge that pull the eye out of the picture.
   It then suggests where to put a subject (a strong point of the grid that is lit and uncluttered, or the pool of light) and
   how far to turn. Coordinates are 0 to 1 across the frame. It sees shapes and light, not moments: the picture is still yours. */
function lfsAnalyze(px,cw,ch,stops,guide){ const n=cw*ch, Y=new Float32Array(n), Lin=new Float32Array(n), Bl=new Float32Array(n);
  for(let i=0;i<n;i++){ const r=px[i*4], g=px[i*4+1], b=px[i*4+2], y=0.2126*r+0.7152*g+0.0722*b; Y[i]=y; Lin[i]=Math.pow(y/255,2.2); Bl[i]=b-(r+g)/2; }
  const q=(a,p)=>a[Math.min(a.length-1,Math.max(0,Math.floor(p*(a.length-1))))], sortedY=Float32Array.from(Y).sort(), medY=q(sortedY,0.5);
  // edges, thinned to their ridge so a line votes once, not as a smear
  const mag=new Float32Array(n), gx=new Float32Array(n), gy=new Float32Array(n);
  for(let y=1;y<ch-1;y++) for(let x=1;x<cw-1;x++){ const i=y*cw+x, a=Y[i-cw-1], b=Y[i-cw], c=Y[i-cw+1], d=Y[i-1], e=Y[i+1], f=Y[i+cw-1], g=Y[i+cw], h=Y[i+cw+1];
    const X=(c+2*e+h)-(a+2*d+f), V=(f+2*g+h)-(a+2*b+c); gx[i]=X; gy[i]=V; mag[i]=Math.hypot(X,V); }
  const thin=new Uint8Array(n), T=Math.max(70,q(Float32Array.from(mag).sort(),0.85));
  for(let y=1;y<ch-1;y++) for(let x=1;x<cw-1;x++){ const i=y*cw+x, m=mag[i]; if(m<T) continue; const ax=Math.abs(gx[i]), ay=Math.abs(gy[i]);
    let o; if(ax>2.4*ay) o=1; else if(ay>2.4*ax) o=cw; else o=(gx[i]>0)===(gy[i]>0)?cw+1:cw-1; if(m>=mag[i-o]&&m>=mag[i+o]) thin[i]=1; }
  // how busy the picture is: the share of clearly strong edges (an absolute measure, so a calm beach reads calm)
  let strong=0; for(let i=0;i<n;i++) if(mag[i]>=160) strong++; const busy=strong/n;
  // the sky: smooth, bright-ish pixels reached from the top edge
  const sky=new Uint8Array(n), stk=[], skyMin=Math.min(140,Math.max(q(sortedY,0.55),115)); const skyOk=i=>mag[i]<110&&(Y[i]>=skyMin||(Bl[i]>25&&Y[i]>=95));   /* bright, or clearly blue */
  for(let x=0;x<cw;x++) if(skyOk(x)){ sky[x]=1; stk.push(x); }
  while(stk.length){ const i=stk.pop(), x=i%cw; for(const j of [i-1,i+1,i+cw,i-cw]){ if(j<0||j>=n||sky[j]) continue; if((j===i-1&&x===0)||(j===i+1&&x===cw-1)) continue; if(skyOk(j)&&Math.abs(Y[j]-Y[i])<=10){ sky[j]=1; stk.push(j); } } }   /* stops at a step in brightness, such as the horizon */
  let skyN=0; for(let i=0;i<n;i++) skyN+=sky[i];
  // lines: theta in 2-degree steps, each thinned edge pixel votes close to its own gradient direction
  const NT=90, diag=Math.ceil(Math.hypot(cw,ch)/2), NR=2*diag+1, acc=new Float32Array(NT*NR), cx=cw/2, cy=ch/2, CS=[], SN=[];
  for(let t=0;t<NT;t++){ CS.push(Math.cos(t*2*Math.PI/180)); SN.push(Math.sin(t*2*Math.PI/180)); }
  for(let y=1;y<ch-1;y++) for(let x=1;x<cw-1;x++){ const i=y*cw+x; if(!thin[i]) continue; let th=Math.atan2(gy[i],gx[i])*180/Math.PI; th=((th%180)+180)%180; const t0=Math.round(th/2);
    for(let k=-3;k<=3;k++){ const t=((t0+k)%NT+NT)%NT, r=Math.round((x-cx)*CS[t]+(y-cy)*SN[t])+diag; acc[t*NR+r]+=k===0?1:Math.abs(k)===1?0.8:Math.abs(k)===2?0.5:0.25; } }
  const lines=[], minV=Math.max(12,0.2*Math.min(cw,ch)), A=Float32Array.from(acc);
  for(let k=0;k<12;k++){ let bi=-1, bv=minV; for(let i=0;i<A.length;i++) if(A[i]>bv){ bv=A[i]; bi=i; } if(bi<0) break;
    const t=Math.floor(bi/NR), r=bi%NR-diag; lines.push({th:t*2,rho:r,v:bv});
    for(let dt=-3;dt<=3;dt++) for(let dr=-5;dr<=5;dr++){ let tt=t+dt, rr=r+dr; if(tt<0){ tt+=NT; rr=-rr; } else if(tt>=NT){ tt-=NT; rr=-rr; } if(rr+diag<0||rr+diag>=NR) continue; A[tt*NR+rr+diag]=0; } }
  // where the slanting edges meet: every short slanting edge votes along its own direction into a grid that reaches half a frame
  // beyond each side; textures scatter their votes, a street's lines pile theirs up in one place. Votes near the edge itself
  // are skipped, and the winner needs support from edges slanting both ways (or many from one side, for a wall in perspective).
  let vp=null; { const GX=48, GY=48, gw=2*cw/GX, gh=2*ch/GY, V=new Float32Array(GX*GY), side=new Float32Array(GX*GY*2), mark=new Int32Array(GX*GY).fill(-1), near=0.12*Math.min(cw,ch);
    let id=0, nVote=0, nThin=0; for(let i=0;i<n;i++) nThin+=thin[i];
    for(let y=1;y<ch-1;y++) for(let x=1;x<cw-1;x++){ const i=y*cw+x; if(!thin[i]) continue; const g=mag[i], dx=-gy[i]/g, dy=gx[i]/g, a=Math.abs(Math.atan2(dy,dx)*180/Math.PI)%180, ang=a>90?180-a:a;
      if(ang<12||ang>78) continue;   // level and upright edges meet far away or never: they do not vote
      if(nThin>900&&((x+y)&1)) continue; id++; nVote++; const sgn=(dx*dy>0)?0:1, step=Math.min(gw,gh)*0.8, L=2.2*Math.hypot(cw,ch);
      for(let t=-L;t<=L;t+=step){ if(Math.abs(t)<near) continue; const px=x+dx*t, py=y+dy*t, cxg=Math.floor((px+cw/2)/gw), cyg=Math.floor((py+ch/2)/gh); if(cxg<0||cxg>=GX||cyg<0||cyg>=GY) continue; const k=cyg*GX+cxg; if(mark[k]===id) continue; mark[k]=id; V[k]+=1; side[k*2+sgn]+=1; } }
    if(nVote>=30){ let bi=0; for(let k=1;k<V.length;k++) if(V[k]>V[bi]) bi=k; let mean=0; for(let k=0;k<V.length;k++) mean+=V[k]; mean/=V.length;
      const bx=bi%GX, by=(bi-bx)/GX; let sx=0, sy=0, sw=0; for(let yy=by-1;yy<=by+1;yy++) for(let xx=bx-1;xx<=bx+1;xx++){ if(xx<0||yy<0||xx>=GX||yy>=GY) continue; const v=V[yy*GX+xx]; sx+=v*(xx+0.5); sy+=v*(yy+0.5); sw+=v; }
      const pk=V[bi], s0=side[bi*2], s1=side[bi*2+1], both=Math.min(s0,s1)>=0.18*pk, frac=pk/nVote;
      if((both&&pk>=5*mean&&frac>=0.14)||(!both&&pk>=7*mean&&frac>=0.16)){ const vx=(sx/sw*gw-cw/2)/cw, vy=(sy/sw*gh-ch/2)/ch; vp={x:vx,y:vy,n:Math.round(pk),inF:vx>=0&&vx<=1&&vy>=0&&vy<=1}; } } }
  // the long lines that run into the meeting point are the ones drawn
  if(vp){ const X=vp.x*cw-cx, Yv=vp.y*ch-cy, tol=0.05*Math.max(cw,ch); for(const L of lines){ const a=L.th%180; if(a<12||a>168||(a>78&&a<102)) continue; if(Math.abs(X*Math.cos(L.th*Math.PI/180)+Yv*Math.sin(L.th*Math.PI/180)-L.rho)<=tol) L.vp=true; } }
  // a horizon: a long, nearly level line, or the lower edge of the sky
  let horizon=null; { const h=lines.filter(L=>L.th>=82&&L.th<=98&&L.v>=0.45*cw).sort((a,b)=>b.v-a.v)[0]; if(h){ const yc=(h.rho/Math.sin(h.th*Math.PI/180)+cy)/ch; if(yc>0.08&&yc<0.92) horizon={y:yc,ang:h.th-90}; }
    if(!horizon&&skyN>0.12*n){ let rows=0, sum=0, sq=0; for(let x=0;x<cw;x++){ let y=0; while(y<ch&&sky[y*cw+x]) y++; if(y>0&&y<ch){ sum+=y; sq+=y*y; rows++; } } const m=rows?sum/rows:0, sd=rows?Math.sqrt(Math.max(0,sq/rows-m*m)):1e9; if(rows>0.8*cw&&sd<0.04*ch) horizon={y:m/ch,ang:0,sky:true}; }
    if(horizon){ const hy=Math.round(horizon.y*ch); let a=0,b=0,na=0,nb=0; for(let y=1;y<ch-1;y++) for(let x=1;x<cw-1;x++){ const v=mag[y*cw+x]>=100?1:0; if(y<hy){ a+=v; na++; } else { b+=v; nb++; } } horizon.busyBelow=(b/Math.max(1,nb))>=(a/Math.max(1,na)); } }
  // box means from an integral image
  const I=new Float64Array((cw+1)*(ch+1)); for(let y=0;y<ch;y++){ let row=0; for(let x=0;x<cw;x++){ row+=Lin[y*cw+x]; I[(y+1)*(cw+1)+x+1]=I[y*(cw+1)+x+1]+row; } }
  const box=(x0,y0,x1,y1)=>{ x0=Math.max(0,x0); y0=Math.max(0,y0); x1=Math.min(cw,x1); y1=Math.min(ch,y1); const a=(x1-x0)*(y1-y0); if(a<=0) return 0; return (I[y1*(cw+1)+x1]-I[y0*(cw+1)+x1]-I[y1*(cw+1)+x0]+I[y0*(cw+1)+x0])/a; };
  const sl=Float32Array.from(Lin).sort(), p80=q(sl,0.8), medL=q(sl,0.5);
  // pools of light: a solid lit patch, away from the sides and the sky, clearly brighter than the shade around it
  let pool=null; const Rb=Math.max(4,Math.round(Math.min(cw,ch)/5));
  if(stops>=2.5){ const mask=new Uint8Array(n); for(let i=0;i<n;i++) if(Lin[i]>=p80&&Y[i]>=50&&!sky[i]) mask[i]=1;
    const seen=new Uint8Array(n), st=[];
    for(let i0=0;i0<n;i0++){ if(!mask[i0]||seen[i0]) continue; let area=0, sx=0, sy=0, x0=1e9,y0=1e9,x1=-1,y1=-1, nearSky=0, blue=0, sum=0; st.push(i0); seen[i0]=1;
      while(st.length){ const i=st.pop(), x=i%cw, y=(i-x)/cw; area++; sx+=x; sy+=y; sum+=Lin[i]; blue+=Bl[i]; if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y;
        for(const j of [i-1,i+1,i-cw,i+cw]){ if(j<0||j>=n) continue; if((j===i-1&&x===0)||(j===i+1&&x===cw-1)) continue; if(sky[j]) nearSky++; if(seen[j]||!mask[j]) continue; seen[j]=1; st.push(j); } }
      const fr=area/n, bw=x1-x0+1, bh=y1-y0+1; if(fr<0.008||fr>0.09||y0===0||x0===0||x1===cw-1||bw<3||bh<3||area/(bw*bh)<0.4||nearSky>0.05*area||blue/area>18) continue;
      const mean=sum/area, ex=Math.max(bw,bh), outer=box(x0-ex,y0-ex,x1+1+ex,y1+1+ex), oa=Math.max(1,(Math.min(cw,x1+1+ex)-Math.max(0,x0-ex))*(Math.min(ch,y1+1+ex)-Math.max(0,y0-ex))-area), ring=(outer*(oa+area)-sum)/oa;
      if(!(ring<=medL*1.05&&mean>=2.6*Math.max(ring,1e-4))) continue;   // lit, with shade around it: not a white wall among white walls
      const score=fr*Math.log2(mean/Math.max(ring,1e-4)); if(!pool||score>pool.score) pool={x:(sx/area+0.5)/cw,y:(sy/area+0.5)/ch,x0:x0/cw,y0:y0/ch,x1:(x1+1)/cw,y1:(y1+1)/ch,area:fr,score}; } }
  // symmetry: the picture against its own mirror image, about the best upright axis near the middle
  let sym=null; { let best=null; const S=Math.round(cw*0.12), rowM=new Float32Array(ch); for(let y=0;y<ch;y++){ let t=0; for(let x=0;x<cw;x++) t+=Y[y*cw+x]; rowM[y]=t/cw; }   /* only side-to-side structure counts: level bands mirror trivially */
    for(let s=-S;s<=S;s+=2){ const ax=cw/2+s/2; let sxy=0,sxx=0,syy=0,sx=0,sy=0,m=0; for(let y=0;y<ch;y+=2) for(let x=0;x<cw;x+=2){ const xm=Math.round(2*ax-x); if(xm<0||xm>=cw||xm<=x) continue; const a=Y[y*cw+x]-rowM[y], b=Y[y*cw+xm]-rowM[y]; sx+=a; sy+=b; sxx+=a*a; syy+=b*b; sxy+=a*b; m++; }
      if(m<0.2*n/4) continue; const c=(sxy-sx*sy/m)/Math.sqrt(Math.max(1e-6,(sxx-sx*sx/m)*(syy-sy*sy/m))); if(!best||c>best.c) best={c,x:ax/cw}; }
    if(best&&best.c>=0.4) sym=best; }
  // where the eye goes first: a cell clearly brighter or darker than what surrounds it (not the sky)
  let sal=null; { const C=4, Rr=5, cells=[]; for(let r=0;r<Rr;r++) for(let c=0;c<C;c++){ const x0=Math.floor(c*cw/C), x1=Math.floor((c+1)*cw/C), y0=Math.floor(r*ch/Rr), y1=Math.floor((r+1)*ch/Rr); let sk=0; for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) sk+=sky[y*cw+x];
      const inner=box(x0,y0,x1,y1), outer=box(x0-(x1-x0),y0-(y1-y0),x1+(x1-x0),y1+(y1-y0)); cells.push({v:sk>0.3*(x1-x0)*(y1-y0)?0:Math.abs(Math.log2(Math.max(inner,1e-4)/Math.max(outer,1e-4))),x:(x0+x1)/2/cw,y:(y0+y1)/2/ch}); }
    const mean=cells.reduce((t,c)=>t+c.v,0)/cells.length, best=cells.reduce((a,b)=>b.v>a.v?b:a); if(best.v>=1.1&&best.v>=2.4*mean) sal={x:best.x,y:best.y}; }
  // bright patches on the left, right or bottom edge (the sky along the top is not one)
  let edge=null; { const b=Math.max(2,Math.round(0.05*Math.min(cw,ch))), hot=Math.max(q(sortedY,0.97),200,medY+60), side={left:[0,0],right:[0,0],bottom:[0,0]}, y0=Math.round(ch*0.2);
    for(let y=y0;y<ch;y++) for(let x=0;x<cw;x++){ const i=y*cw+x, v=Y[i]>=hot&&!sky[i]?1:0; if(x<b){ side.left[0]+=v; side.left[1]++; } if(x>=cw-b){ side.right[0]+=v; side.right[1]++; } if(y>=ch-b){ side.bottom[0]+=v; side.bottom[1]++; } }
    let best=null; for(const k of ["left","right","bottom"]){ const fr=side[k][0]/side[k][1]; if(fr>=0.1&&fr<=0.6&&(!best||fr>best[1])) best=[k,fr]; } if(best) edge=best[0]; }
  // where to put a subject: a strong point of the grid that is on the ground (not sky), lit, uncluttered and near the lines
  const pts=lfcPowerPts(guide), rad=0.12, skyAt=(x,y)=>{ let s=0,m=0; for(let yy=Math.max(0,Math.round((y-rad)*ch));yy<Math.min(ch,Math.round((y+rad)*ch));yy++) for(let xx=Math.max(0,Math.round((x-rad)*cw));xx<Math.min(cw,Math.round((x+rad)*cw));xx++){ m++; s+=sky[yy*cw+xx]; } return m?s/m:0; };
  const scored=pts.map(([x,y])=>{ const X0=Math.round((x-rad)*cw), X1=Math.round((x+rad)*cw), Y0=Math.round((y-rad*cw/ch)*ch), Y1=Math.round((y+rad*cw/ch)*ch); let e=0, m=0;
      for(let yy=Math.max(1,Y0);yy<Math.min(ch-1,Y1);yy++) for(let xx=Math.max(1,X0);xx<Math.min(cw-1,X1);xx++){ m++; if(mag[yy*cw+xx]>=T) e++; }
      const clutter=m?e/m:0, lit=Math.max(-1,Math.min(1,Math.log2(Math.max(box(X0,Y0,X1,Y1),1e-4)/Math.max(medL,1e-4))/2)), nearVp=vp&&vp.inF?Math.max(0,1-Math.hypot(vp.x-x,(vp.y-y)*ch/cw)/0.5):0;
      return {x,y,s:0.6*lit-1.2*clutter+0.6*nearVp-3*skyAt(x,y)+(y>0.5?0.25:0)+(horizon&&y<horizon.y?-1:0)+(vp&&vp.inF&&y<vp.y-0.05?-1:0)}; }).sort((a,b)=>b.s-a.s);   /* people stand below eye level, which is where the lines meet */
  const target=pool?{x:pool.x,y:pool.y,why:"pool"}:(vp&&vp.inF)||horizon||sym||sal?{x:scored[0].x,y:scored[0].y,why:"grid"}:null;
  return {lines:(vp?lines.filter(L=>L.vp):lines.slice(0,3)).map(L=>({th:L.th,rho:L.rho,v:L.v,cx,cy,cw,ch})),vp,pool,sal,edge,target,horizon,sym,busy,sky:skyN/n,pts}; }
const lfsWhere = (x,y) => { const h=x<0.36?0:x>0.64?2:1, v=y<0.36?0:y>0.64?2:1; return [["upper left","at the top","upper right"],["on the left","in the middle","on the right"],["lower left","at the bottom","lower right"]][v][h]; };
/* Turn and tilt, in degrees, to move a point of the picture onto another: turning right moves the scene left on the screen. */
function lfsNudge(fx,fy,tx,ty,R,f){ const d=180/Math.PI, sx=R.x0+fx*(R.x1-R.x0), sy=R.y0+fy*(R.y1-R.y0), X=R.x0+tx*(R.x1-R.x0), Yt=R.y0+ty*(R.y1-R.y0), right=Math.atan((sx-X)/f)*d, up=Math.atan((Yt-sy)/f)*d, out=[];
  if(Math.abs(right)>=1.5) out.push("turn "+Math.round(Math.abs(right))+"° "+(right>0?"right":"left")); if(Math.abs(up)>=2) out.push("tilt "+Math.round(Math.abs(up))+"° "+(up>0?"up":"down")); return out; }
function lfsAdvice(S,R,f,guide){ const msgs=[], P=lfcPowerPts(guide), near=(x,y)=>P.reduce((a,p)=>Math.hypot(p[0]-x,p[1]-y)<Math.hypot(a[0]-x,a[1]-y)?p:a);
  if(S.pool){ const p=near(S.pool.x,S.pool.y), d=Math.hypot(p[0]-S.pool.x,p[1]-S.pool.y), nd=lfsNudge(S.pool.x,S.pool.y,p[0],p[1],R,f);
    msgs.push({k:"pool",t:"Pool of light "+lfsWhere(S.pool.x,S.pool.y)+": wait for someone to step in."+(d>0.06&&nd.length?" "+lfsCap(nd.join(" and "))+" to put it on a third.":" It sits on a third.")}); }
  if(S.vp){ const inF=S.vp.inF, p=near(S.vp.x,S.vp.y), dc=Math.hypot(S.vp.x-0.5,S.vp.y-0.5), dp=Math.hypot(p[0]-S.vp.x,p[1]-S.vp.y);
    if(inF){ const toC=dc<dp, a=toC?lfsNudge(S.vp.x,S.vp.y,0.5,0.5,R,f):lfsNudge(S.vp.x,S.vp.y,p[0],p[1],R,f);
      const t=dp<0.05?"on a third, so they lead the eye there.":dc<0.05?"in the centre: symmetry, keep it straight.":a.length?a.join(" and ")+(toC?" to centre them.":" to put them on a third."):toC?"keep it straight for symmetry.":"close to a third.";
      msgs.push({k:"vp",t:"Lines meet "+lfsWhere(S.vp.x,S.vp.y)+": "+t}); }
    else msgs.push({k:"vp",t:"Lines lead out "+(S.vp.x<0?"to the left":S.vp.x>1?"to the right":S.vp.y<0?"at the top":"at the bottom")+": turn that way to bring where they meet into the frame."}); }
  if(!msgs.length&&S.horizon){ const y=S.horizon.y; if(y>0.38&&y<0.62){ const below=S.horizon.busyBelow, to=below===false?2/3:1/3, nd=lfsNudge(0.5,y,0.5,to,R,f); msgs.push({k:"hz",t:"The horizon cuts the frame in half: "+(nd.length?nd.join(" and ")+" to put it on the "+(to<0.5?"upper third, with more ground.":"lower third, with more sky."):"move it to a third.")}); } }
  if(!msgs.length&&S.sym){ const nd=lfsNudge(S.sym.x,0.5,0.5,0.5,R,f); msgs.push({k:"sym",t:"Symmetric scene: "+(Math.abs(S.sym.x-0.5)<0.03||!nd.length?"it is centred, so stand square and keep it level.":nd.join(" and ")+" to centre it, and stand square.")}); }
  if(!msgs.length&&S.sal) msgs.push({k:"sal",t:"The eye goes first to the bright area "+lfsWhere(S.sal.x,S.sal.y)+": put your subject there, or keep it clear."});
  if(S.edge) msgs.push({k:"edge",t:"Bright patch on the "+S.edge+" edge pulls the eye out: "+({left:"turn a little right",right:"turn a little left",bottom:"tilt up a little",top:"tilt down a little"})[S.edge]+"."});
  if(!msgs.length) msgs.push({k:"none",t:S.busy<0.15?"No strong lines or light here: look for a shaft of light or a line that leads in.":"Busy, no clear lines or light: step closer or frame against a plain wall."});
  // one tip, plus the edge warning when there is one
  return msgs[0].k==="edge"||!S.edge?msgs.slice(0,1):[msgs[0],msgs.find(m=>m.k==="edge")]; }
const lfsCap = t => t.charAt(0).toUpperCase()+t.slice(1);
function lfsTick(px,cw,ch,st,R){ const svg=$("lfcSg"), tx=$("lfcSgT"); if(!svg||!tx) return; if(!lfcOpt("stage")){ svg.innerHTML=""; tx.hidden=true; return; }
  const g=lfcGuide(), S=lfsAnalyze(px,cw,ch,st.stops,g), prev=LFC.sg, mix=(a,b,k)=>a&&b&&Math.hypot(a.x-b.x,a.y-b.y)<0.15?{...b,x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k}:b;
  // smooth what moves, so the marks do not jump about between looks
  if(prev){ S.vp=mix(prev.vp,S.vp,0.5); if(S.vp) S.vp.inF=S.vp.x>=0&&S.vp.x<=1&&S.vp.y>=0&&S.vp.y<=1; S.pool=mix(prev.pool,S.pool,0.5); S.target=mix(prev.target,S.target,0.4); }
  LFC.sg=S; const W=LFC.W, H=LFC.H, X=x=>R.x0+x*(R.x1-R.x0), Yp=y=>R.y0+y*(R.y1-R.y0), F=v=>v.toFixed(1); svg.setAttribute("viewBox","0 0 "+W+" "+H);
  let o="";
  for(const L of S.lines){ const c=Math.cos(L.th*Math.PI/180), s=Math.sin(L.th*Math.PI/180), pts=[];
    // where the line crosses the frame's edges, in sample pixels, then on screen
    for(const x of [0,L.cw]){ if(Math.abs(s)>1e-6){ const y=(L.rho-(x-L.cx)*c)/s+L.cy; if(y>=0&&y<=L.ch) pts.push([x,y]); } }
    for(const y of [0,L.ch]){ if(Math.abs(c)>1e-6){ const x=(L.rho-(y-L.cy)*s)/c+L.cx; if(x>=0&&x<=L.cw) pts.push([x,y]); } }
    if(pts.length>=2) o+='<line class="sg-l" x1="'+F(X(pts[0][0]/L.cw))+'" y1="'+F(Yp(pts[0][1]/L.ch))+'" x2="'+F(X(pts[1][0]/L.cw))+'" y2="'+F(Yp(pts[1][1]/L.ch))+'"/>'; }
  if(S.vp&&S.vp.x>=0&&S.vp.x<=1&&S.vp.y>=0&&S.vp.y<=1){ const x=X(S.vp.x), y=Yp(S.vp.y); o+='<circle class="sg-vp" cx="'+F(x)+'" cy="'+F(y)+'" r="8"/><text class="sg-t" x="'+F(x+12)+'" y="'+F(y+4)+'">Lines meet</text>'; }
  if(S.pool){ const x0=X(S.pool.x0), y0=Yp(S.pool.y0), x1=X(S.pool.x1), y1=Yp(S.pool.y1); o+='<rect class="sg-pool" x="'+F(x0)+'" y="'+F(y0)+'" width="'+F(x1-x0)+'" height="'+F(y1-y0)+'" rx="8"/><text class="sg-t sg-tp" x="'+F(x0+4)+'" y="'+F(y0-5)+'">Light</text>'; }
  if(S.edge){ const e={left:[R.x0,R.y0,R.x0,R.y1],right:[R.x1,R.y0,R.x1,R.y1],bottom:[R.x0,R.y1,R.x1,R.y1],top:[R.x0,R.y0,R.x1,R.y0]}[S.edge]; o+='<line class="sg-edge" x1="'+F(e[0])+'" y1="'+F(e[1])+'" x2="'+F(e[2])+'" y2="'+F(e[3])+'"/>'; }
  if(S.target){ const tx0=X(S.target.x), ty0=Yp(S.target.y); o+='<g class="sg-tg"><circle cx="'+F(tx0)+'" cy="'+F(ty0)+'" r="17"/><circle cx="'+F(tx0)+'" cy="'+F(ty0)+'" r="3"/></g><text class="sg-t sg-tt" x="'+F(tx0)+'" y="'+F(S.vp&&Math.hypot(X(S.vp.x)-tx0,Yp(S.vp.y)-ty0)<60&&Yp(S.vp.y)>ty0?ty0-24:ty0+32)+'" text-anchor="middle">Subject here</text>'; }
  svg.innerHTML=o;
  // the words change only when the same advice comes up twice running
  const M=lfsAdvice(S,R,LFC.f,g), key=M.map(m=>m.k).join(","); if(key===LFC.sgKey||!LFC.sgMsgs){ LFC.sgMsgs=M; } LFC.sgKey=key;
  tx.hidden=false; tx.innerHTML='<b>Stage</b>'+LFC.sgMsgs.map(m=>'<span>'+esc(m.t)+'</span>').join(""); }
function lfcBottom(){ const b=$("lfcBot"); if(!b||!LF.cur) return; const o=LF.cur, e=b.querySelector(".lfc-err"); const L=LFC_FRAMES[state.camera], fr=lfcFrameNow();
  b.innerHTML=(e?e.outerHTML:'')+(L?'<div class="lfc-frs" role="group" aria-label="Frame lines">'+L.map(n=>'<button type="button" class="chip" data-lfcfr="'+n+'" aria-pressed="'+(fr===n)+'">'+n+(n===L[0]?' mm':'')+'</button>').join("")+'<button type="button" class="chip" data-lfcfr="0" aria-pressed="'+(fr===0)+'">Off</button></div>':'')+lfcToolsHtml()+'<b>'+esc(o.title)+'</b><span>'+esc(LF.curLine||"")+'</span>'; }
/* Where a direction in the sky lands on the screen: a pinhole camera turned the way the phone is (where the camera points, how far
   up, how far it is rolled), then the screen's own rotation when the phone is held sideways. Null when it is behind the camera. */
function lfcProject(hd,el,roll,ang,f,W,H){ const d=Math.PI/180, rho=-roll*d;
  const c=[Math.sin(hd*d)*Math.cos(el*d),Math.cos(hd*d)*Math.cos(el*d),Math.sin(el*d)], u0=[-Math.sin(hd*d)*Math.sin(el*d),-Math.cos(hd*d)*Math.sin(el*d),Math.cos(el*d)], r0=[c[1]*u0[2]-c[2]*u0[1],c[2]*u0[0]-c[0]*u0[2],c[0]*u0[1]-c[1]*u0[0]];
  const up=u0.map((v,i)=>v*Math.cos(rho)+r0[i]*Math.sin(rho)), rt=r0.map((v,i)=>v*Math.cos(rho)-u0[i]*Math.sin(rho)), sa=Math.sin(ang*d), ca=Math.cos(ang*d), dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  return (az,alt)=>{ const w=[Math.sin(az*d)*Math.cos(alt*d),Math.cos(az*d)*Math.cos(alt*d),Math.sin(alt*d)], z=dot(w,c), x=dot(w,rt), y=dot(w,up), sx=x*ca-y*sa, sy=x*sa+y*ca;
    return {x:W/2+f*sx/Math.max(z,1e-3), y:H/2-f*sy/Math.max(z,1e-3), front:z>0.02, sx, sy}; }; }
function lfcDraw(){ LFC.raf=0; if(!LFC.on) return; const ov=$("lfcOv"), v=$("lfcVid"), hzEl=$("lfcHz"); if(!ov) return; const W=ov.clientWidth, H=ov.clientHeight, c=CITIES[state.city];
  const pos=state.pos&&kmBetween(state.pos,c)<60?state.pos:{lat:c.lat,lon:c.lon}, t=new Date(Date.now()+(LF.off||0)*6e4), sp=sunPos(t,pos.lat,pos.lon), mo=moonPos(t,pos.lat,pos.lon), o=LF.cur;
  // focal length in screen pixels, from the video's shape and how much of it is cropped to fill the screen
  let vw=v&&v.videoWidth, vh=v&&v.videoHeight; if(!vw||!vh){ vw=W<H?3:4; vh=W<H?4:3; }
  const d=Math.PI/180, fr=lfcFrameNow(), port=W<H, fOf=s=>s*(Math.max(vw,vh)/2)/Math.tan(LFC_LONG/2*d), half=(f,a)=>f*(a?(port?12:18):(port?18:12))/fr;
  let s=Math.max(W/vw,H/vh), fit="cover"; if(fr&&(half(fOf(s),1)>W/2*1.01||half(fOf(s),0)>H/2*1.01)){ s=Math.min(W/vw,H/vh); fit="contain"; }
  if(v&&v.style.objectFit!==fit) v.style.objectFit=fit;
  const f=fOf(s), hf=2*Math.atan(W/2/f); Object.assign(LFC,{f,hf:hf/d,s,vw,vh,W,H,fit});
  lfcFrameDraw(fr,fr?half(f,1):0,fr?half(f,0):0,W,H,s*vw,s*vh); lfcGuides(); lfcLevel();
  const hd=ORI.cam, pitch=ORI.elev||0; if(hd==null){ if(hzEl) hzEl.innerHTML=""; ov.innerHTML='<p class="lfc-wait">'+esc(headMsg()||"Waiting for the compass. Hold the phone upright and turn slowly.")+'</p>'; return; }
  let ang=0; try{ ang=((screen.orientation&&screen.orientation.angle)||window.orientation||0); }catch(x){}
  const proj=lfcProject(hd,pitch,ORI.roll||0,ang,f,W,H);
  // the horizon: a straight line through two points on it in front of the camera
  if(hzEl){ const a=proj(hd-30,0), b=proj(hd+30,0); hzEl.setAttribute("viewBox","0 0 "+W+" "+H); hzEl.innerHTML=a.front&&b.front?'<line x1="'+(a.x+(a.x-b.x)*20).toFixed(1)+'" y1="'+(a.y+(a.y-b.y)*20).toFixed(1)+'" x2="'+(b.x+(b.x-a.x)*20).toFixed(1)+'" y2="'+(b.y+(b.y-a.y)*20).toFixed(1)+'"/>':''; }
  let h='';
  // markers in view first, then arrows at the edges for the rest, moved apart so no two labels sit on top of each other
  const items=[]; if(sp.alt>-4) items.push([sp.az,sp.alt,'sun','Sun '+Math.max(0,Math.round(sp.alt))+'°']); if(mo.alt>-1&&mo.frac>0.05) items.push([mo.az,mo.alt,'moon','Moon']); if(o&&o.face!=null) items.push([o.face,Math.max(0,Math.min(20,pitch)),'aim','Point here']);
  const used=[], edges=[];
  for(const [az,alt,cls,lab] of items){ const p=proj(az,alt); if(p.front&&p.x>-30&&p.x<W+30&&p.y>-30&&p.y<H+30){ used.push({x:p.x,a:p.y-26,b:p.y+52}); h+='<div class="lfc-m '+cls+'" style="left:'+p.x.toFixed(0)+'px;top:'+p.y.toFixed(0)+'px"><i></i><span>'+lab+'</span></div>'; }
    else edges.push({cls,lab,side:(p.front?p.sx:((az-hd)%360+540)%360-180)>0?'r':'l',y:Math.max(70,Math.min(H-140,p.front?p.y:H/2))}); }
  for(const e of edges){ const clash=y=>used.some(u=>y<u.b+4&&y+32>u.a&&(e.side==='r'?u.x>W-150:u.x<150)); let y=e.y, k=0; while(clash(y)&&k<12){ k++; y=e.y+(k%2?-1:1)*Math.ceil(k/2)*46; } y=Math.max(70,Math.min(H-140,y));
    used.push({x:e.side==='r'?W-40:40,a:y,b:y+30}); h+='<div class="lfc-edge '+e.cls+' '+e.side+'" style="top:'+y.toFixed(0)+'px">'+(e.side==='r'?'':'‹ ')+e.lab+(e.side==='r'?' ›':'')+'</div>'; }
  if(ORI.uncal) h+='<p class="lfc-wait lfc-cal">Lay the phone flat for a second so the compass can set itself, then raise it again.</p>';
  else if(Math.abs(pitch)>60) h+='<p class="lfc-wait lfc-cal">Raise the phone so the camera looks at the street.</p>';
  ov.innerHTML=h;
  // the light along the bottom: what you get facing each direction across the picture
  const tape=$("lfcTape"); if(tape&&sp.alt>-0.8){ const col={back:"#f28a28",side:"#fccc0a",front:"#fff3c4",dark:"#1c2340"}, stops=[]; for(let i=0;i<=12;i++){ const b=hd+Math.atan((i/12-0.5)*W/f)/d; stops.push(col[lightFacing(b,t).k]+' '+(i/12*100).toFixed(1)+'%'); } tape.style.background='linear-gradient(to right,'+stops.join(",")+')'; tape.hidden=false; } else if(tape) tape.hidden=true;
  const tu=$("lfcTurn"); if(tu&&o){ const dd=o.face==null?null:((o.face-hd)%360+540)%360-180; tu.innerHTML=dd==null?'Facing '+esc(compass(hd))+' <b>'+Math.round(hd)+'°</b>':Math.abs(dd)<=8?'<b class="lf-ok">On it. Shoot.</b>':'Turn '+(dd>0?'right':'left')+' <b>'+Math.round(Math.abs(dd))+'°</b>'; } }
/* A spot's day: the light from morning blue hour to evening blue hour, when direct sun reaches the spot past the buildings
   around it, when the streetlights come on, and the best window to be there. Today, or tomorrow once today's light is over. */
state.lightSpots=store.get("lightSpots",[])||[];
const LFD = {key:"", val:null};
function lfDay(pos,now){ now=now||new Date(); const T=lfbOn(pos)?lfbTile(pos):null;
  const build=d0=>{ const steps=[]; for(let m=0;m<1440;m+=5){ const t=new Date(+d0+m*6e4), sp=sunPos(t,pos.lat,pos.lon); steps.push({m,alt:sp.alt,ph:sunPhase(sp.alt)}); }
    const lit=steps.filter(x=>x.ph!=="night"); if(!lit.length) return null; const from=Math.max(0,lit[0].m-30), to=Math.min(1435,lit[lit.length-1].m+35), S=steps.filter(x=>x.m>=from&&x.m<=to);
    if(T) for(const x of S){ if(x.alt>0.5){ const r=lfbSun(T,pos,new Date(+d0+x.m*6e4)); x.sun=!r.down&&r.sun; } else x.sun=false; }
    const runs=(f)=>{ const out=[]; let c=null; for(const x of S){ if(f(x)){ if(c&&c.e===x.m) c.e=x.m+5; else { c={s:x.m,e:x.m+5}; out.push(c); } } } return out; };
    const sun=T?runs(x=>x.sun).filter(r=>r.e-r.s>=10):null, gold=runs(x=>x.ph==="gold"), blue=runs(x=>x.ph==="blue");
    const [rise,set]=sunTimes(new Date(+d0+12*36e5),pos.lat,pos.lon), mm=t=>t.getHours()*60+t.getMinutes(), lights=mm(set)+5;
    const eg=gold.filter(r=>r.s>=720).pop(), mg=gold.find(r=>r.s<720), eb=blue.filter(r=>r.s>=720).pop(), mb=blue.find(r=>r.s<720);
    // warm, low sun actually on the spot: the sun under 12° and not blocked
    const warm=T?runs(x=>x.sun&&x.alt<=12).filter(r=>r.e-r.s>=10):[], longest=a=>a.slice().sort((p,q)=>(q.e-q.s)-(p.e-p.s))[0];
    const cands=[];
    const ew=longest(warm.filter(r=>r.s>=720)), mw=longest(warm.filter(r=>r.s<720));
    if(ew) cands.push({s:ew.s,e:ew.e,k:"gold",txt:"low, warm sun on this spot"});
    if(mw) cands.push({s:mw.s,e:mw.e,k:"gold",txt:"low morning sun on this spot"});
    if(eg) cands.push({s:eg.s,e:eg.e,k:"gold",txt:T?(sun&&sun.some(r=>r.e>eg.s&&r.s<eg.e)?"golden hour":"golden hour as glow and backlight: the buildings block the low sun here"):"golden hour (building shadows not checked)"});
    if(eb) cands.push({s:eb.s,e:eb.e,k:"blue",txt:"blue hour: lit windows against a deep sky"});
    if(mg) cands.push({s:mg.s,e:mg.e,k:"gold",txt:"morning golden hour"});
    return {d0,from,to,steps:S,sun,gold,blue,rise:mm(rise),set:mm(set),lights,cands,hasB:!!T}; };
  const d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()), nm=now.getHours()*60+now.getMinutes();
  const key=pos.lat.toFixed(4)+","+pos.lon.toFixed(4)+":"+(+d0)+":"+(T?1:0)+":"+Math.floor(nm/15)+":"+state.city; if(LFD.key===key) return LFD.val;
  let D=build(d0), tomorrow=false, best=D&&D.cands.find(c=>c.e>nm);
  if(!best){ D=build(new Date(+d0+864e5)); tomorrow=true; best=D&&D.cands[0]; }
  if(D){ D.tomorrow=tomorrow; D.best=best; const at=new Date(+D.d0+(best?best.s:720)*6e4), sk=best?skyAt(at):undefined; D.sky=sk===undefined?"":({cloud:"overcast",rain:"rain",snow:"snow",fog:"fog",partly:"some cloud",storm:"storms"})[sk]||(sk===null?"clear":""); }
  LFD.key=key; LFD.val=D; return D; }
const hmSpan = (a,b) => { const x=hmText(a), y=hmText(b), pa=x.slice(-2); return (pa===y.slice(-2)?x.slice(0,-3):x)+"–"+y; };
function lfDayHtml(pos,name){ return withWx(pos,()=>lfDayHtml0(pos,name)); }
function lfDayHtml0(pos,name){ if(lfbOn(pos)&&!lfbTile(pos)) lfbLoad(pos); const D=lfDay(pos); if(!D) return "";
  const span=D.to-D.from, X=m=>(Math.max(0,Math.min(1,(m-D.from)/span))*100).toFixed(2)+"%", W=(a,b)=>(Math.max(0,(Math.min(b,D.to)-Math.max(a,D.from))/span)*100).toFixed(2)+"%";
  const runs=[]; let c=null; for(const x of D.steps){ if(c&&c.ph===x.ph) c.e=x.m+5; else { c={ph:x.ph,s:x.m,e:x.m+5}; runs.push(c); } }
  const now=new Date(), nm=now.getHours()*60+now.getMinutes(), ticks=[]; for(let h=Math.ceil(D.from/60);h*60<=D.to;h++) if(h%2===0) ticks.push(h*60);
  const B=D.best, saved=lfSpotNear(pos), list=[];
  if(D.sun) list.push(D.sun.length?"Direct sun here "+D.sun.map(r=>hmSpan(r.s,r.e)).join(", "):"No direct sun here: the buildings around it block it all day");
  const eg=D.gold.filter(r=>r.s>=720).pop(), eb=D.blue.filter(r=>r.s>=720).pop(); if(eg) list.push("Golden hour "+hmSpan(eg.s,eg.e)); if(eb) list.push("Blue hour "+hmSpan(eb.s,eb.e)); list.push("Streetlights on about "+hmText(D.lights));
  if(saved&&B){ saved.best={day:+D.d0,s:B.s,e:B.e,txt:B.txt}; store.set("lightSpots",state.lightSpots); }
  return '<p class="stk lf-ideah">'+(D.tomorrow?'Tomorrow':'Today')+' here, hour by hour</p><div class="lfd" role="img" aria-label="The light here '+(D.tomorrow?'tomorrow':'today')+'">'+
    '<div class="lfd-row lfd-sky">'+runs.map(r=>'<i class="ph-'+r.ph+'" style="left:'+X(r.s)+';width:'+W(r.s,r.e)+'"></i>').join("")+'</div>'+
    (D.sun?'<div class="lfd-row lfd-sun">'+D.sun.map(r=>'<i style="left:'+X(r.s)+';width:'+W(r.s,r.e)+'"></i>').join("")+'</div>':'')+
    (B?'<div class="lfd-best" style="left:'+X(B.s)+';width:'+W(B.s,B.e)+'"></div>':'')+
    '<span class="lfd-lights" style="left:'+X(D.lights)+'" title="Streetlights on"></span>'+(!D.tomorrow&&nm>=D.from&&nm<=D.to?'<span class="lfd-now" style="left:'+X(nm)+'"></span>':'')+
    '<div class="lfd-ticks">'+ticks.map(m=>'<span style="left:'+X(m)+'">'+hmText(m).replace(":00","")+'</span>').join("")+'</div></div>'+
    '<div class="lfd-key"><span><i class="k-sky"></i>Light</span>'+(D.sun?'<span><i class="k-sun"></i>Sun on this spot</span>':'')+'<span><i class="k-best"></i>Best</span><span><i class="k-lights"></i>Streetlights</span></div>'+
    (B?'<p class="lf-st lfd-bl">Best light here'+(D.tomorrow?' tomorrow':'')+': <b>'+hmSpan(B.s,B.e)+'</b>, '+esc(B.txt)+'.'+(D.sky?' Forecast: '+esc(D.sky)+'.':'')+'</p>':'')+
    '<p class="lf-st lfd-list">'+list.map(esc).join(" · ")+'.'+(!D.hasB&&lfbOn(pos)?' <span class="lf-src">Checking the buildings for direct sun…</span>':'')+'</p>'+
    '<div class="lfd-act">'+(LF.spot||state.pos?'<button type="button" class="chip" data-lf="spot"'+(saved?' aria-pressed="true"':'')+'>'+(saved?'★ Saved spot':'☆ Save this spot')+'</button>':'')+
    (B?(typeof loadWeather==="function"?'<button type="button" class="chip" data-lf="ics">📅 Calendar (.ics)</button>':'')+'<a class="chip" target="_blank" rel="noopener" href="'+esc(lfGcal(pos,name,D))+'">Google Calendar</a>':'')+'</div>'; }
function lfSpotNear(pos){ return state.lightSpots.find(x=>kmBetween(x,pos)<0.04)||null; }
function lfSpotsHtml(){ const L=state.lightSpots; if(!L.length) return ""; const d0=new Date(); d0.setHours(0,0,0,0);
  return '<p class="stk lf-ideah">Your spots</p><div class="lfd-spots">'+L.map(x=>{ const b=x.best&&(x.best.day===+d0||x.best.day===+d0+864e5)?x.best:null;
    return '<div class="lfd-spot'+(LF.spot&&LF.spot.id===x.id?' on':'')+'"><button type="button" class="lfd-go" data-lfspot="'+x.id+'"><b>'+esc(x.name)+'</b><span>'+(b?(b.day===+d0?'Today ':'Tomorrow ')+hmSpan(b.s,b.e)+' · '+esc(b.txt.split(":")[0]):'Tap to see its light')+'</span></button><button type="button" class="st-x lfd-del" data-lfspotdel="'+x.id+'" aria-label="Remove '+esc(x.name)+'">×</button></div>'; }).join("")+'</div>'; }
function lfCalText(name,D){ const B=D.best, cam=CAMERAS[state.camera]||CAMERAS.q343; return {title:"Light: "+name, desc:"Best light at "+name+": "+B.txt+". "+(D.sun&&D.sun.length?"Direct sun here "+D.sun.map(r=>hmSpan(r.s,r.e)).join(", ")+". ":"")+"Streetlights on about "+hmText(D.lights)+". Camera: "+cam.name+". From Shot List."}; }
const lfStamp = t => t.toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
function lfGcal(pos,name,D){ const B=D.best, a=new Date(+D.d0+B.s*6e4), b=new Date(+D.d0+B.e*6e4), T=lfCalText(name,D);
  return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(T.title)+"&dates="+lfStamp(a)+"/"+lfStamp(b)+"&details="+encodeURIComponent(T.desc)+"&location="+encodeURIComponent(pos.lat.toFixed(5)+","+pos.lon.toFixed(5)); }
function lfIcs(pos,name,D){ const B=D.best, a=new Date(+D.d0+B.s*6e4), b=new Date(+D.d0+B.e*6e4), T=lfCalText(name,D), e=x=>String(x).replace(/\\/g,"\\\\").replace(/[,;]/g,m=>"\\"+m).replace(/\n/g,"\\n");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Shot List//Light here//EN","CALSCALE:GREGORIAN","BEGIN:VEVENT","UID:"+lfStamp(a)+"-"+pos.lat.toFixed(4)+"-"+pos.lon.toFixed(4)+"@shotlist","DTSTAMP:"+lfStamp(new Date()),"DTSTART:"+lfStamp(a),"DTEND:"+lfStamp(b),
    "SUMMARY:"+e(T.title),"DESCRIPTION:"+e(T.desc),"LOCATION:"+e(pos.lat.toFixed(5)+", "+pos.lon.toFixed(5)),"GEO:"+pos.lat.toFixed(5)+";"+pos.lon.toFixed(5),"BEGIN:VALARM","TRIGGER:-PT30M","ACTION:DISPLAY","DESCRIPTION:"+e(T.title),"END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n")+"\r\n"; }
function lfIcsSave(){ const pos=LF.curPos, D=pos&&lfDay(pos); if(!D||!D.best) return; const txt=lfIcs(pos,LF.curPlace||"Light here",D), f="shot-list-light.ics";
  try{ const blob=new Blob([txt],{type:"text/calendar"}), u=URL.createObjectURL(blob), a=document.createElement("a"); a.href=u; a.download=f; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); LF.icsMsg="Saved "+f+": open it to add the event to Calendar."; }
  catch(e){ LF.icsMsg="This page cannot save files. Use Google Calendar, or open Shot List from your home screen."; }
  lfRender(); }
function lfRender(){ const el=$("lightf"); if(!el||!LF.open) return; const c=CITIES[state.city], pos=LF.spot?LF.spot:state.pos?state.pos:{lat:c.lat,lon:c.lon}; withWx(pos,()=>lfRender0(el,pos)); }
function lfRender0(el,pos){ const real=new Date(), t=new Date(+real+(LF.off||0)*6e4), c=CITIES[state.city], here=!LF.spot&&pos!==state.pos, out=!here&&!inNYC(pos);
  const {sp,sky,opts}=lfOptions(t,pos), mo=moonPos(t,pos.lat,pos.lon);
  // after dark with a bright moon up, the moon is one more way to point
  if(sp.alt<-0.8&&mo.alt>2&&mo.frac>0.45&&sky!=="cloud"&&sky!=="rain"&&sky!=="fog") opts.push({k:"moon",face:mo.az,title:"Face "+compass(mo.az)+": the moon "+(mo.alt<20?"low over the street":"above the rooftops"),why:(mo.alt<20?"A low moon between buildings is the shot: frame it at the end of a street or beside a water tower.":"The moon is high; it works small in a wide frame of lit windows.")+" Exposed for the street it turns into a white disc, a shape rather than detail. The 75 or 90 mm crop makes it bigger.",recipe:"night",ev:7,comp:"−0.7 EV"});
  if(LF.sel>=opts.length) LF.sel=0; let o=opts[LF.sel]; LF.cur=o;
  const T=lfbOn(pos)&&sp.alt>0.5?lfbTile(pos):null, here0=T?lfbSun(T,pos,t):null, shaded=here0&&!here0.down&&here0.sun===false&&(sky==="clear"||sky==="partly"||sky==="unknown")&&o.k!=="shade";
  if(shaded) o=Object.assign({},o,{ev:o.ev-3});   // in a building's shadow there is about three stops less light than in the open street
  const subj=LF.subj||"auto", st=lfStreet(pos,sp), S=lfSettings(o,sky,sp,subj), ph=sunPhase(sp.alt), np=Object.keys(c.places).filter(id=>typeof PLACES[id].lat==="number").map(id=>[id,kmBetween(pos,PLACES[id])]).sort((a,b)=>a[1]-b[1])[0], hood=LF.spot?LF.spot.name:np&&np[1]<0.8?PLACES[np[0]].name:nearestHood(pos.lat,pos.lon);
  const skyWord={clear:"Clear",partly:"Sun and cloud",cloud:"Overcast",rain:"Rain",fog:"Fog",snow:"Snow",unknown:""}[sky]||"";
  let street=""; if(st&&sp.alt>-0.8){ const kinds=st.dirs.map(d=>({d:(d+360)%360,k:lightFacing(d,t).k})), want=o.k==="side"||o.k==="back"||o.k==="front"?o.k:null, along=want&&kinds.find(x=>x.k===want);
    street='<p class="lf-st">Your street runs '+compass(st.b)+' to '+compass(st.b+180)+'.'+(along?' Looking along it to the <b>'+compass(along.d)+'</b> gives '+({side:"side light",back:"backlight",front:"front light"})[want]+'.':want?' Looking along it gives '+kinds.map(x=>({side:"side light",back:"backlight",front:"front light",dark:"no sun"})[x.k]).join(" one way and ")+' the other; for '+({side:"side light",back:"backlight",front:"front light"})[want]+' shoot across it.':'')+
      (st.along?' <b>The sun is lined up with this street'+(LF.off?' then':' right now')+':</b> light runs straight down it.':'')+(st.sunny!=null&&!T&&(sky==="clear"||sky==="partly"||sky==="unknown")?' The <b>'+compass(st.sunny)+'</b> side is in sun'+(sp.alt<15?', on the upper floors more than the sidewalk':'')+'.':'')+'</p>'; }
  const lights=(o.k==="lights"||o.k==="lit"||o.k==="wet"||o.k==="moon")?lfLights(pos):"";
  LF.shadeNext=null; const shade=sp.alt>0.5?lfbHtml(pos,t,st):"";
  const next=lfNext(pos), nmReal=real.getHours()*60+real.getMinutes();
  Object.assign(LF,{curS:S,curSky:sky,curSp:sp,curPos:pos,curPlace:hood,curLine:S.line+(S.comp?' · '+S.comp:'')}); if(LFC.on){ lfcBottom(); lfcDraw(); }
  const moonLine=mo.alt>-1&&mo.frac>0.05?' · Moon '+Math.round(mo.frac*100)+'% lit'+(mo.alt>0?', '+Math.round(mo.alt)+'° up in the '+compass(mo.az):', rising'):'';
  const pick=todayPicks(t)[0], idea=pick&&pick.best;
  const rows=S.su?[["Mode",subj==="blur"?"PASM · S (shutter priority)":S.su[4]],["Focus",S.su[0]+(S.su[1]&&!/Not used/.test(S.su[1])?' · '+S.su[1]:'')],["Metering",S.su[2]],["Exposure comp.",S.comp||S.su[3]],["White balance",S.su[7]]]:[["Exposure comp.",S.comp]];
  const sc=el.querySelector(".st-in"), keep=sc?sc.scrollTop:0; const rng=$("lfTime");   // the slider being dragged is kept, so the drag is not cut off by the redraw
  el.innerHTML='<div class="st-in lf-in"><div class="st-top"><span class="st-where"><b>Light here</b> · '+hmText(t.getHours()*60+t.getMinutes())+(LF.off?' (in '+(LF.off>=60?Math.floor(LF.off/60)+' h '+(LF.off%60?LF.off%60+' min':''):LF.off+' min')+')':'')+(hood&&!here?' · '+(LF.spot?'★ ':'')+esc(hood):'')+'</span><button type="button" class="st-x" data-lf="close" aria-label="Close">×</button></div>'+
    (LF.spot?'<p class="lf-note lf-spotn">Showing your saved spot, not where you are. <button type="button" class="chip" data-lf="unspot">Back to where I am</button></p>':'')+
    (here?'<p class="lf-note">'+(LF.fallback?'Location is off, so this is for Midtown. Allow location for advice on the street you are on.':'Finding where you are… meanwhile this is for Midtown.')+'</p>':'')+
    (out?'<p class="lf-note">Outside New York City: the sun, times and directions are for '+(LF.spot?'this spot':'where you are')+', but there is no building shade or street direction here'+(WX_KEY==="none"?', and no forecast yet, so check the sky yourself':'')+'.</p>':'')+
    '<p class="lf-sky">'+(sp.alt>0?'Sun '+Math.round(sp.alt)+'° up in the '+compass(sp.az):sp.alt>-6?'Sun just below the horizon to the '+compass(sp.az):'Sun down')+' · '+SUN_PHASE[ph]+(skyWord?' · '+skyWord:'')+moonLine+'</p>'+
    '<div class="lf-dialw">'+lfDial(sp,o.face,mo)+'</div>'+
    '<div class="lf-time"><input type="range" id="lfTime" min="0" max="180" step="5" value="'+(LF.off||0)+'" aria-label="Look ahead: minutes from now"><div class="lf-timel"><span>Now</span><span>+1 h</span><span>+2 h</span><span>+3 h</span></div>'+(LF.off?'<button type="button" class="chip" data-lfat="0">Back to now</button>':'')+'</div>'+
    '<p class="lf-turn" id="lfTurn">'+(o.face!=null?lfTurn(o.face):'')+'</p>'+(typeof loadWeather==="function"&&!LF.spot?'<div class="lf-camw"><button type="button" class="chip" data-lf="cam">📷 Camera view</button></div>':'')+
    '<p class="lf-note lf-mode"></p><p class="lf-note lf-cmp"'+(lfCompassNote()?'':' hidden')+'>'+esc(lfCompassNote())+'</p>'+
    '<div class="lf-opts">'+opts.map((x,n)=>'<button type="button" class="chip" data-lfopt="'+n+'" aria-pressed="'+(n===LF.sel)+'">'+(n===0?'Best: ':'')+esc(LF_KIND[x.k]||x.k)+'</button>').join("")+'</div>'+
    '<h2 class="lf-h">'+esc(o.title)+'</h2><p class="why">'+esc(o.why)+'</p>'+street+shade+lights+
    (next.length?'<p class="stk lf-ideah">Coming up here</p><div class="lf-next">'+next.map(x=>x.m===null?'<p class="lf-st">'+esc(x.txt)+'</p>':'<button type="button" class="lf-nx'+(LF.off&&nmReal+LF.off>=x.m-2&&nmReal+LF.off<=x.m+2?' on':'')+'" data-lfat="'+Math.max(0,Math.min(180,Math.round((x.m-nmReal)/5)*5))+'"><span class="lf-nxt">'+hmText(((x.m%1440)+1440)%1440)+'</span><span class="lk '+(x.k==="sun"?"rise":x.k==="moon"?"moon":x.k==="henge"?"henge":x.k==="rain"?"rain":x.k==="blue"?"blue":"gold")+'"></span><span class="lf-nxw">'+esc(x.txt)+'</span></button>').join("")+'</div>':'')+lfDayHtml(pos,hood||"this spot")+(LF.icsMsg?'<p class="lf-note">'+esc(LF.icsMsg)+'</p>':'')+lfSpotsHtml()+
    '<p class="stk lf-ideah">What are you shooting?</p><div class="lf-subj">'+Object.entries(LF_SUBJ).map(([k,v])=>'<button type="button" class="chip" data-lfsubj="'+k+'" aria-pressed="'+(subj===k)+'">'+esc(v.n)+'</button>').join("")+'</div>'+
    '<div class="lf-cams" role="group" aria-label="Camera">'+[["q328","Leica Q3"],["q343","Leica Q3 43"]].map(([k,n])=>'<button type="button" class="chip" data-lfcam="'+k+'" aria-pressed="'+(state.camera===k)+'">'+n+'</button>').join("")+'</div>'+
    '<div class="st-exp"><span class="stk">'+esc(S.cam.name)+(subj!=="auto"?' · '+esc(LF_SUBJ[subj].n.toLowerCase()):'')+'</span><b>'+esc(S.line)+'</b><span class="st-adj">'+esc(S.meter)+(shaded?' You are in shade, so this allows for about three stops less light than the open street.':'')+'</span></div>'+
    rows.filter(r=>r[1]).map(r=>'<div class="strow"><span class="stk">'+r[0]+'</span><span class="stv">'+esc(r[1])+'</span></div>').join("")+
    '<p class="lf-adj">'+esc(S.note||S.rec[1])+(S.adj.length?' '+S.adj.map(esc).join(" "):'')+'</p>'+lfLogHtml()+
    (idea?'<p class="stk lf-ideah">Nearest idea for this light</p><button type="button" class="row lf-idea" data-lfidea="'+idea.id+'"><span class="dot" style="background:'+INTENTS[idea.i].color+'"></span><span class="t"><b>'+esc(idea.t)+'</b><span>'+esc(PLACES[idea.p].name)+(pick.mi!=null?' · '+milesText(pick.mi):'')+'</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
    '<p class="lf-foot">Settings are for the '+esc(S.cam.name)+'. The switch above changes the camera everywhere in the app. Exposure estimates assume open street light; under heavy cloud or deep in shade expect one or two stops less.</p></div>';
  const nr=$("lfTime"); if(rng&&nr){ rng.value=String(LF.off||0); nr.replaceWith(rng); }
  const sc2=el.querySelector(".st-in"); if(sc2&&keep) sc2.scrollTop=keep; }
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-lightf],[data-lf],[data-lfopt],[data-lfidea],[data-lfcam],[data-lfat],[data-lfsubj],[data-lfcfr],[data-lfspot],[data-lfspotdel],[data-lfctool]"); if(!t) return;
  if(t.dataset.lightf){ e.stopPropagation(); lfOpen(); return; }
  if(!LF.open) return; e.stopPropagation();
  if(t.dataset.lfopt){ LF.sel=+t.dataset.lfopt; lfRender(); return; }
  if(t.dataset.lfat!==undefined){ LF.off=+t.dataset.lfat; LF.sel=0; lfRender(); return; }
  if(t.dataset.lfspot){ const x=state.lightSpots.find(y=>y.id===t.dataset.lfspot); if(x){ if(LFC.on) lfcStop(); LF.spot=x; LF.off=0; LF.sel=0; LF.icsMsg=""; lfRender(); const sc=$("lightf").querySelector(".st-in"); if(sc) sc.scrollTop=0; } return; }
  if(t.dataset.lfspotdel){ state.lightSpots=state.lightSpots.filter(y=>y.id!==t.dataset.lfspotdel); store.set("lightSpots",state.lightSpots); if(LF.spot&&LF.spot.id===t.dataset.lfspotdel) LF.spot=null; lfRender(); return; }
  if(t.dataset.lf==="unspot"){ LF.spot=null; LF.icsMsg=""; lfRender(); return; }
  if(t.dataset.lf==="ics"){ lfIcsSave(); return; }
  if(t.dataset.lf==="spot"){ const pos=LF.curPos, ex=pos&&lfSpotNear(pos); if(!pos) return;
    if(ex){ state.lightSpots=state.lightSpots.filter(y=>y!==ex); if(LF.spot===ex) LF.spot=null; }
    else { const base=LF.curPlace||"My spot", n=state.lightSpots.filter(y=>y.name===base||y.name.startsWith(base+" #")).length; state.lightSpots.push({id:"s"+Date.now().toString(36),name:n?base+" #"+(n+1):base,lat:+pos.lat.toFixed(5),lon:+pos.lon.toFixed(5)}); }
    store.set("lightSpots",state.lightSpots); lfRender(); return; }
  if(t.dataset.lfctool){ const k=t.dataset.lfctool; if(k==="guide"){ const i=LFC_GUIDES.findIndex(g=>g[0]===lfcGuide()); store.set("lfcGuide",LFC_GUIDES[(i+1)%LFC_GUIDES.length][0]); } else store.set("lfc_"+k,!lfcOpt(k));
    if(k==="stage"){ LFC.sg=null; const e=$("lfcSg"); if(e) e.innerHTML=""; const tx=$("lfcSgT"); if(tx) tx.hidden=true; } lfcBottom(); lfcDraw(); return; }
  if(t.dataset.lfcfr!==undefined){ store.set("lfcFrame_"+state.camera,+t.dataset.lfcfr); LFC.cxRun=[]; lfcBottom(); lfcDraw(); return; }
  if(t.dataset.lfsubj){ LF.subj=t.dataset.lfsubj; store.set("lfSubj",LF.subj); lfRender(); return; }
  if(t.dataset.lfcam){ state.camera=t.dataset.lfcam; store.set("camera",state.camera); lfRender(); return; }
  if(t.dataset.lfidea){ const id=t.dataset.lfidea; lfClose(); show(id); state.view="shoot"; render(); window.scrollTo({top:0}); return; }
  if(t.dataset.lf==="close"){ lfClose(); return; }
  if(t.dataset.lf==="cam"){ lfcOpen(); return; }
  if(t.dataset.lf==="camclose"){ lfcStop(); return; }
  if(t.dataset.lf==="log"){ lfLog(LF.cur,LF.curS,LF.curSky,LF.curSp,LF.curPos,LF.curPlace); lfRender(); return; }
  if(t.dataset.lf==="rate"){ const e=state.lightLog[state.lightLog.length-1]; if(e){ if(e.r===t.dataset.r) delete e.r; else e.r=t.dataset.r; store.set("lightLog",state.lightLog); } lfRender(); return; }
  if(t.dataset.lf==="undo"){ state.lightLog.pop(); store.set("lightLog",state.lightLog); LF.justLogged=false; lfRender(); return; }
  if(t.dataset.lf==="henge"){ const i=+t.dataset.run; lfClose(); state.mapD=0; state.mapT=null; state.mapShowHenge=true; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>mapSelectRun(i))); } },true);
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&LFC.on){ lfcStop(); return; } if(e.key==="Escape"&&LF.open) lfClose(); });
let lfRaf=0; document.addEventListener("input",e=>{ if(!LF.open||e.target.id!=="lfTime") return; LF.off=+e.target.value; if(!lfRaf) lfRaf=requestAnimationFrame(()=>{ lfRaf=0; lfRender(); }); });

/* The day's light, minute by minute: night, blue hour, golden hour, daylight. Drawn as the slider track, with marks to jump to. */
let LIGHT_DAY = null;
function lightDay(day){ const c=CITIES[state.city], d=day?new Date(day):mapDay(); d.setHours(0,0,0,0); const key=state.city+":"+(+d);
  if(LIGHT_DAY&&LIGHT_DAY.key===key) return LIGHT_DAY;
  const runs=[]; let cur=null;
  for(let m=0;m<1440;m++){ const ph=sunPhase(sunPos(new Date(+d+m*6e4),c.lat,c.lon).alt); if(cur&&cur.ph===ph) cur.e=m+1; else { cur={ph,s:m,e:m+1}; runs.push(cur); } }
  const [rise,set]=sunTimes(new Date(+d+12*36e5),c.lat,c.lon), mm=t=>t.getHours()*60+t.getMinutes();
  return LIGHT_DAY={key,runs,rise:mm(rise),set:mm(set)}; }
const LIGHT_COL = {night:"#1c2340",blue:"#3e63d8",gold:"#f2ad3a",day:"#f4e7b4"};
function lightBand(day){ const L=lightDay(day), at=m=>'calc(13px + (100% - 26px) * '+(m/1435).toFixed(4)+')';
  return 'linear-gradient(to right,'+L.runs.map(r=>LIGHT_COL[r.ph]+' '+at(r.s)+','+LIGHT_COL[r.ph]+' '+at(Math.min(r.e,1435))).join(",")+')'; }
function lightMarks(){ const L=lightDay(), tf=hmText, out=[], pos=m=>'calc(13px + (100% - 26px) * '+(m/1435).toFixed(4)+')';
  const gold=L.runs.filter(r=>r.ph==="gold"), blue=L.runs.filter(r=>r.ph==="blue");
  if(gold[0]&&gold[0].s<720) out.push(["gold",gold[0].s,"Morning gold "+tf(gold[0].s)]);
  out.push(["rise",L.rise,"Sunrise "+tf(L.rise)]);
  const eg=gold.find(r=>r.s>=720); if(eg) out.push(["gold",eg.s,"Golden hour "+tf(eg.s)]);
  out.push(["set",L.set,"Sunset "+tf(L.set)]);
  const eb=blue.find(r=>r.s>=720); if(eb) out.push(["blue",eb.s,"Blue hour "+tf(eb.s)]);
  { const c=CITIES[state.city], d=new Date(+mapDay()+12*36e5); const mt=moonTimes(d,c.lat,c.lon), mo=moonPos(d,c.lat,c.lon); if(mt.rise!==null&&mo.frac>0.15) out.push(["moon",mt.rise,(mo.frac>=0.97?"Full moonrise ":"Moonrise ")+tf(mt.rise)]); }
  if(state.mapShowHenge) for(const m of hengeDay().peaks) out.push(["henge",m,"Sun down the streets "+tf(m)]);
  for(const r of wxRuns().filter(r=>wxWet(r.k)).slice(0,2)) out.push(["rain",r.s*60,(r.k==="snow"?"Snow ":"Rain ")+tf(r.s*60)+" to "+tf(r.e*60)]);
  out.sort((a,b)=>a[1]-b[1]);
  const cur=state.mapT===null?(()=>{ const n=new Date(); return n.getHours()*60+n.getMinutes(); })():state.mapT, live=mapIsNow();
  $("lightTicks").innerHTML=[L.rise,L.set].map(m=>'<i style="left:'+pos(m)+'"></i>').join("");
  const dur=k=>k==="gold"?60:k==="blue"?25:k==="henge"?15:k==="rain"?60:10, upcoming=x=>!live||x[1]+dur(x[0])>cur;
  return out.filter(upcoming).concat(out.filter(x=>!upcoming(x))).map(([k,m,t])=>'<button type="button" class="chip lmark'+(cur>=m&&cur<m+dur(k)?' on':'')+(m<cur&&live?' past':'')+'" data-jump="'+m+'"><span class="lk '+k+'"></span>'+t+'</button>').join(""); }
/* Today's outing: kept on the device so it survives closing the app; editable from the map. */
function savePlan(){ const p=state.plan; store.set("plan", p ? {start:+p.start,end:+p.end,stops:p.stops.map(s=>({place:s.place,at:+s.at,key:s.key,ideas:s.ideas.map(x=>x.id),leg:s.leg||null,ev:s.ev||null,mins:s.mins||null}))} : null); }
function loadPlan(){ const p=store.get("plan",null); if(!p||!p.stops||!p.stops.length||p.end<Date.now()-12*36e5) return null;
  return {start:new Date(p.start),end:new Date(p.end),stops:p.stops.filter(s=>PLACES[s.place]).map(s=>({place:s.place,at:new Date(s.at),key:s.key,ideas:s.ideas.map(id=>IDEAS.find(x=>x.id===id)).filter(Boolean),leg:s.leg,ev:s.ev||undefined,mins:s.mins||undefined}))}; }
function pickIdeas(pid,key,n,at){ const t=at||new Date(), sky=Math.abs(t-Date.now())<40*36e5?skyAt(t):undefined, all=cityIdeas().filter(x=>x.p===pid), here=all.filter(x=>ideaOpen(x,t,sky));
  const pool=(here.length?here:all).slice().sort((a,b)=>(b.w.includes(key)-a.w.includes(key))||(state.done.has(a.id)-state.done.has(b.id)));
  const out=[]; for(const x of pool) if(out.length<n&&!out.some(o=>o.i===x.i)) out.push(x); for(const x of pool) if(out.length<n&&!out.includes(x)) out.push(x); return out; }
function legBetween(a,b){ const km=kmBetween(PLACES[a],PLACES[b]), walk=Math.round(km*1.3/0.08); return walk<=30?{to:b,mins:Math.max(3,walk),mode:"walk"}:{to:b,mins:Math.round(15+km*3),mode:"by subway"}; }
function retimePlan(p){ let t=new Date(p.stops[0].at); p.stops.forEach((s,n)=>{ s.at=new Date(t); const k=lightAt(s.at); if(!s.ev&&(k!==s.key||!s.ideas.length)){ s.key=k; s.ideas=pickIdeas(s.place,k,Math.max(2,s.ideas.length),s.at); }
    t=new Date(+t+(s.ev?(s.mins||120):Math.max(1,s.ideas.length)*25)*6e4); if(n<p.stops.length-1){ s.leg=legBetween(s.place,p.stops[n+1].place); t=new Date(+t+s.leg.mins*6e4); } else delete s.leg; });
  p.start=new Date(p.stops[0].at); p.end=t; return p; }
function planAdd(pid){ if(!state.plan){ const now=new Date(), k=lightAt(now); state.plan={start:now,end:now,stops:[{place:pid,at:now,key:k,ideas:pickIdeas(pid,k,2)}]}; }
  else state.plan.stops.push({place:pid,at:new Date(),key:"",ideas:[]});
  retimePlan(state.plan); savePlan(); }
function planRemove(pid){ if(!state.plan) return; state.plan.stops=state.plan.stops.filter(s=>s.place!==pid); if(!state.plan.stops.length) state.plan=null; else retimePlan(state.plan); savePlan(); }
const planIndex = pid => state.plan ? state.plan.stops.findIndex(s=>s.place===pid) : -1;
function nextStopIndex(){ const p=state.plan; if(!p) return -1; const now=Date.now(); const i=p.stops.findIndex(s=>+s.at+(s.ev?(s.mins||120):Math.max(1,s.ideas.length)*25)*6e4>now); return i<0?p.stops.length-1:i; }
function mapGoStop(i){ const p=state.plan, s=p&&p.stops[i]; if(!s) return; const today=new Date(); today.setHours(0,0,0,0);
  const dayOff=Math.round((evDay(s.at)-today)/864e5), sameDay=dayOff===0, live=sameDay&&(Math.abs(s.at-Date.now())<15*6e4 || (i===nextStopIndex() && s.at<=Date.now()));
  state.mapD = dayOff>0&&dayOff<=6 ? dayOff : 0;
  state.mapT = live||(!sameDay&&!state.mapD) ? null : s.at.getHours()*60+Math.round(s.at.getMinutes()/5)*5;
  const tm=$("mapTime"), n=new Date(); if(tm) tm.value=state.mapT===null? n.getHours()*60+n.getMinutes() : state.mapT;
  if(s.ev&&eventGeo(s.ev)){ const g=eventGeo(s.ev); state.mapSel=null; state.mapSpot=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; state.mapEv=s.ev; state.mapShowEv=true; mapPanel(); mapDraw(); const [x,y]=mapXY(g[0],g[1]); mapFly(mapAim({cx:x,cy:y,w:Math.min(mapV.w,30)})); setSheet("half"); return; }
  state.mapSel=s.place; state.mapEv=null; const [x,y]=mapXY(PLACES[s.place].lat,PLACES[s.place].lon); mapPanel(); mapDraw(); mapZoomPlace(s.place); }
/* Google Maps directions: the next stop (walking or transit), and the rest of the outing as one multi-stop route.
   Google Maps allows 3 stops between start and end in a phone browser, 9 in the app; transit cannot do multi-stop routes. */
const stopGeo = (id,ev) => { const g=(ev&&eventGeo(ev))||START_GEO[id]||[PLACES[id].lat,PLACES[id].lon]; return g[0].toFixed(5)+","+g[1].toFixed(5); };
function planLinks(){ const p=state.plan; if(!p) return ""; const nx=Math.max(0,nextStopIndex()), rest=p.stops.slice(nx), next=rest[0]; if(!next) return "";
  const prevLeg=nx>0?p.stops[nx-1].leg:null, km=state.pos?kmBetween(state.pos,PLACES[next.place]):null;
  const mode=prevLeg&&prevLeg.mode==="by subway" ? "transit" : km!==null ? (km<=1.8?"walking":"transit") : (prevLeg?"walking":"transit");
  const base="https://www.google.com/maps/dir/?api=1";
  const one=base+"&destination="+stopGeo(next.place,next.ev)+"&travelmode="+mode;
  let whole="";
  if(rest.length>1){ const pts=rest.map(s=>stopGeo(s.place,s.ev)), allWalk=rest.slice(0,-1).every(s=>!s.leg||s.leg.mode==="walk");
    const origin=pts.length>4?pts.shift():null;   // keep within 3 stops in between, so it also works in a phone browser
    whole=base+(origin?"&origin="+origin:"")+"&destination="+pts.pop()+(pts.length?"&waypoints="+encodeURIComponent(pts.join("|")):"")+"&travelmode=walking";
    whole='<a class="chip" href="'+whole+'" target="_blank" rel="noopener">Whole outing on foot ↗</a>'+(allWalk?'':'<span class="hint maplinkhint">Google Maps cannot do multi-stop routes by subway, so this shows the walk. Use the stop link for the subway legs.</span>'); }
  return '<div class="callinks planlinks"><a class="chip primary" href="'+one+'" target="_blank" rel="noopener">Directions to stop '+(nx+1)+' '+(mode==="transit"?"by subway":"on foot")+' ↗</a>'+whole+'</div>'; }
function mapPlanBar(){ const p=state.plan, tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  if(!p) return '<div class="planhint"><p class="hint">Tap a pin and choose Add to today to build an outing on the map, or let the app plan one.</p><button type="button" class="chip primary" data-openplan="1">Plan an outing</button></div>';
  const nx=nextStopIndex();
  return '<div class="planbar"><div class="planbar-head"><b>Today\u2019s outing</b><span>'+tf(p.start)+' to about '+tf(p.end)+'</span><button type="button" class="chip primary" data-nextstop="1">Next stop ›</button><button type="button" class="chip" data-openplan="1">Details</button><button type="button" class="chip" data-clearplan="1">Clear</button></div>'+
    '<div class="intents planstops">'+p.stops.map((s,n)=>'<button type="button" class="chip stopchip'+(n===nx?" next":"")+'" data-stop="'+n+'"><span class="stopn">'+(n+1)+'</span>'+esc(s.ev?(EVENTS.find(x=>x.id===s.ev)||{name:s.ev}).name:PLACES[s.place].name)+' · '+tf(s.at)+'</button>').join("")+'</div>'+planLinks()+'</div>'; }
function mapPts(){ const key=lightAt(mapNow()), ideas=cityIdeas().filter(i=>state.mapIntent==="all"||i.i===state.mapIntent);
  return Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number").map(id=>{ const [x,y]=mapXY(PLACES[id].lat,PLACES[id].lon), mine=ideas.filter(i=>i.p===id);
    return {id,x,y,n:mine.length,fit:mine.filter(i=>i.w.includes(key)).length,done:mine.filter(i=>state.done.has(i.id)).length,empty:!mine.length}; }); }
/* Street names when zoomed in. MAPD_SN (tools/make_streetnames.py) holds every named street's centreline from the Census
   TIGER data; it is unpacked the first time it is needed and indexed in squares of 20 map units (about 1.1 km). Each street
   in view gets one label at the middle of its longest visible stretch, turned to lie along it, if the name fits there.
   Longer stretches are labelled first, so avenues and long streets win when labels would collide. */
const SN_W = 48;
let SN = null;
function snLoad(){ if(SN) return SN; const b=atob(MAPD_SN.d), n=b.length; let i=0; const vi=()=>{ let r=0, s=0, c; do{ c=b.charCodeAt(i++); r+=(c&0x7f)*Math.pow(2,s); s+=7; }while(c&0x80); return r; }, zz=v=>v%2?-(v+1)/2:v/2;
  const lines=[], grid=new Map();
  while(i<n){ const name=vi(), k=vi(), xs=new Float32Array(k), ys=new Float32Array(k); let x=vi(), y=vi(); xs[0]=x/8; ys[0]=y/8;
    for(let j=1;j<k;j++){ x+=zz(vi()); y+=zz(vi()); xs[j]=x/8; ys[j]=y/8; }
    let a=1e9,c=1e9,bx=-1e9,d=-1e9; for(let j=0;j<k;j++){ if(xs[j]<a)a=xs[j]; if(xs[j]>bx)bx=xs[j]; if(ys[j]<c)c=ys[j]; if(ys[j]>d)d=ys[j]; }
    const L={name,xs,ys,bb:[a,c,bx,d]}, id=lines.push(L)-1;
    for(let gx=Math.floor(a/20);gx<=Math.floor(bx/20);gx++) for(let gy=Math.floor(c/20);gy<=Math.floor(d/20);gy++){ const key=gx+","+gy; let g=grid.get(key); if(!g){ g=[]; grid.set(key,g); } g.push(id); } }
  return SN={lines,grid}; }
function snLabels(x0,y0,x1,y1,w,u,f,free,taken){ const S=snLoad(), seen=new Set(), cand=[], m=6*u, X0=x0+m, Y0=y0+m, X1=x1-54*u, Y1=y1-m;   // not under the zoom buttons on the right
  for(let gx=Math.floor(X0/20);gx<=Math.floor(X1/20);gx++) for(let gy=Math.floor(Y0/20);gy<=Math.floor(Y1/20);gy++){ const g=S.grid.get(gx+","+gy); if(!g) continue;
    for(const id of g){ if(seen.has(id)) continue; seen.add(id); const L=S.lines[id], bb=L.bb; if(bb[2]<X0||bb[0]>X1||bb[3]<Y0||bb[1]>Y1) continue;
      // the visible stretches: each segment clipped to the view, joined while they stay connected
      let run=null, best=null; const close=()=>{ if(run&&(!best||run.len>best.len)) best=run; run=null; };
      for(let j=0;j<L.xs.length-1;j++){ let ax=L.xs[j], ay=L.ys[j], bx=L.xs[j+1], by=L.ys[j+1], t0=0, t1=1; const dx=bx-ax, dy=by-ay;
        let out=false; for(const [p,q] of [[-dx,ax-X0],[dx,X1-ax],[-dy,ay-Y0],[dy,Y1-ay]]){ if(p===0){ if(q<0){ out=true; break; } continue; } const r=q/p; if(p<0){ if(r>t1){ out=true; break; } if(r>t0) t0=r; } else { if(r<t0){ out=true; break; } if(r<t1) t1=r; } }
        if(out||t1<=t0){ close(); continue; }
        const sx=ax+dx*t0, sy=ay+dy*t0, ex=ax+dx*t1, ey=ay+dy*t1, len=Math.hypot(ex-sx,ey-sy);
        if(!run||t0>1e-6) { close(); run={len:0,segs:[]}; }
        run.segs.push([sx,sy,ex,ey,len]); run.len+=len; if(t1<1-1e-6) close(); }
      close(); if(best) cand.push({name:MAPD_SN.n[L.name],run:best}); } }
  cand.sort((a,b)=>b.run.len-a.run.len);
  const fl=(w<14?9.5:8.5)*u, placed=[], maxN=w<14?60:w<28?48:36; let out="", nLab=0;
  for(const c of cand){ if(nLab>=maxN) break; const tw=c.name.length*fl*0.56; if(c.run.len<tw*1.15) continue;
    // the middle of the stretch, measured along it
    let half=c.run.len/2, px=0, py=0, ang=0; for(const [sx,sy,ex,ey,len] of c.run.segs){ if(half<=len){ const k=len?half/len:0; px=sx+(ex-sx)*k; py=sy+(ey-sy)*k; ang=Math.atan2(ey-sy,ex-sx)*180/Math.PI; break; } half-=len; }
    if(placed.some(p=>p.name===c.name&&Math.hypot(p.x-px,p.y-py)<w*0.45)) continue;   // the same street in pieces: one label is enough
    if(ang>90) ang-=180; if(ang<-90) ang+=180; const ca=Math.abs(Math.cos(ang*Math.PI/180)), sa=Math.abs(Math.sin(ang*Math.PI/180)), hx=tw/2*ca+fl*0.55*sa, hy=tw/2*sa+fl*0.55*ca, rect=[px-hx,py-hy,px+hx,py+hy];
    if(!free(rect)) continue; taken.push(rect); placed.push({name:c.name,x:px,y:py}); nLab++;
    out+='<text x="'+f(px)+'" y="'+f(py+fl*0.35)+'" text-anchor="middle" font-size="'+f(fl)+'" class="m-st m-sn" transform="rotate('+f(ang)+' '+f(px)+' '+f(py)+')">'+esc(c.name)+'</text>'; }
  return out; }
setTimeout(()=>{ const go=()=>{ try{ if(typeof MAPD_SN!=="undefined") snLoad(); }catch(e){} }; if(window.requestIdleCallback) requestIdleCallback(go,{timeout:4000}); else go(); },2500);
function mapDraw(){
  const svg=$("mapSvg"); if(!svg||!mapV) return; const cw=($("mapWrap")&&$("mapWrap").clientWidth)||svg.clientWidth||360, zf=state.mapHead?Math.max(1,(svg.clientWidth||cw)/cw):1, ar=svg.clientHeight/svg.clientWidth; if(!state.mapHead&&ar>0.3&&ar<4) MAP_ASPECT=ar;
  // w is the width you see across the screen; in heading-up the drawn square (wb) is wider so the corners stay filled as it turns
  const v=mapV, w=v.w, wb=w*zf, h=wb*(state.mapHead?1:MAP_ASPECT), x0=v.cx-wb/2, y0=v.cy-h/2, x1=x0+wb, y1=y0+h, u=w/cw, f=n=>n.toFixed(1);
  svg.setAttribute("viewBox",f(x0)+" "+f(y0)+" "+f(wb)+" "+f(h));
  // a point on the edge of what you can see, in a compass direction: where the sun and moon sit
  const edge=az=>{ const r=az*Math.PI/180, dx=Math.sin(r), dy=-Math.cos(r), m=18*u;
    if(state.mapHead&&state.pos){ const [yx,yy]=mapXY(state.pos.lat,state.pos.lon), H=$("map").clientHeight, oy=(topPx()+(H-sheetPx()))/2, R=Math.max(30*u,(Math.min(cw/2,oy-topPx(),H-sheetPx()-oy)-22)*u); return [yx+dx*R,yy+dy*R,dx,dy]; }
    const vt=y0+topPx()*u, vb=y1-sheetPx()*u, cx=(x0+x1)/2, cy=(vt+vb)/2, hx=w/2-m, hy=Math.max(10*u,(vb-vt)/2-m), k=Math.min(Math.abs(dx)>1e-6?hx/Math.abs(dx):1e9, Math.abs(dy)>1e-6?hy/Math.abs(dy):1e9); return [cx+dx*k,cy+dy*k,dx,dy]; };
  const zstreet=w<=22; svg.setAttribute("class","mapsvg "+(w>=260?"zfar":w>=110?"zmid":w>=45?"znear":"zclose")+(zstreet?" zstreet":"")+(state.mapShowSub?"":" nosub")+(state.mapSel&&!state.mapSpot&&w<140?" hassel":""));
  if(mapDraw.zs!==zstreet){ mapDraw.zs=zstreet; svg.querySelectorAll(".m-rdp").forEach(e=>e.setAttribute("vector-effect",zstreet?"none":"non-scaling-stroke")); }
  const pts=mapPts().filter(p=>p.x>x0-20*u&&p.x<x1+20*u&&p.y>y0-20*u&&p.y<y1+20*u), far=w>330, R=(far?7:16)*u, fs=(far?11:12)*u;
  // route of the current plan
  let route=""; if(state.plan){ const st=state.plan.stops.map(s=>s.place).filter((id,n,a)=>id!==a[n-1]&&typeof PLACES[id].lat==="number").map(id=>mapXY(PLACES[id].lat,PLACES[id].lon));
    if(st.length>1) route='<path d="M'+st.map(p=>f(p[0])+" "+f(p[1])).join("L")+'" class="m-route" stroke-width="'+f(3*u)+'" stroke-dasharray="'+f(7*u)+' '+f(5*u)+'"/>'; }
  // labels: try right, left, below, above; skip one that would cover a pin or another label
  const taken=pts.map(p=>[p.x-R,p.y-R,p.x+R,p.y+R]), hit=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
  const labels=pts.slice().sort((a,b)=>(b.id===state.mapSel)-(a.id===state.mapSel)).map(p=>{ const name=PLACES[p.id].name, tw=name.length*fs*0.57, g=R+4*u;
    for(const [bx,by,anchor,tx,ty] of [[p.x+g,p.y-fs*0.6,"start",p.x+g,p.y+fs*0.36],[p.x-g-tw,p.y-fs*0.6,"end",p.x-g,p.y+fs*0.36],[p.x-tw/2,p.y+g,"middle",p.x,p.y+g+fs*0.9],[p.x-tw/2,p.y-g-fs*1.1,"middle",p.x,p.y-g-fs*0.2]]){
      const rect=[bx,by,bx+tw,by+fs*1.2]; if(rect[0]<x0+2*u||rect[2]>x1-2*u||rect[1]<y0+2*u||rect[3]>y1-2*u||taken.some(t=>hit(t,rect))) continue;
      taken.push(rect); return '<text x="'+f(tx)+'" y="'+f(ty)+'" text-anchor="'+anchor+'" font-size="'+f(fs)+'" class="m-lab'+(p.id===state.mapSel?" on":"")+'">'+esc(name)+'</text>'; }
    return ""; }).join("");
  if(state.pos){ const [yx,yy]=mapXY(state.pos.lat,state.pos.lon); taken.push([yx-9*u,yy-9*u,yx+9*u,yy+9*u]); }
  let evs="", flags=""; const evList=(state.mapShowEv?mapEvents():[]).filter(e=>e.x>x0+8*u&&e.x<x1-8*u&&e.y>y0+8*u&&e.y<y1-8*u);
  if(state.mapEv&&w<140){ const V=EVENT_VIEW[state.mapEv]; const g=eventGeo(state.mapEv); if(V&&V.face!=null&&g){ const [x,y]=mapXY(g[0],g[1]), fov=camFov(), L=34*u, lf=lightFacing(V.face,mapNow()), a0=(V.face-fov/2)*Math.PI/180, a1=(V.face+fov/2)*Math.PI/180;
      evs+='<g class="m-spotg on evwedge"><path d="M'+f(x)+' '+f(y)+' L'+f(x+Math.sin(a0)*L)+' '+f(y-Math.cos(a0)*L)+' A'+f(L)+' '+f(L)+' 0 0 1 '+f(x+Math.sin(a1)*L)+' '+f(y-Math.cos(a1)*L)+'Z" class="m-cone '+lf.k+'" stroke-width="'+f(1.2*u)+'"/></g>'; } }
  for(const e of evList.sort((a,b)=>(b.id===state.mapEv)-(a.id===state.mapEv)||(b.st.k==="live")-(a.st.k==="live")||a.r.o[0]-b.r.o[0])){ if(w>=520&&e.st.k!=="live"&&e.id!==state.mapEv) continue; const on=e.id===state.mapEv, hw=(e.day.length*3.1+5)*u, hh=7*u, box=[e.x-hw,e.y-hh,e.x+hw,e.y+hh];
    const live=e.st.k==="live", soon=live||e.st.k==="today"; if(!on && !soon && taken.some(t=>hit(t,box))) continue; taken.push(box);
    let lab=""; if(w<300||on||live){ const nm=e.r.e.name.length>26?e.r.e.name.slice(0,25)+"…":e.r.e.name, fl=10*u, tw=nm.length*fl*0.56;
      for(const [bx,anchor,tx] of [[e.x+hw+3*u,"start",e.x+hw+3*u],[e.x-hw-3*u-tw,"end",e.x-hw-3*u]]){ const rect=[bx,e.y-fl*0.6,bx+tw,e.y+fl*0.6]; if(rect[0]<x0+2*u||rect[2]>x1-2*u||(!on&&taken.some(t=>hit(t,rect)))) continue; taken.push(rect);
        lab='<text x="'+f(tx)+'" y="'+f(e.y+fl*0.36)+'" text-anchor="'+anchor+'" font-size="'+f(fl)+'" class="m-evlab">'+esc(nm)+'</text>'; break; } }
    evs+='<g class="m-ev '+e.st.k+(on?" on":"")+'" data-e="'+esc(e.id)+'" tabindex="0" role="button" aria-label="'+esc(e.r.e.name+", "+e.st.line)+'"><rect x="'+f(e.x-hw-6*u)+'" y="'+f(e.y-hh-6*u)+'" width="'+f(2*hw+12*u)+'" height="'+f(2*hh+12*u)+'" class="m-hit"/>'+
      (e.st.k==="live"?'<rect x="'+f(e.x-hw-3*u)+'" y="'+f(e.y-hh-3*u)+'" width="'+f(2*hw+6*u)+'" height="'+f(2*hh+6*u)+'" rx="'+f(5*u)+'" stroke-width="'+f(2.5*u)+'" class="m-evglow"/>':'')+
      '<rect x="'+f(e.x-hw)+'" y="'+f(e.y-hh)+'" width="'+f(2*hw)+'" height="'+f(2*hh)+'" rx="'+f(3*u)+'" stroke-width="'+f(1.5*u)+'" class="m-evbox"/><text x="'+f(e.x)+'" y="'+f(e.y+3.2*u)+'" text-anchor="middle" font-size="'+f(9*u)+'" class="m-evday">'+esc(e.day)+'</text>'+lab+'</g>'; }
  if(w<130) for(const p of pts){ const g=START_GEO[p.id]; if(!g||!START[p.id]) continue; const [x,y]=mapXY(g[0],g[1]); if(Math.hypot(x-p.x,y-p.y)<R+5*u) continue; const name=p.id===state.mapSel?"Start: "+START[p.id][0]:"Start", fl=(p.id===state.mapSel?10:8.5)*u, tw=name.length*fl*0.54, dot=[x-5*u,y-5*u,x+5*u,y+5*u]; if(taken.some(t=>hit(t,dot))) continue;
    for(const [bx,anchor,tx] of [[x+8*u,"start",x+8*u],[x-8*u-tw,"end",x-8*u]]){ const rect=[bx,y-fl*0.6,bx+tw,y+fl*0.6]; if(rect[0]<x0+2*u||rect[2]>x1-2*u||taken.some(t=>hit(t,rect))) continue; taken.push(rect,dot);
      flags+='<path d="M'+f(p.x)+' '+f(p.y)+'L'+f(x)+' '+f(y)+'" class="m-startline" stroke-width="'+f(1.2*u)+'" stroke-dasharray="'+f(3*u)+' '+f(3*u)+'"/><path d="M'+f(x)+' '+f(y-6*u)+'L'+f(x+5.5*u)+' '+f(y+4*u)+'H'+f(x-5.5*u)+'Z" class="m-start" stroke-width="'+f(1.2*u)+'"/><text x="'+f(tx)+'" y="'+f(y+fl*0.36)+'" text-anchor="'+anchor+'" font-size="'+f(fl)+'" class="m-startlab">'+esc(name)+'</text>'; break; } }
  let stations=""; if(w<300) for(const p of pts){ for(const [lat,lon,ln] of (STATION_GEO[p.id]||[])){ const [x,y]=mapXY(lat,lon); if(x<x0||x>x1||y<y0||y>y1) continue; const r=4.2*u, box=[x-r,y-r,x+r,y+r]; if(taken.some(t=>hit(t,box))) continue; taken.push(box);
      stations+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" stroke-width="'+f(1.3*u)+'" class="m-stn"/><text x="'+f(x)+'" y="'+f(y+2.2*u)+'" text-anchor="middle" font-size="'+f(5.6*u)+'" class="m-stnm">M</text>';
      if(w<150){ const col=CITIES[state.city].lines||{}, ls=ln.split("").slice(0,5), bw=9*u, bx0=x+r+2*u; const rect=[bx0,y-bw/2,bx0+ls.length*(bw+1.2*u),y+bw/2]; if(!taken.some(t=>hit(t,rect))){ taken.push(rect);
        stations+=ls.map((L,n)=>{ const cx=bx0+n*(bw+1.2*u)+bw/2, c=col[L]||"gray"; return '<circle cx="'+f(cx)+'" cy="'+f(y)+'" r="'+f(bw/2)+'" fill="var(--'+c+')"/><text x="'+f(cx)+'" y="'+f(y+2.6*u)+'" text-anchor="middle" font-size="'+f(7*u)+'" class="m-bul'+(c==="yellow"?" dark":"")+'">'+L+'</text>'; }).join(""); } } } }
  // every subway station, when zoomed in
  let allStn=""; if(state.mapShowStn&&w<130){
    for(const [name,lat,lon] of MAPD_STATIONS){ const [x,y]=mapXY(lat,lon); if(x<x0||x>x1||y<y0||y>y1) continue; const r=(w<45?3.4:2.6)*u, box=[x-r,y-r,x+r,y+r]; if(taken.some(t=>hit(t,box))) continue;
      allStn+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" stroke-width="'+f(1.1*u)+'" class="m-stn2"/>';
      if(w<45){ const fl=8.5*u, tw=name.length*fl*0.52, rect=[x+r+2*u,y-fl*0.6,x+r+2*u+tw,y+fl*0.6]; if(!taken.some(t=>hit(t,rect))){ taken.push(rect,box); allStn+='<text x="'+f(x+r+2*u)+'" y="'+f(y+fl*0.35)+'" font-size="'+f(fl)+'" class="m-stnlab">'+esc(name)+'</text>'; } } } }
  let sunny=""; { const cs=CITIES[state.city], spp=sunPos(mapNow(),cs.lat,cs.lon); if(state.mapShowSunny && spp.alt>0 && w<140){ const r=spp.az*Math.PI/180, SX=Math.sin(r), SY=-Math.cos(r), off=(w<70?3.2:1.6)*u;
    // zoomed in: every street block in view; further out: the main avenues and streets only
    if(w<70){ const G=streetGrid(), selP=state.mapSel&&PLACES[state.mapSel]?mapXY(PLACES[state.mapSel].lat,PLACES[state.mapSel].lon):null;
      // a few blocks round the chosen place, or round the middle of the view: a soft glow along the lit kerb, fading with distance
      const sp0=selP||(state.mapHead&&state.pos?mapXY(state.pos.lat,state.pos.lon):[(x0+x1)/2,(y0+y1)/2+(sheetPx()-topPx())*u/2]), RR=selP?7:Math.min(6,w*0.3), bands=[[0.55,""],[0.8,"mid"],[1,"far"]], D=["","",""];
      const bx0=Math.max(x0,sp0[0]-RR), bx1=Math.min(x1,sp0[0]+RR), by0=Math.max(y0,sp0[1]-RR), by1=Math.min(y1,sp0[1]+RR);
      const cx0=Math.floor(bx0/10), cx1=Math.floor(bx1/10), cy0=Math.floor(by0/10), cy1=Math.floor(by1/10);
      for(let gx=cx0;gx<=cx1;gx++) for(let gy=cy0;gy<=cy1;gy++){ const cell=G.cells.get(gx+","+gy); if(!cell) continue;
        for(const k of cell){ const ax=G.seg[k], ay=G.seg[k+1], bx=G.seg[k+2], by=G.seg[k+3], L=Math.hypot(bx-ax,by-ay); if(L<0.3) continue;
          const dist=Math.hypot((ax+bx)/2-sp0[0],(ay+by)/2-sp0[1])/RR; if(dist>1) continue;
          let nx=-(by-ay)/L, ny=(bx-ax)/L; const face=-(nx*SX+ny*SY); if(Math.abs(face)<0.12) continue; if(face<0){ nx=-nx; ny=-ny; }
          D[dist<bands[0][0]?0:dist<bands[1][0]?1:2]+='M'+f(ax+nx*off)+' '+f(ay+ny*off)+'L'+f(bx+nx*off)+' '+f(by+ny*off); } }
      D.forEach((d,i)=>{ if(d) sunny+='<path d="'+d+'" class="m-sunglow '+bands[i][1]+'" stroke-width="'+f(5.5*u)+'"/><path d="'+d+'" class="m-sunny near '+bands[i][1]+'" stroke-width="'+f(1.6*u)+'"/>'; }); }
    else for(const [,,line] of MAP_STREETS) for(let i=0;i<line.length-1;i++){ const a=mapXY(line[i][0],line[i][1]), b=mapXY(line[i+1][0],line[i+1][1]), L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(!L) continue;
      const tx=(b[0]-a[0])/L, ty=(b[1]-a[1])/L; let nx=-ty, ny=tx; const face=-(nx*SX+ny*SY); if(Math.abs(face)<0.12) continue; if(face<0){ nx=-nx; ny=-ny; }
      if(Math.max(a[0],b[0])<x0||Math.min(a[0],b[0])>x1||Math.max(a[1],b[1])<y0||Math.min(a[1],b[1])>y1) continue;
      sunny+='<path d="M'+f(a[0]+nx*off)+' '+f(a[1]+ny*off)+' L'+f(b[0]+nx*off)+' '+f(b[1]+ny*off)+'" class="m-sunny" stroke-width="'+f(0.9*u)+'"/>'; } } }
  let detail=""; const inside=(x,y,m)=>x>x0+m&&x<x1-m&&y>y0+m&&y<y1-m, free=rect=>!(rect[0]<x0+2*u||rect[2]>x1-2*u||rect[1]<y0+2*u||rect[3]>y1-2*u||taken.some(t=>hit(t,rect)));
  let lms=""; if(state.mapShowLm) LANDMARKS.forEach((L,i)=>{ const [name,lat,lon,kind,tier]=L, on=state.mapLm===i; if(!on&&(tier===2?w>=300:w>520)) return;
    const [x,y]=mapXY(lat,lon); if(!inside(x,y,6*u)) return; const r=(on?9:6.5)*u, box=[x-r,y-r,x+r,y+r]; if(!on&&taken.some(t=>hit(t,box))) return; taken.push(box);
    let lab=""; if(w<300||on){ const fl=10*u, tw=name.length*fl*0.54;
      for(const [bx,anchor,tx] of [[x+r+3*u,"start",x+r+3*u],[x-r-3*u-tw,"end",x-r-3*u]]){ const rect=[bx,y-fl*0.6,bx+tw,y+fl*0.6]; if(!on&&!free(rect)) continue; taken.push(rect);
        lab='<text x="'+f(tx)+'" y="'+f(y+fl*0.35)+'" text-anchor="'+anchor+'" font-size="'+f(fl)+'" class="m-spot'+(on?" on":"")+'">'+esc(name)+'</text>'; break; } }
    const k=r/5.2;
    lms+='<g class="m-lm'+(on?" on":"")+'" data-l="'+i+'" tabindex="0" role="button" aria-label="'+esc(name+", landmark")+'"><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r+6*u)+'" class="m-hit"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" stroke-width="'+f(1.2*u)+'" class="m-lmdot"/>'+
      '<g class="m-lmg" transform="translate('+f(x)+' '+f(y)+') scale('+k.toFixed(3)+')" stroke-width="1.1">'+LM_GLYPH[kind]+'</g>'+lab+'</g>'; });
  const [henge,hengeLabs=""]=hengeSvg(x0,y0,x1,y1,w,u,f,free,taken).split("\u0001"), ferries=ferrySvg(x0,y0,x1,y1,w,u,f,free,taken);
  if(state.mapShowNames&&w<420) for(const [name,lat,lon] of MAP_HOODS){ const [x,y]=mapXY(lat,lon); if(!inside(x,y,0)) continue; const fh=9*u, tw=name.length*fh*0.68, rect=[x-tw/2,y-fh*0.7,x+tw/2,y+fh*0.6]; if(!free(rect)) continue; taken.push(rect);
    detail+='<text x="'+f(x)+'" y="'+f(y+fh*0.35)+'" text-anchor="middle" font-size="'+f(fh)+'" class="m-hood">'+esc(name.toUpperCase())+'</text>'; }
  let stLab=0; const stMax=w<22?34:w<45?22:w<110?14:8;
  // zoomed in: every street, labelled on the middle of the part you can see
  if(state.mapShowNames&&w<=SN_W&&typeof MAPD_SN!=="undefined") detail+=snLabels(x0,y0+topPx()*u,x1,y1-sheetPx()*u,w,u,f,free,taken);
  else if(state.mapShowNames&&w<260) for(const [name,seg,line] of MAP_STREETS){ if(seg<0||stLab>=stMax) continue; const a=mapXY(line[seg][0],line[seg][1]), b=mapXY(line[seg+1][0],line[seg+1][1]), x=(a[0]+b[0])/2, y=(a[1]+b[1])/2; if(!inside(x,y,10*u)) continue;
    let ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI; if(ang>90) ang-=180; if(ang<-90) ang+=180; const fl=8.5*u, tw=name.length*fl*0.55, half=Math.max(tw/2*Math.abs(Math.cos(ang*Math.PI/180)),fl), halfy=Math.max(tw/2*Math.abs(Math.sin(ang*Math.PI/180)),fl*0.7), rect=[x-half,y-halfy,x+half,y+halfy];
    if(!free(rect)) continue; taken.push(rect); stLab++; detail+='<text x="'+f(x)+'" y="'+f(y-1.5*u)+'" text-anchor="middle" font-size="'+f(fl)+'" class="m-st" transform="rotate('+f(ang)+' '+f(x)+' '+f(y)+')">'+esc(name)+'</text>'; }
  // scale bar, with the walking time it stands for
  const sc=$("mapScale"); if(sc){ const perMile=28.9/u, mi=[5,2,1,0.5,0.25,0.1].find(m=>m*perMile<=96)||0.1; sc.innerHTML='<span>'+mi+' mi · '+Math.round(mi*20)+' min walk</span><i style="width:'+Math.round(mi*perMile)+'px"></i>'; }
  const ring=state.pos&&w<330 ? (()=>{ const [x,y]=mapXY(state.pos.lat,state.pos.lon); return '<circle cx="'+f(x)+'" cy="'+f(y)+'" r="14.5" class="m-walk" stroke-width="'+f(1.2*u)+'" stroke-dasharray="'+f(4*u)+' '+f(4*u)+'"/>'; })() : "";
  const badges=state.plan?state.plan.stops.map((st,n)=>{ const p=pts.find(q=>q.id===st.place); if(!p) return ""; const bx=p.x-(far?7:15)*u-3*u, by=p.y-(far?7:15)*u-2*u, bw=12*u;
    return '<g class="m-stop'+(n===nextStopIndex()?" next":"")+'"><rect x="'+f(bx-bw/2)+'" y="'+f(by-bw/2)+'" width="'+f(bw)+'" height="'+f(bw)+'" rx="'+f(2*u)+'" stroke-width="'+f(1.2*u)+'"/><text x="'+f(bx)+'" y="'+f(by+3.4*u)+'" text-anchor="middle" font-size="'+f(9.5*u)+'">'+(n+1)+'</text></g>'; }).join(""):"";
  // pins: zoomed out a dot with the count; from Manhattan zoom in, a round photo (installed app) framed by a ring with one arc per idea,
  // coloured by intent where the idea suits the light now, and a badge with how many do
  const key=lightAt(mapNow()), ideasOf=id=>cityIdeas().filter(i=>i.p===id&&(state.mapIntent==="all"||i.i===state.mapIntent)), photoOn={};
  let over="";
  const pins=pts.slice().sort((a,b)=>(a.id===state.mapSel)-(b.id===state.mapSel)).map(p=>{ const on=p.id===state.mapSel&&!state.mapSpot, part=p.n?p.done/p.n:0, lab=esc(PLACES[p.id].name)+', '+p.n+' ideas, '+p.fit+' suit the light now, '+p.done+' shot';
    const g0='<g class="m-pin'+(p.fit?" fit":"")+(on?" on":"")+(p.empty?" empty":"")+(far?"":" big")+'" data-p="'+p.id+'" tabindex="0" role="button" aria-label="'+lab+'"><circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(22*u)+'" class="m-hit"/>';
    if(far){ const r=(on?14:7)*u, rr=r+3.2*u, c=2*Math.PI*rr;
      return g0+(on?'<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(r)+'" class="m-halo" stroke-width="'+f(2*u)+'"/>':'')+
        (part?'<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(rr)+'" class="m-prog" stroke-width="'+f(2.4*u)+'" stroke-dasharray="'+f(c*part)+' '+f(c)+'" transform="rotate(-90 '+f(p.x)+' '+f(p.y)+')"/>':'')+
        '<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(r)+'" stroke-width="'+f(2*u)+'" class="m-dot"/>'+(on?'<text x="'+f(p.x)+'" y="'+f(p.y+4.4*u)+'" text-anchor="middle" font-size="'+f(12.5*u)+'" class="m-num">'+p.fit+'</text>':'')+'</g>'; }
    const r=(on?(w<45?13:16):w<150?10.5:9)*u, ringR=r+2.4*u, list=ideasOf(p.id), photo=PHOTOS_INLINE&&PLACE_PHOTO[p.id];
    let ring=""; if(list.length){ const n=list.length, gap=n>1?0.16:0, step=2*Math.PI/n;
      list.forEach((it,k)=>{ const a0=-Math.PI/2+k*step+gap/2, a1=a0+step-gap, P=a=>f(p.x+Math.cos(a)*ringR)+' '+f(p.y+Math.sin(a)*ringR);
        ring+='<path d="M'+P(a0)+' A'+f(ringR)+' '+f(ringR)+' 0 '+(a1-a0>Math.PI?1:0)+' 1 '+P(a1)+'" class="m-arc'+(it.w.includes(key)?'':' off')+'" stroke="'+(it.w.includes(key)?INTENTS[it.i].color:'')+'" stroke-width="'+f(3*u)+'"/>'; }); }
    if(photo) photoOn[p.id]=[p.x,p.y,r];
    const bx=p.x+r*0.78, by=p.y-r*0.78;
    over+=(p.fit||photo?'<g class="m-badge'+(p.fit?'':' zero')+'"><circle cx="'+f(bx)+'" cy="'+f(by)+'" r="'+f(6.6*u)+'" stroke-width="'+f(1.4*u)+'"/><text x="'+f(bx)+'" y="'+f(by+3.3*u)+'" text-anchor="middle" font-size="'+f(9*u)+'">'+p.fit+'</text></g>':'')+
      (p.done?'<g class="m-done"><circle cx="'+f(p.x-r*0.78)+'" cy="'+f(p.y+r*0.78)+'" r="'+f(5.4*u)+'" stroke-width="'+f(1.2*u)+'"/><path d="M'+f(p.x-r*0.78-2.6*u)+' '+f(p.y+r*0.78)+' l'+f(1.9*u)+' '+f(2*u)+' l'+f(3.4*u)+' '+f(-4*u)+'" stroke-width="'+f(1.5*u)+'"/></g>':'');
    return g0+(on?'<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(ringR+3*u)+'" class="m-halo" stroke-width="'+f(2*u)+'"/>':'')+ring+
      '<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(r)+'" stroke-width="'+f(1.2*u)+'" class="m-face"/>'+
      (photo?'':'<text x="'+f(p.x)+'" y="'+f(p.y+(on?4.6:3.6)*u)+'" text-anchor="middle" font-size="'+f((on?13:10.5)*u)+'" class="m-num">'+p.fit+'</text>')+'</g>'; }).join("");
  // photos sit in a layer of their own so they are not reloaded on every redraw
  if(PHOTOS_INLINE) document.querySelectorAll("#mapPhotos image").forEach(im=>{ const id=im.dataset.ph, v=photoOn[id];
    if(!v){ if(im.style.display!=="none") im.style.display="none"; return; }
    const [x,y,r]=v, c=document.querySelector("#pc-"+id+" circle"); c.setAttribute("cx",f(x)); c.setAttribute("cy",f(y)); c.setAttribute("r",f(r-0.6*u));
    im.setAttribute("x",f(x-r)); im.setAttribute("y",f(y-r)); im.setAttribute("width",f(2*r)); im.setAttribute("height",f(2*r)); im.style.display=""; });
  let you=""; if(state.pos){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); you='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(13*u)+'" class="m-youhalo"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(6*u)+'" stroke-width="'+f(2.5*u)+'" class="m-you"/>'; }
  const cc=CITIES[state.city], sp=sunPos(mapNow(),cc.lat,cc.lon), ph=sunPhase(sp.alt); if($("map").dataset.sky!==ph) $("map").dataset.sky=ph;
  const tint='<rect x="'+f(x0)+'" y="'+f(y0)+'" width="'+f(wb)+'" height="'+f(h)+'" class="m-tint '+ph+'"/>';
  let sun=""; if(sp.alt>-6){ const [sx,sy,dx,dy]=edge(sp.az);
    // rays fanning out from the sun across the map, strongest at the sun and fading with distance
    if(sp.alt>0&&!/rain|snow|cloud|fog/.test(skyAt(mapNow())||"")){ const L=wb*1.25, px=-dy, py=dx, ex=sx-dx*L, ey=sy-dy*L, P=(x,y)=>f(x)+' '+f(y);
      sun+='<defs><linearGradient id="beamG" gradientUnits="userSpaceOnUse" x1="'+f(sx)+'" y1="'+f(sy)+'" x2="'+f(ex)+'" y2="'+f(ey)+'"><stop offset="0" class="bm0"/><stop offset=".55" class="bm5"/><stop offset="1" class="bm1"/></linearGradient></defs>';
      for(const o of [-0.42,-0.21,0,0.21,0.42]){ const h0=1.5*u, h1=0.05*w, c0x=sx+px*o*w*0.06, c0y=sy+py*o*w*0.06, c1x=ex+px*o*w, c1y=ey+py*o*w;
        sun+='<path d="M'+P(c0x+px*h0,c0y+py*h0)+' L'+P(c1x+px*h1,c1y+py*h1)+' L'+P(c1x-px*h1,c1y-py*h1)+' L'+P(c0x-px*h0,c0y-py*h0)+'Z" class="m-beam" fill="url(#beamG)"/>'; } }
    const R=(sp.alt>0?8:6)*u; sun+='<g class="m-sun'+(sp.alt>0?'':' low')+'"><circle cx="'+f(sx)+'" cy="'+f(sy)+'" r="'+f(R*1.9)+'" class="m-sunglow"/>'+
      [0,45,90,135,180,225,270,315].map(a=>{ const q=a*Math.PI/180; return '<path d="M'+f(sx+Math.cos(q)*R*1.3)+' '+f(sy+Math.sin(q)*R*1.3)+' L'+f(sx+Math.cos(q)*R*1.8)+' '+f(sy+Math.sin(q)*R*1.8)+'" stroke-width="'+f(1.6*u)+'"/>'; }).join("")+
      '<circle cx="'+f(sx)+'" cy="'+f(sy)+'" r="'+f(R)+'" class="m-sundisc"/></g>'; }
  // light compass round the selected place: which way to face for back, side and front light
  let comp=""; const selP=state.mapSel&&pts.find(p=>p.id===state.mapSel);
  if(selP&&sp.alt>-0.8&&!state.mapSpot){ const near=w<60, r1=(near?62:19)*u, r2=(near?80:50)*u, sec=(c,k,lab)=>{ const a0=(c-28)*Math.PI/180, a1=(c+28)*Math.PI/180, P=(r,a)=>f(selP.x+Math.sin(a)*r)+" "+f(selP.y-Math.cos(a)*r);
      const m=c*Math.PI/180, lx=selP.x+Math.sin(m)*(r2+9*u), ly=selP.y-Math.cos(m)*(r2+9*u);
      return '<path d="M'+P(r1,a0)+' L'+P(r2,a0)+' A'+f(r2)+' '+f(r2)+' 0 0 1 '+P(r2,a1)+' L'+P(r1,a1)+' A'+f(r1)+' '+f(r1)+' 0 0 0 '+P(r1,a0)+'Z" class="m-comp '+k+'" stroke-width="'+f(0.5*u)+'"/><text x="'+f(lx)+'" y="'+f(ly+3*u)+'" text-anchor="middle" font-size="'+f(8.5*u)+'" class="m-comptx">'+lab+'</text>'; };
    comp='<g class="m-compass'+(near?' ring':'')+'">'+sec(sp.az,"back","Back")+sec(sp.az+90,"side","Side")+sec(sp.az-90,"side","Side")+sec(sp.az+180,"front","Front")+'</g>'; }
  // the sun and the shadow at the chosen spot: a dotted line towards the sun, a dark line the way shadows fall, longer as the sun gets low
  let sunLines=""; if(state.mapSpot&&sp.alt>0&&w<130){ const [spid,si]=state.mapSpot.split(":"), S=SPOTS[spid]&&SPOTS[spid][+si]; if(S){ const [x,y]=mapXY(S[0],S[1]), r=sp.az*Math.PI/180, dx=Math.sin(r), dy=-Math.cos(r), f3=n=>n.toFixed(3), Ls=Math.min(w*0.42,60*u), Lh=Math.min(Ls,Math.max(22*u,10*u+10*u/Math.tan(Math.max(4,sp.alt)*Math.PI/180))), fl=8*u;
    sunLines='<g class="m-sunray"><path d="M'+f3(x)+' '+f3(y)+' L'+f3(x+dx*Ls)+' '+f3(y+dy*Ls)+'" class="m-tosun" stroke-width="'+f3(1.6*u)+'" stroke-dasharray="'+f3(2*u)+' '+f3(3*u)+'"/><path d="M'+f3(x)+' '+f3(y)+' L'+f3(x-dx*Lh)+' '+f3(y-dy*Lh)+'" class="m-shadow" stroke-width="'+f3(5*u)+'"/>'+
      '<text x="'+f3(x+dx*(Ls+6*u))+'" y="'+f3(y+dy*(Ls+6*u)+fl*0.35)+'" text-anchor="middle" font-size="'+f3(fl)+'" stroke-width="'+f3(0.9*u)+'" class="m-sunlab">sun</text><text x="'+f3(x-dx*(Lh+8*u))+'" y="'+f3(y-dy*(Lh+8*u)+fl*0.35)+'" text-anchor="middle" font-size="'+f3(fl)+'" stroke-width="'+f3(0.9*u)+'" class="m-shadowlab">shadow</text></g>'; } }
  // where to stand: spots with a wedge as wide as the lens sees, coloured by the light facing that way
  let spotsSvg="", spotLabs=""; const fov=camFov(), tNow=mapNow(), labBoxes=[];
  for(const [pid,list] of Object.entries(SPOTS)){ if(!state.mapShowSpots||!PLACES[pid]||!(w<40||(state.mapSel===pid&&w<130))) continue;
    list.forEach((S,i)=>{ const [x,y]=mapXY(S[0],S[1]); if(!inside(x,y,0)) return; const id=pid+":"+i, on=state.mapSpot===id, L=(on?40:28)*u, lf=lightFacing(S[2],tNow);
      const a0=(S[2]-fov/2)*Math.PI/180, a1=(S[2]+fov/2)*Math.PI/180;
      spotsSvg+='<g class="m-spotg'+(on?" on":"")+'" data-s="'+id+'" tabindex="0" role="button" aria-label="'+esc(S[3]+", facing "+compass(S[2])+", "+lf.txt)+'"><path d="M'+f(x)+' '+f(y)+' L'+f(x+Math.sin(a0)*L)+' '+f(y-Math.cos(a0)*L)+' A'+f(L)+' '+f(L)+' 0 0 1 '+f(x+Math.sin(a1)*L)+' '+f(y-Math.cos(a1)*L)+'Z" class="m-cone '+lf.k+'" stroke-width="'+f((on?1.2:0.7)*u)+'"/>'+
        '<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(13*u)+'" class="m-hit"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f((on?8.5:7)*u)+'" stroke-width="'+f(1.5*u)+'" class="m-spotpt"/>'+
        '<text x="'+f(x)+'" y="'+f(y+(on?3.3:2.8)*u)+'" text-anchor="middle" font-size="'+f((on?9.5:8)*u)+'" class="m-spotn">'+(i+1)+'</text></g>';
      // names next to the numbers when zoomed in close, skipping any that would overlap
      if(on||w<=14){ const txt=on?S[3]:spotShort(S), fs=(on?8.5:7.5)*u, tw=txt.length*fs*0.52, bx=[x-tw/2, y+10*u, x+tw/2, y+10*u+fs*1.2];
        if(on||!labBoxes.some(b=>b[0]<bx[2]&&bx[0]<b[2]&&b[1]<bx[3]&&bx[1]<b[3])){ labBoxes.push(bx); spotLabs+='<text x="'+f(x)+'" y="'+f(y+10*u+fs)+'" text-anchor="middle" font-size="'+f(fs)+'" class="m-spottx'+(on?' on':'')+'">'+esc(txt)+'</text>'; } } }); }
  // the moon on the edge of the map, like the sun, with its phase
  let moonSvg=""; const mp=moonPos(mapNow(),cc.lat,cc.lon);
  if(mp.alt>-0.5){ const [mx,my]=edge(mp.az), R=7*u;
    const rx=R*Math.abs(1-2*mp.frac), lit='M0 '+f(-R)+' A'+f(R)+' '+f(R)+' 0 0 1 0 '+f(R)+' A'+f(rx)+' '+f(R)+' 0 0 '+(mp.frac>0.5?1:0)+' 0 '+f(-R)+'Z';
    moonSvg='<g class="m-moon" transform="translate('+f(mx)+' '+f(my)+')"><circle r="'+f(R*1.8)+'" class="m-moonglow"/><circle r="'+f(R)+'" class="m-moondark"/>'+(mp.frac>0.02?'<path d="'+lit+'" class="m-moonlit"'+(mp.phase>0.5?' transform="scale(-1 1)"':'')+'/>':'')+'</g>'; }
  let guideLine=""; const GI=guideInfo(); if(GI){ const [ax,ay]=mapXY(state.pos.lat,state.pos.lon), [bx,by]=mapXY(GI.S[0],GI.S[1]); guideLine='<path d="M'+f(ax)+' '+f(ay)+' L'+f(bx)+' '+f(by)+'" class="m-guide" stroke-width="'+f(3*u)+'" stroke-dasharray="'+f(2*u)+' '+f(6*u)+'"/>'; }
  // bridges and tunnels: a deck with edges and ties over the water, tunnels as a faint dashed line, names along them
  let bridges=""; if(w<560) for(const [name,kind,line] of MAPD_BRIDGES){ const pts=line.map(([la,lo])=>mapXY(la,lo)); if(!pts.some(([x,y])=>inside(x,y,-6*u))) continue;
    const d='M'+pts.map(([x,y])=>f(x)+' '+f(y)).join('L'), tunnel=kind==="tunnel";
    let ties=""; if(!tunnel&&w<110){ const step=Math.max(0.5,1.1*u*2); for(let i=0;i<pts.length-1;i++){ const [ax,ay]=pts[i], [bx,by]=pts[i+1], L=Math.hypot(bx-ax,by-ay); if(!L) continue; const tx=(bx-ax)/L, ty=(by-ay)/L, k=(w<45?4.2:3.2)*u;
        for(let t=step/2;t<L;t+=step){ const x=ax+tx*t, y=ay+ty*t; ties+='M'+f(x-ty*k)+' '+f(y+tx*k)+'L'+f(x+ty*k)+' '+f(y-tx*k); } } }
    const wd=tunnel?2.2:w<45?7:w<110?5:w<300?3.4:1.8;
    bridges+='<g class="m-brg'+(tunnel?' tun':'')+'">'+(tunnel?'<path d="'+d+'" class="m-tun" stroke-width="'+f(wd*u)+'" stroke-dasharray="'+f(3*u)+' '+f(3*u)+'"/>'
      :'<path d="'+d+'" class="m-brgc" stroke-width="'+f((wd+2.2)*u)+'"/>'+(ties?'<path d="'+ties+'" class="m-brgt" stroke-width="'+f(0.9*u)+'"/>':'')+'<path d="'+d+'" class="m-brgd" stroke-width="'+f(wd*u)+'"/>')+'</g>';
    // the name along the deck, when it fits
    if(w<300||(!tunnel&&w<420)){ let best=null; for(let i=0;i<pts.length-1;i++){ const L=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]); if(!best||L>best.L) best={L,i}; }
      const fl=(w<110?9:8)*u, tw=name.length*fl*0.56, totalL=pts.reduce((a,p,i)=>i?a+Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]):0,0);
      if(best&&totalL>tw*1.05){ const [ax,ay]=pts[best.i], [bx,by]=pts[best.i+1]; let ang=Math.atan2(by-ay,bx-ax)*180/Math.PI; if(ang>90) ang-=180; if(ang<-90) ang+=180;
        const cx=(pts[0][0]+pts[pts.length-1][0])/2, cy=(pts[0][1]+pts[pts.length-1][1])/2, m=(x,y)=>{ let bestP=null; for(let i=0;i<pts.length-1;i++){ const [ax2,ay2]=pts[i],[bx2,by2]=pts[i+1],L=Math.hypot(bx2-ax2,by2-ay2)||1,t=Math.max(0,Math.min(1,((x-ax2)*(bx2-ax2)+(y-ay2)*(by2-ay2))/(L*L))),px=ax2+(bx2-ax2)*t,py=ay2+(by2-ay2)*t,dd=Math.hypot(px-x,py-y); if(!bestP||dd<bestP.dd) bestP={dd,px,py}; } return bestP; }, q=m(cx,cy)||{px:cx,py:cy};
        const r2=[q.px-tw/2,q.py-fl,q.px+tw/2,q.py+fl]; if(free(r2)){ taken.push(r2); const off=(tunnel?-6:-(wd/2+4))*u, rad=ang*Math.PI/180, lx=q.px-Math.sin(rad)*off, ly=q.py+Math.cos(rad)*off;
          bridges+='<text x="'+f(lx)+'" y="'+f(ly)+'" text-anchor="middle" font-size="'+f(fl)+'" class="m-brglab'+(tunnel?' tun':'')+'" transform="rotate('+f(ang)+' '+f(lx)+' '+f(ly)+')">'+esc(name)+'</text>'; } } } }
  let dim=""; if(state.mapSel&&!state.mapSpot&&w<140&&PLACES[state.mapSel]){ const [sx,sy]=mapXY(PLACES[state.mapSel].lat,PLACES[state.mapSel].lon), rr=Math.max(9,w*0.28);
    dim='<mask id="spotM" maskUnits="userSpaceOnUse" x="'+f(x0)+'" y="'+f(y0)+'" width="'+f(wb)+'" height="'+f(h)+'"><rect x="'+f(x0)+'" y="'+f(y0)+'" width="'+f(wb)+'" height="'+f(h)+'" fill="#fff"/><circle cx="'+f(sx)+'" cy="'+f(sy)+'" r="'+f(rr)+'" fill="url(#spotG)"/></mask>'+
      '<rect x="'+f(x0)+'" y="'+f(y0)+'" width="'+f(wb)+'" height="'+f(h)+'" class="m-dim" mask="url(#spotM)"/>'; }
  // the way you are facing, from the phone's compass: a cone as wide as the lens from your position, turned by the heading as it changes
  let headCone=""; if(state.pos&&state.heading!==null&&w<330){ const [hx,hy]=mapXY(state.pos.lat,state.pos.lon), fov=camFov(), L=Math.min(w*0.35,46*u), a0=-fov/2*Math.PI/180, a1=fov/2*Math.PI/180;
    headCone='<g id="mapHeadG" class="m-head" data-x="'+f(hx)+'" data-y="'+f(hy)+'" transform="rotate('+f(state.heading)+' '+f(hx)+' '+f(hy)+')"><path d="M'+f(hx)+' '+f(hy)+' L'+f(hx+Math.sin(a0)*L)+' '+f(hy-Math.cos(a0)*L)+' A'+f(L)+' '+f(L)+' 0 0 1 '+f(hx+Math.sin(a1)*L)+' '+f(hy-Math.cos(a1)*L)+'Z" class="m-headcone" stroke-width="'+f(0.8*u)+'"/></g>'; }
  $("mapDyn").innerHTML=tint+wxSvg(x0,y0,wb,h,u)+sun+moonSvg+bridges+ferries+sunny+henge+detail+allStn+hengeLabs+route+ring+stations+flags+labels+lms+dim+comp+(w<60?"":sunLines+spotsSvg+spotLabs)+evs+guideLine+you+pins;
  $("mapOver").innerHTML=over+badges+(w<60?sunLines+spotsSvg+spotLabs:"")+headCone;
  const sl=$("sunLine"); if(sl) sl.innerHTML=sunLine();
}
function mapPanel(){
  const key=lightAt(mapNow()), pts=mapPts(), sel=state.mapSel&&pts.find(p=>p.id===state.mapSel), pl=sel&&PLACES[sel.id], d=sel?milesText(milesTo(pl)):"";
  if($("mapPlan")) $("mapPlan").innerHTML=mapPlanBar();
  if($("wxBar")) $("wxBar").innerHTML=wxBar();
  if($("lightMarks")){ $("lightMarks").innerHTML=lightMarks(); $("mapTime").style.setProperty("--band",lightBand()); }
  if($("mapDays")){ const n=new Date(); $("mapDays").innerHTML=[0,1,2,3,4,5,6].map(k=>{ const d=new Date(n.getFullYear(),n.getMonth(),n.getDate()+k); return '<button type="button" class="chip" data-day="'+k+'" aria-pressed="'+(state.mapD===k)+'">'+(k===0?'Today':k===1?'Tomorrow':DAY_SHORT[d.getDay()])+'</button>'; }).join(""); }
  const order=placeOrder().filter(id=>typeof PLACES[id].lat==="number");
  $("mapGo").innerHTML='<option value="">Go to a place…</option>'+groupOptions(order, id=>{ const dd=milesText(milesTo(PLACES[id])); return '<option value="'+id+'"'+(id===state.mapSel?" selected":"")+'>'+esc(PLACES[id].name)+(dd?' · '+dd:'')+'</option>'; });
  $("mapIntent").innerHTML='<button type="button" class="chip" data-i="all" aria-pressed="'+(state.mapIntent==="all")+'">Any intent</button>'+Object.entries(INTENTS).map(([k,v])=>'<button type="button" class="chip" data-i="'+k+'" aria-pressed="'+(state.mapIntent===k)+'"><span class="dot" style="background:'+v.color+'"></span>'+v.name+'</button>').join("");
  const nLive=state.mapShowEv?mapEvents().filter(e=>e.st.k==="live").length:0;
  if($("mapLayers")) $("mapLayers").innerHTML=mapLayersHtml(nLive); if($("mapLiveDot")) $("mapLiveDot").hidden=!nLive;
  if($("mapStatus")){ const t=mapNow(), cc=CITIES[state.city], ph=sunPhase(sunPos(t,cc.lat,cc.lon).alt), f=hourlyAt(t), sk=skyAt(t), w=WEATHER[state.city];
    const nx=f?wxNext(t):"", wx=f?[sk==="rain"?"Rain"+(f.pop!=null?" "+f.pop+"%":""):sk?WX_WORD[sk]:(f.cc>=50?"Some cloud":"Clear")+(f.pop!=null&&f.pop>=20?', '+f.pop+'% rain':''), f.temp!=null?Math.round(f.temp*9/5+32)+'°F':'', nx].filter(Boolean).join(' · '):(state.mapT===null&&w&&w.condition_text?w.condition_text+(typeof w.temp_c==="number"?', '+Math.round(w.temp_c*9/5+32)+'°F':''):'');
    $("mapStatus").innerHTML='<b>'+(state.mapD?mapDayName()+' ':'')+hmText(t.getHours()*60+t.getMinutes())+(mapIsNow()?' now':'')+'</b> · '+SUN_PHASE[ph]+(wx?' · '+esc(wx):'')+(nLive?' · <span class="mslive">'+nLive+' event'+(nLive>1?'s':'')+' on now</span>':''); }
  const evSel=state.mapShowEv&&state.mapEv&&mapEvents().find(e=>e.id===state.mapEv), hasEv=state.mapShowEv&&mapEvents().length;
  const mine=sel?cityIdeas().filter(i=>i.p===sel.id&&(state.mapIntent==="all"||i.i===state.mapIntent)).sort((a,b)=>b.w.includes(key)-a.w.includes(key)):[];
  const lmSel=state.mapShowLm&&typeof state.mapLm==="number"&&LANDMARKS[state.mapLm];
  const spotSel=state.mapSpot&&SPOTS[state.mapSpot.split(":")[0]], runSel=state.mapShowHenge&&state.mapRun!==null, ferrySel=state.mapShowFerry&&state.mapFerry&&FERRIES[state.mapFerry];
  $("mapPanel").classList.toggle("hassel",!!(sel||evSel||lmSel||spotSel||runSel||ferrySel));
  const legendHtml='<p class="msg maplegend"><span><span class="lg fit"></span>'+(state.mapIntent==="all"?"Ideas":INTENTS[state.mapIntent].name+" ideas")+' for the light now ('+esc(WHEN[key].toLowerCase())+')</span><span><span class="lg"></span>Other places</span><span><span class="lg arc"></span>Ring: one mark per idea, coloured when it suits the light</span><span><span class="lg badge"></span>How many suit the light now</span><span><span class="lg done"></span>You have shot here</span><span><span class="lg stn"></span>Subway station</span><span><span class="lg sunny"></span>Sunny side of the street</span>'+(state.mapShowHenge&&hengeDay().runs.length?'<span><span class="lg henge"></span>Lines up with the low sun '+(state.mapD?'on '+esc(mapDayName()):'today')+' (bright: right now)</span>':'')+(state.mapShowFerry?'<span><span class="lg ferry"></span>NYC Ferry route</span><span><span class="lg ferry sif"></span>Staten Island Ferry</span>':'')+(state.mapShowLm?'<span><span class="lg lmk"></span>Landmark</span>':'')+(hasEv?'<span><span class="lg ev"></span>Events in the next 6 weeks</span>'+(nLive?'<span><span class="lg evlive"></span>Event on now</span>':''):'')+
      (state.plan?'<span><span class="lg route"></span>Your plan</span>':'')+(state.pos?'<span><span class="lg you"></span>You</span><span><span class="lg walk"></span>10 min walk from you</span>':'')+'</p>';
  $("mapPanel").innerHTML=(spotSel ? spotPanel(state.mapSpot) : runSel ? runPanel(state.mapRun) : ferrySel ? ferryPanel(state.mapFerry) : lmSel ? lmPanel(lmSel) : evSel ? '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b>'+esc(evTitle(evSel.r))+'</b><span class="where">'+(EVENT_TYPES[evSel.r.e.type]?esc(EVENT_TYPES[evSel.r.e.type])+' · ':'')+esc(evSel.r.e.where||"")+'</span></div>'+
        '<p class="evnow '+evSel.st.k+'">'+esc(evSel.st.k==="today"&&!/from about/.test(evSel.st.line)?"Today":evSel.st.line)+'</p>'+
        '<p class="mapcount"><b>'+evSel.r.o[0].toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})+(evSel.r.o[1]?' to '+evSel.r.o[1].toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}):'')+'</b>'+(evSel.r.confirmed?' <span class="pill">Confirmed</span>':' (expected)')+(evSel.r.e.time?'<br>'+esc(evSel.r.e.time):'')+'</p>'+
        (evSel.r.e.why?'<p class="mapcount">'+esc(evSel.r.e.why)+'</p>':'')+
        (()=>{ const V=EVENT_VIEW[evSel.id]||{}, g=eventGeo(evSel.id), t=mapNow(), lf=V.face!=null?lightFacing(V.face,t):null; return (evSel.r.e.map&&evSel.r.e.map[0]?'<p class="mapcount"><b>Viewing spot: '+esc(evSel.r.e.map[0])+'</b>'+(lf?' · face '+compass(V.face)+' · <span class="sdk '+lf.k+'">'+esc(lf.txt)+'</span> at '+hmText(t.getHours()*60+t.getMinutes())+'<span class="turnhint" data-face="'+V.face+'">'+turnText(V.face)+'</span>':'')+'</p>'+(lf?lightStrip(V.face):''):'')+
          '<div class="callinks guidecta">'+(g?(state.guide&&state.guide.id==="ev:"+evSel.id?'<button type="button" class="chip" data-guidestop="1">Stop guiding</button>':'<button type="button" class="chip primary" data-guide="ev:'+esc(evSel.id)+'">Guide me there</button>')+'<a class="chip" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+g[0].toFixed(6)+','+g[1].toFixed(6)+'&heading='+(V.face||29)+'&pitch=0&fov=80" target="_blank" rel="noopener">Street View ↗</a>':'')+'</div>'; })()+
        '<div class="callinks"><button type="button" class="chip primary" data-planev="'+esc(evSel.id)+'">Plan this outing</button><button type="button" class="chip" data-event="'+esc(evSel.id)+'">Open in Events</button>'+(evSel.r.e.map?'<a class="chip" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(evSel.r.e.map[1])+'" target="_blank" rel="noopener">Google Maps ↗</a>':'')+'</div></section>' :
    sel ? '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button>'+(PHOTOS_INLINE&&PLACE_PHOTO[sel.id]?'<figure class="mapselfig"><img src="'+esc(PLACE_PHOTO[sel.id].src)+'" alt="'+esc(pl.name)+'" loading="lazy" onerror="this.parentNode.hidden=true"><figcaption><a href="'+esc(PLACE_PHOTO[sel.id].page)+'" target="_blank" rel="noopener">Photo: '+esc(PLACE_PHOTO[sel.id].by)+', '+esc(PLACE_PHOTO[sel.id].lic)+', Wikimedia Commons</a></figcaption></figure>':'')+'<div class="group-head"><b>'+esc(pl.name)+(d?'<span class="dist">'+d+'</span>':'')+'</b>'+whereHtml(pl)+'</div>'+startHtml(sel.id).replace('class="start"','class="start mapstart"')+
        '<p class="maplight">'+lightHere(mapNow())+'</p>'+
        '<p class="mapcount">'+sel.n+(sel.n===1?' idea':' ideas')+(state.mapIntent==="all"?'':' for '+INTENTS[state.mapIntent].name.toLowerCase())+' · '+sel.fit+(sel.fit===1?' suits':' suit')+' the light now · '+sel.done+' shot</p>'+
        (mine.length?'<p class="spothead">Ideas and where to stand</p>':'')+
        mine.map(x=>{ const sp=spotFor(x), lf=sp&&lightFacing(sp.S[2],mapNow());
          return '<div class="irow"><button type="button" class="row'+(state.done.has(x.id)?" done":"")+'" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span>'+
          '<span class="t"><b>'+esc(x.t)+'</b><span>'+esc(INTENTS[x.i].name)+(x.w.includes(key)?' · suits the light now':'')+'</span></span><span class="go" aria-hidden="true">›</span></button>'+
          (sp?'<button type="button" class="srow" data-spot="'+sp.id+'" aria-label="Show where to stand on the map: spot '+spotNum(sp.id)+', '+esc(sp.S[3])+'"><span class="snum '+lf.k+'">'+spotNum(sp.id)+'</span><span class="t"><b>'+esc(sp.S[3])+'</b> · face '+compass(sp.S[2])+', '+esc(lf.txt.charAt(0).toLowerCase()+lf.txt.slice(1))+'</span><span class="sgo" aria-hidden="true">◎</span></button>':'')+'</div>'; }).join("")+
        '<div class="callinks">'+(planIndex(sel.id)<0?'<button type="button" class="chip primary" data-addplan="'+sel.id+'">+ Add to today</button>':'<span class="pill instop">Stop '+(planIndex(sel.id)+1)+' · '+state.plan.stops[planIndex(sel.id)].at.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase()+'</span><button type="button" class="chip" data-rmplan="'+sel.id+'">Remove from today</button>')+(START[sel.id]?'<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(mapAddr(sel.id))+'&travelmode=transit" target="_blank" rel="noopener">Directions from where I am ↗</a>':'')+'<button type="button" class="chip" data-plan="'+sel.id+'">Plan an outing from here</button><button type="button" class="chip" data-go="'+sel.id+'">Open in Browse</button></div></section>'
      : state.mapNear ? nearPanel() : '<p class="lead mlead">Tap a pin to see a place and its ideas. Drag the bar above to see more.</p><div class="callinks mleadcta"><button type="button" class="chip primary" data-nearspots="1">Spots near me</button></div>');
  guideRender(); if(state.mapHead) headMsgShow();
  if($("mapLegend")) $("mapLegend").innerHTML=legendHtml+'<p class="msg">Drag to move the map, pinch or use + and − to zoom, double-tap to zoom in. ⌂ shows the whole city and ◎ finds you. Zoom in for neighbourhoods, landmarks, stations, street names and spots. The number on a pin is how many of its ideas suit the light now. Streets come from the US Census street files and subway lines from the MTA; landmarks and spots are placed by hand. On the subway has no pin because it is everywhere.</p>';
  if(state.sheet==="peek"&&(sel||evSel||lmSel||spotSel||runSel||ferrySel)) setSheet("half");
  const selKey=[state.mapSel,state.mapEv,state.mapLm,state.mapSpot,state.mapRun,state.mapFerry].join("|"); if(selKey!==mapPanel.last){ mapPanel.last=selKey; if($("mapBody")) $("mapBody").scrollTop=0; }
}
function mapFull(on){ state.mapFull=on; const m=$("map"); m.classList.toggle("full",on); document.body.classList.toggle("mapfull",on);
  const b=m.querySelector("[data-full]"); if(b){ b.setAttribute("aria-label",on?"Leave full screen":"Full screen map"); b.title=on?"Leave full screen":"Full screen"; }
  try{ if(on&&document.fullscreenEnabled&&!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else if(!on&&document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }catch(e){}
  requestAnimationFrame(mapLayout); }
document.addEventListener("fullscreenchange",()=>{ if(!document.fullscreenElement&&state.mapFull) mapFull(false); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&state.mapFull) mapFull(false); if(e.key==="Escape"&&openTip!==null&&openTip!=="c"){ const k=openTip; openTip=null; tipSheet(); const t=document.querySelector('#card [data-tip="'+k+'"]'); if(t) t.focus(); } });
$("tipSheet").addEventListener("click",e=>{ if(e.target.closest("[data-tipclose]")){ const k=openTip; openTip=null; tipSheet(); const t=document.querySelector('#card [data-tip="'+k+'"]'); if(t) t.focus({preventScroll:true}); } });
function spotPanel(id){ const [pid,i]=id.split(":"), S=SPOTS[pid][+i], t=mapNow(), lf=lightFacing(S[2],t), sr=sunRel(S[2],t), idea=IDEAS.find(x=>x.id===S[5]), cam=CAMERAS[state.camera];
  return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b><span class="snum">'+spotNum(id)+'</span> '+esc(S[3])+'</b><span class="where">'+esc(PLACES[pid].name)+' · facing '+compass(S[2])+(state.pos?' · '+mDist(kmBetween(state.pos,{lat:S[0],lon:S[1]}))+' from you':'')+'</span></div>'+
    '<div class="callinks guidecta">'+(state.guide&&state.guide.id===id?'<button type="button" class="chip" data-guidestop="1">Stop guiding</button>':'<button type="button" class="chip primary" data-guide="'+id+'">Guide me there</button>')+svLink(pid,S,id)+'</div>'+svNote(id)+
    '<p class="mapcount">'+esc(S[4])+'</p><p class="maplight"><span class="sdot '+lf.k+'"></span><b>'+lf.txt+' at '+hmText(t.getHours()*60+t.getMinutes())+(state.mapD?' '+mapDayName():'')+'.</b> '+(sr?esc(sr.txt)+' ':'')+LIGHT_TIP[lf.k]+'<span class="turnhint" data-face="'+S[2]+'">'+turnText(S[2])+'</span></p>'+
    '<p class="spothead">Light here through the day</p>'+lightStrip(S[2])+
    '<p class="hint spotfov">The wedge on the map is what '+(cam&&state.camera!=='other'?'the '+esc(cam.name):'your camera')+' takes in from here, about '+Math.round(camFov())+'° across'+(sr?'; the dotted line points at the sun and the dark line is the shadow':'')+'. Tap a time above or drag the slider to see the light change.</p>'+
    (idea?'<button type="button" class="row" data-id="'+idea.id+'"><span class="dot" style="background:'+INTENTS[idea.i].color+'"></span><span class="t"><b>'+esc(idea.t)+'</b><span>The idea for this spot · '+esc(INTENTS[idea.i].name)+'</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
    '<div class="callinks"><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+S[0].toFixed(5)+','+S[1].toFixed(5)+'&travelmode=walking" target="_blank" rel="noopener">Walking directions ↗</a>'+(state.mapNear?'<button type="button" class="chip" data-nearback="1">Back to spots near you</button>':'')+'<button type="button" class="chip" data-gosel="'+pid+'">Back to '+esc(PLACES[pid].name)+'</button></div></section>'; }
function lmPanel(L){ const [name,lat,lon,kind,,tip]=L, here={lat,lon};
  const near=Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number").map(id=>({id,km:kmBetween(here,PLACES[id])})).sort((a,b)=>a.km-b.km)[0];
  const d=milesText(milesTo(here));
  const idx=LANDMARKS.indexOf(L), walk=kind==="walk";
  return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b>'+esc(name)+(d?'<span class="dist">'+d+'</span>':'')+'</b><span class="where">'+LM_KIND[kind]+(walk?' · path heads '+compass(L[6])+' · about '+L[7]+' min across':' · landmark')+'</span></div>'+
    '<p class="mapcount">'+esc(tip)+'</p>'+
    (walk?'<div class="callinks guidecta">'+(state.guide&&state.guide.id==="lm:"+idx?'<button type="button" class="chip" data-guidestop="1">Stop guiding</button>':'<button type="button" class="chip primary" data-guide="lm:'+idx+'">Guide me there</button>')+'<a class="chip" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+lat.toFixed(6)+','+lon.toFixed(6)+'&heading='+L[6]+'&pitch=0&fov=80" target="_blank" rel="noopener">Street View ↗</a></div>':'')+
    (near&&near.km<2.5?'<button type="button" class="row" data-gosel="'+near.id+'"><span class="dot" style="background:var(--yellow)"></span><span class="t"><b>Nearest Shot List place: '+esc(PLACES[near.id].name)+'</b><span>About '+(near.km/1.609<0.15?"a block":(near.km/1.609).toFixed(1)+" mi")+' away · its ideas and starting point</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
    '<div class="callinks"><a class="chip" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+", New York, NY")+'" target="_blank" rel="noopener">Google Maps ↗</a><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+lat.toFixed(5)+','+lon.toFixed(5)+'&travelmode=transit" target="_blank" rel="noopener">Directions ↗</a></div></section>'; }
function mapSelectSpot(id){ const [pid,i]=id.split(":"), S=SPOTS[pid]&&SPOTS[pid][+i]; if(!S) return; state.mapSpot=id; state.mapSel=pid; state.mapEv=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; mapDraw(); mapPanel();
  const [x,y]=mapXY(S[0],S[1]); requestAnimationFrame(()=>{ mapDraw(); if(!state.mapHead) mapFly(mapAim({cx:x,cy:y,w:Math.min(mapV.w,12)})); }); }
/* Bring a point into the part of the map you can see, if it is under the search bar or the sheet. */
function mapEnsure(x,y){ const svg=$("mapSvg"); if(!svg||!mapV||state.mapHead) return; const k=mapV.w/(svg.clientWidth||360), H=svg.clientHeight, sx=(x-mapV.cx)/k+svg.clientWidth/2, sy=(y-mapV.cy)/k+H/2;
  if(sx<30||sx>svg.clientWidth-60||sy<topPx()+20||sy>H-sheetPx()-20) mapFly(mapAim({cx:x,cy:y,w:mapV.w})); }
function mapSelectLm(i){ state.mapLm=i; state.mapRun=null; state.mapFerry=null; state.mapSel=null; state.mapEv=null; state.mapSpot=null; mapDraw(); mapPanel(); const L=LANDMARKS[i]; if(L){ const [x,y]=mapXY(L[1],L[2]); requestAnimationFrame(()=>{ mapDraw(); mapEnsure(x,y); }); } }
function mapSelectEv(id){ state.mapEv=id; state.mapSel=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; state.mapSpot=null; mapDraw(); mapPanel(); const e=id&&mapEvents().find(v=>v.id===id); requestAnimationFrame(()=>{ mapDraw(); if(e&&!state.mapHead) mapEnsure(e.x,e.y); }); }
/* Street segments for the sunny side when zoomed in, read once from the street paths and bucketed by 10-unit cells. */
let STREET_GRID=null;
function streetGrid(){ if(STREET_GRID) return STREET_GRID; const seg=[], cells=new Map();
  for(const k of ["ave","local"]){ const d=MAPD_ROADS[k]; if(!d) continue; const re=/([Ml])([^Ml]*)/g; let m, x=0, y=0;
    while((m=re.exec(d))){ const n=m[2].match(/-?\d+/g)||[];
      if(m[1]==="M"){ x=+n[0]; y=+n[1]; } else for(let i=0;i+1<n.length;i+=2){ const nx=x+ +n[i], ny=y+ +n[i+1]; seg.push(x/10,y/10,nx/10,ny/10); x=nx; y=ny; } } }
  for(let k=0;k<seg.length;k+=4){ const key=Math.floor((seg[k]+seg[k+2])/20)+","+Math.floor((seg[k+1]+seg[k+3])/20); let c=cells.get(key); if(!c){ c=[]; cells.set(key,c); } c.push(k); }
  return STREET_GRID={seg:Float32Array.from(seg),cells}; }
/* Light down the street: long straight streets (MAPD_RUNS, ~550 m or more) that line up with the low sun on the map's day.
   A street lights up when the sun, less than 10° up, sits within a narrow angle of its line: the longer the street, the narrower,
   about as wide as the slot of sky the street leaves open at its far end. Manhattanhenge is the famous case; every grid has its days. */
let HENGE=null, RUNB=null;
function runBearings(){ if(RUNB) return RUNB; const n=MAPD_RUNS.length, b=new Float32Array(n), len=new Float32Array(n), tol=new Float32Array(n);
  for(let i=0;i<n;i++){ const R=MAPD_RUNS[i], dx=R[2]-R[0], dy=R[3]-R[1]; len[i]=Math.hypot(dx,dy)/10; b[i]=((Math.atan2(dx,-dy)*180/Math.PI)%180+180)%180; tol[i]=Math.max(0.5,Math.atan(0.4/len[i])*180/Math.PI); }
  const order=Array.from({length:n},(_,i)=>i).sort((x,y)=>b[x]-b[y]); return RUNB={b,len,tol,order,sb:Float32Array.from(order,i=>b[i])}; }
const mapLL = (x,y) => [40.95-y/2000, x/1516-74.30];
function hengeDay(day){ const c=CITIES[state.city], d=day?new Date(day):mapDay(); d.setHours(0,0,0,0); const key=state.city+":"+(+d);
  if(HENGE&&HENGE.key===key) return HENGE;
  const runs=[]; if(state.city!=="nyc"||typeof MAPD_RUNS==="undefined") return HENGE={key,runs,peaks:[]};
  const L=lightDay(d), samp=[];
  for(const [a,b] of [[L.rise-5,L.rise+160],[L.set-160,L.set+5]]) for(let m=a;m<=b;m++){ const p=sunPos(new Date(+d+m*6e4),c.lat,c.lon); if(p.alt>=-0.3&&p.alt<=10) samp.push([m,p.az,p.alt]); }
  // streets sorted by bearing (0 to 180°), so each minute of low sun only looks at the few streets within 2.5° of it
  const B=runBearings(), n=B.b.length, best=new Float32Array(n).fill(99), bm=new Int16Array(n), baz=new Float32Array(n), balt=new Float32Array(n), first=new Int16Array(n).fill(-1), last=new Int16Array(n);
  const lower=x=>{ let lo=0, hi=n; while(lo<hi){ const mid=(lo+hi)>>1; if(B.sb[mid]<x) lo=mid+1; else hi=mid; } return lo; };
  for(const s of samp){ const a=s[1]%180;
    for(const [lo,hi] of [[a-2.5,a+2.5],[a-2.5+180,a+2.5+180],[a-2.5-180,a+2.5-180]]){ if(hi<0||lo>180) continue;
      for(let k=lower(lo);k<n&&B.sb[k]<=hi;k++){ const i=B.order[k], d1=Math.abs(B.b[i]-a), dd=Math.min(d1,180-d1); if(dd>B.tol[i]) continue;
        if(first[i]<0||s[0]<first[i]) first[i]=s[0]; if(s[0]>last[i]) last[i]=s[0]; if(dd<best[i]){ best[i]=dd; bm[i]=s[0]; baz[i]=s[1]; balt[i]=s[2]; } } } }
  for(let i=0;i<n;i++) if(first[i]>=0) runs.push({i,m:bm[i],az:baz[i],alt:balt[i],len:B.len[i],from:first[i],to:last[i]});
  // the minute in the morning and in the evening when the most street length lines up: the chips under the time bar
  const peaks=[]; for(const am of [true,false]){ const tally=new Map(); for(const r of runs){ if((r.m<720)!==am) continue; for(let m=r.from;m<=r.to;m++) tally.set(m,(tally.get(m)||0)+r.len); }
    let best=null; tally.forEach((v,m)=>{ if(!best||v>best[1]) best=[m,v]; }); if(best&&best[1]>=25) peaks.push(best[0]); }
  return HENGE={key,runs,peaks}; }
const hengeNow = () => { if(!state.mapShowHenge) return []; const t=mapNow(), cur=t.getHours()*60+t.getMinutes(); return hengeDay().runs.filter(r=>cur>=r.from-4&&cur<=r.to+4); };
function nearestHood(lat,lon){ let best=null; for(const [n,a,o] of MAP_HOODS){ const d=kmBetween({lat,lon},{lat:a,lon:o}); if(!best||d<best[1]) best=[n,d]; } return best&&best[1]<3?best[0]:null; }
function mapSelectRun(i){ state.mapSel=null; state.mapEv=null; state.mapLm=null; state.mapSpot=null; state.mapFerry=null; state.mapRun=i; mapDraw(); mapPanel(); const R=MAPD_RUNS[i]; if(R) requestAnimationFrame(()=>{ mapDraw(); mapEnsure((R[0]+R[2])/20,(R[1]+R[3])/20); }); }
function runPanel(i){ const r=hengeDay().runs.find(x=>x.i===i), R=MAPD_RUNS[i]; if(!r||!R) return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><p class="mapcount">This street does not line up with the sun on '+esc(mapDayName().toLowerCase())+'. Pick another day, or another gold street.</p></section>';
  const [la,lo]=mapLL((R[0]+R[2])/20,(R[1]+R[3])/20), hood=nearestHood(la,lo), km=r.len*0.0556, rad=r.az*Math.PI/180, sx=Math.sin(rad), sy=-Math.cos(rad);
  // stand at the end away from the sun, so the whole street runs out ahead of you towards it
  const back=(R[0]*sx+R[1]*sy)<(R[2]*sx+R[3]*sy)?[R[0]/10,R[1]/10]:[R[2]/10,R[3]/10], [bla,blo]=mapLL(back[0],back[1]);
  const low=r.alt<2.5, mins=Math.max(2,r.to-r.from+1), day=state.mapD?' '+mapDayName():'';
  return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b>Sun down the street</b><span class="where">'+(hood?'A street in '+esc(hood):'This street')+' · '+(km/1.609).toFixed(1)+' mi straight · looking '+compass(r.az)+'</span></div>'+
    '<p class="maplight"><span class="sdot back"></span><b>Lines up at '+hmText(r.m)+day+'</b>, with the sun '+(r.alt<0.5?'on the horizon':Math.round(r.alt)+'° up')+' at the far end. The light runs down it for about '+mins+' minutes, '+hmText(r.from)+' to '+hmText(r.to+1)+'.</p>'+
    '<p class="mapcount">'+(low?'The sun sits right at the end of the street: the Manhattanhenge effect, on a street of its own. ':'Low sun runs the whole length of the street: long shadows, haze glowing between the buildings. ')+
      'Face '+compass(r.az)+' for backlight: people walking towards you go to silhouettes with their shadows stretching back at you. Turn round for warm light on faces and fronts. Stand on a corner island or step out only on the walk signal, and get there 20 minutes early.</p>'+
    '<p class="hint">Whether the sun clears the far end depends on what stands there, like a hill, trees or an elevated line. Check it in Street View before you go.</p>'+
    '<div class="callinks"><button type="button" class="chip primary" data-jump="'+Math.max(0,r.m-10)+'">Show the light at '+hmText(Math.max(0,r.m-10))+'</button><a class="chip" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+bla.toFixed(6)+','+blo.toFixed(6)+'&heading='+Math.round(r.az)+'&pitch=2&fov=70" target="_blank" rel="noopener">Street View, facing the sun ↗</a><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+bla.toFixed(5)+','+blo.toFixed(5)+'&travelmode=transit" target="_blank" rel="noopener">Directions ↗</a></div></section>'; }
function hengeSvg(x0,y0,x1,y1,w,u,f,free,taken){ f=n=>n.toFixed(w<80?3:1); if(!state.mapShowHenge||state.city!=="nyc") return ""; const H=hengeDay(); if(!H.runs.length) return "";
  const t=mapNow(), cur=t.getHours()*60+t.getMinutes(); let dim="", lit="", hit="", labs="", sel="", nL=0; const groups=new Map();
  for(const r of H.runs){ const R=MAPD_RUNS[r.i], ax=R[0]/10, ay=R[1]/10, bx=R[2]/10, by=R[3]/10; if(Math.max(ax,bx)<x0||Math.min(ax,bx)>x1||Math.max(ay,by)<y0||Math.min(ay,by)>y1) continue;
    const d='M'+f(ax)+' '+f(ay)+'L'+f(bx)+' '+f(by), on=cur>=r.from-4&&cur<=r.to+4;
    if(r.i===state.mapRun) sel=d; if(on) lit+=d; else dim+=d;
    if(w<200) hit+='<path d="'+d+'" class="m-runhit" data-r="'+r.i+'" stroke-width="'+f(14*u)+'"/>';
    const g=Math.round(r.m/5)+":"+Math.round(r.az); const o=groups.get(g); if(!o||r.len>o.len) groups.set(g,r); }
  if(w<200) for(const r of [...groups.values()].sort((a,b)=>b.len-a.len)){ if(nL>=(w<60?8:5)) break; const R=MAPD_RUNS[r.i], rad=r.az*Math.PI/180, sx=Math.sin(rad), sy=-Math.cos(rad);
    // the label sits at the end towards the sun
    const e=(R[0]*sx+R[1]*sy)>(R[2]*sx+R[3]*sy)?[R[0]/10,R[1]/10]:[R[2]/10,R[3]/10], x=e[0]+sx*6*u, y=e[1]+sy*6*u; if(x<x0||x>x1||y<y0||y>y1) continue;
    const txt='☀ '+hmText(r.m), fl=9*u, tw=txt.length*fl*0.55, rect=[x-tw/2-2*u,y-fl*0.75,x+tw/2+2*u,y+fl*0.5]; if(!free(rect)) continue; taken.push(rect); nL++;
    labs+='<g class="m-runlab" data-r="'+r.i+'"><rect x="'+f(rect[0])+'" y="'+f(rect[1])+'" width="'+f(rect[2]-rect[0])+'" height="'+f(rect[3]-rect[1])+'" rx="'+f(3*u)+'"/><text x="'+f(x)+'" y="'+f(y+fl*0.2)+'" text-anchor="middle" font-size="'+f(fl)+'">'+txt+'</text></g>'; }
  const sw=Math.max(1.6,Math.min(3,70/w))*u;
  return (dim?'<path d="'+dim+'" class="m-run" stroke-width="'+f(sw*0.9)+'"/>':'')+(lit?'<path d="'+lit+'" class="m-runglow" stroke-width="'+f(sw*5)+'"/><path d="'+lit+'" class="m-runcase on" stroke-width="'+f(sw*2.6)+'"/><path d="'+lit+'" class="m-run on" stroke-width="'+f(sw*1.5)+'"/>':'')+
    (sel?'<path d="'+sel+'" class="m-run sel" stroke-width="'+f(sw*2.4)+'"/>':'')+'<g class="m-runs">'+hit+'</g>'+(labs?'\u0001<g class="m-runs">'+labs+'</g>':''); }

/* Ferries: NYC Ferry routes (as from December 8, 2025) and the Staten Island Ferry, drawn on the water from MAPD_FERRY.
   Tap a route for its stops, ride time and, leg by leg, which side of the boat has the light at the map's time. */
const FERRIES = {
  er:{name:"East River",op:"NYC Ferry",mins:47,url:"https://www.ferry.nyc/routes-and-schedules/east-river/",tip:"Going north, Manhattan is on your left the whole way, and the Brooklyn, Manhattan and Williamsburg bridges pass right overhead in the first fifteen minutes. From Greenpoint the Midtown skyline lines up across the water. At weekday rush hours and on summer weekends it splits into two faster routes, A and B."},
  ast:{name:"Astoria",op:"NYC Ferry",mins:50,url:"https://ferry.nyc/routes-and-schedules/astoria",tip:"Passes the Navy Yard cranes, runs under the Queensboro Bridge and past the Roosevelt Island tram, and turns into Hell Gate with the RFK and Hell Gate bridges stacked up ahead. Quiet decks midday, when boats run about hourly."},
  sb:{name:"South Brooklyn",op:"NYC Ferry",mins:40,url:"https://www.ferry.nyc/routes-and-schedules/south-brooklyn",tip:"Lower Manhattan from the water between Wall Street and Red Hook, with the Statue of Liberty off to the west from Red Hook and Governors Island. On weekends some boats also call at DUMBO, Sunset Park and Bay Ridge."},
  rws:{name:"Rockaway-Soundview",op:"NYC Ferry",mins:120,url:"https://www.ferry.nyc/routes-and-schedules/rockaway-soundview/",tip:"The longest ride: down through the Narrows under the Verrazzano-Narrows Bridge, along Coney Island and under the Marine Parkway Bridge into Jamaica Bay. On summer weekends the boat to the beach fills with surfboards and coolers. About an hour each way from Wall Street to Rockaway or to Throgs Neck."},
  sg:{name:"St. George",op:"NYC Ferry",mins:68,url:"https://ferry.nyc/routes-and-schedules/st-george",tip:"Crosses the Upper Bay between St. George and Battery Park City close to the Statue of Liberty, then runs up the Hudson to Midtown West with Manhattan on your right going north. Late in the day the Hudson leg puts Manhattan in warm front light."},
  sif:{name:"Staten Island Ferry",op:"Free, around the clock",mins:25,url:"https://www.siferry.com/",place:"ferry",tip:"Free, every 15 to 30 minutes, day and night. Going to Staten Island the Statue of Liberty is on the right; coming back it is on the left, with the skyline ahead. The open decks at the back show Lower Manhattan pulling away."}
};
function ferryRoute(id){ const F=MAPD_FERRY, st=F.routes[id]; if(!st) return []; const out=[];
  for(let k=0;k<st.length-1;k++){ const a=st[k], b=st[k+1], key=[a,b].sort().join("-"); let p=(F.legs[key]||[]).map(q=>[q[0]/10,q[1]/10]); if(a!==[a,b].sort()[0]) p=p.slice().reverse(); out.push({a,b,p}); } return out; }
function legHeading(p){ const a=p[0], b=p[p.length-1]; return (Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI+360)%360; }
function legMins(p){ let L=0; for(let i=1;i<p.length;i++) L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]); return L*0.0556; }   // km
function mapSelectFerry(id){ state.mapSel=null; state.mapEv=null; state.mapLm=null; state.mapSpot=null; state.mapRun=null; state.mapFerry=id; mapDraw(); mapPanel();
  const pts=ferryRoute(id).flatMap(l=>l.p); if(pts.length&&!state.mapHead){ const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), ww=Math.max(24,(Math.max(...xs)-Math.min(...xs))*1.3,(Math.max(...ys)-Math.min(...ys))*0.9);
    requestAnimationFrame(()=>{ mapDraw(); mapFly(mapAim({cx:(Math.min(...xs)+Math.max(...xs))/2,cy:(Math.min(...ys)+Math.max(...ys))/2,w:Math.min(ww,mapV.w*1.6)})); }); } }
function sideOfSun(head,t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon); if(sp.alt<=-0.8) return null; const rel=((sp.az-head)%360+540)%360-180;
  if(Math.abs(rel)<25) return {k:"ahead",txt:"sun ahead: backlit both sides, glitter on the water in front"};
  if(Math.abs(rel)>155) return {k:"behind",txt:"sun behind you: both sides in front light"};
  return rel>0?{k:"right",txt:"sun on your right, so the left side is front-lit"}:{k:"left",txt:"sun on your left, so the right side is front-lit"}; }
function ferryPanel(id){ const R=FERRIES[id], F=MAPD_FERRY, legs=ferryRoute(id), t=mapNow(), c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon), nm=k=>F.landings[k][0];
  let near=""; if(state.pos){ let best=null; for(const k of F.routes[id]){ const [,la,lo]=F.landings[k], d=kmBetween(state.pos,{lat:la,lon:lo}); if(!best||d<best[1]) best=[k,d]; }
    if(best) near='<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+F.landings[best[0]][1].toFixed(5)+','+F.landings[best[0]][2].toFixed(5)+'&travelmode=transit" target="_blank" rel="noopener">To '+esc(nm(best[0]))+' ↗</a>'; }
  const rows=sp.alt>-0.8 ? legs.map(l=>{ const h=legHeading(l.p), s=sideOfSun(h,t); return '<div class="fleg"><b>'+esc(nm(l.a))+' → '+esc(nm(l.b))+'</b><span>heading '+compass(h)+(s?' · <span class="fside '+s.k+'">'+s.txt+'</span>':'')+'</span></div>'; }).join("") : '';
  return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b><span class="fbadge'+(id==="sif"?' sif':'')+'">⛴</span> '+esc(R.name)+'</b><span class="where">'+esc(R.op)+' · about '+R.mins+' min end to end</span></div>'+
    '<p class="mapcount">'+F.routes[id].map(k=>esc(nm(k))).join(' → ')+'</p>'+
    '<p class="mapcount">'+esc(R.tip)+'</p>'+
    (rows?'<p class="spothead">The light on board at '+hmText(t.getHours()*60+t.getMinutes())+(state.mapD?' '+mapDayName():'')+'</p><div class="flegs">'+rows+'<p class="hint">Front light: stand on the side away from the sun. Silhouettes, rim light and glitter on the water: the side facing it. Coming back the other way, swap sides. Drag the time bar to see another hour.</p></div>'
      :'<p class="maplight"><b>After dark</b>: the skyline is lit on both sides. Brace on the rail and keep the shutter at 1/30 s or faster: the boat moves even when the water looks flat.</p>')+
    '<div class="callinks">'+(R.place?'<button type="button" class="chip primary" data-gosel="'+R.place+'">Ideas for this ride</button>':'')+'<a class="chip'+(R.place?'':' primary')+'" href="'+R.url+'" target="_blank" rel="noopener">Timetable ↗</a>'+near+'</div></section>'; }
function ferrySvg(x0,y0,x1,y1,w,u,f,free,taken){ f=n=>n.toFixed(w<80?3:1); if(!state.mapShowFerry||state.city!=="nyc"||typeof MAPD_FERRY==="undefined") return ""; let lines="", hits="", stops="", labs=""; const seen=new Set();
  const order=Object.keys(FERRIES).sort((a,b)=>(a===state.mapFerry)-(b===state.mapFerry));
  for(const id of order){ const legs=ferryRoute(id), on=id===state.mapFerry, any=!!state.mapFerry; if(!legs.length) continue; const d=legs.map(l=>'M'+l.p.map(q=>f(q[0])+' '+f(q[1])).join('L')).join('');
    const xs=legs.flatMap(l=>l.p.map(q=>q[0])), ys=legs.flatMap(l=>l.p.map(q=>q[1])); if(Math.max(...xs)<x0||Math.min(...xs)>x1||Math.max(...ys)<y0||Math.min(...ys)>y1) continue;
    const sw=(on?3.2:1.8)*u;
    lines+='<path d="'+d+'" class="m-ferry'+(id==="sif"?' sif':'')+(on?' on':any?' off':'')+'" stroke-width="'+f(sw)+'" stroke-dasharray="'+f(6*u)+' '+f(4*u)+'"/>';
    hits+='<g class="m-ferryg" data-f="'+id+'" tabindex="0" role="button" aria-label="'+esc(FERRIES[id].name+' ferry route')+'"><path d="'+d+'" class="m-hitline" stroke-width="'+f(16*u)+'"/></g>';
    if(w<220&&(on||!any)){ let best=null; legs.forEach(l=>{ const L=legMins(l.p); if(!best||L>best.L) best={L,l}; }); const p=best.l.p, m=p[Math.floor(p.length/2)], q=p[Math.min(p.length-1,Math.floor(p.length/2)+1)]===m?p[Math.max(0,Math.floor(p.length/2)-1)]:p[Math.min(p.length-1,Math.floor(p.length/2)+1)];
      let ang=Math.atan2(q[1]-m[1],q[0]-m[0])*180/Math.PI; if(ang>90) ang-=180; if(ang<-90) ang+=180; const txt='⛴ '+FERRIES[id].name, fl=8.5*u, tw=txt.length*fl*0.55;
      const half=Math.max(tw/2*Math.abs(Math.cos(ang*Math.PI/180)),fl), halfy=Math.max(tw/2*Math.abs(Math.sin(ang*Math.PI/180)),fl*0.7), rect=[m[0]-half,m[1]-halfy,m[0]+half,m[1]+halfy];
      if(m[0]>x0&&m[0]<x1&&m[1]>y0&&m[1]<y1&&(on||free(rect))){ taken.push(rect); labs+='<text x="'+f(m[0])+'" y="'+f(m[1]-3*u)+'" text-anchor="middle" font-size="'+f(fl)+'" class="m-ferrylab'+(id==="sif"?' sif':'')+'" transform="rotate('+f(ang)+' '+f(m[0])+' '+f(m[1])+')">'+esc(txt)+'</text>'; } }
    if(w<260&&(on||!any)) for(const k of MAPD_FERRY.routes[id]){ if(seen.has(k)) continue; seen.add(k); const [name,la,lo]=MAPD_FERRY.landings[k], [x,y]=mapXY(la,lo); if(x<x0||x>x1||y<y0||y>y1) continue; const r=(w<60?3.6:2.6)*u;
      stops+='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" stroke-width="'+f(1.3*u)+'" class="m-fstop'+(id==="sif"?' sif':'')+'"/>';
      if(w<60||(on&&w<160)){ const fl=8.5*u, tw=name.length*fl*0.52; for(const [bx,anchor,tx] of [[x+r+2*u,"start",x+r+2*u],[x-r-2*u-tw,"end",x-r-2*u]]){ const rect=[bx,y-fl*0.6,bx+tw,y+fl*0.6]; if(!free(rect)) continue; taken.push(rect); stops+='<text x="'+f(tx)+'" y="'+f(y+fl*0.35)+'" text-anchor="'+anchor+'" font-size="'+f(fl)+'" class="m-fstoplab">'+esc(name)+'</text>'; break; } } } }
  return lines+stops+labs+'<g class="m-ferries">'+hits+'</g>'; }
/* The view for a place: close enough to see its where-to-stand spots and the sunny side of its streets.
   Fits the pin, its starting point and its spots, and never zooms out if you are already closer. */
function placeView(id){ const pl=PLACES[id], pts=[[pl.lat,pl.lon]].concat(START_GEO[id]?[START_GEO[id]]:[]).concat((SPOTS[id]||[]).filter(S=>kmBetween({lat:S[0],lon:S[1]},pl)<1.2).map(S=>[S[0],S[1]])).map(c=>mapXY(c[0],c[1]));
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  const svg=$("mapSvg"), H=svg?svg.clientHeight:600, Wpx=svg?svg.clientWidth:360, visH=Math.max(160,H-sheetPx()-topPx()), aspect=visH/Wpx;
  const w=Math.max(20,Math.min(100,Math.max(x1-x0,(y1-y0)/aspect)*2+8));
  return {cx:(x0+x1)/2, cy:(y0+y1)/2, w:Math.min(w,mapV?Math.max(mapV.w,20):w)}; }
function mapZoomPlace(id){ const v=placeView(id); mapFly(mapAim(v)); }
function mapSelect(id){ if(id) state.mapNear=false; state.mapSel=id; state.mapEv=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; state.mapSpot=null; mapDraw(); mapPanel(); if(id){ const fly=()=>{ const p=mapPts().find(q=>q.id===id), h=mapV.w*MAP_ASPECT;
  if(p) mapZoomPlace(id); };
  if(state.mapHead) return; if(state.mapFull) requestAnimationFrame(()=>{ mapDraw(); fly(); }); else fly(); } else if(state.mapFull) requestAnimationFrame(mapDraw); }
function mapGestures(svg){
  const ptr=new Map(); let g=null, lastTap=0, raf=0;
  const redraw=()=>{ if(!raf) raf=requestAnimationFrame(()=>{ raf=0; mapDraw(); }); };
  const at=(e,v)=>{ const r=svg.getBoundingClientRect(), k=v.w/r.width; return [v.cx-v.w/2+(e.clientX-r.left)*k, v.cy-v.w*MAP_ASPECT/2+(e.clientY-r.top)*k, k]; };
  const zoomAt=(e,factor,fly)=>{ if(state.mapHead){ mapV=mapClamp({cx:mapV.cx,cy:mapV.cy,w:mapV.w*factor}); redraw(); return; } const [mx,my]=at(e,mapV), w=Math.min(MAP_LIM.w[1],Math.max(MAP_LIM.w[0],mapV.w*factor)), k=w/mapV.w, to={cx:mx+(mapV.cx-mx)*k, cy:my+(mapV.cy-my)*k, w}; if(fly) mapFly(to); else { mapV=mapClamp(to); redraw(); } };
  const start=()=>{ const p=[...ptr.values()]; g={v:Object.assign({},mapV), moved:g?g.moved:false, pin:g?g.pin:null, ev:g?g.ev:null, lm:g?g.lm:null, spot:g?g.spot:null, p0:p.map(q=>({x:q.clientX,y:q.clientY}))}; };
  svg.addEventListener("pointerdown",e=>{ cancelAnimationFrame(mapAnim); const pin=e.target.closest&&e.target.closest(".m-pin"), ev=e.target.closest&&e.target.closest(".m-ev"), lm=e.target.closest&&e.target.closest(".m-lm"), sp=e.target.closest&&e.target.closest(".m-spotg"), rn=e.target.closest&&e.target.closest("[data-r]"), fy=e.target.closest&&e.target.closest(".m-ferryg"); ptr.set(e.pointerId,e); if(ptr.size===1) g={moved:false,pin:pin?pin.dataset.p:null,ev:ev?ev.dataset.e:null,lm:lm?+lm.dataset.l:null,spot:sp?sp.dataset.s:null,run:rn?+rn.dataset.r:null,ferry:fy?fy.dataset.f:null}; start(); try{ svg.setPointerCapture(e.pointerId); }catch(err){} });
  svg.addEventListener("pointermove",e=>{ if(!ptr.has(e.pointerId)||!g) return; ptr.set(e.pointerId,e); const p=[...ptr.values()], r=svg.getBoundingClientRect(), k=g.v.w/r.width;
    if(p.length===1){ const dx=p[0].clientX-g.p0[0].x, dy=p[0].clientY-g.p0[0].y; if(!g.moved && Math.hypot(dx,dy)<7) return; g.moved=true;
      if(state.mapHead){ if(Math.hypot(dx,dy)<24) return; headUp(false); g.v=Object.assign({},mapV); g.p0=[{x:p[0].clientX,y:p[0].clientY}]; return; }
      mapV=mapClamp({cx:g.v.cx-dx*k, cy:g.v.cy-dy*k, w:g.v.w}); }
    else if(p.length>=2 && g.p0.length>=2){ g.moved=true;
      if(state.mapHead){ const d0=Math.hypot(g.p0[0].x-g.p0[1].x,g.p0[0].y-g.p0[1].y)||1, d1=Math.hypot(p[0].clientX-p[1].clientX,p[0].clientY-p[1].clientY)||1; mapV=mapClamp({cx:mapV.cx,cy:mapV.cy,w:g.v.w*d0/d1}); redraw(); return; } const d0=Math.hypot(g.p0[0].x-g.p0[1].x,g.p0[0].y-g.p0[1].y)||1, d1=Math.hypot(p[0].clientX-p[1].clientX,p[0].clientY-p[1].clientY)||1;
      const m0={clientX:(g.p0[0].x+g.p0[1].x)/2,clientY:(g.p0[0].y+g.p0[1].y)/2}, m1x=(p[0].clientX+p[1].clientX)/2, m1y=(p[0].clientY+p[1].clientY)/2, [ax,ay]=at(m0,g.v);
      const w=Math.min(MAP_LIM.w[1],Math.max(MAP_LIM.w[0],g.v.w*d0/d1)), k2=w/r.width; mapV=mapClamp({cx:ax-(m1x-r.left)*k2+w/2, cy:ay-(m1y-r.top)*k2+w*MAP_ASPECT/2, w}); }
    redraw(); });
  const end=e=>{ if(!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId); if(ptr.size){ start(); return; } const was=g; g=null; if(!was||was.moved||e.type==="pointercancel") return;
    const now=Date.now(); if(was.spot){ lastTap=0; mapSelectSpot(was.spot); return; } if(was.pin){ lastTap=0; mapSelect(was.pin); return; } if(was.ev){ lastTap=0; mapSelectEv(was.ev); return; } if(was.lm!==null&&was.lm!==undefined){ lastTap=0; mapSelectLm(was.lm); return; } if(was.run!==null&&was.run!==undefined){ lastTap=0; mapSelectRun(was.run); return; } if(was.ferry){ lastTap=0; mapSelectFerry(was.ferry); return; }
    if(now-lastTap<320){ lastTap=0; zoomAt(e,0.5,true); return; } lastTap=now; if(state.mapSel||state.mapEv||state.mapLm!==null&&state.mapLm!==undefined||state.mapRun!==null||state.mapFerry) mapSelect(null); };
  svg.addEventListener("pointerup",end); svg.addEventListener("pointercancel",end);
  svg.addEventListener("wheel",e=>{ e.preventDefault(); zoomAt(e,Math.exp(Math.max(-60,Math.min(60,e.deltaY))*0.004),false); },{passive:false});
}
/* Plan an outing lives in the map's sheet: the controls and the plan are moved there from the old Plan page, so the route stays in view. */
function planSheet(open){ const m=$("map"), box=$("mapPlanSheet"); if(!m||!box) return; const vp=$("viewPlan"), body=$("mapPlanBody");
  if(vp&&vp.firstElementChild&&body){ while(vp.firstChild) body.appendChild(vp.firstChild); }
  const was=m.classList.contains("planopen"); m.classList.toggle("planopen",!!open); box.hidden=!open;
  if(open&&!was){ requestAnimationFrame(()=>{ setSheet("full"); if($("mapBody")) $("mapBody").scrollTop=0; }); }
  if(!open&&was) requestAnimationFrame(()=>setSheet(state.mapSel||state.mapSpot||state.mapEv?"half":"peek")); }
function renderMap(){ const box=$("map"); if(!$("mapSvg")) mapShell(box); requestAnimationFrame(mapLayout); const tm=$("mapTime"), nn=new Date(); if(tm) tm.value=state.mapT===null? nn.getHours()*60+nn.getMinutes() : state.mapT; if(!mapV) mapV=mapPreset(state.mapZoom==="man"?"man":"city"); mapPanel(); mapDraw(); }
/* Learn: short lessons, linked to the ideas and tools in the app. */
const LEARN_EXTRA = [{"id": "cameras", "n": "9", "title": "Cameras for street photography", "sub": "What matters, and the popular choices compared side by side", "widget": "cams", "body": ["Almost any camera can take street photographs. What matters is how quickly it lets you react, how much attention it draws, and whether you will carry it every day. Compare up to three cameras below; the outlines are drawn to the same scale."], "points": ["Focal length shapes your style more than any other choice. 28 mm puts you in the scene and forgives focus. 35 mm is the all-rounder. 40 to 43 mm isolates more and asks you to judge distance.", "Size and noise decide whether people notice you. A pocket camera with a quiet leaf shutter disappears; a large body with a big lens does not.", "A fixed-lens camera removes a decision and keeps the camera small. Interchangeable lenses give flexibility at the cost of size and the urge to change lens.", "A viewfinder steadies the camera and works in bright sun. A screen-only camera is easier to shoot from the hip.", "Sensor size matters less than it seems for street. APS-C at ISO 3200 is clean enough for night work.", "The best street camera is the one you have with you. If it stays at home because it is heavy, a smaller one will take more pictures."], "try": "For one week, carry the camera everywhere, even when you do not plan to shoot. Note how often it was in your hand when something happened."}, {"id": "prices", "n": "10", "title": "Camera prices and deals", "sub": "New, used and sold prices for the cameras above, checked twice a week", "widget": "prices", "body": ["Prices for the nine cameras compared above: the lowest new price from authorised US dealers, any current deal, used prices at MPB and KEH, and what they recently sold for on eBay. A check runs twice a week and records each price, so you can see the trend.", "Set an alert price on a camera and you get a notification on your phone when a new or used one is at or below it."], "points": ["New prices are from authorised US dealers and carry the maker's US warranty. A much lower price elsewhere is often a grey-market import without it.", "Used dealers such as MPB and KEH grade the condition and give their own warranty; check its length on the listing.", "eBay sold prices show what people actually paid, which is a better guide to value than asking prices.", "Deals are shown only when the retailer's own page states them. The check runs twice a week, so a short sale can end before you see it."], "try": "Pick the camera you would buy next and set an alert about 10% under today's used price. Watch the trend for a month before deciding."}];
const LEARN = [{"id": "exposure", "n": "1", "title": "Exposure in one minute", "sub": "Aperture, shutter and ISO, and which one to fix first", "body": ["Three settings decide how bright a picture is. Aperture (the f-number) also decides how much is sharp front to back. Shutter speed also decides how movement looks. ISO only changes brightness, at the cost of grain when it climbs high.", "On the street, decide what matters most for the picture, fix that, and let the camera handle the rest. Freezing a gesture means fixing the shutter. Keeping a whole scene sharp means fixing the aperture. Most ideas in this app do that by putting the camera in M with Auto ISO: you choose aperture and shutter, and the camera picks the ISO."], "points": ["Each full step (a stop) halves or doubles the light: f/5.6 to f/8, 1/250 to 1/500 s, ISO 400 to 800.", "Sunny 16: in direct sun, f/16 at 1/100 s and ISO 100 is about right. Every Settings card in the app starts from that.", "For people walking, 1/250 s is the slowest that keeps them sharp. For running or cycling, 1/1000 s.", "Exposure compensation (+/−) only works when the camera is choosing something. In M with Auto ISO it changes the ISO, so in full sun, where ISO is already at its floor, use a faster shutter instead.", "Expose for the brightest part you care about. Shadows in a DNG file recover well; blown highlights do not."], "try": "Shoot the same corner three times: in A at f/8, in S at 1/1000 s, and in M at f/8 and 1/250 s with Auto ISO. Compare which setting the camera changed each time.", "link": ["Open a freeze idea", "freeze"]}, {"id": "focus", "n": "2", "title": "Zone focusing", "sub": "Set the distance before the moment happens", "widget": "dof", "body": ["Autofocus is fast, but it still has to decide what to focus on, and in a crowd it can choose wrong. Zone focusing removes the decision: you set the lens to a distance, stop down so a band of the scene is sharp, and shoot anything that walks into that band.", "The band is wider at smaller apertures and wider on a wider lens. That is why the 28 mm Q3 is the classic zone-focus camera, and why the 43 mm needs you to be more precise about distance."], "points": ["Switch to manual focus and set the ring using the distance scale or the focus readout in the viewfinder.", "Learn what 3 m looks like on the pavement: about two sidewalk flags (New York's are usually 5 ft, about 1.5 m, square), or two-thirds of a car length.", "On the 43 mm, f/8 at 3 m gives roughly 2.2 to 4.9 m. Step closer or further rather than refocusing.", "On the 28 mm, f/8 at 3 m gives roughly 1.6 m to well past 20 m: almost everything.", "Keep the shutter at 1/500 s so the sharp band is not spoiled by movement."], "try": "Pick a doorway or crossing, set focus to its distance, and do not touch the focus ring for 30 minutes. Shoot only people who step into that spot.", "link": ["Open a zone-focus idea", "zone"]}, {"id": "compose", "n": "3", "title": "Composition", "sub": "Eleven ways to arrange a frame, each linked to ideas that use it", "widget": "tech", "body": ["Composition is how you arrange what is in the frame so the eye goes where you want it. The techniques below are the ones the app uses on its Compose tab. Tap one to see its diagram and the ideas built on it."], "points": ["Check the edges before you press: a stray arm or half a sign at the edge pulls attention.", "Fix the background first and wait for the subject. It is easier to wait than to chase.", "Change height: crouching or stepping onto a ledge changes the picture more than changing lens."], "try": "Choose one technique for a whole outing and shoot nothing else. Next time, choose a different one."}, {"id": "light", "n": "4", "title": "Reading the light", "sub": "What each kind of light is good for", "widget": "light", "body": ["The same street is a different picture in the morning, at noon, at dusk and in rain. The Now strip at the top of the app tells you which light you are in, and every idea lists the light it suits. This is what each one offers."], "points": [], "try": "Return to one place at three different times on the same day and shoot the same view. Note which light suited it."}, {"id": "people", "n": "5", "title": "Photographing people in New York", "sub": "Approach, etiquette and what the law allows", "body": ["Street photography is mostly about people, and how you behave decides both your pictures and how people react. Most of the time, being open about what you are doing works better than hiding it."], "points": ["Be visible. Holding the camera at chest height and taking your time reads as confident; hiding it reads as suspicious.", "If someone notices and objects, lower the camera, smile, and move on. Offer to delete the frame if they ask; it costs you one picture.", "For a portrait, ask first and then wait until they relax. The second or third frame after the posed one is usually the picture.", "Be careful with children, people in distress and people who are clearly vulnerable. If you would not want it shown, do not take it.", "In New York you may photograph people in public places without permission, and you may show those pictures as art or journalism. Using a recognisable person in an advertisement or to sell something needs their written consent (New York Civil Rights Law, sections 50 and 51).", "You may photograph and record police officers doing their job in public (New York Civil Rights Law, section 79-p). Keep a reasonable distance and do not interfere.", "On the subway, photography is allowed, but not with flash, tripods or extra lighting. Private spaces open to the public, such as Grand Central, Chelsea Market and the Oculus, set their own rules: handheld is generally fine, tripods are not.", "This is a summary for orientation, not legal advice."], "try": "Ask three strangers for a portrait in one afternoon. Take at least three frames of each and keep going after they relax."}, {"id": "camera", "n": "6", "title": "Set up your Leica Q3", "sub": "A street setup for the Q3 43 and Q3", "body": ["A good setup means you never have to go into the menus on the street. Set the camera once at home, save it as a user profile, and only change aperture, shutter and focus while you shoot."], "points": ["Scene Mode (in the menu): PASM, so the shutter dial and aperture ring control exposure. Auto and the other scene modes ignore the dials.", "Exposure: M with Auto ISO, upper limit 6400. Set the Auto ISO shutter speed limit to 1/250 s for when you use A mode.", "Focus: AFs with a Field box for most things, AFc with Eye/Face/Body Detection for people moving towards you, MF for zone focusing.", "Shutter type: Hybrid, so it is mechanical normally and electronic only when bright light needs more than 1/2000 s.", "File format: DNG plus JPG. The DNG keeps every highlight and shadow for editing later.", "Crop frames: the Q3 43 offers 60, 75, 90, 120 and 150 mm; the Q3 offers 35, 50, 75 and 90 mm. Use them to frame tighter without walking in, knowing each step costs resolution.", "Macro: twist the ring on the lens for close-ups. It focuses down to about 27 cm on the 43 mm and 17 cm on the 28 mm.", "Weather: the Q3 is sealed to IP52, enough for light rain, not a downpour. Keep the hood on and a cloth in your pocket.", "Save this as a user profile, and a second one for night (wider aperture, Auto ISO up to 12500) so you can switch with one press."], "try": "Set up both profiles at home, then spend one outing without opening the menu once."}, {"id": "practice", "n": "7", "title": "Assignments", "sub": "Short exercises that build the habit", "widget": "drills", "body": ["Skill in street photography comes from repetition with a constraint. Each assignment takes one outing. Tick it off when you have done it; the app remembers on this device."], "points": [], "try": ""}, {"id": "edit", "n": "8", "title": "From card to keepers", "sub": "Culling, editing and sequencing", "body": ["Most of what you shoot will not be good, and that is normal. Editing is where you find the few frames that work and make them better."], "points": ["Wait a day before you cull. You will judge more coldly.", "First pass: flag anything with a reason to exist. Second pass: from those, pick only the ones you would show someone.", "For each keeper, ask: where does the eye go first, and is that where you meant it to go?", "Edit lightly: straighten the horizon or verticals, crop the edges, set exposure, then contrast. Black and white is a choice for a picture, not a rescue for a bad one.", "Group your keepers by place or theme. Two or three pictures in sequence often say more than one.", "Back up the DNG files to two places before you format the card.", "Use Your notes on each idea in this app to record what worked, so next time you start from it."], "try": "From your last outing, keep only three pictures. Write one line in Your notes for the idea each one came from."}];
LEARN.splice(6,0,...LEARN_EXTRA);
/* Learn is a contents page of lessons grouped by topic; a lesson opens on its own page. */
const LEARN_GROUPS = [["See the picture","The settings and choices behind every frame",["exposure","focus","compose","light"]],
  ["On the street","Working with people, building the habit, and what to do after",["people","practice","edit"]],
  ["Your gear","Set up your Q3, compare street cameras and watch their prices",["camera","cameras","prices"]]];
{ const ord=LEARN_GROUPS.flatMap(g=>g[2]); LEARN.sort((a,b)=>(ord.indexOf(a.id)+1||99)-(ord.indexOf(b.id)+1||99)); LEARN.forEach((L,n)=>L.n=String(n+1)); }
const DRILLS = [["one-block", "One block, one hour", "Stay on one block for an hour. The first twenty minutes will feel empty; the pictures come after that."], ["36", "Thirty-six frames", "Allow yourself 36 frames for a whole outing, like a roll of film. Every press has to be deliberate."], ["no-zoom", "No crop frames", "Shoot a whole outing at the native focal length only. Move your feet instead."], ["same-place", "Same place, three times", "Visit one place in the app three times in a week, at different times of day."], ["colour", "Colour hunt", "Choose one colour and photograph only scenes where it is the strongest element."], ["backs", "Backs and shadows", "Photograph people without showing a single face: backs, hands, shadows and silhouettes."], ["closer", "Twice as close", "Whatever distance feels right, halve it for the whole outing."], ["night", "Night walk", "Shoot one hour after dark with Auto ISO up to 6400 and no flash."], ["wait", "Wait for it", "Find a clean background in good light and stay for 15 minutes until the right person walks into it. No wandering off."], ["five", "Work the scene", "For every scene you stop at, make at least five frames, moving between each one: closer, lower, to the side."], ["lightonly", "Light first", "Photograph people only where they step into direct light: a shaft between buildings, a lit corner, a reflection off glass."]];
const LIGHT_NOTES = [["am", "Morning", "Soft, clean light from a low angle, and streets that are still quiet. Good for shop owners opening up, commuters, and long shadows on east-west streets."], ["mid", "Midday sun", "Hard light from overhead and deep shadows. Use it for graphic pictures: shadows as shapes, people stepping out of shade into sun, and the narrow slots of light between towers."], ["gold", "Late afternoon", "Warm, low light that rakes along cross streets and lights faces from the side. Manhattan's grid lines up with the sun for a few minutes at a time. The best all-round light for people."], ["night", "Night", "Neon, shop windows and screens become the light. Expose for the lights, shoot wide open, and let the shadows go black."], ["rain", "Rain or overcast", "Soft, even light with no shadows, which flatters faces. Rain adds reflections, umbrellas and people hurrying. Shoot from doorways and keep the lens hood on."]];
function dofCalc(f,N,s){ const c=0.03, H=(f*f)/(N*c)+f, d=s*1000, near=d*(H-f)/(H+d-2*f), far=d<H? d*(H-f)/(H-d) : Infinity; return [near/1000, far/1000]; }   // H: hyperfocal distance in mm
const mFmt = m => m===Infinity||m>50 ? "infinity" : (m<10? m.toFixed(1) : Math.round(m))+" m";
/* Exposure simulator: aperture, shutter and ISO over a drawn street. Brightness follows the stops; the walker (1.4 m/s, 4 m away) blurs with
   the shutter; the far buildings (30 m, focus at 4 m) soften with the aperture; grain rises with ISO. Simplified, but the numbers are real. */
const XL = {sun:["Bright sun",15],shade:["Open shade",12.5],cloud:["Overcast",12],gold:["Golden hour",11],inside:["Grand Central inside",7],blue:["Blue hour",8],night:["Lit street at night",6]};
// Full stops you set yourself, darkest first; the camera picks in third stops, as the Q3 does
const XSH = [1/16000,1/8000,1/4000,1/2000,1/1000,1/500,1/250,1/125,1/60,1/30,1/15,1/8,1/4,1/2,1], XISO=[100,200,400,800,1600,3200,6400,12500];
const xApList = f => [16,11,8,5.6,4,2.8,f===28?1.7:2];
const AP3=[1.7,1.8,2,2.2,2.5,2.8,3.2,3.5,4,4.5,5,5.6,6.3,7.1,8,9,10,11,13,14,16], ISO3=[100,125,160,200,250,320,400,500,640,800,1000,1250,1600,2000,2500,3200,4000,5000,6400,8000,10000,12500],
  SH3=[16000,12500,10000,8000,6400,5000,4000,3200,2500,2000,1600,1250,1000,800,640,500,400,320,250,200,160,125,100,80,60,50,40,30,25,20,15,13,10,8,6,5,4,3,2.5,2,1.6,1.3,1].map(d=>1/d);
const near3 = (list,v) => list.reduce((b,c)=>Math.abs(Math.log2(c/v))<Math.abs(Math.log2(b/v))?c:b);
const shText = t => 1/t>=2.9 ? '1/'+Math.round(1/t)+' s' : (Math.round(t*10)/10)+' s';
// Presets: [name, settings, 1 if it is meant to go wrong]
const XPRE = [["Sunny 16",{mode:"M",L:"sun",N:16,t:1/125,iso:100}],["Freeze a gesture",{mode:"S",L:"sun",t:1/2000,iso:0}],["Zone focus",{mode:"M",L:"cloud",N:8,t:1/500,iso:0}],
  ["Drag at golden hour",{mode:"S",L:"gold",t:1/15,iso:0}],["Drag in full sun",{mode:"S",L:"sun",t:1/15,iso:0},1],["Shallow portrait",{mode:"A",L:"shade",N:0,iso:0}],["Night street",{mode:"A",L:"night",N:0,iso:0,slow:1/250,max:6400}]];
// How each scene looks when it is exposed correctly: sky, four building tones, windows, street, the walker's coat, lamp lit or not
const XPAL = {sun:["#9fc3e8",["#b4a48c","#c2b49c","#a8987e","#bba98f"],"#6f7f92","#7d7a74","#3c4250",0],
  shade:["#a9c1da",["#8f8a82","#9a948b","#857f77","#948e85"],"#5f6670","#66655f","#3c4250",0],
  cloud:["#b9bec6",["#7e828a","#8a8e96","#747880","#83878f"],"#5d636d","#5e6168","#2f343d",0],
  gold:["#f2c48a",["#c98f5e","#d6a171","#b97f52","#cc9466"],"#f6d9a0","#8a6a52","#3a2f2a",0],
  inside:["#4a5d68",["#b89f72","#c4ab7e","#ad9468","#bda478"],"#e9d9a8","#8c7b5e","#2e2a26",1],
  blue:["#3d5a9e",["#2b3550","#334060","#28314a","#303a58"],"#f3d27a","#2a2f40","#d8d2c4",1],
  night:["#0d1220",["#1a1e28","#20252f","#171a22","#1d212b"],"#f0c860","#1f2229","#cfc9bc",1]};
function expoState(){ if(!state.xp) state.xp={mode:"M",L:"cloud",f:CAM_FL[state.camera]===28?28:43,N:8,t:1/250,iso:0};
  const X=state.xp; X.mode=X.mode||"M"; X.max=X.max||6400; X.slow=X.slow||1/250; X.subj=XSUBJ[X.subj]?X.subj:"walk"; X.dist=X.dist||4; return X; }
// What crosses the frame: [name, the word for it, speed in m/s, how the speed is described]
const XSUBJ = {walk:["Walking person","walker",1.4,"at walking pace"],cycle:["Cyclist","cyclist",5,"at about 18 km/h"],car:["Car","car",11,"at about 40 km/h"]};
/* Blur in picture units (the frame is 150 wide): the subject's movement during the exposure, as a share of the frame width at its distance;
   the buildings 30 m away, with focus on the subject, from the circle of confusion. */
function xBlur(f,N,t,subj,dist){ const v=XSUBJ[subj][2], s=dist*1000, d=30000;
  return {walk:v*t/(dist*36/f)*150, bg:(f*f/(N*(s-f)))*((d-s)/d)/36*150}; }
// Which settings the camera chooses in the current mode
const xCtl = X => (X.mode==="A"?["t"]:X.mode==="S"?["N"]:[]).concat(X.iso?[]:["iso"]);
/* The camera's side, the way the Q3 behaves: A finds the shutter, S the aperture; with Auto ISO the ISO stays at 100 until the shutter would fall
   below the slowest-shutter setting (A) or the lens is wide open (S), then rises to the maximum; past that, A goes slower anyway. */
function expoCalc(){ const X=expoState(), f=X.f, Nmin=f===28?1.7:2, EV=XL[X.L][1], auto=!X.iso, max=X.max, mode=X.mode, lim=[];
  const ev=(N,t)=>Math.log2(N*N/t), isoFor=(N,t)=>100*Math.pow(2,ev(N,t)-EV);
  let N=Math.max(Nmin,X.N||Nmin), t=X.t, iso=auto?100:X.iso;
  const autoIso=()=>{ const need=isoFor(N,t); if(need>max*1.06){ iso=max; lim.push("isoMax"); } else if(need<100/1.06){ iso=100; lim.push("isoMin"); } else iso=Math.min(max,Math.max(100,need)); };
  if(mode==="A"){ const tFor=i=>N*N/Math.pow(2,EV+Math.log2(i/100)); t=tFor(iso);
    if(auto&&t>X.slow*1.06){ t=X.slow; autoIso(); if(lim.includes("isoMax")){ lim.splice(lim.indexOf("isoMax"),1,"isoMaxA"); t=tFor(max); lim.push("slowPast"); } }
    if(t>1.06){ t=1; lim.push("tMax"); } else if(t<1/17000){ t=1/16000; lim.push("tMin"); }
    t=near3(SH3,t); }
  else if(mode==="S"){ const nFor=i=>Math.sqrt(t*Math.pow(2,EV+Math.log2(i/100))); N=nFor(iso);
    if(N>16*1.06){ N=16; lim.push("nMax"); } else if(N<Nmin/1.06){ N=Nmin; if(auto) autoIso(); else lim.push("nMin"); }
    N=near3(AP3.filter(a=>a>=Nmin),N); }
  else if(auto) autoIso();
  if(auto) iso=near3(ISO3,iso);
  const stops=EV+Math.log2(iso/100)-ev(N,t);
  const {walk,bg}=xBlur(f,N,t,X.subj,X.dist);
  return {f,N,t,EV,iso,auto,stops,walk,bg,lim,mode,Nmin,max,slow:X.slow,L:X.L,subj:X.subj,dist:X.dist}; }
// A cyclist and a car, drawn like the walker: x is the centre, y the ground, h the height of a standing person at that distance
const dBike = (x,y,h,col) => { const p=(a,b)=>n1(x+a*h)+" "+n1(y+b*h), r=0.19*h, w=n1(Math.max(0.6,0.07*h));
  return '<g stroke="'+col+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="'+n1(x-0.3*h)+'" cy="'+n1(y-r)+'" r="'+n1(r)+'"/><circle cx="'+n1(x+0.32*h)+'" cy="'+n1(y-r)+'" r="'+n1(r)+'"/>'+
    '<path d="M'+p(-0.3,-0.19)+'L'+p(0,-0.2)+'L'+p(-0.06,-0.5)+'M'+p(0,-0.2)+'L'+p(0.24,-0.5)+'L'+p(0.32,-0.19)+'M'+p(-0.1,-0.5)+'L'+p(-0.02,-0.5)+'M'+p(0.2,-0.56)+'L'+p(0.28,-0.55)+'"/>'+
    '<path d="M'+p(-0.05,-0.52)+'L'+p(0.08,-0.83)+'L'+p(0.24,-0.56)+'M'+p(-0.05,-0.52)+'L'+p(0.1,-0.36)+'L'+p(0.03,-0.17)+'" stroke-width="'+n1(Math.max(0.9,0.11*h))+'"/>'+
    '<circle cx="'+n1(x+0.12*h)+'" cy="'+n1(y-0.95*h)+'" r="'+n1(0.085*h)+'" fill="'+col+'" stroke="none"/></g>'; };
const dCar = (x,y,h,col,glass) => { const u=h/1.75, p=(a,b)=>n1(x+a*u)+" "+n1(y+b*u);
  return '<g><path d="M'+p(-2.15,-0.3)+'L'+p(-2.15,-0.78)+'L'+p(-1.25,-0.88)+'L'+p(-0.75,-1.42)+'L'+p(0.85,-1.42)+'L'+p(1.45,-0.92)+'L'+p(2.15,-0.8)+'L'+p(2.15,-0.3)+'Z" fill="'+col+'"/>'+
    '<path d="M'+p(-0.62,-1.32)+'L'+p(0.05,-1.32)+'L'+p(0.05,-0.92)+'L'+p(-1.0,-0.92)+'ZM'+p(0.15,-1.32)+'L'+p(0.8,-1.32)+'L'+p(1.25,-0.92)+'L'+p(0.15,-0.92)+'Z" fill="'+glass+'" opacity=".75"/>'+
    '<circle cx="'+n1(x-1.4*u)+'" cy="'+n1(y-0.32*u)+'" r="'+n1(0.34*u)+'" fill="#1b1d22"/><circle cx="'+n1(x+1.4*u)+'" cy="'+n1(y-0.32*u)+'" r="'+n1(0.34*u)+'" fill="#1b1d22"/></g>'; };
function expoScene(C,id){ id=id||""; const k=Math.pow(2,Math.max(-5,Math.min(5,C.stops))/2.2), P=XPAL[C.L]||XPAL.cloud, n=Math.min(14,Math.round(C.walk/0.9)), noise=C.iso<=800?0:Math.min(0.55,0.09*Math.log2(C.iso/800)+0.06);
  const h=30*4/C.dist, gy=C.dist<=2?96:C.dist<=4?82:75, cx=C.subj==="car"?78:84;
  const fig=x=>C.subj==="cycle"?dBike(x,gy,h,P[4]):C.subj==="car"?dCar(x,gy,h,P[4],P[2]):dW(x,gy,h,"");
  let ghosts=''; if(n<1) ghosts=fig(cx); else for(let i=0;i<=n;i++){ const x=cx-C.walk/2+C.walk*i/n; ghosts+='<g opacity="'+Math.min(1,1.6/(n+1)+0.05).toFixed(2)+'">'+fig(x)+'</g>'; }
  ghosts='<g fill="'+P[4]+'">'+ghosts+'</g>';
  const bgBlur=Math.min(4,C.bg*1.4);
  return '<svg class="demo-svg xsvg" viewBox="0 0 150 100" role="img" aria-label="Simulated street scene"><defs>'+
    '<filter id="xExp'+id+'" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="'+k.toFixed(3)+'"/><feFuncG type="linear" slope="'+k.toFixed(3)+'"/><feFuncB type="linear" slope="'+k.toFixed(3)+'"/></feComponentTransfer></filter>'+
    '<filter id="xBg'+id+'" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="'+bgBlur.toFixed(2)+'"/></filter>'+
    '<filter id="xNoise'+id+'" x="0" y="0" width="1" height="1"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="4"/><feColorMatrix type="saturate" values="0"/></filter></defs>'+
    '<g filter="url(#xExp'+id+')"><rect width="150" height="100" fill="'+P[0]+'"/>'+
    '<g filter="url(#xBg'+id+')"><rect x="0" y="10" width="34" height="58" fill="'+P[1][0]+'"/><rect x="38" y="22" width="26" height="46" fill="'+P[1][1]+'"/><rect x="92" y="4" width="22" height="64" fill="'+P[1][2]+'"/><rect x="118" y="16" width="32" height="52" fill="'+P[1][3]+'"/>'+
      [[4,16],[14,16],[24,16],[4,30],[14,30],[24,30],[4,44],[24,44],[42,28],[52,28],[42,40],[96,10],[104,10],[96,24],[104,38],[122,22],[132,22],[142,22],[122,36],[142,36]].map(([x,y])=>'<rect x="'+x+'" y="'+y+'" width="6" height="7" fill="'+P[2]+'"/>').join("")+'</g>'+
    '<rect x="0" y="68" width="150" height="32" fill="'+P[3]+'"/><path d="M0 76 H150" stroke="#9a9ea6" stroke-width="1" opacity=".6"/><path d="M60 90 h14 M86 90 h14 M112 90 h14" stroke="#d8d8d0" stroke-width="2" opacity=".8"/>'+
    (P[5]?'<circle cx="23.3" cy="31" r="12" fill="#f3e3a8" opacity=".18"/><ellipse cx="24" cy="90" rx="16" ry="4" fill="#f3e3a8" opacity=".14"/>':'')+
    '<rect x="22" y="30" width="2.6" height="62" fill="#2a2d33"/><path d="M18 30 h11 l-2 -4 h-7 Z" fill="#2a2d33"/><circle cx="23.3" cy="31" r="1.6" fill="'+(P[5]?'#fff6d0':'#8a8a80')+'"/>'+
    '<rect x="40" y="62" width="9" height="12" fill="#3b3f47"/><path d="M38 62 h13" stroke="#2a2d33" stroke-width="1.4"/>'+
    ghosts+'</g>'+
    (noise?'<rect width="150" height="100" filter="url(#xNoise'+id+')" opacity="'+noise.toFixed(2)+'" style="mix-blend-mode:overlay"/>':'')+
    '<rect x="1" y="1" width="148" height="98" class="d-frame"/></svg>'; }
// One stop ladder row. Every rail runs from less light (left) to more light (right), so when you move one marker the camera's moves the other way.
const xLight = (k,v) => k==="N" ? -2*Math.log2(v) : Math.log2(v);
const xList = (k,f) => k==="N" ? xApList(f) : k==="t" ? XSH : XISO;
const xFmt = (k,v) => k==="N" ? "f/"+v : k==="t" ? shText(v) : String(Math.round(v));
const XLIM = {N:["nMax","nMin"], t:["slowPast","tMax","tMin"], iso:["isoMax","isoMaxA","isoMin"]};
function xRow(k,C,X){ const cam=xCtl(X).includes(k), list=xList(k,C.f), v=k==="N"?C.N:k==="t"?C.t:C.iso, a=xLight(k,list[0]), b=xLight(k,list[list.length-1]);
  const at=x=>Math.max(0,Math.min(100,(xLight(k,x)-a)/(b-a)*100)).toFixed(1), lim=XLIM[k].some(l=>C.lim.includes(l));
  const labels=k==="N"?list:k==="t"?[1/8000,1/1000,1/125,1/15,1]:[100,400,1600,6400];
  const lab=x=>k==="N"?String(x):k==="t"?(x>=1?"1 s":"1/"+Math.round(1/x)):String(x);
  const idx=list.indexOf(near3(list,v)), name={N:"Aperture",t:"Shutter",iso:"ISO"}[k];
  return '<div class="xr'+(cam?' cam':'')+(lim?' lim':'')+'"><div class="xr-h"><span class="xr-n">'+name+'</span><b class="xr-v">'+xFmt(k,v)+'</b>'+
    (k==="iso"?'<button type="button" class="chip xr-auto" data-xauto aria-pressed="'+C.auto+'">Auto ISO</button>':'')+
    '<span class="xr-who">'+(cam?'camera sets':'you set')+'</span></div>'+
    '<div class="xr-c"><button type="button" class="xr-b" data-xstep="'+k+':-1" aria-label="'+name+': less light"'+(cam||idx<=0?' disabled':'')+'>‹</button>'+
    '<div class="xr-rail"'+(cam?'':' data-xrail="'+k+'"')+'>'+list.map(x=>'<i style="left:'+at(x)+'%"></i>').join("")+labels.map(x=>'<span class="xr-l" style="left:'+at(x)+'%">'+lab(x)+'</span>').join("")+
      '<b class="xr-m" style="left:'+at(v)+'%"></b></div>'+
    '<button type="button" class="xr-b" data-xstep="'+k+':1" aria-label="'+name+': more light"'+(cam||idx>=list.length-1?' disabled':'')+'>›</button></div></div>'; }
const xStops = x => { const n=Math.round(Math.abs(x)*3), w=Math.floor(n/3), r=n%3; return (w||!r?w:"")+["","⅓","⅔"][r]+(n===3?" stop":" stops"); };
// What changed after you moved one setting: yours, the camera's answer, and the picture
function xTrade(k,B,A,X){ const val=(kk,C)=>kk==="N"?C.N:kk==="t"?C.t:C.iso, dl=kk=>xLight(kk,val(kk,A))-xLight(kk,val(kk,B));
  const d=dl(k); if(Math.abs(d)<1/6) return "";
  let m='<b>You:</b> '+{N:"aperture",t:"shutter",iso:"ISO"}[k]+' '+xFmt(k,val(k,B))+' → '+xFmt(k,val(k,A))+' ('+xStops(d)+(d>0?' more':' less')+' light).';
  const cam=xCtl(X).filter(kk=>Math.abs(dl(kk))>=1/6).map(kk=>({N:"aperture",t:"shutter",iso:"ISO"}[kk])+' '+xFmt(kk,val(kk,B))+' → '+xFmt(kk,val(kk,A)));
  const pic=A.stops-B.stops;
  if(cam.length) m+=' <b>Camera:</b> '+cam.join(", ")+(Math.abs(pic)<1/6?', so the picture stays as bright.':'.');
  if(Math.abs(pic)>=1/6) m+=' <b>Picture:</b> '+xStops(pic)+(pic>0?' brighter':' darker')+(cam.length?', because the camera hit a limit.':'.');
  return m; }
const XMODE = {A:["A · Aperture","Aperture priority. You set the aperture; the camera sets the shutter speed","On the Q3: aperture ring on a number, shutter dial on A."],
  S:["S · Shutter","Shutter priority. You set the shutter speed; the camera sets the aperture","On the Q3: shutter dial on a number, aperture ring on A."],
  M:["M · Manual","Manual. You set the aperture and the shutter","On the Q3: both on a number."]};
function learnExpo(){ const X=expoState(), C=expoCalc(), sel=(key,opts,cur)=>'<select data-xp="'+key+'">'+opts.map(([v,l])=>'<option value="'+v+'"'+(String(v)===String(cur)?' selected':'')+'>'+l+'</option>').join("")+'</select>';
  const st=C.stops, expTxt=Math.abs(st)<0.34?'<b class="ok">Correct</b>':st>0?'<b class="over">'+st.toFixed(1)+' stops too bright</b>'+(st>1.5?': the sky and pale walls blow out':''):'<b class="under">'+(-st).toFixed(1)+' stops too dark</b>'+(st<-1.5?': shadows block up':'');
  const why=[]; const L=C.lim;
  if(L.includes("nMax")) why.push('The lens cannot close past f/16, so the picture is too bright: use a faster shutter, or an ND filter for slow-shutter effects.');
  if(L.includes("nMin")) why.push('The lens is wide open at f/'+C.Nmin+': use a slower shutter or a higher ISO.');
  if(L.includes("slowPast")) why.push('Auto ISO reached its '+C.max+' maximum, so the camera went slower than your '+shText(C.slow)+' limit.');
  if(L.includes("isoMax")) why.push('Auto ISO is at its '+C.max+' maximum: open up, use a slower shutter, or allow a higher maximum.');
  if(L.includes("isoMin")) why.push('ISO cannot go below 100: use a faster shutter or a smaller aperture.');
  if(L.includes("tMax")) why.push('Slower than 1 s needs a tripod: open up or raise the ISO.');
  if(L.includes("tMin")) why.push('The fastest shutter is 1/16000 s: stop down.');
  const SJ=XSUBJ[C.subj], walkTxt=C.walk<0.4?'sharp':C.walk<1.5?'nearly sharp'+(C.subj==='walk'?'; fine for a walking figure':''):C.walk<5?'blurred: the movement shows':'streaked across the frame';
  const bgTxt=C.bg<0.25?'sharp':C.bg<0.8?'slightly soft':C.bg<2?'soft, the walker stands out':'very soft';
  const grain=C.iso<=800?'clean':C.iso<=3200?'fine grain in the shadows':C.iso<=6400?'visible grain':'heavy grain';
  const M=XMODE[C.mode], modeTxt=M[1]+(C.mode==="M"?(C.auto?'; with Auto ISO the camera sets only the ISO.':', and the ISO too.'):(C.auto?(C.mode==="A"?', and raises the ISO once the shutter would fall below your slowest setting.':', and raises the ISO once the lens is wide open.'):'.')), NL=xNowLight();
  return '<div class="dof xp"><div class="xprow">'+(NL?'<button type="button" class="chip xnow" data-xnow="'+NL.key+'">Light now: '+esc(NL.txt)+'</button>':'')+XPRE.map(([n],i)=>'<button type="button" class="chip" data-xpre="'+i+'">'+n+'</button>').join("")+'</div>'+expoScene(C)+
    '<div class="dofrow xgrid"><label>Light'+sel("L",Object.entries(XL).map(([k,v])=>[k,v[0]]),X.L)+'</label><label>Lens'+sel("f",[[28,"28 mm"],[43,"43 mm"]],C.f)+'</label>'+
      '<label>Subject'+sel("subj",Object.entries(XSUBJ).map(([k,v])=>[k,v[0]]),C.subj)+'</label><label>Distance'+sel("dist",[[2,"2 m"],[4,"4 m"],[8,"8 m"]],C.dist)+'</label></div>'+
    '<div class="xmode" role="group" aria-label="Exposure mode">'+Object.entries(XMODE).map(([k,v])=>'<button type="button" data-xmode="'+k+'" aria-pressed="'+(C.mode===k)+'">'+v[0]+'</button>').join("")+'</div>'+
    '<p class="xmode-t">'+modeTxt+'</p>'+xCamLine(C)+
    '<p class="xcap">Each tick is one stop, half or double the light. Further right lets in more light.</p>'+
    '<div class="xlad">'+xRow("N",C,X)+xRow("t",C,X)+xRow("iso",C,X)+
      (C.auto?'<div class="xauto"><label>Auto ISO maximum '+sel("max",[[6400,"6400 (day)"],[12500,"12500 (night)"]],C.max)+'</label>'+(C.mode==="A"?'<label>Slowest '+sel("slow",[1/60,1/125,1/250,1/500].map(v=>[v,shText(v)]),C.slow)+'</label>':'')+'</div>':'')+'</div>'+
    (state.xpTrade?'<p class="xtrade" role="status">'+state.xpTrade+'</p>':'')+
    '<ul class="xout"><li>Exposure: '+expTxt+'</li>'+why.map(w=>'<li class="xwhy">'+w+'</li>').join("")+
      '<li>The '+SJ[1]+': '+walkTxt+'</li><li>The far buildings: '+bgTxt+'</li><li>Grain: '+grain+'</li></ul>'+xEquivHtml(C)+
    '<p class="hint">The '+SJ[1]+' is '+C.dist+' m away, crossing the frame '+SJ[3]+', and in focus; the buildings are 30 m away. Light levels are typical for each scene, and the camera rounds its choices to third stops, as the Q3 does. The picture shows which way each setting pushes the photo, not exactly how it will look.</p></div>'; }
// The same light through other apertures: equally bright pictures that differ only in depth and movement
function xEquiv(C){ const k=C.N*C.N/C.t, out=[];
  for(const N of [C.Nmin,4,8,16]){ const raw=N*N/k; if(raw<1/17000||raw>1.06) continue; const t=near3(SH3,raw), B=xBlur(C.f,N,t,C.subj,C.dist);
    out.push(Object.assign({},C,{N,t,walk:B.walk,bg:B.bg,stops:C.EV+Math.log2(C.iso/100)-Math.log2(N*N/t)})); }
  return out; }
const xMoveShort = w => w<0.4?'frozen':w<1.5?'nearly frozen':w<5?'blurred':'streaked';
const xBgShort = b => b<0.25?'sharp background':b<0.8?'background a little soft':b<2?'soft background':'very soft background';
function xEquivHtml(C){ const E=xEquiv(C); if(E.length<2) return "";
  return '<div class="xeq"><h4>Same light, different picture</h4><p class="xeq-t">Each of these lets in as much light as your settings, so all are equally bright. Only the background and the movement change. Tap one to use it.</p><div class="xeq-g">'+
    E.map((e,i)=>'<button type="button" class="xeq-b" data-xeq="'+e.N+','+e.t+'" aria-pressed="'+(Math.abs(Math.log2(e.N/C.N))<0.2)+'">'+expoScene(e,"q"+i)+'<b>f/'+e.N+' · '+shText(e.t)+'</b><span>'+XSUBJ[C.subj][1]+' '+xMoveShort(e.walk)+', '+xBgShort(e.bg)+'</span></button>').join("")+'</div></div>'; }
// The light outside now, for the scene's Light setting
function xNowLight(){ try{ const now=new Date(), pos=state.pos||CITIES[state.city], sp=sunPos(now,pos.lat,pos.lon), ph=sunPhase(sp.alt), sky=withWx(pos,()=>lfSky(now)), dull=/cloud|rain|fog|snow/.test(sky);
    const key=ph==="night"?"night":ph==="blue"?"blue":ph==="gold"?(dull?"blue":"gold"):dull?"cloud":"sun";
    return {key,txt:SUN_PHASE[ph]+(sky&&sky!=="unknown"?', '+({clear:"clear",partly:"sun and cloud",cloud:"overcast",rain:"rain",fog:"fog",snow:"snow"}[sky]||sky):'')}; }catch(e){ return null; } }
// How to set it on the camera
function xCamLine(C){ const body=C.f===28?"Q3":"Q3 43", el=t=>t<1/2000/1.06?' (electronic shutter)':'';
  const ap=C.mode==="S"?'aperture ring <b>A</b>':'aperture ring <b>f/'+C.N+'</b>', sh=C.mode==="A"?'shutter dial <b>A</b>':'shutter <b>'+shText(C.t)+'</b>'+el(C.t);
  const iso=C.auto?'ISO <b>Auto</b>, max '+C.max+(C.mode==="A"?', slowest shutter '+shText(C.slow):''):'ISO <b>'+Math.round(C.iso)+'</b>';
  return '<p class="xcam">On your '+body+': '+ap+' · '+sh+' · '+iso+'</p>'; }
// Redraw and let the markers slide from where they were, so you see the camera's setting move against yours
function xpRedraw(el){ const old=[...el.querySelectorAll('.xr-m')].map(m=>m.style.left), box=document.createElement('div'); box.innerHTML=learnExpo(); const n=box.firstElementChild; el.replaceWith(n);
  const ms=[...n.querySelectorAll('.xr-m')]; if(old.length!==ms.length) return; const nw=ms.map(m=>m.style.left);
  ms.forEach((m,i)=>{ m.style.transition='none'; m.style.left=old[i]; }); void n.offsetWidth; ms.forEach((m,i)=>{ m.style.transition=''; m.style.left=nw[i]; }); }
function xpSet(k,v,el){ const X=expoState(), B=expoCalc(); X[k]=v; const A=expoCalc(); state.xpTrade=xTrade(k,B,A,X); xpRedraw(el); }

/* Crop frames: one scene through the native lens and each crop frame, with what is left of the 60 MP and how far to stand. */
const CROP_SET = {q328:{n:"Leica Q3",f:28,crops:[35,50,75,90]},q343:{n:"Leica Q3 43",f:43,crops:[60,75,90,120,150]}};
function cropScene(native){ const z=native/28; let s='<rect width="150" height="100" class="d-hole"/>';
  let g='<rect x="-60" y="-40" width="270" height="180" fill="#2c3038"/>';
  g+='<path d="M-60 -40 H44 V60 L-60 120 Z" class="d-bg"/><path d="M210 -40 H106 V58 L210 116 Z" class="d-bg"/>';
  for(const y0 of [-20,0,20,40]) g+='<path d="M-60 '+y0+' L44 '+(y0+(52-y0)*0.25)+'" class="d-feat" style="stroke-width:.6"/>';
  for(const y0 of [-20,0,20,40]) g+='<path d="M210 '+y0+' L106 '+(y0+(52-y0)*0.25)+'" class="d-feat" style="stroke-width:.6"/>';
  g+='<rect x="66" y="12" width="18" height="44" class="d-mu" opacity=".45"/><rect x="72" y="4" width="6" height="10" class="d-mu" opacity=".45"/>';
  g+='<path d="M-60 120 L44 60 H106 L210 116 V140 H-60 Z" class="d-mu" opacity=".16"/>';
  g+='<rect x="30" y="34" width="2" height="34" class="d-mu"/><rect x="118" y="30" width="2" height="38" class="d-mu"/>';
  g+=dW(48,70,12,"d-mu")+dW(104,68,10,"d-mu",-1)+dW(14,92,22,"d-mu")+dW(136,94,24,"d-mu",-1)+dStand(75,74,20,"d-fg");
  s+='<g transform="translate(75 50) scale('+z.toFixed(4)+') translate(-75 -50)">'+g+'</g>';
  return s; }
function learnCrop(){ const body=CROP_SET[state.lcBody]?state.lcBody:(state.camera==="q328"?"q328":"q343"), B=CROP_SET[body], frames=[B.f].concat(B.crops), F=frames.includes(+state.lcF)?+state.lcF:B.f;
  let lines=''; frames.slice(1).forEach(c=>{ const w=150*B.f/c, h=100*B.f/c, x=75-w/2, y=50-h/2; lines+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="none" stroke="var(--sign-fg)" stroke-width=".6" stroke-dasharray="2 1.5" opacity=".7"/><text x="'+(x+1.5).toFixed(1)+'" y="'+(y+5.5).toFixed(1)+'" class="d-tx" style="font-size:4.6px;fill:var(--sign-fg)">'+c+'</text>'; });
  const w=150*B.f/F, h=100*B.f/F, x=75-w/2, y=50-h/2, sel=F===B.f?'':'<path d="M0 0 H150 V100 H0 Z M'+x.toFixed(1)+' '+y.toFixed(1)+' v'+h.toFixed(1)+' h'+w.toFixed(1)+' v'+(-h).toFixed(1)+' Z" fill="#000" opacity=".55" fill-rule="evenodd"/><rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="none" stroke="var(--yellow)" stroke-width="1.2"/>';
  const r=B.f/F, mp=60.3*r*r, px=Math.round(9520*r/10)*10+' × '+Math.round(6336*r/10)*10, full=F*1.8/24, half=F*0.6/24;
  return '<div class="dof cropw"><div class="dofrow"><label>Camera<select data-lc="lcBody">'+Object.entries(CROP_SET).map(([k,v])=>'<option value="'+k+'"'+(k===body?' selected':'')+'>'+v.n+'</option>').join("")+'</select></label></div>'+
    '<div class="xprow">'+frames.map(c=>'<button type="button" class="chip" data-lcf="'+c+'" aria-pressed="'+(c===F)+'">'+c+' mm'+(c===B.f?'':'')+'</button>').join("")+'</div>'+
    '<svg class="demo-svg" viewBox="0 0 150 100" role="img" aria-label="'+F+' mm frame on the '+esc(B.n)+'">'+cropScene(B.f)+lines+sel+'<rect x="1" y="1" width="148" height="98" class="d-frame"/></svg>'+
    '<ul class="xout"><li><b>'+F+' mm'+(F===B.f?' (the lens, no crop)':' crop')+'</b>: '+(F===B.f?'60 MP, 9520 × 6336 pixels.':mp.toFixed(mp<10?1:0)+' MP left, about '+px+' pixels.'+(mp<8?' Fine for a phone or a small print, thin for a large one.':mp<20?' Plenty for prints up to about 30 cm.':' Plenty for large prints.'))+'</li>'+
      '<li>To fit a standing person top to toe across the short side: about <b>'+mFmt(full)+'</b> away. Head and shoulders: about <b>'+mFmt(half)+'</b>.</li></ul>'+
    '<p class="hint">A crop frame is the same as cropping later: it keeps the middle of the picture and throws the rest away, so the perspective does not change. Only where you stand changes how the background stacks up behind your subject. The DNG keeps the whole frame, so you can undo a crop at home.</p></div>'; }
/* Zone focusing, seen from eye height down a New York sidewalk. Ground points project as y = horizon + F·eye/d and x = centre + F·x/d.
   The yellow band on the pavement is the sharp zone; the people stand at fixed distances and blur by how far outside it they are. */
const ZF = {F:80, eye:1.5, hz:50, cx:150, people:[[1.5,-1.0],[3,0.8],[5,-1.5],[10,1.2],[25,-2.0]]};
const zfY = d => ZF.hz+ZF.F*ZF.eye/d, zfX = (x,d) => ZF.cx+ZF.F*x/d;
const zfPt = (x,d) => n1(zfX(x,d))+" "+n1(zfY(d));
const ZF_N = f => [f===28?1.7:2,2.8,4,5.6,8,11,16], ZF_S=[1,1.5,2,2.5,3,4,5,7,10];
function zfScene(f,N,s,a,b){
  const flag=1.52, W=2.28, far=60; let g='<rect width="300" height="'+ZF.hz+'" fill="#a9bfd4"/><rect y="'+ZF.hz+'" width="300" height="'+(170-ZF.hz)+'" fill="#686d75"/>';
  const up=(x,h,d)=>n1(zfX(x,d))+" "+n1(ZF.hz-ZF.F*(h-ZF.eye)/d);
  // across the avenue: a row of buildings with lit window bands; on this side, the facade beside the sidewalk
  for(const [d0,d1,h,col] of [[40,90,26,"#8d96a3"],[22,40,18,"#7f8895"],[13,22,22,"#8a93a0"]]) g+='<path d="M'+up(16,h,d1)+'L'+up(16,h,d0)+'L'+zfPt(16,d0)+'L'+zfPt(16,d1)+'Z" fill="'+col+'"/>';
  let win=''; for(let hh=4;hh<24;hh+=3.2) win+='M'+up(16,hh,80)+'L'+up(16,hh,13.5); g+='<path d="'+win+'" stroke="#c9d1db" stroke-width=".6" opacity=".7"/>';
  g+='<path d="M'+up(-W-0.3,14,far)+'L'+up(-W-0.3,14,1.2)+'L'+zfPt(-W-0.3,1.2)+'L'+zfPt(-W-0.3,far)+'Z" fill="#8e8172"/>';
  let col=''; for(let d=3;d<far;d*=1.5) col+='M'+up(-W-0.3,14,d)+'L'+zfPt(-W-0.3,d); g+='<path d="'+col+'" stroke="#7a6e60" stroke-width=".8" opacity=".8"/>';
  g+='<path d="M'+zfPt(-W-0.3,far)+'L'+zfPt(-W-0.3,0.9)+'L'+zfPt(-W,0.9)+'L'+zfPt(-W,far)+'Z" fill="#a39d90"/>';
  g+='<path d="M'+zfPt(W,far)+'L'+zfPt(W,0.9)+'L'+zfPt(W+0.18,0.9)+'L'+zfPt(W+0.18,far)+'Z" fill="#dcd7cb"/>';
  // the sidewalk flags, about 1.5 m square
  g+='<path d="M'+zfPt(-W,far)+'L'+zfPt(-W,0.9)+'L'+zfPt(W,0.9)+'L'+zfPt(W,far)+'Z" fill="#c9c4b8"/>';
  let ln=''; for(let d=flag;d<far;d+=flag) ln+='M'+zfPt(-W,d)+'L'+zfPt(W,d); for(const x of [-W/3,W/3]) ln+='M'+zfPt(x,far)+'L'+zfPt(x,0.9);
  g+='<path d="'+ln+'" stroke="#a49e90" stroke-width=".7" fill="none"/>';
  // the sharp zone on the pavement, and the focus line
  const bb=b===Infinity?far:Math.min(far,b);
  g+='<path d="M'+zfPt(-W,Math.max(0.95,a))+'L'+zfPt(W,Math.max(0.95,a))+'L'+zfPt(W,bb)+'L'+zfPt(-W,bb)+'Z" fill="#fccc0a" opacity=".55"/>';
  g+='<path d="M'+zfPt(-W-0.2,s)+'L'+zfPt(W+0.2,s)+'" stroke="#14161a" stroke-width="1.4" stroke-dasharray="4 2"/>';
  // the people, furthest first, each blurred by its circle of confusion (sharp inside the zone)
  let defs='', ppl='';
  ZF.people.slice().reverse().forEach(([d,x],i)=>{ const c=(f*f/(N*(s*1000-f)))*Math.abs(d-s)/d, inZ=d>=a-1e-6&&d<=b+1e-6, sd=inZ?0:Math.min(3.2,0.45*c/0.03);
    const h=ZF.F*1.75/d, id='zf'+i; if(sd>0.05) defs+='<filter id="'+id+'" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="'+sd.toFixed(2)+'"/></filter>';
    ppl+='<g'+(sd>0.05?' filter="url(#'+id+')"':'')+'>'+dStand(zfX(x,d),zfY(d),h,"zf-p")+'</g>';
    const left=d>=10; ppl+='<text x="'+n1(zfX(x,d)+(left?-1:1)*(0.2*h+2))+'" y="'+n1(zfY(d)-1)+'" class="zf-t'+(inZ?' in':'')+'"'+(left?' text-anchor="end"':'')+'>'+d+' m</text>'; });
  const fy=zfY(s), fx=zfX(W+0.2,s);
  g+=ppl+'<path d="M'+n1(fx)+' '+n1(fy)+'H'+(s>6?236:n1(Math.max(fx,236)))+'" stroke="#14161a" stroke-width=".6" stroke-dasharray="1.5 1.5"/><text x="294" y="'+n1(fy+2.5)+'" class="zf-f" text-anchor="end">focus '+(+s.toFixed(1))+' m</text>';
  return '<svg class="zf-svg" viewBox="0 0 300 170" role="img" aria-label="A sidewalk seen from eye height, with the sharp zone painted on it">'+(defs?'<defs>'+defs+'</defs>':'')+g+'<rect x=".5" y=".5" width="299" height="169" fill="none" stroke="rgba(0,0,0,.25)"/></svg>'; }
function learnDof(){ const f=+state.lfF===28?28:43, Ns=ZF_N(f), N=Ns.includes(+state.lfN)?+state.lfN:near3(Ns,+state.lfN||8), s=+state.lfS||3, [a,b]=dofCalc(f,N,s), H=(f*f)/(N*0.03)/1000+f/1000;
  const step=(k,list,cur,fmt)=>{ const lo=list.some(x=>x<cur-1e-6), hi=list.some(x=>x>cur+1e-6); return '<div class="zst"><span class="zst-n">'+(k==="N"?"Aperture":"Focus at")+'</span><button type="button" class="xr-b" data-zf="'+k+':-1" aria-label="'+(k==="N"?"Wider aperture":"Focus closer")+'"'+(lo?'':' disabled')+'>‹</button><b class="zst-v">'+fmt(cur)+'</b><button type="button" class="xr-b" data-zf="'+k+':1" aria-label="'+(k==="N"?"Smaller aperture":"Focus further")+'"'+(hi?'':' disabled')+'>›</button></div>'; };
  const NsUp=Ns.slice().sort((x,y)=>x-y);
  const front=s-a, back=b===Infinity?Infinity:b-s;
  const depth=b===Infinity?'Sharp from <b>'+mFmt(a)+'</b> to <b>infinity</b>':'Sharp from <b>'+mFmt(a)+'</b> to <b>'+mFmt(b)+'</b>';
  const split=b===Infinity?(s>=H*0.97?'You are focused at the hyperfocal distance: everything from half of it to the horizon is sharp.':'Everything behind your focus is sharp to the horizon; '+mFmt(front)+' in front of it.')
    :'A zone '+mFmt(b-a)+' deep: '+mFmt(front)+' in front of your focus, '+mFmt(back)+' behind. Focus a little nearer than where people will be.';
  return '<div class="dof zf"><div class="zf-lens" role="group" aria-label="Lens">'+[[43,"Q3 43 · 43 mm"],[28,"Q3 · 28 mm"]].map(([v,l])=>'<button type="button" data-zflens="'+v+'" aria-pressed="'+(v===f)+'">'+l+'</button>').join("")+'</div>'+
    zfScene(f,N,s,a,b)+
    '<p class="dofout">'+depth+'</p><p class="zf-split">'+split+'</p>'+
    '<div class="zf-ctl">'+step("N",NsUp,N,v=>"f/"+v)+step("S",ZF_S,s,v=>(+v.toFixed(1))+" m")+'<button type="button" class="chip zf-h" data-zfh="1">Set hyperfocal · '+H.toFixed(1)+' m</button></div>'+
    '<p class="hint">Yellow is the sharp zone on the pavement; the dashed line is where you focused. The squares are sidewalk flags, about 1.5 m (5 ft) each. Hyperfocal distance here is '+H.toFixed(1)+' m: focus there and everything from half that distance to infinity is acceptably sharp. Figures use the standard full-frame circle of confusion (0.03 mm). The view is the same for both lenses, so you can compare their zones.</p></div>'; }

function learnTech(){ const keys=Object.keys(TECH), sel=keys.includes(state.techSel)?state.techSel:null;
  const card=k=>{ const n=cityIdeas().filter(x=>COMPOSE[x.id]&&COMPOSE[x.id][0]===k).length;
    return '<button type="button" class="tg-c" data-techsel="'+k+'" aria-expanded="'+(k===sel)+'">'+(TECH_ART[k]?dSvg(TECH_ART[k],TECH[k][0],true):'')+'<b>'+esc(TECH[k][0])+'</b><span>'+n+' ideas</span></button>'; };
  const panel=k=>{ const ideas=cityIdeas().filter(x=>COMPOSE[x.id]&&COMPOSE[x.id][0]===k);
    return '<div class="tg-p"><p>'+esc(TECH[k][1])+'</p>'+ideas.slice(0,6).map(x=>'<button type="button" class="row" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span><span class="t"><b>'+esc(x.t)+'</b><span>'+esc(PLACES[x.p].name)+'</span></span><span class="go" aria-hidden="true">›</span></button>').join("")+
      (ideas.length>6?'<p class="hint">and '+(ideas.length-6)+' more in Browse.</p>':'')+'</div>'; };
  let out=''; keys.forEach((k,i)=>{ out+=card(k); if(sel&&(i%2===1||i===keys.length-1)&&Math.floor(keys.indexOf(sel)/2)===Math.floor(i/2)) out+=panel(sel); });
  return '<div class="tgrid">'+out+'</div>'; }

function learnLight(){ const k=lightAt(new Date()); return '<ul class="lightlist">'+LIGHT_NOTES.map(([key,name,text])=>{ const n=cityIdeas().filter(x=>x.w.includes(key)).length;
  return '<li'+(key===k?' class="now"':'')+'><b>'+esc(name)+(key===k?' <span class="pill">Now</span>':'')+'</b><span>'+esc(text)+'</span><button type="button" class="chip" data-light="'+key+'">'+n+' ideas for this light</button></li>'; }).join("")+'</ul>'; }
/* Why this frame works: each example photo explained, with the lines, shapes and placements drawn over it.
   Positions are percentages of the photo's width and height. Marks: ["l",x1,y1,x2,y2,label] a line, ["b",x,y,w,h,label] a box,
   ["c",x,y,r,label] a circle, ["t"] the thirds grid. Keys are technique ids (example photos) or idea ids (reference photos). */
const FRAME_WHY = {
  lines:{ar:960/540,marks:[["l",0,4,48.5,35],["l",100,2,48.5,35],["l",0,68,48.5,35],["l",100,73,48.5,35],["c",48.5,35,2.5,"Every line meets here"],["b",51,18,7,27,"The walker"]],
    why:["Rails, boards and shadows all run to one point at the end of the pier, so the eye travels down it whether it wants to or not.","The walker stands just beside that point, against the brightest sky: the lines deliver you straight to them.","The low sun ahead throws the post shadows back towards the camera, a second set of lines pointing the same way."]},
  frame:{ar:960/687,marks:[["b",14,4,74,84,"The doorway: a frame inside the frame"],["b",41,22,15,70,"Subject in silhouette"],["l",14,58,88,58,"Horizon"]],
    why:["The dark archway closes the picture on three sides, so the eye goes straight to the bright opening.","Exposed for the sky, the person drops to a clean silhouette: one strong shape against the light.","He stands where the path leads away, so the frame has a story: someone about to leave."]},
  layers:{ar:960/768,marks:[["b",5,18,26,72,"Front"],["b",44,10,16,70,"Middle: the one face"],["b",66,10,34,82,"Nearest, back turned"],["b",8,14,48,18,"Back: the cabs"]],
    why:["Three people at three distances, and none of their heads overlap: the frame reads front, middle and back.","Only the middle woman faces the camera; the two around her turn away, which makes her the subject.","The yellow cabs fill the background with place, so it says New York without a landmark."]},
  space:{ar:960/640,marks:[["b",2,6,27,78,"Empty fog"],["b",31,3,58,86,"The trees"],["c",33,83,3,"A small tree for scale"],["l",0,89,100,89,"Low horizon"]],
    why:["The fog removes the background, so the trees stand alone on blank grey.","A third of the frame is left empty on purpose. The space is what makes the trees feel big and quiet.","The little tree on the left gives scale and balances the big shape on the right."]},
  sym:{ar:960/480,marks:[["l",50.7,0,50.7,100,"Dead centre"],["b",1,20,7,52,"Mirror"],["b",87,20,8,48,"Mirror"],["l",0,63,100,63,"Platform edge dead level"],["c",16,45,3,"The one person"]],
    why:["Standing square to the far wall makes every line run straight across, so the two halves mirror each other.","The middle column sits exactly in the centre. In a symmetrical frame the centre is the strongest place, not a third.","The lone figure on the far platform is the one thing out of pattern, and the eye finds it."]},
  fill:{ar:960/639,marks:[["t"],["b",34,7,30,58,"The face fills the frame"],["l",38,35,60,35,"Eyes near the top third"]],
    why:["Face and shoulders run edge to edge: nothing else gets room to compete.","The eyes sit close to the upper third line, where a portrait feels natural.","A wide aperture turns the busy market behind into soft grey, so the texture of the face carries the picture."]},
  thirds:{ar:960/597,marks:[["t"],["b",26,21,10,62,"On the left third"],["l",0,82,100,82,"Low horizon"],["l",42,55,86,55,"Space to look into"]],
    why:["The lighthouse stands near the left third line, not the centre, so the frame has somewhere to go: out across the sea to the right.","The horizon sits low, giving most of the frame to clear sky, which makes the tower look taller.","The rule to take away: subject on a third, and the open space on the side it faces."]},
  juxta:{ar:960/618,marks:[["b",34,54,11,46,"A real hood"],["b",30,34,13,36,"A printed hood behind her"],["b",63,18,28,65,"And a third, larger"]],
    why:["Two things rhyme: the real woman's dark hood and the hooded figure printed on the panel behind her.","The picture depends on waiting for her to stop in exactly that spot, so the two line up.","The row of frames going back adds depth and repeats the idea down the street."]},
  diag:{ar:960/720,marks:[["l",27,100,48.6,30],["l",71,100,48.6,30],["l",0,68,48.6,30],["l",100,70,48.6,30],["c",16.6,63,4,"Lamps repeat and shrink"],["c",77.8,63,4,""],["b",25,50,13,30,"The one rider"]],
    why:["From the top of the escalators, handrails, steps and walls all run as diagonals into the tunnel, which gives a still picture movement.","The lamps repeat and get smaller, measuring the depth for you.","A single rider breaks the pattern: without them it is a picture of a place, with them it is about scale."]},
  reflect:{ar:960/720,marks:[["l",0,52,100,52,"Where the crowd meets its reflection"],["b",20,53,60,20,"The wet floor doubles the lights"]],
    why:["A film of water on the floor turns it into a mirror and doubles the crowd and the lights.","Shot low, close to the floor, the reflection grows; from standing height it almost disappears.","The boards and stars above say station at Christmas, the reflection says wet night: the picture tells both."]},
  light:{ar:960/638,marks:[["b",66,30,27,58,"Silhouette"],["b",0,11,52,70,"The wave"],["l",0,81,100,81,"The wall: a stage"]],
    why:["Exposed for the bright sky, the child goes completely dark. A silhouette reads by its outline, so the arms out and the hair carry the moment.","The bursting wave on the left balances the figure on the right, and the gap between them is the tension.","Pressed at the instant both peak: a moment earlier or later it is just a child on a wall."]},
  "midtown-place":{ar:960/720,marks:[["l",8,60,54,7,"The tops step up in one diagonal"],["b",56,0,44,100,"Dark glass"],["b",0,0,48,40,"Clean sky"]],
    why:["Looking straight up from the sidewalk turns the towers into lines that meet above the frame, which is how Midtown feels on foot.","The tops of the buildings step down in one diagonal, cutting the white sky into a clean triangle.","Dark glass on the right against pale stone on the left gives contrast without colour."]},
  "tsq-moment":{ar:960/720,marks:[["l",57,30,88,4,"His gaze"],["b",25,8,50,78,"Lit only by the screens"],["c",88,22,5,"Screens melt to soft dots"]],
    why:["The face is lit by the screens above, so the light itself shows where he is looking.","He looks up and out of the frame; leaving room on that side lets you wonder what he sees.","Close and shallow: the screens behind melt into soft dots instead of competing with the face."]},
  "tsq-mood":{ar:960/640,marks:[["l",0,56,100,56,"The mirror line"],["c",34.6,39,3,"One umbrella"],["c",34.6,66,3,"And its reflection"]],
    why:["With the camera just above the puddle, the reflection fills the bottom half and the square looks twice as bright.","The mirror line sits just below the middle, so the screens above and their reflection below make the whole frame glow.","A single figure with an umbrella gives scale, and loneliness, to an empty Times Square."]}
};
function whyOverlay(k){ const W=FRAME_WHY[k]; if(!W) return ""; let svg="", labs="";
  for(const m of W.marks){
    if(m[0]==="t") svg+='<path d="M33.3 0V100M66.7 0V100M0 33.3H100M0 66.7H100" class="wv-t"/>';
    else if(m[0]==="l"){ svg+='<path d="M'+m[1]+' '+m[2]+'L'+m[3]+' '+m[4]+'" class="wv-l"/>'; if(m[5]) labs+='<span class="wv-lab" style="left:'+Math.min(78,Math.max(1,(m[1]+m[3])/2-8))+'%;top:'+Math.min(92,Math.max(1,(m[2]+m[4])/2+1))+'%">'+esc(m[5])+'</span>'; }
    else if(m[0]==="b"){ svg+='<rect x="'+m[1]+'" y="'+m[2]+'" width="'+m[3]+'" height="'+m[4]+'" class="wv-b"/>'; if(m[5]) labs+='<span class="wv-lab" style="left:'+Math.min(78,Math.max(1,m[1]+0.8))+'%;top:'+Math.min(92,Math.max(1,m[2]+1))+'%">'+esc(m[5])+'</span>'; }
    else if(m[0]==="c"){ svg+='<ellipse cx="'+m[1]+'" cy="'+m[2]+'" rx="'+m[3]+'" ry="'+(m[3]*W.ar).toFixed(2)+'" class="wv-c"/>'; if(m[4]) labs+='<span class="wv-lab" style="left:'+Math.min(78,Math.max(1,m[1]+m[3]+1))+'%;top:'+Math.min(92,Math.max(1,m[2]-2))+'%">'+esc(m[4])+'</span>'; } }
  return '<span class="wov" aria-hidden="true"><svg viewBox="0 0 100 100" preserveAspectRatio="none">'+svg+'</svg>'+labs+'</span>'; }
function whyBlock(k){ const W=FRAME_WHY[k]; if(!W) return "";
  return '<div class="whyf"><button type="button" class="chip" data-whyf="1" aria-expanded="false">Why this frame works</button><ol class="whylist" hidden>'+W.why.map(t=>'<li>'+esc(t)+'</li>').join("")+'</ol></div>'; }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-whyf]"); if(!b) return; e.stopPropagation();
  const f=b.closest("figure"), l=b.parentNode.querySelector(".whylist"), on=!(f&&f.classList.contains("why")); if(f) f.classList.toggle("why",on); if(l) l.hidden=!on; b.setAttribute("aria-expanded",String(on)); b.textContent=on?"Hide the explanation":"Why this frame works"; },true);
/* Learn: every example photo, explained, one at a time. */
const whyKeys = () => Object.keys(FRAME_WHY).filter(k=>TECH_PHOTO[k]);
function learnWhy(){ const keys=whyKeys(), k=keys.includes(state.whySel)?state.whySel:keys[0], i=keys.indexOf(k);
  return '<div class="learnwhy"><p class="spothead">Example photos, explained</p>'+
    '<div class="wdeck"><button type="button" class="xr-b" data-whynav="-1" aria-label="Previous photo">‹</button><div class="wdeck-t"><b>'+esc(TECH[k][0])+'</b><span>'+(i+1)+' of '+keys.length+' · swipe the photo</span></div><button type="button" class="xr-b" data-whynav="1" aria-label="Next photo">›</button></div>'+
    '<div class="wdots" role="group" aria-label="Choose a photo">'+keys.map(x=>'<button type="button" data-whysel="'+x+'" aria-pressed="'+(x===k)+'" aria-label="'+esc(TECH[x][0])+'"></button>').join("")+'</div>'+
    photoDemo(k,null,true)+'</div>'; }

/* Assignments on location: start one and it runs with a timer (or a frame count) in a strip under the tabs, on every page and
   in Street mode, until you mark it done. Each finished run is logged with its date, length and nearest place. */
const DRILL_KIND = {"one-block":{min:60},"36":{frames:36},"no-zoom":{},"same-place":{visits:3},"colour":{},"backs":{},"closer":{},"night":{},"wait":{min:15},"five":{frames:0},"lightonly":{}};
state.drillRun=store.get("drillRun",null); state.drillLog=store.get("drillLog",[])||[];
const drillOf = id => DRILLS.find(d=>d[0]===id);
const mmss = s => { s=Math.max(0,Math.floor(s)); const h=Math.floor(s/3600), m=Math.floor(s%3600/60), x=s%60; return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(x).padStart(2,"0"); };
function drillNearPlace(){ if(!state.pos) return null; let best=null; for(const id of Object.keys(CITIES[state.city].places)){ const p=PLACES[id]; if(typeof p.lat!=="number") continue; const km=kmBetween(state.pos,p); if(km<1.2&&(!best||km<best[1])) best=[id,km]; } return best?best[0]:null; }
function drillStart(id){ state.drillRun={id,start:Date.now(),frames:0,buzzed:false}; if((DRILL_KIND[id]||{}).visits){ drillStop(true); return; } store.set("drillRun",state.drillRun); drillBar(); if(state.view==="learn") renderLearn(); }
function drillStop(done){ const r=state.drillRun; if(!r) return; if(done){ const K=DRILL_KIND[r.id]||{};
    state.drillLog.push({id:r.id,t:Date.now(),mins:Math.round((Date.now()-r.start)/6e4),frames:r.frames||0,place:drillNearPlace()}); if(state.drillLog.length>200) state.drillLog.shift(); store.set("drillLog",state.drillLog);
    const visits=K.visits?state.drillLog.filter(l=>l.id===r.id&&Date.now()-l.t<7*864e5).length:0;
    if(!K.visits||visits>=K.visits){ state.drills.add(r.id); store.set("drills",[...state.drills]); } }
  state.drillRun=null; store.set("drillRun",null); drillBar(); if(state.view==="learn") renderLearn(); if(state.street) renderStreet(); }
function drillLine(){ const r=state.drillRun; if(!r) return ""; const d=drillOf(r.id); if(!d) return ""; const K=DRILL_KIND[r.id]||{}, el=(Date.now()-r.start)/1000;
  const time=K.min?mmss(el)+' / '+K.min+':00':mmss(el), over=K.min&&el>=K.min*60, fr=K.frames!==undefined;
  return '<span class="dr-t"><b>'+esc(d[1])+'</b><span class="dr-time'+(over?' over':'')+'">'+time+(over?' · time is up':'')+'</span></span>'+
    (fr?'<button type="button" class="chip dr-fr" data-drillfr="1">+1 · '+(r.frames||0)+(K.frames?' of '+K.frames:'')+'</button>':'')+
    '<button type="button" class="chip primary" data-drilldone="1">Done</button><button type="button" class="dr-x" data-drillstop="1" aria-label="Stop without logging">×</button>'; }
function drillBar(){ const b=$("drillBar"); if(!b) return; const h=drillLine(); b.hidden=!h; if(h) b.innerHTML=h; }
setTimeout(()=>{ try{ drillBar(); }catch(e){} },0);
setInterval(()=>{ try{ const r=state.drillRun; if(!r) return; const K=DRILL_KIND[r.id]||{}; const t=document.querySelector("#drillBar .dr-time");
  if(t){ const el=(Date.now()-r.start)/1000, over=K.min&&el>=K.min*60; t.textContent=(K.min?mmss(el)+' / '+K.min+':00':mmss(el))+(over?' · time is up':''); t.classList.toggle("over",!!over);
    if(over&&!r.buzzed){ r.buzzed=true; store.set("drillRun",r); try{ navigator.vibrate&&navigator.vibrate([200,100,200]); }catch(e){} } }
  const s=document.querySelector("#street .st-drill .dr-time"); if(s&&t) s.textContent=t.textContent; }catch(e){} },1000);
document.addEventListener("click",e=>{ const t=e.target.closest&&e.target.closest("[data-drillfr],[data-drilldone],[data-drillstop],[data-drillstart]"); if(!t) return; e.stopPropagation();
  if(t.dataset.drillstart){ drillStart(t.dataset.drillstart); return; }
  if(t.dataset.drillfr){ const r=state.drillRun; if(!r) return; r.frames=(r.frames||0)+1; store.set("drillRun",r); drillBar(); if(state.street) renderStreet(); return; }
  if(t.dataset.drilldone){ drillStop(true); return; } if(t.dataset.drillstop){ drillStop(false); return; } },true);
function learnDrills(){ const r=state.drillRun, fmt=t=>new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"});
  const rows=DRILLS.map(([id,t,d])=>{ const on=state.drills.has(id), log=state.drillLog.filter(l=>l.id===id), last=log[log.length-1], K=DRILL_KIND[id]||{};
    const vis=K.visits?state.drillLog.filter(l=>l.id===id&&Date.now()-l.t<7*864e5).length:0;
    const meta=(log.length?'Done '+log.length+'× · last '+fmt(last.t)+(last.mins?', '+last.mins+' min':'')+(last.frames?', '+last.frames+' frames':'')+(last.place?' at '+esc(PLACES[last.place].name):''):'')+(K.visits?(log.length?' · ':'')+vis+' of '+K.visits+' visits this week':'');
    return '<li><label><input type="checkbox" data-drill="'+id+'"'+(on?" checked":"")+'><span><b>'+esc(t)+'</b>'+esc(d)+(meta?'<em class="drmeta">'+meta+'</em>':'')+'</span></label>'+
      (r&&r.id===id?'<span class="pill">Running</span>':'<button type="button" class="chip" data-drillstart="'+id+'">'+(K.visits?'Log a visit':K.min?'Start · '+K.min+' min':'Start')+'</button>')+'</li>'; }).join("");
  return '<p class="hint">Start an assignment when you are out: it stays at the top of every page with a timer'+' (and a frame counter where it counts frames) until you tap Done.</p><ul class="drills drills2">'+rows+'</ul><p class="hint">'+state.drills.size+' of '+DRILLS.length+' done.</p>'; }
/* Street cameras compared. Dimensions and weights are as published (with battery where the maker says so); prices are US launch prices. */
const STREET_CAMS = [["q343", "Leica Q3 43", "Fixed lens", "Full frame, 60 MP", "43 mm f/2", "In the lens", "Electronic", "IP52", 130, 80.3, 97.6, 772, "$6,395", "2024", "The one you own. Long for a street lens: you work from 2 to 5 m and frame tighter scenes. Leica Store Miami now lists it at $7,950."], ["q328", "Leica Q3", "Fixed lens", "Full frame, 60 MP", "28 mm f/1.7", "In the lens", "Electronic", "IP52", 130, 80.3, 92.6, 743, "$5,995", "2023", "The classic wide street lens. Zone focusing covers almost everything at f/8, and crops to 35, 50, 75 and 90 mm."], ["x100vi", "Fujifilm X100VI", "Fixed lens", "APS-C, 40 MP", "35 mm f/2", "In the body", "Optical and electronic", "With adapter ring and filter", 128, 75, 55, 521, "$1,599", "2024", "The most popular street camera of recent years. Hybrid finder shows the frame with the world around it. Long waits at launch."], ["griv", "Ricoh GR IV", "Fixed lens", "APS-C, 26 MP", "28 mm f/2.8", "In the body", "None (screen only)", "No", 109, 61, 33, 262, "$1,499", "2025", "Fits a jacket pocket. Snap focus jumps to a preset distance with one press, made for zone focusing."], ["griiix", "Ricoh GR IIIx", "Fixed lens", "APS-C, 24 MP", "40 mm f/2.8", "In the body", "None (screen only)", "No", 109.4, 61.9, 35.2, 262, "$999", "2021", "The pocket GR with a focal length close to your 43 mm. Same snap focus."], ["rx1r3", "Sony RX1R III", "Fixed lens", "Full frame, 61 MP", "35 mm f/2", "None", "Electronic (pop-up)", "Not stated", 113.3, 67.9, 87.5, 498, "$5,099", "2025", "Full frame in a body much smaller than the Q3. Fast Sony autofocus with subject detection."], ["xe5", "Fujifilm X-E5 with XF 23mm f/2.8", "Interchangeable", "APS-C, 40 MP", "35 mm f/2.8 (kit lens)", "In the body", "Electronic", "Lens only", 124.9, 72.9, 62.1, 535, "$1,899", "2025", "Rangefinder-style body with a pancake lens. Depth and weight here include the 23 mm lens."], ["m11", "Leica M11 (body only)", "Interchangeable", "Full frame, 60 MP", "Any M lens", "None", "Optical rangefinder", "Not stated", 139, 80, 39, 640, "$8,995", "2022", "Manual focus through a rangefinder. Add a lens: a 35 mm Summicron adds roughly 25 mm of depth and 250 g."], ["a7c2", "Sony A7C II (body only)", "Interchangeable", "Full frame, 33 MP", "Any Sony E lens", "In the body", "Electronic", "Dust and moisture resistant", 124, 71, 63, 514, "$2,199", "2023", "Compact full-frame body with the widest lens choice. Add a small prime for street."]];
const CAM_ROWS = [["Type",2],["Sensor",3],["Lens (35 mm eq.)",4],["Stabilizer",5],["Viewfinder",6],["Sealing",7],["Size (W × H × D)",-1],["Weight",11],["Launch price",12]];
const CAM_COLORS = ["var(--yellow)","var(--blue)","var(--red)"];
/* The lens on each camera: real focal length, widest aperture, sensor crop factor. Body-only cameras are shown with a 35 mm f/2. */
const CAM_LENS = {q343:[43,2,1],q328:[28,1.7,1],x100vi:[23,2,1.53],griv:[18.3,2.8,1.53],griiix:[26.1,2.8,1.53],rx1r3:[35,2,1],xe5:[23,2.8,1.53],m11:[35,2,1,1],a7c2:[35,2,1,1]};
const camEq = id => { const L=CAM_LENS[id]; return Math.round(L[0]*L[2]); };
// Depth of field for a sensor: the circle of confusion shrinks with the sensor
function dofCam(f,N,s,crop){ const c=0.03/crop, H=f*f/(N*c)+f, d=s*1000; return [d*(H-f)/(H+d-2*f)/1000, d<H?d*(H-f)/(H-d)/1000:Infinity]; }
const PHONE = ["iPhone 16 Pro",71.5,149.6,8.25];
function camFig(view,list){ const pad=8, gap=14, k=1.15, phone=view==="front", hs=list.map(c=>view==="front"?c[9]:c[10]), h=Math.max(...hs,phone?PHONE[2]:0);
  let x=pad, out=""; list.forEach((c,n)=>{ const w=c[8]*k, hh=hs[n]*k, y=pad+(h*k-hh), L=CAM_LENS[c[0]]||[35,2,1];
    out+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="'+(view==="front"?6:4)+'" class="cam-body" style="stroke:'+CAM_COLORS[n]+'"/>';
    if(view==="front"){ const r=Math.min(w,hh)*(L[2]>1?0.26:0.33); out+='<circle cx="'+(x+w*0.6).toFixed(1)+'" cy="'+(y+hh*0.56).toFixed(1)+'" r="'+r.toFixed(1)+'" class="cam-lens"/><circle cx="'+(x+w*0.6).toFixed(1)+'" cy="'+(y+hh*0.56).toFixed(1)+'" r="'+(r*0.55).toFixed(1)+'" class="cam-glass"/>'+
      (/None/.test(c[6])?'':'<rect x="'+(x+w*0.08).toFixed(1)+'" y="'+(y+hh*0.12).toFixed(1)+'" width="'+(w*0.16).toFixed(1)+'" height="'+(hh*0.16).toFixed(1)+'" rx="2" class="cam-vf"/>'); }
    out+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(pad+h*k+18).toFixed(1)+'" text-anchor="middle" class="cam-dim">'+Math.round(c[8])+' × '+Math.round(hs[n])+' mm</text>';
    x+=w+gap; });
  if(phone){ const w=PHONE[1]*k, hh=PHONE[2]*k, y=pad+(h*k-hh); out+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="12" class="cam-phone"/><text x="'+(x+w/2).toFixed(1)+'" y="'+(pad+h*k+18).toFixed(1)+'" text-anchor="middle" class="cam-dim">iPhone</text>'; x+=w+gap; }
  return '<svg class="camfig" viewBox="0 0 '+(x-gap+pad).toFixed(0)+' '+(h*k+pad+26).toFixed(0)+'" role="img" aria-label="'+(view==="front"?"Front":"Top")+' view to scale">'+out+'</svg>'; }
// What each lens sees: one street, drawn as a 24 mm view, with each camera's frame on it
function camSees(sel){ let s='<svg class="camfov" viewBox="0 0 150 100" role="img" aria-label="What each lens sees, on the same street">'+cropScene(24)+'<rect x="1" y="1" width="148" height="98" class="d-frame"/>';
  sel.map((c,n)=>[c,n,camEq(c[0])]).sort((a,b)=>a[2]-b[2]).forEach(([c,n,eq],k)=>{ const w=150*24/eq, h=100*24/eq, x=75-w/2, y=50-h/2;
    s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="none" stroke="'+CAM_COLORS[n]+'" stroke-width="1.3"'+(k%2?' stroke-dasharray="3 1.5"':'')+'/>'+
      '<text x="'+(x+1.5).toFixed(1)+'" y="'+(y+h-1.8).toFixed(1)+'" class="camfov-t" style="fill:'+CAM_COLORS[n]+'">'+eq+' mm</text>'; });
  return s+'</svg>'; }
// Side-by-side bars for the things that differ most on the street
function camBars(sel){ const row=(title,sub,vals,fmt,max,lowGood)=>'<div class="cb"><div class="cb-h"><b>'+title+'</b><span>'+sub+'</span></div>'+vals.map((v,n)=>'<div class="cb-r"><span class="cb-n">'+esc(sel[n][1].replace(/ \(body only\)| with XF.*$/,''))+'</span><span class="cb-t"><i style="width:'+Math.max(3,Math.min(100,v/max*100)).toFixed(1)+'%;background:'+CAM_COLORS[n]+'"></i></span><span class="cb-v">'+fmt(v,n)+'</span></div>').join("")+'</div>';
  const body=n=>CAM_LENS[sel[n][0]]&&CAM_LENS[sel[n][0]][3];
  const vol=sel.map(c=>c[8]*c[9]*c[10]/1000), wt=sel.map(c=>c[11]);
  const zone=sel.map(c=>{ const L=CAM_LENS[c[0]]||[35,2,1]; return dofCam(L[0],8,3,L[2]); });
  const eqN=sel.map(c=>{ const L=CAM_LENS[c[0]]||[35,2,1]; return L[1]*L[2]; });
  const zoneRow='<div class="cb"><div class="cb-h"><b>Zone focusing</b><span>Sharp at f/8, focused at 3 m. Wider is more forgiving.</span></div>'+zone.map(([a,b],n)=>{ const p=x=>Math.min(100,x/15*100);
    return '<div class="cb-r"><span class="cb-n">'+esc(sel[n][1].replace(/ \(body only\)| with XF.*$/,''))+'</span><span class="cb-t cb-z"><i style="left:'+p(a).toFixed(1)+'%;width:'+Math.max(2,(b===Infinity?100:p(b))-p(a)).toFixed(1)+'%;background:'+CAM_COLORS[n]+'"></i><em style="left:20%"></em></span><span class="cb-v">'+(+a.toFixed(1))+'–'+(b===Infinity||b>50?'∞':Math.round(b))+' m</span></div>'; }).join("")+'<div class="cb-scale"><span>0</span><span>3 m</span><span>15 m+</span></div></div>';
  return '<div class="cbars">'+
    row('Size','Volume of the outer box, lens included where fixed.',vol,(v,n)=>Math.round(v)+' cm³'+(body(n)?' + lens':''),Math.max(...vol,1100))+
    row('Weight','With battery.',wt,(v,n)=>v+' g'+(body(n)?' + lens':''),Math.max(...wt,800))+
    zoneRow+
    row('Light and background blur','The lens’s widest aperture as it would look on full frame. Lower lets in more light and softens more.',eqN.map(v=>Math.max(0.15,Math.log2(64/(v*v)))),(v,n)=>'f/'+(+eqN[n].toFixed(1)),5)+
    '</div>'; }
function learnCams(){ const ids=state.camCmp.filter(id=>STREET_CAMS.some(c=>c[0]===id)), sel=ids.map(id=>STREET_CAMS.find(c=>c[0]===id));
  const chips='<div class="campick" role="group" aria-label="Choose up to three cameras">'+STREET_CAMS.map(c=>{ const n=ids.indexOf(c[0]); return '<button type="button" class="chip" data-campick="'+c[0]+'" aria-pressed="'+(n>=0)+'"'+(n>=0?' style="--sw:'+CAM_COLORS[n]+'"':'')+'>'+(n>=0?'<span class="swatch" style="background:'+CAM_COLORS[n]+'"></span>':'')+esc(c[1].replace(/ \(body only\)| with XF.*$/,''))+'<small>'+camEq(c[0])+' mm</small></button>'; }).join("")+'</div>';
  const anyBody=sel.some(c=>CAM_LENS[c[0]]&&CAM_LENS[c[0]][3]);
  return '<div class="camcmp"><p class="camcap">Pick up to three. Tapping a fourth replaces the last one.</p>'+chips+
    (sel.length?
      '<div class="camviews"><span class="label">What each lens sees, from the same spot</span>'+camSees(sel)+
        '<span class="label">Front, to scale, next to an iPhone</span>'+camFig("front",sel)+'<span class="label">Top, to scale (depth includes the lens)</span>'+camFig("top",sel)+'</div>'+
      camBars(sel)+
      (anyBody?'<p class="hint">Body-only cameras are shown with a 35 mm f/2 lens for what they see, zone focusing and light; their size and weight are for the body alone.</p>':'')+
      '<ul class="camnotes">'+sel.map((c,n)=>'<li><span class="swatch" style="background:'+CAM_COLORS[n]+'"></span><span><b>'+esc(c[1])+'.</b> '+esc(c[14])+'</span></li>').join("")+'</ul>'+
      '<details class="camspecs"><summary>All specifications</summary><div class="camtable" style="--n:'+sel.length+'"><div class="camrow camhead"><span></span>'+sel.map((c,n)=>'<b style="border-color:'+CAM_COLORS[n]+'">'+esc(c[1])+'</b>').join("")+'</div>'+
        CAM_ROWS.map(([lab,i])=>'<div class="camrow"><span>'+lab+'</span>'+sel.map(c=>'<span>'+esc(i===-1? c[8]+' × '+c[9]+' × '+c[10]+' mm' : i===11? c[11]+' g' : i===12? c[12]+' ('+c[13]+')' : String(c[i]))+'</span>').join("")+'</div>').join("")+'</div></details>'
      :'<p class="hint">Choose up to three cameras.</p>')+
    '<p class="hint">Sizes and weights are as published by the maker or a major retailer; shapes are simplified to their outer dimensions. Zone focusing uses each sensor’s own circle of confusion (0.03 mm on full frame, 0.02 mm on APS-C). Prices are US launch prices and have changed since, Leica’s especially.</p></div>'; }

/* Camera prices and deals. Data: one document per camera (and "_status") written by the twice-weekly check, in the Claude
   database (collection "prices") or prices.json for the installed app. Alert prices live in the Claude database ("pricetargets"),
   where the check reads them; the installed app shows them from prices.json and sends you to the Claude version to change them. */
const PRICE_URL = "https://claude.ai/artifact/JKnohFewRg9peoe8PQ5Ldf";
const usd = v => v==null||isNaN(v) ? "" : "$"+Math.round(v).toLocaleString("en-US");
const priceNewBest = d => d&&d.deal&&d.deal.price ? d.deal.price : d&&d.new&&d.new.price ? d.new.price : null;
// The price an alert is about, and whether it is at or below the target
function priceHit(id){ const t=PRICE_TARGETS[id], d=PRICE_DOCS[id]; if(!t||!t.target||!d) return null;
  const nw=priceNewBest(d), us=d.used&&d.used.low, opts=[];
  if(t.kind!=="used"&&nw) opts.push({kind:"new",price:nw,seller:(d.deal||d.new).seller,url:(d.deal||d.new).url});
  if(t.kind!=="new"&&us) opts.push({kind:"used",price:us,seller:d.used.seller,url:d.used.url});
  if(t.kind!=="new"&&d.ebay&&d.ebay.low) opts.push({kind:"used",price:d.ebay.low,seller:"eBay",url:d.ebay.url});
  const best=opts.sort((a,b)=>a.price-b.price)[0]; return best&&best.price<=t.target ? Object.assign(best,{target:t.target}) : null; }
const camName = id => { const c=STREET_CAMS.find(x=>x[0]===id); return c?c[1].replace(/ \(body only\)| with XF.*$/,''):id; };
function priceSpark(h){ if(!h||h.length<2) return "";
  const pts=h.slice(-26), vals=pts.flatMap(p=>[p.new,p.used]).filter(v=>v>0); if(vals.length<2) return "";
  const lo=Math.min(...vals), hi=Math.max(...vals), span=Math.max(1,hi-lo), X=i=>4+i*(232/(pts.length-1)), Y=v=>50-(v-lo)/span*40;
  const line=k=>{ const p=pts.map((q,i)=>q[k]>0?[X(i),Y(q[k])]:null).filter(Boolean); return p.length>1?'<path d="M'+p.map(a=>a[0].toFixed(1)+' '+a[1].toFixed(1)).join('L')+'" class="ps-'+k+'"/>':''; };
  return '<svg class="pspark" viewBox="0 0 240 58" role="img" aria-label="Price history"><path d="M4 50H236" class="ps-ax"/>'+line("new")+line("used")+
    '<text x="236" y="8" text-anchor="end" class="ps-t">'+usd(hi)+'</text><text x="236" y="57" text-anchor="end" class="ps-t">'+usd(lo)+'</text><text x="4" y="57" class="ps-t">'+esc(fmtShort(pts[0].d))+'</text></svg>'; }
const fmtShort = d => { try{ const x=new Date(d+"T12:00:00"); return x.toLocaleDateString("en-US",{month:"short",day:"numeric"}); }catch(e){ return d; } };
// The best used price anywhere, and where
function priceUsedBest(d){ const o=[]; if(d.used&&d.used.low) o.push({p:d.used.low,src:d.used.seller||"Dealer",url:d.used.url}); if(d.ebay&&d.ebay.low) o.push({p:d.ebay.low,src:"eBay",url:d.ebay.url}); return o.sort((a,b)=>a.p-b.p)[0]||null; }
const priceDisc = d => !(d.new&&d.new.price) && /discontinued|no longer (available|sold)/i.test((d.notes||"")+(d.tip||""));
function priceBadges(id,d){ const b=[], nw=priceNewBest(d), ub=priceUsedBest(d), st=(d.new&&d.new.stock)||"";
  if(d.deal&&d.deal.price) b.push(["deal","Deal"+(d.deal.ends?" until "+fmtShort(d.deal.ends):"")]);
  if(priceDisc(d)) b.push(["muted","Discontinued new"]);
  else if(/back.?order|pre.?order/i.test(st)) b.push(["warn","Backordered"]); else if(/out of stock|unavailable/i.test(st)) b.push(["warn","Out of stock"]);
  if(nw&&ub&&ub.p>nw) b.push(["warn","Used costs more than new"]);
  if(ub&&ub.src==="eBay"&&d.used&&d.used.low) b.push(["info","Cheapest on eBay"]);
  return b; }
// Change since the previous check, from the history the price check keeps
function priceDelta(d){ const h=(d.history||[]).filter(p=>p&&p.d); if(h.length<2) return null; const a=h[h.length-2], b=h[h.length-1], u=p=>Math.min(p.used||Infinity,p.eb||Infinity);
  const dn=a.new&&b.new?b.new-a.new:0, du=isFinite(u(a))&&isFinite(u(b))?u(b)-u(a):0; return {dn,du,since:a.d}; }
const deltaTag = v => !v||Math.abs(v)<1 ? '' : '<i class="pd '+(v<0?'dn':'up')+'">'+(v<0?'▼':'▲')+usd(Math.abs(v)).replace('$','$')+'</i>';
// One line for each camera: launch, new, dealers' used range, eBay range and sold, on one scale
function priceScale(c,d){ const launch=+String(c[12]).replace(/[^0-9]/g,"")||null, nw=d.new&&d.new.price, dl=d.deal&&d.deal.price, us=d.used, eb=d.ebay, so=d.sold;
  const lanes=[["New",nw||dl?[dl||nw]:null,dl?"deal":"new",dl&&nw?usd(dl)+' (was '+usd(nw)+')':usd(dl||nw)],
    ["Used, dealers",us&&us.low?[us.low,us.high||us.low]:null,"used",us&&us.low?usd(us.low)+(us.high&&us.high>us.low?'–'+usd(us.high):''):''],
    ["Used, eBay",eb&&eb.low?[eb.low,eb.high||eb.low]:null,"ebay",eb&&eb.low?usd(eb.low)+(eb.high&&eb.high>eb.low?'–'+usd(eb.high):''):''],
    ["Sold, eBay",so&&so.median?[so.median]:null,"sold",so&&so.median?usd(so.median):'']].filter(l=>l[1]);
  if(!lanes.length) return "";
  const vals=lanes.flatMap(l=>l[1]).concat(launch?[launch]:[]), lo=Math.min(...vals)*0.94, hi=Math.max(...vals)*1.04, X=v=>(84+(v-lo)/(hi-lo)*206).toFixed(1), H=lanes.length*22+18;
  let g='';
  lanes.forEach(([lab,v,k,txt],n)=>{ const y=14+n*22; g+='<text x="0" y="'+(y+4)+'" class="psc-l">'+lab+'</text><path d="M84 '+y+'H290" class="psc-ax"/>';
    if(v.length===2&&v[1]>v[0]) g+='<path d="M'+X(v[0])+' '+y+'H'+X(v[1])+'" class="psc-r '+k+'"/>';
    g+='<circle cx="'+X(v[0])+'" cy="'+y+'" r="4.5" class="psc-d '+k+'"/>';
    const mid=(+X(v[0])+ +X(v[v.length-1]))/2, half=txt.length*2.6+2; g+='<text x="'+Math.min(290-half,Math.max(84+half,mid)).toFixed(1)+'" y="'+(y-6)+'" class="psc-v" text-anchor="middle">'+txt+'</text>'; });
  if(launch){ const x=X(launch); g+='<path d="M'+x+' 4V'+(H-12)+'" class="psc-lnch"/><text x="'+x+'" y="'+(H-2)+'" text-anchor="middle" class="psc-lt">launch '+usd(launch)+'</text>'; }
  return '<svg class="pscale" viewBox="0 0 300 '+H+'" role="img" aria-label="Prices on one scale">'+g+'</svg>'; }
function priceRow(c){ const id=c[0], d=PRICE_DOCS[id]||{}, hit=priceHit(id), nw=priceNewBest(d), ub=priceUsedBest(d), del=priceDelta(d), open=state.priceOpen===id;
  const save=nw&&ub?Math.round((1-ub.p/nw)*100):null, rowB=priceBadges(id,d).filter(b=>b[0]!=="info");
  const row='<button type="button" class="pr-row" data-popen="'+id+'" aria-expanded="'+open+'">'+
    '<span class="pr-name"><b>'+esc(camName(id).replace(/-/g,"\u2011"))+'</b></span>'+
    '<span class="pr-p">'+(nw?usd(nw):priceDisc(d)?'<em>not sold</em>':'—')+deltaTag(del&&del.dn)+'</span>'+
    '<span class="pr-p">'+(ub?usd(ub.p)+'<small>'+esc(ub.src)+'</small>':'—')+deltaTag(del&&del.du)+'</span>'+
    '<span class="pr-s'+(save!=null&&save<0?' neg':'')+'">'+(save==null?'':(save>0?'−':'+')+Math.abs(save)+'%')+'</span><span class="go" aria-hidden="true">'+(open?'⌃':'⌄')+'</span>'+
    (hit||rowB.length?'<span class="pr-badges">'+(hit?'<i class="pb hit">At your alert</i>':'')+rowB.map(([k,t])=>'<i class="pb '+k+'">'+esc(t)+'</i>').join("")+'</span>':'')+'</button>';
  return '<article class="pc'+(hit?' hit':'')+(d.deal&&d.deal.price?' deal':'')+(open?' open':'')+'" data-pc="'+id+'">'+row+(open?priceDetail(c,d,hit):'')+'</article>'; }
function priceDetail(c,d,hit){ const id=c[0], t=PRICE_TARGETS[id], nw=d.new, dl=d.deal, us=d.used, eb=d.ebay, so=d.sold, badges=priceBadges(id,d);
  const links=[[nw&&nw.url,(nw&&nw.seller)||"New"],[dl&&dl.url&&dl.url!==(nw&&nw.url)?dl.url:null,((dl&&dl.seller)||"The")+" offer"],[us&&us.url,(us&&us.seller)||"Used"],[eb&&eb.url,"eBay listings"],[so&&so.url,"eBay sold"]].filter(x=>x[0]&&/^https:\/\//.test(x[0]));
  const facts=[nw&&nw.price?'New at '+esc(nw.seller||'a dealer')+(nw.stock?' ('+esc(nw.stock.toLowerCase())+')':''):null, dl&&dl.price?esc(dl.what||'Offer')+' at '+esc(dl.seller||'')+(dl.ends?', until '+fmtShort(dl.ends):''):null,
    us&&us.low?esc(us.seller||'Dealer')+': '+(us.n?us.n+' used, ':'')+(us.cond?'lowest '+esc(us.cond.toLowerCase()):''):null, eb&&eb.low?'eBay: '+(eb.n?eb.n+' listings':'listings')+(eb.cond?', lowest '+esc(eb.cond.toLowerCase()):'')+'; no dealer warranty':null,
    so&&so.median?'eBay sold: median of '+(so.n||'recent')+' sales':null].filter(Boolean);
  let alert;
  if(PRICE_DB) alert='<div class="pc-al"><label>Alert at <span class="pc-in">$<input type="number" inputmode="numeric" min="0" step="50" value="'+(t&&t.target?t.target:'')+'" data-ptin="'+id+'" aria-label="Alert price for '+esc(camName(id))+'"></span></label>'+
      '<select data-ptkind="'+id+'" aria-label="New or used">'+[["any","New or used"],["new","New only"],["used","Used only"]].map(([v,l])=>'<option value="'+v+'"'+((t&&t.kind||"any")===v?' selected':'')+'>'+l+'</option>').join("")+'</select>'+
      '<button type="button" class="chip" data-ptsave="'+id+'">'+(t&&t.target?'Update':'Set alert')+'</button>'+(t&&t.target?'<button type="button" class="linkbtn" data-ptclear="'+id+'">Remove</button>':'')+'</div>';
  else alert='<div class="pc-al ro">'+(t&&t.target?'Alert at <b>'+usd(t.target)+'</b> ('+({any:"new or used",new:"new only",used:"used only"}[t.kind||"any"])+'). ':'No alert set. ')+'<a href="'+PRICE_URL+'" target="_blank" rel="noopener">'+(t&&t.target?'Change':'Set one')+' in the Claude version ↗</a></div>';
  return '<div class="pc-d">'+(hit?'<p class="pc-hit">At or below your alert: '+hit.kind+' '+usd(hit.price)+(hit.seller?' at '+esc(hit.seller):'')+'</p>':'')+
    (badges.some(b=>b[0]==="info")?'<p class="pr-badges all">'+badges.filter(b=>b[0]==="info").map(([k,tx])=>'<i class="pb '+k+'">'+esc(tx)+'</i>').join("")+'</p>':'')+
    priceScale(c,d)+
    (d.tip?'<p class="pc-tip"><b>Good to know.</b> '+esc(d.tip)+'</p>':'')+
    (facts.length?'<ul class="pc-facts">'+facts.map(f=>'<li>'+f+'</li>').join("")+'</ul>':'')+
    (d.history&&d.history.length>1?'<div class="pc-h">'+priceSpark(d.history)+'<span class="pc-key"><i class="k-new"></i>New <i class="k-used"></i>Used from</span></div>':'')+
    alert+(links.length?'<p class="pc-links">'+links.map(([u,l])=>'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(l)+' ↗</a>').join("")+'</p>':'')+
    (d.notes?'<details class="pc-more"><summary>Research details</summary><p>'+esc(d.notes)+'</p></details>':'')+'</div>'; }
// This week: what changed across the cameras since the previous check
function priceWeek(){ const out=[]; let dn=0, up=0;
  STREET_CAMS.forEach(c=>{ const d=PRICE_DOCS[c[0]]; if(!d) return; const x=priceDelta(d); if(x){ if(x.dn<0||x.du<0) dn++; if(x.dn>0||x.du>0) up++; } });
  const deals=STREET_CAMS.filter(c=>(PRICE_DOCS[c[0]]||{}).deal).length, ev=(PRICE_DOCS._status||{}).changes;
  if(dn) out.push(dn+' price'+(dn>1?'s':'')+' down'); if(up) out.push(up+' up'); if(Array.isArray(ev)) out.push(...ev.slice(0,3)); if(!out.length&&deals) out.push(deals+' deal'+(deals>1?'s':'')+' on now');
  return out; }
function learnPrices(){ const st=PRICE_DOCS._status, have=STREET_CAMS.some(c=>PRICE_DOCS[c[0]]);
  if(!have) return '<div class="prices"><p class="hint">'+(PRICE_FILE||PRICE_DB?'No prices yet. The first check fills this in.':'Prices load from the app’s data; open the installed app or the Claude version to see them.')+'</p></div>';
  const cams=STREET_CAMS.slice().sort((a,b)=>(!!priceHit(b[0])-!!priceHit(a[0]))||(!!(PRICE_DOCS[b[0]]||{}).deal-!!(PRICE_DOCS[a[0]]||{}).deal));
  const wk=priceWeek(), first=!STREET_CAMS.some(c=>priceDelta(PRICE_DOCS[c[0]]||{}));
  return '<div class="prices"><div class="pr-top"><span>'+(st&&st.checked?'Checked '+esc(fmtShort(st.checked)):'Checked recently')+' · updates Tuesdays and Fridays</span></div>'+
    '<p class="pr-week"><b>'+(first?'First check.':'Since the last check:')+'</b> '+(first?'Changes show here from the next one.':esc(wk.join(' · ')||'no price changes'))+'</p>'+
    '<div class="pr-board"><div class="pr-head"><span>Camera</span><span>New</span><span>Best used</span><span>Save</span><span></span></div>'+cams.map(priceRow).join("")+'</div>'+
    '<p class="hint">Tap a camera for its price scale, sellers and alert. Prices in US dollars before tax: new from authorised dealers, used from MPB and KEH (with a dealer warranty) and eBay (without). Each was read from the seller’s page on the day checked; confirm before you buy. Not financial advice.</p></div>'; }
// Today: a card when a camera is at or below your alert price
function priceTodayCard(){ const hits=STREET_CAMS.map(c=>[c[0],priceHit(c[0])]).filter(x=>x[1]); if(!hits.length) return "";
  return '<section class="tcard tdeal"><p class="tlabel">Camera deal</p>'+hits.slice(0,3).map(([id,h])=>'<p class="msg"><b>'+esc(camName(id))+'</b>: '+h.kind+' '+usd(h.price)+(h.seller?' at '+esc(h.seller):'')+' (your alert '+usd(h.target)+')</p>').join("")+
    '<button type="button" class="chip" data-gotoprices="1">See prices</button></section>'; }
async function priceSave(id,box){ const inp=box.querySelector('[data-ptin="'+id+'"]'), kind=box.querySelector('[data-ptkind="'+id+'"]').value, v=Math.round(+inp.value);
  if(!PRICE_DB) return; if(!(v>0)){ inp.focus(); return; }
  const prev=PRICE_TARGETS[id]; PRICE_TARGETS[id]={target:v,kind,at:new Date().toISOString()}; rerenderPrices();
  try{ await PRICE_DB.collection("pricetargets").doc(id).set({target:v,kind,at:new Date().toISOString()}); }
  catch(e){ if(prev) PRICE_TARGETS[id]=prev; else delete PRICE_TARGETS[id]; rerenderPrices(); const c=document.querySelector('.pc[data-pc="'+id+'"] .pc-al'); if(c) c.insertAdjacentHTML("beforeend",'<span class="pc-err">Could not save: '+esc(e&&e.code||"error")+'</span>'); } }
async function priceClear(id){ if(!PRICE_DB) return; const prev=PRICE_TARGETS[id]; delete PRICE_TARGETS[id]; rerenderPrices();
  try{ await PRICE_DB.collection("pricetargets").doc(id).delete(); }catch(e){ if(prev) PRICE_TARGETS[id]=prev; rerenderPrices(); } }
function rerenderPrices(){ const b=document.querySelector(".prices"); if(b) b.outerHTML=learnPrices(); if(state.view==="today") renderToday(); }
// Small line icons, one per lesson
const LICON = {exposure:'<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5 15 11M20.4 11.3 13.4 14.5M15.9 19.5 10 13.6M4.6 15.4 10.5 10.5M6.9 5.2 12.6 9"/>',
  focus:'<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1.5V5M12 19v3.5M1.5 12H5M19 12h3.5"/>',
  compose:'<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M9 4.5v15M15 4.5v15M3 9.5h18M3 14.5h18"/>',
  light:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  people:'<circle cx="9" cy="7.5" r="3"/><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20"/><circle cx="17" cy="9" r="2.3"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5V20"/>',
  practice:'<rect x="4.5" y="3.5" width="15" height="17" rx="2"/><path d="M8 8.5l1.5 1.5 3-3M8 14.5l1.5 1.5 3-3M14.5 9h2M14.5 15h2"/>',
  edit:'<rect x="6.5" y="3.5" width="14" height="11" rx="1.5"/><path d="M3.5 7.5v12h14"/><path d="M9 12l3-3.5 2.5 2.5 1.5-1.5 2.5 2.5"/>',
  camera:'<path d="M4 6.5h16M4 12h16M4 17.5h16"/><circle cx="9" cy="6.5" r="1.8"/><circle cx="15.5" cy="12" r="1.8"/><circle cx="7.5" cy="17.5" r="1.8"/>',
  cameras:'<rect x="2.5" y="7" width="19" height="12.5" rx="2"/><path d="M8 7l1.5-2.5h5L16 7"/><circle cx="12" cy="13.2" r="3.6"/>',
  prices:'<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8.5 8.5-9 9z"/><circle cx="8.5" cy="8.5" r="1.6"/>'};
const licon = (id,cls) => '<span class="lic'+(cls?' '+cls:'')+'" aria-hidden="true"><svg viewBox="0 0 24 24">'+(LICON[id]||LICON.compose)+'</svg></span>';
// Where each lesson's interactive part is, for the jump bar
const LPARTS = {exposure:[[".xp","Simulator"]],focus:[[".zf","Zone scene"]],compose:[[".tgrid","Techniques"],[".learnwhy","Example photos"]],light:[[".lightlist","Kinds of light"]],
  camera:[[".cropw","Crop frames"]],cameras:[[".camcmp","Compare"]],prices:[[".prices","Prices"]],practice:[[".drills2","Assignments"]]};
const learnSeen = () => new Set(store.get("learnSeen",[])||[]);
const learnGroupOf = id => LEARN_GROUPS.find(g=>g[2].includes(id));
function learnMeta(L){ const words=[...L.body,...L.points,L.try||""].join(" ").split(/\s+/).length, min=Math.max(1,Math.round(words/200+(LPARTS[L.id]?1:0)));
  return min+' min'+(LPARTS[L.id]?' · Interactive':''); }
function openLearn(id,sel){ state.view="learn"; state.learnId=LEARN.some(L=>L.id===id)?id:null; render();
  requestAnimationFrame(()=>{ const t=sel&&document.querySelector('#learn '+sel); if(t) t.scrollIntoView({block:"start"}); else window.scrollTo({top:0}); }); }
function renderLearn(){ const box=$("learn"), L=state.learnId&&LEARN.find(x=>x.id===state.learnId);
  if(!L){ box.innerHTML=learnHome(); return; }
  const seen=learnSeen(); if(!seen.has(L.id)){ seen.add(L.id); store.set("learnSeen",[...seen]); } store.set("learnLast",L.id);
  const i=LEARN.indexOf(L), prev=LEARN[i-1], next=LEARN[i+1], g=learnGroupOf(L.id);
  const parts=[[".lessonbody>p","Intro"]].concat(LPARTS[L.id]||[]).concat(L.points.length?[[".lpoints","Key points"]]:[]).concat(L.try?[[".ltry","Try this"]]:[]);
  box.innerHTML='<article class="lesson lpage" data-id="'+L.id+'">'+
    '<div class="lbar"><div class="lbar-top"><button type="button" class="lback" data-lhome="1">‹ All lessons</button><span class="lpos">'+(i+1)+' of '+LEARN.length+'</span></div>'+
      (parts.length>2?'<div class="ljump" role="navigation" aria-label="Jump to">'+parts.map(([sel,lab])=>'<button type="button" class="chip" data-ljump="'+sel+'">'+lab+'</button>').join("")+'</div>':'')+'</div>'+
    '<header class="lhead">'+licon(L.id,"big")+'<div><span class="lgrp">'+esc(g?g[0]:"")+' · Lesson '+L.n+'</span><h2>'+esc(L.title)+'</h2><p>'+esc(L.sub)+'</p><span class="lmeta">'+learnMeta(L)+'</span></div></header>'+
    '<div class="lessonbody">'+L.body.map(p=>'<p>'+esc(p)+'</p>').join("")+
      (L.id==="exposure"?learnExpo():'')+(L.id==="camera"?learnCrop():'')+(L.widget==="cams"?learnCams():L.widget==="dof"?learnDof():L.widget==="tech"?learnTech()+learnWhy():L.widget==="light"?learnLight():L.widget==="drills"?learnDrills():L.widget==="prices"?learnPrices():'')+
      (L.points.length?'<h3 class="lsec">Key points</h3><ul class="lpoints">'+L.points.map(p=>'<li>'+esc(p)+'</li>').join("")+'</ul>':'')+
      (L.try?'<div class="ltry"><span class="label">Try this</span><p>'+esc(L.try)+'</p></div>':'')+
      (L.link?'<button type="button" class="chip" data-recipe="'+L.link[1]+'">'+esc(L.link[0])+' ›</button>':'')+'</div>'+
    '<nav class="lnav" aria-label="Other lessons">'+
      (prev?'<button type="button" class="lnav-b" data-lopen="'+prev.id+'"><span>‹ Previous</span><b>'+esc(prev.title)+'</b></button>':'<span></span>')+
      (next?'<button type="button" class="lnav-b nx" data-lopen="'+next.id+'"><span>Next ›</span><b>'+esc(next.title)+'</b></button>':'<button type="button" class="lnav-b nx" data-lhome="1"><span>Done</span><b>All lessons</b></button>')+'</nav></article>'; }
function learnHome(){ const seen=learnSeen(), last=store.get("learnLast",null), lastL=LEARN.find(L=>L.id===last), n=LEARN.filter(L=>seen.has(L.id)).length;
  const nextUp=lastL&&LEARN[LEARN.indexOf(lastL)+(seen.has(lastL.id)?1:0)]||LEARN.find(L=>!seen.has(L.id));
  const tile=L=>'<button type="button" class="ltile'+(seen.has(L.id)?' seen':'')+'" data-lopen="'+L.id+'">'+licon(L.id)+'<span class="lt"><b>'+esc(L.title)+'</b><span>'+esc(L.sub)+'</span><em>'+learnMeta(L)+(seen.has(L.id)?' · <i>Read</i>':'')+'</em></span><span class="go" aria-hidden="true">›</span></button>';
  return '<div class="lhome"><p class="lead">Short lessons for street photography, written for the Leica Q3 and New York. Each ends with something to try, and links back into the app.</p>'+
    '<div class="lprog"><span>'+n+' of '+LEARN.length+' lessons read</span><span class="ltrack"><i style="width:'+Math.round(n/LEARN.length*100)+'%"></i></span></div>'+
    (nextUp?'<button type="button" class="lcont" data-lopen="'+nextUp.id+'">'+licon(nextUp.id)+'<span><span class="lcont-l">'+(n?'Continue':'Start here')+'</span><b>'+esc(nextUp.title)+'</b></span><span class="go" aria-hidden="true">›</span></button>':'')+
    LEARN_GROUPS.map(([name,desc,ids])=>'<section class="lgroup"><h3>'+esc(name)+'</h3><p>'+esc(desc)+'</p><div class="ltiles">'+ids.map(id=>LEARN.find(L=>L.id===id)).filter(Boolean).map(tile).join("")+'</div></section>').join("")+'</div>'; }

/* Today: the day's light and weather, where to go for the next good light, what is on, and a one-tap outing. */
const dayMin = d => d.getHours()*60+d.getMinutes();
const atMin = m => { const d=new Date(); d.setHours(0,0,0,0); return new Date(+d+m*6e4); };
function todayWindows(day){ const L=lightDay(day||new Date()), gold=L.runs.filter(r=>r.ph==="gold"), blue=L.runs.filter(r=>r.ph==="blue"), out=[];
  const mg=gold.find(r=>r.s<720), eg=gold.find(r=>r.s>=720), mb=blue.find(r=>r.s<720), eb=blue.find(r=>r.s>=720);
  if(mb) out.push({k:"blue",s:mb.s,e:mb.e,name:"Morning blue hour"});
  if(mg) out.push({k:"gold",s:mg.s,e:mg.e,name:"Morning golden hour"});
  if(eg) out.push({k:"gold",s:eg.s,e:eg.e,name:"Golden hour"});
  if(eb) out.push({k:"blue",s:eb.s,e:eb.e,name:"Blue hour"});
  return {L,list:out}; }
function rainRuns(){ const w=WEATHER[state.city]; if(!w||!w.hourly) return null; const runs=[]; let cur=null;
  for(let h=0;h<24;h++){ const s=skyAt(atMin(h*60)); if(s==="rain"||s==="snow"){ if(cur&&cur.e===h) cur.e=h+1; else { cur={k:s,s:h,e:h+1}; runs.push(cur); } } else cur=null; }
  return runs; }
/* Places ranked for a moment: ideas that suit that light, not yet shot, saved, and close by. */
function todayPicks(t){ const key=lightAt(t), ideas=cityIdeas();
  return Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number").map(id=>{
    const sky=skyAt(t), mine=ideas.filter(x=>x.p===id&&ideaOpen(x,t,sky)), fit=mine.filter(x=>x.w.includes(key)), fresh=fit.filter(x=>!state.done.has(x.id)), saved=mine.filter(x=>state.saved.has(x.id)&&!state.done.has(x.id)).length, mi=milesTo(PLACES[id]);
    const best=fresh.sort((a,b)=>state.saved.has(b.id)-state.saved.has(a.id))[0]||fit[0]||mine[0];
    return {id,fit:fit.length,fresh:fresh.length,mi,best,score:fresh.length*3+fit.length+saved*1.5-(mi===null?0:Math.min(mi,12)*0.5)}; })
    .filter(p=>p.fit>0).sort((a,b)=>b.score-a.score).slice(0,3); }
function todayEvents(){ const now=new Date(), d0=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  return eventRows(d0).filter(r=>r.o&&!r.cancelled&&evDay(r.o[0])<=d0&&evDay(r.o[1]||r.o[0])>=d0).map(r=>({r,st:evStatus(r,now)})).filter(x=>x.st.k!=="over").slice(0,4); }
/* What the light is good for right now, by phase of the sun and sky. */
function nowLight(now){ const c=CITIES[state.city], sp=sunPos(now,c.lat,c.lon), ph=sunPhase(sp.alt), key=lightAt(now), sky=nowInfo().sky, dull=/rain|cloud|fog|snow|storm/.test(sky||"");
  let what;
  if(ph==="night") what="Night: signs, windows and street lamps light the street. Neon, reflections and interiors.";
  else if(ph==="blue") what="Blue hour: the sky and the city lights balance for a few minutes. Skylines, lit windows, wet streets.";
  else if(ph==="gold") what=dull?"Golden hour, but cloud is muting it: soft, even light for faces and colour.":"Golden hour: low warm light, long shadows. Backlight, silhouettes and faces.";
  else if(key==="am") what=dull?"Morning under cloud: soft light with no shadows, good for faces, colour and detail.":"Morning sun: low, clean light from the east. Side light down the cross streets.";
  else what=dull?(sky==="rain"?"Rain: reflections, umbrellas and steamed windows. Shoot through glass or under cover.":"Overcast: flat, even light. Faces, colour, signs and interiors; no hard shadows."):"Midday sun: hard light overhead. Shadows as shapes, silhouettes in slots of light, canyons.";
  return {ph,key,sp,what}; }
/* Home and leave-by times. Home is a point the user saves (from their location while at home) with how they travel. Travel time is an
   estimate from the straight-line distance, calibrated on suburban New Jersey and Westchester runs into Manhattan: a fixed part, a per-km
   part, a bridge or tunnel when the trip is long, rush-hour traffic on weekdays, and parking. The directions link gives the live time. */
const HOME_MODES = {car:"by car", transit:"by bus and subway"};
function travelMins(from,to,mode,at){ const km=kmBetween(from,to), t=at||new Date(), wk=t.getDay()>0&&t.getDay()<6, h=t.getHours()+t.getMinutes()/60, rush=wk&&((h>=7&&h<10)||(h>=16&&h<19));
  let m; if(mode==="transit") m=20+km*2.4+(rush?5:0); else m=(6+km*1.25+(km>12?8:0))*(rush?1.35:1)+10;
  return Math.max(10,Math.ceil(m/5)*5); }
// Leave-by times are shown when a home is saved and you are at home or your position is unknown
const fromHome = () => state.home && (!state.pos || kmBetween(state.pos,state.home)<3) && typeof CITIES[state.city].lat==="number" && kmBetween(state.home,{lat:CITIES[state.city].lat,lon:CITIES[state.city].lon})>4 ? state.home : null;
const homeRoute = (to,mode) => 'https://www.google.com/maps/dir/?api=1&origin='+state.home.lat.toFixed(4)+','+state.home.lon.toFixed(4)+'&destination='+to[0].toFixed(5)+','+to[1].toFixed(5)+'&travelmode='+(mode==="transit"?"transit":"driving");
const durText = m => m>=60 ? Math.floor(m/60)+' h'+(m%60?' '+(m%60)+' min':'') : m+' min';
/* "Leave home by 4:35 pm" for arriving 15 minutes before `startMin` on `day` at `to` ([lat,lon]); or, if that time has passed, when you would get there. */
function leaveBy(to,startMin,day,what){ const H=fromHome(); if(!H||!to) return ""; const d=day?new Date(day):new Date(); d.setHours(0,0,0,0);
  const arrive=new Date(+d+(startMin-15)*6e4), m=travelMins(H,{lat:to[0],lon:to[1]},H.mode,arrive), leave=new Date(Math.floor((+arrive-m*6e4)/3e5)*3e5), now=new Date(), link=' <a class="tleave-link" href="'+homeRoute(to,H.mode)+'" target="_blank" rel="noopener">Live route ↗</a>';
  if(leave>now) return '<p class="tleave"><b>Leave home by '+hmText(dayMin(leave))+'</b> · about '+durText(m)+' '+HOME_MODES[H.mode]+(what?', there 15 min before '+esc(what):'')+'.'+link+'</p>';
  const there=new Date(Math.ceil((+now+travelMins(H,{lat:to[0],lon:to[1]},H.mode,now)*6e4)/3e5)*3e5), late=Math.round((there-(+d+startMin*6e4))/6e4);
  return '<p class="tleave late"><b>Leaving now, you would get there about '+hmText(dayMin(there))+'</b>'+(late>0&&what?', '+durText(late)+' into '+esc(what):'')+'.'+link+'</p>'; }
function homeHtml(){ const H=state.home;
  if(!state.homeEdit) return H ? '<p class="msg thome">Leave-by times are from home, '+HOME_MODES[H.mode]+'. <button type="button" class="linkbtn" data-homeedit="1">Change</button></p>'
    : '<p class="msg thome">Travelling in from outside the city? <button type="button" class="linkbtn" data-homeedit="1">Set home</button> to see when to leave.</p>';
  return '<div class="thomeedit"><p class="msg">Home is saved on this device only. Set it while you are at home, then choose how you travel in.</p>'+
    '<div class="intents"><button type="button" class="chip" data-homehere="1">'+(H?'Use where I am now':'Use where I am now as home')+'</button>'+
    Object.entries(HOME_MODES).map(([k,v])=>'<button type="button" class="chip" data-homemode="'+k+'" aria-pressed="'+(H?H.mode===k:k===(state.homeMode||"car"))+'">'+(k==="car"?"Car":"Bus and subway")+'</button>').join("")+
    (H?'<button type="button" class="chip" data-homeclear="1">Remove home</button>':'')+'<button type="button" class="chip" data-homedone="1">Done</button></div><p class="msg" id="homeMsg" role="status"></p></div>'; }

/* The week ahead: for each of the next seven evenings, sunset, golden and blue hour, the forecast for that light, and what is on. */
function weekDays(){ const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate()), rows=eventRows(today), out=[];
  for(let k=0;k<7;k++){ const day=new Date(today.getFullYear(),today.getMonth(),today.getDate()+k), {L,list}=todayWindows(day), g=list.find(x=>x.name==="Golden hour"), b=list.find(x=>x.name==="Blue hour");
    if(!g) continue; const s0=g.s, e0=b?b.e:g.e; let n=0, cc=0, pop=0, rain=false, known=true;
    for(let m=Math.floor(s0/60)*60;m<e0;m+=60){ const t=new Date(+day+m*6e4), f=hourlyAt(t); if(!f){ known=false; break; } n++; cc+=f.cc||0; pop=Math.max(pop,f.pop||0); const sk=skyAt(t); if(sk==="rain"||sk==="snow") rain=true; }
    const sky=!known||!n?null:rain?"rain":cc/n>=80?"overcast":cc/n>=35?"cloud":"clear";
    const ev=rows.filter(r=>r.o&&!r.cancelled&&evDay(r.o[0])<=day&&evDay(r.o[1]||r.o[0])>=day), past=k===0&&dayMin(now)>=e0;
    const score=past?-9:(sky==="cloud"?3.2:sky==="clear"?3:sky==="rain"?2.2:sky==="overcast"?1:0)+(ev.length?0.6:0);
    out.push({k,day,L,g,b,sky,pop,ev,past,score}); }
  const known=out.filter(d=>d.sky&&!d.past); if(known.length){ const best=known.slice().sort((a,b)=>b.score-a.score||a.k-b.k)[0]; best.best=true; }
  return out; }
const SKY_WORD = {clear:"Clear",cloud:"Some cloud",overcast:"Overcast",rain:"Rain"};
const SKY_WHY = {clear:"Clear sky: warm low sun, long shadows and a clean sunset.",cloud:"Broken cloud often catches the best colour after sunset.",overcast:"Overcast: soft, even light and little colour in the sky; good for faces and interiors.",rain:"Rain: wet streets and reflections, best from blue hour on."};
const skyIcon = k => k==="clear" ? '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="4.5" class="wi-sun"/><path d="M10 1.5v2.6M10 15.9v2.6M1.5 10h2.6M15.9 10h2.6M4 4l1.8 1.8M14.2 14.2L16 16M4 16l1.8-1.8M14.2 5.8L16 4" class="wi-ray"/></svg>'
  : k==="cloud" ? '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="7.5" cy="7.5" r="3.6" class="wi-sun"/><path d="M5 16h9.5a3.2 3.2 0 0 0 0-6.4 4.4 4.4 0 0 0-8.4 1A2.7 2.7 0 0 0 5 16Z" class="wi-cloud"/></svg>'
  : k==="overcast" ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 15h12a3.4 3.4 0 0 0 0-6.8 5 5 0 0 0-9.6 1.2A2.8 2.8 0 0 0 3.5 15Z" class="wi-cloud dark"/></svg>'
  : k==="rain" ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 11.5h12a3.2 3.2 0 0 0 0-6.4 5 5 0 0 0-9.6 1.1A2.7 2.7 0 0 0 3.5 11.5Z" class="wi-cloud dark"/><path d="M6 14l-1 3M10 14l-1 3M14 14l-1 3" class="wi-rain"/></svg>'
  : '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3" class="wi-none"/></svg>';
function weekHtml(){ const D=weekDays(); if(!D.length) return ""; const anyKnown=D.some(d=>d.sky), sel=D.find(d=>d.k===state.weekSel);
  const cells=D.map(d=>'<button type="button" class="wday'+(d.best?' best':'')+(d.past?' past':'')+'" data-week="'+d.k+'" aria-pressed="'+(state.weekSel===d.k)+'" aria-label="'+esc(DAY_NAMES[d.day.getDay()]+', sunset '+hmText(d.L.set)+(d.sky?', '+SKY_WORD[d.sky]+' at golden hour':'')+(d.ev.length?', '+d.ev.length+' event'+(d.ev.length>1?'s':''):'')+(d.best?', best evening':''))+'">'+
    '<span class="wdn">'+(d.k===0?'Today':DAY_SHORT[d.day.getDay()])+'</span>'+skyIcon(d.sky)+'<span class="wds">'+hmText(d.L.set).replace(/ pm$/,"")+'</span><span class="wde">'+(d.ev.length?'<i></i>'.repeat(Math.min(3,d.ev.length)):'')+'</span>'+(d.best?'<span class="wstar">Best</span>':'')+'</button>').join("");
  let det=""; if(sel){ const d=sel, picks=todayPicks(new Date(+d.day+d.g.s*6e4)), top=picks[0], tg=top&&(START_GEO[top.id]||[PLACES[top.id].lat,PLACES[top.id].lon]);
    det='<div class="wdet"><p><b>'+d.day.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})+'</b> · golden hour '+hmText(d.g.s)+' to '+hmText(d.g.e)+(d.b?', blue hour to '+hmText(d.b.e):'')+' · sunset '+hmText(d.L.set)+'</p>'+
      (d.sky?'<p class="msg">'+SKY_WORD[d.sky]+' at golden hour'+(d.pop>=20?' ('+d.pop+'% chance of rain)':'')+'. '+SKY_WHY[d.sky]+'</p>':'<p class="msg">'+(anyKnown?'No forecast for this evening yet.':'The week’s forecast shows in the installed app.')+'</p>')+
      (d.ev.length?'<p class="msg">On: '+d.ev.slice(0,4).map(r=>esc(evTitle(r))+(r.game?' ('+hmText(dayMin(r.game.at))+')':'')).join(" · ")+(d.ev.length>4?' and more':'')+'</p>':'')+
      (top?'<p class="msg">Best place for that light: <b>'+esc(PLACES[top.id].name)+'</b>'+(picks[1]?', then '+esc(PLACES[picks[1].id].name):'')+'.</p>'+leaveBy(tg,d.g.s,d.day,"golden hour"):'')+
      '<div class="callinks"><button type="button" class="chip primary" data-weekplan="'+d.k+'">Plan this evening</button><button type="button" class="chip" data-weekmap="'+d.k+'">See it on the map</button></div></div>'; }
  return '<section class="tcard tweek"><p class="tlabel">The week ahead</p><div class="wrow">'+cells+'</div>'+
    '<p class="msg">'+(anyKnown?'Sky at golden hour, sunset time and events each evening. Tap a day for details.':'Sunset and events each evening; the forecast shows in the installed app. Tap a day for details.')+'</p>'+det+'</section>'; }
function weekPlan(k){ const D=weekDays().find(d=>d.k===+k); if(!D) return; const t=new Date(+D.day+D.g.s*6e4), best=todayPicks(t)[0]; state.view="plan"; render();
  $("pDay").value=String(D.k); renderPlan(); if(best&&[...$("pStart").options].some(o=>o.value===best.id)) $("pStart").value=best.id;
  const h=Math.max(6,Math.floor((D.g.s-75)/60)); if([...$("pTime").options].some(o=>o.value===String(h))) $("pTime").value=String(h); $("pLen").value="150"; state.plan=makePlan(); savePlan(); renderPlan(); window.scrollTo({top:0}); }
function weekMap(k){ const D=weekDays().find(d=>d.k===+k); if(!D) return; state.mapD=D.k; state.mapT=Math.round(D.g.s/5)*5; state.view="map"; render(); window.scrollTo({top:0}); }
/* Worth going out: the moments in the next three days that the forecast and the sun make special — rain clearing at dusk,
   rain on the neon, broken cloud at sunset, morning fog, snow, the sun lined up with Manhattan's streets, and street events
   on a dry day. Shown on Today, and read each morning by the alert task (tools/alerts.py). */
const ALERT_MANHATTAN = new Set(["Financial District","Tribeca","East Village","West Village","Chelsea","Hell's Kitchen","Lincoln Square","Upper West Side","Yorkville","Upper East Side","East Harlem","Morningside Heights","Hamilton Heights","Washington Heights","Inwood","Murray Hill","Stuyvesant Town","Gramercy","Midtown East"]);
function alertPlace(pred){ const ids=Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number");
  const base=state.pos||state.home||{lat:40.754,lon:-73.984}, km=id=>kmBetween(base,PLACES[id]);   // nearer places first: from you, your home, or Midtown
  return ids.map(id=>{ const m=cityIdeas().filter(x=>x.p===id&&pred(x)); return {id,n:m.length,fresh:m.filter(x=>!state.done.has(x.id)).length,ideas:m.sort((a,b)=>state.done.has(a.id)-state.done.has(b.id))}; })
    .filter(o=>o.n).sort((a,b)=>(b.fresh+b.n*0.5+refl(b)-km(b.id)/6)-(a.fresh+a.n*0.5+refl(a)-km(a.id)/6))[0]||null; }
const SKY_PLACES = new Set(["dumbo","ferry","wburg","coney","brighton","rockaway","chelsea","cpark","fidi"]);
const refl = o => o.ideas.some(x=>COMPOSE[x.id]&&COMPOSE[x.id][0]==="reflect") ? 1 : 0;
const wetOut = x => x.w.includes("rain")&&x.r!=="interior"&&x.p!=="subway";
function shootAlerts(){ if(state.city!=="nyc") return []; const now=new Date(), t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()), nm=dayMin(now), out=[];
  const at=(day,m)=>new Date(+day+m*6e4), sk=(day,m)=>skyAt(at(day,m)), wet=s=>s==="rain"||s==="snow", hr=(day,m)=>hourlyAt(at(day,m));
  const withPlace=(a,P)=>Object.assign(a,{place:P?P.id:null,ideas:P?P.ideas.slice(0,2).map(x=>x.id):[]});
  const rows=eventRows(t0);
  for(let k=0;k<3;k++){ const day=new Date(t0.getFullYear(),t0.getMonth(),t0.getDate()+k), {L,list}=todayWindows(day), g=list.find(x=>x.name==="Golden hour"), b=list.find(x=>x.name==="Blue hour"), mg=list.find(x=>x.name==="Morning golden hour");
    const push=a=>{ if(!(k===0&&a.end<=nm)) out.push(Object.assign({day,k},a)); };
    if(g&&b){ let clear=null, wetDusk=false;
      for(let m=Math.ceil((g.s-120)/60)*60;m<=b.e+90;m+=60){ const s=sk(day,m); if(s===undefined) break;
        if(!wet(s)&&(wet(sk(day,m-60))||wet(sk(day,m-120)))&&m>=g.s-90&&clear===null) clear=m;
        if(wet(s)&&m>=b.s-60&&m<=b.e+60) wetDusk=true; }
      if(clear!==null){ const key=clear<L.set?"gold":"night";
        push(withPlace({kind:"wet",score:3.2,at:clear,end:Math.min(b.e+60,clear+120),title:"Rain clears about "+hmText(clear)+": wet streets for "+(clear<L.set?"golden hour":"blue hour"),why:"Puddles and wet pavement mirror the low light and the signs. The first hour after the rain stops is the best of it."},alertPlace(x=>wetOut(x)&&(x.w.includes(key)||x.w.includes("night"))))); }
      else if(wetDusk) push(withPlace({kind:"rain",score:2.6,at:b.s,end:b.e+60,title:"Rain at dusk: neon and headlights on wet streets",why:"Rain from blue hour on turns every sign into a reflection. Shoot from cover, with a lens hood."},alertPlace(x=>wetOut(x)&&x.w.includes("night"))));
      else { const f=hr(day,Math.floor(L.set/60)*60); if(f&&f.cc>=30&&f.cc<=75&&!wet(sk(day,L.set)))
        push(withPlace({kind:"sky",score:2.2,at:L.set-20,end:L.set+25,title:"Broken cloud at sunset: a good chance of colour",why:"About "+f.cc+"% cloud: enough for the setting sun to light it from below, not so much that it hides the sun. The colour peaks 10 to 20 minutes after sunset."},alertPlace(x=>x.w.includes("gold")&&SKY_PLACES.has(x.p)))); } }
    if(mg) for(let m=Math.floor(mg.s/60)*60;m<=mg.e+120;m+=60){ if(sk(day,m)==="fog"){
      push(withPlace({kind:"fog",score:2.8,at:m,end:m+90,title:"Fog in the morning",why:"Fog strips out the background and turns people into shapes; the towers disappear into it. It usually burns off within an hour or two."},alertPlace(x=>x.w.includes("am")))); break; } }
    for(let m=Math.ceil(L.rise/60)*60;m<L.set;m+=60){ if(sk(day,m)==="snow"){ const sn=cityIdeas().filter(x=>AVAIL[x.id]&&AVAIL[x.id].wx==="snow");
      push({kind:"snow",score:3.4,at:m,end:Math.min(L.set,m+180),title:"Snow from "+hmText(m),why:"Falling snow softens everything and keeps people moving with their heads down. The first hour after it settles is the cleanest.",place:sn[0]?sn[0].p:null,ideas:sn.slice(0,2).map(x=>x.id)}); break; } }
    // Manhattanhenge: the sun on the horizon at the end of the Midtown cross streets (about two days a year at each end of the day)
    { const H=hengeDay(day), grid=H.runs.filter(r=>{ const off=((r.az-299)%180+180)%180; if(r.len<15||!(off<1.2||off>178.8)||r.alt>0.8) return false; const R=MAPD_RUNS[r.i], [la,lo]=mapLL((R[0]+R[2])/20,(R[1]+R[3])/20); return ALERT_MANHATTAN.has(nearestHood(la,lo)); });
      if(grid.length>=300){ const byM=new Map(); grid.forEach(r=>byM.set(r.m,(byM.get(r.m)||0)+1)); const m=[...byM.entries()].sort((a,b)=>b[1]-a[1])[0][0], r0=grid.find(r=>r.m===m), eve=m>=720;
        const f=hr(day,m), cloudy=!!f&&(f.cc>=70||wet(sk(day,m)));
        if(!cloudy) push({kind:"henge",score:3.6,at:m,end:m+10,run:r0.i,place:null,ideas:[],title:(eve?"Manhattanhenge":"Manhattanhenge at sunrise")+": the sun lines up with the cross streets at "+hmText(m),why:"The "+(eve?"setting":"rising")+" sun sits right at the end of "+grid.length+" Midtown cross streets"+(f?", and the sky should be clear enough":"")+". 14th, 23rd, 34th, 42nd and 57th Streets have the clearest views; get there 30 minutes early and step into the crossing only on the walk signal."}); } }
    for(const r of rows){ if(!r.o||r.cancelled||!(evDay(r.o[0])<=day&&evDay(r.o[1]||r.o[0])>=day)||!["parade","festival","holiday","cultural","light"].includes(r.e.type)) continue;
      const w0=evWindow(r.e,day); if(!w0) continue; const s=sk(day,w0[0]); if(wet(s)) continue;
      push({kind:"event",score:2.4,at:w0[0],end:Math.max(w0[1]||0,w0[0]+90),ev:r.e.id,place:null,ideas:[],title:evTitle(r)+(s===undefined?"":", and it should be dry"),why:r.e.why||((EVENT_TYPES[r.e.type]||"Event")+(r.e.where?" · "+r.e.where:""))}); } }
  return out.sort((a,b)=>b.score-a.score||a.k-b.k||a.at-b.at).slice(0,6); }
const ALERT_ICON = {wet:"rain",rain:"rain",sky:"cloud",fog:"overcast",snow:"overcast",henge:"clear",event:"clear"};
function alertsHtml(){ const A=shootAlerts(), hasWx=!!(WEATHER[state.city]&&WEATHER[state.city].hourly); if(state.city!=="nyc") return "";
  if(!A.length) return hasWx?'<section class="tcard talerts"><p class="tlabel">Worth going out</p><p class="msg">Nothing out of the ordinary in the next three days: no rain clearing at dusk, fog, snow, colourful sunset or sun down the Manhattan streets.</p></section>':'';
  return '<section class="tcard talerts"><p class="tlabel">Worth going out · next three days</p>'+A.slice(0,4).map((a,n)=>{ const when=(a.k===0?'Today':a.k===1?'Tomorrow':DAY_NAMES[a.day.getDay()])+' · '+hmText(a.at);
    const idea=a.ideas[0]&&IDEAS.find(x=>x.id===a.ideas[0]);
    return '<div class="talert '+a.kind+'"><span class="taico">'+skyIcon(ALERT_ICON[a.kind])+'</span><div class="tab"><b>'+esc(a.title)+'</b><span class="msg">'+when+(a.place?' · '+esc(PLACES[a.place].name):'')+'</span><p class="msg">'+esc(a.why)+'</p>'+
      (idea?'<button type="button" class="row" data-id="'+idea.id+'"><span class="dot" style="background:'+INTENTS[idea.i].color+'"></span><span class="t"><b>'+esc(idea.t)+'</b><span>'+esc(PLACES[idea.p].name)+'</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
      '<div class="callinks"><button type="button" class="chip" data-alert="'+n+'">See it on the map</button></div></div></div>'; }).join("")+
    (hasWx?'':'<p class="msg">Rain, fog, snow and sunset alerts need the forecast, which the installed app has.</p>')+'</section>'; }
function alertMap(n){ const a=shootAlerts()[+n]; if(!a) return; state.mapD=a.k; state.mapT=Math.round(a.at/5)*5; state.view="map"; render(); window.scrollTo({top:0});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ if(a.run!=null){ state.mapShowHenge=true; mapSelectRun(a.run); } else if(a.ev){ state.mapShowEv=true; mapSelectEv(a.ev); } else if(a.place) mapSelect(a.place); })); }
function renderToday(){ const box=$("today"); if(!box) return;
  const now=new Date(), nm=dayMin(now), c=CITIES[state.city], {L,list}=todayWindows(), tf=hmText, w=WEATHER[state.city];
  const ph=sunPhase(sunPos(now,c.lat,c.lon).alt), next=list.find(x=>x.e>nm);
  // the moment to plan for: now if the light is good, otherwise the next window today
  const moments=[{at:null,label:"Right now"}].concat(list.filter(x=>x.e>nm&&x.s>nm).map(x=>({at:x.s,label:x.name+" "+tf(x.s)})));
  if(state.todayAt===undefined) state.todayAt = (ph==="gold"||ph==="blue"||!next) ? null : (next.s>nm?next.s:null);
  if(state.todayAt!==null&&state.todayAt<=nm) state.todayAt=null;
  const t = state.todayAt===null ? now : atMin(state.todayAt), key=lightAt(t);
  // 1. right now: the light, what it suits, the next window, the sun
  const NL=nowLight(now), cur=list.find(x=>x.s<=nm&&x.e>nm), upcoming=list.find(x=>x.s>nm), mins=m=>m>=60?Math.floor(m/60)+' h'+(m%60?' '+(m%60)+' min':''):m+' min';
  const nextTxt = cur ? cur.name+' until '+tf(cur.e) : upcoming ? upcoming.name+' in '+mins(upcoming.s-nm)+' ('+tf(upcoming.s)+')' : 'Next good light: blue hour tomorrow about '+tf(list[0]?list[0].s:L.rise-30);
  const sunTxt = NL.sp.alt>0 ? 'Sun to the '+compass(NL.sp.az)+', '+Math.round(NL.sp.alt)+'° up' : 'Sun down';
  const nowStrip='<section class="tnow '+NL.ph+'"><div class="tnowl"><span class="tlabel">Right now · '+tf(nm)+'</span><p class="tverdict">'+esc(NL.what)+'</p><p class="msg">'+esc(nextTxt)+' · '+esc(sunTxt)+'</p></div>'+
    '<div class="tnowb"><button type="button" class="btn primary tshoot" data-shootnow="1">Shoot now</button><button type="button" class="btn tlightf" data-lightf="1">Light here</button></div></section>';
  // the light today, compact: bar with windows as labels, weather on one line
  const runs=rainRuns(), rainTxt = runs ? (runs.length ? 'Rain likely '+runs.map(r=>hmText(r.s*60)+' to '+hmText(r.e*60)).join(" and ")+'.' : 'No rain expected today.') : (w&&typeof w.precip_chance_today==="number" ? 'Chance of rain today '+w.precip_chance_today+'%.' : '');
  // the weather now: from this hour's forecast when there is one, otherwise the last reading if it is recent
  const fNow=hourlyAt(now), wAge=w&&w.updated?(now-new Date(w.updated))/36e5:99, skNow=fNow?skyAt(now):null;
  const nowTxt = fNow ? (skNow?WX_WORD[skNow]:fNow.cc>=50?"Some cloud":"Clear")+(fNow.temp!=null?', '+Math.round(fNow.temp*9/5+32)+'°F':'')+' now. '
    : w&&w.condition_text&&wAge<3 ? esc(w.condition_text)+(typeof w.temp_c==="number"?', '+Math.round(w.temp_c*9/5+32)+'°F':'')+' now. ' : '';
  const mo=moonPos(atMin(720),c.lat,c.lon), mt=moonTimes(atMin(720),c.lat,c.lon);
  const pos=m=>(Math.min(1435,Math.max(0,m))/1435*100).toFixed(2)+'%';
  const band='<div class="tband" style="background:'+lightBand(new Date()).replace(/calc\(13px \+ \(100% - 26px\) \* ([0-9.]+)\)/g,(_,p)=>(p*100).toFixed(2)+'%')+'"><i style="left:'+pos(nm)+'"></i></div>'+
    '<div class="tbandlab"><span>12 am</span><span>6 am</span><span>Noon</span><span>6 pm</span><span>12 am</span></div>';
  const wins=list.map(x=>'<span class="twin'+(x.e<=nm?' past':x.s<=nm?' on':'')+'"><span class="lk '+x.k+'"></span>'+x.name.replace("Morning golden hour","Morning gold").replace("Morning blue hour","Morning blue")+' '+tf(x.s)+'–'+tf(x.e)+'</span>').join("")+
    '<span class="twin"><span class="lk rise"></span>Sunrise '+tf(L.rise)+'</span><span class="twin"><span class="lk set"></span>Sunset '+tf(L.set)+'</span>'+
    (mt.rise!==null&&mo.frac>0.3?'<span class="twin"><span class="lk moon"></span>'+(mo.frac>=0.97?'Full moon rises ':'Moonrise ')+tf(mt.rise)+'</span>':'');
  // 2. because it is <day>: ideas that are only on today, or only this week
  const dayN=Math.floor(Date.now()/864e5), todayIdeas=cityIdeas().filter(x=>{ const a=AVAIL[x.id]; return a&&a.d&&a.d.length<=6&&a.d.includes(now.getDay()); })
    .map(x=>({x,on:!AVAIL[x.id].h||AVAIL[x.id].h.some(([s,e])=>s<e?(nm/60>=s&&nm/60<e):(nm/60>=s||nm/60<e)),over:AVAIL[x.id].h&&AVAIL[x.id].h.every(([s,e])=>s<e&&nm/60>=e)})).filter(o=>!o.over).sort((a,b)=>b.on-a.on);
  const dayCard=todayIdeas.length?'<section class="tcard"><p class="tlabel">Because it is '+DAY_NAMES[now.getDay()]+'</p>'+todayIdeas.slice(0,5).map(({x,on})=>'<button type="button" class="row'+(state.done.has(x.id)?" done":"")+'" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span><span class="t"><b>'+esc(x.t)+'</b><span>'+esc(PLACES[x.p].name)+' · '+esc(availText(x))+(on?' · on now':'')+'</span></span><span class="go" aria-hidden="true">›</span></button>').join("")+'</section>':'';
  // 3 and 4. picks, with distance and the top pick's spot once location is on
  const picks=todayPicks(t), lname=WHEN[key]?WHEN[key].toLowerCase():key;
  const pickHtml=picks.length?picks.map((p,n)=>{ const P=PLACES[p.id], ph2=PHOTOS_INLINE&&PLACE_PHOTO[p.id], sp=n===0&&p.best&&spotFor(p.best), lf=sp&&lightFacing(sp.S[2],t), walk=p.mi!==null?Math.round(p.mi*1.609*1000*1.25/80):null;
    return '<article class="tpick">'+(ph2?'<img src="'+esc(ph2.src)+'" alt="" loading="lazy" onerror="this.remove()">':'<span class="tpickn">'+(n+1)+'</span>')+
      '<div class="tpickb"><b>'+esc(P.name)+'</b><span class="msg">'+esc(AREAS[areaOf(p.id)]||"")+(p.mi!==null?' · '+milesText(p.mi)+(walk!==null&&walk<=45?', '+walk+' min walk':''):'')+' · '+p.fit+' idea'+(p.fit>1?'s':'')+' for '+esc(lname)+(p.fresh<p.fit?' · '+(p.fit-p.fresh)+' shot':'')+'</span>'+
      (p.best?'<button type="button" class="row" data-id="'+p.best.id+'"><span class="dot" style="background:'+INTENTS[p.best.i].color+'"></span><span class="t"><b>'+esc(p.best.t)+'</b><span>'+esc(INTENTS[p.best.i].name)+(state.saved.has(p.best.id)?' · saved':'')+'</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
      (sp?'<p class="msg tspot"><span class="snum '+lf.k+'">'+spotNum(sp.id)+'</span><span>'+esc(sp.S[3])+' · face '+compass(sp.S[2])+', '+esc(lf.txt.toLowerCase())+(state.todayAt===null?' now':' then')+'</span></p>':'')+
      leaveBy(START_GEO[p.id]||[P.lat,P.lon], state.todayAt===null?nm:state.todayAt, null, state.todayAt===null?"":((list.find(x=>x.s===state.todayAt)||{}).name||"").toLowerCase())+
      '<div class="callinks"><button type="button" class="chip" data-mapgo="'+p.id+'">On the map</button>'+(sp&&state.pos?'<button type="button" class="chip" data-guidego="'+sp.id+'">Guide me there</button>':'')+(START_GEO[p.id]?'<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+START_GEO[p.id][0]+','+START_GEO[p.id][1]+'&travelmode=transit" target="_blank" rel="noopener">Directions ↗</a>':'')+'</div></div></article>'; }).join("")
    : '<p class="msg">No ideas suit this light. Try another time above.</p>';
  const locChip = state.pos ? '' : '<button type="button" class="chip" data-todayloc="1">Use my location</button>';
  // events
  const evs=todayEvents(), evHtml=evs.length?evs.map(({r,st})=>'<div class="tev'+(st.k==="live"?' live':'')+'"><b>'+esc(evTitle(r))+'</b><span class="msg">'+esc(st.line)+(r.e.where?' · '+esc(r.e.where):'')+'</span>'+
      (eventGeo(r.e.id)?(w0=>leaveBy(eventGeo(r.e.id), st.k==="live"||!w0?nm:w0[0], null, st.k==="live"||!w0?"":"it starts"))(evWindow(r.e,new Date(now.getFullYear(),now.getMonth(),now.getDate()))):'')+'<div class="callinks"><button type="button" class="chip" data-event="'+esc(r.e.id)+'">Open in Events</button></div></div>').join("")
    : '<p class="msg">No events listed for today. <button type="button" class="linkbtn" data-goview="events">See what is coming up</button></p>';
  // outing
  const eg=list.find(x=>x.name==="Golden hour"), planFor = eg&&eg.s-60>nm ? {when:"tonight",h:Math.max(6,Math.floor((eg.s-75)/60)),txt:'Starts about '+tf(Math.floor((eg.s-75)/60)*60)+' at the best place for that light and walks you through golden hour into blue hour.'}
    : {when:"tomorrow morning",h:Math.max(6,Math.floor(((list.find(x=>x.name==="Morning golden hour")||{s:420}).s-30)/60)),txt:'Golden hour has passed, so this plans tomorrow morning, starting just before the morning light.'};
  // a nudge
  const savedOpen=cityIdeas().filter(x=>state.saved.has(x.id)&&!state.done.has(x.id));
  const nudge = savedOpen.length ? (x=>'<p class="tlabel">From your saved ideas</p><button type="button" class="row" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span><span class="t"><b>'+esc(x.t)+'</b><span>'+esc(PLACES[x.p].name)+(x.w.includes(key)?' · suits '+esc(lname):'')+'</span></span><span class="go" aria-hidden="true">›</span></button>')(savedOpen[dayN%savedOpen.length])
    : (d=>d?'<p class="tlabel">Assignment for today</p><p><b>'+esc(d[1])+'</b>. '+esc(d[2])+'</p><div class="callinks">'+(state.drillRun?'':'<button type="button" class="chip primary" data-drillstart="'+d[0]+'">Start it now</button>')+'<button type="button" class="linkbtn" data-goview="learn">More assignments in Learn</button></div>':'')(DRILLS.filter(d=>!state.drills.has(d[0]))[dayN%Math.max(1,DRILLS.filter(d=>!state.drills.has(d[0])).length)]);
  box.innerHTML=
    '<header class="thead"><h2>'+now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})+'</h2><span class="msg">'+esc(c.name)+'</span></header>'+
    nowStrip+alertsHtml()+priceTodayCard()+
    '<section class="tcard tlight"><p class="tlabel">The light today</p>'+band+'<div class="twins">'+wins+'</div>'+(nowTxt||rainTxt?'<p class="msg">'+nowTxt+rainTxt+'</p>':'')+'</section>'+
    weekHtml()+
    dayCard+
    '<section class="tcard"><p class="tlabel">Where to go</p><div class="intents tmoments">'+moments.map(m=>'<button type="button" class="chip" data-tat="'+(m.at===null?'now':m.at)+'" aria-pressed="'+(m.at===state.todayAt)+'">'+m.label+'</button>').join("")+locChip+'</div>'+
      '<p class="msg">Best places for '+esc(lname)+(state.todayAt===null?' now':' at '+tf(state.todayAt))+(state.pos?', nearest first among equals':'')+'.</p>'+homeHtml()+pickHtml+'</section>'+
    '<section class="tcard"><p class="tlabel">On today</p>'+evHtml+'</section>'+
    '<section class="tcard tplan"><p class="tlabel">Plan an outing</p><p>'+planFor.txt+'</p>'+(planFor.when==="tonight"?(tp=>tp?leaveBy(START_GEO[tp.id]||[PLACES[tp.id].lat,PLACES[tp.id].lon],planFor.h*60+15,null,""):"")(todayPicks(atMin(planFor.h*60+60))[0]):'')+'<button type="button" class="btn primary" data-planday="'+planFor.h+'">Plan '+planFor.when+'</button></section>'+
    (nudge?'<section class="tcard">'+nudge+'</section>':''); }
/* Shoot now: the one best idea for this light, nearest first, not yet shot. */
function shootNow(){ const now=new Date(), key=lightAt(now), sky=nowInfo().sky, pool=cityIdeas().filter(x=>typeof PLACES[x.p].lat==="number"&&ideaOpen(x,now,sky)&&x.w.includes(key));
  const score=x=>(state.done.has(x.id)?-5:0)+(state.saved.has(x.id)?1:0)+(state.pos?-Math.min(10,milesTo(PLACES[x.p])||0)*0.6:0)+Math.random()*0.5;
  const best=(pool.length?pool:cityIdeas()).slice().sort((a,b)=>score(b)-score(a))[0]; if(!best) return;
  state.view="shoot"; show(best.id); state.tab="idea"; render(); window.scrollTo({top:0}); }
/* An outing built round an event: arrive an hour before, shoot the event with its own shots, then the nearest place while the light lasts. */
function planEvent(id){ const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate()), r=eventRows(today).find(x=>x.e.id===id); if(!r||!r.o) return;
  const day=evDay(r.o[0]<today?today:r.o[0]), w=evWindow(r.e,day)||[13*60,16*60], g=eventGeo(id); if(!g) return;
  const near=Object.keys(CITIES[state.city].places).filter(p=>typeof PLACES[p].lat==="number").map(p=>({p,km:kmBetween({lat:g[0],lon:g[1]},PLACES[p])})).sort((a,b)=>a.km-b.km)[0];
  let at=new Date(day.getFullYear(),day.getMonth(),day.getDate(),0,Math.max(0,w[0]-60)); if(at<now) at=new Date(Math.ceil(+now/3e5)*3e5);
  const end=new Date(day.getFullYear(),day.getMonth(),day.getDate(),0,Math.min(w[1],1439)), dur=Math.max(60,Math.min(240,Math.round((end-at)/6e4)));
  const stops=[{place:near.p,ev:id,at,key:lightAt(new Date(+at+30*6e4)),ideas:[],mins:dur}];
  const after=new Date(+at+dur*6e4+10*6e4); if(near&&near.km<2.5&&lightAt(after)!=="night"){ const k=lightAt(after); stops.push({place:near.p,at:after,key:k,ideas:pickIdeas(near.p,k,2,after)}); }
  state.plan={start:at,end:new Date(+(stops[stops.length-1].at)+(stops.length>1?2*25*6e4:dur*6e4)),stops,notes:[],skipped:[]}; if(stops.length>1) stops[0].leg={to:near.p,mins:10,mode:"walk"};
  savePlan(); state.view="plan"; render(); window.scrollTo({top:0}); }
function planToday(h){ renderPlan(); const t=new Date(), best=todayPicks(atMin(Math.min(1435,(+h+1)*60)))[0];
  if(best&&[...$("pStart").options].some(o=>o.value===best.id)) $("pStart").value=best.id;
  $("pDay").value="0"; renderPlan(); $("pTime").value=(+h*60<=dayMin(new Date()))?"now":String(h); if(!$("pTime").value) $("pTime").selectedIndex=0; $("pLen").value="150"; state.plan=makePlan(); savePlan(); state.view="map"; render(); }
function render(){
  openTip=null; tipSheet(); if(state.view!=="map"&&state.mapFull) mapFull(false); if(state.view!=="map"&&state.guide) guideStop(true);
  const shoot=state.view==="shoot", ev=state.view==="events", pl=state.view==="plan", mp=state.view==="map"||pl, ln=state.view==="learn", td=state.view==="today";
  $("viewToday").hidden=!td; if(td) renderToday();
  $("viewLearn").hidden=!ln; if(ln) renderLearn();
  $("viewMap").hidden=!mp; if(mp) renderMap();
  if(!ev&&document.getElementById("evSheet")){ evSheetClose(); }
  if(ev&&state.evNear&&!render._evFix){ render._evFix=true; evLocate(); } if(!ev) render._evFix=false;
  fSync(); document.body.classList.toggle("shootbar",shoot);
  $("viewShoot").hidden=!shoot; $("viewList").hidden=shoot||ev||pl||mp||ln||td; $("viewPlan").hidden=true; $("viewEvents").hidden=!ev; $("bar").hidden=!shoot; $("filters").hidden=ev||pl||mp||ln||td; $("now").hidden=ev||pl||ln||mp||td; document.body.classList.toggle("mapview",mp); renderNow();
  const tab = ["shoot","browse","saved","again"].includes(state.view) ? "ideas" : state.view==="plan" ? "map" : state.view;
  document.querySelectorAll("#views button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===tab));
  if(["browse","saved","again"].includes(state.view)) state.listView=state.view;
  if(tab==="ideas"){ state.ideasMode=state.view==="shoot"?"card":"list"; document.querySelectorAll("#ideaMode [data-im]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.im===state.ideasMode))); }
  const all=cityIdeas(), n=all.filter(x=>state.done.has(x.id)).length;
  $("progress").textContent=n+"/"+all.length; $("progress").setAttribute("aria-label",n+" of "+all.length+" ideas shot"); $("fill").style.width=(all.length?100*n/all.length:0)+"%";
  if(!shoot&&state.street) streetClose(true);
  if(mp) planSheet(pl);
  if(shoot){ renderCard(); if(state.street) renderStreet(); } else if(ev) renderEvents(); else if(pl) renderPlan(); else if(!mp&&!ln&&!td) renderList();
}
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-variant]"); if(!b||!state.current) return; const m=store.get("ideaVariant",{})||{};
  if(b.dataset.variant==="1") m[state.current]=1; else delete m[state.current]; store.set("ideaVariant",m); if(b.dataset.vgo) state.tab="settings"; render(); if(state.street) renderStreet(); });
function refilter(){ if(!matches(false).some(x=>x.id===state.current)) pick(); render(); qCount(); }
state.q=""; state.onNow=!!store.get("onNow",false); state.sort=store.get("isort","place")||"place";
function qCount(){ const el=$("qCount"); if(!el) return; if((!state.q&&!state.onNow)||state.view!=="shoot"){ el.hidden=true; return; } const n=matches(false).length; el.hidden=false; el.textContent=n?n+" idea"+(n===1?"":"s")+(state.q?(n===1?" matches":" match"):"")+(state.onNow?(state.q?", on now":" on now"):"")+".":""; if(!n) el.hidden=true; }
function syncOnNow(){ const b=$("onNow"); if(!b) return; b.setAttribute("aria-pressed",String(state.onNow)); b.textContent=state.onNow?"On now ✓":"On now"; }
let qT=0; $("q").addEventListener("input",e=>{ state.q=e.target.value; clearTimeout(qT); qT=setTimeout(refilter,160); });
$("q").addEventListener("keydown",e=>{ if(e.key==="Enter") e.target.blur(); if(e.key==="Escape"){ e.target.value=""; state.q=""; refilter(); } });
$("onNow").addEventListener("click",()=>{ state.onNow=!state.onNow; store.set("onNow",state.onNow); syncOnNow(); refilter(); });
document.addEventListener("change",e=>{ if(e.target.id!=="isort") return; state.sort=e.target.value; store.set("isort",state.sort); render(); });
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-qclear]"); if(!b) return; if(b.dataset.qclear==="q"){ state.q=""; $("q").value=""; } else { state.onNow=false; store.set("onNow",false); syncOnNow(); } refilter(); });
syncOnNow();
function cardToTop(){ const r=$("card").getBoundingClientRect(); if(r.top<0) window.scrollTo({top:window.scrollY+r.top-12,behavior:"smooth"}); }

// Controls
$("intents").innerHTML = '<button type="button" class="chip" data-i="all">Any intent</button>' + Object.entries(INTENTS).map(([k,v])=>
  '<button type="button" class="chip" data-i="'+k+'"><span class="dot" style="background:'+v.color+'"></span>'+v.name+'</button>').join("");
function syncChips(){ document.querySelectorAll("#intents .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.i===state.intent)); }
$("intents").addEventListener("click",e=>{ const c=e.target.closest(".chip"); if(!c) return;
  state.intent=c.dataset.i; store.set("intent",state.intent); syncChips(); refilter(); });
function fill(sel,all,obj,val){ sel.innerHTML=(all?'<option value="all">'+all+'</option>':'')+Object.entries(obj).map(([k,v])=>'<option value="'+k+'">'+esc(v.name||v)+'</option>').join(""); sel.value=val; if(!sel.value) sel.selectedIndex=0; }
fill($("city"),"",CITIES,state.city);
// Distance helpers. Places carry lat/lon; "Near me" sorts by distance from the device's position.
function milesTo(p){ if(!state.pos||typeof p.lat!=="number") return null;
  const r=Math.PI/180, a=Math.sin((p.lat-state.pos.lat)*r/2)**2+Math.cos(p.lat*r)*Math.cos(state.pos.lat*r)*Math.sin((p.lon-state.pos.lon)*r/2)**2;
  return 3958.8*2*Math.asin(Math.sqrt(a)); }
const milesText = d => d===null ? "" : d<0.1 ? "here" : d<10 ? d.toFixed(1)+" mi" : Math.round(d)+" mi";
const AREAS = {down:"Downtown Manhattan", mid:"Midtown and Uptown", bk:"Brooklyn", qn:"Queens", bx:"The Bronx", any:"Everywhere"};
const AREA_OF = {chinatown:"down",wsp:"down",soho:"down",les:"down",ferry:"down",union:"down",fidi:"down",chelsea:"down",gct:"mid",tsq:"mid",midtown:"mid",cpark:"mid",harlem:"mid",ktown:"mid",dumbo:"bk",coney:"bk",wburg:"bk",bushwick:"bk",brighton:"bk",jh:"qn",flushing:"qn",rockaway:"qn",arthur:"bx",subway:"any"};
const areaOf = id => AREA_OF[id]||"any";
const groupOptions = (ids,label) => { if(state.pos) return ids.map(label).join(""); return Object.keys(AREAS).map(a=>{ const g=ids.filter(id=>areaOf(id)===a); return g.length?'<optgroup label="'+AREAS[a]+'">'+g.map(label).join("")+'</optgroup>':""; }).join(""); };
function placeOrder(){ const all=Object.keys(CITIES[state.city].places), ak=Object.keys(AREAS), ids=all.slice().sort((a,b)=>ak.indexOf(areaOf(a))-ak.indexOf(areaOf(b))||all.indexOf(a)-all.indexOf(b)); if(!state.pos) return ids;
  return ids.map((id,n)=>({id,n,d:milesTo(PLACES[id])})).sort((a,b)=>(a.d===null?1e9:a.d)-(b.d===null?1e9:b.d)||a.n-b.n).map(o=>o.id); }
function nearSet(){ return new Set(placeOrder().filter(id=>milesTo(PLACES[id])!==null).slice(0,3)); }
function fillPlaces(){
  const sel=$("place"); sel.innerHTML='<option value="all">Anywhere</option>'+(state.pos?'<option value="near">Closest 3 to me</option>':'')+
    groupOptions(placeOrder(), id=>{ const d=milesText(milesTo(PLACES[id])); return '<option value="'+id+'">'+esc(PLACES[id].name)+(d?' · '+d:'')+'</option>'; });
  sel.value=state.place; if(!sel.value){ state.place="all"; sel.value="all"; }
}
// The Filters button: how many filters are on, a one-line summary under the search, and the count on the sheet's button
function fSync(){ const b=$("fCount"); if(!b) return; const parts=[];
  if(state.intent&&state.intent!=="all"&&INTENTS[state.intent]) parts.push(INTENTS[state.intent].name);
  if(state.place==="near") parts.push("Near me"); else if(state.place&&state.place!=="all"){ const o=[...$("place").options].find(x=>x.value===state.place); parts.push(o?o.textContent:state.place); }
  if(state.when&&state.when!=="all"){ const o=[...$("when").options].find(x=>x.value===state.when); parts.push(o?o.textContent:state.when); }
  if(state.cond&&state.cond!=="auto"){ const o=[...$("cond").options].find(x=>x.value===state.cond); parts.push("Set to "+(o?o.textContent.toLowerCase():state.cond)); }
  b.hidden=!parts.length; b.textContent=parts.length; $("fOpen").setAttribute("aria-label","Filters"+(parts.length?", "+parts.length+" on":""));
  const a=$("fActive"); a.hidden=!parts.length; a.innerHTML=parts.length?'<span>Showing</span> '+parts.map(p=>'<button type="button" class="fpill" data-fopen="1">'+esc(p)+'</button>').join("")+'<button type="button" class="linkbtn fx" data-fclear="1">Clear</button>':'';
  let n=0; try{ n=matches(false).length; }catch(e){} $("fShow").textContent=n?"Show "+n+" idea"+(n===1?"":"s"):"No ideas match: clear a filter"; }
function syncNear(){ $("near").textContent=state.pos?"Near me ✓":"Near me"; $("near").setAttribute("aria-pressed",!!state.pos); }
fillPlaces(); fill($("when"),"Any light",WHEN,state.when);
$("city").addEventListener("change",e=>{state.city=e.target.value;state.place="all";state.history=[];store.set("city",state.city);store.set("place","all");fillPlaces();refilter();});
$("place").addEventListener("change",e=>{state.place=e.target.value;store.set("place",state.place);refilter();});
$("when").addEventListener("change",e=>{state.when=e.target.value;store.set("when",state.when);refilter();});
$("rainAlert").addEventListener("click",e=>{
  if(e.target.closest(".alert-x")){ store.set("rainAlertOff",new Date().toDateString()); renderNow(); return; }
  if(e.target.closest("#rainIdeas")){ state.when="rain"; store.set("when","rain"); $("when").value="rain"; state.view="browse"; refilter(); return; }
  const r=e.target.closest(".arow"); if(r){ show(r.dataset.id); state.view="shoot"; render(); cardToTop(); }
});
$("near").addEventListener("click",()=>{
  const msg=$("nearMsg"); msg.hidden=true;
  if(state.pos){ state.pos=null; if(state.place==="near") state.place="all"; fillPlaces(); syncNear(); refilter(); return; }
  const fail=()=>{ msg.textContent="Your location isn't available here. In the installed app, allow location access for Shot List when asked, or check Settings › Privacy › Location Services."; msg.hidden=false; syncNear(); };
  if(!navigator.geolocation){ fail(); return; }
  $("near").textContent="Locating…";
  try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; state.place="near"; fillPlaces(); syncNear(); refilter(); }, fail, {timeout:10000,maximumAge:120000}); }catch(e){ fail(); }
});
$("cond").addEventListener("change",e=>{state.cond=e.target.value;render();});
$("useLight").addEventListener("click",e=>{const k=e.currentTarget.dataset.k; state.when=state.when===k?"all":k; store.set("when",state.when); $("when").value=state.when; refilter();});
setInterval(()=>{ try{ renderNow(); }catch(e){} }, 300000);
// While the map is open on Now, keep the slider, the tint and the sun moving with the clock.
setInterval(()=>{ try{ if(state.view!=="map"||!mapIsNow()||document.hidden) return; const tm=$("mapTime"), n=new Date(); if(tm) tm.value=n.getHours()*60+n.getMinutes(); mapDraw(); mapPanel(); }catch(e){} }, 60000);
document.addEventListener("visibilitychange",()=>{ try{ if(!document.hidden&&state.view==="map"&&mapIsNow()){ const tm=$("mapTime"), n=new Date(); if(tm) tm.value=n.getHours()*60+n.getMinutes(); mapDraw(); mapPanel(); } }catch(e){} });
// Day and night view. With no saved choice the page follows the device setting.
const rootEl=document.documentElement;
const isDark=()=>{ const a=rootEl.getAttribute("data-theme"); return a ? a==="dark" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); };
function syncTheme(){ const a=rootEl.getAttribute("data-theme")||"auto"; document.querySelectorAll("#setTheme [data-th]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.th===a)); }
{ const t=store.get("theme",null); if(t==="dark"||t==="light") rootEl.setAttribute("data-theme",t); }
$("setTheme").addEventListener("click",e=>{ const b=e.target.closest("[data-th]"); if(!b) return; const t=b.dataset.th; if(t==="auto"){ rootEl.removeAttribute("data-theme"); store.set("theme",null); } else { rootEl.setAttribute("data-theme",t); store.set("theme",t); } syncTheme(); if(state.view==="map"&&$("mapSvg")) mapDraw(); });
/* Sheets: Settings (camera, appearance, home, other devices, about) and the Ideas filters. */
let sheetFrom=null;
function sheetOpen(id){ const el=$(id); sheetFrom=document.activeElement; el.hidden=false; document.body.classList.add("sheetopen"); requestAnimationFrame(()=>{ el.classList.add("on"); const f=el.querySelector(".sh-x"); if(f) f.focus({preventScroll:true}); }); }
function sheetClose(id){ const el=$(id); if(el.hidden) return; el.classList.remove("on"); document.body.classList.remove("sheetopen"); setTimeout(()=>{ el.hidden=true; },180); if(sheetFrom&&sheetFrom.focus) sheetFrom.focus({preventScroll:true}); }
function renderSettings(){ $("setCams").innerHTML=Object.entries(CAMERAS).map(([k,v])=>'<button type="button" role="radio" class="setcam" data-cam="'+k+'" aria-checked="'+(k===state.camera)+'"><b>'+esc(v.name)+'</b><span>'+(k==="q343"?"43 mm f/2 · crops 60–150 mm":k==="q328"?"28 mm f/1.7 · crops 35–90 mm":k==="iphone"?"Main camera, settings in plain words":"General advice for any camera")+'</span></button>').join("");
  const h=state.home; $("setHome").textContent=h&&h.lat!=null?"Set ("+(h.mode==="transit"?"by transit":h.mode==="walk"?"on foot":"by car")+"). Today shows when to leave.":"Not set. Set it to see when to leave home for the next good light."; $("setHomeBtn").textContent=h&&h.lat!=null?"Change":"Set home"; syncTheme(); }
$("setOpen").addEventListener("click",()=>{ renderSettings(); sheetOpen("setSheet"); });
$("setSheet").addEventListener("click",e=>{ if(e.target.closest("[data-sclose]")){ sheetClose("setSheet"); return; }
  const c=e.target.closest("[data-cam]"); if(c&&CAMERAS[c.dataset.cam]){ state.camera=c.dataset.cam; store.set("camera",state.camera); openTip=null; renderSettings(); render(); return; }
  if(e.target.closest("#setHomeBtn")){ sheetClose("setSheet"); state.view="today"; state.homeEdit=true; render(); requestAnimationFrame(()=>{ const t=document.querySelector("#today .thome, #today [data-homesave], #today .homeedit"); if(t) t.scrollIntoView({block:"center"}); }); } });
$("fOpen").addEventListener("click",()=>{ fSync(); sheetOpen("fSheet"); });
$("fSheet").addEventListener("click",e=>{ if(e.target.closest("[data-fclose]")) sheetClose("fSheet"); });
$("fClear").addEventListener("click",()=>{ state.intent="all"; store.set("intent","all"); syncChips(); state.place="all"; state.stayPrev=null; store.set("place","all"); $("place").value="all";
  state.when="all"; store.set("when","all"); $("when").value="all"; if(state.cond!=="auto"){ state.cond="auto"; $("cond").value="auto"; } refilter(); });
$("fActive").addEventListener("click",e=>{ if(e.target.closest("[data-fopen]")) { fSync(); sheetOpen("fSheet"); } else if(e.target.closest("[data-fclear]")) $("fClear").click(); });
document.addEventListener("keydown",e=>{ if(e.key!=="Escape") return; for(const id of ["fSheet","setSheet"]) if(!$(id).hidden){ sheetClose(id); e.preventDefault(); } const es=document.getElementById("evSheet"); if(es){ evSheetClose(); e.preventDefault(); } });
syncTheme();
$("events").addEventListener("click",e=>{
  if(e.target.closest("[data-esclose]")){ evSheetClose(); return; }
  const sm=e.target.closest("details.event>summary"); if(sm){ e.preventDefault(); const id=sm.parentNode.dataset.id; state.evLast=id; evSheetOpen(id); return; }
  const inb=e.target.closest("[data-ideasnear]"); if(inb){ state.place="near"; state.ideasMode="list"; state.view=state.listView||"browse"; render(); fillPlaces(); syncNear(); refilter(); window.scrollTo({top:0}); return; }
  const nb=e.target.closest("[data-evnear]"); if(nb){ state.evNear=!state.evNear; store.set("evNear",state.evNear); if(state.evNear) evLocate(); renderEvents(); return; }
  const rb=e.target.closest("[data-evr]"); if(rb){ state.evRadius=+rb.dataset.evr; store.set("evRadius",state.evRadius); renderEvents(); return; }
  const q=e.target.closest(".evquick [data-q]"); if(q){ const k=q.dataset.q, Q=state.evQuick||(state.evQuick=new Set()); if(Q.has(k)) Q.delete(k); else Q.add(k); renderEvents(); return; }
  const pe=e.target.closest("[data-planev]"); if(pe){ planEvent(pe.dataset.planev); return; }
  const me=e.target.closest("[data-mapev]"); if(me){ const id=me.dataset.mapev, g=eventGeo(id); state.mapT=null; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>{ state.mapShowEv=true; state.mapEv=id; state.mapSel=null; state.mapSpot=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; mapPanel(); mapDraw(); if(g){ const [x,y]=mapXY(g[0],g[1]); mapFly(mapAim({cx:x,cy:y,w:Math.min(mapV.w,30)})); } setSheet("half"); })); return; }
  const c=e.target.closest("#evTypes .chip"); if(!c) return; state.evType=c.dataset.t; renderEvents(); });
$("pGo").addEventListener("click",()=>{ state.plan=makePlan(); savePlan(); renderPlan(); if(state.view==="plan"){ mapPanel(); mapDraw(); if($("mapBody")) $("mapBody").scrollTop=0; const p=state.plan;
    if(p&&p.stops.length&&!state.mapHead){ const xs=p.stops.map(st=>mapXY(PLACES[st.place].lat,PLACES[st.place].lon)), x0=Math.min(...xs.map(v=>v[0])), x1=Math.max(...xs.map(v=>v[0])), y0=Math.min(...xs.map(v=>v[1])), y1=Math.max(...xs.map(v=>v[1]));
      mapV=mapClamp(mapAim({cx:(x0+x1)/2,cy:(y0+y1)/2,w:Math.max(40,(x1-x0)*1.8,(y1-y0)*1.8/MAP_ASPECT)})); mapDraw(); } } });
$("pDay").addEventListener("change",()=>{ const keep=$("pTime").value; renderPlan(); if([...$("pTime").options].some(o=>o.value===keep)) $("pTime").value=keep; });
$("plan").addEventListener("click",e=>{
  const me=e.target.closest("[data-mapev]"); if(me){ const id=me.dataset.mapev, g=eventGeo(id); state.mapT=null; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>{ state.mapShowEv=true; state.mapEv=id; state.mapSel=null; state.mapSpot=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; mapPanel(); mapDraw(); if(g){ const [x,y]=mapXY(g[0],g[1]); mapFly(mapAim({cx:x,cy:y,w:Math.min(mapV.w,30)})); } setSheet("half"); })); return; }
  const ev=e.target.closest("[data-event]"); if(ev){ showEvent(ev.dataset.event); return; }
  const r=e.target.closest(".row"); if(!r||!r.dataset.id) return; show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); });
state.plan=loadPlan();
syncNear();
// Move marks between devices with a copy-and-paste code. Import merges: it only ever adds.
function syncEncode(){ const j=JSON.stringify({v:1,s:[...state.saved],d:[...state.done],n:state.notes,l:state.log});
  return "SL1."+btoa(unescape(encodeURIComponent(j))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function syncDecode(code){ const m=/SL1\.([A-Za-z0-9_-]+)/.exec(String(code||"").replace(/\s+/g,"")); if(!m) return null;
  try{ const b=m[1].replace(/-/g,"+").replace(/_/g,"/"); const j=JSON.parse(decodeURIComponent(escape(atob(b+"===".slice((b.length+3)%4)))));
    return (j && j.v===1) ? j : null; }catch(e){ return null; } }
function syncImport(code){ const j=syncDecode(code); if(!j) return null;
  const known=new Set(IDEAS.map(x=>x.id)), ok=a=>(Array.isArray(a)?a:[]).filter(id=>typeof id==="string"&&known.has(id)); let s=0,d=0,n=0;
  ok(j.s).forEach(id=>{ if(!state.saved.has(id)){ state.saved.add(id); s++; } });
  ok(j.d).forEach(id=>{ if(!state.done.has(id)){ state.done.add(id); d++; } });
  if(j.l&&typeof j.l==="object") Object.entries(j.l).forEach(([id,list])=>{ if(!known.has(id)||!Array.isArray(list)) return; const cur=state.log[id]=state.log[id]||[], have=new Set(cur.map(e=>e.t));
    list.forEach(e=>{ if(!e||typeof e.t!=="number"||have.has(e.t)) return; const v={t:e.t,k:WHEN[e.k]?e.k:null,s:SKY_NAME[e.s]?e.s:null}; if(e.r==="keep"||e.r==="again") v.r=e.r; cur.push(v); have.add(e.t); });
    cur.sort((a,b)=>a.t-b.t); if(cur.length>50) cur.splice(0,cur.length-50); if(!cur.length) delete state.log[id]; else state.done.add(id); });
  Object.entries(j.n&&typeof j.n==="object"?j.n:{}).forEach(([id,t])=>{ if(!known.has(id)||typeof t!=="string"||!t.trim()) return; t=t.slice(0,2000);
    const cur=state.notes[id]; if(!cur){ state.notes[id]=t; n++; } else if(cur.trim()!==t.trim() && !cur.includes(t.trim())){ state.notes[id]=cur.trim()+"\n"+t.trim(); n++; } });
  store.set("saved",[...state.saved]); store.set("done",[...state.done]); store.set("notes",state.notes); store.set("log",state.log);
  return {s,d,n}; }
$("syncCopy").addEventListener("click",()=>{ const code=syncEncode(), msg=$("syncMsg"), total=state.saved.size+state.done.size+Object.keys(state.notes).length;
  const shown=()=>{ $("syncCode").value=code; $("syncCode").focus(); $("syncCode").select(); msg.textContent="Copying isn't available here. The code is in the box: select it and copy it."; };
  try{ navigator.clipboard.writeText(code).then(()=>{ msg.textContent="Copied a code holding "+state.saved.size+" saved, "+state.done.size+" shot and "+Object.keys(state.notes).length+" notes."+(total?"":" There is nothing marked on this device yet."); }, shown); }catch(e){ shown(); } });
$("syncImport").addEventListener("click",()=>{ const r=syncImport($("syncCode").value), msg=$("syncMsg");
  if(!r){ msg.textContent="That doesn't look like a Shot List code. Copy the whole code, starting with SL1."; return; }
  msg.textContent=(r.s+r.d+r.n) ? "Imported: "+r.s+" saved, "+r.d+" shot and "+r.n+" notes added." : "Nothing new: this device already has everything in that code.";
  $("syncCode").value=""; render(); });
$("map").addEventListener("click",e=>{
  if(e.target.closest("[data-openplan]")){ state.view="plan"; render(); return; }
  if(e.target.closest("[data-closeplan]")){ state.view="map"; render(); return; }
  if(e.target.closest("[data-full]")){ mapFull(!state.mapFull); return; }
  if(e.target.closest("[data-unsel]")){ const back=state.mapNear&&state.mapSpot; mapSelect(null); if(back){ mapPanel(); } return; }
  const gd=e.target.closest("[data-guide]"); if(gd){ guideStart(gd.dataset.guide); return; }
  const pe=e.target.closest("[data-planev]"); if(pe){ planEvent(pe.dataset.planev); return; }
  if(e.target.closest("[data-guidestop]")){ guideStop(); return; }
  if(e.target.closest("[data-nearspots]")){ $("mapLayers").hidden=true; $("mapLayersBtn").setAttribute("aria-expanded","false"); needPos(showNear); return; }
  const na=e.target.closest("[data-nearall]"); if(na){ state.mapNearAll=na.dataset.nearall==="1"; mapPanel(); return; }
  if(e.target.closest("[data-nearclose]")){ state.mapNear=false; mapPanel(); return; }
  if(e.target.closest("[data-nearback]")){ showNear(); return; }
  const ap=e.target.closest("[data-addplan]"); if(ap){ planAdd(ap.dataset.addplan); mapPanel(); mapDraw(); return; }
  const rp=e.target.closest("[data-rmplan]"); if(rp){ planRemove(rp.dataset.rmplan); mapPanel(); mapDraw(); return; }
  const sc=e.target.closest("[data-stop]"); if(sc){ mapGoStop(+sc.dataset.stop); return; }
  if(e.target.closest("[data-nextstop]")){ mapGoStop(nextStopIndex()); return; }
  if(e.target.closest("[data-clearplan]")){ state.plan=null; savePlan(); mapPanel(); mapDraw(); return; }
  const dc=e.target.closest("#mapDays [data-day]"); if(dc){ const k=+dc.dataset.day, n=new Date(); state.mapD=k; if(k&&state.mapT===null) state.mapT=Math.round((n.getHours()*60+n.getMinutes())/5)*5; if(!k&&state.mapT!==null&&Math.abs(state.mapT-(n.getHours()*60+n.getMinutes()))<5) state.mapT=null;
    $("mapTime").value=state.mapT===null?n.getHours()*60+n.getMinutes():state.mapT; mapDraw(); mapPanel(); return; }
  const jm=e.target.closest("[data-jump]"); if(jm){ state.mapT=Math.round(+jm.dataset.jump/5)*5; $("mapTime").value=state.mapT; mapDraw(); mapPanel(); return; }
  if(e.target.closest("#mapTimeNow")){ state.mapT=null; state.mapD=0; const n=new Date(); $("mapTime").value=n.getHours()*60+n.getMinutes(); mapDraw(); mapPanel(); return; }
  const ic=e.target.closest("#mapIntent .chip"); if(ic){ state.mapIntent=ic.dataset.i; mapPanel(); mapDraw(); return; }
  const ft=e.target.closest("[data-fit]"); if(ft){ mapFly(mapPreset("city")); return; }
  const lc=e.target.closest("[data-locate]"); if(lc){ if(state.pos){ if(posOnMap()) mapFly(mapPreset("me")); else offMapMsg(); return; } const b=lc; b.textContent="…";
    const done=()=>{ b.textContent="◎"; mapPanel(); if(state.pos&&!posOnMap()) offMapMsg(); else if(state.pos) mapFly(mapPreset("me")); else { $("mapPanel").insertAdjacentHTML("afterbegin",'<p class="msg">Your location is not available here. In the installed app, allow location access for Shot List when asked.</p>'); } };
    if(!navigator.geolocation){ done(); return; }
    try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; fillPlaces(); syncNear(); done(); }, done, {timeout:10000,maximumAge:120000}); }catch(err){ done(); } return; }
  if(e.target.closest("#mapLayersBtn")){ const L=$("mapLayers"), open=L.hidden; L.hidden=!open; $("mapLayersBtn").setAttribute("aria-expanded",open); return; }
  if(e.target.closest("[data-layersclose]")){ $("mapLayers").hidden=true; $("mapLayersBtn").setAttribute("aria-expanded","false"); return; }
  const ly=e.target.closest("[data-layer]"); if(ly){ const k=ly.dataset.layer; state[k]=!state[k]; store.set(k,state[k]); if(k==="mapShowEv"&&!state[k]) state.mapEv=null; if(k==="mapShowLm"&&!state[k]) state.mapLm=null; if(k==="mapShowHenge"&&!state[k]) state.mapRun=null; if(k==="mapShowFerry"&&!state[k]) state.mapFerry=null; state.mapRun=null; state.mapFerry=null; mapPanel(); mapDraw(); return; }
  const ssp=e.target.closest("[data-spot]"); if(ssp){ mapSelectSpot(ssp.dataset.spot); return; }
  const gs=e.target.closest("[data-gosel]"); if(gs){ const id=gs.dataset.gosel; mapSelect(id); return; }
  const z=e.target.closest("#mapZoom .chip"); if(z){ $("mapLayers").hidden=true; $("mapLayersBtn").setAttribute("aria-expanded","false"); state.mapZoom=z.dataset.z; store.set("mapZoom",state.mapZoom); mapFly(mapPreset(z.dataset.z)); return; }
  const b=e.target.closest("[data-zoom]"); if(b){ if(state.mapHead){ mapV=mapClamp({cx:mapV.cx,cy:mapV.cy,w:mapV.w*parseFloat(b.dataset.zoom)}); mapDraw(); return; } mapFly({cx:mapV.cx,cy:mapV.cy,w:mapV.w*parseFloat(b.dataset.zoom)}); return; }
  const hb=e.target.closest("[data-head]"); if(hb){ if(state.mapHead){ headUp(false); return; } const ok=headingStart();
    ok.then(r=>{ headUp(true); if(!r){ headMsgShow(); return; } if(!state.pos&&navigator.geolocation){ try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; if(state.mapHead&&posOnMap()){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); mapV=mapClamp({cx:x,cy:y,w:Math.min(mapV.w,24)}); mapDraw(); } else if(state.mapHead) offMapMsg(); },()=>{ const pnl=$("mapPanel"); if(pnl&&!pnl.querySelector(".posmsg")) pnl.insertAdjacentHTML("afterbegin",'<p class="msg posmsg">Your location is not available, so the map turns around its centre. Allow location for Shot List to centre it on you.</p>'); },{timeout:10000,maximumAge:60000}); }catch(err){} } });
    return; }
  const ev=e.target.closest("[data-event]"); if(ev){ showEvent(ev.dataset.event); return; }
  const r=e.target.closest(".row"); if(r){ show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); return; }
  const g=e.target.closest("[data-go]"); if(g){ state.place=g.dataset.go; store.set("place",state.place); fillPlaces(); $("place").value=state.place; state.view="browse"; refilter(); window.scrollTo({top:0}); return; }
  const q=e.target.closest("[data-plan]"); if(q){ state.view="plan"; render(); if(state.mapD&&$("pDay")){ $("pDay").value=String(state.mapD); renderPlan(); } $("pStart").value=q.dataset.plan; window.scrollTo({top:0}); }
});
let mapTimeRaf=0;
$("map").addEventListener("input",e=>{ if(e.target.id!=="mapTime") return; state.mapT=+e.target.value; if(!mapTimeRaf) mapTimeRaf=requestAnimationFrame(()=>{ mapTimeRaf=0; mapDraw(); mapPanel(); }); });
$("map").addEventListener("change",e=>{ if(e.target.id!=="mapGo"||!e.target.value) return; const id=e.target.value; state.mapSel=id; state.mapEv=null; state.mapLm=null; state.mapRun=null; state.mapFerry=null; state.mapSpot=null; mapPanel(); mapDraw(); mapZoomPlace(id); });
$("map").addEventListener("keydown",e=>{ if(e.key!=="Enter"&&e.key!==" ") return; const p=e.target.closest(".m-pin"); const v=e.target.closest(".m-ev"); const spk=e.target.closest(".m-spotg"); if(spk){ e.preventDefault(); mapSelectSpot(spk.dataset.s); return; } const lmk=e.target.closest(".m-lm"); if(lmk){ e.preventDefault(); mapSelectLm(+lmk.dataset.l); return; } const fyk=e.target.closest(".m-ferryg"); if(fyk){ e.preventDefault(); mapSelectFerry(fyk.dataset.f); return; } if(v){ e.preventDefault(); mapSelectEv(v.dataset.e); return; }
  if(p){ e.preventDefault(); mapSelect(p.dataset.p); const n=document.querySelector('.m-pin[data-p="'+p.dataset.p+'"]'); if(n) n.focus(); } });
window.addEventListener("resize",()=>{ if(state.view==="map") mapLayout(); });
$("learn").addEventListener("click",e=>{
  const lo=e.target.closest("[data-lopen]"); if(lo){ openLearn(lo.dataset.lopen); return; }
  const lh=e.target.closest("[data-lhome]"); if(lh){ const was=state.learnId; state.learnId=null; renderLearn(); requestAnimationFrame(()=>{ const t=was&&document.querySelector('#learn .ltile[data-lopen="'+was+'"]'); if(t){ t.scrollIntoView({block:"center"}); t.focus({preventScroll:true}); } else window.scrollTo({top:0}); }); return; }
  const lj=e.target.closest("[data-ljump]"); if(lj){ const t=document.querySelector('#learn .lpage '+lj.dataset.ljump); if(t) t.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}); return; }
  const wn=e.target.closest("[data-whynav]"); if(wn){ const keys=whyKeys(), i=Math.max(0,keys.indexOf(state.whySel)); state.whySel=keys[(i+(+wn.dataset.whynav)+keys.length)%keys.length]; const box=e.target.closest(".learnwhy"); if(box) box.outerHTML=learnWhy(); return; }
  const tsel=e.target.closest("[data-techsel]"); if(tsel){ const k=tsel.dataset.techsel; state.techSel=state.techSel===k?null:k; const g=e.target.closest(".tgrid"); if(g){ g.outerHTML=learnTech(); const c=document.querySelector('.tgrid [data-techsel="'+k+'"]'); if(c) c.focus({preventScroll:true}); } return; }
  const zl=e.target.closest("[data-zflens]"); if(zl){ state.lfF=+zl.dataset.zflens; state.lfN=near3(ZF_N(state.lfF),+state.lfN||8); e.target.closest(".zf").outerHTML=learnDof(); return; }
  const zh=e.target.closest("[data-zfh]"); if(zh){ const f=+state.lfF===28?28:43, N=+state.lfN; state.lfS=+((f*f)/(N*0.03)/1000+f/1000).toFixed(1); e.target.closest(".zf").outerHTML=learnDof(); return; }
  const zs=e.target.closest("[data-zf]"); if(zs){ const [k,d]=zs.dataset.zf.split(":"), f=+state.lfF===28?28:43;
    if(k==="N"){ const L=ZF_N(f).slice().sort((x,y)=>x-y), i=L.indexOf(near3(L,+state.lfN)); state.lfN=L[Math.max(0,Math.min(L.length-1,i+(+d)))]; }
    else { const cur=+state.lfS; let v; if(+d>0) v=ZF_S.find(x=>x>cur+1e-6); else v=[...ZF_S].reverse().find(x=>x<cur-1e-6); if(v!=null) state.lfS=v; }
    e.target.closest(".zf").outerHTML=learnDof(); return; }
  const po=e.target.closest("[data-popen]"); if(po){ const id=po.dataset.popen; state.priceOpen=state.priceOpen===id?null:id; rerenderPrices(); const b=document.querySelector('.pc[data-pc="'+id+'"]'); if(b&&state.priceOpen){ b.scrollIntoView({block:"nearest"}); } const r=document.querySelector('.pc[data-pc="'+id+'"] .pr-row'); if(r) r.focus({preventScroll:true}); return; }
  const pts=e.target.closest("[data-ptsave]"); if(pts){ priceSave(pts.dataset.ptsave,pts.closest(".pc")); return; }
  const ptc=e.target.closest("[data-ptclear]"); if(ptc){ priceClear(ptc.dataset.ptclear); return; }
  const cp=e.target.closest("[data-campick]"); if(cp){ const id=cp.dataset.campick; let L=state.camCmp.filter(x=>x&&STREET_CAMS.some(c=>c[0]===x));
    if(L.includes(id)) L=L.filter(x=>x!==id); else if(L.length<3) L.push(id); else L[2]=id;
    state.camCmp=L; store.set("camCmp",L); const w=e.target.closest(".camcmp"); if(w){ w.outerHTML=learnCams(); const b=document.querySelector('.camcmp [data-campick="'+id+'"]'); if(b) b.focus({preventScroll:true}); } return; }
  const ws=e.target.closest("[data-whysel]"); if(ws){ state.whySel=ws.dataset.whysel; const box=e.target.closest(".learnwhy"); if(box) box.outerHTML=learnWhy(); return; }
  const xpr=e.target.closest("[data-xpre]"); if(xpr){ const P=XPRE[+xpr.dataset.xpre][1], X=expoState(); Object.assign(X,{max:6400,slow:1/250},P); state.xpTrade=""; xpRedraw(e.target.closest(".xp")); return; }
  const xnw=e.target.closest("[data-xnow]"); if(xnw){ const X=expoState(); X.L=xnw.dataset.xnow; state.xpTrade='<b>Light now:</b> the scene is set to '+XL[X.L][0].toLowerCase()+', the nearest match to the light outside.'; xpRedraw(e.target.closest(".xp")); return; }
  const xeq=e.target.closest("[data-xeq]"); if(xeq){ const X=expoState(), B=expoCalc(), [N,t]=xeq.dataset.xeq.split(",").map(Number), was=X.mode; X.mode="M"; X.N=N; X.t=t;
    state.xpTrade='<b>Same light:</b> f/'+N+' at '+shText(t)+' instead of f/'+B.N+' at '+shText(B.t)+'. The brightness stays; the background and the movement change.'+(was!=="M"?' Switched to M so both stay as you set them.':''); xpRedraw(e.target.closest(".xp")); return; }
  const xm=e.target.closest("[data-xmode]"); if(xm){ const X=expoState(), B=expoCalc(), m=xm.dataset.xmode; if(m===X.mode) return;
    if(X.mode==="A") X.t=near3(XSH,B.t); if(X.mode==="S") X.N=near3(xApList(B.f),B.N);   // what the camera had chosen becomes yours, so the picture does not jump
    X.mode=m; state.xpTrade=""; xpRedraw(e.target.closest(".xp")); return; }
  const xa=e.target.closest("[data-xauto]"); if(xa){ const X=expoState(), B=expoCalc(); X.iso=X.iso?0:near3(XISO,B.iso); state.xpTrade=""; xpRedraw(e.target.closest(".xp")); return; }
  const xst=e.target.closest("[data-xstep]"); if(xst){ const X=expoState(), C=expoCalc(), [k,d]=xst.dataset.xstep.split(":"), list=xList(k,C.f), cur=k==="N"?(X.N||C.Nmin):k==="t"?X.t:X.iso;
    const i=Math.max(0,Math.min(list.length-1,list.indexOf(near3(list,cur))+(+d))); xpSet(k,list[i],e.target.closest(".xp")); return; }
  const xr=e.target.closest("[data-xrail]"); if(xr){ const k=xr.dataset.xrail, C=expoCalc(), list=xList(k,C.f), r=xr.getBoundingClientRect(), fr=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    const a=xLight(k,list[0]), b=xLight(k,list[list.length-1]), want=a+fr*(b-a), v=list.reduce((p,c)=>Math.abs(xLight(k,c)-want)<Math.abs(xLight(k,p)-want)?c:p);
    xpSet(k,v,e.target.closest(".xp")); return; }
  const lcf=e.target.closest("[data-lcf]"); if(lcf){ state.lcF=+lcf.dataset.lcf; e.target.closest(".cropw").outerHTML=learnCrop(); return; }
  const r=e.target.closest(".row"); if(r){ show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); return; }
  const rc=e.target.closest("[data-recipe]"); if(rc){ const pick=cityIdeas().filter(x=>x.r===rc.dataset.recipe); if(pick.length){ show(pick[Math.floor(Math.random()*pick.length)].id); state.view="shoot"; state.tab="settings"; render(); window.scrollTo({top:0}); } return; }
  const lt=e.target.closest("[data-light]"); if(lt){ state.when=lt.dataset.light; store.set("when",state.when); $("when").value=state.when; state.view="browse"; refilter(); window.scrollTo({top:0}); return; }
});
// The jump bar marks the part of the lesson you are reading
let lspyRaf=0;
window.addEventListener("scroll",()=>{ if(state.view!=="learn"||!state.learnId||lspyRaf) return; lspyRaf=requestAnimationFrame(()=>{ lspyRaf=0;
  const chips=[...document.querySelectorAll("#learn .ljump [data-ljump]")]; if(!chips.length) return; let cur=chips[0];
  for(const c of chips){ const t=document.querySelector("#learn .lpage "+c.dataset.ljump); if(t&&t.getBoundingClientRect().top<130) cur=c; }
  if(innerHeight+scrollY>=document.documentElement.scrollHeight-4) cur=chips[chips.length-1];
  chips.forEach(c=>{ const on=c===cur; if(c.getAttribute("aria-current")!==String(on)){ c.setAttribute("aria-current",String(on)); if(on){ const bar=c.parentNode; bar.scrollTo({left:c.offsetLeft-bar.clientWidth/2+c.clientWidth/2,behavior:"smooth"}); } } }); }); },{passive:true});
// Swipe the example photo left or right for the next one
let whyTouch=null;
$("learn").addEventListener("touchstart",e=>{ const f=e.target.closest(".learnwhy .refimg"); whyTouch=f&&e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null; },{passive:true});
$("learn").addEventListener("touchend",e=>{ if(!whyTouch) return; const t=e.changedTouches[0], dx=t.clientX-whyTouch.x, dy=t.clientY-whyTouch.y; whyTouch=null;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5){ const b=document.querySelector('.learnwhy [data-whynav="'+(dx<0?1:-1)+'"]'); if(b) b.click(); } },{passive:true});
$("learn").addEventListener("change",e=>{
  const xs=e.target.closest("[data-xp]"); if(xs){ const X=expoState(), k=xs.dataset.xp; X[k]=k==="L"||k==="subj"?xs.value:+xs.value; if(k==="f"&&X.N) X.N=near3(xApList(X.f),X.N); state.xpTrade=""; xpRedraw(e.target.closest(".xp")); return; }
  const lcs=e.target.closest("[data-lc]"); if(lcs){ state.lcBody=lcs.value; state.lcF=null; e.target.closest(".cropw").outerHTML=learnCrop(); return; }
  const sel=e.target.closest("[data-lf]"); if(sel){ state[sel.dataset.lf]=+sel.value; const w=e.target.closest(".dof"); w.outerHTML=learnDof(); return; }
  const cs=e.target.closest("[data-cam]"); if(cs){ state.camCmp[+cs.dataset.cam]=cs.value; store.set("camCmp",state.camCmp); const w=e.target.closest(".camcmp"); w.outerHTML=learnCams(); return; }
  const cb=e.target.closest("[data-drill]"); if(cb){ cb.checked?state.drills.add(cb.dataset.drill):state.drills.delete(cb.dataset.drill); store.set("drills",[...state.drills]); const h=cb.closest(".drills").nextElementSibling; if(h) h.textContent=state.drills.size+" of "+DRILLS.length+" done."; }
});
$("today").addEventListener("click",e=>{
  const wk=e.target.closest("[data-week]"); if(wk){ const k=+wk.dataset.week; state.weekSel=state.weekSel===k?null:k; renderToday(); return; }
  const wp=e.target.closest("[data-weekplan]"); if(wp){ weekPlan(wp.dataset.weekplan); return; }
  const wm=e.target.closest("[data-weekmap]"); if(wm){ weekMap(wm.dataset.weekmap); return; }
  const al=e.target.closest("[data-alert]"); if(al){ alertMap(al.dataset.alert); return; }
  if(e.target.closest("[data-homeedit]")){ state.homeEdit=true; renderToday(); return; }
  if(e.target.closest("[data-homedone]")){ state.homeEdit=false; renderToday(); return; }
  if(e.target.closest("[data-homeclear]")){ state.home=null; store.set("home",null); state.homeEdit=false; renderToday(); return; }
  const hm=e.target.closest("[data-homemode]"); if(hm){ if(state.home){ state.home.mode=hm.dataset.homemode; store.set("home",state.home); } else state.homeMode=hm.dataset.homemode; renderToday(); return; }
  const hh=e.target.closest("[data-homehere]"); if(hh){ const msg=()=>$("homeMsg"); hh.textContent="Finding you…";
    const fail=()=>{ renderToday(); if(msg()) msg().textContent="Your location is not available here. In the installed app on your phone, allow location access for Shot List and try again at home."; };
    if(!navigator.geolocation){ fail(); return; }
    try{ navigator.geolocation.getCurrentPosition(p=>{ state.home={lat:+p.coords.latitude.toFixed(4),lon:+p.coords.longitude.toFixed(4),mode:(state.home&&state.home.mode)||state.homeMode||"car"}; store.set("home",state.home); state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; state.homeEdit=false; renderToday(); }, fail, {timeout:12000,maximumAge:60000}); }catch(err){ fail(); }
    return; }
  const tm=e.target.closest("[data-tat]"); if(tm){ state.todayAt=tm.dataset.tat==="now"?null:+tm.dataset.tat; renderToday(); return; }
  if(e.target.closest("[data-shootnow]")){ shootNow(); return; }
  const tg=e.target.closest("[data-guidego]"); if(tg){ const id=tg.dataset.guidego; state.mapT=null; state.view="map"; render(); guideStart(id); requestAnimationFrame(()=>requestAnimationFrame(()=>{ mapSelectSpot(id); guideRender(); })); return; }
  const tl=e.target.closest("[data-todayloc]"); if(tl){ tl.textContent="…"; const done=()=>{ renderToday(); if(!state.pos) $("today").insertAdjacentHTML("afterbegin",'<p class="msg">Your location is not available here. In the installed app, allow location access for Shot List when asked.</p>'); };
    if(!navigator.geolocation){ done(); return; } try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; fillPlaces(); syncNear(); done(); }, done, {timeout:10000,maximumAge:120000}); }catch(err){ done(); } return; }
  const mg=e.target.closest("[data-mapgo]"); if(mg){ const id=mg.dataset.mapgo; state.mapT=state.todayAt; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>{ mapSelect(id); })); return; }
  const pd=e.target.closest("[data-planday]"); if(pd){ planToday(pd.dataset.planday); return; }
  const gv=e.target.closest("[data-goview]"); if(gv){ state.view=gv.dataset.goview; render(); window.scrollTo({top:0}); return; }
  const ev=e.target.closest("[data-event]"); if(ev){ showEvent(ev.dataset.event); return; }
  const r=e.target.closest(".row[data-id]"); if(r){ show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); }
});
setInterval(()=>{ try{ if(state.view==="today"&&!document.hidden) renderToday(); }catch(e){} }, 60000);
$("views").addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return; const v=b.dataset.v; if(v==="learn"&&state.view==="learn") state.learnId=null;
  state.view = v==="ideas" ? (state.ideasMode==="list" ? (state.listView||"browse") : "shoot") : v; render(); window.scrollTo({top:0}); });
$("ideaMode").addEventListener("click",e=>{ const b=e.target.closest("[data-im]"); if(!b) return; state.ideasMode=b.dataset.im; store.set("ideasMode",state.ideasMode);
  state.view = state.ideasMode==="list" ? (state.listView||"browse") : "shoot"; render(); });
$("next").addEventListener("click",goNext);
$("back").addEventListener("click",goBack);
function toggle(set,key){ if(!state.current) return; set.has(state.current)?set.delete(state.current):set.add(state.current); store.set(key,[...set]); render(); }
$("save").addEventListener("click",()=>toggle(state.saved,"saved"));
$("done").addEventListener("click",()=>{ if(!state.current) return; logShot(state.current); render(); });
function notesText(){ return cityIdeas().filter(x=>state.notes[x.id]).map(x=>PLACES[x.p].name+" · "+x.t+" ["+x.id+"]: "+state.notes[x.id].trim()).join("\n"); }
$("list").addEventListener("click",e=>{
  const lv=e.target.closest("[data-listv]"); if(lv){ state.view=lv.dataset.listv; render(); return; }
  if(e.target.closest("#copyNotes")){ const t=notesText(), bar=e.target.closest(".notesbar"), b=e.target.closest("#copyNotes");
    const fallback=()=>{ if(!bar.querySelector("textarea")){ const ta=document.createElement("textarea"); ta.readOnly=true; ta.value=t; bar.appendChild(ta); ta.focus(); ta.select(); } b.textContent="Select and copy the text below"; };
    try{ navigator.clipboard.writeText(t).then(()=>{ b.textContent="Copied"; }, fallback); }catch(err){ fallback(); }
    return; }
  const r=e.target.closest(".row"); if(!r) return; show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0});});
$("card").addEventListener("click",e=>{
  if(e.target.closest("[data-stay]")){ const x=IDEAS.find(y=>y.id===state.current); if(x) toggleStay(x.p); return; }
  if(e.target.closest("[data-street]")){ streetOpen(); return; }
  const gp=e.target.closest("[data-gotoprices]"); if(gp){ openLearn("prices",".prices"); return; }
  const lc=e.target.closest("[data-learncrop]"); if(lc){ state.lcBody=state.camera==="q328"?"q328":"q343"; state.lcF=+lc.dataset.learncrop; openLearn("camera",".cropw"); return; }
  const wd=e.target.closest("[data-widen]"); if(wd){ widen(wd.dataset.widen); return; }
  const rt=e.target.closest("[data-rate]"); if(rt&&state.current){ rateShot(state.current,rt.dataset.rate); state.justShot=null; renderCard(); return; }
  if(e.target.closest("[data-undoshot]")&&state.current){ undoShot(state.current); render(); return; }
  const pe=e.target.closest("[data-planev]"); if(pe){ planEvent(pe.dataset.planev); return; }
  const gg=e.target.closest("[data-guidego]"); if(gg){ const id=gg.dataset.guidego; state.mapT=null; state.view="map"; render(); guideStart(id); requestAnimationFrame(()=>requestAnimationFrame(()=>{ mapSelectSpot(id); guideRender(); })); return; }
  const sm=e.target.closest("[data-spotmap]"); if(sm){ const id=sm.dataset.spotmap; state.mapT=null; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>mapSelectSpot(id))); return; }
  const pm=e.target.closest("[data-placemap]"); if(pm){ const id=pm.dataset.placemap; state.mapT=null; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>mapSelect(id))); return; }
  const t=e.target.closest("[data-tab]"); if(t){ state.tab=t.dataset.tab; openTip=null; renderCard(); return; }
  const b=e.target.closest("[data-tip]"); if(b){ const was=openTip; openTip = openTip===b.dataset.tip ? null : b.dataset.tip; if(b.dataset.tip==="c") renderCard(); else { tipSheet(); if(openTip===null&&was!==null) b.focus(); } }
});
$("card").addEventListener("input",e=>{ if(e.target.id!=="note"||!state.current) return;
  const v=e.target.value.trim(); if(v) state.notes[state.current]=e.target.value; else delete state.notes[state.current]; store.set("notes",state.notes); });
document.addEventListener("click",e=>{ if(e.target.closest&&e.target.closest("[data-setopen]")){ renderSettings(); sheetOpen("setSheet"); } });
$("card").addEventListener("change",e=>{ if(e.target.id==="camera"){ state.camera=e.target.value; store.set("camera",state.camera); openTip=null; renderCard(); } });

/* Seasonal and event ideas: Work it, tips, Compose, stance, availability and where to stand. */
Object.assign(WORKX,{"soho-halloween":["the face under the costume","Eye level, close",2,"When they do something ordinary: fix a mask, check a phone, laugh with a friend"],
 "wburg-marathon":["one still spectator or sign at the barrier", "Eye level, braced on the barrier", 4, "When a runner high-fives or reacts to the spectator you have focused on: the runner blurs, the spectator stays sharp"],
 "cpark-balloons":["the person beside the balloon","Eye level",5,"When someone stands beside the balloon looking up, or a handler ducks under the net"],
 "midtown-parade":["the balloon and the handlers below it","Eye level at the barrier, or crouched to look up",20,"When the balloon is between the towers and the handlers lean on the ropes"],
 "midtown-windows":["the faces lit by the window","Eye level, beside the window",2,"When a face lights up: a child pointing, a couple turning to each other"],
 "midtown-rink":["the skater resting at the rail","Eye level, braced on the rink rail",4,"When a skater stops at the rail and the rest stream past"],
 "union-market":["the face lit by the stall","Eye level, across the lane",2.5,"When a shopper leans in to look or the vendor hands something over"],
 "wsp-snow":["the walker on the path","Eye level, centred on the arch",20,"When one walker is on the path below the arch, snow falling between you"],
 "chinatown-lunar":["the lion's head and the shopkeeper's face","Chest height, beside the shop door",2.5,"As the lion rears up to take the envelope"]});
Object.assign(WORK_TIPS,{"soho-halloween":["Arrive by 6 pm: the line-up is the best part, before the crowds pack the barriers north of Spring Street.","Use the street lamps and shop windows as your light; flash flattens the make-up."],
 "wburg-marathon":["The leaders pass in mid-morning; the big crowd of runners comes from about 10:30 am into the early afternoon.","Signs held up by the crowd make the picture; frame a runner reading one."],
 "cpark-balloons":["Go late in the afternoon: the balloons are fuller and the street lights come on.","The line keeps moving; shoot as you walk and do not stop the crowd."],
 "midtown-parade":["The barriers fill early; the parade reaches Sixth Avenue in the 50s at about 9:30 am.","Strong wind keeps the big balloons low or grounds them; check the forecast the night before."],
 "midtown-windows":["Saks lights up its facade in a short show every few minutes after dark; faces turn up toward it.","Weeknights before 7 pm are less crowded than weekends."],
 "midtown-rink":["Weekday dusk has fewer, clearer skaters than weekend evenings.","The market stalls around the rink add warm light; use them as the background."],
 "union-market":["Weekday evenings are calmer than weekends.","Steam from the cider and food stalls glows in the stall lights; shoot through it."],
 "wsp-snow":["Around 1/125 s shows snowflakes as short streaks; 1/500 s freezes them as dots.", "Add +0.7 to +1 stop so the snow is white, not grey."],
 "chinatown-lunar":["The confetti cannons fire in Sara D. Roosevelt Park late in the morning; lion dances tour the shops through the afternoon.","Firecrackers are loud and close: keep a step back and shield the lens."]});
Object.assign(COMPOSE,{"soho-halloween":["juxta","The costume and an ordinary moment in one frame: a ghoul checking a phone, a giant puppet with a sneaker showing under it. Get close enough that face and costume share the frame, with the street lights and crowd soft behind."],
 "wburg-marathon":["diag","Turn until Bedford Avenue runs from a lower corner up toward the far end, so the stream of runners fills the diagonal. Put one still spectator or sign sharp on a third and let the runners blur along the line."],
 "cpark-balloons":["juxta","A giant balloon face or limb filling most of the frame, with one small person beside it for scale. Get close to the net so the balloon runs off the edges."],
 "midtown-parade":["layers","Three layers: heads and raised phones along the bottom, the handlers and ropes in the middle, the balloon high between the towers. Shoot up the avenue so the towers frame it."],
 "midtown-windows":["light","The window light on the faces is the subject. Keep the bright display out of the frame or at one edge, and let the street and the crowd behind fall dark."],
 "midtown-rink":["juxta","One skater still at the rail, sharp, against a ring of others blurred by the slow shutter. Keep the lit towers along the top of the frame."],
 "union-market":["frame","Use a stall's lit opening as the frame: the vendor or a shopper inside it, the dark lane around. Keep the bare bulbs at the top edge or out of the frame."],
 "wsp-snow":["space", "Let the white paths and the falling snow fill most of the frame, the arch centred and softened by the falling snow, one dark walker small near the bottom."],
 "chinatown-lunar":["fill","The lion's head and the shopkeeper's hands with the red envelope fill the frame; let the confetti and the crowd soften behind."]});
Object.assign(STANCE_OF,{"soho-halloween":"side","wburg-marathon":"anchor","cpark-balloons":"wait","midtown-parade":"wait","midtown-windows":"side","midtown-rink":"anchor","union-market":"side","wsp-snow":"down","chinatown-lunar":"side"});
Object.assign(AVAIL,{"soho-halloween":{ev:"halloween",h:[[18,23]]},"wburg-marathon":{ev:"marathon",h:[[9,15]]},"cpark-balloons":{ev:"balloons",h:[[12,18]]},"midtown-parade":{ev:"thanksgiving",h:[[8,12]]},
 "midtown-windows":{span:[[11,20],[1,6]],h:[[16,23]]},"midtown-rink":{span:[[10,30],[3,1]],h:[[8,22]]},"union-market":{span:[[11,14],[12,24]],h:[[11,21]]},"wsp-snow":{wx:"snow"},"chinatown-lunar":{ev:"lunar",h:[[10,17]]}});
SPOTS.soho.push([40.725152,-74.004165,15,"Sixth Avenue at Spring Street","The marchers line up along Sixth Avenue from Canal Street before the 7 pm start; work along the queue.","soho-halloween"]);
SPOTS.wburg.push([40.715805,-73.959911,210,"Bedford Avenue at North 3rd Street","Face south down Bedford Avenue so the runners come toward you; brace on the barrier.","wburg-marathon"]);
SPOTS.cpark.push([40.782558,-73.972881,119,"West 81st Street near Central Park West","The viewing line runs along this block toward Central Park West, past the balloons.","cpark-balloons"]);
SPOTS.midtown.push([40.758933,-73.981078,29,"Sixth Avenue at 48th Street","At the barrier, looking up the avenue as the balloons come down between the towers.","midtown-parade"]);
SPOTS.midtown.push([40.7588,-73.977,160,"Fifth Avenue at Saks, 49th to 50th Street","Beside the windows and a little to the side, facing along the pavement so the faces are lit.","midtown-windows"]);
SPOTS.midtown.push([40.753631,-73.983546,29,"Bryant Park rink","At the rail of the rink on the lawn, facing the towers on 42nd Street.","midtown-rink"]);
SPOTS.union.push([40.734987,-73.990952,29,"Holiday Market, south-west plaza","The market lanes by 14th Street and Broadway; stop where a stall lights a face.","union-market"]);
SPOTS.wsp.push([40.7307,-73.9973,29,"South of the fountain","The arch centred with Fifth Avenue behind it, in falling snow.","wsp-snow"]);
SPOTS.chinatown.push([40.7155,-73.9984,209,"Mott Street at Bayard Street","Lion dancers work their way down Mott Street from shop to shop; stand beside a doorway.","chinatown-lunar"]);
(()=>{ const n=k=>SPOTS[k].length-1, add=(k,v)=>{ SV_PANO[k+":"+n(k)]=v; };
  add("soho",["bHgrYlaFAMSdK8s5FJNTfg",0,null,null]); add("wburg",["7ydzGgebwMSwtkgKwkTpjg",0,null,null]); add("cpark",["5dZ084wK25BHka7zj43dxA",0,null,null]);
  SV_PANO["midtown:"+(n("midtown")-2)]=["wFI2mCHjFQFX9ZKFUlYfrQ",0,null,null]; SV_PANO["midtown:"+(n("midtown")-1)]=SV_PANO["midtown:2"]; SV_PANO["midtown:"+n("midtown")]=["wrkE0z0J2dD_1XSF3qYYcg",0,null,null,"Google's picture is from summer; the rink is on this lawn from late October to early March."];
  add("union",["Bma9XBXgfne6Jq-S83dUOg",0,null,null,"Google's picture is from spring; the market stalls stand on this plaza from mid-November."]); add("wsp",SV_PANO["wsp:0"]); add("chinatown",SV_PANO["chinatown:4"]); })();
swipeable($("card"),goNext,goBack); swipeable($("street"),goNext,goBack);
syncChips(); pick(); state.history=[]; render();
