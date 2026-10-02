
# Executive summary

**PASS WITH RECOMMENDATIONS — 2026-10-02**

All 58 generated HTML documents for `https://presentations.kujolang.ai/` were audited. The 45 intended discovery URLs remain indexable, canonical, internally reachable, and present in the sitemap; print, presenter, and error documents remain noindex. Production returns 200 for all expected HTML routes and assets, preserves query strings through one-hop canonical redirects, and returns real 404 responses for missing paths.

The baseline had no image-based social metadata on any of the 45 indexable routes, transferred 2.55 MB in the landing-page Lighthouse sample, and still named the retired Signal Foundry example. The site now publishes deterministic, route-relevant Howl social cards for the product and four deck types; every indexable route has large-card Open Graph/Twitter metadata; the landing page accurately names Vela; and right-sized WebP previews reduced the local sample to 265 kB. Single-sample local Lighthouse performance rose from 0.74 to 0.89 and LCP fell from 14.0 s to 2.2 s. The production sample scored 1.00 with a 1.13 s LCP. These are lab observations, not search or field-CWV outcome claims.

Final technical evidence: 0 broken internal links, 0 broken media, 0 canonical-origin mismatches, 0 JSON-LD parse errors, 45/45 indexable URLs in the sitemap, 45/45 indexable URLs with social images, and 45/45 with large Twitter cards. Repository verification passed 14 Node tests and 94 browser tests, with 2 expected project-specific skips. Howl validation and deterministic rerender comparison passed. Production verification covered 58 HTML routes, robots/sitemap, missing routes, redirects, eight synthetic crawler user agents, and 95 static assets.

Googlebot, bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, and PerplexityBot synthetic requests returned 200. `ClaudeBot` returned 403 at the edge; that bot is treated as a model-training policy question, not a search blocker, because `Claude-SearchBot` is reachable.

Search Console, Bing Webmaster Tools, analytics, conversions, verified crawler logs, field Core Web Vitals, and controlled AI citation evidence are **NOT AVAILABLE — DATA ACCESS REQUIRED**. A current search sample did not surface the new domain, so no ranking, indexing, traffic, conversion, or AI-citation improvement is claimed. The remaining technical recommendation is to add intrinsic dimensions to 51 repeated slide-image occurrences in a future deck-schema revision; fixed slide canvases already reserve their layout space.
