# Monument Android Runtime

## Current milestone: Camera Passthrough accepted; Geospatial diagnostics in progress

The native app is now camera-first. It no longer loads the old Earth Mesh web page as its launch screen. The app presents a native OPEN CAMERA action, starts an ARCore Session, binds an external OES camera texture, and renders the live camera background through a GLSurfaceView.

The ARCore frame loop (Session.update()) runs from GLSurfaceView.Renderer.onDrawFrame() on the GL thread. Display geometry and texture UV coordinates are updated from the current ARCore frame. The web editor is opened separately through OPEN EDITOR, so the opaque web page cannot cover the camera feed or start a competing browser camera session.

## Important scope boundary

This is the first camera-passthrough milestone, not the completed Monument first-person product.

Implemented in code (awaiting CI/device validation):
- Native camera-first screen.
- Camera permission request.
- ARCore install/update prompt.
- ARCore external OES texture and GLES 2.0 camera background.
- ARCore frame updates on the GL render thread.
- Basic tracking-state status text.
- Separate browser editor launch.
- Stop / restart camera controls.
- Activity pause/resume handling.

Not implemented or not yet validated:
- WebView transparent overlay composited over the camera.
- Monument terrain / Cairn grid / geospatial surfaces drawn in camera view.
- Geospatial/VPS localization and WGS84 anchors in this camera-first build.
- Depth occlusion.
- Sustained frame stability during phone movement and STOP/restart on Samsung Galaxy A32 4G (SM-A325F).
- Geospatial/VPS localization, WGS84 anchors and Depth support.

Do not call this release a complete AR experience. Its first acceptance gate is simply that tapping OPEN CAMERA displays the live rear-camera image reliably.

## Build

- Verified CI run #10: https://github.com/Hoohaahaa/Monument/actions/runs/44698143221 (success).
- Artifact ID: 14611343158; artifact: monument-camera-passthrough-debug.
- Follow-up run #12 contains a diagnostic status-message improvement and was still running at the last check.

- Android Gradle project: android/
- JDK: 17
- Gradle: 8.9
- Android SDK: 35
- ARCore dependency: 1.57.0
- Version: 0.2.0 (versionCode 2)
- CI workflow: .github/workflows/android-arcore-build.yml
- Expected artifact: monument-camera-passthrough-debug

## Geospatial diagnostics in the current source (CI/device validation pending)

- Explicit privacy disclosure before requesting location for Geospatial use.
- Request both fine and coarse location; Geospatial mode is enabled only when precise location is granted.
- Check `Session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)` before configuring the session.
- If enabled and Earth reaches `TrackingState.TRACKING`, display WGS84 latitude/longitude, altitude above the WGS84 ellipsoid, horizontal accuracy, vertical accuracy and orientation yaw accuracy.
- Query VPS asynchronously with `Session.checkVpsAvailabilityAsync()` once a valid camera geospatial pose is available.
- A VPS authorization error is not the same as VPS being unavailable at that location. Cloud API authorization is not yet verified.
- Do not claim device support until this new diagnostic APK is tested on the physical phone.

## Interface constraint

The current native camera buttons/status panel are temporary diagnostic UI only. They are not the product interface. Preserve the approved camera-first Monument shell and its four actions: Camera / Place / Create / Publish. The next UI milestone is a transparent compositor over the native camera, followed by the real spatial renderer. Tracked in [Issue #21](https://github.com/Hoohaahaa/Monument/issues/21).

## Build note

- Run #17 (`44699284248`) failed during Gradle dependency resolution because many unrelated artifacts could not be resolved from the configured Maven repositories before Kotlin compilation. The failed job was retried as attempt 2. Check the final run state; do not share an APK until a successful artifact is verified.

## Device test checklist

On the Samsung Galaxy A32 4G (SM-A325F):
1. Install only the newly generated v0.2.0 APK. Uninstall the old probe first if Android reports a signature/version conflict.
2. Open Monument.
3. Tap OPEN CAMERA and grant Camera permission.
4. Confirm a live camera image fills the screen behind the native status and controls.
5. Move and rotate the phone; confirm the feed remains live and does not freeze or turn black.
6. Tap STOP, then OPEN CAMERA; confirm start/stop/restart works.
7. Report whether the image remains live while moving/rotating the phone and whether STOP -> OPEN CAMERA restarts cleanly.
8. Open Editor only as a separate authoring flow; publishing/editorial setup is not required to test camera passthrough.

Do not ask the user to configure an Editorial View or Publish to test camera. If the camera feed fails, capture Logcat and diagnose the native ARCore/GL lifecycle before adding Geospatial.

## Runtime and release rules

- A successful GitHub Actions build is compile evidence only, not device acceptance.
- Do not claim the A32 supports Geospatial, VPS or Depth until runtime checks on the physical device.
- Do not enable Geospatial/Depth in the initial camera-passthrough gate. Prove camera first, then add capability checks and localization in a separate step.
- Keep the web app as a separate browser/editor experience; no production Vercel alias changes without explicit approval.
- Read docs/PROJECT_STATE_AND_HANDOFF.md, docs/DECISIONS.md, and docs/NEXT_SESSION.md before continuing.