# ADR 0001: Place as a Persistent Spatial Layer

- Status: Proposed for product-owner confirmation
- Date: 2026-11-18
- Scope: Core product identity and Place phase
- Related: Cairn concept, NO OS ADR-0001 and ADR-0002

## Context

The Cairn concept presents one globe with three spatial shells (crust, surface, sky), location-aware data, search, point selection, time navigation, and a field report. Monument has a spatial engine prototype, but it does not yet provide a persistent, user-authored global Moment model.

The product direction includes Moments that can be placed on the ground, below ground, or in the sky; remain addressable over time; cover large bounded surfaces; and support individual, collective, advertising, and tourism use cases.

## Decision proposal

1. Make a persistent, spatially anchored Moment the core publishable object.
2. Model Subsurface, Surface, and Sky as strata of one world coordinate system, with explicit vertical references.
3. Separate persistent Moment state from time-bounded live Sessions.
4. Make globe, map, camera, and list views projections of the same Moment records.
5. Bound large placements by geometry complexity, footprint, media, delivery, and audience costs; do not imply real-world land ownership.
6. Keep product data in Monument. Any NO OS integration is limited to approved metadata and operational summaries.
7. Start with a modular monolith and explicit interfaces; defer provider selection and distributed infrastructure until tested workloads justify them.

## Alternatives considered

- Map pins only: easy to ship, but cannot express vertical strata, surfaces, volumes, or immersive geometry.
- Camera-first AR objects: compelling locally, but poor for global discovery, authoring, permissions, and accessibility.
- A global 3D globe only: strong discovery metaphor but insufficient as authoring, persistence, and collaboration model.
- One flat map with layer toggles: useful navigation but hides vertical semantics and scale.
- One unlimited global canvas: conceptually simple but unsafe for rendering, moderation, rights, and cost control.

## Consequences

The domain model needs explicit geometry, coordinate references, ownership, visibility, lifecycle, moderation, versioning, and spatial queries. Renderer and provider APIs must be replaceable. Large surfaces need tiling and level-of-detail. Persistent Moments can be discovered without opening a live Session.

## Validation required

- Reconstruct one Moment at a known WGS84 anchor on two devices.
- Test surface, subsurface, and sky reference semantics.
- Measure large polygon/curtain performance and payload.
- Verify persistence across reload and account/device.
- Test access control, ownership, moderation, and deletion.
- Run a two-to-five-person Session with reconnect and event ordering.
- Validate cost per Moment, media payload, and Session participant-minute.

## Revisit when

User research, terrain/AR tests, cost measurements, legal review, or a first paid pilot invalidates the model.
