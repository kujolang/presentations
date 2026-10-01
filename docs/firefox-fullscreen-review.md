# Native Firefox and slide-only fullscreen

## Navigation diagnosis

The shared-process native Firefox suite reproduced a timeout at `page.goto`,
including with Playwright 1.63.0 / Firefox 155. Updating the browser alone did
not fix it, and its WebKit build introduced a separate navigation stall. The
project therefore retains Playwright 1.62.1. The protocol capture contains a `Page.navigate` result for `nav-169`
and an HTTP 200 document response, but no `Page.navigationCommitted` event for
that navigation. The failure screenshot shows the rendered page. Playwright
therefore waits for an automation event that never arrives.

This matches the symptoms in [Playwright issue 42183](https://github.com/microsoft/playwright/issues/42183).
That report is supporting context, not proof that its exact internal cause is
ours. We did not patch Firefox, Playwright, Kujo, SSG, or SiteKit.

`tests/browser/fixtures.js` gives each Firefox test its own browser process.
Each no-JavaScript viewport is a separate test, so it has the same isolation.
Chromium and WebKit retain their shared worker browsers. Navigation, HTTP,
geometry, accessibility, motion, and resource assertions remain in place.
There are no retries, ignored navigation errors, or replacement HTTP responses.
The native server keeps all of its hardened headers.

`npm run test:native` runs the deck, motion, language, and presenter checks
against Kujo's native server. CI runs it in addition to the three-engine static
host suite. The mounted-host fixture test stays in the static suite because
its artificial `/mounted/` mapping is a fixture feature.

A diagnostic run with hardened headers disabled passed, but disabling security
was rejected as a fix. The protocol evidence identifies missing automation
notification; it does not establish a generic native HTTP server defect.
Process isolation is a test-harness workaround for the driver limitation.
To investigate the original shared-process behavior, opt in explicitly:

```sh
PRESENTATION_SHARED_FIREFOX=1 npm run test:native
```

That diagnostic can still fail. It is not the default verification path.

## Fullscreen behavior

Fullscreen keeps a stable document root while slides change. It hides controls,
help text, the skip link, and progress, removes viewer padding, and fits the
16:9 canvas to the screen. Other screen shapes have letterboxing.
Left/Right, Home/End, Escape, and F work without visible buttons or enabled motion.
Focus returns to the fullscreen button on exit, including when a transition was
still finishing. The regression checks geometry, hidden controls, history,
keyboard navigation, reduced motion, and focus restoration.

The current browser also exposed a three-line title touching its supporting
copy in the image-free problem layout. The copy now has a clear gap. The reading
list uses the valid logical padding property.

## Verification

Results are recorded in the release status and session handoff after the final
runs. Historical failing traces remain under `.build/firefox-investigation`,
`.build/firefox-163`, and `.build/firefox-full-protocol` in the working checkout.
CI retains new failures in its browser evidence artifact. A passing isolated
suite does not claim the upstream shared-process driver bug is repaired.
