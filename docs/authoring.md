# Authoring and extension

`deck.json` requires `id` (lowercase slug), `title`, `brand`, `description`, and a
nonempty `slides` array. Optional `footer` supplies the repeated footer text.
Set `lang` to the content language, such as `en`, `fr`, or `pt-BR`; it defaults to
`en`. This sets the document language for assistive technology. Viewer labels
remain English; right-to-left layouts and font coverage still need theme work.
Unknown fields and non-boolean `inverse` values are rejected, matching the schema.
Each deck must have `assets/theme.css`; an empty file uses the default theme.
Image paths resolve beneath `assets/`. Slide content is plain text, not HTML.
Use `\n` inside a title string to add a line break.

A minimal deck looks like this:

```json
{
  "id": "next-quarter",
  "title": "Our next chapter",
  "brand": "Your organization",
  "description": "A plan for the coming quarter.",
  "slides": [{
    "layout": "statement",
    "title": "Our next chapter",
    "copy": "A focused plan for the coming quarter."
  }]
}
```

A slide requires `layout` and `title`. Optional fields:

| Field | Shape / purpose |
| --- | --- |
| eyebrow | Small header text |
| copy | Supporting plain text |
| inverse | Boolean, use inverse background/foreground tokens |
| note | Small footer note |
| images | Objects with local `src`, required descriptive `alt`, optional `x`/`y` object-position percentages |
| metrics | Objects with string `value` and `label` |
| features | Objects with `title` and `copy` |
| chart | Objects with `label` and numeric `value` from 0 to 100 |
| chartLabel | Chart caption describing the data and units |
| transitions | Per-slide [motion settings](transitions.md) |

Chart values are percentages on a fixed zero-to-100 scale. The text edition
lists each value explicitly. Do not use this chart for non-percentage quantities.
Metrics accept formatted strings such as `80k+`, `98%`, or `$2m`.

## Layout capacities

| Layout | Images | Metrics | Features | Chart points |
| --- | ---: | ---: | ---: | ---: |
| statement | 0 | 0 | 0 | 0 |
| hero | 2 | 3 | 0 | 0 |
| index | 0 | 0 | 6 | 0 |
| problem | 1 | 0 | 3 | 0 |
| editorial | 1 | 0 | 3 | 0 |
| market | 0 | 1 | 0 | 1–6 |
| value | 0 | 0 | 4 | 0 |
| business | 1 | 0 | 3 | 0 |
| curation | 2 | 1 | 2 | 0 |
| offerings | 2 | 2 | 1 | 0 |

These are maxima; omit optional sections as needed. Hero, problem, editorial, and
business layouts use a text-only arrangement when images are omitted. The JSON
files beside the templates define these limits. Text limits reject obvious
overfill but do not guarantee fit:
font choice and word lengths matter. Review every slide after changing its content.
Use concise titles (80 characters maximum for bundled layouts), supporting copy
(up to 240), and feature descriptions (up to 160). A slide count is never hardcoded
in the engine; the overview, navigation, totals and progress derive from the array.

## Themes

Theme only the deck's `assets/theme.css`. Useful variables:

- `--p-background`, `--p-foreground`, `--p-muted`, `--p-border`
- `--p-accent`, `--p-on-accent`, `--p-inverse`, `--p-on-inverse`
- `--p-font`, `--p-display`, `--p-heading-weight`, `--p-letter-spacing`, `--p-title-case`
- `--p-title`, `--p-body`, `--p-small`, `--p-line`, `--p-padding`, `--p-gap`
- `--p-viewer-background`, `--p-image-filter`

Defaults reference SiteKit tokens. Use `cqw` for canvas-relative type and spacing;
1cqw is one percent of the canvas width. All bundled layouts assume 16:9.
A different aspect ratio requires new composition CSS and visual verification,
not a ratio toggle that silently breaks positions. Normal viewer controls use
SiteKit sizes rather than scaling with the canvas.

For image replacements, keep the same asset filename or change `src` in data.
`x: 20, y: 50` places the crop toward the left. Optimize source images before
adding them; the current adapter copies local assets through SSG and does not
process collage images with SSG's frontmatter featured-image converter.
Retain original licenses/credits with the deck. All files under `assets/` are
copied to public output, including files the deck does not reference. Do not put
private source material there. Themes, templates, and asset trees must be trusted.

## Add a layout without modifying the renderer

1. Add `layouts/your-layout.html` and a matching JSON capacity contract.
2. Compose the existing slots: `{{title}}`, `{{copy}}`, `{{eyebrow}}`,
   `{{images}}`, `{{metrics}}`, `{{features}}`, `{{chart}}`, `{{note}}`.
3. Add geometry under `.p-layout-your-layout` in the presentation CSS (or
   consumer theme CSS for a private layout). Preserve header/footer space.
4. Run `node scripts/write-schema.mjs` to update the agent-facing schema.
5. Set a slide's `layout` to `your-layout` and run validation/browser checks.

Use the source of `layouts/business.html` and its JSON contract as the simplest
example. When a repeated structure truly needs a new primitive, add a pure
render function and explicit slot in `src/render.kujo`. Keep content out of it.
Do not add trivial components for every wrapper or move presentation concepts
into SiteKit. Themes/templates are trusted source and must be reviewed as code.

Configure optional [Motion transitions](transitions.md) in `deck.json`. Choose
an effect, timing, intensity, and stagger for the deck or individual slides.
Viewers can turn motion off; system reduced-motion preferences take precedence.
