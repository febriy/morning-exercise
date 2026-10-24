import test from 'node:test';
import assert from 'node:assert/strict';
import {kidsRecipe,recipe} from '../dist/model.mjs';
import {mount} from './helpers/app.mjs';

test('Exercise with kids is exactly one 80-second round, including the final rest',()=>{
 const plan=kidsRecipe();
 assert.equal(plan.seconds,80);
 assert.deepEqual(plan.steps.map(s=>[s.id,s.seconds,s.kind]),[
  ['jumping-jacks',20,'move'],['rest',20,'rest'],['squat',20,'move'],['rest',20,'rest']
 ]);
 assert.equal(plan.steps.reduce((total,s)=>total+s.seconds,0),80);
 assert.ok(plan.steps.every(s=>!('reps' in s)),'these are timed movements, not rep targets');
 plan.steps[0].seconds=1;
 assert.equal(kidsRecipe().steps[0].seconds,20,'each start gets a fresh recipe');
 assert.equal(recipe().seconds,120,'the morning routine remains two minutes');
});

test('kids overview shows all four steps, with a fixed time and no setup or shortcut',async()=>{
 const app=await mount();try{
  app.click('#session-kids');
  assert.match(app.root.innerHTML,/Exercise<br>with kids\./);
  assert.match(app.root.innerHTML,/1 min 20 sec/);
  assert.equal((app.root.innerHTML.match(/class="movement-row"/g)||[]).length,4);
  assert.equal((app.root.innerHTML.match(/<strong>20<\/strong>/g)||[]).length,4);
  assert.match(app.root.innerHTML,/id="session-kids"[^>]*aria-pressed="true"/);
  assert.equal(app.root.querySelector('#edit'),null);
  assert.equal(app.root.querySelector('#tiny'),null);
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('kids phases run in the requested order and completion returns to the same fresh session',async()=>{
 const app=await mount();try{
  app.click('#session-kids');const home=app.root.innerHTML;
  for(let round=0;round<2;round++){
   app.click('#start');
   for(const [index,title] of ['Jumping jacks','Rest','Squats','Rest'].entries()){
    assert.match(app.root.innerHTML,new RegExp(`<h1>${title}</h1>`));
    assert.match(app.root.innerHTML,new RegExp(`${index+1} of 4`));
    assert.equal(app.node('#clock').textContent,'0:20');
    app.elapse(19.8);assert.equal(app.node('#clock').textContent,'0:01');
    app.elapse(.2);
   }
   assert.equal(app.root.innerHTML,home);
   assert.equal(app.node('#toast').textContent,'Workout complete. Ready to start again.');
  }
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('ending or pausing kids preserves the selected session and its timer without saving a visit',async()=>{
 const app=await mount();try{
  app.click('#session-kids');const home=app.root.innerHTML;
  app.click('#start');app.elapse(3);app.click('#pause');app.elapse(30);
  assert.equal(app.node('#clock').textContent,'0:17');
  app.click('#pause');app.elapse(1);assert.equal(app.node('#clock').textContent,'0:16');
  app.visibility(true);app.elapse(30);assert.equal(app.node('#clock').textContent,'0:16');
  app.visibility(false);app.click('#stop');assert.equal(app.root.innerHTML,home);
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:20');
  app.click('#stop');assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('switching sessions keeps the morning time choice independent of the fixed kids session',async()=>{
 const app=await mount();try{
  app.click('#edit');app.submitTime(300);const morning=app.root.innerHTML;
  app.click('#session-kids');app.click('#start');app.elapse(80);
  app.click('#session-morning');assert.equal(app.root.innerHTML,morning);
  app.click('#start');assert.equal(app.node('#remaining').textContent,'5 min remaining');
  assert.match(app.root.innerHTML,/1 of 10/);
  assert.deepEqual(app.writes,[['on-the-way.preferences.v1','{"timeBudget":300}']]);
 }finally{app.restore();}
});
