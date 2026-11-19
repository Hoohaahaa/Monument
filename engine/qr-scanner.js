(function(root){
'use strict';
let running=false,stream=null,shared=false,frameId=0,video=null,detector=null,lastScan=0;
const $=id=>document.getElementById(id);
function stop(){
 running=false;if(frameId)cancelAnimationFrame(frameId);frameId=0;
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}
 if(video){video.pause();video.srcObject=null}
 shared=false;if($('qrScanner'))$('qrScanner').hidden=true;
}
async function scan(onDetected){
 if(!('BarcodeDetector'in root))throw Error('QR detection is not supported in this browser.');
 const formats=await BarcodeDetector.getSupportedFormats();
 if(!formats.includes('qr_code'))throw Error('QR format is unavailable.');
 const layer=$('qrScanner');video=$('qrVideo');if(!layer||!video)throw Error('QR scanner view is unavailable.');
 try{
  detector=new BarcodeDetector({formats:['qr_code']});
  if(root.MONUMENT_CAMERA_STREAM){video.srcObject=root.MONUMENT_CAMERA_STREAM;shared=true}
  else{stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280}}});video.srcObject=stream}
  layer.hidden=false;await video.play();running=true;
  const tick=async t=>{
   if(!running)return;
   if(t-lastScan<180){frameId=requestAnimationFrame(tick);return}lastScan=t;
   try{const codes=await detector.detect(video);if(codes.length){const c=codes[0];onDetected({payload:c.rawValue||'',format:'qr_code',cornerPoints:c.cornerPoints||[],capturedAt:new Date().toISOString()});stop();return}}
   catch(e){if($('qrStatus'))$('qrStatus').textContent='Scanning paused briefly. Keep the QR code in view.'}
   if(running)frameId=requestAnimationFrame(tick);
  };
  frameId=requestAnimationFrame(tick);
 }catch(e){stop();throw e}
}
if($('qrClose'))$('qrClose').onclick=stop;
root.addEventListener('pagehide',stop);
root.MonumentQR={scan,stop};
})(typeof window!=='undefined'?window:globalThis);
