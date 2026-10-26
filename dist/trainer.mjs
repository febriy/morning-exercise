// Audio is unlocked by Start/Resume. Missing browser APIs never block the timer.
export function createTrainer(host=window) {
  let context=null, ready=Promise.resolve(), generation=0, enabled=false;
  let lastSecond=null, utterance=null, voice=null, cue=0, decoded=null;
  let prepared=Promise.resolve();
  let session=null, previousSessionType=null, finishing=false, pendingVoice=false, pendingBell=false;
  let announcement=false;
  const tones=new Set();
  const speech=host.speechSynthesis;
  const clips=new Map([['Get ready','ready'],['Start','start'],['Rest','rest'],['Workout complete','complete'],...['5','4','3','2','1'].map(n=>[n,n])]);
  for(const [id,title] of Object.entries({'platform-pushup':'Platform push-ups','hanging-knee-raise':'Knee raises','bar-hang':'Pull-up bar hang','support-hold':'Parallel-bar hold','squat':'Squats','jumping-jacks':'Jumping jacks','kettlebell-squat':'Kettlebell squats','incline-pushup':'Incline push-ups','kettlebell-swing':'Kettlebell swings'}))clips.set(`Next exercise. ${title}.`,`next-${id}`);
  const files=new Map(),buffers=new Map();
  // Prefetch tiny same-origin clips without playing anything or using a voice service.
  const downloads=host.fetch?Promise.all([...clips].map(async([text,file])=>{
    try{const response=await host.fetch(new URL(`./audio/${file}.m4a`,import.meta.url));if(response.ok)files.set(text,await response.arrayBuffer());}catch{}
  })):Promise.resolve();
  function playbackSession(){
    try{
      const available=host.navigator?.audioSession;
      if(!available)return;
      if(!session){session=available;previousSessionType=session.type;}
      // Safari otherwise treats Web Audio as ambient sound, muted by Silent Mode.
      session.type='playback';
    }catch{} // Other browsers and older iOS versions can omit or reject this API.
  }
  function releaseSession(){
    try{if(session?.type==='playback')session.type=previousSessionType??'auto';}catch{}
    session=null;previousSessionType=null;
  }
  function releaseWhenFinished(){
    if(finishing&&!pendingVoice&&!pendingBell&&!voice&&!utterance&&!tones.size){finishing=false;releaseSession();}
  }
  function stopVoice(){
    cue++;
    pendingVoice=false;
    try{speech?.cancel();}catch{}
    utterance=null;
    if(voice){try{voice.source.stop();voice.source.disconnect();voice.gain.disconnect();}catch{}voice=null;}
  }

  function silence(){
    generation++;
    announcement=false;
    finishing=false;pendingBell=false;
    stopVoice();
    for(const tone of tones){try{tone.stop();tone.disconnect();}catch{}}
    tones.clear();
  }
  function unlock(){
    enabled=true;
    playbackSession();
    try{
      const Audio=host.AudioContext||host.webkitAudioContext;
      if(Audio){
        context??=new Audio();
        ready=Promise.resolve(context.resume()).catch(()=>{});
        if(host.fetch&&!decoded)decoded=downloads.then(()=>Promise.all([...files].map(async([text,bytes])=>{
          try{buffers.set(text,await context.decodeAudioData(bytes.slice(0)));}catch{}
        })));
        prepared=decoded||Promise.resolve();
      }
    }catch{context=null;ready=Promise.resolve();}
  }
  function browserVoice(text){
    if(!speech||!host.SpeechSynthesisUtterance)return;
    try{
      utterance=new host.SpeechSynthesisUtterance(String(text));
      utterance.lang='en-SG';
      utterance.rate=/^[1-5]$/.test(String(text))?1.15:1.05;
      utterance.volume=.95;
      const voices=speech.getVoices().filter(v=>/^en\b/i.test(v.lang)&&v.localService!==false);
      const selected=voices.find(v=>/^en-SG$/i.test(v.lang))||voices.find(v=>/^en-(GB|US)$/i.test(v.lang))||voices[0];
      if(selected)utterance.voice=selected;
      const current=utterance;
      current.onend=current.onerror=()=>{if(utterance===current)utterance=null;releaseWhenFinished();};
      speech.speak(utterance);
    }catch{utterance=null;}
  }
  function say(text){
    if(!enabled)return;
    stopVoice();
    const expected=cue;
    pendingVoice=true;
    const play=()=>{
      if(!enabled||expected!==cue)return;
      pendingVoice=false;
      const buffer=buffers.get(String(text));
      if(buffer&&context?.state==='running'){
        try{
          const source=context.createBufferSource(),gain=context.createGain();
          source.buffer=buffer;gain.gain.value=.95;source.connect(gain);gain.connect(context.destination);
          const current={source,gain};voice=current;
          source.onended=()=>{source.disconnect();gain.disconnect();if(voice===current)voice=null;releaseWhenFinished();};
          source.start();return;
        }catch{}
      }
      browserVoice(text);
      releaseWhenFinished();
    };
    if(buffers.has(String(text))||!host.fetch||!context)play();
    else void Promise.all([ready,prepared]).then(play);
  }
  function ring(ending=false){
    const expected=generation;
    pendingBell=true;
    const play=()=>{
      if(!enabled||expected!==generation)return;
      pendingBell=false;
      if(context?.state!=='running'){releaseWhenFinished();return;}
      try{
        const at=context.currentTime,base=ending?660:880;
        // A quick strike and differently decaying partials give a soft bell, not a beep.
        for(const [ratio,volume,decay] of [[1,.12,.75],[2.4,.035,.45],[4.1,.012,.22]]){
          const tone=context.createOscillator(),gain=context.createGain();
          tone.type='sine';tone.frequency.value=base*ratio;
          gain.gain.setValueAtTime(.0001,at);
          gain.gain.exponentialRampToValueAtTime(volume,at+.008);
          gain.gain.exponentialRampToValueAtTime(.0001,at+decay);
          tone.connect(gain);gain.connect(context.destination);
          tones.add(tone);
          tone.onended=()=>{tones.delete(tone);tone.disconnect();gain.disconnect();releaseWhenFinished();};
          tone.start(at);tone.stop(at+decay+.02);
        }
      }catch{}
      releaseWhenFinished();
    };
    if(context?.state==='running')play();else void ready.then(play);
  }
  function begin(step,remaining=step.seconds,nextMovement=null){
    if(!enabled)return;
    silence();
    lastSecond=Math.max(0,Math.ceil(remaining-.001));
    ring();
    announcement=!!nextMovement&&(step.kind==='prepare'||step.kind==='rest');
    say(announcement?`Next exercise. ${nextMovement.title}.`:step.kind==='prepare'?'Get ready':step.kind==='rest'?'Rest':'Start');
  }
  function countdown(remaining){
    if(!enabled)return;
    const second=Math.max(0,Math.ceil(remaining-.001));
    if(second===lastSecond)return;
    lastSecond=second;
    // Let the full exercise name finish; skip expired counts rather than queueing them.
    if(announcement){if(pendingVoice||voice||utterance)return;announcement=false;}
    // Never queue missed numbers, zero, or a countdown over the opening cue.
    if(second>=1&&second<=5)say(String(second));
  }
  function stop(){enabled=false;lastSecond=null;silence();releaseSession();}
  function complete(){
    if(!enabled)return;
    silence();lastSecond=null;
    ring(true);say('Workout complete');
    finishing=true;releaseWhenFinished();
  }
  return {unlock,begin,countdown,stop,complete};
}
