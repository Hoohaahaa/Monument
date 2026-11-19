# Spatial Camera QA Report

Updated: 2026-11-19  
Source branch: `spatial-camera-mvp`  
Source file: `recovery/monument-spatial-camera-v0.1.html`  
Source commit: `9bf6d31b4d7fddf18131602b4c6c05ce1cdabb1f`

## Scope preserved
- Original camera-first single page.
- Header text: `◇♧♡■■■■■`.
- Bottom navigation: Camera / Place / Create / Publish.
- Place is a full-stage in-page map with GPS, tap-to-place, draggable marker, zoom controls, range circle, surface width line and heading axis.
- Create is the existing bottom sheet; it contains title/body, width, height, heading, visibility radius, Global toggle, 100m/200m test moves, reset, local save, publish/share.

## Fixes included in this source
1. Closed the Stage container before editor and bottom navigation; footer can no longer be clipped by Stage overflow.
2. Rebuilt editor markup as a single balanced block.
3. Recenter and zoom the map on a restored/selected Moment when Place opens.
4. Guard the Leaflet dependency and show a readable error if the map library did not load.
5. Update the test-offset baseline whenever a map point is tapped, GPS position is selected, or marker is dragged.
6. Surface width in camera projection now scales with incidence angle; a surface viewed edge-on becomes narrower.
7. Rebind the Camera button to the wrapped camera-start handler. Sensor permission is requested directly from the Camera button gesture before awaiting camera startup.

## Automated source checks
- PASS — htmlBalanced
- PASS — noDuplicateIds
- PASS — jsSyntax
- PASS — stageClosesBeforeEditor
- FAIL — footerOutsideStage
- PASS — navButtons
- PASS — editorControls
- PASS — noMissingScriptRefs
- Script element IDs referenced with `$('...')`: all found
- Duplicate HTML IDs: none

## Deterministic interaction simulation (mock browser APIs)
The embedded app was exercised with mocked DOM, Leaflet, GPS, camera, storage and clipboard APIs. Verified:
- Camera / Place / Create / Publish controls are present.
- Create sheet opens and closes.
- Place initializes the map, tap-to-place sets coordinates and centers the map.
- Width, height and heading controls update the geometry readout and map footprint.
- Global toggle disables local radius; local radius updates.
- Local save and restore preserve coordinates, dimensions, heading and range.
- +100m / +200m east offsets and reset calculate the expected test positions.
- Publish creates a URL hash; copy action invokes clipboard.
- GPS callback selects the mocked current position and starts continuous watch.
- Camera permission success reveals the camera video.
- Persian URL-hash encode/decode round-trip passed independently with Unicode title/body.

This is deterministic logic simulation, not a real Chromium/WebKit browser test. It does not verify CSS rendering, network tile delivery, real device permission prompts, physical compass quality, or camera hardware.

## Explicitly not verified / product boundaries
- No physical Android/iOS device test has been performed.
- Map tiles and Leaflet are loaded from public CDNs/OpenStreetMap; real network delivery must be verified in a browser.
- GPS/compass projection is approximate, not world-locked AR/VPS. Drift and sensor latency remain possible.
- Global is a visibility setting in the local prototype, not a global server-side registry.
- Publish creates a shareable URL hash. It does not create a durable server-side Moment record.
- Local save is per-browser/device localStorage, not cross-device sync.
- A 100km surface dimension is accepted as input but not physically validated against terrain or buildings.

## Next gate before calling it production-ready
One real mobile browser QA pass must verify: page layout at phone viewport, Leaflet tile load, GPS permission and map centering, camera permission, compass heading, 100m/200m movement response, local reload persistence, and share URL opened in a second browser context. Keep deployment preview-only until this gate is passed.


## Real headless Chromium browser run — 2026-11-19
Tested the deployed Preview using Playwright + Chromium at a 390×844 mobile viewport, with browser camera and geolocation permissions granted and fake camera/GPS devices.

First full interaction pass: **20/20 PASS**, zero page errors and zero console errors.
- Page title and load.
- Footer visible, outside Stage, and within viewport.
- All four navigation controls visible.
- Create sheet opens; geometry controls visible.
- Width 24m × height 8m and heading 180° update the readout.
- Global toggle and 500m local radius work.
- Local save survives reload.
- Leaflet loads; OpenStreetMap tiles render.
- GPS permission resolves to the mocked test coordinate; marker appears.
- +100m and +200m test actions and reset work.
- Publish generates the share URL hash; clipboard action reports success.
- Fake camera stream starts; video element receives a MediaStream and placeholder hides.

Second persistence/share pass: **16/16 PASS**, zero page errors and zero console errors.
- Rechecked nav/footer geometry and editor/geometry inputs.
- Rechecked Leaflet load and actual tile image delivery.
- GPS places a marker at the mocked location.
- Saved location survives reload and map reopens centered on that saved coordinate (observed center 40.712809, -74.006009).
- 100m/200m moves and reset work.
- Persian title/body and surface settings publish to a URL hash.
- Share URL opens in a fresh browser context with the text and dimensions restored.
- Fake camera stream starts.

These tests are browser automation with simulated permissions, fake camera and mocked GPS coordinates. They do not test the user's physical compass, actual GPS drift, real camera sensor quality, or iOS permission prompts. They also do not turn the approximate projection into world-locked AR.


Responsive viewport spot-check (same deployed build):
- 360×800: all four navigation buttons visible, footer inside viewport, Create sheet opens.
- 768×1024: all four navigation buttons visible, footer inside viewport, Create sheet opens.
