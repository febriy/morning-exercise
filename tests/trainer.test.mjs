import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrainer} from '../dist/trainer.mjs';
import {mount} from './helpers/app.mjs';
import {readFile} from 'node:fs/promises';

function soundBrowser({suspended=false,clips=false,deferred=false,silentPhone=false}={}) {
  const spoken=[],tones=[],played=[],sources=[],requests=[],audible=[];let cancelled=0,resumeAudio,releaseFiles;
  // WebKit's default ambient Web Audio route obeys the iPhone Silent switch.
  // Playback routing is selected through navigator.audioSession before unlocking.
  const audioSession={type:'auto'};
  const output=value=>{if(!silentPhone||audioSession.type==='playback')audible.push(value);};
  const fileGate=deferred?new Promise(resolve=>releaseFiles=resolve):Promise.resolve();
  const contexts=[];
  class AudioContext {
    constructor(){this.state=suspended?'suspended':'running';this.currentTime=0;this.destination={};this.sessionAtCreation=audioSession.type;contexts.push(this);}
    resume(){if(!suspended)return Promise.resolve();return new Promise(resolve=>{resumeAudio=()=>{this.state='running';resolve();};});}
    decodeAudioData(bytes){return Promise.resolve({id:new Uint8Array(bytes)[0]});}
    createBufferSource(){const source={buffer:null,connect(){},disconnect(){},start(){played.push(this.buffer.id);output(this.buffer.id);},stop(){this.stopped=true;}};sources.push(source);return source;}
    createOscillator(){const tone={frequency:{value:0},started:false,stops:[],connect(){},disconnect(){},start(){this.started=true;output(this.frequency.value);},stop(at){this.stops.push(at);}};tones.push(tone);return tone;}
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  }
  const host={AudioContext,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},speechSynthesis:{
    cancel(){cancelled++;},getVoices(){return [{lang:'en-SG',localService:true,name:'English'}];},speak(u){spoken.push(u.text);u.onend?.();}
  }};
  if(silentPhone)host.navigator={audioSession};
  if(clips)host.fetch=async url=>{requests.push(String(url));await fileGate;const file=String(url).split('/').at(-1).replace('.m4a','');const id=['ready','start','rest','complete','5','4','3','2','1','next-platform-pushup','next-hanging-knee-raise','next-bar-hang','next-support-hold','next-squat','next-jumping-jacks','next-kettlebell-squat','next-incline-pushup','next-kettlebell-swing'].indexOf(file);return {ok:true,arrayBuffer:async()=>new Uint8Array([id]).buffer};};
  return {host,spoken,tones,contexts,played,sources,requests,audible,audioSession,release(){releaseFiles?.();},get cancelled(){return cancelled;},resume(){resumeAudio?.();}};
}

test('At home speaks prep, three starts, three rests and completion through the existing trainer',async()=>{
 const browser=soundBrowser(),app=await mount({host:browser.host});try{
  app.click('#session-home');app.click('#start');app.elapse(125);
  const cues=browser.spoken.filter(text=>!/^\d$/.test(text));
  assert.deepEqual(cues,['Next exercise. Kettlebell squats.','Start','Next exercise. Incline push-ups.','Start','Next exercise. Kettlebell swings.','Start','Rest','Workout complete']);
  assert.equal(browser.spoken.filter(text=>text==='5').length,6);
  assert.match(app.root.innerHTML,/At<br>home\./);
 }finally{app.restore();}
});

test('all movement names have bundled AAC announcements and play without system speech',async()=>{
 const ids=['platform-pushup','hanging-knee-raise','bar-hang','support-hold','squat','jumping-jacks','kettlebell-squat','incline-pushup','kettlebell-swing'];
 for(const id of ids){
  const bytes=await readFile(new URL(`../dist/audio/next-${id}.m4a`,import.meta.url));
  assert.equal(bytes.toString('ascii',4,8),'ftyp');assert.ok(bytes.length>2000);
 }
 const browser=soundBrowser({clips:true});delete browser.host.speechSynthesis;delete browser.host.SpeechSynthesisUtterance;
 const coach=createTrainer(browser.host);coach.unlock();coach.begin({kind:'rest',seconds:15},15,{id:'bar-hang',title:'Pull-up bar hang'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(browser.played,[11]);assert.deepEqual(browser.spoken,[]);
 coach.stop();
});

test('countdown never cuts off an exercise name and resumes with the current number after it ends',async()=>{
 const browser=soundBrowser({clips:true}),coach=createTrainer(browser.host);
 coach.unlock();coach.begin({kind:'prepare',seconds:5},5,{id:'squat',title:'Squats'});
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(browser.played,[13]);
 coach.countdown(4);coach.countdown(3);assert.deepEqual(browser.played,[13]);
 browser.sources.at(-1).onended();coach.countdown(2);coach.countdown(1);
 assert.deepEqual(browser.played,[13,7,8],'expired countdown numbers are skipped');
 coach.stop();
});

test('named cues follow edited movement order and stop when a paused or ended phase is abandoned',async()=>{
 const saved={'on-the-way.sessions.v1':JSON.stringify({version:2,morning:[{id:'prepare',seconds:5},{id:'kettlebell-swing',seconds:20},{id:'rest',seconds:15},{id:'incline-pushup',seconds:20}]})};
 const browser=soundBrowser(),app=await mount({saved,host:browser.host});try{
  app.click('#start');assert.equal(browser.spoken.at(-1),'Next exercise. Kettlebell swings.');
  app.elapse(25);assert.equal(browser.spoken.at(-1),'Next exercise. Incline push-ups.');
  app.click('#pause');const count=browser.spoken.length;app.elapse(20);assert.equal(browser.spoken.length,count);
  app.click('#pause');assert.equal(browser.spoken.at(-1),'Next exercise. Incline push-ups.');
  app.click('#stop');app.elapse(30);assert.equal(browser.spoken.filter(x=>x==='Workout complete').length,0);
 }finally{app.restore();}
});

test('iPhone Silent Mode uses a playback session so the actual Start tap produces audible bells and voice',async()=>{
  const browser=soundBrowser({silentPhone:true,clips:true}),app=await mount({host:browser.host});try{
    assert.equal(browser.audioSession.type,'auto','visiting the page must not take over audio');
    app.click('#start');
    await new Promise(resolve=>setImmediate(resolve));
    assert.ok(browser.audible.includes(880),'opening bell reaches the playback route in Silent Mode');
    assert.ok(browser.audible.includes(9),'Named preview voice reaches the playback route in Silent Mode');
    assert.equal(browser.contexts[0].sessionAtCreation,'playback','select route before opening audio');
    app.click('#pause');
    assert.equal(browser.audioSession.type,'auto','pausing releases the playback session');
    app.click('#pause');
    assert.equal(browser.audioSession.type,'playback','resuming selects playback again');
    app.visibility(true);
    assert.equal(browser.audioSession.type,'auto','backgrounding releases the playback session');
  }finally{app.restore();}
});

test('completion releases the iPhone playback session after both bell and voice finish',async()=>{
  const browser=soundBrowser({silentPhone:true,clips:true}),coach=createTrainer(browser.host);
  coach.unlock();coach.begin({kind:'prepare',seconds:20});
  await new Promise(resolve=>setImmediate(resolve));
  coach.complete();
  const lastVoice=browser.sources.at(-1),lastBell=browser.tones.slice(-3);
  assert.equal(browser.audioSession.type,'playback');
  lastVoice.onended();
  assert.equal(browser.audioSession.type,'playback','do not mute the ringing completion bell');
  for(const tone of lastBell)tone.onended();
  assert.equal(browser.audioSession.type,'auto');
});

test('slow completion clips keep playback routing until the voice finishes',async()=>{
  const browser=soundBrowser({silentPhone:true,clips:true,deferred:true}),coach=createTrainer(browser.host);
  coach.unlock();coach.complete();
  for(const tone of browser.tones)tone.onended();
  assert.equal(browser.audioSession.type,'playback','pending voice still needs playback routing');
  browser.release();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(browser.played,[3]);
  browser.sources.at(-1).onended();
  assert.equal(browser.audioSession.type,'auto');
});

test('an unavailable or read-only Audio Session API does not prevent ordinary playback',()=>{
  const browser=soundBrowser();
  browser.host.navigator={audioSession:{get type(){return 'auto';},set type(_){throw Error('unsupported');}}};
  const coach=createTrainer(browser.host);
  assert.doesNotThrow(()=>{coach.unlock();coach.begin({kind:'move',seconds:15});coach.stop();});
  assert.ok(browser.tones.some(x=>x.started));
});

test('bell and short trainer cues accompany preparation, exercise, rest and completion',()=>{
  const browser=soundBrowser(),coach=createTrainer(browser.host);
  coach.unlock();coach.begin({kind:'prepare',seconds:20});
  coach.begin({kind:'move',seconds:15});coach.begin({kind:'rest',seconds:25});coach.complete();
  assert.deepEqual(browser.spoken,['Get ready','Start','Rest','Workout complete']);
  assert.equal(browser.tones.length,12);assert.ok(browser.tones.every(x=>x.started));
  assert.equal(browser.tones[0].frequency.value,880);assert.equal(browser.tones.at(-3).frequency.value,660);
});

test('countdown is spoken once per second, without queuing missed numbers or zero',()=>{
  const browser=soundBrowser(),coach=createTrainer(browser.host);coach.unlock();coach.begin({kind:'move',seconds:15});
  for(const n of [15,5.1,5,4.9,4.2,4,3,2,1,.4,0])coach.countdown(n);
  assert.deepEqual(browser.spoken,['Start','5','4','3','2','1']);
  coach.begin({kind:'rest',seconds:20});coach.countdown(5);coach.countdown(2);
  assert.deepEqual(browser.spoken.slice(-3),['Rest','5','2']);
});

test('short holds and resuming a partial step preserve Start rather than overlapping it with a count',()=>{
  const browser=soundBrowser(),coach=createTrainer(browser.host);coach.unlock();coach.begin({kind:'hold',seconds:3});
  for(const n of [3,2.9,2,1,0])coach.countdown(n);
  assert.deepEqual(browser.spoken,['Start','2','1']);
  coach.stop();coach.unlock();coach.begin({kind:'hold',seconds:3},1.6);coach.countdown(1.6);coach.countdown(1);
  assert.deepEqual(browser.spoken.slice(-2),['Start','1']);
});

test('stop cancels speech, silences ringing bells and suppresses delayed unlock audio',async()=>{
  const browser=soundBrowser({suspended:true}),coach=createTrainer(browser.host);
  coach.unlock();coach.begin({kind:'move',seconds:15});coach.stop();
  const spoken=browser.spoken.length;coach.countdown(5);browser.resume();await Promise.resolve();await Promise.resolve();
  assert.equal(browser.tones.length,0);assert.equal(browser.spoken.length,spoken);assert.ok(browser.cancelled>0);
  const audible=soundBrowser(),second=createTrainer(audible.host);second.unlock();second.begin({kind:'move',seconds:15});second.stop();
  assert.ok(audible.tones.every(t=>t.stops.at(-1)===undefined));
});

test('missing or blocked audio and speech APIs never block a session',()=>{
  for(const host of [{},{AudioContext:class{constructor(){throw Error('blocked');}}},{SpeechSynthesisUtterance:class{},speechSynthesis:{cancel(){throw Error('blocked');}}}]){
    const coach=createTrainer(host);
    assert.doesNotThrow(()=>{coach.unlock();coach.begin({kind:'move',seconds:15});coach.countdown(5);coach.complete();coach.stop();});
  }
});

test('the real Morning workout speaks countdowns and cues at boundaries without replaying on every tick',async()=>{
  const browser=soundBrowser(),app=await mount({host:browser.host});try{
    app.click('#start');assert.deepEqual(browser.spoken,['Next exercise. Platform push-ups.']);
    app.elapse(8);assert.deepEqual(browser.spoken,['Next exercise. Platform push-ups.','5','4','3','2','1','Start']);
    app.elapse(24);assert.equal(browser.spoken.at(-1),'Next exercise. Knee raises.');
    app.elapse(128);assert.equal(browser.spoken.at(-1),'Workout complete');
    assert.match(app.root.innerHTML,/Your corner/);
    assert.match(app.root.innerHTML,/Start workout/);
    assert.equal(browser.spoken.filter(x=>x==='Workout complete').length,1);
    assert.equal(browser.tones.length,33); // Start, nine boundaries and completion: one bell each.
  }finally{app.restore();}
});

test('kids workout gives a five-second Get ready phase before movement and rest cues',async()=>{
 const browser=soundBrowser(),app=await mount({host:browser.host});try{
  app.click('#session-kids');app.click('#start');app.elapse(85);
  assert.deepEqual(browser.spoken,[
   'Next exercise. Jumping jacks.','4','3','2','1',
   'Start','5','4','3','2','1','Next exercise. Squats.','5','4','3','2','1',
   'Start','5','4','3','2','1','Rest','5','4','3','2','1','Workout complete'
  ]);
  assert.equal(browser.tones.length,18,'prep, four intervals and completion each ring once');
  assert.match(app.root.innerHTML,/Exercise<br>with kids/);
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('pause, guidance, hiding the page and ending stop cues; resume speaks only the current phase',async()=>{
  const browser=soundBrowser(),app=await mount({host:browser.host});try{
    app.click('#start');app.elapse(3);assert.equal(browser.spoken.at(-1),'5');
    app.click('#pause');const paused=browser.spoken.length;app.elapse(10);assert.equal(browser.spoken.length,paused);
    app.click('#pause');assert.equal(browser.spoken.at(-1),'Next exercise. Platform push-ups.');
    app.elapse(1);assert.equal(browser.spoken.at(-1),'4');
    const details=app.root.querySelector('details');details.ontoggle({currentTarget:{open:true}});
    const guided=browser.spoken.length;app.elapse(10);assert.equal(browser.spoken.length,guided);
    app.click('#pause');app.visibility(true);const hidden=browser.spoken.length;app.elapse(10);assert.equal(browser.spoken.length,hidden);
    app.visibility(false);app.click('#pause');app.click('#stop');const ended=browser.spoken.length;
    app.elapse(10);assert.equal(browser.spoken.length,ended);assert.ok(browser.cancelled>0);
  }finally{app.restore();}
});

test('a delayed tab or page navigation stops old cues rather than speaking a burst of stale countdowns',async()=>{
  const browser=soundBrowser(),app=await mount({host:browser.host});try{
    app.click('#start');app.elapse(15);const before=browser.spoken.length;
    app.jump(4);assert.equal(browser.spoken.length,before);assert.match(app.root.innerHTML,/Paused/);
    app.click('#pause');app.pagehide();const hidden=browser.spoken.length;
    app.elapse(10);assert.equal(browser.spoken.length,hidden);
  }finally{app.restore();}
});


test('bundled clips play through Web Audio without any system speech voices',async()=>{
  const browser=soundBrowser({clips:true});delete browser.host.speechSynthesis;delete browser.host.SpeechSynthesisUtterance;
  const coach=createTrainer(browser.host);coach.unlock();coach.begin({kind:'prepare',seconds:20});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(browser.requests.length,18);assert.ok(browser.requests.every(x=>x.endsWith('.m4a')));
  assert.deepEqual(browser.played,[0]);
  coach.begin({kind:'move',seconds:15});coach.countdown(5);coach.countdown(4);coach.countdown(3);coach.countdown(2);coach.countdown(1);
  coach.begin({kind:'rest',seconds:25});coach.complete();
  assert.deepEqual(browser.played,[0,1,4,5,6,7,8,2,3]);
  assert.equal(browser.spoken.length,0);coach.stop();assert.ok(browser.sources.every(x=>x.stopped));
});

test('slow clip loading plays only the latest cue, never a burst of old countdowns',async()=>{
  const browser=soundBrowser({clips:true,deferred:true}),coach=createTrainer(browser.host);
  coach.unlock();coach.begin({kind:'move',seconds:15});coach.countdown(5);coach.countdown(4);
  browser.release();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(browser.played,[5]); // Four, not Start or Five.
  coach.stop();
});

test('stopping before voice downloads finish suppresses late playback',async()=>{
  const browser=soundBrowser({clips:true,deferred:true}),coach=createTrainer(browser.host);
  coach.unlock();coach.begin({kind:'move',seconds:15});coach.stop();browser.release();
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(browser.played,[]);assert.deepEqual(browser.spoken,[]);
});


test('starting fresh immediately after completion cancels the old finish cue without releasing the new playback session',async()=>{
  const browser=soundBrowser({silentPhone:true,clips:true}),app=await mount({host:browser.host});try{
    app.click('#start');await new Promise(resolve=>setImmediate(resolve));
    app.elapse(160);
    const oldVoice=browser.sources.at(-1),oldBell=browser.tones.slice(-3);
    app.click('#start');
    assert.equal(browser.audioSession.type,'playback');
    assert.equal(browser.played.at(-1),9,'new round announces the first exercise');
    oldVoice.onended();for(const tone of oldBell)tone.onended();
    assert.equal(browser.audioSession.type,'playback','late finish callbacks do not mute the new round');
    assert.equal(app.node('#clock').textContent,'0:08');
    app.click('#stop');assert.equal(browser.audioSession.type,'auto');
  }finally{app.restore();}
});
