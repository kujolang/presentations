# Release status

Version **0.1.0** remains a preview. It is not certified for every enterprise,
host, language, or assistive technology. No package, tag, or deployment has been
published by this review.

## Verification

On macOS with Kujo 1.5.0, the expanded suite passed native builds for three examples
and three starters, content contracts, **eight Node tests**, native preview HTTP
smoke, and **43 browser checks** across Chromium, Firefox, and WebKit. Two headless
fullscreen checks are intentionally skipped; Chromium exercises fullscreen.
Browser integration tests use the controlled static host. Separate full Firefox
runs against native preview still intermittently fail and remain an open gate.

Release checks verified two dependency pins, two reproducible Motion bundles,
39 npm package license records, distributed license files, media hashes, and zero
reported npm advisories at check time. This is not an exhaustive security audit.
The 10/100/500-slide benchmarks passed their budgets; machine-specific evidence
is stored in `docs/evidence`. A nine-page reference PDF was exported locally.

The previous revision `04e231c` passed
[CI run 36805198341](https://github.com/kujolang/presentations/actions/runs/36805198341).
Later revisions require their own CI result. Historical failed runs remain in
[verification](verification.md); they are not the current static-host result.

## Before publishing

1. Check CI on the exact release revision and run `npm run verify:release`.
2. Resolve or explicitly scope the native Firefox preview limitation.
3. Complete the real-host and human accessibility/language checks.
4. Review media terms and old Git history before changing repository visibility.
5. Confirm version/status across manifests, badges, and changelog; then make the
   release decision separately from code verification.

[Remaining release gates](remaining-release-gates.md) records the unresolved work.
[Asset credits](../examples/reference/ASSETS.md), [feature contracts](presentation-features.md),
and [support matrix](support-matrix.md) define the supported scope.
