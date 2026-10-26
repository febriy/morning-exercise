import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecipe,recipe,kidsRecipe} from '../dist/model.mjs';
import {SESSION_STORAGE,SESSION_VERSION,loadSessions,sessionPlan} from '../dist/sessions.mjs';
import {movementFrame,movementSprite} from '../dist/movements.mjs';
import {mount} from './helpers/app.mjs';

test('At home is the exact eight-phase 8 minute 40 second sequence without kettlebell squats',()=>{
 const plan=homeRecipe();assert.equal(plan.seconds,520);
 assert.equal(plan.steps.reduce((sum,step)=>sum+step.seconds,0),520);
 assert.deepEqual(plan.steps.map(({id,seconds})=>[id,seconds]),[
  ['prepare',15],['incline-pushup',20],['rest',15],['kettlebell-swing',20],['rest',15],['trampoline',120],['rest',15],['packing-squats',300]
 ]);
 assert.ok(plan.steps.every(step=>step.cue&&step.tip&&step.station&&step.kind&&!step.reps));
 assert.match(plan.steps[7].cue,/whenever you pick something up from the floor/);
 assert.match(plan.steps[7].tip,/Squat only for floor pickups/);
 assert.deepEqual(sessionPlan('home',{timeBudget:600}),plan);
});

test('all eight home phases get their full timers and previews then reset to the same overview',async()=>{
 const app=await mount();try{
  app.click('#session-home');const overview=app.root.innerHTML;
  assert.match(overview,/8 min 40 sec/);assert.match(overview,/15 sec prep · 15 sec rest between activities/);
  assert.doesNotMatch(overview,/Kettlebell squats|id="(?:edit|tiny)"/);
  assert.equal((overview.match(/class="movement-row"/g)||[]).length,4);
  assert.match(overview,/<strong>2<\/strong><span>min/);assert.match(overview,/<strong>5<\/strong><span>min/);
  for(let repeat=0;repeat<2;repeat++){
   app.click('#start');
   for(const [index,step] of homeRecipe().steps.entries()){
    assert.match(app.root.innerHTML,new RegExp(`${index+1} of 8`));
    assert.equal(app.node('#clock').textContent,`${Math.floor(step.seconds/60)}:${String(step.seconds%60).padStart(2,'0')}`);
    if(step.kind==='move')assert.match(app.root.innerHTML,new RegExp(`<h1>${step.title}</h1>`));
    else{
     const next=homeRecipe().steps.slice(index+1).find(s=>s.kind==='move');
     assert.equal(app.document.documentElement.dataset.phase,step.kind);
     assert.match(app.root.innerHTML,new RegExp(`<span>Next:</span> ${next.title}`));assert.ok(app.root.innerHTML.includes(next.station));
    }
    app.elapse(step.seconds);
   }
   assert.equal(app.root.innerHTML,overview);
  }
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('older home routines are replaced while Morning and kids settings remain intact',()=>{
 for(const version of [1,2]){
  const loaded=loadSessions(JSON.stringify({version,home:[{id:'kettlebell-squat',seconds:20}],morning:[{id:'bar-hang',seconds:7}],kids:[{id:'jumping-jacks',seconds:9}]}));
  assert.deepEqual(loaded,{morning:[{id:'bar-hang',seconds:7}],kids:[{id:'jumping-jacks',seconds:9}]});
  assert.deepEqual(sessionPlan('home',{},loaded),homeRecipe());
 }
 const edited=[{id:'trampoline',seconds:30},{id:'packing-squats',seconds:60}];
 assert.deepEqual(loadSessions(JSON.stringify({version:SESSION_VERSION,home:edited})),{home:edited});
});

test('new home edits persist, run, reopen and restore independently',async()=>{
 const original={version:1,morning:[{id:'bar-hang',seconds:7}],kids:[{id:'jumping-jacks',seconds:9}]};
 const app=await mount({saved:{[SESSION_STORAGE]:JSON.stringify(original)}});let saved;try{
  app.click('#session-home');app.click('#edit-session');app.field('#seconds-0','3');app.field('#seconds-1','12');app.field('#type-3','incline-pushup','change');app.submitSession();
  const stored=JSON.parse(app.storage.get(SESSION_STORAGE));assert.equal(stored.version,SESSION_VERSION);
  assert.deepEqual(stored.morning,original.morning);assert.deepEqual(stored.kids,original.kids);
  assert.deepEqual(stored.home[3],{id:'incline-pushup',seconds:20});
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:03');app.elapse(3);assert.equal(app.node('#clock').textContent,'0:12');app.click('#stop');
  saved=Object.fromEntries(app.storage);
 }finally{app.restore();}
 const reopened=await mount({saved});try{
  reopened.click('#session-home');reopened.click('#start');assert.equal(reopened.node('#clock').textContent,'0:03');reopened.click('#stop');
  reopened.click('#edit-session');reopened.click('#restore-session');reopened.submitSession();
  assert.deepEqual(JSON.parse(reopened.storage.get(SESSION_STORAGE)),{...original,version:SESSION_VERSION});
  reopened.click('#start');assert.equal(reopened.node('#clock').textContent,'0:15');
 }finally{reopened.restore();}
});

test('new activities and the removed default kettlebell squat work in explicit custom routines',()=>{
 const custom=[{id:'kettlebell-squat',seconds:10},{id:'trampoline',seconds:11},{id:'packing-squats',seconds:12}];
 for(const session of ['morning','kids','home']){
  const overrides=loadSessions(JSON.stringify({version:SESSION_VERSION,[session]:custom}));const plan=sessionPlan(session,{},overrides);
  assert.equal(plan.seconds,33);assert.ok(plan.steps.every(step=>step.cue&&step.tip&&step.kind==='move'));
 }
 assert.deepEqual(sessionPlan('morning',{},{}),recipe());assert.deepEqual(sessionPlan('kids',{},{}),kidsRecipe());
});

test('new demos pause and respect Reduce Motion; packing uses a squat example',async()=>{
 assert.match(movementSprite('incline-pushup'),/sprites\/platform-pushup.png/);assert.match(movementSprite('packing-squats'),/sprites\/squat.png/);
 assert.deepEqual([0,.5,1,1.5,2].map(t=>movementFrame('trampoline',t)),[0,1,2,3,0]);
 const app=await mount();try{
  app.click('#session-home');app.click('#start');app.elapse(85.6);assert.match(app.root.innerHTML,/<h1>Trampoline<\/h1>/);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'1');app.click('#pause');app.elapse(10);assert.equal(app.node('#movement-demo').attributes['data-frame'],'1');
  app.reduce(true);assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');app.reduce(false);app.click('#pause');app.elapse(119.4);
  assert.match(app.root.innerHTML,/Next exercise preview\. Packing with squats/);app.elapse(15);assert.equal(app.node('#clock').textContent,'5:00');
  app.click('#pause');const time=app.node('#clock').textContent;app.storageEvent(SESSION_STORAGE,JSON.stringify({version:SESSION_VERSION,home:[{id:'squat',seconds:8}]}));
  assert.equal(app.node('#clock').textContent,time);app.click('#stop');app.click('#start');assert.equal(app.node('#clock').textContent,'0:08');
 }finally{app.restore();}
});

test('home edits still work with blocked storage',async()=>{
 const app=await mount({writeBlocked:true});try{
  app.click('#session-home');app.click('#edit-session');app.field('#seconds-0','2');app.submitSession();assert.match(app.root.innerHTML,/cannot remember/);
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:02');
 }finally{app.restore();}
});
