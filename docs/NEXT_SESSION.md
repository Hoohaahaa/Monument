# Monument — Next Session

## Current state · 2026-11-20
- Device: Samsung Galaxy A32 4G · SM-A325F.
- Camera runtime: **PASS** — live while moving/rotating; STOP/restart works.
- Geospatial authorization: **PASS** — user created the Android OAuth client in Google Cloud using package `dev.monomatter.monument` and the stable CI signing SHA-1.
- Physical Geospatial test: **PASS** — user confirms Earth Tracking is `TRACKING` and WGS84/EUS diagnostic values are updating on the A32.
- VPS: **NOT YET CONFIRMED** — no user-reported VPS availability result yet; do not infer VPS coverage from Earth Tracking.
- Diagnostic field meanings are recorded in [GEOSPATIAL_DIAGNOSTICS.md](GEOSPATIAL_DIAGNOSTICS.md). Important: displayed `Yaw` is yaw accuracy (uncertainty), not the actual heading angle.
- Current Android app remains v0.2.1 diagnostic camera/Geospatial groundwork. The approved product UI is still the web shell: Camera / Place / Create / Publish.
- Native ARCore camera and Geospatial tracking work on the physical device. Transparent WebView compositor and the versioned native JS bridge are still outstanding (Issue #21).

## Next implementation sequence
1. **Preserve the accepted baseline** — do not repeat camera, precise-location, OAuth, or Earth Tracking setup unless a regression appears.
2. **VPS observation** — capture the exact result returned by `checkVpsAvailabilityAsync`; treat it separately from Earth tracking.
3. **Native bridge contract** — expose tracking state, Earth state, latitude/longitude, ellipsoid altitude, horizontal/vertical accuracy, actual orientation/yaw, yaw accuracy, VPS state, and runtime errors as typed/versioned events.
4. **Transparent compositor** — put the existing approved web UI in a transparent Android WebView above the native ARCore camera; ensure the browser camera path is bypassed in native-hosted mode.
5. **Physical acceptance** — validate rotation, resize, lifecycle, all four actions (Camera / Place / Create / Publish), and no duplicate camera session on the A32.
6. **Spatial renderer** — only after the compositor and bridge are stable, begin world-anchored content and terrain/contour overlays.

## Guardrails
- Preserve the approved camera-first UI and existing authoring flows.
- Do not replace the product UI with the temporary native diagnostic controls.
- Do not claim VPS availability, world-locked surfaces, or anchors until separately validated on-device.
- Keep Earth pose, camera pose, heading, and accuracy values semantically distinct.
- Do not change production Vercel aliases without explicit approval.
