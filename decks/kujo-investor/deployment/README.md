# Investor Pages deployment

Public URL: https://invest.kujolang.ai/ — native overview and launch links. Direct presentation: https://invest.kujolang.ai/1/.

Cloudflare Pages project: `kujo-investor`; production branch `main`; Pages fallback https://kujo-investor.pages.dev. This is an actual Pages deployment (not a Worker facade). Production deployment: `df9a94d1-8f8a-44e8-b558-993c2e6b254f`. DNS: proxied CNAME `invest` → `kujo-investor.pages.dev`, TTL Auto. Custom domain was registered through the Pages API and DNS created in the authenticated dashboard after the owner signed in. The CLI OAuth token can manage Pages but cannot edit DNS.

## Update

From repository root:

```sh
node scripts/build-investor-pages.mjs
cd decks/kujo-investor
npx --yes wrangler@4.151.3 pages deploy ../../.build/investor-pages --project-name kujo-investor --branch main
```

The deck-local `wrangler.jsonc` is deliberately separate from the repository's Worker configuration. It sets `pages_build_output_dir`; Pages does not accept `account_id` in this file. If multiple accounts are available, set `CLOUDFLARE_ACCOUNT_ID` explicitly for the intended account. Do not pass a custom config pathname to `pages deploy`.

The build uses canonical origin `https://invest.kujolang.ai`, copies only the finished static deck to a separate deployment directory, and sets nosniff/referrer/revalidation headers. Notes, research working files, credentials and the source repository are not uploaded. Root remains the native overview so the viewer's Overview link works. Numbered slide routes, appendix, reading, print and presenter are retained. Evidence artifacts deliberately published by the deck remain public.

## Verification

`python3 decks/kujo-investor/deployment/verify-http.py https://invest.kujolang.ai` checks all 106 static files plus a nonexistent route (404). A second optional argument supplies curl's `--resolve` mapping when local negative DNS cache remains; it does not disable TLS validation. The observed Cloudflare public DNS answer is recorded in deployment evidence. Browser checks confirm real navigation and appendix behavior. Global resolver propagation is not instantaneous.

## Deployment incident, corrected

The first `wrangler pages project create` unexpectedly delegated to Workers and inherited the repository-root Worker assets/hostname, creating an unintended `kujo-investor` Worker bound to `presentations.kujolang.ai`. The original `kujo-presentations` Worker was immediately redeployed from its own configuration and its custom-domain association verified through the API. The unintended Worker was then deleted after confirming it owned no domains. The correct Pages project was created with the Pages API and deployed with `pages deploy` from the deck directory. No lingering alternate Worker is part of this deployment. Original failed/recovery logs are retained for provenance. Avoid the CLI project-create command in a repository with an unrelated Worker config; use the explicit Pages API or dashboard for creation.

Final state (2026-11-09): Cloudflare reports **active**, with SSL enabled; see `domain-final.json` and `cloudflare-active.png`. Public Cloudflare and Google resolvers return the proxied address. All 106 files and expected 404 pass over the custom hostname with normal certificate validation using the observed public DNS answer (`http-verification.json`); the Pages hostname also passes (`pages-http-verification.json`). The in-app browser confirmed Pages slide navigation. Its custom-hostname attempt retained a negative DNS cache during this session, so custom-hostname browser rendering was not claimed. The deployment is active; resolver caches may need time to expire. No security warning was bypassed.

## Audience entry update — 2026-11-09

The publication adapter now serves slide one at `/`, preserves the native gallery
at `/overview/`, and redirects `/1` and `/1/` permanently to `/` (query retained).
The published view fills the screen width. At the owner's final request, visible
arrow controls and the bottom navigation overlay are removed. Swipe horizontally
on touch devices; use Left/Right, Space, Home/End on keyboards. The top-right
options menu retains reading, print, fullscreen, motion and presenter access.
No-JavaScript readers can use the overview or text edition from that menu.

Full audit, source changes, immutable baseline, screenshots and production
verification: `seo-audit/2026-11-09/` at repository root. Existing original deployment
receipts remain historical; the dated audit contains the newest deployment log.
The custom domain briefly retained the prior audience stylesheet after a Pages
update. A single-URL dashboard cache purge of
`https://invest.kujolang.ai/assets/deck/public-view.css` refreshed it. Do not purge
the entire zone or change unrelated cache policy. An attempted fingerprinted
publication was reverted after provider publishing errors; current source matches
the successfully deployed arrow-free presentation. See dated audit receipts.
Final successful publication for this update:
`https://06359401.kujo-investor.pages.dev`. Custom-domain touch, keyboard and
arrow-free appearance passed in `raw/live-verified-interactions.json` in the audit.

## Howl social previews — 2026-11-09

The Pages build now runs `scripts/build-investor-social.mjs` before the native deck
build. It requires the installed sibling Howl/Kujo tools and Chrome (overrides
listed in `../social/README.md`). `../howl.json` owns the 24 social-card definitions.
Every published HTML page receives a matching content-hashed 1200×630 PNG URL,
Open Graph image fields and Twitter large-image metadata. SVG source, PNG assets,
reproduction instructions and live verification are retained in the deck.
Latest deployment for social previews: `https://c0fb0cce.kujo-investor.pages.dev`.
