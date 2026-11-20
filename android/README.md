# Monument Android / ARCore Bridge — Probe v0.1

An isolated Android host experiment. It does not replace the web app or change the Vercel production alias.

## Purpose
- Host the current Monument HTTPS experience in Android WebView.
- Expose a versioned JavaScript interface named `MonumentAR`.
- On explicit user action, request camera + precise location permissions, check/install Google Play Services for AR, check Geospatial and Depth mode support on the actual phone, enable Geospatial when supported, and emit geospatial camera pose updates to the web UI.

## JavaScript contract
```js
const info = JSON.parse(window.MonumentAR.getRuntimeInfo());
window.addEventListener("monument:arcore", ({ detail }) => {
  // detail.type: capabilities | pose | state | error
  // pose: tracking, latitude, longitude, altitude, heading,
  //       horizontalAccuracy, verticalAccuracy, headingAccuracy
});
window.MonumentAR.startGeospatial(); // invoke from a user gesture
window.MonumentAR.stopGeospatial();
```

## Current boundary
This is a **capability + pose bridge probe**, not the finished camera AR renderer. It does not yet composite the ARCore camera texture behind the WebView, render terrain in the native camera frame, or implement persistent Monument Surface anchors. The next native milestone must add a GL camera-background renderer / transparent web overlay and a shared local-origin transform. The web page's own getUserMedia camera must not run concurrently with the ARCore camera session.

## Build
Open the `android/` folder in Android Studio (JDK 17; Android SDK 35). Sync Gradle, build the app, and install it on the Samsung A32. The app checks Geospatial and Depth support at runtime; the Google device catalogue alone cannot replace this check.

## VPS setup
Enable the ARCore API in a Google Cloud project and configure authorization before relying on VPS availability or geospatial anchors. Never commit API keys or service credentials. Device capability is separate from successful localization.

## Device test checklist
- Confirm Google Play Services for AR is installed / updated.
- Grant camera and precise location permissions.
- Launch the explicit Geospatial probe.
- Record `geospatial` and `depth` capability booleans.
- Outdoors, wait for Earth tracking; record pose accuracy and VPS availability.
- Repeat indoors / low-VPS and verify fallback messaging.

## Status
Scaffold committed; not built or run on a physical device in this environment. Do not call it a working AR app until Android Studio build and A32 test pass.
