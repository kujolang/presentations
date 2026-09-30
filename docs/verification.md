# Verification record — 2026-09-30

The package was built with Kujo 1.5.0 on macOS. Both existing sibling dependencies
and fresh isolated clones at the revisions in dependencies.json were used. The
isolated SiteKit distribution was generated from source through its own npm build.
Both upstream working trees and the isolated dependency clones remained clean.

Commands used for the clean-consumer run:

```sh
node scripts/setup-dependencies.mjs
kujo run build.kujo -- --ssg .deps/ssg --sitekit .deps/site-kit/dist
kujo run build.kujo -- --deck examples/field-notes --ssg .deps/ssg --sitekit .deps/site-kit/dist
node tests/contracts.mjs
npx playwright test
```

SSG successfully generated ten content pages plus the overview for the reference
example (nine slides and one reading page), and four content pages plus the
overview for field-notes (three slides and one reading page). Static contract tests
passed, including invalid content rejection, local-only image paths, escaping,
empty/one/ten-slide manifests, no viewer script on overview/reading pages, no
unresolved template slots, and no reference-specific identity in the engine.

The browser matrix covers Chromium, Firefox and WebKit at 1440×1000; fixed
composition, navigation and reading mode are also tested at 390×844, 844×390, and
768×1024 with JavaScript disabled. Each slide and overview undergoes axe checks
for WCAG A/AA rules. The full-page sweeps use a 120-second test timeout to allow
multiple page loads and accessibility scans; automatic retries are disabled.
Fullscreen persistence and back/forward are tested in Chromium. The corresponding
headless Firefox/WebKit fullscreen cases are intentionally skipped, not claimed
as verified. Normal navigation, resizing, and no-JavaScript behavior are covered
in all three engines.

Both overview screenshots were visually inspected. Tracked captures under
`docs/images/` come from Chromium after local image/font decoding. They are
review artifacts only; the actual presentation uses HTML, CSS, SVG and local
photography. The black/off-white/orange reference identity and green/serif garden
identity remain independent of the engine.

An early check incorrectly treated tight headline line-height as clipped content;
the geometry check now measures actual element bounds against the canvas. Browser
verification also caught and resolved a link-color override affecting the primary
SiteKit button, and a keyboard guard that blocked arrow navigation while a
fullscreen control had focus.

Limitations: the original reference image was never attached, so pixel-level
reference fidelity could not be assessed. Demo copy and metrics are fictional.
Automated axe checks do not substitute for a screen-reader/user study. The CI
workflow is supplied but local results do not imply a completed remote CI run.

Final results: the full matrix returned 12 passed, two intentional fullscreen skips,
and one Firefox overview-capture load timeout. The identical Firefox capture test
then passed in isolation (6.5 seconds; command `npx playwright test
--project=firefox --grep 'overview visual' --workers=1`). All thirteen applicable
cases therefore passed across the full run and targeted rerun. No functional or
accessibility failures remained. This records the transient capture timeout
rather than claiming an entirely green single invocation.
