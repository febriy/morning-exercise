import {EMPTY,day,load,recipe,record,duration} from './model.mjs?v=personal-corner-2';

const KEY='on-the-way.v1';
const PENDING='on-the-way.pending.v1';
const root=document.querySelector('#app');
let state,storageProblem=false;
try { state=load(localStorage.getItem(KEY)); }
catch { state=structuredClone(EMPTY); storageProblem=true; }
let active=null,interval=null,pending=null,editing=false,audio=null;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let backgroundPaused=false;
function syncBackground(){
  const paused=backgroundPaused||reducedMotion.matches||document.hidden||!!active;
  document.documentElement.dataset.background=paused?'still':'moving';
  const control=root.querySelector('#background-motion');
  if(control){control.hidden=reducedMotion.matches;control.setAttribute('aria-label',backgroundPaused?'Play background motion':'Pause background motion');control.title=backgroundPaused?'Play background motion':'Pause background motion';control.innerHTML=icon(backgroundPaused?'play':'pause');}
}
reducedMotion.addEventListener('change',syncBackground);
try {
  const draft=JSON.parse(localStorage.getItem(PENDING));
  if(draft&&typeof draft.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(draft.date)&&draft.date<=day()&&Number.isInteger(draft.seconds)&&draft.seconds>=0&&draft.seconds<=600&&Number.isInteger(draft.level)&&draft.level>=0&&draft.level<=7&&['normal','tiny','recovery','restart'].includes(draft.mode)&&typeof draft.full==='boolean'&&typeof draft.strength==='boolean')pending=draft;
} catch {}
if(state.sessions.some(s=>s.date===pending?.date))pending=null;
if(pending&&pending.date<day()){
  try { state=record(state,{...pending,effort:'okay',again:'maybe'}).state;localStorage.setItem(KEY,JSON.stringify(state));localStorage.removeItem(PENDING); }
  catch { storageProblem=true; }
  pending=null;
}

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({back:'<path d="m14 6-6 6 6 6"/>',edit:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',pause:'<path d="M9 6v12m6-12v12"/>',play:'<path d="m9 5 10 7-10 7z"/>',check:'<path d="m5 12 4 4L19 6"/>',walk:'<circle cx="13" cy="4" r="2"/><path d="m11 8-3 5-4 1m6-1 5 3 3 5m-6-5-4 5m3-12 5 3 4-1"/>',shoulders:'<circle cx="12" cy="6" r="3"/><path d="M8 21v-8H4m12 8v-8h4M8 4 5 6l-1-3m12 1 3 2 1-3"/>',rest:'<path d="M4 12h16M7 8h10M9 16h6"/>',hang:'<path d="M3 3h18M8 3v6l4 3 4-3V3m-4 9v5m0 0-3 5m3-5 3 5"/><circle cx="12" cy="8" r="2"/>',support:'<path d="M4 10v12m16-12v12M2 10h5m10 0h5M8 10l1-4h6l1 4m-4-3v8m0 0-3 7m3-7 3 7"/><circle cx="12" cy="3" r="2"/>',squat:'<circle cx="13" cy="4" r="2"/><path d="m12 8-4 5 7 3-2 5m-5-8-4 5 3 3m4-11 8 1"/>',push:'<path d="M20 3v18M5 21l5-13 5 4h5"/><circle cx="14" cy="5" r="2"/>'})[name]||'<path d="M6 12h12m-6-6v12"/>'}</svg>`;

function save(){
  try { localStorage.setItem(KEY,JSON.stringify(state)); storageProblem=false; }
  catch { storageProblem=true; }
}
function todayDone(){return state.sessions.find(s=>s.date===day());}
function backgroundControl(){return `<button class="icon-button background-control" id="background-motion" aria-label="${backgroundPaused?'Play':'Pause'} background motion" title="${backgroundPaused?'Play':'Pause'} background motion" ${reducedMotion.matches?'hidden':''}>${icon(backgroundPaused?'play':'pause')}</button>`;}
function header({back=false}={}){return `<header class="header">${back?`<button class="icon-button" id="back" aria-label="Back to workout">${icon('back')}</button>`:'<span class="wordmark">On the Way</span>'}<div class="header-actions">${backgroundControl()}${state.setupComplete&&!back?`<button class="time-button" id="edit" aria-label="Change time">${icon('edit')}<span>Time</span></button>`:''}</div></header>`;}
function render(){
  syncBackground();
  document.querySelector('#overlay').innerHTML='';
  if(active){renderPlayer();return;}
  if(editing){renderSetup();return;}
  if(pending){renderFeedback();return;}
  renderToday();
}
function bindBackground(){root.querySelector('#background-motion')?.addEventListener('click',()=>{backgroundPaused=!backgroundPaused;syncBackground();});syncBackground();}
function bindEdit(){root.querySelector('#edit')?.addEventListener('click',()=>{editing=true;render();});bindBackground();}
function storageNote(){return storageProblem?'<p class="notice" role="status">This browser cannot save progress. Your setup may be needed again next time.</p>':'';}
function renderSetup(){
  const selectedTime=state.setupComplete?state.timeBudget:120;
  root.innerHTML=`<div class="app-shell setup-shell">${header({back:editing})}<main id="main"><div class="intro"><h1>A little time<br>for yourself.</h1><p>Platform push-ups. A small knee raise.<br>A steady bar hold. Plenty of rest.</p></div><form id="setup"><fieldset class="time-field"><legend>How much time per visit?</legend><div class="time-options">${[60,120,300,600].map(value=>`<label class="time-option"><input type="radio" name="time" value="${value}" ${selectedTime===value?'checked':''}><span>${value/60} min</span></label>`).join('')}</div></fieldset>${storageNote()}<button class="primary" id="setup-done" type="submit">${editing?'Update my workout':'See my workout'} ${icon('arrow')}</button></form><p class="privacy">We’ll keep it easy and build gradually.</p></main></div>`;
  root.querySelector('#setup').onsubmit=e=>{
    e.preventDefault();const form=new FormData(e.currentTarget),timeBudget=Number(form.get('time'));
    if(!state.setupComplete||state.timeBudget!==timeBudget){state.level=0;state.levelSince=day();}
    state.goal='habit';state.timeBudget=timeBudget;state.setupComplete=true;editing=false;save();render();window.scrollTo(0,0);
  };
  root.querySelector('#back')?.addEventListener('click',()=>{editing=false;render();});
  bindBackground();
}
function planGroups(plan){
  const actions=plan.steps.filter(step=>step.kind==='hold'||step.kind==='move');
  const groups=new Map();
  for(const step of actions){const existing=groups.get(step.id);if(existing)existing.count++;else groups.set(step.id,{...step,count:1});}
  return [...groups.values()];
}
function renderToday(){
  const completed=todayDone();const plan=recipe(state);
  root.innerHTML=`<div class="app-shell">${header()}<main id="main" class="today-main">${completed?`<div class="done-hero"><div class="done-symbol">${icon('check')}</div><h1>Done for today.</h1><p>${completed.seconds?`${duration(completed.seconds)} for yourself.`:'You listened to your body.'}<br>See you on the next coffee walk.</p></div>${completed.effort==='pain'?'<div class="notice">Rest before resuming. Seek advice for concerning symptoms; call 995 for a medical emergency.</div>':''}`:`<div class="workout-heading"><h1>${plan.mode==='recovery'?'An easy day.':plan.mode==='restart'?'A gentle return.':plan.mode==='tiny'?'Your small version.':'Your corner<br>routine.'}</h1><p>${plan.mode==='recovery'?'Let your arms recover. Keep today’s visit easy.':'Three small movements. Plenty of rest.'}</p></div><div class="workout-meta"><span class="duration">${duration(plan.seconds)}</span><span>Rest included</span></div><ol class="workout-card" aria-label="Today’s movements">${planGroups(plan).map(step=>`<li class="movement-row"><span class="movement-icon">${icon(step.id==='hanging-knee-raise'?'hang':step.id==='platform-pushup'?'push':step.id==='support-hold'?'support':'rest')}</span><span class="movement-info"><span class="movement-name">${escape(step.title)}</span><span class="movement-station">${escape(step.station)}</span></span><span class="movement-time">${step.count>1?`${step.count} × `:''}<strong>${step.reps||step.seconds}</strong><span>${step.reps?(step.reps===1?'rep':'reps'):'sec'}</span></span></li>`).join('')}</ol><p class="routine-note">${plan.mode==='recovery'?'Feet stay down today.':'Do the reps, then rest. All within your time.'}</p>${storageNote()}<div class="start-area"><button class="primary" id="start">Start workout ${icon('play')}</button>${plan.seconds>60?'<button class="text-button" id="tiny">Just one minute today</button>':''}<p class="safety-line">Use only a dry, stable station that fits the instructions. Stop for pain or feeling unwell. Get advice first if a condition or injury limits exercise.</p>${state.sessions.at(-1)?.effort==='pain'?'<p class="notice">Last time you felt unwell. Resume only once symptoms have resolved, with advice where needed.</p>':''}</div>`}</main></div>`;
  bindEdit();
  root.querySelector('#start')?.addEventListener('click',()=>start(plan));
  root.querySelector('#tiny')?.addEventListener('click',()=>start(recipe(state,{tiny:true})));
}
function sound(){
  try { if(!audio||audio.state!=='running')return;const tone=audio.createOscillator(),gain=audio.createGain();tone.type='sine';tone.frequency.value=660;gain.gain.setValueAtTime(0.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.12);tone.connect(gain);gain.connect(audio.destination);tone.start();tone.stop(audio.currentTime+0.12); } catch {}
}
function start(plan){
  if(todayDone())return;
  try { const Audio=window.AudioContext||window.webkitAudioContext;if(Audio){audio??=new Audio();audio.resume().catch(()=>{});} } catch {}
  active={...plan,date:day(),index:0,spent:0,stepSpent:0,tick:Date.now(),paused:false};
  renderPlayer();interval=setInterval(tick,200);window.scrollTo(0,0);
}
function tick(){
  if(!active||active.paused)return;
  const now=Date.now();let remaining=Math.max(0,(now-active.tick)/1000);active.tick=now;
  if(remaining>3){pause();return;}
  while(active&&remaining>0){
    const step=active.steps[active.index];const used=Math.min(remaining,step.seconds-active.stepSpent);
    active.stepSpent+=used;active.spent+=used;remaining-=used;
    if(active.stepSpent>=step.seconds-.001){active.index++;active.stepSpent=0;if(active.index===active.steps.length){sound();finish(true);return;}if(['hold','move'].includes(active.steps[active.index].kind)||['hold','move'].includes(step.kind))sound();renderPlayer();}
  }
  updateClock();
}
function updateClock(){
  if(!active)return;
  const step=active.steps[active.index];const left=Math.max(0,Math.ceil(step.seconds-active.stepSpent));
  const clock=root.querySelector('#clock');if(clock)clock.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;
  root.querySelector('#ring')?.style.setProperty('--progress',`${Math.min(100,active.stepSpent/step.seconds*100)}%`);
  const remaining=root.querySelector('#remaining');if(remaining)remaining.textContent=`${duration(Math.ceil(Math.max(0,active.seconds-active.spent)))} remaining`;
}
function pause(){if(!active)return;active.paused=true;renderPlayer();}
function renderPlayer(){
  syncBackground();
  const step=active.steps[active.index],next=active.steps[active.index+1];
  root.innerHTML=`<div class="app-shell player-shell"><header class="header"><span class="wordmark">On the Way</span><span class="step-count">${active.index+1} of ${active.steps.length}</span></header><main id="main"><div class="player-heading"><h1>${escape(step.title)}</h1><p class="player-station">${escape(step.station)}</p></div><div class="timer-ring" id="ring"><div><span id="clock" class="clock" role="timer" aria-label="Time remaining in this movement"></span><span class="player-status" role="status">${active.paused?'Paused':'Keep it easy'}</span></div></div><p class="cue">${active.paused?'Feet down. Rest, and resume only when ready.':escape(step.cue)}</p><details class="form-cue"><summary>A little guidance</summary><p>${escape(step.tip)}</p></details><p class="next-step">${next?`Next: ${escape(next.title)}`:'Then you’re done.'}</p><div class="player-controls"><button class="primary" id="pause">${active.paused?'Resume':'Pause'} ${icon(active.paused?'play':'pause')}</button><button class="text-button" id="stop">End workout</button><p id="remaining" class="remaining"></p></div></main></div>`;
  root.querySelector('#pause').onclick=()=>{active.paused=!active.paused;active.tick=Date.now();renderPlayer();};
  root.querySelector('#stop').onclick=()=>finish(false);
  root.querySelector('details').ontoggle=e=>{if(e.currentTarget.open&&active&&!active.paused){active.paused=true;root.querySelector('#pause').innerHTML=`Resume ${icon('play')}`;root.querySelector('.player-status').textContent='Paused';root.querySelector('.cue').textContent='Feet down. Rest, and resume only when ready.';}};
  updateClock();
}
function finish(full){
  if(!active)return;
  clearInterval(interval);interval=null;
  pending={date:active.date,level:active.level,seconds:Math.min(600,Math.floor(full?active.seconds:active.spent)),mode:active.mode,strength:active.strength&&active.spent>0,full};
  active=null;syncBackground();
  try{localStorage.setItem(PENDING,JSON.stringify(pending));}catch{storageProblem=true;}
  renderFeedback();window.scrollTo(0,0);
}
function renderFeedback(){
  root.innerHTML=`<div class="app-shell feedback-shell">${header()}<main id="main"><div class="done-symbol">${icon('check')}</div><h1>${pending.full?'That’s your<br>workout done.':'Small still counts.'}</h1><p class="feedback-duration">${duration(pending.seconds)} for yourself.</p><section class="feedback"><h2>How did that feel?</h2><p>I’ll use this for your next workout.</p><button class="feedback-option" data-effort="easy"><span>Easy</span><small>I’d happily do it again</small>${icon('arrow')}</button><button class="feedback-option" data-effort="okay"><span>Just right</span>${icon('arrow')}</button><button class="feedback-option" data-effort="hard"><span>Too much</span><small>Keep the next one small</small>${icon('arrow')}</button><button class="text-button" data-effort="pain">Pain or felt unwell</button></section>${storageNote()}</main></div>`;
  root.querySelectorAll('[data-effort]').forEach(button=>button.onclick=()=>complete(button.dataset.effort));
  bindEdit();
}
function complete(effort){
  if(!pending)return;
  const entry={...pending,effort,again:effort==='easy'?'yes':effort==='okay'?'maybe':'no'};
  const result=record(state,entry);state=result.state;save();
  if(!storageProblem){try{localStorage.removeItem(PENDING);}catch{}}
  pending=null;render();window.scrollTo(0,0);
}
document.addEventListener('visibilitychange',()=>{syncBackground();if(document.hidden&&active&&!active.paused)pause();else if(!document.hidden&&!active&&!pending&&!editing)render();});
window.addEventListener('beforeunload',e=>{if(active){e.preventDefault();e.returnValue='';}});
window.addEventListener('storage',e=>{if(e.key!==KEY)return;state=load(e.newValue);if(active){if(todayDone()){clearInterval(interval);interval=null;active=null;render();}else pause();}else if(!pending)render();});
window.addEventListener('pageshow',()=>{if(!active&&!pending&&!editing)render();});
render();
