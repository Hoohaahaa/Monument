# Geospatial diagnostics — field reference

This note describes the diagnostic line emitted by `CameraBackgroundRenderer.publishGeospatialStatus()`.

Example shape:

```text
Earth: TRACKING · WGS84/EUS
<latitude>°, <longitude>° · <altitude> m ellipsoid
H ±<horizontalAccuracy> m · V ±<verticalAccuracy> m · yaw ±<orientationYawAccuracy>°
```

## Fields

- **WGS84** — the global geodetic reference used for latitude, longitude, and geospatial positioning.
- **EUS** — East-Up-South, the local ARCore geospatial orientation frame. It describes the local axis convention; it is not another GPS coordinate.
- **Ellipsoid** — altitude relative to the WGS84 reference ellipsoid. It is not necessarily height above the ground or mean sea level.
- **H** — horizontal position accuracy estimate, in metres. `±H` is the estimated horizontal uncertainty, not movement.
- **V** — vertical position accuracy estimate, in metres. `±V` is the estimated vertical uncertainty.
- **Yaw** — orientation yaw accuracy, in degrees. The current diagnostic uses `Earth.getCameraGeospatialPose().orientationYawAccuracy`; this is the estimated uncertainty of yaw, **not the actual heading angle**.

## Acceptance interpretation

- `Earth Tracking: TRACKING` means ARCore currently has a valid Earth-tracking state and the geospatial pose may be read.
- It does **not** prove VPS availability or that a VPS visual localization result is active.
- VPS availability is checked separately with `checkVpsAvailabilityAsync(latitude, longitude)`; record its returned enum independently.
- Keep raw pose, horizontal/vertical accuracy, yaw accuracy, Earth tracking state, and VPS availability as distinct fields in the native bridge. Never label yaw accuracy as heading.

## Physical-device observation

On 2026-11-20, the user confirmed on Samsung Galaxy A32 4G (SM-A325F) that Earth Tracking reached `TRACKING` and the numeric geospatial diagnostics were updating after the Google Cloud Android OAuth client was created and the matching APK installed. The user did not yet report the VPS result or provide exact numeric values. Do not infer VPS coverage from this observation.
