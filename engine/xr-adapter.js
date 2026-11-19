(function(root){
'use strict';
function toXRRecord(moment){
 if(!moment||!['framed-surface','sky-surface'].includes(moment.form))
  return {supported:false,reason:'This first XR renderer supports framed and sky surfaces. Point, column and trajectory renderers are the next integration step.'};
 const sky=moment.form==='sky-surface';
 const text=String(moment.content?.text||'').trim();
 if(!text)return {supported:false,reason:'Add text content before starting the current XR text-surface renderer.'};
 return {supported:true,scope:'session-local',geographicAnchorApplied:false,record:{
  id:moment.id||'moment',kind:sky?'sky':moment.placement?.mode==='indoor'?'venue':'surface',
  body:text,width_m:Number(moment.geometry?.width)||3,height_m:Number(moment.geometry?.height)||2,
  altitude_m:sky?Math.max(2.5,Number(moment.sky?.elevation)||4):0,
  style:{preset:moment.geometry?.frame?.enabled?'outline':'editorial'},
  imageUrl:moment.content?.imageUrl||'',altText:moment.content?.altText||'',
  placementMode:moment.placement?.mode||'outdoor'
 }};
}
const api={toXRRecord};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentXRAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
