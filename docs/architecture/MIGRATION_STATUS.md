# Migration Status

- Status: Partial snapshot import; full application migration is not complete
- Date: 2026-11-18
- Source repository: Hoohaahaa/Portfolio
- Source branch: monument-studio-v1
- Initial source commit inspected: e0ab98940929e68043545c8fa741334bc8177d30
- Latest source deployment inspected: 0e0e8cd2b0f4d34ee24740b6719e6856a347c806 (branch `monument-studio-v1`, 2026-11-18)

## Imported into Monument

- engine.html, engine.css, engine-core.js, engine.js
- vendored Leaflet JS/CSS and Leaflet license
- tests/engine-core.test.cjs
- engine architecture, geometry, system-map, event-catalog, test-matrix docs
- engine README, issue register, and research register
- New product architecture, NO OS alignment, Cairn assessment, monetization hypotheses, and ADR 0001

## Additional source findings from 2026-11-18

The current source branch is substantially ahead of the initial engine-only snapshot. The source app includes `index.html`, `app.js`, `style.css`, `spatial.js`, `media.js`, `xr.js`, `marker.js`, and `field.js`, plus API handlers under `api/` and shared modules under `lib/`.

The current app supports separate indoor marker-based and outdoor Earth-referenced creation flows, account registration/login/recovery, draft/publish/unpublish, revisions, shareable links and QR codes, local media storage, camera/QR field testing, and a session-scoped local XR placement mode. Important limitations are explicit in the source: QR is 2D marker detection rather than persistent room tracking; local XR anchors are session-scoped rather than cloud/geospatial anchors; outdoor terrain/line-of-sight and alignment are not fully verified.

The current source uses `@neondatabase/serverless` and `DATABASE_URL` in its account/registry API. An older `api/works.js` endpoint is also present and has a different editor-key / `PUBLISH_SECRET` model. Do not migrate both persistence models as if they were one coherent backend. The schema/migration source for the active `monument_registry`, `monument_accounts`, `monument_sessions`, `monument_revisions`, and `spatial_publish_limits` tables has not yet been located or verified.

## Not yet migrated

- The broader Portfolio app shell and Indoor/Outdoor Field Test application code (app.js, field.js, marker.js, style.css, index.html).
- The recent Indoor camera and content-card fixes currently committed on the source branch.
- Build and deployment configuration (build.cjs, service worker, Vercel routing, and static hosting setup).
- Any verified Supabase-backed Cairn prototype, schema, migrations, RLS policies, or stored user data.
- The active Neon SQL schema/migrations for the source app's account and registry tables.
- Full original Git commit history from the Portfolio repository.

## Why this is a partial import

The previous source branch lives inside a large personal Portfolio repository. Copying the entire repository would bring unrelated portfolio code and assets into Monument. The initial import therefore isolates the standalone Spatial Engine and its relevant documentation first. The remaining product UI must be extracted with its dependencies and routes deliberately, not copied blindly.

## Verification state

- GitHub file writes: confirmed for the imported files.
- Local install/build/test in the new repository: not yet run.
- Physical Android camera/sensor test: not yet run.
- New Vercel project/deployment: not yet configured.
- Supabase-backed Moment persistence: not verified or implemented.

## Next migration steps

1. Recover the active Neon schema/migrations and verify which API persistence model is authoritative.
2. Extract the current app shell and Indoor/Outdoor Field Test code, preserving the latest camera and grouped-content fixes.
3. Remove the legacy `api/works.js` model only after confirming it is unused; do not carry two competing registries forward.
4. Add a deterministic local dev server and build/test scripts, then run them in the new repository.
5. Run unit, integration, security, and physical Android device tests.
6. Create/link a dedicated Monument Vercel project after the app is runnable; keep preview deployment separate from Portfolio.
7. Keep Portfolio untouched; delete nothing from the source branch until the extracted app is verified.


## Migration update — 2026-11-18

The camera-first application shell and outdoor/indoor field-test modules have now been extracted into the standalone Monument repository on branch `restore-camera-first-field` (draft PR #8). The source Portfolio branch remains untouched.

- Restored: `index.html`, `app.js`, `style.css`, `field.js`, `spatial.js`, `media.js`, `marker.js`, `xr.js`, and `sw.js`.
- Added deterministic `npm run build`, Vercel static routing, and CI.
- Added `Spatial.projectToFieldOfView` and six focused projection tests.
- GitHub Actions build and tests pass: 15/15 tests.
- The existing Spatial Lab remains unchanged.
- Local authoring and IndexedDB media work without the unverified API backend; cloud account, registry, cross-device publishing, global discovery and analytics remain out of scope until the Neon schema and authorization model are audited.
- Device QA, browser interaction QA and a new Vercel preview deployment remain pending. No production deployment or merge has occurred.
