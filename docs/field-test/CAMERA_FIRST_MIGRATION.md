# Camera-first application migration

**Date:** 2026-11-18  
**Source:** Hoohaahaa/Portfolio, branch monument-studio-v1  
**Target:** Hoohaahaa/Monument, branch restore-camera-first-field

## Migrated source
- index.html, app.js, style.css
- field.js, spatial.js, media.js, marker.js, xr.js, sw.js
- Existing Spatial Lab files remain in place; no redesign or replacement of the Lab was performed.
- Leaflet JS/CSS and license already present in Monument are reused.

## Preserved behavior
- Camera-first outdoor field-test overlay with permission/session actions in the bottom dock.
- GPS + device compass guidance, target bearing, front/back-face check, visibility range, approximate FOV projection, and screen-space content transition.
- Map-based placement in the authoring editor; map clicks and draggable markers update the same location state.
- Indoor QR/marker camera path and separate session-local WebXR path.
- Local drafts and IndexedDB media remain local to the browser/device.

## Small engineering change
The field projection calculation is exposed as Spatial.projectToFieldOfView and consumed by field.js. This makes FOV, front-face, range, and heading decisions independently testable. Tests cover unavailable heading, outside-FOV targets, back-face targets, and range limits.

## Honest capability boundary
- GPS + compass projection is approximate screen-space guidance, not world-locked AR.
- WebXR requests an immersive local session and places content in session-local coordinates. It is not a geospatial/VPS anchor and can drift.
- Camera, GPS, compass and WebXR behavior still requires real-device QA; static build/tests do not prove hardware behavior.
- This migration does not add a cloud registry, cross-device sync, global discovery, managed media storage, or analytics ingestion. The prior Portfolio branch API depends on an unverified Neon schema and is intentionally not copied until its schema and security model are audited. Local-mode authoring remains available.
- The original Portfolio repository and branch are untouched.

## Verification
- npm run build syntax-checks browser modules and creates the Vercel static output.
- npm test runs the existing Spatial Core tests and new field projection tests.
- Deployment and physical device QA are separate acceptance gates.
