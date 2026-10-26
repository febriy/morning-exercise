import {recipe,kidsRecipe,homeRecipe} from './model.mjs?v=at-home-1';

export const SESSION_STORAGE='on-the-way.sessions.v1';
export const MAX_STEPS=20;
export const MAX_SECONDS=600;
export const EXERCISES=[
 {id:'prepare',title:'Get ready'},
 {id:'jumping-jacks',title:'Jumping jacks'},
 {id:'squat',title:'Squats'},
 {id:'kettlebell-squat',title:'Kettlebell squats'},
 {id:'incline-pushup',title:'Incline push-ups'},
 {id:'kettlebell-swing',title:'Kettlebell swings'},
 {id:'platform-pushup',title:'Platform push-ups'},
 {id:'hanging-knee-raise',title:'Knee raises'},
 {id:'bar-hang',title:'Pull-up bar hang'},
 {id:'support-hold',title:'Parallel-bar hold'},
 {id:'rest',title:'Rest'}
];
const ids=new Set(EXERCISES.map(step=>step.id));

export function defaultPlan(session,preferences){return session==='home'?homeRecipe():session==='kids'?kidsRecipe():recipe(preferences);}
export function editableSteps(plan){return plan.steps.map(({id,seconds})=>({id,seconds}));}

export function sessionError(steps){
 if(!Array.isArray(steps)||!steps.length)return 'Add an exercise before saving.';
 if(steps.length>MAX_STEPS)return `Keep the session to ${MAX_STEPS} steps or fewer.`;
 for(const [index,step] of steps.entries()){
  if(!step||!ids.has(step.id))return 'Choose an exercise for every step.';
  if(!Number.isInteger(step.seconds)||step.seconds<1||step.seconds>MAX_SECONDS)return `Step ${index+1} needs a whole number of seconds from 1 to 600.`;
 }
 if(!steps.some(step=>!['prepare','rest'].includes(step.id)))return 'Include at least one exercise alongside preparation or rest.';
 if(steps.reduce((total,step)=>total+step.seconds,0)>MAX_SECONDS)return 'Keep the whole session to 10 minutes or less.';
 return '';
}

export function loadSessions(raw){
 const result={};
 try{
  const parsed=JSON.parse(raw);
  if(parsed?.version!==1)return result;
  for(const session of ['morning','kids','home']){
   if(Array.isArray(parsed[session])&&!sessionError(parsed[session]))result[session]=parsed[session].map(({id,seconds})=>({id,seconds}));
  }
 }catch{}
 return result;
}

export function sessionPlan(session,preferences,overrides={}){
 const custom=overrides[session];
 if(!custom||sessionError(custom))return defaultPlan(session,preferences);
 const defaults=defaultPlan(session,preferences);
 const templates=new Map([...recipe().steps,...kidsRecipe().steps,...homeRecipe().steps,...defaults.steps].map(step=>[step.id,step]));
 const cues={
  'platform-pushup':'Hands on the platform, feet on the ground. Move at your own pace.',
  'hanging-knee-raise':'Lift bent knees gently, then lower with control. Feet down when you need a rest.',
  'squat':'Hips back, then stand tall. Go at your own pace.',
  'kettlebell-squat':'Bell close to your chest. Squat comfortably, then stand tall.',
  'incline-pushup':'Hands on a fixed, raised surface. Keep your body in one line.',
  'kettlebell-swing':'Hips back, then stand tall. Let your hips drive the bell.',
  'jumping-jacks':'Arms up, feet out. Arms down, feet in. Go at your own pace.'
 };
 const steps=custom.map(({id,seconds},index)=>{
  const {reps,...template}=templates.get(id);
  const next=custom[index+1],nextTitle=next&&EXERCISES.find(choice=>choice.id===next.id).title;
  const step={...template,id,seconds};
  if(id==='prepare')Object.assign(step,{title:'Get ready',station:'Before you start',cue:nextTitle?`Find your space. Next: ${nextTitle}.`:'Find your space. Go at your own pace.',tip:'Put your phone somewhere you can see and hear it. Pause if you need more time to get ready.'});
  else if(id==='rest')Object.assign(step,{title:'Rest',station:'Take a breather',cue:nextTitle?`Relax and catch your breath. Next: ${nextTitle}.`:'One last breather. You’re nearly done.',tip:'Rest with your feet on the ground. Pause the timer if you want a longer break.'});
  else if(step.kind==='hold')step.cue=`Hold steadily for up to ${seconds} seconds. Feet down sooner if needed. ${id==='support-hold'?'No dip.':'Keep your arms long.'}`;
  else step.cue=cues[id];
  return step;
 });
 return {seconds:steps.reduce((total,step)=>total+step.seconds,0),steps};
}
