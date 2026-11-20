# Samsung Galaxy A32 — ARCore Compatibility Assessment

**Assessment date:** 2026-11-20  
**Target device family:** Samsung Galaxy A32 (4G) and Galaxy A32 5G  
**Status:** Catalogue-supported for ARCore; Geospatial must be confirmed by runtime probe; Depth API is not listed as supported.

## Findings from Google's official ARCore device catalogue
- Both **Samsung Galaxy A32** and **Samsung Galaxy A32 5G** appear in Google's Android (Google Play) ARCore supported-device list.
- Neither A32 entry has the "Supports Depth API" annotation that appears on many newer supported models.
- Neither A32 entry is annotated with the explicit "Does not support Geospatial API" restriction in the current catalogue.
- Google's Geospatial documentation warns that ARCore support does not automatically guarantee Geospatial support. The definitive check is `Session.isGeospatialModeSupported(Config.GeospatialMode.ENABLED)` on the actual device and selected rear camera.
- Depth support must be independently checked with `Session.isDepthModeSupported(Config.DepthMode.AUTOMATIC)`.

## Practical conclusion
- **ARCore base:** supported according to the official device catalogue.
- **Geospatial:** promising / no catalogue exclusion shown for the A32 entries, but not confirmed until the native runtime probe reports the result.
- **Depth API:** do not plan on it for the A32; catalogue does not list it as supported. Runtime check remains the final authority.
- **VPS coverage:** independent of device support. It depends on the physical location, Google VPS coverage, connectivity and visual environment.

## Native runtime verification
The native probe in `android/` performs the two definitive runtime checks and reports:
- `arcore`
- `geospatial`
- `depth`
- localization state and geospatial camera pose accuracy fields when tracking is active.

## User action needed for definitive test
Install/run the Android probe on the actual phone, grant Camera and Precise Location, update Google Play Services for AR, and tap **START GEOSPATIAL DEVICE CHECK**. A device catalogue cannot reveal the phone's installed ARCore version, current permissions, firmware state or local VPS availability.

## Official sources
- https://developers.google.com/ar/devices/
- https://developers.google.com/ar/develop/geospatial
- https://developers.google.com/ar/develop/java/geospatial/quickstart
- https://developers.google.com/ar/develop/java/geospatial/enable
