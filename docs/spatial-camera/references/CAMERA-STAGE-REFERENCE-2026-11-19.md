# Camera-stage reference — 2026-11-19

The user supplied a phone screenshot of the Monument Geospatial Camera preview (756 × 1536 JPEG; original upload: `1795095605598.jpeg`).

## Preserve as a product reference

- Keep the subtle azimuth/compass degree scale and directional grid visible while the camera is active. This is an approved interaction pattern and should remain persistent, not be removed during later redesign.
- Keep the map/place picker and heading controls. The map must support multiple independently editable surface/route control points, not only one selected coordinate.
- The camera stage must show the selected spatial experience itself (terrain/planet mesh, route, and anchored surfaces), not a permanent editorial placeholder card.
- The current bottom card labelled “EDITORIAL PREVIEW / NOT WORLD-LOCKED” is diagnostic placeholder UI. It should not occupy the primary camera view when the user expects to inspect a route or surface. Content cards should appear only when a real anchored content surface is selected or deliberately previewed.
- Create-sheet primary action (“Done”/Apply) should be easy to reach in the sheet header or sticky action area and visibly switch the edited item into an active/committed state.

## What this screenshot proves — and does not prove

It documents the current camera HUD, compass-relative azimuth rings, and the failure state for nearby places (`Failed to fetch`). It does not demonstrate a terrain mesh, world-locked route, geospatial anchor, AR depth, or occlusion.

## Product requirement

When Camera is open, the user should be able to see:
1. The camera passthrough.
2. A geographically registered local Earth surface/terrain mesh beneath and around the user's position, with continuous LOD toward the horizon/globe context.
3. A selected route/path rendered on that surface and remaining stable as the device rotates.
4. Spatial content surfaces anchored to coordinates, with their own dimensions, height, orientation, and content.
5. Compass/azimuth degree readout as a persistent orientation aid.

The implementation must distinguish a true AR/world-locked mode from a compass-only fallback. Never label compass-projected geometry as world-locked.

## Screenshot asset handling

The screenshot is retained as a user-supplied reference in the originating ChatGPT conversation. The available GitHub connector in this workflow supports UTF-8 text file creation but not binary image upload; therefore this repository note records the reference and its requirements, but does not pretend the JPEG bytes have been committed. Add the original JPEG to this folder when a binary-capable Git workflow is available.
