# Monument — Next Session

## Current state · 2026-11-20
- Device: Samsung Galaxy A32 4G · SM-A325F.
- Camera runtime: **PASS** — live while moving/rotating; STOP/restart works.
- Geospatial device test: Earth Tracking PAUSED + ERROR_NOT_AUTHORIZED; user confirms Location + Precise Location enabled.
- App-side fix: play-services-auth 21.3.0 added for ARCore Keyless authorization.
- APK v0.2.1: Build #25 succeeded; APK verified (4,191,920 bytes). SHA-256: 782d3d4f52be86a94ed6dfa65c1ba5f26b54a779ad12d7c3fbcdb159f3676b44.
- Build #25 signing SHA-1: d0579bf2632ffe7fbe7cd019765a02dadc4510ff. **Do not register this one**; it was signed before stable CI key caching was added.
- CI now caches ~/.android/debug.keystore to preserve a stable development signing fingerprint. Build #27 is seeding this cache; next build after cache seed must confirm the stable SHA-1.
- Product UI: approved camera-first web shell; Camera / Place / Create / Publish.
- Native three-button screen: diagnostic only; do not polish as product UI.

## Short execution path
1. **v0.2.0 camera → PASS** — physical A32 camera, movement/rotation, STOP/restart.
2. **Geospatial diagnostics → BUILT** — Build #20, artifact 14612905251.
3. **Device test → BLOCKED** — Earth Tracking PAUSED; Earth State / VPS reports ERROR_NOT_AUTHORIZED; precise location confirmed enabled.
4. **App-side fix → COMMITTED** — play-services-auth added; APK v0.2.1 Build #25 compiles and contains Google auth classes.
5. **Signing stability → IN PROGRESS** — CI cache preserves development debug keystore; verify SHA-1 on a subsequent cache-hit build before Google Cloud registration.
6. **Cloud-side setup → REQUIRED** — create Google Cloud project, enable ARCore API, register Android OAuth client for package dev.monomatter.monument + stable APK signing SHA-1. Keyless is preferred; API key is optional.
7. **Then → retest Geospatial** — Earth State should become ENABLED; Earth Tracking must reach TRACKING; only then accept WGS84 pose.
8. **Then → UI compositor** — Issue #21: transparent WebView over native camera + versioned bridge.
9. **Then → spatial renderer** — first-person terrain, contours, labels, world-anchored Surfaces.

## Evidence and boundaries
- Build #20: [GitHub Actions](https://github.com/Hoohaahaa/Monument/actions/runs/44699746664), commit 442d057e23a12b2d2663c4ebb0656774b785a61f.
- Build #25: [GitHub Actions](https://github.com/Hoohaahaa/Monument/actions/runs/44701420055), commit 4f593806a3836781cc382c918d37f4f8cda88a63.
- Stable signing/cache build #27: [GitHub Actions](https://github.com/Hoohaahaa/Monument/actions/runs/44701738356).
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
