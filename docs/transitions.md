# Optional Motion transitions

Add this top-level field to `deck.json`:

```json
"transitions": {
  "enabled": true,
  "effect": "slide",
  "duration": 0.35,
  "easing": "easeOut"
}
```

Omit it or set `enabled` to `false` for ordinary static navigation. Defaults for
an enabled deck are fade, 0.35 seconds, and easeOut. Effects are `fade`, `slide`,
and `zoom`. Duration is the total outgoing/incoming time, from 0.1 to 2 seconds.
Easing accepts `linear`, `easeIn`, `easeOut`, or `easeInOut`. Slide movement follows
navigation direction. Edit these settings and rebuild to customize any deck.

Enabled decks show a keyboard-accessible **Transitions: on/off** button. The
choice persists for that deck in the current browser tab. System reduced-motion
preferences override it, suppress animations, and prevent Motion from loading.
The reference example and live-talk starter demonstrate slide transitions;
other starters remain motion-free by default.

Navigation still uses real generated URLs. Only enabled transitions or fullscreen
fetch and replace the next static viewer. Direct loading, refresh, back/forward,
no-JavaScript navigation, and static hosting remain supported. Modified clicks
still open ordinary links. A missing Motion module skips animation; failed page
fetches fall back to normal browser navigation. Overview and reading pages do
not run the viewer or Motion.

The adapter uses Motion's documented [mini animate API](https://motion.dev/docs/animate),
with a pinned, local bundle under `vendor/motion/`. No CDN or runtime network
service is needed. Only opted-in decks copy that module into output, and it loads
lazily on the first animated navigation. SSG and SiteKit know nothing about it.
To refresh the committed bundle after an intentional dependency update, run
`npm ci && npm run bundle:motion` and commit the bundle, license, and lockfile.
Engine maintainers can add presets in `assets/viewer.js`, extending validation,
schema, and browser tests together. Deck authors normally change only JSON.

## Verification (2026-09-30)

`npm test` passed the native builds, static contracts (including invalid motion
settings and omission of the bundle from disabled decks), four onboarding tests,
and real preview smoke. The browser matrix returned 28 passed and two intentional
headless fullscreen skips. All three engines exercised actual Motion animations,
presets, lazy loading, preference persistence, history, reduced-motion behavior,
disabled decks, and a blocked module. The reference preview was rebuilt with the
redistribution licenses. No upstream repository was changed.
