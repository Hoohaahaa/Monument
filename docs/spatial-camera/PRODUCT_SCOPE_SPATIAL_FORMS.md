# Product scope clarification — Spatial object families

Date: 2026-11-19
This document supplements `docs/spatial-camera/HANDOFF.md`. It is a user clarification, not a claim that these features are already implemented.

## The user is asking for the full spatial authoring product, not only the sky-travel example

The sky-travelling work was one example among a wider set of spatial object types and prior design explorations. The older versions included indoor, outdoor, column-like and framed/bordered spatial works. The newer iterations are considered better and should inform the implementation. Do not reduce the request to one animated sky plane, nor treat "surface" as a single generic card.

## Required product model: one Moment editor, multiple spatial forms

Keep one camera-first entry and one coherent authoring model. A user should open the link, land in Camera first, then reach all creation and placement tools through the existing bottom navigation and accessible secondary controls.

The editor should expose an intentional spatial form selector, with contextual controls rather than a giant unstructured form:

- **Point / marker** — a location-anchored point or compact content marker.
- **Surface / framed panel** — a rectangular or custom aspect-ratio plane, with visible frame/border styling, width × height, facing direction, offset, and front/back visibility.
- **Column / vertical form** — a vertical prism/cylindrical or framed column form, with width/diameter, height, orientation and base elevation.
- **Indoor placement** — venue, room, floor/level, local coordinate origin, wall/floor/ceiling/column placement, and QR/local anchor fallback. Indoor coordinates must not be falsely represented as GPS precision.
- **Outdoor / geographic placement** — WGS84 location, map footprint, altitude datum, orientation, visibility range, terrain/horizon state, and geospatial placement.
- **Sky / elevated work** — explicit altitude/height and sky-facing orientation, with distinction between a static elevated surface and a moving trajectory.
- **Path / trajectory** — waypoints or path geometry, start time, duration/speed, interpolation, altitude profile and loop/repeat rules. This is actual movement through space, not just start/end publication availability.
- **Media/content** — text, image, audio and accessible descriptions; content must render on the chosen spatial form, not only in a bottom-screen caption.

Do not invent that all of these already existed in one single version. Recover and compare the actual historical files, especially the later iterations, before choosing exact control names and visuals.

## Navigation and UX contract

- First view on open: Camera.
- Preserve the approved camera-first shell and wordmark `◇♧♡■■■■■`.
- Keep Camera, Place, Create, Publish available in persistent bottom navigation.
- Place can open the full-screen map while retaining a clear route back to Camera.
- Create opens an accessible bottom sheet with progressive sections: Form → Placement → Geometry → Motion/Timing → Content → Preview.
- Publish remains distinct from Save draft; include share URL, visibility, schedule and revision state.
- If extra spatial modes need navigation, expose them contextually from Create/Place rather than adding an overcrowded permanent nav bar.
- Large touch targets, clear labels, keyboard/screen-reader semantics, safe-area padding, reduced-motion support, visible permission state and usable fallback when camera/location/XR is denied.
- The map is a real placement surface: pan/zoom, tap-to-place, draggable anchor, footprint/heading handles, fit-to-work, full-screen, locate-me and tile failure fallback.

## Renderer contract

One content model can target several renderers, but do not pretend they have equivalent capabilities:

1. **Map preview** — geographic geometry and route footprints; indoor geometry uses a venue-local coordinate system.
2. **Camera guidance** — approximate geolocation + compass projection, with accuracy/confidence shown. Not world-locked.
3. **WebXR local AR** — session-local tracked anchor; stable relative to the XR tracking space during the session. Do not recompute the anchor every frame. Does not persist as a geospatial anchor.
4. **Persistent geographic AR** — future adapter using supported platform geospatial anchors/VPS; only advertise on devices/services that pass capability checks.
5. **Indoor anchors** — venue-local coordinate frame tied to QR/marker, visual localization or manually calibrated room origin; do not rely on outdoor GPS to place a column against an indoor wall.

A surface that is intended to be read from below needs correct face winding/orientation and two-sided rendering where appropriate. The V18 baseline has special sky-facing geometry; preserve it as a regression case.

## Required regression fixtures

Create test fixtures for:
- outdoor framed panel, 12 m × 4 m, heading 0/90/180/270;
- vertical column with a known base point and height;
- indoor wall panel and ceiling-hung work in a local room coordinate frame;
- elevated static sky surface;
- moving sky trajectory passing over an observer at a specified time;
- point/marker;
- image-backed and text-only content;
- front/back face visibility and below-plane readability;
- map footprint and heading handle;
- device with camera only, camera + GPS, camera + compass, WebXR AR + anchors, and no XR support.

## Verification and release

The user wants a usable product, not a design concept. Every form type must be reachable and its core workflow must work before a preview is sent. Test the actual mobile DOM and interactions; no source-only or syntax-only check is sufficient. Do not create multiple speculative Vercel deployments. Build and run tests locally/CI first, then make exactly one preview deployment after acceptance gates pass.

Physical-device camera, GPS, compass and WebXR tracking must be separately marked as pending until exercised on actual hardware.
