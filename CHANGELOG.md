# Changelog

## 0.3.0 — 2026-10-02

- Add four complete, editable demo decks for investor, sales, live-talk, and
  editorial use cases.
- Publish the four-deck showcase at `presentations.kujolang.ai` with stable deck,
  reading, print, and presenter routes.
- Add touch-swipe navigation for phones and tablets.
- Add deterministic social preview images and a rendered promo video for each
  demo style.
- Document how to download, run, and customize every included demo.
- Play the configured entrance on direct slide loads, honoring saved and reduced-motion preferences.
- Align the overview start button vertically with its introduction.

- Use self-hosted Inter body text and Oswald slide headings in the reference theme.
- Replace decorative arrow and plus glyphs with local Tabler SVG icons.

- Replace reference photographs with four original AI-generated WebP images.
- Record prompts, hashes, dimensions, encoding, and accurate alt text.
- Keep the four images within a combined 400 KiB release budget.
- Update the README preview and verify WebP delivery through static hosting.

## 0.2.0 — 2026-10-01

First tagged preview. Includes the reusable deck system, purpose-specific starters,
configurable Motion transitions, slide-only fullscreen, presenter tools, and the
verified Firefox transport correction. Content and extension APIs may change.

- Fix Firefox automation channel identity collisions with a verified source patch; remove ineffective per-test process isolation and test the hardened native server in CI.
- Fill fullscreen with the slide and hide viewer controls; keep keyboard navigation and restore focus on exit.
- Leave room between three-line problem titles and supporting copy; fix reading-list logical padding.

- Add translated viewer controls, RTL decks, and a self-hosted Arabic example.
- Add a presenter console, local private notes, timer, and full-deck print/PDF export.
- Replace reference photography with credited NASA assets and verified hashes.
- Use public SSG post routes and its interpreter execution path; compare output with the VM.
- Measure 10/100/500-slide decks and enforce performance budgets in CI.
- Verify pinned dependencies, reproducible Motion bundles, licenses, and advisories.
- Add deployment checks for MIME, CSP, caching, and optional authentication.
- Document remaining native Firefox, human accessibility, and real-host release gates.

- Reject hidden assets, symlinks, special files, and overly deep asset trees.
- Lock same-ID builds, stage output, and recover interrupted replacement.
- Test static hosting with MIME types, cache revalidation, CSP, and mounted routes.
- Save successful compiler caches even when later CI tests fail.

- Keep the public build command while moving its implementation into `src/`.
- Quote frontmatter and escape document metadata before SSG template processing.
- Reject unknown content fields, invalid inverse values, and repeated CLI flags.
- Add content language tags and include eyebrow/note text in the reading edition.
- Align dependency selection and omit unused cinematic bundles from basic decks.
- Check browser resource readiness explicitly and retain failure traces.
- Cache the pinned Kujo CI build and document deployment limits and follow-up work.

- Add an optional presentation package built on Kujo SSG and SiteKit.
- Add ten reusable layouts, deck JSON validation, themes, and local media.
- Generate static slide URLs, an overview, and a readable text edition.
- Add keyboard navigation, fullscreen, and optional Motion transitions.
- Add Editorial, Focus, and Kinetic animation presets with per-slide settings,
  reduced-motion support, and replay controls.
- Add investor, live-talk, and sales starters with an agent authoring workflow.
- Add setup, validation, build, preview, and browser inspection commands.
- Add browser, accessibility, content, and onboarding checks.
- Use Departure Mono for the reference overview title and revise release docs.

See [release status](docs/release.md) for the remaining publication checks.
