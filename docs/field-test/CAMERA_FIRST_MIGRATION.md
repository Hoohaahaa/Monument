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


## Browser interaction QA — 2026-11-18

A headless Chromium run at a 390 × 844 mobile viewport verified:
- Root app and `/new/landscape` route render; Leaflet map initializes.
- Map clicks on unobstructed map areas update the selected coordinates; dragging the placement marker updates the map readout.
- Field-test overlay opens; bottom action dock sits at the bottom of the mobile viewport.
- With a simulated camera device and mocked GPS, the camera video stream reaches ready state and the GPS accuracy is surfaced.
- The spatial surface can render in centered-preview mode while compass is unavailable; the UI explicitly says alignment is not confirmed.
- No page-level JavaScript errors or failed network requests remain in the local-only mode.

This is browser simulation, not physical-device acceptance. Headless Chromium cannot validate the phone's real compass, camera optics, GPS accuracy, Android permission UX, or AR tracking.


## Decision ledger: alternatives and reasons

| Alternative not selected | Decision | Reason / provenance |
|---|---|---|
| Redesign the accepted camera-first experience from scratch | Rejected | The user explicitly preferred the earlier camera-first UX and asked that its navigation and action placement be preserved. |
| Move geographic placement into a form/tab | Rejected | The product decision is that the map owns location selection, marker movement and coordinates. |
| Treat GPS + compass projection as world-locked AR | Rejected | The implementation has no VPS/geospatial anchor or visual-inertial tracking; claiming world lock would be false. |
| Copy the old Portfolio API/backend wholesale | Deferred | Its Neon schema, authorization boundaries and production data model have not been verified. |
| Replace the existing Spatial Lab | Rejected | It already exists in Monument and is outside this restoration scope. |
| Merge to main or promote the preview to production | Deferred | Review and physical-device QA remain acceptance gates. |

The rationale behind legacy choices that cannot be verified from the source history is recorded as **unknown**, not reconstructed as fact. New decisions and rejected alternatives should continue to be appended to the Monument decision ledger as implementation proceeds.
