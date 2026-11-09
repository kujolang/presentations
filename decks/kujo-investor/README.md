# KUJO investor briefing

18 primary slides with a separate interactive investor appendix. The source is a Kujo Presentations consumer deck, not a separate slide framework. Research cut: 2026-11-09. Missing external adoption and commercial data are disclosed. This is a polished founder-reviewable planning deck; supply verified traction and confirm biography/financing assumptions before investor distribution.

## Build and preview
From the Presentations repository root, using the prerequisites in its README:

```sh
npm ci
npm run deck -- setup
npm run deck -- check --deck decks/kujo-investor --ready
npm run deck -- build --deck decks/kujo-investor
npm run deck -- preview --deck decks/kujo-investor --port 8094
```

The native Kujo renderer owns all numbered slides, overview, reading, print, presenter and navigation. `layouts/ki-*` are trusted layout extensions using native content slots; `assetPrefix` keeps appendix links valid on each route. Deck-owned CSS/HTML/JS provide evidence inspection and financial controls. SSG and SiteKit are unchanged.

With a server serving `output/`, open `/kujo-investor/1/`. `preview` may instead serve the deck root: use the URL it prints. Presenter console is `presenter/`; import `investor-notes.json` locally. That file stays outside published assets. Reading edition is `reading/`, print is `print/`, appendix is `assets/deck/appendix.html`. On phones, slide content reflows vertically; fullscreen retains 16:9.

## Deploy
Upload the contents of `output/kujo-investor/` to any static host supporting directory indexes. The deck works at a path prefix without rewrites. Serve via HTTP, not file://. No server-side service, API credential, remote image, model request or build-tool dependency is needed by the hosted deck. Do not publish the whole source directory as a static site. Hosting is not access control; apply access policy if the owner wants private distribution. No production deployment was requested or performed.

## Edit and reproduce
Edit `deck.json` for content, `assets/theme.css` for design, `investor-notes.json` for notes. `scripts/author.py` is the retained authoring generator and will replace those content/layout files; only rerun it when intentionally regenerating. `scripts/appendix.py` regenerates the appendix and financial CSV/assets using `finance/assumptions.json`; manually reconcile narrative budgets after changing assumptions. Browser calculator exports independent what-if JSON.

`python3 decks/kujo-investor/scripts/record-demo.py` records a new seeded fixture using sibling CaseFile/Eval and Kujo 1.9.0. It overwrites evidence artifacts; preserve the old run before replacing. Rebuild after changes.

## Verification
Serve `output/` on 127.0.0.1:8094, then from repo root:

```sh
node decks/kujo-investor/scripts/qa.mjs
python3 decks/kujo-investor/scripts/check-links.py
```

QA uses installed Chrome via Playwright and axe, captures 18 slides at four sizes, tests modes/interactions, and exports PDF. See `qa/`, `loops/`, `research/CLAIMS.md`, `finance/`, `COMPLETION.md` and the actual command logs. The official loop harness configs are bounded to three iterations and capture actual gates; subjective review is labeled assistant self-review.
