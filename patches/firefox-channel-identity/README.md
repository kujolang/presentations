# Firefox channel identity fix

This one-line source correction prevents lost automation events when Firefox
replaces a Juggler channel inside the same process. It applies to any site,
including static pages served with `Cross-Origin-Opener-Policy: same-origin`.
It is test tooling; generated decks contain none of it.

## Cause and correction

Juggler's `SimpleChannel` retains responses until the sender acknowledges them.
On transport reattachment, this suppresses duplicate requests. It clears that
cache when the peer's identity changes.

The content initializer used `process-<PID>` as the identity of each new channel.
Two distinct channels in one process therefore looked like the same peer. Their
request counters both started at one. A cached response to an old request could
silently consume a new event with the same ID.

Our instrumented native-server run captured request 12 carrying
`pageNavigationCommitted` being discarded against a cached
`pageNavigationStarted` response. The document had loaded; the commit event
never reached Playwright. Per-test browser isolation did not fix this reliably:
CI run [36859020025](https://github.com/kujolang/presentations/actions/runs/36859020025)
still timed out in native Firefox.

[`fix.patch`](fix.patch) assigns a UUID through Juggler's existing
`helper.generateId()` when the channel is created. Rebinding the same channel
preserves its identity and duplicate suppression. Creating another channel gets
a new identity, so old replies cannot consume its events.

## Reproducible preparation

`npm run prepare:browser` requires Python 3's standard library. It:

1. Checks the pinned Playwright version, Firefox revision, and SHA-256 hashes of
   the upstream initializer and transport sources.
2. Copies the installed browser to an ignored, project-owned build directory.
3. Replaces exactly one expression and checks the corrected source hash.
4. Retains the original sources for regression tests and records the archive hash.

Subsequent preparation verifies the cached artifact. Changed dependencies or
sources fail with a review request; they are never patched by a loose pattern.
The installed Playwright browser, its native executable, HTTP headers, and
presentation output are unchanged. No download runs during preparation.
`npm test`, `npm run test:browser`, and `npm run test:native` prepare automatically.
For direct `npx playwright test` calls, run preparation first.

Normal Playwright fixtures share a Firefox process between tests again.
There are no navigation retries, swallowed errors, or synthetic commit events.
Use `PRESENTATION_STOCK_FIREFOX=1 npm run test:native` only to compare the
uncorrected upstream browser; that diagnostic can fail.

## Tests and maintenance

`tests/firefox-transport.test.mjs` executes the exact upstream transport and
initializer sources. Its negative control reproduces the lost commit. The
corrected case delivers both events. Other cases preserve same-channel replay
suppression and reject stale asynchronous responses after peer replacement.
Preparation tests ensure unknown source fails before copying and that every
archive member except the intended initializer stays unchanged.

Preparation supports macOS and Linux; CI exercises Linux. This is a maintained
source patch to a test dependency, not an upstream release. On a Playwright
update, inspect upstream status, rerun these regressions and the native suite,
then either remove this patch or review new pins. Do not update hashes merely
to make preparation pass. No upstream issue or PR has been sent.

## Source and license

- [Firefox initializer at Playwright v1.62.1](https://github.com/microsoft/playwright/blob/v1.62.1/browser_patches/firefox/juggler/content/main.js)
- [SimpleChannel at the same revision](https://github.com/microsoft/playwright/blob/v1.62.1/browser_patches/firefox/juggler/SimpleChannel.js)
- [MPL 2.0](https://www.mozilla.org/MPL/2.0/): the modified Firefox source and this
  patch retain that license. Original notices remain in the prepared archive
  and extracted test sources. The preparation scripts remain MIT.
