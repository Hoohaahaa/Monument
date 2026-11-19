# Monument — Handoff for the next chat

Last updated: 2026-11-19


## 2026-11-19 usability repair pass

- Fixed a broken first-run interaction: the page no longer requests camera permission automatically during load. Camera permission is requested only after the user taps **Open Camera**, avoiding a browser-blocked autoplay/permission path.
- Fixed the persistent **Publish** action: it now opens the release-review sheet and asks the user to confirm with the in-sheet Publish control; it no longer calls publish immediately while opening the editor.
- Added a content gate: a Moment with no text, image or audio cannot create a visitor link even if its spatial model validates.
- Added `tests/app-shell-contract.test.cjs` to guard these entry-point behaviors.
- Removed the draggable screen-fixed rectangle from the non-WebXR fallback. When WebXR is unavailable, the fallback now shows the live camera only and explicitly says world-locked AR is unavailable; it no longer presents a movable screen overlay as spatial content.
- Added `tests/xr-fallback-contract.test.cjs` to prevent reintroducing that misleading fallback.
- This improves honesty and interaction safety, but does not make geographic AR available on unsupported devices. A real persistent geospatial anchor still requires a supported geospatial AR/VPS implementation and device testing.

- These are source-level fixes only so far. They have not yet been deployed or verified in a real mobile browser. WebXR remains session-local and is not geographically aligned; server publishing, persistent anchors, and Point/Column/Trajectory XR rendering remain incomplete.

## New integration work completed

- Added `engine/moment-model.js`: canonical schema for point, framed surface, column, sky surface and trajectory; indoor/outdoor placement; explicit altitude datum; content/media; visibility; separate release schedule and trajectory clock; geodesic trajectory interpolation; indoor-local/WGS84 conversion; legacy-work migration.
- Added `tests/moment-model.test.cjs`: 10 tests. Executed in a Node 22 Vercel sandbox; 10 passed, 0 failed.
- Added `docs/spatial-camera/FEATURE_RECOVERY_MATRIX.md` to distinguish recovered, modeled, integrated and verified capabilities.
- Wired the model into a new root `index.html` derived from the immutable approved camera-first shell and `app.js`. The four persistent actions remain Camera / Place / Create / Publish.
- Create now exposes Point, Framed Surface, Column, Sky Surface and Trajectory; Outdoor/Indoor coordinates; width/height/diameter, frame, facing and heading; sky elevation/orientation; trajectory start/duration/loop/waypoints; text/image/audio/alt text; audience/range/visibility window.
- Place now supports map tap, draggable anchor, surface footprint, draggable heading handle, trajectory polyline, locate-me, fit-to-work and map expand.
- Local draft persistence and read-only visitor links are implemented. Publish remains explicitly a share-link prototype, not a global public registry or server-side revision system.
- `npm test`: 23 passed, 0 failed. `node --check app.js` and static checks for shell controls and module load order passed in a Node 22 sandbox.
- The accepted V18 WebXR renderer is now connected through `engine/xr-adapter.js` + `engine/xr-v18.js` for framed and sky surfaces. Text and image textures render. The anchor remains session-local; it is not geographically aligned to the map pin or persistent across sessions. Point, column and trajectory XR rendering remain pending. The non-XR fallback is a draggable camera composite and is explicitly not world-anchored.
- Standard `npm test`: 26 passed, 0 failed. Syntax checks for app/XR modules and static shell contract/module-order checks passed in a Node 22 sandbox.
- Physical Android camera/GPS/compass/WebXR QA and browser E2E remain pending.
- Current manual-test preview: `dpl_9WPSF9YoDbyDtPR4PjfQ5m28LyfJ`, URL `https://monument-field-test-2bqe9gsxj-mos-projects-efbc27a5.vercel.app/`. Vercel reports `READY`; root page, app.js, Moment model, XR adapter and XR renderer all returned HTTP 200. This deployment has no aliases; production domains/aliases were not changed. The earlier preview `dpl_G8SRasBKwTxSN9DC6uzpnbKc7eto` is superseded.
Current task: restore the advanced spatial capabilities into the user's approved camera-first Monument shell.

## Do not make the user repeat these decisions

The user is frustrated by repeated partial rebuilds, broken previews and multiple untested Vercel deployments. Do not ask them to re-explain the UI or feature requirements.

### The UI that must remain
- Exact recovered baseline: `recovery/monument-spatial-camera-v0.1.html`
- Header wordmark: `◇♧♡■■■■■`
- One-page camera-first experience.
- Bottom actions/navigation: Camera / Place / Create / Publish.
- Camera remains the main stage.
- Place opens the map in the same page and must support full-screen map mode.
- Create opens a bottom sheet.
- Do not transplant the separate Spatial Lab split-screen layout.
- Do not hide or remove any of the four bottom actions.
- Do not make the fixed bottom content card pretend to be spatially anchored.

### Required user-visible capabilities
- Create a Moment with text AND image/media.
- Choose a real map location; GPS locate-me must work and be optional.
- Map must render, pan/zoom, full-screen, support tapping/dragging the anchor.
- Edit width × height, facing direction/heading, altitude/vertical reference, visibility/range and spatial stratum.
- Place large surfaces and sky works; support dimensions and heights well beyond human scale, with validated technical limits.
- Preview footprint/orientation/trajectory on the same map.
- Save a local draft, restore it, publish a stable share link, and open that link as a visitor.
- Distinguish local save, share link, and global/public registry.
- Scheduled availability and actual movement along a timed trajectory are different features.
- Sky trajectory request: user described an object/path travelling overhead at a specified time (e.g. passing above after about one minute). Recover the exact earlier implementation before recreating it.
- In camera/AR, a spatial surface should not be glued to the bottom of the screen. Preserve a stable renderer-space anchor; minimize latency without hiding tracking uncertainty.

## Source recovery completed

### Correct shell
The exact camera-first UI is archived in this branch at `recovery/monument-spatial-camera-v0.1.html`. It came from immutable Vercel deployment `dpl_BuMGjHkxikoY1kNnW4nH7FH86rpq` (project `monument-field-test`). The original deployment remains unchanged.

### Advanced engine sources preserved on this branch
Copied from Portfolio sources into `engine/recovered/`:
- `engine-core.js` — geodesic geometry, footprint, approximate camera projection, validation, local store and undo/redo.
- `spatial.js` — geodesic distance/bearing, destination, altitude-aware apparent elevation, curvature drop, width angle, facing/horizon/range.
- `xr.js` — WebXR/WebGL renderer.
- `baseline/xr-v18.js` — accepted V18 local Sky geometry baseline.
- `geometry.cjs` and `tests/geometry.test.cjs` — pure geometry and unit tests.

Canonical source references:
- `Hoohaahaa/Portfolio`, branch `monument-studio-v1`: Spatial Lab engine and `engine-core.js`.
- `Hoohaahaa/Portfolio`, branch `monument/main`: current spatial publishing app, `spatial.js`, `xr.js`, V18 baseline, tests, content/publish/schedule logic.
- `Hoohaahaa/Monument`, branch `main`: product architecture, Place/World model and globe/map projection docs.

### Critical technical distinctions
- The V18 WebXR implementation captures an anchor once from the viewer pose and renders it against subsequent tracked poses. This is why it is more stable than a screen-fixed card.
- That anchor is session-local, not a persistent geographic/cloud anchor.
- The WebXR sky plane is oriented for reading from below.
- The V18 implementation alone does not prove timed geospatial travel overhead.
- `monument/main` supports scheduled `startsAt` / `endsAt` availability; that is not trajectory playback.
- The `monument-spatial-22` READY deployment includes a complete source tree, API, registry, geometry, tests, and V18 baseline. Its README states the accepted V18 Sky geometry is retained.
- Vercel one-file projects `monument-sky-composer`, `monument-sky-presence`, and `monument-world-20` are additional leads for the user's timed sky/trajectory feature. Their full source still needs inspection; do not guess which one contains the feature.

## Current GitHub state
- Working branch: `restore-spatial-engine-integration-audit`
- Base: `recover-spatial-camera-baseline`
- Audit: `docs/spatial-camera/INTEGRATION_RECOVERY_AUDIT.md`
- Recovered engine modules: `engine/recovered/**`
- No production source, aliases, deployment or database changed.
- No new Vercel deployment was created during this recovery/audit.

## Work still required (do not claim complete)
1. Inspect the full source of `monument-sky-composer`, `monument-sky-presence`, and `monument-world-20`; locate the exact time-based sky trajectory implementation the user remembers.
2. Compare that implementation with the V18 WebXR anchor renderer and `monument/main` spatial model.
3. Define one Moment schema that supports point/surface/path/sky geometry, WGS84 anchor, explicit vertical datum, dimensions, heading, trajectory waypoints, start time, duration, visibility, media and revisions.
4. Integrate modules behind the existing camera-first shell. Do not copy the Spatial Lab HTML/CSS.
5. Wire the actual four actions: Camera, Place, Create, Publish. Add the full-screen Leaflet map and all geometry/trajectory controls inside existing modes/sheets.
6. Implement image preview/loading/error handling and persistence in drafts/published snapshots.
7. Keep renderer adapters separate: approximate browser GPS/compass projection vs session-local WebXR vs future persistent ARCore/ARKit Geospatial/VPS.
8. Add unit tests for geodesy, footprint, dimensions, heading, FOV, altitude/datum, curvature, horizon, range, trajectory interpolation and schedule boundaries.
9. Add mobile browser E2E at 390×844 and desktop: all navigation, map, full-screen, camera success/denial, location success/denial, create, image, save/reload, publish/share, visitor view, schedule and XR fallback.
10. Run tests before any deployment. Deploy exactly one preview only after gates pass. Never alter Production aliases without explicit approval.

## Release policy
No speculative or repeated Vercel deployments. A branch or commit is not a verified preview. A READY deployment is not proof that the mobile UI works. Unit tests are not physical-device tests. Report each status separately and honestly.

## Open implementation tasks created

- [#9 — Block release on real mobile browser QA](https://github.com/Hoohaahaa/Monument/issues/9): no supported Chromium binary is available in the current QA sandbox, so mobile E2E remains unverified.
- [#10 — Implement real spatial rendering for Point, Column and timed Trajectory](https://github.com/Hoohaahaa/Monument/issues/10): current WebXR adapter only supports framed/sky surfaces; trajectory playback is not rendered.
- [#11 — Replace share-link prototype with server-backed publication and revisions](https://github.com/Hoohaahaa/Monument/issues/11): localStorage drafts and URL-hash visitor links are not durable server publication.

## Verification after usability repairs

- `npm test`: 34 passed, 0 failed in the Node 22 sandbox.
- `node --check app.js` and `node --check engine/xr-v18.js`: passed.
- Browser E2E was attempted but not run: the installed Playwright version reports Chromium unsupported on this Ubuntu 26.04 sandbox image. No new preview has been deployed from these changes.

## XR geometry control repair

- The XR adapter now passes the selected sky orientation, face visibility and frame toggle to the renderer.
- The renderer now distinguishes horizontal overhead sky planes from vertical sky panels, selects front/back/both mesh faces, and applies the frame toggle in the fragment shader.
- Added adapter and renderer contract tests. Latest suite: 38 passed, 0 failed; syntax checks for the XR adapter and renderer passed.
- Important: this is still session-local WebXR placement. The selected geographic map heading is not used as a true-north AR heading, and sky elevation is not a persistent geospatial altitude.


## 2026-11-19 Point / Column XR implementation pass

- The XR adapter now accepts `point` and `column` in addition to framed and sky surfaces. Timed `trajectory` remains explicitly unsupported by the current renderer.
- Point renders as a 3D pin marker (stem + rounded head), using the Moment diameter/height fields.
- Column renders as a vertical cylinder using diameter and height, rather than being flattened into the panel quad.
- Point/Column use a visible solid material pass; panel/sky surfaces retain their existing textured plane path, face selection and frame toggle.
- Added adapter and renderer contract assertions for the new geometry mapping and mesh paths.
- **Verification limitation:** GitHub source writes completed, but this environment could not clone the repository (DNS/network unavailable). The new tests and JavaScript syntax checks have therefore **not been executed**. The prior 38-pass result applies to the previous commit, not this Point/Column batch.
- No Vercel deployment was created. No production alias was changed. Do not manually test the previous preview as if it contained this batch.
- Remaining in issue #10: timed trajectory playback, pause/resume/loop and geospatially aligned motion. These are not implemented by this change.


## CI follow-up

- Added `.github/workflows/monument-tests.yml` to run `npm test` and Node syntax checks on pushes to this working branch and relevant pull requests.
- GitHub currently returns no commit status checks for the workflow commit. Treat CI as configured but **not yet confirmed running or passing**.
