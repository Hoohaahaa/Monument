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
