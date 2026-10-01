# Deploy a deck

Build with the intended `--site-url` and publish only `output/<deck-id>/` to a
static host with directory-index support. Do not publish the repository,
`.build/`, source briefs, or dependency checkouts. Every file in the deck's
`assets/` is copied into output, even when no slide uses it. Review that directory
before publishing. Hidden entries (names beginning with `.`), symlinks (including
links within the asset tree), special files, and trees deeper than 16 directory
levels are rejected. This also applies to `--check`. Keep private files outside
`assets/`; a normal filename does not make a file safe to publish.

Use HTTPS. For confidential decks, put authentication and access controls on the
static host; a hard-to-guess slide URL is not access control. Presentations has no
accounts, tenant isolation, upload service, or server-side authorization.

Serve JavaScript with a JavaScript MIME type, CSS as `text/css`, and fonts with
their correct MIME types. Allow same-origin fetches so fullscreen and optional
transitions can load generated pages. Test direct slide URLs, refresh, history,
and the reading edition on the actual host.

Use short cache lifetimes or revalidation for HTML and unversioned CSS/JavaScript.
Asset names are not fingerprinted, so long immutable caching can serve an old
viewer with new content. A future versioned-asset pipeline is tracked in the
[readiness review](readiness-review.md).

Host response headers should include `X-Content-Type-Options: nosniff` and a
referrer policy suited to the audience. Choose framing rules for your intended
embedding policy. Test a Content Security Policy in report-only mode first:
viewer modules and fetches are local, but crop styles and Motion set inline
styles. A blanket ban on inline styles will break those features. Custom themes
or templates may add further requirements.

Build only trusted projects in a private workspace. Themes and templates are
code, dependency setup executes dependency tooling, and asset copying is not a
sandbox for hostile uploads. A hosted rendering service would require a separate
isolation design. Native build/preview verification currently covers macOS and
Linux, not Windows.

## Build recovery

The native entry point locks each deck ID under `.build/.locks/`. Different IDs
can build independently; a second build for the same ID fails with a clear error.
SSG writes to `.build/<id>/site` first. Only a successful build replaces
`output/<id>`. Copy and generation errors leave the last successful output intact.

Replacement uses two filesystem renames, with the previous deck held at
`.build/<id>.previous`. There can be a brief gap between renames; this is not an
atomic live-site deployment. Upload the finished output through your host's own
release mechanism. After an interrupted swap, the next build restores a missing
output from the backup before generating anything. A completed swap keeps the
new output and removes the old backup on the next build.

An interrupted parent process can leave a lock. Stop all builds for that ID,
including child Kujo processes, before removing the empty lock directory with
`rmdir .build/.locks/<id>`. Then repeat the normal build command. Never remove an
active build's lock. The internal `src/build-worker.kujo` bypasses locking and is
not a public entry point. Build directories must remain private and trusted;
this is not protection against a process changing files during a build.

## Host fixture

Browser tests use a separate loopback static-host fixture on port 8087. It serves
the generated output with MIME types, revalidation, and an enforced same-origin
CSP that permits inline styles. It tests direct routes and `/mounted/` hosting.
The native Kujo preview has a separate start/build/HTTP smoke test. This split
isolates browser/deck behavior from preview-server transport; it does not certify
all preview-server/browser combinations or replace tests on your chosen host.

To reproduce the native-preview Firefox cases after building, run:

```sh
PRESENTATION_TEST_HOST=kujo npx playwright test decks.spec.js motion.spec.js --project=firefox
```

The mounted-host test targets the fixture and is not part of this command.

## Public showcase site

Four complete demonstration decks are served from
<https://presentations.kujolang.ai/> by an assets-only Cloudflare Worker.
The root is a collection page linking to `/original/`, `/investor/`, `/sales/`,
and `/live-talk/`. With Kujo, the pinned upstream dependencies, and authorized
Cloudflare Wrangler access installed, run:

```sh
npm run deploy:site
```

This builds every public deck with its production canonical route, stages only
the generated decks and collection assets in `.build/public-site/`, and deploys
through pinned Wrangler 4.129.0. `wrangler.jsonc` binds the custom domain. Source
files, repository history, briefs, private notes, and audit receipts remain
outside the published directory. Use `npm run build:site` to prepare the same
artifact without deploying.

The builder supplies canonical links, social text metadata, WebPage JSON-LD,
robots.txt, and a sitemap. The sitemap includes the overview, numbered slides,
and reading edition. Print, presenter, and error pages use `noindex,follow`.
Set `--site-url` to the full deployment base, including a subdirectory when
needed; the default example.com URL is for local development only.

The reference host enforces the policy in `deployment/_headers`, supports real
404 responses, and redirects directory routes to their trailing-slash form.
Verify each deployment with:

```sh
npm run verify:site -- https://presentations.kujolang.ai/
```

See the [2026-10-01 audit](../seo-audit/2026-10-01/executive-summary.md) for crawl
evidence and measurement limits. Search indexing and AI citations require
subsequent observations; deployment does not guarantee either.
