# Build safety and hosting follow-up

> Historical review. The [completion record](remaining-release-gates.md) supersedes
> the open implementation checklist below and records the remaining release gates.


This session takes the asset-containment and build-recovery items from the
[readiness review](readiness-review.md). It also adds a static-host fixture to
separate browser behavior from native preview transport.

## Completed

- Validate every deck asset, including unused files, before generating output.
  Reject hidden entries, file/directory/dangling symlinks, special files, and
  directory nesting beyond 16 levels. Symlink cycles fail without traversal.
- Lock builds by deck ID. Generate into private staging, then replace output.
  Failed generation preserves the previous deck. Interrupted publication has a
  documented recovery path; stale locks require an operator to stop the old build.
- Test asset rejection, competing processes, failed generation, interrupted
  publication state, recovery, and successful replacement.
- Serve browser fixtures independently on port 8087 with MIME types, revalidation,
  and an enforced CSP. Test direct URLs, refresh, and a mounted path in each engine.
  Keep native preview startup and HTTP smoke coverage.
- Save the pinned compiler cache immediately after a successful compiler build,
  so a later test failure does not discard an expensive successful compilation.

## Limits

The workspace and authors remain trusted. These checks do not isolate hostile
uploads or stop another process from changing files during a build. Ordinary
files with private content still get copied: review the public asset directory.
The two-rename replacement has a brief gap and is not an atomic hosting release.

CI run [36801899062](https://github.com/kujolang/presentations/actions/runs/36801899062)
failed two Firefox navigations before document commit. Earlier readiness waits
did not resolve this. The new host fixture distinguishes generated-deck behavior
from that transport issue; it does not establish its root cause or certify the
native preview across browsers. No SSG, SiteKit, or Kujo source was changed.

## Next priorities

| Priority | Work | Acceptance |
| --- | --- | --- |
| P0 | Check CI on the exact release revision | Full suite passes without retries; retain named fullscreen exclusions |
| P0 | Resolve reference-photo rights | Document original permission or choose replacement photography with clear rights; current provenance alone is insufficient |
| P1 | Diagnose native preview + Firefox transport | A small reproduction explains the hanging navigation and validates any fix in the owning repository; do not weaken browser assertions |
| P1 | Measure 10/100/500-slide decks | Record build time, peak memory, output size, readiness and scrolling before setting budgets |
| P1 | Verify release dependencies | Check pins, regenerated Motion bundles, advisories and license inventory |
| P1 | Validate the actual deployment host | Check authentication for confidential decks, cache behavior, MIME and CSP; the local fixture is only a baseline |
| P2 | Choose localization, presenter and export work | Write separate contracts and review real user needs before expanding the engine |

Detailed verification belongs in [release status](release.md). The earlier
[readiness review](readiness-review.md) retains the broader roadmap.
