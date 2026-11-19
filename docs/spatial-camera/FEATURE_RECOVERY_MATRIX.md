# Spatial feature recovery matrix

Updated: 2026-11-19
Branch: `restore-spatial-engine-integration-audit`

This matrix separates source-confirmed functionality from the current integration work. A source existing in an older branch does not mean it is already available in the new camera-first product.

| Capability | Recovered source evidence | Unified model | Camera-first UI integration | Verification |
|---|---|---|---|---|
| Point / marker | Camera shell + spatial engine | Supported as `point` | Pending | Model tests |
| Framed surface / panel | Engine geometry and later spatial publishing app | Supported as `framed-surface` | Pending | Model tests |
| Column / vertical form | User-confirmed earlier product family; requires geometry-specific controls | Supported as `column` | Pending | Model tests |
| Indoor venue / room / wall / ceiling / floor | Later Portfolio app has venue and marker-oriented flow; persistent room anchors are not confirmed | Local venue origin + room/floor/surface coordinates | Pending | Coordinate round-trip test |
| Outdoor WGS84 placement | Engine and later spatial publishing app | Supported as outdoor anchor with explicit altitude datum | Pending | Validation test |
| Static sky surface | Accepted V18 WebXR baseline | Supported as `sky-surface` | Renderer integration pending | Existing XR source preserved; device QA pending |
| Timed trajectory | Historical one-file Vercel variants remain to be fully inspected; ordinary `startsAt/endsAt` is only availability | Supported as `trajectory` with waypoints, start, duration, interpolation and loop | Pending | Interpolation and schedule-separation tests |
| Text / image / audio | Later Portfolio app supports text, image and audio URLs | Unified content object | Pending | Migration test for image/audio |
| Heading / front-back / dimensions | Recovered engine + spatial app | Geometry fields and validation | Pending | Model tests |
| Visibility / radius / schedule | Later spatial publishing app | Audience, range and separate availability window | Pending | Visibility tests |
| Draft / revisions / share / registry | Later Portfolio app has registry and revisions; recovered camera shell only encodes a share payload in URL hash | Metadata is versioned; backend registry not yet connected | Pending | Not yet verified end-to-end |

## What was added in this integration pass

- `engine/moment-model.js`: canonical versioned Moment model, validation, WGS84 geodesy, indoor-local/WGS84 conversion, trajectory interpolation, visibility-window evaluation and a legacy-work migration adapter.
- `tests/moment-model.test.cjs`: 10 tests covering form families, indoor/outdoor coordinate rules, dimensions, trajectory playback, schedule separation, audience visibility and legacy media migration.
- The 10 model tests passed in a Node 22 sandbox on 2026-11-19.

## Important source boundaries

- `recovery/monument-spatial-camera-v0.1.html` remains the immutable visual/interaction baseline. Its simple URL-hash share is not a public registry.
- `engine/recovered/xr.js` and `engine/recovered/baseline/xr-v18.js` remain the renderer references. Their anchor is session-local; it is not a persistent geospatial anchor.
- The old Spatial Lab layout is not reused.
- The one-file deployments `monument-sky-composer`, `monument-sky-presence`, and `monument-world-20` are not yet fully inspected. Do not attribute a specific timed-trajectory feature to one of them until the full source is recovered.
- The canonical model is not yet wired into the camera-first UI, map, renderer or publishing backend. No user-facing feature should be called complete until those paths are integrated and tested.

## Next implementation sequence

1. Keep the recovered camera-first shell and wire the model into Create and Place without changing the navigation.
2. Add progressive controls for form, placement, geometry, motion/timing, content and preview.
3. Connect the same Moment state to camera guidance and map footprint/trajectory preview.
4. Add local draft persistence and read-only visitor-link handling; clearly label this separately from server publication.
5. Reconcile the recovered publishing/registry source and backend schema before implementing global public publication.
6. Add browser E2E coverage and run all existing + new tests before one preview deployment.
