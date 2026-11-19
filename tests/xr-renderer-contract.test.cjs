const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const xr=fs.readFileSync(path.join(__dirname,'..','engine','xr-v18.js'),'utf8');

test('sky orientation selects horizontal overhead or vertical plane geometry',()=>{
 assert.match(xr,/horizontalSky=sky&&record\.orientation!=='vertical'/);
 assert.match(xr,/sky:horizontalSky/);
});

test('front, back and both-sided settings select the corresponding mesh faces',()=>{
 assert.match(xr,/a\.facing==='front'\?\[front\]:a\.facing==='back'\?\[back\]:\[front,back\]/);
});

test('frame visibility is passed to the shader rather than ignored',()=>{
 assert.match(xr,/uniform float frameEnabled/);
 assert.match(xr,/edge\*\.32\*frameEnabled/);
 assert.match(xr,/getUniformLocation\(program,'frameEnabled'\),anchor\.frameEnabled\?1:0/);
});

test('Point and Column use distinct 3D meshes rather than the panel quad',()=>{
 assert.match(xr,/a\.kind==='column'\|\|a\.kind==='point'/);
 assert.match(xr,/if\(a\.kind==='column'\)\{cylinder\(w\/2,0,h\)/);
 assert.match(xr,/const rings=8,slices=16/);
 assert.match(xr,/solidGeometry/);
 assert.match(xr,/mesh\.length\/5/);
});

test('trajectory renderer interpolates waypoints and holds the final position',()=>{
 assert.match(xr,/function trajectoryPosition\(now\)/);
 assert.match(xr,/tr\.durationMs/);
 assert.match(xr,/tr\.loop\?/);
 assert.match(xr,/function updateTrajectoryAnchor\(now\)/);
 assert.match(xr,/trajectoryBase/);
 assert.match(xr,/trajectoryOrigin/);
});
test('trajectory pause and resume controls preserve elapsed playback time',()=>{
 assert.match(xr,/function pauseTrajectory\(\)/);
 assert.match(xr,/function resumeTrajectory\(\)/);
 assert.match(xr,/trajectoryPausedTotal\+=Math\.max/);
 assert.match(xr,/TRAJECTORY PAUSED/);
 assert.match(xr,/TRAJECTORY RESUMED/);
});
test('trajectory geographic waypoints are explicitly session-local and not north-aligned',()=>{
 assert.match(xr,/NOT north-aligned without a geospatial pose/);
 assert.match(xr,/SESSION-LOCAL AXES · NOT NORTH-ALIGNED/);
});
