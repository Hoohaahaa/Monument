const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('camera permission is requested only after an explicit user action', () => {
  assert.match(app, /\$\('openCamera'\)\.onclick=camera/);
  assert.match(app, /status\('CAMERA READY · TAP OPEN CAMERA TO START'\)/);
  assert.doesNotMatch(app, /addControls\(\);fillForm\(\);camera\(\)/);
});

test('the persistent Publish action opens release review but does not publish immediately', () => {
  const handler = app.match(/\$\('publishQuick'\)\.onclick=\(\)=>\{[^}]+\}/)?.[0] || '';
  assert.ok(handler, 'publishQuick handler exists');
  assert.match(handler, /sheet\(true\)/);
  assert.match(handler, /Review your Moment and release settings/);
  assert.doesNotMatch(handler, /publish\(\)/);
});

test('publishing requires valid spatial data and at least one content medium', () => {
  const start = app.indexOf('function publish(){');
  const end = app.indexOf('\nfunction visitorView', start);
  assert.ok(start >= 0 && end > start, 'publish function exists');
  const publish = app.slice(start, end);
  assert.match(publish, /M\.validateMoment\(moment\)/);
  assert.match(publish, /moment\.visibility\.audience==='private'/);
  assert.match(publish, /Add text, an image or audio before publishing/);
});

test('camera launch remains bound to the explicit Open Camera control', () => {
  assert.match(app, /async function camera\(\)/);
  assert.match(app, /\$\('openCamera'\)\.onclick=camera/);
});

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('camera stage closes before the XR HUD and bottom navigation', () => {
  assert.match(html, /id="share">Copy share link<\/button><\/div><\/div>\s*<section class="xr-hud"/);
  assert.match(html, /<footer class="bottom">[\s\S]*id="cameraTab"[\s\S]*id="mapTab"[\s\S]*id="editTab"[\s\S]*id="publishQuick"[\s\S]*<\/footer>/);
});

test('startup restores visitor hashes through the defined decoder', () => {
  assert.match(app, /const h=location\.hash\.startsWith\('#moment='\)\?dec\(location\.hash\.slice\(8\)\):dec\(location\.hash\.slice\(1\)\)/);
  assert.doesNotMatch(app, /\bdecode\(location\.hash/);
});
