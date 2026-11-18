# Migration Status

- Status: Partial snapshot import; full application migration is not complete
- Date: 2026-11-18
- Source repository: Hoohaahaa/Portfolio
- Source branch: monument-studio-v1
- Source commit inspected: e0ab98940929e68043545c8fa741334bc8177d30

## Imported into Monument

- engine.html, engine.css, engine-core.js, engine.js
- vendored Leaflet JS/CSS and Leaflet license
- tests/engine-core.test.cjs
- engine architecture, geometry, system-map, event-catalog, test-matrix docs
- engine README, issue register, and research register
- New product architecture, NO OS alignment, Cairn assessment, monetization hypotheses, and ADR 0001

## Not yet migrated

- The broader Portfolio app shell and Indoor/Outdoor Field Test application code (app.js, field.js, marker.js, style.css, index.html).
- The recent Indoor camera and content-card fixes currently committed on the source branch.
- Build and deployment configuration (build.cjs, service worker, Vercel routing, and static hosting setup).
- Any verified Supabase-backed Cairn prototype, schema, migrations, RLS policies, or stored user data.
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

1. Inspect dependencies of Indoor/Outdoor Field Test and extract the product UI into a clean Monument app structure.
2. Recover and identify the separate Supabase prototype, if it exists, before reusing any schema or data.
3. Add a deterministic local dev server and test/build scripts.
4. Run unit, integration, and device tests in the new repository.
5. Configure a separate preview deployment only after the source is runnable.
6. Keep Portfolio untouched; delete nothing from the source branch until the extracted app is verified.
