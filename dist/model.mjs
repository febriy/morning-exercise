export const LEVELS = [60,90,120,180,240,300,480,600];
export const NAMES = ['Make stopping easy','Find your rhythm','Learn the basics','A little more strength','Build familiarity','Settle into it','Make room for more','Your ten-minute corner'];
export const EMPTY = {version:1,program:'personal-corner-v2',setupComplete:true,goal:'habit',timeBudget:120,level:0,levelSince:null,healthReady:false,equipment:[],sessions:[]};
export function day(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Singapore',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function distance(a,b){return Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000);}
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
export function validate(s){
 if(!s||s.version!==1||!Number.isInteger(s.level)||s.level<0||s.level>=LEVELS.length||!(s.levelSince===null||validDate(s.levelSince))||typeof s.healthReady!=='boolean'||!Array.isArray(s.equipment)||!s.equipment.every(x=>['highrail','wall','bench','pullup','lowrails'].includes(x))||!Array.isArray(s.sessions)||s.sessions.length>10000)throw Error('This is not a valid On the Way backup.');
 const seen=new Set();
 for(const x of s.sessions){if(!x||!validDate(x.date)||seen.has(x.date)||!Number.isInteger(x.level)||x.level<0||x.level>7||!Number.isInteger(x.seconds)||x.seconds<0||x.seconds>600||!['normal','tiny','recovery','restart','weather'].includes(x.mode)||!['easy','okay','hard','pain','skipped'].includes(x.effort)||!['yes','maybe','no'].includes(x.again)||typeof x.full!=='boolean'||typeof x.strength!=='boolean'||x.full&&(x.seconds<1||x.mode==='weather'))throw Error('The backup contains an invalid visit.');seen.add(x.date);}
 if(s.setupComplete!==undefined&&typeof s.setupComplete!=='boolean')throw Error('Invalid setup state.');
 if(s.goal!==undefined&&!['habit','strength','energy'].includes(s.goal))throw Error('Invalid goal.');
 if(s.timeBudget!==undefined&&![60,120,300,600].includes(s.timeBudget))throw Error('Invalid time commitment.');
 return {version:1,program:'personal-corner-v2',setupComplete:true,goal:'habit',timeBudget:s.program==='personal-corner-v2'?(s.timeBudget??120):120,level:s.program==='personal-corner-v2'?s.level:0,levelSince:s.program==='personal-corner-v2'?s.levelSince:null,healthReady:s.healthReady,equipment:[...new Set(s.equipment)],sessions:s.sessions.map(x=>({...x})).sort((a,b)=>a.date.localeCompare(b.date))};
}
export function load(raw){try{return validate(JSON.parse(raw));}catch{return structuredClone(EMPTY);}}
export function readiness(s,today=day()){
 const past=s.sessions.filter(x=>x.date<=today&&(x.seconds>0||x.effort==='pain')).sort((a,b)=>b.date.localeCompare(a.date));
 const last=past[0];
 const lastStrength=past.find(x=>x.strength);
 const pain=last?.effort==='pain';
 const gap=last?distance(today,last.date):0;
 const strengthWeek=past.filter(x=>x.strength&&distance(today,x.date)<7).length;
 return {pain,restart:gap>=7,rest:!!lastStrength&&distance(today,lastStrength.date)<2||strengthWeek>=3,last};
}
export function recipe(s,{today=day(),tiny=false,sore=false}={}){
 const r=readiness(s,today),level=s.level;
 const mode=sore||r.pain||r.rest?'recovery':r.restart?'restart':tiny||r.last?.again==='no'?'tiny':'normal';
 const seconds=mode==='tiny'||mode==='restart'?60:(s.timeBudget??120);
 const strength=mode!=='recovery';
 const hold=seconds===60?5:10;
 const reps=seconds===60?3:8;
 const steps=[];
 const add=(id,title,seconds,cue,tip,kind,station,reps)=>steps.push({id,title,seconds,cue,tip,kind,station,...(reps?{reps}:{})});
 const supportTip='Hold the top position only, with arms straight but not forced into a hard lock. Keep shoulders steady. Let your feet take some weight if the setup allows. Don’t bend your elbows into a dip. Only start if you can get into and out of the position in control.';
 if(mode==='recovery'){
  add('bar-touch','Stand at the parallel bars',20,'Keep both feet firmly on the ground. Rest your hands lightly on the bars.','Keep all your weight in your legs today. Don’t lift yourself onto the bars. Dry, fixed bars only.','move','Parallel bars');
  add('bar-mobility','Loosen hands and shoulders',20,'Stay standing, feet down. Gently open and close your hands, and relax your shoulders.','Small comfortable movements only. If pain or unusual symptoms remain, stop and get advice rather than completing the timer.','move','Parallel bars');
  add('rest','Done. Keep it easy.',seconds-40,'Relax. Continue your coffee walk when ready.','Today keeps the habit without loaded holds, push-ups or knee raises.','rest','Parallel bars');
 }else{
  const prepare=seconds===60?7:8,repTime=reps*3;
  const restBudget=seconds-prepare-repTime*3-hold*2;
  const rest=Math.floor(restBudget/4);
  add('prepare','Get comfortable at the platform',prepare,'Loosen your hands and shoulders. Find a high, fixed push-up platform.','Arrive warm from your coffee walk. Pause for more preparation if needed. Use dry, fixed equipment and a clear place to put your feet down.','prepare','Push-up platform');
  add('platform-pushup','Platform push-ups',repTime,`Do up to ${reps} controlled push-ups. Hands on the platform, feet on the ground.`,'Use a high, stable platform intended for support. Keep your body in one line. Bend your elbows comfortably back, lower a little, and press away. A higher surface makes it easier. Stop before straining; no need to fill the timer or force the depth.','move','Push-up platform',reps);
  add('rest','Stand up. Rest.',rest,'Relax your arms. Move to the pull-up bar when ready.','Pause if you need more rest or time to move between stations.','rest','Between stations');
  add('hanging-knee-raise','Knee raises',repTime,`Up to ${reps} small knee raises. Lift gently, lower with control. Feet down when you need to rest.`,'Only try this if you can hang steadily and get on and off the bar in control. Keep arms long and raise bent knees without swinging or pulling up. You can stop before the target or skip the raises and rest. No jumping or dropping. Stop for pain or a slipping grip.','move','Pull-up bar',reps);
  add('rest','Feet down. Rest.',rest,'Put your feet down and relax your hands before the hang.','Pause for longer if your grip needs more rest. Do not stay hanging during this break.','rest','Pull-up bar');
  add('bar-hang','Pull-up bar hang',hold,`Hang steadily for up to ${hold} seconds. Keep your arms long. Feet down sooner if needed.`,'Grip a dry, fixed bar you can reach and leave in control. Keep your body still; no pull-up, swinging, jumping or dropping. Let your feet take weight if the station allows. Stop for pain or a slipping grip.','hold','Pull-up bar');
  add('rest','Feet down. Rest.',rest,'Relax your hands. Move to the parallel bars when ready.','Pause the timer if you need longer to rest or reach the next station.','rest','Between stations');
  add('support-hold','Parallel-bar hold',hold,`Hold the top for up to ${hold} seconds. Feet down sooner if needed. No dip.`,supportTip,'hold','Parallel bars');
  add('rest','Stand and rest.',restBudget-rest*3,'Relax your arms. Find a clear, level place to stand.','Take more rest with Pause whenever you need it.','rest','Fitness corner');
  add('squat','Squats',repTime,`Up to ${reps} controlled squats. Hips back, heels down, then stand tall.`,'Use a dry, level surface. Stand with feet about shoulder-width apart. Bend your knees and move your hips back only as far as comfortable, keeping heels down and knees in line with your toes. Stand back up without jumping. Stop early rather than rushing to finish the reps.','move','Beside the bars',reps);
 }
 return {mode,level,seconds,strength,holdSeconds:mode==='recovery'?0:hold,station:mode==='recovery'?'Parallel bars · Feet stay down':'Platform + pull-up bar + parallel bars + standing',steps,title:mode==='recovery'?'An easy day at your bars':mode==='restart'?'A gentle return':'Your corner routine',reason:mode==='recovery'?'Let your arms recover. Keep the visit easy.':'Push-ups, knee raises, a hang, a bar hold and squats.'};
}
export function record(s,entry){
 const next=validate(s),existing=next.sessions.find(x=>x.date===entry.date);
 if(existing){
  // A replay never adds daily credit. It can still report a new difficulty or pain.
  const severity=effort=>effort==='pain'?2:effort==='hard'?1:0;
  if(severity(entry.effort)>severity(existing.effort)){
   const alreadyReduced=severity(existing.effort)>0;
   existing.effort=entry.effort;existing.again='no';
   if(!alreadyReduced)next.level=Math.max(0,next.level-1);
   next.levelSince=entry.date;
   return {state:validate(next),changed:true,promoted:false};
  }
  return {state:next,changed:false,promoted:false};
 }
 next.sessions.push({...entry});next.levelSince??=entry.date;
 if(entry.mode==='restart'){next.level=0;next.levelSince=entry.date;}
 if(entry.effort==='hard'||entry.effort==='pain'){next.level=Math.max(0,next.level-1);next.levelSince=entry.date;}
 let promoted=false;
 const eligible=next.sessions.filter(x=>x.date>=next.levelSince&&distance(entry.date,x.date)>=0&&distance(entry.date,x.date)<14&&x.level===next.level&&x.full&&x.mode==='normal'&&x.effort==='easy'&&x.again==='yes');
 if(next.level<7&&entry.effort==='easy'&&entry.mode==='normal'&&entry.full&&entry.again==='yes'&&distance(entry.date,next.levelSince)>=6&&eligible.length>=3){next.level++;next.levelSince=entry.date;promoted=true;}
 return {state:validate(next),changed:true,promoted};
}
export function duration(seconds){return seconds<60?`${seconds} sec`:seconds%60?`${Math.floor(seconds/60)} min ${seconds%60} sec`:`${seconds/60} min`;}
