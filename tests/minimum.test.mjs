import test from 'node:test';
import assert from 'node:assert/strict';
import {minimumRecipe} from '../dist/model.mjs';
import {SESSION_STORAGE} from '../dist/sessions.mjs';
import {mount} from './helpers/app.mjs';

test('Bare minimum is five seconds to prepare then twenty seconds of bodyweight squats, without rest or rep targets',()=>{
 const plan=minimumRecipe();
 assert.equal(plan.seconds,25);
 assert.deepEqual(plan.steps.map(s=>[s.id,s.seconds]),[['prepare',5],['squat',20]]);
 assert.ok(plan.steps.every(s=>!s.reps));
 assert.equal(plan.steps[1].station,'Clear, level floor');
 assert.match(plan.steps[1].cue,/No weights needed/);
});

test('Bare minimum is available from every session, completes without saving, and never replaces the selected routine',async()=>{
 for(const session of ['morning','home','kids']){
  const app=await mount();try{
   app.click(`#session-${session}`);const original=app.root.innerHTML;
   assert.match(original,/Bare minimum · 20s squats/);
   app.click('#minimum');
   assert.match(app.root.innerHTML,/wordmark">Bare minimum/);
   assert.equal(app.node('#clock').textContent,'0:05');
   assert.match(app.root.innerHTML,/<span>Next:<\/span> Squats/);
   assert.match(app.root.innerHTML,/Clear, level floor/);
   app.elapse(5);assert.equal(app.node('#clock').textContent,'0:20');
   app.elapse(20);assert.equal(app.root.innerHTML,original);
   app.click('#start');
   assert.equal(app.node('#remaining').textContent,session==='morning'?'2 min 40 sec remaining':session==='home'?'2 min 5 sec remaining':'1 min 25 sec remaining');
   assert.deepEqual(app.writes,[]);
  }finally{app.restore();}
 }
});

test('Bare minimum preserves custom timing and exercises, including after pause or End',async()=>{
 const saved={[SESSION_STORAGE]:JSON.stringify({version:1,home:[{id:'kettlebell-swing',seconds:42}]})};
 const app=await mount({saved});try{
  app.click('#session-home');const original=app.root.innerHTML;
  app.click('#minimum');app.elapse(8);app.click('#pause');app.elapse(10);
  assert.equal(app.node('#clock').textContent,'0:17');
  app.click('#pause');app.elapse(1);assert.equal(app.node('#clock').textContent,'0:16');
  app.click('#stop');assert.equal(app.root.innerHTML,original);
  app.click('#start');assert.equal(app.node('#clock').textContent,'0:42');
  assert.match(app.root.innerHTML,/<h1>Kettlebell swings<\/h1>/);
  assert.deepEqual(Object.fromEntries(app.storage),saved);assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});
