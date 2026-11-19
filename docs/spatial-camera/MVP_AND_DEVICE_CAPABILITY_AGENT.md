# Monument Spatial Camera — MVP implementation notes

## Product direction
The URL should open directly into the camera-first spatial experience, not a conventional marketing landing page. The first-run device check is a lightweight capability gate: detect support first, request camera/location/orientation permissions only at the moment each is needed, and explain fallbacks without blocking Place/Create. The future device agent should run repeatable browser/device capability tests and select the best supported mode. It is not part of this MVP.

Header wordmark: `◇♧♡■■■■■`.

Preserve the original one-page shell and bottom navigation: Camera / Place / Create / Publish. Place remains an in-page map mode; Create remains a bottom sheet. No Spatial Lab split workspace or separate Field route.

## MVP delivered in this branch
- Approximate geodesic distance and bearing from observer GPS to Moment coordinates.
- GPS watch with accuracy surfaced to the user; projection is withheld when reported accuracy exceeds 80 m.
- Compass support for iOS `webkitCompassHeading` and absolute DeviceOrientation events where `absolute === true`. Relative alpha is not treated as north.
- Horizontal projection using a conservative 60° assumed camera FOV, front/behind test, range filter, and left/right guidance.
- The card is displayed in the camera overlay only when the target is in the estimated horizontal FOV and visibility radius.
- Arrival state under 12 m suppresses guidance.
- 100 m / 200 m eastward test offsets with reset, so bearing and on-screen placement can be compared.
- Local draft persistence via localStorage, separate from the shareable URL hash.
- Camera denial does not prevent Place/Create from remaining usable.

## Known limits — do not overclaim
This is a GPS + compass screen-space approximation, not world-locked AR. The 60° FOV is a provisional estimate, not device-calibrated camera intrinsics. Vertical projection, pitch, roll, altitude alignment, occlusion, surface anchoring, visual tracking, VPS, and geospatial anchors are not implemented. Compass availability/calibration varies by browser and device. A relative orientation reading is deliberately not accepted as true north. Browser permissions require HTTPS and a user gesture.

The current Publish flow still creates a URL-hash share link. Local save is device-local only. There is no server registry, cross-device database persistence, authentication, public discovery, or global publication in this MVP.

## Next infrastructure layer (NO OS-aligned)
1. Capability manifest: browser/OS, camera enumeration/facing mode, secure-context status, geolocation, orientation permission and sensor type, WebGL/WebXR support, viewport and device pixel ratio.
2. Device test agent: permission-safe test plan, sensor sampling, confidence scoring, reproducible diagnostics, and device-specific fallback profile. No background permission prompts.
3. Spatial engine: calibrated camera intrinsics/FOV, pose fusion, vertical geometry, world anchor lifecycle, tracking confidence and loss recovery.
4. Persistence: draft / private / published states; server-side Moment schema, geospatial index, access control, version history and deletion.
5. Telemetry: explicit opt-in, redact precise location by default, store capability outcomes and failed paths with reasons, and retain decision/route alternatives so future system work can learn from both chosen and rejected paths.

## QA status
Automated source-level checks and deployment smoke tests must be recorded separately from physical-device QA. Real Android/iOS camera, GPS drift, compass calibration, permission-denial and orientation behavior still require hands-on testing on actual devices.
