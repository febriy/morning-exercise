import test from 'node:test';
import assert from 'node:assert/strict';
import {mount} from './helpers/app.mjs';
const PREFS='on-the-way.preferences.v1';

test('completion returns straight to the original screen and saves no workout',async()=>{
 const app=await mount();try{
  const start=app.root.innerHTML;
  app.click('#start');app.elapse(160);
  assert.equal(app.root.innerHTML,start);
  assert.equal(app.node('#main').focused,true);
  assert.equal(app.node('#toast').textContent,'Workout complete. Ready to start again.');
  assert.equal(app.document.documentElement.dataset.background,'moving');
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});
test('consecutive full workouts each restart the original timer and movement order',async()=>{
 const app=await mount();try{
  const home=app.root.innerHTML;
  for(let round=0;round<3;round++){
   app.click('#start');
   assert.match(app.root.innerHTML,/1 of 10/);
   assert.equal(app.node('#clock').textContent,'0:08');
   assert.equal(app.node('#remaining').textContent,'2 min 40 sec remaining');
   app.elapse(8);assert.match(app.root.innerHTML,/Do up to 8 controlled push-ups/);
   app.elapse(152);assert.equal(app.root.innerHTML,home);
  }
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});
test('ending immediately or partway through returns home without a feedback step',async()=>{
 for(const elapsed of [0,.6,11,119]){
  const app=await mount();try{
   const home=app.root.innerHTML;
   app.click('#start');app.elapse(elapsed);app.click('#stop');
   assert.equal(app.root.innerHTML,home);
   assert.doesNotMatch(app.root.innerHTML,/saved|How did that feel|Start again|An easy day/);
   app.click('#start');assert.equal(app.node('#clock').textContent,'0:08');
   assert.deepEqual(app.writes,[]);
  }finally{app.restore();}
 }
});
test('old saved visits and unfinished feedback drafts never change or block the workout',async()=>{
 const saved={
  'on-the-way.v1':JSON.stringify({version:1,program:'personal-corner-v2',setupComplete:true,goal:'habit',timeBudget:120,level:7,levelSince:'2026-10-20',healthReady:false,equipment:[],sessions:[{date:'2026-10-24',level:7,seconds:120,mode:'normal',strength:true,full:true,effort:'pain',again:'no'}]}),
  'on-the-way.pending.v1':JSON.stringify({date:'2026-10-24',seconds:120,level:7,mode:'normal',full:true,strength:true})
 };
 const app=await mount({saved});try{
  assert.match(app.root.innerHTML,/Your corner/);
  assert.match(app.root.innerHTML,/Squats/);
  assert.doesNotMatch(app.root.innerHTML,/recovery|saved|How did that feel|unwell\. Resume/);
  const home=app.root.innerHTML;app.click('#start');app.elapse(160);assert.equal(app.root.innerHTML,home);
  assert.deepEqual(Object.fromEntries(app.storage),saved,'legacy entries are left untouched, not resumed or rewritten');
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
 const reopened=await mount({saved});try{assert.match(reopened.root.innerHTML,/Start workout/);assert.match(reopened.root.innerHTML,/Squats/);}finally{reopened.restore();}
});
test('finishing Bare minimum returns to the chosen Morning workout',async()=>{
 const app=await mount();try{
  const home=app.root.innerHTML;
  app.click('#minimum');assert.equal(app.node('#remaining').textContent,'25 sec remaining');
  app.elapse(25);assert.equal(app.root.innerHTML,home);
  app.click('#start');assert.equal(app.node('#remaining').textContent,'2 min 40 sec remaining');
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});
test('legacy time settings are left untouched and cannot shorten the new Morning routine',async()=>{
 const saved={[PREFS]:'{"timeBudget":60}'};
 const app=await mount({saved});try{
  assert.equal(app.root.querySelector('#edit'),null);
  app.click('#start');assert.equal(app.node('#remaining').textContent,'2 min 40 sec remaining');
  app.storageEvent(PREFS,'{"timeBudget":300}');assert.doesNotMatch(app.root.innerHTML,/Paused/);
  app.elapse(160);assert.deepEqual(Object.fromEntries(app.storage),saved);assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});
test('blocked storage does not prevent a fresh Morning workout or reset',async()=>{
 const app=await mount({readBlocked:true,writeBlocked:true});try{
  const home=app.root.innerHTML;app.click('#start');app.elapse(160);assert.equal(app.root.innerHTML,home);
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:08');assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});
