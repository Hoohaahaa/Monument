# Monument — Engineering Decisions

This file records accepted decisions and rejected paths so future sessions do not reopen settled questions without new evidence.

## 2026-11-20 — Native camera runtime must be real before spatial AR

**Decision:** The Android app launches into a native ARCore camera screen. A live camera background is the first acceptance gate. The editor remains a separate entry point until a transparent compositor is implemented.

**Reason:** The previous APK showed only a WebView editor and never rendered the ARCore camera image. That caused the user to enter Editorial View and Publish without any camera session becoming visible.

**Not selected:** Keep WebView as the whole app shell and merely add a JavaScript bridge. Reason: an opaque WebView obscures a camera view rendered beneath it, and the current page's Open Camera action is not connected to the native ARCore Session.

## 2026-11-20 — Use GLSurfaceView + ARCore external OES texture for first passthrough

**Decision:** Use GLES 2.0 with a GLSurfaceView.Renderer, an external OES texture created on the GL thread, Session.setCameraTextureName, Session.setDisplayGeometry, and Frame.transformCoordinates2d. Call Session.update() only from onDrawFrame().

**Reason:** This matches ARCore's documented camera-background rendering pattern and gives a clear, small first milestone before introducing a more complex WebGL/native compositor.

**Not selected:** Continue polling Session.update() from a scheduled worker thread. Reason: ARCore frame updates and GL camera texture consumption belong to a coordinated GL render lifecycle; the worker-thread probe was not a valid foundation.

## 2026-11-20 — Keep Geospatial and Depth out of the first camera gate

**Decision:** The v0.2.0 camera-first milestone starts a default ARCore Session without enabling Geospatial or Depth. Add those only after camera passthrough is accepted on the actual phone.

**Reason:** Camera availability, Geospatial support, VPS coverage, and Depth support are separate capabilities. Coupling them would make a basic camera failure harder to diagnose and would risk implying device capabilities that have not been verified.

## 2026-11-20 — Do not embed the opaque web editor over the camera yet

**Decision:** The native camera screen opens the web editor separately through an external browser action. A transparent WebView overlay is a later milestone.

**Reason:** The current editor is an opaque web page. Placing it above the native camera would hide the camera feed. Transparent composition requires explicit web-page transparency, z-order and lifecycle coordination; it must be implemented and tested as its own gate.

## Existing product decisions retained

- First Person is the primary Monument experience; Globe/Orbit is secondary.
- Preserve existing Leaflet/editor, Moment and Surface concepts, Point, Column, Trajectory, Loop, Pause/Resume and WebXR work.
- A single small terrain tile or black wireframe globe is not the first-person Earth renderer.
- CesiumJS or an equivalent multi-resolution geospatial renderer remains the preferred terrain-engine evaluation.
- Depth/occlusion and VPS must be capability- and location-gated.
- Production Vercel aliases must not be changed without explicit user approval.

## 2026-11-20 — Camera launch confirmed on physical Samsung Galaxy A32

**Result:** User reports that the v0.2.0 `OPEN CAMERA` action now opens the camera on the SM-A325F. This closes the basic camera-launch gate that failed in v0.1.0.

**Scope of evidence:** This is a user-reported device result, not a CI inference. It does not by itself establish sustained frame stability during phone movement, STOP/restart reliability, ARCore Geospatial support, VPS availability/accuracy, Depth support, world-locked anchors, or a complete AR experience. Keep those as separate validation gates.

**Next:** Validate stable live frames while moving/rotating the phone and STOP -> OPEN CAMERA restart; then implement runtime Geospatial/VPS diagnostics.
