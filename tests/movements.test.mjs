import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {movementFrame,movementSprite} from '../dist/movements.mjs';
import {mount} from './helpers/app.mjs';

test('repetition demos cycle eight times in 24 seconds while both holds stay still',()=>{
 for(const id of ['platform-pushup','hanging-knee-raise','squat']){
  assert.deepEqual([0,.8,1.6,2.4,3,3.8].map(t=>movementFrame(id,t)),[0,1,2,3,0,1]);
  for(let rep=0;rep<8;rep++)assert.equal(movementFrame(id,rep*3+1.6),2);
 }
 for(const id of ['bar-hang','support-hold'])for(const t of [0,2,5,9.9])assert.equal(movementFrame(id,t),0);
 assert.equal(movementFrame('platform-pushup',2,{reduce:true}),0);
 assert.equal(movementFrame('hanging-knee-raise',NaN),0);
 assert.equal(movementSprite('bar-touch'),'');
 assert.match(movementSprite('bar-hang'),/sprites\/hanging-knee-raise.png/);
});

test('every demo has a transparent, aligned four-frame strip and an accessible description',async()=>{
  for(const id of ['platform-pushup','hanging-knee-raise','support-hold','squat','jumping-jacks','kettlebell-squat','kettlebell-swing']){
    const bytes=await readFile(new URL(`../dist/sprites/${id}.png`,import.meta.url));
    assert.equal(bytes.readUInt32BE(16),800);
    assert.equal(bytes.readUInt32BE(20),200);
    assert.equal(bytes[25],6,'RGBA transparency is preserved');
    assert.match(movementSprite(id),/role="img" aria-label="[^"]+"/);
    assert.match(movementSprite(id,{preview:true}),/aria-hidden="true"/);
  }
});

test('jumping jacks loop from the exercise clock and freeze with pause or Reduce Motion',async()=>{
 assert.deepEqual([0,.5,1,1.5,2].map(t=>movementFrame('jumping-jacks',t)),[0,1,2,3,0]);
 const app=await mount();try{
  app.click('#session-kids');app.click('#start');app.elapse(6);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.click('#pause');app.elapse(5);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.reduce(true);assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
  app.reduce(false);assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
 }finally{app.restore();}
});

test('workout clock freezes the pose on pause, guidance, hidden tabs and Reduce Motion',async()=>{
  const app=await mount();try{
    app.click('#start');app.elapse(9.6);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
    app.click('#pause');app.elapse(4);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
    app.click('#pause');app.elapse(.8);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
    app.reduce(true);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
    app.reduce(false);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
    app.node('details').ontoggle({currentTarget:{open:true}});app.elapse(4);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
    app.click('#pause');app.visibility(true);app.elapse(4);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
  }finally{app.restore();}
});

test('pausing knee raises preserves the current rep and resumes the demonstration',async()=>{
 const app=await mount();try{
  app.click('#start');app.elapse(38.6);
  assert.match(app.root.innerHTML,/Knee raises/);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.click('#pause');app.elapse(4);app.click('#pause');
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.elapse(.8);assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
  app.elapse(.8);assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
  app.elapse(20.8);assert.match(app.root.innerHTML,/Next exercise preview\. Steady hang/);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
 }finally{app.restore();}
});
