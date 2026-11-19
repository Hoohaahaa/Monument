# Monument Spatial Camera — Surface Geometry & Tracking Recovery (2026-11-19)

## Source of truth and scope
Continue only from the camera-first one-page shell in `recovery/monument-spatial-camera-v0.1.html`. Keep the header wordmark `◇♧♡■■■■■` and existing Camera / Place / Create / Publish navigation. Place is the in-page map; Create is the existing bottom sheet. Do not replace this with Spatial Lab's split editor or the Field Test route.

## What the screenshot exposed
The camera overlay was not a spatial surface. It was a fixed-bottom HTML card with a CSS transition on `left`; the code changed horizontal position but left `bottom:24px` intact. It therefore remained at the bottom and slid like a UI card. The `0.22s` transition added visible lag. The earlier MVP also did not store width, height, heading, or global visibility in its Moment model.

## Historical implementation paths and why they are not the final answer
- `Portfolio/monument-studio-v1/engine-core.js`: contains reusable geodesic distance/bearing, surface footprint, camera projection, validation, and undoable geometry store. Surface defaults to vertical-curtain / follow-lower-edge. This is a useful geometry reference, not the target UI.
- `Portfolio/monument-studio-v1/engine.js`: has map footprint and width/height/heading controls, but its `updateProjection()` only projects horizontal x and estimates width/height. It does not fuse vertical camera pose or provide world tracking. Its editor is a separate split-screen Spatial Lab, so do not transplant its UI.
- `Portfolio/monument-studio-v1/field.js`: has GPS/compass bearing, FOV, front-face and visibility-range checks, approximate vertical placement from pitch/elevation, plus a single requestAnimationFrame draw gate. It is a field overlay, not the user's chosen app shell; it depends on `Spatial.apparent` and does not create persistent world anchors.
- `Portfolio/monument-studio-v1/xr.js`: attempts WebXR immersive AR and a local plane, but requires browser/device WebXR support and has no server-side geospatial VPS/world anchor. It is not a reliable universal-browser solution.
- Current MVP bug: fixed bottom card + CSS left transition + direct style writes on sensor events. It was a UI card, not a projected plane.

## Current geometry model
- Geometry: vertical surface / curtain.
- Width: horizontal physical dimension in meters.
- Height: vertical physical dimension in meters.
- Heading: surface front-face normal in degrees (0° north, clockwise).
- Map: show horizontal width footprint centered on anchor, plus a short heading axis; height is vertical and belongs to camera projection.
- Visibility: local radius up to 100 km or Global. Global is discovery/visibility policy, not a guarantee that the surface can be resolved at every point on Earth.

## Tracking and latency rules
- Sensor callbacks update the latest pose only; coalesce DOM writes into one requestAnimationFrame.
- No CSS position transition on the projected surface. It must not trail the camera by animating left/top.
- Render only when a new sensor sample or geometry change arrives; do not run layout work in a timer loop.
- Do not call map redraws from camera sensor events.
- Keep GPS accuracy visible and suppress confident projection when uncertainty is high.
- Relative alpha is not north. Accept iOS webkitCompassHeading or absolute orientation only.
- Pitch is currently relative and approximate; no calibrated camera intrinsics or roll compensation.

## Current MVP implementation in this branch
- Added width / height numeric controls (1–100,000 m), heading control, map footprint line and facing axis.
- Added local range up to 100 km and Global visibility toggle.
- Replaced bottom-card horizontal animation with a centered, size-aware screen-space surface; width and height are estimated from angular size and device viewport.
- Projection is coalesced through requestAnimationFrame and has no CSS left/top transition.
- Saved local drafts and share hash include surface geometry and visibility mode.

## Important limitations
This is still approximate GPS + compass screen-space projection, not world-locked AR. Vertical pitch reference is relative to the first sensor sample. GPS altitude is not a trustworthy elevation datum. Camera FOV is an estimate. No visual-inertial odometry, ARCore/ARKit anchors, VPS, terrain mesh, occlusion, or persistent geospatial anchor service is present. A large height such as 1 km can be configured and previewed geometrically, but cannot be claimed to align to real terrain or buildings.

## QA and next engine integration
Automated geometry checks must cover distance/bearing, destination/offset, footprint orientation, projection, face direction, FOV and range/global behavior. Browser syntax checks do not count as physical device QA. Test Android Chrome on the user's device for compass event type, sample rate, jitter, orientation, permission denial and GPS accuracy. For near-zero world-lock drift, the next renderer needs WebXR/ARCore/ARKit or a native spatial tracking layer, pose fusion and anchored transforms; do not attempt to hide GPS/compass limits with CSS smoothing.
