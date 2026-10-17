/* Amphipod Hunt — a tiny canvas game for a researcher's website.
   Artwork is generated locally from pixel primitives; there are no external assets.
   Intentionally modeled after the frustrating experience of trying to net real amphipods:
   fast pointer movements push animals away, and a net lands AFTER the animal's reflexive dart.
*/
(() => {
  "use strict";
  const canvas = document.getElementById("sea");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = 360, H = 210, RUN_SECONDS = 30;
  canvas.width = W; canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  const ui = {
    overlay: document.getElementById("game-overlay"),
    kicker: document.getElementById("overlay-kicker"),
    title: document.getElementById("overlay-title"),
    text: document.getElementById("overlay-text"),
    hint: document.getElementById("overlay-hint"),
    play: document.getElementById("play-button"),
    restart: document.getElementById("restart-button"),
    time: document.getElementById("time-display"),
    caught: document.getElementById("catch-display"),
    species: document.getElementById("species-display"),
    crowns: document.getElementById("crown-display"),
    toast: document.getElementById("game-toast"),
    grid: document.getElementById("collection-grid"),
    progress: document.getElementById("collection-progress")
  };

  // Thirty distinct, stylized genus-level morphotypes — not verified local occurrence records.
  // Each has its own palette, markings, silhouette, typical size and habitat.
  const habitats = {
    grass: { label:"アマモ場", limit:[34,146,90,169] },
    algae: { label:"海藻の茂み", limit:[88,194,71,158] },
    sand:  { label:"砂底", limit:[112,286,176,195] },
    reef:  { label:"岩礁・サンゴ", limit:[200,283,111,171] },
    rope:  { label:"ブイのロープ", limit:[296,327,44,141] }
  };
  // Palette variations intentionally aid recognition in the small pixel sprites.
  const palettes = [
    ["#d8a776","#f8d5a4","#7c5c56"],["#edc4a2","#fff0ca","#927977"],
    ["#e99d96","#ffd8bd","#895c81"],["#b5daab","#e7ffc5","#618f7c"],
    ["#d2b6ec","#efe2ff","#806794"],["#eed5a2","#fff2c8","#9b9473"],
    ["#75cfb3","#c6ffe4","#397d7b"],["#e2aa6b","#ffe6a3","#965e57"],
    ["#a3baf0","#e1e9ff","#6077ae"],["#d785a4","#ffd1da","#914d7b"],
    ["#a8cb81","#ddffb5","#66834b"],["#f0ad81","#ffddac","#ae7058"],
    ["#92d5dc","#dcfcfc","#497e9a"],["#c6ae83","#e9dbc0","#826e6c"],
    ["#c89ecf","#f4cbf5","#926993"]
  ];
  // [genus label, Japanese nickname, habitat, silhouette, palette, x, y, base size]
  const speciesData = [
    ["Cerapus sp.","ホソツツムシ","grass","tube",0,55,142,.86],
    ["Ampelisca sp.","スガメの仲間","sand","curve",1,157,184,.86],
    ["Stenothoe sp.","ずんぐりしたヨコエビ","reef","hump",2,237,129,.72],
    ["Caprella sp.","ワレカラ","rope","caprella",3,305,63,.89],
    ["Gammaropsis sp.","海藻のヨコエビ","algae","curve",4,111,97,.81],
    ["Urothoe sp.","砂に潜るヨコエビ","sand","sand",5,231,187,.77],
    ["Jassa sp.","棲管にすむヨコエビ","rope","tube",6,306,86,.66],
    ["Ericthonius sp.","ロープの棲管ヨコエビ","rope","long",7,315,109,.69],
    ["Aora sp.","雄の腕が目立つヨコエビ","grass","long",8,81,133,.77],
    ["Photis sp.","砂泥底の棲管にすむヨコエビ","sand","tube",9,166,183,.71],
    ["Ischyrocerus sp.","細身のヨコエビ","algae","needle",10,139,86,.72],
    ["Monocorophium sp.","小さな棲管ヨコエビ","grass","squat",11,53,117,.67],
    ["Leucothoe sp.","ふくらんだヨコエビ","reef","hump",12,259,145,.85],
    ["Liljeborgia sp.","しま模様のヨコエビ","reef","spiny",13,214,136,.9],
    ["Metopa sp.","小型の礁性ヨコエビ","reef","squat",14,248,119,.63],
    ["Elasmopus sp.","岩陰のヨコエビ","reef","thick",0,277,153,1.04],
    ["Maera sp.","大きな顎のヨコエビ","reef","thick",7,220,156,1.09],
    ["Melita sp.","アマモ場のヨコエビ","grass","curve",6,85,154,.93],
    ["Hyale sp.","緑藻につくヨコエビ","algae","thick",10,152,112,.88],
    ["Atylus sp.","棘のある遊泳性ヨコエビ","algae","spiny",9,116,121,1.03],
    ["Phoxocephalus sp.","とがった頭のヨコエビ","sand","needle",12,178,184,.78],
    ["Harpinia sp.","砂泥にすむヨコエビ","sand","sand",13,135,190,.69],
    ["Opisa sp.","厚岸沖でも記録されたヨコエビ","reef","hump",5,258,148,1.06],
    ["Protomedeia sp.","砂泥底のキヌタソコエビ","sand","tube",8,249,185,.84],
    ["Byblis sp.","砂底のスガメの仲間","sand","needle",14,273,185,.84],
    ["Tiron sp.","棘のあるヨコエビ","algae","spiny",11,169,119,1.08],
    ["Monoculodes sp.","砂泥底のクチバシソコエビ","sand","needle",4,119,183,.8],
    ["Bathyporeia sp.","波のある砂底に潜るヨコエビ","sand","sand",2,280,190,.79],
    ["Dexamine sp.","背中の棘のヨコエビ","grass","spiny",3,64,100,.89],
    ["Pontogeneia sp.","泳ぐヨコエビ","algae","long",1,177,144,1.03],
    ["Eohaustorius sp.","砂にもぐるウシロマエソコエビ","sand","sand",11,209,185,.98],
    ["Anonyx sp.","海底近くのスカベンジャー","sand","lysianassoid",8,174,179,1.10],
    ["Scopelocheirus sp.","餌に集まるフトヒゲソコエビ","sand","lysianassoid",11,213,184,1.02],
    ["Orchomene sp.","岩陰の小型スカベンジャー","reef","lysianassoid",1,228,157,.90],
    ["Orchomenella sp.","海底で餌を探すヨコエビ","sand","lysianassoid",12,265,180,.82],
    ["Hippomedon sp.","ずんぐりしたフトヒゲソコエビ","reef","lysianassoid",14,252,150,1.13]
  ];
  // Display a verified Japanese genus name when available. Otherwise use the
  // verified family name, then the superfamily name (as for Bathyporeia).
  // Latin genus names remain visible in the collection note for each specimen.
  const japaneseLabels = [
    "ホソツツムシ属の一種",
    "スガメソコエビ属の一種",
    "タテソコエビ属の一種",
    "ワレカラ属の一種",
    "ソコエビ属の一種",
    "マルソコエビ属の一種",
    "カマキリヨコエビ属の一種",
    "ホソヨコエビ属の一種",
    "ヒメユンボソコエビ属の一種",
    "クダオソコエビ属の一種",
    "カマキリヨコエビ科の一種",
    "ドロクダムシ科の一種",
    "マルハサミヨコエビ属の一種",
    "トゲヨコエビ属の一種",
    "タテソコエビ科の一種",
    "イソヨコエビ属の一種",
    "スンナリヨコエビ属の一種",
    "メリタヨコエビ属の一種",
    "モクズヨコエビ属の一種",
    "フタハナヨコエビ属の一種",
    "ヒサシソコエビ属の一種",
    "スナソコエビ属の一種",
    "オオテソコエビ科の一種",
    "キヌタソコエビ属の一種",
    "オボコスガメ属の一種",
    "ムシャヨコエビ属の一種",
    "クチバシソコエビ属の一種",
    "ヒサシソコエビ上科の一種",
    "エンマヨコエビ科の一種",
    "アゴナガヨコエビ属の一種",
    "ウシロマエソコエビ属の一種",
    "シリアゲソコエビ属の一種",
    "クツミガキソコエビ属の一種",
    "ツノフトソコエビ属の一種",
    "ツノフトソコエビモドキ属の一種",
    "シデムシソコエビ属の一種"
  ];
  const kinds = speciesData.map(([name,nameJa,habitat,shape,palette,x,y,base],i) => ({
    name,nameJa,japanese:japaneseLabels[i],
    lysianassoid:i===22||i>=31,habitat,
    where:habitats[habitat].label,shape,home:[x,y],
    limit:habitats[habitat].limit,base,pattern:i%5,
    color:palettes[palette][0],light:palettes[palette][1],dark:palettes[palette][2]
  }));
  // Each area is a curated, game-like regional assemblage, NOT a verified checklist.
  // Every genus is accessible somewhere, while Bathyporeia belongs only to the Atlantic field.
  const regions = {
    akkeshi: {
      label:"厚岸・北日本",subtitle:"亜寒帯と温帯の境界をイメージした海",
      species:[0,1,2,3,4,5,7,9,10,11,13,14,17,19,20,21,22,23,24,25,26,28,29,30,31,32,33,34,35],
      water:["#174b69","#10526a","#0c435f","#0c3953"], sand:"#bdab8c"
    },
    temperate: {
      label:"日本・温帯沿岸",subtitle:"海藻や浅い岩礁が広がる暖かい海",
      species:[0,1,2,3,4,6,8,9,10,11,12,15,16,17,18,20,21,25,28,29,30,31,32],
      water:["#27929b","#1b828c","#186d7b","#12586b"],sand:"#cbb18a"
    },
    atlantic: {
      label:"北大西洋",subtitle:"岩礁と砂底にすむ仲間を探す海",
      species:[1,2,3,5,6,7,9,10,12,13,14,19,20,21,25,27,28,29,31,33,34,35],
      water:["#3b768b","#315e79","#274f6a","#1b415e"],sand:"#b3a292"
    }
  };
  const REGION_KEY = "ts-amphipod-region-choice-v1";
  const REGIONAL_RECORDS_KEY = "ts-amphipod-regional-records-v1";
  const LEGACY_RECORD_KEY_V3 = "ts-amphipod-collection-v3";
  const REASSIGNED_SLOTS = new Set([19,23,27]);
  const SPECIES_TOTAL = kinds.length;
  const RECORD_KEY = "ts-amphipod-collection-v3";
  const LEGACY_RECORD_KEY = "ts-amphipod-collection-v2";
  const RENAMED_SLOTS = new Set([19,22,23,26,27]);
  // Like MH: small gold = tiny crown; large silver/gold = oversized specimen.
  // Ratios are relative to each morphotype's standard pixel size, not real measurements.
  function crownFor(ratio) {
    return ratio <= .70 ? "mini" : ratio >= 1.48 ? "gold" : ratio >= 1.27 ? "silver" : "";
  }
  function rollSize() {
    const r=Math.random();
    if(r<.045)return rand(.58,.70);
    if(r<.145)return rand(1.48,1.68);
    if(r<.31)return rand(1.27,1.46);
    return rand(.79,1.26);
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const length = (x, y) => Math.hypot(x, y);
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const pixel = (p, x, y, w, h, color) => { p.fillStyle = color; p.fillRect(x, y, w, h); };
  const speciesSprites = kinds.map((k) => {
    const buffer=document.createElement("canvas");
    buffer.width=32;buffer.height=24;
    const p=buffer.getContext("2d"),ink="#314351",main=k.color,hi=k.light,shade=k.dark;
    const b=(x,y,w,h,col)=>pixel(p,x,y,w,h,col);
    if(k.shape==="caprella"){
      b(10,8,13,2,ink);b(12,8,10,2,main);b(10,7,4,3,ink);b(11,7,3,2,hi);
      b(16,5,2,3,main);b(14,3,2,4,shade);b(21,8,2,2,shade);
      b(23,5,1,4,hi);b(25,3,1,4,hi);b(27,2,1,3,hi);
      b(10,10,2,5,main);b(8,14,2,3,shade);b(6,16,3,2,hi);
      b(17,10,2,5,main);b(19,14,2,3,main);b(21,16,3,1,shade);
      b(21,10,2,4,main);b(23,13,3,2,hi);b(12,8,1,1,ink);
    }else if(k.shape==="lysianassoid"){
      // Deep-bodied lysianassoid outline: bulbous thorax, broadened coxal plates,
      // forward-sweeping antennae, large head and folded posterior appendages.
      const spans=[[3,11,3],[7,8,7],[11,6,10],[15,6,12],[19,8,10],[23,10,7]];
      spans.forEach(([x,y,h],i)=>{
        b(x,y,5,h,ink);b(x+1,y,4,h-1,main);
        b(x+1,y,3,2,hi);
        if(i>1&&i<5)b(x+1,y+7,4,4,shade);
        if(k.pattern%2===0&&i%2===0)b(x+2,y+3,2,2,hi);
        if(k.pattern%2===1&&i%2===1)b(x+2,y+3,2,2,shade);
      });
      b(23,9,6,7,ink);b(24,9,4,6,main);b(25,10,3,2,hi);
      b(26,12,1,1,ink); // eye
      b(28,8,2,2,shade);b(29,6,1,3,hi);b(30,5,1,2,hi);
      b(26,14,3,1,shade);b(28,15,2,2,shade);
      b(12,17,2,4,shade);b(10,20,4,1,shade);
      b(17,18,2,3,shade);b(16,20,5,1,shade);
      b(6,14,2,3,shade);b(3,16,3,1,shade);
    }else{
      const shape=k.shape, hump=shape==="hump",tube=shape==="tube",sand=shape==="sand";
      const spans=hump?[[5,10,4],[8,7,8],[13,5,11],[18,7,9],[22,10,6]]
        :sand?[[4,11,4],[8,10,6],[12,9,7],[16,10,7],[20,11,6],[23,12,4]]
        :shape==="needle"?[[4,11,2],[9,10,4],[14,9,6],[19,10,5],[24,11,3]]
        :shape==="squat"?[[6,10,5],[10,8,8],[15,8,9],[20,10,7]]
        :shape==="thick"?[[4,9,6],[8,7,10],[13,6,11],[18,8,10],[23,10,6]]
        :shape==="long"?[[3,11,3],[7,10,4],[11,9,5],[15,9,6],[19,9,6],[23,11,3]]
        :[[5,11,4],[8,9,6],[12,7,8],[17,8,8],[21,10,6]];
      spans.forEach(([x,y,h],i)=>{
        b(x,y-1,4,h+2,ink);b(x+1,y,3,h,main);b(x+1,y,3,2,hi);
        if(k.pattern===0&&i%2===0)b(x+2,y+3,2,2,shade); // dots
        if(k.pattern===1&&i%2===1)b(x+1,y+3,2,Math.max(2,h-5),shade); // stripes
        if(k.pattern===2&&i>=2)b(x+1,y+1,1,3,shade); // short dark saddle
        if(k.pattern===3&&i%2===0)b(x+2,y+2,1,2,hi); // light flecks
        if(k.pattern===4)b(x+1,y+h-2,3,1,shade); // belly band
      });
      const headX=shape==="needle"?26:23;
      b(headX,10,5,5,ink);b(headX,10,4,4,main);b(headX+1,11,3,1,hi);
      b(headX+3,10,2,2,hi);b(headX+5,8,1,3,hi);b(headX+6,7,1,2,shade);
      b(headX+2,12,1,1,ink);
      for(let i=0;i<4;i++){
        const x=8+i*4,yy=sand?15:(hump?16:15);
        b(x,yy,1,4,shade);b(x-2,yy+3,3,1,shade);
      }
      b(4,13,3,1,shade);b(2,14,3,1,shade);
      if(tube){b(8,17,14,2,"#937665");b(9,17,10,1,"#c4a47f");}
      if(hump){b(13,5,6,2,hi);b(19,6,3,2,hi);}
      if(shape==="spiny"){
        b(9,6,2,3,hi);b(14,4,2,4,shade);b(19,5,2,4,hi);
        b(8,3,1,4,shade);b(14,2,1,3,hi);
      }
      if(shape==="thick"){b(18,15,6,2,shade);b(21,17,3,3,main);}
      if(shape==="squat"){b(9,7,13,3,hi);b(13,17,8,2,shade);}
      if(shape==="needle"){b(2,12,6,1,shade);b(0,13,4,1,shade);}
      if(shape==="long"){b(3,12,2,2,shade);b(18,15,3,3,hi);}
    }
    return buffer;
  });

  let state = "ready", caught = 0, discovered = new Set(), roundFound = new Set(), records = {}, allRecords = {}, region = "akkeshi";
  const audio=window.AmphipodMusic || null;
  let musicEnabled=true,musicVolume=26;
  let creatures = [], shots = [], particles = [], bubbles = [];
  let gameTime = 0, endAt = 0, lastFrame = 0, pausedAt = 0;
  let nextId = 0, toastUntil = 0;
  let net = null;
  const pointer = { x: 180, y: 106, prevX: 180, prevY: 106, speed: 0, active: false, lastMove: 0, touch: false, keyboard: false };
  const arrowVectors = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
  const heldArrows = new Set();
  const KEYBOARD_SPEED = 132; // canvas pixels per second, independent of OS key repeat
  let finishedAt = -Infinity, lastStageTouchAt = -Infinity, restartTouchEligible = false;
  let latestInputType = "mouse";
  const bubblesSeed = Array.from({length:15},(_,i)=>({x:rand(6,352),y:rand(10,194),r:rand(.5,1.5),v:rand(3,11),phase:rand(0,6)}));
  const flecks = Array.from({length:140},(_,i)=>({x:(i*97+13)%360,y:((i*53+29)%170)+6,c:i%3}));

  function makeCreature(kind, offset=0) {
    const k=kinds[kind], rope=k.habitat==="rope", sand=k.habitat==="sand";
    const x=clamp(k.home[0]+rand(rope?-4:-10,rope?4:10)+(offset?rand(-3,3):0),k.limit[0]+3,k.limit[1]-3);
    const y=clamp(k.home[1]+rand(sand?-3:-8,sand?3:8),k.limit[2]+2,k.limit[3]-2);
    const ratio=rollSize();
    return {id:++nextId,kind,x,y,ratio,scale:k.base*ratio,
      vx:rand(-5,5),vy:rand(-3,3),facing:Math.random()>.5?1:-1,
      fleeX:Math.random()>.5?1:-1,fleeY:0,phase:rand(0,7),shiver:0,shiverPower:1,hidden:0,
      escapeGlow:0,wander:rand(0,7)};
  }
  function sanitizeRecord(item) {
    if(!item || typeof item!=="object" || !(Number(item.count)>0))return null;
    const big=Number(item.big),small=Number(item.small);
    return {
      count:Math.max(1,Math.floor(Number(item.count))),
      big:Number.isFinite(big)?clamp(big,.5,2):1,
      small:Number.isFinite(small)?clamp(small,.5,2):1,
      large:item.large==="gold"?"gold":item.large==="silver"?"silver":"",
      mini:item.mini===true
    };
  }
  function loadRecords() {
    try{
      const saved=JSON.parse(localStorage.getItem(REGIONAL_RECORDS_KEY)||"null");
      if(saved&&typeof saved==="object"&&!Array.isArray(saved)) {
        for(const id of Object.keys(regions)){
          const raw=saved[id];
          allRecords[id]={};
          if(raw&&typeof raw==="object"){
            for(const [key,item] of Object.entries(raw)){
              const n=Number(key);
              if(!Number.isInteger(n)||n<0||n>=SPECIES_TOTAL)continue;
              const rec=sanitizeRecord(item);
              if(rec)allRecords[id][n]=rec;
            }
          }
        }
      }else{
        // Legacy NW Pacific collection: import unchanged genus slots into Akkeshi once.
        // The three replaced slots have NEW genus names and must not inherit old crowns.
        const legacy=JSON.parse(localStorage.getItem(LEGACY_RECORD_KEY_V3)
          ||localStorage.getItem(RECORD_KEY)
          ||localStorage.getItem(LEGACY_RECORD_KEY)
          ||"{}");
        allRecords={akkeshi:{},temperate:{},atlantic:{}};
        for(const [key,item] of Object.entries(legacy||{})){
          const n=Number(key);
          if(!Number.isInteger(n)||n<0||n>=SPECIES_TOTAL||REASSIGNED_SLOTS.has(n))continue;
          const rec=sanitizeRecord(item);
          if(rec){
            // Keep a legacy record in the first region where its unchanged genus appears.
            const destination=Object.keys(regions).find(id=>regions[id].species.includes(n));
            if(destination)allRecords[destination][n]=rec;
          }
        }
        try{localStorage.setItem(REGIONAL_RECORDS_KEY,JSON.stringify(allRecords));}catch(_){}
      }
    }catch(_){allRecords={akkeshi:{},temperate:{},atlantic:{}};}
    for(const id of Object.keys(regions))allRecords[id] ||= {};
    try{
      const chosen=localStorage.getItem(REGION_KEY);
      if(chosen && Object.prototype.hasOwnProperty.call(regions,chosen))region=chosen;
    }catch(_){}
    activateRegionRecords();
  }
  function activateRegionRecords() {
    records=allRecords[region]||{};
    discovered=new Set(Object.keys(records).map(Number));
  }
  function saveRecords() {
    allRecords[region]=records;
    try{localStorage.setItem(REGIONAL_RECORDS_KEY,JSON.stringify(allRecords));}catch(_){}
  }
  function regionPool(){return regions[region].species;}
  function switchRegion(id) {
    if(!Object.prototype.hasOwnProperty.call(regions,id)||id===region)return;
    const keepListening=!!(musicEnabled&&audio&&audio.isPlaying());
    if(audio)audio.stop();
    region=id;
    try{localStorage.setItem(REGION_KEY,region);}catch(_){}
    activateRegionRecords();reset();
    state="ready";ui.overlay.hidden=false;
    ui.kicker.textContent="READY TO DIVE?";
    ui.title.textContent=regions[region].label+"の海へ";
    ui.text.textContent="場所が変われば、顔ぶれも変わる。ゆっくり近づき、30秒で何タイプ採集できる？";
    ui.play.firstChild.textContent="採集をはじめる ";
    ui.play.querySelector("span").textContent="→";
    if(ui.hint)ui.hint.textContent="海域を選んで30秒で何タイプ採集できる？";
    updateRegionUI();
    if(keepListening&&audio)audio.start(region);
    updateMusicUI();
  }
  function updateRegionUI() {
    const chosen=regions[region];
    const text=document.getElementById("region-description");
    if(text)text.textContent=chosen.subtitle+" · "+chosen.species.length+"タイプが出現（地域別の架空の組み合わせ）";
    document.querySelectorAll("[data-region]").forEach(button=>{
      button.setAttribute("aria-pressed",String(button.dataset.region===region));
    });
    const track=audio&&audio.tracks&&audio.tracks[region];
    const label=document.getElementById("music-label");
    if(label)label.textContent="♪ 8BIT BGM · "+(track?track.title:"BGM");
    const credit=document.getElementById("music-credit");
    if(credit&&track)credit.textContent="♪ "+track.composer+" — "+track.piece+
      "。音符データをWeb Audioで8bit化（録音素材不使用）。採集終了後も続き、最後まで演奏します。";
    const chorus=document.getElementById("music-refrain");
    if(chorus)chorus.hidden=region!=="atlantic";
  }
  function crownCounts() {
    let largeGold=0,largeSilver=0,miniGold=0;
    Object.values(records).forEach(r=>{
      if(r.large==="gold")largeGold++;
      if(r.large==="silver")largeSilver++;
      if(r.mini)miniGold++;
    });
    return {largeGold,largeSilver,miniGold};
  }
  function updateCrownDisplay() {
    const c=crownCounts();
    if(ui.crowns)ui.crowns.textContent="♛ "+(c.largeGold+c.largeSilver+c.miniGold);
  }
  function reset() {
    caught=0;roundFound=new Set();gameTime=0;net=null;pausedAt=0;
    creatures=[];shots=[];particles=[];
    // Only morphotypes curated for the selected region may spawn.
    const pool=regionPool();
    for(const kind of pool)creatures.push(makeCreature(kind));
    for(let i=0;i<Math.min(7,pool.length);i++){
      creatures.push(makeCreature(pool[Math.floor(Math.random()*pool.length)],1));
    }
    ui.time.textContent="00:30";ui.caught.textContent="0";ui.species.textContent="0 / "+pool.length;
    updateCrownDisplay();renderCollection();
    pointer.active=false;pointer.speed=0;pointer.keyboard=false;pointer.touch=false;
    heldArrows.clear();
  }
  function showToast(str) {
    ui.toast.textContent=str;ui.toast.classList.add("visible");toastUntil=performance.now()+1050;
  }
  function renderCollection() {
    ui.grid.textContent="";
    regionPool().forEach(i=>{
      const k=kinds[i],found=discovered.has(i),rec=records[i];
      const item=document.createElement("article");item.className="specimen"+(found?" found":"");
      const art=document.createElement("div");art.className="specimen-art";
      if(found){
        const mini=document.createElement("canvas");mini.width=48;mini.height=36;
        const m=mini.getContext("2d");m.imageSmoothingEnabled=false;
        m.drawImage(speciesSprites[i],3,4,42,30);art.appendChild(mini);
      }else art.textContent="?";
      const info=document.createElement("div");info.className="specimen-copy";
      const name=document.createElement("strong");
      name.textContent=found?k.japanese:"No. "+String(i+1).padStart(2,"0")+"　????";
      const where=document.createElement("p");
      where.textContent=found?(k.name+" / "+k.where):"未採集 · "+k.where;
      info.append(name,where);
      if(found&&k.lysianassoid){
        const group=document.createElement("p");
        group.className="specimen-group";
        group.textContent="LYSIANASSOIDEA · フトヒゲソコエビ上科";
        info.appendChild(group);
      }
      if(found&&rec){
        const sizes=document.createElement("p");sizes.className="specimen-sizes";
        sizes.textContent="採集 "+rec.count+"｜最大 "+rec.big.toFixed(2)+"× / 最小 "+rec.small.toFixed(2)+"×";
        info.appendChild(sizes);
        if(rec.large||rec.mini){
          const badges=document.createElement("div");badges.className="crown-list";
          if(rec.large){
            const badge=document.createElement("span");badge.className="crown-badge "+rec.large;
            badge.textContent=rec.large==="gold"?"♛ 大型金冠":"♛ 大型銀冠";
            badges.appendChild(badge);
          }
          if(rec.mini){
            const badge=document.createElement("span");badge.className="crown-badge mini";
            badge.textContent="♛ ミニ金冠";badges.appendChild(badge);
          }
          info.appendChild(badges);
        }
      }
      item.append(art,info);ui.grid.appendChild(item);
    });
    const c=crownCounts();
    ui.progress.textContent=discovered.size+" / "+regionPool().length+"タイプ採集済み · 大型金 "+c.largeGold+" / 大型銀 "+c.largeSilver+" / ミニ金 "+c.miniGold;
  }
  function start() {
    reset();
    state="playing";endAt=performance.now()+RUN_SECONDS*1000;
    if(musicEnabled&&audio&&!audio.isPlaying())audio.start(region);
    updateMusicUI();
    ui.overlay.hidden=true;canvas.focus({preventScroll:true});
    showToast("そっと近づいて、ずれた先を狙おう。");
  }
  function finish() {
    // The separate BGM continues after the 30-second sampling period.
    state="ended";net=null;pointer.active=false;heldArrows.clear();
    finishedAt=performance.now();
    restartTouchEligible=false;
    ui.overlay.hidden=false;
    ui.kicker.textContent="FIELD REPORT";
    ui.title.textContent=roundFound.size===regionPool().length?"全タイプ採集！":"採集終了！";
    ui.text.textContent="今回 "+caught+"個体・"+roundFound.size+"/"+regionPool().length+"タイプ。図鑑の採集記録と冠は次回も残るよ。";
    ui.play.firstChild.textContent="もう一度採集する ";
    ui.play.querySelector("span").textContent="↻";
    if(ui.hint)ui.hint.textContent="スマホ：連打を止めて、少し間を置いてから再開してね。";
  }

  function canvasCoords(evt) {
    const box=canvas.getBoundingClientRect();
    return {x:clamp((evt.clientX-box.left)*W/box.width,0,W),y:clamp((evt.clientY-box.top)*H/box.height,0,H)};
  }
  function segmentDistance(px,py,ax,ay,bx,by) {
    const vx=bx-ax,vy=by-ay,den=vx*vx+vy*vy;
    const t=den?clamp(((px-ax)*vx+(py-ay)*vy)/den,0,1):0;
    const dx=px-ax-vx*t,dy=py-ay-vy*t;
    return {d:length(dx,dy),dx,dy};
  }
  function moveCursor(x,y,now,viaTouch=false) {
    if (!pointer.active) {
      pointer.x=x;pointer.y=y;pointer.prevX=x;pointer.prevY=y;
      pointer.lastMove=now;pointer.speed=0;pointer.active=true;pointer.touch=viaTouch;return;
    }
    const ax=pointer.x,ay=pointer.y;
    const dt=clamp((now-pointer.lastMove)/1000,.016,.15);
    const dist=length(x-ax,y-ay);
    const speed=clamp(dist/dt,0,1500);
    pointer.speed=pointer.speed*.28+speed*.72;
    pointer.prevX=ax;pointer.prevY=ay;pointer.x=x;pointer.y=y;pointer.lastMove=now;pointer.touch=viaTouch;
    if(state!=="playing")return;
    // The invisible water current created by the moving net pushes animals.
    // Use swept-segment distance, not only the end pointer position, so a fast swipe cannot skip the animal.
    for (const c of creatures) {
      if(c.hidden)continue;
      const radius=12+7*c.scale+Math.min(18,pointer.speed*.03);
      const hit=segmentDistance(c.x,c.y,ax,ay,x,y);
      if(hit.d>radius)continue;
      const weight=1-hit.d/radius;
      let dx=hit.dx,dy=hit.dy,d=length(dx,dy);
      if(d<.05) {dx=x-ax;dy=y-ay;d=length(dx,dy)}
      if(d<.05) {dx=c.fleeX;dy=c.fleeY;d=length(dx,dy)||1}
      const impulse=(13+Math.min(120,pointer.speed*.28))*weight;
      // The animal slips with the moving wake as well as sideways away from the net.
      const nx=dx/d*.7+(x-ax)/(dist||1)*.3;
      const ny=dy/d*.7+(y-ay)/(dist||1)*.3;
      c.vx+=nx*impulse;c.vy+=ny*impulse;
      c.fleeX=nx;c.fleeY=ny;c.facing=c.vx>=0?1:-1;
      if(pointer.speed>165)c.shiver=Math.max(c.shiver,.08);
    }
  }
  // All touch presses inside the stage (including the result overlay) count as
  // ongoing tapping. Only a fresh press after a quiet gap can restart a round.
  // This prevents the final rapid sampling taps from activating the new overlay.
  const stage = document.getElementById("sea-stage");
  stage.addEventListener("pointerdown",(event)=>{
    latestInputType=event.pointerType||"mouse";
    if(event.pointerType!=="touch")return;
    const now=performance.now();
    restartTouchEligible=state==="ended" && now-finishedAt>=1100 && now-lastStageTouchAt>=800;
    lastStageTouchAt=now;
  },true);
  stage.addEventListener("pointerup",(event)=>{
    if(event.pointerType==="touch")lastStageTouchAt=performance.now();
  },true);
  stage.addEventListener("pointercancel",(event)=>{
    if(event.pointerType==="touch")lastStageTouchAt=performance.now();
  },true);
  canvas.addEventListener("pointerenter",(event)=>{
    if(state==="playing"&&event.pointerType!=="touch") {
      const p=canvasCoords(event);moveCursor(p.x,p.y,performance.now());
    }
  });
  canvas.addEventListener("pointermove",(event)=>{
    if(state!=="playing")return;
    if(event.pointerType==="touch"&&!(event.buttons&1))return;
    const p=canvasCoords(event);
    heldArrows.clear();pointer.keyboard=false;
    moveCursor(p.x,p.y,performance.now(),event.pointerType==="touch");
  });
  canvas.addEventListener("pointerleave",()=>{if(!pointer.touch)pointer.active=false;});
  canvas.addEventListener("pointerdown",(event)=>{
    if(state!=="playing")return;
    canvas.focus({preventScroll:true});
    heldArrows.clear();pointer.keyboard=false;
    if(event.pointerType==="touch"){
      event.preventDefault();
      try{canvas.setPointerCapture(event.pointerId);}catch(_){}
      const p=canvasCoords(event);
      moveCursor(p.x,p.y,performance.now(),true);
      return; // On touch, a slow drag aims the net; releasing actually casts it.
    }
    attempt();
  });
  canvas.addEventListener("pointerup",(event)=>{
    if(event.pointerType==="touch"){
      if(state==="playing"){
        const p=canvasCoords(event);moveCursor(p.x,p.y,performance.now(),true);
        attempt();
      }
      pointer.active=false;
    }
  });
  canvas.addEventListener("pointercancel",()=>{pointer.active=false;});
  canvas.addEventListener("keydown",(event)=>{
    if(state!=="playing")return;
    const v=arrowVectors[event.key];
    if(v){
      event.preventDefault();
      if(heldArrows.has(event.key))return; // browser auto-repeat no longer drives speed
      heldArrows.add(event.key);
      const now=performance.now();
      if(!pointer.active)moveCursor(pointer.x,pointer.y,now);
      pointer.keyboard=true;
      // Move instantly on the first press, then smoothly every animation frame.
      moveCursor(clamp(pointer.x+v[0]*3,0,W),clamp(pointer.y+v[1]*3,0,H),now+16);
    }else if(event.code==="Space"||event.key==="Enter"){
      event.preventDefault();
      if(event.repeat)return;
      pointer.keyboard=true;attempt();
    }
  });
  // Release must be handled on window: the key can come up after focus changes.
  window.addEventListener("keyup",event=>{if(arrowVectors[event.key])heldArrows.delete(event.key);});
  window.addEventListener("blur",()=>{heldArrows.clear();});
  function driveKeyboard(dt,now){
    if(state!=="playing"||!heldArrows.size)return;
    let dx=0,dy=0;
    for(const key of heldArrows){dx+=arrowVectors[key][0];dy+=arrowVectors[key][1];}
    const length2=Math.hypot(dx,dy);
    if(!length2)return;
    const step=KEYBOARD_SPEED*dt/length2;
    pointer.keyboard=true;
    moveCursor(clamp(pointer.x+dx*step,0,W),clamp(pointer.y+dy*step,0,H),now);
  }

  function attempt() {
    if(state!=="playing"||net)return;
    const x=pointer.x,y=pointer.y,shotAt=performance.now();
    const tooFast=!pointer.keyboard&&pointer.speed>165;
    let best=null,bestD=Infinity;
    for(const c of creatures) {
      if(c.hidden)continue;
      const d=length(c.x-x,c.y-y);
      const reach=11+13*c.scale;
      if(d<reach&&d<bestD){best=c;bestD=d}
    }
    net={x,y,t:.17,age:0,target:best,tooFast,touch:pointer.touch};
    shots.push({x,y,t:.35});
    if(!best){showToast("網が空を切った……");return;}
    // Visible reflex: an amphipod twitches sharply, then smoothly slips out of the net.
    // Dart direction inherits its recent evasive motion — aim AHEAD, not at today's position.
    let dx=best.fleeX,dy=best.fleeY;
    const sl=length(dx,dy);
    if(sl<.1){dx=best.facing;dy=0;}else{dx/=sl;dy/=sl;}
    const momentum=length(best.vx,best.vy);
    if(momentum>25){dx=best.vx/momentum*.75+dx*.25;dy=best.vy/momentum*.75+dy*.25;}
    const dl=length(dx,dy)||1;dx/=dl;dy/=dl;
    const dart=tooFast?220:102;
    best.vx+=dx*dart;best.vy+=dy*dart;
    best.fleeX=dx;best.fleeY=dy;
    best.shiver=.24;best.shiverPower=tooFast?2.5:1.7;
    best.escapeGlow=.27;
    if(tooFast)showToast("速すぎる！ 水圧でぬるっと逃げた！");
  }
  function catchResolution() {
    if(!net)return;
    const n=net;
    if(n.target&&!n.target.hidden&&!n.tooFast) {
      const c=n.target;
      const dx=c.x-n.x,dy=c.y-n.y;
      // The net closes at its original position after the creature darts ~10–20 px.
      const reach=(n.touch?10.5:8)+5*c.scale;
      if(length(dx,dy)<=reach){
        caught++;discovered.add(c.kind);roundFound.add(c.kind);c.hidden=true;
        const previous=records[c.kind]||{count:0,big:0,small:0,large:"",mini:false};
        const badge=crownFor(c.ratio);
        previous.count++;
        previous.big=Math.max(previous.big,c.ratio);
        previous.small=previous.count===1?c.ratio:Math.min(previous.small,c.ratio);
        let firstCrown="";
        if(badge==="mini"&&!previous.mini){previous.mini=true;firstCrown="♛ ミニ金冠！";}
        if(badge==="gold"&&previous.large!=="gold"){previous.large="gold";firstCrown="♛ 大型金冠！";}
        if(badge==="silver"&&!previous.large){previous.large="silver";firstCrown="♛ 大型銀冠！";}
        records[c.kind]=previous;saveRecords();
        for(let i=0;i<14;i++)particles.push({x:c.x,y:c.y,vx:rand(-28,28),vy:rand(-32,10),life:rand(.3,.7),color:i%2?"#fcdfaa":"#d6fff4"});
        const name=kinds[c.kind].japanese;
        showToast("GET! "+name+" "+c.ratio.toFixed(2)+"×"+(firstCrown?" "+firstCrown:""));
        ui.caught.textContent=String(caught);
        ui.species.textContent=roundFound.size+" / "+regionPool().length;
        updateCrownDisplay();renderCollection();
        // More amphipods remain at the habitat for another try.
        const id=c.id,kind=c.kind;
        window.setTimeout(()=>{if(state==="playing") {
          const idx=creatures.findIndex(item=>item.id===id);
          if(idx>=0)creatures[idx]=makeCreature(kind,1);
        }},1400);
      }
      else if(!n.tooFast){showToast("するりっ！ 網をすり抜けた！");}
    }
    net=null;
  }

  function update(dt,now) {
    gameTime+=dt;
    if(state==="playing") {
      const left=Math.max(0,Math.ceil((endAt-now)/1000));
      ui.time.textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");
      if(now>=endAt){ui.time.textContent="00:00";finish();}
      if(pointer.active)pointer.speed*=Math.exp(-9*dt);
      for(const c of creatures){
        if(c.hidden)continue;
        // Gentle swimming and current, overlaid on impulse-based escape.
        const k=kinds[c.kind],l=k.limit;
        const ax=Math.sin(gameTime*.8+c.phase)*.65;
        const ay=Math.cos(gameTime*.9+c.phase)*.32;
        c.vx+=ax*dt;c.vy+=ay*dt;
        if(pointer.active){
          const dx=c.x-pointer.x,dy=c.y-pointer.y;
          let d=length(dx,dy);
          const pressureRadius=18+6*c.scale;
          if(d<pressureRadius){
            if(d<.1)d=.1;
            const pressure=(1-d/pressureRadius)*(26+Math.min(pointer.speed*.6,110));
            c.vx+=dx/d*pressure*dt;c.vy+=dy/d*pressure*dt;
            if(length(c.vx,c.vy)>12){c.fleeX=c.vx;c.fleeY=c.vy;}
          }
        }
        c.vx*=Math.exp(-4.3*dt);c.vy*=Math.exp(-4.3*dt);
        const maxSpeed=245,sp=length(c.vx,c.vy);
        if(sp>maxSpeed){c.vx*=maxSpeed/sp;c.vy*=maxSpeed/sp;}
        c.x+=c.vx*dt;c.y+=c.vy*dt;
        // Soft habitat boundaries: organisms do not randomly wander into the sky.
        if(c.x<l[0]){c.x=l[0];c.vx=Math.abs(c.vx)*.65;}
        if(c.x>l[1]){c.x=l[1];c.vx=-Math.abs(c.vx)*.65;}
        if(c.y<l[2]){c.y=l[2];c.vy=Math.abs(c.vy)*.65;}
        if(c.y>l[3]){c.y=l[3];c.vy=-Math.abs(c.vy)*.65;}
        if(c.shiver>0)c.shiver=Math.max(0,c.shiver-dt);
        if(c.escapeGlow>0)c.escapeGlow=Math.max(0,c.escapeGlow-dt);
        if(length(c.vx,c.vy)>9)c.facing=c.vx>=0?1:-1;
      }
      if(net){net.t-=dt;net.age+=dt;if(net.t<=0)catchResolution();}
      shots=shots.filter(x=>(x.t-=dt)>0);
      particles=particles.filter(p=>{
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=26*dt;p.life-=dt;return p.life>0;
      });
    }
    if(ui.toast.classList.contains("visible")&&now>toastUntil)ui.toast.classList.remove("visible");
  }

  function kelp(x,base,height,t,color) {
    for(let j=0;j<4;j++){
      const sway=Math.round(Math.sin(t*.7+j*.6+x)*3);
      const xx=Math.round(x+j*3-5);
      for(let h=0;h<height;h+=4){
        const currentX=xx+Math.round(Math.sin((h+gameTime*11)/12+j*.6)*2.2)+sway;
        rect(currentX,base-h,2,5,color);
        if(h%12<2){rect(currentX+(j%2?1:-7),base-h+1,9,2,color);}
      }
    }
  }
  function drawCoral(x,y,height,color) {
    const branch=(xx,yy,h)=>{
      rect(xx,yy-h,3,h,color);
      if(h>6) {rect(xx-7,yy-h+4,8,3,color);rect(xx-7,yy-h,3,6,color);
        rect(xx+2,yy-h+9,8,3,color);rect(xx+8,yy-h+4,3,8,color);}
    };
    branch(x,y,height);branch(x+13,y-3,height-5);
    rect(x-4,y-2,23,3,"#98667b");
  }
  // The three coastlines are deliberately different landscapes, not recolors
  // of one generic reef. They are stylized marine habitats, not photographs.
  function seaRock(x,y,w,h,base,highlight){
    rect(x,y,w,h,base);
    rect(x+2,y+1,Math.max(1,w-5),3,highlight);
    rect(x+3,y+5,Math.max(1,w-7),Math.max(1,h-7),base);
    rect(x+4,y+h-4,Math.max(1,w-9),2,"#233e4c");
  }
  function longSeagrass(x,base,height,t,color,light){
    for(let k=0;k<3;k++){
      const sway=Math.sin(t*.6+x*.17+k)*3;
      for(let h=0;h<height;h+=6){
        const bend=Math.sin(h*.07+t*.55+k)*2+(h/height)*sway;
        rect(Math.round(x+k*4+bend),base-h,2,7,k%2?light:color);
      }
    }
  }
  function brownAlgae(x,base,height,t,color){
    const sway=Math.round(Math.sin(t*.7+x)*3);
    for(let h=0;h<height;h+=5){
      const stem=x+sway+Math.round(Math.sin(h*.08+t*.8)*3);
      rect(stem,base-h,2,6,"#526e51");
      if(h%10===0){
        rect(stem-9,base-h,10,3,color);
        rect(stem+2,base-h+3,11,3,color);
        rect(stem-6,base-h-2,3,5,color);
      }
    }
  }
  function broadKelp(x,base,height,t){
    for(let h=0;h<height;h+=4){
      const shift=Math.round(Math.sin(t*.46+x*.1+(height-h)*.032)*5);
      const xx=x+shift;
      rect(xx,base-h,2,5,"#526849");
      if(h>12&&h%16<4){
        rect(xx-15,base-h+1,15,5,"#71875a");
        rect(xx+2,base-h-3,16,5,"#59744c");
        rect(xx+7,base-h-4,9,2,"#8e9c63");
      }
    }
  }
  function drawMusselBed(x,y){
    for(let i=0;i<27;i++){
      const xx=x+(i*13)%52,yy=y+Math.floor(i/6)*4+(i%3);
      rect(xx,yy,4,6,i%3?"#2e4455":"#40536c");
      rect(xx,yy,2,2,i%4?"#7995a3":"#b0c3bb");
    }
  }
  function drawBuoy(t){
    const sway=Math.round(Math.sin(t*.5)*1.5);
    // The rope habitat is shared across regions so its amphipods remain findable.
    rect(312,35,2,142,region==="temperate"?"#b4b48a":"#708a92");
    for(let y=46;y<167;y+=8)rect(310+sway,y,4,2,"#8ba6a4");
    if(region==="akkeshi"){
      // Orange mooring float, northern working coast.
      rect(302,18,24,19,"#e3a356");rect(303,20,22,5,"#ffda92");
      rect(302,28,24,6,"#d77949");rect(310,13,9,6,"#e8e1c4");
      rect(301,36,26,3,"#3f5861");
    }else if(region==="temperate"){
      // Green-and-yellow coastal float with a little netting.
      rect(302,18,24,20,"#dfa85d");rect(302,20,24,8,"#f2d48a");
      rect(302,29,24,6,"#468879");rect(310,12,8,6,"#f0e7bd");
      rect(300,37,28,3,"#275b62");
      ctx.strokeStyle="#65a69a";ctx.lineWidth=.75;ctx.globalAlpha=.45;
      for(let x=300;x<=328;x+=7){ctx.beginPath();ctx.moveTo(x,45);ctx.lineTo(x+3,100);ctx.stroke();}
      for(let y=51;y<100;y+=8){ctx.beginPath();ctx.moveTo(301,y);ctx.lineTo(330,y);ctx.stroke();}
      ctx.globalAlpha=1;
    }else{
      // White/red mooring marker, North Atlantic rocky shore.
      rect(305,15,19,27,"#d7e2dc");rect(305,21,19,6,"#b6504c");
      rect(305,33,19,6,"#ba5a56");rect(311,9,7,6,"#d5e6df");
      rect(303,41,23,3,"#243e50");
    }
    for(let i=0;i<8;i++){
      const y=57+i*13,shift=Math.round(Math.sin(t*.7+i)*2);
      rect(309+shift,y,6+i%3,2,region==="atlantic"?"#77917b":"#4b9c85");
    }
  }
  function northernBottom(t){
    // Estuarine seagrass, cool-water kelp and low rounded cobble beds.
    for(let i=0;i<15;i++){
      const x=10+i*21,height=17+(i*19)%27;
      longSeagrass(x,175,height,t,"#245f68","#31767a");
    }
    [[0,168,39,24],[22,160,32,19],[202,165,32,19],
      [223,158,31,20],[251,169,30,15]].forEach(([x,y,w,h],i)=>
      seaRock(x,y,w,h,i%2?"#435768":"#334d60","#617584"));
    // Thick eelgrass beds occupy the left third of the habitat.
    for(let i=0;i<11;i++)longSeagrass(37+i*9,179,27+(i*7)%44,t,"#2c766b","#4b9f87");
    for(let i=0;i<6;i++)kelp(125+i*11,176,35+(i*13)%37,t,"#356b62");
    for(let i=0;i<4;i++)brownAlgae(22+i*13,170,30+i*8,t,"#667d57");
    for(let i=0;i<20;i++){
      const x=(i*43+7)%360,y=179+(i*11)%27;
      rect(x,y,3+i%3,2,i%3?"#7c8b86":"#d8c9ab");
    }
  }
  function temperateBottom(t){
    // Brighter, broad algal canopy and patches of warm-colored sessile life.
    for(let i=0;i<18;i++){
      const x=8+i*19,height=17+(i*11)%23;
      longSeagrass(x,175,height,t,"#1d756e","#289789");
    }
    [[0,172,38,16],[26,164,38,21],[207,164,38,22],
      [237,155,39,25],[269,171,23,14]].forEach(([x,y,w,h],i)=>
      seaRock(x,y,w,h,i%2?"#697a73":"#637e7b","#a0a691"));
    for(let i=0;i<8;i++)kelp(39+i*11,173,30+(i*17)%45,t,"#298878");
    for(let i=0;i<9;i++)brownAlgae(105+i*10,175,31+(i*13)%41,t,i%2?"#947c4e":"#ad9358");
    drawCoral(211,159,14,"#ce9c91");
    drawCoral(244,152,23,"#e4b189");
    drawCoral(274,170,15,"#a68bba");
    for(let i=0;i<14;i++){
      const x=208+(i*17)%82,y=164+(i*7)%25;
      rect(x,y,4,3,i%2?"#dcbb97":"#b7a4b8");
    }
    for(let i=0;i<18;i++){
      const x=(i*37+11)%360,y=184+(i*9)%21;
      rect(x,y,4,1,i%3?"#efdbaf":"#a8b7a3");
    }
  }
  function atlanticBottom(t){
    // Cold Atlantic rock shelf with attached mussels and broad-bladed kelp.
    for(let i=0;i<13;i++){
      const x=11+i*25,height=12+(i*17)%28;
      rect(x,178-height,3,height,"#365862");
    }
    // Stepped rock ledges are intentionally prominent on this coast.
    [[0,150,44,39],[24,162,36,25],[193,149,40,39],
      [222,139,38,46],[253,151,44,35],[288,171,33,15]].forEach(([x,y,w,h],i)=>
      seaRock(x,y,w,h,i%2?"#334957":"#293f50","#68828a"));
    [[201,139,29,5],[235,128,25,5],[267,143,31,5]].forEach(([x,y,w,h])=>
      rect(x,y,w,h,"#708c91"));
    drawMusselBed(209,151);
    drawMusselBed(246,163);
    for(let i=0;i<5;i++)broadKelp(14+i*19,182,61+(i*13)%43,t);
    for(let i=0;i<6;i++)kelp(105+i*13,180,25+(i*11)%37,t,"#607858");
    for(let i=0;i<24;i++){
      const x=(i*47+15)%360,y=177+(i*11)%30;
      rect(x,y,3+(i%2),2,i%3?"#849399":"#bcc1af");
    }
    for(let i=0;i<15;i++){
      const x=206+(i*19)%80,y=154+(i*9)%24;
      rect(x,y,3,3,i%3?"#8a9491":"#ced1c1");
    }
  }
  function scene(t) {
    const colors=regions[region].water;
    rect(0,0,W,H,colors[0]);
    for(let y=0;y<175;y+=5)
      rect(0,y,W,5,y<20?colors[0]:y<65?colors[1]:y<120?colors[2]:colors[3]);
    // Different amounts of sunlight emphasize the depth and water clarity.
    const rays=region==="temperate"?6:region==="akkeshi"?3:2;
    for(let i=0;i<rays;i++){
      ctx.globalAlpha=region==="temperate"?.105:region==="akkeshi"?.048:.027;
      const shift=region==="temperate"?52:100;
      ctx.fillStyle=region==="temperate"?"#eeffe1":"#c2e8ea";
      ctx.beginPath();ctx.moveTo(15+i*shift,0);ctx.lineTo(35+i*shift,0);
      ctx.lineTo(99+i*shift,172);ctx.lineTo(44+i*shift,172);
      ctx.closePath();ctx.fill();
    }
    ctx.globalAlpha=1;
    // Underwater suspended particles.
    for(let i=0;i<24;i++){
      const x=(i*79+17)%360,y=(i*37)%121+9;
      const shade=region==="temperate"?"#449fa3":region==="atlantic"?"#477588":"#2d7384";
      rect(x+Math.round(Math.sin(t*.6+i)*3),y,6+(i%3)*3,1,shade);
    }
    // Silt/sand floor, with visibly different sediment colors and relief.
    const sand=regions[region].sand;
    for(let x=0;x<W;x+=3){
      const h=region==="atlantic"?174+Math.round(Math.sin(x*.045)*5+Math.cos(x*.10)*4):
        region==="temperate"?177+Math.round(Math.sin(x*.028)*3+Math.cos(x*.07)*2):
        174+Math.round(Math.sin(x*.039)*4+Math.cos(x*.093)*2);
      rect(x,h,4,H-h,sand);
      rect(x,h+3,4,H-h-3,region==="temperate"?"#d8c69c":
        region==="atlantic"?"#a5a39e":"#c3af92");
    }
    if(region==="akkeshi")northernBottom(t);
    else if(region==="temperate")temperateBottom(t);
    else atlanticBottom(t);
    drawBuoy(t);
    flecks.forEach(f=>{
      if(f.y<168){
        const cols=region==="temperate"?["#328d91","#3b9fa0","#307b83"]:
          region==="atlantic"?["#396f80","#527b88","#3a6274"]:
          ["#276d80","#2d7681","#316b7d"];
        rect(f.x+Math.round(Math.sin(t*.4+f.y)*1.2),f.y,1,1,cols[f.c]);
      }
    });
    bubblesSeed.forEach(b=>{
      const y=((b.y-t*b.v)%210+210)%210;
      const xx=b.x+Math.sin(t*.7+b.phase)*3;
      ctx.strokeStyle=region==="temperate"?"#b6ffea":"#a5d5d4";
      ctx.globalAlpha=region==="atlantic"?.19:.27;ctx.lineWidth=.75;
      ctx.strokeRect(Math.round(xx),Math.round(y),b.r*2+1,b.r*2+1);
    });
    ctx.globalAlpha=1;
  }
  function renderCreatures(t) {
    for (const c of creatures) {
      if(c.hidden)continue;
      const sprint=speciesSprites[c.kind];
      const shaking=c.shiver>0;
      // Tiny side-to-side oscillations, strongest at the first instant of being grabbed.
      const shakeX=shaking?Math.sin(t*125+c.phase)*c.shiverPower*(c.shiver/.24):0;
      const shakeY=shaking?Math.cos(t*160+c.phase)*c.shiverPower*.65*(c.shiver/.24):0;
      const x=Math.round(c.x+shakeX), y=Math.round(c.y+shakeY);
      ctx.save();ctx.translate(x,y);
      ctx.scale((c.facing<0?-1:1)*c.scale,c.scale);
      if(c.escapeGlow>0){
        ctx.globalAlpha=clamp(c.escapeGlow*1.4,0,.32);
        ctx.fillStyle="#d8ffed";ctx.fillRect(-16,-12,32,24);ctx.globalAlpha=1;
      }
      ctx.drawImage(sprint,-16,-12);
      ctx.restore();
    }
    // Low-contrast foreground plants subtly reinforce each regional setting.
    const n=region==="akkeshi"?5:region==="temperate"?4:3;
    for(let i=0;i<n;i++) {
      const x=(region==="atlantic"?31:79)+i*(region==="atlantic"?18:13);
      const sway=Math.sin(t*1.2+i)*2;
      const height=region==="atlantic"?24+i*7:28+i*5;
      const stem=region==="atlantic"?"#64785b":region==="temperate"?"#55ae88":"#4b947e";
      rect(x+sway,176-height,2,height,stem);
      rect(x-5+sway,176-height*.62,9,2,stem);
    }
  }
  function drawNet() {
    if(net){
      const age=net.age, scale=1+Math.min(age/.18,1)*.1;
      ctx.save();ctx.translate(Math.round(net.x),Math.round(net.y));ctx.scale(scale,scale);
      ctx.globalAlpha=.85;
      ctx.strokeStyle="#efffe2";ctx.lineWidth=1;
      ctx.strokeRect(-10,-9,20,18);
      ctx.globalAlpha=.36;for(let x=-9;x<11;x+=5){ctx.beginPath();ctx.moveTo(x,-9);ctx.lineTo(x+10,9);ctx.stroke();}
      ctx.beginPath();ctx.moveTo(-10,-6);ctx.lineTo(9,8);ctx.stroke();
      ctx.restore();ctx.globalAlpha=1;
    }
    for (const shot of shots) {
      ctx.strokeStyle="#ceeee1";ctx.globalAlpha=clamp(shot.t/.35*.6,0,.6);
      const r=Math.round((.35-shot.t)*42)+3;
      ctx.lineWidth=1;ctx.strokeRect(Math.round(shot.x-r),Math.round(shot.y-r),r*2,r*2);
      ctx.globalAlpha=1;
    }
    for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*2);rect(p.x,p.y,2,2,p.color);}
    ctx.globalAlpha=1;
  }
  function drawCursor(t) {
    if(state!=="playing"||!pointer.active)return;
    const x=Math.round(pointer.x),y=Math.round(pointer.y);
    ctx.strokeStyle=pointer.speed>165?"#ffb8a2":"#e6fff3";
    ctx.globalAlpha=.77;ctx.lineWidth=1;
    const r=4+Math.min(pointer.speed/90,4);
    ctx.beginPath();ctx.moveTo(x-r-3,y);ctx.lineTo(x-r+1,y);ctx.moveTo(x+r-1,y);ctx.lineTo(x+r+3,y);
    ctx.moveTo(x,y-r-3);ctx.lineTo(x,y-r+1);ctx.moveTo(x,y+r-1);ctx.lineTo(x,y+r+3);ctx.stroke();
    ctx.globalAlpha=1;
  }

  function render(now) {
    const t=now*.001;
    ctx.imageSmoothingEnabled=false;
    scene(t);renderCreatures(t);drawNet();drawCursor(t);
  }
  let lastMusicRender=0;
  function frame(now) {
    const dt=Math.min((now-(lastFrame||now))/1000,.035);
    lastFrame=now;
    if(state==="playing"){driveKeyboard(dt,now);update(dt,now);}
    else gameTime+=dt*.55;
    render(now);
    if(now-lastMusicRender>280){updateMusicUI();lastMusicRender=now;}
    requestAnimationFrame(frame);
  }

  // Theme toggle matches the header on the main researcher site.
  function setupTheme() {
    const root=document.documentElement,menu=document.getElementById("theme-menu");
    if(!menu)return;
    const label=document.getElementById("theme-current"),glyph=menu.querySelector(".theme-glyph");
    const options=menu.querySelectorAll("[data-theme-option]");
    const system=window.matchMedia("(prefers-color-scheme: dark)");
    const modeValue=()=>root.getAttribute("data-theme")||"auto";
    const refresh=()=>{
      const mode=modeValue();
      root.style.colorScheme=mode==="auto"?(system.matches?"dark":"light"):mode;
      label.textContent=mode==="auto"?"Auto":mode==="dark"?"Dark":"Light";
      glyph.textContent=mode==="auto"?"◐":mode==="dark"?"☾":"☀";
      options.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.themeOption===mode)));
    };
    options.forEach(button=>button.addEventListener("click",()=>{
      const mode=button.dataset.themeOption;
      if(mode==="auto")root.removeAttribute("data-theme");
      else root.setAttribute("data-theme",mode);
      try{if(mode==="auto")localStorage.removeItem("ts-theme");else localStorage.setItem("ts-theme",mode);}catch(_){}
      refresh();menu.open=false;menu.querySelector("summary").focus();
    }));
    system.addEventListener("change",refresh);
    document.addEventListener("click",event=>{if(menu.open&&!menu.contains(event.target))menu.open=false;});
    menu.addEventListener("keydown",event=>{if(event.key==="Escape"){menu.open=false;menu.querySelector("summary").focus();}});
    refresh();
  }

  function formatClock(seconds){
    const sec=Math.max(0,Math.floor(Number(seconds)||0));
    return String(Math.floor(sec/60))+":"+String(sec%60).padStart(2,"0");
  }
  function updateMusicUI(){
    const control=document.getElementById("music-play");
    const progress=document.getElementById("music-progress");
    if(!control)return;
    const playing=!!(audio&&audio.isPlaying());
    control.textContent=playing?"■ 曲を停止":"▶ 曲を試聴";
    control.setAttribute("aria-label",playing?"現在の曲を停止":"選択した海域の曲を最初から再生");
    control.setAttribute("aria-pressed",String(playing));
    const duration=audio&&audio.tracks?.[region]?.duration || 0;
    if(progress)progress.textContent=formatClock(playing?audio.position():0)+" / "+formatClock(duration);
  }
  function setupMusic(){
    const toggle=document.getElementById("music-toggle");
    const slider=document.getElementById("music-volume");
    const player=document.getElementById("music-play");
    const chorus=document.getElementById("music-refrain");
    if(!toggle||!slider||!player)return;
    try{
      musicEnabled=localStorage.getItem("ts-amphipod-music-on-v1")!=="false";
      const saved=Number(localStorage.getItem("ts-amphipod-music-volume-v1"));
      if(Number.isFinite(saved)&&saved>=0&&saved<=100&&localStorage.getItem("ts-amphipod-music-volume-v1")!==null)musicVolume=saved;
    }catch(_){}
    if(!audio||!audio.supported){
      musicEnabled=false;toggle.disabled=true;toggle.textContent="音声非対応";
      slider.disabled=true;player.disabled=true;player.textContent="再生不可";return;
    }
    const update=()=>{
      toggle.textContent=musicEnabled?"♫ ON":"♫ OFF";
      toggle.setAttribute("aria-pressed",String(musicEnabled));
      toggle.setAttribute("aria-label",musicEnabled?"BGMをミュートする":"BGMをオンにする");
      slider.value=String(musicVolume);
      audio.setVolume(musicVolume/100);
      updateMusicUI();
    };
    player.addEventListener("click",()=>{
      if(audio.isPlaying())audio.stop();
      else{
        if(!musicEnabled){
          musicEnabled=true;
          try{localStorage.setItem("ts-amphipod-music-on-v1","true");}catch(_){}
        }
        audio.start(region);
      }
      update();
    });
    if(chorus)chorus.addEventListener("click",()=>{
      if(region!=="atlantic"||!audio?.supported)return;
      if(!musicEnabled){
        musicEnabled=true;
        try{localStorage.setItem("ts-amphipod-music-on-v1","true");}catch(_){}
      }
      audio.start("atlantic",audio.tracks.atlantic.chorusAt||0);
      update();
    });
    toggle.addEventListener("click",()=>{
      musicEnabled=!musicEnabled;
      try{localStorage.setItem("ts-amphipod-music-on-v1",String(musicEnabled));}catch(_){}
      if(!musicEnabled)audio.stop();
      else if(state==="playing")audio.start(region);
      update();
    });
    slider.addEventListener("input",()=>{
      musicVolume=Number(slider.value);
      audio.setVolume(musicVolume/100);
    });
    slider.addEventListener("change",()=>{
      try{localStorage.setItem("ts-amphipod-music-volume-v1",String(musicVolume));}catch(_){}
    });
    update();
  }
  ui.play.addEventListener("click",event=>{
    // Keyboard activation is always deliberate. Touch activation after a round
    // requires a pause; rapid taps through the game-over transition are ignored.
    // Some mobile browsers synthesize a mouse-like click after touch input.
    // The very recent stage touch is the more reliable cross-browser signal.
    const touchClick=event.pointerType==="touch" ||
      (event.detail!==0&&latestInputType==="touch"&&performance.now()-lastStageTouchAt<650);
    if(state==="ended"&&touchClick&&!restartTouchEligible){
      if(ui.hint)ui.hint.textContent="連打による誤操作を防いでいます。少し間を置いてタップしてね。";
      return;
    }
    restartTouchEligible=false;
    start();
  });
  ui.restart.addEventListener("click",start);
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden)heldArrows.clear();
    if(document.hidden&&state==="playing")pausedAt=performance.now();
    if(!document.hidden&&pausedAt&&state==="playing"){
      endAt+=performance.now()-pausedAt;pausedAt=0;lastFrame=performance.now();
    }
  });
  document.querySelectorAll("[data-region]").forEach(button=>{
    button.addEventListener("click",()=>switchRegion(button.dataset.region));
  });
  setupTheme();setupMusic();loadRecords();reset();updateRegionUI();requestAnimationFrame(frame);
})();
