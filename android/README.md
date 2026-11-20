# Monument Android Runtime

## Status · 2026-11-20
- **Camera passthrough:** DEVICE PASS on Samsung Galaxy A32 4G (SM-A325F); movement/rotation and STOP/restart work.
- **Geospatial:** device reports Earth Tracking PAUSED + ERROR_NOT_AUTHORIZED; precise location confirmed enabled.
- **App-side authorization fix:** play-services-auth added for ARCore Keyless authorization; build/device verification pending.
- **Product UI:** approved camera-first web shell; Camera / Place / Create / Publish.
- **Native three-button screen:** diagnostic only.

## Short path
1. **Camera v0.2.0 — PASS:** native ARCore + GLES external OES.
2. **Geospatial diagnostics — BUILT:** consent, runtime support check, Earth state, WGS84 pose, VPS callback.
3. **Device test — BLOCKED:** ERROR_NOT_AUTHORIZED; precise location is not the cause.
4. **App fix — COMMITTED:** include play-services-auth for keyless ARCore authorization.
5. **Cloud setup — REQUIRED:** enable ARCore API; create Android OAuth client for package dev.monomatter.monument and SHA-1 of the exact APK signing certificate.
6. **Retest:** Earth State ENABLED, Earth Tracking TRACKING, valid pose/accuracy, then VPS result.
7. **Next product milestone:** transparent WebView compositor + versioned native bridge (Issue #21).
8. **Later:** first-person terrain, contours, labels and world-anchored Surfaces.

## Authorization notes
- Google prefers Keyless authorization; an API key is optional.
- Keyless authorization requires the play-services-auth library and an OAuth 2.0 Android client matching the app package name and signing-certificate SHA-1.
- ERROR_NOT_AUTHORIZED may mean ARCore API is disabled in the wrong/no Cloud project, or the OAuth package/SHA-1 does not match. It does not prove VPS is unavailable.
- Do not read cameraGeospatialPose until Earth Tracking is TRACKING.
- Build success is compile evidence, not physical-device acceptance.

## Guardrails
- Do not repeat the passed camera test or precise-location permission check.
- Preserve the approved web UI and four actions; do not promote the diagnostic shell.
- Never change production Vercel aliases without explicit approval.
