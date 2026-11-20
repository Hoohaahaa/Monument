# Monument — Persistent Project State / Handoff
Last updated: 2026-11-20
Current focus: Android first-person ARCore capability probe for Samsung Galaxy A32 4G (SM-A325F).

> This file is the durable continuity record. Read it first when continuing Monument work in a new chat. Update it after every meaningful implementation, decision, test, failure, or deployment. Do not rely on chat history alone.

## Product definition (non-negotiable)
Monument is a first-person geospatial spatial-publishing platform. The primary experience is the user standing at a real geographic location, with the phone camera acting as their eyes. Rotating the phone changes the viewed direction over the real terrain; the user sees geographic ground/horizon, a precise elegant topographic grid inspired by the user's Cairn reference at monomatter.dev/cairn, geographic labels, and spatial content surfaces anchored to real-world coordinates. Surfaces are first-class objects with latitude, longitude, altitude, dimensions, orientation, content and lifecycle. They can contain text, images, video, charts and interactive content. The user can create multiple surfaces and connect places using points, columns, trajectories and loops.

The default experience is First Person. A Globe/Orbit mode is a secondary navigation/overview mode, not the primary camera experience. From a ground-level first-person view, the user cannot see through the planet; the opposite hemisphere belongs in Globe/Orbit mode.

## Platform priority
1. Android phone, accessible with minimal friction.
2. Keep the web app / browser URL as the no-install baseline where browser capabilities permit.
3. Add an Android Native runtime/bridge for capabilities the browser cannot reliably provide (ARCore camera pose, Geospatial/VPS, camera background, anchors).
4. Native and web are two runtimes of the same Monument product, not separate product concepts.

Target device supplied by user: Samsung Galaxy A32 4G, model SM-A325F. User confirms Google Play Services for AR is installed and updated. This confirms an installation prerequisite, NOT Geospatial/VPS/Depth capability. Runtime API checks on the device are authoritative.

## Visual direction
- First-person real-world camera, not a floating globe widget.
- Terrain and globe grid should be elegant, fine, high quality and visually close to the user's Cairn reference, not a black wireframe.
- User must remain the spatial origin/center in first-person mode.
- Show terrain in front and around the user's view as camera orientation changes.
- Surface visual language should match spatial editorial references: floating but geographically anchored content panels, different sizes, orientations and elevations.
- The user explicitly liked the Camera Pose and Spatial Surface Engine reference images shown in the conversation; use that visual direction.
- Do not silently replace the requested camera experience with a map card, editorial card, or static location marker.

## Required technical architecture (direction, not claim of completion)
- Earth/geospatial engine: evaluate CesiumJS for globe, WGS84 coordinates, multi-resolution terrain, camera/scene controls and terrain sampling. Preserve existing Leaflet map where useful for selection and editing.
- Terrain data: use a real multi-resolution terrain provider (e.g. quantized mesh / terrain RGB) with LOD and streaming; do not treat a single height tile as the planet or local ground.
- Visual renderer: WebGL (CesiumJS/Three.js where appropriate) for terrain, geographic grid, contours, labels and surfaces.
- Native Android: Kotlin + ARCore. Native runtime owns ARCore Session, camera texture and tracking. WebView hosts the Monument UI and web-rendered content only after a correct camera compositor / transparent overlay is implemented.
- Geospatial: ARCore Geospatial API for WGS84 anchors and VPS localization where available. Check runtime support and localization state; don't infer from phone model or installed Services for AR.
- Camera pose: consume ARCore camera/geospatial pose, tracking state, heading and accuracy; transform into a shared local ENU/EUS coordinate frame and feed the web renderer.
- Depth/occlusion: optional capability, detect at runtime. Never promise Depth API or real-world occlusion on SM-A325F until verified.
- Persistent Surface Engine: independent surfaces with WGS84 anchor, altitude/datum, dimensions, orientation, media/content, visibility, persistence and revisions.
- Preserve prior concepts/implementation: Point, Column, Trajectory, Loop, Pause/Resume, WebXR and existing spatial runtime/vertical datum contracts. Audit and reuse before rewriting.

## Current branches and previews
- Current native branch: `feature/android-arcore-geospatial-bridge`
- Previous Earth mesh web prototype branch: `feature/earth-mesh-web-prototype`
- Existing web preview from earlier prototype: https://monument-field-test-m8cu2wxxp-mos-projects-efbc27a5.vercel.app/
- Production alias has NOT been changed. Never change production without explicit user approval.

## Physical-device feedback and confirmed blocker (2026-11-20)
- User installed and opened the current APK on the Samsung Galaxy A32 4G.
- Reported behavior: app launches, but no live camera preview appears. Tapping Open Camera asks for permission and then returns to the web Create/Surface/Editorial View workflow; Publish does not start a camera.
- Root cause confirmed in `MainActivity.kt`: the APK loads the old Earth Mesh preview in a WebView and adds a capability-check button. There is no GL camera renderer, no ARCore camera texture binding, and no camera/WebView compositor. The web Open Camera action is therefore not connected to a native camera runtime.
- The current scheduled-worker `Session.update()` probe is not a valid render-loop foundation and must be replaced with ARCore updates on the GL render thread.
- Current APK is a probe, not a usable camera app. User should not spend more time configuring Editorial View or publishing to make the camera appear. Keep the installed APK only if useful for comparison; it is safe to close/uninstall. Wait for a replacement build before testing camera again.
- Tracking issue: https://github.com/Hoohaahaa/Monument/issues/20

## Native probe status (2026-11-20)
- Android scaffold exists under `android/`.
- Package: `dev.monomatter.monument`.
- MainActivity hosts a WebView pointed at the current Monument preview and exposes JavaScript interface `MonumentAR`.
- Explicit action requests camera + precise location permissions and checks ARCore install state.
- Calls `Session.isGeospatialModeSupported(ENABLED)` and `Session.isDepthModeSupported(AUTOMATIC)`; enables Geospatial and Depth only if supported.
- Emits `monument:arcore` custom events to WebView with capability/state and camera geospatial pose (lat/lon/altitude/heading/accuracy) when Earth tracking is active.
- IMPORTANT: this is currently a capability/pose probe only. It does NOT display the ARCore camera background, does NOT provide a valid first-person compositor, and does NOT render terrain/surfaces in the camera. It is not the final AR app.
- Known engineering risk to review next: current implementation calls `Session.update()` from a scheduled worker without a dedicated GL render thread / camera texture compositor. Before trusting pose cadence or building on it, move ARCore frame updates onto a proper GL/render lifecycle and validate Session lifecycle/thread constraints. Do not overstate current pose bridge reliability.
- Current WebView URL is hardcoded to the Earth Mesh preview. Review whether this is still the intended web entrypoint before shipping.

## Build history
- Workflow: `.github/workflows/android-arcore-build.yml`
- Workflow builds Debug APK using JDK 17 and Gradle 8.9; uploads artifact for 7 days.
- Run #1: https://github.com/Hoohaahaa/Monument/actions/runs/44696297862 — FAILED due Java/Kotlin target mismatch.
- Fix: align Java source/target compatibility and Kotlin jvmTarget to 17 in `android/app/build.gradle.kts`.
- Run #2: https://github.com/Hoohaahaa/Monument/actions/runs/44696542084 — SUCCESS.
- Artifact name: `monument-arcore-probe-debug`
- Artifact ID: `14610956314`
- Artifact size: 3,190,719 bytes ZIP; APK inside is 3,938,017 bytes.
- APK was downloaded and extracted in the assistant working runtime at `/mnt/data/monument-arcore-probe/app-debug.apk`. This is a verified path for the current session only; do not reuse it in another session without checking.
- APK has compiled successfully but has NOT been installed or run on a physical device. No Geospatial/Depth support result is known yet.

## Open work / next steps
1. Provide the actual Debug APK to the user for installation on their SM-A325F, with clear warning that it is a probe build, not the complete camera AR experience.
2. On-device probe: user grants camera + precise location, taps explicit start, report actual Geospatial and Depth booleans, Earth tracking state, VPS localization and pose accuracies. Capture logs/status and device Android version.
3. Fix ARCore lifecycle: implement a proper GL thread (GLSurfaceView/EGL), camera texture binding via `Session.setCameraTextureName`, call `Session.update()` on render loop, handle pause/resume, context loss, permission and install/update flows.
4. Implement camera compositor: ARCore camera background in GL surface + transparent WebView overlay for Monument UI; avoid simultaneous WebView getUserMedia camera access.
5. Feed validated ARCore camera pose and geospatial pose into shared coordinate frame (ENU/EUS); show diagnostic tracking/accuracy status.
6. Integrate CesiumJS / terrain engine into first-person camera with multi-resolution terrain, Cairn-inspired grid/contours and correct user-centered camera orientation.
7. Implement multiple persistent geospatial Surface objects and reuse Point/Column/Trajectory/Loop contracts.
8. Depth/occlusion only if runtime/device supports it; provide graceful fallback.

## Acceptance gates (must not skip)
- Build success is not runtime success.
- Runtime capability probe on actual SM-A325F is required.
- Camera passthrough must visibly work before claiming camera AR.
- Pose must track phone movement with stable orientation and accuracy before claiming world-locked first person.
- Terrain must be geographic, multi-resolution and centered around user's location before calling it a real Earth/Terrain view.
- Surface must stay at the same real-world anchor after phone movement and relaunch before calling it persistent.
- Occlusion must be physically validated before claiming it.
- Test indoors and outdoors; VPS coverage varies by location.

## Decisions / rejected paths log
- Rejected: black wireframe globe as the main product view. Reason: does not match the Cairn visual target or first-person ground-level experience.
- Rejected: a single small terrain tile/mesh as the Earth engine. Reason: limited coverage, no continuous LOD, not centered as a user-eye camera experience.
- Rejected: compass + GPS overlay as final AR. Reason: no calibrated 6DoF camera pose, no reliable world anchors, no occlusion.
- Rejected: globe-only interaction as primary. Reason: user's explicit primary mode is First Person; globe is secondary overview/navigation.
- Rejected: native app as a separate product. Reason: native runtime must enhance the same Monument web product.
- Deferred: forcing Native installation for all users. Reason: preserve no-install web access until browser limitations require native capabilities.
- Deferred: promising Depth/occlusion on A32. Reason: must be checked at runtime; device catalogue and installed AR Services are not sufficient.
- Deferred: full VPS/Geospatial claims before live A32 and location testing. Reason: hardware/API availability and geographic VPS coverage are separate.
- Every future path not selected must be recorded here with rationale; create/update GitHub issues for untracked work.

## Continuity instructions for future chats / agents
Read this file and `docs/product/FIRST_PERSON_GEOSPATIAL_PRODUCT_DIRECTION.md`, `android/README.md`, and open issues #17 and #19 before changing architecture. Continue from the current branch; inspect actual repository state and workflow runs. Do not claim implementation, tests, deployment or physical-device behavior unless verified. Update this document after each material change and include commit SHA, workflow run, artifacts, tests, device observations and next exact action. Keep explanations concise and provide working outputs, not only plans.
