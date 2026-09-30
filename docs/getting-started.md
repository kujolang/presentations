# From clone to custom presentation

The tested build hosts are macOS and Linux. Install Git, Node 20+, and Kujo 1.5+ on PATH. Kujo installation instructions are
in the [Kujo repository](https://github.com/kujolang/kujo). This project does not
silently install system tools. No global npm package is needed.

```sh
git clone https://github.com/kujolang/presentations.git
cd presentations
npm run deck -- start investor my-pitch --title "My company"
```

`start` copies the starter, installs pinned SSG/SiteKit dependencies in `.deps/`,
builds static pages with native Kujo, and starts a local preview at
`http://127.0.0.1:8086/`. Setup needs network access the first time; cached setup is
reused without reinstalling packages. Ctrl+C stops the server. Use `--port 8087`
if another preview already occupies the port. The first view is a **draft with
placeholders**, ready for your data or your agent. The repository currently
requires GitHub access; making it publicly distributable is a separate release decision.

| Starter | Use it for |
| --- | --- |
| investor | Problem → solution → opportunity → traction → business → team → ask |
| live-talk | Hook → learning promise → tension → example → action → discussion |
| sales | Buyer need → solution → evidence → delivery → investment → next step |

For hands-free customization, point your agent at [CREATE_A_DECK.md](../CREATE_A_DECK.md)
and supply your data. `--brief ./my-brief.md` preserves a copy of your source brief
inside the new deck. Starter files are copied, never linked back to a shared example.

To continue after stopping the preview:

```sh
npm run deck -- check --deck decks/my-pitch --ready
npm run deck -- build --deck decks/my-pitch
npm run deck -- preview --deck decks/my-pitch
```

Edit `decks/my-pitch/deck.json` and `assets/theme.css`; keep sources and decisions
in `BRIEF.md`. Rebuild after edits. The tool does not watch files automatically.
Your decks are normal authored source files and are **not gitignored**; commit
only the decks you intend to share, and review their data before pushing.
`output/my-pitch/` is the deployable static site. To host under a public URL,
supply `--site-url https://example.com/my-pitch` when building.

## Agent inspection

```sh
npm ci
npx playwright install chromium
npm run deck -- inspect --deck decks/my-pitch
```

Inspection checks generated pages in Chromium, runs accessibility and geometry
checks, and captures every slide plus its overview under `.build/<id>/review/`.
Read the report and images; automated geometry cannot judge narrative or every
intentional overlap. This is optional tooling, not a browser runtime dependency.

## Troubleshooting

- `doctor --json` returns a nonzero exit code and names missing prerequisites.
- `create` never replaces an existing deck. Use build/preview to continue it.
- Unknown starters/options and unsafe names fail before creating a deck.
- Missing or unreadable `--brief` files fail without leaving a partial deck.
- If setup/build fails after `start` creates the draft, the draft is preserved:
  fix the error, run setup if necessary, then build/preview the same directory.
- Setup refuses to reset a dirty or differently pinned dependency checkout.
- `check --ready` rejects bracketed placeholders and TBD values. It cannot verify
  facts, guarantee visual fit, or decide whether a real quote is approved.
