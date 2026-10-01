# Implemented changes

The presentation builder now derives slide descriptions from visible copy, adds deck context to slide titles, distinguishes reading/print/presenter metadata, emits safe WebPage JSON-LD and Open Graph text, and marks utility/error pages noindex. It emits canonical sitemap and robots files and removes the unused SSG blog archive before publication. Error-page asset and overview URLs resolve from nested misses.

The reference description now identifies the deck and metrics as fictional. No slide claims, numbers, images or motion were replaced. README links to the public demo; deployment documentation covers production commands and metadata.

The deployment script stages only the reference artifact, minifies CSS with the existing esbuild dependency, and uses pinned Wrangler 4.129.0. Hosting adds CSP, MIME sniffing protection, revalidation and directory-index handling. New SEO tests cover sitemap agreement, metadata uniqueness, structured-data parsing and noindex utility routes. The native escaping/parity test now distinguishes SSG output from presentation-owned postprocessing.

Changed implementation: src/build.kujo, scripts/build-site.mjs, package.json, deployment/_headers, wrangler.jsonc, examples/reference/deck.json, tests/seo.test.mjs, tests/build.test.mjs. Audit collector and evidence live under scripts/audit/ and this dated directory.

