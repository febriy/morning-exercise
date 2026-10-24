import {loadPreferences,recipe,duration} from './model.mjs?v=next-exercise-1';
import {createTrainer} from './trainer.mjs?v=safari-audio-1';
import {movementSprite,movementFrame} from './movements.mjs?v=next-exercise-1';
import {SESSION_STORAGE,MAX_STEPS,EXERCISES,defaultPlan,editableSteps,sessionError,loadSessions,sessionPlan} from './sessions.mjs?v=next-exercise-1';
const trainer=createTrainer(window);

const PREFERENCES='on-the-way.preferences.v1';
const root=document.querySelector('#app');
let state;
try {
  const saved=localStorage.getItem(PREFERENCES);
  state=loadPreferences(saved,saved===null?localStorage.getItem('on-the-way.v1'):null);
}catch{state=loadPreferences(null);}
let active=null,interval=null,editing=false,storageProblem=false,session='morning';
let sessions={};try{sessions=loadSessions(localStorage.getItem(SESSION_STORAGE));}catch{}
let draft=null,sessionStorageProblem=false;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let backgroundPaused=false;
function syncBackground(){
  const paused=backgroundPaused||reducedMotion.matches||document.hidden||!!active;
  document.documentElement.dataset.background=paused?'still':'moving';
  document.documentElement.dataset.phase=active?.steps[active.index]?.kind||'idle';
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
function header({back=false}={}){return `<header class="header">${back?`<button class="icon-button" id="back" aria-label="Back to workout">${icon('back')}</button>`:sessionPicker()}<div class="header-actions">${backgroundControl()}${!back&&session==='morning'&&!sessions.morning?`<button class="time-button" id="edit" aria-label="Change time">${icon('edit')}<span>Time</span></button>`:''}</div></header>`;}
function render(){
  syncBackground();
  document.querySelector('#overlay').innerHTML='';
  if(active){renderPlayer();return;}
  if(draft){renderEditor();return;}
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
  const kids=session==='kids',custom=!!sessions[session],plan=sessionPlan(session,state,sessions),steps=kids||custom?plan.steps:planGroups(plan);
  root.innerHTML=`<div class="app-shell">${header()}<main id="main" tabindex="-1" class="today-main${!kids&&steps.length===5?' five-movements':''}"><div class="workout-heading"><h1>${kids?'Exercise<br>with kids.':'Your corner<br>routine.'}</h1><p>${kids?'A little movement, together.':(custom?'Your movements. Your pace.':'Five movements. Go at your pace.')}</p></div><div class="workout-meta"><span class="duration">${duration(plan.seconds)}</span><button class="edit-session" id="edit-session">Edit session ${icon('edit')}</button></div><ol class="workout-card" aria-label="${kids?'Exercise with kids steps':'Today’s movements'}">${steps.map((step,index)=>`<li class="movement-row"><span class="station-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>${movementSprite(step.id,{preview:true})||`<span class="movement-icon">${icon('rest')}</span>`}<span class="movement-info"><span class="movement-name">${escape(step.title)}</span><span class="movement-station">${escape(step.station)}</span></span><span class="movement-time">${step.count>1?`${step.count} × `:''}<strong>${step.reps||step.seconds}</strong><span>${step.reps?(step.reps===1?'rep':'reps'):'sec'}</span></span></li>`).join('')}</ol><p class="routine-note">Pause for more rest whenever you need.</p>${!kids?storageNote():''}${sessionStorageProblem?'<p class="notice" role="status">Your changes work for this visit, but this browser cannot remember them.</p>':''}<div class="start-area"><button class="primary" id="start">Start workout ${icon('play')}</button>${!kids&&!custom&&plan.seconds>60?'<button class="text-button" id="tiny">Just one minute today</button>':''}<p class="safety-line">${kids?'Make a little space. Go at your own pace.': 'Use only a dry, stable station that fits the instructions. Stop for pain or feeling unwell. Get advice first if a condition or injury limits exercise.'}</p></div></main></div>`;
  bindEdit();
  root.querySelector('#edit-session').onclick=()=>{draft=editableSteps(plan);render();focusScreen();};
  root.querySelector('#start')?.addEventListener('click',()=>start(plan));
  root.querySelector('#tiny')?.addEventListener('click',()=>start(recipe(state,{tiny:true})));
}

function draftSteps(){return draft.map(step=>({id:step.id,seconds:Number(step.seconds)}));}
function updateEditorTotal(){
  const steps=draftSteps(),total=steps.reduce((sum,step)=>sum+step.seconds,0);
  root.querySelector('#editor-total').textContent=steps.length&&steps.every(step=>Number.isInteger(step.seconds)&&step.seconds>0)?duration(total):'—';
}
function renderEditor(){
  root.innerHTML=`<div class="app-shell editor-shell">${header({back:true})}<main id="main" tabindex="-1"><div class="editor-heading"><h1>Edit session.</h1><p>${session==='kids'?'Exercise with kids':'Morning fitness corner'}</p><p>Choose each movement and its seconds.</p></div><form id="session-editor" novalidate><div class="editor-list">${draft.map((step,index)=>`<fieldset class="editor-step"><legend>Step ${index+1}</legend><div class="editor-fields"><label>Exercise<select id="type-${index}" aria-label="Step ${index+1} exercise">${EXERCISES.map(choice=>`<option value="${choice.id}" ${step.id===choice.id?'selected':''}>${escape(choice.title)}</option>`).join('')}</select></label><label class="seconds-field">Seconds<input id="seconds-${index}" aria-label="Step ${index+1} seconds" type="number" inputmode="numeric" min="1" max="600" step="1" required value="${escape(step.seconds)}"></label><button type="button" class="icon-button remove-step" id="remove-${index}" aria-label="Remove step ${index+1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 3h6l1 4M6 7l1 14h10l1-14M10 11v6m4-6v6"/></svg></button></div></fieldset>`).join('')}</div>${!draft.length?'<p class="editor-empty">Add your first exercise to build this session.</p>':''}<button class="add-step" id="add-step" type="button" ${draft.length>=MAX_STEPS?'disabled':''}>Add step ${icon('plus')}</button>${draft.length>=MAX_STEPS?'<p class="routine-note">20 steps is the limit for one session.</p>':''}<div class="editor-summary"><span>Total time</span><strong id="editor-total"></strong></div><p class="editor-help">Up to 10 minutes. Remembered on this browser.</p><p id="editor-error" class="editor-error" role="alert" tabindex="-1" hidden></p><button class="primary" type="submit">Save changes ${icon('check')}</button><button class="text-button" id="restore-session" type="button">Restore original routine</button></form></main></div>`;
  root.querySelector('#back').onclick=()=>{draft=null;render();focusScreen();document.querySelector('#toast').textContent='Changes discarded.';};
  for(let index=0;index<draft.length;index++){
    root.querySelector(`#type-${index}`).addEventListener('change',e=>{draft[index].id=e.currentTarget.value;});
    root.querySelector(`#seconds-${index}`).addEventListener('input',e=>{draft[index].seconds=e.currentTarget.value;updateEditorTotal();});
    root.querySelector(`#remove-${index}`).onclick=()=>{draft.splice(index,1);renderEditor();root.querySelector(`#type-${Math.min(index,draft.length-1)}`)?.focus();if(!draft.length)root.querySelector('#add-step').focus();};
  }
  root.querySelector('#add-step').onclick=()=>{if(draft.length>=MAX_STEPS)return;draft.push({id:'squat',seconds:20});renderEditor();root.querySelector(`#type-${draft.length-1}`).focus();};
  root.querySelector('#restore-session').onclick=()=>{draft=editableSteps(defaultPlan(session,state));renderEditor();focusScreen();document.querySelector('#toast').textContent='Original routine restored in the editor. Save changes to apply it.';};
  root.querySelector('#session-editor').onsubmit=e=>{
    e.preventDefault();const steps=draftSteps(),error=sessionError(steps);
    if(error){const notice=root.querySelector('#editor-error');notice.hidden=false;notice.textContent=error;notice.focus();for(let index=0;index<steps.length;index++)root.querySelector(`#seconds-${index}`).setAttribute('aria-invalid',String(!Number.isInteger(steps[index].seconds)||steps[index].seconds<1||steps[index].seconds>600));return;}
    const previous=JSON.stringify(sessions[session]??null),original=JSON.stringify(steps)===JSON.stringify(editableSteps(defaultPlan(session,state)));
    if(original)delete sessions[session];else sessions[session]=steps;
    if(previous!==JSON.stringify(sessions[session]??null)||sessionStorageProblem){try{localStorage.setItem(SESSION_STORAGE,JSON.stringify({version:1,...sessions}));sessionStorageProblem=false;}catch{sessionStorageProblem=true;}}
    draft=null;render();focusScreen();document.querySelector('#toast').textContent=sessionStorageProblem?'Session updated for this visit.':'Session updated.';
  };
  updateEditorTotal();bindBackground();
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
function upcomingMovement(){return active?.steps.slice(active.index+1).find(step=>step.kind==='move'||step.kind==='hold');}
function demoMovement(){const step=active?.steps[active.index];return step&&(step.kind==='prepare'||step.kind==='rest'?upcomingMovement():step);}
function updateDemo(){
  if(!active)return;
  const movement=demoMovement();
  if(movement)root.querySelector('#movement-demo')?.setAttribute('data-frame',String(movementFrame(movement.id,active.stepSpent,{reduce:reducedMotion.matches})));
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
  const step=active.steps[active.index],next=active.steps[active.index+1];
  const isBreak=step.kind==='prepare'||step.kind==='rest',upcoming=isBreak?upcomingMovement():null;
  const movement=demoMovement(),demo=movement?movementSprite(movement.id,{upNext:isBreak}):'';
  const title=step.kind==='rest'?'Rest':step.kind==='prepare'?'Get ready':step.title;
  const status=step.kind==='rest'?'Rest time left':step.kind==='prepare'?'Prep time left':'Keep it easy';
  const cue=upcoming?(step.kind==='rest'?'Feet down and rest. Watch what’s next.':'Get into position. Start after this countdown.'):step.cue;
  root.innerHTML=`<div class="app-shell player-shell${isBreak?' is-break':''}${step.kind==='rest'?' is-rest':''}${active.paused?' is-paused':''}"><header class="header"><span class="wordmark">${session==='kids'?'With kids':'On the Way'}</span><span class="step-count">${active.index+1} of ${active.steps.length}</span></header><main id="main" tabindex="-1"><div class="player-heading"><h1>${escape(title)}</h1>${!isBreak?`<p class="player-station">${escape(step.station)}</p>`:''}</div>${upcoming?`<div class="upcoming-heading"><h2><span>Next:</span> ${escape(upcoming.title)}</h2><p id="upcoming-station">${escape(upcoming.station)}</p></div>`:isBreak?'<p class="player-station">All movements done.</p>':''}<div class="movement-stage${demo?' has-demo':''}">${demo}<div class="timer-ring" id="ring"><div><span id="clock" class="clock" role="timer" aria-label="${step.kind==='rest'?'Rest time remaining':step.kind==='prepare'?'Preparation time remaining':'Time remaining in this movement'}"></span><span class="player-status" role="status">${active.paused?'Paused':status}</span></div></div></div><p class="cue">${active.paused?'Feet down. Rest, and resume only when ready.':escape(cue)}</p><details class="form-cue"><summary>A little guidance</summary><p>${escape(upcoming?upcoming.tip:step.tip)}</p></details>${!upcoming?`<p class="next-step">${next?`Next: ${escape(next.title)}`:'Then you’re done.'}</p>`:''}<div class="player-controls"><button class="primary" id="pause">${active.paused?'Resume':'Pause'} ${icon(active.paused?'play':'pause')}</button><button class="text-button" id="stop">End workout</button><p id="remaining" class="remaining"></p></div></main></div>`;
  root.querySelector('#pause').onclick=()=>{if(!active.paused){pause();return;}trainer.unlock();active.paused=false;active.tick=Date.now();trainer.begin(active.steps[active.index],active.steps[active.index].seconds-active.stepSpent);renderPlayer();};
  root.querySelector('#stop').onclick=()=>finish(false);
  root.querySelector('details').ontoggle=e=>{if(e.currentTarget.open&&active&&!active.paused){active.paused=true;trainer.stop();root.querySelector('#pause').innerHTML=`Resume ${icon('play')}`;root.querySelector('.player-status').textContent='Paused';root.querySelector('.cue').textContent='Feet down. Rest, and resume only when ready.';}};
  updateClock();
}
function finish(full){
  if(!active)return;
  clearInterval(interval);interval=null;
  if(full)trainer.complete();else trainer.stop();
  active=null;editing=false;draft=null;render();focusScreen();
  document.querySelector('#toast').textContent=full?'Workout complete. Ready to start again.':'Workout ended. Ready to start again.';
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)trainer.stop();syncBackground();if(document.hidden&&active&&!active.paused)pause();else if(!document.hidden&&!active&&!editing&&!draft)render();});
window.addEventListener('beforeunload',e=>{if(active){e.preventDefault();e.returnValue='';}});
window.addEventListener('pagehide',()=>{trainer.stop();if(active&&!active.paused){active.paused=true;renderPlayer();}});
window.addEventListener('storage',e=>{if(e.key!==PREFERENCES&&e.key!==SESSION_STORAGE&&e.key!==null)return;if(e.key===PREFERENCES||e.key===null)state=loadPreferences(e.newValue);if(e.key===SESSION_STORAGE||e.key===null)sessions=loadSessions(e.newValue);if(active)pause();else if(!editing&&!draft)render();});
window.addEventListener('pageshow',()=>{if(!active&&!editing&&!draft)render();});
render();
