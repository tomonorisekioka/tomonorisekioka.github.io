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
    play: document.getElementById("play-button"),
    restart: document.getElementById("restart-button"),
    time: document.getElementById("time-display"),
    caught: document.getElementById("catch-display"),
    species: document.getElementById("species-display"),
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
    ["Ampelisca sp.","クチバシソコエビ","sand","curve",1,157,184,.86],
    ["Stenothoe sp.","ずんぐりしたヨコエビ","reef","hump",2,237,129,.72],
    ["Caprella sp.","ワレカラ","rope","caprella",3,305,63,.89],
    ["Gammaropsis sp.","海藻のヨコエビ","algae","curve",4,111,97,.81],
    ["Urothoe sp.","砂に潜るヨコエビ","sand","sand",5,231,187,.77],
    ["Jassa sp.","棲管にすむヨコエビ","rope","tube",6,306,86,.66],
    ["Ericthonius sp.","ロープの棲管ヨコエビ","rope","long",7,315,109,.69],
    ["Aora sp.","雄の腕が目立つヨコエビ","grass","long",8,81,133,.77],
    ["Photis sp.","アマモに付くヨコエビ","grass","tube",9,122,131,.71],
    ["Ischyrocerus sp.","細身のヨコエビ","algae","needle",10,139,86,.72],
    ["Monocorophium sp.","小さな棲管ヨコエビ","grass","squat",11,53,117,.67],
    ["Leucothoe sp.","ふくらんだヨコエビ","reef","hump",12,259,145,.85],
    ["Liljeborgia sp.","しま模様のヨコエビ","reef","spiny",13,214,136,.9],
    ["Metopa sp.","小型の礁性ヨコエビ","reef","squat",14,248,119,.63],
    ["Elasmopus sp.","岩陰のヨコエビ","reef","thick",0,277,153,1.04],
    ["Maera sp.","大きな顎のヨコエビ","reef","thick",7,220,156,1.09],
    ["Melita sp.","アマモ場のヨコエビ","grass","curve",6,85,154,.93],
    ["Hyale sp.","緑藻につくヨコエビ","algae","thick",10,152,112,.88],
    ["Paradexamine sp.","とげとげヨコエビ","algae","spiny",9,116,121,.91],
    ["Phoxocephalus sp.","とがった頭のヨコエビ","sand","needle",12,178,184,.78],
    ["Harpinia sp.","砂泥にすむヨコエビ","sand","sand",13,135,190,.69],
    ["Haustorius sp.","砂を掘るヨコエビ","sand","squat",5,196,188,1.12],
    ["Bathyporeia sp.","細長い砂底ヨコエビ","sand","long",8,249,185,.8],
    ["Byblis sp.","砂のクチバシソコエビ","sand","needle",14,273,185,.84],
    ["Tiron sp.","棘のあるヨコエビ","algae","spiny",11,169,119,1.08],
    ["Rostroculodes sp.","小さなクチバシヨコエビ","sand","needle",4,119,183,.72],
    ["Pacifoculodes sp.","砂底の小型ヨコエビ","sand","curve",2,280,190,.62],
    ["Dexamine sp.","背中の棘のヨコエビ","grass","spiny",3,64,100,.89],
    ["Pontogeneia sp.","泳ぐヨコエビ","algae","long",1,177,144,1.03]
  ];
  const kinds = speciesData.map(([name,nameJa,habitat,shape,palette,x,y,base],i) => ({
    name,nameJa,habitat,where:habitats[habitat].label,shape,home:[x,y],
    limit:habitats[habitat].limit,base,pattern:i%5,
    color:palettes[palette][0],light:palettes[palette][1],dark:palettes[palette][2]
  }));
  const SPECIES_TOTAL = kinds.length;
  const RECORD_KEY = "ts-amphipod-collection-v2";
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

  let state = "ready", caught = 0, discovered = new Set(), roundFound = new Set(), records = {};
  let creatures = [], shots = [], particles = [], bubbles = [];
  let gameTime = 0, endAt = 0, lastFrame = 0, pausedAt = 0;
  let nextId = 0, toastUntil = 0;
  let net = null;
  const pointer = { x: 180, y: 106, prevX: 180, prevY: 106, speed: 0, active: false, lastMove: 0, touch: false, keyboard: false };
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
  function loadRecords() {
    try{
      const saved=JSON.parse(localStorage.getItem(RECORD_KEY)||"{}");
      if(saved&&typeof saved==="object"&&!Array.isArray(saved)){
        for(const [key,item] of Object.entries(saved)){
          const n=Number(key);
          if(!Number.isInteger(n)||n<0||n>=SPECIES_TOTAL||!item||typeof item!=="object")continue;
          const count=Number(item.count)||0,big=Number(item.big)||0,small=Number(item.small)||0;
          if(count<=0)continue;
          records[n]={
            count:Math.max(1,Math.floor(count)),
            big:clamp(big,.5,2),small:clamp(small,.5,2),
            large:item.large==="gold"?"gold":item.large==="silver"?"silver":"",
            mini:item.mini===true
          };
          discovered.add(n);
        }
      }
    }catch(_){/* Game still runs in private browsing or when storage is blocked. */}
  }
  function saveRecords() {
    try{localStorage.setItem(RECORD_KEY,JSON.stringify(records));}catch(_){}
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
    // One of each morphotype is present; eight more randomly chosen are roaming.
    // Unlike 3 copies per type, this keeps thirty types visible without filling the sea.
    for(let kind=0;kind<SPECIES_TOTAL;kind++)creatures.push(makeCreature(kind));
    for(let i=0;i<8;i++)creatures.push(makeCreature(Math.floor(Math.random()*SPECIES_TOTAL),1));
    ui.time.textContent="00:30";ui.caught.textContent="0";ui.species.textContent="0 / "+SPECIES_TOTAL;
    updateCrownDisplay();renderCollection();
    pointer.active=false;pointer.speed=0;
  }
  function showToast(str) {
    ui.toast.textContent=str;ui.toast.classList.add("visible");toastUntil=performance.now()+1050;
  }
  function renderCollection() {
    ui.grid.textContent="";
    kinds.forEach((k,i)=>{
      const found=discovered.has(i),rec=records[i];
      const item=document.createElement("article");item.className="specimen"+(found?" found":"");
      const art=document.createElement("div");art.className="specimen-art";
      if(found){
        const mini=document.createElement("canvas");mini.width=48;mini.height=36;
        const m=mini.getContext("2d");m.imageSmoothingEnabled=false;
        m.drawImage(speciesSprites[i],3,4,42,30);art.appendChild(mini);
      }else art.textContent="?";
      const info=document.createElement("div");info.className="specimen-copy";
      const name=document.createElement("strong");
      name.textContent=found?k.name:"No. "+String(i+1).padStart(2,"0")+"　????";
      const where=document.createElement("p");
      where.textContent=found?(k.nameJa+" / "+k.where):"未採集 · "+k.where;
      info.append(name,where);
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
    ui.progress.textContent=discovered.size+" / "+SPECIES_TOTAL+"タイプ採集済み · 大型金 "+c.largeGold+" / 大型銀 "+c.largeSilver+" / ミニ金 "+c.miniGold;
  }
  function start() {
    reset();
    state="playing";endAt=performance.now()+RUN_SECONDS*1000;
    ui.overlay.hidden=true;canvas.focus({preventScroll:true});
    showToast("そっと近づいて、ずれた先を狙おう。");
  }
  function finish() {
    state="ended"; net=null;ui.overlay.hidden=false;
    ui.kicker.textContent="FIELD REPORT";
    ui.title.textContent=roundFound.size===SPECIES_TOTAL?"全種類採集！":"採集終了！";
    ui.text.textContent="今回 "+caught+"個体・"+roundFound.size+"/"+SPECIES_TOTAL+"タイプ。図鑑の採集記録と冠は次回も残るよ。";
    ui.play.firstChild.textContent="もう一度採集する ";
    ui.play.querySelector("span").textContent="↻";
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
  canvas.addEventListener("pointerenter",(event)=>{
    if(state==="playing"&&event.pointerType!=="touch") {
      const p=canvasCoords(event);moveCursor(p.x,p.y,performance.now());
    }
  });
  canvas.addEventListener("pointermove",(event)=>{
    if(state!=="playing")return;
    if(event.pointerType==="touch"&&!(event.buttons&1))return;
    const p=canvasCoords(event);moveCursor(p.x,p.y,performance.now(),event.pointerType==="touch");
  });
  canvas.addEventListener("pointerleave",()=>{if(!pointer.touch)pointer.active=false;});
  canvas.addEventListener("pointerdown",(event)=>{
    if(state!=="playing")return;
    canvas.focus({preventScroll:true});
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
    const vector={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if(vector[event.key]) {
      event.preventDefault();
      const v=vector[event.key];const now=performance.now();
      moveCursor(clamp(pointer.x+v[0]*4,0,W),clamp(pointer.y+v[1]*4,0,H),now);
      pointer.keyboard=true;
    } else if(event.code==="Space"||event.key==="Enter") {
      event.preventDefault();pointer.keyboard=true;attempt();
    }
  });

  function attempt() {
    if(state!=="playing"||net)return;
    const x=pointer.x,y=pointer.y,shotAt=performance.now();
    const tooFast=pointer.speed>165;
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
        const name=kinds[c.kind].name;
        showToast("GET! "+name+" "+c.ratio.toFixed(2)+"×"+(firstCrown?" "+firstCrown:""));
        ui.caught.textContent=String(caught);
        ui.species.textContent=roundFound.size+" / "+SPECIES_TOTAL;
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
  function scene(t) {
    rect(0,0,W,H,"#0b4260");
    for(let y=0;y<170;y+=5)rect(0,y,W,5,y<20?"#176482":y<65?"#125a77":y<120?"#0e4b6b":"#0b405f");
    // Fine horizontal light broken into water pixels.
    for(let i=0;i<25;i++) {
      const x=(i*79+17)%362,y=(i*37)%122+7;
      rect(x+Math.round(Math.sin(t+i)*3),y,7+(i%3)*3,1,i%4===0?"#347a8a":"#1d6380");
    }
    for(let i=0;i<4;i++){
      ctx.globalAlpha=.045;
      ctx.fillStyle="#b4fff4";ctx.beginPath();ctx.moveTo(35+i*97,0);
      ctx.lineTo(45+i*97,0);ctx.lineTo(102+i*97,174);ctx.lineTo(55+i*97,174);ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;
    }
    // Background silhouettes: eelgrass meadow, rope, rocks, branching coral.
    for(let i=0;i<17;i++) {
      const x=12+i*18,ht=14+(i*31%30);
      const sx=x+Math.round(Math.sin(t*.42+i)*4);
      rect(sx,177-ht,2,ht+6,i%3===0?"#155e61":"#225c64");
    }
    // The buoy and its rope occupy the upper-right water column.
    rect(312,0,2,173,"#607d87");
    for(let yy=33;yy<173;yy+=6){rect(311+Math.round(Math.sin(t*.7+yy*.05)),yy,2,3,"#9bab9a");}
    rect(301,20,25,20,"#2e3746");rect(302,17,23,18,"#f1a64e");
    rect(301,21,25,6,"#ffe3a5");rect(302,29,23,7,"#e98650");
    rect(310,12,8,5,"#f5eee0");rect(312,9,4,3,"#6f8b93");
    rect(299,34,29,3,"#283f4f");
    // Sand floor.
    for(let x=0;x<W;x+=3){const h=174+Math.round(Math.sin(x*.039)*4+Math.cos(x*.093)*2);
      rect(x,h,4,H-h,"#b89a73");
      rect(x,h+3,4,H-h-3,"#c5a77b");
    }
    for(let i=0;i<90;i++){
      const x=(i*73+19)%360,y=183+(i*17)%24;
      rect(x,y,i%3?2:3,1,i%4===0?"#f1d6a1":"#8b795b");
    }
    // Rocky reef left and center.
    [[0,169,38,19],[19,154,28,20],[30,165,36,13],[196,169,27,14],[212,158,35,16],[239,164,26,15],[263,174,20,11]].forEach(([x,y,w,h],i)=>{
      rect(x,y,w,h,"#384f60");rect(x+3,y+2,w-7,3,i%2?"#65837e":"#607682");rect(x+4,y+6,w-9,h-8,"#476175");
    });
    // Sheltering seagrass and broad frond kelp.
    for(let i=0;i<9;i++)kelp(45+i*8,175,24+(i*19)%50,t,"#348b73");
    for(let i=0;i<7;i++)kelp(92+i*7,174,20+(i*17)%37,t,"#4b987a");
    for(let i=0;i<4;i++)kelp(134+i*5,181,34+(i*13)%36,t,"#3f816a");
    for(let i=0;i<3;i++)kelp(277+i*6,180,31+i*9,t,"#41816f");
    // Branching pink/orange coral clusters.
    drawCoral(223,163,20,"#cf8f97");drawCoral(250,168,28,"#d69c86");drawCoral(268,168,18,"#ba8da3");
    for(let i=0;i<8;i++)rect(206+i*8,168+(i%3),4,2,"#866f8b");
    // Small rope-attached marine growth.
    for(let i=0;i<8;i++) {
      const y=55+i*13;
      rect(310+Math.round(Math.sin(t*.7+i)*2),y,7+(i%3),2,i%2?"#4aa394":"#7bb3a5");
    }
    flecks.forEach(f=>{if(f.y<168)rect(f.x+(Math.sin(t*.4+f.y)*1.2),f.y,1,1,["#276d80","#2d7681","#316b7d"][f.c]);});
    bubblesSeed.forEach(b=>{
      const y=((b.y-t*b.v)%210+210)%210;
      const xx=b.x+Math.sin(t*.7+b.phase)*3;
      ctx.strokeStyle="#a5d5d4";ctx.globalAlpha=.28;ctx.lineWidth=.75;
      ctx.strokeRect(Math.round(xx),Math.round(y),b.r*2+1,b.r*2+1);ctx.globalAlpha=1;
    });
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
    // A few foreground stems partially cover amphipods, just like real collecting.
    for(let i=0;i<4;i++) {
      const x=82+i*13;
      const sway=Math.sin(t*1.2+i)*2;
      rect(x+sway,176-27-i*5,2,30+i*5,"#4d997f");
      rect(x-4+sway,151-i*3,8,2,"#61ac8a");
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
  function frame(now) {
    const dt=Math.min((now-(lastFrame||now))/1000,.035);
    lastFrame=now;
    if(state==="playing")update(dt,now);
    else gameTime+=dt*.55;
    render(now);
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

  ui.play.addEventListener("click",start);
  ui.restart.addEventListener("click",start);
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&state==="playing")pausedAt=performance.now();
    if(!document.hidden&&pausedAt&&state==="playing"){
      endAt+=performance.now()-pausedAt;pausedAt=0;lastFrame=performance.now();
    }
  });
  setupTheme();loadRecords();reset();requestAnimationFrame(frame);
})();
