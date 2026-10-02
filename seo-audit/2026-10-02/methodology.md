
# Methodology

Audit date: 2026-10-02. Scope: `https://presentations.kujolang.ai/`, all four public decks, all 58 generated HTML documents, and the supporting static-host configuration. The intended audiences are people evaluating Kujo Presentations and people consuming the example decks.

## Evidence sequence

The clean `main` checkout at commit `a8a0e5dc6758ab9cbc78a33683fff5a2f990d24f` was built before site changes. A 325-file baseline artifact was preserved by SHA-256 manifest outside `.build/`; the baseline crawl, metadata, links, images, schema, Lighthouse result, live headers, robots, and sitemap remain immutable in `raw/` and the baseline CSVs.

After remediation, the same build and crawl path produced the comparison evidence. Production was deployed through the repository's pinned Wrangler command and separately verified over HTTPS. Lighthouse 13.5.0 ran once per local phase with mobile simulation and once against production. These are lab samples, not field Core Web Vitals. Synthetic user-agent requests do not establish verified crawler identity or prove every WAF path.

The Howl workflow validated a five-card manifest, listed and inspected the cards, generated a deterministic X caption, rendered SVG/HTML/Markdown/gallery artifacts, and passed a clean rerender diff. Published 1200×630 PNG derivatives are versioned in `deployment/social/`.

## Current primary guidance consulted

Current Google Search Central, Bing, OpenAI, Anthropic, Cloudflare, and IndexNow primary documentation was consulted on 2026-10-02. `research-sources.md` records the exact URLs and supported conclusions. Product documentation was separated from external commentary; no unverified SEO prediction was converted into a requirement.

## Reproduction

```sh
python3 scripts/audit/crawl.py baseline <sealed-baseline> --audit seo-audit/2026-10-02 --origin https://presentations.kujolang.ai --local http://127.0.0.1:8091
python3 scripts/audit/crawl.py after .build/public-site --audit seo-audit/2026-10-02 --origin https://presentations.kujolang.ai --local http://127.0.0.1:8092
npm test
AUDIT_DIR=seo-audit/2026-10-02 node scripts/audit/verify-live.mjs
```

No SEO or AI-readiness composite score was calculated. Search outcomes, verified crawler visits, rankings, traffic, conversions, field CWV, and AI citations require platform data and elapsed time.
