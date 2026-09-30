# Starter onboarding verification — 2026-09-30

The onboarding milestone adds investor (9 slides), live-talk (7), and sales (7)
starters alongside the existing reference and field-notes examples. All use the
same native Kujo builder and optional viewer. SSG and SiteKit remain unchanged.

Verification used `npm test` with Kujo 1.5.0 on macOS. It rebuilds both
examples and all three starters, then runs static contracts, four onboarding
checks, a real one-command start/HTTP-preview smoke test, and the Chromium,
Firefox, and WebKit matrix. The starter cases inspect every slide for canvas
bounds, title/copy overlap, and axe WCAG A/AA violations.

The scaffold checks exercise source-brief preservation, independent copied
content, refusal to overwrite, invalid-input cleanup, schema/catalog consistency,
structured doctor output, and draft/readiness behavior. The start smoke test
creates a temporary deck, reuses pinned dependencies, builds with Kujo SSG,
serves and fetches its overview and final slide, then removes its own files and
stops its own preview process.

The standalone inspector also passed all 11 investor pages (overview, nine
slides, and reading edition). Its report and decoded screenshots are generated
under `.build/investor/review/`. The three starter overview captures were visually
reviewed after the image-free layout arrangements were added.

A prior remote Firefox test raced the deferred viewer script by pressing the next
key immediately after the URL changed. The keyboard test now waits for each
page's load event before sending another key. Remote CI results are separate
from this local verification record. The final combined run passed every build,
static/onboarding check, and preview smoke, but Firefox stalled waiting for the
full overview load event in the no-JavaScript case. That test now waits for
DOMContentLoaded before exercising visible native links;
image decoding, font readiness, and asset checks remain covered in the
JavaScript-enabled cases. Waiting on document.fonts.ready also stalled in the
Firefox context with page JavaScript disabled, so the native-link test avoids
that unrelated promise. The full browser
matrix was rerun after this test-only change.

Limits: these are editable drafts with explicit factual placeholders. Readiness
checks do not verify facts or narrative quality; screenshots still need review
with the author's final content. The live-talk starter supplies a narrative,
not a presenter console, timer, or speaker notes. Initial setup requires network
access and existing Git, Node 20+, and Kujo 1.5+. Repository access is currently
required. Automated inspection needs the optional development dependencies.

Final browser rerun: **22 passed, 2 intentionally skipped, 0 failures** in one
invocation (2.4 minutes). The skips are the existing headless Firefox/WebKit
fullscreen cases; Chromium fullscreen is verified. All four onboarding tests,
static contracts, and the one-command preview smoke passed. No presentation
runtime dependency or upstream change was added.
