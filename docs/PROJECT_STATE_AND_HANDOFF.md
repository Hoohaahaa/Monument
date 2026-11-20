# Monument — Persistent Project State / Handoff
Last updated: 2026-11-20 (camera runtime accepted; Geospatial diagnostics in progress)
Current focus: enable and validate ARCore Geospatial/VPS on Samsung Galaxy A32 4G (SM-A325F), then compose the approved Monument camera-first UI over the live camera.

> **MANDATORY NEXT-CHAT CHECKPOINT:** Before editing code or asking the user to repeat anything, read this handoff and GitHub Issue [#20](https://github.com/Hoohaahaa/Monument/issues/20). The v0.1.0 WebView probe failed, but the v0.2.0 native camera path has now been opened successfully on the user's physical Samsung Galaxy A32 4G, as confirmed by the user on 2026-11-20. Do not repeat the old probe or ask for Editorial View / Publish setup. Camera launch, smooth phone movement/rotation, and STOP/restart are now user-confirmed. Continue with Geospatial/VPS capability and pose diagnostics; do not ask the user to repeat the camera test. The user should not have to re-explain prior failures or tests.

This file is the durable continuity record. Read it first when continuing Monument work in a new chat. Update it after every meaningful implementation, decision, test, failure, or deployment. Do not rely on chat history alone.

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

## Physical-device feedback and confirmed blocker — v0.1.0 (2026-11-20)
- User installed and opened the current APK on the Samsung Galaxy A32 4G.
- Reported behavior: app launches, but no live camera preview appears. Tapping Open Camera asks for permission and then returns to the web Create/Surface/Editorial View workflow; Publish does not start a camera.
- Root cause confirmed in `MainActivity.kt`: the APK loads the old Earth Mesh preview in a WebView and adds a capability-check button. There is no GL camera renderer, no ARCore camera texture binding, and no camera/WebView compositor. The web Open Camera action is therefore not connected to a native camera runtime.
- The current scheduled-worker `Session.update()` probe is not a valid render-loop foundation and must be replaced with ARCore updates on the GL render thread.
- Current APK is a probe, not a usable camera app. User should not spend more time configuring Editorial View or publishing to make the camera appear. Keep the installed APK only if useful for comparison; it is safe to close/uninstall. Wait for a replacement build before testing camera again.
- Tracking issue: https://github.com/Hoohaahaa/Monument/issues/20

## Previous APK — explicitly failed user acceptance (2026-11-20)
- Build artifact monument-arcore-probe-debug (artifact ID 14610956314) was installed and launched by the user on the target phone.
- User acceptance result: FAIL — no camera image, no camera passthrough, and no visible AR experience. The app launched into a WebView/editorial workflow instead.
- This result supersedes any assumption that a successful CI build means the Android experience works. Do not distribute this same artifact again as a camera build.
- Required next release: a new APK with an actual GL-rendered ARCore camera background. Transparent Monument overlay is deferred until camera passthrough is accepted. Build/CI success is only a compile gate; user device confirmation remains required.

## Current native camera runtime — v0.2.0 (2026-11-20)
- Version code 2 / version name 0.2.0.
- The old WebView-first probe has been replaced in code by a native camera-first Activity.
- New file: android/app/src/main/java/dev/monomatter/monument/CameraBackgroundRenderer.kt.
- MainActivity now presents native OPEN CAMERA / STOP / OPEN EDITOR controls. The editor opens separately in the external browser; it no longer covers the camera launch screen.
- Camera path: request Camera permission -> ARCore install/update check -> create/configure default Session -> Session.resume() -> GLSurfaceView queue event attaches Session to renderer -> renderer binds an external OES texture with Session.setCameraTextureName() -> Session.update() runs in GLSurfaceView.Renderer.onDrawFrame() -> Frame.transformCoordinates2d() supplies display-correct texture UVs -> GLES draws camera background.
- Activity lifecycle pauses GLSurfaceView before Session.pause(), and resumes Session before GLSurfaceView resumes.
- Geospatial and Depth are intentionally NOT enabled in this milestone. This separates basic camera availability from Geospatial/VPS/Depth capability and avoids making the first gate harder to diagnose.
- The editor is intentionally separate because current web UI is opaque. Transparent WebView overlay and actual Monument UI compositing are still not implemented.
- Current scope is camera passthrough only. No terrain, Cairn grid, spatial surfaces, WGS84 anchors, VPS or occlusion are rendered yet.
- Physical device result (user-confirmed): live camera opens, remains smooth while the phone moves/rotates, and STOP/restart works on SM-A325F. This closes the camera runtime acceptance gate. Geospatial/VPS localization and Depth support remain unknown.
- Android docs: android/README.md. Decision log: docs/DECISIONS.md. Compact next-session checklist: docs/NEXT_SESSION.md.
- Tracking issue: https://github.com/Hoohaahaa/Monument/issues/20

## Geospatial/VPS diagnostics implementation — CI/device validation pending
- MainActivity now requests explicit user consent before Geospatial location use, requests precise + coarse location permissions, checks `Session.isGeospatialModeSupported`, and enables `Config.GeospatialMode.ENABLED` only when supported and precise location is granted. Camera-only fallback remains available.
- CameraBackgroundRenderer reads Earth tracking/state and, only while Earth is TRACKING, reports WGS84 latitude/longitude, ellipsoid altitude, horizontal/vertical accuracy and orientation yaw accuracy. It starts one asynchronous `Session.checkVpsAvailabilityAsync` request at the localized camera position and reports the result.
- This remains a diagnostic shell. The native OPEN CAMERA / STOP / OPEN EDITOR controls and status panel are not the final Monument UI. Preserve the approved camera-first web experience and Camera / Place / Create / Publish actions; next UI milestone is transparent composition over the native camera, not a replacement interface. Implementation task: [Issue #21](https://github.com/Hoohaahaa/Monument/issues/21).
- VPS cloud authorization is not yet verified. `ERROR_NOT_AUTHORIZED` indicates project/app authorization setup, not absence of VPS coverage. No Geospatial result has yet been observed on the physical phone.
- Build run #17 (`44699284248`) failed before Kotlin compilation because Gradle could not resolve many unrelated dependencies from Google Maven, Maven Central and Gradle Plugin Portal. The failed job was re-run (attempt 2); inspect its final status. This is recorded as an infrastructure/dependency-resolution failure, not a code compile failure.
- CI runs #15 (44699268900) and #16 (44699272579) were triggered during this implementation; a final platform AlertDialog import correction was pushed after those runs. Check the latest run before sharing an APK.

## Camera-first UI integration task
- Issue #21: https://github.com/Hoohaahaa/Monument/issues/21 — compose the accepted camera-first UI over native ARCore camera, preserve four actions, prevent competing browser camera sessions, implement a versioned bridge and validate on device.

## Build history
- v0.2.0 camera passthrough workflow run #10: https://github.com/Hoohaahaa/Monument/actions/runs/44698143221 — SUCCESS, commit a16039a14d16ec0ec1c7547c8c5450978c58a4d3. Artifact ID 14611343158 (monument-camera-passthrough-debug, ZIP 3,193,233 bytes); APK inside 3,938,005 bytes. This artifact includes the native camera-first Activity, GL camera renderer, lifecycle fixes and correct exception import.
- Follow-up run #12: https://github.com/Hoohaahaa/Monument/actions/runs/44698291433 — SUCCESS, commit 4b5818e96ad5e17ec29d7195f0dbac8de5bd4e48; diagnostic-only change that distinguishes camera startup from the first live frame.
- Intermediate CI run #6 failed at Kotlin compile: wrong CameraNotAvailableException package and stale probe MainActivity references to JSONObject. Fixed by importing com.google.ar.core.exceptions.CameraNotAvailableException and replacing the old WebView probe Activity with the native camera-first Activity. Do not treat that failed run as the current code result.
- Artifact name: monument-camera-passthrough-debug. Verified run #10 APK was downloaded and extracted in the current session to /mnt/data/monument-camera-passthrough-run10/app-debug.apk. This path is valid for this session only; re-verify before reusing in another session.
- Workflow: `.github/workflows/android-arcore-build.yml`
- Workflow builds Debug APK using JDK 17 and Gradle 8.9; uploads artifact for 7 days.
- Run #1: https://github.com/Hoohaahaa/Monument/actions/runs/44696297862 — FAILED due Java/Kotlin target mismatch.
- Fix: align Java source/target compatibility and Kotlin jvmTarget to 17 in `android/app/build.gradle.kts`.
- Run #2: https://github.com/Hoohaahaa/Monument/actions/runs/44696542084 — SUCCESS.
- Artifact name: `monument-arcore-probe-debug`
- Artifact ID: `14610956314`
- Artifact size: 3,190,719 bytes ZIP; APK inside is 3,938,017 bytes.
- APK was downloaded and extracted in the assistant working runtime at `/mnt/data/monument-arcore-probe/app-debug.apk`. This is a verified path for the current session only; do not reuse it in another session without checking.
- v0.1.0 probe APK WAS installed and launched on the user's physical SM-A325F and failed camera acceptance (no live camera feed). This result is recorded above. v0.2.0 camera launch has been confirmed by the user on the physical phone. No Geospatial/VPS or Depth support result is known yet.

## Open work / next steps
1. Camera runtime is accepted on SM-A325F: user confirmed smooth live frames during phone movement/rotation and working STOP/restart.
2. Verify latest Geospatial diagnostics CI build. Install only a successful new APK.
3. On device, accept the location disclosure and precise location permission. Record Geospatial support/configuration, Earth state, WGS84 pose, horizontal/vertical/yaw accuracy and VPS result. Distinguish NOT_AUTHORIZED from UNAVAILABLE.
4. After localization validation, build the transparent compositor and restore the approved Monument camera-first interface; the current native control screen is diagnostic-only.
5. Implement a transparent WebView/native composition layer only after the camera renderer is stable; editor must not obscure camera.
6. Feed validated camera pose into the shared local ENU/EUS frame and first-person Earth renderer.
7. Evaluate CesiumJS or equivalent multi-resolution terrain and Cairn-inspired grid/contours.
8. Implement multiple persistent geospatial Surfaces and integrate existing Point/Column/Trajectory/Loop/WebXR work.
9. Update PROJECT_STATE_AND_HANDOFF.md, DECISIONS.md and NEXT_SESSION.md after every material change, test, failure or decision. Add commit SHA, workflow run, artifact ID, device observations and exact next action.

## Acceptance gates (must not skip)
- Build success is not runtime success.
- Runtime capability probe on actual SM-A325F is required.
- Camera runtime is user-accepted on the physical phone: smooth live frames while moving/rotating and STOP/restart work. Geospatial pose and world-locking are not yet validated.
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
- Final native interface must not remain the temporary three-button diagnostic shell. Preserve the accepted camera-first shell and Camera / Place / Create / Publish actions, composed transparently over the native camera.

## Continuity instructions for future chats / agents
Read this file, `docs/NEXT_SESSION.md`, `docs/DECISIONS.md`, `docs/product/FIRST_PERSON_GEOSPATIAL_PRODUCT_DIRECTION.md`, `android/README.md`, and open issues #17, #19 and #20 before changing architecture. At the start of every new Monument chat, do this automatically; do not ask the user to remind you. Continue from the current branch; inspect actual repository state and workflow runs. Do not claim implementation, tests, deployment or physical-device behavior unless verified. Update this document after each material change and include commit SHA, workflow run, artifacts, tests, device observations and next exact action. Keep explanations concise and provide working outputs, not only plans.
