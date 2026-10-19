/* 8-bit Web Audio synthesizer, without any sampled/third-party recording.
   Composer works: Grieg, Satie, Bizet (public domain under Japanese law).
   Score-data origins, including rights not yet fully established, are
   documented in MUSIC_SOURCES.md and game-music-data.js.
   Bizet's Toreador source is now the 22-track PDMX/MuseScore MIDI,
   credited in game-carmen-pdmx.js. Source license reported as CC0 by
   mirror; PDMX internal license-conflict flag is still unverified.
*/
(() => {
  "use strict";
  const NativeContext=window.AudioContext||window.webkitAudioContext;
  const scores=window.AmphipodScores||{};
  const hasAudio=!!NativeContext && Object.keys(scores).length===3;
  const tracks=Object.fromEntries(Object.entries(scores).map(([id,s])=>
    [id,{title:s.name,composer:s.author,piece:s.short,duration:s.seconds,chorusAt:s.chorusAt||null}]));
  let context=null,bus=null,timer=null,playing=false,volume=.26,
      region="akkeshi",eventIndex=0,startTime=0;
  const pitchHz=p=>440*Math.pow(2,(p-69)/12);
  function note(event,at,secPerBeat){
    const [beat,duration,pitch,voice,vel]=event;
    if(!bus||!context||!playing)return;
    const oscillator=context.createOscillator(),env=context.createGain();
    const gym=region==="temperate",march=region==="atlantic";
    oscillator.type=voice===1?"triangle":gym&&voice===0?"sine":voice===3?"triangle":"square";
    oscillator.frequency.setValueAtTime(pitchHz(pitch),at);
    const peak=Math.max(.0001,(voice===0?(gym?.077:.087):voice===1?.07:voice===3?.023:gym?.026:march?.019:.016)*vel);
    const span=Math.max(.055,Math.min(8,duration*secPerBeat*.93));
    const attack=gym?.023:.009,release=Math.min(gym?.24:.12,span*.33);
    const end=at+span;
    env.gain.setValueAtTime(.0001,at);
    env.gain.linearRampToValueAtTime(peak,at+attack);
    env.gain.setValueAtTime(peak,Math.max(at+attack,end-release));
    env.gain.exponentialRampToValueAtTime(.0001,end);
    oscillator.connect(env);env.connect(bus);
    oscillator.start(at);oscillator.stop(end+.025);
    oscillator.onended=()=>{try{oscillator.disconnect();env.disconnect();}catch(_){}};
  }
  function seconds(){return scores[region]?.seconds||0;}
  function position(){
    if(!context||!playing)return 0;
    return Math.min(seconds(),Math.max(0,context.currentTime-startTime));
  }
  function pump(){
    if(!playing||!context)return;
    const score=scores[region],lookahead=context.currentTime+1.2;
    while(eventIndex<score.events.length){
      const event=score.events[eventIndex],when=startTime+event[0]*score.beat;
      if(when>lookahead)break;
      // If the tab was background-throttled, skip attacks that already elapsed.
      if(when>=context.currentTime-.05)note(event,Math.max(when,context.currentTime+.003),score.beat);
      eventIndex++;
    }
    // Do not loop after eight bars: perform the complete 2–3 minute arrangement once.
    if(context.currentTime>=startTime+score.seconds+.15)stop();
  }
  function setVolume(v){
    volume=Math.max(0,Math.min(1,Number(v)||0));
    if(bus&&context)bus.gain.setTargetAtTime(volume,context.currentTime,.035);
  }
  function start(nextRegion="akkeshi",fromSeconds=0){
    if(!hasAudio)return false;
    stop();
    region=Object.prototype.hasOwnProperty.call(scores,nextRegion)?nextRegion:"akkeshi";
    try{
      context ||=new NativeContext();
      if(context.state!=="running")context.resume().catch(()=>{});
      const score=scores[region];
      const offset=Math.max(0,Math.min(score.seconds-1,Number(fromSeconds)||0));
      bus=context.createGain();bus.gain.value=volume;bus.connect(context.destination);
      eventIndex=0;
      // Locate the first event on or after the requested score position.
      while(eventIndex<score.events.length && score.events[eventIndex][0]*score.beat<offset-.03)eventIndex++;
      startTime=context.currentTime+.075-offset;playing=true;
      pump();timer=window.setInterval(pump,70);
      return true;
    }catch(_){stop();return false;}
  }
  // Unblock Web Audio on the user's start gesture even when BGM is turned off.
  // Catch SFX uses its own envelope, independent of BGM gain and playback.
  function unlock(){
    if(!NativeContext)return false;
    try{
      context ||= new NativeContext();
      if(context.state!=="running")context.resume().catch(()=>{});
      return true;
    }catch(_){return false;}
  }
  function playCatch(){
    if(!unlock())return;
    // Two short, gentle arcade chimes. No recording or external sound asset.
    try{
      const at=context.currentTime+.006;
      for(const [offset,hz,span,peak] of [
        [0,784,.085,.055],
        [.07,1046.5,.15,.064]
      ]){
        const osc=context.createOscillator();
        const env=context.createGain();
        const startAt=at+offset;
        osc.type="triangle";
        osc.frequency.setValueAtTime(hz,startAt);
        env.gain.setValueAtTime(.0001,startAt);
        env.gain.linearRampToValueAtTime(peak,startAt+.006);
        env.gain.exponentialRampToValueAtTime(.0001,startAt+span);
        osc.connect(env);env.connect(context.destination);
        osc.start(startAt);osc.stop(startAt+span+.015);
        osc.onended=()=>{try{osc.disconnect();env.disconnect();}catch(_){}};
      }
    }catch(_){/* Audio is optional; never break the catch flow. */}
  }
  function stop(){
    playing=false;
    if(timer!==null){window.clearInterval(timer);timer=null;}
    if(bus&&context){
      const old=bus;bus=null;
      try{
        old.gain.cancelScheduledValues(context.currentTime);
        old.gain.setTargetAtTime(.0001,context.currentTime,.025);
        window.setTimeout(()=>{try{old.disconnect();}catch(_){}},220);
      }catch(_){}
    }
  }
  window.AmphipodMusic={
    start,stop,setVolume,unlock,playCatch,supported:hasAudio,isPlaying:()=>playing,
    currentTrack:()=>region,tracks,position,seconds
  };
})();
