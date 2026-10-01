# Release status

The package version is **0.1.0**, with preview status. The content and extension
APIs may change. README badges match the version and MIT license recorded in the
package files; they do not claim a stable release.

## Current review verification

The build-safety follow-up passed `npm test` locally on macOS with Kujo 1.5.0:
both examples, all three starters, static contracts, **seven Node tests**, and
the real native preview smoke passed. The browser matrix finished with **37
passed, two intentional headless fullscreen skips, and zero failures**, without
retries. Browser tests used the separate static-host fixture; native preview is
covered by its HTTP smoke test, not by that browser result. Markdown links and
`git diff --check` also passed.

The previous exact-commit CI run
[36801899062](https://github.com/kujolang/presentations/actions/runs/36801899062)
failed two Firefox navigations before document commit. The new revision still
requires its own passing CI result before release. The
[build-safety follow-up](next-session-build-safety.md) records the implementation,
transport limitation, and next priorities. Reference-photo rights remain open.

## Release gate from the previous revision

The latest inspected CI run for `789e838` failed on two Firefox page-load
waits: the investor starter check and the interrupted-motion check.
[Run 36792293889](https://github.com/kujolang/presentations/actions/runs/36792293889)
records those failures. Investigate and obtain a passing run before publishing.
The documentation and font review also reproduced the investor page-load
timeout locally: 33 browser cases passed, two fullscreen cases were intentionally
skipped, and one failed. Builds, static contracts, onboarding, preview smoke,
and the Departure Mono rendering check passed. See the
[verification record](verification.md#documentation-and-font-review).

The [readiness review](readiness-review.md) records the corrective work and
prioritized follow-ups. Its test-readiness changes do not certify a browser or
server root cause. Release status follows the exact commit's verification.

## Before publishing

1. Confirm the intended version and release status in `package.json`,
   `package-lock.json`, `kennel.toml`, README badges, and the changelog.
2. Run dependency setup and `npm test` from a clean checkout. Check CI on the
   exact commit to be released.
3. Review the reference and starter decks, direct links, text edition, motion,
   and no-JavaScript navigation. Keep the two headless fullscreen test exclusions
   visible in release notes.
4. Confirm media permissions and retain font, image, and Motion license files.
   [Asset sources](../examples/reference/ASSETS.md) record the demo provenance.
5. Check repository access and publish only after the release decision is made.

## Test records

- [Initial engine and reference deck](verification.md)
- [Starter and agent workflow](onboarding-verification.md)
- [Motion milestones](verification.md#motion-milestones)

These dated records describe the runs that occurred. They are not promises that
a later commit or a different environment will pass.
