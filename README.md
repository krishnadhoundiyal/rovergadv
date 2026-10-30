# GADV D4-S Mission Control

An iPad Pro landscape, camera-led rover cockpit showcase.

## Frozen design and project scope

The cockpit design is **approved and frozen**. Retain its dark charcoal layout, cyan translation control, amber rotation control, prominent central camera viewport, lower instruments, and left/right status panels. The actual GADV rover geometry must be based on the supplied CAD reference; the physical rover's coloring is **white and green**. The screenshot's generic rover illustration and its pretend telemetry are not hardware evidence.

**Today is demonstration-only.** The center uses the iPad **rear camera**, with local digital pan/zoom/crop and HUD effects when touching the joysticks. No backend, GPS, ESP32 command link, remote video, real sensor feed, microphone, upload, or analytics. Clearly label simulated motion and instrument values.

## Implementation

- React + Vite + TypeScript, Node 22, production static app, iPadOS Safari landscape.
- Secure **HTTPS** required for rear camera permission.
- Real joysticks: pointer/touch capture, 360-degree translation, rotation/yaw, diagonal support, release-to-center, HOLD, SCAN and mode actions.
- Camera errors, permissions, stream cleanup/resume, simulated motion cropping limits and no dead buttons.
- iPad responsive testing, accessibility, unit/e2e tests, CI, GitHub Pages workflow, documented video capture instructions.
- Full code + test evidence in one reviewed PR; **do not auto-merge**.

## One-shot Codex handoff

The complete build specification and two reference images are packaged separately as `GADV_Codex_One_Shot_Kit.zip` in the originating ChatGPT conversation. **Provide the complete kit to Codex before starting development**. The approved cockpit reference image is required for pixel-accurate layout; the actual GADV CAD image is required for vehicle shape. This README is a brief summary, **not a substitute for that package**.

Run the entire build, test and self-correction cycle in one Codex task. Never claim physical iPad testing if the device was not available.

