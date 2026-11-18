# Globe ↔ Map: Functional Projection and Transition

- Status: Architecture proposal grounded in inspected Cairn source
- Date: 2026-11-18
- Source: `mono/app/public/cairn/index.html` (WebGL2 implementation)
- No Monument globe/map transition is implemented by this document.

## 1. What Cairn actually implements

The Cairn page uses a WebGL2 canvas and custom GLSL programs. Its line geometry stores three attributes:
- `aPos`: geographic vertex mapped to a unit sphere by `ll2v(lat, lon)`.
- `aScat`: deterministic scattered 3D position used for assembly.
- `aPlane`: flat 2D position returned by `planeXY(lat, lon)`.

The line vertex shader interpolates between scattered and geographic positions with `uAssembly`, rotates the spherical point, then interpolates from the sphere to `aPlane` with `uFlatten`. The frame loop eases target state into current state and updates the scene. Pointer drag changes yaw and pitch; hit testing projects known gathering coordinates into screen space. Scroll progress drives scene parameters by section.

Important limitation: Cairn's `planeXY` is a simple linear mapping:
`x = lon / 180 * 1.7`, `y = lat / 90 * 0.85`.
It is not a production map projection. It does not account for Mercator scale distortion, antimeridian wrapping, polar clipping, tile coordinates, or map viewport semantics. The existing flat morph is a compelling visual technique, not a drop-in geographic map.

## 2. Reuse decision

Reuse the techniques and selected code concepts, not the whole case-study page:
- WebGL2 line rendering and buffer layout as a reference for a GPU globe layer.
- Deterministic scatter-to-sphere assembly.
- Sphere-to-plane vertex interpolation.
- Pointer-driven globe rotation and geographic point picking.
- Scroll/gesture progress mapped to a normalized transition parameter.
- Layer toggles and point-detail interaction patterns.

Do not copy Cairn's story sections, scroll choreography, fixed page chrome, curated dataset assumptions, or linear plane projection into the product map.

## 3. Monument must have one spatial source of truth

Every Moment and geometry component keeps canonical geographic coordinates and an explicit CRS/reference. Globe and map are render projections of the same records.

For a geographic point (latitude, longitude):
- Globe: convert geodetic coordinates to ECEF or a normalized globe vector for rendering.
- Map: project to the active map projection, normally Web Mercator for the initial slippy-map viewport, with explicit latitude clamp and antimeridian handling.
- Selection: use a stable Moment/component ID, never screen coordinates, as identity.
- Editing: convert pointer/touch screen coordinates back through the active projection to canonical geographic coordinates, then update the shared spatial model.

The globe's rotation and map's camera center/zoom are separate view states. The selected Moment, filters, active stratum, and data remain shared.

## 4. Functional transition model

Use one normalized transition parameter `t ∈ [0,1]`, controlled by scroll, touch drag, or a direct Globe/Map toggle:
- `t = 0`: globe mode.
- `0 < t < 1`: morph state.
- `t = 1`: map mode.

At intermediate t:
- Geographic vertices interpolate from the rotated globe projection toward the target map projection.
- The map camera center and zoom are derived from a deliberate view target; they must not be guessed from the globe's screen transform.
- Markers and Moment geometry use the same transition parameter and stable IDs.
- Hit testing uses the interpolated render position but resolves to canonical Moment IDs.
- Camera controls are mode-aware: globe drag rotates the globe; map drag pans; during morph, gesture ownership is explicit and scroll does not accidentally rotate the globe.

A two-stage transition is recommended:
1. Scatter → assembled globe (the Cairn opening gesture).
2. Globe → projected map (functional geographic projection).

Keep the first stage optional and brief in the actual product. It must not delay search, creation, or navigation. Respect reduced-motion preferences and provide a direct skip/toggle.

## 5. Projection and geometry pitfalls

- Antimeridian: split lines and polygons at ±180°; do not draw long segments across the entire map.
- Poles: Web Mercator is undefined at ±90°; clamp display latitude or use a different projection for polar exploration.
- Area: apparent map area is not ground area. Calculate entitlements using geodesic or suitable equal-area methods, not screen pixels.
- Large geometry: tile and simplify by zoom/LOD; do not morph millions of vertices on mobile.
- Vertical/3D geometry: globe-to-map is only a 2D discovery projection. Subsurface depth, altitude, and vertical surfaces require a separate vertical/section view or explicit symbols; a flat map must not erase their semantics.
- Terrain: terrain-following geometry requires a real elevation source and datum; neither Cairn's globe nor current Spatial Lab supplies it.
- Precision: preserve canonical WGS84 coordinates and use local frames for editing/rendering precision.

## 6. Recommended implementation path

### Phase A — Extract and isolate
Create a provider-neutral spatial data layer and a small WebGL globe renderer. Keep the current Leaflet map operational as the map-mode renderer. Do not replace the working map before parity tests.

### Phase B — Shared interaction
Render the same test Moments in both views. Verify selection, search, filters, layer visibility, and detail panels remain synchronized.

### Phase C — Functional morph
Implement sphere-to-map interpolation for a bounded dataset (for example 100–1,000 points and simplified coastline/graticule). Use WebGL for the morphing overlay. At t=1, hand off to the real map renderer with no visual jump, retaining selected IDs and camera target. Later, evaluate rendering full map tiles in WebGL if a continuous morph is essential; do not prematurely rebuild a complete map engine.

### Phase D — Editing and scale
Support map/globe coordinate picking and geometry editing. Add antimeridian, polar, mobile GPU, memory, and low-bandwidth tests. Then increase geometry budgets based on measurements.

## 7. Acceptance tests

- The same Moment ID is selected in globe and map modes.
- Search/filter/layer state is identical before and after transition.
- A known coordinate projects to expected map coordinates within a defined tolerance.
- Transition is reversible and interruptible by touch, wheel, and direct toggle.
- No marker jump at handoff to the map renderer.
- Antimeridian-crossing paths do not span the entire viewport.
- High-latitude locations remain discoverable without invalid coordinates.
- Reduced-motion mode skips or shortens the morph.
- Low-end mobile devices maintain an agreed frame-time budget; otherwise use a reduced geometry preset.
- If WebGL fails, the functional map remains usable.

## 8. Architectural recommendation

For Monument v1, use a hybrid renderer:
- Leaflet (or a replaceable map adapter) for real map tiles, pan/zoom, and map interaction.
- A custom WebGL2 globe for the Cairn-like globe view and GPU morph.
- A shared spatial domain/store for Moment data, selection, filters, and layers.

This gives Monument the distinctive Cairn transition without taking on the cost and risk of implementing a full map-tile engine in WebGL before it is needed.
