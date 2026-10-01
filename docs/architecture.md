# Architecture

Presentations depends on Kujo SSG and SiteKit. Neither project depends on
Presentations. All slide layouts, controls, routes, themes, and motion settings
belong in this optional package.

## Build process

`src/model.kujo` validates `deck.json`. `src/render.kujo` fills reusable HTML
layouts with escaped text, metrics, features, images, and SVG charts.
The root `build.kujo` delegates to `src/build.kujo`, which writes page templates and frontmatter to `.build/<deck-id>/`, then
calls SSG's public CLI. Document titles and descriptions are escaped before
template processing; generated frontmatter strings use JSON quoting, which YAML
accepts. The SSG layout passes through the generated document. SSG generates the pages and copies local assets to
`output/<deck-id>/`.

The generated templates are build artifacts. Authors edit slide data and shared
layouts, not separate HTML pages for each slide.

| Need | Existing capability | What Presentations adds |
| --- | --- | --- |
| Static URLs | SSG pages with filename slugs | Numbered slide inputs |
| Page layout | SSG layout and page templates | Canvas and slide markup |
| Nested content | Kujo JSON parsing | Ordered slides, metrics, and features |
| Assets and fonts | SSG asset copying and local fonts | Deck media and themes |
| Layout and controls | SiteKit grid, cluster, stack, and button | Fixed canvas and navigation |
| Styling | SiteKit tokens, reset, and focus styles | Presentation aliases and deck overrides |
| Charts | Browser SVG | Percentage bars from slide data |
| Keyboard and fullscreen | Browser APIs | Optional viewer script |
| Animation | Local Motion bundles | Transitions and content sequences |

SSG's flat page slugs provide `/1/`, `/2/`, and other slide URLs beneath each
hosted deck. Its home template provides the overview. The build uses `--no-aux`,
`--no-aliases`, and `--no-webmcp` to omit unused output. SSG still supplies its
standard favicon and a 404 page with presentation-specific content.

[dependencies.json](../dependencies.json) pins the tested SSG and SiteKit
revisions. Native and Node entry points prefer `.deps/` when installed, then
fall back to sibling checkouts; explicit native flags override these defaults.
Ordinary builds do not verify checkout pins. SiteKit's distribution is copied with its fonts and licenses; its
optional JavaScript is not loaded.

## Browser behavior

Slides are static HTML, CSS, images, and SVG. Overview and reading pages load no
JavaScript. The viewer adds shortcuts, fullscreen, and optional motion. When
fullscreen or transitions are enabled, it fetches the next generated page and
replaces the main element. URLs and history still identify real static pages.
Failed fetches fall back to normal navigation.

Motion's mini bundle handles basic transitions. The hybrid bundle loads only for
content sequences. Both are local files; disabled decks do not include Motion. Basic-only decks
omit the hybrid file, saving 55,335 bytes with the current pinned bundle.
See [transitions](transitions.md) for settings and failure behavior.

The 16:9 canvas scales as a unit. It does not rearrange its content on small
screens. The text edition provides normal wrapping and browser zoom. Thumbnail
links have slide titles; their visual contents are hidden from assistive
technology. Full slides retain headings, descriptions, image alt text, and chart
values. Motion remains optional and respects reduced-motion preferences.

## Authoring tools and trust

`scripts/deck.mjs` checks tools, installs pinned dependencies, copies starters,
and runs builds, previews, and inspections. It does not render slides.
[CREATE_A_DECK.md](../CREATE_A_DECK.md), the starter catalog, and the generated
JSON Schema describe the agent workflow. Creating a deck never overwrites an
existing directory. Briefs retain sources and missing facts.

Deck text is escaped, including braces that SSG could otherwise treat as template
syntax. Image references must be local and cannot contain lexical traversal.
The build copies the entire trusted asset directory, including unused files;
keep private files elsewhere. Physical symlink containment is not enforced by
the presentation layer. Output names
come from validated slugs. Themes and templates are trusted code: review them
before building, and do not use a shared writable staging directory for
untrusted projects.

## Upstream changes

The initial inspection on 2026-09-30 covered SSG routing, templates, assets, fonts,
and CLI behavior; SiteKit tokens, components, utilities, distribution, and tests;
and Kujo 1.5.0 language and process conventions. Searches excluded generated
output, node_modules, vendor code, and bulk assets.

No upstream change was needed. SSG and SiteKit remained unchanged. Before
proposing one, document the missing capability, existing alternatives,
non-presentation uses, ownership, and compatibility. Presentation-specific needs
stay here.
