import test from 'node:test';
import assert from 'node:assert/strict';
import {mount} from './helpers/app.mjs';

test('finishing a workout offers an explicit return to the main workout without mandatory feedback',async()=>{
  const app=await mount();try{
    app.click('#start');app.elapse(120);
    assert.match(app.root.innerHTML,/That’s your/);
    app.click('#home');
    assert.match(app.root.innerHTML,/aria-label="Today’s movements"/);
    assert.doesNotMatch(app.root.innerHTML,/How did that feel/);
    assert.equal(app.node('#main').focused,true);
    const saved=JSON.parse(app.storage.get('on-the-way.v1'));
    assert.equal(saved.sessions[0].effort,'skipped','returning does not invent an effort rating');
    assert.equal(saved.sessions[0].again,'maybe');
  }finally{app.restore();}
});

test('a saved visit keeps the main screen and allows a fresh timer without duplicate daily credit',async()=>{
  let saved;
  const app=await mount();try{
    app.click('#start');app.elapse(120);app.click('[data-effort="easy"]');
    saved=app.storage.get('on-the-way.v1');
    assert.match(app.root.innerHTML,/Start again/);
    app.click('#start');
    assert.match(app.root.innerHTML,/1 of 3/,'repeat keeps the existing recovery policy');
    assert.equal(app.node('#remaining').textContent,'2 min remaining');
    app.elapse(120);app.click('#home');
    assert.equal(app.storage.get('on-the-way.v1'),saved,'replaying does not add credit or promote');
  }finally{app.restore();}
  const reopened=await mount({saved:{'on-the-way.v1':saved}});try{
    assert.match(reopened.root.innerHTML,/Today’s movements/);
    assert.match(reopened.root.innerHTML,/Start again/);
    reopened.click('#start');
    assert.equal(reopened.node('#remaining').textContent,'2 min remaining');
  }finally{reopened.restore();}
});

test('an immediate accidental start can return directly without feedback or a saved visit',async()=>{
  const app=await mount();try{
    app.click('#start');app.click('#stop');
    assert.match(app.root.innerHTML,/Today’s movements/);
    assert.match(app.root.innerHTML,/Start workout/);
    assert.doesNotMatch(app.root.innerHTML,/How did that feel/);
    assert.equal(app.storage.get('on-the-way.v1'),undefined);
    assert.equal(app.storage.get('on-the-way.pending.v1'),undefined);
  }finally{app.restore();}
});

test('an existing feedback draft has a neutral return route after reopening',async()=>{
  const first=await mount();let draft;try{
    first.click('#start');first.elapse(120);draft=first.storage.get('on-the-way.pending.v1');
  }finally{first.restore();}
  const app=await mount({saved:{'on-the-way.pending.v1':draft}});try{
    app.click('#home');
    assert.match(app.root.innerHTML,/Today’s movements/);
    assert.match(app.root.innerHTML,/Start again/);
    assert.equal(app.storage.get('on-the-way.pending.v1'),undefined);
    assert.equal(JSON.parse(app.storage.get('on-the-way.v1')).sessions.length,1);
  }finally{app.restore();}
});

test('pain reported after restarting is retained without adding a second daily visit',async()=>{
  const app=await mount();try{
    app.click('#start');app.elapse(120);app.click('#home');
    app.click('#start');app.elapse(1);app.click('#stop');app.click('[data-effort="pain"]');
    const saved=JSON.parse(app.storage.get('on-the-way.v1'));
    assert.equal(saved.sessions.length,1);
    assert.equal(saved.sessions[0].effort,'pain');
    assert.equal(saved.sessions[0].again,'no');
    assert.match(app.root.innerHTML,/Resume only once symptoms have resolved/);
  }finally{app.restore();}
});

test('choosing feedback returns to the main workout rather than a completion dead end',async()=>{
  const app=await mount();try{
    app.click('#start');app.elapse(120);
    app.click('[data-effort="okay"]');
    assert.match(app.root.innerHTML,/aria-label="Today’s movements"/);
    const saved=JSON.parse(app.storage.get('on-the-way.v1'));
    assert.equal(saved.sessions.length,1);
    assert.equal(saved.sessions[0].effort,'okay');
  }finally{app.restore();}
});
