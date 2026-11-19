(function(root){
'use strict';
const DEPTH_UNITS=new Set(['meters']);
const REGISTRATION=new Set(['registered-to-color','camera-aligned','unregistered','world-mesh']);
const TIERS=Object.freeze({NONE:0,SEMANTIC:1,METRIC_DEPTH:2,SCENE_MESH:3,HIGH_FIDELITY:4});
function occlusionRenderPolicy(report,frame={}){
 const reasons=[];
 if(!report||report.valid!==true)reasons.push('occlusion_report_invalid');
 if(report&&report.stale)reasons.push('depth_frame_stale');
 if(frame.registration&&!REGISTRATION.has(frame.registration))reasons.push('registration_invalid');
 if(frame.registration==='unregistered')reasons.push('depth_not_registered_to_color');
 if(frame.depthUnits&&!DEPTH_UNITS.has(frame.depthUnits))reasons.push('depth_units_unsupported');
 if(frame.depthUnits!=='meters')reasons.push('metric_depth_units_missing');
 if(frame.cameraFrameId&&frame.colorFrameId&&frame.cameraFrameId!==frame.colorFrameId)reasons.push('camera_frame_mismatch');
 const source=report&&report.report&&report.report.source;
 const validMetric=!!report&&report.valid===true&&report.reliable===true&&!report.stale&&
   (source==='lidar'||source==='camera-depth'||source==='scene-mesh')&&
   (frame.registration==='registered-to-color'||frame.registration==='camera-aligned'||frame.registration==='world-mesh')&&
   frame.depthUnits==='meters'&&!!frame.cameraFrameId&&!!frame.colorFrameId&&frame.cameraFrameId===frame.colorFrameId;
 if(validMetric)return {mode:'depth-tested',tier:source==='scene-mesh'?TIERS.SCENE_MESH:TIERS.METRIC_DEPTH,depthTest:true,semanticMask:false,confidence:report.report.confidence,coverage:report.report.coverage,reasons:[]};
 if(source==='segmentation-only'&&report&&report.valid===true&&!report.stale)
   return {mode:'semantic-mask-approximation',tier:TIERS.SEMANTIC,depthTest:false,semanticMask:true,confidence:report.report.confidence,coverage:report.report.coverage,reasons:['metric_depth_unavailable']};
 return {mode:'virtual-only',tier:TIERS.NONE,depthTest:false,semanticMask:false,confidence:0,coverage:0,reasons:[...new Set(reasons.length?reasons:['metric_occlusion_unavailable'])]};
}
const api={DEPTH_UNITS,REGISTRATION,TIERS,occlusionRenderPolicy};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentOcclusionRendering=api;
})(typeof globalThis!=='undefined'?globalThis:this);
