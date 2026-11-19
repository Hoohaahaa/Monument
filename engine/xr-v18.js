(function(){'use strict';
const $=id=>document.getElementById(id);
let session=null,gl=null,refSpace=null,layer=null,program=null,vertexBuffer=null,texture=null,textureCanvas=null,texctx=null,record=null,anchor=null,camStream=null,frameCount=0,poseCount=0,paused=false,sourceOrigin=0,lastText=null,lastStatus=0,initialAnchor=null,textureImage=null,textureImageUrl='',trajectoryPauseAt=0,trajectoryPausedTotal=0,trajectoryCompleted=false;
const center=(a,b)=>a+b;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function status(s){if($('xrStatus'))$('xrStatus').textContent=s;if($('cameraStatus'))$('cameraStatus').textContent=s}
function tone(){return record?.style?.preset||'editorial'}
function arMessage(){return String(record?.body||(record?.imageUrl?'':'MONUMENT')).slice(0,500)}
function createTextureCanvas(){textureCanvas=document.createElement('canvas');textureCanvas.width=1024;textureCanvas.height=512;texctx=textureCanvas.getContext('2d')}
function setTextureImage(url){
 if(url===textureImageUrl)return;
 textureImageUrl=url||'';textureImage=null;
 if(!url)return;
 const img=new Image();img.crossOrigin='anonymous';
 img.onload=()=>{textureImage=img;if(gl&&texture)updateTexture()};
 img.onerror=()=>{textureImage=null;status('IMAGE CANNOT BE LOADED INTO XR · TEXT PREVIEW REMAINS AVAILABLE')};
 img.src=url;
}
function updateTexture(){
 const ctx=texctx;if(!ctx)return;
 ctx.clearRect(0,0,1024,512);
 const msg=arMessage(),hasImage=textureImage&&textureImage.complete&&textureImage.naturalWidth>0;
 if(hasImage){
  const scale=Math.max(1024/textureImage.naturalWidth,512/textureImage.naturalHeight);
  const w=textureImage.naturalWidth*scale,h=textureImage.naturalHeight*scale;
  ctx.drawImage(textureImage,(1024-w)/2,(512-h)/2,w,h);
  const shade=ctx.createLinearGradient(0,260,0,512);shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(1,'rgba(0,0,0,.76)');ctx.fillStyle=shade;ctx.fillRect(0,0,1024,512);
  if(msg){ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction=/[\u0600-\u06ff]/.test(msg)?'rtl':'ltr';ctx.font='800 58px system-ui,Arial';ctx.lineWidth=5;ctx.strokeStyle='rgba(0,0,0,.65)';ctx.fillStyle='#fff';ctx.strokeText(msg.slice(0,90),512,438,920);ctx.fillText(msg.slice(0,90),512,438,920)}
 }else{
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction=/[\u0600-\u06ff]/.test(msg)?'rtl':'ltr';ctx.fillStyle=tone()==='signal'?'#d4ffe8':'#fcfdf9';
  let size=128,lines=[];while(size>38){ctx.font='800 '+size+'px system-ui,Arial';lines=[];let part='';for(const word of msg.split(/\s+/)){const t=part?part+' '+word:word;if(ctx.measureText(t).width>920&&part){lines.push(part);part=word}else part=t}if(part)lines.push(part);if(lines.length<=3)break;size-=6}
  if(!lines.length)lines=[msg];const step=Math.min(150,size*1.22);lines.slice(0,3).forEach((line,i)=>{if(tone()==='outline'){ctx.strokeStyle='#f9fff9';ctx.lineWidth=2.5;ctx.strokeText(line,512,256+(i-(lines.length-1)/2)*step,920)}else ctx.fillText(line,512,256+(i-(lines.length-1)/2)*step,920)});
 }
 if(!gl||!texture)return;
 gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,textureCanvas);lastText=msg;
}
function compile(type,src){const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('SHADER '+gl.getShaderInfoLog(shader));return shader}
function configureGL(){createTextureCanvas();program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec3 position;attribute vec2 uvIn;uniform mat4 matrix;varying vec2 uv;void main(){gl_Position=matrix*vec4(position,1.0);uv=uvIn;}'));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 uv;uniform sampler2D textTexture;uniform float time;uniform float lum;uniform float frameEnabled;uniform float solidGeometry;void main(){float glyph=texture2D(textTexture,uv).a;float border=min(min(uv.x,1.0-uv.x),min(uv.y,1.0-uv.y));float edge=1.0-smoothstep(.0015,.003,border);float sweep=exp(-pow((uv.x*.85+uv.y*.15-fract(time*.07)*1.2)/.035,2.0));float a=clamp(glyph*(.86+lum*sweep)+edge*.32*frameEnabled+solidGeometry*.82,0.0,.96);vec3 base=vec3(.96,.35,.20);vec3 color=mix(base,vec3(.91,.98,.95),glyph)+vec3(.04,.12,.05)*sweep*glyph;gl_FragColor=vec4(color,a);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);vertexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);for(const [name,size,off] of [['position',3,0],['uvIn',2,12]]){const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,20,off)}texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const [k,v]of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);updateTexture();gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK)}
function product(a,b){const m=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)m[c*4+r]+=a[k*4+r]*b[c*4+k];return m}
// A single world-space placement is captured from the tracked viewer pose.
// It is NEVER recomputed during rendering, except when REPOSITION is explicitly tapped.
// XR local space is session-scoped: this is not a geographic/cloud anchor.
function computeAnchor(view){
 const t=view.transform,p=t.position,m=t.matrix;
 // The sky's reading direction is defined from the viewer's actual screen
 // orientation at placement time, NOT from a horizontal heading guess.
 // Project screen-right and screen-up onto the horizontal plane.
 const norm=(v)=>{const d=Math.hypot(v[0],v[2]);return d>.001?[v[0]/d,0,v[2]/d]:null};
 const forward=norm([-m[8],0,-m[10]])||[0,0,-1];
 const right=norm([m[0],0,m[2]])||[-forward[2],0,forward[0]];
 let up=norm([m[4],0,m[6]]);
 if(!up||Math.abs(up[0]*right[0]+up[2]*right[2])>.85)up=[-right[2],0,right[0]];
 // Make up orthogonal to right; preserve its original direction.
 const dot=up[0]*right[0]+up[2]*right[2];
 up=norm([up[0]-dot*right[0],0,up[2]-dot*right[2]])||[-right[2],0,right[0]];
 const sky=record.kind==='sky',horizontalSky=sky&&record.orientation!=='vertical';
 const w=Math.max(.1,Number(record.width_m)||3),h=Math.max(.1,Number(record.height_m)||4);
 const distance=Math.max(2.8,Math.min(12,Math.max(w*1.15,h*.85)));
 const yOffset=sky?Math.max(2.5,Math.min(10000,Number(record.altitude_m)||4)):0;
 anchor=Object.freeze({center:[p.x+forward[0]*distance,p.y+yOffset,p.z+forward[2]*distance],forward,right,up,w,h,kind:record.kind||'surface',sky:horizontalSky,trajectory:record.trajectory||null,facing:record.facing||'both',frameEnabled:record.frameEnabled!==false,placementMode:record.placementMode||'outdoor',trajectoryOrigin:record.trajectory?.waypoints?.[0]?.position||null,trajectoryBase:[p.x+forward[0]*distance,p.y+yOffset,p.z+forward[2]*distance],placedAt:performance.now()});
 status('PLACED IN SESSION LOCAL SPACE · TRACKING MAY DRIFT');
}
function vertices(){
 const a=anchor,w=a.w/2,h=a.h/2;
 // Geometry-specific meshes: columns are true vertical cylinders; points are
 // pin markers with a spherical head and narrow stem, not rectangular panels.
 if(a.kind==='column'||a.kind==='point'||a.kind==='trajectory'){
  const out=[],segments=24;
  const push=(v,u,q)=>out.push(...v,u,q);
  const center=a.center, right=a.right, forward=a.forward;
  const point=(x,y,z)=>[center[0]+right[0]*x+forward[0]*z,center[1]+y,center[2]+right[2]*x+forward[2]*z];
  const cylinder=(radius,y0,y1)=>{
   for(let i=0;i<segments;i++){
    const t0=i/segments*Math.PI*2,t1=(i+1)/segments*Math.PI*2;
    const p0=point(Math.cos(t0)*radius,y0,Math.sin(t0)*radius),p1=point(Math.cos(t1)*radius,y0,Math.sin(t1)*radius);
    const q0=point(Math.cos(t0)*radius,y1,Math.sin(t0)*radius),q1=point(Math.cos(t1)*radius,y1,Math.sin(t1)*radius);
    const u0=i/segments,u1=(i+1)/segments;
    push(p0,u0,0);push(p1,u1,0);push(q0,u0,1);push(q0,u0,1);push(p1,u1,0);push(q1,u1,1);
    const top=point(0,y1,0),bottom=point(0,y0,0);
    push(top,.5,.5);push(q0,u0,1);push(q1,u1,1);
    push(bottom,.5,.5);push(p1,u1,0);push(p0,u0,0);
   }
  };
  if(a.kind==='column'){cylinder(w/2,0,h);return new Float32Array(out)}
  // Point: a compact 3-D pin, with a tapered stem and a rounded head.
  const stem=Math.max(.025,w*.055),head=Math.max(.09,w*.22),stemTop=h*.72;
  cylinder(stem,0,stemTop);
  const rings=8,slices=16;
  for(let r=0;r<rings;r++){
   const v0=r/rings,v1=(r+1)/rings,phi0=v0*Math.PI,phi1=v1*Math.PI;
   for(let s=0;s<slices;s++){
    const u0=s/slices,u1=(s+1)/slices,t0=u0*Math.PI*2,t1=u1*Math.PI*2;
    const sph=(phi,t)=>point(Math.sin(phi)*Math.cos(t)*head,stemTop+head+Math.cos(phi)*head,Math.sin(phi)*Math.sin(t)*head);
    const a0=sph(phi0,t0),b0=sph(phi0,t1),a1=sph(phi1,t0),b1=sph(phi1,t1);
    push(a0,u0,v0);push(b0,u1,v0);push(a1,u0,v1);push(a1,u0,v1);push(b0,u1,v0);push(b1,u1,v1);
   }
  }
  return new Float32Array(out);
 }
 const point=(x,y)=>{
  if(a.sky)return [a.center[0]+a.right[0]*x+a.up[0]*y,a.center[1],a.center[2]+a.right[2]*x+a.up[2]*y];
  return [a.center[0]+a.right[0]*x,a.center[1]+y,a.center[2]+a.right[2]*x];
 };
 const A=point(-w,-h),B=point(w,-h),C=point(-w,h),D=point(w,h);
 const out=[];
 const push=(v,u,q)=>out.push(...v,u,q);
 // UV origin is bottom-left in the GL texture after UNPACK_FLIP_Y_WEBGL.
 // The main face uses screen-right and screen-up as measured at placement.
 // Its back face has opposite winding and reversed horizontal UV.
 // World normal of A-B-C. A sky work must read normally from BELOW.
 const crossY=(B[2]-A[2])*(C[0]-A[0])-(B[0]-A[0])*(C[2]-A[2]);
 let front=[[A,0,0],[B,1,0],[C,0,1],[C,0,1],[B,1,0],[D,1,1]];
 let back=[[C,1,1],[B,0,0],[A,1,0],[D,0,1],[B,0,0],[C,1,1]];
 if(a.sky && crossY>0){
   // The original winding faces up; reverse it while preserving non-mirrored UV below.
   front=[[C,0,1],[B,1,0],[A,0,0],[D,1,1],[B,1,0],[C,0,1]];
   back=[[A,1,0],[B,0,0],[C,1,1],[C,1,1],[B,0,0],[D,0,1]];
 }
 const faces=a.facing==='front'?[front]:a.facing==='back'?[back]:[front,back];
 for(const face of faces)for(const [v,u,q] of face)push(v,u,q);
 return new Float32Array(out);
}

function trajectoryPosition(now){
 const tr=anchor?.trajectory;if(!tr||!tr.waypoints?.length)return null;
 const start=Date.parse(tr.startsAt),duration=tr.durationMs;
 if(!Number.isFinite(start)||!Number.isFinite(duration)||duration<=0)return null;
 let elapsed=now-start-trajectoryPausedTotal;
 if(paused)elapsed-=Math.max(0,now-trajectoryPauseAt);
 if(elapsed<0)return {active:false,progress:0,position:tr.waypoints[0].position,reason:'not_started'};
 if(!tr.loop&&elapsed>=duration)return {active:false,progress:1,position:tr.waypoints[tr.waypoints.length-1].position,reason:'completed'};
 const progress=tr.loop?(elapsed%duration)/duration:clamp(elapsed/duration,0,1);
 let index=0;while(index<tr.waypoints.length-2&&progress>tr.waypoints[index+1].t)index++;
 const a=tr.waypoints[index],b=tr.waypoints[index+1],span=b.t-a.t,t=span>0?clamp((progress-a.t)/span,0,1):0;
 const p=a.position,q=b.position;
 let position;
 if(anchor.placementMode==='indoor')position={x:(p.x||0)+((q.x||0)-(p.x||0))*t,y:(p.y||0)+((q.y||0)-(p.y||0))*t,z:(p.z||0)+((q.z||0)-(p.z||0))*t};
 else{
  const lat=(p.lat||0)+((q.lat||0)-(p.lat||0))*t;
  const lon=(p.lon||0)+((q.lon||0)-(p.lon||0))*t;
  const altitude=(p.altitude||0)+((q.altitude||0)-(p.altitude||0))*t;
  position={lat,lon,altitude};
 }
 return {active:true,progress,position,reason:'playing'};
}
function updateTrajectoryAnchor(now){
 if(!anchor?.trajectory||!anchor.trajectoryOrigin||!anchor.trajectoryBase)return;
 const sample=trajectoryPosition(now);if(!sample)return;
 const origin=anchor.trajectoryOrigin,p=sample.position;
 let x=0,y=0,z=0;
 if(anchor.placementMode==='indoor'){x=(p.x||0)-(origin.x||0);y=(p.y||0)-(origin.y||0);z=(p.z||0)-(origin.z||0)}
 else{
  const radius=6371008.8,lat0=(origin.lat||0)*Math.PI/180;
  x=((p.lon||0)-(origin.lon||0))*Math.PI/180*radius*Math.cos(lat0);
  z=((p.lat||0)-(origin.lat||0))*Math.PI/180*radius;
  y=(p.altitude||0)-(origin.altitude||0);
 }
 // Outdoor east/north deltas are deliberately mapped into the session's
 // horizontal basis. They are NOT north-aligned without a geospatial pose.
 const c=anchor.trajectoryBase;
 anchor={...anchor,center:[c[0]+anchor.right[0]*x+anchor.forward[0]*z,c[1]+y,c[2]+anchor.right[2]*x+anchor.forward[2]*z]};
 if(sample.reason==='not_started')status('TRAJECTORY SCHEDULED · WAITING FOR START TIME');
 else if(sample.reason==='completed'&&!trajectoryCompleted){trajectoryCompleted=true;status('TRAJECTORY COMPLETE · FINAL POSITION HELD')}
 else if(!paused&&now-lastStatus>2500){lastStatus=now;status('TRAJECTORY '+Math.round(sample.progress*100)+'% · SESSION-LOCAL AXES · NOT NORTH-ALIGNED')}
}
function pauseTrajectory(){
 if(!anchor?.trajectory||paused)return false;
 paused=true;trajectoryPauseAt=Date.now();if($('xrPause'))$('xrPause').hidden=true;if($('xrResume'))$('xrResume').hidden=false;status('TRAJECTORY PAUSED');return true;
}
function resumeTrajectory(){
 if(!anchor?.trajectory||!paused)return false;
 trajectoryPausedTotal+=Math.max(0,Date.now()-trajectoryPauseAt);paused=false;if($('xrPause'))$('xrPause').hidden=false;if($('xrResume'))$('xrResume').hidden=true;status('TRAJECTORY RESUMED');return true;
}
function draw(t,frame){if(!session)return;session.requestAnimationFrame(draw);try{frameCount++;const pose=frame.getViewerPose(refSpace);if(!pose){if(t-lastStatus>2500){lastStatus=t;status('WAITING FOR TRACKING · MOVE PHONE SLOWLY')}return;}poseCount++;gl.bindFramebuffer(gl.FRAMEBUFFER,layer.framebuffer);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(!anchor)computeAnchor(pose.views[0]);if(!anchor)return;updateTrajectoryAnchor(Date.now());if(lastText!==arMessage())updateTexture();gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);const mesh=vertices();gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);gl.vertexAttribPointer(gl.getAttribLocation(program,'position'),3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(gl.getAttribLocation(program,'uvIn'),2,gl.FLOAT,false,20,12);gl.uniform1f(gl.getUniformLocation(program,'time'),t*.001);gl.uniform1f(gl.getUniformLocation(program,'lum'),.28);gl.uniform1f(gl.getUniformLocation(program,'frameEnabled'),anchor.frameEnabled?1:0);gl.uniform1f(gl.getUniformLocation(program,'solidGeometry'),anchor.kind==='point'||anchor.kind==='column'?1:0);if(anchor.kind==='point'||anchor.kind==='column')gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);for(const view of pose.views){const vp=layer.getViewport(view);gl.viewport(vp.x,vp.y,vp.width,vp.height);gl.uniformMatrix4fv(gl.getUniformLocation(program,'matrix'),false,product(view.projectionMatrix,view.transform.inverse.matrix));gl.drawArrays(gl.TRIANGLES,0,mesh.length/5)}if(t-lastStatus>4000){lastStatus=t;status('TRACKING '+poseCount+'/'+frameCount+' · LOCAL SPACE · TRACKING CAN DRIFT · NO OCCLUSION')}}catch(e){status('XR RENDER ERROR: '+e.message);console.error(e)}}
function cleanup(){session=null;anchor=null;initialAnchor=null;gl=null;program=null;texture=null;document.body.classList.remove('xr-active');$('xrHud').hidden=true}
async function startXR(work){const c=document.createElement('canvas');gl=c.getContext('webgl',{alpha:true,antialias:true,xrCompatible:true});if(!gl)throw Error('WebGL not supported');session=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local'],optionalFeatures:['dom-overlay'],domOverlay:{root:$('xrHud')}});session.addEventListener('end',cleanup);await gl.makeXRCompatible();layer=new XRWebGLLayer(session,gl);await session.updateRenderState({baseLayer:layer,depthNear:0.01,depthFar:1000});refSpace=await session.requestReferenceSpace('local');record=work;anchor=null;initialAnchor=null;if($('xrPause'))$('xrPause').hidden=!work.trajectory;if($('xrResume'))$('xrResume').hidden=true;frameCount=0;poseCount=0;lastText=null;paused=false;trajectoryPauseAt=0;trajectoryPausedTotal=0;trajectoryCompleted=false;setTextureImage(work.imageUrl||'');configureGL();document.body.classList.add('xr-active');$('xrHud').hidden=false;$('xrMessage').value=arMessage();session.requestAnimationFrame(draw)}
async function fallback(work){record=work;const el=$('cameraLayer');el.hidden=false;$('cameraSurface').hidden=true;status('LIVE CAMERA ONLY · WORLD-LOCKED AR IS NOT AVAILABLE ON THIS DEVICE');try{if(window.MONUMENT_CAMERA_STREAM){$('cameraVideo').srcObject=window.MONUMENT_CAMERA_STREAM;await $('cameraVideo').play()}else if(navigator.mediaDevices?.getUserMedia){camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});$('cameraVideo').srcObject=camStream;await $('cameraVideo').play()}}catch(e){status('CAMERA UNAVAILABLE · CLOSE THIS VIEW AND CHECK PERMISSIONS');}}
function closeCamera(){const el=$('cameraLayer');el.hidden=true;$('cameraSurface').hidden=false;try{camStream?.getTracks().forEach(t=>t.stop())}catch(e){}camStream=null;$('cameraVideo').srcObject=null}
async function launch(work){record=work;try{if(!navigator.xr)throw Error('WEBXR NOT SUPPORTED');await startXR(work)}catch(e){if(session){try{await session.end()}catch(_){}}if(gl)cleanup();window.MONUMENT_APP?.toast('USING CAMERA COMPOSITE / '+e.message);await fallback(work)}}
$('xrExit').onclick=()=>session?.end();$('xrPause')&&($('xrPause').onclick=pauseTrajectory);$('xrResume')&&($('xrResume').onclick=resumeTrajectory);$('xrPlace').onclick=()=>{anchor=null;status('REPOSITION REQUESTED · NEW LOCAL PLACEMENT')};$('xrEdit').onclick=()=>{$('xrEditor').hidden=!$('xrEditor').hidden};$('xrApply').onclick=()=>{record.body=$('xrMessage').value.slice(0,500);lastText=null;window.MONUMENT_XR_ON_EDIT?.(record.body);$('xrEditor').hidden=true;status('TEXT CHANGED LOCALLY · SAVE OR PUBLISH TO KEEP IT')};$('cameraClose').onclick=closeCamera;window.MONUMENT_XR={launch,closeCamera,pauseTrajectory,resumeTrajectory};
})();
