const DESCRIPTIONS={
  'platform-pushup':'Platform push-up: hands elevated, feet on the ground, body straight.',
  'hanging-knee-raise':'Controlled knee raises with arms long and no swinging.',
  'bar-hang':'Steady hang from a pull-up bar, arms long and body still.',
  'support-hold':'Steady top support on parallel bars, arms straight. No dip.',
  'squat':'Controlled squat: hips back, heels down, then stand tall.'
};

export function movementSprite(id,{preview=false}={}){
  if(!Object.hasOwn(DESCRIPTIONS,id))return '';
  const file=id==='bar-hang'?'hanging-knee-raise':id;
  return `<span class="movement-sprite${preview?' sprite-preview':''}"${preview?' aria-hidden="true"':` id="movement-demo" role="img" aria-label="${DESCRIPTIONS[id]}"`} data-frame="0"><img src="sprites/${file}.png" width="800" height="200" alt="" decoding="async" draggable="false"></span>`;
}

// Derive the pose from the workout clock, so pause/resume never restarts a rep.
// Repetition demos match a three-second cycle; both holds remain still.
export function movementFrame(id,seconds,{reduce=false}={}){
  if(reduce||!Number.isFinite(seconds)||seconds<0)return 0;
  if(['platform-pushup','hanging-knee-raise','squat'].includes(id))return Math.floor(((seconds+.001)%3)/.75);
  return 0;
}
