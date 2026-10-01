# Deploy a deck

Build with the intended `--site-url` and publish only `output/<deck-id>/` to a
static host with directory-index support. Do not publish the repository,
`.build/`, source briefs, or dependency checkouts. Every file in the deck's
`assets/` is copied into output, even when no slide uses it. Review that directory
before publishing.

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
