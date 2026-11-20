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


## 2026-11-20 — VPS is a critical capability, not a global development gate

**Decision:** Treat Google VPS as a first-class, high-value localization capability and maintain a dedicated VPS verification workstream. Do not make all Monument development, app startup, content creation, or publishing depend on VPS being available at the current location.

**Why it matters:** VPS can materially improve global localization and orientation, especially where GNSS is weak (for example indoors or in dense urban environments). Google documents that VPS availability is location-specific and that Geospatial API can still operate without VPS; in suitable open-sky outdoor environments GPS may be sufficient. Therefore VPS is important to the quality ceiling, but it is not the only valid positioning path.

**Required product behavior:**
- Prefer VPS-assisted global localization whenever available and report its availability/freshness explicitly.
- When VPS is unavailable, continue with device-local GNSS + visual-inertial tracking, but downgrade confidence and restrict or label precision-sensitive placement.
- Keep local-reference calibration as the precision path for relative placement where needed.
- Never treat a VPS availability check as proof that a live VPS localization fix is active.
- Never treat Earth tracking alone as proof of precision.

**Not selected:** Make VPS a hard prerequisite for Monument or pause all development until VPS is available in the user's current region. Reason: this would make the product unusable in uncovered areas and conflate a location-specific Google service with Monument's own positioning architecture.

**Current field status:** The user still reports VPS: UNAVAILABLE; the planned >=100 m movement test has not yet been performed. The installed build number for this latest report is not confirmed. Do not infer regional unavailability from this one location/result, and do not ask the user to travel solely for this test.


## 2026-11-20 — Optimize for highest reliable positioning quality, not VPS dependency

**Decision:** Monument should seek the highest reliable global pose available from ARCore Geospatial, using VPS-assisted visual localization whenever coverage and runtime convergence permit. VPS is a preferred global accuracy enhancer, not a prerequisite for all Monument features. The quality gate is the live pose's measured H/V/yaw uncertainty and stability over time, not the AVAILABLE enum or TRACKING state alone.

**Technical expectation:** Google's ARCore documentation describes typical VPS-covered performance as positional accuracy better than 5 m and often around 1 m, with rotational accuracy better than 5 degrees. These are typical expectations, not guarantees. GPS may be sufficient in open-sky outdoor environments. Do not promise centimetre-level precision from ARCore Geospatial/VPS.

**Required diagnostic separation:** Device/API support; Cloud API and OAuth authorization; network/service errors; location-specific VPS coverage; and live pose convergence/accuracy are separate conditions. Preserve exact availability/error enums, query time and freshness, privacy-safe queried coordinates, app/build identity, and current H/V/yaw measurements. Never mislabel network/auth errors as no coverage.

**Field optimization when VPS is available:** Allow convergence and encourage slow scanning of visually distinctive, static, well-lit surroundings likely represented in Street View. This is a convergence aid, not a coverage workaround or guarantee.

**Placement policy:** Use rolling H/V/yaw uncertainty and stability thresholds tailored to each placement use case. Keep WGS84 ellipsoid altitude distinct from Terrain and Rooftop anchor altitude semantics. Keep local surveyed/reference calibration available for precision-sensitive relative placement; local calibration does not itself prove global correctness. Consider RTK/survey-grade inputs only if measured product requirements justify the added system complexity.

**Not selected:** Make VPS the sole positioning engine, block the app or all publishing when VPS is unavailable, or switch engines merely to work around one UNAVAILABLE result. Reason: coverage is location-specific; Geospatial may operate with GPS and Monument has a separately approved local-reference layer.

**Build verification:** Build #42 succeeded on commit 134a424a328f8017b33dbe786264ba2ad812361f; APK artifact 14627550889 is verified. User has not yet installed it or confirmed its on-device VPS output. The earlier UNAVAILABLE report does not verify the latest re-query diagnostics.
