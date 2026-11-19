(function(root){
'use strict';
function toXRRecord(moment){
 if(!moment||!['point','column','framed-surface','sky-surface'].includes(moment.form))
  return {supported:false,reason:'Timed trajectory playback is not yet implemented in the XR renderer.'};
 const sky=moment.form==='sky-surface',point=moment.form==='point',column=moment.form==='column';
 const text=String(moment.content?.text||'').trim(),imageUrl=String(moment.content?.imageUrl||'');
 if(!text&&!imageUrl)return {supported:false,reason:'Add text or an image before starting the current XR surface renderer.'};
 return {supported:true,scope:'session-local',geographicAnchorApplied:false,record:{
  id:moment.id||'moment',kind:sky?'sky':point?'point':column?'column':moment.placement?.mode==='indoor'?'venue':'surface',
  body:text||String(moment.content?.altText||''),width_m:point?Math.max(.2,Number(moment.geometry?.diameter)||.6):column?(Number(moment.geometry?.diameter)||1):(Number(moment.geometry?.width)||3),height_m:point?Math.max(.4,Number(moment.geometry?.height)||1.2):column?(Number(moment.geometry?.height)||4):(Number(moment.geometry?.height)||2),
  altitude_m:sky?Math.max(2.5,Number(moment.sky?.elevation)||4):0,
  style:{preset:moment.geometry?.frame?.enabled?'outline':'editorial'},
  frameEnabled:!point&&!column&&moment.geometry?.frame?.enabled!==false,
  facing:moment.geometry?.facing||'both',
  orientation:sky?(moment.sky?.orientation||'horizontal'):'vertical',
  imageUrl:moment.content?.imageUrl||'',altText:moment.content?.altText||'',
  placementMode:moment.placement?.mode||'outdoor'
 }};
}
const api={toXRRecord};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentXRAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
