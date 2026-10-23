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
 const hold=mode==='normal'?[3,3,4,4,5,5,6,6][level]:3;
 const reps=seconds===60?2:mode==='normal'?[3,4,4,5,5,6,6,6][level]:2;
 const steps=[];
 const add=(id,title,seconds,cue,tip,kind,station,reps)=>steps.push({id,title,seconds,cue,tip,kind,station,...(reps?{reps}:{})});
 const supportTip='Hold the top position only, with arms straight but not forced into a hard lock. Keep shoulders steady. Let your feet take some weight if the setup allows. Don’t bend your elbows into a dip. Only start if you can get into and out of the position in control.';
 if(mode==='recovery'){
  add('bar-touch','Stand at the parallel bars',20,'Keep both feet firmly on the ground. Rest your hands lightly on the bars.','Keep all your weight in your legs today. Don’t lift yourself onto the bars. Dry, fixed bars only.','move','Parallel bars');
  add('bar-mobility','Loosen hands and shoulders',20,'Stay standing, feet down. Gently open and close your hands, and relax your shoulders.','Small comfortable movements only. If pain or unusual symptoms remain, stop and get advice rather than completing the timer.','move','Parallel bars');
  add('rest','Done. Keep it easy.',seconds-40,'Relax. Continue your coffee walk when ready.','Today keeps the habit without loaded holds, push-ups or knee raises.','rest','Parallel bars');
 }else{
  const prepare=seconds===60?10:20,pressTime=reps*5,kneeTime=5;
  const restBudget=seconds-prepare-pressTime-kneeTime-hold;
  const rest=Math.floor(restBudget/3);
  add('prepare','Get comfortable at the platform',prepare,'Loosen your hands and shoulders. Find a high, fixed push-up platform.','Arrive warm from your coffee walk. Pause for more preparation if needed. Use dry, fixed equipment and a clear place to put your feet down.','prepare','Push-up platform');
  add('platform-pushup','Platform push-ups',pressTime,`Do up to ${reps} slow push-ups, then stand and rest. Hands on the platform, feet on the ground.`,'Use a high, stable platform intended for support. Keep your body in one line. Bend your elbows comfortably back, lower a little, and press away. A higher surface makes it easier. Stop before straining; no need to fill the timer or force the depth.','move','Push-up platform',reps);
  add('rest','Stand up. Rest.',rest,'Relax your arms. Walk to the pull-up bar when ready.','Pause the timer if you need longer to rest or move between stations.','rest','Between stations');
  add('hanging-knee-raise','Hanging knee raise',kneeTime,'One small knee raise: knees up gently, lower slowly, feet down. Too hard? Just hang for up to 3 seconds.','Only try this if you can hang steadily and get on and off the bar in control. Keep arms long, bend your knees and gently curl your pelvis towards your ribs. No swinging, pulling up, jumping or dropping. If it feels too hard, do your familiar plain hang for up to 3 seconds instead. Stop for pain or slipping grip. One attempt only; rest for the remaining time.','move','Pull-up bar',1);
  add('rest','Feet down. Rest.',rest,'Relax your hands. Move to the parallel bars when ready.','Take your time. You do not need to stay hanging until the timer ends.','rest','Between stations');
  add('support-hold','Parallel-bar hold',hold,`Hold the top for up to ${hold} seconds. Feet down sooner if needed. No dip.`,supportTip,'hold','Parallel bars');
  add('rest','Feet down. You’re done.',restBudget-rest*2,'Relax. That is enough for today.','Finish with plenty left. Continue your coffee walk when ready.','rest','Fitness corner');
 }
 return {mode,level,seconds,strength,holdSeconds:mode==='recovery'?0:hold,station:mode==='recovery'?'Parallel bars · Feet stay down':'Platform + pull-up bar + parallel bars',steps,title:mode==='recovery'?'An easy day at your bars':mode==='restart'?'A gentle return':'Your corner routine',reason:mode==='recovery'?'Let your arms recover. Keep the visit easy.':'Platform push-ups. One knee raise. One steady hold.'};
}
export function record(s,entry){
 const next=validate(s);if(next.sessions.some(x=>x.date===entry.date))return {state:next,changed:false,promoted:false};
 next.sessions.push({...entry});next.levelSince??=entry.date;
 if(entry.mode==='restart'){next.level=0;next.levelSince=entry.date;}
 if(entry.effort==='hard'||entry.effort==='pain'){next.level=Math.max(0,next.level-1);next.levelSince=entry.date;}
 let promoted=false;
 const eligible=next.sessions.filter(x=>x.date>=next.levelSince&&distance(entry.date,x.date)>=0&&distance(entry.date,x.date)<14&&x.level===next.level&&x.full&&x.mode==='normal'&&x.effort==='easy'&&x.again==='yes');
 if(next.level<7&&entry.effort==='easy'&&entry.mode==='normal'&&entry.full&&entry.again==='yes'&&distance(entry.date,next.levelSince)>=6&&eligible.length>=3){next.level++;next.levelSince=entry.date;promoted=true;}
 return {state:validate(next),changed:true,promoted};
}
export function duration(seconds){return seconds<60?`${seconds} sec`:seconds%60?`${Math.floor(seconds/60)} min ${seconds%60} sec`:`${seconds/60} min`;}
