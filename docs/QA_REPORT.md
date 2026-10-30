# GADV D4-S QA report

Verification date: 30 October 2026. Implementation branch: `codex/gadv-d4s-cockpit`.

## Recorded local results

Windows host; workspace-local **Node 22.22.2**, npm 10.2.3. Production preview served HTTP 200 at `http://127.0.0.1:4173/rovergadv/`.

| Check | Result |
| --- | --- |
| `npm ci` | Passed: 197 platform packages, zero audit findings. See `qa/npm-ci.txt`. |
| `npm run lint` | Passed. |
| `npm run typecheck` | Passed. |
| `npm test` | Passed: 27 tests in 3 files. |
| `npm run build` | Passed: Vite production build, Safari 16 compilation target. |
| Chromium browser suite | Passed: 9/9. Playwright 1.64.1 with installed Chromium revision 1243. |
| Local WebKit availability | Not installed. Linux CI cross-browser verification is pending. |
| Physical iPad / Safari hardware | Not available; no physical-device testing is claimed. |

The local drive was nearly full. Initial dependency installs failed with ENOSPC and registry stream timeouts. Disposable npm downloads were cleared and task-local tool/dependency files compressed. Exact lockfile tarballs were integrity-verified against their SHA hashes, then the successful **`npm ci --offline --cache=.tools/npm-ci-cache`** ran from that cache. This is a clean npm install, not copied or hand-wired dependencies. CI uses ordinary `npm ci`. Local browser runs used `LOW_STORAGE=1` to disable large traces; CI retains failure traces. These environment failures are separate from passing application checks.

## Behavior verified

- Explicit camera gesture, video-only rear-facing preference, real `MediaStream` attachment, muted autoplay/inline playback, front/rear fallback switch, stop and track cleanup.
- Denied, missing/busy hardware, insecure context, missing APIs, delayed metadata, autoplay rejection, stale permission results, interruption, buffering, manual retry, background cleanup and foreground restart. Browser success tests use a **canvas-generated test MediaStream**, not physical camera hardware.
- Eight translation directions, deadzone, saturated travel, simultaneous independent pointer ownership, real Chromium two-contact touch injection, pointer capture outside the joystick, release/cancel/lost capture, blur, keyboard convenience, HOLD, SCAN, DRIVE MODE and Demo Reset.
- Persistent virtual heading/position after release; speed returns to zero. Bounded crop checked across extreme coordinates and every 9° heading: scaled video covers every viewport edge with at least a 1% margin. No perspective/rotation transform exposes empty corners.
- All rate selectors, instrument details, lighting overlay, local beacon indicator, payload preview, expanded map, settings, minimal HUD, motion reduction and reset respond. Modal focus is handled by native `<dialog>`; Escape closes dialogs.
- Production `/rovergadv/` paths resolve; no failing asset responses, external requests, page errors or scrolling in the layout smoke. Runtime source has no fetch, XHR, WebSocket, microphone, location, recording, command or upload integration. A restrictive CSP limits runtime resources to the same origin and disallows plugins and form submission.

## Visual evidence

Reviewed against the **screen interior** of the frozen reference, with the required honest demo labels and CAD-based white/green six-wheel vehicle. The reference screenshot is stored only in documentation and is never rendered as the UI. The central live scene is necessarily whatever the local camera sees; permission-off evidence shows the intentional non-live fallback.

- [1024 × 768](qa/chromium-1024x768-fallback.png)
- [1194 × 834](qa/chromium-1194x834-fallback.png)
- [1366 × 1024](qa/chromium-1366x1024-fallback.png)
- [1110 × 800](qa/chromium-1110x800-fallback.png), within the requested landscape aspect range
- [Test camera active](qa/chromium-camera-active.png)
- [Scan mode](qa/chromium-scan.png)
- [Portrait rotation prompt](qa/chromium-portrait.png)

Viewport bounds and document scroll dimensions are asserted in browser tests. Fine outlines, charcoal panels, cyan/amber joystick positions, three-column upper composition and bottom instruments/actions preserve the supplied panel rhythm. The center remains the largest panel. Contours, reticle, joystick surfaces and elevation are real SVG/CSS/DOM. Asset edit provenance and prompt are in `ASSET_PROVENANCE.md`.

## Defects corrected during this task

- Camera errors now classify DOMExceptions across JavaScript realms instead of relying on `instanceof Error`.
- Stale playback promises cannot interrupt a replacement stream. Buffering/paused previews withdraw the live badge and time out to Retry.
- Camera switching updates the front/rear label. Mode changes, blur, backgrounding and portrait rotation clear held input.
- Compass marks are centered independently of font metrics; map height labels fit without wrapping.
- Browser tests wait for the nonblocking boot banner to finish instead of racing its removal. CDP touch-end events identify the released contact; tests independently release one stick while the other continues.

## Deployment and remaining acceptance boundary

The PR remains unmerged; no deployment is claimed. `.github/workflows/deploy-pages.yml` builds and deploys `dist` after a reviewed merge to `main`. Required repository setting: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Intended HTTPS URL: `https://krishnadhoundiyal.github.io/rovergadv/`.

Real iPad acceptance still requires camera permission, actual rear/front selection, iPadOS background resume, thermal/frame-rate behavior and screen recording on the physical device. Automated WebKit, when recorded below, is browser-engine coverage and does not replace that hardware test.
