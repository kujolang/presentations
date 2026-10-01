# Reference-site audit tools

These tools are maintenance checks, not presentation runtime dependencies.
Install Python 3 and beautifulsoup4==4.14.3 for crawl.py. It inventories a
locally served artifact and writes CSV/JSON evidence. Phase files are replaced;
never rerun a sealed baseline into its original audit directory. Use a new dated
audit directory and the same canonical origin for future comparisons.

```sh
python3 scripts/audit/crawl.py after .build/public-site --audit seo-audit/2026-10-01 --local http://127.0.0.1:8091
node scripts/audit/verify-live.mjs
```

The live check targets presentations.kujolang.ai and requires the matching
.build/public-site artifact. It checks routes, redirects, missing pages, crawler
user agents and asset sizes. It cannot establish verified crawler-IP access,
indexing or search visibility. Change its dated receipt path for a new audit;
preserve previous evidence.

If the local resolver still caches pre-launch NXDOMAIN, check public DNS first.
For this audit, a process-local lookup override verifies the hostname through
1.1.1.1 without changing system settings or disabling TLS:

```sh
node --import ./scripts/audit/public-dns.mjs scripts/audit/verify-live.mjs
```
