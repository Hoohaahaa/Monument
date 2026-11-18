# Product Blueprint v1

- Status: Working product baseline
- Date: 2026-11-18
- Decision owner: Monument
- Scope: Product definition, first usable release, domain boundaries, delivery sequence
- This document is a working baseline. It is not evidence that the listed features are implemented.

## 1. Product definition

**Monument is a persistent spatial publishing platform.**

People and organizations create digital Moments, anchor them to real-world places or spatial regions, publish them, and let others discover and experience them over time.

Monument is not primarily:
- an AR camera app;
- a map with decorative pins;
- a social feed with a map skin;
- a claim or marketplace for physical land.

The core value is the lifecycle of a spatial Moment: create → place → publish → discover → experience → evolve.

## 2. Product principles

1. Spatial publishing first; AR is one presentation mode.
2. A Moment remains addressable independently of any live Session.
3. Globe, map, list, and camera are views over the same domain objects.
4. A Moment should remain useful when camera, GPS, compass, AR tracking, or network quality is unavailable.
5. Start with one coherent product and modular boundaries, not microservices.
6. The platform does not grant ownership or advertising rights over physical land.
7. Location accuracy, vertical datum, permissions, provenance, moderation, and expiry must be explicit.
8. Design for mobile-first use, low bandwidth, and graceful failure.
9. Monetization follows measurable resource cost and validated user value.
10. Every capability must be labelled internally as proposed, implemented, tested, or operational.

## 3. Initial audiences

### Primary validation audience
Independent creators and small collectives who want to publish location-based art, stories, memories, installations, or interactive experiences.

### Secondary validation audiences
- Cultural venues, museums, and heritage organizations.
- Tourism destinations and local communities.
- Educational and field-research groups.

### Later audience
Brands and advertisers, only after organic discovery and user trust exist. Sponsored content must be explicitly labelled.

## 4. Core domain model

### Workspace
A collaboration and administration boundary. Holds members, roles, billing owner, projects, and shared assets.

### Project
A purposeful collection of Places and Moments, with a lifecycle and collaborators. Projects are not geographic locations by themselves.

### Place
A real-world geographic context: a point, named venue, site, district, route, or region. A Place can contain many Moments. It does not imply physical ownership.

### Moment
The primary product object: a persistent, addressable digital entity with:
- stable ID and creator/owner;
- one or more spatial anchors and geometry components;
- content and media references;
- visibility, access policy, and publishing state;
- schedule/expiry policy;
- provenance, attribution, and version history;
- moderation state and report history;
- optional interaction configuration.

A Moment may be a point, path, polygon/surface, vertical surface, 3D object, volume, or composed structure. Each geometry component declares coordinate reference, units, vertical reference where applicable, and geometry version.

### Session
A time-bounded live execution involving one or more Moments and participants. It has membership, capacity, state, permissions, and an event sequence. It can end while its Moments persist.

### Participant
A user or permitted guest in a Session. Presence and precise movement are private, ephemeral data by default.

### Interaction and Event
An Interaction is a requested action. An Event is a server-validated fact that the action was accepted or a domain transition occurred. Clients submit commands; they do not authoritatively overwrite shared state.

## 5. Moment lifecycle

Proposed lifecycle:
- Draft
- Submitted (optional review)
- Published
- Suspended
- Archived
- Deleted (subject to retention and legal obligations)

Publication settings:
- Public, unlisted, workspace-only, or private.
- Immediate, scheduled, recurring, event-bound, or manually controlled.
- Permanent until removed, or explicitly time-limited.

“Permanent” means retained and addressable under platform policy; it does not mean immutable or immune to moderation/legal removal.

## 6. Core user journeys

### A. Create and publish
1. Start a new Moment.
2. Choose a content type or template.
3. Add text, images, audio, links, or supported 3D assets.
4. Choose a Place or set a location.
5. Draw/select geometry when needed.
6. Configure visibility, schedule, and interaction.
7. Preview in map and available presentation modes.
8. Publish and receive a shareable Moment link.

The first release must make a simple point-based Moment easy. Advanced geometry is a progressive capability, not a mandatory setup step.

### B. Discover and experience
1. Open World Explorer.
2. Browse a globe or map, search for a place, or use nearby discovery with explicit location permission.
3. Filter by type, creator, time, and access.
4. Select a Moment and inspect its details.
5. Open its content without requiring camera access.
6. Optionally switch to camera/AR when supported and useful.

### C. Manage
1. Open My Space.
2. See owned Moments and Projects.
3. Edit, schedule, archive, duplicate, or delete eligible items.
4. Review analytics and collaboration permissions where available.

### D. Join a live Session (later milestone)
1. Open a Moment with an active Session.
2. Inspect host, visibility, capacity, and rules.
3. Join with appropriate permissions.
4. Interact through server-validated commands.
5. Reconnect from a snapshot/sequence after network interruption.
6. Leave; the Moment remains.

## 7. First release scope

### Must have
- Responsive mobile-first application shell.
- Authentication and basic profile.
- World Explorer using a real map engine with Globe and street-level map zoom where supported by the selected tiles/data.
- Search for geographic places.
- Stable Moment records and persistence.
- Create/edit/publish a simple Moment with text and image.
- Point anchor and a constrained basic area geometry.
- Public/private or unlisted visibility.
- Moment detail page and shareable URL.
- My Space list and basic management.
- Permission-aware location access; manual location selection remains possible.
- Moderation/reporting baseline and server-side validation.
- Error handling, loading states, empty states, accessibility basics, and analytics for core funnel.

### Should have if low-risk
- Audio attachment.
- Basic path/route geometry.
- Creator attribution and simple version history.
- Map clusters and category filters.
- Local draft saving.

### Explicitly not required for first release
- Centimetre-accurate world-locked AR/VPS.
- General-purpose 3D mesh authoring.
- Underground terrain-aware publishing.
- Full multiplayer collaboration.
- Voice/video rooms.
- Global advertising marketplace.
- Complex billing and enterprise administration.
- Custom WebGL map renderer replacing the selected map engine.

## 8. World Explorer direction

Use one map engine as the geographic renderer. Evaluate MapLibre GL JS first for:
- Globe projection at global scale;
- zoom/pan transitions into regional and street-scale map views;
- vector tile styling and custom layers;
- mobile performance and touch interaction;
- integration with a provider-neutral Moment overlay.

The map engine is not the source of truth for Monument content. Monument owns Moment IDs, geometry, permissions, search, ranking, and spatial queries.

Cairn is a visual/interaction reference, not a product architecture. Reuse its restrained cartographic language, line work, globe atmosphere, layer controls, and geographic interaction patterns where appropriate. Do not force a scroll-triggered scatter-to-globe transition into core navigation.

Street-level detail, satellite imagery, 3D buildings, terrain, and global coverage depend on tile/data providers, licensing, availability, and cost. Do not promise uniform detail until tested in target regions.

## 9. Spatial model

- Canonical horizontal reference: WGS84 latitude/longitude.
- Convert to local East-North-Up coordinates for nearby geometry editing/rendering.
- Use ECEF/local-origin transforms for globe-scale rendering where required.
- Declare vertical reference explicitly: AGL, AMSL with named datum, or below-ground depth tied to terrain model/version.
- Use geodesic calculations for footprint/area and distance entitlements.
- Treat GPS and device orientation as uncertain observations; store accuracy and provenance.
- Keep map, list, globe, and camera as projections of the same Moment data.

Large surfaces require server-side limits for footprint, span, geometry complexity, media size, terrain sampling, and rendering cost. Large global content must be tiled/chunked with levels of detail.

## 10. Logical architecture

Start as a modular monolith with explicit module interfaces.

### Client
- App shell and navigation
- World Explorer
- Creator Studio
- Moment detail and presentation
- My Space
- Camera/AR adapter
- Shared design system and state contracts

### Product API / domain modules
- Identity and memberships
- Workspace and Project
- Place and spatial index
- Moment and geometry
- Media and asset processing
- Publishing and scheduling
- Discovery and ranking
- Moderation and reporting
- Session and realtime (introduced after persistent Moment loop)
- Entitlements and billing (after cost model validation)
- Analytics and audit

### Infrastructure adapters
- PostgreSQL/PostGIS or PostgreSQL with a proven spatial extension/index strategy
- Object storage for media
- Map tiles/geocoding/terrain provider adapters
- Realtime provider adapter
- Email/notification adapter
- Observability and error reporting

Avoid provider-specific logic leaking into domain entities. Use adapters where portability is useful, while preserving meaningful provider differences such as pricing, licensing, quota, and regional coverage.

## 11. Data and security boundaries

- Monument owns its customer identity, content, geometry, permissions, moderation, and operational data.
- NO OS is not Monument's product database or runtime.
- Any future NO OS connection is a narrow, revocable control-plane integration for approved metadata and aggregate operational health.
- Precise user location and movement are not exported to NO OS.
- All reads/writes enforce server-side authorization.
- Public visibility does not imply write access.
- Media uploads require type/size validation and safe processing.
- Sensitive actions are auditable.
- Deletion and retention behavior must be explicit and tested.
- User location permission is requested only at the moment it is needed and can be declined without blocking core use.

## 12. Realtime strategy

Do not implement broad multiplayer before proving persistent Moment value.

First realtime experiment:
- one published Moment;
- two to five participants;
- join/leave and ephemeral presence;
- shared selection;
- one server-authoritative annotation or transform;
- idempotent commands and sequence numbers;
- reconnect and snapshot recovery;
- authorization and abuse tests.

Keep presence and high-frequency sensor telemetry ephemeral by default. Do not broadcast raw GPS continuously.

## 13. Monetization hypotheses

Do not sell physical land rights. Monetize digital capabilities and service resources.

Potential segments:
- Individual creator: publishing allowance, media, geometry, versioning.
- Collective: seats, collaboration, moderation, Sessions.
- Institution/venue: site licences, multilingual publishing, analytics, support.
- Tourism: routes, destination layers, scheduled experiences.
- Campaign: labelled sponsorship and verified aggregate engagement.

Price limits should reflect actual cost drivers: footprint, geometry complexity, media storage/egress, active Moments, collaborators, concurrent Session participants, and support. Exact plans and prices remain unapproved until pilots and cost measurements exist.

## 14. Product design direction

- Calm, precise, editorial, spatial interface; avoid generic dashboard styling.
- Dark and light themes may coexist, with strong contrast and legible map labels.
- Orange accent is a controlled signal, not a blanket fill.
- Consistent icon grid, sizes, spacing, typography, and component states.
- Primary actions stay visible; do not bury camera capture behind a secondary tab.
- Sessions and content are grouped into clear cards/chunks with hierarchy.
- Map/camera controls remain reachable on mobile; secondary diagnostics are collapsible.
- Content displayed on a spatial surface must also be represented in the content model and accessible in non-AR detail views.

## 15. Success metrics for validation

Activation:
- time from sign-up to first published Moment;
- percentage of new users publishing a first Moment;
- publish completion and failure rate.

Discovery:
- search-to-Moment-open conversion;
- map/globe browse-to-open conversion;
- share-link opens and return visits.

Retention:
- creators publishing a second Moment;
- active Moments revisited over 7/30 days;
- repeat visitors to public Moments.

Quality:
- map load and interaction latency;
- successful place search rate;
- geometry validation failure rate;
- camera permission success and camera startup success;
- crash/error-free sessions on target mobile devices.

Economics:
- storage and egress per active Moment;
- map/geocoding/terrain cost per active user;
- moderation cost;
- Session cost per participant-minute when introduced.

## 16. Delivery sequence and gates

### Gate 0 — Product contract
Approve domain definitions, first-release scope, and user journeys. This document is the baseline; open questions are recorded separately.

### Gate 1 — Vertical slice
A user can sign in, create a text/image Moment, place it, publish it, find it in Explorer, open it, and share its URL. Data persists across sessions and devices.

### Gate 2 — Explorer quality
Globe-to-city/street map navigation, search, filters, clusters, responsive touch controls, and tile-provider behavior are tested on target devices/regions.

### Gate 3 — Spatial authoring
Basic area/path geometry, previews, validation, geodesic limits, and stable editing are available.

### Gate 4 — Field experience
Camera flow, permission denial, location accuracy, orientation diagnostics, and non-AR fallback are verified on physical Android devices. AR/VPS is a separately scoped capability.

### Gate 5 — Social/live proof
Two-to-five-device Session experiment passes reconnect, authorization, abuse, and latency tests.

### Gate 6 — Commercial pilots
Run small pilots with creators, collectives, and one institution/tourism partner. Approve pricing only after usage and cost evidence.

## 17. Current repository reality

As of this document:
- The repository contains an imported browser Spatial Engine prototype and supporting documentation.
- The full Indoor/Outdoor app shell and recent camera/content UX fixes are not yet migrated.
- A production backend and persistent Moment lifecycle are not yet verified.
- No Monument-specific Vercel Git project is confirmed.
- Local installation/build/tests and physical-device tests have not been completed.

Do not describe the product as implemented based on this blueprint.

## 18. Open decisions

1. Is Workspace mandatory for an individual creator or created lazily?
2. What minimum account verification is needed for public publishing?
3. Which map tile provider has acceptable coverage, licensing, and cost for initial target regions?
4. Is PostGIS required immediately, or can the first spatial query volume be handled with PostgreSQL indexing and a later PostGIS migration?
5. What is the minimum moderation workflow for public geospatial content?
6. What content types are included in the first vertical slice?
7. Which regions and device classes are the first supported test matrix?
8. What does "permanent" mean operationally for retention, moderation, and publisher deletion?

## 19. First implementation target

Build one complete vertical slice before adding more isolated prototypes:

**Sign in → Create Moment → Place Moment → Publish → Discover on Globe/Map → Open Moment → Share.**

Every part must use the same persisted Moment ID and server-side authorization. The first release is successful when this journey works end-to-end on a real mobile device, not when a map or editor demo looks impressive.
