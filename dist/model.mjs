export const DEFAULT_TIME=160;
export function recipe(){
 const seconds=DEFAULT_TIME,hold=10,reps=8;
 const steps=[];
 const add=(id,title,seconds,cue,tip,kind,station,reps)=>steps.push({id,title,seconds,cue,tip,kind,station,...(reps?{reps}:{})});
 const supportTip='Hold the top position only, with arms straight but not forced into a hard lock. Keep shoulders steady. Let your feet take some weight if the setup allows. Don’t bend your elbows into a dip. Only start if you can get into and out of the position in control.';
 const prepare=8,repTime=reps*3,rest=15;
 add('prepare','Get comfortable at the platform',prepare,'Loosen your hands and shoulders. Find a high, fixed push-up platform.','Arrive warm from your coffee walk. Pause for more preparation if needed. Use dry, fixed equipment and a clear place to put your feet down.','prepare','Push-up platform');
 add('platform-pushup','Platform push-ups',repTime,`Do up to ${reps} controlled push-ups. Hands on the platform, feet on the ground.`,'Use a high, stable platform intended for support. Keep your body in one line. Bend your elbows comfortably back, lower a little, and press away. A higher surface makes it easier. Stop before straining; no need to fill the timer or force the depth.','move','Push-up platform',reps);
 add('rest','Stand up. Rest.',rest,'Relax your arms. Move to the pull-up bar when ready.','Pause if you need more rest or time to move between stations.','rest','Between stations');
 add('hanging-knee-raise','Knee raises',repTime,`Up to ${reps} small knee raises. Lift gently, lower with control. Feet down when you need to rest.`,'Only try this if you can hang steadily and get on and off the bar in control. Keep arms long and raise bent knees without swinging or pulling up. You can stop before the target or skip the raises and rest. No jumping or dropping. Stop for pain or a slipping grip.','move','Pull-up bar',reps);
 add('rest','Feet down. Rest.',rest,'Put your feet down and relax your hands before the hang.','Pause for longer if your grip needs more rest. Do not stay hanging during this break.','rest','Pull-up bar');
 add('bar-hang','Pull-up bar hang',hold,`Hang steadily for up to ${hold} seconds. Keep your arms long. Feet down sooner if needed.`,'Grip a dry, fixed bar you can reach and leave in control. Keep your body still; no pull-up, swinging, jumping or dropping. Let your feet take weight if the station allows. Stop for pain or a slipping grip.','hold','Pull-up bar');
 add('rest','Feet down. Rest.',rest,'Relax your hands. Move to the parallel bars when ready.','Pause the timer if you need longer to rest or reach the next station.','rest','Between stations');
 add('support-hold','Parallel-bar hold',hold,`Hold the top for up to ${hold} seconds. Feet down sooner if needed. No dip.`,supportTip,'hold','Parallel bars');
 add('rest','Stand and rest.',rest,'Relax your arms. Find a clear, level place to stand.','Take more rest with Pause whenever you need it.','rest','Fitness corner');
 add('squat','Squats',repTime,`Up to ${reps} controlled squats. Hips back, heels down, then stand tall.`,'Use a dry, level surface. Stand with feet about shoulder-width apart. Bend your knees and move your hips back only as far as comfortable, keeping heels down and knees in line with your toes. Stand back up without jumping. Stop early rather than rushing to finish the reps.','move','Beside the bars',reps);
 return {seconds,steps};
}
export function duration(seconds){return seconds<60?`${seconds} sec`:seconds%60?`${Math.floor(seconds/60)} min ${seconds%60} sec`:`${seconds/60} min`;}

export function minimumRecipe(){
 const squat=recipe().steps.find(step=>step.id==='squat');
 const {reps,...movement}=squat;
 return {seconds:25,steps:[
  {id:'prepare',title:'Get ready',seconds:5,cue:'Find a clear space. Just 20 seconds of squats.',tip:'Put your phone where you can see and hear it. Stand on a dry, level surface and take more time with Pause if needed.',kind:'prepare',station:'Before you start'},
  {...movement,seconds:20,station:'Clear, level floor',cue:'Just 20 seconds. Squat comfortably, then stand tall. No weights needed.'}
 ]};
}

export function kettlebellSquat(){return {id:'kettlebell-squat',title:'Kettlebell squats',seconds:20,cue:'Bell close to your chest. Squat comfortably, then stand tall.',tip:'Hold one light kettlebell securely at chest height with both hands. Keep your chest upright, heels down and knees in line with your toes. Lower only as far as comfortable, then stand. Keep the bell close throughout. Stop before straining; the timer is not a rep target.',kind:'move',station:'Kettlebell · clear floor'};}

export function homeRecipe(){
 const rest={id:'rest',title:'Rest',seconds:15,cue:'Relax and catch your breath. Get ready for the next activity.',tip:'Pause if you need more time to rest or get into position. Set the kettlebell down in control and leave it on the floor during breaks.',kind:'rest',station:'Take a breather'};
 return {seconds:520,steps:[
  {id:'prepare',title:'Get ready',seconds:15,cue:'Find your space. Incline push-ups are first.',tip:'Have a fixed raised support, your kettlebell and trampoline ready. Clear space around the equipment and put your phone where you can see and hear it. Pause for more preparation whenever needed.',kind:'prepare',station:'Before you start'},
  {id:'incline-pushup',title:'Incline push-ups',seconds:20,cue:'Hands on a fixed, raised surface. Keep your body in one line.',tip:'Use a fixed counter or stable raised support that cannot slide or tip. Keep feet on the floor and your body straight. Bend your elbows comfortably back, lower a little, then press away. A higher surface makes it easier. Stop before straining.',kind:'move',station:'Fixed, raised support'},
  {...rest},
  {id:'kettlebell-swing',title:'Kettlebell swings',seconds:20,cue:'Hips back, then stand tall. Let your hips drive the bell.',tip:'Use a light bell and a clear space away from people. Learn a controlled hip hinge first. Hold the handle with both hands, hinge at the hips with slightly bent knees and a neutral back, then extend your hips to let the bell float no higher than chest height. Keep arms long; don’t lift with your shoulders or lean back. Guide it back between your thighs, then set it down in control when finished. Stop if your grip or form slips.',kind:'move',station:'Kettlebell · clear swing space'},
  {...rest},
  {id:'trampoline',title:'Trampoline',seconds:120,cue:'Easy, low bounces. Stay in the centre and go at your own pace.',tip:'Use your trampoline according to its instructions, on a stable surface with clear space around and above it. Start gently with soft knees and small controlled bounces. Use its support handle if supplied and needed. One person at a time; no high jumps or tricks. Pause and step off carefully when you need a break.',kind:'move',station:'Trampoline · easy bounces'},
  {...rest},
  {id:'packing-squats',title:'Packing with squats',seconds:300,cue:'Pack for five minutes. Use a comfortable squat whenever you pick something up from the floor.',tip:'Keep packing at your normal pace. Squat only for floor pickups; this is not a continuous squat set. Bend your hips and knees comfortably, keep light items close and stand smoothly. No need for a deep squat. Turn with your feet rather than twisting with a load, and get help with heavy or awkward items.',kind:'move',station:'Squat for floor pickups'}
 ]};
}

export function kidsRecipe(){
 return {seconds:85,steps:[
  {id:'prepare',title:'Get ready',seconds:5,cue:'Find your space. Jumping jacks are first.',tip:'Put your phone somewhere you can see and hear it, then get ready to move.',kind:'prepare',station:'Before you start'},
  {id:'jumping-jacks',title:'Jumping jacks',seconds:20,cue:'Arms up, feet out. Arms down, feet in. Go at your own pace.',tip:'Make space around you for your arms and feet. Land softly and take a break whenever you need.',kind:'move',station:'At home'},
  {id:'rest',title:'Rest',seconds:20,cue:'Catch your breath. Squats are next.',tip:'Relax. Pause the timer if you want a longer break.',kind:'rest',station:'Take a breather'},
  {id:'squat',title:'Squats',seconds:20,cue:'Hips back, then stand tall. Go at your own pace.',tip:'Keep your heels down. Lower only as far as feels comfortable, then stand back up.',kind:'move',station:'At home'},
  {id:'rest',title:'Rest',seconds:20,cue:'One last breather. You’re nearly done.',tip:'Relax and catch your breath. The session ends after this rest.',kind:'rest',station:'One last breather'}
 ]};
}
