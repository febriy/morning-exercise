import test from 'node:test';
import assert from 'node:assert/strict';
import {mount} from './helpers/app.mjs';

test('skip advances exactly one phase, resets its timer and deducts skipped time',async()=>{
 const app=await mount();try{
  app.click('#start');app.elapse(3);app.click('#skip-step');
  assert.match(app.root.innerHTML,/2 of 10/);
  assert.equal(app.node('#clock').textContent,'0:24');
  assert.equal(app.node('#remaining').textContent,'2 min 32 sec remaining');
  app.elapse(2);app.click('#skip-step');
  assert.match(app.root.innerHTML,/<h1>Rest<\/h1>/);
  assert.match(app.root.innerHTML,/Next:<\/span> Knee raises/);
  assert.equal(app.node('#clock').textContent,'0:15');
  assert.equal(app.node('#remaining').textContent,'2 min 8 sec remaining');
  app.click('#skip-step');assert.match(app.root.innerHTML,/<h1>Knee raises<\/h1>/);
  assert.equal(app.node('#clock').textContent,'0:24');
  app.elapse(1);assert.equal(app.node('#clock').textContent,'0:23');
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('skip keeps paused phases silent and frozen until Resume',async()=>{
 const spoken=[],host={SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},speechSynthesis:{cancel(){},getVoices(){return [];},speak(u){spoken.push(u.text);u.onend?.();}}};
 const app=await mount({host});try{
  app.click('#start');app.elapse(2);app.click('#pause');const before=spoken.length;
  app.click('#skip-step');app.elapse(10);
  assert.equal(app.node('#clock').textContent,'0:24');assert.match(app.root.innerHTML,/Paused/);
  assert.equal(spoken.length,before);
  app.click('#pause');assert.equal(spoken.at(-1),'Start');
  app.elapse(1);assert.equal(app.node('#clock').textContent,'0:23');
  app.click('#skip-step');assert.equal(spoken.at(-1),'Next exercise. Knee raises.');
  app.click('#skip-step');assert.equal(spoken.at(-1),'Start');
 }finally{app.restore();}
});

test('skipping every phase returns each session, custom session and Bare minimum to its own overview',async()=>{
 const saved={'on-the-way.sessions.v1':JSON.stringify({version:3,kids:[{id:'squat',seconds:10},{id:'rest',seconds:15}]})};
 for(const [session,steps,minimum] of [['morning',10,false],['home',8,false],['kids',2,false],['home',2,true]]){
  const app=await mount({saved});try{
   app.click(`#session-${session}`);const overview=app.root.innerHTML;
   app.click(minimum?'#minimum':'#start');
   for(let i=0;i<steps;i++)app.click('#skip-step');
   assert.equal(app.root.innerHTML,overview);
   app.elapse(30);assert.equal(app.root.innerHTML,overview);
   assert.deepEqual(app.writes,[]);assert.deepEqual(Object.fromEntries(app.storage),saved);
   app.click('#start');assert.match(app.root.innerHTML,/1 of /);
  }finally{app.restore();}
 }
});
