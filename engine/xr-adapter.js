(function(root){
'use strict';
function toXRRecord(moment){
 if(!moment||!['point','column','framed-surface','sky-surface','trajectory'].includes(moment.form))
  return {supported:false,reason:'This Moment form is not supported by the current XR renderer.'};
 const sky=moment.form==='sky-surface',point=moment.form==='point',column=moment.form==='column',trajectory=moment.form==='trajectory';
 if(trajectory&&(!moment.motion||moment.motion.kind!=='trajectory'||!Array.isArray(moment.motion.waypoints)||moment.motion.waypoints.length<2||!moment.motion.startsAt||!Number.isFinite(Date.parse(moment.motion.startsAt))||!Number.isFinite(moment.motion.durationMs)||moment.motion.durationMs<=0))return {supported:false,reason:'Trajectory needs a valid start time, duration and at least two waypoints.'};
 const text=String(moment.content?.text||'').trim(),imageUrl=String(moment.content?.imageUrl||'');
 if(!text&&!imageUrl)return {supported:false,reason:'Add text or an image before starting the current XR surface renderer.'};
 return {supported:true,scope:'session-local',geographicAnchorApplied:false,record:{
  id:moment.id||'moment',kind:trajectory?'trajectory':sky?'sky':point?'point':column?'column':moment.placement?.mode==='indoor'?'venue':'surface',
  body:text||String(moment.content?.altText||''),width_m:point?Math.max(.2,Number(moment.geometry?.diameter)||.6):column?(Number(moment.geometry?.diameter)||1):(Number(moment.geometry?.width)||3),height_m:point?Math.max(.4,Number(moment.geometry?.height)||1.2):column?(Number(moment.geometry?.height)||4):(Number(moment.geometry?.height)||2),
  altitude_m:sky?Math.max(2.5,Number(moment.sky?.elevation)||4):0,
  style:{preset:moment.geometry?.frame?.enabled?'outline':'editorial'},
  frameEnabled:!point&&!column&&moment.geometry?.frame?.enabled!==false,
  facing:moment.geometry?.facing||'both',
  orientation:sky?(moment.sky?.orientation||'horizontal'):'vertical',
  imageUrl:moment.content?.imageUrl||'',altText:moment.content?.altText||'',
  placementMode:moment.placement?.mode||'outdoor',
  trajectory:trajectory?{startsAt:moment.motion.startsAt,durationMs:moment.motion.durationMs,loop:!!moment.motion.loop,interpolation:moment.motion.interpolation||'geodesic-linear',waypoints:moment.motion.waypoints.map(w=>({t:Number(w.t),position:{...w.position}}))}:null
 }};
}
const api={toXRRecord};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentXRAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
