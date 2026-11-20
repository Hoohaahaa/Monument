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
