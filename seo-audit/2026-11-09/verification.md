# Verification and review

- Baseline artifact SHA-256 retained in raw/baseline.sha256; archive reopened for baseline lab measurement. Production baseline captured before deployment; source edits started only after snapshot and initial baseline crawl existed. Initial DNS failure is retained separately.
- Native build and static contracts passed. npm test: 14 Node tests passed, Firefox 32 passed / 1 skipped, 66 bundled Chromium/WebKit launch failures because those pinned executables are missing. Raw npm-test.log is the authoritative nonzero result; not represented as a complete pass.
- Available Chromium 149 headless shell regression: all 33 browser tests passed (raw/chromium-regression.log). Explicit installed-binary override used; no repository browser pin changed.
- Publication Chrome checks: 18 slides × 4 viewports (1920×1080,1366×768,768×1024,390×844), full-width canvas and no horizontal overflow assertions. Initial arrow version retained as after-*; final user-directed arrow-free version uses final-* screenshots/reports.
- Local and live interaction receipts test keyboard/Home/End, menu, fullscreen, reading (18 headings), print (18 canvases), local presenter notes, six actual evidence panels, reduced motion, and real browser touch input forward/back. No visible arrows remain. Six representative axe scans report zero violations; this is automated coverage, not a complete accessibility certification.
- Two visual passes: first identified tablet typography and mobile overlay crowding. Tablet uses readable vertical composition. Final user correction removes arrows/bottom rail entirely; native swipes and keyboard controls retained. Main content and source links remain server-rendered.
- Native viewer now resolves response.url after redirect. This fixes Home-key history when /1/ redirects to /. Native regression and publication keyboard tests both exercise the change.
- Production redirects: HTTP→HTTPS 301, /1 and /1/→/ 301; query retained; /2→/2/ 308; appendix.html→appendix 308. One hop, final 200. Missing route returns 404. www.invest is not configured and is not a published canonical host.
- Five crawler user agents × five routes returned 200; unchanged robots policy. This does not simulate provider IP origin or measure actual crawls.
- Baseline Lighthouse first attempt NO_FCP under concurrent machine load retained. Sequential retry: baseline performance 98, after 97; accessibility and SEO 100 both. These single local mobile lab runs do not demonstrate a speed improvement. Field CWV and INP require actual data.

Final correction: the custom-domain stylesheet retained the earlier arrows after
the new Pages deployment was available on its unique URL. The failed
live-final-browser.log is retained. Cloudflare dashboard confirmed a targeted
cache purge of public-view.css, and curl confirmed `.ki-navigation{display:none}`.
The zone's existing 4-hour browser cache setting was observed but not changed.
An optional content-fingerprinting deployment failed with a provider internal
error using both Wrangler 4.151.3 and 4.159.0; that source change was reverted.
The successful arrow-free deployment remains the production release. Latest live
verification is live-verified-*; final Lighthouse: performance 97, accessibility
100, SEO 100. No ranking or AI citation result is inferred.

Final publication succeeded after restoring source alignment:
https://06359401.kujo-investor.pages.dev (raw/deploy-confirmed-source.log).
The fingerprinted trial was not required for delivery and is not in final source.
There is no remaining publishing blocker. Live custom-domain checks passed with
zero page errors, no visible arrows, and browser touch input in both directions
(raw/live-verified-interactions.json). SignalBox: no captures warranted.
