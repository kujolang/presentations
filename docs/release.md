# Release status

The package version is **0.1.0**, with preview status. The content and extension
APIs may change. README badges match the version and MIT license recorded in the
package files; they do not claim a stable release.

## Remaining release gate

The latest inspected CI run for `789e838` failed on two Firefox page-load
waits: the investor starter check and the interrupted-motion check.
[Run 36792293889](https://github.com/kujolang/presentations/actions/runs/36792293889)
records those failures. Investigate and obtain a passing run before publishing.
The documentation and font review also reproduced the investor page-load
timeout locally: 33 browser cases passed, two fullscreen cases were intentionally
skipped, and one failed. Builds, static contracts, onboarding, preview smoke,
and the Departure Mono rendering check passed. See the
[verification record](verification.md#documentation-and-font-review).

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
