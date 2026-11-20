# Monument — Next Session Checklist

> Read this file together with docs/PROJECT_STATE_AND_HANDOFF.md, docs/DECISIONS.md, and GitHub Issue #20 before making changes. This checklist is the compact entry point for a fresh chat.

## Current truth (2026-11-20)

- Target device: Samsung Galaxy A32 4G, SM-A325F.
- Previous v0.1.0 probe was installed and launched by the user, but failed acceptance: no live camera appeared; Open Camera led into the web Editorial View flow.
- The failure is documented in the handoff and Issue #20. Do not ask the user to repeat the old test or configure Editorial View / Publish.
- New v0.2.0 code adds a native camera-first activity and a GLES/ARCore camera background renderer.
- New code is committed to feature/android-arcore-geospatial-bridge.
- Latest CI run at the time this note was written: run #10, ID 44698143221, triggered by commit a16039a14d16ec0ec1c7547c8c5450978c58a4d3; check its current status before proceeding.
- No v0.2.0 physical-device test has happened yet. Do not claim the camera works until the user confirms it.

## Immediate sequence

1. Check latest branch head and Android workflow run. Inspect failed logs if CI failed.
2. Fix all compile errors and rerun CI. Do not send an APK until the workflow succeeds and the artifact exists.
3. Inspect the final source diff for lifecycle, rotation, texture binding, and session threading.
4. Provide the v0.2.0 APK with a clear statement that this is a camera-passthrough test only.
5. Ask the user to install the new build, tap OPEN CAMERA, and send a screenshot / exact error. They should not need to set up any Surface or publish content.
6. If camera works: record the device acceptance result, then implement Geospatial capability/VPS diagnostics.
7. Only after pose and localization are validated: add the transparent WebView composition and feed camera pose into Monument's first-person terrain and Surface engine.

## Never do

- Do not send the old artifact 14610956314 again as a camera build.
- Do not claim build success equals camera runtime success.
- Do not ask the user to repeat device model or AR Services installation details already recorded.
- Do not start with Cesium terrain, VPS or Depth before live camera passthrough is proven.
- Do not change production aliases.
- Update the handoff, this checklist, decisions and Issue #20 after every meaningful test, failure or implementation.