import test from 'node:test';
import assert from 'node:assert/strict';
import {EMPTY,LEVELS,day,load,validate,recipe,record} from '../dist/model.mjs';
const fresh=()=>({...structuredClone(EMPTY),timeBudget:600});
const visit=(date,overrides={})=>({date,level:0,seconds:60,mode:'normal',strength:false,full:true,effort:'easy',again:'yes',...overrides});
test('first use opens the personal two-minute habit routine without setup',()=>{assert.equal(EMPTY.setupComplete,true);assert.equal(EMPTY.goal,'habit');assert.equal(EMPTY.timeBudget,120);assert.equal(recipe(EMPTY).seconds,120);});
test('previous generic progress is preserved but the new bar routine starts gently',()=>{const old={...fresh(),level:7,sessions:[visit('2026-10-01')]};delete old.program;delete old.setupComplete;const s=load(JSON.stringify(old));assert.equal(s.setupComplete,true);assert.equal(s.level,0);assert.equal(s.sessions.length,1);assert.equal(s.program,'personal-corner-v2');});
test('Singapore days cross at UTC 16:00, independently of device timezone',()=>{assert.equal(day(new Date('2026-10-21T15:59:59Z')),'2026-10-21');assert.equal(day(new Date('2026-10-21T16:00:00Z')),'2026-10-22');});
test('normal routines keep the five requested movements and counts at every level',()=>{
 for(let level=0;level<8;level++)for(const timeBudget of [120,300,600]){
  const p=recipe({...fresh(),level,timeBudget},{today:'2026-10-22'});
  const actions=p.steps.filter(x=>['hold','move'].includes(x.kind));
  assert.deepEqual(actions.map(x=>[x.id,x.reps||x.seconds]),[['platform-pushup',8],['hanging-knee-raise',8],['bar-hang',10],['support-hold',10],['squat',8]]);
  assert.equal(p.steps.reduce((a,x)=>a+x.seconds,0),timeBudget);
  assert.ok(p.steps.every(x=>x.seconds>0));
 }
});
test('legacy goal choices migrate to the single habit goal',()=>{for(const goal of ['habit','strength','energy'])assert.equal(load(JSON.stringify({...fresh(),goal})).goal,'habit');});
test('two minutes fits all five movements in order, with four station rests',()=>{
 const p=recipe(EMPTY);
 assert.deepEqual(p.steps.map(x=>[x.id,x.seconds]),[['prepare',8],['platform-pushup',24],['rest',5],['hanging-knee-raise',24],['rest',5],['bar-hang',10],['rest',5],['support-hold',10],['rest',5],['squat',24]]);
 assert.equal(p.seconds,120);
});
test('existing one-minute profile moves to two minutes without losing visits',()=>{const old={...fresh(),program:'personal-bars-v1',timeBudget:60,level:7,sessions:[visit('2026-10-01')]};const s=load(JSON.stringify(old));assert.equal(s.timeBudget,120);assert.equal(s.level,0);assert.deepEqual(s.sessions,old.sessions);assert.equal(load(JSON.stringify(s)).timeBudget,120);assert.equal(load(JSON.stringify({...s,timeBudget:60})).timeBudget,60);});
test('recovery keeps feet down at the bars and never prescribes a loaded hold',()=>{const p=recipe(fresh(),{sore:true});assert.equal(p.strength,false);assert.ok(p.steps.every(x=>x.kind!=='hold'));assert.ok(p.steps.every(x=>!['platform-pushup','hanging-knee-raise','support-hold'].includes(x.id)));assert.equal(p.steps.reduce((a,x)=>a+x.seconds,0),p.seconds);assert.ok(p.steps.some(x=>x.id==='bar-touch'));});
test('the small option is one minute and still honours a strength recovery day',()=>{const p=recipe(fresh(),{tiny:true});assert.equal(p.seconds,60);assert.equal(p.strength,true);const s={...fresh(),sessions:[visit('2026-10-21',{strength:true})]};const rest=recipe(s,{today:'2026-10-22',tiny:true});assert.equal(rest.mode,'recovery');assert.equal(rest.strength,false);});
test('every session respects the chosen time, including recovery',()=>{for(const timeBudget of [60,120,300,600])for(let level=0;level<8;level++){const s={...fresh(),timeBudget,level};for(const options of [{},{tiny:true},{sore:true}]){const p=recipe(s,options);assert.ok(p.seconds<=timeBudget);assert.equal(p.steps.reduce((a,x)=>a+x.seconds,0),p.seconds);}}});
test('progression never expands the user’s time commitment',()=>{for(const timeBudget of [60,120,300,600]){let s={...fresh(),timeBudget};for(let d=1;d<=28;d++){const date=`2026-10-${String(d).padStart(2,'0')}`;s=record(s,visit(date,{level:s.level,seconds:Math.min(timeBudget,LEVELS[s.level])})).state;}assert.equal(s.timeBudget,timeBudget);assert.ok(recipe(s,{today:'2026-10-29'}).seconds<=timeBudget);}});
test('progression requires three easy full days over at least seven calendar days',()=>{let s=fresh();s=record(s,visit('2026-10-01')).state;s=record(s,visit('2026-10-02')).state;let r=record(s,visit('2026-10-03'));assert.equal(r.promoted,false);assert.equal(r.state.level,0);r=record(r.state,visit('2026-10-07'));assert.equal(r.promoted,true);assert.equal(r.state.level,1);assert.equal(r.state.levelSince,'2026-10-07');});
test('same-day repeated completion cannot add a visit or promote twice',()=>{let s=record(fresh(),visit('2026-10-01')).state;const r=record(s,visit('2026-10-01'));assert.equal(r.changed,false);assert.equal(r.state.sessions.length,1);assert.equal(r.state.level,0);});
test('same-day repeat feedback preserves pain and lowers the dose at most once',()=>{
 let s=record({...fresh(),level:3},visit('2026-10-22',{level:3,effort:'okay'})).state;
 s=record(s,visit('2026-10-22',{level:3,effort:'hard',again:'no'})).state;
 assert.equal(s.level,2);
 s=record(s,visit('2026-10-22',{level:2,effort:'hard',again:'no'})).state;
 assert.equal(s.level,2);
 s=record(s,visit('2026-10-22',{level:2,effort:'pain',again:'no'})).state;
 assert.equal(s.level,2);
 s=record(s,visit('2026-10-22',{level:2,effort:'easy',again:'yes'})).state;
 assert.equal(s.sessions.length,1);
 assert.equal(s.sessions[0].effort,'pain');
 assert.equal(s.sessions[0].again,'no');
 assert.equal(recipe(s,{today:'2026-10-23'}).strength,false);
});
test('early, tiny, recovery, unenjoyed and old visits do not earn progression',()=>{for(const override of [{full:false},{mode:'tiny',seconds:60},{mode:'recovery'},{again:'no'},{effort:'okay'}]){let s=fresh();s=record(s,visit('2026-10-01',override)).state;s=record(s,visit('2026-10-04',override)).state;assert.equal(record(s,visit('2026-10-07',override)).promoted,false);}const s={...fresh(),levelSince:'2026-09-01',sessions:[visit('2026-09-01'),visit('2026-09-02')]};assert.equal(record(s,visit('2026-10-22')).promoted,false);});
test('a rest calendar day separates strength visits; weekly strength is capped at three',()=>{const s={...fresh(),level:2,sessions:[visit('2026-10-20',{level:2,strength:true,seconds:180})]};assert.equal(recipe(s,{today:'2026-10-21'}).mode,'recovery');assert.equal(recipe(s,{today:'2026-10-22'}).strength,true);s.sessions=[16,18,20].map(d=>visit(`2026-10-${d}`,{level:2,strength:true,seconds:180}));assert.equal(recipe(s,{today:'2026-10-22'}).strength,false);});
test('hard feedback lowers a level; pain stops strength and soreness selects an easy day',()=>{const s={...fresh(),level:3,levelSince:'2026-10-01'};const r=record(s,visit('2026-10-22',{level:3,seconds:100,full:false,effort:'pain',strength:true}));assert.equal(r.state.level,2);assert.equal(recipe(r.state,{today:'2026-10-23'}).strength,false);assert.equal(recipe({...s,sessions:[]},{sore:true}).mode,'recovery');assert.equal(record(s,visit('2026-10-22',{level:3,effort:'hard'})).state.level,2);});
test('disliking a visit selects the one-minute version next time',()=>{const s={...fresh(),level:3,sessions:[visit('2026-10-22',{level:3,again:'no'})]};assert.equal(recipe(s,{today:'2026-10-23'}).seconds,60);});
test('a week away returns to the first one-minute bar session',()=>{const s={...fresh(),level:7,sessions:[visit('2026-10-01',{level:7,seconds:600,strength:true})]};assert.equal(recipe(s,{today:'2026-10-22'}).mode,'restart');assert.equal(recipe(s,{today:'2026-10-22'}).seconds,60);});
test('completing a restart resets the dose while the selected time stays unchanged',()=>{const s={...fresh(),level:7,sessions:[visit('2026-10-01',{level:7,seconds:600,strength:true})]};const r=record(s,visit('2026-10-22',{level:7,mode:'restart'}));assert.equal(r.state.level,0);assert.equal(recipe(r.state,{today:'2026-10-23'}).seconds,600);assert.equal(recipe(r.state,{today:'2026-10-23'}).steps.find(x=>x.id==='platform-pushup').reps,8);});
test('stopping immediately for pain still selects a gentle next visit',()=>{const s={...fresh(),level:5,sessions:[visit('2026-10-22',{level:5,seconds:0,full:false,strength:false,effort:'pain'})]};assert.equal(recipe(s,{today:'2026-10-23'}).mode,'recovery');});
test('weather records neither activity time nor progression',()=>{const r=record(fresh(),visit('2026-10-22',{mode:'weather',seconds:0,full:false,effort:'skipped'}));assert.equal(r.state.sessions[0].seconds,0);assert.equal(r.promoted,false);});
test('backup validation rejects invalid dates, duplicates, excess durations and foreign schemas',()=>{assert.throws(()=>validate({...fresh(),sessions:[visit('2026-02-30')]}));assert.throws(()=>validate({...fresh(),sessions:[visit('2026-10-22'),visit('2026-10-22')]}));assert.throws(()=>validate({...fresh(),sessions:[visit('2026-10-22',{seconds:601})]}));assert.throws(()=>validate({...fresh(),version:2}));assert.deepEqual(load('not JSON'),structuredClone(EMPTY));assert.deepEqual(validate(fresh()),fresh());});
test('top level does not exceed ten minutes after further easy visits',()=>{const s={...fresh(),level:7,levelSince:'2026-10-01',sessions:[visit('2026-10-16',{level:7,seconds:600}),visit('2026-10-18',{level:7,seconds:600})]};const r=record(s,visit('2026-10-22',{level:7,seconds:600}));assert.equal(r.state.level,7);assert.equal(r.promoted,false);assert.equal(recipe(r.state,{today:'2026-10-24'}).seconds,600);});

test('one-minute small and restart routines keep all five movements with a smaller dose',()=>{const p=recipe({...EMPTY,timeBudget:60});const actions=p.steps.filter(x=>['hold','move'].includes(x.kind));assert.deepEqual(actions.map(x=>x.reps||x.seconds),[3,3,5,5,3]);assert.equal(p.steps.reduce((sum,x)=>sum+x.seconds,0),60);});
