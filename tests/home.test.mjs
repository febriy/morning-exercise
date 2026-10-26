import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecipe,recipe,kidsRecipe} from '../dist/model.mjs';
import {SESSION_STORAGE,loadSessions,sessionPlan} from '../dist/sessions.mjs';
import {movementFrame,movementSprite} from '../dist/movements.mjs';
import {mount} from './helpers/app.mjs';

test('At home has five-second preparation and the three requested movements with twenty-second rests',()=>{
 const plan=homeRecipe();
 assert.equal(plan.seconds,125);
 assert.equal(plan.steps.reduce((sum,step)=>sum+step.seconds,0),125);
 assert.deepEqual(plan.steps.map(({id,seconds})=>[id,seconds]),[
  ['prepare',5],['kettlebell-squat',20],['rest',20],['incline-pushup',20],['rest',20],['kettlebell-swing',20],['rest',20]
 ]);
 assert.ok(plan.steps.every(step=>step.cue&&step.tip&&step.station&&step.kind&&!step.reps));
 assert.match(plan.steps[5].tip,/hip hinge/);
 assert.deepEqual(sessionPlan('home',{timeBudget:600}),plan);
});

test('all seven home phases use the full timer, preview the correct next movement and reset to the same overview',async()=>{
 const app=await mount();try{
  app.click('#session-home');const overview=app.root.innerHTML;
  assert.match(overview,/At<br>home\./);assert.match(overview,/2 min 5 sec/);
  assert.match(overview,/20 sec rest after each exercise/);
  assert.doesNotMatch(overview,/id="(?:edit|tiny)"/);
  assert.equal((overview.match(/class="movement-row"/g)||[]).length,3);
  for(let repeat=0;repeat<2;repeat++){
   app.click('#start');
   for(const [index,step] of homeRecipe().steps.entries()){
    assert.match(app.root.innerHTML,new RegExp(`${index+1} of 7`));
    assert.equal(app.node('#clock').textContent,`0:${String(step.seconds).padStart(2,'0')}`);
    if(step.kind==='move')assert.match(app.root.innerHTML,new RegExp(`<h1>${step.title}</h1>`));
    else{
     const next=homeRecipe().steps.slice(index+1).find(s=>s.kind==='move');
     assert.equal(app.document.documentElement.dataset.phase,step.kind);
     if(next){assert.match(app.root.innerHTML,new RegExp(`<span>Next:</span> ${next.title}`));assert.ok(app.root.innerHTML.includes(next.station));}
     else{assert.match(app.root.innerHTML,/All movements done/);assert.doesNotMatch(app.root.innerHTML,/id="movement-demo"/);}
    }
    app.elapse(step.seconds);
   }
   assert.equal(app.root.innerHTML,overview);
  }
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('home settings persist independently while older stored sessions retain their plans',async()=>{
 const original={version:1,morning:[{id:'bar-hang',seconds:7}],kids:[{id:'jumping-jacks',seconds:9}]};
 const app=await mount({saved:{[SESSION_STORAGE]:JSON.stringify(original)}});let saved;try{
  app.click('#session-home');app.click('#edit-session');
  app.field('#seconds-0','3');app.field('#seconds-1','12');app.field('#type-3','kettlebell-swing','change');
  app.submitSession();
  const stored=JSON.parse(app.storage.get(SESSION_STORAGE));
  assert.deepEqual(stored.morning,original.morning);assert.deepEqual(stored.kids,original.kids);
  assert.deepEqual(stored.home[3],{id:'kettlebell-swing',seconds:20});
  assert.equal(stored.home[1].seconds,12);
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:03');
  app.elapse(3);assert.equal(app.node('#clock').textContent,'0:12');
  app.click('#stop');assert.match(app.root.innerHTML,/At<br>home\./);
  saved=Object.fromEntries(app.storage);
 }finally{app.restore();}
 const reopened=await mount({saved});try{
  reopened.click('#session-home');reopened.click('#start');assert.equal(reopened.node('#clock').textContent,'0:03');
  reopened.click('#stop');reopened.click('#edit-session');reopened.click('#restore-session');reopened.submitSession();
  assert.deepEqual(JSON.parse(reopened.storage.get(SESSION_STORAGE)),{...original,version:2});
  reopened.click('#start');assert.equal(reopened.node('#clock').textContent,'0:05');
 }finally{reopened.restore();}
});

test('new movements work in any session editor and invalid home settings do not discard the other sessions',()=>{
 const custom=[{id:'kettlebell-squat',seconds:10},{id:'incline-pushup',seconds:11},{id:'kettlebell-swing',seconds:12}];
 for(const session of ['morning','kids','home']){
  const overrides=loadSessions(JSON.stringify({version:1,[session]:custom}));
  const plan=sessionPlan(session,{},overrides);
  assert.equal(plan.seconds,33);assert.ok(plan.steps.every(step=>step.cue&&step.tip&&step.kind==='move'));
 }
 const older={morning:[{id:'bar-hang',seconds:7}],kids:[{id:'squat',seconds:8}]};
 assert.deepEqual(loadSessions(JSON.stringify({version:1,...older,home:[{id:'nope',seconds:20}]})),older);
 assert.deepEqual(sessionPlan('morning',{},{}),recipe());
 assert.deepEqual(sessionPlan('kids',{},{}),kidsRecipe());
});

test('home demos reuse the incline platform strip, freeze with pause and use the current break or exercise clock',async()=>{
 assert.match(movementSprite('incline-pushup'),/sprites\/platform-pushup.png/);
 assert.deepEqual([0,.8,1.6,2.4,3].map(t=>movementFrame('kettlebell-squat',t)),[0,1,2,3,0]);
 assert.deepEqual([0,.5,1,1.5,2].map(t=>movementFrame('kettlebell-swing',t)),[0,1,2,3,0]);
 const app=await mount();try{
  app.click('#session-home');app.click('#start');app.elapse(1.6);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.click('#pause');app.elapse(10);assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.reduce(true);assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
  app.reduce(false);app.click('#pause');app.elapse(3.4);
  assert.equal(app.node('#clock').textContent,'0:20');assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
  app.elapse(20);assert.match(app.root.innerHTML,/Next exercise preview\. Incline push-up/);
  app.elapse(40);assert.match(app.root.innerHTML,/Next exercise preview\. Two-handed kettlebell swing/);
  app.click('#pause');const time=app.node('#clock').textContent;app.storageEvent(SESSION_STORAGE,JSON.stringify({version:1,home:[{id:'squat',seconds:8}]}));
  assert.equal(app.node('#clock').textContent,time);app.click('#stop');app.click('#start');
  assert.equal(app.node('#clock').textContent,'0:08');assert.match(app.root.innerHTML,/<h1>Squats<\/h1>/);
 }finally{app.restore();}
});

test('home edits still run if configuration storage is blocked',async()=>{
 const app=await mount({writeBlocked:true});try{
  app.click('#session-home');app.click('#edit-session');app.field('#seconds-0','2');app.submitSession();
  assert.match(app.root.innerHTML,/cannot remember/);app.click('#start');assert.equal(app.node('#clock').textContent,'0:02');
 }finally{app.restore();}
});
