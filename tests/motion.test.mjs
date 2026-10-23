import test from 'node:test';
import assert from 'node:assert/strict';

import {mount} from './helpers/app.mjs';

test('background can be paused and resumed with an accurately named control',async()=>{
  const app=await mount();try{
    assert.equal(app.document.documentElement.dataset.background,'moving');
    app.click('#background-motion');
    assert.equal(app.document.documentElement.dataset.background,'still');
    assert.equal(app.node('#background-motion').attributes['aria-label'],'Play background motion');
    app.click('#background-motion');
    assert.equal(app.document.documentElement.dataset.background,'moving');
    assert.equal(app.node('#background-motion').attributes['aria-label'],'Pause background motion');
  }finally{app.restore();}
});

test('Reduce Motion freezes the background and removes the redundant control, including live changes',async()=>{
  const app=await mount({reduce:true});try{
    assert.equal(app.document.documentElement.dataset.background,'still');
    assert.equal(app.node('#background-motion').hidden,true);
    app.reduce(false);
    assert.equal(app.document.documentElement.dataset.background,'moving');
    assert.equal(app.node('#background-motion').hidden,false);
    app.reduce(true);
    assert.equal(app.document.documentElement.dataset.background,'still');
  }finally{app.restore();}
});

test('background sleeps in a hidden tab and resumes only when allowed',async()=>{
  const app=await mount();try{
    app.visibility(true);assert.equal(app.document.documentElement.dataset.background,'still');
    app.visibility(false);assert.equal(app.document.documentElement.dataset.background,'moving');
    app.click('#background-motion');app.visibility(true);app.visibility(false);
    assert.equal(app.document.documentElement.dataset.background,'still');
  }finally{app.restore();}
});

test('starting a workout freezes the scene through pause and resume; ending restores the prior preference',async()=>{
  const app=await mount();try{
    app.click('#start');assert.equal(app.document.documentElement.dataset.background,'still');
    app.click('#pause');assert.equal(app.document.documentElement.dataset.background,'still');
    app.click('#pause');assert.equal(app.document.documentElement.dataset.background,'still');
    app.click('#stop');assert.equal(app.document.documentElement.dataset.background,'moving');
    app.click('#background-motion');
    assert.equal(app.document.documentElement.dataset.background,'still');
  }finally{app.restore();}
});
