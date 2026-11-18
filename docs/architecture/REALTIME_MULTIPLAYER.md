# Realtime and Multiplayer Architecture

- Status: Proposed architecture; no realtime transport selected or deployed
- Date: 2026-11-18
- Scope: Multi-user Sessions and shared spatial interaction

## 1. Principle

Monument's persistent spatial content and live collaboration are separate systems:
- Moment: durable spatial object, discoverable over time.
- Session: bounded live instance of an experience.
- Participant: user or guest present in a Session.
- Interaction: requested action by a Participant.
- Event: validated fact that an action or state transition occurred.
- Snapshot: recoverable representation of current Session state.

A Moment can exist without a Session. A Session can reference one or more Moments. A user may discover a Moment without joining its live Session.

## 2. Logical architecture

Clients connect to an authenticated realtime gateway. The gateway routes each Session to an isolated room coordinator. The coordinator validates commands, applies deterministic domain rules, increments the Session sequence, and broadcasts accepted events or state deltas to authorized participants.

Persistent domain changes are committed to PostgreSQL. Ephemeral presence and high-frequency telemetry should not be written as permanent records by default.

Logical path:
Client → Auth/API Gateway → Session Coordinator → Domain Rules → Event/State Store → Authorized Subscribers.

This is a logical boundary, not a requirement for one deployed service per box. Start as a modular monolith with explicit interfaces. Extract room coordinators or realtime infrastructure only when measured connection scale, isolation, or latency requires it.

## 3. Session contract

Minimum fields:
- id, moment_ids, experience_id
- host_user_id or service principal
- status: scheduled, lobby, active, paused, ended, failed
- visibility: private, unlisted, public
- capacity and participant_count
- started_at and ended_at
- rules_version, state_version, last_sequence
- region and policy context where needed

Participant state:
- user/guest identity, role, join time, last heartbeat, connection state, permissions.
- Current pose/location is ephemeral, separately permissioned, and not automatically retained.

## 4. Command and event model

Clients send commands, not authoritative state claims. The server authenticates the actor, checks authorization, validates the command against current state and rules version, and emits an event only after acceptance.

Event envelope:
- event_id: globally unique, deduplicates retries.
- schema_version
- session_id
- sequence: monotonically increasing within one Session.
- type
- actor_id or service principal
- occurred_at in UTC
- correlation_id
- idempotency_key for retryable commands
- payload: minimal typed data.
- visibility_scope or audience.

Consumers tolerate duplicate delivery and reconnect gaps. Do not claim exactly-once delivery. Use sequence checks and snapshots to recover.

## 5. Event classes

- Durable domain events: publish, edit, permission change, purchase, moderation, Session start/end. Persist and audit.
- Live interaction events: reactions, votes, shared selection, collaborative edits. Validate and persist according to product semantics.
- Ephemeral presence: joined/left, typing, coarse pose, transient cursor. TTL/heartbeat; no durable history unless explicitly required.
- Sensor telemetry: GPS/heading/pose samples. Local filtering and rate limits; opt-in and minimum precision; not a public event stream.

## 6. Consistency and recovery

1. Client sends a command with an idempotency key and expected state version.
2. Server checks identity, role, Session status, permissions, limits, and current version.
3. Server applies domain transition transactionally.
4. Event is persisted with a monotonic sequence.
5. Subscribers receive the accepted event.
6. On reconnect, client requests events after its last sequence or a fresh snapshot.

Use a transactional outbox only when reliable asynchronous publication is needed. Keep bounded event history and periodic snapshots for long-running Sessions. Define snapshot cadence by measured replay cost.

## 7. Scale and isolation

A Session is the isolation and routing unit. Many Sessions can be handled by shared workers; do not allocate one dedicated VM per room.

Plan capacity using concurrent connections, messages per second per participant, payload size, fan-out recipients, Session duration, reconnect bursts, geographic distribution, and media/voice traffic.

A large public Session may eventually need one authoritative writer/coordinator, read-only broadcast edges, and regional relays. This is a future scale pattern, not a v1 requirement.

## 8. Technology evaluation, not selected

Candidates:
- Managed realtime: Supabase Realtime, Ably, or a similar provider.
- Room coordination: Cloudflare Durable Objects or a small server-side room service.
- Durable state: PostgreSQL.
- Presence: managed presence or short-TTL room state.
- Voice/video: WebRTC plus SFU/TURN provider; separate from Session event protocol.

The first prototype may use existing Supabase Realtime if the previous Cairn experiment is confirmed and the actual requirements fit. Before production, test quotas, regional latency, commercial pricing, replay semantics, authorization, and exit cost.

## 9. Security and abuse controls

Every subscription is authorized server-side against Session and Moment visibility. Public visibility does not imply write permission. Rate-limit commands per actor, Session, and risk context. Validate spatial bounds and payload size. Prevent replay, duplicate actions, spoofed actors, and stale-state writes. Add host/moderator controls, mute/kick/ban, report, and emergency close. Protect private Session membership and participant location.

## 10. Cost model

Track concurrent connections and connection-minutes, inbound messages and fan-out egress, database writes and retained event bytes, storage and media egress, map/terrain/geocoding usage, voice/video participant-minutes, and moderation workload.

Avoid high-frequency location broadcasting by default. A few semantic events per second are a better starting point than raw sensor streaming.

## 11. First useful experiment

Build a two-to-five-person Session around one existing Moment:
- invite/join/leave;
- shared selection;
- one authoritative transform or annotation action;
- presence with TTL;
- reconnect and snapshot recovery;
- permission denial and duplicate command tests.

Acceptance requires two-to-five real devices, real network conditions, reconnect, authorization tests, and measured cost/latency. A local mock is not proof of realtime operation.
