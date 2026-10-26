import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_TIME,recipe,duration} from '../dist/model.mjs';

test('Morning keeps the same targets and four fifteen-second rests for 160 seconds',()=>{
 const p=recipe();assert.equal(DEFAULT_TIME,160);assert.equal(p.seconds,160);
 assert.deepEqual(p.steps.map(x=>[x.id,x.seconds]),[['prepare',8],['platform-pushup',24],['rest',15],['hanging-knee-raise',24],['rest',15],['bar-hang',10],['rest',15],['support-hold',10],['rest',15],['squat',24]]);
 assert.equal(p.steps.reduce((sum,s)=>sum+s.seconds,0),160);
 assert.deepEqual(p.steps.filter(s=>['move','hold'].includes(s.kind)).map(s=>s.reps||s.seconds),[8,8,10,10,8]);
});
test('retired presets and old visit data cannot change the Morning targets or rests',()=>{
 for(const timeBudget of [60,120,300,600,NaN])assert.deepEqual(recipe({timeBudget,level:7,sessions:[{effort:'pain'}]},{tiny:true}),recipe());
});
test('duration labels include the longer Morning routine',()=>{
 assert.deepEqual([5,60,90,160,600].map(duration),['5 sec','1 min','1 min 30 sec','2 min 40 sec','10 min']);
});
