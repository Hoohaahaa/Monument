# Place and World Model

- Status: Proposed domain baseline
- Date: 2026-11-18
- Scope: Place phase, spatial persistence, future commerce
- Inputs: Monument product direction; CAIRN concept at monomatter.dev/cairn; NO OS product-boundary and data-governance principles.
- Limitation: Not implemented or validated against real terrain, geospatial AR, or production load.

## 1. Product thesis

Monument places persistent, addressable digital Moments into the physical world. A Moment may be discovered on a map or globe, approached in the field, viewed through a camera, and experienced with other people.

The primary primitive is not a map pin or a camera overlay. It is a spatially anchored Moment with identity, geometry, content, ownership, permissions, lifecycle, provenance, and optional live Sessions.

A Moment persists independently of whether anyone is currently viewing it. A Session is a live occurrence involving participants and interactions. Do not conflate persistent content with live presence.

## 2. World coordinate model

Use a global geodetic anchor plus a local coordinate frame:
- Horizontal anchor: WGS84 latitude and longitude.
- Vertical anchor: explicit height/depth value plus a declared vertical reference.
- Local geometry: East-North-Up (ENU) frame around the anchor for editing and rendering.
- Earth-scale calculations: ellipsoidal geodesic methods; do not assume a flat plane for global distances or area.
- Render coordinates: convert geodetic coordinates to Earth-Centred, Earth-Fixed (ECEF), then to a local frame near the active viewer to retain numerical precision.

A vertical value without a declared reference is invalid.

## 3. Three spatial strata

The CAIRN concept frames the planet in three shells: crust, surface, and sky. Monument can turn this into a creation and placement model, but the concepts need precise semantics.

| Stratum | Meaning | Required anchor data | Examples |
|---|---|---|---|
| Subsurface | Below local ground | lat, lon, depth below local terrain, terrain reference/version | buried memory, geological story, underground installation |
| Surface | On or attached to local ground | lat, lon, ground offset, footprint/geometry | public artwork, site-specific story, large horizontal or vertical surface |
| Sky | Above local ground | lat, lon, height above ground or declared altitude reference | aerial artwork, sky event, virtual constellation |

These are filters and coordinate strata over one spatial index, not three unrelated maps. A Moment may contain components at multiple strata, but each component declares its own anchor.

### Vertical references

- AGL: height above local ground; depends on terrain elevation at the anchor.
- AMSL: altitude above mean sea level; requires a named elevation datum.
- BELOW_GROUND: depth beneath local terrain; depends on a terrain model and its version.

Do not silently convert between them. Terrain-following geometry requires a terrain/elevation provider and a versioned terrain sample. The current browser prototype does not provide this.

## 4. Moment geometry and size

A Moment may be a point, line, area, volume, or composed structure.

Candidate geometry types:
- Point / anchor
- Path / route
- Polygon / surface
- Vertical curtain / wall
- Mesh / 3D object
- Volume / bounded spatial region
- Collection / composed multi-part installation

Store canonical geometry in a provider-neutral domain format with explicit CRS, units, coordinate order, geometry version, and validation bounds. GeoJSON can represent compatible 2D geographic geometries; use a separately versioned 3D representation for meshes and volumes.

### Large surfaces

A large surface is a core product capability, not an unlimited entitlement. Before rendering or publishing, calculate:
- Ground footprint (m² or km²).
- Maximum horizontal span and vertical extent.
- Number of vertices / triangles or equivalent complexity.
- Expected texture and media payload.
- Visibility range and level-of-detail requirements.
- Terrain sample count for terrain-following surfaces.
- Estimated network and rendering cost.

The authoring system should show a live footprint preview and a scale warning. Enforce technical limits server-side, not only in the editor.

A large polygon on a map is not permission to occupy, alter, advertise on, or claim physical land. Spatial presence, land ownership, legal rights, public safety, and content rights are separate questions.

## 5. Moment lifecycle

Proposed lifecycle: draft → submitted → published → suspended → archived → deleted.

Possible expiry modes:
- Permanent until owner deletion or moderation.
- Scheduled start/end.
- Recurring availability.
- Event-bound, active during a defined event and archived afterward.
- Time-limited discovery while the underlying Moment remains stored.

Permanent means durable and addressable under the platform's retention and moderation policy. It does not mean immutable, guaranteed visible forever, or exempt from safety/legal takedown.

Every published Moment needs a stable ID and owner, spatial anchor and geometry version, content version and media references, visibility and access policy, provenance and attribution, moderation state, timestamps, change history, and deletion/retention policy.

## 6. Discovery and rendering

Do not load the entire planet's content into a mobile scene. Use progressive spatial discovery:
1. Coarse global index and globe clusters.
2. Region and map viewport queries.
3. Nearby candidate Moments with spatial and visibility filters.
4. Exact geometry and media only after selection or proximity.
5. Camera/AR renderer loads only the currently relevant subset.

Map, globe, camera, and list are different projections of the same domain objects. They must not maintain separate copies of Moment identity or lifecycle.

A map/globe is the discovery and navigation surface; the camera is a contextual presentation surface. Camera view must never be the only way to access content.

## 7. Spatial truth and uncertainty

Location and orientation are uncertain measurements. Store accuracy and provenance with observations. Do not present a GPS point as centimetre-accurate. For high-precision world-locked AR, evaluate native ARCore/ARKit geospatial capabilities, VPS coverage, calibration, and device support separately.

Underground and sky placements require more than map coordinates: underground requires terrain/elevation reference; sky requires altitude reference and potentially a 3D visibility/occlusion model.

## 8. Privacy, safety, and governance

Exact user location is private and ephemeral by default. A Moment's public anchor may be visible without exposing the creator's current location. Do not store continuous user movement unless a clearly stated feature requires it and the user opts in.

Define location-sensitive content, private places, restricted sites, hazardous areas, abuse reporting, ownership claims, provenance, moderation, and removal. Sponsored Moments must be labelled and must not impersonate neutral map data.

## 9. Open questions and tests

- Which geodetic and vertical datum is canonical for the first release?
- Which terrain provider and resolution are sufficient for the first supported locations?
- What is the maximum useful surface footprint for each tier?
- How should overlapping Moments be ranked and composed?
- What happens when two publishers claim the same physical location?
- Which devices render chosen geometry at target frame rates?
- How are altitude and subsurface depth represented in map and camera interfaces?

Required tests: dateline crossing, polar regions, ellipsoidal distance/area, vertical datum conversion, terrain sample failure, overlapping surfaces, geometry size caps, permission denial, low-memory devices, offline map state, and stale terrain versions.
