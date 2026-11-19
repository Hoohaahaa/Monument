(function(root){
'use strict';
const PROVIDERS=new Set(['webxr-local','arcore-geospatial','arkit-world','niantic-vps','unknown']);
const FRAMES=new Set(['session-local','venue-local','wgs84','ecef','provider-local']);
const TRACKING=new Set(['tracking','limited','relocalizing','lost','unavailable']);
const DEPTH_SOURCES=new Set(['none','camera-depth','lidar','scene-mesh','terrain-mesh','segmentation-only']);
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function localizationReport(input={}){
 const errors=[];
 if(!PROVIDERS.has(input.provider))errors.push('provider_invalid');
 if(!FRAMES.has(input.coordinateFrame))errors.push('coordinate_frame_invalid');
 if(!TRACKING.has(input.trackingState))errors.push('tracking_state_invalid');
 for(const k of ['horizontalAccuracyM','verticalAccuracyM','headingAccuracyDeg'])if(input[k]!==null&&input[k]!==undefined&&(!finite(input[k])||input[k]<0))errors.push(k+'_invalid');
 if(!finite(input.timestampMs)||input.timestampMs<=0)errors.push('timestamp_invalid');
 if(typeof input.persistent!=='boolean')errors.push('persistent_flag_required');
 if(input.provider==='webxr-local'&&input.persistent===true)errors.push('webxr_local_cannot_claim_persistence');
 if(input.coordinateFrame==='session-local'&&input.persistent===true)errors.push('session_local_cannot_claim_persistence');
 return {valid:errors.length===0,errors,report:errors.length?null:{
  provider:input.provider,coordinateFrame:input.coordinateFrame,trackingState:input.trackingState,
  horizontalAccuracyM:input.horizontalAccuracyM??null,verticalAccuracyM:input.verticalAccuracyM??null,
  headingAccuracyDeg:input.headingAccuracyDeg??null,timestampMs:input.timestampMs,
  persistent:input.persistent,anchorId:input.anchorId||null,siteId:input.siteId||null,
  altitudeDatum:input.altitudeDatum||null
 }};
}
function occlusionReport(input={}){
 const errors=[];
 if(!DEPTH_SOURCES.has(input.source))errors.push('occlusion_source_invalid');
 if(!finite(input.confidence)||input.confidence<0||input.confidence>1)errors.push('occlusion_confidence_invalid');
 if(!finite(input.coverage)||input.coverage<0||input.coverage>1)errors.push('occlusion_coverage_invalid');
 if(!finite(input.timestampMs)||input.timestampMs<=0)errors.push('occlusion_timestamp_invalid');
 if(!Array.isArray(input.classes)||input.classes.some(x=>typeof x!=='string'))errors.push('occlusion_classes_invalid');
 const ageMs=finite(input.nowMs)?Math.max(0,input.nowMs-input.timestampMs):null;
 const stale=ageMs!==null&&ageMs>1500;
 const reliable=errors.length===0&&input.source!=='none'&&input.source!=='segmentation-only'&&input.confidence>=.65&&input.coverage>=.35&&!stale;
 return {valid:errors.length===0,errors,stale,reliable,ageMs,report:errors.length?null:{
  source:input.source,confidence:clamp(input.confidence||0,0,1),coverage:clamp(input.coverage||0,0,1),
  timestampMs:input.timestampMs,classes:[...new Set(input.classes)],stale
 }};
}
function capabilities(input={}){
 const bools=['camera','worldTracking','persistentAnchors','depth','sceneMesh','semanticSegmentation','terrainOcclusion','cloudOcclusion'];
 const out={};for(const k of bools)out[k]=input[k]===true;
 return Object.freeze(out);
}
const api={PROVIDERS,FRAMES,TRACKING,DEPTH_SOURCES,localizationReport,occlusionReport,capabilities};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentSpatialRuntime=api;
})(typeof globalThis!=='undefined'?globalThis:this);
