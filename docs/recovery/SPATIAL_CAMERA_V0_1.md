# Recovered baseline — Monument Spatial Camera v0.1

**Recovered:** 2026-11-19  
**Original deployment:** `dpl_BuMGjHkxikoY1kNnW4nH7FH86rpq`  
**Immutable preview:** https://monument-field-test-nhoj660xe-mos-projects-efbc27a5.vercel.app/  
**Original deployment status:** READY  
**Original deployment created:** 2026-11-18 13:58:45 UTC  
**Original Vercel source tree:** one uploaded file, `src/index.html`  
**Recovered into this repository as:** `recovery/monument-spatial-camera-v0.1.html`

## This is the user's preferred interface baseline

This is the one-page **Monument — Spatial Camera** prototype, not the separate Spatial Lab or the later `/field/:id` Field Test overlay.

Its actual bottom navigation is:
- Camera
- Place
- Create
- Publish

The live camera is the main stage. Place switches to the map in the same page. Create opens a bottom sheet over the experience. The UI uses one continuous shell rather than separate editor routes or a split desktop camera/map workspace.

Do not replace this shell with the Spatial Lab layout, a tabbed multi-page editor, or a new redesign. Preserve the bottom navigation and bottom-sheet interaction. Any controls added for placement, geometry, content, or visibility must remain within this one-page information architecture.

## Root cause of the missing spatial output

The recovered HTML was a UI prototype, not a spatial rendering engine. Source inspection confirms:

- Camera startup only calls `getUserMedia()` and displays the video.
- Place initializes Leaflet, records a latitude/longitude, and draws a map circle and draggable pin.
- Create edits title, text, and a numeric radius.
- Publish serializes those values into a URL hash and provides a share link.
- The camera HUD contains a fixed HTML content card. Its title/body are updated by the editor; it is not projected from geographic pose.
- There is no `DeviceOrientationEvent` listener, compass heading, bearing-to-target calculation, camera FOV calculation, pitch/vertical-angle calculation, or location watch loop.
- There is no spatial projection function, world anchor, VPS, terrain model, backend registry, or cross-device persistence.

Therefore the Moment could never appear at its selected real-world location in the camera view in this version. The map circle is only a map visualization; it is not a world visibility radius. The Publish action creates a shareable hash URL, not a globally registered Moment.

This is the actual reason the earlier design looked right but did not put content into the surrounding environment. It was not merely a camera permission or styling bug.

## Correct next implementation

Keep this exact UI and add a separate spatial engine behind it:

1. **Placement:** map point, altitude/datum, surface dimensions and orientation.
2. **Observer pose:** GPS position/accuracy, compass heading with calibration and sensor-source checks, device pitch/roll.
3. **Projection:** geodesic distance and bearing, front-face test, horizontal FOV, vertical angular position, apparent dimensions, range/visibility filtering.
4. **Presentation:** project the Moment card onto the live camera frame; show clear guidance when outside FOV or when pose confidence is inadequate; transition to the content card on arrival.
5. **Truth boundary:** GPS + compass can only provide approximate screen-space guidance. Do not call it world-locked AR. Persistent world alignment requires visual tracking/VPS or geospatial anchors and calibration.
6. **Persistence:** keep local drafts separate from shareable links; implement backend publication and global discovery as a distinct, audited step.

## Recovery provenance and safety

The original page was not in the GitHub repository. It existed as a single uploaded Vercel deployment file, which explains why searches of the repository branch did not find the exact one-page UI.

The original immutable deployment is preserved and has not been overwritten. The exact HTML has now been copied into this repository on the `recover-spatial-camera-baseline` branch. No production alias has been changed. The Portfolio repository and its `monument-studio-v1` branch have not been modified by this recovery.
