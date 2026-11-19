const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../engine/moment-model.js');
const XR=require('../engine/xr-adapter.js');

test('framed surface maps to a session-local two-sided XR text plane',()=>{
 const m=M.defaultMoment({form:'framed-surface',content:{type:'text',text:'Hello Monument'}});
 const result=XR.toXRRecord(m);
 assert.equal(result.supported,true);
 assert.equal(result.scope,'session-local');
 assert.equal(result.geographicAnchorApplied,false);
 assert.equal(result.record.width_m,3);
 assert.equal(result.record.height_m,2);
 assert.equal(result.record.body,'Hello Monument');
 assert.equal(result.record.style.preset,'outline');
});

test('sky surface passes its elevation separately from public visibility timing',()=>{
 const m=M.defaultMoment({form:'sky-surface',sky:{elevation:250,orientation:'horizontal',readableFromBelow:true},content:{type:'text',text:'Look up'}});
 const result=XR.toXRRecord(m);
 assert.equal(result.record.kind,'sky');
 assert.equal(result.record.altitude_m,250);
 assert.equal(result.record.body,'Look up');
});

test('Point and Column map to dedicated 3D geometry while trajectory remains pending',()=>{
 const point=XR.toXRRecord(M.defaultMoment({form:'point',geometry:{diameter:0.8,height:1.5},content:{type:'text',text:'Marker'}}));
 assert.equal(point.supported,true);assert.equal(point.record.kind,'point');assert.equal(point.record.width_m,.8);assert.equal(point.record.height_m,1.5);
 const column=XR.toXRRecord(M.defaultMoment({form:'column',geometry:{diameter:2.4,height:18},content:{type:'text',text:'Column'}}));
 assert.equal(column.supported,true);assert.equal(column.record.kind,'column');assert.equal(column.record.width_m,2.4);assert.equal(column.record.height_m,18);
 const trajectory=XR.toXRRecord(M.defaultMoment({form:'trajectory'}));assert.equal(trajectory.supported,false);
 const imageOnly=M.defaultMoment({form:'framed-surface',content:{type:'image',text:'',imageUrl:'https://example.com/image.jpg',altText:'A mountain'}});
 const result=XR.toXRRecord(imageOnly);assert.equal(result.supported,true);assert.equal(result.record.imageUrl,'https://example.com/image.jpg');assert.equal(result.record.body,'A mountain');
});

test('XR adapter carries sky orientation, face visibility and frame state to renderer',()=>{
 const m=M.defaultMoment({form:'sky-surface',sky:{orientation:'vertical',elevation:12},geometry:{facing:'front',frame:{enabled:false}},content:{type:'text',text:'Vertical sky sign'}});
 const result=XR.toXRRecord(m);
 assert.equal(result.record.orientation,'vertical');
 assert.equal(result.record.facing,'front');
 assert.equal(result.record.frameEnabled,false);
});
