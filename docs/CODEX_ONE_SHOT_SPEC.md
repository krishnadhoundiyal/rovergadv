# GADV D4-S — One-Shot Codex Implementation Contract

**Implementation target:** `krishnadhoundiyal/rovergadv`; Node 22; React + Vite + TypeScript; iPad Pro landscape, iPadOS Safari. **Do not treat this as a planning-only task.** Build, test, self-correct and open one PR. Do not auto-merge.

## Authorities — read these before touching code

1. The approved image `FROZEN_COCKPIT.png` (included in the GADV Codex handoff kit) is the **visual design authority**. Match the app screen *inside* the depicted device bezel; never display the full screenshot as the UI.
2. The user-supplied `GADV_CAD_AUTHORITATIVE.JPG` is the **vehicle geometry authority**. The real finished rover is white and green; recolor only the rover depiction faithfully, preserve actual geometry and wheel layout. The engineering red-black convention does not replace the cockpit palette.
3. Frozen cockpit theme: charcoal/steel surfaces, cyan translation joystick, amber/orange rotation joystick, immersive central camera with HUD, side instruments and bottom controls. Do not redesign or introduce other pages without necessity.
4. The mockup's sensor readouts, GPS, link strength, battery or “rover online” labels are purely illustrative, not genuine hardware claims. Replace such labels with honest `DEMO`/`SIMULATED` states while maintaining look and information density.
5. The GravityMapper URL is supplementary inspiration only; the approved screenshot overrides it for all layout and styling decisions.

## Product boundary

Today **only the local iPad rear-facing system camera** supplies a genuine live image, displayed beneath the center cockpit HUD. No rover-mounted camera, video transport, WiFi rover link, ESP32 commands, backend, database, Bluetooth, geolocation, microphone, cloud analytics, data upload, telemetry collection or external API. Local simulation only. Never imply real remote rover control.

## Layout

Build pixel-faithful responsive panels that occupy the viewport without overflow on iPad Pro landscape; test 1024×768, 1194×834, 1366×1024 and landscape aspect ratios between 4:3 and 1.45. Respect safe-area insets and show a polished landscape-rotation instruction in portrait. Keep center video largest. Place full-size ergonomic joystick widgets at the bottom corners, status/vehicle panel on left, proximity/contour panel on right and coherent action controls at bottom center. Build from real components/CSS/SVG/canvas, **never** one raster screenshot with hotspot overlays.

## Camera

Require a user gesture for requesting `navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}})`. Use a real `<video autoplay muted playsInline>` source backed by `MediaStream`. Handle permission denied, no HTTPS, hardware unavailable/busy, delayed metadata, video restart after returning from background, manual retry and cleanup of tracks. No misleading LIVE tag when preview isn't active. Provide styled graceful fallback without pretending prerecorded media is a live stream. Display `IPAD REAR CAMERA` and `DEMO MODE` honestly.

## Dual joystick and simulation logic

Use Pointer Events with pointer capture, multi-touch independence, `touch-action:none`, deadzone, normalized vectors, travel limits, continuous animation updates and spring-to-center after release/cancel/blur. Translation joystick: up/down simulates advance/reverse; left/right simulates lateral/steering drift; diagonals combine. Rotation joystick: left/right changes simulated heading/yaw. Implement bounded GPU-friendly live-video pan/zoom/crop, perhaps slight perspective transforms, plus smooth reticle/compass/terrain-path feedback. Camera physical direction cannot change: never reveal imaginary view outside actual camera frame, and never allow black bars or empty crop. Heading and virtual position persist after joystick release; virtual speed returns to zero. `HOLD` immediately stops simulated motion; `SCAN` animates ultrasonic/contour scan; `DRIVE MODE` resumes. Every visible control performs a real **local UI action**. Provide an unobtrusive `SIMULATED CONTROLS` disclosure.

## Scientific instruments

Relevant hardware names only as design context: HC-SR04+ ultrasonic, DS18B20 temperature and BMP280 pressure/temperature. All displayed values are locally simulated and clearly marked as such. Do not invent functional lidar, satellite GPS, wheel encoders, live networking, AI mapping, physical 4WD authority or other missing hardware. Update heading, motion vectors, contour path and instrument animations consistently, without sending any readings or commands anywhere.

## Finish quality

Produce refined, premium graphics matching the screenshot: accurate spacing and type hierarchy, dark professional surfaces, modest bloom and illuminated joystick rings, realistic map contours, HUD reticle and compass. Preserve panel rhythm, no generic card grid, no meaningless UI, no clipped labels. Use a CSS/SVG or carefully optimized canvas strategy with `requestAnimationFrame` and minimal React re-render churn. Add subtle boot choreography (skippable), status transition polish and a Demo Reset for quick screen-record retakes. Do not depend on CDNs or external runtime fetches.

## Engineering and delivery

- Build all necessary project files, dependency lockfile, Node 22 declaration, CI workflow and static GitHub Pages deployment workflow.
- GitHub Pages target `https://krishnadhoundiyal.github.io/rovergadv/`, using correct Vite `base: '/rovergadv/'`, HTTPS and repo permission caveat. If unable to enable Pages through permissions, leave working workflow and give one exact manual setting.
- Include `README.md` with iPad Pro Safari rear camera permission instructions, screen recording flow, no-backend demo disclosure, and a fast reproducible local dev/build procedure.
- Implement automated tests for camera permission success/denied/unavailable, cleanup, pointer/touch joystick directions/diagonals/simultaneous touches, release/cancel, HOLD, scan and nav state, bounding transforms and no network transport.
- Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, browser e2e/screenshot smoke. Test mobile-like Safari/WebKit if available; **do not claim physical iPad testing** in its absence.
- Test no visual overflow or scrolling at target resolutions, no dead controls or console errors, no unauthorized external calls or permissions.
- Report results and known limitations in `docs/QA_REPORT.md`. Finish fixes *within the same Codex task*.
- Deliver a single PR with the entire working application and no automatic merge.

## Definition of done

Frozen layout faithfully implemented in real interactive UI; accurate GADV white-green rover depiction; genuine local rear camera with honest fallback; functional simultaneous joysticks; bounded visual pan/zoom and coherent simulated data; all visible controls responsive; static HTTPS hosting workflow; CI/testing and QA evidence. Do not stop after creating project scaffolding or report imagined browser/device results. Use engineering judgment only for details not fixed by this contract.

**Images must be provided to Codex before it begins.** If image files are missing from the repository, use the supplied `GADV_Codex_One_Shot_Kit.zip` attached with the task. Do not attempt to fabricate the design based on text alone.
