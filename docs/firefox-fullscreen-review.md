# Native Firefox and slide-only fullscreen

## Firefox root cause

The failure came from Firefox's Juggler automation transport. A replacement
channel reused the process ID as its identity. The parent retained replies from
the previous channel and could mistake a new event for an old request with the
same numeric ID.

An instrumented run captured `pageNavigationCommitted` being discarded against
a cached `pageNavigationStarted` reply. The document returned HTTP 200 and
rendered, but Playwright never received the commit event. A deterministic test
using the upstream source reproduces the same event loss.

The [source fix](../patches/firefox-channel-identity/README.md) gives each channel
a UUID using Juggler's existing helper. It preserves the identity when the same
channel rebinds, so legitimate duplicate suppression still works. The tests also
cover stale asynchronous responses and preparation integrity.

The earlier process-isolation workaround has been removed. It passed locally
but failed native CI run 36859020025. Normal Playwright fixtures now share
Firefox processes. Security headers, assertions, and timeouts remain in place;
there are no retries or ignored navigation errors.

`npm run prepare:browser` creates a project-owned copy of the pinned browser and
applies the exact source correction after version and hash checks. Python 3 is
needed only for browser test preparation. Test commands prepare automatically.
The installed browser and generated decks remain unchanged. The fix is maintained
locally; it has not been submitted or released upstream.

`npm run test:native` runs deck, motion, language, and presenter checks against
Kujo's hardened server. CI runs it alongside the three-engine static-host suite.
The synthetic mounted-host test stays in the static suite.

To reproduce the uncorrected dependency without changing files:

```sh
PRESENTATION_STOCK_FIREFOX=1 npm run test:native
```

Each overview and direct slide route has its own geometry/accessibility test.
A separate WebKit trace showed an accessibility scanner taking 63 seconds to
close a temporary page, exhausting the old shared budget for 14 routes. Separate
cases keep every assertion and the per-test timeout. Keyboard/history tests
still exercise sequential navigation within one page.

## Fullscreen behavior

Fullscreen keeps a stable document root while slides change. It hides viewer
controls, help, skip link, and progress; removes padding; and fits the 16:9 canvas
to the screen. Other screen shapes have letterboxing. Left/Right, Home/End,
Escape, and F work without visible buttons or enabled motion. Focus returns to
the fullscreen button on exit, including when a transition is still finishing.

The regression checks geometry, hidden controls, history, keyboard navigation,
reduced motion, and focus restoration. Exact-commit CI artifacts and the session
handoff record final verification; the source-fix README records maintenance
requirements and upstream provenance.
