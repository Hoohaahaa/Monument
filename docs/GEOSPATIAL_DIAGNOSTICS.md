# Geospatial diagnostics — field reference

## Current diagnostic fields
- **WGS84** — global geodetic reference used for latitude and longitude.
- **EUS** — East-Up-South local ARCore orientation frame.
- **Ellipsoid** — altitude relative to the WGS84 reference ellipsoid; not necessarily ground height or mean sea level.
- **H** — horizontal position accuracy estimate, in metres. `H ±8 m` means an estimated horizontal uncertainty of about 8 metres; it is not a percentage. Readings can fluctuate substantially while GNSS/visual tracking converges or degrades.
- **V** — vertical position accuracy estimate, in metres. It is not a percentage.
- **Yaw accuracy** — `Earth.getCameraGeospatialPose().orientationYawAccuracy`, in degrees. This is uncertainty in yaw, **not the actual heading angle**. For example, ±14° is a tighter estimate than ±30°.
- **VPS** — result of the separate `checkVpsAvailabilityAsync(latitude, longitude)` query. It describes availability at the queried location, not a guarantee of a live VPS localization fix.

## Reading the user's field report (2026-11-20)
On Samsung Galaxy A32 4G (SM-A325F), user reports Earth Tracking = `TRACKING`; H fluctuated from approximately ±200 m down to ±8 m; yaw accuracy varied/improved from approximately ±30° to ±14°. User has not yet supplied V values or a VPS enum. The installed build did not visibly show VPS/Availability.

Interpretation:
- ±200 m horizontal uncertainty is too coarse for precision placement.
- ±8 m is materially better but still not precision-grade for small world-locked surfaces.
- ±14° yaw uncertainty can produce noticeable orientation error; it is not an actual compass heading.
- Do not infer stable localization from a single good sample or from Earth Tracking alone.

## Implementation note
The prior renderer invoked the VPS async check but displayed its callback result as a one-off status message. The next frame's periodic Geospatial status overwrote it. The renderer has now been changed to retain the VPS state and include it in the persistent Geospatial diagnostic line. This source change must pass CI and be installed before the user can see the VPS line.

## Acceptance and product behavior
- Keep tracking state, raw pose, H/V accuracy, actual yaw/heading, yaw accuracy, and VPS availability as separate values.
- A future placement-quality indicator should use a time window (not a single sample), report approximate vs stable states, and avoid claiming precision when H/V/yaw uncertainty is high.
- Choose thresholds only after collecting field observations on the target device and intended environments.


## VPS recheck behavior (2026-11-20)
- Field report: the user installed the VPS diagnostic build and saw `VPS: UNAVAILABLE`, including after trying another nearby outdoor area.
- Source inspection found an important limitation: the renderer queried VPS only once, at the first valid Geospatial pose. Moving the phone did not trigger a query for the new coordinates, so the displayed result could remain stale indefinitely.
- Fix committed on the Android Geospatial branch: query again after the reported location changes by at least 100 m, and retry after 5 minutes while stationary. Only one request may be in flight; stale callbacks are ignored after session/mode reset.
- This is a diagnostic refresh fix, not a claim that VPS coverage exists. A returned `UNAVAILABLE` after a fresh query means Google reports no VPS coverage at those queried coordinates. `ERROR_NETWORK_CONNECTION`, `ERROR_NOT_AUTHORIZED`, and other error enums must be distinguished from `UNAVAILABLE`.
- The next APK must be installed before interpreting another field result. The user does not need to relocate or run another test until they have the practical opportunity.
- ARCore Geospatial can operate without VPS coverage; GPS may be sufficient outdoors, depending on measured H/V/yaw quality. Do not make VPS a hard prerequisite for every Monument workflow.


## Monument positioning architecture decision (2026-11-20)

The product will use three complementary positioning/localization layers. They are not mutually exclusive fallbacks and Monument must not be architecturally dependent on VPS:

1. **Global visual-geospatial layer — ARCore Geospatial + VPS when available.** Use global latitude/longitude/altitude and orientation; query VPS availability for the current pose location. VPS availability is optional and must never be treated as a prerequisite for opening the experience.
2. **Device-local tracking layer — GNSS/GPS + visual-inertial tracking.** Fuse the device location estimate with ARCore camera motion/visual-inertial tracking and device sensors. This supports continuous pose updates when VPS is unavailable, but confidence must reflect GNSS drift and heading/altitude uncertainty. Earth `TRACKING` alone is not a precision guarantee.
3. **Local reference / assisted anchoring layer.** For precision-sensitive placement, allow a locally established reference such as a known marker, surveyed point, QR/image target, or a user-confirmed calibration origin. Local anchors should be expressed relative to a stable local frame and optionally aligned to global coordinates when trustworthy. The exact reference technology is a future design decision; do not assume one marker technology is selected yet.

### Confidence and fusion policy
- Keep raw source measurements and their provenance separate; do not silently blend values without recording source, timestamp, uncertainty, and transform.
- Each placement should expose a quality state such as acquiring / approximate / stable / local-calibrated, based on a rolling observation window and measured uncertainty.
- If global VPS is unavailable, continue in a lower-confidence mode where appropriate; gate or label precision-sensitive publishing rather than blocking the whole app.
- Local calibration can improve relative stability but does not automatically prove globally correct coordinates.
- Record when an anchor is global, device-relative, or local-reference-relative, and preserve transforms between frames.

### Iran / regional test context
- The current field test is being conducted in Iran. Region may affect VPS coverage because coverage is location-specific and depends on Google's visual mapping availability. Network reachability, service authorization/configuration, device support, and location coverage are distinct possible causes.
- Do not conclude that Iran is the cause from a single `UNAVAILABLE` response. Distinguish the ARCore availability enum from thrown/network errors and record the queried coordinates (with user privacy safeguards), timestamp, device, app version, and connectivity diagnostics.
- The user currently cannot travel for additional field tests. Do not require relocation. First validate that the new app build re-queries VPS after movement/time and reports the exact enum correctly.


## VPS importance and current test status (2026-11-20)

VPS is a strategically important accuracy layer for Monument, particularly where GPS is weak (indoors, urban canyons, or visually complex built environments). It is not a universal prerequisite. Google's ARCore documentation explicitly says Geospatial can be used where VPS coverage is absent and that open-sky outdoor GPS may be sufficient; it also describes VPS availability as a location-specific query. See [Google: Check VPS availability](https://developers.google.com/ar/develop/c/geospatial/check-vps-availability) and [VpsAvailability enum](https://developers.google.com/ar/reference/java/com/google/ar/core/VpsAvailability).

**Current report:** The user again sees VPS: UNAVAILABLE. The >=100 m movement/re-query test has not yet been performed. The build number associated with this latest report is not confirmed. Treat the result as a report for the current tested coordinate only; it does not establish that all of Iran is uncovered, nor distinguish a stale result until the movement-triggered refresh is validated.

**VPS workstream — required engineering tasks:**
1. Confirm the installed APK contains the >=100 m / 5-minute re-query change before interpreting the next field result.
2. On a future convenient test (no travel required now), capture the exact enum after the normal query and again after >=100 m movement; record query timestamp and a privacy-safe coordinate reference.
3. Keep UNAVAILABLE distinct from ERROR_NETWORK_CONNECTION, ERROR_NOT_AUTHORIZED, ERROR_RESOURCE_EXHAUSTED, ERROR_INTERNAL, and thrown exceptions.
4. Add diagnostic provenance: queried coordinate (privacy-safe/rounded), query time, result, app/build version, and whether the result is current or stale.
5. If a confirmed fresh UNAVAILABLE persists, investigate coverage at the tested coordinate separately from network reachability, authorization, and device compatibility. Do not label a network/auth failure as missing coverage.

**Development priority:** VPS diagnostics and the positioning data contract are first-class parallel workstreams. They should not block the transparent WebView compositor, shared spatial data model, or non-VPS placement workflows. The product must preserve the three-layer design: global VPS-assisted geospatial, device-local tracking, and local-reference anchoring.

## VPS query provenance diagnostics implementation (2026-11-20)

- Renderer now retains the request start time, result time, and the coordinates actually sent to the availability query.
- On-device status reports the availability enum, CURRENT/STALE freshness, query age, result age/pending state, and coordinates rounded to three decimal places (roughly 100 m latitude granularity). This is a local diagnostic display only; this renderer does not upload or persist a location history.
- Synchronous request exceptions are labeled separately as request errors; ARCore result enum values (including network/authorization/resource errors) remain visible by their exact enum name.
- Request/result metadata is reset when the session or Geospatial mode is reset, and stale callbacks are ignored by request ID.
- Source commits: `3130fb45e65e49762b6ea942d2bff96346b9041e`, `3714b58c50a8228ad90e9b7c9313287150300512`, `134a424a328f8017b33dbe786264ba2ad812361f`.
- CI build #42 completed successfully; the verified APK artifact is documented in the Build #42 section below.

## Highest-quality positioning strategy and VPS workstream (2026-11-20)

### What “best possible VPS quality” means for Monument

**Strategic direction:** Aim for the best reliable global pose ARCore can provide, using VPS-assisted Geospatial localization whenever the current location is covered and the runtime can localize successfully. Do not optimize the entire product around the VPS availability enum alone. A coverage response is only one input; the actual quality gate is the live pose plus its measured uncertainty over time.

Google's published ARCore guidance says that, under typical conditions in VPS-covered areas, VPS can provide positional accuracy typically better than 5 m and often around 1 m, and rotational accuracy better than 5 degrees. These are typical expectations, not guarantees or a centimetre-precision promise. In open-sky outdoor environments, GPS may also be sufficient; dense urban environments and indoor areas are more difficult for GNSS. See [ARCore Geospatial configuration guidance](https://developers.google.com/ar/reference/c/group/ar-config) and [Geospatial API overview](https://developers.google.com/ar/develop/geospatial).

### Priority order for engineering

1. **Prove the diagnostic truth first.** The latest diagnostic build must show the exact VpsAvailability enum, query coordinates (privacy-rounded), query age, result age, CURRENT/STALE, and request exceptions distinctly. A fresh UNAVAILABLE is a coverage answer for that queried point; it is not a network or authorization error. ERROR_NETWORK_CONNECTION, ERROR_NOT_AUTHORIZED, resource exhaustion, internal errors, and thrown exceptions must remain separate.
2. **Validate the service path.** Confirm ARCore API enabled in the intended Cloud project, Android package/signing identity matches the OAuth client, device Geospatial support, Google Play Services/ARCore availability, network reachability, and the actual VPS query result. Do not re-open already verified permissions/OAuth unless diagnostics indicate a regression.
3. **Validate coverage by coordinate, not by country assumption.** VPS coverage is location-specific and grounded in Google's Street View visual mapping. One UNAVAILABLE result cannot establish that an entire country or region is unsupported. Keep a privacy-safe record of the queried point and test time; do not upload a continuous location trail.
4. **When VPS is available, improve visual convergence.** Give ARCore time to converge; have the user slowly look around at visually distinctive, well-lit, static surroundings (facades, corners, windows, signs, and other durable features likely represented in Street View). Avoid feature-poor blank walls, moving crowds/vehicles as primary references, rapid camera motion, and occluded/dark scenes. This is a field procedure to improve visual matching, not a guarantee of coverage.
5. **Gate placement using live accuracy, not VPS availability alone.** Observe H, V, and yaw-accuracy over a rolling time window. The API's accuracy values are uncertainty estimates (68% confidence radius/interval); lower numbers are better. Define Monument's acceptance thresholds per placement use case only after collecting device/environment data. Do not invent one universal threshold.
6. **Use the right anchor altitude semantics.** WGS84 anchors use ellipsoid altitude; Terrain anchors use altitude relative to terrain; Rooftop anchors use height relative to a building rooftop. Select based on the actual product intent and never treat ellipsoid altitude as ground elevation.
7. **Retain the third, local precision path.** If the use case needs repeatable precision beyond what global VPS/GNSS can establish, use a surveyed/local reference or a deliberately designed calibration target and keep its local frame and transform explicit. Local calibration improves local relative placement; it does not magically certify globally correct coordinates. Investigate RTK/survey-grade input only if the product's accuracy requirements justify added hardware, cost, and operational complexity.

### What not to do

- Do not make VPS a hard dependency for app launch, browsing, authoring, or all publishing.
- Do not repeatedly move the user around just to chase a coverage response; no further field trip is required now.
- Do not call TRACKING or AVAILABLE “precise” without checking current H/V/yaw uncertainty and stability.
- Do not equate UNAVAILABLE with ERROR_NETWORK_CONNECTION or ERROR_NOT_AUTHORIZED.
- Do not promise centimetre accuracy from ARCore Geospatial/VPS.
- Do not switch to Unity, a new XR engine, or a different positioning SDK just to work around one unresolved VPS observation.

### Build #42 — verified delivery (2026-11-20)

- GitHub Actions run: [Build #42](https://github.com/Hoohaahaa/Monument/actions/runs/44732497825) — **SUCCESS**.
- Built commit: 134a424a328f8017b33dbe786264ba2ad812361f.
- Artifact: monument-camera-passthrough-debug, artifact ID 14627550889.
- APK package dev.monomatter.monument, versionName 0.2.1, versionCode 3.
- Signing SHA-1: eb565d1f058175eeb0a5c0c4d7233d99bade6867, matching the previously verified stable OAuth signing fingerprint; in-place update should be possible.
- APK extracted and verified at /mnt/data/monument-build42/app-debug.apk in the assistant runtime.
- This build contains the VPS query provenance/status changes from commits 3130fb45e65e49762b6ea942d2bff96346b9041e, 3714b58c50a8228ad90e9b7c9313287150300512, and 134a424a328f8017b33dbe786264ba2ad812361f.
- User has not yet installed build #42 or reported its on-device diagnostic line. Do not treat any earlier UNAVAILABLE observation as verification of this build's refresh behavior.


## Field report after Build #42 and diagnostic follow-up (2026-11-20)

- User installed Build #42 and reports the VPS line remains `UNAVAILABLE · CURRENT` after moving to another location; query age was about 90 seconds. This is a fresh service response, not a stale result, but the exact queried point must be compared with the latest tracked pose before concluding that the moved-to point was checked.
- The `@latitude, longitude` suffix is the **query coordinate** in decimal degrees, rounded to 3 decimals for display. The order is latitude first, longitude second. It is not an error code, device ID, or address. Do not ask the user to share a precise home coordinate; rounded coordinates or the distance delta are sufficient for diagnosis.
- Important existing behavior: automatic re-query is triggered only after the latest tracked pose is at least 100 m from the previous query coordinate, or after 5 minutes. Moving less than 100 m will not necessarily issue a new query. `CURRENT` only means the query is less than 5 minutes old; it does not mean VPS is available or that the query coordinate matches the current pose.
- Do not ask the user to keep relocating. The next diagnostic build adds (a) query-to-latest-pose distance in metres, (b) pose age, and (c) a manual `RECHECK VPS AT CURRENT LOCATION` button with a 30-second client cooldown. This allows an explicit query at the latest tracked pose without another trip.
- Source commits: renderer `468c0a6e67547a23bc62c8ce5cb725f0cc4ffb6f`; Activity UI `593652452c1b272b0b7dbf6c27b414bb53660ebd`.
- Build #44 is queued for these changes: https://github.com/Hoohaahaa/Monument/actions/runs/44742066355. Do not distribute a new APK until CI succeeds and the artifact is inspected.

### Interpretation of repeated fresh UNAVAILABLE

If the new build shows `pose Δ0–20m` (or another small value) while `UNAVAILABLE`, the queried coordinate is close to the latest ARCore pose and the result is credible for that point: VPS is not available there. If `pose Δ` is large, the previous result belongs to a different point and a manual recheck is required. If the manual query at the current pose also returns `UNAVAILABLE`, stop spending user time on repeated local retries; record that location as not VPS-covered and continue the GPS + visual-inertial and local-reference positioning layers. Only investigate authorization/network configuration again if the enum is an explicit ERROR, not UNAVAILABLE.


## Build #44 — verified manual VPS recheck (2026-11-20)

- GitHub Actions run #44: https://github.com/Hoohaahaa/Monument/actions/runs/44742066355 — **SUCCESS**.
- Built commit: `593652452c1b272b0b7dbf6c27b414bb53660ebd` (includes renderer commit `468c0a6e67547a23bc62c8ce5cb725f0cc4ffb6f`).
- Artifact ID: `14630678046`, `monument-camera-passthrough-debug`.
- APK extracted and verified at `/mnt/data/monument-build44/app-debug.apk`; size 4,191,920 bytes.
- Metadata: package `dev.monomatter.monument`, versionName `0.2.1`, versionCode `3`.
- Signing SHA-1: `eb565d1f058175eeb0a5c0c4d7233d99bade6867`, matching the established OAuth signing identity; install-over should work.
- Build adds latest tracked-pose age and query-to-pose distance (`pose Δ`) plus `RECHECK VPS AT CURRENT LOCATION`, rate-limited with a 30-second cooldown. Manual recheck uses the latest tracked ARCore pose; no user relocation is needed.
- Next user action, only when convenient: install as an update, tap the manual recheck once, then report VPS enum and `pose Δ`/pose age. Do not ask for more movement. If delta is small and result is fresh UNAVAILABLE, stop local retries at that point and continue the approved non-VPS layers.
