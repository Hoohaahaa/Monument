(()=>{'use strict';
const $=id=>document.getElementById(id),M=window.MonumentMomentModel;
if(!M)return;
const KEY='monument.moment.draft.v1';
let moment=M.defaultMoment({id:'moment-'+Date.now()}),map=null,marker=null,shape=null,route=null,stream=null,visitor=false;
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const dec=s=>{try{return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))))}catch{return null}};
const val=id=>$(id)?.value??'';
const num=(id,d=0)=>{const n=Number(val(id));return Number.isFinite(n)?n:d};
function field(id,label,type,v,attrs){return '<div class="field"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+(type||'text')+'" value="'+(v??'')+'" '+(attrs||'')+'></div>'}
function select(id,label,items,v){return '<div class="field"><label for="'+id+'">'+label+'</label><select id="'+id+'">'+items.map(x=>'<option value="'+x[0]+'" '+(x[0]===v?'selected':'')+'>'+x[1]+'</option>').join('')+'</select></div>'}
function status(s){$('status').textContent=s}
function sheet(open){$('editor').classList.toggle('open',open)}
function anchor(){
 if(moment.placement.mode==='indoor'){const i=moment.placement.indoor;return i.origin?M.localToWgs84(i.origin,i.anchor,i.rotationDeg||0):null}
 return moment.placement.anchor;
}
function addControls(){
 if($('spatialControls'))return;
 const n=document.createElement('section');n.id='spatialControls';
 n.innerHTML='<div class="authoring-block"><div class="eyebrow">01 / FORM</div>'+
 select('momentForm','Spatial form',[['point','Point / marker'],['framed-surface','Framed surface / panel'],['column','Column / vertical form'],['sky-surface','Sky / elevated surface'],['trajectory','Trajectory / moving work']],moment.form)+
 select('placementMode','Placement context',[['outdoor','Outdoor · geographic'],['indoor','Indoor · venue coordinates']],moment.placement.mode)+'</div>'+
 '<div class="authoring-block" id="outdoorFields"><div class="eyebrow">02 / OUTDOOR ANCHOR</div><div class="pair">'+field('geoLat','Latitude','number',0,'step="any"')+field('geoLon','Longitude','number',0,'step="any"')+'</div><div class="pair">'+field('geoAltitude','Altitude · metres','number',0,'step="any"')+select('altitudeDatum','Vertical reference',[['MSL','Mean sea level'],['WGS84_ELLIPSOID','WGS84 ellipsoid'],['AGL','Above ground level']],'MSL')+'</div></div>'+
 '<div class="authoring-block" id="indoorFields" hidden><div class="eyebrow">02 / INDOOR ANCHOR</div>'+field('venueName','Venue','text','')+'<div class="pair">'+field('roomName','Room / gallery','text','')+field('floorName','Floor / level','text','')+'</div>'+
 select('indoorSurface','Attach to',[['wall','Wall'],['floor','Floor'],['ceiling','Ceiling'],['column','Column'],['free','Free placement']],'wall')+
 '<p class="muted">Indoor placement uses a venue-local origin. GPS identifies the venue origin; it does not claim room-level precision.</p><div class="eyebrow">VENUE ORIGIN · WGS84</div><div class="pair">'+field('originLat','Origin latitude','number',0,'step="any"')+field('originLon','Origin longitude','number',0,'step="any"')+'</div><div class="pair">'+field('originAltitude','Origin altitude · m','number',0,'step="any"')+field('roomRotation','Room rotation · degrees','number',0,'step="any"')+'</div><div class="eyebrow">LOCAL POSITION · METRES</div><div class="pair">'+field('localX','X · right','number',0,'step="any"')+field('localY','Y · up','number',0,'step="any"')+field('localZ','Z · forward','number',0,'step="any"')+'</div></div>'+
 '<div class="authoring-block" id="geometryFields"><div class="eyebrow">03 / GEOMETRY</div><div class="pair" id="surfaceDimensions">'+field('surfaceWidth','Width · m','number',3,'min="0.01" step="any"')+field('surfaceHeight','Height · m','number',2,'min="0.01" step="any"')+'</div><div class="pair" id="columnDimensions" hidden>'+field('columnDiameter','Diameter · m','number',1,'min="0.01" step="any"')+field('columnHeight','Height · m','number',4,'min="0.01" step="any"')+'</div>'+field('heading','Facing direction · degrees','number',0,'min="0" max="359" step="1"')+select('facing','Visible face',[['front','Front only'],['back','Back only'],['both','Both sides']],'both')+
 '<label class="checkline"><input id="frameEnabled" type="checkbox" checked> Show frame / border</label><div class="pair">'+field('frameThickness','Frame thickness · m','number',.04,'min="0" step="any"')+field('frameColor','Frame colour','color','#ff6248')+'</div></div>'+
 '<div class="authoring-block" id="skyFields" hidden><div class="eyebrow">04 / SKY / ELEVATION</div>'+field('skyElevation','Additional elevation · metres','number',0,'step="any"')+select('skyOrientation','Plane orientation',[['horizontal','Horizontal / overhead'],['vertical','Vertical / facing horizon']],'horizontal')+'<label class="checkline"><input id="readableBelow" type="checkbox" checked> Readable from below</label></div>'+
 '<div class="authoring-block" id="trajectoryFields" hidden><div class="eyebrow">04 / MOTION & TIMING</div>'+field('trajectoryStart','Trajectory starts at','datetime-local','')+'<div class="pair">'+field('trajectoryDuration','Duration · seconds','number',60,'min="1" step="1"')+select('trajectoryLoop','Repeat',[['false','Play once'],['true','Loop']],'false')+'</div><p class="muted">Add at least two ordered waypoints. The trajectory clock is independent from the public visibility window.</p><div id="waypointList"></div><button type="button" class="secondary" id="addWaypoint">+ Add waypoint</button></div>'+
 '<div class="authoring-block"><div class="eyebrow">05 / CONTENT & MEDIA</div>'+field('imageUrl','Image URL · HTTPS','url','')+field('audioUrl','Audio URL · HTTPS','url','')+field('altText','Media description','text','')+'</div>'+
 '<div class="authoring-block"><div class="eyebrow">06 / VISIBILITY & RELEASE</div>'+select('audience','Audience',[['unlisted','Anyone with the link'],['public','Public link'],['private','Private draft only']],'unlisted')+field('maxRange','Visibility range · metres','number',1000,'min="0" step="1"')+'<div class="pair">'+field('visibleFrom','Visible from','datetime-local','')+field('visibleUntil','Visible until','datetime-local','')+'</div><p class="muted">Save draft is local to this browser. Publish creates a shareable visitor link in this prototype; it does not yet register the work in a global public index.</p></div>'+
 '<div class="authoring-block"><div class="eyebrow">07 / MODEL VALIDATION</div><div id="modelDiagnostics" class="status">Complete the location and geometry fields.</div></div>'+
 '<div class="row" id="draftActions"><button type="button" class="secondary" id="saveDraft">Save draft</button><button type="button" class="secondary" id="previewWork">Preview</button></div>';
 const st=$('status');$('editor').insertBefore(n,st);$('publish').textContent='Publish / create share link ↗';
 $('addWaypoint').onclick=()=>{addWaypointRow();sync()};$('saveDraft').onclick=saveDraft;$('previewWork').onclick=()=>{sync();status('Preview updated · editorial preview only, not world-locked AR.')};
 bind();fillForm();renderWaypoints();
}
function bind(){
 const ids=['momentForm','placementMode','geoLat','geoLon','geoAltitude','altitudeDatum','venueName','roomName','floorName','indoorSurface','originLat','originLon','originAltitude','roomRotation','localX','localY','localZ','surfaceWidth','surfaceHeight','columnDiameter','columnHeight','heading','facing','frameEnabled','frameThickness','frameColor','skyElevation','skyOrientation','readableBelow','trajectoryStart','trajectoryDuration','trajectoryLoop','imageUrl','audioUrl','altText','audience','maxRange','visibleFrom','visibleUntil'];
 ids.forEach(id=>$(id)?.addEventListener('input',()=>sync()));
 $('momentForm').onchange=()=>{sync();conditional();renderWaypoints()};
 $('placementMode').onchange=()=>{sync();conditional();renderWaypoints()};
}
function fillForm(){
 const set=(id,v)=>{if($(id))$(id).value=v??''};
 set('momentForm',moment.form);set('placementMode',moment.placement.mode);
 const a=moment.placement.anchor,i=moment.placement.indoor;
 set('geoLat',a.lat);set('geoLon',a.lon);set('geoAltitude',a.altitude);set('altitudeDatum',a.altitudeDatum);
 set('venueName',i.venueName);set('roomName',i.room);set('floorName',i.floor);set('indoorSurface',i.surface);set('originLat',i.origin?.lat);set('originLon',i.origin?.lon);set('originAltitude',i.origin?.altitude);set('roomRotation',i.rotationDeg);set('localX',i.anchor.x);set('localY',i.anchor.y);set('localZ',i.anchor.z);
 set('surfaceWidth',moment.geometry.width);set('surfaceHeight',moment.geometry.height);set('columnDiameter',moment.geometry.diameter);set('columnHeight',moment.geometry.height);set('heading',moment.geometry.heading);set('facing',moment.geometry.facing);$('frameEnabled').checked=moment.geometry.frame.enabled;set('frameThickness',moment.geometry.frame.thickness);set('frameColor',moment.geometry.frame.color);
 set('skyElevation',moment.sky.elevation);set('skyOrientation',moment.sky.orientation);$('readableBelow').checked=moment.sky.readableFromBelow;
 set('trajectoryStart',moment.motion.startsAt?moment.motion.startsAt.slice(0,16):'');set('trajectoryDuration',moment.motion.durationMs/1000);set('trajectoryLoop',String(moment.motion.loop));
 set('imageUrl',moment.content.imageUrl);set('audioUrl',moment.content.audioUrl);set('altText',moment.content.altText);set('audience',moment.visibility.audience);set('maxRange',moment.visibility.maxRangeM);set('visibleFrom',moment.visibility.startsAt?moment.visibility.startsAt.slice(0,16):'');set('visibleUntil',moment.visibility.endsAt?moment.visibility.endsAt.slice(0,16):'');
 $('title').value=moment.title||'';$('body').value=moment.content.text||'';conditional();preview();
}
function sync(){
 moment.form=val('momentForm',moment.form);moment.placement.mode=val('placementMode',moment.placement.mode);
 if(moment.placement.mode==='outdoor')moment.placement.anchor={lat:num('geoLat',null),lon:num('geoLon',null),altitude:num('geoAltitude',0),altitudeDatum:val('altitudeDatum','MSL')};
 else{const i=moment.placement.indoor;i.venueName=val('venueName');i.room=val('roomName');i.floor=val('floorName');i.surface=val('indoorSurface','wall');i.origin={lat:num('originLat',null),lon:num('originLon',null),altitude:num('originAltitude',0)};i.rotationDeg=num('roomRotation',0);i.anchor={x:num('localX'),y:num('localY'),z:num('localZ')}}
 moment.title=val('title','Untitled Moment');moment.content.text=val('body');moment.content.imageUrl=val('imageUrl');moment.content.audioUrl=val('audioUrl');moment.content.altText=val('altText');
 moment.geometry.heading=((num('heading')%360)+360)%360;moment.geometry.facing=val('facing','both');moment.geometry.frame.enabled=$('frameEnabled').checked;moment.geometry.frame.thickness=num('frameThickness',.04);moment.geometry.frame.color=val('frameColor','#ff6248');moment.geometry.width=num('surfaceWidth',3);moment.geometry.height=num('surfaceHeight',2);moment.geometry.diameter=num('columnDiameter',1);if(moment.form==='column')moment.geometry.height=num('columnHeight',4);
 moment.sky.elevation=num('skyElevation');moment.sky.orientation=val('skyOrientation','horizontal');moment.sky.readableFromBelow=$('readableBelow').checked;
 moment.motion.kind=moment.form==='trajectory'?'trajectory':'static';moment.motion.startsAt=val('trajectoryStart')?new Date(val('trajectoryStart')).toISOString():null;moment.motion.durationMs=Math.max(1,num('trajectoryDuration',60))*1000;moment.motion.loop=val('trajectoryLoop')==='true';if(moment.form==='trajectory')moment.motion.waypoints=readWaypoints();
 moment.visibility.audience=val('audience','unlisted');moment.visibility.maxRangeM=Math.max(0,num('maxRange',1000));moment.visibility.startsAt=val('visibleFrom')?new Date(val('visibleFrom')).toISOString():null;moment.visibility.endsAt=val('visibleUntil')?new Date(val('visibleUntil')).toISOString():null;
 const c=M.validateMoment(moment);$('modelDiagnostics').textContent=c.valid?'MODEL VALID · '+moment.form.toUpperCase()+' · '+moment.placement.mode.toUpperCase()+(c.warnings.length?' · '+c.warnings.join(', '):''):'NEEDS ATTENTION · '+c.errors.join(' / ');
 preview();drawGeometry();
}
function readWaypoints(){return [...$('waypointList').children].map((r,index)=>{const n=Number(r.dataset.n),t=num('wpT'+n,index/Math.max(1,r.parentElement.children.length-1));const p=moment.placement.mode==='indoor'?{x:num('wpX'+n),y:num('wpY'+n),z:num('wpZ'+n)}:{lat:num('wpLat'+n),lon:num('wpLon'+n),altitude:num('wpAlt'+n)};return {t,position:p}}).sort((a,b)=>a.t-b.t)}
function addWaypointRow(w){
 const list=$('waypointList'),n=list.children.length,indoor=moment.placement.mode==='indoor',pos=w?.position||(indoor?{x:n*2,y:2,z:0}:{lat:num('geoLat'),lon:num('geoLon')+n*.001,altitude:0});
 const row=document.createElement('div');row.className='waypoint-row';row.dataset.n=n;
 row.innerHTML='<div class="waypoint-head"><b>Waypoint '+(n+1)+'</b><button type="button" class="close" aria-label="Remove waypoint">×</button></div>'+field('wpT'+n,'Path progress · 0–1','number',w?.t??(n/(Math.max(1,n+1))),'min="0" max="1" step=".01"')+
 (indoor?'<div class="pair">'+field('wpX'+n,'X · m','number',pos.x,'step="any"')+field('wpY'+n,'Y · m','number',pos.y,'step="any"')+field('wpZ'+n,'Z · m','number',pos.z,'step="any"')+'</div>':'<div class="pair">'+field('wpLat'+n,'Latitude','number',pos.lat,'step="any"')+field('wpLon'+n,'Longitude','number',pos.lon,'step="any"')+field('wpAlt'+n,'Altitude · m','number',pos.altitude||0,'step="any"')+'</div>');
 row.querySelector('button').onclick=()=>{if(list.children.length<=2){status('A trajectory needs at least two waypoints.');return}row.remove();[...list.children].forEach((r,i)=>{r.dataset.n=i;r.querySelector('b').textContent='Waypoint '+(i+1)});sync()};
 list.appendChild(row);
}
function renderWaypoints(){if(!$('waypointList'))return;$('waypointList').innerHTML='';const w=moment.motion.waypoints||[];if(w.length)w.forEach(addWaypointRow);else{addWaypointRow();addWaypointRow()}}
function conditional(){const indoor=moment.placement.mode==='indoor',f=moment.form;$('outdoorFields').hidden=indoor;$('indoorFields').hidden=!indoor;$('columnDimensions').hidden=f!=='column';$('surfaceDimensions').hidden=f==='column'||f==='point';$('skyFields').hidden=f!=='sky-surface';$('trajectoryFields').hidden=f!=='trajectory'}
function preview(){
 $('previewTitle').textContent=moment.title||'A thought, left here.';$('previewBody').textContent=moment.content.text||'Your text will appear in this space.';
 const p=anchor();$('previewMeta').textContent=p&&Number.isFinite(p.lat)?p.lat.toFixed(5)+', '+p.lon.toFixed(5)+' · '+moment.form.toUpperCase()+' · EDITORIAL PREVIEW':'LOCATION NOT SET · CHOOSE PLACE';
 let img=$('previewImage');if(moment.content.imageUrl){if(!img){img=document.createElement('img');img.id='previewImage';img.alt='';$('previewTitle').after(img)}img.src=moment.content.imageUrl;img.hidden=false}else if(img)img.remove();
}
function drawGeometry(){
 if(!map)return;const p=anchor();if(!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon))return;
 if(marker)marker.setLatLng([p.lat,p.lon]);else marker=L.marker([p.lat,p.lon],{draggable:!visitor}).addTo(map);
 if(!visitor)marker.off('dragend').on('dragend',e=>{const q=e.target.getLatLng();if(moment.placement.mode==='outdoor'){moment.placement.anchor.lat=q.lat;moment.placement.anchor.lon=q.lng;fillForm()}else{moment.placement.indoor.origin.lat=q.lat;moment.placement.indoor.origin.lon=q.lng;fillForm()}});
 if(shape){map.removeLayer(shape);shape=null}if(route){map.removeLayer(route);route=null}
 if(moment.form==='trajectory'&&moment.motion.waypoints.length>1){const pts=moment.motion.waypoints.map(w=>moment.placement.mode==='indoor'?M.localToWgs84(moment.placement.indoor.origin,w.position,moment.placement.indoor.rotationDeg||0):w.position);route=L.polyline(pts.map(x=>[x.lat,x.lon]),{color:'#ff6248',weight:4,dashArray:'8 7'}).addTo(map)}
 else if(moment.form==='framed-surface'||moment.form==='sky-surface'){const a=M.destination(p,moment.geometry.heading-90,moment.geometry.width/2),b=M.destination(p,moment.geometry.heading+90,moment.geometry.width/2);shape=L.polyline([[a.lat,a.lon],[b.lat,b.lon]],{color:'#ff6248',weight:6}).addTo(map)}
 else if(moment.form==='column')shape=L.circle(p,{radius:moment.geometry.diameter/2,color:'#ff6248',weight:2,fillOpacity:.15}).addTo(map);
}
function initMap(){if(map||!window.L)return;const p=anchor()||{lat:27.95,lon:-82.46};map=L.map('map',{zoomControl:false}).setView([p.lat,p.lon],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);map.on('click',e=>{if(visitor)return;if(moment.placement.mode==='outdoor'){moment.placement.anchor.lat=e.latlng.lat;moment.placement.anchor.lon=e.latlng.lng}else{moment.placement.indoor.origin={lat:e.latlng.lat,lon:e.latlng.lng,altitude:num('originAltitude')}}fillForm();status('Anchor updated from map.')});drawGeometry()}
function locate(){if(!navigator.geolocation){status('Location is unavailable. You can still tap the map or enter coordinates.');return}status('Finding location…');navigator.geolocation.getCurrentPosition(p=>{if(moment.placement.mode==='indoor')moment.placement.indoor.origin={lat:p.coords.latitude,lon:p.coords.longitude,altitude:num('originAltitude')};else moment.placement.anchor={lat:p.coords.latitude,lon:p.coords.longitude,altitude:num('geoAltitude'),altitudeDatum:val('altitudeDatum','MSL')};fillForm();initMap();map.setView([p.coords.latitude,p.coords.longitude],17);setTab('map');status('Location set · estimated accuracy ±'+Math.round(p.coords.accuracy)+' m')},e=>status('Location error: '+e.message),{enableHighAccuracy:true,timeout:20000,maximumAge:0})}
function setTab(t){$('camera').style.display=t==='camera'?'grid':'none';$('mapPanel').style.display=t==='map'?'block':'none';$('cameraTab').classList.toggle('active',t==='camera');$('mapTab').classList.toggle('active',t==='map');if(t==='map'&&map)setTimeout(()=>map.invalidateSize(),100)}
function saveDraft(){sync();try{localStorage.setItem(KEY,JSON.stringify(moment));status('Draft saved on this browser. It is not synced to an account or server.')}catch(e){status('Draft save failed: '+e.message)}}
function publish(){sync();const c=M.validateMoment(moment);if(!c.valid){status('Cannot publish yet: '+c.errors.join(' / '));return}if(moment.visibility.audience==='private'){status('Private drafts cannot create visitor links. Change the audience first.');return}history.replaceState(null,'',location.pathname+'#moment='+enc(moment));$('share').style.display='block';status('Share link created. This prototype embeds the Moment in the link; global discovery and server revisions are not connected.');$('state').textContent='SHARE LINK READY'}
function visitorView(m){visitor=true;moment=m;addControls();fillForm();sheet(false);$('publish').style.display='none';$('publishQuick').textContent='Visitor view';$('editTab').disabled=true;$('title').disabled=true;$('body').disabled=true;$('spatialControls').querySelectorAll('input,select,button').forEach(x=>x.disabled=true);$('status').textContent='VISITOR VIEW · READ ONLY';$('share').style.display='block';$('share').textContent='Copy visitor link';const p=anchor();if(p){initMap();map.setView([p.lat,p.lon],15);setTab('map')}}
async function camera(){if(!navigator.mediaDevices?.getUserMedia){status('Camera API unavailable. Open this page over HTTPS.');sheet(true);return}try{stream?.getTracks().forEach(t=>t.stop());stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'environment',width:{ideal:1280}}});$('video').srcObject=stream;$('video').style.display='block';$('placeholder').style.display='none';$('hud').style.display='block';$('state').textContent='LIVE CAMERA · PREVIEW ONLY';setTab('camera')}catch(e){status(e.name==='NotAllowedError'?'Camera permission denied. You can still create and place work on the map.':'Camera could not start: '+e.message);sheet(true)}}
$('openCamera').onclick=camera;$('cameraTab').onclick=()=>setTab('camera');$('mapTab').onclick=()=>{initMap();setTab('map')};$('editTab').onclick=()=>{addControls();sheet(true)};$('publishQuick').onclick=()=>{addControls();sheet(true);publish()};$('closeEditor').onclick=()=>sheet(false);$('gps').onclick=locate;$('zoomIn').onclick=()=>map?.zoomIn();$('zoomOut').onclick=()=>map?.zoomOut();
$('title').oninput=()=>{if(!visitor)sync()};$('body').oninput=()=>{if(!visitor)sync()};$('radius').oninput=()=>{$('radiusLabel').textContent=$('radius').value+' m';moment.visibility.maxRangeM=Number($('radius').value)};$('publish').onclick=publish;
$('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);status('Visitor link copied.')}catch{status('Copy the visitor URL from the browser address bar.')}};
const h=location.hash.startsWith('#moment=')?decode(location.hash.slice(8)):decode(location.hash.slice(1));
if(h&&h.schemaVersion===M.VERSION)visitorView(h);else{try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&d.schemaVersion===M.VERSION)moment=d}catch{}addControls();fillForm()}
window.addEventListener('pagehide',()=>stream?.getTracks().forEach(t=>t.stop()));
window.MONUMENT_MOMENT={get value(){return moment},saveDraft,publish,validate:()=>M.validateMoment(moment)};
})();