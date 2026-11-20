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
