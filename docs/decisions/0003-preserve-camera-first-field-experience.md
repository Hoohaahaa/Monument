# Decision 0003 — Preserve the Camera-first Field Experience

**Date:** 2026-11-18  
**Status:** Accepted product constraint  
**Evidence:** User feedback and source inspection of `Hoohaahaa/Portfolio` branch `monument-studio-v1` (`index.html`, `app.js`, `field.js`, `style.css`, `xr.js`, `engine.html`).

## Non-negotiable experience architecture

1. **Camera-first field mode.** The live environment is the primary canvas, not a secondary preview panel.
2. **Permissions and session actions live at the bottom of the camera experience**, grouped and reachable by thumb. Do not move the primary camera/session action into a separate settings tab.
3. **Map owns geographic placement.** Location selection, movement, coordinates, and spatial anchor editing belong on the map. Do not bury location selection in a content tab or a generic form section.
4. **Camera, map, and editor are coordinated views of one Moment.** Editing the map updates the projected field preview; the camera does not own location state.
5. **Content renderer is independent of camera permission.** Permission failure must produce a usable preview/fallback, not a blank product.
6. **Navigation and primary actions must remain stable between iterations.** Add capabilities inside the accepted information architecture; do not redesign the shell without an explicit user request.
7. **No sharp-corner UI.** Use rounded geometry, generous whitespace, clear grouping, and calm editorial hierarchy. Avoid rigid sharp-edged cards and dense control grids.
8. **Do not claim AR/world-locking from GPS + compass alone.** Label approximate directional projection honestly. True world-anchored placement requires AR tracking/geospatial anchors and calibration.

## Existing source to preserve

The richer source exists on Portfolio branch `monument-studio-v1` and has not been fully migrated into the independent Monument repository. In particular:
- `field.js` calculates geodesic apparent bearing, field-of-view position, apparent angular width, facing direction, range, and an approximate projected surface.
- `xr.js` contains a WebXR rendering path and anchor/session handling, with limitations that must be tested and documented.
- `index.html` and `app.js` provide the prior product shell and camera/field-test entry points.
- `engine.html` provides a separate map + live scene editor and geometry controls.

Do not replace these with a new standalone HTML mockup. Migrate the relevant source and its dependencies deliberately, preserving the existing interaction patterns and recent camera/content fixes.

## Current field-test regression

The current Vercel `monument-field-test` 0.2 page is a one-off inline implementation. It is not the prior full field experience:
- Map is demoted to a lower panel rather than being the geographic placement workspace.
- Main authoring actions are reorganized into tabs.
- Camera is optional but not the primary experience.
- Guidance is a generic bottom card; no field-of-view projection is computed.
- Content appears only within a local arrival threshold and is shown as a screen-space card.
- No geospatial or WebXR anchor is active.

This build is useful only as a limited visibility/GPS prototype and must not become the product's design baseline.

## Acceptance criteria

- Restore the camera-first shell and bottom permission/action group.
- Put location selection and spatial anchor editing on the map.
- Keep the map/editor and camera projection synchronized.
- Restore the existing field projection logic, test bearing/FOV/front-facing/range behavior, and expose sensor accuracy.
- Keep content preview visible when camera or sensors are denied.
- Add a clear distinction between approximate camera projection and true world-locked AR.
- Keep all new surfaces rounded with generous whitespace.
- Run regression tests against existing source before replacing any accepted interaction.
