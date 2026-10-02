
# Before and after

Audit date: 2026-10-02

Immediate technical evidence only; search outcomes require post-deployment data and elapsed time.

| Measure | Baseline | After | Evidence |
| --- | ---: | ---: | --- |
| Generated HTML documents | 58 | 58 | baseline.csv / after.csv |
| Intended indexable URLs | 45 | 45 | baseline-summary.json / after-summary.json |
| Indexable routes with Open Graph images | 0 / 45 | 45 / 45 | metadata-audit.csv |
| Indexable routes with large Twitter cards | 0 / 45 | 45 / 45 | metadata-audit.csv |
| Landing image transfer, Lighthouse | 2,552,494 B total | 264,841 B total | raw/lighthouse-baseline.json / raw/lighthouse-after.json |
| Landing LCP, local lab | 13964 ms | 2186 ms | raw/lighthouse-baseline.json / raw/lighthouse-after.json |
| Landing CLS, local lab | 0.0025 | 0.0000 | raw/lighthouse-baseline.json / raw/lighthouse-after.json |
| Landing Lighthouse performance | 0.74 | 0.89 | paired local lab samples |
| Production Lighthouse performance | — | 1.00 | raw/lighthouse-production.json |
| Broken internal links | 0 | 0 | crawl summaries |
| JSON-LD parse errors | 0 | 0 | schema-audit.csv |
| Missing intrinsic image dimensions | 56 | 51 | image-audit.csv |

The local landing page transferred about 90% fewer bytes and its single-sample LCP fell from 14.0 s to 2.2 s. Production measured a 1.13 s LCP and a 1.00 Lighthouse performance score in one lab run. These observations do not predict field performance or ranking changes.
