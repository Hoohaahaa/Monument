# Monument — Next Session Checklist

> Read this file together with docs/PROJECT_STATE_AND_HANDOFF.md, docs/DECISIONS.md, and GitHub Issue #20 before making changes. This checklist is the compact entry point for a fresh chat.

## Current truth (2026-11-20, updated after device feedback)

- Target device: Samsung Galaxy A32 4G, SM-A325F.
- Previous v0.1.0 probe was installed and launched by the user, but failed acceptance: no live camera appeared; Open Camera led into the web Editorial View flow.
- The failure is documented in the handoff and Issue #20. Do not ask the user to repeat the old test or configure Editorial View / Publish.
- New v0.2.0 code adds a native camera-first activity and a GLES/ARCore camera background renderer.
- New code is committed to feature/android-arcore-geospatial-bridge.
- Verified camera-passthrough APK: run #10, ID 44698143221, SUCCESS; artifact ID 14611343158. This build contains the core native camera implementation and is ready for A32 testing.
- Follow-up run #12 (44698291433) succeeded. New Geospatial diagnostic implementation is committed; CI runs #15 (44699268900) and #16 (44699272579) were started for the initial implementation and are being checked. A final import correction was pushed after those runs.
- Intermediate run #6 failed with compile errors (exception import package and stale MainActivity JSONObject references); both were corrected in later commits. Do not distribute any artifact from those earlier runs.
- Physical-device feedback: user confirms live camera remains smooth while moving/rotating the Samsung Galaxy A32 4G, and STOP / restart works. Camera runtime acceptance is passed. Geospatial/VPS and Depth remain untested.

## Immediate sequence

1. The run #10 APK is compiled and verified; use artifact ID 14611343158 / monument-camera-passthrough-debug for the first device test. Run #12 is a later diagnostic-text-only build and can be checked separately.
2. Inspect the source diff for lifecycle, rotation, texture binding, and Session.update() threading before changing more code.
3. Camera launch, smooth movement/rotation, and STOP/restart are user-confirmed on the physical SM-A325F. Do not ask the user to repeat these checks.
4. Current branch adds a privacy disclosure, precise-location permission flow, runtime Geospatial support check, WGS84 camera pose accuracy readout, and async VPS availability result. Verify the latest CI run before distributing the APK.
5. On device, record whether Geospatial mode configures, Earth reaches TRACKING, the pose accuracies, and the VPS result. If VPS reports NOT_AUTHORIZED, configure the ARCore Cloud API project/app authorization; do not mislabel this as no coverage.
6. Transparent camera compositor and restoration of the approved UI are tracked in [Issue #21](https://github.com/Hoohaahaa/Monument/issues/21). Preserve Camera / Place / Create / Publish. The current native buttons/status panel are temporary diagnostics, not product design.
7. Then feed pose into first-person Earth/terrain and Surface engine; evaluate multi-resolution terrain/contours.
8. CI run #17 (44699284248) first failed during Gradle dependency resolution with many unrelated artifacts unavailable from configured repositories; this looked like a transient repository/network resolution failure, not a Kotlin compile diagnostic. Failed job was re-run as attempt 2. Check latest status before sharing any APK.

## Never do

- Do not send the old artifact 14610956314 again as a camera build.
- Do not claim build success equals camera runtime success.
- Do not ask the user to repeat device model or AR Services installation details already recorded.
- Do not claim Geospatial/VPS/Depth until physical-device runtime results are recorded.
- Do not treat the temporary native diagnostic controls as the final Monument interface; preserve the approved camera-first web shell and four actions.
- Do not change production aliases.
- Update the handoff, this checklist, decisions and Issue #20 after every meaningful test, failure or implementation.