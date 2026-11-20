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
