/* Three short original Web Audio chiptune performances of public-domain compositions:
   Akkeshi: Grieg, "Morning Mood" (Peer Gynt)
   Temperate Japan: Satie, "Gymnopédie No. 1"
   North Atlantic: Bizet, "Toreador Song" (Carmen)
   Pitches are explicitly sequenced as notes, not loaded from a recording or MIDI file.
   Audio starts only from the user's Play/BGM-on gesture. No downloaded samples.
*/
(() => {
  "use strict";
  const NativeContext=window.AudioContext||window.webkitAudioContext;
  const hasAudio=!!NativeContext;
  const TRACKS={
    akkeshi:{title:'グリーグ「朝」',composer:"Edvard Grieg",piece:"Morning Mood / Peer Gynt",length:48,tick:.238},
    temperate:{title:'サティ「ジムノペディ第1番」',composer:"Erik Satie",piece:"Gymnopédie No. 1",length:24,tick:.64},
    atlantic:{title:'ビゼー「カルメン：闘牛士の歌」',composer:"Georges Bizet",piece:"Toreador Song / Carmen",length:64,tick:.249}
  };
  const morning=[
    {mel:[71,68,66],chord:[52,56,59],bass:40},
    {mel:[64,66,68],chord:[52,56,59],bass:40},
    {mel:[71,68,66],chord:[52,56,59],bass:40},
    {mel:[64,66,68],chord:[52,56,59],bass:40},
    {mel:[71,68,71],chord:[52,56,59],bass:40},
    {mel:[73,68,71],chord:[57,61,64],bass:45},
    {mel:[73,71,68],chord:[59,63,66],bass:47},
    {mel:[66,64,64],chord:[52,56,59],bass:40}
  ];
  // Gymnopédie No. 1: F♯–A / G–F♯–C♯ / B–C♯–D / A (sustained).
  // The 3/4 bass/chord rocking pattern is adapted for 8-bit synthesis.
  const gymBars=[
    {mel:[[1,78,1],[2,81,1]],bass:43,chord:[55,59,62,66]},
    {mel:[[0,79,1],[1,78,1],[2,73,1]],bass:38,chord:[54,57,61,64]},
    {mel:[[0,71,1],[1,73,1],[2,74,1]],bass:43,chord:[55,59,62,66]},
    {mel:[[0,69,3]],bass:38,chord:[54,57,61,64]},
    {mel:[[0,66,3]],bass:43,chord:[55,59,62,66]},
    {mel:[[0,66,3]],bass:38,chord:[54,57,61,64]},
    {mel:[[1,78,1],[2,81,1]],bass:43,chord:[55,59,62,66]},
    {mel:[[0,79,1],[1,78,1],[2,73,1]],bass:38,chord:[54,57,61,64]}
  ];
  // Toreador refrain in F major, in a punchy march-like 4/4 chip setting.
  // Each event: [eighth-note offset, MIDI pitch, length in eighth-notes].
  const toreadorBars=[
    {mel:[[0,69,3],[3,69,1],[4,69,2],[6,72,2]],bass:41,chord:[53,57,60]},
    {mel:[[0,72,2],[2,69,2],[4,65,4]],bass:36,chord:[48,52,55,58]},
    {mel:[[0,67,3],[3,69,1],[4,70,2],[6,72,2]],bass:46,chord:[58,62,65]},
    {mel:[[0,69,2],[2,65,2],[4,65,4]],bass:41,chord:[53,57,60]},
    {mel:[[0,72,3],[3,72,1],[4,72,2],[6,74,2]],bass:41,chord:[53,57,60]},
    {mel:[[0,76,2],[2,74,2],[4,72,4]],bass:36,chord:[48,52,55,58]},
    {mel:[[0,70,3],[3,69,1],[4,67,2],[6,65,2]],bass:46,chord:[58,62,65]},
    {mel:[[0,67,2],[2,64,2],[4,65,4]],bass:41,chord:[53,57,60]}
  ];
  let context=null,bus=null,timer=null,step=0,nextStep=0,playing=false,volume=.26,region="akkeshi";
  const midiHz=n=>440*Math.pow(2,(n-69)/12);
  function note(pitch,at,duration,voice,velocity=1,mode="akkeshi"){
    if(!context||!bus||!playing)return;
    const osc=context.createOscillator(),env=context.createGain();
    osc.type=voice==="bass"?"triangle":mode==="temperate"&&voice==="melody"?"sine":"square";
    osc.frequency.setValueAtTime(midiHz(pitch),at);
    const base=voice==="melody"?.105:voice==="bass"?.060:mode==="atlantic"?.033:.025;
    const peak=Math.max(.0002,base*velocity);
    const attack=mode==="temperate"?.027:.009;
    const release=mode==="temperate"?Math.min(.28,duration*.32):Math.min(.12,duration*.28);
    const end=at+Math.max(.045,duration);
    env.gain.setValueAtTime(.0001,at);
    env.gain.linearRampToValueAtTime(peak,Math.min(end-.015,at+attack));
    env.gain.setValueAtTime(peak,Math.max(at+attack,end-release));
    env.gain.exponentialRampToValueAtTime(.0001,end);
    osc.connect(env);env.connect(bus);
    osc.start(at);osc.stop(end+.025);
    osc.onended=()=>{try{osc.disconnect();env.disconnect();}catch(_){}};
  }
  function scheduleMorning(i,at){
    const bar=morning[Math.floor(i/6)%morning.length],unit=i%6;
    if(unit%2===0){
      const lower=(Math.floor(i/6)%8>=4&&Math.floor(i/6)%8<=5)?-12:0;
      note(bar.mel[unit/2]+lower,at,TRACKS.akkeshi.tick*1.85,"melody");
    }
    if(unit===0)note(bar.bass,at,TRACKS.akkeshi.tick*5.65,"bass",.67);
    note(bar.chord[unit%3],at,TRACKS.akkeshi.tick*.75,"arp",unit===0?.80:.59);
  }
  function scheduleGym(i,at){
    const bar=gymBars[Math.floor(i/3)%gymBars.length],beat=i%3,quarter=TRACKS.temperate.tick;
    if(beat===0)note(bar.bass,at,quarter*2.65,"bass",.56,"temperate");
    if(beat===1)for(const n of bar.chord.slice(0,3))note(n,at,quarter*1.65,"arp",.33,"temperate");
    for(const [offset,pitch,count] of bar.mel){
      if(offset===beat)note(pitch-12,at,quarter*(count-.12),"melody",.91,"temperate");
    }
  }
  function scheduleToreador(i,at){
    const bar=toreadorBars[Math.floor(i/8)%toreadorBars.length],unit=i%8,e=TRACKS.atlantic.tick;
    if(unit===0)note(bar.bass,at,e*7.6,"bass",.84,"atlantic");
    if(unit%2===0){
      const chordNote=bar.chord[(unit/2)%3];
      note(chordNote,at,e*.75,"arp",unit===0?.78:.54,"atlantic");
    }
    if(unit===4)note(bar.bass+7,at,e*2.5,"bass",.48,"atlantic");
    for(const [start,pitch,beats] of bar.mel){
      if(start===unit)note(pitch,at,e*(beats-.13),"melody",1,"atlantic");
    }
  }
  function pump(){
    if(!playing||!context)return;
    const track=TRACKS[region],horizon=context.currentTime+.32;
    while(nextStep<horizon){
      const n=step%track.length;
      if(region==="temperate")scheduleGym(n,nextStep);
      else if(region==="atlantic")scheduleToreador(n,nextStep);
      else scheduleMorning(n,nextStep);
      step++;nextStep+=track.tick;
    }
  }
  function setVolume(v){
    volume=Math.max(0,Math.min(1,Number(v)||0));
    if(bus&&context)bus.gain.setTargetAtTime(volume,context.currentTime,.035);
  }
  function start(nextRegion="akkeshi"){
    if(!hasAudio)return false;
    stop();
    region=Object.prototype.hasOwnProperty.call(TRACKS,nextRegion)?nextRegion:"akkeshi";
    try{
      context ||=new NativeContext();
      if(context.state!=="running")context.resume().catch(()=>{});
      bus=context.createGain();bus.gain.value=volume;bus.connect(context.destination);
      step=0;nextStep=context.currentTime+.08;playing=true;
      pump();timer=window.setInterval(pump,55);
      return true;
    }catch(_){stop();return false;}
  }
  function stop(){
    playing=false;
    if(timer!==null){window.clearInterval(timer);timer=null;}
    if(bus&&context){
      const old=bus;bus=null;
      try{
        old.gain.cancelScheduledValues(context.currentTime);
        old.gain.setTargetAtTime(.0001,context.currentTime,.025);
        window.setTimeout(()=>{try{old.disconnect();}catch(_){}},190);
      }catch(_){}
    }
  }
  window.AmphipodMusic={
    start,stop,setVolume,supported:hasAudio,isPlaying:()=>playing,
    currentTrack:()=>region,tracks:TRACKS
  };
})();
