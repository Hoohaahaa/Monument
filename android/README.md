# Monument Android Runtime

## Status · 2026-11-20
- **Camera passthrough:** DEVICE PASS on Samsung Galaxy A32 4G (SM-A325F); movement/rotation and STOP/restart work.
- **Geospatial:** device reports Earth Tracking PAUSED + ERROR_NOT_AUTHORIZED; precise location confirmed enabled.
- **App-side authorization fix:** play-services-auth added for ARCore Keyless authorization.
- **Build #25:** v0.2.1 APK compiled successfully; artifact includes signing certificate SHA-1. APK SHA-256: 782d3d4f52be86a94ed6dfa65c1ba5f26b54a779ad12d7c3fbcdb159f3676b44.
- **Build #25 signing SHA-1:** d0579bf2632ffe7fbe7cd019765a02dadc4510ff. This is the first-run CI debug signer and is superseded by the stable cached signer build.
- **Signing stability:** workflow now caches ~/.android/debug.keystore under monument-android-debug-signing-v1; next successful build seeds a stable development certificate for subsequent CI builds.
- **Product UI:** approved camera-first web shell; Camera / Place / Create / Publish.
- **Native three-button screen:** diagnostic only.

## Short path
1. **Camera v0.2.0 — PASS:** native ARCore + GLES external OES.
2. **Geospatial diagnostics — BUILT:** consent, runtime support check, Earth state, WGS84 pose, VPS callback.
3. **Device test — BLOCKED:** ERROR_NOT_AUTHORIZED; precise location is not the cause.
4. **App fix — COMMITTED:** include play-services-auth for keyless ARCore authorization.
5. **CI signing — IN PROGRESS:** preserve the development debug certificate across runs; use the SHA-1 from the first successful cached-signer build.
6. **Cloud setup — REQUIRED:** enable ARCore API; create Android OAuth client for package dev.monomatter.monument and SHA-1 of the stable APK signing certificate.
7. **Retest:** Earth State ENABLED, Earth Tracking TRACKING, valid pose/accuracy, then VPS result.
8. **Next product milestone:** transparent WebView compositor + versioned native bridge (Issue #21).
9. **Later:** first-person terrain, contours, labels and world-anchored Surfaces.

## Authorization notes
- Google prefers Keyless authorization; an API key is optional.
- Keyless authorization requires the play-services-auth library and an OAuth 2.0 Android client matching the app package name and signing-certificate SHA-1.
- ERROR_NOT_AUTHORIZED may mean ARCore API is disabled in the wrong/no Cloud project, or the OAuth package/SHA-1 does not match. It does not prove VPS is unavailable.
- Do not read cameraGeospatialPose until Earth Tracking is TRACKING.
- Build success is compile evidence, not physical-device acceptance.
- CI development key is for test APKs only; never reuse it for production/Play signing.

## Guardrails
- Do not repeat the passed camera test or precise-location permission check.
- Preserve the approved web UI and four actions; do not promote the diagnostic shell.
- Never change production Vercel aliases without explicit approval.

## CI signing cache verification
- Two completed builds (#27 and #28) produced different debug signing SHA-1 fingerprints; neither fingerprint is approved for OAuth registration.
- A follow-up build is required after the cache has settled. Compare its certificate SHA-1 with the preceding build before treating the cache as stable.
