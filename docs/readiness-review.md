# Readiness review and next-session work

Reviewed on 2026-09-30, starting from `14cb0b0`.

Presentations is a useful static presentation toolkit, but it is still a preview.
This review does not establish enterprise certification or suitability for every
organization. The supported model is a trusted author building a static deck in
a private workspace, then choosing a host and audience. It is not a service for
processing hostile uploads or isolating tenants.

## Improvements in this review

| Area | Change | Evidence |
| --- | --- | --- |
| Content integrity | Quote generated frontmatter and escape title/description HTML before SSG template processing | A new build fixture reproduced punctuation breaking frontmatter and template-shaped metadata expanding; the corrected output preserves literal text |
| Authoring | Reject unknown fields, invalid inverse values, and repeated native CLI options | Native contract cases plus the end-to-end build test |
| Accessibility | Add optional `lang`, defaulting to `en`; retain eyebrow and note text in the reading edition | Schema and generated-page assertions |
| Structure | Move the build implementation to `src/build.kujo`; retain a three-line root entry point | Existing native and Node commands exercise the same implementation |
| Reproducibility | Prefer installed `.deps/` checkouts consistently in both entry points | Explicit `--ssg` and `--sitekit` still override native defaults |
| Distribution size | Omit the hybrid Motion bundle when all enabled effects are basic | Build test verifies its absence: 55,335 fewer uncompressed bytes with the pinned bundle |
| Validation work | Reuse each layout contract within a validation call | Contract checks remain intact; no build-speed claim without a benchmark |
| Browser verification | Wait for document commit, styles, viewer initialization, fonts, and images | The Firefox trace showed a rendered page with successful resource responses while `load` remained pending; checks now assert the resources they depend on |
| CI | Cache the pinned Kujo build, bound job duration, cancel superseded runs, retain browser traces | Workflow configuration and exact-commit CI result |
| Documentation | Explain deployment, asset publication, trust boundaries, and root-file ownership | README, architecture, authoring, and deployment guides |

The new test does not turn the partial security audit into a security guarantee.
The static audit reviewed first-party build, renderer, viewer, CLI, setup, and
inspection boundaries at the starting revision. It found no confirmed
vulnerability there, but identified metadata and asset assumptions for further
verification. The subsequent build fixture exposed and fixed the metadata bug.
Third-party bundles, dependency advisories, and upstream runtime internals were
not exhaustively audited. Scan reference: `a5e67b6a-ced3-4283-9241-53660e7b4eed`.

## Root directory decision

No obsolete root implementation remains. `build.kujo` is the public entry point
referenced by Kennel, examples, and existing commands. Package manifests, the
schema, README, license, and agent entry files belong at the root for tool and
human discovery. Moving them merely because `src/` exists would break useful
conventions. Native implementation belongs in `src/`; Node tools, browser assets,
layouts, content, tests, and documentation keep their separate directories.

## Prioritized work for the next session

These are scoped follow-ups, not promises that every feature will be added.
Start with the release gates, then choose the improvements needed by real users.

| Priority | Item and source | Done when |
| --- | --- | --- |
| P0 | Verify the exact release commit in CI; prior Firefox load waits failed in runs `36792293889` and local diagnostics (`tests/browser/`) | The full native, onboarding, build-regression, and browser pipeline passes without retries; any remaining exclusions are named |
| P0 | Confirm rights to demo photographs (`examples/reference/ASSETS.md`) | Each distributed photograph has documented source/permission, or is replaced with an asset whose rights are clear |
| P1 | Define and enforce asset-tree containment (`src/build.kujo:copy_tree`) | File and directory symlinks, cycles, hidden/private files, and external targets have an explicit policy and tests; failures occur before publication |
| P1 | Make same-ID builds safe and recoverable (`src/build.kujo`) | A lock or isolated staging strategy rejects concurrent conflicts; a failed build preserves the last good output; failure and interruption tests pass |
| P1 | Measure large decks before optimizing (`src/render.kujo`, overview CSS) | Reproducible 10/100/500-slide fixtures record build time, memory, output bytes, browser readiness, and overview scrolling; agreed budgets run in CI |
| P1 | Add a release supply-chain check (`dependencies.json`, setup script, lockfile) | Release builds verify dependency revisions, regenerate/compare Motion bundles, check advisories, and retain a dependency/license inventory |
| P1 | Test static-host deployment settings (`docs/deployment.md`) | A host fixture checks MIME types, direct URLs, subdirectory hosting, caching, optional-motion fetches, and an appropriate CSP; confidential-deck authentication is tested at the host |
| P2 | Expand language support (`lang`, themes, viewer labels) | Translated controls, RTL compositions, non-Latin fonts, and long translated text pass visual and assistive-technology review; language tags alone are not called full localization |
| P2 | Choose live-talk and export features with users | Speaker notes, presenter view/timer, and full-deck print/PDF have separate contracts and tests; confidential notes never leak into public output |
| P2 | Establish an accessibility and platform support matrix | Manual screen-reader and keyboard reviews accompany automated axe checks; supported browsers/OS versions are named; Windows is claimed only after native workflow tests |

## Verification record

The final results for this change are recorded in [release status](release.md).
The full suite includes both examples, all three starters, invalid-content
contracts, onboarding, the metadata/language/bundle fixture, a real preview smoke
test, and Chromium/Firefox/WebKit checks. Two headless fullscreen cases remain
intentional exclusions; Chromium exercises fullscreen.

Use the [deployment guide](deployment.md) before sharing a deck. No release tag,
publication, repository visibility change, or upstream modification is part of
this review.
