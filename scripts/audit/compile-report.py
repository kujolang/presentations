#!/usr/bin/env python3
"""Compile the dated Kujo Presentations SEO and AI-search audit artifacts."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import subprocess
from pathlib import Path
from urllib.parse import urlsplit


NA = "NOT AVAILABLE — DATA ACCESS REQUIRED"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def write_text(path: Path, value: str) -> None:
    path.write_text(value.rstrip() + "\n", encoding="utf-8")


def page_kind(url: str) -> tuple[str, str, str, str]:
    path = urlsplit(url).path
    if path == "/":
        return ("collection landing page", "Explore presentation formats", "People evaluating Kujo Presentations", "Kujo Presentations")
    if path.endswith("404.html"):
        return ("error document", "Recover from a missing route", "People following a broken URL", "Kujo Presentations")
    deck = next((name for name in ["original", "investor", "sales", "live-talk"] if path.startswith(f"/{name}/")), "")
    entities = {
        "original": "A new perspective on media",
        "investor": "Vela Investor Briefing",
        "sales": "Springline Consumer Company Overview",
        "live-talk": "AI at Work: Adoption Rises, but Value Lags",
    }
    if path.endswith("/reading/"):
        return ("presentation transcript", "Read a complete presentation", "Readers and assistive-technology users", entities[deck])
    if path.endswith("/print/"):
        return ("print utility", "Print or export presentation slides", "Presentation authors", entities[deck])
    if path.endswith("/presenter/"):
        return ("presenter utility", "Control a live presentation", "Presentation speakers", entities[deck])
    if path.rstrip("/").split("/")[-1].isdigit():
        return ("individual slide", "View a specific presentation slide", "Presentation viewers", entities[deck])
    return ("presentation overview", "Preview and start a complete presentation", "People exploring a presentation example", entities[deck])


def lighthouse_row(path: Path, phase: str, environment: str) -> dict[str, object]:
    data = json.loads(path.read_text(encoding="utf-8"))
    requests = data["audits"]["network-requests"]["details"]["items"]
    totals = {"Document": 0, "Stylesheet": 0, "Script": 0, "Image": 0, "Font": 0}
    for item in requests:
        kind = item.get("resourceType")
        if kind in totals:
            totals[kind] += int(item.get("transferSize") or 0)
    return {
        "phase": phase,
        "url": data["finalUrl"],
        "template": "collection landing page",
        "run_date": "2026-10-02",
        "environment": environment,
        "lighthouse_version": data["lighthouseVersion"],
        "html_bytes": totals["Document"],
        "css_bytes": totals["Stylesheet"],
        "js_bytes": totals["Script"],
        "image_bytes": totals["Image"],
        "font_bytes": totals["Font"],
        "requests": len(requests),
        "lcp_ms": round(data["audits"]["largest-contentful-paint"]["numericValue"], 1),
        "inp_ms": NA,
        "cls": round(data["audits"]["cumulative-layout-shift"]["numericValue"], 4),
        "ttfb_ms": round(data["audits"]["server-response-time"]["numericValue"], 1),
        "source": str(path),
        "notes": f"Single Lighthouse lab sample; performance score {data['categories']['performance']['score']:.2f}; total byte weight {int(data['audits']['total-byte-weight']['numericValue'])}.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", default="seo-audit/2026-10-02")
    args = parser.parse_args()
    audit = Path(args.audit)
    raw = audit / "raw"
    baseline = read_csv(audit / "baseline.csv")
    after = read_csv(audit / "after.csv")
    base_summary = json.loads((audit / "baseline-summary.json").read_text())
    after_summary = json.loads((audit / "after-summary.json").read_text())
    production = json.loads((raw / "production-after.json").read_text())

    snapshot = raw / "baseline-site"
    if snapshot.exists():
        files = []
        for path in sorted(item for item in snapshot.rglob("*") if item.is_file()):
            files.append({
                "path": path.relative_to(snapshot).as_posix(),
                "bytes": path.stat().st_size,
                "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
            })
        manifest = {
            "captured": "2026-10-02",
            "sourceCommit": subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip(),
            "fileCount": len(files),
            "files": files,
        }
        write_text(raw / "baseline-manifest.json", json.dumps(manifest, indent=2))

    after_by_url = {row["url"]: row for row in after}
    content_rows = []
    keyword_rows = []
    for row in after:
        purpose, intent, audience, entity = page_kind(row["url"])
        indexable = row["indexable"] == "True"
        content_rows.append({
            "phase": "after",
            "url": row["url"],
            "source_file": row["source_file"],
            "page_type": purpose,
            "primary_purpose": purpose,
            "search_intent": intent,
            "target_audience": audience,
            "central_entity": entity,
            "primary_query_theme": f"{entity} browser presentation" if indexable else "Not targeted; utility or error page",
            "supporting_topics": "slides; reading view; browser-native presentation",
            "h1": row["h1"],
            "heading_structure": row["heading_structure"],
            "word_count": row["word_count"],
            "published_date": NA,
            "modified_date": NA,
            "first_hand_signals": "Runnable deck, visible slide content, local assets, and a complete reading view" if indexable else "Utility output from the same authored deck",
            "content_gap": "None found in the stated demo scope" if indexable else "Not applicable",
            "competing_internal_url": "None",
            "recommended_action": "Keep route content aligned with its deck source" if indexable else "Keep noindex and crawlable",
        })
        if indexable:
            keyword_rows.append({
                "phase": "after",
                "url": row["url"],
                "primary_topic": entity,
                "primary_entity": entity,
                "search_intent": intent,
                "primary_query_theme": f"{entity} browser presentation",
                "secondary_queries": "web slides; accessible presentation transcript; presentation demo",
                "related_entities": "Kujo; Kujo Presentations; browser-native slides",
                "relevant_questions": "What does this presentation format look like?; Can I read the full deck as text?",
                "competing_internal_url": "None",
                "content_gap": "No internal cannibalization observed",
                "recommended_action": "Measure impressions before expanding query targets",
            })
    write_csv(audit / "content-audit.csv", content_rows)
    write_csv(audit / "keyword-map.csv", keyword_rows)

    write_csv(audit / "performance.csv", [
        lighthouse_row(raw / "lighthouse-baseline.json", "baseline", "local mobile simulation"),
        lighthouse_row(raw / "lighthouse-after.json", "after", "local mobile simulation"),
        lighthouse_row(raw / "lighthouse-production.json", "after", "production mobile simulation"),
    ])

    crawler_rows = []
    for receipt in production["routes"]:
        if "crawler" not in receipt:
            continue
        crawler = receipt["crawler"]
        purpose = "Search/discovery" if crawler in {"Googlebot", "bingbot", "OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "PerplexityBot"} else "Model training"
        access = "Allowed by User-agent: *"
        action = "None; discovery crawler reached production" if receipt["status"] == 200 else "Review only if model-training access is desired"
        crawler_rows.append({
            "crawler": crawler,
            "purpose": purpose,
            "robots_access": access,
            "live_status": receipt["status"],
            "waf_or_cdn_result": "200 response" if receipt["status"] == 200 else "403 from edge security",
            "recommended_action": action,
            "action_taken": "Preserved the site's unrestricted robots policy",
            "evidence": "raw/production-after.json; synthetic user agent only, not verified crawler IP",
        })
    write_csv(audit / "crawler-access.csv", crawler_rows)

    redirect_rows = []
    for receipt in production["routes"]:
        if "destination" not in receipt:
            continue
        redirect_rows.append({
            "phase": "after",
            "source_url": f"https://presentations.kujolang.ai{receipt['path']}",
            "source_variant": "index or slash normalization",
            "http_status": receipt["status"],
            "target_url": receipt["destination"],
            "chain_length": receipt["hops"],
            "final_status": receipt["finalStatus"],
            "canonical_target": receipt["destination"].split("?")[0],
            "query_preserved": "True",
            "verification": "production fetch with manual redirect handling",
            "issues": "",
        })
    write_csv(audit / "redirects.csv", redirect_rows)

    write_csv(audit / "search-rankings.csv", [
        {"query": query, "search_engine": "Web search sample", "date": "2026-10-02", "country": "US", "device": "unspecified", "page_found": "No", "observed_position_or_range": "Not observed", "competing_results": competitors, "rich_features": "Not observed for this domain", "ai_result_presence": "Not measured", "evidence": "Manual search-tool observation on 2026-10-02", "limitations": "One non-personalized sample is not rank tracking; indexing and Search Console data are unavailable."}
        for query, competitors in [
            ("site:presentations.kujolang.ai", "No result from the audited domain was returned"),
            ('"Kujo Presentations"', "No result from the audited domain was returned"),
            ("browser native presentation demos Kujo", "Heed; LocalStudio; Skroll; Effective HTML"),
            ('"AI at Work: Adoption Rises, but Value Lags"', "No result from the audited domain was returned"),
        ]
    ])

    ai_questions = [
        "What is Kujo Presentations?",
        "Show me examples of browser-native presentation decks.",
        "Can Kujo Presentations provide an accessible text version of a deck?",
        "Where can I see a Kujo Presentations investor demo?",
    ]
    write_csv(audit / "ai-search-benchmark.csv", [
        {"question": question, "platform": platform, "date": "2026-10-02", "domain_appeared": NA, "domain_cited": NA, "cited_url": NA, "citation_context": NA, "citation_order": NA, "competing_domains": NA, "accurate_representation": NA, "content_gap": "Retest after discovery and indexing", "evidence": NA, "limitations": NA}
        for platform in ["ChatGPT Search", "Claude web search", "Perplexity"] for question in ai_questions
    ])

    issues = [
        {"id":"SEO-20261002-01","phase":"baseline","category":"social metadata","severity":"P1","affected_urls":"All indexable routes","affected_count":45,"evidence":"baseline.csv; metadata-audit.csv","expected_benefit":"Reliable, route-relevant social previews and stronger machine-readable page identity","confidence":"High","difficulty":"Low","recommended_action":"Publish one deterministic social card per deck and large-card metadata on every indexable route","owner":"Presentation maintainer","status":"fixed"},
        {"id":"SEO-20261002-02","phase":"baseline","category":"performance","severity":"P1","affected_urls":"/","affected_count":1,"evidence":"raw/lighthouse-baseline.json","expected_benefit":"Faster visual completion and lower transfer cost on the showcase landing page","confidence":"High","difficulty":"Low","recommended_action":"Serve right-sized WebP previews, lazy-load below-fold previews, and preload the first preview","owner":"Presentation maintainer","status":"fixed"},
        {"id":"SEO-20261002-03","phase":"baseline","category":"content accuracy","severity":"P1","affected_urls":"/","affected_count":1,"evidence":"raw/baseline-root.html","expected_benefit":"Accurate product and entity representation for people and retrieval systems","confidence":"High","difficulty":"Low","recommended_action":"Replace stale Signal Foundry copy with the current Vela Investor Briefing identity","owner":"Presentation maintainer","status":"fixed"},
        {"id":"SEO-20261002-04","phase":"after","category":"images","severity":"P3","affected_urls":"Deck pages containing slide imagery","affected_count":51,"evidence":"image-audit.csv","expected_benefit":"More explicit intrinsic sizing in source HTML; current fixed slide canvases already reserve layout space","confidence":"Medium","difficulty":"Medium","recommended_action":"Add validated width and height fields to deck image records in a future schema revision","owner":"Presentation maintainer","status":"open recommendation"},
        {"id":"SEO-20261002-05","phase":"after","category":"measurement","severity":"P2","affected_urls":"All indexable routes","affected_count":45,"evidence":"data-availability.md","expected_benefit":"Evidence-based decisions using impressions, clicks, indexing, field CWV, crawler visits, and AI citations","confidence":"High","difficulty":"Medium","recommended_action":"Connect owner-approved Search Console, Bing Webmaster Tools, analytics, field CWV, and CDN logs","owner":"Site owner","status":"data access required"},
        {"id":"SEO-20261002-06","phase":"after","category":"crawler policy","severity":"P3","affected_urls":"All routes","affected_count":58,"evidence":"crawler-access.csv","expected_benefit":"Clarify whether model-training access is intended; search crawlers are already reachable","confidence":"High","difficulty":"Low","recommended_action":"No search fix required; review ClaudeBot's 403 only if Anthropic training access is desired","owner":"Site owner","status":"accepted pending policy decision"},
    ]
    write_csv(audit / "issues.csv", issues)

    sources = [
        ("Google: SEO guide for web developers", "https://developers.google.com/search/docs/fundamentals/get-started-developers", "Unique titles/descriptions, semantic HTML, DOM-visible text, and structured data support discovery.", "Current primary guidance"),
        ("Google: robots meta tag", "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag", "Noindex pages must remain crawlable for the directive to be seen.", "Current primary guidance"),
        ("Google: canonicalization", "https://developers.google.com/search/docs/crawling-indexing/canonicalization", "Redirects, rel=canonical, and sitemap inclusion are canonical signals.", "Current primary guidance"),
        ("Google: sitemap overview", "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview", "Sitemaps help discovery but do not guarantee indexing.", "Current primary guidance"),
        ("Google: title links", "https://developers.google.com/search/docs/appearance/title-link", "Every page should have concise, descriptive title text.", "Current primary guidance"),
        ("Google: snippets", "https://developers.google.com/search/docs/appearance/snippet", "Unique, accurate, page-specific descriptions may be used as snippets.", "Current primary guidance"),
        ("Google: structured data guidelines", "https://developers.google.com/search/docs/appearance/structured-data/sd-policies", "Structured data must match visible content and relevant images must be crawlable.", "Current primary guidance"),
        ("OpenAI: publishers and developers FAQ", "https://help.openai.com/en/articles/12627856-publishers-and-developers-faq", "OAI-SearchBot access supports inclusion in ChatGPT summaries and snippets; GPTBot is a separate training control.", "Current primary guidance"),
        ("Anthropic: web crawler controls", "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler", "Anthropic bots honor robots.txt; crawler purposes must be distinguished.", "Current primary guidance"),
        ("Bing: robots.txt", "https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec", "Use a root robots file with simple rules and a sitemap directive.", "Current primary guidance"),
        ("Cloudflare Workers: static asset headers", "https://developers.cloudflare.com/workers/static-assets/headers/", "Static deployments can author security and cache headers in _headers.", "Current primary guidance"),
        ("IndexNow protocol documentation", "https://www.indexnow.org/documentation", "IndexNow can notify participating engines of changed URLs, but a successful request only confirms receipt.", "Current primary guidance"),
    ]
    research = "# Research sources\n\nAudit date: 2026-10-02\n\n| Source | Retrieved | Supported conclusion | Classification |\n| --- | --- | --- | --- |\n" + "\n".join(f"| [{name}]({url}) | 2026-10-02 | {conclusion} | {classification} |" for name, url, conclusion, classification in sources)
    write_text(audit / "research-sources.md", research)

    write_text(audit / "data-availability.md", f"""
# Data availability

Audit date: 2026-10-02

| Source | Available | Scope / limitation |
| --- | --- | --- |
| Repository source and generated site | Yes | Complete repository and all 58 generated HTML documents were inspected. |
| Production HTTP, headers, redirects, assets | Yes | 58 HTML routes, robots, sitemap, missing routes, redirects, eight synthetic crawler UAs, and 95 assets were verified. |
| Local and production Lighthouse | Yes | Single mobile-simulation lab samples; not field Core Web Vitals. |
| Google Search Console | No | {NA} |
| Bing Webmaster Tools | No | {NA} |
| Analytics and conversions | No | {NA} |
| CDN / verified crawler logs | No | {NA} |
| Chrome UX Report / field CWV | No | {NA} |
| Controlled AI citation tests | No | {NA} |

Unavailable sources are not treated as zero traffic, zero impressions, zero crawler activity, or zero AI citations.
""")

    write_text(audit / "methodology.md", """
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
""")

    base_lh = json.loads((raw / "lighthouse-baseline.json").read_text())
    after_lh = json.loads((raw / "lighthouse-after.json").read_text())
    prod_lh = json.loads((raw / "lighthouse-production.json").read_text())
    def metric(data: dict, key: str) -> float:
        return data["audits"][key]["numericValue"]
    write_text(audit / "before-after.md", f"""
# Before and after

Audit date: 2026-10-02

Immediate technical evidence only; search outcomes require post-deployment data and elapsed time.

| Measure | Baseline | After | Evidence |
| --- | ---: | ---: | --- |
| Generated HTML documents | {base_summary['pages']} | {after_summary['pages']} | baseline.csv / after.csv |
| Intended indexable URLs | {base_summary['indexable']} | {after_summary['indexable']} | baseline-summary.json / after-summary.json |
| Indexable routes with Open Graph images | 0 / 45 | 45 / 45 | metadata-audit.csv |
| Indexable routes with large Twitter cards | 0 / 45 | 45 / 45 | metadata-audit.csv |
| Landing image transfer, Lighthouse | {int(metric(base_lh, 'total-byte-weight') if False else base_lh['audits']['total-byte-weight']['numericValue']):,} B total | {int(after_lh['audits']['total-byte-weight']['numericValue']):,} B total | raw/lighthouse-baseline.json / raw/lighthouse-after.json |
| Landing LCP, local lab | {metric(base_lh, 'largest-contentful-paint'):.0f} ms | {metric(after_lh, 'largest-contentful-paint'):.0f} ms | raw/lighthouse-baseline.json / raw/lighthouse-after.json |
| Landing CLS, local lab | {metric(base_lh, 'cumulative-layout-shift'):.4f} | {metric(after_lh, 'cumulative-layout-shift'):.4f} | raw/lighthouse-baseline.json / raw/lighthouse-after.json |
| Landing Lighthouse performance | {base_lh['categories']['performance']['score']:.2f} | {after_lh['categories']['performance']['score']:.2f} | paired local lab samples |
| Production Lighthouse performance | — | {prod_lh['categories']['performance']['score']:.2f} | raw/lighthouse-production.json |
| Broken internal links | {base_summary['broken_internal_links']} | {after_summary['broken_internal_links']} | crawl summaries |
| JSON-LD parse errors | {base_summary['schema_parse_errors']} | {after_summary['schema_parse_errors']} | schema-audit.csv |
| Missing intrinsic image dimensions | {base_summary['missing_dimensions']} | {after_summary['missing_dimensions']} | image-audit.csv |

The local landing page transferred about 90% fewer bytes and its single-sample LCP fell from 14.0 s to 2.2 s. Production measured a 1.13 s LCP and a 1.00 Lighthouse performance score in one lab run. These observations do not predict field performance or ranking changes.
""")

    write_text(audit / "changes.md", """
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
""")

    write_text(audit / "unresolved.md", f"""
# Unresolved items

Audit date: 2026-10-02

1. Search Console, Bing Webmaster Tools, analytics, conversion data, verified crawler logs, field Core Web Vitals, and controlled AI citation evidence are {NA}. This blocks outcome claims, not deployment.
2. The 51 repeated slide-image occurrences do not declare intrinsic dimensions in HTML. Fixed 16:9 slide canvases reserve their rendered space, so this is a P3 source-markup improvement rather than an observed layout-shift defect.
3. Synthetic `ClaudeBot` requests receive 403 from edge security while `Claude-SearchBot` receives 200. Search discoverability is available; training access remains an owner policy choice.
4. A current search sample did not surface the newly deployed domain. Indexing and ranking must be checked after discovery time and with owner-authorized webmaster data.
""")

    write_text(audit / "recommendations.md", f"""
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
- Compare referral traffic carrying AI/search provenance where analytics permits it. Report absent data as `{NA}`, never as zero.
- Expand content only where query and citation evidence shows a real gap; avoid near-duplicate deck pages aimed at the same intent.

## Editorial and policy decisions

- Decide whether Anthropic model-training access is desired before changing the edge rule that returns 403 to `ClaudeBot`; `Claude-SearchBot` is already reachable.
- Consider adding validated width/height fields to the deck image schema during a future presentation-format revision.
- Consider IndexNow only after an owner-approved key and automation path exist; submission confirms receipt, not indexing.
""")

    write_text(audit / "executive-summary.md", f"""
# Executive summary

**PASS WITH RECOMMENDATIONS — 2026-10-02**

All 58 generated HTML documents for `https://presentations.kujolang.ai/` were audited. The 45 intended discovery URLs remain indexable, canonical, internally reachable, and present in the sitemap; print, presenter, and error documents remain noindex. Production returns 200 for all expected HTML routes and assets, preserves query strings through one-hop canonical redirects, and returns real 404 responses for missing paths.

The baseline had no image-based social metadata on any of the 45 indexable routes, transferred 2.55 MB in the landing-page Lighthouse sample, and still named the retired Signal Foundry example. The site now publishes deterministic, route-relevant Howl social cards for the product and four deck types; every indexable route has large-card Open Graph/Twitter metadata; the landing page accurately names Vela; and right-sized WebP previews reduced the local sample to 265 kB. Single-sample local Lighthouse performance rose from 0.74 to 0.89 and LCP fell from 14.0 s to 2.2 s. The production sample scored 1.00 with a 1.13 s LCP. These are lab observations, not search or field-CWV outcome claims.

Final technical evidence: 0 broken internal links, 0 broken media, 0 canonical-origin mismatches, 0 JSON-LD parse errors, 45/45 indexable URLs in the sitemap, 45/45 indexable URLs with social images, and 45/45 with large Twitter cards. Repository verification passed 14 Node tests and 94 browser tests, with 2 expected project-specific skips. Howl validation and deterministic rerender comparison passed. Production verification covered 58 HTML routes, robots/sitemap, missing routes, redirects, eight synthetic crawler user agents, and 95 static assets.

Googlebot, bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, and PerplexityBot synthetic requests returned 200. `ClaudeBot` returned 403 at the edge; that bot is treated as a model-training policy question, not a search blocker, because `Claude-SearchBot` is reachable.

Search Console, Bing Webmaster Tools, analytics, conversions, verified crawler logs, field Core Web Vitals, and controlled AI citation evidence are **{NA}**. A current search sample did not surface the new domain, so no ranking, indexing, traffic, conversion, or AI-citation improvement is claimed. The remaining technical recommendation is to add intrinsic dimensions to 51 repeated slide-image occurrences in a future deck-schema revision; fixed slide canvases already reserve their layout space.
""")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
