'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=__dirname;
const browserFiles=['app.js','spatial.js','media.js','xr.js','marker.js','field.js','engine-core.js','engine.js','sw.js'];
for(const file of browserFiles)execFileSync(process.execPath,['--check',path.join(root,file)]);
for(const file of ['index.html','style.css','engine.html','engine.css','engine-core.js','engine.js','sw.js',...browserFiles]){
 if(!fs.existsSync(path.join(root,file)))throw new Error('Missing build input: '+file);
}
const out=path.join(root,'public');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','style.css','app.js','spatial.js','media.js','xr.js','marker.js','field.js','sw.js','engine.html','engine.css','engine-core.js','engine.js'])fs.copyFileSync(path.join(root,file),path.join(out,file));
fs.cpSync(path.join(root,'vendor'),path.join(out,'vendor'),{recursive:true});
console.log('Monument build passed: camera-first app, field projection and spatial lab assets copied.');
