# Support and review matrix

| Surface | Verified automatically | Limit |
| --- | --- | --- |
| Native author/build tools | macOS with Kujo 1.5; Ubuntu CI on the pinned compiler | Windows is unsupported; the build uses POSIX filesystem commands |
| Viewer, reading and overview | Playwright Chromium, Firefox, WebKit; package-lock pins the versions | Browser emulation is not an exhaustive device matrix |
| Fullscreen | Chromium | Firefox/WebKit headless fullscreen cases are named skips |
| Static-host fixture | All three engines, direct/mounted routes, MIME, cache and CSP | A real host needs its own test, especially authentication |
| Native preview | HTTP startup smoke and Firefox feature suite on the hardened server | Tests isolate Firefox processes to avoid missing driver navigation events; see [review](firefox-fullscreen-review.md) |
| PDF | Chromium pagination and local font/image readiness | Other print dialogs and accessible PDF tagging need separate review |
| Arabic / RTL | Local font, translated viewer controls, geometry, axe and keyboard tests | Fluent-reader and assistive-technology acceptance still required |

## Human acceptance record

No human screen-reader session or fluent-Arabic review has been recorded. Do not
mark this complete from axe results or a screenshot. Use VoiceOver with Safari
on macOS and NVDA with Firefox on Windows to review the **generated site** (the
Windows native builder is not supported). Record OS/browser/AT versions, reviewer,
date, deck and concrete failures in the release record.

Check the skip link, slide title/number announcement, focus after navigation,
keyboard controls, overview links, reading order, text zoom in the reading edition,
reduced motion, images/charts, and presenter notes without exposing them to the
audience. Test English and Arabic content with a fluent reader. Never use color
or a visual animation as the only way to convey a fact.

## Real-host checks

```sh
npm run verify:host -- https://your-host.example/deck/
```

For an HTTP-authenticated private host, set `PRESENTATION_AUTHORIZATION` through
your secret manager/environment and append `--private`. The checker sends no
credentials on its first request and requires 401/403 for every tested HTML and
asset route, then checks authorized responses. It never prints the credential.
Redirect-based SSO requires a separate signed-out/signed-in browser review; the
checker fails rather than treating a login redirect as proof of protection.

No real deployment URL or hosting account is recorded in this repository. Host
acceptance remains blocked until the owner supplies that target and its intended
audience. Do not deploy confidential content merely to test the checker.
