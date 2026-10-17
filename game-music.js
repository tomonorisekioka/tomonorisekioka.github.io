/* WebAudio 8-bit synthesizer for three extended classical game arrangements.
   Composition sources: public-domain Grieg, Satie and Bizet scores.
   The Toreador theme is the real "Toréador en garde!" refrain as printed in
   Bizet's Carmen Prelude (Mutopia piano transcription by Alex O'S, CC BY-SA 2.5).
   The separate game-music-data.js contains the transcribed/arranged notes.
   The music is synthesized in-browser; there are no sampled recordings.
*/
(() => {
  "use strict";
  const NativeContext=window.AudioContext||window.webkitAudioContext;
  const scores=window.AmphipodScores||{};
  const hasAudio=!!NativeContext && Object.keys(scores).length===3;
  const tracks=Object.fromEntries(Object.entries(scores).map(([id,s])=>
    [id,{title:s.name,composer:s.author,piece:s.short,duration:s.seconds}]));
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
    const peak=Math.max(.0001,(voice===0?(gym?.077:.087):voice===1?.07:voice===3?.023:march?.019:.016)*vel);
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
  function start(nextRegion="akkeshi"){
    if(!hasAudio)return false;
    stop();
    region=Object.prototype.hasOwnProperty.call(scores,nextRegion)?nextRegion:"akkeshi";
    try{
      context ||=new NativeContext();
      if(context.state!=="running")context.resume().catch(()=>{});
      bus=context.createGain();bus.gain.value=volume;bus.connect(context.destination);
      eventIndex=0;startTime=context.currentTime+.075;playing=true;
      pump();timer=window.setInterval(pump,70);
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
        window.setTimeout(()=>{try{old.disconnect();}catch(_){}},220);
      }catch(_){}
    }
  }
  window.AmphipodMusic={
    start,stop,setVolume,supported:hasAudio,isPlaying:()=>playing,
    currentTrack:()=>region,tracks,position,seconds
  };
})();
