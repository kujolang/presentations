# Methodology

Audit date: 2026-10-01. Scope: the reference deck at https://presentations.robertdevore.com/, English, for people exploring Kujo browser presentations. Success for this launch means a working shareable presentation and readable edition, not a fabricated commercial conversion.

The user authorized this audit, fixes, and deployment to the named subdomain. Other domains, repository visibility, search-console ownership, and training-crawler policy remain outside the change. The default unrestricted robots behavior is preserved; no provider-specific training choice was introduced.

Untouched source acfa6ea6250660960db5706232ca8bfb230a43d1 was built first. The 54-file immutable snapshot and verified SHA-256 hashes are recorded in raw/baseline-manifest.json. The snapshot is outside the build tree; raw/production-before.txt records NXDOMAIN. Baseline CSVs remain unchanged. The baseline metadata CSV omitted duplicate flags because of a collector-copy defect; baseline.csv and baseline-summary.json contain the authoritative duplicate counts. That collector defect was fixed for the after crawl.

Delivery chain: deck JSON → native presentation renderer → public Kujo SSG CLI/templates → generated output/reference → CSS-minified .build/public-site → assets-only Cloudflare Worker → custom domain/TLS → browser or crawler. SSG and SiteKit remain unchanged. The site publishes no repository history, private notes, or audit files.

Reproduce the crawl with Python 3 and beautifulsoup4 (audit-only dependency):

```sh
python3 -m pip install beautifulsoup4==4.14.3
python3 scripts/audit/crawl.py after .build/public-site --local http://127.0.0.1:8091
```

Serve the immutable baseline on 8090 and staged artifact on 8091 with Python's HTTP server. The collector inventories every HTML file, inspects all HTML links, validates assets, computes graph depth and parses JSON-LD. It records local status separately from production. Noindex utilities and the error document remain in the inventory. Print deliberately repeats slide headings; the 404 is deliberately orphaned. No feeds, archives, pagination, authorship or publication dates are required for this deck. No dates or personal expertise were invented.

Lighthouse 13.5.0 uses the same Playwright Chromium executable, mobile simulation and local HTTP for before/after overview runs. These are single lab samples, not field Core Web Vitals. Production requests are tested separately; raw live receipts include headers, crawler user agents and redirect chains. Synthetic crawler user agents cannot prove verified crawler-IP access or all WAF behavior.

Optional SEO/AI readiness scores are not calculated. Coverage counts and issue severity are more defensible here; no platform data exists to weight search outcomes. No llms.txt or speculative AI protocol was added.


The local Tailscale resolver cached the pre-launch NXDOMAIN. Cloudflare's
authoritative nameserver, 1.1.1.1 and 8.8.8.8 returned the new A records. Live
Node probes used the process-scoped public-dns.mjs preload; curl used --resolve
with the published A record. TLS hostname verification stayed enabled. This
measures the published service separately from local negative-DNS caching.

Cloudflare adds its existing JavaScript-detection snippet to HTML responses.
Thus live HTML is not byte-identical to the artifact; live CSS/JS/image/font
asset sizes match. The strict CSP does not allow that injected inline script.
The deck does not depend on it. Zone security settings were not weakened.
Synthetic user-agent success cannot establish verified crawler or WAF behavior;
request logs remain required for that assessment.
