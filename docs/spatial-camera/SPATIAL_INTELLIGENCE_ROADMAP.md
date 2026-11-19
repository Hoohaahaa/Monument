# Monument Spatial Intelligence Roadmap

Status: architecture proposal for staged implementation. This document does not claim that the capabilities below are already implemented.

## Product target

Monument should let creators place persistent digital works in the physical world, then render them in a way that respects the viewer's location, orientation, nearby geometry, terrain and (where supported) changing environmental context.

The product must distinguish:
- **Placement:** where the work is authored.
- **Localization:** where the viewer/device is in the same coordinate frame.
- **World understanding:** what physical surfaces and objects exist between viewer and work.
- **Visibility/occlusion:** which real surfaces should cover the virtual work from this camera view.
- **Temporal state:** when a work or moving work is active.
- **Rendering:** how the content is drawn on each supported runtime.

A map pin is not a precise AR anchor. A session-local WebXR pose is not a persistent geographic anchor. A terrain elevation model is not a live 3D reconstruction. A segmentation mask is not a metrically accurate depth map.

## Product quality target: believable physical-world presence

The long-term target is not a virtual card drawn over a camera feed. A Monument work should appear to occupy the captured physical scene: nearby people, trees, walls and other real surfaces should cover the virtual work when they are closer to the camera. The effect should remain stable as the viewer moves, with correct scale, pose, depth ordering and camera alignment.

This is a product target, not a current capability claim. The detailed acceptance criteria, quality tiers, depth registration, real-vs-virtual depth pass, temporal stabilization, edge handling and lighting roadmap are specified in [OCCLUSION_RENDERING_SPEC.md](./OCCLUSION_RENDERING_SPEC.md).

High-fidelity rendering requires both correct world localization and reliable scene depth. Neither can compensate for the absence of the other. The renderer must lower its quality tier when depth is stale, unregistered, incomplete or low-confidence; it must never fake metric depth from semantic labels.

## Recommended runtime split

### Web application
Keep the existing camera-first Monument web shell as the authoring, publishing, discovery and compatibility experience:
- Moment schema, content, geometry, trajectory authoring and preview.
- Map placement, metadata, visibility windows, sharing and revision workflows.
- WebXR session-local preview where supported.
- Clear capability reporting and graceful fallbacks.

Do not promise persistent geospatial AR or high-quality environmental occlusion in generic mobile browsers.

### Native AR runtimes
Build native clients that consume the same versioned Moment API and schema:
- Android: ARCore Geospatial API for WGS84/Terrain/Rooftop anchors and VPS-backed localization where coverage exists; ARCore Depth/Scene Semantics capabilities where device support permits.
- iOS/iPadOS: ARKit + RealityKit for world tracking, scene reconstruction, mesh classification and occlusion on supported devices.
- Keep platform-specific pose, depth and mesh adapters behind a shared Monument runtime contract. Do not force identical sensor features across platforms.

### Persistent VPS and scanned sites
Evaluate a provider such as Niantic Spatial VPS for scanned sites, persistent localization and site meshes. Provider coverage, licensing, data ownership, privacy, API limits, pricing and long-term portability must be assessed before selecting it as a production dependency. A site mesh can be used for authoring context, collision or occlusion, but it does not itself localize the device.

## World understanding and occlusion

### Nearby / local scene
For close objects such as people, trees, walls, furniture and vehicles:
1. Obtain a device depth map or LiDAR depth when available.
2. Reconstruct a local mesh or depth surface.
3. Optionally classify pixels/mesh faces (person, vegetation, building, ground, sky, etc.).
4. Transform depth/mesh into the current camera coordinate frame.
5. Register the depth to the RGB camera using calibrated intrinsics/extrinsics and aligned timestamps.
6. Render the virtual scene with a real-scene depth pass/depth test so nearer real surfaces occlude virtual fragments.
7. Stabilize depth over time without smearing foreground/background edges.
8. Track confidence, age and coverage. Avoid hard occlusion where depth is missing or unreliable.

Fallback hierarchy:
- High confidence: registered device depth / LiDAR mesh.
- Medium confidence: supported platform scene mesh or depth estimate with measured confidence.
- Low confidence: semantic segmentation only; use conservative approximate masking and do not invent metric depth.
- Unsupported: render without environmental occlusion and tell the user.

See [OCCLUSION_RENDERING_SPEC.md](./OCCLUSION_RENDERING_SPEC.md) for the full rendering pipeline and quality tiers.

### Distant terrain and buildings
For a virtual work behind a hill, mountain or distant building, phone LiDAR is not enough. Use georeferenced terrain elevation models and 3D building/landscape meshes, then compare the ray from the localized camera to the work against the world geometry. Accuracy depends on source resolution, datum, update date, vegetation/building coverage and localization error.

The runtime needs a common vertical datum and explicit conversions. Never silently mix ellipsoid altitude, mean sea level, terrain-relative height and venue-local height. `engine/vertical-datum-contract.js` now provides a strict conversion boundary: ellipsoid↔MSL requires geoid separation, AGL↔MSL requires terrain elevation, and venue-local↔MSL requires a surveyed venue-origin altitude. Missing references cause a validation failure; the module does not invent geoid or terrain data.

### Sky and clouds
Sky segmentation can identify sky pixels in the current camera view, but it does not determine the depth or volumetric shape of an individual cloud. Treat cloud occlusion as a separate advanced feature:
- Near-term: sky mask / horizon detection as a visual effect only.
- Later: weather/cloud products or multi-view reconstruction where licensing and spatial/temporal resolution are adequate.
- Do not claim physically correct cloud depth from a single RGB camera frame.

## Shared spatial runtime contract

Every runtime adapter should report:
- coordinate frame and origin;
- localization provider and provider anchor/site identifier;
- horizontal and vertical accuracy estimates;
- heading/yaw confidence and calibration state;
- altitude datum;
- pose timestamp and tracking state;
- depth/mesh source, timestamp, confidence and coverage;
- depth units, registration state, camera frame identity and relevant calibration metadata;
- supported occlusion classes;
- selected rendering tier and explicit fallback reason;
- capability flags and explicit fallback reason.

The canonical Moment should retain provider-neutral content and geometry. Provider-specific IDs and runtime observations belong in separate anchor/localization records, not in the portable content body.

## Staged delivery

### Stage 0 — Honest WebXR baseline (current branch)
- Keep local session anchors explicitly labelled.
- Point and Column geometry-specific meshes.
- Timed trajectory interpolation, loop, pause/resume and end state in session-local coordinates.
- Automated contracts and supported-browser QA before preview.
- No claim of true-north alignment, VPS persistence or environmental occlusion.

### Stage 1 — Geospatial foundation
- Define coordinate-frame and altitude-datum contract. A first strict altitude conversion module is now in the branch; geoid/terrain/venue reference data and survey validation remain external requirements.
- Add anchor-provider abstraction and localization quality fields.
- Prototype Android ARCore Geospatial anchors in one known VPS-covered location.
- Test restart/relocalization, heading error, vertical error, drift and coverage loss.
- Keep WebXR as editor preview, not the geospatial source of truth.

### Stage 2 — Local environmental occlusion
- Finalize provider-neutral depth-frame and rendering-policy contract.
- Prototype native ARKit/RealityKit and ARCore depth/scene understanding.
- Implement registered depth-to-renderer pipeline and real-vs-virtual depth test.
- Person and nearby rigid-object occlusion first; vegetation and thin structures separately evaluated.
- Add temporal stabilization, confidence-aware edge treatment, device capability matrix, thermal/performance budgets and low-confidence fallback.

### Stage 3 — Regional world geometry
- Ingest licensed terrain DEM and suitable 3D building/vegetation datasets.
- Normalize coordinate reference systems and vertical datums.
- Add ray/mesh visibility queries between camera and Moment.
- Validate with surveyed viewpoints and known landmarks.

### Stage 4 — Dynamic environment and rendering integration
- Sky segmentation and horizon understanding.
- Evaluate weather/cloud data only for use cases with sufficient temporal and spatial resolution.
- Consider multi-view/site scans for high-fidelity locations.
- Evaluate exposure, lighting and contact-shadow integration only after depth and localization are stable.
- Label approximations; no false claim of volumetric cloud reconstruction.

## Acceptance tests

- A work remains at the same surveyed location after app restart and relocalization.
- Device pose uncertainty is surfaced; loss of VPS does not silently jump the content.
- A person/tree/wall closer than the virtual work correctly occludes it on supported devices.
- Occlusion depth is registered to the color camera and has valid units, timestamps and camera-frame identity.
- Stale, sparse, unregistered or low-confidence depth falls back predictably.
- Fine foliage, thin structures, fast motion and depth holes are included in device QA.
- A distant terrain ridge blocks a virtual work only when the terrain data and coordinate frames justify it.
- Trajectory motion clock is independent of publication visibility windows.
- Altitude datum conversions are tested with known control points.
- Every result records device, runtime, provider, source-data date, confidence and known limitations.

## Decisions still required

- Android/iOS native app strategy and minimum device support.
- VPS provider(s), coverage and commercial terms.
- Terrain/building/vegetation data licensing and update cadence.
- Whether user-contributed site scans are allowed, and their consent/retention/privacy policy.
- Accuracy targets by experience tier (local, venue, city/landscape).
- Reference devices and measurable occlusion quality/performance budgets.
