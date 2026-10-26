import test from 'node:test';
import assert from 'node:assert/strict';
import {mount} from './helpers/app.mjs';
import {SESSION_STORAGE} from '../dist/sessions.mjs';

test('preparation previews the next movement and station without spending its exercise time',async()=>{
 const app=await mount();try{
  app.click('#start');
  assert.equal(app.document.documentElement.dataset.phase,'prepare');
  assert.match(app.root.innerHTML,/<h1>Get ready<\/h1>/);
  assert.match(app.root.innerHTML,/<span>Next:<\/span> Platform push-ups/);
  assert.match(app.root.innerHTML,/id="upcoming-station">Push-up platform/);
  assert.match(app.root.innerHTML,/Next exercise preview\. Platform push-up/);
  assert.match(app.root.innerHTML,/Prep time left/);
  assert.equal(app.node('#clock').textContent,'0:08');
  app.elapse(1.6);assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.elapse(6.4);
  assert.match(app.root.innerHTML,/<h1>Platform push-ups<\/h1>/);
  assert.doesNotMatch(app.root.innerHTML,/Next exercise preview/);
  assert.equal(app.document.documentElement.dataset.phase,'move');
  assert.equal(app.node('#clock').textContent,'0:24');
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
 }finally{app.restore();}
});

test('rest previews knee raises at the pull-up bar, freezes on pause and honors Reduce Motion',async()=>{
 const app=await mount();try{
  app.click('#start');app.elapse(32);
  assert.equal(app.document.documentElement.dataset.phase,'rest');
  assert.match(app.root.innerHTML,/<h1>Rest<\/h1>/);
  assert.match(app.root.innerHTML,/<span>Next:<\/span> Knee raises/);
  assert.match(app.root.innerHTML,/id="upcoming-station">Pull-up bar/);
  assert.match(app.root.innerHTML,/Rest time left/);
  assert.match(app.root.innerHTML,/aria-label="Rest time remaining"/);
  assert.equal(app.node('#clock').textContent,'0:15');
  app.elapse(1.6);assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.click('#pause');app.elapse(5);
  assert.equal(app.document.documentElement.dataset.phase,'rest');
  assert.equal(app.node('#clock').textContent,'0:14');
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.reduce(true);assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
  app.reduce(false);assert.equal(app.node('#movement-demo').attributes['data-frame'],'2');
  app.click('#pause');app.elapse(13.4);
  assert.equal(app.document.documentElement.dataset.phase,'move');
  assert.equal(app.node('#clock').textContent,'0:24');
  assert.equal(app.node('#movement-demo').attributes['data-frame'],'0');
 }finally{app.restore();}
});

test('kids rest previews squats at home; final rest shows no invented next movement',async()=>{
 const app=await mount();try{
  app.click('#session-kids');app.click('#start');app.elapse(25);
  assert.match(app.root.innerHTML,/<span>Next:<\/span> Squats/);
  assert.match(app.root.innerHTML,/id="upcoming-station">At home/);
  assert.equal(app.node('#clock').textContent,'0:20');
  app.elapse(40);
  assert.match(app.root.innerHTML,/<h1>Rest<\/h1>/);
  assert.match(app.root.innerHTML,/All movements done\./);
  assert.doesNotMatch(app.root.innerHTML,/Next exercise preview|upcoming-heading|movement-demo/);
  assert.equal(app.node('#clock').textContent,'0:20');
  app.elapse(19.8);assert.equal(app.node('#clock').textContent,'0:01');
  app.elapse(.2);assert.match(app.root.innerHTML,/Start workout/);
  assert.equal(app.document.documentElement.dataset.phase,'idle');
  assert.deepEqual(app.writes,[]);
 }finally{app.restore();}
});

test('custom previews skip intervening rest and preparation and use the edited movement',async()=>{
 const saved={[SESSION_STORAGE]:JSON.stringify({version:1,kids:[
  {id:'rest',seconds:2},{id:'prepare',seconds:3},{id:'rest',seconds:1},{id:'bar-hang',seconds:4},{id:'rest',seconds:2},{id:'rest',seconds:1}
 ]})};
 const app=await mount({saved});try{
  app.click('#session-kids');app.click('#start');
  for(const seconds of [2,3,1]){
   assert.match(app.root.innerHTML,/<span>Next:<\/span> Pull-up bar hang/);
   assert.match(app.root.innerHTML,/id="upcoming-station">Pull-up bar/);
   assert.equal(app.node('#movement-demo').attributes['data-frame'],'0','hold preview stays still');
   app.elapse(seconds);
  }
  assert.match(app.root.innerHTML,/<h1>Pull-up bar hang<\/h1>/);
  assert.equal(app.node('#clock').textContent,'0:04');
  app.elapse(4);assert.match(app.root.innerHTML,/All movements done/);
  assert.doesNotMatch(app.root.innerHTML,/movement-demo/);
  app.elapse(3);assert.equal(app.document.documentElement.dataset.phase,'idle');
 }finally{app.restore();}
});

test('guidance and backgrounding pause a preview; End restores the overview theme',async()=>{
 const app=await mount();try{
  app.click('#session-kids');app.click('#start');app.elapse(1);
  const frame=app.node('#movement-demo').attributes['data-frame'];
  app.node('details').ontoggle({currentTarget:{open:true}});app.elapse(5);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],frame);
  assert.equal(app.node('#clock').textContent,'0:04');
  app.click('#pause');app.visibility(true);app.elapse(5);
  assert.equal(app.node('#movement-demo').attributes['data-frame'],frame);
  app.visibility(false);app.click('#stop');
  assert.equal(app.document.documentElement.dataset.phase,'idle');
  assert.match(app.root.innerHTML,/Start workout/);
 }finally{app.restore();}
});
