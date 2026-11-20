# Monument — Next Session

## Current state · 2026-11-20
- Device: Samsung Galaxy A32 4G · SM-A325F.
- Camera runtime: **PASS** — live while moving/rotating; STOP/restart works (user-confirmed).
- Geospatial diagnostic source: **BUILT** — CI run #20 passed; APK artifact verified.
- Geospatial / Earth tracking / VPS / Depth on device: **NOT TESTED**.
- Product UI: approved camera-first web shell; actions **Camera / Place / Create / Publish**.
- Native three-button screen: diagnostic only; do not polish or treat as product UI.
- Current branch: `feature/android-arcore-geospatial-bridge`.

## Latest output
- Build: [GitHub Actions #20](https://github.com/Hoohaahaa/Monument/actions/runs/44699746664) · SUCCESS.
- Commit: `442d057e23a12b2d2663c4ebb0656774b785a61f`.
- Artifact: `monument-camera-passthrough-debug` · ID `14612905251` · ZIP size 3,197,340 bytes; contains `app-debug.apk` (3,938,005 bytes).
- APK: `/mnt/data/monument-geospatial-run20/app-debug.apk` (ChatGPT session path; share link only from the session where verified).
- Fix: `Session.earth` is nullable (`Earth?`). Added null-safe handling; no longer assigns it to non-null `Earth`.

## Short path log
1. **v0.1.0 · WebView probe → FAIL** — editor opened; no native camera.
2. **v0.2.0 · Native ARCore camera → PASS** — live feed, movement/rotation, STOP/restart.
3. **Geospatial diagnostics → CODED** — consent, location permissions, runtime support check, Earth state, WGS84 pose/accuracy, async VPS.
4. **Build #15–#19 → FAIL** — Kotlin nullability error at `CameraBackgroundRenderer.kt:139`.
5. **Fix #442d057 → PASS** — null-safe `Session.earth`.
6. **Build #20 → PASS** — APK artifact `14612905251`.
7. **Next → DEVICE GEO TEST** — check Geospatial config, Earth TRACKING, pose accuracy, VPS response.
8. **Then → UI COMPOSITOR** — Issue [#21](https://github.com/Hoohaahaa/Monument/issues/21): transparent WebView over native camera + versioned bridge.
9. **Then → SPATIAL RENDERER** — first-person terrain, contours, labels, world-anchored Surfaces.

## Next device check
Install the newly built diagnostic APK. Accept the Geospatial privacy prompt and precise location permission. Record:
- Geospatial session enabled / unsupported / failed.
- Earth state: TRACKING / PAUSED / STOPPED.
- WGS84 latitude/longitude and altitude.
- Horizontal / vertical / yaw accuracy.
- VPS: AVAILABLE / UNAVAILABLE / ERROR_NOT_AUTHORIZED / network error.

**Interpretation:** `ERROR_NOT_AUTHORIZED` means Cloud API app/project authorization needs configuration; it does not prove no VPS coverage.

## Guardrails
- Never repeat the already-passed camera test unless a regression is observed.
- Never claim Geospatial, VPS, Depth, anchors or terrain are verified before device evidence.
- Preserve the existing web UI and four actions; no native-only redesign.
- Do not change production Vercel aliases without explicit approval.
- Keep docs short: dated title + one-line path/status + blocker/next action.
