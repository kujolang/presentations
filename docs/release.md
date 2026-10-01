# Release status

Version **0.3.0** remains a preview. It is not certified for every enterprise,
host, language, or assistive technology. GitHub releases distribute source archives. The npm package remains private to
prevent accidental registry publication. A release does not deploy user decks.

## Verification gates

CI runs these checks on each revision:

- `npm test`: native builds, content and Node contracts, preview HTTP smoke,
  and Chromium/Firefox/WebKit checks against the static-host fixture.
- `npm run test:native`: Firefox deck, motion, language, and presenter checks
  against the hardened Kujo server. Firefox uses a pinned transport source correction and shared processes.
- `npm run verify:release`: dependency revisions, reproducible Motion bundles,
  license inventory, media hashes, and npm advisories.
- `npm run benchmark`: the 10/100/500-slide performance budgets.

Headless Firefox/WebKit fullscreen checks remain named skips. Chromium verifies
slide-only fullscreen, geometry, keyboard/history navigation, reduced motion,
and focus restoration. Automated checks do not replace human accessibility or
language review, and dependency checks are not an exhaustive security audit.

The [Firefox/fullscreen review](firefox-fullscreen-review.md) explains the missing
channel-identity collision and its source correction. The earlier process-isolation
workaround failed CI and has been removed. The corrected browser is prepared in
a project-owned directory; no upstream release is claimed.

Revision `6886c3e` passed
[CI run 36809598952](https://github.com/kujolang/presentations/actions/runs/36809598952).
Later revisions need their own result. Exact-commit CI artifacts and the session
handoff record subsequent verification; earlier [test records](verification.md)
and checked-in measurements describe the runs that produced them.

## Before publishing

1. Check CI on the exact release revision and run the release dependency check.
2. Verify the pinned Firefox source fix on macOS/Linux. On dependency updates,
   review upstream status and rerun the transport regressions before changing pins.
3. Complete real-host and human accessibility/language checks.
4. Review media terms and old Git history before changing repository visibility.
5. Confirm version/status across manifests, badges, and changelog; make the
   publication decision separately from code verification.

[Remaining release gates](remaining-release-gates.md), [asset credits](../examples/reference/ASSETS.md),
[feature contracts](presentation-features.md), and [support matrix](support-matrix.md)
define the supported scope.
