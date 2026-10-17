/* Public-domain compositions; game-specific chiptune scores.
  The Gymnopédie melody follows Mutopia's public-domain transcription of Satie's score
  (https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=37).
  Toreador refrain follows Bizet's original Prelude score (Schirmer 1895), as reproduced
  in Mutopia's Carmen Prelude (Alex O'S, CC BY-SA 2.5):
  https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=635
  The soundtrack is newly synthesized; no existing audio recording or MIDI recording used.
  Score arrangements are abbreviated/varied game editions, not verbatim orchestration.
*/
(() => {
  "use strict";
  // Events: [beat-position, beat-duration, MIDI pitch, voice, velocity].
  // v0 melody, v1 low bass, v2 accompaniment, v3 upper harmonies.
  const make=()=>[];
  function put(out,at,dur,pitch,voice=0,vel=1){
    if(Number.isFinite(pitch)&&dur>0)out.push([+at.toFixed(3),+dur.toFixed(3),pitch,voice,vel]);
  }
  function melodyBar(out,bar,barLen,notes){
    for(const [offset,dur,midi] of notes)put(out,bar*barLen+offset,dur,midi,0,1);
  }
  // Morning Mood: opening pastoral flute/oboe phrase in E major, fuller
  // secondary ascent, thematic return and a held cadence.
  function morning(){
    const out=make(),bar=6,base=[
      [[0,2,71],[2,2,68],[4,2,66]],[[0,2,64],[2,2,66],[4,2,68]],
      [[0,2,71],[2,2,68],[4,2,66]],[[0,2,64],[2,2,66],[4,2,68]],
      [[0,2,71],[2,2,73],[4,2,76]],[[0,2,73],[2,2,71],[4,2,68]],
      [[0,2,66],[2,2,68],[4,2,71]],[[0,6,76]]
    ];
    const climb=[
      [[0,2,68],[2,2,71],[4,2,73]],[[0,2,76],[2,2,73],[4,2,71]],
      [[0,2,69],[2,2,71],[4,2,73]],[[0,2,76],[2,2,78],[4,2,80]],
      [[0,2,81],[2,2,80],[4,2,78]],[[0,2,76],[2,2,73],[4,2,71]],
      [[0,2,69],[2,2,68],[4,2,66]],[[0,6,64]]
    ];
    const phrase=[...base,...base.map((row)=>row.map(([t,d,p])=>[t,d,p+0])),...climb,...climb.map((row,i)=>row.map(([t,d,p])=>[t,d,p+(i<4?0:-12)])),...base,
      ...base.map((row,i)=>row.map(([t,d,p])=>[t,d,p+(i%2===0?12:0)])),...climb,...base];
    // 64 measures; changes of register prevent the first 8 bars from looping.
    for(let b=0;b<phrase.length;b++){
      melodyBar(out,b,bar,phrase[b]);
      const chordSets=[
        [52,56,59,64],[57,61,64,69],[59,63,66,71],[52,56,59,64],
        [57,61,64,69],[59,63,66,71],[52,56,59,64],[52,56,59,64]
      ];
      const chord=chordSets[b%8],root=chord[0]-12;
      put(out,b*bar,5.8,root,1,.6);
      for(let j=0;j<6;j++){
        const note=chord[(j===0||j===3)?0:(j===1||j===4)?1:2];
        put(out,b*bar+j,.8,note,2,.3);
      }
      if((b%8===7||b%8===3)&&b>15)put(out,b*bar,5.6,chord[3],3,.18);
    }
    // 8-bar cadence; no hard reset after the first familiar phrase.
    for(let b=0;b<8;b++){
      const idx=phrase.length+b;
      const seq=b<4?base[b]:b<7?base[5+(b-4)]:[[0,6,64]];
      melodyBar(out,idx,bar,seq);
      put(out,idx*bar,5.8,b<4?40:40,1,.56);
      [52,56,59].forEach((p,i)=>put(out,idx*bar+(i+1)*1.25,1.5,p,2,.31));
    }
    return {id:"akkeshi",name:"グリーグ「朝」",short:"Morning Mood",author:"Edvard Grieg",
      beat:.31,beats:(phrase.length+8)*bar,events:out};
  }
  // Satie: 31-bar body performed twice with the actual two differing endings
  // found in the score, rather than the old invented 8-measure loop.
  function gymnopedie(){
    const out=make(),bar=3;
    const empty=[];
    const body=[
      empty,empty,empty,empty,
      [[1,1,78],[2,1,81]],
      [[0,1,79],[1,1,78],[2,1,73]],
      [[0,1,71],[1,1,73],[2,1,74]],
      [[0,3,69]],
      [[0,3,66]],[[0,3,66]],[[0,3,66]],[[0,3,66]],
      [[1,1,78],[2,1,81]],
      [[0,1,79],[1,1,78],[2,1,73]],
      [[0,1,71],[1,1,73],[2,1,74]],
      [[0,3,69]],
      [[0,3,73]],[[0,3,78]],
      [[0,3,64]],[[0,3,64]],[[0,3,64]],
      [[0,1,69],[1,1,71],[2,1,72]],
      [[0,1,76],[1,1,74],[2,1,71]],
      [[0,1,74],[1,1,72],[2,1,71]],
      [[0,3,74]],[[0,3,74]],
      [[0,1,76],[1,1,77],[2,1,79]],
      [[0,1,81],[1,1,72],[2,1,74]],
      [[0,1,76],[1,1,74],[2,1,71]],
      [[0,3,74]],[[0,3,74]]
    ];
    const firstEnd=[
      [[0,3,79]],[[0,3,78]],[[0,1,71],[1,1,69],[2,1,71]],
      [[0,1,73],[1,1,74],[2,1,76]],[[0,1,73],[1,1,74],[2,1,76]],
      [[0,3,66]],[[0,3,72]],[[0,3,74]]
    ];
    const secondEnd=[
      [[0,3,79]],[[0,3,77]],[[0,1,71],[1,1,72],[2,1,77]],
      [[0,1,76],[1,1,74],[2,1,72]],[[0,1,76],[1,1,74],[2,1,72]],
      [[0,3,65]],[[0,3,72]],[[0,3,74]]
    ];
    const bassBase=[43,38,43,38,43,38,43,38,43,38,43,38,43,38,43,38,
      42,35,40,40,38,33,38,38,38,38,38,38,38,38,38];
    function chordFor(b,ending=false){
      if(ending)return b%2? [54,57,61]:[55,59,62];
      if(b<16)return b%2?[57,61,66]:[59,62,66];
      if(b===16)return [54,57,61];
      if(b===17)return [59,62,66];
      if(b>=18&&b<=20)return [52,55,59];
      return b%2?[53,57,60]:[50,54,57];
    }
    let which=0;
    for(const ending of [firstEnd,secondEnd]){
      for(let b=0;b<39;b++,which++){
        const notes=b<31?body[b]:ending[b-31];
        melodyBar(out,which,bar,notes);
        const bass=b<31?bassBase[b]:b%2?42:40;
        const chord=chordFor(b,b>=31);
        put(out,which*bar,2.88,bass,1,.59);
        chord.forEach(n=>put(out,which*bar+1,1.82,n,2,.34));
      }
    }
    return {id:"temperate",name:"サティ「ジムノペディ第1番」",short:"Gymnopédie No. 1",author:"Erik Satie",
      beat:.76,beats:78*bar,events:out};
  }
  // The distinctive F-major Toreador refrain is transcribed from the original
  // Carmen Prelude piano score: C4 D8. C16 | A4 A4 | A8. G16 A8. Bb16...
  // Sections interleave with a festive instrumental response and reprise.
  function toreador(){
    const out=make(),bar=4;
    const refrain=[
      [[0,2,72],[2,1.5,74],[3.5,.5,72]],
      [[0,2,69],[2,2,69]],
      [[0,1.5,69],[1.5,.5,67],[2,1.5,69],[3.5,.5,70]],
      [[0,3,69]],
      [[0,2,70],[2,1.5,67],[3.5,.5,72]],
      [[0,3,69]],
      [[0,2,65],[2,1.5,62],[3.5,.5,67]],
      [[0,3,60]],
      [[0,4,67]],
      [[0,1,67],[1,1,74],[2,1,72],[3,1,70]],
      [[0,1,69],[1,1,67],[2,1,69],[3,1,70]],
      [[0,3,69]],
      [[0,2,64],[2,2,69]],
      [[0,2,69],[2,1.5,68],[3.5,.5,71]],
      [[0,4,76]],[[0,4,76]],
      [[0,.8,76],[.8,.4,74],[1.2,.4,76],[1.6,.4,74],[2,1,72],[3,1,74]],
      [[0,1,67],[1,1,69],[2,2,70]],
      [[0,.75,70],[.75,.42,69],[1.17,.42,70],[1.6,.4,69],[2,1,65],[3,1,74]],
      [[0,3,72]],
      [[0,.6,65],[.6,.6,67],[1.2,.8,65],[2,1,60],[3,1,70]],
      [[0,4,69]]
    ];
    const march=[
      [[0,.5,77],[.5,.5,77],[1,1,77],[2,.5,72],[2.5,.5,70],[3,1,72]],
      [[0,1.5,77],[1.5,.5,77],[2,1,79],[3,1,81]],
      [[0,1,77],[1,1,76],[2,1,74],[3,1,72]],
      [[0,4,79]],
      [[0,.5,81],[.5,.5,81],[1,1,81],[2,.5,76],[2.5,.5,74],[3,1,76]],
      [[0,1.5,81],[1.5,.5,81],[2,1,82],[3,1,84]],
      [[0,1,81],[1,1,79],[2,1,77],[3,1,76]],
      [[0,4,77]]
    ];
    const prog=[
      [[53,57,60],41],[[48,52,55,58],36],[[53,57,60],41],[[53,57,60],41],
      [[58,62,65],46],[[53,57,60],41],[[53,57,60],41],[[48,52,55,58],36],
      [[48,52,55,58],36],[[48,52,55,58],36],[[53,57,60],41],[[53,57,60],41],
      [[57,61,64],45],[[57,61,64],45],[[57,61,64],45],[[57,61,64],45],
      [[58,62,65],46],[[58,62,65],46],[[53,57,60],41],[[53,57,60],41],
      [[48,52,55,58],36],[[53,57,60],41]
    ];
    function arrange(notes,idx,chord,bass,soft=false){
      melodyBar(out,idx,bar,notes);
      const at=idx*bar;
      put(out,at,3.8,bass,1,soft?.45:.8);
      put(out,at+2,1.8,bass+7,1,soft?.25:.42);
      for(let beat=0;beat<4;beat++){
        const pitch=chord[beat%chord.length];
        put(out,at+beat,.6,pitch,2,soft?.28:.47);
      }
    }
    let measure=0;
    // Immediate, correct recognizable refrain: no twenty-second wrong intro.
    for(let b=0;b<refrain.length;b++,measure++){
      const [chord,bass]=prog[b];arrange(refrain[b],measure,chord,bass,false);
    }
    // Instrumental interlude instead of an abrupt repeat at eight measures.
    for(let b=0;b<march.length*2;b++,measure++){
      const i=b%8,root=i<4?41:46;
      const chord=i<4?[53,57,60]:[58,62,65];
      arrange(march[i],measure,chord,root,b>=8);
    }
    // Return of Toreador refrain, a brief high register answer and final chord.
    for(let b=0;b<refrain.length;b++,measure++){
      const [chord,bass]=prog[b];
      const variation=b>=16&&b<20?refrain[b].map(([at,dur,p])=>[at,dur,p+12]):refrain[b];
      arrange(variation,measure,chord,bass,false);
    }
    for(let i=0;i<4;i++,measure++){
      const endMel=i===0?[[0,2,72],[2,2,74]]:i===1?[[0,2,76],[2,2,77]]:i===2?[[0,2,76],[2,2,72]]:[[0,4,77]];
      arrange(endMel,measure,[53,57,60],41,i<2);
    }
    return {id:"atlantic",name:"ビゼー「カルメン：闘牛士の歌」",short:"Toreador Song / Carmen",author:"Georges Bizet",
      beat:.48,beats:measure*bar,events:out};
  }
  const scores={akkeshi:morning(),temperate:gymnopedie(),atlantic:toreador()};
  for(const score of Object.values(scores)){
    score.events.sort((a,b)=>a[0]-b[0]);
    score.seconds=+(score.beats*score.beat).toFixed(2);
    Object.freeze(score.events);Object.freeze(score);
  }
  window.AmphipodScores=Object.freeze(scores);
})();
