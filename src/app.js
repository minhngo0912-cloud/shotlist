
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
  zone:["MF","Not used (focus ring pre-set)","Multi-Field","0 (in hard sun use 1/640 s instead; Auto ISO stops at 100)","PASM · M with Auto ISO","3:2","Hybrid","Auto"],
  freeze:["AFc","Eye/Face/Body Detection","Multi-Field","0","PASM · M with Auto ISO","3:2","Mechanical (no skew on fast movement)","Auto"],
  drag:["AFs","Field, on the still subject","Multi-Field","0","PASM · S (shutter priority)","3:2","Mechanical","Auto"],
  deep:["AFs","Field, a third of the way into the scene","Multi-Field","0, or −0.3 to hold the sky","PASM · A (aperture priority)","3:2, or 16:9 for a skyline","Hybrid","Auto, or Daylight to keep a set consistent"],
  shallow:["AFs","Eye/Face Detection","Center-Weighted","0, or +0.3 if the face is backlit","PASM · A (aperture priority)","3:2","Hybrid (wide open in sun needs the electronic range)","Auto"],
  night:["AFs","Field, on a lit edge or sign","Multi-Field","−0.7","PASM · M with Auto ISO","3:2","Mechanical (LED screens can band with electronic)","Daylight, so neon keeps its colour"],
  silhouette:["AFs","Field, on the edge of the figure","Multi-Field","−1.3","PASM · A (aperture priority)","3:2","Hybrid","Daylight, to keep the warmth"],
  interior:["AFs","Field","Center-Weighted","0","PASM · M with Auto ISO","3:2","Mechanical (artificial light can band with electronic)","Auto"],
  detail:["AFs","Spot","Multi-Field","0","PASM · A (aperture priority)","3:2, or 1:1 for a single sign","Mechanical","Auto"]
};
/* The Q3's own scene modes are fully automatic and ignore the dials, so every card uses PASM. Where one comes close to the recipe,
   it is offered as a shortcut; where none does (zone focus, slow shutter), the card says to stay on PASM. */
const SCENE_ALT = {zone:null, freeze:"Sports", drag:null, deep:"Landscape", shallow:"Portrait", night:"Night Portrait, if a person is close with the lights behind", silhouette:"Sunset", interior:null, detail:null};
const SETUP_LABELS = ["Focus mode","Focus area","Metering","Exposure comp.","Scene mode","Aspect ratio","Shutter type","White balance"];
// Explanations shown when a setting is tapped. Index matches SETUP_LABELS; "exp" is the aperture/shutter/ISO line.
const TIPS = {
  exp:{t:"Aperture · shutter · ISO", what:"Three settings decide how bright the picture is, and two of them also change how it looks.",
    opts:[["Aperture (f-number)","How much is sharp front to back. f/2 blurs the background; f/8 keeps most of the scene sharp."],["Shutter speed","How movement looks. 1/500 s freezes walkers; 1/15 s blurs them."],["ISO","Sensitivity. Auto ISO raises it so the aperture and shutter stay where you put them."]],
    more:"In A mode the shutter speed shown is the slowest to allow: set it as the Auto ISO shutter speed limit, and the camera raises ISO instead of going slower."},
  0:{t:"Focus mode", what:"How the camera focuses when you half-press.",
    opts:[["AFs","Locks focus once. For still subjects."],["AFc","Keeps refocusing while you hold. For people moving toward or away from you."],["MF","You set the distance on the lens ring, so there is no delay when you press."],["iAF","Switches between AFs and AFc on its own. It does not always pick right, so cards name one or the other."]]},
  1:{t:"Focus area", what:"Where in the frame the camera looks for focus.",
    opts:[["Field","One movable box you place on the subject."],["Spot","A smaller box, for precise targets."],["Eye/Face/Body Detection","Finds a person and follows them."],["Multi-Field","The camera chooses. Fast, but can pick the wrong thing in a crowd."],["Zone","A block of points, for fast action."],["Tracking","Follows whatever you place the box on."]]},
  2:{t:"Metering", what:"How the camera measures brightness to set the exposure.",
    opts:[["Multi-Field","Reads the whole frame. Right most of the time."],["Center-Weighted","Favours the middle. For a central subject with much brighter or darker edges."],["Spot","Reads one small point."],["Highlight-Weighted","Protects the brightest areas from blowing out."]]},
  3:{t:"Exposure compensation", what:"Makes the picture brighter or darker than the meter suggests.",
    opts:[["+ (plus)","Brighter. When a backlit face comes out too dark."],["− (minus)","Darker. When bright lights or sky are washed out."]],
    more:"It only works when the camera chooses at least one of shutter, aperture or ISO. In M with Auto ISO it changes the ISO, which cannot go below 100, so in full sun minus may do nothing."},
  4:{t:"Scene mode", what:"The Scene Mode item in the Q3 menu. Use PASM: the dials control exposure, and the settings on this card only work there.",
    opts:[["P","Shutter dial and aperture ring both on A."],["A (aperture priority)","Shutter dial on A, aperture set on the ring."],["S (shutter priority)","Aperture ring on A, speed set on the dial."],["M","Both set by hand. Here with ISO on Auto."]],
    group:["Scene modes: fully automatic, the dials are ignored",[["Auto","General snapshots, or handing the camera to someone."],["Sports","Moving subjects and action."],["Portrait","A person."],["Landscape","Broad outdoor scenes."],["Night Portrait","A person against night lights."],["Snow / Beach","Bright, reflective surroundings."],["Fireworks","Bursts and light trails."],["Candlelight","Dim, candle-lit scenes."],["Sunset","Sunset skies."],["Digiscoping","Through a spotting scope."]]],
    more:"Switch back to PASM after using a scene mode."},
  5:{t:"Aspect ratio", what:"The shape of the picture. Other ratios show crop lines while you frame.",
    opts:[["3:2","The whole sensor."],["16:9","Wider. Suits skylines."],["1:1","Square. Suits a single centred subject."]]},
  6:{t:"Shutter type", what:"Which shutter takes the picture.",
    opts:[["Mechanical","A physical shutter, up to 1/2000 s. Reliable under artificial light and with fast movement."],["Electronic","Silent, up to 1/16000 s, but can bend fast subjects and band under LED light."],["Hybrid","Mechanical normally; electronic only when the light needs a faster speed."]]},
  7:{t:"White balance", what:"The overall colour cast, so whites look white. With DNG files you can change it afterwards without losing quality.",
    opts:[["Auto","Adjusts for each scene."],["Daylight","Fixed, so warm light stays warm, neon keeps its colour and a set of frames matches."],["Cloudy","Warmer. Flatters skin in flat light."]]}
};
// The value on a card is a main setting plus, often, a note: "Mechanical (no skew on fast movement)", "3:2, or 16:9 for a skyline".
function splitVal(v){ const m=/^(.*?)(?: \((.*)\)|, (or .*))$/.exec(v); return m ? [m[1], m[2]||m[3]] : [v,""]; }
/* The explanation for a setting, as a sheet over the page: this idea's value first, then the options, with this idea's one marked. */
function tipSheet(){ const box=$("tipSheet"); if(!box) return; const T=openTip!==null&&openTip!=="c"&&TIPS[openTip];
  if(!T||state.view!=="shoot"||state.tab!=="settings"){ box.hidden=true; document.body.classList.remove("tipopen"); return; }
  const x=IDEAS.find(i=>i.id===state.current), cam=CAMERAS[state.camera], su=x&&setupFor(cam,x.r), val=openTip==="exp" ? (cam.recipes[x.r]||[])[0] : su&&su[+openTip], [main,note]=splitVal(val||"");
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
function setupFor(cam, recipe){
  if(!cam.setup) return null;
  const s = SETUP[recipe];
  if(cam.setup==="leica") return s;
  return s.map(v=>{ for(const [a,b] of GENERIC_TERMS){ if(v.startsWith(a)) return b+v.slice(a.length); } return v; });
}
const CAMERAS = {
  q343:{name:"Leica Q3 43", setup:"leica", recipes:{
    zone:["f/8 · 1/500 s · Auto ISO","Switch to manual focus and set the ring to the distance you will work at: about 2 m for people from the waist up (sharp from roughly 1.6 to 2.7 m), about 3 m for whole figures (2.2 to 4.9 m). Then you never wait for autofocus."],
    freeze:["f/4 · 1/1000 s · Auto ISO","Continuous AF with body and eye detection. Shoot short bursts through the peak of the action."],
    drag:["1/15 s · S mode · Auto ISO","Shutter priority: you set 1/15 s, the camera sets the aperture (about f/11 outdoors in shade, wide open indoors) and Auto ISO fills in where the light is dim. Stabilization on, elbows in, braced on a pole or railing. These settings suit shade, deep streets and dusk. In full sun 1/15 s is out of reach: f/16 and ISO 50 give 1/60 s, which blurs walkers only a little, so wait for shade or fit a 3-stop ND filter (49 mm) for 1/8 s."],
    deep:["f/8 · 1/250 s · Auto ISO","43 mm will not take in the whole scene, so step back or choose the part that says the most. Use the level to keep verticals straight."],
    shallow:["f/2 · 1/500 s · Auto ISO","Eye and face detection AF. At about 2 m, f/2 lifts one person clearly off the background."],
    night:["f/2 · 1/125 s · Auto ISO, max 6400","Expose for the lights: dial in −0.7 EV so neon and screens keep their colour."],
    silhouette:["f/5.6 · auto shutter · ISO 100 · −1.3 EV","Meter for the bright area and let people go black. The DNG keeps shadow detail if you change your mind."],
    interior:["f/2.8 · 1/125 s · Auto ISO, max 6400","Stabilization steadies the building, not the people. Hold 1/125 s whenever faces matter."],
    detail:["f/4 · 1/250 s · Auto ISO","For anything closer than 60 cm, twist the macro ring; it focuses down to about 27 cm. The 60 or 75 mm crop frames help isolate a sign."]
  }},
  q328:{name:"Leica Q3 (28 mm)", setup:"leica", recipes:{
    zone:["f/8 · 1/500 s · Auto ISO","Switch to manual focus and set the ring to about 3 m: everything from roughly 1.6 m to the far distance is sharp. For people from the waist up, set 2 m (about 1.25 to 5 m). Work at 1.5 to 2 m from people or they will be small in the frame."],
    freeze:["f/4 · 1/1000 s · Auto ISO","Continuous AF with body and eye detection. Get closer than feels natural, then shoot short bursts through the peak."],
    drag:["1/15 s · S mode · Auto ISO","Shutter priority: you set 1/15 s, the camera sets the aperture (about f/11 outdoors in shade, wide open indoors) and Auto ISO fills in where the light is dim. Stabilization on, elbows in. These settings suit shade, deep streets and dusk; in full sun f/16 and ISO 50 only get you to 1/60 s, so wait for shade or fit a 3-stop ND filter (49 mm). Blur shows less at 28 mm, so try 1/8 s as well."],
    deep:["f/8 · 1/250 s · Auto ISO","28 mm takes in the whole scene, so check the edges for clutter and put something in the foreground. Keep the camera level or buildings lean."],
    shallow:["f/1.7 · 1/500 s · Auto ISO","Eye and face detection AF. Background blur is modest at 28 mm: get within about 1 m, or keep the subject far from what is behind them."],
    night:["f/1.7 · 1/125 s · Auto ISO, max 6400","Expose for the lights: dial in −0.7 EV so neon and screens keep their colour."],
    silhouette:["f/5.6 · auto shutter · ISO 100 · −1.3 EV","Meter for the bright area and let people go black. The DNG keeps shadow detail if you change your mind."],
    interior:["f/2.8 · 1/125 s · Auto ISO, max 6400","Stabilization steadies the building, not the people. Hold 1/125 s whenever faces matter."],
    detail:["f/4 · 1/250 s · Auto ISO","Twist the macro ring to focus down to about 17 cm. The 50 or 75 mm crop frames help isolate a sign without moving in."]
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
["chinatown","place","The bend on Doyers Street","The curve of the street with signs stacked on both sides and the pavement leading the eye around the corner.","Stand at the Pell Street end and keep the buildings upright. Wait for one person at the bend to give the street its scale.","Ten frames at most, one for each person who rounds the bend.","deep",["am","gold"]],
["chinatown","moment","The handoff","Money, bags and fish changing hands at the pavement stalls on Mott Street, between Grand and Hester Street.","Stand beside the scale, not in front of the stall. Frame both people from the waist up so hands and faces share the picture.","Press only when two hands are in the frame.","zone",["am","mid"]],
["chinatown","energy","Canal Street current","Shoppers squeezing past vendors and stacked boxes, all moving in different directions.","Plant yourself against a pole and let the crowd flow around you. Keep one vendor standing still while everyone else blurs.","Stay in one spot for fifteen minutes.","drag",["mid","gold"]],
["chinatown","mood","Steam and neon","Fogged restaurant windows, kitchen steam and red signs on Mott and Bayard after dark.","Shoot through the glass and let the reflections sit on top of the people inside. Get close to the window to control what reflects.","Every frame must include glass.","night",["night","rain"]],
["chinatown","odd","Columbus Park spectators","Card games, xiangqi boards and erhu players, each with a ring of onlookers.","Photograph the watchers, not the players. Look for the one face reacting differently from the rest of the ring.","No frames of the board itself.","zone",["am","mid"]],

["gct","place","Concourse from the west stairs","The clock, the departure boards and the constellation ceiling in one view.","Go up the west staircase and shoot handheld from the top of the stairs. Choose either floor and clock, or windows and ceiling, unless your lens is wide enough to hold both.","Make one picture that says Grand Central without the ceiling.","interior",["am","mid","gold","night","rain"]],
["gct","moment","Meeting at the clock","People scanning the crowd, then the wave, the hug or the missed connection at the information booth.","Stand about five metres from the booth with the clock in the upper third. Pick one waiting person and stay with them.","Follow one person until their meeting happens or they leave.","interior",["gold","night"]],
["gct","energy","Rush-hour river","Evening commuters crossing the marble floor in every direction.","Brace on the stair rail at the top of the west staircase and find one person standing still to check the departures board.","Shoot only between 5 and 6 pm on a weekday.","drag",["gold"]],
["gct","mood","Pools of light","The brightest patches of the marble floor, with people crossing them as dark shapes. Direct sun rarely reaches the floor now that towers surround the building.","Find the brightest patch you can, expose for it and wait at its edge. Press when a single figure is fully inside it.","One figure per frame, never two.","silhouette",["am","mid","gold"]],
["gct","odd","The whispering corners","People facing the tiled corners outside the Oyster Bar, talking to the wall while a friend listens across the arch.","Frame one corner tightly so the person appears to be speaking to the tiles. A second frame can show both ends of the arch.","Do not explain the picture; leave the listener out of at least one frame.","interior",["am","mid","gold","night","rain"]],

["tsq","place","From the red steps","Broadway and Seventh Avenue converging under the screens, seen from above the crowd.","Climb the red steps at Duffy Square and look south. Put the crowd along the bottom edge and let the screens fill the rest.","Shoot it at dusk, when the sky and the screens are the same brightness.","deep",["gold","night"]],
["tsq","moment","The first look up","The face of someone seeing the square for the first time.","Stand near a subway exit with your back to the screens and watch the people coming up the stairs.","Faces only; no screens in the frame.","freeze",["gold","night"]],
["tsq","energy","Colour wash","A crowd changing colour every few seconds as the billboards change.","Hold one composition and take the same frame under red, blue and white light. A slow shutter turns the walkers into streaks of that colour.","Three frames, same spot, three colours.","drag",["night"]],
["tsq","mood","Rain mirror","The screens repeated in wet pavement and puddles, with umbrellas cutting through them.","Get the camera low to the ground at a puddle's edge. Let the reflection take two thirds of the frame.","No sky and no real billboard, only its reflection.","night",["rain","night"]],
["tsq","odd","Characters off duty","Costumed performers with the head off, eating lunch, counting cash or on the phone.","Look at the edges of the plaza and the side streets, where they take breaks. Keep a respectful distance and do not ask for a pose.","The costume and the ordinary act must both be in the frame.","zone",["mid","gold"]],

["wsp","place","The arch and Fifth Avenue","The arch with the fountain in front of it, or Fifth Avenue running north through it.","Stand south of the fountain and centre the arch. Then walk under it and frame the avenue with the arch as a border.","One symmetrical frame and one deliberately off-centre.","deep",["am","gold"]],
["wsp","moment","Chess corner","A hand hovering over a piece, a slap on the clock, the look across the table.","Work the tables in the southwest corner. Sit down at the next table so the camera is at the players' eye level.","Wait for hands; no frames of people only thinking.","shallow",["mid","gold"]],
["wsp","energy","The fountain ring","Dancers, skaters and musicians with a crowd around them.","Get to the front of the ring and crouch. Catch the performer at the top of a jump or spin with the crowd behind.","Feet off the ground in every frame.","freeze",["mid","gold"]],
["wsp","mood","Bench light","Low sun through the trees, long shadows across the paths and someone alone with a book.","Shoot toward the sun along the western paths. Let the reader be a small dark shape in a large bright frame.","The person takes up less than a tenth of the picture.","silhouette",["gold"]],
["wsp","odd","The regulars","The grand piano wheeled into the park, the men covered in pigeons, and poets typing verses to order.","Spend time before you shoot. Ask what they are doing; the picture after the conversation is usually better.","Talk to one stranger before photographing them.","shallow",["mid","gold"]],

["dumbo","place","Washington Street frame","The Manhattan Bridge tower between brick warehouses, with the Empire State Building visible through its base.","Stand on Washington Street between Front and Water Street. Move left and right until the Empire State Building sits inside the opening in the tower.","Be there before 8 am, before the crowd arrives.","deep",["am"]],
["dumbo","moment","Between the poses","Couples, wedding parties and tourists posing in the middle of the street, and what happens just after the pose ends.","Stand to one side of someone else's shoot. Wait for the laugh, the dress being fixed or the dash away from a car.","Press only after their photographer lowers the camera.","zone",["mid","gold"]],
["dumbo","energy","Under the bridge","Trains crossing overhead, cyclists and skaters coming through the archway on Water Street.","Stand inside the arch facing the light. Blur a cyclist against the still stone.","Every frame needs something moving and something that has not moved in a century.","drag",["mid","gold"]],
["dumbo","mood","Blue hour at Pebble Beach","The lower Manhattan skyline switching on while the carousel glows in its glass box.","Use the rocks or a railing as a support. Put a single person at the water's edge in front of the lights.","Shoot only in the twenty minutes after sunset.","night",["gold","night"]],
["dumbo","odd","Rails in the cobbles","Old freight tracks running through the Belgian block and stopping at nothing.","Follow the rails on Plymouth Street, between Pearl and Bridge Street. Get low and let them lead to a modern detail such as a scooter or a stroller.","Old and new must share the frame.","detail",["am","mid","rain"]],

["coney","place","Boardwalk and Wonder Wheel","The wheel, the parachute tower and the boardwalk planks running to the horizon.","Shoot along the boardwalk with the planks as leading lines. Keep the wheel large by walking toward it, not by cropping.","One frame with people, one with none.","deep",["am","gold"]],
["coney","moment","The drop","Faces on the Cyclone as it goes over the first hill, or a child's first bite of a hot dog.","For the coaster, stand along West 10th Street, which runs beside the long side of the ride. For food, wait near the counter exits.","Open mouths only.","freeze",["mid","gold"]],
["coney","energy","Rides in motion","Spinning rides turning into rings of light at dusk.","Brace on a fence in Luna Park and keep the ticket booth or a waiting parent sharp while the ride blurs.","Try 1/15, 1/8 and 1/4 s on the same ride and keep one.","drag",["gold","night"]],
["coney","mood","Out of season","Shuttered stands, fog over the beach and one walker on a mile of empty boardwalk.","Go on a weekday morning outside summer. Leave most of the frame empty and place the walker near an edge.","Go only when the weather is bad.","deep",["am","rain"]],
["coney","odd","Hand-painted signs","Sideshow banners, painted clams and corn dogs, and lettering no computer made.","Fill the frame with one sign, then make a second frame where a passer-by echoes its colour or its pose.","Collect five signs, each with a person who matches it.","detail",["mid","gold"]],

["soho","place","Cast-iron canyon","The facades, fire escapes and cobblestones of Greene Street.","Stand in the middle of a quiet block and shoot straight down the street. Then cross over and shoot one facade square-on.","Keep every vertical line vertical.","deep",["am","rain"]],
["soho","moment","Doorway pause","People stepping out of a shop and stopping to check a phone, adjust a bag or light a cigarette.","Pick one doorway with a good frame around it and wait across the pavement. The pause lasts two seconds.","One doorway for twenty minutes.","shallow",["mid","gold"]],
["soho","energy","Stepping off the curb","The crowd at Broadway and Prince launching into the crossing when the light changes.","Stand on the opposite corner at the kerb edge. Shoot the first two seconds of each walk signal.","Shoot five light cycles and keep one frame from each.","zone",["mid","gold"]],
["soho","mood","Fire-escape shadows","Hard diagonal shadows laid across the building fronts by low sun.","Expose for the sunlit wall. Wait for a person to cross a bright strip at street level beneath the shadow pattern.","The shadow is the subject; the person is punctuation.","silhouette",["mid","gold"]],
["soho","odd","Window doubles","Mannequins and passers-by merged in the shop glass.","Stand at an angle to the window until a mannequin and a reflected walker line up. Shift a step to change what the glass shows.","A real person and a fake one in every frame.","zone",["mid","gold","rain"]],

["jh","place","Under the 7","Roosevelt Avenue running beneath the elevated tracks, with shop signs in several alphabets.","Stand on a corner near 74th Street and include the steel overhead as the top third of the frame.","A train must be in the picture.","deep",["am","mid"]],
["jh","moment","Street food exchange","Momo carts and other street-food stalls around the station, and the moment the food is passed over.","Buy something first. Then stand at the side of the cart and photograph the next three customers.","Eat before you shoot.","zone",["gold","night"]],
["jh","energy","Roosevelt at dusk","Trains overhead, traffic below and lit signs on both sides.","Brace against a steel column. Let a train or a bus blur past a person waiting to cross.","Stay under the tracks for the whole set.","drag",["gold","night"]],
["jh","mood","Ladder light","Sun through the track ties, laying stripes across the street and everyone on it.","Expose for the stripes. Press when a face lands in a bright band and the body stays dark.","A face in light, nothing else.","silhouette",["am","mid"]],
["jh","odd","Stacked languages","Shopfronts with signs in Spanish, Bengali, Nepali and English within a few doors of each other.","Frame a run of signs square-on, then wait for someone to walk through.","At least three alphabets in the frame.","deep",["mid","gold"]],

["ferry","place","Skyline off the stern","Lower Manhattan pulling away, with the wake as a line back to it.","Go to the back of the boat as it leaves Whitehall; how much open deck there is depends on the boat. Put a railing or a passenger in the foreground for depth.","Shoot in the first five minutes after departure.","deep",["am","gold"]],
["ferry","moment","The statue side","On the trip to Staten Island, everyone crossing to the right-hand rail when the Statue of Liberty comes into view. Coming back, it is on the left.","Stay back from the rail and photograph the row of raised phones and faces, with the statue small beyond them.","The statue stays smaller than any face.","zone",["mid","gold"]],
["ferry","energy","Boarding surge","The terminal doors opening and several hundred people walking at once.","Stand to one side of the doors inside the Whitehall terminal. Keep the door frame sharp and let the crowd streak.","One crossing, one attempt.","drag",["am","gold"]],
["ferry","mood","Window seat at sunset","A lone commuter beside a salt-streaked window with low sun behind.","Ride the boat that leaves about half an hour before sunset. Expose for the window and let the rider go dark.","Indoor seats only; stay off the deck.","silhouette",["gold"]],
["ferry","odd","The ones not looking","Regulars asleep, reading or doing a crossword while the tourists crowd the rail.","Sit across the aisle. Frame the commuter in the foreground with the tourists as a blur of backs behind.","Both groups in one frame.","shallow",["am","gold"]],

["subway","place","Platform vanishing point","Columns, tile name panels and the yellow edge strip running to a single point.","Stand at the end of the platform and shoot down its length. Wait for one person between two columns.","Find a station with its original mosaic name tablet.","interior",["am","mid","gold","night","rain"]],
["subway","moment","Doors closing","The look between someone on the platform and someone inside as the doors shut.","Stand inside by the door, facing out. The window frames the person left behind.","Shoot only through the door glass.","interior",["am","mid","gold","night","rain"]],
["subway","energy","Train arriving","A train streaking in behind someone who does not look up.","Brace against a column and keep the waiting rider sharp. Start shooting when you feel the air move.","One still person, one moving train.","drag",["am","mid","gold","night","rain"]],
["subway","mood","Last car, late","A nearly empty car, one rider and the flat fluorescent light.","Sit at the far end of the car and include the row of empty seats. Reflections in the dark windows add a second layer.","Ride after 10 pm and stay in one car for three stops.","interior",["night"]],
["subway","odd","Platform concert","A cellist, a bucket drummer or a mariachi trio, and the commuters pretending not to listen.","Frame the musician from the side so the audience is in the background. Leave a dollar.","The listener's face matters more than the instrument.","interior",["gold","night"]],
["harlem", "place", "125th Street and the Apollo", "The Apollo Theater marquee with the street life of 125th Street passing beneath it.", "Stand across 125th Street from the theater so the marquee and the pavement below both fit. Wait for a passer-by who fills the foreground.", "The sign and a person in every frame.", "deep", ["gold", "night"]],
["harlem", "moment", "Sunday best", "Churchgoers in hats and suits greeting each other on the steps before and after Sunday morning services.", "Stand on the public pavement outside one of the large churches near Adam Clayton Powell Jr. Boulevard as the late-morning service ends. Photograph from the street and do not take the camera inside.", "Keep your distance and lower the camera if anyone objects.", "shallow", ["am", "mid"]],
["harlem", "energy", "Sidewalk commerce", "Vendors' tables, shoppers and music from speakers along 125th Street.", "Plant yourself against a lamppost and let the crowd pass on both sides. Keep one vendor still while the walkers blur.", "Stay in one spot for fifteen minutes.", "drag", ["mid", "gold"]],
["harlem", "mood", "Brownstone stoops at dusk", "Rows of brownstones in the Mount Morris Park historic district, with stoop railings and warm windows.", "Walk the side streets west of Marcus Garvey Park, around 120th to 123rd Street. Shoot along the row so the stoops repeat into the distance.", "One lit window in every frame.", "night", ["gold", "night"]],
["harlem", "odd", "Painted walls", "Memorial murals and hand-lettered shop signs, and the people who walk past them without looking.", "Frame a mural square-on, then wait for a passer-by whose clothes or pose echo something in the painting.", "A real person and a painted one in every frame.", "deep", ["mid", "gold"]],
["les", "place", "Orchard Street fire escapes", "Tenement fire escapes zigzagging above old shop signs and new boutiques.", "Stand in the middle of a quiet block of Orchard Street and shoot along it. Keep the buildings upright and wait for one person in the road.", "Keep every vertical line vertical.", "deep", ["am", "gold"]],
["les", "moment", "Essex Market counters", "Orders being weighed, wrapped and handed across the counters at the indoor market on Essex Street.", "Buy something first. Then stand at the end of a counter so the stallholder and the customer are both in view.", "Press only when two hands are in the frame.", "interior", ["am", "mid", "gold", "rain"]],
["les", "energy", "Off the bridge", "Cyclists, scooters and traffic coming off the Williamsburg Bridge onto Delancey Street.", "Stand by the end of the bridge's bike path at Clinton Street and brace on a railing. Blur a cyclist against the still steel.", "Something moving and something fixed in every frame.", "drag", ["mid", "gold"]],
["les", "mood", "Neon in the window", "Bar and deli neon on Ludlow, Rivington and Orchard Street after dark, with people outside.", "Shoot through the window glass so the neon, the reflections and a face inside sit in layers.", "Every frame must include glass.", "night", ["night", "rain"]],
["les", "odd", "Old signs, new tenants", "Faded shop names from an earlier business still showing above whatever trades there now.", "Frame the old sign and the new shopfront together, square-on. Wait for a customer to walk in.", "Two eras in one frame.", "deep", ["mid", "gold"]],
["flushing", "place", "Main Street and Roosevelt Avenue", "Signs in Chinese stacked up the buildings above one of the busiest crossings in the city.", "Stand at the kerb on Main Street and shoot along it, with the signs filling the upper half and the crowd below.", "At least ten signs in the frame.", "deep", ["mid", "gold"]],
["flushing", "moment", "Food court trays", "Bowls passed over counters and strangers sharing tables in the basement food court at New World Mall.", "Order, sit down, and photograph from your seat at table height. The counters are lit; the tables are dimmer.", "Shoot only while seated.", "interior", ["mid", "gold", "night", "rain"]],
["flushing", "energy", "The 7 lets out", "The crowd climbing the stairs from the Main Street terminal at rush hour and spreading across the pavement.", "Stand to one side of a station exit and brace against the railing. Keep the railing sharp and let the crowd streak.", "Shoot three trainloads, then stop.", "drag", ["gold"]],
["flushing", "mood", "Street-food windows", "Skewers, dumplings and steam behind small serving windows lit by bare bulbs after dark.", "Stand at an angle to a window so the vendor is lit and the queue is in shadow. Expose for the vendor.", "A lit face and a dark crowd.", "night", ["night", "rain"]],
["flushing", "odd", "Produce on the pavement", "Durian, dragon fruit and tanks of live seafood spilling out of shopfronts onto the street.", "Get low and close to the display, with a shopper's hand reaching in.", "A hand in every frame.", "detail", ["am", "mid"]],
["wburg", "place", "Skyline from Domino Park", "The Williamsburg Bridge and the Manhattan skyline from the waterfront walkway, with the old sugar refinery behind you.", "Walk the elevated walkway and shoot along the railing toward the bridge. Put a person at the rail for scale.", "Bridge, skyline and one person.", "deep", ["am", "gold"]],
["wburg", "moment", "McCarren Park games", "Handball, kickball and softball games, and the players waiting their turn.", "Stand at the side of a court or field, level with the players, and watch the ones who are not playing.", "Photograph the bench, not the ball.", "shallow", ["mid", "gold"]],
["wburg", "energy", "Bedford Avenue on Saturday", "Crowds, bikes and buskers around the Bedford Avenue station.", "Crouch at the kerb near the station entrance so the nearest walker is large and the rest stack up behind.", "Feet and faces in the same frame.", "zone", ["mid", "gold"]],
["wburg", "mood", "Under the Williamsburg Bridge", "Steel, hard shadow bands and trains rumbling overhead where the bridge lands in Brooklyn.", "Stand in the shade under the approach and shoot out toward the light. Wait for a figure to cross a bright strip.", "One figure per frame.", "silhouette", ["am", "mid"]],
["wburg", "odd", "People in front of murals", "Large painted walls, and passers-by who briefly become part of them.", "Frame a mural square-on from across the street. Wait for someone to line up with a painted shape.", "The person must touch the painting's edge or shape.", "deep", ["mid", "gold"]],
["midtown", "place", "Sixth Avenue canyon", "The wall of office towers and their plazas along Sixth Avenue in the high 40s and low 50s.", "Stand at a plaza edge and shoot along the avenue. Keep the verticals straight and let the towers fill the frame to the top.", "No sky in the frame.", "deep", ["mid"]],
["midtown", "moment", "Lunch on the ledge", "Office workers eating alone on plaza steps and ledges, and at the tables in Paley Park on 53rd Street.", "Pick one ledge with a clean background and wait across the pavement. The moment is the first bite or the glance at the phone.", "One person per frame.", "shallow", ["mid"]],
["midtown", "energy", "Noon crosswalk", "The lunch-hour crowd stepping off the kerb on Fifth Avenue in the low 50s.", "Crouch at the opposite kerb and shoot the first two seconds of each walk signal.", "Five light cycles, one frame from each.", "zone", ["mid"]],
["midtown", "mood", "Bounced light", "Patches of sunlight reflected off glass towers onto shaded streets, lighting one person at a time.", "Find a bright patch on a shaded side street, expose for it and wait at its edge.", "The lit person and nothing else bright.", "silhouette", ["am", "mid"]],
["midtown", "odd", "Suits at the food cart", "Office workers in suits queuing at a halal cart, such as the one at 53rd Street and Sixth Avenue.", "Stand to the side of the queue so the cart, the cook and the line are all in view.", "A tie and a foil container in the same frame.", "zone", ["mid"]],
["cpark", "place", "Bethesda Terrace arcade", "The arches of the arcade framing the terrace and the Lake beyond. The fountain is fenced off for restoration until about summer 2027.", "Stand inside the arcade and shoot out through the centre arch toward the Lake. Wait for one person to walk into the light.", "Shoot from the shade into the light.", "deep", ["am", "gold"]],
["cpark", "moment", "On Bow Bridge", "Couples and families stopping at the middle of the bridge: the photo, the kiss, the proposal.", "Stand on the path along the east shore of the Lake, north of Bethesda Terrace, and frame the bridge side-on so its curve runs across the frame with the people at its crown.", "Wait for people to stop walking.", "deep", ["gold"]],
["cpark", "energy", "Runners on the drive", "Runners and cyclists streaming around the park drive in the early morning and after work.", "Brace against a lamppost at a bend in the drive. Keep one walker or a bench sharp while the runners blur.", "One still thing, everything else moving.", "drag", ["am", "gold"]],
["cpark", "mood", "The Mall in bad weather", "The tunnel of elms and the rows of benches along the Mall in fog, rain or snow.", "Stand in the centre of the path at the south end and shoot along it. A single figure far down the path completes it.", "Go only when the weather is bad.", "deep", ["am", "rain"]],
["cpark", "odd", "Under the arcade", "Musicians, singers and wedding parties who use the tiled arcade at Bethesda Terrace for its sound and light.", "Stand to one side so the performer is near and the listeners are behind. The tiled ceiling carries the sound and the light.", "A performer and a listener in every frame.", "interior", ["mid", "gold", "rain"]],
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
["union", "energy", "The steps at rush hour", "Skaters on the south steps, commuters pouring out of the 14th Street station, and the crowd that forms around anyone with a speaker.", "Stand at the west end of the south steps, brace on the rail and shoot east along the steps. Keep one seated person sharp while the skaters and walkers blur past.", "Stay for the whole of a skater's run, not one trick.", "drag", ["gold"]],
["union", "mood", "Metronome at dusk", "The glowing digits of the Metronome clock on the south side, with the dark shapes of people on the steps beneath it.", "Stand at the top of the south steps and shoot across 14th Street at the moment the digits are brighter than the sky. Let the people go to silhouette.", "The clock must be readable in the frame.", "night", ["gold", "night"]],
["union", "odd", "The soapbox", "Preachers, petitioners and people with hand-lettered signs, and the one passer-by who stops to read.", "Frame the sign and the reader together and leave the speaker out. The reaction is the picture.", "Every frame needs a sign and a face.", "zone", ["mid", "gold"]],
["fidi", "place", "Wall Street from Federal Hall", "The columns of the Stock Exchange under its flags, the Washington statue, and the suits crossing Broad Street between them.", "Climb the Federal Hall steps, stand beside the Washington statue and look south down Broad Street, with the Exchange's columns and flags on your right. Keep the columns upright and wait for a figure to cross the gap below the flags.", "Shoot on a weekday; the street is empty at weekends.", "deep", ["am", "mid"]],
["fidi", "moment", "Lunch on Stone Street", "The cobbled block of Stone Street with its long tables, waiters weaving through and office workers eating in the open air.", "Walk the block slowly from the Coenties Alley end and shoot along the tables. Look for the moment a plate arrives or a glass is raised.", "Weekday lunch, 12:30 to 2 pm, in warm weather.", "zone", ["mid"]],
["fidi", "energy", "Inside the Oculus", "The white ribs of the Oculus with commuters crossing the floor far below.", "Go to the upper balcony and shoot straight down the length of the hall. Brace on the rail and let the crowd blur between the ribs.", "Keep the ribs symmetrical in every frame.", "drag", ["am", "mid", "gold", "rain"]],
["fidi", "mood", "Canyon light", "A slot of midday sun reaching the floor of a narrow street, such as Exchange Place or Beaver Street, with one person crossing it.", "Find the slot, expose for the lit wall and wait at its edge. Press when a single figure is fully in the light.", "One figure per frame, never two.", "silhouette", ["mid"]],
["fidi", "odd", "The queue for the bull", "The line of tourists waiting to pose with the Charging Bull at Bowling Green, and the hands reaching for it.", "Stand at the bull's flank, not the front, and photograph the queue and the reaching hands with the bull as a dark shape in the corner.", "No frame of the bull on its own.", "zone", ["mid", "gold"]],
["ktown", "place", "Korea Way stacked", "West 32nd Street between Fifth Avenue and Broadway, with restaurant signs stacked four storeys high and lit from the inside.", "Stand on the south pavement near Broadway and shoot up the street at a slight angle so the signs climb away from you. Hold the camera level.", "Shoot after dark, when every sign is lit.", "night", ["gold", "night"]],
["ktown", "moment", "The first bag", "People coming out of the Macy's doors on 34th Street with the day's first shopping bag, checking their phone or looking for a friend.", "Stand across the pavement from the doors with your back to the kerb. Frame the doorway and wait for a face that is doing something.", "Faces, not bags.", "freeze", ["mid", "gold"]],
["ktown", "energy", "Herald Square crossing", "The crowds crossing Broadway and Sixth Avenue at 34th Street, with the Empire State Building rising to the east.", "Stand at the south tip of Herald Square, where Broadway and Sixth Avenue cross 34th Street, and look east along 34th Street toward the Empire State Building. Lean your shoulder on a signal pole or lamppost. Pick one person who is standing still, such as someone waiting for the light, a traffic agent or a vendor, and keep them sharp while the crowd on the crossing streams past and blurs.", "Stay for three full light cycles before moving.", "drag", ["gold", "night"]],
["ktown", "mood", "Karaoke hour", "Groups spilling out of restaurants and karaoke bars on 32nd Street after midnight, with steam from the barbecue vents and neon in the wet.", "Shoot through and along the restaurant windows so reflections of the street lie over the diners inside. Get close to the glass.", "Every frame must include glass.", "night", ["night", "rain"]],
["ktown", "odd", "Souvenirs under the Empire State", "Stalls selling I Love NY shirts and foam crowns on 34th Street, with the Empire State Building directly above them.", "Get low beside a stall and tilt up so the merchandise fills the bottom of the frame and the tower rises out of it.", "Both must be in the frame: the tat and the tower.", "deep", ["mid", "gold"]],
["bushwick", "place", "Troutman Street walls", "The murals of the Bushwick Collective along Troutman Street and St Nicholas Avenue, wall after wall, with the street in front of them.", "Stand across the street from a wall and frame it with the kerb, a parked car and the pavement, not just the painting. Wait for someone to walk through.", "A person in every frame; the mural is the background.", "deep", ["mid", "gold"]],
["bushwick", "moment", "Posing for the wall", "People photographing each other in front of the murals: the pose, the phone, and the friend giving directions.", "Stand to one side so the poser, the photographer and the mural all fit. Shoot the instruction, not the pose.", "Never between the phone and its subject.", "zone", ["mid", "gold"]],
["bushwick", "energy", "Knickerbocker Avenue", "Shoppers, vendors and music from shopfront speakers along Knickerbocker Avenue on a Saturday afternoon.", "Plant yourself against a shopfront and let the pavement traffic pass on both sides. Keep one vendor still while the shoppers blur.", "Stay in one spot for fifteen minutes.", "drag", ["mid", "gold"]],
["bushwick", "mood", "Warehouse dusk", "The industrial blocks around Johnson and Morgan Avenues at dusk: loading docks, roll-down gates covered in graffiti, and sodium light.", "Walk the blocks north of Flushing Avenue as the street lights come on. Keep people small and let the walls carry the frame.", "No frame with more than one person.", "night", ["gold", "night"]],
["bushwick", "odd", "Painted eyes", "Murals with faces and eyes that seem to watch the street, and the people who walk past without looking back.", "Frame a painted face square-on, then wait for a passer-by whose glance, hat or colour answers it.", "The painted face and the real one must both be in focus.", "deep", ["mid"]],
["chelsea", "place", "The Tenth Avenue window", "The High Line's amphitheatre at 17th Street, where a glass window frames the traffic on Tenth Avenue below.", "Stand at the back of the steps and shoot through the window so the people seated on the steps and the avenue beyond stack up. Keep the window frame square.", "Shoot at dusk, when headlights and the sky balance.", "deep", ["gold", "night"]],
["chelsea", "moment", "Opening night", "Gallery openings in the West 20s between Tenth and Eleventh Avenues: people with a plastic cup of wine on the pavement outside, looking at each other rather than the art.", "Stand on the pavement opposite a lit gallery doorway and frame the door. Shoot the conversations outside, not the room inside.", "Thursday evenings, 6 to 8 pm.", "shallow", ["gold", "night"]],
["chelsea", "energy", "Chelsea Market concourse", "The long brick concourse of Chelsea Market at lunchtime, packed from wall to wall.", "Brace against a pillar near the Ninth Avenue entrance and shoot down the length of the hall. Keep one person still at a counter while the walkers blur past.", "Stay in one spot for ten minutes.", "drag", ["mid", "rain"]],
["chelsea", "mood", "Little Island at sunset", "The tulip columns of Little Island with the Hudson behind, and visitors reduced to shapes against the sky.", "Stand on the pier's eastern edge and shoot west into the light. Expose for the sky and let everyone go black.", "One or two figures, never a crowd.", "silhouette", ["gold"]],
["chelsea", "odd", "Vessel reflections", "The copper skin of the Vessel at Hudson Yards, bending the people and towers reflected in it.", "Get close to the base and shoot the reflections rather than the structure. Look for a person doubled or stretched in the metal.", "The reflection, not the object.", "zone", ["mid", "gold"]],
["brighton", "place", "Under the el on Brighton Beach Avenue", "The B and Q tracks overhead, produce stalls spilling onto the pavement and shop signs in Cyrillic.", "Stand in the middle of the pavement and shoot along the avenue so the steel columns repeat into the distance. Wait for a train to pass overhead.", "A column, a sign and a person in every frame.", "deep", ["mid", "gold"]],
["brighton", "moment", "Boardwalk benches", "Older residents on the boardwalk benches, in fur hats in winter and sun hats in summer, deep in conversation.", "Walk the boardwalk slowly on the sea side and shoot across to the benches. Frame two people mid-conversation, hands included.", "Keep your distance and respect a wave-off.", "shallow", ["am", "gold"]],
["brighton", "energy", "Boardwalk dinner", "The restaurant terraces on the boardwalk on a summer evening: waiters, music, families at long tables and strollers passing in front.", "Stand on the boardwalk at the edge of the terrace and shoot along the row of tables as the strollers pass between you and the diners.", "Summer evenings only; the terraces close in the cold.", "zone", ["gold"]],
["brighton", "mood", "Grey sea, one figure", "The wide winter beach with a single walker or swimmer against a flat grey sea.", "Shoot from the boardwalk steps straight out to sea, with the figure small and low in the frame.", "Most of the frame must be sky and water.", "deep", ["am", "gold", "rain"]],
["brighton", "odd", "Caviar and kitsch", "Shop windows stacked with tins of caviar, smoked fish, Soviet-era ornaments and nesting dolls.", "Get square to the glass and fill the frame with the window. Include your own reflection or a passer-by only if it adds something.", "Square to the window, nothing cropped at the edges.", "detail", ["mid", "rain"]],
["cpark", "mood", "Yellow elms on the Mall", "The American elms over the Mall turn yellow in the last week of October, and the walkers beneath them wear black.", "Stand at the south end of the Mall and shoot along it so the canopy closes over the path. Wait for one figure in a dark coat against the yellow.", "Dark clothes against yellow leaves, nothing else.", "deep", ["am", "gold"], [10, 11]],
["cpark", "moment", "Leaf-catchers", "Children and couples trying to catch falling leaves, and people photographing each other in the colour.", "Find a tree that is dropping leaves in the wind and wait beside it. Shoot the reach and the miss, not the catch.", "Hands in the air in every frame.", "freeze", ["mid", "gold"], [10, 11]],
["wsp", "mood", "Leaves over the chess tables", "The trees on the south-west side of the square in colour, over the chess players and the fallen leaves on the ground.", "Get low across a table from the players so the leaves fill the top of the frame and the board the bottom.", "Colour above, concentration below.", "shallow", ["mid", "gold"], [10, 11]],
["harlem", "place", "Brownstones in colour", "The street trees along the brownstone blocks west of Marcus Garvey Park turning orange against the brown stone.", "Shoot along a row from the kerb so the stoops repeat under the canopy. One person on a stoop or walking is enough.", "A stoop, a tree and a person.", "deep", ["am", "gold"], [10, 11]],
["dumbo", "place", "Fort Greene Park in colour", "The slopes of Fort Greene Park, a short walk from DUMBO, with the Prison Ship Martyrs' Monument above the autumn trees.", "Enter from Myrtle Avenue and stop on the lower slope. Look up the hill so the paths climb through the colour to the monument column at the top, and wait for a walker on the path.", "Include a path and someone on it.", "deep", ["am", "gold"], [10, 11]],
["brighton", "mood", "Autumn on the boardwalk", "Low autumn light along the boardwalk, long shadows and the first fur hats of the year.", "Walk west into the low sun in the late afternoon and shoot the benches with the light raking across them.", "Shadows longer than the people who cast them.", "silhouette", ["gold"], [10, 11]],
["union", "odd", "Pumpkins and skateboards", "The greenmarket's pumpkin stacks beside the skaters on the south steps.", "Frame a pumpkin stall with the steps behind it and wait for a skater to pass through the gap.", "A pumpkin and a skateboard in one frame.", "zone", ["mid", "gold"], [10, 11]]
].map((a,n)=>({id:a[0]+"-"+a[1]+(a[8]?"-s":""),p:a[0],i:a[1],t:a[2],look:a[3],work:a[4],rule:a[5],r:a[6],w:a[7],m:a[8]||null}));

/* Work it details per idea: [what to keep sharp, camera height, distance to it in metres, when to press, crop frame in mm when the subject is far].
   The focus advice is built from these and the idea's recipe, for the chosen camera. */
const WORKX = {"chinatown-place":["the person rounding the bend","Eye level, camera held level so the buildings stay upright",15,"When the person is right at the bend, where the street disappears"],
"chinatown-moment":["the hands and the faces just above them","Chest height, level with the scale",2,"With money or a bag halfway between two hands"],
"chinatown-energy":["one vendor standing behind their stall","Eye level through the viewfinder, shoulder against the pole",3,"When the crowd is thickest between you and the vendor"],
"chinatown-mood":["a face inside, behind the steam","Eye level, lens almost touching the glass",2,"When a face lines up with a clear patch between the reflections"],
"chinatown-odd":["the watchers' faces, not the board","Eye level with the standing onlookers",2,"When one face reacts differently: a wince, a laugh, a pointing finger"],
"gct-place":["the clock on the information booth","Eye level at the top of the stairs, elbows on the balustrade",30,"When the walkers around the clock are spread out, not bunched"],
"gct-moment":["your one waiting person","Eye level",5,"On the wave, the hug, or the moment they spot each other"],
"gct-energy":["the one person standing still at the departures board","Eye level, elbows planted on the stair rail",20,"When a stream of walkers crosses close to the still person",50],
"gct-mood":["the figure inside the bright patch","Eye level, or from the balcony looking down when the patch is below you",10,"When one figure is fully inside the patch, mid-stride"],
"gct-odd":["the person speaking into the corner","Eye level, square to the tiled corner",3,"While their face is turned into the tiles"],
"tsq-place":["the crowd along the bottom edge","Eye level from the top step, camera level",30,"At dusk, when the sky is as bright as the screens"],
"tsq-moment":["the face of the person coming up the stairs","Chest height, a little below their eyes as they rise",3,"The moment their eyes lift to the screens"],
"tsq-energy":["the dark figure or lamppost on the third","Eye level, shoulder against a lamppost",4,"Each time the screens change colour: three frames, same framing"],
"tsq-mood":["the reflected screens, with feet and umbrellas along the top","On the ground: camera a few centimetres above the puddle, screen tilted up",4,"When an umbrella crosses the brightest part of the reflection"],
"tsq-odd":["the performer: costume and face together","Chest height, from the side",3,"When the costume head and the human head are both in view"],
"wsp-place":["the arch","Eye level, centred on the arch, camera level",40,"When a single walker is centred under the arch"],
"wsp-moment":["the hand over the piece, then the face","Seated at the next table, camera at the players' eye level",1.5,"As the hand hovers over a piece or slaps the clock"],
"wsp-energy":["the performer","Crouched at the front of the ring, aiming slightly up",4,"At the top of the jump or spin; shoot a short burst through it"],
"wsp-mood":["the reader's outline against the bright path","Eye level, facing the sun",15,"When the reader is still and the shadows reach toward you"],
"wsp-odd":["the regular's eyes","Eye level, after you have talked",2,"After the conversation, when they go back to what they were doing"],
"dumbo-place":["the bridge tower and the Empire State Building","Eye level, camera level; step left or right to line them up",100,"When one person crosses the street below the tower"],
"dumbo-moment":["the couple, or whoever is fixing the dress","Chest height, to one side of their photographer",3,"Just after their photographer lowers the camera"],
"dumbo-energy":["the stone edges of the arch","Eye level, shoulder against the arch wall",6,"When a cyclist is inside the bright opening"],
"dumbo-mood":["the figure at the water's edge","Low, with the camera resting on a rock or the railing",6,"In the 20 minutes after sunset, while the figure stands still"],
"dumbo-odd":["the rails a metre or two in front of you","On the ground: camera just above the cobbles, screen tilted up",1.5,"When the modern detail sits where the rails meet"],
"coney-place":["the planks a few metres ahead","Eye level, or lower to stretch the planks",5,"Once with a walker on the boardwalk, once with nobody"],
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
"ferry-place":["the railing or passenger in the foreground","Eye level at the stern rail",3,"In the first five minutes after leaving Whitehall"],
"ferry-moment":["the row of phones and faces","Eye level, a few steps back from the rail",3,"When the statue sits in a gap between heads"],
"ferry-energy":["the door frame","Eye level, shoulder against the wall beside the doors",3,"As the doors open and the crowd starts to move"],
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
"harlem-odd":["the mural","Square-on, with the centre of the mural at lens height",6,"When the passer-by echoes the painting"],
"les-place":["the person in the road","Eye level, camera level",15,"When the person is where the fire escapes meet"],
"les-moment":["the hands and the goods","Chest height, at the end of the counter",1.5,"When the goods change hands"],
"les-energy":["the railing and the bridge steel","Eye level, braced on the railing",5,"When a cyclist is halfway along the path"],
"les-mood":["a face inside","Eye level, lens close to the glass",2,"When the neon reflection and a face line up"],
"les-odd":["the doorway","Square-on, from across the street",10,"When a customer is in the doorway"],
"flushing-place":["the crowd at the kerb","Eye level",10,"When the crowd fills the bottom of the frame"],
"flushing-moment":["the bowl and the hands","Seated, at table height",1.2,"As a bowl is set down or passed across"],
"flushing-energy":["the railing","Eye level, braced on the railing",2,"As each trainload rises up the stairs"],
"flushing-mood":["the vendor's face in the window light","Eye level, at an angle to the window",3,"When the vendor hands food out"],
"flushing-odd":["the fruit or tank where the hand reaches in","Low, at the height of the display",0.8,"When a hand enters from a corner"],
"wburg-place":["the person at the rail","Eye level along the railing",10,"When the person at the rail stands still"],
"wburg-moment":["the waiting players' faces","Eye level, level with the players",4,"When a waiting player reacts to the game"],
"wburg-energy":["the nearest walker","Crouched at the kerb, screen tilted up",2,"When the nearest walker is large on one side"],
"wburg-mood":["the figure's outline in the bright strip","Eye level",10,"When the figure is inside the bright strip"],
"wburg-odd":["the mural","Square-on, from across the street",12,"When a person lines up with a painted shape"],
"midtown-place":["the avenue a third of the way down","Eye level, camera level",30,"When the crossing in front of you is busy"],
"midtown-moment":["the person's eyes","Eye level, from across the pavement",5,"On the first bite or the glance at the phone"],
"midtown-energy":["the front walker","Crouched at the kerb, screen tilted up",2,"In the first two seconds of each walk signal"],
"midtown-mood":["the person in the bright patch","Eye level",8,"When the person is fully inside the patch"],
"midtown-odd":["the suit and the cart","Chest height, beside the queue",3,"When the foil container changes hands"],
"cpark-place":["the person in the arch opening","Eye level, centred in the arcade",15,"When one person walks into the light"],
"cpark-moment":["the couple at the crown of the bridge","Eye level",60,"When they stop at the crown: the photo, the kiss",90],
"cpark-energy":["the still walker or the bench","Eye level, shoulder against a lamppost",5,"As a group of runners passes the still subject"],
"cpark-mood":["the lone figure","Eye level, centred on the path",40,"When one figure is at the vanishing point"],
"cpark-odd":["the performer","Eye level, to one side",2,"When a listener reacts"],
"rockaway-place":["the railing a few metres ahead","Eye level, horizon level",5,"With one walker in the distance"],
"rockaway-moment":["the surfer","Crouched on the sand",8,"As they walk toward you with the board",50],
"rockaway-energy":["the surfer on the wave","Low, at the waterline",50,"As they stand up on the board",90],
"rockaway-mood":["the walker and the dog","Eye level, horizon low in the frame",40,"When the walker is near an edge"],
"rockaway-odd":["the surfboard and the station sign","Eye level, on the platform",3,"When the board and the sign line up"],
"arthur-place":["the shopper at the near awning","Eye level",6,"When a shopper is at the near awning"],
"arthur-moment":["the hands and the goods","Chest height, at the end of the counter",1.5,"When something changes hands"],
"arthur-energy":["the nearest shopper and their bags","Crouched at the kerb, screen tilted up",2,"When the nearest shopper is large in the frame"],
"arthur-mood":["the faces inside","Eye level, close to the glass",3,"When a face sits inside a pane"],
"arthur-odd":["the hands and the leaf","At bench height, beside the roller",0.6,"As the leaf is rolled"],
"union-place":["the shopper carrying something","Eye level",8,"When a shopper with flowers, a pumpkin or a full bag walks down the aisle"],
"union-moment":["the regular's face and the hand on the piece","Standing, over the challenger's shoulder",2,"As a piece is lifted, before it lands"],
"union-energy":["one person sitting on the steps","Eye level, braced on the rail",5,"As skaters and walkers pass the seated person"],
"union-mood":["the Metronome digits","Eye level",60,"When the digits are brighter than the sky"],
"union-odd":["the reader's face and the sign","Eye level",3,"When the reader reacts"],
"fidi-place":["the suits crossing Broad Street","Eye level from the top steps, camera level",25,"When a figure crosses the gap below the flags"],
"fidi-moment":["the plate or the glass","Chest height, along the tables",2,"As a plate arrives or a glass is raised"],
"fidi-energy":["the white ribs","Eye level, braced on the balcony rail",30,"When the floor below is busiest"],
"fidi-mood":["the lit pavement in the slot","Eye level",15,"When a single figure is fully in the light"],
"fidi-odd":["the reaching hands","Chest height, at the bull's flank",2,"As a hand touches the bull"],
"ktown-place":["the signs a third of the way up the block","Eye level, camera level",15,"After dark, with every sign lit and a walker beneath them"],
"ktown-moment":["the face coming out of the doors","Eye level",4,"When someone stops: checks the phone, looks for a friend"],
"ktown-energy":["one person standing still, such as someone waiting for the light, a traffic agent or a vendor","Eye level, camera to your eye, shoulder against a signal pole or lamppost",4,"When the walk signal starts and the crossing fills with people"],
"ktown-mood":["the diner's face behind the reflection","Eye level, close to the glass",2,"When a reflection lands on a face"],
"ktown-odd":["the souvenirs at the bottom of the frame","Low beside the stall, tilted up",1.5,"When the souvenirs fill the bottom and the tower rises clear"],
"bushwick-place":["the walker","Eye level, from across the street",10,"When someone walks in front of the wall"],
"bushwick-moment":["the friend giving directions","Chest height, to one side",3,"When the photographer gives an instruction"],
"bushwick-energy":["one vendor","Eye level, back against a shopfront",3,"When shoppers pass close"],
"bushwick-mood":["the lit wall or gate","Eye level",10,"As the street lights come on, with one person small in the frame"],
"bushwick-odd":["both faces, the painted one and the real one","Eye level, square to the mural",5,"When the passer-by's glance answers the painted one"],
"chelsea-place":["the people seated on the steps","Standing at the back of the steps, camera level",6,"At dusk, when the headlights and the sky balance"],
"chelsea-moment":["the faces in conversation","Eye level",8,"When a conversation turns: a laugh, a gesture",50],
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
"gct-mood":["Clear winter mornings, when the sun is low, give the best chance of light reaching the floor.","Expose for the patch with −1 to −1.7 EV so the marble around it drops to black."],
"gct-odd":["Go off-peak, mid-morning or mid-afternoon, when the arch is quieter and people take turns.","Watch for the moment the listener across the arch reacts; it is the funniest frame."],
"tsq-place":["The red steps fill up at dusk; arrive 20 minutes early to take a spot at the top rail.","Shoot a series through blue hour: the best balance between sky and screens lasts only about ten minutes."],
"tsq-moment":["Tourists arriving from Penn Station and the airports come up the 42nd Street exits; weekend evenings are best.","Children and first-time visitors react the most; watch for groups pointing up."],
"tsq-energy":["Watch one big screen for a minute to learn its rhythm, then press on the change.","Pick a spot under one dominant screen so the colour of the whole frame shifts with it."],
"tsq-mood":["Go within an hour after rain stops, before the plaza dries and the puddles shrink.","Bring a small cloth: the camera ends up close to wet ground."],
"tsq-odd":["Performers take breaks in the early-afternoon lull, between the lunch and evening crowds.","Do not tip for a pose; a picture taken after a tip is a portrait, not a candid."],
"wsp-place":["Early morning has soft light on the arch and almost nobody in the way.","On the second shot, step back under the arch until its curve just touches the top of the frame."],
"wsp-moment":["Players at the southwest corner tables play fast blitz; a five-minute game gives you plenty of hand moves.","Ask the player at the next table if you can sit; a nod is enough, and players tend to ignore you after the first minute."],
"wsp-energy":["Weekend afternoons in warm weather bring the big acts; the crowd gathers by about 2 pm.","Watch a performer's routine once first: the big jump usually comes at the same point every time."],
"wsp-mood":["The best light reaches the western paths in the last hour before sunset from autumn to spring.","Shade the lens with your hand so the sun does not cause flare across the reader."],
"wsp-odd":["The pianist, the pigeon man and the poets keep regular afternoon hours; return on the same day of the week.","Offer to email them a picture; it often opens a longer, better session."],
"dumbo-place":["Weekday mornings before 8 am are the only time the street is clear of crowds.","Fog or low cloud can hide the Empire State Building; check the view on a webcam or the forecast first."],
"dumbo-moment":["Weekend afternoons have the most wedding and engagement shoots.","Watch the other photographer: when they check their screen, the couple relaxes, and that is your moment."],
"dumbo-energy":["Late afternoon puts the brightest light at the open end of the archway.","Pan with a cyclist at 1/15 s for a sharp rider on a streaked background, as a second version."],
"dumbo-mood":["Arrive at sunset and shoot through to full dark; the skyline lights switch on in stages.","Rest the camera on a rock and use the 2-second self-timer so pressing does not shake it."],
"dumbo-odd":["Overcast or wet days make the cobbles and rails shine; dry midday light flattens them.","Turn the screen up and shoot from cobble level; even 20 cm higher loses the drama."],
"coney-place":["Morning sun comes from the east, lighting the wheel from the side for shape.","Out of season the boardwalk is empty; in summer, shoot before 10 am."],
"coney-moment":["Weekend afternoons in summer have the longest lines and the most riders.","Learn the ride's rhythm: the front car reaches the top about the same time after each departure."],
"coney-energy":["Shoot at blue hour, when the ride lights show but the sky still has colour.","Rest the camera on the fence rail with your hand on top to stop it sliding."],
"coney-mood":["Fog rolls in most on spring mornings; check for fog advisories the night before.","Walk past the shuttered stands first: a closed sign or a lone gull makes a second frame."],
"coney-odd":["The sideshow banners on Surf Avenue and West 12th Street change each season; look for new ones in spring.","Shoot signs in open shade; hard sun washes out painted colour."],
"soho-place":["Sunday mornings before 9 am are quiet and the cobbles are empty.","After rain, the wet cobbles reflect the facades and add shine."],
"soho-moment":["Choose a shop with a strong doorway frame and few shoppers, so each exit is separate.","Stand still and let people get used to you; after five minutes they stop noticing."],
"soho-energy":["Weekend afternoons have the biggest crowds stepping off at Broadway and Prince.","Get closer than feels natural; a 28 mm frame from a metre away makes the front walker loom."],
"soho-mood":["Late-morning sun on east-facing facades, or afternoon sun on west-facing ones, throws the cleanest fire-escape shadows.","Shadows move fast: find your frame first, then wait for the person."],
"soho-odd":["Bright windows on the shady side of the street reflect best.","Shoot a few frames as people pass and choose later; the alignment is often in the frame you did not expect."],
"jh-place":["Late morning puts sun through the tracks onto the street below.","Trains run every few minutes; frame first, then wait for one."],
"jh-moment":["Carts are busiest after 6 pm around Diversity Plaza and 74th Street.","Cart lights are warm and close: catch the customer's face near the light for the best glow."],
"jh-energy":["Dusk is ideal: signs lit, traffic headlights on, enough sky to separate the tracks.","Choose a person under a shop light so they stay bright while the street blurs."],
"jh-mood":["Midday on a clear day gives the sharpest stripes under the tracks.","Expose for the bright bands with about −1 EV; the shade around them should be almost black."],
"jh-odd":["Weekday mornings have fewer parked vans blocking the shopfronts.","Shoot from across the street so the signs fill the frame without tilting up."],
"ferry-place":["Stand at the stern before the boat leaves; the rail fills up quickly.","Early morning ferries are quiet and the light is soft on the skyline."],
"ferry-moment":["Board early and claim a spot a few steps back from the right-hand rail before the crowd moves.","Stand on a bench or step behind the crowd so the raised phones line up against the water."],
"ferry-energy":["Rush-hour boats from Whitehall have the biggest crowd surge.","Ask a staff member where the doors open first; that is where to stand."],
"ferry-mood":["The windows are salty; choose one with streaks that catch the light rather than a clean one.","Expose with −1 EV for the window so the rider goes dark."],
"ferry-odd":["Commuter-hour boats have the most regulars; weekend middays have the most tourists.","A sleeping commuter is the classic shot; take it quietly and only once."],
"subway-place":["Look for the original mosaic name tablets at Astor Place, Bowling Green, Wall Street and many stations on the 1 line.","Late-evening platforms are quieter, so one person stands alone more often."],
"subway-moment":["Stand by the door on the platform side of the train before it reaches a busy stop.","Turn off the screen brightness so your reflection in the door glass is fainter."],
"subway-energy":["Express stations give the fastest trains, so the blur is strongest.","Stand well back from the platform edge; brace on a column, never lean out."],
"subway-mood":["Late-night trains on long lines, such as the A or the F, empty out after Manhattan.","Sit at the end of the car so the empty seats line up in perspective."],
"subway-odd":["Music Under New York performers play at Times Square, Union Square, 34th Street and Grand Central.","Leave a dollar before you start shooting; musicians are friendlier and you blend in."],
"harlem-place":["The Apollo marquee lights up at dusk; arrive before sunset to frame it.","Wednesday evenings have Amateur Night crowds outside the theatre."],
"harlem-moment":["Late-morning services usually end between noon and 1:30 pm; be on the pavement before then.","Dress respectfully and keep the camera low between frames; people relax when it is not pointed at them."],
"harlem-energy":["Saturday afternoons are busiest on 125th Street.","Choose a vendor who stays in one spot, such as one selling books or oils from a table."],
"harlem-mood":["Weeknights after 7 pm have the most lit windows.","Shoot from the kerb on the opposite side so the whole row of stoops fits."],
"harlem-odd":["Murals are often on the side streets; walk a block either side of 125th Street.","Shoot in open shade so the painted colours stay rich."],
"les-place":["Sunday mornings are quietest on Orchard Street.","Soft overcast light shows detail in the fire escapes without hard shadows."],
"les-moment":["Late morning on weekdays is when vendors are prepping and serving at the same time.","Ask the vendor if you can photograph while they work; most say yes after you have bought something."],
"les-energy":["The evening rush, 5 to 7 pm, brings the most cyclists off the bridge.","Pan with a cyclist as a second version: rider sharp, steel streaked."],
"les-mood":["Rainy nights add reflections on the pavement as well as the glass.","Pick a bar with neon in the window and people sitting near it."],
"les-odd":["Old signs show best in raking light, early or late in the day.","Look up: many ghost signs are above the ground-floor shops."],
"flushing-place":["Weekend afternoons have the biggest crowds at Main Street and Roosevelt Avenue.","Overcast days show the sign colours better than hard sun."],
"flushing-moment":["Lunchtime on weekends is busiest; arrive around noon for a seat.","Order something photogenic, such as hand-pulled noodles, and keep it in the near foreground."],
"flushing-energy":["Evening rush, 5:30 to 7 pm, brings the biggest waves out of the station.","Each train empties in about a minute; shoot the first 20 seconds of each wave."],
"flushing-mood":["Rain makes the bare bulbs glow in the wet pavement.","Expose for the lit face, about −0.7 EV, and let the queue fall into shadow."],
"flushing-odd":["Mornings have the freshest, fullest displays.","Ask the shop owner before photographing inside; outside on the pavement is fair game."],
"wburg-place":["The sun sets across the river: behind the bridge and Lower Manhattan in winter, moving north toward Midtown by midsummer.","Stay through blue hour for city lights against a glowing sky."],
"wburg-moment":["Weekend afternoons in warm weather have pickup games and long waits for the court.","Watch the bench reactions to a good point; they are the shot."],
"wburg-energy":["Saturday afternoons around the Bedford Avenue station are busiest.","Buskers draw a crowd that stops and turns; use them as the back layer."],
"wburg-mood":["Late morning to midday puts strong shadow bands under the bridge.","Expose for the bright strip with about −1 EV."],
"wburg-odd":["Murals change often; walk Wythe and Kent Avenues to see what is new.","Shoot from across the street with the camera level so the mural stays square."],
"midtown-place":["Around 1 pm from late spring to early autumn the high sun reaches the floor of the avenue.","Stand on a plaza edge so you have room to step back."],
"midtown-moment":["12:30 to 1:30 pm on warm weekdays has the most people eating outside.","Choose a ledge with a plain wall behind; a busy plaza background fights the person."],
"midtown-energy":["Lunch hour, 12 to 1 pm, gives the biggest crowds at each crossing.","Wear something plain; at a crossing you are in full view, and blending in keeps faces natural."],
"midtown-mood":["Late morning to early afternoon gives the most reflected light from glass towers onto side streets.","Expose for the lit patch with about −1 to −1.7 EV."],
"midtown-odd":["The lunch rush, 12 to 1:30 pm, has the longest queue.","Stand on the side away from the steam so it drifts between the suits and the cart, not over you."],
"cpark-place":["Early morning is quiet and soft; weekend afternoons have musicians and crowds under the arcade.","Expose for the bright terrace, about −0.7 EV, and let the arcade go dark around it."],
"cpark-moment":["Late afternoon light falls on the bridge from the west in autumn.","Proposals happen most on weekend afternoons; stay with the bridge for at least half an hour."],
"cpark-energy":["Early mornings, 6 to 8 am, and evenings after 5 pm bring the most runners.","Pick a bend where runners lean into the curve; it makes the blur look faster."],
"cpark-mood":["Snow or fog on a weekday morning gives an almost empty Mall.","Protect the camera from rain with a plastic bag or rain cover; the Q3 is sealed, but the lens front still gets wet."],
"cpark-odd":["Weekend afternoons have the most performers under the arcade.","Ask the performer if you can stay close; most enjoy the attention."],
"rockaway-place":["Early morning on weekdays has an empty boardwalk.","Morning sun from the east puts low light along the planks."],
"rockaway-moment":["Surfers come out in waves after the morning session, around 9 to 10 am.","Stand where the sand is firm so you can crouch without sinking."],
"rockaway-energy":["The best waves come with a swell after a storm; check a surf forecast.","Protect the camera from salt spray, and wipe the lens often."],
"rockaway-mood":["Fog is most likely on spring and early summer mornings.","Dress warmly and be patient: one walker with a dog may take half an hour."],
"rockaway-odd":["Summer weekend mornings have the most surfers on the A train and the shuttle.","Stand at the platform end near the stairs, where boards come up first."],
"arthur-place":["Saturday mornings are busiest on the avenue.","Soft overcast light is best for the awnings and signs."],
"arthur-moment":["Saturday mornings are busiest at the counters.","Buy something and ask; vendors are proud of their work and usually say yes."],
"arthur-energy":["Saturday late morning has the most shoppers with full bags.","Bakery and butcher doors are where the full bags come out; stand near one."],
"arthur-mood":["Mid-morning has regulars at the café tables.","Shoot from the shady side of the street so reflections are fewer."],
"arthur-odd":["Ask the roller first; they often explain the process, which gives you better moments.","Use the hands as the focus point and let the face soften behind."],
"union-place":["Market days are Monday, Wednesday, Friday and Saturday; Saturday morning is busiest.","Arrive by 9 am for soft light and fewer crowds."],
"union-moment":["Watch a few games before shooting; each regular has habits, like a hand hovering before a move, that you can learn to anticipate.","Leave a dollar on the table if you stay; it is the custom."],
"union-energy":["Rush hour, 5 to 6:30 pm, has the most commuters and skaters.","Skaters repeat the same line along the steps; learn it and keep your still subject beside it."],
"union-mood":["Shoot about 15 minutes after sunset, when the digits glow against a blue sky.","Choose a spot with no streetlamp in the frame; a bright lamp competes with the digits."],
"union-odd":["Weekend afternoons have the most speakers and sign-holders.","Stay neutral and quiet; the reaction you want comes from someone else, not you."],
"fidi-place":["The Exchange's columns face east onto Broad Street, so morning sun lights them.","Wait for a gap in the tourists on the steps so the statue stands clear."],
"fidi-moment":["Warm weekday lunches, 12:30 to 2 pm, are the busiest.","Walk slowly and shoot from the hip; standing still makes diners look up."],
"fidi-energy":["Rush hour, 8 to 9 am and 5 to 6 pm, fills the floor.","Brace on the balcony rail rather than bringing a tripod, which draws security."],
"fidi-mood":["Midday on a clear day is the only time sun reaches the street floor.","Expose for the slot with about −1.3 EV; the shade around it should be black."],
"fidi-odd":["Weekend middays have the longest queue.","Watch for a child being lifted up to touch the bull; it is the best reach of the day."],
"ktown-place":["Friday and Saturday nights have the most people under the signs.","A light rain doubles the signs in the wet pavement."],
"ktown-moment":["Saturday afternoons have the most shoppers coming out of Macy's.","Stand still with your back to the kerb; people coming out are looking down or at their phones."],
"ktown-energy":["Shoot at dusk or after dark, when 1/15 s is easy and the lights add colour to the blur.","Pick a still figure under a light, such as a vendor's cart, so they stay bright while the crowd blurs."],
"ktown-mood":["After midnight on Friday and Saturday has the most people spilling out.","Shoot from the shady side so the restaurant lights glow and your reflection is faint."],
"ktown-odd":["Midday has the most stalls and shoppers.","Turn on the level: with the camera tilted up, a slight sideways tilt makes the tower lean."],
"bushwick-place":["Weekend afternoons have the most visitors posing in front of the walls.","Overcast light shows mural colours best."],
"bushwick-moment":["Weekend afternoons have the most photo shoots.","Instructions get loudest when a shoot is going badly; stay with one group for a few minutes."],
"bushwick-energy":["Saturday afternoons are busiest on Knickerbocker Avenue.","Pick a vendor who stays in one spot, such as one with a fruit stand."],
"bushwick-mood":["Shoot at dusk, as the sodium lights come on.","Expose for the lit walls, about −0.7 EV, so the shadows stay deep."],
"bushwick-odd":["Murals change often; walk Troutman Street and St Nicholas Avenue to see what is new.","Shoot square-on so the painted face is not distorted."],
"chelsea-place":["Weekday evenings are calmer than weekends, so you can hold a spot at the back of the steps.","Stand at the back of the steps so the seated people and the window line up."],
"chelsea-moment":["The galleries' websites list which openings are on that week.","Shoot from across the street with a longer crop so you are not noticed."],
"chelsea-energy":["Weekday lunch, 12 to 1:30 pm, is busiest.","Brace on a pillar and keep your elbows in; 1/15 s is easy to shake."],
"chelsea-mood":["Arrive 30 minutes before sunset for the best light over the Hudson.","Expose for the sky, about −1.3 EV, so the columns go black."],
"chelsea-odd":["Midday has the most visitors around the base.","Move slowly; the reflection changes with every step."],
"brighton-place":["Saturday mornings are busiest under the el.","Wait for a train; the shadow stripes move as it passes."],
"brighton-moment":["Late afternoon in autumn and spring has the most people on the benches.","Keep your distance; the 50 mm crop frame lets you stay back."],
"brighton-energy":["Summer evenings, 7 to 9 pm, have the busiest terraces.","Ask a waiter before standing at the terrace edge; a nod keeps you from being moved on."],
"brighton-mood":["Grey winter mornings give the flattest, emptiest sea.","Keep the horizon level; a tilted sea is the first thing people notice."],
"brighton-odd":["Shoot in open shade so the window is not washed out by sun.","Get square to the glass and close enough that your reflection is hidden."],
"cpark-mood-s":["The elms turn yellow in the last week of October; check before you go.","Overcast light makes the yellow glow; sun makes it patchy."],
"cpark-moment-s":["Windy autumn afternoons drop the most leaves.","Stand downwind of the tree so the leaves blow toward you and the people reaching for them."],
"wsp-mood-s":["The trees turn in late October to early November.","Give the players a nod before you crouch; they are used to cameras and appreciate being asked."],
"harlem-place-s":["The street trees turn in late October to early November.","Morning light on the west side of the street lights the trees."],
"dumbo-place-s":["The park trees turn in early to mid November.","Weekday mornings have dog walkers on the paths, which give scale without a crowd."],
"brighton-mood-s":["Late afternoon from October to November gives the longest shadows.","Expose for the low sun, about −1.3 EV, so the benches go to shape."],
"union-odd-s":["Pumpkins are at the market from late September to early November.","Saturday afternoons have the most skaters on the steps."]};
const WORK_REC_TIP = {"zone": "Take a few frames as the moment builds rather than one; gestures peak and fade in under a second.", "freeze": "Use short bursts of three to five frames, not long ones, so the camera is ready for the next moment.", "drag": "Blur is different every time: take five to ten frames of each moment, and zoom in on the screen to check the still subject is sharp.", "deep": "Before pressing, run your eye round the four edges; a step to the side can remove a bin, a pole growing out of a head or a half-cut person.", "shallow": "Look behind your subject before you shoot: a step left or right can swap a busy background for a plain one.", "night": "Check the screen for signs that have burnt out to white; if they have, turn the exposure compensation down another notch.", "silhouette": "Shapes read best when the limbs separate from the body: wait for a stride, a profile or an outstretched arm, not someone walking straight at you.", "interior": "Indoor light is often mixed; if skin looks green or orange, set the white balance on the main light, or correct it later from the DNG.", "detail": "Get square to the surface and check that the lines along the edges of the frame are parallel before you press."};

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
"gct-energy":["juxta","One sharp figure off-centre with the blurred crowd flowing past on both sides. Leave floor in front of the way they face."],
"gct-mood":["light","The bright patch sits in the middle with darkness on all four edges. Keep the figure small and fully inside the light."],
"gct-odd":["frame","Use the curve of the tiled arch as the frame and place the person tight in the corner, facing out of the picture."],
"tsq-place":["lines","The two avenues form a V. Put its point just above centre and the crowd along the bottom fifth."],
"tsq-moment":["fill","The face fills the upper half, eyes on the top third, looking up and out of the frame. The background should be colour only."],
"tsq-energy":["thirds","Anchor a dark figure or lamppost on one third so the three frames differ only in colour."],
"tsq-mood":["reflect","Set the ground line high: reflection in the lower two thirds, feet and umbrellas along the top."],
"tsq-odd":["juxta","Costume head and human head side by side at the same height, against a plain background so the pairing reads at once."],
"wsp-place":["frame","For the second shot, let the arch border three sides and place Fifth Avenue's vanishing point in the centre."],
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
"coney-moment":["fill","Crop to the first two rows of faces, with the track as a diagonal behind them."],
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
"ferry-energy":["frame","Door frame sharp on both sides, the crowd streaking through the middle toward you."],
"ferry-mood":["space","Window on one side, the rider in profile against it, the dark cabin taking the rest of the frame."],
"ferry-odd":["layers","The commuter large and sharp in the near third, the tourists' backs out of focus along the rail behind."],
"subway-place":["lines","Columns and the yellow strip converge on one point. Put that point on a third, with the person between two columns near it."],
"subway-moment":["frame","The door window frames the face outside. Press close to the glass to keep your own reflection out."],
"subway-energy":["thirds","Rider sharp on one third and facing into the frame, the train streaking across the other two thirds."],
"subway-mood":["space","Shoot down the car: empty seats as repeating shapes, the lone rider small at the far end."],
"subway-odd":["layers","The instrument in the near foreground, one listener's face sharp in the middle distance."],
"harlem-place":["thirds", "Marquee on the upper third, your passer-by on the opposite lower third, with the street between them."],
"harlem-moment":["frame", "Use the church doorway as the frame, with the group on the steps inside it."],
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
"wburg-moment":["layers", "Waiting players sharp in the foreground, the game blurred behind them."],
"wburg-energy":["layers", "Nearest walker large on one side, the station crowd stacked behind, shopfronts as the back layer."],
"wburg-mood":["light", "Shadow fills most of the frame. The figure stands inside the one bright strip."],
"wburg-odd":["juxta", "Line the person up with a painted shape of the same size, so the two read as a pair."],
"midtown-place":["sym", "Centre the avenue's vanishing point with equal walls of tower on both sides."],
"midtown-moment":["space", "The person small on a lower third, with a large plain wall or empty steps around them."],
"midtown-energy":["layers", "The front walker large at one edge, the rest of the crowd stepping off in a row behind."],
"midtown-mood":["light", "Dark street on all sides, one lit person in the bright patch, placed off-centre."],
"midtown-odd":["juxta", "The suit and the cart side by side at the same scale, steam between them."],
"cpark-place":["frame", "The centre arch frames the terrace and the Lake. Keep the arch's sides equal and the person inside the opening."],
"cpark-moment":["thirds", "The bridge curves across the lower third and the couple stand at its crown, on a vertical third."],
"cpark-energy":["diag", "The drive bends diagonally through the frame. The still walker sits on a third while runners streak along the curve."],
"cpark-mood":["sym", "Centre the path, with equal rows of benches and elms on both sides and the lone figure at the vanishing point."],
"cpark-odd":["layers", "Performer near, listeners in the middle, the bright terrace beyond the arches as the back layer."],
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
  down:["Top view","Stand in the middle and shoot along the length.",
    '<rect x="20" y="5" width="18" height="90" class="d-bg"/><rect x="112" y="5" width="18" height="90" class="d-bg"/>'+dYou(75,90,-90,72)+dS(75,24)],
  side:["Top view","Stand to the side so both people are in view.",
    '<rect x="65" y="28" width="60" height="10" class="d-bg"/>'+dYou(18,34,0,105)+dS(95,18)+dS(95,50)],
  anchor:["Top view","Brace against something solid and let the movement pass you.",
    dYou(75,80,-90,62)+'<rect x="70" y="86" width="10" height="8" class="d-mu"/>'+dArrow(42,10,42,92)+dArrow(108,92,108,10)+dS(75,24)],
  glass:["Top view","Get close to the glass and shoot through it.",
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
const IDEA_ART = {
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
const STANCE_OF = {};
Object.assign(COMPOSE, {"cpark-mood-s":["frame","The canopy closes over the path and frames the figure. Keep the path running to the far end."],"cpark-moment-s":["space","Leave the top half of the frame to falling leaves and sky; the reaching hands sit low."],
 "wsp-mood-s":["layers","Leaves near and above, the player in the middle, the far side of the square behind."],"harlem-place-s":["lines","The stoop railings and the kerb lead down the block under the colour."],
 "dumbo-place-s":["diag","Let the path climb corner to corner toward the monument, with the walker on the line."],"brighton-mood-s":["light","Expose for the low sun and let the benches and people go to shape."],"union-odd-s":["juxta","Orange pumpkins against the grey steps and a skater mid-push."]});
Object.entries({down:"harlem-place-s",wait:"cpark-mood-s cpark-moment-s union-odd-s",low:"wsp-mood-s dumbo-place-s",backlight:"brighton-mood-s"}).forEach(([k,v])=>v.split(" ").forEach(id=>STANCE_OF[id]=k));
Object.assign(COMPOSE, {"union-place": ["layers", "Tents near, shoppers in the middle, the buildings on the square far. Keep the aisle running into the distance."], "union-moment": ["fill", "Hands, board and the regular's face fill the frame. Nothing of the square is needed."], "union-energy": ["diag", "Let the steps run corner to corner so the blurred skaters follow the line."], "union-mood": ["light", "Expose for the digits and let everything else fall to shape."], "union-odd": ["juxta", "The sign's message against the reader's expression: agreement, doubt or boredom."], "fidi-place": ["layers", "Statue in front, suits in the middle, the columns and flags behind."], "fidi-moment": ["thirds", "Put the arriving plate or raised glass on a third, with the tables running off the opposite side."], "fidi-energy": ["sym", "Centre the spine of the Oculus and keep both sides of the ribs equal."], "fidi-mood": ["light", "The lit slot is the subject. Keep it off centre and let the shadow fill the rest."], "fidi-odd": ["fill", "Hands and the bull's flank fill the frame; crop the queue so it runs out of the edge."], "ktown-place": ["lines", "The stacked signs and the kerb all lead up the street. Keep the verticals straight."], "ktown-moment": ["frame", "The doorway frames the face. Keep the door edges inside the picture."], "ktown-energy": ["diag", "Turn until 34th Street and the crowd on the crossing run from a lower corner up to the opposite top corner, with the Empire State Building in that corner. The blurred walkers then stream along the line."], "ktown-mood": ["reflect", "Street neon reflected over the diners inside. Move until the reflection lands on a face."], "ktown-odd": ["juxta", "Cheap souvenirs at the bottom, the tower at the top, and nothing in between."], "bushwick-place": ["layers", "Kerb and car near, walker in the middle, mural behind."], "bushwick-moment": ["layers", "Photographer near, poser in the middle, mural behind."], "bushwick-energy": ["diag", "Shoot along the pavement so the shopfronts run away on a diagonal."], "bushwick-mood": ["space", "Leave most of the frame to the wall and the light. Keep the person small."], "bushwick-odd": ["juxta", "The painted face and the real one, side by side at the same scale."], "chelsea-place": ["frame", "The window is the frame. Keep its edges in the picture and the avenue inside it."], "chelsea-moment": ["frame", "The gallery doorway frames the people outside it."], "chelsea-energy": ["lines", "The brick walls and the floor run to a vanishing point at the far end of the hall."], "chelsea-mood": ["light", "Expose for the sky; the columns and people become shapes against it."], "chelsea-odd": ["reflect", "The reflection is the picture. Tilt until the bent figure fills the frame."], "brighton-place": ["lines", "The el columns and the kerb lead the eye down the avenue."], "brighton-moment": ["thirds", "Put the two heads on the upper thirds and let the boardwalk fill the bottom."], "brighton-energy": ["layers", "Strollers near, diners in the middle, the restaurant lights behind."], "brighton-mood": ["space", "Sky and sea take almost the whole frame; the figure sits low and small."], "brighton-odd": ["fill", "The window fills the frame edge to edge."]});
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
const IDEA_PHOTO = {"midtown-place": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Theater_District%2C_New_York%2C_NY%2C_USA_-_panoramio_%281%29.jpg/960px-Theater_District%2C_New_York%2C_NY%2C_USA_-_panoramio_%281%29.jpg", "by": "Santi Garcia", "lic": "CC BY 3.0", "page": "https://commons.wikimedia.org/wiki/File:Theater_District,_New_York,_NY,_USA_-_panoramio_(1).jpg", "note": "The real wall of towers on the west side of Sixth Avenue, each one stepping back behind the last. This is one side of the canyon, shot looking up. For the idea above, turn to face along the avenue so a second wall like this closes the other side, and tilt down until the white sky is out of the frame."}, "tsq-moment": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Portrait_%282209648969%29.jpg/960px-Portrait_%282209648969%29.jpg", "by": "jehangreco", "lic": "CC BY-SA 2.0", "page": "https://commons.wikimedia.org/wiki/File:Portrait_(2209648969).jpg", "note": "The face fills the frame and is lit by what the person is looking at, with the eyes turned up and out of the picture. The background has melted into spots of coloured light."}, "tsq-mood": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/THANK_YOU_NYC.jpg/960px-THANK_YOU_NYC.jpg", "by": "Jorge Jaramillo", "lic": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:THANK_YOU_NYC.jpg", "note": "Times Square after rain, shot from the edge of a puddle. The screens are repeated in the water, and the one figure with an umbrella sits on the line where the two halves meet."}};
function photoDemo(key,id){ const p=IDEA_PHOTO[id]||TECH_PHOTO[key]; if(!p) return "";
  const credit='Photo: '+esc(p.by)+' · '+esc(p.lic)+' · <a href="'+esc(p.page)+'" target="_blank" rel="noopener">Wikimedia Commons ↗</a>';
  return '<figure class="refphoto"><span class="label">Reference photo</span>'+
    (PHOTOS_INLINE ? '<img src="'+esc(p.src)+'" alt="Example photograph showing '+esc(TECH[key][0].toLowerCase())+'" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><a class="reflink" href="'+esc(p.page)+'" target="_blank" rel="noopener" hidden>Open the reference photo ↗ (not available offline yet)</a>'
                   : '<a class="reflink" href="'+esc(p.page)+'" target="_blank" rel="noopener">Open the reference photo ↗</a>')+
    '<figcaption>'+esc(p.note)+'<span>'+credit+'</span></figcaption></figure>'; }
const workDemo = id => { const s=WORK_ART[id]||STANCE[STANCE_OF[id]]; if(!s) return "";
  return '<figure class="demo">'+dSvg(s[2],s[0]+": "+s[1],false)+'<figcaption>'+s[0]+'. '+s[1]+' Yellow is you and what the lens sees; white is the subject.</figcaption></figure>'; };
const composeDemo = (key,id) => { const art=IDEA_ART[id]||TECH_ART[key]; return art ? '<figure class="demo">'+dSvg(art,TECH[key][0]+" example frame",true)+'<figcaption>How the frame should look.</figcaption></figure>' : ""; };

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
const EVENT_TYPES = {parade:"Parade",festival:"Street festival",cultural:"Cultural celebration",holiday:"Holiday",sports:"Sport",light:"Light",fireworks:"Fireworks",gathering:"Gathering",market:"Market",photowalk:"Photo walk or workshop",photoshow:"Photo festival or show",camera:"Camera event"};
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
    if(recipe==="night" && i.phase!=="night" && i.phase!=="dusk") out.push("These settings are for after dark. In daylight, stop down to f/5.6 and let Auto ISO fall.");
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
    if(recipe==="drag") out.push("Full sun: 1/15 s is out of reach. f/16 and ISO 50 give 1/60 s, enough for a little blur on fast walkers. For real streaks wait for shade or use a 3-stop ND filter.");
  }
  if(i.sky==="partly") out.push("The light will swing by about two stops as clouds pass. Auto ISO covers it; recheck exposure compensation when the sun comes out.");
  if(/cloud|rain|storm/.test(i.sky||"")){
    if(recipe==="silhouette") out.push("There is no hard light now, so silhouettes will be weak. Shoot against a bright doorway, window or screen instead.");
    else if(recipe==="drag") out.push("Cloud helps here: f/16 at 1/15 s and ISO 100 is about right under heavy cloud. Under lighter cloud use ISO 50.");
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
  camera: store.get("camera","q343"), view:"today", tab:"idea", cond:"auto", camCmp:store.get("camCmp",["q343","x100vi","griv"]), lfF:43, lfN:8, lfS:3, drills:new Set(store.get("drills",[])), evType:"all", mapZoom:store.get("mapZoom","city"), mapSel:null, mapEv:null, mapT:null, mapIntent:"all", mapShowEv:store.get("mapShowEv",true)!==false, mapShowLm:store.get("mapShowLm",true)!==false, mapShowSub:store.get("mapShowSub",true)!==false, mapShowStn:store.get("mapShowStn",true)!==false, mapShowSunny:store.get("mapShowSunny",true)!==false, mapShowSpots:store.get("mapShowSpots",true)!==false, mapShowNames:store.get("mapShowNames",true)!==false, sheet:"peek", mapLm:null, mapSpot:null, notes: store.get("notes",{}) || {}, pos:null, plan:null,
  saved: new Set(store.get("saved",[])), done: new Set(store.get("done",[])), current:null, history:[]
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
  if(a.d&&!a.d.includes(t.getDay())) return false;
  if(a.m&&!a.m.includes(t.getMonth()+1)) return false;
  if(a.h){ const hr=t.getHours()+t.getMinutes()/60; if(!a.h.some(([s,e])=>s<e?(hr>=s&&hr<e):(hr>=s||hr<e))) return false; }
  if(a.wx==="sun"&&/rain|storm|snow|fog|cloud/.test(sky||"")) return false;
  if(a.wx==="rain"&&!(sky==="rain"||sky==="storm"||(sky===undefined&&nowInfo().sky==="rain"&&Math.abs(t-Date.now())<6*36e5))) return false;
  return true; }
function availText(x){ const a=AVAIL[x.id]; if(!a) return ""; const out=[];
  if(a.d){ const d=a.d.slice().sort(); out.push(d.join()==="1,2,3,4,5"?"Weekdays":d.join()==="0,6"?"Weekends":d.join()==="1,2,3,4,5,6"?"Monday to Saturday":d.length===1?DAY_NAMES[d[0]]+"s":d.map(n=>DAY_SHORT[n]).join(", ")); }
  if(a.h) out.push(a.h.map(([s,e])=>hourText(s)+" to "+hourText(e)).join(" and "));
  if(a.m&&!x.m){ const M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], m=a.m; out.push(m.length>=5&&m[0]<=m[m.length-1]?M[m[0]-1]+" to "+M[m[m.length-1]-1]:m.length>=5?M[m[0]-1]+" to "+M[m[m.length-1]-1]:m.map(n=>M[n-1]).join(", ")); }
  if(a.wx==="sun") out.push("needs sun"); if(a.wx==="rain") out.push("needs rain"); if(a.wx==="dull") out.push("best in bad weather");
  return out.join(" · "); }


function matches(savedOnly){
  return cityIdeas().filter(x => (state.intent==="all"||x.i===state.intent) && (state.place==="all"||(state.place==="near"?nearSet().has(x.p):x.p===state.place))
    && (state.when==="all"||x.w.includes(state.when)) && (!savedOnly||state.saved.has(x.id)));
}
function show(id){
  if(state.current && state.current!==id){ state.history.push(state.current); if(state.history.length>40) state.history.shift(); }
  state.current=id; state.tab="idea";
  const c=document.getElementById("card"); if(c){ c.classList.remove("swap"); void c.offsetWidth; c.classList.add("swap"); }
}
function pick(){
  const m = matches(false); if(!m.length){ state.current=null; return; }
  let pool = m.filter(x=>!state.done.has(x.id) && x.id!==state.current);
  if(!pool.length) pool = m.filter(x=>x.id!==state.current);
  if(!pool.length) pool = m;
  show(pool[Math.floor(Math.random()*pool.length)].id);
}
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
const FOCUS_OVERRIDE = {
  "tsq-mood":"{s}, with {box} on the reflection of the screens, not on the wet ground: a reflection is as far away as the thing it reflects. Stop down to f/4 or f/5.6 so the feet and umbrellas stay sharp as well; Auto ISO will rise, and Times Square is bright enough to allow it."
};
const REC_F = {zone:8, freeze:4, drag:11, deep:8, shallow:0, night:0, silhouette:5.6, interior:2.8, detail:4};
const mText = v => v===Infinity ? "infinity" : v<1 ? Math.round(v*100)+" cm" : v<10 ? (Math.round(v*10)/10)+" m" : Math.round(v)+" m";
function workFocus(x, camKey){
  const W=WORKX[x.id]; if(!W) return "";
  const [full,,d,,crop]=W, sharp=full.length>40?'the subject named above':full, cam=CAMERAS[camKey], r=x.r, wait=STANCE_OF[x.id]==="wait";
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
  const cropTxt=crop&&leica&&crop>fl*1.2&&!(fl===43&&crop<60)?' Use the '+crop+' mm crop frame: at '+mText(d)+', '+(sharp===full?sharp:'your subject')+' would be small in the full '+fl+' mm frame.':'';
  const pre=wait&&["shallow","interior","night"].includes(r)?' While you wait, half-press on the spot where they will stand and keep holding, so the camera is ready when they arrive.':'';
  let t;
  if(r==="zone") t=T.m+'. Before you start, turn the focus ring to '+mText(d)+(leica?' (read it on the lens scale or the distance shown on screen)':'')+'. At f/8 everything from '+range+' is sharp'+lens+', so do not refocus: keep about '+mText(d)+' from '+sharp+' by moving your feet. After dark, when the aperture has to open up, switch to '+T.s+' with '+T.eye+' instead.';
  else if(r==="freeze") t=T.c+' with '+T.eye+', aimed at '+sharp+'. Half-press as your subject enters the frame and keep holding: the box follows them. Press for a short burst through the peak.';
  else if(r==="drag") t=T.s+', with '+T.box+' on '+sharp+'. Half-press to focus and keep holding while the movement passes, then press; letting go between frames lets it refocus on a passer-by. For a long session at one spot, switch to '+T.m+' and set '+mText(d)+' once. '+(INDOOR.has(x.id)?'Indoors the aperture opens wide at 1/15 s, so the focus has to be exact.':'Outdoors in daylight the aperture closes to about f/11, which keeps '+range+' sharp'+lens+'; after dark it opens up, so the focus has to be exact.');
  else if(r==="shallow"){ const [a,b]=dofCalc(fl,N,d); t=T.s+' with '+T.eye+': check the box is on the nearest eye before you press. At f/'+N+' and '+mText(d)+', '+(b-a<1?'only about '+mText(b-a):'about '+mText(b-a))+' front to back is sharp'+lens+(b-a<1?', so move the box onto the eye rather than focusing and then reframing.':'. That is plenty for a face, but the background stays fairly sharp at this distance; separation comes from a plain, distant background.'); }
  else if(r==="night") t=T.s+', with '+T.box+' on '+sharp+'. Autofocus needs light and contrast: if it hunts, focus on a lit edge at the same distance and hold the half-press. At f/'+N+' and '+mText(d)+', '+range+' is sharp'+lens+'.';
  else if(r==="silhouette") t=T.s+', with '+T.box+' on '+sharp+'. Aim it at a point of strong contrast, such as an outline against the light; a dark shape on its own gives the camera nothing to focus on.'+(wait?' To be ready before someone arrives, half-press on the ground where they will be and keep holding.':'');
  else if(r==="interior") t=T.s+', with '+T.box+' on '+sharp+'. At f/2.8 and '+mText(d)+', '+range+' is sharp'+lens+'.';
  else if(r==="detail") t=T.s+', with '+T.spot+' on '+sharp+'.'+(leica?' Closer than '+(fl===43?'60':'30')+' cm, turn the macro ring first.':' Closer than the lens allows, step back and crop later.');
  else t=T.s+', with '+T.box+' on '+sharp+'. At f/8 and '+mText(d)+', '+range+' is sharp'+lens+'. Half-press, reframe if you need to, then press.';
  if(FOCUS_OVERRIDE[x.id]) t=FOCUS_OVERRIDE[x.id].replace(/\{s\}/g,T.s).replace(/\{box\}/g,T.box).replace(/\{m\}/g,T.m);
  const glass=STANCE_OF[x.id]==="glass" ? (r==="zone" ? ' In a reflection, the person is as far away as the glass plus their distance from it: set the ring for that total, not for the glass.' : ' Through glass, autofocus can lock onto the pane or a reflection. If the face comes out soft, put the box back on the face, or switch to '+T.m+' and set the distance.') : '';
  return t+glass+pre+cropTxt;
}
function workTips(x){ const t=(WORK_TIPS[x.id]||[]).concat(WORK_REC_TIP[x.r]?[WORK_REC_TIP[x.r]]:[]); if(!t.length) return "";
  return '<div class="part wktips"><span class="label">Tips for the best shot</span><ul>'+t.map(v=>'<li>'+esc(v)+'</li>').join("")+'</ul></div>'; }
function workDetails(x){
  const W=WORKX[x.id]; if(!W) return "";
  const cam=CAMERAS[state.camera], row=(k,v)=>'<div class="wkrow"><span class="label">'+k+'</span><p>'+v+'</p></div>';
  return '<div class="wk">'+row("Keep sharp",esc(W[0].charAt(0).toUpperCase()+W[0].slice(1))+'.')+row("Distance","About "+esc(mText(W[2]))+(W[2]>=50?', far enough that everything beyond is sharp too':'')+'.')+row("Camera height",esc(W[1])+'.')+
    row("How to focus · "+esc(cam.name),esc(workFocus(x,state.camera)))+row("Press",esc(W[3])+'.')+'</div>'+workTips(x);
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
  guideStop(true); const g={id, heading:null, watch:null, fix:false, err:false, acc:null}; state.guide=g;
  g.onOri=e=>{ let h=null; if(typeof e.webkitCompassHeading==="number") h=e.webkitCompassHeading; else if(e.absolute&&typeof e.alpha==="number") h=(360-e.alpha)%360; if(h!==null&&state.guide===g){ g.heading=h; guideRender(); } };
  try{ const D=window.DeviceOrientationEvent; if(D&&typeof D.requestPermission==="function") D.requestPermission().then(r=>{ if(r==="granted") addEventListener("deviceorientation",g.onOri); }).catch(()=>{});
    else if(D){ addEventListener("deviceorientationabsolute",g.onOri); addEventListener("deviceorientation",g.onOri); } }catch(e){}
  const fail=()=>{ if(state.guide!==g) return; if(!g.fix){ g.err=true; } guideRender(); };
  if(!navigator.geolocation){ g.err=true; guideRender(); return; }
  try{ g.watch=navigator.geolocation.watchPosition(p=>{ if(state.guide!==g) return; state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; g.acc=p.coords.accuracy; g.err=false;
      if(!g.fix){ g.fix=true; guideFit(); } mapDraw(); guideRender(); }, fail, {enableHighAccuracy:true, maximumAge:5000, timeout:20000}); }catch(e){ g.err=true; }
  guideRender(); mapPanel(); }
function guideStop(silent){ const g=state.guide; if(!g) return; try{ if(g.watch!=null) navigator.geolocation.clearWatch(g.watch); }catch(e){}
  try{ removeEventListener("deviceorientation",g.onOri); removeEventListener("deviceorientationabsolute",g.onOri); }catch(e){}
  state.guide=null; if(!silent){ guideRender(); mapDraw(); mapPanel(); } }
function guideInfo(){ const g=state.guide; if(!g||!state.pos) return null; const [pid,i]=g.id.split(":"), S=SPOTS[pid]&&SPOTS[pid][+i]; if(!S) return null;
  const to={lat:S[0],lon:S[1]}, km=kmBetween(state.pos,to); return {S, pid, km, brg:bearingTo(state.pos,to), here:km*1000<=Math.max(20,Math.min(40,g.acc||0))}; }
function guideFit(){ const G=guideInfo(); if(!G) return; const [ax,ay]=mapXY(state.pos.lat,state.pos.lon), [bx,by]=mapXY(G.S[0],G.S[1]);
  if(G.km>6){ mapFly(mapAim({cx:bx,cy:by,w:12})); return; }
  mapFly(mapAim({cx:(ax+bx)/2, cy:(ay+by)/2, w:Math.min(330,Math.max(10,Math.max(Math.abs(ax-bx),Math.abs(ay-by)*MAP_ASPECT)*1.7))})); }
function guideRender(){ const box=$("mapGuide"); if(!box) return; const g=state.guide; if(!g){ box.hidden=true; box.innerHTML=""; return; }
  const [pid,i]=g.id.split(":"), S=SPOTS[pid][+i], G=guideInfo(), stop='<button type="button" class="gstop" data-guidestop="1" aria-label="Stop guiding">×</button>', num='<span class="snum">'+spotNum(g.id)+'</span>';
  let h;
  if(g.err&&!G) h='<div class="gtxt"><b>Your location is not available here</b><span>Guide me there works in the installed app on your phone, with location allowed for Shot List.</span></div>';
  else if(!G) h='<div class="gtxt"><b>Finding you…</b><span>Heading to '+esc(S[3])+'</span></div>';
  else if(G.here){ const rel=g.heading===null?S[2]:S[2]-g.heading, lf=lightFacing(S[2],new Date());
    h=arrowSvg(rel)+'<div class="gtxt"><b>You are here. Face '+compass(S[2])+'.</b><span>'+(g.heading===null?'The arrow points that way on the map, with north up; your phone has not shared a compass.':'Turn until the arrow points straight up.')+' '+esc(lf.txt)+' now.</span></div>'; }
  else { const rel=g.heading===null?G.brg:G.brg-g.heading;
    h=arrowSvg(rel)+'<div class="gtxt"><b>'+mDist(G.km)+' · about '+walkMin(G.km)+' min</b><span>Head '+compass(G.brg)+' to '+num+' '+esc(spotShort(S))+(g.heading===null?' (arrow on map north)':'')+(g.acc>40?'. GPS is rough here, ±'+Math.round(g.acc)+' m':'')+'</span></div>'; }
  box.innerHTML=h+stop; box.hidden=false; box.classList.toggle("here",!!(G&&G.here)); }

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
function showNear(){ state.mapNear=true; state.mapSel=null; state.mapSpot=null; state.mapEv=null; state.mapLm=null; mapPanel(); mapDraw(); if(state.pos) mapFly(mapAim({...mapPreset("me"), w:30})); setSheet("half"); }
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
function renderCard(){
  const x = IDEAS.find(y=>y.id===state.current), card=$("card");
  $("save").disabled=$("done").disabled=!x; $("back").disabled=!state.history.length;
  if(!x){ card.innerHTML='<div class="pane"><h2>No idea fits these filters</h2><p class="plain">Choose Any, or widen the place or the light.</p></div>';
    $("save").textContent="Save"; $("done").textContent="Shot it"; return; }
  const it=INTENTS[x.i], pl=PLACES[x.p], cam=CAMERAS[state.camera], rec=cam.recipes[x.r], su=setupFor(cam,x.r), co=COMPOSE[x.id], st=STANCE[STANCE_OF[x.id]];
  const ni=nowInfo(), adv=su?adjustFor(x.r,ni,cam.setup==="leica",x.id):[];
  const tabs=[["idea","Idea"],["work","Work it"],["compose","Compose"],["settings","Settings"]];
  let pane;
  if(state.tab==="work"){
    pane='<div class="split"><div class="part"><span class="label">How to work it</span><p>'+esc(x.work)+'</p></div>'+workDemo(x.id)+'</div>'+workDetails(x)+standBlock(x);
  } else if(state.tab==="compose" && co){
    pane='<div class="split"><div class="part"><div><button type="button" class="label tipbtn" data-tip="c" aria-expanded="'+(openTip==="c")+'">'+esc(TECH[co[0]][0])+'</button></div><p>'+esc(co[1])+'</p>'+
      '<p class="tdef"><b>What it means:</b> '+esc(TECH[co[0]][1])+'</p></div>'+composeDemo(co[0],x.id)+'</div>'+photoDemo(co[0],x.id);
  } else if(state.tab==="settings"){
    pane='<div class="field"><label class="label" for="camera">Camera</label><select id="camera">'+
      Object.entries(CAMERAS).map(([k,v])=>'<option value="'+k+'"'+(k===state.camera?" selected":"")+'>'+esc(v.name)+'</option>').join("")+'</select></div>'+
      (su ? '<div><button type="button" class="vals tipbtn" data-tip="exp" aria-expanded="'+(openTip==="exp")+'">'+esc(rec[0])+'</button></div>' : '<span class="vals">'+esc(rec[0])+'</span>')+
      '<p class="note">'+esc(rec[1])+'</p>'+
      (adv.length ? '<div class="adjust"><span class="label">Adjust for now · '+esc(nowLabel(ni))+'</span><ul>'+adv.map(a=>'<li>'+esc(a)+'</li>').join("")+'</ul></div>' : '')+
      (su ? '<div class="setup">'+SETUP_LABELS.map((l,n)=>{ const [mv,nt]=splitVal(su[n]); return '<button type="button" data-tip="'+n+'" aria-haspopup="dialog" aria-expanded="'+(openTip===String(n))+'"><span class="label">'+l+'</span><span class="sv"><b>'+esc(mv)+'</b>'+(nt?'<small>'+esc(nt)+'</small>':'')+'</span><span class="si" aria-hidden="true">i</span></button>'; }).join("")+'</div>'+
        '<p class="hint">Tap a setting to see what it does and the other options.</p>' : '');
  } else {
    pane='<div class="part"><span class="label">Look for</span><p>'+esc(x.look)+'</p></div>'+standBlock(x)+
      '<div class="part"><span class="label">Your rule</span><p>'+esc(x.rule)+'</p></div>'+
      '<div class="part"><span class="label">Best light</span><div class="times">'+x.w.map(w=>'<span class="time">'+WHEN[w]+'</span>').join("")+(x.m?'<span class="time season">'+seasonText(x)+'</span>':'')+(availText(x)?'<span class="time avail">'+esc(availText(x))+'</span>':'')+'</div></div>'+
      '<div class="part"><label class="label" for="note">Your notes</label><textarea id="note" rows="2" placeholder="What worked, what was different, what to try next time">'+esc(state.notes[x.id]||"")+'</textarea></div>'+followIdea(x.i)+igRow(x)+
      '<div class="jumps">'+
      (st ? '<button type="button" class="jump" data-tab="work"><span><small>Work it</small>'+esc(st[1])+'</span><span class="go" aria-hidden="true">›</span></button>' : '')+
      (co ? '<button type="button" class="jump" data-tab="compose"><span><small>Compose</small>'+esc(TECH[co[0]][0])+'</span><span class="go" aria-hidden="true">›</span></button>' : '')+
      '<button type="button" class="jump" data-tab="settings"><span><small>'+esc(cam.name)+(adv.length?' · adjust for now':'')+'</small><span class="mono">'+esc(rec[0])+'</span></span><span class="go" aria-hidden="true">›</span></button></div>';
  }
  card.innerHTML =
    '<div class="band" style="background:'+it.color+'"></div>'+
    '<div class="sign-head"><div class="sign-top"><span class="intent-tag"><span class="dot" style="background:'+it.color+'"></span>'+esc(it.name)+'</span>'+
    '<span class="where">'+esc(pl.name)+' · '+esc(pl.stop||"")+' '+bullets(pl.lines, pl.city)+'</span></div><h2>'+esc(x.t)+'</h2>'+startHtml(x.p)+'</div>'+
    '<div class="tabs" role="tablist">'+tabs.map(t=>'<button type="button" role="tab" data-tab="'+t[0]+'" aria-selected="'+(state.tab===t[0])+'">'+t[1]+'</button>').join("")+'</div>'+
    '<div class="pane">'+pane+'</div>';
  const s=state.saved.has(x.id), d=state.done.has(x.id);
  $("save").setAttribute("aria-pressed",s); $("save").textContent = s?"Saved ✓":"Save";
  $("done").setAttribute("aria-pressed",d); $("done").textContent = d?"Shot ✓":"Shot it";
}
function renderList(){
  const saved=state.view==="saved", m=matches(saved), box=$("list");
  if(!m.length){ box.innerHTML='<div class="intents savedswitch"><button type="button" class="chip" data-listv="browse" aria-pressed="'+!saved+'">All ideas</button><button type="button" class="chip" data-listv="saved" aria-pressed="'+saved+'">Saved</button></div><p class="empty">'+(saved?"Nothing saved here yet. Tap Save on an idea in Shoot to keep it in this list.":"No ideas fit these filters. Choose Any, or widen the place or the light.")+'</p>'; return; }
  const noted=cityIdeas().filter(x=>state.notes[x.id]);
  const nSaved=cityIdeas().filter(x=>state.saved.has(x.id)).length;
  box.innerHTML = '<div class="intents savedswitch"><button type="button" class="chip" data-listv="browse" aria-pressed="'+!saved+'">All ideas</button><button type="button" class="chip" data-listv="saved" aria-pressed="'+saved+'">Saved ('+nSaved+')</button></div>'+
    '<div class="notesbar"><span class="msg">'+m.length+' idea'+(m.length===1?'':'s')+(state.pos?', nearest first':'')+'</span>'+
    (noted.length?'<button type="button" class="chip" id="copyNotes">Copy my notes ('+noted.length+')</button>':'')+'</div>'+
  (state.pos||state.place!=="all"?"":'<div class="intents areajump">'+Object.keys(AREAS).filter(a=>placeOrder().some(pid=>areaOf(pid)===a&&m.some(x=>x.p===pid))).map(a=>'<a class="chip" href="#area-'+a+'">'+AREAS[a]+'</a>').join("")+'</div>')+
  placeOrder().map((pid,n,arr)=>{ const p=PLACES[pid];
    const rows=m.filter(x=>x.p===pid); if(!rows.length) return "";
    const first=!state.pos && !arr.slice(0,n).some(q=>areaOf(q)===areaOf(pid)&&m.some(x=>x.p===q));
    return (first?'<h3 class="label areahead" id="area-'+areaOf(pid)+'">'+AREAS[areaOf(pid)]+'</h3>':'')+'<section class="group"><div class="group-head"><b>'+esc(p.name)+(milesTo(p)!==null?'<span class="dist">'+milesText(milesTo(p))+'</span>':'')+'</b>'+whereHtml(PLACES[pid])+startLink(pid)+'</div>'+rows.map(x=>
      '<button type="button" class="row'+(state.done.has(x.id)?" done":"")+'" data-id="'+x.id+'">'+
      '<span class="dot" style="background:'+INTENTS[x.i].color+'"></span>'+
      '<span class="t"><b>'+esc(x.t)+'</b><span>'+esc(INTENTS[x.i].name)+(COMPOSE[x.id]?' · '+esc(TECH[COMPOSE[x.id][0]][0]):'')+'</span></span>'+
      '<span class="marks">'+(state.saved.has(x.id)?'<span class="pill">Saved</span>':'')+(state.done.has(x.id)?'<span class="pill">Shot</span>':'')+(state.notes[x.id]?'<span class="pill">Note</span>':'')+'</span>'+
      '<span class="go" aria-hidden="true">›</span></button>').join("")+'</section>';
  }).join("")+(saved?"":followAll());
}
/* Accounts to follow for inspiration. Links only: the photos belong to the photographers, so the app sends you to them.
   [name, link, what to look for, intents it helps with ("" = general)] */
const IG = h => "https://www.instagram.com/"+h+"/";
const FOLLOW = [
 ["Daniel Arnold",IG("arnold_daniel"),"Close, funny, unposed Manhattan crowds.","moment odd"],
 ["Andre D. Wagner",IG("photodre"),"Black-and-white Brooklyn and subway life. Watch the hands and gestures.","moment mood"],
 ["Melissa O'Shaughnessy",IG("melissaoshaughnessy"),"Fifth Avenue and Midtown pavements in layered colour.","energy place"],
 ["Phil Penman",IG("philpenman"),"Black-and-white New York in snow, steam and rain, shot on Leica.","mood place"],
 ["Joe Greer",IG("ioegreer"),"Saturated colour, hard light and deep shadow in Manhattan.","mood place"],
 ["Jonathan Higbee","https://www.jonathanhigbee.com","His Coincidences series lines passers-by up with billboards and murals in Manhattan.","odd place"],
 ["Dina Litovsky",IG("dina_litovsky"),"New York social life in colour and flash.","energy"],
 ["Nina Welch-Kling",IG("ninakling"),"Graphic shadows and bold blocks of colour in Manhattan.","odd mood"],
 ["Aaron Berger",IG("aaronbergerfoto"),"Tight, close colour frames on New York pavements.","moment energy"],
 ["Paulie B",IG("paulie.b"),"Everyday New York at close range, by the maker of Walkie Talkie.","moment energy"],
 ["Faizal Westcott",IG("westcott"),"Cinematic colour in New York. He explains his process on YouTube.","place mood"],
 ["Craig Whitehead",IG("sixstreetunder"),"Colour and layers, shot through glass, gaps and reflections.","mood"],
 ["Pau Buscató",IG("paubuscato"),"Visual puns and coincidences.","odd"],
 ["Shin Noguchi",IG("shinnoguchiphotos"),"Quiet, funny everyday moments in Tokyo.","moment odd"],
 ["Alan Schaller",IG("alan_schaller"),"High-contrast graphic black-and-white on Leica, strong on geometry and scale.","place"],
 ["Subway Hands",IG("subwayhands"),"Nothing but riders' hands on the subway. Shows how small a subject can be.","daily"],
 ["Mathias Wasik",IG("mathiaswasik"),"Colourful, crowded New York pavements and the ordinary people on them.","daily"],
 ["Lanna Apisukh",IG("apisukh"),"Neighbourhood life in Chinatown and Queens: shopkeepers, elders, skaters.","daily"],
 ["An Rong Xu",IG("anrizzy"),"Chinatown and Asian American daily life, warm and cinematic.","daily"],
 ["Janice Chung",IG("janicekaramchung"),"Korean community life in Flushing and Koreatown.","daily"],
 ["New York Nico",IG("newyorknico"),"The city's regulars, shop owners and characters.","daily"],
 ["Sam Youkilis",IG("samyoukilis"),"Short videos of small daily rituals: coffee, markets, gestures.","daily"],
 ["Everyday Africa",IG("everydayafrica"),"Daily life by local photographers. Its sister account Everyday Everywhere collects the same from other regions.","daily"],
 ["NYC Street Photography Collective",IG("nycspc"),"Work by local members, plus their shows and walks.",""],
 ["Women Street Photographers",IG("womenstreetphotographers"),"Curated daily, with a yearly New York exhibition.",""],
 ["Street Photography International",IG("streetphotographyinternational"),"Broad daily curation from around the world.",""],
 ["Walkie Talkie by Paulie B (YouTube)","https://www.youtube.com/@PaulieB","He walks New York with a different street photographer each episode while they shoot.",""]
];
/* Instagram hashtag links: the place (or a narrower tag for one idea) and a street-photography tag for the intent. */
const IG_PLACE = {"chinatown":"chinatownnyc","gct":"grandcentralterminal","tsq":"timessquare","wsp":"washingtonsquarepark","dumbo":"dumbobrooklyn","coney":"coneyisland","soho":"sohonyc","jh":"jacksonheights","ferry":"statenislandferry","harlem":"harlemnyc","les":"lowereastside","flushing":"flushingqueens","wburg":"williamsburgbrooklyn","midtown":"midtownmanhattan","cpark":"centralpark","rockaway":"rockaways","arthur":"arthuravenue","union":"unionsquarenyc","fidi":"financialdistrictnyc","ktown":"koreatownnyc","bushwick":"bushwickbrooklyn","chelsea":"highlinenyc","brighton":"brightonbeachbrooklyn","subway":"nycsubway"}, IG_IDEA = {"chinatown-place":"doyersstreet","chinatown-moment":"mottstreet","coney-place":"wonderwheel","coney-moment":"coneyislandcyclone","dumbo-place":"manhattanbridge","dumbo-mood":"brooklynbridgepark","les-place":"orchardstreet","les-moment":"essexmarket","flushing-moment":"newworldmall","wburg-place":"dominopark","wburg-moment":"mccarrenpark","wburg-mood":"williamsburgbridge","midtown-moment":"paleypark","midtown-odd":"halalguys","cpark-place":"bethesdaterrace","cpark-moment":"bowbridge","cpark-odd":"bethesdaterrace","harlem-place":"apollotheater","harlem-mood":"harlembrownstones","union-place":"unionsquaregreenmarket","fidi-place":"federalhall","fidi-moment":"stonestreet","fidi-energy":"oculus","fidi-odd":"chargingbull","ktown-moment":"heraldsquare","ktown-energy":"heraldsquare","ktown-odd":"empirestatebuilding","bushwick-place":"bushwickcollective","bushwick-moment":"bushwickcollective","bushwick-odd":"bushwickcollective","chelsea-moment":"chelseagalleries","chelsea-energy":"chelseamarket","chelsea-mood":"littleisland","chelsea-odd":"vesselnyc"}, IG_INTENT = {"place":"streetsofnewyork","moment":"nycstreetphotography","energy":"nycstreets","mood":"streetphotographynyc","odd":"streetphotographynyc"};
const igTags = x => [IG_IDEA[x.id.replace(/-s$/,"")]&&!x.m?IG_IDEA[x.id]:IG_PLACE[x.p], x.m?"nycfoliage":IG_INTENT[x.i]].filter(Boolean);
const igRow = x => { const t=igTags(x); return t.length ? '<div class="part"><span class="label">See it on Instagram</span><div class="callinks">'+t.map(h=>'<a class="chip" href="https://www.instagram.com/explore/tags/'+h+'/" target="_blank" rel="noopener">#'+h+' ↗</a>').join("")+'</div><p class="hint igh">Hashtags show everyone\u2019s posts, so expect tourists alongside street work.</p></div>' : ""; };
const followFor = i => FOLLOW.filter(f=>f[3].split(" ").includes(i));
const followLink = f => '<a class="chip" href="'+esc(f[1])+'" target="_blank" rel="noopener">'+esc(f[0])+' ↗</a>';
const followIdea = i => { const l=followFor(i).slice(0,3); return l.length ? '<div class="part"><span class="label">See how others do it</span><div class="callinks">'+l.map(followLink).join("")+'</div></div>' : ""; };
const followItem = f => '<li><a href="'+esc(f[1])+'" target="_blank" rel="noopener"><b>'+esc(f[0])+' ↗</b></a><span>'+esc(f[2])+'</span>'+
    (f[3]&&f[3]!=="daily"?'<span class="tags">'+f[3].split(" ").map(i=>'<span class="tag"><span class="dot" style="background:'+INTENTS[i].color+'"></span>'+INTENTS[i].name+'</span>').join("")+'</span>':'')+'</li>';
const followGroup = (title,list) => '<h3 class="label followhead">'+title+'</h3><ul class="follow">'+list.map(followItem).join("")+'</ul>';
const followAll = () => '<details class="syncbox followbox"><summary>Photographers to follow</summary><div class="syncbody"><p class="hint">These open Instagram, YouTube or their own site. The photos stay with the photographers.</p>'+
  followGroup("Street photography",FOLLOW.filter(f=>f[3]&&f[3]!=="daily"))+followGroup("Daily life",FOLLOW.filter(f=>f[3]==="daily"))+followGroup("Feeds and video",FOLLOW.filter(f=>!f[3]))+'</div></details>';
/* Live event updates. A weekly scheduled task writes confirmed dates and newly found events to the
   artifact database (collection "events"); the page merges them over the built-in pattern dates.
   Doc id = built-in event id to confirm it, or a new slug to add an event. "_status" holds the last check. */
let EVENT_DOCS = {};
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
function renderEvents(){
  const now=new Date(), today=new Date(now.getFullYear(),now.getMonth(),now.getDate()), cam=CAMERAS[state.camera], box=$("events");
  const fmt=(d,o)=>d.toLocaleDateString("en-US",o), dm={weekday:"short",month:"short",day:"numeric"};
  const open=new Set([...box.querySelectorAll("details[open]")].map(d=>d.dataset.id)), first=!box.querySelector("details");
  const all=eventRows(today), kinds=Object.keys(EVENT_TYPES).filter(k=>all.some(r=>r.e.type===k));
  if(state.evType!=="all" && !kinds.includes(state.evType)) state.evType="all";
  const list=state.evType==="all"?all:all.filter(r=>r.e.type===state.evType);
  const chips='<div class="intents" id="evTypes"><button type="button" class="chip" data-t="all" aria-pressed="'+(state.evType==="all")+'">All types</button>'+
    kinds.map(k=>'<button type="button" class="chip" data-t="'+k+'" aria-pressed="'+(state.evType===k)+'">'+EVENT_TYPES[k]+' · '+all.filter(r=>r.e.type===k).length+'</button>').join("")+'</div>';
  if(!list.length){ box.innerHTML='<p class="empty">No events listed for this city yet.</p>'; return; }
  const st=EVENT_DOCS._status, chk=st&&eParse(st.checked);
  box.innerHTML='<p class="lead">Events worth shooting, plus photo walks, shows and camera events for photographers, soonest first. '+
    (chk?'Dates were last checked on '+fmt(chk,{month:"short",day:"numeric"})+' and the list is rechecked every week. ':'')+
    'Events marked Confirmed were matched to a published listing. The rest follow each event\'s usual pattern, so confirm before you go.</p>'+chips+list.map((r,n)=>{
    const e=r.e, o=r.o, yr=o?o[0].getFullYear():today.getFullYear(), other=o&&yr!==today.getFullYear();
    const full=o ? fmt(o[0],dm)+(o[1]?" to "+fmt(o[1],dm):"")+(other?", "+yr:"") : "Date not announced";
    const soon=r.cancelled?"Cancelled":(o?eventSoon(o,today):"");
    const q="https://www.google.com/search?q="+encodeURIComponent(e.name+" "+CITIES[e.city].name+" "+yr+" date route");
    const src=typeof r.source==="string" && /^https:\/\//.test(r.source) ? r.source : null;
    return '<details class="event" data-id="'+esc(e.id)+'"'+((first?n===0:open.has(e.id))?" open":"")+'><summary>'+
      '<span class="cal">'+(o?'<small>'+fmt(o[0],{month:"short"})+'</small><b>'+o[0].getDate()+'</b>':'<small>TBA</small><b>·</b>')+'</span>'+
      '<span class="t">'+(EVENT_TYPES[e.type]?'<span class="etag'+(PHOTO_TYPES.has(e.type)?" ph":"")+'">'+EVENT_TYPES[e.type]+'</span>':'')+'<b>'+esc(e.name)+'</b><span>'+esc(e.where)+'</span></span>'+
      '<span class="soon'+(/now|Today|Tomorrow|days|Cancelled/.test(soon)?" near":"")+'">'+soon+'</span></summary>'+
      '<div class="event-body"><p class="when">'+full+(e.approx?" (expected)":"")+
        (r.confirmed?' <span class="pill">Confirmed</span>':'')+(r.added?' <span class="pill">New</span>':'')+
        '<span>'+esc(e.time)+(e.approx?". This date is announced each year and may differ.":"")+(e.note?" "+esc(e.note):"")+'</span></p>'+
      (e.why?'<p>'+esc(e.why)+'</p>':'')+
      (e.spot?'<div class="part"><span class="label">'+(PHOTO_TYPES.has(e.type)?"Good to know":"Where to be")+'</span><p>'+esc(e.spot)+'</p></div>':'')+
      (e.map?'<a class="check" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(e.map[1])+'" target="_blank" rel="noopener">'+(e.map[0]===""?(PHOTO_TYPES.has(e.type)?"Open the venue in Google Maps":"Open the viewing spot in Google Maps"):e.map[0]==="area"?"Open the area in Google Maps":(PHOTO_TYPES.has(e.type)?"Venue: ":"Viewing spot: ")+esc(e.map[0]))+' ↗</a>':'')+
      (e.ideas.length?'<div class="part"><span class="label">Shots to look for</span><ul class="eideas">'+e.ideas.map(i=>
        '<li><span class="tag"><span class="dot" style="background:'+INTENTS[i[0]].color+'"></span>'+INTENTS[i[0]].name+'</span><b>'+esc(i[1])+'</b><span>'+esc(i[2])+'</span><span class="set">'+esc(cam.recipes[i[3]][0])+'</span></li>').join("")+'</ul></div>':'')+
      calLinks(e,o)+(src?'<a class="check" href="'+esc(src)+'" target="_blank" rel="noopener">Source for this date ↗</a>':'<a class="check" href="'+q+'" target="_blank" rel="noopener">Check this year\'s date and route ↗</a>')+'</div></details>';
  }).join("");
}
/*@LIVE@*/
// Plan an outing: a few stops ordered as a walk, with ideas that suit the light at each stop's time.
function phaseAt(t){ const c=CITIES[state.city]; if(typeof c.lat!=="number") return "mid"; const [rise,set]=sunTimes(t,c.lat,c.lon), m=6e4;
  return (t<rise-30*m||t>+set+30*m) ? "night" : t>set-120*m ? "gold" : t<+rise+180*m ? "am" : "mid"; }
/* Hourly forecast (installed app only): rain and heavy cloud by hour, used by the map slider, the pins and Plan. */
function hourlyAt(t){ const w=WEATHER[state.city], h=w&&w.hourly; if(!h||!h.time) return null;
  const key=t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")+"T"+String(t.getHours()).padStart(2,"0")+":00", i=h.time.indexOf(key);
  return i<0?null:{pop:h.pop?h.pop[i]:null, mm:h.mm?h.mm[i]:null, cc:h.cc?h.cc[i]:null, code:h.code?h.code[i]:null}; }
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
function wxBar(){ const w=WEATHER[state.city];
  if((!w||!w.hourly)&&$("wxStrip")) $("wxStrip").innerHTML="";
  if(!w||!w.hourly) return '<p class="wxsum">'+(typeof loadWeather==="function" ? "The hourly rain and cloud forecast appears here once the app is online." : "The hourly rain and cloud forecast shows here in the installed app on your phone. This version only knows today\u2019s overall weather.")+'</p>'; const d=new Date(); d.setHours(0,0,0,0);
  const seg=[], runs=[]; let cur=null;
  for(let h=0;h<24;h++){ const t=new Date(+d+h*36e5), s=skyAt(t); if(s===undefined){ seg.push("transparent"); cur=null; continue; }
    seg.push(s==="rain"||s==="snow"?"rgba(70,120,230,.85)":s==="cloud"||s==="fog"?"rgba(140,145,155,.7)":"rgba(252,204,10,.35)");
    if(s&&s!=="cloud"){ if(cur&&cur.k===s&&cur.e===h){ cur.e=h+1; } else { cur={k:s,s:h,e:h+1}; runs.push(cur); } } else cur=null; }
  const g='linear-gradient(to right,'+seg.map((c,h)=>c+' '+(h/24*100).toFixed(2)+'%,'+c+' '+((h+1)/24*100).toFixed(2)+'%').join(",")+')';
  const hf=h=>((h%12)||12)+(h<12||h===24?" am":" pm");
  const txt=runs.length?runs.map(r=>WX_WORD[r.k]+" "+hf(r.s)+" to "+hf(r.e)).join(" · "):"No rain expected today";
  if($("wxStrip")) $("wxStrip").innerHTML='<div class="wxbar" style="background:'+g+'"></div>';
  return '<div class="wxlegend"><span><i class="wxk sun"></i>Clear or some cloud</span><span><i class="wxk cloud"></i>Overcast</span><span><i class="wxk rain"></i>Rain</span></div><p class="wxsum">'+txt+'. Forecast by Open-Meteo.</p>'; }
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
    all.forEach(x=>{ if(!here.includes(x)&&AVAIL[x.id]) skipped.add(x.id); });
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
    L.push("Golden hour is "+tf(gold.s)+" to "+tf(gold.e)+", while you are at "+esc(PLACES[at.place].name)+"."+(dull?" Cloud will mute it today.":" Be in position before it starts.")); }
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
  T.push("Start at "+tf(p.start)+" at "+esc(START[first.place]?START[first.place][0]:fp.name)+"."+(START[first.place]?' <a href="'+mapUrl(first.place)+'" target="_blank" rel="noopener">Map ↗</a>':''));
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
  const mins=Math.round((p.end-p.start)/6e4), n=p.stops.reduce((a,s)=>a+s.ideas.length,0);
  const dayLab=p.start.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const skipped=(p.skipped||[]).map(id=>IDEAS.find(x=>x.id===id)).filter(Boolean);
  box.innerHTML='<p class="lead">'+esc(dayLab)+', '+tf(p.start)+' to about '+tf(p.end)+' · '+p.stops.length+' place'+(p.stops.length===1?'':'s')+' · '+n+' ideas. Tap an idea to open it.</p>'+
    (p.notes&&p.notes.length?'<p class="msg">'+p.notes.map(esc).join(" ")+'</p>':'')+
    (skipped.length?'<p class="msg">Left out because they are not on then: '+skipped.map(x=>'<b>'+esc(x.t)+'</b> ('+esc(availText(x))+')').join("; ")+'.</p>':'')+planRoute(p)+planPrep(p)+
    p.stops.map(s=>{ const pl=PLACES[s.place];
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
const MAP_HOODS = [["Howard Beach",40.658,-73.8448],["Jamaica",40.7046,-73.7928],["Forest Hills",40.7212,-73.8481],["Ridgewood",40.7069,-73.9008],["Rego Park",40.7265,-73.8635],["Maspeth",40.73,-73.8957],["Sunnyside",40.7409,-73.931],["Elmhurst",40.7397,-73.8768],["Astoria",40.762,-73.92],["Long Island City",40.7589,-73.9395],["Woodside",40.7504,-73.9033],["Corona",40.7428,-73.8585],["Steinway",40.7777,-73.9053],["Midwood",40.6211,-73.9564],["Sheepshead Bay",24.5941,-44.7933],["Flatbush",40.6377,-73.9609],["Crown Heights",40.6744,-73.939],["Borough Park",40.6309,-73.988],["Park Slope",40.6711,-73.9838],["Brighton Beach",40.581,-73.9613],["Bay Ridge",40.6244,-74.03],["Bensonhurst",40.6129,-73.9953],["Bedford",40.6914,-73.9503],["Greenpoint",40.7294,-73.9487],["Fort Greene",40.6902,-73.9744],["Red Hook",40.6784,-74.0036],["Sunset Park",40.652,-74.0113],["Brooklyn Heights",40.6958,-73.995],["Bushwick",40.6968,-73.9257],["East New York",40.6599,-73.8771],["Bed-Stuy",40.688,-73.9315],["Canarsie",40.6374,-73.8999],["Financial District",40.7085,-74.011],["East Village",40.7276,-73.9858],["West Village",40.7329,-74.0012],["Chelsea",40.7474,-73.9985],["Hell's Kitchen",40.7643,-73.9925],["Lincoln Square",40.775,-73.9845],["Upper West Side",40.7903,-73.974],["Yorkville",40.7774,-73.9489],["Upper East Side",40.775,-73.961],["East Harlem",40.7901,-73.9458],["Morningside Heights",40.8077,-73.9629],["Hamilton Heights",40.8269,-73.949],["Washington Heights",40.8418,-73.9416],["Inwood",40.8664,-73.9191],["Murray Hill",40.7442,-73.9771],["Stuyvesant Town",40.7318,-73.9766],["Gramercy",40.7366,-73.9841],["Highbridge",40.838,-73.9257],["Riverdale",40.8993,-73.9068],["Mott Haven",40.8071,-73.9167],["Hunts Point",40.8123,-73.8857],["Fordham",40.8586,-73.8996],["Parkchester",40.8374,-73.8577],["Hoboken",40.744,-74.04],["Jersey City",40.718,-74.068],["Tribeca",40.7163,-74.0086],["Midtown East",40.7545,-73.969]];
/* Landmarks: name, lat, lon, kind, tier (1 shows zoomed out, 2 when zoomed in), a photography tip. Positions are approximate. */
const LANDMARKS = [["Empire State Building",40.7484,-73.9857,"tower",1,"Lit in changing colours at night. Frame it down 33rd Street, or up Fifth Avenue from Madison Square Park."],["One World Trade Center",40.7127,-74.0134,"tower",1,"Its glass picks up the sky and the light. Shoot it from the 9/11 Memorial plaza or from Jersey City across the Hudson."],["Statue of Liberty",40.6892,-74.0445,"monument",1,"The free Staten Island Ferry passes close by. Stand on the right-hand side of the boat on the way out to Staten Island."],["Brooklyn Bridge",40.7061,-73.9969,"bridge",1,"Walk the promenade soon after sunrise, before the crowds. From Pebble Beach in DUMBO it frames the Lower Manhattan skyline."],["Manhattan Bridge",40.7075,-73.9908,"bridge",1,"The famous view is down Washington Street in DUMBO, with the Empire State Building framed under the arch. Expect a queue of photographers."],["Williamsburg Bridge",40.7134,-73.9719,"bridge",1,"The walkway is steel lattice and chain-link: strong lines, cyclists and the skyline ahead when walking west in late light."],["Queensboro Bridge",40.757,-73.9545,"bridge",1,"See it from Sutton Place Park, or ride the Roosevelt Island Tram, which runs right alongside it."],["Chrysler Building",40.7516,-73.9755,"tower",1,"The crown lights up after dark. Look up Lexington Avenue in the low 40s, or west along 42nd Street from the Tudor City overpass."],["Flatiron Building",40.7411,-73.9897,"tower",1,"The classic wedge view is from the plaza where Broadway crosses Fifth Avenue at 23rd Street."],["Rockefeller Center",40.7587,-73.9787,"view",1,"Flags and the rink on the plaza. The Top of the Rock deck (ticketed) looks north over Central Park and south to the Empire State."],["The Met",40.7794,-73.9632,"museum",1,"The front steps on Fifth Avenue are a stage for people-watching, busiest on weekend afternoons."],["Hudson Yards and the Vessel",40.7538,-74.0022,"tower",1,"The Vessel's honeycomb works best shot from below. The Edge deck next door (ticketed) has a glass floor over the streets."],["The Oculus",40.7114,-74.011,"transit",1,"White ribs and floor reflections. Handheld is fine; tripods are not allowed."],["Grand Army Plaza",40.6743,-73.9701,"monument",1,"The Soldiers and Sailors Arch at the top of Prospect Park, with a Greenmarket on Saturdays."],["Lincoln Center",40.7725,-73.9835,"venue",1,"The fountain plaza glows at dusk, and concert-goers dress up on performance nights."],["Prospect Park",40.6602,-73.969,"park",1,"Long Meadow, the boathouse and weekend crowds. At its best in autumn colour."],["Yankee Stadium",40.8296,-73.9262,"venue",1,"On game days, crowds pour along River Avenue under the elevated 4 train."],["Barclays Center",40.6826,-73.9754,"venue",1,"The rusted steel canopy and the subway entrance beneath it fill up before events."],["Unisphere",40.7463,-73.8451,"monument",1,"The steel globe from the 1964 World's Fair. The fountains run in summer; shoot from low so it fills the sky."],["The Cloisters",40.8649,-73.9319,"museum",1,"Medieval cloisters in Fort Tryon Park with Hudson views. Quiet, and good in soft light."],["9/11 Memorial",40.7115,-74.0134,"monument",2,"Two square pools in the footprints of the towers. It is a place of mourning: be respectful, and leave people's grief out of your pictures."],["Charging Bull",40.7056,-74.0134,"monument",2,"Crowded all day. Go early for an empty frame, or turn round and photograph the crowd instead."],["Wall Street",40.7069,-74.0113,"monument",2,"The Stock Exchange facade and its giant flag, and office workers at lunchtime."],["City Hall",40.7128,-74.006,"monument",2,"City Hall Park, with the Municipal Building's colonnade across Centre Street."],["South Street Seaport",40.7063,-74.0036,"view",2,"Cobbled streets, tall ships and views of the Brooklyn Bridge from Pier 17."],["Governors Island",40.6895,-74.0168,"park",2,"A short ferry ride from the Battery Maritime Building. Open lawns and harbour views of the skyline."],["Little Island",40.742,-74.0103,"park",2,"A park on tulip-shaped pillars in the Hudson. Busy at sunset; at peak times entry may need a reservation."],["High Line",40.748,-74.0048,"park",2,"A park on an old elevated rail line. Frame people against the streets below and the buildings alongside."],["Whitney Museum",40.7396,-74.0089,"museum",2,"Outdoor terraces look over the Meatpacking District and the start of the High Line."],["MoMA",40.7614,-73.9776,"museum",2,"Ticketed. The sculpture garden, and the city seen through big gallery windows."],["Guggenheim",40.783,-73.959,"museum",2,"The white spiral facade on Fifth Avenue, opposite Central Park."],["Columbus Circle",40.7681,-73.9819,"monument",2,"Traffic swirls round the column, with reflections in the towers above."],["Moynihan Train Hall",40.7527,-73.9962,"transit",2,"A huge skylit hall with a hanging clock. Travellers stream under it at rush hour."],["Bryant Park",40.7536,-73.9832,"park",2,"Lunch crowds on movable chairs; the Winter Village rink from late autumn."],["Madison Square Park",40.742,-73.9875,"park",2,"Benches, dogs and lunch queues, with the Flatiron Building at its southwest corner."],["Tompkins Square Park",40.7265,-73.9818,"park",2,"East Village life: chess players, dogs, musicians, and the Halloween dog parade."],["Stonewall Inn",40.7338,-74.0021,"monument",2,"A national monument on Christopher Street and the heart of Pride in June."],["Domino Park",40.7143,-73.968,"park",2,"Waterfront park under the Williamsburg Bridge, with the skyline across the river."],["McCarren Park",40.7205,-73.9515,"park",2,"Runners, softball games and Williamsburg weekend crowds."],["Gantry Plaza",40.7455,-73.9585,"view",2,"Old rail gantries and the Pepsi-Cola sign, with the Midtown skyline across the East River."],["MoMA PS1",40.7455,-73.947,"museum",2,"Contemporary art in a former school in Long Island City."],["Roosevelt Island Tram",40.7613,-73.9642,"transit",2,"Ride it for a moving view down the East River beside the Queensboro Bridge."],["Astoria Park",40.779,-73.922,"park",2,"Under the Hell Gate and RFK bridges, with summer crowds at the big public pool."],["Apollo Theater",40.8101,-73.95,"venue",2,"The marquee on 125th Street lights up at night."],["Columbia University",40.8075,-73.9626,"museum",2,"The Low Library steps and the campus lawns between classes."],["Brooklyn Museum",40.6712,-73.9636,"museum",2,"A grand Beaux-Arts building on Eastern Parkway, with fountains on the plaza."],["Brooklyn Botanic Garden",40.6694,-73.9624,"park",2,"Ticketed. Cherry blossoms in April draw big crowds."],["Green-Wood Cemetery",40.6529,-73.9906,"park",2,"Gothic gates and hills. From Battle Hill a statue of Minerva salutes the Statue of Liberty."],["Wonder Wheel",40.5741,-73.979,"venue",2,"Swinging cars against the sky; the lights come on at dusk."],["Citi Field",40.7571,-73.8458,"venue",2,"Mets crowds stream off the 7 train on game days."],["New York Botanical Garden",40.8623,-73.88,"park",2,"Ticketed gardens and a Victorian glasshouse conservatory."],["Bronx Zoo",40.8506,-73.877,"park",2,"Ticketed. Shown for orientation."],["LaGuardia Airport",40.7769,-73.874,"transit",2,"Shown for orientation."],["JFK Airport",40.6413,-73.7781,"transit",2,"Shown for orientation."]];
const LM_KIND = {tower:"Building",bridge:"Bridge",monument:"Monument",museum:"Museum or campus",park:"Park",view:"Viewpoint",venue:"Venue",transit:"Transport"};
const LM_GLYPH = {   // drawn in a box from -4 to 4
  tower:'<path d="M-1.6 4V-2.2H1.6V4M-0.6-2.2V-4.2M-3.2 4H3.2"/>',
  bridge:'<path d="M-4 1.6H4M-3.6 1.6Q0-4.4 3.6 1.6M-2 1.6V-0.6M0 1.6V-1.3M2 1.6V-0.6"/>',
  monument:'<path d="M-1 4L-0.6-3L0-4.2L0.6-3L1 4ZM-2.8 4H2.8"/>',
  museum:'<path d="M-3.6-1.4L0-3.8L3.6-1.4ZM-2.6-0.6V2.8M0-0.6V2.8M2.6-0.6V2.8M-3.6 3.6H3.6"/>',
  park:'<path d="M0 4V0.6"/><circle cx="0" cy="-1.2" r="2.6"/>',
  view:'<path d="M-4 0Q0-4 4 0Q0 4-4 0Z"/><circle cx="0" cy="0" r="1.2"/>',
  venue:'<ellipse cx="0" cy="0" rx="3.8" ry="2.6"/><ellipse cx="0" cy="0" rx="1.6" ry="0.9"/>',
  transit:'<rect x="-2.8" y="-3.8" width="5.6" height="6.4" rx="1.4"/><path d="M-2.8-0.4H2.8M-1.8 4L-1 2.6M1.8 4L1 2.6"/>'};
const MAP_STREETS = MAPD_STREETS;   // real street centrelines (label segment, or -1 for no label)
/* Hand-placed points for each place's starting spot and each event's viewing spot. Events added by the weekly task carry their own lat and lon. */
const STATION_GEO = {"chinatown":[[40.7187,-74.0002,"NQRW6JZ"]],"gct":[[40.7527,-73.9772,"4567S"]],"tsq":[[40.7557,-73.987,"1237NQRWS"]],"wsp":[[40.7322,-74.0003,"ACEBDFM"]],"dumbo":[[40.7013,-73.9867,"F"]],"coney":[[40.5773,-73.9811,"DFNQ"]],"soho":[[40.7244,-73.9978,"RW"]],"jh":[[40.7465,-73.8912,"7EFMR"]],"ferry":[[40.7025,-74.0135,"1RW"]],"harlem":[[40.8111,-73.9522,"ABCD"],[40.8076,-73.9454,"23"]],"les":[[40.7185,-73.9879,"FMJZ"]],"flushing":[[40.7596,-73.8301,"7"]],"wburg":[[40.7172,-73.9567,"L"]],"midtown":[[40.7603,-73.9751,"EF"]],"cpark":[[40.7757,-73.9762,"BC"]],"rockaway":[[40.588,-73.8135,"S"]],"arthur":[[40.8613,-73.8907,"BD"]]};
Object.assign(STATION_GEO, {"union": [[40.7349, -73.99, "456LNQRW"]], "fidi": [[40.7103, -74.0079, "2345ACJZ"], [40.7071, -74.0119, "2345"]], "ktown": [[40.7497, -73.9877, "BDFMNQRW"]], "bushwick": [[40.7067, -73.9229, "L"]], "chelsea": [[40.7407, -74.0021, "ACEL"]], "brighton": [[40.5777, -73.9614, "BQ"]]});
const START_GEO = {"chinatown":[40.7146,-73.998],"gct":[40.7527,-73.9772],"tsq":[40.759,-73.9849],"wsp":[40.7312,-73.9971],"dumbo":[40.7033,-73.9895],"coney":[40.5738,-73.979],"soho":[40.7256,-73.9992],"jh":[40.7467,-73.8915],"ferry":[40.7013,-74.0131],"harlem":[40.8101,-73.95],"les":[40.7183,-73.9881],"flushing":[40.7596,-73.83],"wburg":[40.7172,-73.9567],"midtown":[40.7603,-73.9751],"cpark":[40.774,-73.9708],"rockaway":[40.5843,-73.8125],"arthur":[40.8553,-73.8877]};
const EVENT_GEO = {"foliage":[40.7725,-73.9718],"threekings":[40.7916,-73.9447],"lunar":[40.7155,-73.9983],"stpat":[40.7722,-73.9672],"easter":[40.7585,-73.976],"dance":[40.7284,-73.9872],"henge":[40.747,-73.9808],"prday":[40.7697,-73.969],"mermaid":[40.5757,-73.99],"pride":[40.7338,-74.0021],"westindian":[40.6712,-73.9636],"sangennaro":[40.7193,-73.9975],"columbus":[40.7678,-73.9705],"dogparade":[40.727,-73.9795],"halloween":[40.7357,-73.998],"marathon":[40.6706,-73.9886],"veterans":[40.742,-73.9875],"balloons":[40.7813,-73.974],"thanksgiving":[40.7765,-73.9761],"tree":[40.7587,-73.978],"dyker":[40.6155,-74.0125],"nye":[40.758,-73.9855],"aipad":[40.7676,-73.966],"bild":[40.7578,-74.0026],"photoville":[40.7038,-73.9941],"fujikina-nyc-2026":[40.718,-73.9886],"aperture-loves-new-york":[40.7811,-73.976],"bronx-halloween-parade":[40.8205,-73.891],"bryant-park-winter-village":[40.7536,-73.9832],"disability-pride-parade":[40.742,-73.9875],"diwali-times-square":[40.759,-73.985],"jackson-heights-halloween-parade":[40.7497,-73.884],"mano-a-mano-day-of-the-dead":[40.7302,-73.987]};
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
  return eventRows(today).filter(r=>r.o&&!r.cancelled&&r.o[0]<=lim).map(r=>{ const d=EVENT_DOCS[r.e.id], g=(d&&typeof d.lat==="number"&&typeof d.lon==="number"&&d.lat>40.4&&d.lat<41&&d.lon>-74.3&&d.lon<-73.6)?[d.lat,d.lon]:EVENT_GEO[r.e.id];
    if(!g) return null; const [x,y]=mapXY(g[0],g[1]); const st=evStatus(r,mapNow()); return {r,id:r.e.id,x,y,st,day:st.chip}; }).filter(Boolean); }
let MAP_ASPECT = 1.35; const MAP_LIM = {x:[250,880], y:[70,860], w:[6,560]};
const mapPreset = k => { if(k==="me"&&state.pos){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); return {cx:x,cy:y,w:110}; }
  return k==="man" ? {cx:486,cy:386,w:196} : k==="bk" ? {cx:520,cy:500,w:250} : {cx:576,cy:462,w:492}; };
const MAP_PRESETS = [["city","Whole city"],["man","Manhattan"],["bk","Downtown and Brooklyn"]];
let mapV = null, mapAnim = 0;
const mapClamp = v => { v.w=Math.min(MAP_LIM.w[1],Math.max(MAP_LIM.w[0],v.w)); v.cx=Math.min(MAP_LIM.x[1],Math.max(MAP_LIM.x[0],v.cx)); v.cy=Math.min(MAP_LIM.y[1],Math.max(MAP_LIM.y[0],v.cy)); return v; };
function mapFly(to){ cancelAnimationFrame(mapAnim); const from=Object.assign({},mapV), t0=performance.now(), still=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  mapClamp(to); if(still){ mapV=to; mapDraw(); return; }
  const step=now=>{ const k=Math.min(1,(now-t0)/380), e=1-Math.pow(1-k,3); mapV={cx:from.cx+(to.cx-from.cx)*e, cy:from.cy+(to.cy-from.cy)*e, w:from.w*Math.pow(to.w/from.w,e)}; mapDraw(); if(k<1) mapAnim=requestAnimationFrame(step); };
  mapAnim=requestAnimationFrame(step); }
const mapTxt = (lat,lon,t,cls,size,rot) => { const [x,y]=mapXY(lat,lon); return '<text x="'+x.toFixed(0)+'" y="'+y.toFixed(0)+'" font-size="'+size+'" text-anchor="middle" class="'+cls+'"'+(rot?' transform="rotate('+rot+' '+x.toFixed(0)+' '+y.toFixed(0)+')"':'')+'>'+t+'</text>'; };
const mapLine = (a,b) => { const p=mapXY(a[0],a[1]), q=mapXY(b[0],b[1]); return 'M'+p[0].toFixed(1)+' '+p[1].toFixed(1)+'L'+q[0].toFixed(1)+' '+q[1].toFixed(1); };
function mapShell(box){
  const R=MAPD_ROADS, road=(k,c)=>R[k]?'<path d="'+R[k]+'" class="m-rd '+c+'"/>':'';
  const LAYER_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 8.5 12 14l10-5.5L12 3Z"/><path d="m2 12.5 10 5.5 10-5.5M2 16.5 12 22l10-5.5"/></svg>';
  box.innerHTML=
    '<div class="mapwrap"><svg class="mapsvg" id="mapSvg" role="group" aria-label="Map of shooting places. Drag to move, pinch to zoom."><rect x="-500" y="-500" width="2500" height="2500" class="m-sea"/>'+
    '<g transform="scale(0.1)" class="m-base"><path d="'+MAPD_CTX+'" class="m-ctx"/><path d="'+MAPD_LAND+'" class="m-land"/><path d="'+MAPD_AIR+'" class="m-air"/><path d="'+MAPD_CEM+'" class="m-cem"/><path d="'+MAPD_PARK+'" class="m-park"/></g>'+
    '<g transform="scale(0.1)" class="m-roads">'+road("path","foot")+road("local","local")+road("ave","ave")+road("hwy","hwy")+'</g>'+
    '<g transform="scale(0.1)" class="m-subway">'+MAPD_SUBWAY.map(([c,d])=>'<path d="'+d+'" stroke="'+c+'"/>').join("")+'</g>'+
    mapTxt(40.787,-73.957,"MANHATTAN","m-boro",15,-61)+mapTxt(40.648,-73.95,"BROOKLYN","m-boro",22)+mapTxt(40.705,-73.825,"QUEENS","m-boro",22)+mapTxt(40.845,-73.86,"THE BRONX","m-boro",18)+mapTxt(40.585,-74.14,"STATEN ISLAND","m-boro",16)+mapTxt(40.765,-74.085,"NEW JERSEY","m-boro",15)+
    mapTxt(40.772,-74.004,"Hudson River","m-water",7,-62)+mapTxt(40.672,-74.045,"Upper Bay","m-water",8)+mapTxt(40.612,-73.845,"Jamaica Bay","m-water",8)+mapTxt(40.558,-73.905,"Atlantic Ocean","m-water",9)+mapTxt(40.7385,-73.9665,"East River","m-water",5,-68)+
    '<g id="mapDyn"></g><g id="mapPhotos">'+(PHOTOS_INLINE?Object.entries(PLACE_PHOTO).map(([id,P])=>'<clipPath id="pc-'+id+'"><circle r="1"/></clipPath><image data-ph="'+id+'" href="'+esc(P.src)+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#pc-'+id+')" style="display:none" onerror="this.remove()"/>').join(""):'')+'</g><g id="mapOver"></g></svg></div>'+
    '<div class="mtop"><div class="mrow"><div class="mapgo"><select id="mapGo" aria-label="Go to a place"></select></div><button type="button" class="mlayersbtn" id="mapLayersBtn" aria-expanded="false" aria-controls="mapLayers" title="Map layers">'+LAYER_ICON+'<span>Layers</span><i id="mapLiveDot" hidden></i></button></div>'+
    '<div class="intents mchips" id="mapIntent"></div></div>'+
    '<div class="mlayers" id="mapLayers" hidden></div><div class="mguide" id="mapGuide" role="status" aria-live="polite" hidden></div>'+
    '<div class="mapbtns"><button type="button" data-full="1" aria-label="Full screen map" title="Full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="ico-open" d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/><path class="ico-close" d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5"/></svg></button><button type="button" data-zoom="0.6" aria-label="Zoom in">+</button><button type="button" data-zoom="1.6" aria-label="Zoom out">−</button><button type="button" data-fit="1" aria-label="Show the whole city" title="Whole city">⌂</button><button type="button" data-locate="1" aria-label="Find me on the map" title="Find me">◎</button></div>'+
    '<div class="mapscale" id="mapScale"></div>'+
    '<section class="msheet" id="mapSheet" aria-label="Map details"><div class="mgrab" id="mapGrab" role="button" tabindex="0" aria-label="Show more or less"><i></i></div>'+
      '<div class="sunbar"><div class="sunrow"><div class="slidecol"><input type="range" id="mapTime" min="0" max="1435" step="5" aria-label="Time of day on the map"><div id="lightTicks" class="lticks"></div><div id="wxStrip"></div></div><button type="button" class="chip" id="mapTimeNow">Now</button></div><p id="mapStatus" class="mstatus"></p></div>'+
      '<div class="mbody" id="mapBody"><div id="mapPanel"></div><div id="mapPlan"></div><div class="msec"><div id="lightMarks" class="intents lmarks"></div><div id="wxBar"></div><p id="sunLine" class="sunline"></p></div><div id="mapLegend" class="msec"></div></div></section>';
  mapGestures($("mapSvg")); sheetGestures();
}
/* A photograph for each place, shown in its pin (installed app only; the Claude version cannot load outside images). Wikimedia Commons, credited in the place panel. */
const PLACE_PHOTO = {"chinatown":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Chinatown-manhattan-2004.jpg/250px-Chinatown-manhattan-2004.jpg","page":"https://commons.wikimedia.org/wiki/File:Chinatown-manhattan-2004.jpg","by":"Derek Jensen (Tysto)","lic":"Public domain"},"gct":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Grand_Central_Terminal_main_concourse_looking_west_Jan_2025.jpg/250px-Grand_Central_Terminal_main_concourse_looking_west_Jan_2025.jpg","page":"https://commons.wikimedia.org/wiki/File:Grand_Central_Terminal_main_concourse_looking_west_Jan_2025.jpg","by":"4300streetcar","lic":"CC BY 4.0"},"tsq":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Times_Square%2C_New_York_2019_23.jpg/250px-Times_Square%2C_New_York_2019_23.jpg","page":"https://commons.wikimedia.org/wiki/File:Times_Square,_New_York_2019_23.jpg","by":"dconvertini","lic":"CC BY-SA 2.0"},"wsp":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Washington_Square_Arch_%281%29_01.jpg/250px-Washington_Square_Arch_%281%29_01.jpg","page":"https://commons.wikimedia.org/wiki/File:Washington_Square_Arch_(1)_01.jpg","by":"PortableNYCTours","lic":"CC BY-SA 4.0"},"dumbo":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Manhattan_Bridge_view_from_Washington_Street_DUMBO_Brooklyn_Morning_2022.jpg/250px-Manhattan_Bridge_view_from_Washington_Street_DUMBO_Brooklyn_Morning_2022.jpg","page":"https://commons.wikimedia.org/wiki/File:Manhattan_Bridge_view_from_Washington_Street_DUMBO_Brooklyn_Morning_2022.jpg","by":"Eugene Krasnaok","lic":"CC BY 4.0"},"coney":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Denos_Wonder_Wheel-2.jpg/250px-Denos_Wonder_Wheel-2.jpg","page":"https://commons.wikimedia.org/wiki/File:Denos_Wonder_Wheel-2.jpg","by":"Kris Arnold","lic":"CC BY-SA 2.0"},"soho":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/28_Greene_St%2C_New_York_City-L1002592.jpg/250px-28_Greene_St%2C_New_York_City-L1002592.jpg","page":"https://commons.wikimedia.org/wiki/File:28_Greene_St,_New_York_City-L1002592.jpg","by":"Frank Schulenburg","lic":"CC BY-SA 4.0"},"jh":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/82_Street_vc.jpg/250px-82_Street_vc.jpg","page":"https://commons.wikimedia.org/wiki/File:82_Street_vc.jpg","by":"Doug Letterman","lic":"CC BY 2.0"},"ferry":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Staten_Island_Ferry_%2851490632968%29.jpg/250px-Staten_Island_Ferry_%2851490632968%29.jpg","page":"https://commons.wikimedia.org/wiki/File:Staten_Island_Ferry_(51490632968).jpg","by":"Eden, Janine and Jim","lic":"CC BY 2.0"},"harlem":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Apollo_Theater%2C_Harlem_%282011%29.jpg/250px-Apollo_Theater%2C_Harlem_%282011%29.jpg","page":"https://commons.wikimedia.org/wiki/File:Apollo_Theater,_Harlem_(2011).jpg","by":"Jujus367","lic":"CC BY-SA 3.0"},"les":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/97_Orchard_Street_Front.jpg/250px-97_Orchard_Street_Front.jpg","page":"https://commons.wikimedia.org/wiki/File:97_Orchard_Street_Front.jpg","by":"Fletcher6","lic":"CC BY-SA 3.0"},"flushing":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Signageage_-_Flickr_-_Payton_Chung.jpg/250px-Signageage_-_Flickr_-_Payton_Chung.jpg","page":"https://commons.wikimedia.org/wiki/File:Signageage_-_Flickr_-_Payton_Chung.jpg","by":"Payton Chung","lic":"CC BY 2.0"},"wburg":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Willliamsburg_Bridge_towards_Manhattan.jpg/250px-Willliamsburg_Bridge_towards_Manhattan.jpg","page":"https://commons.wikimedia.org/wiki/File:Willliamsburg_Bridge_towards_Manhattan.jpg","by":"Sashimi-b","lic":"CC BY 4.0"},"midtown":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Sixth_Avenue_looking_north.jpg/250px-Sixth_Avenue_looking_north.jpg","page":"https://commons.wikimedia.org/wiki/File:Sixth_Avenue_looking_north.jpg","by":"Leifern (English Wikipedia)","lic":"CC BY-SA 3.0"},"cpark":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Bethesda_Fountain_and_the_Lake%2C_Central_Park%2C_Manhattan%2C_New_York.jpg/250px-Bethesda_Fountain_and_the_Lake%2C_Central_Park%2C_Manhattan%2C_New_York.jpg","page":"https://commons.wikimedia.org/wiki/File:Bethesda_Fountain_and_the_Lake,_Central_Park,_Manhattan,_New_York.jpg","by":"Christian David","lic":"CC BY-SA 4.0"},"rockaway":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Rockaway_Beach_Boardwalk.jpg/250px-Rockaway_Beach_Boardwalk.jpg","page":"https://commons.wikimedia.org/wiki/File:Rockaway_Beach_Boardwalk.jpg","by":"Kidfly182","lic":"CC BY 4.0"},"arthur":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx%2C_New_York_City_001_crop.jpg/250px-Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx%2C_New_York_City_001_crop.jpg","page":"https://commons.wikimedia.org/wiki/File:Arthur_Avenue_between_184th_and_186th_Street_in_the_Bronx,_New_York_City_001_crop.jpg","by":"Leonard J. DeFrancisci","lic":"CC BY-SA 3.0"},"union":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/14th_St_Bway_td_%282018-03-22%29_05_-_Union_Square_Park.jpg/250px-14th_St_Bway_td_%282018-03-22%29_05_-_Union_Square_Park.jpg","page":"https://commons.wikimedia.org/wiki/File:14th_St_Bway_td_(2018-03-22)_05_-_Union_Square_Park.jpg","by":"Tdorante10","lic":"CC BY-SA 4.0"},"fidi":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Wall_Street_-_New_York_Stock_Exchange.jpg/250px-Wall_Street_-_New_York_Stock_Exchange.jpg","page":"https://commons.wikimedia.org/wiki/File:Wall_Street_-_New_York_Stock_Exchange.jpg","by":"Carlos Delgado","lic":"CC BY-SA 3.0"},"ktown":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Koreatown%2C_Manhattan_%2851877264332%29.jpg/250px-Koreatown%2C_Manhattan_%2851877264332%29.jpg","page":"https://commons.wikimedia.org/wiki/File:Koreatown,_Manhattan_(51877264332).jpg","by":"ajay_suresh","lic":"CC BY 2.0"},"bushwick":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Bushwick_Collective_103.jpg/250px-Bushwick_Collective_103.jpg","page":"https://commons.wikimedia.org/wiki/File:Bushwick_Collective_103.jpg","by":"Kidfly182","lic":"CC BY-SA 4.0"},"chelsea":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/High_Line%2C_Manhattan%2C_New_York_City%2C_20231001_1722_1459.jpg/250px-High_Line%2C_Manhattan%2C_New_York_City%2C_20231001_1722_1459.jpg","page":"https://commons.wikimedia.org/wiki/File:High_Line,_Manhattan,_New_York_City,_20231001_1722_1459.jpg","by":"Jakub Hałun","lic":"CC BY 4.0"},"brighton":{"src":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Brighton_Beach_Avenue_Elevated%2C_and_Tashkent_Supermarket_left_to_it.jpg/250px-Brighton_Beach_Avenue_Elevated%2C_and_Tashkent_Supermarket_left_to_it.jpg","page":"https://commons.wikimedia.org/wiki/File:Brighton_Beach_Avenue_Elevated,_and_Tashkent_Supermarket_left_to_it.jpg","by":"GK tramrunner RU","lic":"CC BY-SA 4.0"}};
/* The sheet over the bottom of the map: peek (time and a status line), half, or full. */
function sheetHeights(){ const m=$("map"), H=m.clientHeight||600, g=$("mapGrab"), sb=m.querySelector(".msheet .sunbar"), peek=Math.round((g?g.offsetHeight:20)+(sb?sb.offsetHeight:80)+6);
  return {peek, half:Math.max(peek+120,Math.round(H*0.5)), full:Math.max(peek+160,H-118), H}; }
function setSheet(st,instant){ const m=$("map"); if(!m||!$("mapSheet")) return; state.sheet=st; const h=sheetHeights()[st];
  const sh=$("mapSheet"); if(instant) sh.classList.add("nomove"); m.style.setProperty("--sheetH",h+"px"); sh.dataset.state=st; if(instant) requestAnimationFrame(()=>sh.classList.remove("nomove"));
  $("mapGrab").setAttribute("aria-expanded",st!=="peek"); }
const sheetPx = () => { const m=$("map"); if(!m) return 0; const v=parseFloat(getComputedStyle(m).getPropertyValue("--sheetH")); return isNaN(v)?0:v; };
const topPx = () => { const t=document.querySelector("#map .mtop"); return t?t.offsetTop+t.offsetHeight:0; };
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
function mapLayout(){ const m=$("map"); if(!m||state.view!=="map") return; if(state.mapFull) m.style.height=""; else { const top=m.getBoundingClientRect().top+window.scrollY; m.style.height=Math.max(440,Math.round(window.innerHeight-top-10))+"px"; }
  setSheet(state.sheet||"peek",true); mapDraw(); }
/* Map layers you can turn on and off */
const MAP_LAYERS = [["mapShowEv","Events","Upcoming events, and what is on now","lg ev"],["mapShowLm","Landmarks","Buildings, bridges and views, with tips","lg lmk"],["mapShowSub","Subway lines","In MTA colours","lg sub"],["mapShowStn","Stations","Every subway station when zoomed in","lg stn"],
  ["mapShowSunny","Sunny side","Which side of each street is in sun, while the sun is up","lg sunny"],["mapShowSpots","Where to stand","Spots and lens wedges when zoomed in","lg spot"],["mapShowNames","Street and area names","","lg names"]];
function mapLayersHtml(nLive){ return '<div class="mlayers-head"><b>Map layers</b><button type="button" class="mapselx" data-layersclose="1" aria-label="Close">×</button></div>'+
  MAP_LAYERS.map(([k,t,sub,ic])=>'<button type="button" class="mlayer" data-layer="'+k+'" aria-pressed="'+!!state[k]+'"><span class="'+ic+'"></span><span class="t"><b>'+t+(k==="mapShowEv"&&nLive?' · '+nLive+' on now':'')+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</span><span class="sw" aria-hidden="true"></span></button>').join("")+
  '<p class="mlayers-sub">Jump to</p><div class="intents" id="mapZoom">'+MAP_PRESETS.concat(state.pos?[["me","Near me"]]:[]).map(z=>'<button type="button" class="chip" data-z="'+z[0]+'">'+z[1]+'</button>').join("")+'<button type="button" class="chip" data-nearspots="1">Spots near me</button></div>'; }

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
const mapNow = () => { if(state.mapT===null) return new Date(); const d=new Date(); d.setHours(0,0,0,0); return new Date(+d+state.mapT*6e4); };
function sunPhase(alt){ return alt>6?"day":alt>-4?"gold":alt>-6?"blue":"night"; }
const SUN_PHASE = {day:"Daylight",gold:"Golden hour",blue:"Blue hour",night:"Night"};
const cc_isNYC = () => state.city==="nyc";
function sunLine(){ const c=CITIES[state.city], t=mapNow(), sp=sunPos(t,c.lat,c.lon), ph=sunPhase(sp.alt), tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  const [rise,set]=sunTimes(t,c.lat,c.lon); let out='<b>'+tf(t)+(state.mapT===null?' (now)':'')+' · '+SUN_PHASE[ph]+'</b><br>';
  if(sp.alt>-0.8){ out+='Sun '+Math.max(0,Math.round(sp.alt))+'° up in the '+compass(sp.az)+'. Shadows fall to the '+compass(sp.az+180)+'.';
    const d=(a,b)=>{ const x=Math.abs(((a-b)%360+540)%360-180); return Math.min(x,180-x); };
    if(cc_isNYC()){ const lit=(face)=>Math.cos((sp.az-face)*Math.PI/180)>0.12, ave=lit(299)?"east side of the avenues":lit(119)?"west side of the avenues":"", st=lit(209)?"north side of the cross streets":lit(29)?"south side of the cross streets":"";
      if(ave||st) out+=' Sunny side: '+[ave,st].filter(Boolean).join(" and ")+(sp.alt<20?', on the upper floors more than the pavement while the sun is this low':'')+'.'; }
    if(sp.alt<25){ if(d(sp.az,119)<9) out+=' The sun is lined up with Manhattan\u2019s cross streets: light runs straight down them.'; else if(d(sp.az,29)<9) out+=' The sun is lined up with the Manhattan avenues: light runs straight down them.'; } }
  else out+='Sun is down, '+Math.round(-sp.alt)+'° below the horizon.';
  const f=hourlyAt(t), sk=skyAt(t); if(f) out+='<br>Forecast for this hour: '+(sk?WX_WORD[sk]:"no rain, "+(f.cc>=50?"some cloud":"mostly clear"))+(f.pop!=null?' ('+f.pop+'% chance of rain)':'')+'.'+(sk==="rain"&&ph!=="night"?' Pins show rain ideas for this hour.':'');
  const mo=moonPos(t,c.lat,c.lon), mt=moonTimes(t,c.lat,c.lon), mm=v=>v===null?null:hmText(Math.min(1439,v));
  out+='<br>Moon: '+moonName(mo).toLowerCase()+', '+Math.round(mo.frac*100)+'% lit, '+(mo.alt>0?Math.round(mo.alt)+'° up in the '+compass(mo.az):'below the horizon')+'.'+
    (mt.rise!==null?' Rises about '+mm(mt.rise)+(mt.rise>0?' in the '+compass(moonPos(new Date(new Date(t).setHours(0,mt.rise,0,0)),c.lat,c.lon).az):'')+'.':'')+(mt.set!==null?' Sets about '+mm(mt.set)+'.':'');
  return out+'<br><span class="sunrs">Sunrise '+tf(rise)+' · Sunset '+tf(set)+'</span>'; }
/* Where to stand: two or three spots per place, the way to face (degrees from north), and the idea each one serves. Positions are approximate. */
const SPOTS = {"chinatown":[[40.7146,-73.998,165,"Pell Street end of Doyers","Look down the bend in Doyers Street and wait for someone to walk into it.","chinatown-place"],[40.717,-73.9983,295,"Canal Street at Mott Street","Shoot into the stream of shoppers from the corner; the crowd thickens towards Broadway.","chinatown-energy"],[40.7157,-73.9997,220,"Columbus Park tables","Card and mahjong players with onlookers crowding round; ask before going close.","chinatown-odd"],[40.7187,-73.9962,299,"Mott Street stalls, Grand to Hester","Stand beside a stall's scale and face across it, so seller and buyer share the frame.","chinatown-moment"],[40.7155,-73.9984,299,"Mott Street at Bayard Street","Restaurant windows on Mott after dark; get close to the glass.","chinatown-mood"]],"gct":[[40.7527,-73.9776,119,"West balcony","From the top of the west stairs the whole concourse opens out, with the clock in the middle.","gct-place"],[40.7527,-73.977,299,"Beside the information booth","Five metres off the clock, facing the west stairs: people meeting, waving, hugging.","gct-moment"],[40.7524,-73.977,209,"Whispering gallery","The tiled arches outside the Oyster Bar, one level down. Two people whispering into opposite corners.","gct-odd"],[40.7527,-73.9777,119,"West stair rail","Brace on the rail at the top of the west stairs and look across the concourse.","gct-energy"],[40.7524,-73.9772,209,"Main concourse, south side","Watch the floor below the tall 42nd Street windows for the brightest patches.","gct-mood"]],"tsq":[[40.759,-73.9849,209,"Top of the red steps","Look down Broadway and Seventh Avenue over the crowd and the screens.","tsq-place"],[40.7559,-73.9871,209,"Subway exit at 42nd Street","Stand just north of the subway stairs, facing them, with the screens behind you. People look up past you as they reach the street.","tsq-moment"],[40.7577,-73.9858,29,"Plaza at 45th Street, low","Crouch low after rain so the plaza reflects the screens.","tsq-mood"],[40.7579,-73.9857,29,"Plaza at 45th Street, under the screens","Hold one frame while the screens change colour above the crowd.","tsq-energy"],[40.757,-73.9866,299,"Plaza edge at 44th Street","Performers take breaks at the edges of the plaza and on the side streets.","tsq-odd"]],"wsp":[[40.7307,-73.9973,29,"South of the fountain","The arch with Fifth Avenue running away behind it.","wsp-place"],[40.7302,-73.9993,60,"Chess tables","Southwest corner by MacDougal Street: players, clocks and onlookers.","wsp-moment"],[40.7309,-73.997,209,"The fountain rim","Performers and crowds round the fountain; shoot across the water.","wsp-energy"],[40.7311,-73.9985,255,"Western paths","Face into the afternoon sun along the paths on the west side of the park.","wsp-mood"],[40.7311,-73.9972,209,"Around the fountain and arch","The regulars set up near the fountain and the arch; talk first, shoot after.","wsp-odd"],[40.7302,-73.9993,60,"Chess tables, south-west corner","Get low across a table so the leaves fill the top of the frame.","wsp-mood-s"]],"dumbo":[[40.7033,-73.9895,340,"Washington Street at Water Street","The Manhattan Bridge with the Empire State Building framed under its arch. Busy all day.","dumbo-place"],[40.7038,-73.9907,255,"Pebble Beach","The Lower Manhattan skyline and the Brooklyn Bridge across the water; best at blue hour.","dumbo-mood"],[40.7034,-73.988,200,"Under the Manhattan Bridge arches","Light at the far end of the archway, people crossing it, the trains rumbling overhead.","dumbo-energy"],[40.7029,-73.9894,300,"Washington Street, beside the shoots","Stand to one side of the couples and wedding parties posing in the street.","dumbo-moment"],[40.704,-73.9873,90,"Plymouth Street at Pearl Street","Old freight rails run along the cobbles here; get low and follow them.","dumbo-odd"],[40.6927,-73.9753,180,"Fort Greene Park, north slope","Look up the slope from the Myrtle Avenue side to the monument column, with the paths climbing through the trees.","dumbo-place-s"]],"coney":[[40.5718,-73.985,80,"Boardwalk west of the Wonder Wheel","Shoot east along the planks with the wheel rising on the left third.","coney-place"],[40.5753,-73.9776,180,"Surf Avenue by the Cyclone","Faces and raised arms on the first drop.","coney-moment"],[40.5727,-73.9832,255,"Boardwalk at Stillwell Avenue","The boardwalk running away into the haze; best empty, out of season.","coney-mood"],[40.5748,-73.978,180,"Luna Park fence","Brace on the fence and keep someone waiting at the ride sharp while it spins.","coney-energy"],[40.5751,-73.9802,180,"Surf Avenue at West 12th Street","Hand-painted banners and signs along Surf Avenue around the sideshow.","coney-odd"]],"soho":[[40.7256,-73.9992,209,"Greene Street at Prince Street","Cast-iron facades lining up down the street.","soho-place"],[40.7224,-74.0017,29,"Greene Street at Broome Street","Fire-escape shadows across the facades when the sun is on them.","soho-mood"],[40.7243,-73.9976,299,"Prince Street at Broadway","People stepping off the curb into the crossing.","soho-energy"],[40.725,-73.9985,29,"Prince Street, Greene to Mercer","Stand at the kerb on the north side of Prince Street and frame a shop doorway across the pavement.","soho-moment"],[40.724,-74.0005,70,"Spring Street shop windows","Stand at an angle to a window until a mannequin and a reflected walker line up.","soho-odd"]],"jh":[[40.7467,-73.8915,80,"Roosevelt Avenue at 74th Street","Under the elevated 7: light falls through the tracks in stripes.","jh-place"],[40.7472,-73.8922,270,"Diversity Plaza","Food carts, shoppers and stacked signs in a dozen languages.","jh-moment"],[40.7474,-73.8846,260,"Roosevelt Avenue at 82nd Street","Neon, traffic and the train overhead at dusk.","jh-energy"],[40.747,-73.888,260,"Roosevelt Avenue at 78th Street","Sun through the elevated tracks lays stripes across the street around midday.","jh-mood"],[40.748,-73.8918,90,"74th Street, Roosevelt to 37th Avenue","A run of shopfronts with signs in several languages, shot square-on.","jh-odd"]],"ferry":[[40.693,-74.02,30,"The stern, heading out","The Lower Manhattan skyline pulling away behind the boat.","ferry-place"],[40.68,-74.03,310,"Right-hand rail, mid-harbour","The Statue of Liberty and the people pointing their phones at it.","ferry-moment"],[40.7013,-74.0131,209,"Whitehall waiting room","The surge when the doors open for boarding.","ferry-energy"],[40.675,-74.04,270,"West-side windows, heading out","Sit by a west-facing window on the boat before sunset.","ferry-mood"],[40.69,-74.023,300,"Inside the main cabin","Sit across the aisle from a regular, with the tourists at the rail behind.","ferry-odd"]],"harlem":[[40.8104,-73.9496,209,"125th Street across from the Apollo","The marquee and the busy sidewalk; the sign lights up at dusk.","harlem-place"],[40.8162,-73.9409,209,"Abyssinian Baptist Church, 138th Street","Hats and suits after Sunday morning service; be respectful.","harlem-moment"],[40.8049,-73.9455,299,"West 122nd Street, Mount Morris Park","Brownstone stoops west of Marcus Garvey Park; at dusk the sky behind Lenox Avenue holds the last light.","harlem-mood"],[40.8085,-73.9465,299,"125th Street near Lenox Avenue","Vendors' tables and music along the pavement; brace on a lamppost.","harlem-energy"],[40.8094,-73.9483,29,"Side streets off 125th Street","Look for murals and hand-lettered signs just off the main street.","harlem-odd"],[40.8044,-73.9458,299,"West 121st Street brownstones","Shoot along the row from the kerb so the stoops repeat under the trees.","harlem-place-s"]],"les":[[40.7188,-73.9905,29,"Orchard Street at Broome Street","Fire escapes zigzagging up the tenements.","les-place"],[40.7183,-73.9881,119,"Essex Market counters","Vendors and customers across the counters.","les-moment"],[40.7175,-73.9855,119,"Williamsburg Bridge ramp","Cyclists and walkers coming off the bridge at Delancey Street.","les-energy"],[40.7206,-73.9879,119,"Ludlow Street at Rivington Street","Bar and deli neon in the windows after dark.","les-mood"],[40.718,-73.991,119,"Orchard Street, Broome to Grand","Old shop names still painted above new tenants, shot square-on.","les-odd"]],"flushing":[[40.7596,-73.83,0,"Main Street at Roosevelt Avenue","One of the busiest crossings in the city; shoot into the crowd.","flushing-place"],[40.7591,-73.8303,20,"Subway stairs on Main Street","Waves of people rising out of the 7 train.","flushing-energy"],[40.759,-73.8318,90,"New World Mall food court","Trays, steam and counters downstairs.","flushing-moment"],[40.757,-73.8295,90,"Main Street at 41st Avenue","Small street-food windows lit after dark; stand at an angle to one.","flushing-mood"],[40.7563,-73.829,270,"Main Street produce stands","Fruit and seafood displays spilling onto the pavement; get low and close.","flushing-odd"]],"wburg":[[40.7143,-73.968,240,"Domino Park waterfront","The Williamsburg Bridge and the Manhattan skyline; the sun sets across the river.","wburg-place"],[40.7172,-73.9567,210,"Bedford Avenue at North 7th Street","Saturday crowds by the subway entrance.","wburg-energy"],[40.7106,-73.964,300,"Under the bridge at Broadway","Steel, shadow and the trains overhead.","wburg-mood"],[40.7205,-73.952,29,"McCarren Park, by the courts","Stand at the side of a court, level with the players waiting their turn.","wburg-moment"],[40.7208,-73.9591,299,"Wythe Avenue at North 6th Street","Large murals in the blocks around here; frame one from across the street.","wburg-odd"]],"midtown":[[40.76,-73.98,29,"Sixth Avenue at 50th Street","Towers on both sides; at midday the sun drops straight into the canyon.","midtown-place"],[40.7584,-73.9719,299,"Seagram Building plaza","Office workers eating lunch on the ledges.","midtown-moment"],[40.7588,-73.977,299,"Fifth Avenue at 50th Street","Crouch at the kerb by St Patrick's and shoot the crowd stepping off toward you across Fifth Avenue.","midtown-energy"],[40.7604,-73.9782,119,"West 52nd Street, off Sixth Avenue","A shaded side street where sun bounces off the glass towers onto the pavement.","midtown-mood"],[40.7616,-73.9792,209,"53rd Street and Sixth Avenue","The halal cart and its lunch queue; stand to the side of the line.","midtown-odd"]],"cpark":[[40.7737,-73.9711,0,"Bethesda Terrace arcade","Through the tiled arcade towards the fountain.","cpark-place"],[40.7752,-73.9706,280,"East shore of the Lake","Bow Bridge side-on, with couples and rowing boats.","cpark-moment"],[40.7712,-73.9737,20,"The Mall","Elms arching over the path; best in fog or rain.","cpark-mood"],[40.7745,-73.9675,29,"East Drive at Cat Hill","A bend in the drive where runners and cyclists stream past; brace on a lamppost.","cpark-energy"],[40.7739,-73.9712,90,"Inside the arcade, to one side","Performers under the tiled ceiling of Bethesda Terrace's lower arcade.","cpark-odd"],[40.7712,-73.9737,20,"South end of the Mall","The elm canopy closes over the path; wait for one dark coat.","cpark-mood-s"],[40.7718,-73.9745,300,"Elms by the Mall","Find a tree dropping leaves in the wind and wait beside it.","cpark-moment-s"]],"rockaway":[[40.5843,-73.8125,70,"Boardwalk at Beach 90th Street","The boardwalk running to the horizon.","rockaway-place"],[40.5835,-73.8125,160,"Beach at Beach 90th Street","Surfers coming out of the water.","rockaway-moment"],[40.5833,-73.8133,160,"Beside the jetty, Beach 90th Street","Surfers take off beside the rock jetties; get as close to the waterline as you can stay dry.","rockaway-energy"],[40.5838,-73.809,160,"Boardwalk steps, Beach 86th Street","Empty winter sand and sea; place the walker near an edge of the frame.","rockaway-mood"],[40.588,-73.8137,270,"Beach 90th Street station platform","Surfers carrying boards through the elevated station.","rockaway-odd"]],"arthur":[[40.8553,-73.8877,180,"Arthur Avenue at 187th Street","Shopfronts, awnings and Saturday shoppers.","arthur-place"],[40.8547,-73.8879,90,"Arthur Avenue Retail Market","Counters inside the market, and cigar rolling at the back.","arthur-odd"],[40.8547,-73.8879,270,"Retail Market counters","Stand at the end of a counter inside the market so both faces are in view.","arthur-moment"],[40.8551,-73.888,180,"Kerb at 187th Street","Crouch at the kerb so the nearest shopper is large and the avenue stacks up behind.","arthur-energy"],[40.8552,-73.8893,0,"East 187th Street cafés","Pastry shops and espresso bars along 187th Street; shoot through the window.","arthur-mood"]],"union":[[40.7365,-73.9915,29,"Union Square West at 16th Street","The Greenmarket stalls and shoppers.","union-place"],[40.7351,-73.9913,119,"West end of the south steps","Brace on the rail at the west end and shoot east along the steps as skaters and commuters pass.","union-energy"],[40.7356,-73.9901,190,"Top of the south steps","The Metronome wall across the street at dusk.","union-mood"],[40.7349,-73.9911,29,"Chess tables, south-west plaza","Stand behind the challenger's shoulder, facing the regular across the board.","union-moment"],[40.735,-73.9902,0,"South plaza","Preachers and sign-holders gather on the south plaza by 14th Street.","union-odd"],[40.7357,-73.9912,170,"Greenmarket pumpkin stalls","Frame a pumpkin stall with the south steps behind it.","union-odd-s"]],"fidi":[[40.7071,-74.0102,200,"Federal Hall steps","Beside the Washington statue, looking south down Broad Street: the Exchange's columns and flags on the right.","fidi-place"],[40.7043,-74.0105,60,"Stone Street","Lunch crowds at the outdoor tables.","fidi-moment"],[40.7114,-74.011,90,"Inside the Oculus","White ribs and reflections on the floor. Handheld only.","fidi-energy"],[40.7064,-74.0098,119,"Exchange Place","A narrow street where a slot of midday sun reaches the pavement.","fidi-mood"],[40.7057,-74.0131,270,"Beside the Charging Bull","Stand at the bull's flank and photograph the queue and the reaching hands.","fidi-odd"]],"ktown":[[40.7478,-73.9876,119,"Korea Way from Broadway","Signs stacked up the buildings on 32nd Street.","ktown-place"],[40.7497,-73.9877,119,"Herald Square crossing","The crowd crossing at 34th Street and Broadway.","ktown-energy"],[40.7476,-73.9862,60,"33rd Street at Fifth Avenue","The Empire State Building above the souvenir shops.","ktown-odd"],[40.75,-73.9889,29,"34th Street, opposite Macy's doors","Stand at the kerb on 34th Street, facing the Macy's doors across the pavement.","ktown-moment"],[40.7476,-73.9868,29,"Korea Way restaurant windows","Restaurants and karaoke bars on 32nd Street; get close to the glass.","ktown-mood"]],"bushwick":[[40.7055,-73.9236,310,"Troutman Street at St Nicholas Avenue","Murals along the block, and people posing in front of them.","bushwick-place"],[40.7062,-73.9245,130,"Troutman Street, looking back","The next run of walls, and warehouse light at dusk.","bushwick-mood"],[40.7056,-73.9232,220,"Beside a wall shoot","Stand to one side so the poser, the photographer and the mural all fit.","bushwick-moment"],[40.6995,-73.9183,135,"Knickerbocker Avenue at Myrtle Avenue","The Saturday shopping street; plant yourself against a shopfront.","bushwick-energy"],[40.7045,-73.922,310,"Troutman Street murals","Painted faces along the Bushwick Collective walls; frame one square-on.","bushwick-odd"]],"chelsea":[[40.7428,-74.0071,29,"High Line over Tenth Avenue","The sunken window looking up Tenth Avenue.","chelsea-place"],[40.7424,-74.0061,119,"Chelsea Market concourse","The long brick hall and the crowd.","chelsea-energy"],[40.742,-74.0103,260,"Little Island","Sunset over the Hudson.","chelsea-mood"],[40.7493,-74.0066,29,"West 24th Street galleries","Stand on the south pavement opposite a lit gallery door on an opening night.","chelsea-moment"],[40.7538,-74.0021,29,"Base of the Vessel","Get close to the copper skin and shoot the reflections.","chelsea-odd"]],"brighton":[[40.5776,-73.9616,80,"Under the el on Brighton Beach Avenue","Stripes of light through the tracks, shoppers below.","brighton-place"],[40.5753,-73.9615,180,"Boardwalk at Brighton 6th Street","Benches, sea and the people on them.","brighton-moment"],[40.575,-73.9617,80,"Boardwalk at the restaurant terraces","Shoot along the row of tables as the strollers pass in front.","brighton-energy"],[40.5753,-73.9655,170,"Boardwalk steps, Brighton 2nd Street","Straight out to sea, with one figure small and low in the frame.","brighton-mood"],[40.5775,-73.9635,0,"Brighton Beach Avenue shop windows","Caviar, smoked fish and nesting dolls; get square to the glass.","brighton-odd"],[40.5752,-73.96,260,"Boardwalk, walking west","Face west into the low autumn sun along the benches.","brighton-mood-s"]]};
const CAM_FOCAL = {q343:43,q328:28,iphone:24,other:35};
const camFov = () => 2*Math.atan(18/(CAM_FOCAL[state.camera]||43))*180/Math.PI;   // horizontal angle of view, full frame equivalent
const angDiff = (a,b) => Math.abs(((a-b)%360+540)%360-180);
/* What light you get facing a direction at time t: into the sun (backlit), across it, or with it behind you. */
function lightFacing(bearing,t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon), ph=sunPhase(sp.alt);
  if(sp.alt<-0.8) return {k:"dark",txt:ph==="blue"?"Blue hour":"After dark"};
  const d=angDiff(bearing,sp.az); return d<=50?{k:"back",txt:"Backlit"}:d>=130?{k:"front",txt:"Front-lit"}:{k:"side",txt:"Side light"}; }
const LIGHT_TIP = {back:"Facing into the sun: silhouettes, rim light and glowing hair. Expose for the bright part.",side:"Sun from the side: texture, depth and long shadows.",front:"Sun behind you: even colour on faces, flatter light. Watch for your own shadow.",dark:"Light comes from windows, signs and street lamps."};
function lightHere(t){ const c=CITIES[state.city], sp=sunPos(t,c.lat,c.lon), tf=hmText(t.getHours()*60+t.getMinutes());
  if(sp.alt<-0.8||sp.alt<=0){ const g=lightDay().runs.find(r=>r.ph==="gold"&&r.s>=720), at=g?Math.max(600,Math.round((g.s-90)/5)*5):960;
    return 'Light at '+tf+': the sun is down, so there is no sunny side to show. Light comes from windows, signs and street lamps.<br><button type="button" class="chip sunjump" data-jump="'+at+'">See the sunny side at '+hmText(at)+'</button>'; }
  return 'Light at '+tf+': orange lines on the map mark the sunny side of each street. Face <b>'+compass(sp.az)+'</b> for backlight, <b>'+compass(sp.az+90)+'</b> or <b>'+compass(sp.az-90)+'</b> for side light, <b>'+compass(sp.az+180)+'</b> for front light.'+(sp.alt>45?' The sun is high, so shadows are short and streets are in shade or full sun.':''); }
/* The day's light, minute by minute: night, blue hour, golden hour, daylight. Drawn as the slider track, with marks to jump to. */
let LIGHT_DAY = null;
function lightDay(){ const c=CITIES[state.city], d=new Date(); d.setHours(0,0,0,0); const key=state.city+":"+(+d);
  if(LIGHT_DAY&&LIGHT_DAY.key===key) return LIGHT_DAY;
  const runs=[]; let cur=null;
  for(let m=0;m<1440;m++){ const ph=sunPhase(sunPos(new Date(+d+m*6e4),c.lat,c.lon).alt); if(cur&&cur.ph===ph) cur.e=m+1; else { cur={ph,s:m,e:m+1}; runs.push(cur); } }
  const [rise,set]=sunTimes(new Date(+d+12*36e5),c.lat,c.lon), mm=t=>t.getHours()*60+t.getMinutes();
  return LIGHT_DAY={key,runs,rise:mm(rise),set:mm(set)}; }
const LIGHT_COL = {night:"#1c2340",blue:"#3e63d8",gold:"#f2ad3a",day:"#f4e7b4"};
function lightBand(){ const L=lightDay(), at=m=>'calc(13px + (100% - 26px) * '+(m/1435).toFixed(4)+')';
  return 'linear-gradient(to right,'+L.runs.map(r=>LIGHT_COL[r.ph]+' '+at(r.s)+','+LIGHT_COL[r.ph]+' '+at(Math.min(r.e,1435))).join(",")+')'; }
function lightMarks(){ const L=lightDay(), tf=hmText, out=[], pos=m=>'calc(13px + (100% - 26px) * '+(m/1435).toFixed(4)+')';
  const gold=L.runs.filter(r=>r.ph==="gold"), blue=L.runs.filter(r=>r.ph==="blue");
  if(gold[0]&&gold[0].s<720) out.push(["gold",gold[0].s,"Morning gold "+tf(gold[0].s)]);
  out.push(["rise",L.rise,"Sunrise "+tf(L.rise)]);
  const eg=gold.find(r=>r.s>=720); if(eg) out.push(["gold",eg.s,"Golden hour "+tf(eg.s)]);
  out.push(["set",L.set,"Sunset "+tf(L.set)]);
  const eb=blue.find(r=>r.s>=720); if(eb) out.push(["blue",eb.s,"Blue hour "+tf(eb.s)]);
  { const c=CITIES[state.city], d=new Date(); d.setHours(12,0,0,0); const mt=moonTimes(d,c.lat,c.lon), mo=moonPos(d,c.lat,c.lon); if(mt.rise!==null&&mo.frac>0.15) out.push(["moon",mt.rise,(mo.frac>=0.97?"Full moonrise ":"Moonrise ")+tf(mt.rise)]); }
  out.sort((a,b)=>a[1]-b[1]);
  const cur=state.mapT===null?(()=>{ const n=new Date(); return n.getHours()*60+n.getMinutes(); })():state.mapT;
  $("lightTicks").innerHTML=[L.rise,L.set].map(m=>'<i style="left:'+pos(m)+'"></i>').join("");
  const upcoming=x=>state.mapT!==null||x[1]+(x[0]==="gold"?60:x[0]==="blue"?25:10)>cur;
  return out.filter(upcoming).concat(out.filter(x=>!upcoming(x))).map(([k,m,t])=>'<button type="button" class="chip lmark'+(cur>=m&&cur<m+(k==="gold"?60:k==="blue"?25:10)?' on':'')+(m<cur&&state.mapT===null?' past':'')+'" data-jump="'+m+'"><span class="lk '+k+'"></span>'+t+'</button>').join(""); }
/* Today's outing: kept on the device so it survives closing the app; editable from the map. */
function savePlan(){ const p=state.plan; store.set("plan", p ? {start:+p.start,end:+p.end,stops:p.stops.map(s=>({place:s.place,at:+s.at,key:s.key,ideas:s.ideas.map(x=>x.id),leg:s.leg||null}))} : null); }
function loadPlan(){ const p=store.get("plan",null); if(!p||!p.stops||!p.stops.length||p.end<Date.now()-12*36e5) return null;
  return {start:new Date(p.start),end:new Date(p.end),stops:p.stops.filter(s=>PLACES[s.place]).map(s=>({place:s.place,at:new Date(s.at),key:s.key,ideas:s.ideas.map(id=>IDEAS.find(x=>x.id===id)).filter(Boolean),leg:s.leg}))}; }
function pickIdeas(pid,key,n,at){ const t=at||new Date(), sky=Math.abs(t-Date.now())<40*36e5?skyAt(t):undefined, all=cityIdeas().filter(x=>x.p===pid), here=all.filter(x=>ideaOpen(x,t,sky));
  const pool=(here.length?here:all).slice().sort((a,b)=>(b.w.includes(key)-a.w.includes(key))||(state.done.has(a.id)-state.done.has(b.id)));
  const out=[]; for(const x of pool) if(out.length<n&&!out.some(o=>o.i===x.i)) out.push(x); for(const x of pool) if(out.length<n&&!out.includes(x)) out.push(x); return out; }
function legBetween(a,b){ const km=kmBetween(PLACES[a],PLACES[b]), walk=Math.round(km*1.3/0.08); return walk<=30?{to:b,mins:Math.max(3,walk),mode:"walk"}:{to:b,mins:Math.round(15+km*3),mode:"by subway"}; }
function retimePlan(p){ let t=new Date(p.stops[0].at); p.stops.forEach((s,n)=>{ s.at=new Date(t); const k=lightAt(s.at); if(k!==s.key||!s.ideas.length){ s.key=k; s.ideas=pickIdeas(s.place,k,Math.max(2,s.ideas.length),s.at); }
    t=new Date(+t+Math.max(1,s.ideas.length)*25*6e4); if(n<p.stops.length-1){ s.leg=legBetween(s.place,p.stops[n+1].place); t=new Date(+t+s.leg.mins*6e4); } else delete s.leg; });
  p.start=new Date(p.stops[0].at); p.end=t; return p; }
function planAdd(pid){ if(!state.plan){ const now=new Date(), k=lightAt(now); state.plan={start:now,end:now,stops:[{place:pid,at:now,key:k,ideas:pickIdeas(pid,k,2)}]}; }
  else state.plan.stops.push({place:pid,at:new Date(),key:"",ideas:[]});
  retimePlan(state.plan); savePlan(); }
function planRemove(pid){ if(!state.plan) return; state.plan.stops=state.plan.stops.filter(s=>s.place!==pid); if(!state.plan.stops.length) state.plan=null; else retimePlan(state.plan); savePlan(); }
const planIndex = pid => state.plan ? state.plan.stops.findIndex(s=>s.place===pid) : -1;
function nextStopIndex(){ const p=state.plan; if(!p) return -1; const now=Date.now(); const i=p.stops.findIndex(s=>+s.at+Math.max(1,s.ideas.length)*25*6e4>now); return i<0?p.stops.length-1:i; }
function mapGoStop(i){ const p=state.plan, s=p&&p.stops[i]; if(!s) return; const today=new Date(); today.setHours(0,0,0,0);
  const sameDay=s.at>=today && s.at<new Date(+today+864e5), live=Math.abs(s.at-Date.now())<15*6e4 || (i===nextStopIndex() && s.at<=Date.now());
  state.mapT = live||!sameDay ? null : s.at.getHours()*60+Math.round(s.at.getMinutes()/5)*5;
  const tm=$("mapTime"), n=new Date(); if(tm) tm.value=state.mapT===null? n.getHours()*60+n.getMinutes() : state.mapT;
  state.mapSel=s.place; state.mapEv=null; const [x,y]=mapXY(PLACES[s.place].lat,PLACES[s.place].lon); mapPanel(); mapDraw(); mapZoomPlace(s.place); }
/* Google Maps directions: the next stop (walking or transit), and the rest of the outing as one multi-stop route.
   Google Maps allows 3 stops between start and end in a phone browser, 9 in the app; transit cannot do multi-stop routes. */
const stopGeo = id => { const g=START_GEO[id]||[PLACES[id].lat,PLACES[id].lon]; return g[0].toFixed(5)+","+g[1].toFixed(5); };
function planLinks(){ const p=state.plan; if(!p) return ""; const nx=Math.max(0,nextStopIndex()), rest=p.stops.slice(nx), next=rest[0]; if(!next) return "";
  const prevLeg=nx>0?p.stops[nx-1].leg:null, km=state.pos?kmBetween(state.pos,PLACES[next.place]):null;
  const mode=prevLeg&&prevLeg.mode==="by subway" ? "transit" : km!==null ? (km<=1.8?"walking":"transit") : (prevLeg?"walking":"transit");
  const base="https://www.google.com/maps/dir/?api=1";
  const one=base+"&destination="+stopGeo(next.place)+"&travelmode="+mode;
  let whole="";
  if(rest.length>1){ const pts=rest.map(s=>stopGeo(s.place)), allWalk=rest.slice(0,-1).every(s=>!s.leg||s.leg.mode==="walk");
    const origin=pts.length>4?pts.shift():null;   // keep within 3 stops in between, so it also works in a phone browser
    whole=base+(origin?"&origin="+origin:"")+"&destination="+pts.pop()+(pts.length?"&waypoints="+encodeURIComponent(pts.join("|")):"")+"&travelmode=walking";
    whole='<a class="chip" href="'+whole+'" target="_blank" rel="noopener">Whole outing on foot ↗</a>'+(allWalk?'':'<span class="hint maplinkhint">Google Maps cannot do multi-stop routes by subway, so this shows the walk. Use the stop link for the subway legs.</span>'); }
  return '<div class="callinks planlinks"><a class="chip primary" href="'+one+'" target="_blank" rel="noopener">Directions to stop '+(nx+1)+' '+(mode==="transit"?"by subway":"on foot")+' ↗</a>'+whole+'</div>'; }
function mapPlanBar(){ const p=state.plan, tf=d=>d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}).toLowerCase();
  if(!p) return '<p class="hint planhint">Tap a pin and choose Add to today to build an outing on the map, or make one in Plan.</p>';
  const nx=nextStopIndex();
  return '<div class="planbar"><div class="planbar-head"><b>Today\u2019s outing</b><span>'+tf(p.start)+' to about '+tf(p.end)+'</span><button type="button" class="chip primary" data-nextstop="1">Next stop ›</button><button type="button" class="chip" data-clearplan="1">Clear</button></div>'+
    '<div class="intents planstops">'+p.stops.map((s,n)=>'<button type="button" class="chip stopchip'+(n===nx?" next":"")+'" data-stop="'+n+'"><span class="stopn">'+(n+1)+'</span>'+esc(PLACES[s.place].name)+' · '+tf(s.at)+'</button>').join("")+'</div>'+planLinks()+'</div>'; }
function mapPts(){ const key=lightAt(mapNow()), ideas=cityIdeas().filter(i=>state.mapIntent==="all"||i.i===state.mapIntent);
  return Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number").map(id=>{ const [x,y]=mapXY(PLACES[id].lat,PLACES[id].lon), mine=ideas.filter(i=>i.p===id);
    return {id,x,y,n:mine.length,fit:mine.filter(i=>i.w.includes(key)).length,done:mine.filter(i=>state.done.has(i.id)).length,empty:!mine.length}; }); }
function mapDraw(){
  const svg=$("mapSvg"); if(!svg||!mapV) return; const ar=svg.clientHeight/svg.clientWidth; if(ar>0.3&&ar<4) MAP_ASPECT=ar; const v=mapV, w=v.w, h=w*MAP_ASPECT, x0=v.cx-w/2, y0=v.cy-h/2, x1=x0+w, y1=y0+h, u=w/(svg.clientWidth||360), f=n=>n.toFixed(1);
  svg.setAttribute("viewBox",f(x0)+" "+f(y0)+" "+f(w)+" "+f(h));
  svg.setAttribute("class","mapsvg "+(w>=260?"zfar":w>=110?"zmid":w>=45?"znear":"zclose")+(state.mapShowSub?"":" nosub"));
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
  for(const e of evList.sort((a,b)=>(b.id===state.mapEv)-(a.id===state.mapEv)||(b.st.k==="live")-(a.st.k==="live")||a.r.o[0]-b.r.o[0])){ if(w>=520&&e.st.k!=="live"&&e.id!==state.mapEv) continue; const on=e.id===state.mapEv, hw=(e.day.length*3.1+5)*u, hh=7*u, box=[e.x-hw,e.y-hh,e.x+hw,e.y+hh];
    const live=e.st.k==="live", soon=live||e.st.k==="today"; if(!on && !soon && taken.some(t=>hit(t,box))) continue; taken.push(box);
    let lab=""; if(w<300||on||live){ const nm=e.r.e.name.length>26?e.r.e.name.slice(0,25)+"…":e.r.e.name, fl=10*u, tw=nm.length*fl*0.56;
      for(const [bx,anchor,tx] of [[e.x+hw+3*u,"start",e.x+hw+3*u],[e.x-hw-3*u-tw,"end",e.x-hw-3*u]]){ const rect=[bx,e.y-fl*0.6,bx+tw,e.y+fl*0.6]; if(rect[0]<x0+2*u||rect[2]>x1-2*u||(!on&&taken.some(t=>hit(t,rect)))) continue; taken.push(rect);
        lab='<text x="'+f(tx)+'" y="'+f(e.y+fl*0.36)+'" text-anchor="'+anchor+'" font-size="'+f(fl)+'" class="m-evlab">'+esc(nm)+'</text>'; break; } }
    evs+='<g class="m-ev '+e.st.k+(on?" on":"")+'" data-e="'+esc(e.id)+'" tabindex="0" role="button" aria-label="'+esc(e.r.e.name+", "+e.st.line)+'"><rect x="'+f(e.x-hw-6*u)+'" y="'+f(e.y-hh-6*u)+'" width="'+f(2*hw+12*u)+'" height="'+f(2*hh+12*u)+'" class="m-hit"/>'+
      (e.st.k==="live"?'<rect x="'+f(e.x-hw-3*u)+'" y="'+f(e.y-hh-3*u)+'" width="'+f(2*hw+6*u)+'" height="'+f(2*hh+6*u)+'" rx="'+f(5*u)+'" stroke-width="'+f(2.5*u)+'" class="m-evglow"/>':'')+
      '<rect x="'+f(e.x-hw)+'" y="'+f(e.y-hh)+'" width="'+f(2*hw)+'" height="'+f(2*hh)+'" rx="'+f(3*u)+'" stroke-width="'+f(1.5*u)+'" class="m-evbox"/><text x="'+f(e.x)+'" y="'+f(e.y+3.2*u)+'" text-anchor="middle" font-size="'+f(9*u)+'" class="m-evday">'+esc(e.day)+'</text>'+lab+'</g>'; }
  if(w<130) for(const p of pts){ const g=START_GEO[p.id]; if(!g||!START[p.id]) continue; const [x,y]=mapXY(g[0],g[1]); if(Math.hypot(x-p.x,y-p.y)<R+5*u) continue; const name="Start: "+START[p.id][0], fl=10*u, tw=name.length*fl*0.54, dot=[x-5*u,y-5*u,x+5*u,y+5*u]; if(taken.some(t=>hit(t,dot))) continue;
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
    if(w<70){ const G=streetGrid(), sp0=state.mapSel&&PLACES[state.mapSel]?mapXY(PLACES[state.mapSel].lat,PLACES[state.mapSel].lon):null, RR=9;   // around the chosen place, about 500 m
      const bx0=sp0?Math.max(x0,sp0[0]-RR):x0, bx1=sp0?Math.min(x1,sp0[0]+RR):x1, by0=sp0?Math.max(y0,sp0[1]-RR):y0, by1=sp0?Math.min(y1,sp0[1]+RR):y1;
      const cx0=Math.floor(bx0/10), cx1=Math.floor(bx1/10), cy0=Math.floor(by0/10), cy1=Math.floor(by1/10); let d="";
      for(let gx=cx0;gx<=cx1;gx++) for(let gy=cy0;gy<=cy1;gy++){ const cell=G.cells.get(gx+","+gy); if(!cell) continue;
        for(const k of cell){ const ax=G.seg[k], ay=G.seg[k+1], bx=G.seg[k+2], by=G.seg[k+3], L=Math.hypot(bx-ax,by-ay); if(L<0.3) continue;
          if(sp0&&Math.hypot((ax+bx)/2-sp0[0],(ay+by)/2-sp0[1])>RR) continue;
          let nx=-(by-ay)/L, ny=(bx-ax)/L; const face=-(nx*SX+ny*SY); if(Math.abs(face)<0.12) continue; if(face<0){ nx=-nx; ny=-ny; }
          d+='M'+f(ax+nx*off)+' '+f(ay+ny*off)+'L'+f(bx+nx*off)+' '+f(by+ny*off); } }
      if(d) sunny='<path d="'+d+'" class="m-sunny near" stroke-width="'+f(2*u)+'"/>'; }
    else for(const [,,line] of MAP_STREETS) for(let i=0;i<line.length-1;i++){ const a=mapXY(line[i][0],line[i][1]), b=mapXY(line[i+1][0],line[i+1][1]), L=Math.hypot(b[0]-a[0],b[1]-a[1]); if(!L) continue;
      const tx=(b[0]-a[0])/L, ty=(b[1]-a[1])/L; let nx=-ty, ny=tx; const face=-(nx*SX+ny*SY); if(Math.abs(face)<0.12) continue; if(face<0){ nx=-nx; ny=-ny; }
      if(Math.max(a[0],b[0])<x0||Math.min(a[0],b[0])>x1||Math.max(a[1],b[1])<y0||Math.min(a[1],b[1])>y1) continue;
      sunny+='<path d="M'+f(a[0]+nx*off)+' '+f(a[1]+ny*off)+' L'+f(b[0]+nx*off)+' '+f(b[1]+ny*off)+'" class="m-sunny" stroke-width="'+f(1.1*u)+'"/>'; } } }
  let detail=""; const inside=(x,y,m)=>x>x0+m&&x<x1-m&&y>y0+m&&y<y1-m, free=rect=>!(rect[0]<x0+2*u||rect[2]>x1-2*u||rect[1]<y0+2*u||rect[3]>y1-2*u||taken.some(t=>hit(t,rect)));
  let lms=""; if(state.mapShowLm) LANDMARKS.forEach((L,i)=>{ const [name,lat,lon,kind,tier]=L, on=state.mapLm===i; if(!on&&(tier===2?w>=300:w>520)) return;
    const [x,y]=mapXY(lat,lon); if(!inside(x,y,6*u)) return; const r=(on?9:6.5)*u, box=[x-r,y-r,x+r,y+r]; if(!on&&taken.some(t=>hit(t,box))) return; taken.push(box);
    let lab=""; if(w<300||on){ const fl=10*u, tw=name.length*fl*0.54;
      for(const [bx,anchor,tx] of [[x+r+3*u,"start",x+r+3*u],[x-r-3*u-tw,"end",x-r-3*u]]){ const rect=[bx,y-fl*0.6,bx+tw,y+fl*0.6]; if(!on&&!free(rect)) continue; taken.push(rect);
        lab='<text x="'+f(tx)+'" y="'+f(y+fl*0.35)+'" text-anchor="'+anchor+'" font-size="'+f(fl)+'" class="m-spot'+(on?" on":"")+'">'+esc(name)+'</text>'; break; } }
    const k=r/5.2;
    lms+='<g class="m-lm'+(on?" on":"")+'" data-l="'+i+'" tabindex="0" role="button" aria-label="'+esc(name+", landmark")+'"><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r+6*u)+'" class="m-hit"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" stroke-width="'+f(1.2*u)+'" class="m-lmdot"/>'+
      '<g class="m-lmg" transform="translate('+f(x)+' '+f(y)+') scale('+k.toFixed(3)+')" stroke-width="1.1">'+LM_GLYPH[kind]+'</g>'+lab+'</g>'; });
  if(state.mapShowNames&&w<420) for(const [name,lat,lon] of MAP_HOODS){ const [x,y]=mapXY(lat,lon); if(!inside(x,y,0)) continue; const fh=9*u, tw=name.length*fh*0.68, rect=[x-tw/2,y-fh*0.7,x+tw/2,y+fh*0.6]; if(!free(rect)) continue; taken.push(rect);
    detail+='<text x="'+f(x)+'" y="'+f(y+fh*0.35)+'" text-anchor="middle" font-size="'+f(fh)+'" class="m-hood">'+esc(name.toUpperCase())+'</text>'; }
  if(state.mapShowNames&&w<260) for(const [name,seg,line] of MAP_STREETS){ if(seg<0) continue; const a=mapXY(line[seg][0],line[seg][1]), b=mapXY(line[seg+1][0],line[seg+1][1]), x=(a[0]+b[0])/2, y=(a[1]+b[1])/2; if(!inside(x,y,10*u)) continue;
    let ang=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI; if(ang>90) ang-=180; if(ang<-90) ang+=180; const fl=8.5*u, tw=name.length*fl*0.55, half=Math.max(tw/2*Math.abs(Math.cos(ang*Math.PI/180)),fl), halfy=Math.max(tw/2*Math.abs(Math.sin(ang*Math.PI/180)),fl*0.7), rect=[x-half,y-halfy,x+half,y+halfy];
    if(!free(rect)) continue; taken.push(rect); detail+='<text x="'+f(x)+'" y="'+f(y-1.5*u)+'" text-anchor="middle" font-size="'+f(fl)+'" class="m-st" transform="rotate('+f(ang)+' '+f(x)+' '+f(y)+')">'+esc(name)+'</text>'; }
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
    const r=(on?(w<45?15:20):w<150?13:10.5)*u, ringR=r+2.6*u, list=ideasOf(p.id), photo=PHOTOS_INLINE&&PLACE_PHOTO[p.id];
    let ring=""; if(list.length){ const n=list.length, gap=n>1?0.16:0, step=2*Math.PI/n;
      list.forEach((it,k)=>{ const a0=-Math.PI/2+k*step+gap/2, a1=a0+step-gap, P=a=>f(p.x+Math.cos(a)*ringR)+' '+f(p.y+Math.sin(a)*ringR);
        ring+='<path d="M'+P(a0)+' A'+f(ringR)+' '+f(ringR)+' 0 '+(a1-a0>Math.PI?1:0)+' 1 '+P(a1)+'" class="m-arc'+(it.w.includes(key)?'':' off')+'" stroke="'+(it.w.includes(key)?INTENTS[it.i].color:'')+'" stroke-width="'+f(3.4*u)+'"/>'; }); }
    if(photo) photoOn[p.id]=[p.x,p.y,r];
    const bx=p.x+r*0.78, by=p.y-r*0.78;
    over+=(p.fit||photo?'<g class="m-badge'+(p.fit?'':' zero')+'"><circle cx="'+f(bx)+'" cy="'+f(by)+'" r="'+f(6.6*u)+'" stroke-width="'+f(1.4*u)+'"/><text x="'+f(bx)+'" y="'+f(by+3.3*u)+'" text-anchor="middle" font-size="'+f(9*u)+'">'+p.fit+'</text></g>':'')+
      (p.done?'<g class="m-done"><circle cx="'+f(p.x-r*0.78)+'" cy="'+f(p.y+r*0.78)+'" r="'+f(5.4*u)+'" stroke-width="'+f(1.2*u)+'"/><path d="M'+f(p.x-r*0.78-2.6*u)+' '+f(p.y+r*0.78)+' l'+f(1.9*u)+' '+f(2*u)+' l'+f(3.4*u)+' '+f(-4*u)+'" stroke-width="'+f(1.5*u)+'"/></g>':'');
    return g0+(on?'<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(ringR+3*u)+'" class="m-halo" stroke-width="'+f(2*u)+'"/>':'')+ring+
      '<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="'+f(r)+'" stroke-width="'+f(1.4*u)+'" class="m-face"/>'+
      (photo?'':'<text x="'+f(p.x)+'" y="'+f(p.y+(on?5:4)*u)+'" text-anchor="middle" font-size="'+f((on?14:11)*u)+'" class="m-num">'+p.fit+'</text>')+'</g>'; }).join("");
  // photos sit in a layer of their own so they are not reloaded on every redraw
  if(PHOTOS_INLINE) document.querySelectorAll("#mapPhotos image").forEach(im=>{ const id=im.dataset.ph, v=photoOn[id];
    if(!v){ if(im.style.display!=="none") im.style.display="none"; return; }
    const [x,y,r]=v, c=document.querySelector("#pc-"+id+" circle"); c.setAttribute("cx",f(x)); c.setAttribute("cy",f(y)); c.setAttribute("r",f(r-0.6*u));
    im.setAttribute("x",f(x-r)); im.setAttribute("y",f(y-r)); im.setAttribute("width",f(2*r)); im.setAttribute("height",f(2*r)); im.style.display=""; });
  let you=""; if(state.pos){ const [x,y]=mapXY(state.pos.lat,state.pos.lon); you='<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(13*u)+'" class="m-youhalo"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(6*u)+'" stroke-width="'+f(2.5*u)+'" class="m-you"/>'; }
  const cc=CITIES[state.city], sp=sunPos(mapNow(),cc.lat,cc.lon), ph=sunPhase(sp.alt); if($("map").dataset.sky!==ph) $("map").dataset.sky=ph;
  const tint='<rect x="'+f(x0)+'" y="'+f(y0)+'" width="'+f(w)+'" height="'+f(h)+'" class="m-tint '+ph+'"/>';
  let sun=""; if(sp.alt>-6){ const r=sp.az*Math.PI/180, dx=Math.sin(r), dy=-Math.cos(r), m=18*u, vt=y0+topPx()*u, vb=y1-sheetPx()*u, cx=(x0+x1)/2, cy=(vt+vb)/2, hx=w/2-m, hy=Math.max(10*u,(vb-vt)/2-m), k=Math.min(Math.abs(dx)>1e-6?hx/Math.abs(dx):1e9, Math.abs(dy)>1e-6?hy/Math.abs(dy):1e9), sx=cx+dx*k, sy=cy+dy*k;
    // rays fanning out from the sun across the map, strongest at the sun and fading with distance
    if(sp.alt>0){ const L=w*1.25, px=-dy, py=dx, ex=sx-dx*L, ey=sy-dy*L, P=(x,y)=>f(x)+' '+f(y);
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
      return '<path d="M'+P(r1,a0)+' L'+P(r2,a0)+' A'+f(r2)+' '+f(r2)+' 0 0 1 '+P(r2,a1)+' L'+P(r1,a1)+' A'+f(r1)+' '+f(r1)+' 0 0 0 '+P(r1,a0)+'Z" class="m-comp '+k+'"/><text x="'+f(lx)+'" y="'+f(ly+3*u)+'" text-anchor="middle" font-size="'+f(8.5*u)+'" class="m-comptx">'+lab+'</text>'; };
    comp='<g class="m-compass'+(near?' ring':'')+'">'+sec(sp.az,"back","Back")+sec(sp.az+90,"side","Side")+sec(sp.az-90,"side","Side")+sec(sp.az+180,"front","Front")+'</g>'; }
  // where to stand: spots with a wedge as wide as the lens sees, coloured by the light facing that way
  let spotsSvg="", spotLabs=""; const fov=camFov(), tNow=mapNow(), labBoxes=[];
  for(const [pid,list] of Object.entries(SPOTS)){ if(!state.mapShowSpots||!PLACES[pid]||!(w<40||(state.mapSel===pid&&w<130))) continue;
    list.forEach((S,i)=>{ const [x,y]=mapXY(S[0],S[1]); if(!inside(x,y,0)) return; const id=pid+":"+i, on=state.mapSpot===id, L=(on?40:28)*u, lf=lightFacing(S[2],tNow);
      const a0=(S[2]-fov/2)*Math.PI/180, a1=(S[2]+fov/2)*Math.PI/180;
      spotsSvg+='<g class="m-spotg'+(on?" on":"")+'" data-s="'+id+'" tabindex="0" role="button" aria-label="'+esc(S[3]+", facing "+compass(S[2])+", "+lf.txt)+'"><path d="M'+f(x)+' '+f(y)+' L'+f(x+Math.sin(a0)*L)+' '+f(y-Math.cos(a0)*L)+' A'+f(L)+' '+f(L)+' 0 0 1 '+f(x+Math.sin(a1)*L)+' '+f(y-Math.cos(a1)*L)+'Z" class="m-cone '+lf.k+'"/>'+
        '<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(13*u)+'" class="m-hit"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f((on?8.5:7)*u)+'" stroke-width="'+f(1.5*u)+'" class="m-spotpt"/>'+
        '<text x="'+f(x)+'" y="'+f(y+(on?3.3:2.8)*u)+'" text-anchor="middle" font-size="'+f((on?9.5:8)*u)+'" class="m-spotn">'+(i+1)+'</text></g>';
      // names next to the numbers when zoomed in close, skipping any that would overlap
      if(on||w<=14){ const txt=on?S[3]:spotShort(S), fs=(on?8.5:7.5)*u, tw=txt.length*fs*0.52, bx=[x-tw/2, y+10*u, x+tw/2, y+10*u+fs*1.2];
        if(on||!labBoxes.some(b=>b[0]<bx[2]&&bx[0]<b[2]&&b[1]<bx[3]&&bx[1]<b[3])){ labBoxes.push(bx); spotLabs+='<text x="'+f(x)+'" y="'+f(y+10*u+fs)+'" text-anchor="middle" font-size="'+f(fs)+'" class="m-spottx'+(on?' on':'')+'">'+esc(txt)+'</text>'; } } }); }
  // the moon on the edge of the map, like the sun, with its phase
  let moonSvg=""; const mp=moonPos(mapNow(),cc.lat,cc.lon);
  if(mp.alt>-0.5){ const r=mp.az*Math.PI/180, dx=Math.sin(r), dy=-Math.cos(r), m=18*u, vt=y0+topPx()*u, vb=y1-sheetPx()*u, cx=(x0+x1)/2, cy=(vt+vb)/2, hx=w/2-m, hy=Math.max(10*u,(vb-vt)/2-m), k=Math.min(Math.abs(dx)>1e-6?hx/Math.abs(dx):1e9, Math.abs(dy)>1e-6?hy/Math.abs(dy):1e9), mx=cx+dx*k, my=cy+dy*k, R=7*u;
    const rx=R*Math.abs(1-2*mp.frac), lit='M0 '+f(-R)+' A'+f(R)+' '+f(R)+' 0 0 1 0 '+f(R)+' A'+f(rx)+' '+f(R)+' 0 0 '+(mp.frac>0.5?1:0)+' 0 '+f(-R)+'Z';
    moonSvg='<g class="m-moon" transform="translate('+f(mx)+' '+f(my)+')"><circle r="'+f(R*1.8)+'" class="m-moonglow"/><circle r="'+f(R)+'" class="m-moondark"/>'+(mp.frac>0.02?'<path d="'+lit+'" class="m-moonlit"'+(mp.phase>0.5?' transform="scale(-1 1)"':'')+'/>':'')+'</g>'; }
  let guideLine=""; const GI=guideInfo(); if(GI){ const [ax,ay]=mapXY(state.pos.lat,state.pos.lon), [bx,by]=mapXY(GI.S[0],GI.S[1]); guideLine='<path d="M'+f(ax)+' '+f(ay)+' L'+f(bx)+' '+f(by)+'" class="m-guide" stroke-width="'+f(3*u)+'" stroke-dasharray="'+f(2*u)+' '+f(6*u)+'"/>'; }
  $("mapDyn").innerHTML=tint+sun+moonSvg+sunny+detail+allStn+route+ring+stations+flags+labels+lms+comp+(w<60?"":spotsSvg+spotLabs)+evs+guideLine+you+pins;
  $("mapOver").innerHTML=over+badges+(w<60?spotsSvg+spotLabs:"");
  const sl=$("sunLine"); if(sl) sl.innerHTML=sunLine();
}
function mapPanel(){
  const key=lightAt(mapNow()), pts=mapPts(), sel=state.mapSel&&pts.find(p=>p.id===state.mapSel), pl=sel&&PLACES[sel.id], d=sel?milesText(milesTo(pl)):"";
  if($("mapPlan")) $("mapPlan").innerHTML=mapPlanBar();
  if($("wxBar")) $("wxBar").innerHTML=wxBar();
  if($("lightMarks")){ $("lightMarks").innerHTML=lightMarks(); $("mapTime").style.setProperty("--band",lightBand()); }
  const order=placeOrder().filter(id=>typeof PLACES[id].lat==="number");
  $("mapGo").innerHTML='<option value="">Go to a place…</option>'+groupOptions(order, id=>{ const dd=milesText(milesTo(PLACES[id])); return '<option value="'+id+'"'+(id===state.mapSel?" selected":"")+'>'+esc(PLACES[id].name)+(dd?' · '+dd:'')+'</option>'; });
  $("mapIntent").innerHTML='<button type="button" class="chip" data-i="all" aria-pressed="'+(state.mapIntent==="all")+'">Any intent</button>'+Object.entries(INTENTS).map(([k,v])=>'<button type="button" class="chip" data-i="'+k+'" aria-pressed="'+(state.mapIntent===k)+'"><span class="dot" style="background:'+v.color+'"></span>'+v.name+'</button>').join("");
  const nLive=state.mapShowEv?mapEvents().filter(e=>e.st.k==="live").length:0;
  if($("mapLayers")) $("mapLayers").innerHTML=mapLayersHtml(nLive); if($("mapLiveDot")) $("mapLiveDot").hidden=!nLive;
  if($("mapStatus")){ const t=mapNow(), cc=CITIES[state.city], ph=sunPhase(sunPos(t,cc.lat,cc.lon).alt), f=hourlyAt(t), sk=skyAt(t), w=WEATHER[state.city];
    const wx=f?(sk?WX_WORD[sk]:(f.cc>=50?"Some cloud":"Clear"))+(f.pop!=null&&f.pop>=20?' ('+f.pop+'% rain)':''):(state.mapT===null&&w&&w.condition_text?w.condition_text+(typeof w.temp_c==="number"?', '+Math.round(w.temp_c*9/5+32)+'°F':''):'');
    $("mapStatus").innerHTML='<b>'+hmText(t.getHours()*60+t.getMinutes())+(state.mapT===null?' now':'')+'</b> · '+SUN_PHASE[ph]+(wx?' · '+esc(wx):'')+(nLive?' · <span class="mslive">'+nLive+' event'+(nLive>1?'s':'')+' on now</span>':''); }
  const evSel=state.mapShowEv&&state.mapEv&&mapEvents().find(e=>e.id===state.mapEv), hasEv=state.mapShowEv&&mapEvents().length;
  const mine=sel?cityIdeas().filter(i=>i.p===sel.id&&(state.mapIntent==="all"||i.i===state.mapIntent)).sort((a,b)=>b.w.includes(key)-a.w.includes(key)):[];
  const lmSel=state.mapShowLm&&typeof state.mapLm==="number"&&LANDMARKS[state.mapLm];
  const spotSel=state.mapSpot&&SPOTS[state.mapSpot.split(":")[0]];
  $("mapPanel").classList.toggle("hassel",!!(sel||evSel||lmSel||spotSel));
  const legendHtml='<p class="msg maplegend"><span><span class="lg fit"></span>'+(state.mapIntent==="all"?"Ideas":INTENTS[state.mapIntent].name+" ideas")+' for the light now ('+esc(WHEN[key].toLowerCase())+')</span><span><span class="lg"></span>Other places</span><span><span class="lg arc"></span>Ring: one mark per idea, coloured when it suits the light</span><span><span class="lg badge"></span>How many suit the light now</span><span><span class="lg done"></span>You have shot here</span><span><span class="lg stn"></span>Subway station</span><span><span class="lg sunny"></span>Sunny side of the street</span>'+(state.mapShowLm?'<span><span class="lg lmk"></span>Landmark</span>':'')+(hasEv?'<span><span class="lg ev"></span>Events in the next 6 weeks</span>'+(nLive?'<span><span class="lg evlive"></span>Event on now</span>':''):'')+
      (state.plan?'<span><span class="lg route"></span>Your plan</span>':'')+(state.pos?'<span><span class="lg you"></span>You</span><span><span class="lg walk"></span>10 min walk from you</span>':'')+'</p>';
  $("mapPanel").innerHTML=(spotSel ? spotPanel(state.mapSpot) : lmSel ? lmPanel(lmSel) : evSel ? '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b>'+esc(evSel.r.e.name)+'</b><span class="where">'+(EVENT_TYPES[evSel.r.e.type]?esc(EVENT_TYPES[evSel.r.e.type])+' · ':'')+esc(evSel.r.e.where||"")+'</span></div>'+
        '<p class="evnow '+evSel.st.k+'">'+esc(evSel.st.k==="today"&&!/from about/.test(evSel.st.line)?"Today":evSel.st.line)+'</p>'+
        '<p class="mapcount"><b>'+evSel.r.o[0].toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})+(evSel.r.o[1]?' to '+evSel.r.o[1].toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}):'')+'</b>'+(evSel.r.confirmed?' <span class="pill">Confirmed</span>':' (expected)')+(evSel.r.e.time?'<br>'+esc(evSel.r.e.time):'')+'</p>'+
        (evSel.r.e.why?'<p class="mapcount">'+esc(evSel.r.e.why)+'</p>':'')+
        '<div class="callinks"><button type="button" class="chip" data-event="'+esc(evSel.id)+'">Open in Events</button>'+(evSel.r.e.map?'<a class="chip" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(evSel.r.e.map[1])+'" target="_blank" rel="noopener">Google Maps ↗</a>':'')+'</div></section>' :
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
  guideRender();
  if($("mapLegend")) $("mapLegend").innerHTML=legendHtml+'<p class="msg">Drag to move the map, pinch or use + and − to zoom, double-tap to zoom in. ⌂ shows the whole city and ◎ finds you. Zoom in for neighbourhoods, landmarks, stations, street names and spots. The number on a pin is how many of its ideas suit the light now. Streets come from the US Census street files and subway lines from the MTA; landmarks and spots are placed by hand. On the subway has no pin because it is everywhere.</p>';
  if(state.sheet==="peek"&&(sel||evSel||lmSel||spotSel)) setSheet("half");
  const selKey=[state.mapSel,state.mapEv,state.mapLm,state.mapSpot].join("|"); if(selKey!==mapPanel.last){ mapPanel.last=selKey; if($("mapBody")) $("mapBody").scrollTop=0; }
}
function mapFull(on){ state.mapFull=on; const m=$("map"); m.classList.toggle("full",on); document.body.classList.toggle("mapfull",on);
  const b=m.querySelector("[data-full]"); if(b){ b.setAttribute("aria-label",on?"Leave full screen":"Full screen map"); b.title=on?"Leave full screen":"Full screen"; }
  try{ if(on&&document.fullscreenEnabled&&!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else if(!on&&document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }catch(e){}
  requestAnimationFrame(mapLayout); }
document.addEventListener("fullscreenchange",()=>{ if(!document.fullscreenElement&&state.mapFull) mapFull(false); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&state.mapFull) mapFull(false); if(e.key==="Escape"&&openTip!==null&&openTip!=="c"){ const k=openTip; openTip=null; tipSheet(); const t=document.querySelector('#card [data-tip="'+k+'"]'); if(t) t.focus(); } });
$("tipSheet").addEventListener("click",e=>{ if(e.target.closest("[data-tipclose]")){ const k=openTip; openTip=null; tipSheet(); const t=document.querySelector('#card [data-tip="'+k+'"]'); if(t) t.focus({preventScroll:true}); } });
function spotPanel(id){ const [pid,i]=id.split(":"), S=SPOTS[pid][+i], t=mapNow(), lf=lightFacing(S[2],t), idea=IDEAS.find(x=>x.id===S[5]), cam=CAMERAS[state.camera];
  return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b><span class="snum">'+spotNum(id)+'</span> '+esc(S[3])+'</b><span class="where">'+esc(PLACES[pid].name)+' · facing '+compass(S[2])+(state.pos?' · '+mDist(kmBetween(state.pos,{lat:S[0],lon:S[1]}))+' from you':'')+'</span></div>'+
    '<div class="callinks guidecta">'+(state.guide&&state.guide.id===id?'<button type="button" class="chip" data-guidestop="1">Stop guiding</button>':'<button type="button" class="chip primary" data-guide="'+id+'">Guide me there</button>')+svLink(pid,S,id)+'</div>'+svNote(id)+
    '<p class="mapcount">'+esc(S[4])+'</p><p class="maplight"><span class="sdot '+lf.k+'"></span><b>'+lf.txt+' at '+hmText(t.getHours()*60+t.getMinutes())+'.</b> '+LIGHT_TIP[lf.k]+'</p>'+
    '<p class="hint spotfov">The wedge on the map is what '+(cam&&state.camera!=='other'?'the '+esc(cam.name):'your camera')+' takes in from here, about '+Math.round(camFov())+'° across. Drag the time slider to see how the light changes.</p>'+
    (idea?'<button type="button" class="row" data-id="'+idea.id+'"><span class="dot" style="background:'+INTENTS[idea.i].color+'"></span><span class="t"><b>'+esc(idea.t)+'</b><span>The idea for this spot · '+esc(INTENTS[idea.i].name)+'</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
    '<div class="callinks"><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+S[0].toFixed(5)+','+S[1].toFixed(5)+'&travelmode=walking" target="_blank" rel="noopener">Walking directions ↗</a>'+(state.mapNear?'<button type="button" class="chip" data-nearback="1">Back to spots near you</button>':'')+'<button type="button" class="chip" data-gosel="'+pid+'">Back to '+esc(PLACES[pid].name)+'</button></div></section>'; }
function lmPanel(L){ const [name,lat,lon,kind,,tip]=L, here={lat,lon};
  const near=Object.keys(CITIES[state.city].places).filter(id=>typeof PLACES[id].lat==="number").map(id=>({id,km:kmBetween(here,PLACES[id])})).sort((a,b)=>a.km-b.km)[0];
  const d=milesText(milesTo(here));
  return '<section class="group mapsel"><button type="button" class="mapselx" data-unsel="1" aria-label="Close">×</button><div class="group-head"><b>'+esc(name)+(d?'<span class="dist">'+d+'</span>':'')+'</b><span class="where">'+LM_KIND[kind]+' · landmark</span></div>'+
    '<p class="mapcount">'+esc(tip)+'</p>'+
    (near&&near.km<2.5?'<button type="button" class="row" data-gosel="'+near.id+'"><span class="dot" style="background:var(--yellow)"></span><span class="t"><b>Nearest Shot List place: '+esc(PLACES[near.id].name)+'</b><span>About '+(near.km/1.609<0.15?"a block":(near.km/1.609).toFixed(1)+" mi")+' away · its ideas and starting point</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
    '<div class="callinks"><a class="chip" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(name+", New York, NY")+'" target="_blank" rel="noopener">Google Maps ↗</a><a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+lat.toFixed(5)+','+lon.toFixed(5)+'&travelmode=transit" target="_blank" rel="noopener">Directions ↗</a></div></section>'; }
function mapSelectSpot(id){ const [pid,i]=id.split(":"), S=SPOTS[pid]&&SPOTS[pid][+i]; if(!S) return; state.mapSpot=id; state.mapSel=pid; state.mapEv=null; state.mapLm=null; mapDraw(); mapPanel();
  const [x,y]=mapXY(S[0],S[1]); requestAnimationFrame(()=>{ mapDraw(); mapFly(mapAim({cx:x,cy:y,w:Math.min(mapV.w,12)})); }); }
/* Bring a point into the part of the map you can see, if it is under the search bar or the sheet. */
function mapEnsure(x,y){ const svg=$("mapSvg"); if(!svg||!mapV) return; const k=mapV.w/(svg.clientWidth||360), H=svg.clientHeight, sx=(x-mapV.cx)/k+svg.clientWidth/2, sy=(y-mapV.cy)/k+H/2;
  if(sx<30||sx>svg.clientWidth-60||sy<topPx()+20||sy>H-sheetPx()-20) mapFly(mapAim({cx:x,cy:y,w:mapV.w})); }
function mapSelectLm(i){ state.mapLm=i; state.mapSel=null; state.mapEv=null; state.mapSpot=null; mapDraw(); mapPanel(); const L=LANDMARKS[i]; if(L){ const [x,y]=mapXY(L[1],L[2]); requestAnimationFrame(()=>{ mapDraw(); mapEnsure(x,y); }); } }
function mapSelectEv(id){ state.mapEv=id; state.mapSel=null; state.mapLm=null; state.mapSpot=null; mapDraw(); mapPanel(); const e=id&&mapEvents().find(v=>v.id===id); requestAnimationFrame(()=>{ mapDraw(); if(e) mapEnsure(e.x,e.y); }); }
/* Street segments for the sunny side when zoomed in, read once from the street paths and bucketed by 10-unit cells. */
let STREET_GRID=null;
function streetGrid(){ if(STREET_GRID) return STREET_GRID; const seg=[], cells=new Map();
  for(const k of ["ave","local"]){ const d=MAPD_ROADS[k]; if(!d) continue; const re=/([Ml])([^Ml]*)/g; let m, x=0, y=0;
    while((m=re.exec(d))){ const n=m[2].match(/-?\d+/g)||[];
      if(m[1]==="M"){ x=+n[0]; y=+n[1]; } else for(let i=0;i+1<n.length;i+=2){ const nx=x+ +n[i], ny=y+ +n[i+1]; seg.push(x/10,y/10,nx/10,ny/10); x=nx; y=ny; } } }
  for(let k=0;k<seg.length;k+=4){ const key=Math.floor((seg[k]+seg[k+2])/20)+","+Math.floor((seg[k+1]+seg[k+3])/20); let c=cells.get(key); if(!c){ c=[]; cells.set(key,c); } c.push(k); }
  return STREET_GRID={seg:Float32Array.from(seg),cells}; }
/* The view for a place: close enough to see its where-to-stand spots and the sunny side of its streets.
   Fits the pin, its starting point and its spots, and never zooms out if you are already closer. */
function placeView(id){ const pl=PLACES[id], pts=[[pl.lat,pl.lon]].concat(START_GEO[id]?[START_GEO[id]]:[]).concat((SPOTS[id]||[]).filter(S=>kmBetween({lat:S[0],lon:S[1]},pl)<1.2).map(S=>[S[0],S[1]])).map(c=>mapXY(c[0],c[1]));
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys);
  const svg=$("mapSvg"), H=svg?svg.clientHeight:600, Wpx=svg?svg.clientWidth:360, visH=Math.max(160,H-sheetPx()-topPx()), aspect=visH/Wpx;
  const w=Math.max(20,Math.min(100,Math.max(x1-x0,(y1-y0)/aspect)*2+8));
  return {cx:(x0+x1)/2, cy:(y0+y1)/2, w:Math.min(w,mapV?Math.max(mapV.w,20):w)}; }
function mapZoomPlace(id){ const v=placeView(id); mapFly(mapAim(v)); }
function mapSelect(id){ if(id) state.mapNear=false; state.mapSel=id; state.mapEv=null; state.mapLm=null; state.mapSpot=null; mapDraw(); mapPanel(); if(id){ const fly=()=>{ const p=mapPts().find(q=>q.id===id), h=mapV.w*MAP_ASPECT;
  if(p) mapZoomPlace(id); };
  if(state.mapFull) requestAnimationFrame(()=>{ mapDraw(); fly(); }); else fly(); } else if(state.mapFull) requestAnimationFrame(mapDraw); }
function mapGestures(svg){
  const ptr=new Map(); let g=null, lastTap=0, raf=0;
  const redraw=()=>{ if(!raf) raf=requestAnimationFrame(()=>{ raf=0; mapDraw(); }); };
  const at=(e,v)=>{ const r=svg.getBoundingClientRect(), k=v.w/r.width; return [v.cx-v.w/2+(e.clientX-r.left)*k, v.cy-v.w*MAP_ASPECT/2+(e.clientY-r.top)*k, k]; };
  const zoomAt=(e,factor,fly)=>{ const [mx,my]=at(e,mapV), w=Math.min(MAP_LIM.w[1],Math.max(MAP_LIM.w[0],mapV.w*factor)), k=w/mapV.w, to={cx:mx+(mapV.cx-mx)*k, cy:my+(mapV.cy-my)*k, w}; if(fly) mapFly(to); else { mapV=mapClamp(to); redraw(); } };
  const start=()=>{ const p=[...ptr.values()]; g={v:Object.assign({},mapV), moved:g?g.moved:false, pin:g?g.pin:null, ev:g?g.ev:null, lm:g?g.lm:null, spot:g?g.spot:null, p0:p.map(q=>({x:q.clientX,y:q.clientY}))}; };
  svg.addEventListener("pointerdown",e=>{ cancelAnimationFrame(mapAnim); const pin=e.target.closest&&e.target.closest(".m-pin"), ev=e.target.closest&&e.target.closest(".m-ev"), lm=e.target.closest&&e.target.closest(".m-lm"), sp=e.target.closest&&e.target.closest(".m-spotg"); ptr.set(e.pointerId,e); if(ptr.size===1) g={moved:false,pin:pin?pin.dataset.p:null,ev:ev?ev.dataset.e:null,lm:lm?+lm.dataset.l:null,spot:sp?sp.dataset.s:null}; start(); try{ svg.setPointerCapture(e.pointerId); }catch(err){} });
  svg.addEventListener("pointermove",e=>{ if(!ptr.has(e.pointerId)||!g) return; ptr.set(e.pointerId,e); const p=[...ptr.values()], r=svg.getBoundingClientRect(), k=g.v.w/r.width;
    if(p.length===1){ const dx=p[0].clientX-g.p0[0].x, dy=p[0].clientY-g.p0[0].y; if(!g.moved && Math.hypot(dx,dy)<7) return; g.moved=true; mapV=mapClamp({cx:g.v.cx-dx*k, cy:g.v.cy-dy*k, w:g.v.w}); }
    else if(p.length>=2 && g.p0.length>=2){ g.moved=true; const d0=Math.hypot(g.p0[0].x-g.p0[1].x,g.p0[0].y-g.p0[1].y)||1, d1=Math.hypot(p[0].clientX-p[1].clientX,p[0].clientY-p[1].clientY)||1;
      const m0={clientX:(g.p0[0].x+g.p0[1].x)/2,clientY:(g.p0[0].y+g.p0[1].y)/2}, m1x=(p[0].clientX+p[1].clientX)/2, m1y=(p[0].clientY+p[1].clientY)/2, [ax,ay]=at(m0,g.v);
      const w=Math.min(MAP_LIM.w[1],Math.max(MAP_LIM.w[0],g.v.w*d0/d1)), k2=w/r.width; mapV=mapClamp({cx:ax-(m1x-r.left)*k2+w/2, cy:ay-(m1y-r.top)*k2+w*MAP_ASPECT/2, w}); }
    redraw(); });
  const end=e=>{ if(!ptr.has(e.pointerId)) return; ptr.delete(e.pointerId); if(ptr.size){ start(); return; } const was=g; g=null; if(!was||was.moved||e.type==="pointercancel") return;
    const now=Date.now(); if(was.spot){ lastTap=0; mapSelectSpot(was.spot); return; } if(was.pin){ lastTap=0; mapSelect(was.pin); return; } if(was.ev){ lastTap=0; mapSelectEv(was.ev); return; } if(was.lm!==null&&was.lm!==undefined){ lastTap=0; mapSelectLm(was.lm); return; }
    if(now-lastTap<320){ lastTap=0; zoomAt(e,0.5,true); return; } lastTap=now; if(state.mapSel||state.mapEv||state.mapLm!==null&&state.mapLm!==undefined) mapSelect(null); };
  svg.addEventListener("pointerup",end); svg.addEventListener("pointercancel",end);
  svg.addEventListener("wheel",e=>{ e.preventDefault(); zoomAt(e,Math.exp(Math.max(-60,Math.min(60,e.deltaY))*0.004),false); },{passive:false});
}
function renderMap(){ const box=$("map"); if(!$("mapSvg")) mapShell(box); requestAnimationFrame(mapLayout); const tm=$("mapTime"), nn=new Date(); if(tm) tm.value=state.mapT===null? nn.getHours()*60+nn.getMinutes() : state.mapT; if(!mapV) mapV=mapPreset(state.mapZoom==="man"?"man":"city"); mapPanel(); mapDraw(); }
/* Learn: short lessons, linked to the ideas and tools in the app. */
const LEARN_EXTRA = [{"id": "cameras", "n": "9", "title": "Cameras for street photography", "sub": "What matters, and the popular choices compared side by side", "widget": "cams", "body": ["Almost any camera can take street photographs. What matters is how quickly it lets you react, how much attention it draws, and whether you will carry it every day. Compare up to three cameras below; the outlines are drawn to the same scale."], "points": ["Focal length shapes your style more than any other choice. 28 mm puts you in the scene and forgives focus. 35 mm is the all-rounder. 40 to 43 mm isolates more and asks you to judge distance.", "Size and noise decide whether people notice you. A pocket camera with a quiet leaf shutter disappears; a large body with a big lens does not.", "A fixed-lens camera removes a decision and keeps the camera small. Interchangeable lenses give flexibility at the cost of size and the urge to change lens.", "A viewfinder steadies the camera and works in bright sun. A screen-only camera is easier to shoot from the hip.", "Sensor size matters less than it seems for street. APS-C at ISO 3200 is clean enough for night work.", "The best street camera is the one you have with you. If it stays at home because it is heavy, a smaller one will take more pictures."], "try": "For one week, carry the camera everywhere, even when you do not plan to shoot. Note how often it was in your hand when something happened."}];
const LEARN = [{"id": "exposure", "n": "1", "title": "Exposure in one minute", "sub": "Aperture, shutter and ISO, and which one to fix first", "body": ["Three settings decide how bright a picture is. Aperture (the f-number) also decides how much is sharp front to back. Shutter speed also decides how movement looks. ISO only changes brightness, at the cost of grain when it climbs high.", "On the street, decide what matters most for the picture, fix that, and let the camera handle the rest. Freezing a gesture means fixing the shutter. Keeping a whole scene sharp means fixing the aperture. Most ideas in this app do that by putting the camera in M with Auto ISO: you choose aperture and shutter, and the camera picks the ISO."], "points": ["Each full step (a stop) halves or doubles the light: f/5.6 to f/8, 1/250 to 1/500 s, ISO 400 to 800.", "Sunny 16: in direct sun, f/16 at 1/100 s and ISO 100 is about right. Every Settings card in the app starts from that.", "For people walking, 1/250 s is the slowest that keeps them sharp. For running or cycling, 1/1000 s.", "Exposure compensation (+/−) only works when the camera is choosing something. In M with Auto ISO it changes the ISO, so in full sun, where ISO is already at its floor, use a faster shutter instead.", "Expose for the brightest part you care about. Shadows in a DNG file recover well; blown highlights do not."], "try": "Shoot the same corner three times: in A at f/8, in S at 1/1000 s, and in M at f/8 and 1/250 s with Auto ISO. Compare which setting the camera changed each time.", "link": ["Open a freeze idea", "freeze"]}, {"id": "focus", "n": "2", "title": "Zone focusing", "sub": "Set the distance before the moment happens", "widget": "dof", "body": ["Autofocus is fast, but it still has to decide what to focus on, and in a crowd it can choose wrong. Zone focusing removes the decision: you set the lens to a distance, stop down so a band of the scene is sharp, and shoot anything that walks into that band.", "The band is wider at smaller apertures and wider on a wider lens. That is why the 28 mm Q3 is the classic zone-focus camera, and why the 43 mm needs you to be more precise about distance."], "points": ["Switch to manual focus and set the ring using the distance scale or the focus readout in the viewfinder.", "Learn what 3 m looks like on the pavement: about four paving slabs, or one car length and a half.", "On the 43 mm, f/8 at 3 m gives roughly 2.2 to 4.9 m. Step closer or further rather than refocusing.", "On the 28 mm, f/8 at 3 m gives roughly 1.6 m to well past 20 m: almost everything.", "Keep the shutter at 1/500 s so the sharp band is not spoiled by movement."], "try": "Pick a doorway or crossing, set focus to its distance, and do not touch the focus ring for 30 minutes. Shoot only people who step into that spot.", "link": ["Open a zone-focus idea", "zone"]}, {"id": "compose", "n": "3", "title": "Composition", "sub": "Eleven ways to arrange a frame, each linked to ideas that use it", "widget": "tech", "body": ["Composition is how you arrange what is in the frame so the eye goes where you want it. The techniques below are the ones the app uses on its Compose tab. Tap one to see its diagram and the ideas built on it."], "points": ["Check the edges before you press: a stray arm or half a sign at the edge pulls attention.", "Fix the background first and wait for the subject. It is easier to wait than to chase.", "Change height: crouching or stepping onto a ledge changes the picture more than changing lens."], "try": "Choose one technique for a whole outing and shoot nothing else. Next time, choose a different one."}, {"id": "light", "n": "4", "title": "Reading the light", "sub": "What each kind of light is good for", "widget": "light", "body": ["The same street is a different picture in the morning, at noon, at dusk and in rain. The Now strip at the top of the app tells you which light you are in, and every idea lists the light it suits. This is what each one offers."], "points": [], "try": "Return to one place at three different times on the same day and shoot the same view. Note which light suited it."}, {"id": "people", "n": "5", "title": "Photographing people in New York", "sub": "Approach, etiquette and what the law allows", "body": ["Street photography is mostly about people, and how you behave decides both your pictures and how people react. Most of the time, being open about what you are doing works better than hiding it."], "points": ["Be visible. Holding the camera at chest height and taking your time reads as confident; hiding it reads as suspicious.", "If someone notices and objects, lower the camera, smile, and move on. Offer to delete the frame if they ask; it costs you one picture.", "For a portrait, ask first and then wait until they relax. The second or third frame after the posed one is usually the picture.", "Be careful with children, people in distress and people who are clearly vulnerable. If you would not want it shown, do not take it.", "In New York you may photograph people in public places without permission, and you may show those pictures as art or journalism. Using a recognisable person in an advertisement or to sell something needs their written consent (New York Civil Rights Law, sections 50 and 51).", "You may photograph and record police officers doing their job in public (New York Civil Rights Law, section 79-p). Keep a reasonable distance and do not interfere.", "On the subway, photography is allowed, but not with flash, tripods or extra lighting. Private spaces open to the public, such as Grand Central, Chelsea Market and the Oculus, set their own rules: handheld is generally fine, tripods are not.", "This is a summary for orientation, not legal advice."], "try": "Ask three strangers for a portrait in one afternoon. Take at least three frames of each and keep going after they relax."}, {"id": "camera", "n": "6", "title": "Set up your Leica Q3", "sub": "A street setup for the Q3 43 and Q3", "body": ["A good setup means you never have to go into the menus on the street. Set the camera once at home, save it as a user profile, and only change aperture, shutter and focus while you shoot."], "points": ["Scene Mode (in the menu): PASM, so the shutter dial and aperture ring control exposure. Auto and the other scene modes ignore the dials.", "Exposure: M with Auto ISO, upper limit 6400. Set the Auto ISO shutter speed limit to 1/250 s for when you use A mode.", "Focus: AFs with a Field box for most things, AFc with Eye/Face/Body Detection for people moving towards you, MF for zone focusing.", "Shutter type: Hybrid, so it is mechanical normally and electronic only when bright light needs more than 1/2000 s.", "File format: DNG plus JPG. The DNG keeps every highlight and shadow for editing later.", "Crop frames: the Q3 43 offers 60, 75, 90, 120 and 150 mm; the Q3 offers 35, 50, 75 and 90 mm. Use them to frame tighter without walking in, knowing each step costs resolution.", "Macro: twist the ring on the lens for close-ups. It focuses down to about 27 cm on the 43 mm and 17 cm on the 28 mm.", "Weather: the Q3 is sealed to IP52, enough for light rain, not a downpour. Keep the hood on and a cloth in your pocket.", "Save this as a user profile, and a second one for night (wider aperture, Auto ISO up to 12500) so you can switch with one press."], "try": "Set up both profiles at home, then spend one outing without opening the menu once."}, {"id": "practice", "n": "7", "title": "Assignments", "sub": "Short exercises that build the habit", "widget": "drills", "body": ["Skill in street photography comes from repetition with a constraint. Each assignment takes one outing. Tick it off when you have done it; the app remembers on this device."], "points": [], "try": ""}, {"id": "edit", "n": "8", "title": "From card to keepers", "sub": "Culling, editing and sequencing", "body": ["Most of what you shoot will not be good, and that is normal. Editing is where you find the few frames that work and make them better."], "points": ["Wait a day before you cull. You will judge more coldly.", "First pass: flag anything with a reason to exist. Second pass: from those, pick only the ones you would show someone.", "For each keeper, ask: where does the eye go first, and is that where you meant it to go?", "Edit lightly: straighten the horizon or verticals, crop the edges, set exposure, then contrast. Black and white is a choice for a picture, not a rescue for a bad one.", "Group your keepers by place or theme. Two or three pictures in sequence often say more than one.", "Back up the DNG files to two places before you format the card.", "Use Your notes on each idea in this app to record what worked, so next time you start from it."], "try": "From your last outing, keep only three pictures. Write one line in Your notes for the idea each one came from."}];
LEARN.splice(6,0,...LEARN_EXTRA); LEARN.forEach((L,n)=>L.n=String(n+1));
const DRILLS = [["one-block", "One block, one hour", "Stay on one block for an hour. The first twenty minutes will feel empty; the pictures come after that."], ["36", "Thirty-six frames", "Allow yourself 36 frames for a whole outing, like a roll of film. Every press has to be deliberate."], ["no-zoom", "No crop frames", "Shoot a whole outing at the native focal length only. Move your feet instead."], ["same-place", "Same place, three times", "Visit one place in the app three times in a week, at different times of day."], ["colour", "Colour hunt", "Choose one colour and photograph only scenes where it is the strongest element."], ["backs", "Backs and shadows", "Photograph people without showing a single face: backs, hands, shadows and silhouettes."], ["closer", "Twice as close", "Whatever distance feels right, halve it for the whole outing."], ["night", "Night walk", "Shoot one hour after dark with Auto ISO up to 6400 and no flash."]];
const LIGHT_NOTES = [["am", "Morning", "Soft, clean light from a low angle, and streets that are still quiet. Good for shop owners opening up, commuters, and long shadows on east-west streets."], ["mid", "Midday sun", "Hard light from overhead and deep shadows. Use it for graphic pictures: shadows as shapes, people stepping out of shade into sun, and the narrow slots of light between towers."], ["gold", "Late afternoon", "Warm, low light that rakes along cross streets and lights faces from the side. Manhattan's grid lines up with the sun for a few minutes at a time. The best all-round light for people."], ["night", "Night", "Neon, shop windows and screens become the light. Expose for the lights, shoot wide open, and let the shadows go black."], ["rain", "Rain or overcast", "Soft, even light with no shadows, which flatters faces. Rain adds reflections, umbrellas and people hurrying. Shoot from doorways and keep the lens hood on."]];
function dofCalc(f,N,s){ const c=0.03, H=(f*f)/(N*c)+f, d=s*1000, near=H*d/(H+d-f), far=d<H? H*d/(H-(d-f)) : Infinity; return [near/1000, far/1000]; }
const mFmt = m => m===Infinity||m>50 ? "infinity" : (m<10? m.toFixed(1) : Math.round(m))+" m";
function learnDof(){ const f=+state.lfF, N=+state.lfN, s=+state.lfS, [a,b]=dofCalc(f,N,s), H=(f*f)/(N*0.03)/1000;
  const pct=x=>Math.min(100,Math.max(0,x/15*100)), bar='<div class="dofbar"><span style="left:'+pct(a)+'%;width:'+Math.max(1.5,pct(b===Infinity?99:b)-pct(a))+'%"></span><i style="left:'+pct(s)+'%"></i></div><div class="dofscale"><span>0</span><span>5 m</span><span>10 m</span><span>15 m+</span></div>';
  return '<div class="dof"><div class="dofrow"><label>Lens<select data-lf="lfF">'+[28,43].map(v=>'<option'+(v==f?" selected":"")+' value="'+v+'">'+v+' mm</option>').join("")+'</select></label>'+
    '<label>Aperture<select data-lf="lfN">'+[2,2.8,4,5.6,8,11,16].map(v=>'<option'+(v==N?" selected":"")+' value="'+v+'">f/'+v+'</option>').join("")+'</select></label>'+
    '<label>Focus at<select data-lf="lfS">'+[1,1.5,2,2.5,3,4,5,7].map(v=>'<option'+(v==s?" selected":"")+' value="'+v+'">'+v+' m</option>').join("")+'</select></label></div>'+
    '<p class="dofout">Sharp from <b>'+mFmt(a)+'</b> to <b>'+mFmt(b)+'</b></p>'+bar+
    '<p class="hint">Hyperfocal distance at this setting: '+H.toFixed(1)+' m. Focus there and everything from half that distance to infinity is acceptably sharp. Figures use the standard full-frame circle of confusion (0.03 mm).</p></div>'; }
function learnTech(){ return '<div class="techlist">'+Object.entries(TECH).map(([k,t])=>{ const ids=Object.keys(COMPOSE).filter(id=>COMPOSE[id][0]===k), ideas=cityIdeas().filter(x=>ids.includes(x.id));
  return '<details class="techitem"><summary><b>'+esc(t[0])+'</b><span>'+ideas.length+' ideas</span></summary><div class="techbody">'+(TECH_ART[k]?dSvg(TECH_ART[k],t[0],true):'')+'<p>'+esc(t[1])+'</p>'+
    ideas.slice(0,6).map(x=>'<button type="button" class="row" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span><span class="t"><b>'+esc(x.t)+'</b><span>'+esc(PLACES[x.p].name)+'</span></span><span class="go" aria-hidden="true">›</span></button>').join("")+
    (ideas.length>6?'<p class="hint">and '+(ideas.length-6)+' more in Browse.</p>':'')+'</div></details>'; }).join("")+'</div>'; }
function learnLight(){ const k=lightAt(new Date()); return '<ul class="lightlist">'+LIGHT_NOTES.map(([key,name,text])=>{ const n=cityIdeas().filter(x=>x.w.includes(key)).length;
  return '<li'+(key===k?' class="now"':'')+'><b>'+esc(name)+(key===k?' <span class="pill">Now</span>':'')+'</b><span>'+esc(text)+'</span><button type="button" class="chip" data-light="'+key+'">'+n+' ideas for this light</button></li>'; }).join("")+'</ul>'; }
function learnDrills(){ return '<ul class="drills">'+DRILLS.map(([id,t,d])=>{ const on=state.drills.has(id); return '<li><label><input type="checkbox" data-drill="'+id+'"'+(on?" checked":"")+'><span><b>'+esc(t)+'</b>'+esc(d)+'</span></label></li>'; }).join("")+'</ul><p class="hint">'+state.drills.size+' of '+DRILLS.length+' done.</p>'; }
/* Street cameras compared. Dimensions and weights are as published (with battery where the maker says so); prices are US launch prices. */
const STREET_CAMS = [["q343", "Leica Q3 43", "Fixed lens", "Full frame, 60 MP", "43 mm f/2", "In the lens", "Electronic", "IP52", 130, 80.3, 97.6, 772, "$6,395", "2024", "The one you own. Long for a street lens: you work from 2 to 5 m and frame tighter scenes. Leica Store Miami now lists it at $7,950."], ["q328", "Leica Q3", "Fixed lens", "Full frame, 60 MP", "28 mm f/1.7", "In the lens", "Electronic", "IP52", 130, 80.3, 92.6, 743, "$5,995", "2023", "The classic wide street lens. Zone focusing covers almost everything at f/8, and crops to 35 and 50 mm."], ["x100vi", "Fujifilm X100VI", "Fixed lens", "APS-C, 40 MP", "35 mm f/2", "In the body", "Optical and electronic", "With adapter ring and filter", 128, 75, 55, 521, "$1,599", "2024", "The most popular street camera of recent years. Hybrid finder shows the frame with the world around it. Long waits at launch."], ["griv", "Ricoh GR IV", "Fixed lens", "APS-C, 26 MP", "28 mm f/2.8", "In the body", "None (screen only)", "No", 109, 61, 33, 262, "$1,499", "2025", "Fits a jacket pocket. Snap focus jumps to a preset distance with one press, made for zone focusing."], ["griiix", "Ricoh GR IIIx", "Fixed lens", "APS-C, 24 MP", "40 mm f/2.8", "In the body", "None (screen only)", "No", 109.4, 61.9, 35.2, 262, "$999", "2021", "The pocket GR with a focal length close to your 43 mm. Same snap focus."], ["rx1r3", "Sony RX1R III", "Fixed lens", "Full frame, 61 MP", "35 mm f/2", "None", "Electronic (pop-up)", "Not stated", 113.3, 67.9, 87.5, 498, "$5,099", "2025", "Full frame in a body much smaller than the Q3. Fast Sony autofocus with subject detection."], ["xe5", "Fujifilm X-E5 with XF 23mm f/2.8", "Interchangeable", "APS-C, 40 MP", "35 mm f/2.8 (kit lens)", "In the body", "Electronic", "Lens only", 124.9, 72.9, 62.1, 535, "$1,899", "2025", "Rangefinder-style body with a pancake lens. Depth and weight here include the 23 mm lens."], ["m11", "Leica M11 (body only)", "Interchangeable", "Full frame, 60 MP", "Any M lens", "None", "Optical rangefinder", "Not stated", 139, 80, 39, 640, "$8,995", "2022", "Manual focus through a rangefinder. Add a lens: a 35 mm Summicron adds roughly 25 mm of depth and 250 g."], ["a7c2", "Sony A7C II (body only)", "Interchangeable", "Full frame, 33 MP", "Any Sony E lens", "In the body", "Electronic", "Dust and moisture resistant", 124, 71, 63, 514, "$2,199", "2023", "Compact full-frame body with the widest lens choice. Add a small prime for street."]];
const CAM_ROWS = [["Type",2],["Sensor",3],["Lens (35 mm eq.)",4],["Stabilizer",5],["Viewfinder",6],["Sealing",7],["Size (W × H × D)",-1],["Weight",11],["Launch price",12]];
const CAM_COLORS = ["var(--yellow)","var(--blue)","var(--red)"];
function camFig(view,list){ const pad=8, gap=14, k=1.15, h=Math.max(...list.map(c=>view==="front"?c[9]:c[10]));
  let x=pad, out=""; list.forEach((c,n)=>{ const w=c[8]*k, hh=(view==="front"?c[9]:c[10])*k, y=pad+(h*k-hh);
    out+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="'+(view==="front"?6:4)+'" class="cam-body" style="stroke:'+CAM_COLORS[n]+'"/>'+
      (view==="front"&&c[2]==="Fixed lens"?'<circle cx="'+(x+w*0.62).toFixed(1)+'" cy="'+(y+hh*0.55).toFixed(1)+'" r="'+(Math.min(w,hh)*0.3).toFixed(1)+'" class="cam-lens"/>':'')+
      '<text x="'+(x+w/2).toFixed(1)+'" y="'+(pad+h*k+18).toFixed(1)+'" text-anchor="middle" class="cam-dim">'+Math.round(c[8])+' × '+(view==="front"?c[9]:c[10])+' mm</text>';
    x+=w+gap; });
  return '<svg class="camfig" viewBox="0 0 '+(x-gap+pad).toFixed(0)+' '+(h*k+pad+26).toFixed(0)+'" role="img" aria-label="'+(view==="front"?"Front":"Top")+' view to scale">'+out+'</svg>'; }
function learnCams(){ const sel=state.camCmp.map(id=>STREET_CAMS.find(c=>c[0]===id)).filter(Boolean);
  const pick=(n)=>'<select data-cam="'+n+'" aria-label="Camera '+(n+1)+'"><option value="">None</option>'+STREET_CAMS.map(c=>'<option value="'+c[0]+'"'+(state.camCmp[n]===c[0]?" selected":"")+'>'+esc(c[1])+'</option>').join("")+'</select>';
  return '<div class="camcmp"><div class="campicks">'+[0,1,2].map(n=>'<label><span class="swatch" style="background:'+CAM_COLORS[n]+'"></span>'+pick(n)+'</label>').join("")+'</div>'+
    (sel.length?'<div class="camviews"><span class="label">Front, to scale</span>'+camFig("front",sel)+'<span class="label">Top, to scale (depth includes the lens)</span>'+camFig("top",sel)+'</div>'+
    '<div class="camtable" style="--n:'+sel.length+'"><div class="camrow camhead"><span></span>'+sel.map((c,n)=>'<b style="border-color:'+CAM_COLORS[n]+'">'+esc(c[1])+'</b>').join("")+'</div>'+
      CAM_ROWS.map(([lab,i])=>'<div class="camrow"><span>'+lab+'</span>'+sel.map(c=>'<span>'+esc(i===-1? c[8]+' × '+c[9]+' × '+c[10]+' mm' : i===11? c[11]+' g' : i===12? c[12]+' ('+c[13]+')' : String(c[i]))+'</span>').join("")+'</div>').join("")+'</div><ul class="camnotes">'+sel.map((c,n)=>'<li><span class="swatch" style="background:'+CAM_COLORS[n]+'"></span><span><b>'+esc(c[1])+'.</b> '+esc(c[14])+'</span></li>').join("")+'</ul>':'<p class="hint">Choose up to three cameras.</p>')+
    '<p class="hint">Sizes and weights are as published by the maker or a major retailer; shapes are simplified to their outer dimensions. Prices are US launch prices and have changed since, Leica\u2019s especially.</p></div>'; }
function renderLearn(){
  const box=$("learn"), open=new Set([...box.querySelectorAll("details.lesson[open]")].map(d=>d.dataset.id)), first=!box.querySelector("details.lesson");
  box.innerHTML='<p class="lead">Short lessons for street photography, written for the Leica Q3 and New York. Each ends with something to try, and links back into the app.</p>'+
    LEARN.map(L=>'<details class="lesson" data-id="'+L.id+'"'+((first&&L.id==="exposure")||open.has(L.id)?" open":"")+'><summary><span class="lnum">'+L.n+'</span><span class="t"><b>'+esc(L.title)+'</b><span>'+esc(L.sub)+'</span></span></summary><div class="lessonbody">'+
      L.body.map(p=>'<p>'+esc(p)+'</p>').join("")+
      (L.widget==="cams"?learnCams():L.widget==="dof"?learnDof():L.widget==="tech"?learnTech():L.widget==="light"?learnLight():L.widget==="drills"?learnDrills():'')+
      (L.points.length?'<ul class="lpoints">'+L.points.map(p=>'<li>'+esc(p)+'</li>').join("")+'</ul>':'')+
      (L.try?'<div class="ltry"><span class="label">Try this</span><p>'+esc(L.try)+'</p></div>':'')+
      (L.link?'<button type="button" class="chip" data-recipe="'+L.link[1]+'">'+esc(L.link[0])+' ›</button>':'')+'</div></details>').join("");
}
/* Today: the day's light and weather, where to go for the next good light, what is on, and a one-tap outing. */
const dayMin = d => d.getHours()*60+d.getMinutes();
const atMin = m => { const d=new Date(); d.setHours(0,0,0,0); return new Date(+d+m*6e4); };
function todayWindows(){ const L=lightDay(), gold=L.runs.filter(r=>r.ph==="gold"), blue=L.runs.filter(r=>r.ph==="blue"), out=[];
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
function renderToday(){ const box=$("today"); if(!box) return;
  const now=new Date(), nm=dayMin(now), c=CITIES[state.city], {L,list}=todayWindows(), tf=hmText, w=WEATHER[state.city];
  const ph=sunPhase(sunPos(now,c.lat,c.lon).alt), next=list.find(x=>x.e>nm);
  // the moment to plan for: now if the light is good, otherwise the next window today
  const moments=[{at:null,label:"Right now"}].concat(list.filter(x=>x.e>nm&&x.s>nm).map(x=>({at:x.s,label:x.name+" "+tf(x.s)})));
  if(state.todayAt===undefined) state.todayAt = (ph==="gold"||ph==="blue"||!next) ? null : (next.s>nm?next.s:null);
  if(state.todayAt!==null&&state.todayAt<=nm) state.todayAt=null;
  const t = state.todayAt===null ? now : atMin(state.todayAt), key=lightAt(t);
  // light and weather
  let verdict; if(ph==="gold"||ph==="blue"){ const cur=list.find(x=>x.s<=nm&&x.e>nm); verdict=(cur?cur.name:SUN_PHASE[ph])+' now, until '+tf(cur?cur.e:nm)+'.'; }
  else if(next){ const sk=skyAt(atMin(next.s)); verdict=next.name+' '+tf(next.s)+' to '+tf(next.e)+(sk==="rain"?', but rain is likely then':sk===undefined?'':sk==="cloud"?', overcast':', dry')+'.'; }
  else if(ph==="night"&&nm>720) verdict='Night now: neon, shop windows and reflections. The next soft light is tomorrow\u2019s blue hour, about '+tf(list[0]?list[0].s:L.rise-30)+'.';
  else verdict='Daylight now. '+(list[0]?'Tomorrow\u2019s blue hour starts about '+tf(list[0].s)+'.':'');
  const runs=rainRuns(), rainTxt = runs ? (runs.length ? 'Rain likely '+runs.map(r=>hmText(r.s*60)+' to '+hmText(r.e*60)).join(" and ")+'.' : 'No rain expected today.') : (w&&typeof w.precip_chance_today==="number" ? 'Chance of rain today '+w.precip_chance_today+'%.' : '');
  const fresh=w&&w.updated&&Date.now()-new Date(w.updated)<3*36e5;
  const nowTxt = fresh&&w.condition_text ? esc(w.condition_text)+(typeof w.temp_c==="number"?', '+Math.round(w.temp_c*9/5+32)+'°F':'')+' now. ' : '';
  const mo=moonPos(atMin(720),c.lat,c.lon), mt=moonTimes(atMin(720),c.lat,c.lon);
  const pos=m=>(Math.min(1435,Math.max(0,m))/1435*100).toFixed(2)+'%';
  const band='<div class="tband" style="background:'+lightBand().replace(/calc\(13px \+ \(100% - 26px\) \* ([0-9.]+)\)/g,(_,p)=>(p*100).toFixed(2)+'%')+'"><i style="left:'+pos(nm)+'"></i></div>'+
    '<div class="tbandlab"><span>12 am</span><span>6 am</span><span>Noon</span><span>6 pm</span><span>12 am</span></div>';
  const wins=list.map(x=>'<span class="twin'+(x.e<=nm?' past':x.s<=nm?' on':'')+'"><span class="lk '+x.k+'"></span>'+x.name+' '+tf(x.s)+'–'+tf(x.e)+'</span>').join("")+
    '<span class="twin"><span class="lk rise"></span>Sunrise '+tf(L.rise)+'</span><span class="twin"><span class="lk set"></span>Sunset '+tf(L.set)+'</span>'+
    (mt.rise!==null&&mo.frac>0.3?'<span class="twin"><span class="lk moon"></span>'+(mo.frac>=0.97?'Full moon rises ':'Moonrise ')+tf(mt.rise)+'</span>':'');
  // picks
  const picks=todayPicks(t), lname=WHEN[key]?WHEN[key].toLowerCase():key;
  const pickHtml=picks.length?picks.map((p,n)=>{ const P=PLACES[p.id], ph2=PHOTOS_INLINE&&PLACE_PHOTO[p.id];
    return '<article class="tpick">'+(ph2?'<img src="'+esc(ph2.src)+'" alt="" loading="lazy" onerror="this.remove()">':'<span class="tpickn">'+(n+1)+'</span>')+
      '<div class="tpickb"><b>'+esc(P.name)+'</b><span class="msg">'+esc(AREAS[areaOf(p.id)]||"")+(p.mi!==null?' · '+milesText(p.mi):'')+' · '+p.fit+' idea'+(p.fit>1?'s':'')+' for '+esc(lname)+(p.fresh<p.fit?' · '+(p.fit-p.fresh)+' shot':'')+'</span>'+
      (p.best?'<button type="button" class="row" data-id="'+p.best.id+'"><span class="dot" style="background:'+INTENTS[p.best.i].color+'"></span><span class="t"><b>'+esc(p.best.t)+'</b><span>'+esc(INTENTS[p.best.i].name)+(state.saved.has(p.best.id)?' · saved':'')+'</span></span><span class="go" aria-hidden="true">›</span></button>':'')+
      '<div class="callinks"><button type="button" class="chip" data-mapgo="'+p.id+'">On the map</button>'+(START_GEO[p.id]?'<a class="chip" href="https://www.google.com/maps/dir/?api=1&destination='+START_GEO[p.id][0]+','+START_GEO[p.id][1]+'&travelmode=transit" target="_blank" rel="noopener">Directions ↗</a>':'')+'</div></div></article>'; }).join("")
    : '<p class="msg">No ideas suit this light. Try another time above.</p>';
  // events
  const evs=todayEvents(), evHtml=evs.length?evs.map(({r,st})=>'<div class="tev'+(st.k==="live"?' live':'')+'"><b>'+esc(r.e.name)+'</b><span class="msg">'+esc(st.line)+(r.e.where?' · '+esc(r.e.where):'')+'</span><div class="callinks"><button type="button" class="chip" data-event="'+esc(r.e.id)+'">Open in Events</button></div></div>').join("")
    : '<p class="msg">No events listed for today. <button type="button" class="linkbtn" data-goview="events">See what is coming up</button></p>';
  // outing
  const eg=list.find(x=>x.name==="Golden hour"), planFor = eg&&eg.s-60>nm ? {when:"tonight",h:Math.max(6,Math.floor((eg.s-75)/60)),txt:'Starts about '+tf(Math.floor((eg.s-75)/60)*60)+' at the best place for that light and walks you through golden hour into blue hour.'}
    : {when:"tomorrow morning",h:Math.max(6,Math.floor(((list.find(x=>x.name==="Morning golden hour")||{s:420}).s-30)/60)),txt:'Golden hour has passed, so this plans tomorrow morning, starting just before the morning light.'};
  // a nudge
  const savedOpen=cityIdeas().filter(x=>state.saved.has(x.id)&&!state.done.has(x.id)), dayN=Math.floor(Date.now()/864e5);
  const nudge = savedOpen.length ? (x=>'<p class="tlabel">From your saved ideas</p><button type="button" class="row" data-id="'+x.id+'"><span class="dot" style="background:'+INTENTS[x.i].color+'"></span><span class="t"><b>'+esc(x.t)+'</b><span>'+esc(PLACES[x.p].name)+(x.w.includes(key)?' · suits '+esc(lname):'')+'</span></span><span class="go" aria-hidden="true">›</span></button>')(savedOpen[dayN%savedOpen.length])
    : (d=>d?'<p class="tlabel">Assignment for today</p><p><b>'+esc(d[1])+'</b>. '+esc(d[2])+'</p><button type="button" class="linkbtn" data-goview="learn">More assignments in Learn</button>':'')(DRILLS.filter(d=>!state.drills.has(d[0]))[dayN%Math.max(1,DRILLS.filter(d=>!state.drills.has(d[0])).length)]);
  box.innerHTML=
    '<header class="thead"><h2>'+now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})+'</h2><span class="msg">'+esc(c.name)+' · '+tf(nm)+'</span></header>'+
    '<section class="tcard"><p class="tlabel">The light today</p><p class="tverdict">'+verdict+'</p><p class="msg">'+nowTxt+rainTxt+'</p>'+band+'<div class="twins">'+wins+'</div></section>'+
    '<section class="tcard"><p class="tlabel">Where to go</p><div class="intents tmoments">'+moments.map(m=>'<button type="button" class="chip" data-tat="'+(m.at===null?'now':m.at)+'" aria-pressed="'+(m.at===state.todayAt)+'">'+m.label+'</button>').join("")+'</div>'+
      '<p class="msg">Best places for '+esc(lname)+(state.todayAt===null?' now':' at '+tf(state.todayAt))+(state.pos?', nearest first among equals':'')+'.</p>'+pickHtml+'</section>'+
    '<section class="tcard"><p class="tlabel">On today</p>'+evHtml+'</section>'+
    '<section class="tcard tplan"><p class="tlabel">Plan an outing</p><p>'+planFor.txt+'</p><button type="button" class="btn primary" data-planday="'+planFor.h+'">Plan '+planFor.when+'</button></section>'+
    (nudge?'<section class="tcard">'+nudge+'</section>':''); }
function planToday(h){ renderPlan(); const t=new Date(), best=todayPicks(atMin(Math.min(1435,(+h+1)*60)))[0];
  if(best&&[...$("pStart").options].some(o=>o.value===best.id)) $("pStart").value=best.id;
  $("pDay").value="0"; renderPlan(); $("pTime").value=(+h*60<=dayMin(new Date()))?"now":String(h); if(!$("pTime").value) $("pTime").selectedIndex=0; $("pLen").value="150"; state.plan=makePlan(); savePlan(); state.view="map"; render(); }
function render(){
  openTip=null; tipSheet(); if(state.view!=="map"&&state.mapFull) mapFull(false); if(state.view!=="map"&&state.guide) guideStop(true);
  const shoot=state.view==="shoot", ev=state.view==="events", pl=state.view==="plan", mp=state.view==="map", ln=state.view==="learn", td=state.view==="today";
  $("viewToday").hidden=!td; if(td) renderToday();
  $("viewLearn").hidden=!ln; if(ln) renderLearn();
  $("viewMap").hidden=!mp; if(mp) renderMap();
  $("viewShoot").hidden=!shoot; $("viewList").hidden=shoot||ev||pl||mp||ln||td; $("viewPlan").hidden=!pl; $("viewEvents").hidden=!ev; $("bar").hidden=!shoot; $("filters").hidden=ev||pl||mp||ln||td; $("now").hidden=ev||pl||ln||mp||td; document.body.classList.toggle("mapview",mp); $("syncbox").hidden=mp; document.querySelector("footer").hidden=mp; renderNow();
  document.querySelectorAll("#views button").forEach(b=>b.setAttribute("aria-selected",b.dataset.v===state.view||(b.dataset.v==="browse"&&state.view==="saved")));
  const all=cityIdeas(), n=all.filter(x=>state.done.has(x.id)).length;
  $("progress").textContent=n+"/"+all.length; $("progress").setAttribute("aria-label",n+" of "+all.length+" ideas shot"); $("fill").style.width=(all.length?100*n/all.length:0)+"%";
  if(shoot) renderCard(); else if(ev) renderEvents(); else if(pl) renderPlan(); else if(!mp&&!ln&&!td) renderList();
}
function refilter(){ if(!matches(false).some(x=>x.id===state.current)) pick(); render(); }
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
setInterval(()=>{ try{ if(state.view!=="map"||state.mapT!==null||document.hidden) return; const tm=$("mapTime"), n=new Date(); if(tm) tm.value=n.getHours()*60+n.getMinutes(); mapDraw(); mapPanel(); }catch(e){} }, 60000);
document.addEventListener("visibilitychange",()=>{ try{ if(!document.hidden&&state.view==="map"&&state.mapT===null){ const tm=$("mapTime"), n=new Date(); if(tm) tm.value=n.getHours()*60+n.getMinutes(); mapDraw(); mapPanel(); } }catch(e){} });
// Day and night view. With no saved choice the page follows the device setting.
const rootEl=document.documentElement;
const isDark=()=>{ const a=rootEl.getAttribute("data-theme"); return a ? a==="dark" : !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); };
function syncTheme(){ const d=isDark(); $("theme").textContent=d?"☼":"☾"; $("theme").setAttribute("aria-label",d?"Switch to day view":"Switch to night view"); $("theme").title=d?"Day view":"Night view"; }
{ const t=store.get("theme",null); if(t==="dark"||t==="light") rootEl.setAttribute("data-theme",t); }
$("theme").addEventListener("click",()=>{ const next=isDark()?"light":"dark"; rootEl.setAttribute("data-theme",next); store.set("theme",next); syncTheme(); });
syncTheme();
$("events").addEventListener("click",e=>{ const c=e.target.closest("#evTypes .chip"); if(!c) return; state.evType=c.dataset.t; renderEvents(); });
$("pGo").addEventListener("click",()=>{ state.plan=makePlan(); savePlan(); renderPlan(); });
$("pDay").addEventListener("change",()=>{ const keep=$("pTime").value; renderPlan(); if([...$("pTime").options].some(o=>o.value===keep)) $("pTime").value=keep; });
$("plan").addEventListener("click",e=>{ const r=e.target.closest(".row"); if(!r) return; show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); });
state.plan=loadPlan();
syncNear();
// Move marks between devices with a copy-and-paste code. Import merges: it only ever adds.
function syncEncode(){ const j=JSON.stringify({v:1,s:[...state.saved],d:[...state.done],n:state.notes});
  return "SL1."+btoa(unescape(encodeURIComponent(j))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function syncDecode(code){ const m=/SL1\.([A-Za-z0-9_-]+)/.exec(String(code||"").replace(/\s+/g,"")); if(!m) return null;
  try{ const b=m[1].replace(/-/g,"+").replace(/_/g,"/"); const j=JSON.parse(decodeURIComponent(escape(atob(b+"===".slice((b.length+3)%4)))));
    return (j && j.v===1) ? j : null; }catch(e){ return null; } }
function syncImport(code){ const j=syncDecode(code); if(!j) return null;
  const known=new Set(IDEAS.map(x=>x.id)), ok=a=>(Array.isArray(a)?a:[]).filter(id=>typeof id==="string"&&known.has(id)); let s=0,d=0,n=0;
  ok(j.s).forEach(id=>{ if(!state.saved.has(id)){ state.saved.add(id); s++; } });
  ok(j.d).forEach(id=>{ if(!state.done.has(id)){ state.done.add(id); d++; } });
  Object.entries(j.n&&typeof j.n==="object"?j.n:{}).forEach(([id,t])=>{ if(!known.has(id)||typeof t!=="string"||!t.trim()) return; t=t.slice(0,2000);
    const cur=state.notes[id]; if(!cur){ state.notes[id]=t; n++; } else if(cur.trim()!==t.trim() && !cur.includes(t.trim())){ state.notes[id]=cur.trim()+"\n"+t.trim(); n++; } });
  store.set("saved",[...state.saved]); store.set("done",[...state.done]); store.set("notes",state.notes);
  return {s,d,n}; }
$("syncCopy").addEventListener("click",()=>{ const code=syncEncode(), msg=$("syncMsg"), total=state.saved.size+state.done.size+Object.keys(state.notes).length;
  const shown=()=>{ $("syncCode").value=code; $("syncCode").focus(); $("syncCode").select(); msg.textContent="Copying isn't available here. The code is in the box: select it and copy it."; };
  try{ navigator.clipboard.writeText(code).then(()=>{ msg.textContent="Copied a code holding "+state.saved.size+" saved, "+state.done.size+" shot and "+Object.keys(state.notes).length+" notes."+(total?"":" There is nothing marked on this device yet."); }, shown); }catch(e){ shown(); } });
$("syncImport").addEventListener("click",()=>{ const r=syncImport($("syncCode").value), msg=$("syncMsg");
  if(!r){ msg.textContent="That doesn't look like a Shot List code. Copy the whole code, starting with SL1."; return; }
  msg.textContent=(r.s+r.d+r.n) ? "Imported: "+r.s+" saved, "+r.d+" shot and "+r.n+" notes added." : "Nothing new: this device already has everything in that code.";
  $("syncCode").value=""; render(); });
$("map").addEventListener("click",e=>{
  if(e.target.closest("[data-full]")){ mapFull(!state.mapFull); return; }
  if(e.target.closest("[data-unsel]")){ const back=state.mapNear&&state.mapSpot; mapSelect(null); if(back){ mapPanel(); } return; }
  const gd=e.target.closest("[data-guide]"); if(gd){ guideStart(gd.dataset.guide); return; }
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
  const jm=e.target.closest("[data-jump]"); if(jm){ state.mapT=Math.round(+jm.dataset.jump/5)*5; $("mapTime").value=state.mapT; mapDraw(); mapPanel(); return; }
  if(e.target.closest("#mapTimeNow")){ state.mapT=null; const n=new Date(); $("mapTime").value=n.getHours()*60+n.getMinutes(); mapDraw(); mapPanel(); return; }
  const ic=e.target.closest("#mapIntent .chip"); if(ic){ state.mapIntent=ic.dataset.i; mapPanel(); mapDraw(); return; }
  const ft=e.target.closest("[data-fit]"); if(ft){ mapFly(mapPreset("city")); return; }
  const lc=e.target.closest("[data-locate]"); if(lc){ if(state.pos){ mapFly(mapPreset("me")); return; } const b=lc; b.textContent="…";
    const done=()=>{ b.textContent="◎"; mapPanel(); if(state.pos) mapFly(mapPreset("me")); else { $("mapPanel").insertAdjacentHTML("afterbegin",'<p class="msg">Your location is not available here. In the installed app, allow location access for Shot List when asked.</p>'); } };
    if(!navigator.geolocation){ done(); return; }
    try{ navigator.geolocation.getCurrentPosition(p=>{ state.pos={lat:p.coords.latitude,lon:p.coords.longitude}; fillPlaces(); syncNear(); done(); }, done, {timeout:10000,maximumAge:120000}); }catch(err){ done(); } return; }
  if(e.target.closest("#mapLayersBtn")){ const L=$("mapLayers"), open=L.hidden; L.hidden=!open; $("mapLayersBtn").setAttribute("aria-expanded",open); return; }
  if(e.target.closest("[data-layersclose]")){ $("mapLayers").hidden=true; $("mapLayersBtn").setAttribute("aria-expanded","false"); return; }
  const ly=e.target.closest("[data-layer]"); if(ly){ const k=ly.dataset.layer; state[k]=!state[k]; store.set(k,state[k]); if(k==="mapShowEv"&&!state[k]) state.mapEv=null; if(k==="mapShowLm"&&!state[k]) state.mapLm=null; mapPanel(); mapDraw(); return; }
  const ssp=e.target.closest("[data-spot]"); if(ssp){ mapSelectSpot(ssp.dataset.spot); return; }
  const gs=e.target.closest("[data-gosel]"); if(gs){ const id=gs.dataset.gosel; mapSelect(id); return; }
  const z=e.target.closest("#mapZoom .chip"); if(z){ $("mapLayers").hidden=true; $("mapLayersBtn").setAttribute("aria-expanded","false"); state.mapZoom=z.dataset.z; store.set("mapZoom",state.mapZoom); mapFly(mapPreset(z.dataset.z)); return; }
  const b=e.target.closest("[data-zoom]"); if(b){ mapFly({cx:mapV.cx,cy:mapV.cy,w:mapV.w*parseFloat(b.dataset.zoom)}); return; }
  const ev=e.target.closest("[data-event]"); if(ev){ state.view="events"; render(); const d=document.querySelector('#events details[data-id="'+ev.dataset.event+'"]'); if(d){ d.open=true; d.scrollIntoView({block:"start"}); } return; }
  const r=e.target.closest(".row"); if(r){ show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); return; }
  const g=e.target.closest("[data-go]"); if(g){ state.place=g.dataset.go; store.set("place",state.place); fillPlaces(); $("place").value=state.place; state.view="browse"; refilter(); window.scrollTo({top:0}); return; }
  const q=e.target.closest("[data-plan]"); if(q){ state.view="plan"; render(); $("pStart").value=q.dataset.plan; window.scrollTo({top:0}); }
});
let mapTimeRaf=0;
$("map").addEventListener("input",e=>{ if(e.target.id!=="mapTime") return; state.mapT=+e.target.value; if(!mapTimeRaf) mapTimeRaf=requestAnimationFrame(()=>{ mapTimeRaf=0; mapDraw(); mapPanel(); }); });
$("map").addEventListener("change",e=>{ if(e.target.id!=="mapGo"||!e.target.value) return; const id=e.target.value; state.mapSel=id; state.mapEv=null; state.mapLm=null; state.mapSpot=null; mapPanel(); mapDraw(); mapZoomPlace(id); });
$("map").addEventListener("keydown",e=>{ if(e.key!=="Enter"&&e.key!==" ") return; const p=e.target.closest(".m-pin"); const v=e.target.closest(".m-ev"); const spk=e.target.closest(".m-spotg"); if(spk){ e.preventDefault(); mapSelectSpot(spk.dataset.s); return; } const lmk=e.target.closest(".m-lm"); if(lmk){ e.preventDefault(); mapSelectLm(+lmk.dataset.l); return; } if(v){ e.preventDefault(); mapSelectEv(v.dataset.e); return; }
  if(p){ e.preventDefault(); mapSelect(p.dataset.p); const n=document.querySelector('.m-pin[data-p="'+p.dataset.p+'"]'); if(n) n.focus(); } });
window.addEventListener("resize",()=>{ if(state.view==="map") mapLayout(); });
$("learn").addEventListener("click",e=>{
  const r=e.target.closest(".row"); if(r){ show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); return; }
  const rc=e.target.closest("[data-recipe]"); if(rc){ const pick=cityIdeas().filter(x=>x.r===rc.dataset.recipe); if(pick.length){ show(pick[Math.floor(Math.random()*pick.length)].id); state.view="shoot"; state.tab="settings"; render(); window.scrollTo({top:0}); } return; }
  const lt=e.target.closest("[data-light]"); if(lt){ state.when=lt.dataset.light; store.set("when",state.when); $("when").value=state.when; state.view="browse"; refilter(); window.scrollTo({top:0}); return; }
});
$("learn").addEventListener("change",e=>{
  const sel=e.target.closest("[data-lf]"); if(sel){ state[sel.dataset.lf]=+sel.value; const w=e.target.closest(".dof"); w.outerHTML=learnDof(); return; }
  const cs=e.target.closest("[data-cam]"); if(cs){ state.camCmp[+cs.dataset.cam]=cs.value; store.set("camCmp",state.camCmp); const w=e.target.closest(".camcmp"); w.outerHTML=learnCams(); return; }
  const cb=e.target.closest("[data-drill]"); if(cb){ cb.checked?state.drills.add(cb.dataset.drill):state.drills.delete(cb.dataset.drill); store.set("drills",[...state.drills]); const h=cb.closest(".drills").nextElementSibling; if(h) h.textContent=state.drills.size+" of "+DRILLS.length+" done."; }
});
$("today").addEventListener("click",e=>{
  const tm=e.target.closest("[data-tat]"); if(tm){ state.todayAt=tm.dataset.tat==="now"?null:+tm.dataset.tat; renderToday(); return; }
  const mg=e.target.closest("[data-mapgo]"); if(mg){ const id=mg.dataset.mapgo; state.mapT=state.todayAt; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>{ mapSelect(id); })); return; }
  const pd=e.target.closest("[data-planday]"); if(pd){ planToday(pd.dataset.planday); return; }
  const gv=e.target.closest("[data-goview]"); if(gv){ state.view=gv.dataset.goview; render(); window.scrollTo({top:0}); return; }
  const ev=e.target.closest("[data-event]"); if(ev){ state.view="events"; render(); const d=document.querySelector('#events details[data-id="'+ev.dataset.event+'"]'); if(d){ d.open=true; d.scrollIntoView({block:"start"}); } return; }
  const r=e.target.closest(".row[data-id]"); if(r){ show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0}); }
});
setInterval(()=>{ try{ if(state.view==="today"&&!document.hidden) renderToday(); }catch(e){} }, 60000);
$("views").addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return; state.view=b.dataset.v; render();});
$("next").addEventListener("click",()=>{pick();render();cardToTop();});
$("back").addEventListener("click",()=>{ const id=state.history.pop(); if(!id) return; state.current=id; state.tab="idea"; render(); cardToTop(); });
function toggle(set,key){ if(!state.current) return; set.has(state.current)?set.delete(state.current):set.add(state.current); store.set(key,[...set]); render(); }
$("save").addEventListener("click",()=>toggle(state.saved,"saved"));
$("done").addEventListener("click",()=>toggle(state.done,"done"));
function notesText(){ return cityIdeas().filter(x=>state.notes[x.id]).map(x=>PLACES[x.p].name+" · "+x.t+" ["+x.id+"]: "+state.notes[x.id].trim()).join("\n"); }
$("list").addEventListener("click",e=>{
  const lv=e.target.closest("[data-listv]"); if(lv){ state.view=lv.dataset.listv; render(); return; }
  if(e.target.closest("#copyNotes")){ const t=notesText(), bar=e.target.closest(".notesbar"), b=e.target.closest("#copyNotes");
    const fallback=()=>{ if(!bar.querySelector("textarea")){ const ta=document.createElement("textarea"); ta.readOnly=true; ta.value=t; bar.appendChild(ta); ta.focus(); ta.select(); } b.textContent="Select and copy the text below"; };
    try{ navigator.clipboard.writeText(t).then(()=>{ b.textContent="Copied"; }, fallback); }catch(err){ fallback(); }
    return; }
  const r=e.target.closest(".row"); if(!r) return; show(r.dataset.id); state.view="shoot"; render(); window.scrollTo({top:0});});
$("card").addEventListener("click",e=>{
  const gg=e.target.closest("[data-guidego]"); if(gg){ const id=gg.dataset.guidego; state.mapT=null; state.view="map"; render(); guideStart(id); requestAnimationFrame(()=>requestAnimationFrame(()=>{ mapSelectSpot(id); guideRender(); })); return; }
  const sm=e.target.closest("[data-spotmap]"); if(sm){ const id=sm.dataset.spotmap; state.mapT=null; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>mapSelectSpot(id))); return; }
  const pm=e.target.closest("[data-placemap]"); if(pm){ const id=pm.dataset.placemap; state.mapT=null; state.view="map"; render(); requestAnimationFrame(()=>requestAnimationFrame(()=>mapSelect(id))); return; }
  const t=e.target.closest("[data-tab]"); if(t){ state.tab=t.dataset.tab; openTip=null; renderCard(); return; }
  const b=e.target.closest("[data-tip]"); if(b){ const was=openTip; openTip = openTip===b.dataset.tip ? null : b.dataset.tip; if(b.dataset.tip==="c") renderCard(); else { tipSheet(); if(openTip===null&&was!==null) b.focus(); } }
});
$("card").addEventListener("input",e=>{ if(e.target.id!=="note"||!state.current) return;
  const v=e.target.value.trim(); if(v) state.notes[state.current]=e.target.value; else delete state.notes[state.current]; store.set("notes",state.notes); });
$("card").addEventListener("change",e=>{ if(e.target.id==="camera"){ state.camera=e.target.value; store.set("camera",state.camera); openTip=null; renderCard(); } });

syncChips(); pick(); state.history=[]; render();
