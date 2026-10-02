
# Recommendations and measurement plan

Audit date: 2026-10-02

## Immediate after deployment

- Submit `https://presentations.kujolang.ai/sitemap.xml` in Google Search Console and Bing Webmaster Tools when owner access is available.
- Request indexing for the collection page and four deck overview/reading routes first; do not promise inclusion or rank.
- Validate the five social cards in the target social platforms' own preview tools after their caches refresh.

## 7-day checks

- Compare indexed URL counts and inspect canonical selection for the collection, four deck overviews, and four reading routes.
- Review verified crawler/CDN logs for Googlebot, bingbot, OAI-SearchBot, Claude-SearchBot, and PerplexityBot. Current synthetic checks cannot prove verified bot traffic.
- Repeat the four search observations and the 12 AI citation questions with controlled account, locale, date, and evidence capture.

## 28-, 60-, and 90-day comparisons

- Compare impressions, clicks, CTR, query mix, landing pages, and index coverage against the first complete week.
- Compare field LCP, INP, and CLS if CrUX reaches sufficient volume; keep lab and field measurements separate.
- Compare referral traffic carrying AI/search provenance where analytics permits it. Report absent data as `NOT AVAILABLE — DATA ACCESS REQUIRED`, never as zero.
- Expand content only where query and citation evidence shows a real gap; avoid near-duplicate deck pages aimed at the same intent.

## Editorial and policy decisions

- Decide whether Anthropic model-training access is desired before changing the edge rule that returns 403 to `ClaudeBot`; `Claude-SearchBot` is already reachable.
- Consider adding validated width/height fields to the deck image schema during a future presentation-format revision.
- Consider IndexNow only after an owner-approved key and automation path exist; submission confirms receipt, not indexing.
