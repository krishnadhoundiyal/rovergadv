# GADV D4-S · Mission control demo

A touch-first iPad landscape cockpit built from the frozen design in the supplied kit. React, Vite, TypeScript; static hosting; Node **22**. The actual iPad camera is the only live input. Every instrument, heading, motion vector, distance, elevation and contour is **simulated locally**. There is no rover connection, backend, remote video, microphone, geolocation, Bluetooth, recording, upload, analytics or external runtime service.

## Run and verify

Use Node 22.22.2 or newer within the 22.x line (`nvm use` reads `.nvmrc`).

```sh
npm ci
npm run dev
```

Open the printed local development URL. The deployed site is served at `/` on its custom domain. For the production build:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
npm run preview
```

The browser suite starts production preview at `http://127.0.0.1:4173/`. Chromium and WebKit are distinct projects. Tests use a labeled canvas MediaStream for camera success, mock errors, and do not need a physical camera. `npm run test:e2e -- --project=chromium` selects one engine. `CHROMIUM_PATH` can select an installed Chromium executable for local QA. CI installs both engines and uploads browser reports, failure traces and screenshots. `docs/QA_REPORT.md` records checks actually performed; local screenshots are in `docs/qa/`.

## GitHub Pages — custom domain

Public address (once DNS, Pages settings and HTTPS provisioning succeed): **https://gadv.gravitymatter.com/**

The Vite production base path is `/` for the root of this custom domain; the preview and end-to-end tests use root-path URLs. This repository uses a **GitHub Actions deployment workflow**, so GitHub's Pages custom-domain configuration lives in **Settings → Pages**, not in a source `CNAME` file. Any source `CNAME` file would be ignored for Actions-based deployment.

To activate the custom domain, the domain administrator should perform the following in this order:

1. In **Settings → Pages**, select **Source: GitHub Actions**, then save **Custom domain: `gadv.gravitymatter.com`**. Verify domain ownership if GitHub asks. This needs repository Pages administrative access.
2. In the DNS zone for `gravitymatter.com`, create/update **CNAME `gadv` → `krishnadhoundiyal.github.io`** (without `/rovergadv`). Remove any conflicting records for that exact hostname. Configure the hostname in GitHub Pages **before** publishing the CNAME to avoid subdomain takeover.
3. Merge the domain configuration PR; then run (or re-run) `.github/workflows/deploy-pages.yml` from `main` after Pages source is enabled. The workflow runs on merges to `main` automatically.
4. When DNS is verified and GitHub has provisioned its certificate, enable **Enforce HTTPS** in Pages settings. On the iPad open **https://gadv.gravitymatter.com/** (HTTPS is required for camera permission).

DNS propagation and TLS provisioning may not be immediate. Do not claim deployment success until the Pages workflow passes and the public HTTPS site resolves with all assets. The legacy project URL can redirect to the configured custom hostname after Pages has been configured.

## iPad Pro Safari camera

1. Open the HTTPS Pages URL in Safari and rotate the iPad to landscape. Portrait displays a rotation prompt and preserves the current demo.
2. Tap **ENABLE CAMERA** and allow Camera for this website. The request explicitly disables audio and prefers the rear camera. Safari chooses available hardware; it may ignore that preference. The **CAMERA** utility offers **Switch camera** as a front/rear fallback, or **Stop camera** to release the hardware.
3. **LOCAL LIVE** appears only after a live video track is playing. Without permission or available hardware, the center remains a styled, clearly non-live fallback. The controls still demonstrate local motion.
4. If access is denied, use Safari's website menu → Website Settings → Camera → Allow (wording varies with iPadOS), then tap **RETRY CAMERA**. If busy, close other camera apps. Camera APIs require HTTPS or same-device localhost; an HTTP LAN address will not work. A desktop localhost URL is not the iPad's localhost.
5. Backgrounding stops camera tracks and cancels joystick input. Returning attempts to resume only a previously active preview; use Retry if Safari requires another gesture. Delayed metadata, interrupted tracks and playback failures show a retry state. Closing the app stops tracks.

Only video is previewed in a muted, inline `<video>`. No media is stored or sent. A limited digital crop provides simulated visual movement; it cannot reveal anything outside the physical camera frame. Heading and virtual position persist after release; speed settles to zero. HOLD immediately stops movement. SCAN stops driving and animates a synthetic ultrasonic/contour sweep. DRIVE MODE resumes driving.

## Record a showcase

1. Mount the iPad in landscape facing the desired real scene. Enable the camera.
2. Tap **DEMO RESET** for heading 003°, zero position, normal rates, default HUD and a cleared virtual path. Reset deliberately preserves a running camera to avoid another permission prompt.
3. Start **iPadOS Control Center → Screen Recording**. Leave the screen recorder's microphone off if audio is unwanted; this app never requests it.
4. Use the cyan translation joystick and amber yaw joystick simultaneously. Try a diagonal, release, HOLD, SCAN and DRIVE MODE. Rate selectors change only simulated speed/turn rate. Arrow keys also operate a focused joystick.
5. LIGHTS changes only the view overlay; BEACON toggles a local indicator. SENSORS explains the synthetic readings; PAYLOAD shows the CAD-based rover; the map expands in a dialog. Settings offers a minimal HUD, decorative motion reduction and Demo Reset. The short initialization banner is skippable and does not block access. The system reduced-motion preference is respected.
6. Stop the iPad screen recorder. The resulting recording belongs to iPadOS; the app has no recording or upload path.

## Structure and limits

- `src/camera.ts`: video-only acquisition, explicit lifecycle and stale-request cancellation.
- `src/simulation.ts`: deterministic vectors, persistent virtual navigation, strict crop bounds.
- `src/Joystick.tsx`: independent pointer ownership/capture, deadzone, saturation and interruption handling.
- `src/Instruments.tsx`: authored HUD, six-wheel vehicle schematic, contours and elevation.
- `src/App.tsx`, `src/styles.css`: frozen cockpit composition and local actions. Frame transforms use `requestAnimationFrame`; React telemetry updates are limited to 10 Hz.
- `docs/design-kit/`: original design references and supplied reference documents. `docs/ASSET_PROVENANCE.md` explains the white/green rover edit.

The named HC-SR04+, DS18B20 and BMP280 sensors provide design context only. Values are not sensor measurements. The UI does not claim GPS, networking, autonomous mapping or physical driving authority. Physical iPad rear-camera behavior and performance require real-device acceptance testing; emulated WebKit is not an iPad.

