const test=require('node:test');
const assert=require('node:assert/strict');
const R=require('../engine/spatial-runtime-contract.js');

test('WebXR session-local tracking cannot claim persistent geographic anchors',()=>{
 const r=R.localizationReport({provider:'webxr-local',coordinateFrame:'session-local',trackingState:'tracking',horizontalAccuracyM:null,verticalAccuracyM:null,headingAccuracyDeg:null,timestampMs:1000,persistent:true});
 assert.equal(r.valid,false);assert.ok(r.errors.includes('webxr_local_cannot_claim_persistence'));
});
test('a native geospatial provider can report explicit accuracy and persistence',()=>{
 const r=R.localizationReport({provider:'arcore-geospatial',coordinateFrame:'wgs84',trackingState:'tracking',horizontalAccuracyM:.08,verticalAccuracyM:.25,headingAccuracyDeg:1.5,timestampMs:1000,persistent:true,anchorId:'anchor-1',altitudeDatum:'WGS84_ELLIPSOID'});
 assert.equal(r.valid,true);assert.equal(r.report.persistent,true);assert.equal(r.report.horizontalAccuracyM,.08);
});
test('lost localization and invalid accuracy are surfaced, not silently normalized',()=>{
 const r=R.localizationReport({provider:'niantic-vps',coordinateFrame:'provider-local',trackingState:'lost',horizontalAccuracyM:-1,verticalAccuracyM:1,headingAccuracyDeg:1,timestampMs:1000,persistent:true});
 assert.equal(r.valid,false);assert.ok(r.errors.includes('horizontalAccuracyM_invalid'));
});
test('fresh depth-backed occlusion can be reliable',()=>{
 const r=R.occlusionReport({source:'lidar',confidence:.92,coverage:.8,timestampMs:1000,nowMs:1200,classes:['tree','wall']});
 assert.equal(r.valid,true);assert.equal(r.reliable,true);assert.equal(r.stale,false);
});
test('segmentation alone and stale depth are not treated as reliable metric occlusion',()=>{
 const semantic=R.occlusionReport({source:'segmentation-only',confidence:.95,coverage:.9,timestampMs:1000,nowMs:1100,classes:['sky']});
 assert.equal(semantic.reliable,false);
 const stale=R.occlusionReport({source:'scene-mesh',confidence:.95,coverage:.9,timestampMs:1000,nowMs:5000,classes:['building']});
 assert.equal(stale.stale,true);assert.equal(stale.reliable,false);
});
test('capability reports default missing platform features to false',()=>{
 const c=R.capabilities({camera:true,depth:true,persistentAnchors:true});
 assert.equal(c.camera,true);assert.equal(c.depth,true);assert.equal(c.terrainOcclusion,false);assert.equal(c.cloudOcclusion,false);
});
