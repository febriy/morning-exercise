import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {movementFrame,movementSprite} from '../dist/movements.mjs';
import {mount} from './helpers/app.mjs';

test('demos follow the prescribed dose: slow push-ups, one knee raise, steady support',()=>{
  assert.deepEqual([0,1,2,3,4,5,6].map(t=>movementFrame('platform-pushup',t)),[0,1,2,3,0,0,1]);
  assert.deepEqual([0,.8,1.6,2.4,3.2,4.9,20].map(t=>movementFrame('hanging-knee-raise',t)),[0,1,2,3,3,3,3]);
  assert.equal(movementFrame('support-hold',2),0);
  assert.equal(movementFrame('platform-pushup',2,{reduce:true}),0);
  assert.equal(movementFrame('hanging-knee-raise',NaN),0);
  assert.equal(movementSprite('bar-touch'),'');
});

test('every demo has a transparent, aligned four-frame strip and an accessible description',async()=>{
  for(const id of ['platform-pushup','hanging-knee-raise','support-hold']){
    const bytes=await readFile(new URL(`../dist/sprites/${id}.png`,import.meta.url));
    assert.equal(bytes.readUInt32BE(16),800);
    assert.equal(bytes.readUInt32BE(20),200);
    assert.equal(bytes[25],6,'RGBA transparency is preserved');
    assert.match(movementSprite(id),/role="img" aria-label="[^"]+"/);
    assert.match(movementSprite(id,{preview:true}),/aria-hidden="true"/);
  }
});

test('workout clock freezes the pose on pause, guidance, hidden tabs and Reduce Motion',async()=>{
  const app=await mount();try{
    app.click('#start');app.elapse(22.2);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
    app.click('#pause');app.elapse(4);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
    app.click('#pause');app.elapse(1);
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

test('resuming a completed knee-raise demo does not replay the attempt',async()=>{
  const app=await mount();try{
    app.click('#start');app.elapse(63.2);
    assert.match(app.root.innerHTML,/Hanging knee raise/);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
    app.click('#pause');app.elapse(4);app.click('#pause');
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
    app.elapse(1);
    assert.equal(app.node('#movement-demo').attributes['data-frame'],'3');
    app.elapse(1);
    assert.doesNotMatch(app.root.innerHTML,/id="movement-demo"/);
  }finally{app.restore();}
});
