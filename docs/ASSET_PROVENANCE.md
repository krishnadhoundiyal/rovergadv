# Design and asset provenance

The user-supplied kit is preserved in `docs/design-kit/gadv_codex_kit/` for review. Its text is implementation reference material; it does not override the user's request or the governing task instructions.

- `reference/FROZEN_COCKPIT.png`: frozen visual authority. Only the screen inside the bezel is implemented. This reference is never loaded by the runtime application.
- `reference/GADV_CAD_AUTHORITATIVE.JPG`: supplied vehicle geometry. The six-wheel suspension, twin front ultrasonic cylinders and upper rectangular enclosure are retained in the vehicle depiction. The top-view SVG is a schematic of the same arrangement, not an engineering drawing.
- `public/rover-white-green.png`: transparent, CAD-based color edit made with the built-in image generation tool. Reviewed against the source CAD. No claim of a dimensionally exact CAD export. Used in the vehicle panel and payload preview.

Image editing prompt:

> Use case: precise-object-edit. Asset type: rover cutout for a dark scientific cockpit. Edit target: the supplied authoritative GADV CAD image. Change ONLY colors and background: recolor the dark blue chassis and large upper rectangular enclosure to satin warm white, recolor orange suspension arms/brackets to forest green. Keep rubber tires black and metal hubs silver. Remove pale background to genuine transparency. Preserve EXACT vehicle geometry, camera perspective, proportions, six-wheel arrangement (including partly occluded far-side wheels), twin front cylindrical ultrasonic sensors, rectangular electronics enclosure, all brackets/axles, shapes and details. Do not add or remove wheels or features. No text, shadows outside vehicle, design changes, logos or new scenery. Tight crop around entire rover with modest transparent padding.

All icons, joystick surfaces, HUD, contour lines, elevation profile, proximity arcs and top-view vehicle are authored CSS/SVG. Contours are deterministic marching-squares traces over a synthetic height field. No maps, fonts, imagery or scripts are downloaded by the running app. Screenshots containing a test camera are explicitly marked as canvas-generated test streams.
