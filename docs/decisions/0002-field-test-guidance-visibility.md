# Decision 0002 — Field Test Guidance and Visibility Semantics

**Date:** 2026-11-18  
**Product:** Monument  
**Status:** Accepted for prototype; backend semantics remain proposed  
**Source:** User direction in the Monument product conversation and the 0.2 field-test implementation.

## Context

The user needs Monument to work as a spatial publishing product, including authoring from one city for a place in another city, selectable discovery range, large-scale geometry, and a live wayfinding transition into spatial content.

## Decision

Separate four concepts in the product model:

1. **Placement:** geographic coordinates and spatial stratum.
2. **Geometry:** physical dimensions, shape, orientation, and surface behavior.
3. **Visibility / discovery policy:** who can discover a Moment and from what scope (50 m, 500 m, 1 km, 10 km, 100 km, Global).
4. **Presentation / arrival:** how the content is presented on a device and when navigation guidance transitions into content.

Global visibility is a discovery scope, not a claim that a 100 km object is physically visible from every point on Earth. Geometry and discovery policy must not be coupled.

The field-test navigation dock reports GPS-derived distance and bearing, and heading-relative turn angle only when a supported device heading is available. The guidance dock fades on local arrival and content preview becomes visible. Camera is optional and must never gate the content renderer.

## Alternatives and dispositions

- **Use geometry size as a proxy for visibility:** rejected. It conflates physical scale with discovery permissions and creates incorrect behavior for global discovery.
- **Represent Global as a very large geofence/radius:** rejected as the domain model. A map circle may be used as a visual aid, but global discovery requires a server-side policy/index.
- **Hide all content until camera permission succeeds:** rejected. Camera permission is optional and failure must not make the product blank.
- **Show a decorative bottom card without live values:** rejected. The guidance area must expose actual distance, bearing, heading delta, GPS accuracy, compass status, and arrival state; unavailable values must remain unavailable, not fabricated.
- **Claim world-locked AR from GPS + compass:** rejected. These sensors provide approximate wayfinding, not stable AR anchoring.

## Trade-offs accepted

- The prototype uses browser local storage and URL hash payloads. This enables immediate single-device testing but does not provide shared cloud persistence or global discovery.
- Nominatim search and OpenStreetMap tiles are used for the field-test map; rate limits, service availability, attribution, and production terms require review.
- Device orientation APIs differ across browsers and require explicit permission on some platforms. Turn angle is therefore conditional.
- A local arrival threshold is a pragmatic first test; it requires field calibration and should later become a configurable interaction policy.

## Validation and revisit triggers

Revisit after Android/iOS field testing, backend design, and spatial rendering validation. Replace local persistence and client-side discovery with authenticated server APIs, PostGIS-backed spatial queries, object storage, and a versioned event pipeline before cross-user/global operation.

## Evidence status

- Vercel reports deployment `dpl_41RDzkWrvZkFyBzHhKFwq2kJ8RAV` as READY.
- Real-device behavior is **not yet verified**.
- Backend, analytics ingestion, managed media, and world-locked AR are **not implemented**.
