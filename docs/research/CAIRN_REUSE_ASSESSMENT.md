# CAIRN Reuse Assessment

- Status: Source review completed; reuse candidates proposed
- Date: 2026-11-18
- Inspected source: Hoohaahaa/mono/app/public/cairn/index.html, app/public/data/cairn-globe.json, app/scripts/bake-cairn-globe.mjs
- Public case page: https://monomatter.dev/cairn
- Evidence boundary: The inspected Cairn source is a concept instrument. It does not demonstrate a persistent user-authored Moment service or a Supabase-backed write path.

## 1. What the inspected Cairn implementation contains

The page is a zero-dependency WebGL2 globe and scroll-driven concept instrument. It presents three shells:
- Crust: fifty years of USGS earthquake records, streamed in date chunks, with an offline snapshot fallback.
- Surface: a curated seed of 56 gatherings for good, with name, place, coordinates, month, type, and a source slug.
- Sky: on-demand Open-Meteo current conditions and a five-day forecast for a selected gathering.

Interaction includes globe drag/rotation, search over curated gatherings, globe point selection, a field-report card synthesizing the selected location's weather and nearby seismic history, time scrubbing/replay of the earthquake range, and three-shell visibility toggles.

The page converts latitude/longitude to unit-sphere vectors, uses Haversine distance for nearby earthquake counts, and renders through WebGL2. The data-bake script creates a static JSON payload for the portfolio cover from Natural Earth coastline geometry, USGS earthquake data, and gathering coordinates.

The inspected page source does not contain Supabase, authentication, user-generated Moment creation, CRUD, or persistent publishing. The user's recollection of a separate Supabase prototype remains plausible but is not verified by these files. That separate implementation must be located before migration or reuse.

## 2. What is valuable for Monument

The strongest idea is not simply a 3D globe. It is one world model with multiple spatial strata, where different kinds of facts and experiences can be placed and queried in relation to the same Earth.

This maps to Monument's proposed Subsurface / Surface / Sky strata, while Monument adds authorable, persistent Moments and live Sessions.

Reuse candidates:
- Spherical globe math and lat/lon-to-unit-vector conversion: global discovery; extract into tested spatial core.
- Haversine proximity calculation: nearby Moment and event queries; verify against ellipsoidal reference.
- Three-shell layer model: conceptual reuse, but redefine placement semantics.
- Globe drag, point picking, and search: discovery interaction; separate renderer from domain state.
- Field-report card: Moment/location detail panel; redesign for authorship and permissions.
- Time scrubber: historical Moments and event timelines; use UTC and explicit time semantics.
- Static globe data bake: fast read-only demo only, not canonical user data.
- USGS and Open-Meteo feeds: optional external data overlays behind provider adapters, not Moment persistence.

Do not copy the scroll-driven case-study page wholesale into the product app. Extract domain logic, coordinate helpers, and interaction patterns into tested modules. Keep the portfolio narrative separate from the product editor.

## 3. Product evolution

1. Read the world: external datasets and curated points.
2. Place a Moment: create a persistent spatial object at a coordinate and stratum.
3. Shape it: define point, path, area, curtain, mesh, or volume geometry.
4. Publish it: permissions, visibility, provenance, moderation, and limits.
5. Experience it: map/globe, camera, and contextual presentation.
6. Gather around it: create a live Session for multiple participants.

This preserves Cairn's world-as-instrument idea while moving from curated data visualization to a user-authored spatial platform.

## 4. Critical gaps before reuse

- Confirm and locate the separate Supabase prototype, schema, migrations, RLS policies, and data.
- Verify whether the globe and interaction code are stable enough to extract and check dependencies/licences.
- Separate external facts from user-authored Moments.
- Add canonical IDs, lifecycle, versioning, ownership, permissions, and moderation.
- Define geodetic and vertical references for underground and sky placements.
- Test globe performance on target mobile devices.
- Add spatial query strategy and clustering for dense regions.
- Do not treat a curated point's coordinates as proof of physical placement rights.

## 5. Assessment

Strong conceptual foundation; partial technical reuse; no verified persistence backend in the inspected Cairn page.

Cairn should inform Monument's World/Place discovery experience and layered Earth model. Monument should own persistent Moment domain, authoring workflow, access control, moderation, commerce, and realtime Session layer.
