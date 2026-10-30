# CODEX ONE-SHOT TASK — GADV D4-S iPad Pro Mission Control

You are the implementation engineer and your own QA reviewer. Build and finish the product in **one end-to-end task**, rather than returning partial scaffolding or asking for iterative decisions. Do not claim success until you have run verification and fixed defects found within this task. Repository: `krishnadhoundiyal/rovergadv` (new, initially empty; inspect before editing). Use Node.js **22**. Create a feature branch and one PR; do not auto-merge.

## 0. Non-negotiable authorities

First inspect the supplied images, `reference/FROZEN_COCKPIT.png` and `reference/GADV_CAD_AUTHORITATIVE.JPG` (or equivalent attached `design/reference/` paths). The **approved cockpit image is the visual contract**: recreate the screen interior with very high fidelity in a real interactive app, not by using the whole image as a background. The CAD image is the authority for the actual vehicle's geometry, proportions and wheel/suspension arrangement. The real physical vehicle is **white and green**, so use white/green for the vehicle representation only. Do not invent a different rover. Keep the approved cockpit's dark charcoal and steel theme, cyan translation joystick, amber/orange rotation joystick, panel hierarchy and large center HUD. Do not redesign the dashboard.

The illustration has demonstrative numbers and fake network/GPS claims. Those are **NOT hardware specifications**. The app must distinguish local live camera from simulated rover navigation and simulated sensor readings. No fake 'ROVER ONLINE', remote link speed, satellite lock or actual-camera-on-rover claims. Retain placement and typography feel of these status elements while changing their labels to factual states: `DEMO MODE`, `IPAD REAR CAMERA`, `SIMULATED TELEMETRY`, etc.

## 1. Product, platform, architecture

Build a static, touch-first **React + Vite + TypeScript** iPad Pro landscape web app. Prefer plain React/CSS/SVG/Canvas for precise design and performant interactions; use lightweight libraries only where they add real value. Zero backend, database, accounts, API, Bluetooth, ESP32, remote-control transport, analytics, telemetry uploads or remote dependencies at runtime. No invented sensor APIs. Static local asset URLs only. It must run from a secure HTTPS origin on real iPadOS Safari because browsers require HTTPS (or localhost) for camera APIs. Include package scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, `test:e2e` (or clearly documented equivalents). Lock Node 22 and dependencies; commit lockfile. Target a maintainable component architecture and clear demo-state separation from camera-state.

Use GitHub Pages with a workflow to build and deploy a static site at `https://krishnadhoundiyal.github.io/rovergadv/`, subject to GitHub Pages repository settings/permissions; set Vite base path `/rovergadv/` and use relative asset references. If Pages cannot be enabled by the task's permissions, still deliver the complete workflow and give one exact manual setup step rather than silently claiming deployment.

## 2. Pixel-level layout and styling

The app fills the iPad Pro landscape viewport without vertical/horizontal scrolling, broken edges, hidden touch targets, tiny buttons, or Safari overscroll interference. Test 4:3 and approximately 1.43:1 landscape ratios, including 1024×768, 1194×834, 1366×1024 and other suitable widths. Respect safe-area insets. Optimize for landscape; portrait gets an elegant rotate-device hint and does not corrupt state.

Recreate the frozen visual structure:
- Header: GADV D4-S identity / exploration rover; truthful demo and camera states; restrained utility icons.
- Left column: rover status instruments (all labeled simulated), and a clearly visible faithful image/render of the GADV rover using the supplied CAD structure with white/green physical colorway.
- Center: DOM `<video>` **live iPad rear camera** beneath animated compass, range reticle, subtler HUD grid, heading/speed readouts and scan overlays. Actual terrain is real footage when camera permitted; no prepackaged rocky-video substitute presented as real.
- Right: a top-down-ish **GADV-specific** rover/proximity visualization and dynamic simulated topographic contour/map.
- Bottom left: large tactile cyan joystick, used for translation/drive vectors.
- Bottom right: large tactile amber/orange joystick, used for rotation/yaw.
- Middle bottom: restrained elevation-style graph, scan/hold/drive mode buttons and compact instrumentation controls.

Aim for a professional graphic product, not default cards, generic dashboard components, ASCII-looking icons or rasterized UI. Responsive layout must not sacrifice interaction area. Build all labels, statuses, buttons and joysticks as real DOM/SVG interactive UI, not as click areas mapped over the frozen screenshot. Preserve tasteful shadows, fine outline strokes, glowing accents and high-quality motion.

## 3. Exact live-camera behavior

- On user tap of an explicit `ENABLE CAMERA`/camera control, invoke `navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })` (or an equivalent tolerant constraint strategy). Prefer the REAR camera, with a simple camera-switch fallback if the device does not honor facing mode.
- Render the stream in a real `<video autoplay muted playsInline>` element; assign `srcObject`, handle `loadedmetadata`/`play()` and continue/resume after iPad background/foreground changes as feasible. Properly stop tracks on unmount/switch.
- Clearly handle: permission denied, HTTPS missing, camera unavailable, camera in use, stream interrupted. Show a beautiful in-theme fallback and a retry control. Never crash, hang or show a fake LIVE indicator when no stream is active.
- No video recording, no screenshots uploaded, no media streaming. The user uses iPad's own screen recorder.
- Center view starts as camera preview. The camera feed is from the tablet, **not the rover**. Do not attempt to control physical camera orientation or the real rover.

## 4. Control semantics: real touch controls, simulated motion

Implement smooth, resilient dual virtual joysticks using Pointer Events with capture, normalized X/Y (-1..1), touch-action disabled in joystick zones, dead-zone, saturation, spring-to-center on release/cancel, and continuous frame updates (requestAnimationFrame). No scrolling/selection during drags. Multiple simultaneous touches must work (one pointer per joystick) without fighting. Gamepad/keyboard arrows/WASD are optional convenience, but touch is authoritative.

Left/translation joystick: up = simulated forward movement, down = simulated reverse; left/right = simulated lateral/steering-associated camera drift; diagonals combine axes. Right/rotation joystick: left/right = simulated yaw, updating a persistent heading and causing a distinct, bounded apparent perspective shift in the live camera crop; optional up/down pitch is allowed only if clearly marked simulated and does not harm the view. Current speed returns to 0 smoothly when released; heading/virtual position **persist** instead of snapping back. Joystick knobs spring back, but HUD state does not reset.

Use GPU-friendly CSS transforms or canvas-based video texturing to apply **limited digital crop/pan/zoom** to the live iPad camera image. This is only an illustrative camera effect, with strict bounds so no black bands/blank pixels appear. The iPad camera's true field of view stays fixed: make no unsupported promise of genuine new scenery when turning. Use subtle inertial easing, directional parallax guides, reticle movement, topographic path changes, compass movement, speed adjustments, light sensor sweeps and elevation chart effects. Keep all simulated values coherent with the commanded vector and no fabricated physical capability. Stop movement/virtual drift on `HOLD`; resume on `DRIVE MODE`, as applicable. Stop/cancel needs to work on touch interruption, blur or permission loss.

Never send commands anywhere. All simulated values come from local deterministic state / animation only. Provide a visible `DEMO · SIMULATED CONTROLS` label unobtrusively, without spoiling the composition.

## 5. Simulated instrumentation without misrepresentation

Known documentation sensors for reference: BMP280 (temperature/pressure), DS18B20 (temperature), HC-SR04+ (ultrasonic). Do not claim actual live readings; show plausible preset values with subtle controlled animation, clearly framed as SIMULATED. Do not invent working GPS, internet link, lidar, IMU, real motors or external camera. The frozen illustration's non-authoritative status values should be replaced by consistent demonstration labels as necessary while preserving its appearance.

SCAN animates a directional ultrasonic-style sweep and contour activity. CAMERA enables or resumes local iPad camera. HOLD stops virtual movement immediately. DRIVE MODE returns to navigation demonstration. Other visible buttons must respond (open an anchored inline modal/toast if a function is presentation-only), rather than being dead decoration. No lengthy multi-page application: a single polished cockpit screen with coherent mode changes is the goal.

## 6. Video-capture polish

Add a 2–3 second elegant boot/initialization choreography that does not block access and can be skipped; do not ask for repeated permission requests. Animate the joystick rings, HUD, radar pulses, topographic contour activity, telemetry changes and mode feedback in a restrained cinematic style. Respect `prefers-reduced-motion` where practical. No external images or CDN fonts at runtime. Optimize rendering for iPad; do not rerender the entire React tree on each 60fps frame; use refs/transforms/canvas efficiently. Video capture should not show browser scrollbars, layout flashes or missing images. Include a 'Demo Reset' action for an easy retake.

## 7. Testing and QA must be part of the same task

Complete these, and **fix failures before declaring done**:
1. `npm ci`, lint, TypeScript typecheck, unit/integration tests and production build.
2. Automated test coverage of camera permission success, denial, unavailable hardware, restart/cleanup and no accidental microphone request.
3. Joystick unit/e2e: 8 directions, diagonals, simultaneous pointers, drag bounds, dead-zone, release/cancel, blur, HOLD and heading persistence. Check view transform changes and returns to neutral speed without black edges.
4. Playwright browser smoke tests with mocked camera feed where possible, screenshot review at iPad landscape widths, no overflow/horizontal scrolling, no console errors, no dead controls. Test WebKit if available; do not label a Chromium result as actual iPad Safari verification.
5. Verify all assets resolve at the GitHub Pages `/rovergadv/` base path. Test production preview.
6. Test with no external services; no fetch/XHR/WebSocket to third-party endpoints or the rover. Confirm no analytics, geolocation or microphone permission requested.
7. Produce a concise `docs/QA_REPORT.md` covering command outputs, screenshot artifacts, tests passed, unresolved limitations and actual device testing status. Never claim you tested on a physical iPad unless you did.
8. Include `.github/workflows/ci.yml` and static GitHub Pages deployment workflow, plus accurate user setup instructions in README.

## 8. Definition of done and delivery

- Visually faithful approved cockpit; not a screenshot backdrop or generic redesign.
- Actual GADV vehicle geometry represented faithfully, with white-green physical colorway; source CAD reference credited as the basis.
- Real iPad rear camera in center after permission; graceful non-live fallback.
- Both joysticks work on touch and drive bounded camera transforms and coordinated navigation/HUD states; stop and mode controls work.
- Every visible button has an intentional presentation behavior.
- No backend/hardware connection or false live hardware telemetry.
- Static site production build, HTTPS GitHub Pages automation, clear iPad recording instructions.
- Tests pass and QA report demonstrates results; corrections completed inside this same task.
- One PR with all code and assets, no auto-merge. Summarize PR URL, evidence, deployment status and only genuinely untestable physical-device constraints. Do not return an unimplemented plan.

## 9. Instruction precedence

1. This one-shot specification and the explicit user corrections.
2. Frozen screen visual design for styling/layout.
3. User-supplied CAD image for vehicle geometry.
4. Existing project files, if any (inspect and preserve existing work).
5. Your engineering discretion only for invisible implementation details.

Resolve normal implementation decisions autonomously, with the least architectural complexity that satisfies today's video. If external permissions or real-iPad access block testing, implement everything possible and state the precise external prerequisite without fabricating success.
