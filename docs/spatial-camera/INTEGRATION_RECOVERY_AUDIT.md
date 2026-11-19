# Monument — Spatial Engine Recovery & Integration Audit

Date: 2026-11-19
Status: source recovery and audit in progress; no deployment created from this branch.

## User-approved product shell (source of truth)

Preserve the recovered one-page `Monument — Spatial Camera` interface from:
`recovery/monument-spatial-camera-v0.1.html`

Its information architecture is fixed for this integration:
- Camera is the primary full-screen stage.
- Bottom navigation: Camera / Place / Create / Publish.
- Place switches to the map in the same page.
- Create opens a bottom sheet; no separate Spatial Lab workspace or new route.
- Keep the visual language and accepted placements. Do not transplant the Spatial Lab split-screen UI.

The requested header wordmark is exactly: `◇♧♡■■■■■`.

## Source recovery findings

### A. Camera-first shell
The recovered HTML was a one-file Vercel upload. It has the correct shell and interactions but no spatial projection engine. Its fixed camera card was never a geographic or world-space object.

### B. Geographic engine from Portfolio / `monument-studio-v1`
Inspected:
- `engine-core.js`: geodesic distance/bearing, destination point, map footprint, horizontal camera projection, front-face and FOV checks, surface validation, local draft store and undo/redo.
- `engine.js`: Leaflet map, draggable anchor, observer GPS, device orientation, camera session, surface dimensions and heading controls, diagnostics.
- `engine.html`: Spatial Lab UI. Reuse the engine logic only; do not reuse this UI shell.

Known limits in this older engine:
- GPS/compass projection is approximate.
- It is not world-locked AR.
- Its camera projection does not include full vertical/pitch calibration or terrain occlusion.

### C. Session-local WebXR sky geometry
Inspected `xr.js` and the accepted V18 baseline in the Spatial 22 deployment:
- WebXR `immersive-ar` session, WebGL rendering and a text texture.
- Captures the viewer pose once in `computeAnchor()`.
- Stores a fixed session-local anchor; rendering uses each new XR viewer pose to draw the same geometry.
- `Reposition` explicitly resets the anchor.
- Sky geometry has a distinct plane orientation so the face can be read from below.
- This is session-local tracking, not a persistent geographic/cloud anchor. It does not by itself implement a route flying over the user at a scheduled time.

The source branch `Portfolio/monument/main` README identifies Spatial 22 as the canonical continuation and says the accepted V18 local Sky geometry is retained in `xr.js`; baseline copy is `baseline/xr-v18.js`.

### D. Product publishing source
Inspected the canonical `Portfolio/monument/main` source:
- `index.html`, `app.js`, `spatial.js`, `xr.js`, `marker.js`, `style.css`.
- Place / Content / Release authoring, Leaflet map, observer simulation, surface width/height, heading, altitude and datum, range, visibility, scheduled `startsAt` / `endsAt`, image/audio URLs, content, publish, revisions, QR and permanent visitor URL.
- The model validates coordinates, dimensions, heading, altitude, visibility and schedules.
- The registry stores a draft separately from the published snapshot with revision history.
- `spatial.js` computes geodesic distance, bearing, altitude-aware apparent elevation, curvature drop, projected width, front-facing state, horizon and range.
- This app shell is a different UI and must not replace the approved camera-first shell.

Important: scheduled start/end controls govern availability. They are not proof of timed physical movement.

### E. Vercel source inventory recovered
Projects/deployments found:
- `monument-field-test`: recovered camera-first shell.
- `monument-spatial-22`: READY deployment; source tree includes `src/app.js`, `src/spatial.js`, `src/xr.js`, `src/baseline/xr-v18.js`, `src/geometry.cjs`, mobile browser tests, and API handlers.
- `monument-sky-composer`: READY deployment, one uploaded `src/index.html`.
- `monument-sky-presence`: READY deployment, one uploaded `src/index.html`.
- `monument-world-20`: READY deployment, one uploaded `src/index.html`.

The three one-file sky/world deployments are important recovery leads for the user's described timed overhead journey. Their source contents have not yet been fully inspected; do not assume which one contains the desired moving-route feature.

## Required integration architecture

Keep the camera-first shell and attach independent modules through explicit contracts:

1. **Moment model** — stable ID, content/media, geometry, location, altitude reference, size, orientation, visibility, schedule, movement/trajectory, provenance and revision.
2. **Map adapter** — full-screen Leaflet map in Place mode, with draggable anchor, footprint/route preview, heading handle, observer location, altitude/stratum indicators and clear accuracy state.
3. **Spatial geometry** — reuse tested geodesic, ENU/ECEF conversion, footprint, apparent-size, bearing, horizon/range and route calculations. Distinguish width × height from altitude and path trajectory.
4. **Sky trajectory** — separately model path/waypoints, start time, duration, altitude profile and playback clock. Do not fake this with a static surface or a CSS card. A path passing overhead requires an observer-relative time/position calculation and a geographic or session-local rendering mode clearly labelled.
5. **Renderer adapters**:
   - Browser camera preview: approximate GPS/compass projection only, with confidence and calibration indicators.
   - WebXR: session-local tracked geometry; anchor captured once and not recomputed every frame.
   - Future persistent world registration: ARCore/ARKit Geospatial or VPS/anchors, device capability checks and server-side anchor lifecycle.
6. **Publishing** — local draft, published snapshot, stable share URL, revisions, and global discovery are separate states. Do not claim global persistence until the backend/registry is connected and verified.
7. **Media** — image and audio must be first-class content fields with preview, URL validation, loading/error states, and inclusion in published snapshots.

## Acceptance gates before any Vercel deployment

No deployment until all gates pass:

- Static: valid HTML, unique IDs, script load order, no duplicate controls, no missing DOM contracts.
- Unit: geodesic/cardinal bearings, dateline, destination/footprint, heading wrap, surface front/back, FOV, altitude/datum, curvature/horizon, range, route interpolation, schedule boundaries, geometry limits.
- Browser E2E at 390×844 and desktop: Camera/Place/Create/Publish navigation; camera permission denial and success; map full-screen/pan/zoom/tap/drag; GPS locate and permission denial; edit dimensions/heading/altitude/visibility; image/text content; save/reload; publish/open share link; scheduled visibility; XR feature detection and fallback; no horizontal overflow; no console/page errors.
- Regression: original camera-first shell remains intact; all four bottom actions remain visible and functional.
- Device QA: physical Android camera, GPS and orientation; WebXR availability; frame pacing and tracking drift. Mark pending if not physically tested.
- Release: one preview deployment only after the tests above; production aliases untouched until user approves.

## Known mistakes to avoid

- Do not replace the camera-first shell with Spatial Lab split-screen UI.
- Do not place a fixed HTML card at the bottom and call it spatial projection.
- Do not rebuild the surface from camera coordinates every frame; preserve a stable anchor in the renderer's tracking space.
- Do not conflate schedule/expiry with timed motion along a trajectory.
- Do not conflate local drafts, share links, and globally registered public Moments.
- Do not issue repeated Vercel deployments for untested changes.
- Do not claim physical-device validation from unit or headless browser tests.

## Current branch and release safety

This audit is on `restore-spatial-engine-integration-audit`, branched from `recover-spatial-camera-baseline`.
No production project, alias, deployment or database has been modified by this audit.
