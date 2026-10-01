# Optional Motion transitions

Add this top-level field to `deck.json`:

```json
"transitions": {
  "enabled": true,
  "effect": "editorial",
  "duration": 1.1,
  "easing": "easeOut",
  "intensity": 1,
  "stagger": 0.06
}
```

Omit it or set `enabled` to `false` for ordinary static navigation. Defaults for
an enabled deck are fade, 0.35 seconds, and easeOut. Baseline effects are `fade`,
`slide`, and `zoom`; content choreography presets are `editorial`, `focus`, and
`kinetic`. Duration is the total outgoing/incoming time, from 0.1 to 2 seconds.
Easing accepts `linear`, `easeIn`, `easeOut`, or `easeInOut`. Slide movement follows
navigation direction. Edit these settings and rebuild to customize any deck.

Enabled decks show a keyboard-accessible **Transitions: on/off** button. The
choice persists for that deck in the current browser tab. System reduced-motion
preferences override it, suppress animations, and prevent Motion from loading.
The reference example mixes cinematic presets and the live-talk starter uses
a restrained kinetic preset; other starters remain motion-free by default.

Navigation still uses real generated URLs. Only enabled transitions or fullscreen
fetch and replace the next static viewer. Direct loading, refresh, back/forward,
no-JavaScript navigation, and static hosting remain supported. Modified clicks
still open ordinary links. A missing Motion module skips animation; failed page
fetches fall back to normal browser navigation. Overview and reading pages do
not run the viewer or Motion.

The adapter uses Motion's documented [animate API](https://motion.dev/docs/animate):
mini for baseline transitions, the full JavaScript API for cinematic sequences,
staggering, and springs. Both bundles are pinned under `vendor/motion/`. No CDN
or network service is needed at runtime. Only decks with transitions enabled
copy the bundles into output. The required bundle loads lazily on the first
animated navigation or replay. Basic effects do not import
the larger hybrid bundle. SSG and SiteKit know nothing about it.
To refresh the committed bundle after an intentional dependency update, run
`npm ci && npm run bundle:motion` and commit the bundle, license, and lockfile.
To add a preset, edit `assets/motion-presets.js` and update validation, the schema,
and browser tests together. Deck authors normally change only JSON.

## Choreography presets

| Preset | What the audience sees | Typical use |
| --- | --- | --- |
| editorial | Headline rises through a mask, image crops open, photos settle, supporting content follows | Image-led storytelling and investor decks |
| focus | Photography opens from an inset crop, headline sharpens into focus, details follow | Chapter changes and dramatic imagery |
| kinetic | Directional headline arrival, spring-driven cards, angled image arrival, rotating accent | Live talks and product reveals |

All three stagger features and metrics, scale real chart bars from their baseline,
and settle into the authored composition. They do not change numbers, split
heading text into inaccessible fragments, or animate navigation controls.
Missing images, metrics, or charts simply omit that part of the sequence.

`intensity` ranges from 0.25 to 2 (default 1), controlling travel, image zoom,
blur, and spring bounce. `stagger` ranges from 0 to 0.2 seconds (default 0.06).
Stagger is capped within the duration budget so a longer list does not stall
navigation. Start around 0.85–1.2 seconds for cinematic effects. Use **Replay
entrance** to audition the current slide without changing its URL. Replay is
manual; direct loads remain still until you navigate or replay.

Each slide can override the deck defaults:

```json
{
  "layout": "market",
  "title": "A growing opportunity",
  "transitions": { "effect": "kinetic", "intensity": 0.7, "duration": 1 },
  "chart": [{ "label": "Adoption", "value": 65 }]
}
```

`transitions.enabled: false` on a slide skips its animations. The deck-level
`enabled: false` remains a master switch: a slide cannot turn it back on.
The browser off switch and system reduced motion also apply to every preset.
Disabling motion during a sequence completes it and restores the original
inline styles; authored transforms, image positioning, and text are preserved.

Custom layouts can mark existing elements with `data-motion-part="title"`,
`image`, `copy`, `detail`, `accent`, or `chart`. Each explicit role replaces that
role's default selectors for the slide. Use image on the crop wrapper, with the
photo inside; use chart on bar elements. Avoid nesting two animated roles on the
same element. New engine presets belong in the optional presentation package.

## Verification

See the dated [motion verification record](verification.md#motion-milestones) and
[current release gate](release.md).
