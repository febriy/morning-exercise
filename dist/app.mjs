import {EMPTY,LEVELS,day,load,recipe,record,duration} from './model.mjs?v=personal-corner-2';

const KEY='on-the-way.v1';
const PENDING='on-the-way.pending.v1';
const root=document.querySelector('#app');
let state,storageProblem=false;
try { state=load(localStorage.getItem(KEY)); }
catch { state=structuredClone(EMPTY); storageProblem=true; }
let active=null,interval=null,pending=null,editing=false,audio=null;
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
const icon=(name)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({back:'<path d="m14 6-6 6 6 6"/>',edit:'<path d="M12 8h.01M12 12h.01M12 16h.01"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',pause:'<path d="M9 6v12m6-12v12"/>',play:'<path d="m9 5 10 7-10 7z"/>',check:'<path d="m5 12 4 4L19 6"/>',walk:'<circle cx="13" cy="4" r="2"/><path d="m11 8-3 5-4 1m6-1 5 3 3 5m-6-5-4 5m3-12 5 3 4-1"/>',shoulders:'<circle cx="12" cy="6" r="3"/><path d="M8 21v-8H4m12 8v-8h4M8 4 5 6l-1-3m12 1 3 2 1-3"/>',rest:'<path d="M4 12h16M7 8h10M9 16h6"/>',hang:'<path d="M3 3h18M8 3v6l4 3 4-3V3m-4 9v5m0 0-3 5m3-5 3 5"/><circle cx="12" cy="8" r="2"/>',support:'<path d="M4 10v12m16-12v12M2 10h5m10 0h5M8 10l1-4h6l1 4m-4-3v8m0 0-3 7m3-7 3 7"/><circle cx="12" cy="3" r="2"/>',squat:'<circle cx="13" cy="4" r="2"/><path d="m12 8-4 5 7 3-2 5m-5-8-4 5 3 3m4-11 8 1"/>',push:'<path d="M20 3v18M5 21l5-13 5 4h5"/><circle cx="14" cy="5" r="2"/>'})[name]||'<path d="M6 12h12m-6-6v12"/>'}</svg>`;

function save(){
  try { localStorage.setItem(KEY,JSON.stringify(state)); storageProblem=false; }
  catch { storageProblem=true; }
}
function todayDone(){return state.sessions.find(s=>s.date===day());}
function header({back=false}={}){return `<header class="header">${back?`<button class="icon-button" id="back" aria-label="Back to workout">${icon('back')}</button>`:'<span class="wordmark">On the Way<span class="brand-dot"></span></span>'}${state.setupComplete&&!back?`<button class="icon-button" id="edit" aria-label="Change time">${icon('edit')}</button>`:''}</header>`;}
function render(){
  document.querySelector('#overlay').innerHTML='';
  if(active){renderPlayer();return;}
  if(editing){renderSetup();return;}
  if(pending){renderFeedback();return;}
  renderToday();
}
function bindEdit(){root.querySelector('#edit')?.addEventListener('click',()=>{editing=true;render();});}
function storageNote(){return storageProblem?'<p class="notice" role="status">This browser cannot save progress. Your setup may be needed again next time.</p>':'';}
function renderSetup(){
  const selectedTime=state.setupComplete?state.timeBudget:120;
  root.innerHTML=`<div class="app-shell setup-shell">${header({back:editing})}<main id="main"><div class="intro"><p class="eyebrow">Made for you. Build the habit.</p><h1>Your corner.<br>One small habit.</h1><p>Platform push-ups. A small knee raise.<br>A steady bar hold. Plenty of rest.</p></div><form id="setup"><fieldset class="time-field"><legend>How much time per visit?</legend><div class="time-options">${[60,120,300,600].map(value=>`<label class="time-option"><input type="radio" name="time" value="${value}" ${selectedTime===value?'checked':''}><span>${value/60} min</span></label>`).join('')}</div></fieldset>${storageNote()}<button class="primary" id="setup-done" type="submit">${editing?'Update my workout':'See my workout'} ${icon('arrow')}</button></form><p class="privacy">We’ll keep it easy and build gradually.</p></main></div>`;
  root.querySelector('#setup').onsubmit=e=>{
    e.preventDefault();const form=new FormData(e.currentTarget),timeBudget=Number(form.get('time'));
    if(!state.setupComplete||state.timeBudget!==timeBudget){state.level=0;state.levelSince=day();}
    state.goal='habit';state.timeBudget=timeBudget;state.setupComplete=true;editing=false;save();render();window.scrollTo(0,0);
  };
  root.querySelector('#back')?.addEventListener('click',()=>{editing=false;render();});
}
function planGroups(plan){
  const actions=plan.steps.filter(step=>step.kind==='hold'||step.kind==='move');
  const groups=new Map();
  for(const step of actions){const existing=groups.get(step.id);if(existing)existing.count++;else groups.set(step.id,{...step,count:1});}
  return [...groups.values()];
}
function renderToday(){
  const completed=todayDone();const plan=recipe(state);
  root.innerHTML=`<div class="app-shell">${header()}<main id="main" class="today-main">${completed?`<div class="done-hero"><div class="done-symbol">${icon('check')}</div><p class="eyebrow">Today</p><h1>Done for today.</h1><p>${completed.seconds?`${duration(completed.seconds)} for yourself.`:'You listened to your body.'}<br>See you on the next coffee walk.</p></div>${completed.effort==='pain'?'<div class="notice">Rest before resuming. Seek advice for concerning symptoms; call 995 for a medical emergency.</div>':''}`:`<div class="workout-heading"><p class="eyebrow">Build the habit · Today</p><div class="duration">${duration(plan.seconds)}</div><h1>${plan.mode==='recovery'?'An easy day.':plan.mode==='restart'?'A gentle return.':plan.mode==='tiny'?'Your small version.':'Your corner routine.'}</h1><p>${plan.mode==='recovery'?'Let your arms recover. Keep today’s visit easy.':'Three small movements. Plenty of rest.'}</p></div><p class="station-label">${escape(plan.station)}</p><section class="workout-card" aria-label="Today’s movements">${planGroups(plan).map((step,i)=>`<div class="movement-row"><span class="movement-icon">${icon(step.id==='hanging-knee-raise'?'hang':step.id==='platform-pushup'?'push':step.id==='support-hold'?'support':'rest')}</span><span class="movement-name">${escape(step.title)}</span><span class="movement-time">${step.count>1?`${step.count} × `:''}${step.reps?`${step.reps} ${step.reps===1?'rep':'reps'}`:`${step.seconds}s`}</span></div>`).join('')}</section><p class="routine-note">${plan.mode==='recovery'?'Feet stay down today.':'Do the reps, then rest. All within your time.'}</p>${storageNote()}<div class="start-area"><button class="primary" id="start">Start workout ${icon('play')}</button>${plan.seconds>60?'<button class="text-button" id="tiny">Just one minute today</button>':''}<p class="safety-line">Use only a dry, stable station that fits the instructions. Stop for pain or feeling unwell. Get advice first if a condition or injury limits exercise.</p>${state.sessions.at(-1)?.effort==='pain'?'<p class="notice">Last time you felt unwell. Resume only once symptoms have resolved, with advice where needed.</p>':''}</div>`}</main></div>`;
  bindEdit();
  root.querySelector('#start')?.addEventListener('click',()=>start(plan));
  root.querySelector('#tiny')?.addEventListener('click',()=>start(recipe(state,{tiny:true})));
}
function movementArt(id){
  const hanging=id==='hanging-knee-raise',support=id==='support-hold',push=id==='platform-pushup';
  const apparatus=hanging?'<path d="M74 180V20h142v160"/>':push?'<path d="M188 116h52m-42 0v64m32-64v64"/>':'<path d="M95 119v61m100-61v61M83 118h24m76 0h24"/>';
  const body=hanging?'<circle cx="145" cy="69" r="12"/><path d="M145 89v39m-10-39-23-67m43 67 23-67m-33 106-30 7 8 25m22-32 26 8-8 24"/>':push?'<circle cx="185" cy="66" r="12"/><path d="M174 83l-52 53-43 39m95-92 13 33h26m-91 20-34 39"/>':support?'<circle cx="145" cy="36" r="12"/><path d="M145 56v62m-10-56-40 56m60-56 40 56m-50 0-17 44 11 7m6-51 17 44-11 7"/>':'<circle cx="145" cy="38" r="12"/><path d="M145 58v62m0 0-17 55m17-55 17 55m-27-95-40 38m60-38 40 38"/>';
  const label=hanging?'Hanging with bent knees gently raised':push?'Incline push-up with hands on an elevated platform and feet on the ground':support?'Static support above parallel bars without dipping':'Standing with feet on the ground at the parallel bars';
  return `<svg class="movement-art" viewBox="0 0 290 200" role="img" aria-label="${label} illustration"><ellipse cx="145" cy="184" rx="93" ry="5" fill="#dfe7e1"/><g fill="none" stroke="#acc0ac" stroke-width="7" stroke-linecap="round">${apparatus}</g><g fill="none" stroke="#315f4c" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
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
  const step=active.steps[active.index],next=active.steps[active.index+1];
  root.innerHTML=`<div class="app-shell player-shell"><header class="header"><span class="wordmark">On the Way<span class="brand-dot"></span></span><span class="step-count">${active.index+1} of ${active.steps.length}</span></header><main id="main"><p class="eyebrow">${active.paused?'Paused':'Now'}</p><h1>${escape(step.title)}</h1>${movementArt(step.id)}<div class="timer-ring" id="ring"><div><span id="clock" class="clock" role="timer" aria-label="Time remaining in this movement"></span><span class="seconds-label">${active.paused?'Take your time':'Keep it easy'}</span></div></div><p class="cue">${active.paused?'Feet down. Rest, and resume only when ready.':escape(step.cue)}</p><details class="form-cue"><summary>A little guidance</summary><p>${escape(step.tip)}</p></details><p class="next-step">${next?`Next: ${escape(next.title)}`:'Then you’re done.'}</p><div class="player-controls"><button class="primary" id="pause">${active.paused?'Resume':'Pause'} ${icon(active.paused?'play':'pause')}</button><button class="text-button" id="stop">End workout</button><p id="remaining" class="remaining"></p></div></main></div>`;
  root.querySelector('#pause').onclick=()=>{active.paused=!active.paused;active.tick=Date.now();renderPlayer();};
  root.querySelector('#stop').onclick=()=>finish(false);
  root.querySelector('details').ontoggle=e=>{if(e.currentTarget.open&&active&&!active.paused){active.paused=true;root.querySelector('#pause').innerHTML=`Resume ${icon('play')}`;root.querySelector('.eyebrow').textContent='Paused';}};
  updateClock();
}
function finish(full){
  if(!active)return;
  clearInterval(interval);interval=null;
  pending={date:active.date,level:active.level,seconds:Math.min(600,Math.floor(full?active.seconds:active.spent)),mode:active.mode,strength:active.strength&&active.spent>0,full};
  active=null;
  try{localStorage.setItem(PENDING,JSON.stringify(pending));}catch{storageProblem=true;}
  renderFeedback();window.scrollTo(0,0);
}
function renderFeedback(){
  root.innerHTML=`<div class="app-shell feedback-shell">${header()}<main id="main"><div class="done-symbol">${icon('check')}</div><p class="eyebrow">${pending.full?'Workout complete':'Stopped here'}</p><h1>${pending.full?'That’s your<br>workout done.':'Small still counts.'}</h1><p class="feedback-duration">${duration(pending.seconds)} for yourself.</p><section class="feedback"><h2>How did that feel?</h2><p>I’ll use this for your next workout.</p><button class="feedback-option" data-effort="easy"><span>Easy</span><small>I’d happily do it again</small>${icon('arrow')}</button><button class="feedback-option" data-effort="okay"><span>Just right</span>${icon('arrow')}</button><button class="feedback-option" data-effort="hard"><span>Too much</span><small>Keep the next one small</small>${icon('arrow')}</button><button class="text-button" data-effort="pain">Pain or felt unwell</button></section>${storageNote()}</main></div>`;
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
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!active.paused)pause();else if(!document.hidden&&!active&&!pending&&!editing)render();});
window.addEventListener('beforeunload',e=>{if(active){e.preventDefault();e.returnValue='';}});
window.addEventListener('storage',e=>{if(e.key!==KEY)return;state=load(e.newValue);if(active){if(todayDone()){clearInterval(interval);interval=null;active=null;render();}else pause();}else if(!pending)render();});
window.addEventListener('pageshow',()=>{if(!active&&!pending&&!editing)render();});
render();
