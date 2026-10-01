# Language, presenter tools and print

## Language and direction

Set `lang` to the content's language tag and `dir` to `ltr` or `rtl`. Direction is
explicit: a language tag alone does not mirror a composition. Arabic (`ar`) uses
the bundled Arabic viewer labels; other tags use English unless you supply a
`labels` object. See `locales/en.json` for every supported key. Overrides must be
plain text, at most 240 characters. `slideStatus` supports `{slide}` and `{count}`.

The fixed slide geometry uses logical horizontal positions. `examples/arabic`
shows RTL text, Arabic controls, and a local OFL-licensed Noto Sans Arabic font.
Typography still needs a theme suited to its script. ArrowRight/Space advance
and ArrowLeft goes back in every language, as documented in the keyboard help.
The presenter console currently uses English controls.

Automated checks verify language/direction, font loading, navigation, geometry
and axe results. Have a fluent reader check translations, line breaks and
reading order; those checks are not proof of full localization.

## Presenter console and private notes

Open `/presenter/` beneath a built deck. The console shows current/next previews,
previous/next buttons, direct slide selection, an audience-window button, and an
elapsed timer with pause/reset. Console navigation drives the audience window.
Audience-window navigation does not drive the console; keep the console as the
controller during a talk. A blocked popup can be reopened with the audience button.

Private notes belong in `speaker-notes.private.json` beside `deck.json`, outside
`assets/`. This filename is ignored by Git. Use this shape, with exactly one entry
per slide:

```json
{"deck":"my-talk","notes":["Opening note","Closing note"]}
```

Select that file in the console. Notes stay in memory in that tab. They are never
fetched, included in generated HTML, sent to the audience, placed in a URL, or
saved to browser storage. Reloading or clearing removes them. Files are limited
to 1 MB and each note to 20,000 characters. Notes are rendered as plain text.
Share only the audience window, never the console. Browser extensions and screen
sharing are outside this privacy boundary. `slide.note` remains a **public**
footer/reading-edition field; it is not a speaker-note field.

## Print and PDF

Each deck has a static `/print/` route: one 16:9 slide per page, no viewer runtime
or private notes. Use the browser's Print / Save as PDF action. For a repeatable
Chromium export after building:

```sh
npm run export:pdf -- examples/reference .build/reference.pdf
```

The exporter waits for local fonts and images, preserves background colors and
CSS page size, and refuses to overwrite an existing PDF. It needs the development
Playwright dependency and its Chromium installation. Native HTML builds do not.
PDF pagination is tested in Chromium; other browsers' print dialogs can impose
paper-size or margin settings. This is a visual PDF export, not a claim of a
fully tagged accessible PDF. The HTML reading edition remains available.
