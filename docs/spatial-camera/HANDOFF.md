# Monument Spatial Camera — Continuation Handoff

Last updated: 2026-11-19

## Exact product/version to continue
The approved baseline is the single-page camera-first app titled **Monument — Spatial Camera**, not Spatial Lab and not the Field Test route.

- Repository: `Hoohaahaa/Monument`
- Working branch: `spatial-camera-mvp`
- Main source of truth: `recovery/monument-spatial-camera-v0.1.html`
- Recovery baseline: `recover-spatial-camera-baseline`
- Spatial implementation branch: `spatial-camera-mvp`
- Current source commit: `ff91dc1710c085745d498a386f7ab74b3c0d7322`
- Current Vercel Preview: https://monument-field-test-gonfp55sp-mos-projects-efbc27a5.vercel.app/
- Vercel deployment: `dpl_AS72d4ndqrSGR2Jjv8pQjhZ2Gsc6` (READY)
- Original recovered immutable preview (do not overwrite): https://monument-field-test-nhoj660xe-mos-projects-efbc27a5.vercel.app/

## UI constraints
Preserve the same camera-first page and bottom navigation: Camera / Place / Create / Publish. Place is an in-page map; Create is the existing bottom sheet. Header text is exactly `◇♧♡■■■■■`. Do not introduce the split-screen Spatial Lab editor, new routes, or a new navigation scheme. User wants to assess this implementation before discussing the broader landing-page/navigation idea.

## What user reported from the physical phone screenshot
- The text card remained near the bottom of the camera even though bearing was shown.
- It behaved like a UI card, not a surface fixed in the real environment.
- The card visibly lagged when the phone/camera moved.
- Surface sizing and orientation were not accessible/clear.
- User wants width × height, heading/orientation, a visible footprint on the map, and visibility selectable from local radius to Global. They may need very tall surfaces (hundreds of meters or kilometres).
- They want a surface to feel fixed in the world while panning the camera; near-zero lag is an important goal.

## Root cause in previous MVP
The old CSS anchored `.moment-card` using `bottom:24px`. The added `.moment-card.projected` changed `left`, but retained the bottom anchor and had a `0.22s` CSS transition. The projection code updated only a horizontal percentage and had no width/height/heading geometry. It was always a bottom card sliding left/right, not a projected plane.

## Work now present in branch
- Width and height numeric controls, each 1–100,000 m.
- Heading/orientation control, degrees.
- Map footprint line for horizontal surface width and a heading axis.
- Local radius control up to 100 km, plus Global visibility toggle.
- Camera overlay uses computed angular width/height and vertical screen position rather than a fixed-bottom card.
- Removed positional CSS transition; orientation updates are coalesced to a single requestAnimationFrame. No timer-based render loop.
- Local draft and share URL hash include width, height, heading, range and Global state.
- Existing camera-first layout/navigation remains in place.

## Previous paths inspected and what not to do
1. `Hoohaahaa/Portfolio` branch `monument-studio-v1`, `engine-core.js`: useful geodesic and surface geometry core; no complete world tracking.
2. Same branch `engine.js`: width/height/heading editor and map footprint, but it is a split-screen Spatial Lab UI and its camera projection is only approximate horizontal positioning. Reuse algorithms only, not its UI.
3. Same branch `field.js`: GPS/compass, bearing/FOV/front-face/range and approximate pitch projection. It uses a requestAnimationFrame gate, but is a separate field overlay and not a world-locked AR system.
4. Same branch `xr.js`: WebXR local plane path. It is device/browser dependent and does not provide a global geospatial VPS/world anchor. Do not present it as universally available.
5. Do not revive old PR #8 / `restore-camera-first-field`; it restored the wrong separate Field Test experience and was closed unmerged.

## Honest capability boundary
The current preview is still approximate GPS + compass screen-space projection. It is not ARCore/ARKit/VPS world-locked tracking. Pitch is relative to the first sample; FOV is estimated; GPS altitude is not a reliable vertical datum. There is no terrain mesh, occlusion, visual-inertial pose fusion, persistent geospatial anchor service, server-side Moment registry, or global publishing backend. Global currently means visibility policy in this prototype, not a guarantee of precise rendering everywhere. A 1 km height can be entered as geometry, but cannot yet be guaranteed to align with real terrain or buildings.

## Test status
Passed:
- JavaScript syntax compilation for the embedded app script.
- Geodesic sanity checks: 100 m east offset → 100 m / 90°; 200 m north offset → 200 m / 0°.
- Angle wrap checks across north: ±20°.
- Static checks for geometry controls, map footprint, Global toggle, local geometry persistence, RAF scheduling, and absence of positional CSS transition.

Not yet done:
- Real mobile runtime/browser interaction test.
- Physical Android Chrome test on user's phone: compass sensor type/rate, calibration, drift, pitch mapping, GPS error and permission denial.
- iOS Safari test.
- ARCore/ARKit/VPS world-lock integration.
- Server persistence/public global discovery.

## Next tasks
1. Ask user to test the current Preview on the same phone, especially whether the surface moves with camera heading without the old bottom-card lag.
2. Collect exact device diagnostics only with consent; distinguish GPS uncertainty from compass jitter.
3. If near-zero world lock is still required, implement a native/WebXR/ARCore/ARKit tracking adapter with anchored transforms; do not attempt to mask drift with CSS easing.
4. Extend geometry to include vertical base altitude/elevation datum, terrain-following lower edge, roll/pitch calibration, surface image/media texture, and a proper global geospatial registry.
5. Keep a NO OS-style decision log: every selected path, rejected alternative, reason, failed route and follow-up task should be recorded.


## 2026-11-19 follow-up: navigation/editor regression
The prior preview `dpl_AS72d4ndqrSGR2Jjv8pQjhZ2Gsc6` was not acceptable. While inserting the geometry controls, the editor markup retained a duplicate old radius/test section and unbalanced closing divs. This corrupted the document structure around the stage, editor and footer, causing the user-facing navigation/actions to disappear or become inaccessible. This was our implementation error; do not ask the user to fix it.

Corrective work:
- Rebuilt the complete `#editor` markup as one clean, balanced block.
- Kept exactly one each of Camera, Place, Create, Publish, editor, geometry fields, test-shift actions and local save/publish controls.
- Preserved the original camera-first shell and bottom navigation.
- Re-ran embedded JavaScript syntax check: PASS.
- Verified required control IDs each occur exactly once.
- New preview deployment: https://monument-field-test-7oufklvpc-mos-projects-efbc27a5.vercel.app/
- Deployment ID: `dpl_4qNi4Z5ksqLES45VxEaGEPqULw4W`, state READY.
- Corrective source commit: `4b9f572b0cd3d6502d0589cd0d4503b4df406a9e`.

This is a source/markup repair and a successful Vercel build, not yet a physical-device runtime verification. Next time continue from this corrected commit and this preview, not from the previous broken deployment. Before deploying any UI change, validate document structure, required control IDs, mobile viewport layout, and camera/footer stacking.
