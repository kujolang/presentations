
# Implemented changes

Audit date: 2026-10-02

- Added a validated five-card `howl.json` showcase covering the product landing page and all four deck types.
- Rendered deterministic 1200×630 social cards in Departure Mono from local deck artwork and published PNG derivatives under `deployment/social/`.
- Added route-correct Open Graph images, large Twitter cards, titles, descriptions, image dimensions, and image alt metadata to the landing page and every generated deck route.
- Added `WebSite`, `Organization`, and `CollectionPage` JSON-LD to the collection landing page while keeping existing visible-content-aligned `WebPage` markup on deck routes.
- Replaced stale Signal Foundry landing-page copy with the current Vela Investor Briefing identity.
- Replaced landing preview delivery with right-sized WebP files, lazy-loaded below-fold previews, preloaded the first preview, and added intrinsic dimensions.
- Added one-day static asset caching while preserving HTML revalidation and existing security headers.
- Updated public-site contracts and production verification for social assets, metadata, current nested routes, redirects, and eight crawler user agents.
- Updated the audit crawler to record live production status instead of a historical placeholder.

No deck claims, slide content, motion, navigation, canonical routes, sitemap membership, robots policy, or indexability decisions were changed.
