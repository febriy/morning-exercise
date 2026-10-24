import test from 'node:test';
import assert from 'node:assert/strict';
import {SESSION_STORAGE,sessionError,loadSessions,sessionPlan} from '../dist/sessions.mjs';
import {recipe,kidsRecipe} from '../dist/model.mjs';
import {mount} from './helpers/app.mjs';

test('missing, corrupt or incompatible session settings preserve both default recipes',()=>{
 for(const raw of [null,'broken','null','[]','{"version":2,"kids":[]}',JSON.stringify({version:1,kids:[{id:'<script>',seconds:20}]})]){
  const overrides=loadSessions(raw);
  assert.deepEqual(overrides,{});
  assert.deepEqual(sessionPlan('kids',{},overrides),kidsRecipe());
  assert.deepEqual(sessionPlan('morning',{},overrides),recipe());
 }
 const overrides=loadSessions(JSON.stringify({version:1,kids:[{id:'squat',seconds:10,reps:900}],morning:[{id:'rest',seconds:0}],history:[1]}));
 assert.deepEqual(overrides,{kids:[{id:'squat',seconds:10}]},'one invalid session does not discard the other, and unrelated data is stripped');
});

test('validation requires a real exercise, whole positive seconds and a session within ten minutes',()=>{
 for(const steps of [[],[{id:'rest',seconds:20}],[{id:'prepare',seconds:5}], [{id:'squat',seconds:0}],[{id:'squat',seconds:NaN}],[{id:'squat',seconds:2.5}],[{id:'squat',seconds:'20'}], [{id:'squat',seconds:601}],[{id:'other',seconds:20}],Array.from({length:21},()=>({id:'squat',seconds:1})),[{id:'squat',seconds:600},{id:'rest',seconds:1}]])assert.ok(sessionError(steps));
 assert.equal(sessionError([{id:'squat',seconds:600}]),'');
});

test('custom plans preserve duplicate intervals and derive cues from the edited sequence and duration',()=>{
 const overrides={kids:[{id:'prepare',seconds:3},{id:'bar-hang',seconds:7},{id:'rest',seconds:4},{id:'squat',seconds:12},{id:'rest',seconds:4}]};
 const plan=sessionPlan('kids',{},overrides);
 assert.equal(plan.seconds,30);
 assert.deepEqual(plan.steps.map(s=>[s.id,s.seconds]),overrides.kids.map(s=>[s.id,s.seconds]));
 assert.match(plan.steps[0].cue,/Pull-up bar hang/);
 assert.match(plan.steps[1].cue,/up to 7 seconds/);
 assert.match(plan.steps[2].cue,/Squats/);
 assert.doesNotMatch(plan.steps[4].cue,/Squats are next/);
 assert.ok(plan.steps.every(s=>!('reps' in s)));
 assert.deepEqual(sessionPlan('morning',{},overrides),recipe());
});

test('editing type and seconds saves only session configuration, survives reopening and drives the actual timer',async()=>{
 const app=await mount();let saved;try{
  app.click('#session-kids');app.click('#edit-session');
  app.field('#seconds-0','2');app.field('#type-1','squat','change');app.field('#seconds-1','6');
  app.submitSession();
  assert.match(app.root.innerHTML,/1 min 8 sec/);
  assert.match(app.root.innerHTML,/<strong>6<\/strong>/);
  assert.equal(app.writes.length,1);assert.equal(app.writes[0][0],SESSION_STORAGE);
  const home=app.root.innerHTML;
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:02');
  app.elapse(2);assert.match(app.root.innerHTML,/<h1>Squats<\/h1>/);assert.equal(app.node('#clock').textContent,'0:06');
  app.elapse(66);assert.equal(app.root.innerHTML,home);
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:02');app.click('#stop');
  assert.equal(app.writes.length,1,'starting and finishing never write visit records');
  saved=Object.fromEntries(app.storage);
 }finally{app.restore();}
 const reopened=await mount({saved});try{
  reopened.click('#session-kids');reopened.click('#start');assert.equal(reopened.node('#clock').textContent,'0:02');
  reopened.elapse(2);assert.match(reopened.root.innerHTML,/<h1>Squats<\/h1>/);
 }finally{reopened.restore();}
});

test('cancel, including after restoring the original, leaves saved routines untouched',async()=>{
 const saved={[SESSION_STORAGE]:JSON.stringify({version:1,kids:[{id:'squat',seconds:10}]})};
 const app=await mount({saved});try{
  app.click('#session-kids');const home=app.root.innerHTML;
  app.click('#edit-session');app.field('#seconds-0','25');app.click('#back');assert.equal(app.root.innerHTML,home);
  app.click('#edit-session');app.click('#restore-session');app.click('#back');assert.equal(app.root.innerHTML,home);
  assert.deepEqual(app.writes,[]);assert.deepEqual(Object.fromEntries(app.storage),saved);
 }finally{app.restore();}
});

test('saving an unchanged default leaves rep targets, shortcuts and storage untouched',async()=>{
 const app=await mount();try{
  const home=app.root.innerHTML;
  app.click('#edit-session');app.submitSession();
  assert.equal(app.root.innerHTML,home);
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('adding and removing steps retains typed edits and supports an empty draft without saving it',async()=>{
 const app=await mount();try{
  app.click('#session-kids');app.click('#edit-session');app.field('#seconds-0','3');app.click('#add-step');
  assert.match(app.root.innerHTML,/id="seconds-0"[^>]*value="3"/);
  assert.match(app.root.innerHTML,/Step 6/);
  for(let n=0;n<6;n++)app.click('#remove-0');
  assert.match(app.root.innerHTML,/Add your first exercise/);
  app.submitSession();assert.match(app.node('#editor-error').textContent,/Add an exercise/);assert.deepEqual(app.writes,[]);
  app.click('#add-step');app.field('#seconds-0','15');app.submitSession();
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:15');assert.match(app.root.innerHTML,/1 of 1/);
 }finally{app.restore();}
});

test('invalid edits remain in the editor with an error and never replace the running routine',async()=>{
 const app=await mount();try{
  app.click('#session-kids');app.click('#edit-session');
  for(const value of ['',0,-1,2.5,601]){
   app.field('#seconds-1',String(value));app.submitSession();
   assert.match(app.node('#editor-error').textContent,/whole number/);
   assert.equal(app.node('#seconds-1').attributes['aria-invalid'],'true');
   assert.deepEqual(app.writes,[]);
  }
  app.field('#seconds-1','600');app.submitSession();assert.match(app.node('#editor-error').textContent,/10 minutes/);
  app.click('#back');app.click('#start');assert.equal(app.node('#clock').textContent,'0:05');
 }finally{app.restore();}
});

test('restoring and saving defaults affects only the selected session',async()=>{
 const saved={[SESSION_STORAGE]:JSON.stringify({version:1,morning:[{id:'squat',seconds:9}],kids:[{id:'jumping-jacks',seconds:7}]})};
 const app=await mount({saved});try{
  assert.equal(app.root.querySelector('#tiny'),null);assert.equal(app.root.querySelector('#edit'),null);
  app.click('#session-kids');app.click('#edit-session');app.click('#restore-session');app.submitSession();
  assert.match(app.root.innerHTML,/1 min 25 sec/);
  assert.deepEqual(JSON.parse(app.storage.get(SESSION_STORAGE)),{version:1,morning:[{id:'squat',seconds:9}]});
  app.click('#session-morning');app.click('#start');assert.equal(app.node('#clock').textContent,'0:09');
 }finally{app.restore();}
});

test('blocked configuration storage still applies edits for this visit and explains the limitation',async()=>{
 const app=await mount({writeBlocked:true});try{
  app.click('#session-kids');app.click('#edit-session');app.field('#seconds-0','2');app.submitSession();
  assert.match(app.root.innerHTML,/changes work for this visit/);
  const home=app.root.innerHTML;app.click('#start');app.elapse(82);assert.equal(app.root.innerHTML,home);
  assert.equal(app.writes.length,1);
 }finally{app.restore();}
});

test('cross-tab configuration changes pause active workouts without replacing their current timer or unsaved drafts',async()=>{
 const custom=JSON.stringify({version:1,kids:[{id:'squat',seconds:8}]});
 const app=await mount();try{
  app.click('#session-kids');app.click('#start');app.elapse(2);
  app.storageEvent(SESSION_STORAGE,custom);assert.match(app.root.innerHTML,/Paused/);assert.equal(app.node('#clock').textContent,'0:03');
  app.click('#stop');app.click('#start');assert.equal(app.node('#clock').textContent,'0:08');app.click('#stop');
  app.click('#edit-session');app.field('#seconds-0','12');
  app.storageEvent(SESSION_STORAGE,null);assert.match(app.root.innerHTML,/session-editor/);
  app.visibility(true);app.visibility(false);assert.match(app.root.innerHTML,/session-editor/);
  app.submitSession();app.click('#start');assert.equal(app.node('#clock').textContent,'0:12');
 }finally{app.restore();}
});
