# Engine verification — 2026-09-30

This records the initial engine milestone. See [release status](release.md) for
the current release gate.

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
Automated axe checks do not substitute for a screen-reader/user study. These local results do not establish the status of later remote CI runs.

Final results: the full matrix returned 12 passed, two intentional fullscreen skips,
and one Firefox overview-capture load timeout. The identical Firefox capture test
then passed in isolation (6.5 seconds; command `npx playwright test
--project=firefox --grep 'overview visual' --workers=1`). All thirteen applicable
cases therefore passed across the full run and targeted rerun. No functional or
accessibility failures remained. This records the transient capture timeout
rather than claiming an entirely green single invocation.

## Motion milestones

### Baseline (2026-09-30)

`npm test` passed the native builds, static contracts (including invalid motion
settings and omission of the bundle from disabled decks), four onboarding tests,
and real preview smoke. The browser matrix returned 28 passed and two intentional
headless fullscreen skips. All three engines exercised actual Motion animations,
presets, lazy loading, preference persistence, history, reduced-motion behavior,
disabled decks, and a blocked module. The reference preview was rebuilt with the
redistribution licenses. No upstream repository was changed.

### Choreography (2026-09-30)

The native builds, static contracts, four onboarding checks, and real preview
smoke passed. The full browser run had 33 passes, two intentional fullscreen
skips, and one Firefox comparison mismatch for empty style attributes. After
normalizing empty attributes on both sides of that comparison, all 12 motion
cases passed across Chromium, Firefox, and WebKit. Together these runs verify
all 34 applicable browser cases. The tests exercise content-level animation,
chart builds, replay, original-style restoration, reduced motion mid-sequence,
and missing hybrid-module fallback. Mid-animation and settled screenshots of
Editorial, Focus, and Kinetic were visually reviewed under `.build/motion-review/`.

## Documentation and font review

The reference overview title uses SiteKit's `--sk-font-mono` token at weight
400. Chromium confirmed that Departure Mono loaded for “A new perspective on
media.” The updated overview screenshot was visually reviewed and saved under
`docs/images/`. Documentation links, code fences, the minimal JSON example, and
version badges passed checks.

`npm test` passed the native builds, static contracts, four onboarding tests,
and preview smoke. The browser run finished with **33 passed, two intentional
fullscreen skips, and one failure**. Firefox timed out after 120 seconds while
loading `/investor/1/` in `tests/browser/decks.spec.js:93`. This matches one of the
failures in [CI run 36792293889](https://github.com/kujolang/presentations/actions/runs/36792293889).
The interrupted-motion case passed locally. The cause of the page-load stalls
remains unconfirmed; this run does not establish release readiness.

## Readiness review

The subsequent review fixed metadata handling and tightened the native content
contract, moved the implementation behind the stable root build command, added
language/reading support, and reduced basic-motion output by 55,335 bytes.
The full local `npm test` invocation passed: native example/starter builds,
static contracts, five build/onboarding tests, preview smoke, and **34 browser
passes with two intentional fullscreen skips and no failures or retries**.
The reference overview was visually reviewed and its composition was preserved.

A diagnostic run before the test-readiness change reproduced a Firefox stall on
`/sales/1/`. Its trace recorded successful HTML, stylesheet, and viewer-script
responses; the failure screenshot showed the rendered slide. Waiting for the
browser-wide `load` event still timed out. The revised checks explicitly wait for
styles, viewer initialization, fonts, and image decoding. This removes that test
lifecycle dependency without claiming an upstream browser/server root cause.

The end-to-end fixture checks quoted frontmatter, escaped literal title and
metadata, a subdirectory canonical URL, `fr-CA` document language, reading notes,
basic-only Motion distribution, and rejection of duplicate native options.
See [the readiness review](readiness-review.md) for remaining work and scope limits.

## Build safety and static hosting follow-up

On 2026-09-30, `npm test` passed with Kujo 1.5.0 on macOS: both examples,
all three starters, static contracts, seven Node tests, native preview smoke,
and 37 browser cases in Chromium/Firefox/WebKit. Two headless fullscreen cases
were intentionally skipped; no browser retries were used. The browser phase took
5.2 minutes on this run; this is a test duration, not a performance benchmark.

New tests reject symlinks (file, external, directory/cycle, dangling, and asset
root), hidden files, FIFOs, and overly deep trees. They exercise competing builds,
failed SSG generation, interrupted publication state, recovery, and successful
replacement. The depth fixture exposed Kujo's 32-call stack limit; the explicit
asset depth limit is 16 so rejection happens before reaching it.

The browser matrix now uses a separate static-host fixture. Added checks cover
mounted routes, refresh, MIME types, cache revalidation, and an enforced CSP.
Native preview transport remains separately reproducible; this pass does not
resolve the Firefox CI stalls seen with native preview in run36801899062.
See [release status](release.md) and [next priorities](next-session-build-safety.md).
