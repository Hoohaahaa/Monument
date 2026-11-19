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
| Timed trajectory | Historical one-file Vercel variants remain to be fully inspected; ordinary `startsAt/endsAt` is only availability | Supported as `trajectory` with waypoints, start, duration, interpolation and loop | Start/duration/loop/waypoint controls + map path preview; camera playback pending | Interpolation and schedule-separation tests |
| Text / image / audio | Later Portfolio app supports text, image and audio URLs | Unified content object | Artwork/story/menu/clock/news/advertisement formats; artist/materials/provenance/source attribution; menu items; text/image/audio controls; text + image can render on supported XR surfaces; audio is preview-only | Migration + XR adapter tests |
| Heading / front-back / dimensions | Recovered engine + spatial app | Geometry fields and validation | Dimension, facing, heading, local XYZ offset and draggable heading handle on map | Model tests + static shell checks |
| Visibility / radius / schedule | Later spatial publishing app | Audience, range and separate availability window | Audience, range, visible-from and visible-until controls | Visibility tests + static shell checks |
| Observer / sightline simulation | Recovered `engine-core.js` and `spatial.js` | Geodesic, apparent elevation, curvature, facing, range and FOV calculations | Observer lat/lon/altitude/heading/FOV inputs, use-device-location action and geometry metrics; no terrain or camera calibration claim | Recovered geometry tests + syntax checks |\n| Draft / revisions / share / registry | Later Portfolio app has registry and revisions; recovered camera shell only encodes a share payload in URL hash | Metadata is versioned; backend registry not yet connected | Local draft save + read-only visitor link; server registry/revisions pending | Static checks only; no end-to-end backend test |

## What was added in this integration pass

- `engine/moment-model.js`: canonical versioned Moment model, validation, WGS84 geodesy, indoor-local/WGS84 conversion, trajectory interpolation, visibility-window evaluation and a legacy-work migration adapter.
- `app.js` + root `index.html`: the approved camera-first shell is now wired to the model. Create exposes all five forms, indoor/outdoor coordinates, dimensions/frame/facing, sky controls, timed waypoints, text/image/audio, visibility and local draft/share-link actions. Place has map tap, draggable pin, heading handle, footprint/path preview, fit-to-work and expand-map controls.
- `tests/moment-model.test.cjs`: 10 model tests covering form families, indoor/outdoor coordinate rules, dimensions, trajectory playback, schedule separation, audience visibility and legacy media migration.
- Standard `npm test` runs 23 tests (the recovered engine + geometry + new model tests). All 23 passed in a Node 22 sandbox on 2026-11-19. `node --check app.js` and static shell/navigation/module-order checks also passed.

## Important source boundaries

- `recovery/monument-spatial-camera-v0.1.html` remains the immutable visual/interaction baseline. Its simple URL-hash share is not a public registry.
- `engine/recovered/xr.js` and `engine/recovered/baseline/xr-v18.js` remain the renderer references. Their anchor is session-local; it is not a persistent geospatial anchor.
- The old Spatial Lab layout is not reused.
- The one-file deployments `monument-sky-composer`, `monument-sky-presence`, and `monument-world-20` remain uninspected at source level. Their public deployment URLs return the Vercel login/Deployment Protection page; the Vercel file API exposes only one source file per deployment and its content response is truncated. Do not attribute a specific timed-trajectory feature to one of them until authenticated full source access is available.
- The canonical model is not yet wired into the camera-first UI, map, renderer or publishing backend. No user-facing feature should be called complete until those paths are integrated and tested.

## Next implementation sequence

1. Fully inspect the older one-file Vercel variants to recover any remaining form/trajectory capabilities not represented in the canonical Portfolio source.
2. Connect the existing XR V18 renderer to the new Moment model. Preserve the session-local anchor behavior and clearly distinguish it from persistent geospatial anchoring.
3. Implement trajectory playback in the camera/renderer, not just the map preview; add interpolation, clock, pause/resume, loop and visibility-window tests.
4. Connect drafts, revisions and public registry to a server backend. Keep local save, visitor link and global publication as distinct states.
5. Add mobile browser E2E coverage at 390×844 and desktop, plus permission-denied, offline-map, GPS and visitor-link flows.
6. Keep the current preview as the only recommended manual-test link; do not change production aliases.


## 2026-11-19 usability repair pass

- Camera permission is now user-initiated via **Open Camera**; the page no longer calls `getUserMedia()` during startup.
- The persistent **Publish** action opens release review instead of immediately publishing. The in-sheet Publish action remains the explicit confirmation.
- Publishing now requires at least one non-empty text, image URL or audio URL, in addition to model validation and a non-private audience.
- Regression coverage added in `tests/app-shell-contract.test.cjs`.
- Status: committed to the working branch; runtime/mobile browser verification and a new preview are still pending.
