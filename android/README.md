# Monument Android Runtime

## Status · 2026-11-20
- **Camera passthrough:** DEVICE PASS on Samsung Galaxy A32 4G (SM-A325F); live during movement/rotation; STOP/restart works.
- **Geospatial diagnostics:** implemented and CI-built; physical-device validation pending.
- **Product UI:** existing camera-first web shell; Camera / Place / Create / Publish.
- **Native three-button screen:** temporary diagnostic UI only.

## Short implementation path
1. **v0.1.0 WebView probe — FAIL:** no native camera renderer.
2. **v0.2.0 ARCore camera — PASS:** GLSurfaceView + GLES 2.0 + external OES texture; Session.update() on GL thread.
3. **Geospatial diagnostics — BUILT:** privacy disclosure, location permission, runtime support check, Earth tracking/state, WGS84 pose and accuracy, async VPS check.
4. **Compile failure #15–#19 — FIXED:** `Session.earth` is nullable (`Earth?`); previous code assumed non-null.
5. **Null-safe fix — COMMITTED:** `442d057e23a12b2d2663c4ebb0656774b785a61f`.
6. **Build #20 — PASS:** [GitHub Actions](https://github.com/Hoohaahaa/Monument/actions/runs/44699746664); artifact ID `14612905251`; ZIP contains `app-debug.apk`.
7. **Next — DEVICE GEO TEST:** validate Geospatial configuration, Earth TRACKING, pose accuracy and VPS.
8. **Then — UI COMPOSITOR:** transparent WebView + versioned native bridge ([Issue #21](https://github.com/Hoohaahaa/Monument/issues/21)).
9. **Then — SPATIAL ENGINE:** first-person terrain, contours, labels and world-anchored Surfaces.

## Runtime boundaries
- Native Kotlin + ARCore owns camera, session, tracking and camera background.
- WebView hosts the approved Monument UI and web-rendered content; it must not start a duplicate `getUserMedia` stream in native-hosted mode.
- Geospatial support is checked at runtime; do not infer it from phone model or AR Services installation.
- VPS `ERROR_NOT_AUTHORIZED` means cloud app/project authorization is missing or invalid; it does not prove no VPS coverage.
- Depth, world anchors, terrain rendering and surface placement are not yet validated.
- A successful CI build is compile evidence, not device acceptance.
- Never change production Vercel aliases without explicit approval.

## Device check — next APK
1. Install the new diagnostic APK.
2. Accept the Geospatial privacy disclosure and precise-location permission.
3. Record whether Geospatial configures or reports unsupported/failure.
4. Record Earth state and WGS84 latitude/longitude/altitude.
5. Record horizontal, vertical and yaw accuracy.
6. Record VPS result: AVAILABLE / UNAVAILABLE / ERROR_NOT_AUTHORIZED / network error.

Do not repeat the already-passed camera movement or STOP/restart test unless a regression occurs.
