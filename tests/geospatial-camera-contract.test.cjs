const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const geo = fs.readFileSync(path.join(root, 'engine', 'geospatial-camera.js'), 'utf8');

test('geospatial camera module loads before the app entry point', () => {
  assert.match(html, /engine\/geospatial-camera\.js"><\/script>[\s\S]*app\.js"><\/script>/);
  assert.match(html, /id="geoCanvas"/);
  assert.match(html, /id="geoStatus"/);
});

test('geospatial overlay starts only after the real camera permission flow', () => {
  assert.match(app, /getUserMedia\([\s\S]*MONUMENT_GEO_CAMERA\?\.start/);
  assert.match(app, /requestOrientationPermission\(\)/);
  assert.match(app, /\$\('openCamera'\)\.onclick=camera/);
});

test('GPS and device heading are used for geographic projection', () => {
  assert.match(geo, /navigator\.geolocation\.watchPosition/);
  assert.match(geo, /deviceorientationabsolute/);
  assert.match(geo, /webkitCompassHeading/);
  assert.match(geo, /bearing\(this\.location,x\)/);
  assert.match(geo, /Math\.tan\(rad\(delta\)\)/);
});

test('nearby place labels use real OpenStreetMap Overpass data', () => {
  assert.match(geo, /overpass-api\.de\/api\/interpreter/);
  assert.match(geo, /\[name\]/);
  assert.match(geo, /this\.points=/);
});

test('manual map selection updates the geospatial camera location', () => {
  assert.match(app, /MONUMENT_GEO_CAMERA\?\.setLocation\(e\.latlng\.lat,e\.latlng\.lng,0\)/);
  assert.match(geo, /setLocation\(lat,lon,accuracy=0\)/);
});

test('low GPS or compass accuracy suppresses nearby labels', () => {
  assert.match(geo, /accuracy\|\|0\)>80/);
  assert.match(geo, /headingAccuracy>30/);
  assert.match(geo, /LABELS HIDDEN/);
});

test('overlay explicitly avoids claiming a terrain mesh or persistent world lock', () => {
  assert.match(geo, /AZIMUTH GRID \(NOT TERRAIN MESH\)/);
  assert.match(html, /EDITORIAL PREVIEW \/ NOT WORLD-LOCKED/);
});
