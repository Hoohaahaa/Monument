const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const xr = fs.readFileSync(path.join(__dirname, '..', 'engine', 'xr-v18.js'), 'utf8');

test('unsupported WebXR devices never receive a fake draggable spatial surface', () => {
  const start = xr.indexOf('async function fallback(work)');
  const end = xr.indexOf('\nfunction closeCamera', start);
  assert.ok(start >= 0 && end > start, 'fallback function exists');
  const fallback = xr.slice(start, end);
  assert.match(fallback, /cameraSurface'\)\.hidden=true/);
  assert.match(fallback, /WORLD-LOCKED AR IS NOT AVAILABLE/);
  assert.doesNotMatch(fallback, /onpointerdown|onpointermove|setPointerCapture/);
});

test('closing the camera-only fallback restores the surface element for a later session', () => {
  assert.match(xr, /function closeCamera\(\)\{[^}]*cameraSurface'\)\.hidden=false/);
});
