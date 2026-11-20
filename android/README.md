# Monument Android Runtime

## Current milestone: Camera Passthrough v0.2.0

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
- Runtime support on Samsung Galaxy A32 4G (SM-A325F).
- Physical camera preview test on the user's phone.

Do not call this release a complete AR experience. Its first acceptance gate is simply that tapping OPEN CAMERA displays the live rear-camera image reliably.

## Build

- Android Gradle project: android/
- JDK: 17
- Gradle: 8.9
- Android SDK: 35
- ARCore dependency: 1.57.0
- Version: 0.2.0 (versionCode 2)
- CI workflow: .github/workflows/android-arcore-build.yml
- Expected artifact: monument-camera-passthrough-debug

## Device test checklist

On the Samsung Galaxy A32 4G (SM-A325F):
1. Install only the newly generated v0.2.0 APK. Uninstall the old probe first if Android reports a signature/version conflict.
2. Open Monument.
3. Tap OPEN CAMERA and grant Camera permission.
4. Confirm a live camera image fills the screen behind the native status and controls.
5. Move and rotate the phone; confirm the feed remains live and does not freeze or turn black.
6. Tap STOP, then OPEN CAMERA; confirm start/stop/restart works.
7. Send a screenshot of the running camera screen and report any error text.
8. Open Editor only as a separate authoring flow; publishing/editorial setup is not required to test camera passthrough.

Do not ask the user to configure an Editorial View or Publish to test camera. If the camera feed fails, capture Logcat and diagnose the native ARCore/GL lifecycle before adding Geospatial.

## Runtime and release rules

- A successful GitHub Actions build is compile evidence only, not device acceptance.
- Do not claim the A32 supports Geospatial, VPS or Depth until runtime checks on the physical device.
- Do not enable Geospatial/Depth in the initial camera-passthrough gate. Prove camera first, then add capability checks and localization in a separate step.
- Keep the web app as a separate browser/editor experience; no production Vercel alias changes without explicit approval.
- Read docs/PROJECT_STATE_AND_HANDOFF.md, docs/DECISIONS.md, and docs/NEXT_SESSION.md before continuing.