const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../engine/moment-model.js');

test('all spatial form families share one canonical Moment schema',()=>{
 for(const form of M.FORMS){
  const moment=M.defaultMoment({form});
  assert.equal(moment.schemaVersion,M.VERSION);
  assert.ok(moment.placement&&moment.geometry&&moment.content&&moment.visibility&&moment.motion);
 }
});

test('outdoor framed surface validates and preserves independent altitude datum',()=>{
 const m=M.defaultMoment({placement:{mode:'outdoor',anchor:{lat:27.95,lon:-82.46,altitude:120,altitudeDatum:'WGS84_ELLIPSOID'}}});
 assert.equal(M.validateMoment(m).valid,true);
 m.placement.anchor.altitudeDatum='VENUE_LOCAL';
 assert.ok(M.validateMoment(m).errors.includes('altitude_datum_invalid'));
});

test('indoor coordinates require a named venue and local origin, not GPS pretending to be room precision',()=>{
 const m=M.defaultMoment({placement:{mode:'indoor',indoor:{venueName:'Museum',room:'Gallery 2',origin:{lat:27.95,lon:-82.46,altitude:4},anchor:{x:2,y:1.5,z:-3},surface:'wall'}}});
 assert.equal(M.validateMoment(m).valid,true);
 m.placement.indoor.origin=null;
 assert.ok(M.validateMoment(m).errors.includes('indoor_origin_invalid'));
});

test('column dimensions and framed-surface dimensions have separate validation',()=>{
 const column=M.defaultMoment({form:'column',geometry:{diameter:1.2,height:14}});
 assert.equal(M.validateMoment(column).valid,true);
 column.geometry.diameter=0;
 assert.ok(M.validateMoment(column).errors.includes('diameter_out_of_range'));
 const panel=M.defaultMoment({form:'framed-surface',geometry:{width:40,height:12}});
 assert.equal(M.validateMoment(panel).valid,true);
});

test('indoor local coordinates convert to and from a geographic venue origin',()=>{
 const origin={lat:27.95,lon:-82.46,altitude:8};
 const local={x:12,y:2.4,z:-5};
 const geo=M.localToWgs84(origin,local,0);
 const roundTrip=M.wgs84ToLocal(origin,geo,0);
 assert.ok(Math.abs(roundTrip.x-local.x)<0.02);
 assert.ok(Math.abs(roundTrip.y-local.y)<1e-8);
 assert.ok(Math.abs(roundTrip.z-local.z)<0.02);
});

test('trajectory samples interpolate geographically and altitude independently of publication schedule',()=>{
 const m=M.defaultMoment({
  form:'trajectory',
  placement:{mode:'outdoor',anchor:{lat:0,lon:0,altitude:0,altitudeDatum:'MSL'}},
  motion:{kind:'trajectory',startsAt:'2026-01-01T00:00:00.000Z',durationMs:60000,interpolation:'geodesic-linear',loop:false,waypoints:[
   {t:0,position:{lat:0,lon:0,altitude:100}},
   {t:1,position:{lat:0,lon:1,altitude:500}}
  ]}
 });
 assert.equal(M.validateMoment(m).valid,true);
 const mid=M.sampleTrajectory(m,Date.parse('2026-01-01T00:00:30.000Z'));
 assert.equal(mid.active,true);
 assert.ok(Math.abs(mid.position.lon-.5)<.001);
 assert.equal(mid.position.altitude,300);
 assert.equal(M.sampleTrajectory(m,Date.parse('2025-12-31T23:59:00Z')).reason,'not_started');
 assert.equal(M.sampleTrajectory(m,Date.parse('2026-01-01T00:02:00Z')).reason,'completed');
});

test('trajectory loop wraps while a release schedule remains a separate visibility gate',()=>{
 const m=M.defaultMoment({
  form:'trajectory',
  motion:{kind:'trajectory',startsAt:'2026-01-01T00:00:00Z',durationMs:10000,interpolation:'geodesic-linear',loop:true,waypoints:[
   {t:0,position:{lat:0,lon:0,altitude:0}},
   {t:1,position:{lat:0,lon:1,altitude:0}}
  ]},
  visibility:{audience:'public',maxRangeM:1000,startsAt:'2026-01-01T00:00:00Z',endsAt:'2026-01-01T00:01:00Z'}
 });
 const sample=M.sampleTrajectory(m,Date.parse('2026-01-01T00:00:15Z'));
 assert.equal(sample.active,true);
 assert.equal(sample.progress,.5);
 assert.equal(M.isVisibleNow(m,Date.parse('2026-01-01T00:00:30Z')),true);
 assert.equal(M.isVisibleNow(m,Date.parse('2026-01-01T00:02:00Z')),false);
});

test('private work is never visitor-visible; unlisted work can be shared',()=>{
 const m=M.defaultMoment({visibility:{audience:'unlisted',maxRangeM:500,startsAt:null,endsAt:null}});
 assert.equal(M.isVisibleNow(m,Date.now()),true);
 m.visibility.audience='private';
 assert.equal(M.isVisibleNow(m,Date.now()),false);
});

test('legacy outdoor landscape work migrates without losing media, dimensions or publication window',()=>{
 const m=M.migrateLegacyWork({id:'old-1',kind:'landscape',title:'Old sky work',body:'Text',image:'https://example.com/image.jpg',audio:'https://example.com/audio.mp3',lat:33.7,lon:50.08,altitude:1800,width:12000,height:6000,heading:180,datum:'MSL',visibility:'public',startsAt:'2026-01-01T00:00:00Z',endsAt:'2026-01-02T00:00:00Z'});
 assert.equal(m.id,'old-1');
 assert.equal(m.content.imageUrl,'https://example.com/image.jpg');
 assert.equal(m.geometry.width,12000);
 assert.equal(m.visibility.audience,'public');
 assert.equal(m.metadata.sourceVersion,'legacy-import');
 assert.equal(M.validateMoment(m).valid,true);
});

test('trajectory timing is not inferred from ordinary publication start/end fields',()=>{
 const m=M.migrateLegacyWork({kind:'landscape',lat:10,lon:20,width:10,height:4,startsAt:'2026-01-01T00:00:00Z',endsAt:'2026-01-01T01:00:00Z'});
 assert.equal(m.motion.kind,'static');
 assert.equal(m.visibility.startsAt,'2026-01-01T00:00:00Z');
});
