import assert from 'node:assert/strict';
let mounts=0;
// Exercise the actual app's motion controls and lifecycle without a browser or timers.
export async function mount({reduce=false,host={},saved={},readBlocked=false,writeBlocked=false}={}) {
  const previous = new Map(['document','window','localStorage','setInterval','clearInterval','FormData'].map(k=>[k,globalThis[k]]));
  const events=new Map(), mediaEvents=new Map(), windowEvents=new Map(), nodes=new Map(), storage=new Map(Object.entries(saved));
  const writes=[];
  const realNow=Date.now;let now=realNow(),tick=null;Date.now=()=>now;
  const media={matches:reduce,addEventListener:(type,fn)=>mediaEvents.set(type,fn)};
  function node(selector){
    if(!nodes.has(selector))nodes.set(selector,{hidden:false,dataset:{effort:selector.match(/^\[data-effort="([^"]+)"\]$/)?.[1]},style:{setProperty(){}},attributes:{},events:new Map(),addEventListener(type,fn){this.events.set(type,fn);},setAttribute(k,v){this.attributes[k]=v;},focus(){this.focused=true;}});
    return nodes.get(selector);
  }
  const root={innerHTML:'',querySelector(selector){
    if(selector.startsWith('#')&&!this.innerHTML.includes(`id="${selector.slice(1)}"`))return null;
    return node(selector);
  },querySelectorAll(selector){return selector==='[data-effort]'?[...this.innerHTML.matchAll(/data-effort="([^"]+)"/g)].map(match=>node(`[data-effort="${match[1]}"]`)):[];}};
  const document={hidden:false,documentElement:{dataset:{}},querySelector:s=>s==='#app'?root:node(s),addEventListener:(type,fn)=>events.set(type,fn)};
  globalThis.document=document;
  globalThis.window={matchMedia:()=>media,addEventListener:(type,fn)=>windowEvents.set(type,fn),scrollTo(){},...host};
  globalThis.localStorage={getItem:k=>{if(readBlocked)throw Error('Storage blocked');return storage.get(k)??null;},setItem:(k,v)=>{writes.push([k,v]);if(writeBlocked)throw Error('Storage blocked');storage.set(k,v);},removeItem:k=>storage.delete(k)};
  globalThis.FormData=class {constructor(form){this.time=form.time;}get(name){return name==='time'?String(this.time):null;}};
  globalThis.setInterval=fn=>{tick=fn;return 1;};
  globalThis.clearInterval=()=>{tick=null;};
  try {await import(`../../dist/app.mjs?app-test=${++mounts}`);}
  catch(error){Date.now=realNow;for(const [k,v] of previous){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}throw error;}
  return {document,media,root,node,storage,writes,
    submitTime(time){node('#setup').onsubmit({preventDefault(){},currentTarget:{time}});},
    storageEvent(key,newValue){windowEvents.get('storage')({key,newValue});},
    elapse(seconds){for(let ms=0;ms<seconds*1000;ms+=200){now+=200;tick?.();}},
    jump(seconds){now+=seconds*1000;tick?.();},
    pagehide(){windowEvents.get('pagehide')?.();},
    click:id=>{const el=root.querySelector(id);assert.ok(el,`Missing ${id}`);(el.events.get('click')??el.onclick)();},
    visibility(hidden){document.hidden=hidden;events.get('visibilitychange')();},
    reduce(value){media.matches=value;mediaEvents.get('change')();},
    restore(){Date.now=realNow;for(const [k,v] of previous){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
  };
}
