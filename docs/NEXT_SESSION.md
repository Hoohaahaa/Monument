# Monument — Next Session

## Current state · 2026-11-20
- Device: Samsung Galaxy A32 4G · SM-A325F.
- Camera runtime: **PASS** — live while moving/rotating; STOP/restart works.
- Geospatial diagnostic APK: Build #20 passed; device reports Earth Tracking PAUSED and ERROR_NOT_AUTHORIZED.
- User confirms Location permission + Use precise location are enabled.
- Product UI: approved camera-first web shell; Camera / Place / Create / Publish.
- Native three-button screen: diagnostic only; do not polish as product UI.

## Short execution path
1. **v0.2.0 camera → PASS** — physical A32 camera, movement/rotation, STOP/restart.
2. **Geospatial diagnostics → BUILT** — Build #20, artifact 14612905251.
3. **Device test → BLOCKED** — Earth Tracking PAUSED; Earth State / VPS reports ERROR_NOT_AUTHORIZED; precise location is confirmed enabled.
4. **Root cause direction → Cloud authorization** — Google documents EarthState.ERROR_NOT_AUTHORIZED for disabled ARCore API, invalid API key, or missing/mismatched keyless OAuth package + signing SHA-1. play-services-auth was absent from app dependencies.
5. **App-side fix → COMMITTED** — add play-services-auth; build and inspect the exact APK signing certificate.
6. **Cloud-side setup → REQUIRED** — enable ARCore API and register OAuth Android client for package dev.monomatter.monument + SHA-1 of exact APK signer. Keyless is preferred; API key is optional.
7. **Then → retest Geospatial** — Earth State should become ENABLED; Earth Tracking must reach TRACKING; only then accept WGS84 pose.
8. **Then → UI compositor** — Issue #21: transparent WebView over native camera + versioned bridge.
9. **Then → spatial renderer** — first-person terrain, contours, labels, world-anchored Surfaces.

## Evidence and boundaries
- Build #20: [GitHub Actions](https://github.com/Hoohaahaa/Monument/actions/runs/44699746664), commit 442d057e23a12b2d2663c4ebb0656774b785a61f.
- Authorization diagnosis: [ARCore authorization troubleshooting](https://developers.google.com/ar/develop/authorization/troubleshooting?platform=android).
- ERROR_NOT_AUTHORIZED is an authorization failure, not evidence of missing VPS coverage.
- Missing manifest API key alone is not a bug: Google prefers Keyless auth; its OAuth client must match package + signing SHA-1.
- Earth pose is invalid until Earth.trackingState == TRACKING.
- No Geospatial pose, VPS coverage, Depth, anchors or terrain rendering are accepted yet.

## Guardrails
- Do not ask the user to repeat the already-passed camera test or precise-location permission check.
- Preserve the existing web UI and four actions; no native-only redesign.
- Do not change production Vercel aliases without explicit approval.
- Keep docs concise and update the problem → cause → fix → result → next path.
