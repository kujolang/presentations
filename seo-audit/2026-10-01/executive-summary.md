# SEO and AI-search audit

**PASS WITH RECOMMENDATIONS — 2026-10-01**

The reference presentation is published at https://presentations.robertdevore.com/. Its 14 generated HTML documents were audited; 11 intended discovery pages have canonical links, unique titles/descriptions and sitemap entries. Print, presenter and error pages are noindex.

Before this work the hostname returned NXDOMAIN, canonicals pointed at example.com, every description was duplicated, and an unused /blog/ page introduced 11 broken links and 9 broken image occurrences. The sealed baseline covers 15 documents.

The presentation layer now owns correct metadata, safe WebPage JSON-LD, robots/sitemap and removal of the duplicate archive. Production configuration serves only the reference artifact with HTTPS, real errors, directory redirects, security headers and minified CSS. Source repositories remain separate and unchanged upstream. See changes.md for the exact implementation files. All retained HTML documents changed through the shared head; slide content and behavior are preserved.

P0 root causes: 1 before, 0 after. P1: 2 before, 0 after. Final crawl: 0 broken internal links, 0 broken media, 0 canonical-origin mismatches, 0 JSON-LD parse errors. Schema is basic visible-content-aligned WebPage, not a claim of rich-result eligibility.

Verification includes required repository tests, full local crawling, paired Lighthouse overview samples, live routes/assets, crawler-UA probes, redirects and local browser interactions. Raw receipts distinguish lab data from live delivery. The repeated H1s in print and orphan 404 are intentional.

Search rankings, traffic, indexing, field CWV, verified crawler visits and AI citations: **NOT AVAILABLE — DATA ACCESS REQUIRED**. The available search-tool observations are exploratory, not a controlled ranking baseline. Internal SEO and AI readiness scores were intentionally not calculated.

The site is technically ready to share. Follow recommendations.md for 7/28/60/90-day measurements, optional thumbnail optimization and owner-approved product content. No ranking or citation improvement is claimed.

