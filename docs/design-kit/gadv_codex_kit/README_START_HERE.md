# GADV D4-S — One-Shot Codex Handoff Kit

Target repository: https://github.com/krishnadhoundiyal/rovergadv
Date: 2026-10-30

## Do this once before starting the Codex task

1. Open Codex (Cloud with this GitHub repository, or local Codex in a clone of the repository).
2. Ensure Codex can read the **entire contents of this kit**, not merely the instructions. Put the `reference/` files inside the repository as `design/reference/`, or attach/unpack this ZIP into its workspace.
3. Paste the full contents of `CODEX_TASK.md` as **one task**. Ask Codex to execute, test, self-correct within that same task, and deliver a single PR.
4. The source repository currently has no files. Have Codex initialize it; never overwrite a non-empty repository without inspecting it first.

## Design authority / semantics

- `reference/FROZEN_COCKPIT.png`: visual layout, dark theme, typography hierarchy, control positions and styling **frozen** by the user. Match the **app screen interior**, not the device bezel. The design has generated/illustrative sensor data and a generic rover rendering; treat those as non-authoritative.
- `reference/GADV_CAD_AUTHORITATIVE.JPG`: authoritative rover **structure and geometry**. It is a CAD/render reference, not a claim about the finished physical vehicle color.
- The finished physical rover is **white and green** (user's correction). Update only rover visualization colors to white/green while preserving documented structural shape and wheel arrangement. The engineering documentation's red/black scheme is not a demand to recolor the cockpit.
- The layout remains dark charcoal with cyan translation and amber/orange rotation controls; do not redesign or re-theme it.
- GravityMapper website was given as an aesthetic reference, but live page styling could not be verified. The frozen screenshot is the layout/color authority.

## Real-device boundary

The center is the **iPad rear camera** feed, not a camera on the rover. Joysticks simulate motion by changing the cropped camera image, HUD and mapping; nothing connects to the physical rover. A camera cannot show scenery outside its real field of view. Avoid claims of physical rover connectivity or live rover telemetry.

## Delivery

Working React/Vite/TypeScript project, complete source, assets, tests, GitHub Actions validation and static HTTPS deployment workflow, plus an operator README showing how to use it on iPad Pro Safari and record a showcase video.
