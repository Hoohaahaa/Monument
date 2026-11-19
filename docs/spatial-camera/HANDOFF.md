# Monument — Handoff for the next chat

Last updated: 2026-11-19

## New integration work completed

- Added `engine/moment-model.js`: canonical schema for point, framed surface, column, sky surface and trajectory; indoor/outdoor placement; explicit altitude datum; content/media; visibility; separate release schedule and trajectory clock; geodesic trajectory interpolation; indoor-local/WGS84 conversion; legacy-work migration.
- Added `tests/moment-model.test.cjs`: 10 tests. Executed in a Node 22 Vercel sandbox; 10 passed, 0 failed.
- Added `docs/spatial-camera/FEATURE_RECOVERY_MATRIX.md` to distinguish recovered, modeled, integrated and verified capabilities.
- The model is not yet connected to the camera-first UI, map, XR renderer or server registry. No deployment has been created.
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
