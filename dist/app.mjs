import {loadPreferences,recipe,kidsRecipe,duration} from './model.mjs?v=kids-prep-1';
import {createTrainer} from './trainer.mjs?v=safari-audio-1';
import {movementSprite,movementFrame} from './movements.mjs?v=kids-prep-1';
const trainer=createTrainer(window);

const PREFERENCES='on-the-way.preferences.v1';
const root=document.querySelector('#app');
let state;
try {
  const saved=localStorage.getItem(PREFERENCES);
  state=loadPreferences(saved,saved===null?localStorage.getItem('on-the-way.v1'):null);
}catch{state=loadPreferences(null);}
let active=null,interval=null,editing=false,storageProblem=false,session='morning';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let backgroundPaused=false;
function syncBackground(){
  const paused=backgroundPaused||reducedMotion.matches||document.hidden||!!active;
  document.documentElement.dataset.background=paused?'still':'moving';
  const control=root.querySelector('#background-motion');
  if(control){control.hidden=reducedMotion.matches;control.setAttribute('aria-label',backgroundPaused?'Play background motion':'Pause background motion');control.title=backgroundPaused?'Play background motion':'Pause background motion';control.innerHTML=icon(backgroundPaused?'play':'pause');}
}
reducedMotion.addEventListener('change',()=>{syncBackground();updateDemo();});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({back:'<path d="m14 6-6 6 6 6"/>',edit:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',pause:'<path d="M9 6v12m6-12v12"/>',play:'<path d="m9 5 10 7-10 7z"/>',check:'<path d="m5 12 4 4L19 6"/>',walk:'<circle cx="13" cy="4" r="2"/><path d="m11 8-3 5-4 1m6-1 5 3 3 5m-6-5-4 5m3-12 5 3 4-1"/>',shoulders:'<circle cx="12" cy="6" r="3"/><path d="M8 21v-8H4m12 8v-8h4M8 4 5 6l-1-3m12 1 3 2 1-3"/>',rest:'<path d="M4 12h16M7 8h10M9 16h6"/>',hang:'<path d="M3 3h18M8 3v6l4 3 4-3V3m-4 9v5m0 0-3 5m3-5 3 5"/><circle cx="12" cy="8" r="2"/>',support:'<path d="M4 10v12m16-12v12M2 10h5m10 0h5M8 10l1-4h6l1 4m-4-3v8m0 0-3 7m3-7 3 7"/><circle cx="12" cy="3" r="2"/>',squat:'<circle cx="13" cy="4" r="2"/><path d="m12 8-4 5 7 3-2 5m-5-8-4 5 3 3m4-11 8 1"/>',push:'<path d="M20 3v18M5 21l5-13 5 4h5"/><circle cx="14" cy="5" r="2"/>'})[name]||'<path d="M6 12h12m-6-6v12"/>'}</svg>`;

function save(){
  try { localStorage.setItem(PREFERENCES,JSON.stringify({timeBudget:state.timeBudget})); storageProblem=false; }
  catch { storageProblem=true; }
}
function focusScreen(){window.scrollTo(0,0);root.querySelector('#main')?.focus({preventScroll:true});}
function backgroundControl(){return `<button class="icon-button background-control" id="background-motion" aria-label="${backgroundPaused?'Play':'Pause'} background motion" title="${backgroundPaused?'Play':'Pause'} background motion" ${reducedMotion.matches?'hidden':''}>${icon(backgroundPaused?'play':'pause')}</button>`;}
function sessionPicker(){return `<div class="session-picker" role="group" aria-label="Workout session"><button id="session-morning" aria-label="Morning fitness corner" aria-pressed="${session==='morning'}">Morning</button><button id="session-kids" aria-label="Exercise with kids" aria-pressed="${session==='kids'}">With kids</button></div>`;}
function header({back=false}={}){return `<header class="header">${back?`<button class="icon-button" id="back" aria-label="Back to workout">${icon('back')}</button>`:sessionPicker()}<div class="header-actions">${backgroundControl()}${!back&&session==='morning'?`<button class="time-button" id="edit" aria-label="Change time">${icon('edit')}<span>Time</span></button>`:''}</div></header>`;}
function render(){
  syncBackground();
  document.querySelector('#overlay').innerHTML='';
  if(active){renderPlayer();return;}
  if(editing){renderSetup();return;}
  renderToday();
}
function bindBackground(){root.querySelector('#background-motion')?.addEventListener('click',()=>{backgroundPaused=!backgroundPaused;syncBackground();});syncBackground();}
function bindSessions(){for(const name of ['morning','kids'])root.querySelector(`#session-${name}`)?.addEventListener('click',()=>{if(session===name)return;session=name;render();focusScreen();});}
function bindEdit(){bindSessions();root.querySelector('#edit')?.addEventListener('click',()=>{editing=true;render();focusScreen();});bindBackground();}
function storageNote(){return storageProblem?'<p class="notice" role="status">Your time choice works for this visit, but this browser cannot remember it.</p>':'';}
function renderSetup(){
  const selectedTime=state.timeBudget;
  root.innerHTML=`<div class="app-shell setup-shell">${header({back:editing})}<main id="main" tabindex="-1"><div class="intro"><h1>A little time<br>for yourself.</h1><p>Push-ups. Knee raises. A bar hang.<br>A parallel-bar hold. Squats.</p></div><form id="setup"><fieldset class="time-field"><legend>How much time per visit?</legend><div class="time-options">${[60,120,300,600].map(value=>`<label class="time-option"><input type="radio" name="time" value="${value}" ${selectedTime===value?'checked':''}><span>${value/60} min</span></label>`).join('')}</div></fieldset>${storageNote()}<button class="primary" id="setup-done" type="submit">Update my workout ${icon('arrow')}</button></form></main></div>`;
  root.querySelector('#setup').onsubmit=e=>{
    e.preventDefault();const form=new FormData(e.currentTarget),timeBudget=Number(form.get('time'));
    state.timeBudget=loadPreferences(JSON.stringify({timeBudget})).timeBudget;editing=false;save();render();focusScreen();
  };
  root.querySelector('#back')?.addEventListener('click',()=>{editing=false;render();focusScreen();});
  bindBackground();
}
function planGroups(plan){
  const actions=plan.steps.filter(step=>step.kind==='hold'||step.kind==='move');
  const groups=new Map();
  for(const step of actions){const existing=groups.get(step.id);if(existing)existing.count++;else groups.set(step.id,{...step,count:1});}
  return [...groups.values()];
}
function renderToday(){
  const kids=session==='kids',plan=kids?kidsRecipe():recipe(state),steps=kids?plan.steps:planGroups(plan);
  root.innerHTML=`<div class="app-shell">${header()}<main id="main" tabindex="-1" class="today-main${!kids&&steps.length===5?' five-movements':''}"><div class="workout-heading"><h1>${kids?'Exercise<br>with kids.':'Your corner<br>routine.'}</h1><p>${kids?'A little movement, together.':'Five movements. Go at your pace.'}</p></div><div class="workout-meta"><span class="duration">${duration(plan.seconds)}</span><span>Rest included</span></div><ol class="workout-card" aria-label="${kids?'Exercise with kids steps':'Today’s movements'}">${steps.map((step,index)=>`<li class="movement-row"><span class="station-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>${movementSprite(step.id,{preview:true})||`<span class="movement-icon">${icon('rest')}</span>`}<span class="movement-info"><span class="movement-name">${escape(step.title)}</span><span class="movement-station">${escape(step.station)}</span></span><span class="movement-time">${step.count>1?`${step.count} × `:''}<strong>${step.reps||step.seconds}</strong><span>${step.reps?(step.reps===1?'rep':'reps'):'sec'}</span></span></li>`).join('')}</ol><p class="routine-note">Pause for more rest whenever you need.</p>${!kids?storageNote():''}<div class="start-area"><button class="primary" id="start">Start workout ${icon('play')}</button>${!kids&&plan.seconds>60?'<button class="text-button" id="tiny">Just one minute today</button>':''}<p class="safety-line">${kids?'Make a little space. Go at your own pace.': 'Use only a dry, stable station that fits the instructions. Stop for pain or feeling unwell. Get advice first if a condition or injury limits exercise.'}</p></div></main></div>`;
  bindEdit();
  root.querySelector('#start')?.addEventListener('click',()=>start(plan));
  root.querySelector('#tiny')?.addEventListener('click',()=>start(recipe(state,{tiny:true})));
}

function start(plan){
  if(active)return;
  trainer.unlock();
  document.querySelector('#toast').textContent='';
  active={...plan,index:0,spent:0,stepSpent:0,tick:Date.now(),paused:false};
  renderPlayer();trainer.begin(active.steps[0]);interval=setInterval(tick,200);focusScreen();
}
function tick(){
  if(!active||active.paused)return;
  const now=Date.now();let remaining=Math.max(0,(now-active.tick)/1000);active.tick=now;
  if(remaining>3){pause();return;}
  while(active&&remaining>0){
    const step=active.steps[active.index];const used=Math.min(remaining,step.seconds-active.stepSpent);
    active.stepSpent+=used;active.spent+=used;remaining-=used;
    if(active.stepSpent>=step.seconds-.001){active.index++;active.stepSpent=0;if(active.index===active.steps.length){finish(true);return;}trainer.begin(active.steps[active.index]);renderPlayer();}
  }
  if(active)trainer.countdown(active.steps[active.index].seconds-active.stepSpent);
  updateClock();
}
function updateDemo(){
  if(!active)return;
  root.querySelector('#movement-demo')?.setAttribute('data-frame',String(movementFrame(active.steps[active.index].id,active.stepSpent,{reduce:reducedMotion.matches})));
}
function updateClock(){
  if(!active)return;
  updateDemo();
  const step=active.steps[active.index];const left=Math.max(0,Math.ceil(step.seconds-active.stepSpent-.001));
  const clock=root.querySelector('#clock');if(clock)clock.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
  root.querySelector('#ring')?.style.setProperty('--progress',`${Math.min(100,active.stepSpent/step.seconds*100)}%`);
  const remaining=root.querySelector('#remaining');if(remaining)remaining.textContent=`${duration(Math.ceil(Math.max(0,active.seconds-active.spent)))} remaining`;
}
function pause(){if(!active)return;active.paused=true;trainer.stop();renderPlayer();}
function renderPlayer(){
  syncBackground();
  const step=active.steps[active.index],next=active.steps[active.index+1],demo=movementSprite(step.id);
  root.innerHTML=`<div class="app-shell player-shell${step.kind==='rest'?' is-rest':''}${active.paused?' is-paused':''}"><header class="header"><span class="wordmark">${session==='kids'?'With kids':'On the Way'}</span><span class="step-count">${active.index+1} of ${active.steps.length}</span></header><main id="main" tabindex="-1"><div class="player-heading"><h1>${escape(step.title)}</h1><p class="player-station">${escape(step.station)}</p></div><div class="movement-stage${demo?' has-demo':''}">${demo}<div class="timer-ring" id="ring"><div><span id="clock" class="clock" role="timer" aria-label="Time remaining in this movement"></span><span class="player-status" role="status">${active.paused?'Paused':'Keep it easy'}</span></div></div></div><p class="cue">${active.paused?'Feet down. Rest, and resume only when ready.':escape(step.cue)}</p><details class="form-cue"><summary>A little guidance</summary><p>${escape(step.tip)}</p></details><p class="next-step">${next?`Next: ${escape(next.title)}`:'Then you’re done.'}</p><div class="player-controls"><button class="primary" id="pause">${active.paused?'Resume':'Pause'} ${icon(active.paused?'play':'pause')}</button><button class="text-button" id="stop">End workout</button><p id="remaining" class="remaining"></p></div></main></div>`;
  root.querySelector('#pause').onclick=()=>{if(!active.paused){pause();return;}trainer.unlock();active.paused=false;active.tick=Date.now();trainer.begin(active.steps[active.index],active.steps[active.index].seconds-active.stepSpent);renderPlayer();};
  root.querySelector('#stop').onclick=()=>finish(false);
  root.querySelector('details').ontoggle=e=>{if(e.currentTarget.open&&active&&!active.paused){active.paused=true;trainer.stop();root.querySelector('#pause').innerHTML=`Resume ${icon('play')}`;root.querySelector('.player-status').textContent='Paused';root.querySelector('.cue').textContent='Feet down. Rest, and resume only when ready.';}};
  updateClock();
}
function finish(full){
  if(!active)return;
  clearInterval(interval);interval=null;
  if(full)trainer.complete();else trainer.stop();
  active=null;editing=false;render();focusScreen();
  document.querySelector('#toast').textContent=full?'Workout complete. Ready to start again.':'Workout ended. Ready to start again.';
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)trainer.stop();syncBackground();if(document.hidden&&active&&!active.paused)pause();else if(!document.hidden&&!active&&!editing)render();});
window.addEventListener('beforeunload',e=>{if(active){e.preventDefault();e.returnValue='';}});
window.addEventListener('pagehide',()=>{trainer.stop();if(active&&!active.paused){active.paused=true;renderPlayer();}});
window.addEventListener('storage',e=>{if(e.key!==PREFERENCES&&e.key!==null)return;state=loadPreferences(e.newValue);if(active)pause();else if(!editing)render();});
window.addEventListener('pageshow',()=>{if(!active&&!editing)render();});
render();
