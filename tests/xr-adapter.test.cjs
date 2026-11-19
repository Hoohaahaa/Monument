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

test('point, column, trajectory and media-only work are not falsely advertised as supported by this renderer',()=>{
 for(const form of ['point','column','trajectory']){
  const result=XR.toXRRecord(M.defaultMoment({form}));
  assert.equal(result.supported,false);
 }
 const imageOnly=M.defaultMoment({form:'framed-surface',content:{type:'image',text:'',imageUrl:'https://example.com/image.jpg'}});
 assert.equal(XR.toXRRecord(imageOnly).supported,false);
});
