'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Spatial=require('../spatial.js');
const observer={lat:0,lon:0,altitude:0};
const target={lat:0,lon:0.01,altitude:0,width:20,height:8,heading:270,maxRange:5000};

test('front-facing target projects to screen center when heading matches bearing',()=>{
 const p=Spatial.projectToFieldOfView(observer,90,target,60);
 assert.ok(p.distance>1000&&p.distance<1200);
 assert.equal(p.frontFacing,true); assert.equal(p.insideFov,true); assert.equal(p.aligned,true);
 assert.ok(Math.abs(p.screenX-50)<1e-9); assert.ok(p.screenWidth>0&&p.screenWidth<=88);
});
test('target outside camera FOV is not aligned',()=>{
 const p=Spatial.projectToFieldOfView(observer,0,target,60);
 assert.equal(p.insideFov,false); assert.equal(p.aligned,false);
 assert.ok(p.relativeBearing>80&&p.relativeBearing<100);
});
test('back face is distinguished from a valid front face',()=>{
 const p=Spatial.projectToFieldOfView(observer,90,{...target,heading:90},60);
 assert.equal(p.frontFacing,false); assert.equal(p.aligned,false);
});
test('publisher range is enforced independently of FOV',()=>{
 const p=Spatial.projectToFieldOfView(observer,90,{...target,maxRange:500},60);
 assert.equal(p.rangeOK,false); assert.equal(p.insideFov,true); assert.equal(p.aligned,false);
});
test('missing compass heading remains explicitly unaligned',()=>{
 const p=Spatial.projectToFieldOfView(observer,null,target,60);
 assert.equal(p.relativeBearing,null); assert.equal(p.insideFov,false);
 assert.equal(p.aligned,false); assert.equal(p.screenX,50);
});
test('invalid field of view is safely clamped',()=>{
 const p=Spatial.projectToFieldOfView(observer,90,target,0);
 assert.equal(p.fieldOfView,1); assert.equal(p.insideFov,false);
});
