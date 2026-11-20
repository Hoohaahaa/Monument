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
1. Build the current VPS-diagnostic fix in CI; confirm success and retrieve the APK.
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
