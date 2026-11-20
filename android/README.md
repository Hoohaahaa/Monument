# Monument Android build and test notes

## Current build state — 2026-11-20
- Package: `dev.monomatter.monument`
- Current app version: `0.2.1` (versionCode 3)
- Build #29 succeeded but its signing key was not persisted; do not use its SHA-1 for OAuth.
- Build #30 failed because it used the older workflow revision and could not find `android/debug.keystore`.
- Build #31 succeeded with the explicit development keystore creation step.
- Build #31 signer SHA-1: `eb565d1f058175eeb0a5c0c4d7233d99bade6867`.
- Build #31 artifact: `monument-camera-passthrough-debug` (artifact ID 14617565324).
- A subsequent build must show a cache hit and exactly the same SHA-1 before OAuth registration.
- Never register SHA-1 from builds #25–#30.

## Build and signing design
The CI workflow caches `android/debug.keystore` under the fixed key `monument-android-debug-signing-v2`. Gradle's debug signing config explicitly uses this file. If the cache is empty, CI generates a development-only keystore and the successful job should save it for the next run.

## Google Cloud authorization
- ARCore API is already enabled in Cloud project `monument-515308`.
- OAuth Android client is not yet created.
- Required package: `dev.monomatter.monument`.
- Required SHA-1: only the stable fingerprint confirmed by two sequential CI builds.
- Use OAuth 2.0 client ID, Android application type. Do not create an API key for this Keyless flow.

## Physical device state
- Device: Samsung Galaxy A32 4G (SM-A325F).
- Native ARCore camera passthrough test passed; do not repeat.
- Precise location permission is already enabled.
- Previous Geospatial result: Earth Tracking PAUSED, VPS ERROR_NOT_AUTHORIZED.
- After OAuth creation and APK install, retest for Earth Tracking TRACKING and valid global pose.

## Product implementation boundary
- Existing approved web shell remains the target UI: Camera / Place / Create / Publish.
- Native ARCore owns camera, session and tracking.
- Transparent WebView compositor and versioned native JS bridge are still outstanding (Issue #21).
- Current APK is diagnostic camera/Geospatial groundwork, not yet the finished Monument UI.

## Next steps
1. Confirm stable signing cache with another successful build.
2. Provide user a step-by-step Google Cloud OAuth Android client guide using the confirmed SHA-1.
3. Build and provide APK; user installs on A32.
4. Verify Earth Tracking and VPS.
5. Implement transparent WebView compositor and connect the approved UI.
