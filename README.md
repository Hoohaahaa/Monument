# Monument

A platform for creating, placing, discovering, and sharing persistent spatial experiences in the real world.

Monument is an independent product. Its customer experience, business logic, operational data, runtime, and release lifecycle remain separate from NO OS and the personal portfolio.

## Product loop

- Create: author spatial objects, content, geometry, and interaction rules.
- Place: anchor persistent Moments to real-world locations and spatial strata.
- Discover: find experiences through globe, map, camera, and contextual views.
- Interact: participate alone or with others through persistent content and live Sessions.
- Evolve: preserve versions, provenance, moderation history, and change history.

## Core domain

World → Place → Moment → Session → Participant / Interaction → Event / State History.

A Moment is a persistent spatial entity. A Session is a time-bounded live instance in which people interact with one or more Moments. Persistence and live presence are separate concepts.

## Product definition

- [Product Blueprint v1](docs/product/PRODUCT_BLUEPRINT_V1.md)
- [First-Person Geospatial Product Direction](docs/product/FIRST_PERSON_GEOSPATIAL_PRODUCT_DIRECTION.md) — accepted product direction and implementation contract; read before continuing spatial-camera work.

## Architecture status

This repository begins with architecture and product decisions. Documents are hypotheses or accepted constraints only where explicitly labelled. A documented capability is not necessarily implemented, tested, or operational.

- [Place and World Model](docs/architecture/PLACE_AND_WORLD_MODEL.md)
- [Functional Globe ↔ Map Projection](docs/architecture/GLOBE_MAP_PROJECTION.md)
- [Realtime and Multiplayer Architecture](docs/architecture/REALTIME_MULTIPLAYER.md)
- [Cairn Reuse Assessment](docs/research/CAIRN_REUSE_ASSESSMENT.md)
- [NO OS Alignment](docs/architecture/NO_OS_ALIGNMENT.md)
- [Monetization Hypotheses](docs/business/MONETIZATION_HYPOTHESES.md)
- [Decision Record](docs/decisions/0001-place-and-persistent-moments.md)

## Spatial Engine prototype

The first spatial-engine prototype has been imported from the isolated Portfolio development branch. It is a browser prototype, not yet a production AR or persistent Moment platform. Run the pure geometry tests with `npm test` in a Node.js 20+ environment. The editor page is `engine.html`; its Leaflet assets are vendored under `vendor/`.

See [migration status](docs/architecture/MIGRATION_STATUS.md) before treating the imported files as the complete application.

## Native Android / ARCore bridge

- [Android camera runtime](android/README.md) — native ARCore camera-passthrough milestone v0.2.0. First verify live camera on the target phone before adding Geospatial/terrain. The previous v0.1 probe failed user acceptance; see [Issue #20](https://github.com/Hoohaahaa/Monument/issues/20).
- [Samsung Galaxy A32 compatibility assessment](docs/device/SAMSUNG_GALAXY_A32_ARCORE_ASSESSMENT.md) — official catalogue findings and runtime verification steps.

## Working rules

Evidence before certainty. Product autonomy and explicit integration contracts. Smallest sufficient architecture. Least privilege and data minimization. Distinguish proposed, implemented, tested, and operational states. Document alternatives, failure paths, costs, and revisit conditions.

## Persistent project context

For continuity across chats, read [docs/NEXT_SESSION.md](docs/NEXT_SESSION.md), [docs/PROJECT_STATE_AND_HANDOFF.md](docs/PROJECT_STATE_AND_HANDOFF.md), and [docs/DECISIONS.md](docs/DECISIONS.md) first. The handoff is the source of truth for implementation status, build history, failures, rejected paths, and exact next steps. Keep this handoff updated after every material change so work can continue across chats without losing context.
