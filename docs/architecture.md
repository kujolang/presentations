# Ecosystem inspection and ownership

Inspected before implementation (2026-09-30): SSG README, AGENTS, config, templates,
page routing/frontmatter in build.kujo, asset/font handling, and native process
idioms in its docs bridge; SiteKit README, AGENTS, DESIGN, token definitions,
button/image/stack schemas and templates, utility CSS, distribution and test
conventions; Kujo CLI 1.5.0, Kujo standard-library references and native module
conventions in Howl. Broad searches excluded generated output, node_modules,
vendor content, and bulk assets; demo photography was inspected separately.

| Need | Existing public capability | Presentation ownership |
| --- | --- | --- |
| Static URLs and refresh | SSG pages with filename slugs | Numbered page inputs |
| Document and page layout | SSG layout.html and page-*.html overrides | Canvas markup and compositions |
| Deck ordering and nested data | Kujo parse_json; SSG consumes page frontmatter | Ordered deck JSON → SSG input adapter |
| Assets and local fonts | SSG assets copying and bundled font fallback | Deck-local images and theme |
| Generic layout and controls | SiteKit sk-grid, sk-cluster, sk-stack, sk-button | Fixed slide geometry, navigation semantics |
| Tokens/focus/reset | SiteKit dist CSS and semantic tokens | Presentation aliases and deck overrides |
| Charts | Browser SVG | Data-driven comparison primitive |
| Keyboard/fullscreen | Browser APIs | Optional viewer script |

SSG collections already generate public content lists, but arbitrary nested
metrics/features are not frontmatter template objects. The adapter resolves those
small content structures into page templates before invoking the public SSG CLI.
It does not implement routing, rewrite SSG outputs, fork SSG, or call its private
functions. Per-slide generated templates are build artifacts, not nine authored
one-off pages. The nine layout implementations are shared by all decks.

SSG's page slugs are flat; numbered `/1/` routes beneath a deck's deployment root
use that contract directly. The overview is SSG's home template. `--no-aux`,
`--no-aliases`, and `--no-webmcp` omit irrelevant extras. SSG also emits its standard
404 and favicon. The presentation overrides 404 content and never requires a
presentation-aware SSG command.

SiteKit's default typography is intended for normal interfaces. Canvas-scale type
and coordinates therefore live here. Its generic responsive grid remains useful
for the overview, while slides intentionally retain fixed compositions. No
SlideCanvas, deck theme, shortcut, route convention, or presentation dependency
was added upstream. Both upstream trees remained clean.

**Universality assessment:** no missing upstream capability was found that met the
user's six-part test. Upstream changes: SSG 0; SiteKit 0. Any future proposal must
record the missing capability, failed existing alternatives, non-presentation use
cases, ownership, and compatibility before implementation.

# Runtime and accessibility

Most content is static HTML, CSS, local images and SVG. Overview and reading pages
load zero JavaScript. Only viewer pages load viewer.js. Fullscreen enhancement
keeps a real URL and replaces the generated main landmark; history and fallback
navigation retain the static document as the authority.

The canvas's typography necessarily shrinks on narrow screens. The text edition
provides a readable alternative with ordinary wrapping and browser zoom, rather
than changing the composition. Thumbnail internals are hidden from assistive
technology; each containing link has a meaningful slide title. Full slides retain
semantic headings, terms/definitions, features and image alt text. No transitions
are required, and reduced-motion overrides also cover inherited UI behavior.

# Trust and resource boundaries

Deck text is escaped, including braces so SSG cannot reinterpret template-shaped
content. Image paths are local relative assets; remote URLs and traversal are
rejected. Themes/templates are trusted executable developer assets, not an
untrusted user upload facility. Do not build untrusted repositories or use a
shared writable staging directory. Output names come from validated slugs.

The manifest in dependencies.json records tested revisions, not a fake Kennel
library dependency: SSG is invoked as a tool and SiteKit's supported distribution
is copied whole with its font relationship and license files preserved.
