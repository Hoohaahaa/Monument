# Monument — First-Person Geospatial World & Spatial Publishing
**Product direction / implementation contract**
**Status:** Accepted product direction; implementation plan, not a claim of shipped capability.
**Owner decision:** First Person is the primary camera experience. Android Chrome / no-install web access is the first delivery target.

## 1. Product definition
Monument is a persistent spatial publishing platform. It turns the real Earth into an explorable, location-aware canvas where people can place, discover, experience and share spatial content. Its primary experience is **First Person**: the user is physically located in the world and the phone camera is their viewpoint. When the user turns or tilts the phone, the visible geographic world, terrain, labels and anchored content must update according to the device's real pose. Users can create multiple independent spatial surfaces at real-world coordinates and attach text, images, video, audio, charts and interactive content.

The product is not a camera filter, a floating 3D plane, a conventional map with pins, or a globe-only viewer. Globe / orbit is a secondary navigation and inspection mode. The destination experience is a continuous transition from globe → region → local terrain → first-person camera.

## 2. The non-negotiable first-person behavior
- User position is the camera's geographic origin / observer position, not a dot on a detached model.
- Camera orientation is the view direction. Looking up, level, down, or turning around changes the geographic view accordingly.
- The visible Earth is a continuous curved planetary surface. Nearby terrain should appear in front of and below the observer, with a plausible horizon and scale; it must not be rendered as a small flat square hovering in the camera image.
- The opposite hemisphere is explored in Globe / Orbit mode. A person standing on Earth cannot physically see through the planet from the surface camera.
- Geographic labels, POIs, routes and user-created surfaces are projected into the camera view using the same coordinate / pose frame.
- If localization or tracking confidence is insufficient, show an explicit degraded state; never pretend compass-only alignment is world-locked AR.

## 3. Visual direction
The user explicitly approved the visual language represented by the Cairn reference at https://monomatter.dev/cairn and the spatial visualization references shared in the 2026-11-20 conversation:
- A refined, architectural, topographic grid: thin, deliberate, high-resolution lines; contour/elevation lines; geographic graticules; restrained depth and lighting.
- A calm, spatially immersive scene with terrain and horizon, not a black wireframe globe or a mint-green flat tile.
- Floating editorial content surfaces in real space: varied size, aspect ratio, height, tilt, orientation and depth; crisp typography and controlled contrast.
- Camera / world is the canvas; interface chrome stays minimal and does not obscure the view.
- Globe view should use the same visual system as the local terrain, with a coherent grid and surface language.
The Cairn URL could not be fetched by the research browser in this pass. Treat the user's own Cairn implementation and supplied visual references as the authoritative design reference; inspect its source/assets directly in the repo or browser before attempting to imitate details. Do not invent an exact reproduction from a search thumbnail.

## 4. Spatial content model
A Moment may contain a collection of independently editable Surfaces, not just one surface plus trajectory points.

Each Surface must support:
- stable surface ID and Moment ID;
- WGS84 latitude / longitude;
- explicit altitude value and vertical datum (ellipsoid, terrain-relative, orthometric, or indoor-local; never mix silently);
- position offset / local transform;
- width, height, aspect ratio and optional 3D geometry;
- heading, pitch, roll / quaternion orientation;
- content payload: text, image, video, audio, chart, web/interactive embed;
- visibility / audience / time window / interaction policy;
- anchor strategy and tracking confidence / provenance;
- version history and authoring metadata.

Routes / Trajectories are separate spatial entities that can connect named waypoints and optionally reference Surfaces. Preserve existing Point, Column, Framed Surface, Sky Surface, Trajectory, Loop, Pause/Resume and WebXR work; migrate them into the canonical model rather than deleting or rebuilding them as unrelated demos.

## 5. Technology responsibilities
### Earth / terrain renderer
Use a globe-and-terrain engine designed for geospatial scale, progressive level of detail, geographic coordinates and terrain streaming. Evaluate CesiumJS first for the browser renderer. It is responsible for:
- ellipsoidal Earth and map/terrain imagery;
- continuous globe-to-local zoom and LOD;
- terrain mesh, elevation, tiles and geographic primitives;
- rendering georeferenced paths, labels and model overlays.

Do not hand-build a single elevation raster as the long-term terrain engine. The current Terrarium single-tile mesh is a throwaway feasibility prototype, not the production terrain architecture.

### First-person camera pose and AR localization
The pose pipeline must provide:
- camera pose in a local metric frame;
- geodetic camera position (lat/lon/altitude);
- orientation / heading and confidence;
- timestamp, tracking state and coordinate-frame metadata.

For high-fidelity Android geospatial AR, implement an Android ARCore Geospatial adapter:
- ARCore Geospatial combines device sensors, GPS and Google VPS where available.
- It provides geospatial camera pose and WGS84, Terrain and Rooftop anchor types.
- Terrain anchors resolve altitude relative to terrain; WGS84 anchors require an explicit ellipsoid altitude and orientation.
- Check device / Geospatial support and VPS availability. Show localization states and accuracy, do not assume VPS coverage.
- Use ARCore Depth / Streetscape Geometry where supported for depth-aware occlusion and building context; treat these as capability-gated, not universal.

Official references:
- https://developers.google.com/ar/develop/geospatial
- https://developers.google.com/ar/develop/java/geospatial/quickstart
- https://developers.google.com/ar/develop/java/geospatial/enable
- https://developers.google.com/ar/develop/java/geospatial/check-vps-availability
- https://developers.google.com/ar/develop/java/geospatial/anchors
- https://developers.google.com/ar/develop/java/depth

### Browser-first delivery and the native bridge decision
The first delivery target remains a normal HTTPS URL in Android Chrome, without requiring an install. WebGL / WebXR / browser sensor APIs can provide a browser-only mode and a useful terrain/globe experience. However, ARCore Geospatial is an Android SDK API, not a JavaScript browser API that can simply be added to the current page.

Therefore use a staged capability strategy:
1. Browser-only baseline: globe/terrain, map, GPS, orientation where supported, authoring and preview. Clearly label approximate tracking.
2. Validate whether the required Android Chrome WebXR/device APIs can meet the camera-pose requirement on the actual target phone.
3. If not, build a minimal Android host/runtime that embeds or shares the web UI and exposes a narrow, versioned native bridge for ARCore pose, geospatial anchors and supported depth. Keep the same HTTPS web app as the content/authoring surface where practical; use an install/PWA/native runtime only for the high-fidelity AR session.
4. Do not promise full ARCore Geospatial in a pure browser tab. Do not force native installation until the browser prototype and actual device test demonstrate the limitation and the trade-off is presented.

## 6. Runtime architecture
Keep the current camera-first shell and its Camera / Place / Create / Publish actions. Separate these services behind explicit interfaces:
- `EarthRenderer`: globe, terrain, LOD, geographic primitives.
- `PoseProvider`: browser approximate pose or native ARCore Geospatial pose.
- `AnchorProvider`: session-local WebXR, ARCore WGS84/Terrain/Rooftop, or fallback geographic placement.
- `SurfaceRenderer`: content textures, layout, orientation, occlusion and interaction.
- `SpatialRepository`: Moments, Surface collections, routes, revisions and permissions.
- `LocalizationState`: tracking state, VPS coverage, positional/rotational accuracy, altitude datum and fallback reason.

The render loop transforms geodetic coordinates into a local East-Up-South / ENU-like metric frame around the observer, then into the camera frame. All coordinate and vertical-datum conversions must be explicit and tested. Avoid rendering large Earth-scale coordinates directly in float32 scene space; use camera-relative/local-origin rendering to reduce precision loss.

## 7. Implementation sequence and acceptance gates
### Gate 0 — preserve and audit
- Keep the approved mobile Camera / Place / Create / Publish shell.
- Audit and reuse the existing map, spatial runtime contract, vertical datum contract, Moment model, WebXR renderer, Point / Column / Trajectory / Loop / Pause-Resume work.
- Record every rejected path and its reason; create a task for every important unrecorded decision.

### Gate 1 — Earth renderer
- Replace the one-tile terrain experiment with CesiumJS or a documented equivalent.
- Implement globe → region → local terrain with stable LOD and a consistent Cairn-inspired grid / contour style.
- Show the selected/current location on the actual terrain surface.
- Acceptance: no hovering square; terrain covers a meaningful surrounding area, streams adjacent tiles, and responds to map/GPS location.

### Gate 2 — First-person observer
- Introduce an explicit observer at the current geographic location and a camera pose provider.
- Bind camera orientation to phone motion; looking around changes the terrain/world view, not a detached orbit camera.
- Separate true device pose from manual orbit controls.
- Acceptance: on target Android phone, rotate and tilt device and observe stable geographic scene alignment; display pose accuracy and fallback states.

### Gate 3 — Geospatial ARCore adapter
- Create a minimal Android proof-of-capability using ARCore Geospatial Quickstart as the baseline.
- Check target phone compatibility, Play Services for AR, permissions, Cloud project/API authorization and VPS coverage.
- Display geospatial pose, tracking state, horizontal/heading accuracy and VPS availability.
- Create one WGS84 anchor and one Terrain anchor; validate repeatability across app sessions.
- Do not proceed to multi-surface AR until this gate works on the user's target phone.

### Gate 4 — Surface engine
- Implement a collection of multiple independently placeable / editable surfaces.
- Add, move, rotate, resize, set altitude/datum, duplicate, hide/show and delete each surface.
- Render content in first-person view with geographic anchors.
- Acceptance: at least three surfaces at different positions, orientations and heights, each independently editable and stable.

### Gate 5 — routes, depth and occlusion
- Reuse and integrate trajectories, loops and waypoint editing.
- Add depth/scene geometry where the device supports it.
- Occlude virtual surfaces behind real foreground objects only when a valid depth/geometry signal exists; otherwise show an explicit fallback.
- Add persistence, revisions, visitor links and multi-user discovery after spatial correctness is proven.

## 8. Known limitations and constraints
- Current `engine/earth-mesh.js` is a manually orbitable Three.js globe / single local elevation tile. It is not the first-person world engine and is not camera-pose aligned.
- The previous compass HUD is an azimuth preview, not AR tracking.
- Current browser geolocation accuracy does not establish camera pose or reliable altitude.
- ARCore Geospatial requires a supported Android device, Google Play Services for AR, fine location permission, internet, and Google Cloud ARCore API configuration for VPS. VPS availability is location-dependent; indoors and unscanned locations may fall back to weaker GPS-based pose.
- Typical VPS performance is not a guarantee; actual accuracy depends on coverage, scene, lighting, device and network.
- ARCore Geospatial is native Android SDK functionality. A browser page alone cannot call its SDK APIs without a native host/bridge.
- The user wants no-install access first. Keep that as the browser baseline and explain any native-only fidelity upgrade before requiring it.
- Do not call the current floating tile, a compass overlay, a mock label, or a screen-fixed card "world-locked AR".

## 9. Non-selected paths and reasons
1. **Single Three.js plane / one elevation tile as the Earth engine** — rejected as final architecture: it creates a floating patch, lacks adjacent-tile LOD and is not a continuous planetary surface.
2. **Black wireframe globe as the primary visual** — rejected: it does not match the approved Cairn-inspired topographic / architectural grid language.
3. **Orbit camera as the main interaction** — rejected: user's chosen primary behavior is First Person. Orbit remains a secondary Globe mode.
4. **Compass + GPS presented as AR** — rejected: insufficient pose accuracy and no persistent world tracking.
5. **Pure browser ARCore Geospatial claim** — rejected: ARCore Geospatial is an Android SDK; browser access requires a native integration layer to use it.
6. **Native app as the first mandatory delivery** — deferred: user wants a link that opens on Android without installation. First prove browser baseline and native ARCore capability separately.
7. **Building a new app and discarding previous spatial work** — rejected: preserve and integrate the current Moment, map, geometry, WebXR and authoring components.
8. **Adding occlusion before localization and depth validation** — deferred: occlusion without a reliable camera pose/depth signal would be misleading.

## 10. Required handoff rule for future contributors / AI agents
Before changing code, read this document and `docs/spatial-camera/HANDOFF.md`, inspect the current branch and implementation, and compare actual code against the acceptance gates. Keep a visible distinction between **proposed**, **implemented**, **tested on device**, and **deployed**. Never replace this First Person direction with a generic globe demo or a decorative camera overlay. Every implementation choice not selected must be recorded with its reason, and missing decision records must become explicit tasks. Always deliver a runnable preview or a precise blocker, not only architecture prose.
