(function(root){
'use strict';
const VERSION=1, EARTH=6371008.8, RAD=Math.PI/180, DEG=180/Math.PI;
const FORMS=new Set(['point','framed-surface','column','sky-surface','trajectory']);
const MODES=new Set(['outdoor','indoor']);
const DATUMS=new Set(['MSL','WGS84_ELLIPSOID','AGL','VENUE_LOCAL']);
const VISIBILITIES=new Set(['public','unlisted','private']);
const FACES=new Set(['front','back','both']);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const norm=a=>((Number(a)%360)+360)%360;
const signedDelta=(a,b)=>((norm(a)-norm(b)+540)%360)-180;
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const clone=v=>JSON.parse(JSON.stringify(v));
function distanceBearing(a,b){
 const p1=a.lat*RAD,p2=b.lat*RAD,dl=(b.lon-a.lon)*RAD,dp=(b.lat-a.lat)*RAD;
 const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
 const distance=2*EARTH*Math.asin(Math.min(1,Math.sqrt(h)));
 const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
 return {distance,bearing:norm(Math.atan2(y,x)*DEG)};
}
function destination(origin,bearing,meters){
 const p=origin.lat*RAD,l=origin.lon*RAD,b=bearing*RAD,d=meters/EARTH;
 const q=Math.asin(Math.sin(p)*Math.cos(d)+Math.cos(p)*Math.sin(d)*Math.cos(b));
 const lon=l+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(p),Math.cos(d)-Math.sin(p)*Math.sin(q));
 return {lat:q*DEG,lon:((lon*DEG+540)%360)-180};
}
function localToWgs84(origin,local,rotationDeg=0){
 const angle=rotationDeg*RAD,x=local.x*Math.cos(angle)-local.z*Math.sin(angle),z=local.x*Math.sin(angle)+local.z*Math.cos(angle);
 const distance=Math.hypot(x,z),bearing=norm(Math.atan2(x,z)*DEG);
 const p=destination({lat:origin.lat,lon:origin.lon},bearing,distance);
 return {lat:p.lat,lon:p.lon,altitude:(origin.altitude||0)+(local.y||0)};
}
function wgs84ToLocal(origin,point,rotationDeg=0){
 const g=distanceBearing(origin,point),a=g.bearing*RAD-radians(rotationDeg);
 return {x:g.distance*Math.sin(a),y:(point.altitude||0)-(origin.altitude||0),z:g.distance*Math.cos(a)};
}
function radians(v){return v*RAD}
function interpolatePosition(a,b,t,mode){
 if(mode==='indoor')return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};
 const g=distanceBearing(a,b),p=destination(a,g.bearing,g.distance*t);
 return {lat:p.lat,lon:p.lon,altitude:(a.altitude||0)+((b.altitude||0)-(a.altitude||0))*t};
}
function defaultMoment(overrides={}){
 const base={
  schemaVersion:VERSION,id:null,title:'Untitled Moment',subtitle:'',experienceKind:'landscape',content:{type:'text',contentType:'story',subtitle:'',place:'',text:'',imageUrl:'',audioUrl:'',altText:'',language:'en',attribution:'',artist:'',materials:'',provenance:'',sourceLabel:'',sourceUrl:'',menu:[],arMode:'none'},
  form:'framed-surface',placement:{mode:'outdoor',anchor:{lat:null,lon:null,altitude:0,altitudeDatum:'MSL'},indoor:{venueId:'',venueName:'',room:'',floor:'',origin:null,rotationDeg:0,anchor:{x:0,y:0,z:0},surface:'wall',arMode:'none',qr:{payload:'',physicalSizeM:0.15}}},
  geometry:{width:3,height:2,depth:0.12,diameter:1,heading:0,facing:'both',frame:{enabled:true,style:'line',thickness:0.04,color:'#ff6248'},offset:{x:0,y:0,z:0}},
  sky:{elevation:0,orientation:'horizontal',readableFromBelow:true},
  motion:{kind:'static',startsAt:null,durationMs:60000,interpolation:'geodesic-linear',loop:false,waypoints:[]},
  visibility:{audience:'unlisted',maxRangeM:1000,startsAt:null,endsAt:null},
  metadata:{creatorId:null,createdAt:null,updatedAt:null,revision:1,tags:[],sourceVersion:'native'}
 };
 return merge(base,overrides);
}
function merge(base,patch){
 const out=clone(base);
 for(const [k,v] of Object.entries(patch||{})){
  if(v&&typeof v==='object'&&!Array.isArray(v)&&out[k]&&typeof out[k]==='object'&&!Array.isArray(out[k]))out[k]=merge(out[k],v);
  else out[k]=clone(v);
 }
 return out;
}
function validateMoment(m){
 const errors=[],warnings=[];
 if(!m||typeof m!=='object')return {valid:false,errors:['moment_invalid'],warnings};
 if(m.schemaVersion!==VERSION)errors.push('schema_version_unsupported');
 if(!FORMS.has(m.form))errors.push('form_invalid');
 if(!m.placement||!MODES.has(m.placement.mode))errors.push('placement_mode_invalid');
 if(!['landscape','venue'].includes(m.experienceKind||'landscape'))errors.push('experience_kind_invalid');
 if(!m.geometry||!finite(m.geometry.heading)||m.geometry.heading<0||m.geometry.heading>=360)errors.push('heading_out_of_range');
 if(!m.geometry||!FACES.has(m.geometry.facing))errors.push('facing_invalid');
 if(!m.geometry||!m.geometry.frame||typeof m.geometry.frame.enabled!=='boolean')errors.push('frame_invalid');
 const g=m.geometry||{};
 if(m.form==='framed-surface'||m.form==='sky-surface'){
  if(!finite(g.width)||g.width<=0||g.width>100000)errors.push('width_out_of_range');
  if(!finite(g.height)||g.height<=0||g.height>100000)errors.push('height_out_of_range');
 }
 if(m.form==='column'){
  if(!finite(g.diameter)||g.diameter<=0||g.diameter>10000)errors.push('diameter_out_of_range');
  if(!finite(g.height)||g.height<=0||g.height>100000)errors.push('height_out_of_range');
 }
 if(m.form==='point'&&(!finite(g.width)||g.width<=0||g.width>1000))errors.push('point_size_out_of_range');
 const p=m.placement||{};
 if(p.mode==='outdoor'){
  const a=p.anchor||{};
  if(!finite(a.lat)||!finite(a.lon)||Math.abs(a.lat)>90||Math.abs(a.lon)>180)errors.push('outdoor_anchor_invalid');
  if(!finite(a.altitude))errors.push('altitude_invalid');
  if(!DATUMS.has(a.altitudeDatum)||a.altitudeDatum==='VENUE_LOCAL')errors.push('altitude_datum_invalid');
 }else{
  const i=p.indoor||{},a=i.anchor||{},o=i.origin;
  if(!i.venueName&&!i.venueId)errors.push('indoor_venue_required');
  if(!o||!finite(o.lat)||!finite(o.lon)||Math.abs(o.lat)>90||Math.abs(o.lon)>180)errors.push('indoor_origin_invalid');
  if(!finite(a.x)||!finite(a.y)||!finite(a.z))errors.push('indoor_anchor_invalid');
  if(!['wall','floor','ceiling','column','free'].includes(i.surface))errors.push('indoor_surface_invalid');
  if(!['none','local','sky','qr'].includes(i.arMode||'none'))errors.push('indoor_ar_mode_invalid');
  if(i.arMode==='qr'&&(!i.qr?.payload||!finite(i.qr?.physicalSizeM)||i.qr.physicalSizeM<=0.01))errors.push('indoor_qr_anchor_invalid');
  if(i.surface==='wall'&&!i.room)warnings.push('indoor_room_not_named');
 }
 const v=m.visibility||{};
 if(!VISIBILITIES.has(v.audience))errors.push('visibility_invalid');
 if(!finite(v.maxRangeM)||v.maxRangeM<0||v.maxRangeM>10000000)errors.push('visibility_range_invalid');
 if(v.startsAt&&Number.isNaN(Date.parse(v.startsAt)))errors.push('visibility_start_invalid');
 if(v.endsAt&&Number.isNaN(Date.parse(v.endsAt)))errors.push('visibility_end_invalid');
 if(v.startsAt&&v.endsAt&&Date.parse(v.endsAt)<=Date.parse(v.startsAt))errors.push('visibility_window_invalid');
 const motion=m.motion||{};
 if(!['static','trajectory'].includes(motion.kind))errors.push('motion_kind_invalid');
 if(m.form==='trajectory'&&motion.kind!=='trajectory')errors.push('trajectory_form_requires_motion');
 if(motion.kind==='trajectory'){
  if(!finite(motion.durationMs)||motion.durationMs<=0||motion.durationMs>31536000000)errors.push('trajectory_duration_invalid');
  if(!['geodesic-linear','linear'].includes(motion.interpolation))errors.push('trajectory_interpolation_invalid');
  if(!Array.isArray(motion.waypoints)||motion.waypoints.length<2||motion.waypoints.length>500)errors.push('trajectory_waypoints_invalid');
  else{
   let last=-1;
   motion.waypoints.forEach((w,index)=>{
    if(!finite(w.t)||w.t<0||w.t>1||w.t<=last)errors.push('trajectory_waypoint_time_invalid:'+index);
    last=w.t;
    const pos=w.position||{};
    if(p.mode==='outdoor'&&(!finite(pos.lat)||!finite(pos.lon)||Math.abs(pos.lat)>90||Math.abs(pos.lon)>180))errors.push('trajectory_waypoint_position_invalid:'+index);
    if(p.mode==='indoor'&&(!finite(pos.x)||!finite(pos.y)||!finite(pos.z)))errors.push('trajectory_waypoint_position_invalid:'+index);
    if(!finite(pos.altitude||0)&&p.mode==='outdoor')errors.push('trajectory_waypoint_altitude_invalid:'+index);
   });
   if(motion.waypoints.length>=2&&(motion.waypoints[0].t!==0||motion.waypoints[motion.waypoints.length-1].t!==1))warnings.push('trajectory_should_span_zero_to_one');
  }
  if(!motion.startsAt)errors.push('trajectory_start_required');
  else if(Number.isNaN(Date.parse(motion.startsAt)))errors.push('trajectory_start_invalid');
 }
 const c=m.content||{};
 if(!['text','image','audio','mixed'].includes(c.type))errors.push('content_type_invalid');
 if(!['artwork','story','menu','clock','news','advertisement'].includes(c.contentType||'story'))errors.push('content_format_invalid');
 if(!['none','local','sky','qr'].includes(c.arMode||'none'))errors.push('content_ar_mode_invalid');
 if(c.sourceUrl&&!/^https:\/\//i.test(c.sourceUrl))errors.push('source_url_must_be_https');
 if(c.menu!==undefined&&(!Array.isArray(c.menu)||c.menu.length>100))errors.push('menu_invalid');
 if(Array.isArray(c.menu))c.menu.forEach((item,index)=>{if(!item||typeof item.name!=='string'||item.name.length>160)errors.push('menu_item_invalid:'+index)});
 if(typeof c.text!=='string'||c.text.length>20000)errors.push('content_text_invalid');
 for(const k of ['imageUrl','audioUrl'])if(c[k]&&!/^https:\/\//i.test(c[k]))errors.push(k+'_must_be_https');
 if(m.form==='sky-surface'&&p.mode==='indoor')warnings.push('sky_surface_indoor_context_unusual');
 return {valid:errors.length===0,errors,warnings};
}
function sampleTrajectory(m,at){
 const motion=m.motion||{},wps=motion.waypoints||[];
 if(motion.kind!=='trajectory'||wps.length<2)return {active:false,reason:'not_a_trajectory'};
 const start=Date.parse(motion.startsAt||'');
 if(!Number.isFinite(start))return {active:false,reason:'start_time_missing'};
 const elapsed=at-start,duration=motion.durationMs;
 if(elapsed<0)return {active:false,reason:'not_started',progress:0};
 if(!motion.loop&&elapsed>duration)return {active:false,reason:'completed',progress:1};
 const progress=motion.loop?((elapsed%duration)/duration):clamp(elapsed/duration,0,1);
 let i=0;while(i<wps.length-2&&progress>wps[i+1].t)i++;
 const a=wps[i],b=wps[i+1],span=b.t-a.t,t=span===0?0:clamp((progress-a.t)/span,0,1);
 const position=interpolatePosition(a.position,b.position,t,m.placement.mode);
 return {active:true,progress,position,segment:i,segmentProgress:t,elapsedMs:elapsed,durationMs:duration};
}
function isVisibleNow(m,at=Date.now()){
 const v=m.visibility||{},t=typeof at==='number'?at:Date.parse(at);
 if(v.audience==='private')return false;
 if(v.startsAt&&t<Date.parse(v.startsAt))return false;
 if(v.endsAt&&t>=Date.parse(v.endsAt))return false;
 return true;
}
function migrateLegacyWork(old={}){
 const venue=old.kind==='venue'||old.placement?.mode==='indoor';
 const form=old.form||old.geometryType||(old.kind==='sky'?'sky-surface':'framed-surface');
 const validForm=FORMS.has(form)?form:(venue?'point':'framed-surface');
 const m=defaultMoment({
  id:old.id||null,title:old.title||'Untitled Moment',subtitle:old.subtitle||'',experienceKind:old.kind==='venue'?'venue':'landscape',
  content:{type:old.image&&old.audio?'mixed':old.image?'image':old.audio?'audio':'text',contentType:old.contentType||'story',subtitle:old.subtitle||'',place:old.place||old.venue||'',text:old.body||old.text||'',imageUrl:old.image||'',audioUrl:old.audio||'',altText:old.accessibility||'',language:old.language||'en',attribution:old.sourceLabel||'',artist:old.artist||'',materials:old.materials||'',provenance:old.provenance||'',sourceLabel:old.sourceLabel||'',sourceUrl:old.sourceUrl||'',menu:old.menu||[],arMode:old.arMode||'none'},
  form:validForm,
  placement:venue?{mode:'indoor',indoor:{venueId:old.venueId||'',venueName:old.place||old.venue||'',room:old.room||'',floor:old.floor||'',origin:old.origin||null,rotationDeg:old.rotationDeg||0,anchor:old.localAnchor||{x:0,y:0,z:0},surface:old.indoorSurface||'wall',arMode:old.arMode||'none',qr:{payload:old.qrPayload||'',physicalSizeM:Number(old.qrSize||.15)}}}:{mode:'outdoor',anchor:{lat:Number(old.lat),lon:Number(old.lon),altitude:Number(old.altitude||0),altitudeDatum:old.datum==='ellipsoid'?'WGS84_ELLIPSOID':'MSL'}},
  geometry:{width:Number(old.width||old.width_m||3),height:Number(old.height||old.height_m||2),diameter:Number(old.diameter||1),heading:norm(Number(old.heading||0)),facing:old.facing||'both',frame:{enabled:old.frame?.enabled!==false,style:old.frame?.style||'line',thickness:Number(old.frame?.thickness||.04),color:old.frame?.color||'#ff6248'}},
  visibility:{audience:old.visibility==='public'?'public':old.visibility==='private'?'private':'unlisted',maxRangeM:Number(old.maxRange||old.maxRangeM||1000),startsAt:old.startsAt||null,endsAt:old.endsAt||null},
  metadata:{revision:Number(old.revision||1),sourceVersion:'legacy-import'}
 });
 if(old.motion?.waypoints)m.motion=merge(m.motion,old.motion);
 else if(Array.isArray(old.waypoints)&&old.waypoints.length>1)m.motion={kind:'trajectory',startsAt:old.trajectoryStartsAt||old.startsAt||null,durationMs:Number(old.durationMs||60000),interpolation:'geodesic-linear',loop:!!old.loop,waypoints:old.waypoints};
 if(validForm==='trajectory'&&m.motion.kind!=='trajectory')m.motion.kind='trajectory';
 return m;
}
const api={VERSION,FORMS,defaultMoment,validateMoment,distanceBearing,destination,localToWgs84,wgs84ToLocal,sampleTrajectory,isVisibleNow,migrateLegacyWork};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MonumentMomentModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
