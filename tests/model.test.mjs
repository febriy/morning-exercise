import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_TIME,loadPreferences,recipe,duration} from '../dist/model.mjs';
const actions=plan=>plan.steps.filter(x=>['hold','move'].includes(x.kind));

test('default is the exact two-minute five-movement routine',()=>{
 assert.equal(DEFAULT_TIME,120);
 const p=recipe();
 assert.deepEqual(p.steps.map(x=>[x.id,x.seconds]),[['prepare',8],['platform-pushup',24],['rest',5],['hanging-knee-raise',24],['rest',5],['bar-hang',10],['rest',5],['support-hold',10],['rest',5],['squat',24]]);
 assert.deepEqual(actions(p).map(x=>x.reps||x.seconds),[8,8,10,10,8]);
});
test('all time choices keep the five movements and exactly fit their time budget',()=>{
 for(const timeBudget of [60,120,300,600]){
  const p=recipe({timeBudget});
  assert.equal(p.seconds,timeBudget);
  assert.equal(p.steps.reduce((sum,x)=>sum+x.seconds,0),timeBudget);
  assert.ok(p.steps.every(x=>x.seconds>0));
  assert.deepEqual(actions(p).map(x=>x.id),['platform-pushup','hanging-knee-raise','bar-hang','support-hold','squat']);
  assert.deepEqual(actions(p).map(x=>x.reps||x.seconds),timeBudget===60?[3,3,5,5,3]:[8,8,10,10,8]);
 }
});
test('the one-minute shortcut is smaller without changing the selected time',()=>{
 const preferences={timeBudget:300};
 assert.equal(recipe(preferences,{tiny:true}).seconds,60);
 assert.deepEqual(preferences,{timeBudget:300});
 assert.equal(recipe(preferences).seconds,300);
});
test('old visits and progression cannot change the routine',()=>{
 for(const effort of ['easy','hard','pain']){
  assert.deepEqual(recipe({timeBudget:120,level:7,sessions:[{date:'2026-10-24',effort,strength:true,again:'no'}]}),recipe());
 }
});
test('preferences load only the time choice and ignore all visit data',()=>{
 assert.deepEqual(loadPreferences(JSON.stringify({timeBudget:60,sessions:[{effort:'pain'}],level:7})),{timeBudget:60});
 assert.deepEqual(loadPreferences(null,JSON.stringify({program:'personal-corner-v2',timeBudget:300,sessions:[{effort:'pain'}]})),{timeBudget:300});
 assert.deepEqual(loadPreferences(JSON.stringify({timeBudget:60}),JSON.stringify({program:'personal-corner-v2',timeBudget:300})),{timeBudget:60});
 assert.deepEqual(loadPreferences(null,JSON.stringify({program:'personal-bars-v1',timeBudget:60})),{timeBudget:120});
});
test('unavailable or malformed preferences and unsupported budgets fall back to two minutes',()=>{
 for(const raw of [null,'broken','null','[]','120','{"timeBudget":"60"}','{"timeBudget":0}','{"timeBudget":3600}'])assert.deepEqual(loadPreferences(raw),{timeBudget:120});
 for(const timeBudget of [0,-1,30,3600,NaN,'120'])assert.equal(recipe({timeBudget}).seconds,120);
});
test('duration labels remain readable across timer and preference values',()=>{
 assert.deepEqual([5,60,90,120,600].map(duration),['5 sec','1 min','1 min 30 sec','2 min','10 min']);
});
