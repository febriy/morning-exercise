import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the actual app's motion controls and lifecycle without a browser or timers.
async function mount({reduce=false}={}) {
  const previous = new Map(['document','window','localStorage','setInterval','clearInterval'].map(k=>[k,globalThis[k]]));
  const events=new Map(), mediaEvents=new Map(), nodes=new Map(), storage=new Map();
  const media={matches:reduce,addEventListener:(type,fn)=>mediaEvents.set(type,fn)};
  function node(selector){
    if(!nodes.has(selector))nodes.set(selector,{hidden:false,style:{setProperty(){}},attributes:{},events:new Map(),addEventListener(type,fn){this.events.set(type,fn);},setAttribute(k,v){this.attributes[k]=v;}});
    return nodes.get(selector);
  }
  const root={innerHTML:'',querySelector(selector){
    if(selector.startsWith('#')&&!this.innerHTML.includes(`id="${selector.slice(1)}"`))return null;
    return node(selector);
  },querySelectorAll(){return [];}};
  const document={hidden:false,documentElement:{dataset:{}},querySelector:s=>s==='#app'?root:node(s),addEventListener:(type,fn)=>events.set(type,fn)};
  globalThis.document=document;
  globalThis.window={matchMedia:()=>media,addEventListener(){},scrollTo(){}};
  globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
  globalThis.setInterval=()=>1;
  globalThis.clearInterval=()=>{};
  try {await import(`../dist/app.mjs?motion-test=${Math.random()}`);}
  catch(error){for(const [k,v] of previous){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}throw error;}
  return {document,media,root,node,
    click:id=>{const el=root.querySelector(id);assert.ok(el,`Missing ${id}`);(el.events.get('click')??el.onclick)();},
    visibility(hidden){document.hidden=hidden;events.get('visibilitychange')();},
    reduce(value){media.matches=value;mediaEvents.get('change')();},
    restore(){for(const [k,v] of previous){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
  };
}

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
