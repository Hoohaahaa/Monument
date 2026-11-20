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

## 2026-11-20 — Preserve the approved Monument UI

**Decision:** The native OPEN CAMERA / STOP / OPEN EDITOR screen is a temporary engineering diagnostic. Preserve the approved camera-first shell and Camera / Place / Create / Publish actions; later compose it transparently over the native camera with a versioned bridge.

**Reason:** The native mock is not the accepted product UI.

## 2026-11-20 — Camera runtime accepted on physical Samsung Galaxy A32

**Result:** User confirms live camera remains smooth while moving/rotating and STOP/restart works on SM-A325F. Camera acceptance is closed.

## 2026-11-20 — Geospatial authorization diagnosis

**Observed:** On the physical device, Earth Tracking is PAUSED and the user reports ERROR_NOT_AUTHORIZED for Earth/VPS. User confirms precise location is enabled.

**Root cause direction:** Google documents EarthState.ERROR_NOT_AUTHORIZED for a disabled ARCore API / wrong Cloud project, invalid API key, or keyless OAuth Android client whose package name + signing SHA-1 do not match. The app's Gradle dependencies included Play Services Location but omitted play-services-auth.

**Decision:** Use Google's preferred Keyless flow. Add com.google.android.gms:play-services-auth; do not add an API key merely because the manifest has none. Build the app, inspect the exact APK signing SHA-1, then register that fingerprint with an OAuth Android client for dev.monomatter.monument and enable ARCore API in the same Cloud project.

**Evidence:** [Google ARCore authorization troubleshooting](https://developers.google.com/ar/develop/authorization/troubleshooting?platform=android) · [EarthState reference](https://developers.google.com/ar/reference/java/com/google/ar/core/Earth.EarthState).

**Still unverified:** Whether the Cloud project and OAuth client are configured correctly; Earth TRACKING; valid WGS84 pose; VPS coverage; Depth; world anchors; terrain rendering.
