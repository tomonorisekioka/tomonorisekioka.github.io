/* 8-bit Morning Mood — an original synth rendering of the opening theme
   of Edvard Grieg's Peer Gynt, Op. 46 no. 1 (public-domain composition).
   No sampled recording, commercial MIDI, or third-party audio asset is used.
   Oscillators are created only following a user gesture (Play or BGM On).
*/
(() => {
  "use strict";
  const NativeContext=window.AudioContext||window.webkitAudioContext;
  const hasAudio=!!NativeContext;
  const eighth=.238; // gentle 6/8, three pairs per measure
  // The well-known E-major opening call B–G♯–F♯ / E–F♯–G♯,
  // answered at different registers with a chiptune-style accompaniment.
  const bars=[
    {mel:[71,68,66],chord:[52,56,59],bass:40},
    {mel:[64,66,68],chord:[52,56,59],bass:40},
    {mel:[71,68,66],chord:[52,56,59],bass:40},
    {mel:[64,66,68],chord:[52,56,59],bass:40},
    {mel:[71,68,71],chord:[52,56,59],bass:40},
    {mel:[73,68,71],chord:[57,61,64],bass:45},
    {mel:[73,71,68],chord:[59,63,66],bass:47},
    {mel:[66,64,64],chord:[52,56,59],bass:40}
  ];
  let context=null,bus=null,timer=null,tick=0,nextTick=0,playing=false,volume=.26;
  const midiHz=n=>440*Math.pow(2,(n-69)/12);
  function note(midi,at,duration,voice,velocity=1) {
    if(!context||!bus||!playing)return;
    const osc=context.createOscillator(),gain=context.createGain();
    osc.type=voice==="bass"?"triangle":"square";
    osc.frequency.setValueAtTime(midiHz(midi),at);
    const max=voice==="melody"?.105:voice==="bass"?.068:.026;
    const peak=max*velocity;
    const attack=voice==="melody"?.015:.009;
    const release=Math.min(.12,duration*.28);
    const end=at+duration;
    gain.gain.setValueAtTime(.0001,at);
    gain.gain.linearRampToValueAtTime(peak,at+attack);
    gain.gain.setValueAtTime(peak,Math.max(at+attack,end-release));
    gain.gain.exponentialRampToValueAtTime(.0001,end);
    osc.connect(gain);gain.connect(bus);
    osc.start(at);osc.stop(end+.02);
    osc.onended=()=>{osc.disconnect();gain.disconnect();};
  }
  function scheduleTick(t,at){
    const bar=bars[Math.floor(t/6)%bars.length],unit=t%6;
    if(unit%2===0){
      const melody=bar.mel[unit/2];
      const lowerAnswer=Math.floor(t/6)%8>=4 && Math.floor(t/6)%8<=5 ? -12:0;
      note(melody+lowerAnswer,at,eighth*1.86,"melody",1);
    }
    if(unit===0)note(bar.bass,at,eighth*5.65,"bass",.67);
    note(bar.chord[unit%3],at,eighth*.75,"arp",unit===0?.8:.59);
  }
  function pump(){
    if(!playing||!context)return;
    const horizon=context.currentTime+.35;
    while(nextTick<horizon){
      scheduleTick(tick,nextTick);
      tick++;nextTick+=eighth;
    }
  }
  function setVolume(v){
    volume=Math.max(0,Math.min(1,Number(v)||0));
    if(bus&&context)bus.gain.setTargetAtTime(volume,context.currentTime,.035);
  }
  function start(){
    if(!hasAudio)return false;
    stop();
    try {
      context ||= new NativeContext();
      if(context.state!=="running")context.resume().catch(()=>{});
      bus=context.createGain();
      bus.gain.value=volume;bus.connect(context.destination);
      tick=0;nextTick=context.currentTime+.08;playing=true;
      pump();
      timer=window.setInterval(pump,55);
      return true;
    }catch(_){stop();return false;}
  }
  function stop(){
    playing=false;
    if(timer!==null){window.clearInterval(timer);timer=null;}
    if(bus&&context){
      const old=bus;bus=null;
      try {
        old.gain.cancelScheduledValues(context.currentTime);
        old.gain.setTargetAtTime(.0001,context.currentTime,.035);
        window.setTimeout(()=>old.disconnect(),250);
      } catch(_){}
    }
  }
  window.AmphipodMusic={start,stop,setVolume,supported:hasAudio,isPlaying:()=>playing};
})();
