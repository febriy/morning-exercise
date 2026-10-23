import test from 'node:test';
import assert from 'node:assert/strict';
import {createTrainer} from '../dist/trainer.mjs';
import {mount} from './helpers/app.mjs';

function soundBrowser({suspended=false,clips=false,deferred=false}={}) {
  const spoken=[],tones=[],played=[],sources=[],requests=[];let cancelled=0,resumeAudio,releaseFiles;
  const fileGate=deferred?new Promise(resolve=>releaseFiles=resolve):Promise.resolve();
  const contexts=[];
  class AudioContext {
    constructor(){this.state=suspended?'suspended':'running';this.currentTime=0;this.destination={};contexts.push(this);}
    resume(){if(!suspended)return Promise.resolve();return new Promise(resolve=>{resumeAudio=()=>{this.state='running';resolve();};});}
    decodeAudioData(bytes){return Promise.resolve({id:new Uint8Array(bytes)[0]});}
    createBufferSource(){const source={buffer:null,connect(){},disconnect(){},start(){played.push(this.buffer.id);},stop(){this.stopped=true;}};sources.push(source);return source;}
    createOscillator(){const tone={frequency:{value:0},started:false,stops:[],connect(){},disconnect(){},start(){this.started=true;},stop(at){this.stops.push(at);}};tones.push(tone);return tone;}
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
  }
  const host={AudioContext,SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},speechSynthesis:{
    cancel(){cancelled++;},getVoices(){return [{lang:'en-SG',localService:true,name:'English'}];},speak(u){spoken.push(u.text);}
  }};
  if(clips)host.fetch=async url=>{requests.push(String(url));await fileGate;const file=String(url).split('/').at(-1).replace('.m4a','');const id=['ready','start','rest','complete','5','4','3','2','1'].indexOf(file);return {ok:true,arrayBuffer:async()=>new Uint8Array([id]).buffer};};
  return {host,spoken,tones,contexts,played,sources,requests,release(){releaseFiles?.();},get cancelled(){return cancelled;},resume(){resumeAudio?.();}};
}

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

test('the real two-minute workout speaks countdowns and cues at boundaries without replaying on every tick',async()=>{
  const browser=soundBrowser(),app=await mount({host:browser.host});try{
    app.click('#start');assert.deepEqual(browser.spoken,['Get ready']);
    app.elapse(20);assert.deepEqual(browser.spoken,['Get ready','5','4','3','2','1','Start']);
    app.elapse(15);assert.equal(browser.spoken.at(-1),'Rest');
    app.elapse(85);assert.equal(browser.spoken.at(-1),'Workout complete');
    assert.match(app.root.innerHTML,/That’s your/);
    assert.equal(browser.spoken.filter(x=>x==='Workout complete').length,1);
    assert.equal(browser.tones.length,24); // Start, six boundaries and completion: one bell each.
  }finally{app.restore();}
});

test('pause, guidance, hiding the page and ending stop cues; resume speaks only the current phase',async()=>{
  const browser=soundBrowser(),app=await mount({host:browser.host});try{
    app.click('#start');app.elapse(15);assert.equal(browser.spoken.at(-1),'5');
    app.click('#pause');const paused=browser.spoken.length;app.elapse(10);assert.equal(browser.spoken.length,paused);
    app.click('#pause');assert.equal(browser.spoken.at(-1),'Get ready');
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
  assert.equal(browser.requests.length,9);assert.ok(browser.requests.every(x=>x.endsWith('.m4a')));
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
