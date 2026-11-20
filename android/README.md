# Monument Android build and test notes

## Current verified state — 2026-11-20
- Package: `dev.monomatter.monument`
- App version: `0.2.1` (versionCode 3).
- Device: Samsung Galaxy A32 4G (SM-A325F).
- Native ARCore camera passthrough: **PASS** on the physical device.
- Google Cloud ARCore API: enabled in project `monument-515308`.
- Android OAuth client: created for package `dev.monomatter.monument` with the stable CI signing SHA-1.
- Geospatial physical-device test: **PASS** — user confirms Earth Tracking is `TRACKING` and WGS84/EUS values update.
- VPS availability: **not yet reported**; do not treat Earth Tracking as proof of VPS availability.
- Stable development signing fingerprint (Build #31, confirmed by Build #32 cache hit): `eb565d1f058175eeb0a5c0c4d7233d99bade6867`.
- Product UI: approved camera-first web shell with Camera / Place / Create / Publish. Current Android screen is still diagnostic, not the finished product UI.

## Build and signing design
The CI workflow caches `android/debug.keystore` under the fixed key `monument-android-debug-signing-v2`. Gradle's debug signing config explicitly uses this file. Build #31 seeded the cache; Build #32 confirmed the same signer SHA-1. Do not register SHA-1 values from earlier ephemeral builds.

## Geospatial diagnostic fields
See [GEOSPATIAL_DIAGNOSTICS.md](../docs/GEOSPATIAL_DIAGNOSTICS.md) for the complete field reference.
- WGS84: global geodetic reference.
- EUS: East-Up-South local orientation frame.
- Ellipsoid: altitude relative to the WGS84 ellipsoid, not ground height.
- H / V: horizontal / vertical position accuracy estimates, in metres.
- Yaw: current code displays `orientationYawAccuracy` in degrees (uncertainty), not actual heading.

## Product implementation boundary
- Native ARCore owns camera, session and tracking.
- Transparent WebView compositor and versioned native JS bridge are still outstanding (Issue #21).
- Native-hosted mode must not start a competing browser `getUserMedia()` camera session.
- Preserve the approved web UI and its four actions; do not replace it with a native-only redesign.

## Next steps
1. Record the exact VPS availability enum from the device separately from Earth Tracking.
2. Implement the transparent WebView compositor and versioned native bridge.
3. Forward typed geospatial pose and tracking events to the web UI; keep heading and yaw accuracy distinct.
4. Build and physically validate the real Camera / Place / Create / Publish experience on the A32.
5. Only then proceed to world-anchored surfaces and terrain/contour rendering.
