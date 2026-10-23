const DESCRIPTIONS={
  'platform-pushup':'Platform push-up: hands elevated, feet on the ground, body straight.',
  'hanging-knee-raise':'One small knee raise with arms long, then a steady hang.',
  'support-hold':'Steady top support on parallel bars, arms straight. No dip.'
};

export function movementSprite(id,{preview=false}={}){
  if(!Object.hasOwn(DESCRIPTIONS,id))return '';
  return `<span class="movement-sprite${preview?' sprite-preview':''}"${preview?' aria-hidden="true"':` id="movement-demo" role="img" aria-label="${DESCRIPTIONS[id]}"`} data-frame="0"><img src="sprites/${id}.png" width="800" height="200" alt="" decoding="async" draggable="false"></span>`;
}

// Derive the pose from the workout clock, so pause/resume never restarts a rep.
// The knee raise plays only once; a support hold never becomes a dip animation.
export function movementFrame(id,seconds,{reduce=false}={}){
  if(reduce||!Number.isFinite(seconds)||seconds<0)return 0;
  if(id==='platform-pushup')return [0,1,2,3,0][Math.floor((seconds+.001)%5)];
  if(id==='hanging-knee-raise')return Math.min(3,Math.floor((seconds+.001)/.8));
  return 0;
}
