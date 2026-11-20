# Monument — Next Session Checklist

> Read this file together with docs/PROJECT_STATE_AND_HANDOFF.md, docs/DECISIONS.md, and GitHub Issue #20 before making changes. This checklist is the compact entry point for a fresh chat.

## Current truth (2026-11-20)

- Target device: Samsung Galaxy A32 4G, SM-A325F.
- Previous v0.1.0 probe was installed and launched by the user, but failed acceptance: no live camera appeared; Open Camera led into the web Editorial View flow.
- The failure is documented in the handoff and Issue #20. Do not ask the user to repeat the old test or configure Editorial View / Publish.
- New v0.2.0 code adds a native camera-first activity and a GLES/ARCore camera background renderer.
- New code is committed to feature/android-arcore-geospatial-bridge.
- Verified camera-passthrough APK: run #10, ID 44698143221, SUCCESS; artifact ID 14611343158. This build contains the core native camera implementation and is ready for A32 testing.
- Follow-up run #12, ID 44698291433, includes only a clearer waiting-for-first-frame status message; it was still running at last check. It is not a blocker for testing the run #10 camera artifact.
- Intermediate run #6 failed with compile errors (exception import package and stale MainActivity JSONObject references); both were corrected in later commits. Do not distribute any artifact from those earlier runs.
- No v0.2.0 physical-device test has happened yet. Do not claim the camera works until the user confirms it.

## Immediate sequence

1. The run #10 APK is compiled and verified; use artifact ID 14611343158 / monument-camera-passthrough-debug for the first device test. Run #12 is a later diagnostic-text-only build and can be checked separately.
2. Inspect the source diff for lifecycle, rotation, texture binding, and Session.update() threading before changing more code.
3. User installs v0.2.0, taps OPEN CAMERA, and sends a screenshot / exact error. No Surface creation or Publish action is required.
4. If camera works: record the device acceptance result, then implement Geospatial capability/VPS diagnostics.
5. Only after pose and localization are validated: add the transparent WebView composition and feed camera pose into Monument's first-person terrain and Surface engine.

## Never do

- Do not send the old artifact 14610956314 again as a camera build.
- Do not claim build success equals camera runtime success.
- Do not ask the user to repeat device model or AR Services installation details already recorded.
- Do not start with Cesium terrain, VPS or Depth before live camera passthrough is proven.
- Do not change production aliases.
- Update the handoff, this checklist, decisions and Issue #20 after every meaningful test, failure or implementation.