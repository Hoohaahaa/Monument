# Earth Mesh Web Prototype — 2026-11-19

## Product decisions confirmed
- Android-first, browser-first delivery. The user should open a secure Vercel URL in Chrome; no separate installation is required for this phase.
- Keep the camera-first Monument shell and the existing Camera / Place / Create / Publish actions.
- The target visual is a continuous Earth-to-local-terrain experience, with the viewer's selected WGS84 location marked on the model.
- Spatial surfaces remain multi-instance, georeferenced objects with editable latitude, longitude, altitude/datum, dimensions and heading. Existing Point, Column, Trajectory, Loop, Pause/Resume and WebXR work must be reused, not discarded.

## What this prototype adds
- A camera-stage Earth Mesh entry point.
- An interactive wireframe globe with WGS84-style latitude/longitude graticule and a selected-location marker.
- A local terrain mode that requests a public Terrarium elevation tile (zoom 12), samples it into a 128×128 grid and renders a height-displaced mesh with a wireframe overlay.
- Drag-to-rotate and wheel-to-zoom interaction.
- GPS and manual map coordinates are forwarded to the Earth viewer.
- The editorial placeholder card is hidden from the live camera stage.
- The Create sheet's Done action is now Apply: it saves the local browser draft before closing.

## Explicit limitations — do not overclaim
- This is a browser-rendered Earth/terrain model, not yet a camera-pose-registered AR mesh.
- The local mesh uses a public elevation tile and is a single-tile prototype. It is not a continuous globe-to-ground LOD system, does not yet stitch adjacent tiles, and has no surveyed accuracy guarantee.
- The current terrain mesh is model-space and manually orbitable. It does not yet remain locked to the camera's real-world pose as the phone moves.
- No true ARCore Geospatial/VPS anchor, camera depth, scene mesh or occlusion is implemented here.
- The public terrain endpoint can fail due to network/CORS/service availability; globe mode remains available as a fallback.
- Browser-only access is the chosen first delivery path. If the required tracking fidelity cannot be reached in browser APIs, add an Android runtime behind the same shared spatial schema later; do not force the user to install it for this prototype.

## Preserved earlier work
The implementation remains based on the existing branch lineage and retains:
- Leaflet map placement and manual coordinate selection.
- Moment geometry and vertical datum contracts.
- Point / Column / Trajectory model and authoring controls.
- WebXR session-local renderer, trajectory loop and pause/resume work.
- Geospatial camera compass HUD and nearby-place overlay.
- Existing one-page Camera / Place / Create / Publish shell.

## Paths considered but not selected now
1. Native Android app as the first delivery: deferred because the user explicitly prioritizes opening a link on the phone without installation.
2. Replacing the existing web shell with a separate globe application: rejected because it would discard working authoring, map and XR capabilities.
3. Presenting GPS/compass lines as a true terrain mesh: rejected because they are not elevation geometry and are not camera-pose locked.
4. Shipping a fake procedural terrain as real local geography: rejected; the prototype requests elevation data and reports failure instead of inventing topography.
5. Building persistent ARCore anchors and occlusion in the same pass: deferred until the Earth renderer and data/coordinate contract are independently testable.

## Next gates
1. Run the repository Node test suite and this contract test.
2. Confirm the Vercel Preview builds and loads the Three.js module and elevation tile.
3. User tests on Android Chrome: open Camera, tap Earth Mesh, switch Globe / Local Terrain, drag and zoom, return to Camera.
4. Only after the above, build stitched multi-tile terrain + continuous LOD, then camera-pose integration.
5. Keep Production alias unchanged until explicit approval.
