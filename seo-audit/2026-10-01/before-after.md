# Before and after

| Metric | Before | After |
| --- | ---: | ---: |
| pages | 15 | 14 |
| indexable | 15 | 11 |
| canonical_origin_mismatches | 15 | 0 |
| missing_titles | 0 | 0 |
| missing_descriptions | 0 | 0 |
| duplicate_title_pages | 4 | 0 |
| duplicate_description_pages | 15 | 0 |
| broken_internal_links | 11 | 0 |
| orphans | 3 | 2 |
| missing_alt | 0 | 0 |
| missing_dimensions | 36 | 27 |
| schema_pages | 0 | 13 |
| schema_parse_errors | 0 | 0 |
| sitemap_pages | 0 | 11 |
| pages_over_three_clicks | 0 | 0 |
| h1_problems | 1 | 1 |
| broken_media | 9 | 0 |

The HTML count drops from 15 to 14 because /blog/ was removed. Locally indexable means HTTP 200 without noindex, not indexed by a search engine. Eleven intended pages are in the final sitemap. The remaining orphans are the noindex presenter utility (opened by its control) and the intentional 404 document. Print has multiple slide H1s by design and is noindex. Missing intrinsic dimensions are image occurrences, not unique files; fixed canvas crops reserve their space. Baseline canonical mismatches include the missing 404 canonical before it became noindex.

Root causes: P0 1 → 0; P1 2 → 0. Final live access and redirects are recorded separately from local crawl status. No broken internal links or media remain. There are no authored external links in the deck; external-link CSVs therefore have no rows. Historical backlinks cannot be inferred without logs or a backlink source.

Overview single-sample lab LCP: 4511 → 4656 ms; CLS 0.04292012115412371 → 0.02297111583913624. Stylesheet decoded bytes: 145758 → 127156. These observations do not prove a field speed or ranking gain. Internal SEO and AI-readiness scores: not calculated (optional heuristics); measured visibility remains unavailable.


The after LCP sample is 145 ms slower despite an 18,602-byte stylesheet reduction. This single-run variation does not establish a speed regression or improvement; repeat controlled samples before attributing LCP changes.
