# Field Test — Working Build 0.2

**Date:** 2026-11-18  
**Environment:** Vercel project `monument-field-test`  
**Deployment:** `dpl_41RDzkWrvZkFyBzHhKFwq2kJ8RAV`  
**Domain:** https://monument-field-test.vercel.app  
**Release state:** Vercel READY (deployment verification only; device-level QA remains open)

## What is implemented in this build

- Mobile-first spatial authoring interface with orange `#FF573D` accent and eight-square mark.
- Create/edit a Moment with title, body, optional externally hosted media URL.
- Select placement by map tap, coordinate entry, current GPS, or place search (OpenStreetMap Nominatim). The marker is visually draggable, but drag-to-coordinate synchronization is a known bug tracked in issue #4; use map tap or coordinate entry for now.
- Select discovery visibility: 50 m, 500 m, 1 km, 10 km, 100 km, Global.
- Set geometry width independently from discovery visibility.
- Local browser persistence for created Moments.
- Share a single Moment by encoding its data into a URL hash.
- Camera is optional. Camera permission failure does not hide content or the spatial authoring UI.
- Live guidance uses GPS distance and target bearing; device heading is used when the browser/device exposes it and permission is granted.
- Direction dock fades and the Moment content card appears when the device is within the local arrival threshold.
- Sensor status and unavailable capabilities are shown explicitly.

## Important semantics

Visibility is a discovery policy, not geometry. A 100 km-wide spatial object may be globally discoverable. Global means globally discoverable; it does not mean the geometry is rendered at a physically meaningful scale from every point on Earth. The current map circle is a visualization aid, not a global-scale spatial rendering engine.

The arrival threshold is a local interaction transition, not the discovery radius. Distant users receive navigation guidance; near the target the guidance dock fades and the content preview appears.

## Verified vs not yet verified

### Verified by deployment API
- The deployment exists and Vercel reports `READY`.
- It is assigned to the `monument-field-test` project and the project domain alias.

### Implemented in browser code, pending real-device QA
- Map selection, search, GPS and compass permission paths.
- Camera preview.
- Local persistence and share-link encoding.
- Distance, bearing, turn-angle and arrival transition.

### Not implemented / not connected
- Shared database or cross-device persistence.
- Global Moment discovery/index service.
- Media upload and managed asset storage (media URL only).
- Server-side analytics and admin dashboard.
- ARCore/ARKit Geospatial anchors, VPS, or world-locked AR.
- Multi-user realtime state.

Never describe these as operational until they are implemented and verified.

## Known limitations and follow-up tasks

1. **P0 — Device QA:** test on Android Chrome and iOS Safari, including denied camera, denied GPS, denied compass, low-accuracy GPS, and background/resume.
2. **P0 — Persistent backend:** define and implement Moment API + Postgres/PostGIS + object storage; add auth/ownership and moderation boundaries.
3. **P1 — Global discovery:** spatial index, visibility policy enforcement, search and feed queries; do not emulate global discovery with an oversized map circle.
4. **P1 — Geometry renderer:** distinguish object dimensions, spatial stratum, orientation, surface behavior, and display projection.
5. **P1 — Guidance robustness:** handle compass calibration, device orientation variants, magnetic declination, stale sensor readings, GPS jumps, and antimeridian/polar cases.
6. **P1 — Analytics:** instrument discovery, open, approach, arrival, view, interaction, share, publish, and failure events with a versioned schema.
7. **P2 — Workstation:** expand controls for World, Placement, Geometry, Content, Composition, Visibility, Behavior, Preview, and Analytics.
8. **P2 — Media:** upload pipeline, asset IDs, validation, responsive image/video rendering, and failure/retry states.

## Architecture boundary

This build is a browser field-test prototype. Local storage and hash sharing are deliberately not represented as cloud persistence. The Vercel deployment was created from inline source files and is not evidence of a Git-connected release pipeline. Source must be brought under the independent `Hoohaahaa/Monument` repository before calling the release reproducible.

## Acceptance criteria for the next field test

- User can create a Moment in Chabahar while physically in Tehran by searching/selecting Chabahar on the map.
- The Moment remains saved after reload on the same device.
- Share link opens the selected Moment on another device/browser (link payload only; no server discovery implied).
- GPS guidance reports distance and bearing; turn direction appears only when a valid heading is available.
- Camera permission denial leaves the app usable.
- On reaching the configured local arrival threshold, guidance fades and the content preview becomes visible.
- Visibility selection and geometry width remain independent.
- All sensor and network failures have visible, truthful states.
