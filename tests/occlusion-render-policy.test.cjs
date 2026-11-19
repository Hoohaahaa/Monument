const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../engine/spatial-runtime-contract.js');
const O=require('../engine/occlusion-render-policy.js');
const metric=()=>R.occlusionReport({source:'lidar',confidence:.92,coverage:.8,timestampMs:1000,nowMs:1100,classes:['tree','wall']});
test('registered fresh metric depth selects a real depth-tested rendering pass',()=>{
 const p=O.occlusionRenderPolicy(metric(),{registration:'registered-to-color',depthUnits:'meters',cameraFrameId:'rgb-1',colorFrameId:'rgb-1'});
 assert.equal(p.mode,'depth-tested');assert.equal(p.depthTest,true);assert.equal(p.tier,O.TIERS.METRIC_DEPTH);
});
test('unregistered depth never becomes authoritative occlusion',()=>{
 const p=O.occlusionRenderPolicy(metric(),{registration:'unregistered',depthUnits:'meters',cameraFrameId:'d-1',colorFrameId:'rgb-1'});
 assert.equal(p.mode,'virtual-only');assert.ok(p.reasons.includes('depth_not_registered_to_color'));
});
test('unknown or missing depth units disable metric occlusion',()=>{
 const p=O.occlusionRenderPolicy(metric(),{registration:'camera-aligned',depthUnits:'feet',cameraFrameId:'rgb-1',colorFrameId:'rgb-1'});
 assert.equal(p.depthTest,false);assert.ok(p.reasons.includes('depth_units_unsupported'));
});
test('segmentation-only input is an approximation, never a metric depth pass',()=>{
 const r=R.occlusionReport({source:'segmentation-only',confidence:.95,coverage:.9,timestampMs:1000,nowMs:1100,classes:['person']});
 const p=O.occlusionRenderPolicy(r,{});
 assert.equal(p.mode,'semantic-mask-approximation');assert.equal(p.depthTest,false);assert.equal(p.tier,O.TIERS.SEMANTIC);
});
test('stale depth falls back instead of masking against old geometry',()=>{
 const r=R.occlusionReport({source:'scene-mesh',confidence:.95,coverage:.9,timestampMs:1000,nowMs:5000,classes:['building']});
 const p=O.occlusionRenderPolicy(r,{registration:'world-mesh',depthUnits:'meters',cameraFrameId:'rgb-1',colorFrameId:'rgb-1'});
 assert.equal(p.mode,'virtual-only');assert.ok(p.reasons.includes('depth_frame_stale'));
});
test('missing camera-frame identity does not silently pass depth to renderer',()=>{
 const p=O.occlusionRenderPolicy(metric(),{registration:'camera-aligned',depthUnits:'meters'});
 assert.equal(p.depthTest,false);assert.equal(p.mode,'virtual-only');
});
