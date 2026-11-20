# Migration Status

- Status: Partial snapshot import; full application migration is not complete
- Source repository: Hoohaahaa/Portfolio
- Source branch: monument-studio-v1
- Canonical target repository: Hoohaahaa/Monument
- Last verified: 2026-11-20

## Imported into Monument

- engine.html, engine.css, engine-core.js, engine.js
- vendored Leaflet JS/CSS and Leaflet license
- tests/engine-core.test.cjs
- engine architecture, geometry, system-map, event-catalog, test-matrix docs
- engine README, issue register, and research register
- Product Blueprint, Place/World model, NO OS alignment, Cairn assessment, monetization hypotheses, and ADR 0001

## Product source still awaiting migration

The current full Studio application remains on `Hoohaahaa/Portfolio` branch `monument-studio-v1`. It includes:

- `index.html`, `app.js`, `style.css`, `spatial.js`, `media.js`, `xr.js`, `marker.js`, and `field.js`
- `api/auth.js`, `api/registry.js`, `api/health.js`
- `lib/model.cjs`, `lib/server.cjs`
- build, routing, service-worker, and test configuration

It supports account registration/login/recovery, indoor and outdoor creation, drafts, publish/unpublish, revisions, public visitor links, QR codes, local media, camera field tests, and session-scoped local XR placement. QR remains 2D marker detection; local XR anchors are session-scoped, not persistent world anchors. Outdoor terrain line-of-sight and alignment are not fully verified.

**Migration rule:** Monument is the canonical destination for product code and releases. Portfolio's `monument-studio-v1` is a temporary migration source and historical reference only. Do not delete or rewrite it before a history-preserving extraction is complete. Do not continue adding product features there once extraction work begins.

## Source-of-truth decisions

- **Database:** Neon PostgreSQL is the only persistence platform. PostGIS is the intended spatial extension, but it is not currently installed on the verified preview branch.
- **Active application model:** the current Studio uses `api/auth.js` and `api/registry.js` with `monument_accounts`, `monument_sessions`, `monument_registry`, `monument_revisions`, and `spatial_publish_limits`.
- **Legacy model:** `api/works.js` uses the separate `monument_experiences` table and editor-key / `PUBLISH_SECRET` flow. It is not the canonical registry. Do not merge the two models or migrate both as active paths. Remove the legacy endpoint only after reference and runtime checks.
- **Experimental tables:** `spatial_works` and `monument_city_works` are not the primary product registry.
- **Domain model:** Moment data is independent of its renderer. Globe, map, camera, and AR are different views/interaction layers over the same persistent Moment.
- **3D renderer:** evaluate CesiumJS for the first WGS84 globe/altitude prototype. Keep Leaflet for existing 2D placement until the new globe proves its value; do not rewrite the map stack prematurely. MapLibre is not the selected 3D globe engine.
- **AR:** ARCore remains a later local-spatial layer. It is not required for account creation, publishing, or discovering a Moment.
- **Deployment:** the long-term Vercel project must be Git-connected to the Monument repository. Inline deployments and deployments sourced from Portfolio are transitional only.

## Verified backend and deployment checkpoint — 2026-11-20

- Neon project `monument-spatial-records` contains the active account/registry/revision tables on both its `main` and `monument-studio-preview` branches.
- The preview branch is isolated from production. Its Vercel `DATABASE_URL` is configured for the preview environment only; the connection was refreshed and the Studio preview redeployed.
- The redeployed preview's `/api/health` returned HTTP 200 with `storage: reachable`; `/api/auth` returned HTTP 200 with no active browser session.
- Vercel build completed successfully and the test suite reported 21 passing tests.
- The current preview deployment is still built from Portfolio branch `monument-studio-v1`, commit `22a9745eefc80b40e992d90b45a6caa8ea15901a`. The Vercel project is not yet a reproducible Git-linked deployment from the Monument repository.
- No public published Moment was found in the preview registry at this checkpoint. Therefore the two-device create → persist → publish → discover flow is **not yet proven**.
- PostGIS is not installed on the preview database. The current registry stores the spatial fields in JSONB; a typed spatial schema and geometry indexes remain future migration work.

Preview URL (transitional Portfolio-sourced build):
https://monument-studio-preview-lp3w1b4ik-mos-projects-efbc27a5.vercel.app/

## Next implementation sequence

1. Extract the full Studio application from Portfolio into Monument with a history-preserving Git operation (subtree/filter-repo or equivalent). Keep Portfolio intact as the historical source until verification.
2. Bring across only the active `auth` + `registry` persistence path and its verified SQL migrations. Keep `api/works.js` and `monument_experiences` out of the active app.
3. Add deterministic local development, CI build/test, and browser/API integration tests in Monument.
4. Create a dedicated Git-connected Vercel project for Monument after the migrated app builds from the Monument repository. Configure preview and production database branches separately; never reuse preview credentials in production.
5. Complete one vertical slice: sign in → create one Moment → save draft → publish → open the public visitor URL from a second browser/device → verify the same revision and location.
6. Then add the PostGIS-backed typed spatial model and the CesiumJS WGS84 globe prototype, with reference geometry tests (including horizon/visibility cases).
7. Keep ARCore/VPS, multiplayer, sky/weather content, monetization, and underground layers out of the critical path until the vertical slice is proven.

## Deferred / explicitly not claimed

- No world-locked AR anchor is claimed.
- No persistent indoor anchor is claimed.
- No terrain-aware global line-of-sight is claimed.
- No PostGIS-backed spatial query is claimed yet.
- No two-device publishing test is claimed yet.
- No guarantee of permanent storage is made; retention is subject to platform operation and policy.

Do not add more architecture documents for now. Update this checkpoint only when code, tests, deployment, or product behavior materially changes.
