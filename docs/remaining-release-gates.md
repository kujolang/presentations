# Completion record and remaining release gates

Updated 2026-10-01. This record supersedes the open implementation list in the
readiness and build-safety reviews. The package remains a 0.1.0 preview.

## Completed

| Work | Result |
| --- | --- |
| Reference photography | Four credited NASA images replace the unclear assets; source URLs, rights basis, hashes, and README preview are updated |
| Large decks | Deterministic 10/100/500-slide benchmarks, recorded baseline, and CI budgets; public SSG contracts and interpreter/VM byte parity |
| Dependencies | Pin/cleanliness checks, reproducible Motion bundles, npm advisories, media hashes, and license inventory |
| Language | English/Arabic control catalogs, custom labels, explicit RTL, local Arabic font, schema and browser tests |
| Live talks | Presenter current/next previews, timer, audience window, local private-note import and clear; no note upload or persistence |
| Export | Static full-deck print route and local Chromium PDF command with overwrite protection |
| Deployment tooling | Checks for direct URLs, MIME, cache, CSP, and optional signed-in/signed-out access; tested against controlled fixtures |
| Documentation | Feature contracts, support matrix, measured performance, agent catalog, and release limitations |

SSG, SiteKit, and Kujo source remain unchanged. Presentation code and dependencies
remain optional. Private notes are distinct from public slide annotations.

## Still requires evidence

1. **Native preview + Firefox:** full native-host browser runs still intermittently
   stall before document commit. The lightweight 120-navigation probe passed, and
   a Node-host experiment with COOP also passed; neither isolates the cause.
   Preserve a failing Playwright trace with the command below and investigate the
   server/browser interaction. Do not interpret the static-host CI result as a fix.
2. **Deployment:** no real host URL, provider, or access policy was supplied.
   Run the documented host checker against the intended deployment, including
   unauthenticated denial for confidential decks. Do not publish merely to fill this gap.
3. **Human acceptance:** automated axe, keyboard, geometry, fonts, RTL, and print
   checks pass. VoiceOver/NVDA and fluent Arabic review remain required. The presenter
   console is English; Windows native tooling is unsupported. See the support matrix.
4. **Repository history:** replacement photographs fix the current tree, but old
   Git revisions retain the previous images. Review rights before exposing private
   history. No history rewrite or visibility change was authorized or performed.
5. **Release decision:** verify CI for the chosen release revision, then approve
   versioning/publication. No release tag or package publication is created here.

```sh
PRESENTATION_TEST_HOST=kujo PRESENTATION_TEST_PORT=8095 npx playwright test decks.spec.js motion.spec.js --project=firefox --output .build/native-browser-results
```

This diagnostic remains separate from the static hosting contract suite. Its
failures remain release evidence, even when `npm test` passes. It is not retried
or marked as an expected pass. Keep traces outside `test-results` when running
another Playwright process so one run cannot erase the other run's artifacts.

See [release status](release.md), [feature contracts](presentation-features.md),
[performance](performance.md), and [support matrix](support-matrix.md).
