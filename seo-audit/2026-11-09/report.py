import csv,json
from pathlib import Path
R=Path(__file__).parent;NA='NOT AVAILABLE — DATA ACCESS REQUIRED'
def write(n,s):(R/n).write_text(s)
def rows(n):return list(csv.DictReader((R/n).open()))
def csvout(n,data,fields=None):
 with (R/n).open('w') as f:
  w=csv.DictWriter(f,fieldnames=fields or list(data[0]),extrasaction='ignore');w.writeheader();w.writerows(data)
base=json.loads((R/'baseline-summary.json').read_text());after=json.loads((R/'after-summary.json').read_text());pages=rows('after.csv');indexed=[p for p in pages if p['indexable']=='yes']
write('methodology.md',f'''# Methodology · 2026-11-09
Scope: English investor presentation at https://invest.kujolang.ai, Kujo Presentations repository main. Audience: infrastructure investors and technical partners. Conversion: review the thesis, inspect evidence, follow the investor contact link. UI changes, repository fixes and Pages deployment authorized; no DNS, training-crawler policy, analytics or editorial repositioning changes.

Delivery: deck.json + native Kujo renderer + deck CSS → native SSG output → scripts/build-investor-pages.mjs publication adapter → .build/investor-pages → Cloudflare Pages kujo-investor → proxied custom domain. No SSG/SiteKit changes. Publication adapter promotes slide one to root, retains overview at /overview/, and preserves native viewer, reading, print and presenter code. /1 and /1/ redirect permanently to root; native asset links resolve before route relocation.

Untouched artifact sealed before source edits: raw/baseline-site.tar.gz and baseline.sha256. raw/baseline-build.log proves build. Reopened into /tmp/invest-baseline-20261109. Original local-DNS failure saved separately; production baseline recaptured BEFORE deployment against publicly resolved IP with valid TLS. Local snapshot remains unmodified. Baseline browser screenshots and after browser screenshots are actual Chrome captures.

crawl.py inventories every generated HTML file, reconciles sitemap and HTML links, checks all unique HTTP destinations with GET, stores normalized data and raw receipts. A .html appendix alias becomes its clean canonical URL after deployment; route totals remain comparable. 404 page and print/presenter are utility pages, deliberately not indexable. Print has 18 H1s, presenter has none; these are utility structure observations, not 19 search defects. A 404 has no canonical by design. No feeds, archives, pagination or hreflang apply to this single-language deck. No historical URL/log completeness is claimed.

Public Google/Cloudflare DNS answers agree; this Mac's normal resolver remains stale. AUDIT_RESOLVE=invest.kujolang.ai:443:104.21.61.127 records the diagnostic workaround, not a DNS change. Browser host-resolver override retains hostname, SNI and certificate verification. probe.py tests redirects and user agents. Spoofed crawler UAs from our IP cannot prove access from provider IP ranges. www.invest.kujolang.ai is not a configured/publicized host; no DNS change is warranted. Pages alias is accessible with canonicals to the investor host.

Reproduction: build with node scripts/build-investor-pages.mjs; run crawl.py PHASE ARTIFACT_DIRECTORY; use serve.py for local Pages-equivalent route tests; browser-audit.mjs PHASE ORIGIN; probe.py for edge checks. Python dependencies: bs4 4.14.3; node browser tooling pinned in package-lock. Lighthouse 12.8.2 via npx. Baseline and after Lighthouse are single local mobile lab runs under shared machine load; not field CWV or reliable causal speed comparison.

Readiness heuristic: 10 equally weighted binary criteria, 10 points each. SEO: rendered core text, descriptive unique titles, descriptions on all indexable pages, canonicals on all indexable pages, sitemap coverage, no confirmed internal 404, no confirmed external 404, parseable schema on substantive pages, meaningful image alt, authenticated search performance data. Baseline 60/100 (appendix description/canonical/sitemap absent; search data absent); after 90/100. AI readiness: rendered text, accessible search robots, unique evidence artifacts, source citations, honest maturity labels, semantic sections, complete canonical coverage, complete sitemap coverage, accurate structured data coverage, measured independent AI visibility. Baseline 60/100; after 90/100. These internal heuristics are not search-provider scores, ranking predictions, or observed AI visibility.
''')
write('research-sources.md','''# Primary guidance retrieved 2026-11-09
- https://developers.google.com/search/docs/appearance/ai-features — documented recommendation: ordinary SEO, crawlability, visible text and truthful schema apply; no special AI files or schema required. Eligibility does not guarantee inclusion.
- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls — documented recommendation: align canonical links, redirects and sitemap routes. Canonicals remain signals, not guarantees.
- https://developers.google.com/search/docs/fundamentals/using-gen-ai-content — documented guidance: useful, original, accurate content matters. No bulk rewriting or invented authority performed.
- https://developers.openai.com/api/docs/bots — documented controls: OAI-SearchBot serves search; GPTBot relates to training; ChatGPT-User is user-triggered. Policies independent. Current permissive policy retained.
- https://www.indexnow.org/documentation — documented optional URL-change notification protocol with ownership key. No submission or new account configuration performed; not an indexing guarantee.
- https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a — attempted official source; response requires JavaScript, substantive guideline text unavailable through research fetch. No unsupported rule inferred.
- https://schema.org/PresentationDigitalDocument — appropriate possible presentation type, but WebPage is already truthful; no rich-result promise or speculative Product/Offer markup added.
- https://developers.cloudflare.com/pages/configuration/redirects/ — documented Pages _redirects support. Actual production status and query retention tested separately in raw/production-probes.json.

Search observation: queries “site:invest.kujolang.ai Kujo investor” and “agent software development accountability evidence verification infrastructure” through the connected web search tool on 2026-11-09. No investor-host listing was returned in that result set. This is not proof of non-indexing; provider locale/device/Google position were not exposed.

Representative competing search content inspected directly:
- https://www.sonarsource.com/resources/library/what-is-agentic-sdlc/ — clear definition, lifecycle comparison, verification narrative, contextual product links. Kujo's advantage as citation material is its inspectable run artifact and explicit component limitations; it is not evidence of competitive superiority. Broader category explanations belong in documentation, not filler slides.
- https://www.ibm.com/think/insights/how-to-establish-secure-sdlc — bylined, dated, structured technical explanation of execution permissions, auditability and governance. Kujo already links public founder context and sources; authenticated adoption evidence would strengthen its investor case when it exists. Do not manufacture it for SEO.

No new market claims were added. llms.txt is not required by the Google source; omitted rather than presented as an optimization guarantee.
''')
write('data-availability.md',f'''# Data availability
Available: source/build, unchanged baseline, generated HTML, production curl receipts with TLS, DNS probes, Chrome screenshots and interaction tests, axe results, local Lighthouse receipts, limited search-tool observation.

Google Search Console impressions/clicks/CTR/position/index coverage: {NA}
Bing Webmaster Tools and AI reports: {NA}
Analytics/referrals/conversions: {NA}
CDN request logs and complete 404/5xx enumeration: {NA}
CrUX/RUM field LCP/INP/CLS: {NA}
Controlled third-party AI answer sessions/citations: {NA}
Backlinks, historical URLs, validated rank tracker locale/device data: {NA}
No absence of access was converted into an absence of traffic, citations or demand.
''')
for name in ['content-audit.csv','keyword-map.csv']:
 data=[]
 for p in indexed:
  data.append(dict(url=p['url'],topic=p['h1'],audience='Infrastructure investors / technical partners',intent='Investor diligence' if 'appendix' in p['url'] else 'Understand Kujo investment thesis',primary_theme='Kujo agent development accountability',supporting_theme=p['h1'],evidence='Visible slide + linked appendix + research/CLAIMS.md',gap='Commercial validation remains explicitly unavailable; no fabricated demand',action='Preserve concise investor voice; validate changing claims before external fundraising',competing_internal_url='Reading and individual slides intentionally offer alternate reading experiences'))
 csvout(name,data)
rankfields=next(csv.reader((R/'search-rankings.csv').open()));csvout('search-rankings.csv',[dict(query=q,search_engine='Connected web search; not a Google rank API',date='2026-11-09',country=NA,device=NA,page_found='No invest host listing in returned result set',observed_position_or_range=NA,competing_results='Sonar agentic SDLC; IBM SDLC guardrails' if not q.startswith('site:') else '',rich_features=NA,ai_result_presence=NA,evidence='research-sources.md',limitations='Single query observation; no universal rank/indexing conclusion') for q in ['site:invest.kujolang.ai Kujo investor','agent software development accountability evidence verification infrastructure']],rankfields)
aifields=next(csv.reader((R/'ai-search-benchmark.csv').open()));csvout('ai-search-benchmark.csv',[dict(question=q,platform='ChatGPT Search / Bing Copilot / Google AI Mode',date='2026-11-09',domain_appeared=NA,domain_cited=NA,cited_url=NA,citation_context=NA,citation_order=NA,competing_domains=NA,accurate_representation=NA,content_gap='Measure with authenticated independent sessions',evidence='No controlled answer session executed',limitations='Future benchmark protocol; not an observed negative') for q in ['What is Kujo building?','Can I use Kujo accountability tools without adopting its language?','How can I verify an agent actually ran a test?','What does RunLedger verify compared with CaseFile and Eval?','Which platforms provide reproducible evidence for coding-agent tasks?','What are the limitations of Kujo execution controls?']],aifields)
issues=[('UI-01','presentation','P1','/',1,'raw/baseline-desktop-1.png; baseline-site.tar.gz','Immediate slide experience','High','Medium','Open at first slide; full-width canvas; unobstructed touch swipes and keyboard navigation','resolved'),('SEO-01','metadata/schema','P2','/assets/deck/appendix',1,'baseline.csv','Accurate interpretation and canonical identity','High','Low','Add factual metadata and WebPage JSON-LD','resolved'),('SEO-02','discovery','P2','/assets/deck/appendix',1,'baseline-site.tar.gz sitemap.xml','Discover evidence page','High','Low','Include clean canonical appendix route in sitemap','resolved'),('UI-02','accessibility/media','P2','cover instances',3,'image-audit.csv; baseline.csv','Explicit intrinsic logo aspect ratio','High','Low','Add width and height to native cover logo','resolved'),('DATA-01','measurement','P2','sitewide',24,'data-availability.md','Establish actual search and AI outcomes','High','Owner access','Owner supplies authorized reports for later comparison','recommendation/access required'),('SOCIAL-01','sharing','P3','sitewide',21,'metadata-audit.csv','Richer social previews','Medium','Low','Optional approved 1200x630 share card; current text summary cards valid','recommendation')]
csvout('issues.csv',[dict(id=i,phase='before/after',category=c,severity=s,affected_urls=u,affected_count=n,evidence=e,expected_benefit=b,confidence=co,difficulty=d,recommended_action=a,owner='Repository maintainer' if st=='resolved' else 'Site owner',status=st) for i,c,s,u,n,e,b,co,d,a,st in issues])
write('before-after.md','# Before / after\n\n| Metric | Before | After |\n|---|---:|---:|\n'+''.join(f'| {k} | {base[k]} | {after.get(k)} |\n' for k in base if k!='field_performance')+'''\nP0 root causes: 0 → 0. P1 root causes: 1 → 0 (public entry experience). SEO heuristic: 60 → 90. AI readiness heuristic: 60 → 90. Missing measurement criterion earns zero. The two missing baseline canonicals are appendix and intentional 404; only the appendix is a defect. Utility H1 counts are intentional. Root becomes slide one; overview moves to /overview/; old /1 redirects. Canonical content count remains 21. A single slide may be several clicks deep by sequential controls but overview links every slide directly.\n''')
write('changes.md','''# Changes
- Deck publication adapter makes / the first slide, /overview/ the gallery, /1/ a 301 alias. Resolves local resource URLs before relocation; keeps native print/reading/presenter output.
- Audience CSS removes the bottom utility row, fills viewport width, keeps a compact options menu; visible arrows and the bottom navigation rail were removed at the user’s final request. Phone/tablet content reflows; no navigation overlay covers the content.
- Native viewer respects final fetch URL after redirects for history and resource resolution.
- Refreshed only the investor public-view.css cache through the signed-in Cloudflare dashboard. A fingerprinting attempt was reverted after provider publishing failures; source matches the successful arrow-free release.
- Appendix gains truthful description, canonical, social metadata and WebPage JSON-LD; sitemap includes it.
- Cover mark receives intrinsic dimensions. No narrative, market, funding or traction claims changed; no crawler policy changed.
- All 18 slides captured at desktop/laptop/tablet/mobile; interaction, axe, print and evidence tests retained. Native npm test environment limitations are explicit in verification.md.
''')
write('unresolved.md',f'''# Unresolved / boundaries
- Search performance, field CWV, complete request logs and independent AI citation outcomes: {NA}. Owner access required for measurement, not a claim that site is failing.
- Local resolver retained a negative cache; public resolvers and valid-TLS edge requests succeed. No OS-wide resolver or DNS changes made.
- Full default browser suite depends on unavailable bundled Chromium/WebKit binaries; the installed Chrome/Chromium fallback and Firefox results are recorded separately. Do not label missing environments as passes.
- Optional social image absent; text summary metadata is valid. Commercial placeholders and planning assumptions remain deliberately explicit from the existing deck.
''')
write('recommendations.md','''# Comparable follow-up measurements
Owner-run measurement plan, no scheduled jobs or new accounts created:
- Day 7 (2026-11-16): submit/check sitemap in existing authorized Google/Bing properties; inspect root, reading, appendix and two slide canonicals; rerun exact host/redirect/crawler probes; inspect real request logs if supplied.
- Day 28 (2026-12-07): compare equal 28-day windows for impressions, clicks, CTR, average position, index coverage and referral conversions by page/country/device. Separate launch effects from changes here. Run the six AI questions in fixed fresh sessions; record model/version/date/locale, mentions, exact citations, order and factual accuracy.
- Day 60 (2027-01-08): repeat question set and page cohorts; compare retained artifacts, not anecdotes. Review actual organic landing pages and appendix engagement. Revalidate December campaign claims before updating the deck.
- Day 90 (2027-02-07): repeat full technical crawl and same lab profile plus field CWV where available; review indexed canonicals and measurable investor inquiries. Update only evidence-supported claims.

Keep original CSV field names, query wording and environments; preserve raw provider exports with privacy controls. No guaranteed rankings, indexing or AI citations. Add an approved social preview image if richer sharing cards become a priority. IndexNow is optional, not a requirement for the current small static site.
''')
write('executive-summary.md',f'''# Investor site SEO + AI-search audit
**PASS WITH RECOMMENDATIONS — 2026-11-09**

Audited {after['pages']} generated HTML pages, including 18 primary slides and all supporting editions; {after['indexable']} indexable pages. Baseline preserved before edits. Site previously entered at a gallery with controls below each slide. It now opens on slide one, fills viewport width and uses touch swipes and keyboard navigation without overlay arrows. The overview and all supporting editions remain available from the options menu.

The appendix lacked description/canonical/schema and sitemap inclusion. These are fixed; image dimensions added. No confirmed broken internal/external destinations; blocked third-party responses remain indeterminate. No new commercial or technical claims, no training-policy changes. Relevant evidence: baseline.csv, after.csv, before-after.md, issues.csv, raw/production-probes.json and browser receipts.

Internal SEO/AI-readiness heuristics: 60/100 → 90/100 each; transparent rubric in methodology.md. P0: 0 → 0; P1: 1 → 0. These are technical evidence heuristics, not provider scores or demonstrated ranking gains. Content remains static, readable and linked to original evidence.

Search observation did not return an investor-host listing in the sampled result set; it does not establish indexing status. Search Console, analytics, field CWV, logs and controlled AI visibility: {NA}. Exact 7/28/60/90-day measurement plan in recommendations.md. Source/code changes and tests in changes.md and verification.md.

Published at https://invest.kujolang.ai. Canonical TLS/HTTP and browser behavior tested independently of the build; public DNS worked while the Mac resolver required a documented override. No unresolved production access defect was inferred from that local cache.
''')
# Comparable performance receipt extraction; INP is a field metric, not invented from TBT.
perf=[]
for phase in ['baseline','after','final']:
 p=R/'raw'/f'{phase}-lighthouse.json'
 if p.exists():
  j=json.loads(p.read_text());a=j['audits'];net=a.get('network-requests',{}).get('details',{}).get('items',[]);size=lambda kind:sum(r.get('transferSize',0) for r in net if r.get('resourceType')==kind);perf.append(dict(phase=phase,url=j['finalDisplayedUrl'],template='slide-one',run_date=j['fetchTime'],environment='Local Chrome mobile simulation; shared machine load',lighthouse_version=j['lighthouseVersion'],html_bytes=size('Document'),css_bytes=size('Stylesheet'),js_bytes=size('Script'),image_bytes=size('Image'),font_bytes=size('Font'),requests=a.get('network-requests',{}).get('details',{}).get('items',[]).__len__(),lcp_ms=a['largest-contentful-paint'].get('numericValue',NA),inp_ms=NA,cls=a['cumulative-layout-shift'].get('numericValue',NA),ttfb_ms=a.get('server-response-time',{}).get('numericValue',NA),source=str(p),notes='One lab run; no causal speed claim. Score '+str(j['categories']['performance']['score'])))
if perf:csvout('performance.csv',perf,next(csv.reader((R/'performance.csv').open())))
print('Reports generated')
