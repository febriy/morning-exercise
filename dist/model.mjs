export const DEFAULT_TIME=120;
const TIMES=[60,120,300,600];
export function loadPreferences(raw,legacyRaw=null){
 for(const [value,legacy] of [[raw,false],[legacyRaw,true]]){
  try{
   const parsed=JSON.parse(value);
   if(parsed&&(!legacy||parsed.program==='personal-corner-v2')&&TIMES.includes(parsed.timeBudget))return {timeBudget:parsed.timeBudget};
  }catch{}
 }
 return {timeBudget:DEFAULT_TIME};
}
export function recipe({timeBudget=DEFAULT_TIME}={},{tiny=false}={}){
 const seconds=tiny?60:TIMES.includes(timeBudget)?timeBudget:DEFAULT_TIME;
 const hold=seconds===60?5:10,reps=seconds===60?3:8;
 const steps=[];
 const add=(id,title,seconds,cue,tip,kind,station,reps)=>steps.push({id,title,seconds,cue,tip,kind,station,...(reps?{reps}:{})});
 const supportTip='Hold the top position only, with arms straight but not forced into a hard lock. Keep shoulders steady. Let your feet take some weight if the setup allows. Don’t bend your elbows into a dip. Only start if you can get into and out of the position in control.';
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
 return {seconds,steps};
}
export function duration(seconds){return seconds<60?`${seconds} sec`:seconds%60?`${Math.floor(seconds/60)} min ${seconds%60} sec`:`${seconds/60} min`;}

export function kidsRecipe(){
 return {seconds:85,steps:[
  {id:'prepare',title:'Get ready',seconds:5,cue:'Find your space. Jumping jacks are first.',tip:'Put your phone somewhere you can see and hear it, then get ready to move.',kind:'prepare',station:'Before you start'},
  {id:'jumping-jacks',title:'Jumping jacks',seconds:20,cue:'Arms up, feet out. Arms down, feet in. Go at your own pace.',tip:'Make space around you for your arms and feet. Land softly and take a break whenever you need.',kind:'move',station:'At home'},
  {id:'rest',title:'Rest',seconds:20,cue:'Catch your breath. Squats are next.',tip:'Relax. Pause the timer if you want a longer break.',kind:'rest',station:'Take a breather'},
  {id:'squat',title:'Squats',seconds:20,cue:'Hips back, then stand tall. Go at your own pace.',tip:'Keep your heels down. Lower only as far as feels comfortable, then stand back up.',kind:'move',station:'At home'},
  {id:'rest',title:'Rest',seconds:20,cue:'One last breather. You’re nearly done.',tip:'Relax and catch your breath. The session ends after this rest.',kind:'rest',station:'One last breather'}
 ]};
}
