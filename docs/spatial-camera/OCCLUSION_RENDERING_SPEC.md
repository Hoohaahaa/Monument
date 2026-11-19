# Monument — Real-World Occlusion Rendering Specification

Status: product target and engineering specification. This is an aspirational quality target, not a claim that the current web build implements it.

## Product outcome

A Monument work viewed through a live camera should feel physically present in the captured world, not like a sticker, HUD card or screen-space overlay. Real objects between the camera and the virtual work must naturally cover the virtual pixels behind them. The illusion should remain stable as the viewer moves, turns, approaches objects and changes viewpoint.

The quality target is the best perceptually convincing result supported by the device and scene data. The product must never hide uncertainty to make a demo look better. If reliable depth or localization is unavailable, it must disclose the reduced mode rather than fabricate occlusion.

## What "high quality" means

A high-quality result combines all of the following:

1. **Correct placement and pose** — the virtual work has a stable world pose, correct scale, orientation and vertical reference. Camera pose and work pose share a known coordinate frame.
2. **Metric depth** — real surfaces have depth in meters (or a rigorously converted unit), not just a semantic label or a guessed foreground mask.
3. **Depth registration** — real depth is aligned to the RGB camera using calibrated intrinsics/extrinsics, timestamp alignment and a documented reprojection path.
4. **Correct occlusion test** — real depth participates in the virtual renderer's depth test so a nearer real surface wins over farther virtual fragments.
5. **Temporal stability** — depth and pose are time-aligned, filtered and reprojected carefully to reduce swimming, flicker, holes and edge tearing during motion.
6. **Edge quality** — depth discontinuities, hair, leaves, fences, glass and thin geometry are handled with confidence-aware edge treatment rather than crude rectangular masks.
7. **Scene understanding** — semantic classes may improve policies (person, vegetation, building, ground, vehicle, sky), but classes never substitute for metric depth.
8. **Graceful degradation** — stale, sparse, low-confidence or unsupported depth falls back predictably and visibly.

## Reference rendering pipeline

### A. Acquire and calibrate

- Acquire camera color, camera intrinsics, camera pose, depth map and/or scene mesh.
- Record capture timestamps, coordinate frame, depth units/scale, image dimensions, confidence and coverage.
- Record depth-to-color registration status and the transform between depth sensor and RGB camera.
- Reject or downgrade frames with invalid calibration, incompatible dimensions, stale timestamps or unknown units.
- Never combine a depth frame from one camera pose with a color frame from another pose without explicit reprojection.

### B. Reconstruct real scene depth

Preferred sources, selected by device capability:
- LiDAR / hardware depth with calibrated metric range.
- Platform depth API or scene reconstruction mesh.
- Supported stereo or multi-view depth.
- Monocular depth estimation only as a lower-confidence approximation; it must not be presented as equivalent to LiDAR.
- Semantic segmentation can identify likely occluder pixels but cannot determine how far those pixels are from the camera.

Convert all accepted depth to a common camera-space convention and metric unit. Preserve invalid-depth holes and confidence values; do not silently fill them with invented geometry.

### C. Transform and align

- Transform depth into the RGB camera frame using calibrated extrinsics.
- Reproject depth with camera intrinsics when resolutions or camera viewpoints differ.
- Use capture timestamps and pose history to compensate for sensor latency.
- For a world-space mesh, transform it into the current render camera frame using the current localized camera pose.
- Track localization uncertainty separately from depth uncertainty; one cannot cancel the other.

### D. Render real-vs-virtual depth

The virtual renderer must receive the real scene depth as an occlusion depth input (or equivalent real-scene depth pass).

For each virtual fragment:
- compute its camera-space depth;
- compare it against the registered real depth at the corresponding pixel;
- discard or attenuate the virtual fragment when a nearer real surface is confidently present;
- preserve normal virtual depth testing among virtual objects.

This is a real depth-buffer/depth-test operation, not a CSS overlay, screen-fixed panel, alpha card or manually drawn foreground sticker. Platform implementations may differ, but the observable result must satisfy the same contract.

### E. Stabilize and treat boundaries

- Apply edge-aware temporal filtering that respects motion and depth discontinuities.
- Reproject prior depth only when pose history and confidence make it safe.
- Avoid excessive smoothing across foreground/background boundaries.
- Use confidence-aware feathering only at uncertain boundaries; do not create visible halos around every object.
- Treat thin structures (branches, wires, fences), foliage, hair, transparent surfaces and reflective materials as known hard cases.
- Do not infer the hidden geometry behind an occluder from a single camera frame.

### F. Lighting and material integration

Occlusion is necessary but not sufficient for realism. Later quality tiers should consider:
- exposure and white-balance matching;
- plausible virtual material response to the captured environment;
- ambient-light estimation and directional-light estimation;
- contact shadows and grounding where supported;
- reflections and transparency only where the scene data justifies them.

These are separate rendering capabilities. Do not claim that depth occlusion alone produces physically based lighting.

## Occlusion quality tiers

| Tier | Inputs | Expected behavior | Product wording |
|---|---|---|---|
| 0 — No occlusion | Camera only | Virtual content is visible without real-scene depth masking | Camera preview; no environmental occlusion |
| 1 — Semantic approximation | Segmentation mask, no metric depth | Conservative class-based masking; unstable boundaries expected | Approximate foreground masking |
| 2 — Metric depth | Fresh, registered device depth | Real surfaces occlude virtual fragments using depth testing | Depth-based occlusion on supported devices |
| 3 — Scene mesh | Tracked mesh with classifications and camera pose | More coherent geometry and improved persistence across viewpoints | Scene-aware occlusion |
| 4 — High-fidelity world | Reliable localization + dense local mesh/depth + temporal reprojection + calibrated rendering | Stable, detailed occlusion across movement, including complex geometry where captured | High-fidelity spatial rendering; device/site coverage still applies |

A tier is selected per frame/session, not permanently assigned to a user or device. Quality can fall when tracking or depth confidence falls.

## Fallback and safety rules

- If depth is stale, unregistered, has unknown units or is not in the current camera frame, do not use it as authoritative metric occlusion.
- If localization is lost, freeze or fade world-locked content according to the runtime policy; never silently snap it to a new pose.
- If only segmentation is available, use a clearly labeled approximation and conservative masking.
- If no reliable occlusion input exists, render without occlusion and expose the limitation.
- Never claim clouds are volumetrically occluded from a single RGB sky mask.
- Never claim distant hills or buildings are handled by phone LiDAR alone; use georeferenced terrain/building geometry and explicit datum conversion.

## Shared runtime data contract

Every occlusion frame should carry:
- provider and source type;
- source timestamp and current render timestamp;
- camera frame ID / coordinate frame;
- depth units and scale;
- depth and color dimensions;
- camera intrinsics and depth-to-color extrinsics or a statement that the source is already registered;
- registration state;
- confidence and coverage;
- semantic classes, if any;
- localization/tracking state and pose uncertainty;
- selected quality tier and explicit fallback reason.

The rendering policy must be derived from this evidence. Missing metadata must lower confidence or disable metric occlusion, never be guessed.

## Platform strategy

- **Android:** evaluate ARCore Depth API / Geospatial API / supported scene semantics on a device matrix. The native renderer consumes depth and camera pose; Geospatial localization supplies world alignment, not local depth by itself.
- **iOS/iPadOS:** evaluate ARKit scene depth / LiDAR scene reconstruction and RealityKit occlusion on supported devices. Mesh classification is useful but hardware availability varies.
- **Web:** retain camera and WebXR compatibility preview. Do not promise reliable per-pixel environmental occlusion in generic mobile browsers unless a concrete browser/device API provides the required registered depth and pose.
- **VPS/site mesh:** may provide localization and static environment geometry. It is not a replacement for live dynamic-object depth (people, cars, moving foliage).

## Validation scene suite

Build repeatable tests for:
- a person walking in front of a virtual panel;
- a tree trunk and fine foliage in front of a work;
- a wall edge and doorway;
- fence / rail / wire thin structures;
- a moving camera passing behind a real column;
- a reflective window and transparent glass;
- fast motion and low light;
- depth holes, stale frames and tracking loss;
- a virtual work behind a surveyed terrain ridge;
- a cloud/sky case explicitly marked as experimental.

Measure:
- occlusion boundary error in pixels;
- depth error in meters against reference measurements;
- temporal flicker / latency;
- tracking and pose error;
- frame rate, thermal behavior and battery impact;
- coverage and confidence under each environment.

Acceptance is device- and scene-specific. A successful unit test is not a substitute for on-device visual review.

## Delivery sequence

1. Finalize the provider-neutral depth-frame and rendering-policy contract.
2. Prototype a native Android depth-to-renderer pass on a supported device.
3. Prototype iOS scene-depth / mesh occlusion and compare quality.
4. Add temporal stabilization and difficult-edge handling.
5. Add site meshes and distant terrain visibility as separate inputs.
6. Evaluate lighting integration only after depth and localization are stable.
7. Treat volumetric clouds as a separate research milestone.

## Explicit non-goals for the current web branch

- No claim of live LiDAR/depth capture.
- No claim of real-world depth-buffer compositing.
- No claim of people/tree/wall occlusion.
- No claim of persistent geospatial placement.
- No claim of volumetric cloud reconstruction.
- No production-grade native Android or iOS renderer yet.
