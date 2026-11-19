# Spatial feature recovery matrix

Updated: 2026-11-19
Branch: `restore-spatial-engine-integration-audit`

This matrix separates source-confirmed functionality from the current integration work. A source existing in an older branch does not mean it is already available in the new camera-first product.

| Capability | Recovered source evidence | Unified model | Camera-first UI integration | Verification |
|---|---|---|---|---|
| Point / marker | Camera shell + spatial engine | Supported as `point` | Initial Create control + map marker | Model tests + static shell checks |
| Framed surface / panel | Engine geometry and later spatial publishing app | Supported as `framed-surface` | Width/height, frame, facing, map footprint and heading handle | Model tests + static shell checks |
| Column / vertical form | User-confirmed earlier product family; requires geometry-specific controls | Supported as `column` | Diameter/height controls + map footprint | Model tests + static shell checks |
| Indoor venue / room / wall / ceiling / floor | Later Portfolio app has venue and marker-oriented flow; persistent room anchors are not confirmed | Local venue origin + room/floor/surface coordinates + QR reference metadata | Venue/room/floor/surface/local XYZ, local/sky/QR mode, QR scanner; QR detection records a 2D reference only, not a 3D pose | Coordinate round-trip + QR model tests; device scan QA pending |
| Outdoor WGS84 placement | Engine and later spatial publishing app | Supported as outdoor anchor with explicit altitude datum | Lat/lon, altitude datum, GPS, map tap and draggable pin | Validation test + static shell checks |
| Static sky surface | Accepted V18 WebXR baseline | Supported as `sky-surface` | Elevation/orientation controls + V18 session-local XR plane; not a persistent geo-anchor | Adapter tests; physical device QA pending |
| Timed trajectory | Historical one-file Vercel variants remain to be fully inspected; ordinary `startsAt/endsAt` is only availability | Supported as `trajectory` with waypoints, start, duration, interpolation and loop | Start/duration/loop/waypoint controls + map path preview; XR playback uses session-local axes, not geographic alignment | Interpolation, pause/resume and schedule-separation contract tests; device QA pending |
| Text / image / audio | Later Portfolio app supports text, image and audio URLs | Unified content object | Artwork/story/menu/clock/news/advertisement formats; artist/materials/provenance/source attribution; menu items; text/image/audio controls; text + image can render on supported XR surfaces; audio is preview-only | Migration + XR adapter tests |
| Heading / front-back / dimensions | Recovered engine + spatial app | Geometry fields and validation | Dimension, facing, heading, local XYZ offset and draggable heading handle on map | Model tests + static shell checks |
| Visibility / radius / schedule | Later spatial publishing app | Audience, range and separate availability window | Audience, range, visible-from and visible-until controls | Visibility tests + static shell checks |
| Observer / sightline simulation | Recovered `engine-core.js` and `spatial.js` | Geodesic, apparent elevation, curvature, facing, range and FOV calculations | Observer lat/lon/altitude/heading/FOV inputs, use-device-location action and geometry metrics; no terrain or camera calibration claim | Recovered geometry tests + syntax checks |
| Local real-world occlusion | Native AR platform capabilities are planned; no live depth capture in current web branch | Provider-neutral occlusion evidence report + evidence-gated render policy | No camera UI or renderer integration yet | Contract tests only; native device renderer and visual QA pending |
| Distant terrain/building occlusion | Requires licensed georeferenced DEM/3D meshes and localized camera pose | Roadmap only | Not integrated | Surveyed-site validation pending |
| Cloud/volumetric occlusion | Single-frame sky masks cannot recover volumetric cloud depth | Separate research milestone | Not integrated | Research / multi-view validation pending |
| Draft / revisions / share / registry | Later Portfolio app has registry and revisions; recovered camera shell only encodes a share payload in URL hash | Metadata is versioned; backend registry not yet connected | Local draft save + read-only visitor link; server registry/revisions pending | Static checks only; no end-to-end backend test |

## What was added in this integration pass

- `engine/moment-model.js`: canonical versioned Moment model, validation, WGS84 geodesy, indoor-local/WGS84 conversion, trajectory interpolation, visibility-window evaluation and a legacy-work migration adapter.
- `app.js` + root `index.html`: the approved camera-first shell is wired to the model. Create exposes all five forms, indoor/outdoor coordinates, dimensions/frame/facing, sky controls, timed waypoints, text/image/audio, visibility and local draft/share-link actions. Place has map tap, draggable pin, heading handle, footprint/path preview, fit-to-work and expand-map controls.
- `engine/spatial-runtime-contract.js`: provider-neutral localization and occlusion evidence reports; rejects session-local persistence claims and treats segmentation-only as non-metric.
- `engine/occlusion-render-policy.js`: chooses depth-tested, semantic-approximation or virtual-only rendering based on evidence, registration, units and camera-frame identity. This is a policy contract, not a native renderer.
- `docs/spatial-camera/OCCLUSION_RENDERING_SPEC.md`: product target and technical specification for physically convincing real-world occlusion, including registered depth, depth testing, temporal stabilization, difficult edges, quality tiers and device validation.
- Contract tests cover the model, XR adapter/renderer, spatial runtime and occlusion render policy. Focused prior verification: 29 passed, 0 failed; the new occlusion-policy tests have not yet been run as part of a complete suite.

## Important source boundaries

- `recovery/monument-spatial-camera-v0.1.html` remains the immutable visual/interaction baseline. Its simple URL-hash share is not a public registry.
- `engine/recovered/xr.js` and `engine/recovered/baseline/xr-v18.js` remain the renderer references. Their anchor is session-local; it is not a persistent geospatial anchor.
- The old Spatial Lab layout is not reused.
- The one-file deployments `monument-sky-composer`, `monument-sky-presence`, and `monument-world-20` remain uninspected at source level. Do not attribute a specific timed-trajectory feature to one of them until authenticated full source access is available.
- The occlusion render policy does not acquire depth, perform camera calibration, execute a GPU depth pass or create a native AR renderer. Those remain future native implementation work.
- The canonical model is not a server-backed global registry. No user-facing feature should be called complete until the full path is integrated and tested.

## Next implementation sequence

1. Finalize coordinate-frame and altitude-datum conversions and the persistent anchor-provider boundary.
2. Prototype native Android ARCore geospatial localization and registered depth-to-renderer occlusion on a supported device.
3. Prototype iOS ARKit scene-depth / mesh occlusion and compare quality.
4. Integrate real XR trajectory playback with a geospatial runtime; current outdoor path rendering is session-camera-relative.
5. Add temporal stabilization, difficult-edge handling, site meshes and distant terrain visibility.
6. Connect drafts, revisions and public registry to a server backend.
7. Add mobile browser E2E coverage at 390×844 and desktop; then run physical-device camera/GPS/compass/XR QA.
8. Keep production aliases unchanged unless explicitly approved.
