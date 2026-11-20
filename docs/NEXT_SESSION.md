# Monument — Next Session / Current Handoff

Last updated: 2026-11-20

## Where we are
- Physical device: Samsung Galaxy A32 4G (SM-A325F).
- Native ARCore camera passthrough: **PASS**.
- Google Cloud ARCore API and Android OAuth client: **configured**.
- Physical Geospatial test: **PASS** — user reports `Earth Tracking: TRACKING` and live WGS84/EUS values.
- Observed horizontal accuracy (`H`): fluctuates from about **±200 m down to ±8 m**.
- Observed vertical accuracy (`V`): user has not supplied a range yet.
- Observed yaw accuracy: improves/fluctuates from about **±30° to ±14°**. This is angular uncertainty, not the actual phone heading.
- VPS: user sees no VPS/Availability line on the current installed diagnostic build. The source calls `checkVpsAvailabilityAsync`, but its callback output was being overwritten by the continuously refreshed Geospatial status.
- App remains a diagnostic native shell; approved product UI is the existing camera-first web experience with Camera / Place / Create / Publish.

## Latest code change

### VPS location refresh fix (2026-11-20)
- User installed the diagnostic APK and reported `VPS: UNAVAILABLE`, including after trying a nearby outdoor location.
- Code inspection confirmed the renderer queried VPS only once at the first valid pose. A later location change did not cause a new query, so the displayed status could be stale.
- Fixed on branch: recheck when the pose moves at least 100 m; otherwise retry every 5 minutes. Prevent overlapping checks and ignore stale callbacks after session/mode reset.
- Commits: `9f298d9ec2d98e7f85b547a9051b3aaaf4cee980`, `669d40e175474630c1a119d054af624dc731b030`.
- These commits are source-only until CI succeeds and a new APK is installed. Do not claim this has resolved geographic VPS coverage.
- A fresh `UNAVAILABLE` means no VPS coverage at those exact coordinates. Network/auth/resource errors are different states and must not be misreported as coverage gaps.
- User currently cannot travel for more tests; do not ask them to relocate now.

## XR / glasses platform direction
- Treat spatial glasses/headsets as a first-class target alongside phones.
- Distinguish Meta Quest / Horizon OS mixed-reality headsets from Ray-Ban Meta AI glasses. Quest-class devices support immersive/passthrough spatial apps; Ray-Ban devices have different capabilities, with displayless and display models.
- Preserve a platform-independent Monument spatial data model and typed runtime contract. Keep content, publishing, identity, permissions, and backend shared.
- Android phone: ARCore Geospatial + Kotlin native runtime.
- Meta Quest / Horizon OS: investigate WebXR for a reusable web-based spatial renderer, and Meta Spatial SDK (Kotlin) for spatial Android-style panels; Unity/C# + OpenXR is the stronger route if Monument needs a full immersive 3D renderer, hand tracking, passthrough, and broader headset portability.
- Ray-Ban AI glasses: evaluate Meta Wearables Device Access Toolkit / standalone Web Apps separately. Do not assume the displayless glasses can render full spatial overlays.
- Do not rewrite the current Android client or select a full XR engine before the spatial data model, anchors, and interaction contract are stable.

## Latest code change
- `CameraBackgroundRenderer.kt` updated so VPS state is stored and rendered as a persistent line in the same Geospatial diagnostic block.
- VPS states should read `NOT CHECKED`, `CHECKING`, or the returned ARCore availability enum (for example `AVAILABLE` / `UNAVAILABLE`), or a check failure.
- The yaw label now explicitly says `yaw accuracy` to avoid confusing uncertainty with actual heading.
- This is a source change only until GitHub Actions produces a successful APK and it is installed on the phone. Do not claim the user can see it before that.

## Interpretation / quality policy
- H is horizontal position uncertainty in metres; V is vertical position uncertainty in metres; neither is a percentage.
- Yaw accuracy is uncertainty in degrees; it is not the heading value itself.
- Values can fluctuate as ARCore fuses GNSS, visual-inertial tracking, and geospatial signals. `TRACKING` means a pose is available, not that it is precise enough for every publishing use.
- Do not silently convert a poor accuracy reading into a high-confidence anchor. Future placement flow should expose accuracy and gate precision-sensitive placement or clearly mark it approximate.
- VPS availability is a separate location-level availability check. It is not proof that a live VPS localization fix is currently being used.

## Next steps, in order
1. **Complete:** Build #42 succeeded and its APK was retrieved and verified; see the Build #42 section below.
2. User installs it and reports the exact `VPS:` result plus H/V/yaw accuracy ranges after standing still and while moving.
3. Add a short rolling stability window / quality state (e.g. acquiring, approximate, stable) with thresholds selected from field evidence, not arbitrary guesses.
4. Implement transparent Android WebView compositor above the ARCore camera, preserving the approved web app and avoiding a second browser camera stream.
5. Implement a versioned native JS bridge that sends typed Earth tracking, pose, accuracy, heading, VPS, and lifecycle events.
6. Physically test Camera / Place / Create / Publish on the A32.
7. Only then implement reliable world-anchored content and terrain/contour overlays.

## Do not repeat
- Do not ask user to redo Google Cloud OAuth or precise location permission unless a regression occurs.
- Do not repeat basic camera passthrough test unless a regression occurs.
- Do not call VPS confirmed until the on-device result is observed.
- Do not replace the approved web UI with a native-only mock.
- Do not alter production Vercel aliases without explicit approval.

## Recent commits
- Geospatial diagnostic field reference and physical tracking milestone documented earlier.
- VPS persistence fix: `766d6850a18f99007a4bb7f5f3fd994b3b2e4482`.


## Latest VPS refresh build — 2026-11-20
- Build #39 succeeded: [GitHub Actions](https://github.com/Hoohaahaa/Monument/actions/runs/44724045833).
- Run ID: `44724045833`; commit: `669d40e175474630c1a119d054af624dc731b030`.
- Artifact: `monument-camera-passthrough-debug`; artifact ID `14623331612`.
- APK extracted and verified at `/mnt/data/monument-build39/app-debug.apk` in the assistant's active runtime. Package `dev.monomatter.monument`, versionName `0.2.1`, versionCode `3`.
- Signing SHA-1 remains `eb565d1f058175eeb0a5c0c4d7233d99bade6867`, same stable CI signing key used for OAuth.
- Build #38 failed during Gradle build on the intermediate commit; #39 includes both VPS refresh commits and succeeded.
- User reported `VPS: UNAVAILABLE` in Iran and tried another nearby outdoor area, but cannot currently travel for further testing. Do not ask them to relocate.
- New build rechecks VPS after >=100 m reported location change or every 5 minutes, whichever occurs first; prevents concurrent requests and ignores stale callbacks after session/mode reset.
- User should install build #39 when convenient. Next report should capture exact `VPS:` enum and H/V/yaw readings; do not claim this fixes Google VPS regional coverage.

## Approved positioning architecture (product decision)
- Three layers are required as a permanent Monument architecture, not a temporary workaround:
  1. Global visual-geospatial: ARCore Geospatial with VPS when available.
  2. Device-local: GNSS/GPS + visual-inertial tracking and device sensors.
  3. Local reference / assisted anchoring: local calibration/reference target for precision-sensitive relative placement; technology intentionally undecided.
- Maintain source provenance, timestamps, uncertainty, coordinate-frame transforms, and anchor scope (global/device/local).
- Use rolling confidence states; no placement may be called precise based on `TRACKING` alone.
- VPS is optional; absence must degrade capability/precision gracefully, not block Monument globally.
- Iran is the current test region. Region-specific VPS coverage, network access, authorization, and device/service compatibility must be diagnosed separately; do not assume one is the cause.
- Full architecture and confidence policy are documented in `docs/GEOSPATIAL_DIAGNOSTICS.md`.


## VPS status update and development priority — 2026-11-20

- User reports the VPS line still reads UNAVAILABLE.
- The planned test of moving >=100 m to trigger a fresh location query has not been performed yet.
- The APK/build number associated with this latest report is not confirmed. Do not assume the report validates the re-query fix in build #39 until the installed version is confirmed.
- VPS is a first-class capability and deserves a dedicated verification workstream, but it is not the gate for all Monument development. Google's documentation states that Geospatial can work without VPS coverage and that GPS may be sufficient outdoors with clear sky. VPS is most valuable where GPS is weak; it is location-specific.
- Next convenient field check only (no travel required): confirm installed build; record exact VPS enum; after >=100 m movement, wait for a fresh query and compare. Capture H/V/yaw alongside it. Do not pressure the user to perform this now.
- Engineering work to continue meanwhile: formalize the versioned spatial data contract and quality/provenance model; preserve the three localization layers; proceed with the transparent WebView compositor and native bridge without making VPS a hard dependency.
- Before implementing precision-sensitive placement, add diagnostics for VPS query timestamp, freshness, privacy-safe queried location, and distinct network/auth/resource errors. Do not confuse UNAVAILABLE with an error.
- Current field evidence is limited to one user's reported location(s) in Iran. It does not establish nationwide VPS coverage or lack of coverage.

## VPS query provenance update — 2026-11-20
- Renderer now reports the exact availability enum together with CURRENT/STALE state, query age, result age/pending, and rounded queried coordinates.
- Query result time and location metadata reset on new Session / Geospatial mode; callbacks from older requests are ignored.
- Exact ARCore result enum names remain visible so UNAVAILABLE is distinguishable from network/auth/resource errors; synchronous thrown exceptions show a separate request-error label.
- Coordinates are rounded to 3 decimal places for the on-device diagnostic line; no location history is uploaded or persisted by this renderer.
- Source commits: `3130fb45e65e49762b6ea942d2bff96346b9041e`, `3714b58c50a8228ad90e9b7c9313287150300512`, `134a424a328f8017b33dbe786264ba2ad812361f`.
- Build #42 for commit `134a424a328f8017b33dbe786264ba2ad812361f` is **successful**; artifact `14627550889` was downloaded and APK identity/signature verified. See the latest delivery section below.
- User's >=100 m movement test remains pending and is not required immediately.

## Build #42 is complete — latest verified APK (2026-11-20)

- **Build #42 succeeded**: https://github.com/Hoohaahaa/Monument/actions/runs/44732497825
- Built commit: 134a424a328f8017b33dbe786264ba2ad812361f.
- Artifact ID: 14627550889, name: monument-camera-passthrough-debug.
- Verified APK path in the assistant runtime: /mnt/data/monument-build42/app-debug.apk.
- Package: dev.monomatter.monument; versionName 0.2.1; versionCode 3.
- Signing SHA-1: eb565d1f058175eeb0a5c0c4d7233d99bade6867, matches the known OAuth fingerprint. User can install over the earlier app; do not ask them to uninstall first unless Android reports a signature conflict.
- This build includes persistent VPS query provenance diagnostics: exact enum, CURRENT/STALE freshness, query/result age, pending state, privacy-rounded query coordinates, separate request exception display, reset metadata on Session/Geospatial mode changes, and stale callback protection.
- User has not yet confirmed installation or read the new VPS line. Earlier UNAVAILABLE report is not proof that build #42's refreshed query returned UNAVAILABLE.

## Highest-quality VPS strategy — preserve this direction

- Goal is the **best reliable global positioning quality available**, not “VPS at any cost” and not making Monument VPS-dependent.
- VPS is the preferred global visual-localization enhancer when coverage exists; it is especially valuable where GNSS is weak. Google documents typical VPS-covered performance as better than 5 m and often around 1 m position, with rotational accuracy better than 5 degrees; these are typical, not guaranteed. Clear-sky outdoor GPS may be sufficient in some cases. Official references: https://developers.google.com/ar/reference/c/group/ar-config and https://developers.google.com/ar/develop/geospatial.
- Distinguish five independent checks: (1) app/device support, (2) Cloud API + OAuth authorization, (3) network/service errors, (4) VPS coverage at the exact queried coordinate, and (5) live pose convergence/accuracy. Never collapse them into one “VPS failed” status.
- For a future VPS-covered field session, let ARCore converge and slowly scan visually rich, static, well-lit surroundings that are likely represented in Street View. This may help visual matching but cannot create coverage where none exists.
- The real Monument quality gate is rolling live H/V/yaw uncertainty and stability, not the VPS enum alone. ARCore accuracy values are 68% confidence uncertainty estimates; lower is better. Derive thresholds per use case from real field data.
- Use WGS84 anchors for ellipsoid-height global points, Terrain anchors for height relative to terrain, and Rooftop anchors for height relative to a building roof. Do not mix altitude semantics.
- Preserve the local-reference layer for precision-sensitive repeatable placement. If the requirement exceeds ARCore's demonstrated accuracy, investigate surveyed references / calibration targets and, only if justified, RTK/survey-grade input. Never promise centimetre accuracy from VPS.
- Rejected direction: pause all work until VPS is AVAILABLE. Reason: VPS is location-specific and not required for all Geospatial or local-reference workflows. Continue the native/WebView compositor and spatial contract in parallel.
- User does not need to travel or test immediately. When convenient, install build #42 and simply read the VPS diagnostic line; the >=100 m re-query validation can wait.

## Current next actions for the assistant

1. Share the verified build #42 APK link; no user action is urgent.
2. When the user has time, collect the exact on-device VPS line plus H/V/yaw ranges; do not ask for another location trip.
3. Continue implementation independently: inspect MainActivity, renderer, manifest/Gradle, index.html, app JS/CSS, and engine/native-arcore-bridge.js; then implement the transparent WebView compositor and versioned native bridge while preserving the approved camera-first UI and native ARCore camera. Avoid a second browser getUserMedia() stream.
4. Update this handoff and decision log after each meaningful implementation choice, including alternatives not selected and why.


## Latest user field report + next diagnostic build (2026-11-20)

- User reports that after moving, Build #42 still shows `VPS: UNAVAILABLE · CURRENT`; query age was around 90 seconds. They asked whether further movement is necessary. **Answer: no further travel is needed now.**
- Explain the `@...` suffix: it is query latitude, longitude in decimal degrees, rounded to 3 decimals, not an error ID. Latitude appears first. Protect exact coordinates; only ask for the rounded suffix if needed.
- Important: automatic query runs after >=100 m movement from the previous query point, or every 5 minutes. A shorter move may leave the old query in place. `CURRENT` only means query age <5 min; it does not prove it checked the new location.
- I inspected the renderer. Added query-to-current-pose distance and pose age to the diagnostic line, plus a manual `RECHECK VPS AT CURRENT LOCATION` button. It uses the latest ARCore tracked pose and has a 30-second cooldown to avoid accidental quota use.
- Commits: renderer `468c0a6e67547a23bc62c8ce5cb725f0cc4ffb6f`; MainActivity `593652452c1b272b0b7dbf6c27b414bb53660ebd`.
- Build #44 is queued: https://github.com/Hoohaahaa/Monument/actions/runs/44742066355. Wait for success and inspect APK/signature before sharing.
- Once Build #44 is installed (only when convenient), user does not need to move: tap the manual recheck button once at the current spot. Read `pose Δ...m`. If delta is small and result remains UNAVAILABLE, accept VPS unavailable at that point and stop repeated tests there. Continue GPS/visual-inertial + local-reference layers. Do not make VPS a global dependency.
- If the result is an explicit `ERROR_NOT_AUTHORIZED` or `ERROR_NETWORK_CONNECTION`, investigate Cloud project/OAuth/network separately. A clean `UNAVAILABLE` is not an auth/network failure.


## Build #44 — verified delivery and immediate handoff (2026-11-20)

- Build #44 **SUCCEEDED**: https://github.com/Hoohaahaa/Monument/actions/runs/44742066355; commit `593652452c1b272b0b7dbf6c27b414bb53660ebd`.
- Artifact `14630678046` downloaded and extracted. Verified APK: `/mnt/data/monument-build44/app-debug.apk` (4,191,920 bytes).
- Package `dev.monomatter.monument`; versionName `0.2.1`; versionCode `3`; signing SHA-1 `eb565d1f058175eeb0a5c0c4d7233d99bade6867` (same signing key as prior builds).
- New UI: `RECHECK VPS AT CURRENT LOCATION`; diagnostics add latest tracked pose age and `pose Δ` from the last VPS query to the current tracked pose. Manual request cooldown is 30 seconds.
- User can install directly over previous build; no uninstall should be needed. At same location, tap manual recheck once when convenient. No relocation required. Send back exact VPS enum plus `pose Δ` and pose age; redact coordinates if sharing full line.
- After that one result, do not repeat local VPS tests if delta is small and result remains UNAVAILABLE. Continue the three-layer positioning architecture and proceed with transparent WebView compositor/native bridge while waiting for field feedback.

## Current next actions
1. Wait for user's optional one-time Build #44 manual VPS recheck; no further travel requested.
2. Independently continue implementation: inspect `MainActivity.kt`, `CameraBackgroundRenderer.kt`, manifest/Gradle, `index.html`, app JS/CSS, and `engine/native-arcore-bridge.js`.
3. Implement transparent Android WebView compositor and versioned JS bridge over native ARCore camera without starting a second browser `getUserMedia()` stream or replacing the approved camera-first web shell.
4. Preserve the three localization layers and record rejected alternatives/reasons in `docs/DECISIONS.md`.
