# Presentations

An optional, Kujo-native presentation layer built **on top of Kujo SSG and SiteKit**.
It turns editable deck data into static HTML slides, an overview, and a readable
text edition. Ten reusable layouts ship with investor, live-talk and sales starters, an editorial
media example, and a separate garden-planning example. No changes to SSG or SiteKit are required.

![Rendered nine-slide example](docs/images/reference-overview.png)

## Start with your purpose

With Git, Node 20+, and Kujo 1.5+ installed:

```sh
npm run deck -- start investor my-pitch --title "My company"
```

This creates a draft, sets up pinned dependencies, builds, and serves it. Choose
`investor`, `live-talk`, or `sales`. Give your agent [CREATE_A_DECK.md](CREATE_A_DECK.md)
plus your data to customize the narrative, branding, and slides. The agent can
use the JSON catalog, content schema, readiness check, and browser inspection.
See [getting started](docs/getting-started.md) for the clone-to-preview walkthrough.

## Run locally

Requirements: Kujo 1.5+, a Kujo SSG checkout, and a built SiteKit `dist/`.
Node powers the optional onboarding/inspection commands, SiteKit's build, and
browser tests. The presentation build itself remains native Kujo.
Tested upstream revisions are recorded in `dependencies.json`.

With sibling `ssg/` and `site-kit/` repositories:

```sh
kujo run build.kujo
kujo run build.kujo -- --deck examples/field-notes
kujo serve output --port 8086
```

Open `http://127.0.0.1:8086/reference/` or `/field-notes/`.
Each deck has `/1/`, `/2/`, … and `/reading/` beneath its output root.
Run commands from the Presentations repository root.

For checkouts elsewhere:

```sh
kujo run build.kujo -- --deck /path/to/my-deck \
  --ssg /path/to/ssg --sitekit /path/to/site-kit/dist \
  --site-url https://example.com/my-deck
```

To obtain the tested dependencies in an isolated clone:

```sh
node scripts/setup-dependencies.mjs
kujo run build.kujo -- --ssg .deps/ssg --sitekit .deps/site-kit/dist
```

`output/<deck-id>/` is the deployable static site. Serve that directory at the
chosen site URL, with normal directory-index handling. Refresh, direct links,
and browser history need no rewrite rules. Assets and links are relative, so
subdirectory hosting works. Opening clean directory URLs with `file://` is not
supported; use a static HTTP server. The build replaces only its generated
`.build/<deck-id>/` and `output/<deck-id>/` directories. Do not put authored files
there. Never run two builds for the same deck ID concurrently.

## Make the next deck

Copy `examples/field-notes` to your own directory, change `id`, title, content,
and `assets/theme.css`, then run `--deck your-directory`.

```json
{
  "id": "next-quarter",
  "title": "Our next chapter",
  "brand": "Your organization",
  "description": "A plan for the coming quarter.",
  "slides": [{
    "layout": "business",
    "title": "A model for growth",
    "copy": "Three complementary ways to move forward.",
    "features": [
      {"title": "Services", "copy": "Expertise with a clear outcome."},
      {"title": "Products", "copy": "Useful tools for recurring needs."},
      {"title": "Partners", "copy": "Better work through collaboration."}
    ]
  }]
}
```

Every deck must have `assets/theme.css`; an empty file uses SiteKit-derived
defaults. Slide content is plain text, never executable HTML. Use `\n` for an
intentional title break. Layouts and theme CSS are trusted developer source.
Keep titles and copy concise: these are compositions, not scrolling web pages.
Use `kujo run build.kujo -- --deck your-directory --check` to validate without
building. See [authoring](docs/authoring.md) for fields, capacities, and extensions.

## Controls

- Left / Right: previous / next. Space: next.
- Home / End: first / last slide. Endpoints do not wrap.
- F: toggle fullscreen where supported. Escape exits fullscreen.
- Overview: all slides as linked thumbnails. Read text: a responsive, zoomable
  edition of the whole deck, including chart values and image descriptions.

Keyboard shortcuts leave inputs, editable content, modifier shortcuts, and
Space activation on links/buttons alone. Controls are native links and buttons.
Navigation and overview work without JavaScript. The viewer's small optional
script provides shortcuts, fullscreen, and optional Motion transitions. When
fullscreen or transitions are enabled, it fetches another generated page;
otherwise navigation uses native page loads. Fetch failures fall back to ordinary navigation.

## Architecture

```text
Kujo SSG ─── public CLI + templates ──┐
                                    ├── Presentations ── individual decks
SiteKit ─── vendored dist + tokens ──┘
```

`src/model.kujo` validates content; `src/render.kujo` supplies small presentation
primitives; `layouts/` owns reusable compositions; `assets/` owns canvas geometry
and viewer behavior. `build.kujo` adapts deck JSON into SSG page/template inputs.
SSG generates the routes, documents, metadata, and asset output. SiteKit supplies
semantic controls, layout utilities, reset, focus styles, and default tokens.
Its optional JavaScript is not loaded. Engine defaults alias SiteKit tokens;
all black/off-white/orange styling and media content live in `examples/reference`.

The canvas preserves a 16:9 composition using CSS container-relative units.
Only the overview, viewer controls, and text edition reflow. There is no framework,
client rendering library, router dependency, chart dependency, or upstream plugin.
Remove this repository and no ordinary SSG/SiteKit consumer changes.
See [the ecosystem inspection](docs/architecture.md).

## Verification

```sh
npm ci
npx playwright install chromium firefox webkit
npm test
```

Tests cover generated routes, content validation, escaping, variable deck length,
local assets, keyboard/history behavior, fullscreen, fixed geometry, mobile and
no-JavaScript use, and axe accessibility checks. Overview screenshots are written
to `test-results/`. Font rendering varies by operating system; images are decoded
before visual capture. [Verification notes](docs/verification.md) record the
completed run and its limits. These tests are not a blanket accessibility certification.

The reference screenshot was **not attached to the request**. The nine-slide demo
implements the supplied written descriptions and visual language; it is not a
verified pixel match. Text and statistics are editable fictional demo content.
Photography comes from the local SSG demo corpus, never a hotlink or slide screenshot.
[Asset provenance](examples/reference/ASSETS.md) records the source files.

MIT. Preview version 0.1.0; the content and extension API may evolve.

Optional [Motion transitions](docs/transitions.md) are configured in `deck.json`: enable/disable, effect, duration, and easing.
Respect the author’s motion preference; reduced-motion settings always take precedence.

For more expressive decks, Editorial, Focus, and Kinetic presets choreograph
headlines, image reveals, feature cards, metrics, and charts. Adjust intensity
and stagger, override individual slides, and audition with Replay entrance.
