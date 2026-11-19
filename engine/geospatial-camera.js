(()=>{'use strict';
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const distance=(a,b)=>{const p1=rad(a.lat),p2=rad(b.lat),dp=rad(b.lat-a.lat),dl=rad(b.lon-a.lon),h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))};
const bearing=(a,b)=>{const p1=rad(a.lat),p2=rad(b.lat),dl=rad(b.lon-a.lon);return (deg(Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl)))+360)%360};
const wrap=a=>((a+540)%360)-180;
class GeospatialCamera{
 constructor(){this.video=null;this.canvas=null;this.ctx=null;this.status=null;this.location=null;this.heading=null;this.headingAccuracy=null;this.points=[];this.watch=null;this.active=false;this.lastFetch=0;this.fov=64;this.onOrientation=this.onOrientation.bind(this);this.onResize=this.resize.bind(this)}
 start(video,canvas,status){
  this.stop();this.video=video;this.canvas=canvas;this.ctx=canvas.getContext('2d');this.status=status;this.active=true;this.resize();window.addEventListener('resize',this.onResize);window.addEventListener('deviceorientationabsolute',this.onOrientation,true);window.addEventListener('deviceorientation',this.onOrientation,true);
  if(navigator.geolocation){this.watch=navigator.geolocation.watchPosition(p=>{const c=p.coords;if(this.location?.manual){this.loadPlaces();return}this.location={lat:c.latitude,lon:c.longitude,accuracy:c.accuracy,altitude:c.altitude,altitudeAccuracy:c.altitudeAccuracy};this.setStatus('GPS ±'+Math.round(c.accuracy)+'M · '+(this.heading===null?'WAITING FOR COMPASS':'COMPASS ACTIVE'));if(Date.now()-this.lastFetch>45000)this.loadPlaces()},e=>this.setStatus('LOCATION '+(e.code===1?'PERMISSION DENIED':'UNAVAILABLE')+' · CHOOSE PLACE ON MAP'),{enableHighAccuracy:true,maximumAge:5000,timeout:20000})}else this.setStatus('LOCATION API UNAVAILABLE · CHOOSE PLACE ON MAP');
  this.draw();return this;
 }
 async requestOrientationPermission(){
  try{if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted')throw Error('permission denied')}this.setStatus('SENSORS REQUESTED · MOVE PHONE TO CALIBRATE');return true}catch(e){this.setStatus('COMPASS PERMISSION UNAVAILABLE · '+e.message);return false}
 }
 onOrientation(e){
  let h=null;if(Number.isFinite(e.webkitCompassHeading))h=e.webkitCompassHeading;else if(e.absolute===true&&Number.isFinite(e.alpha))h=(360-e.alpha)%360;
  if(h!==null){this.heading=h;this.headingAccuracy=Number.isFinite(e.webkitCompassAccuracy)?e.webkitCompassAccuracy:null;this.draw()}
 }
 resize(){if(!this.canvas||!this.ctx)return;const r=this.canvas.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(d,0,0,d,0,0);this.draw()}
 setStatus(s){if(this.status)this.status.textContent=s}
 setLocation(lat,lon,accuracy=0){if(!Number.isFinite(lat)||!Number.isFinite(lon))return;this.location={lat,lon,accuracy,altitude:null,manual:true};this.points=[];this.lastFetch=0;this.setStatus('MANUAL LOCATION · '+lat.toFixed(5)+', '+lon.toFixed(5)+' · '+(this.heading===null?'NO COMPASS':'COMPASS ACTIVE'));this.loadPlaces();this.draw()}
 async loadPlaces(){
  if(!this.active||!this.location)return;const now=Date.now();if(now-this.lastFetch<15000)return;this.lastFetch=now;const {lat,lon}=this.location;
  const q='[out:json][timeout:12];(node(around:900,'+lat+','+lon+')[name];way(around:900,'+lat+','+lon+')[name];);out center tags 55;';
  try{const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(q),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Overpass '+r.status);const j=await r.json();this.points=(j.elements||[]).map(x=>({id:x.id,name:x.tags?.name||x.tags?.['name:en']||x.tags?.['name:local'],lat:x.lat??x.center?.lat,lon:x.lon??x.center?.lon,kind:x.tags?.amenity||x.tags?.tourism||x.tags?.historic||x.tags?.shop||x.tags?.leisure||x.tags?.place||'place'})).filter(x=>x.name&&Number.isFinite(x.lat)&&Number.isFinite(x.lon)).map(x=>({...x,distance:distance(this.location,x),bearing:bearing(this.location,x)})).sort((a,b)=>a.distance-b.distance).slice(0,45);this.draw();this.setStatus((this.location.manual?'MANUAL LOCATION':'GPS')+' · '+this.points.length+' PLACES · COMPASS PREVIEW · AZIMUTH GRID (NOT TERRAIN MESH)')}catch(e){this.setStatus('PLACES UNAVAILABLE · '+(e.message||'NETWORK ERROR')+' · LOCATION STILL ACTIVE');this.draw()}
 }
 draw(){
  if(!this.ctx||!this.canvas||!this.active)return;const c=this.ctx,w=this.canvas.clientWidth,h=this.canvas.clientHeight;c.clearRect(0,0,w,h);
  const center=w/2,base=h*.57;c.save();c.strokeStyle='rgba(220,238,222,.25)';c.fillStyle='rgba(230,241,231,.78)';c.lineWidth=.7;
  // Compass-registered azimuth reference. This is deliberately not presented as a terrain mesh.
  for(let b=0;b<360;b+=10){const delta=this.heading===null?wrap(b):wrap(b-this.heading);if(Math.abs(delta)>this.fov*.72)continue;const x=center+Math.tan(rad(delta))/Math.tan(rad(this.fov/2))*w/2;c.beginPath();c.moveTo(x,base-9);c.lineTo(x,h*.88);c.stroke();if(b%30===0){c.font='10px system-ui';c.textAlign='center';c.fillText(b+'°',x,base+14)}}
  for(let i=1;i<=3;i++){const y=base+i*(h*.075);c.beginPath();c.ellipse(center,base,w*(.12+i*.12),i*13,0,0,Math.PI*2);c.stroke()}
  c.strokeStyle='rgba(255,255,255,.72)';c.beginPath();c.moveTo(center,base-12);c.lineTo(center,base+20);c.stroke();c.restore();
  if(this.heading===null){c.fillStyle='rgba(8,15,10,.76)';c.fillRect(12,base+32,w-24,36);c.fillStyle='#fff';c.font='11px system-ui';c.textAlign='center';c.fillText('COMPASS NEEDED FOR DIRECTIONAL PLACE LABELS',center,base+54);return}
  if(!this.location.manual&&(this.location.accuracy||0)>80){c.fillStyle='rgba(8,15,10,.82)';c.fillRect(12,base+32,w-24,36);c.fillStyle='#fff';c.font='11px system-ui';c.textAlign='center';c.fillText('GPS ACCURACY TOO LOW · LABELS HIDDEN',center,base+54);return}if(this.headingAccuracy!==null&&this.headingAccuracy>30){c.fillStyle='rgba(8,15,10,.82)';c.fillRect(12,base+32,w-24,36);c.fillStyle='#fff';c.font='11px system-ui';c.textAlign='center';c.fillText('COMPASS ACCURACY TOO LOW · LABELS HIDDEN',center,base+54);return}const visible=this.points.filter(p=>Math.abs(wrap(p.bearing-this.heading))<this.fov*.52).slice(0,12);
  visible.forEach((p,i)=>{const delta=wrap(p.bearing-this.heading),x=center+Math.tan(rad(delta))/Math.tan(rad(this.fov/2))*w/2,y=base-35-(Math.min(p.distance,900)/900)*h*.23;c.fillStyle='rgba(8,15,10,.78)';const label=p.name.length>24?p.name.slice(0,22)+'…':p.name;c.font='600 11px system-ui';const tw=Math.min(w-28,c.measureText(label).width+22),bx=Math.max(8,Math.min(w-tw-8,x-tw/2));c.fillRect(bx,y-13,tw,34);c.strokeStyle='rgba(255,104,75,.9)';c.strokeRect(bx,y-13,tw,34);c.fillStyle='#fff';c.textAlign='center';c.fillText(label,bx+tw/2,y);c.fillStyle='#ff9a82';c.font='9px system-ui';c.fillText(p.distance<1000?Math.round(p.distance)+' m':(p.distance/1000).toFixed(1)+' km',bx+tw/2,y+13)});
 }
 selectAt(x,y){if(!this.canvas||this.heading===null)return null;const r=this.canvas.getBoundingClientRect(),px=x-r.left,py=y-r.top,w=r.width,h=r.height,center=w/2,base=h*.57;let best=null,score=Infinity;for(const p of this.points){const delta=wrap(p.bearing-this.heading);if(Math.abs(delta)>this.fov*.52)continue;const sx=center+Math.tan(rad(delta))/Math.tan(rad(this.fov/2))*w/2,sy=base-35-(Math.min(p.distance,900)/900)*h*.23,d=Math.hypot(px-sx,py-sy);if(d<score&&d<95){score=d;best=p}}return best}
 stop(){this.active=false;if(this.watch!==null)navigator.geolocation?.clearWatch(this.watch);this.watch=null;window.removeEventListener('resize',this.onResize);window.removeEventListener('deviceorientationabsolute',this.onOrientation,true);window.removeEventListener('deviceorientation',this.onOrientation,true);if(this.ctx&&this.canvas)this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}
}
const geo=new GeospatialCamera();
window.MONUMENT_GEO_CAMERA={start:(...a)=>geo.start(...a),stop:()=>geo.stop(),setLocation:(...a)=>geo.setLocation(...a),requestOrientationPermission:()=>geo.requestOrientationPermission(),selectAt:(x,y)=>geo.selectAt(x,y)};
})();