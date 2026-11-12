# Investor revision report — 2026-11-11

Publication update: after visual review, the founder explicitly authorized merging to main and updating invest.kujolang.ai. Deployment receipts and live verification are in verification/production-20261111/. Statements below about pending publication describe the original handoff; business and financing assumptions remain proposals.

Result: founder-review draft implemented; publication and approved financing ask remain gated. Branch `investor/evidence-commercial-20261111`, baseline `40af624181b8d82b157095070e3e62c2d60789b0`. No deployment, external outreach or DNS/CDN mutation performed. Existing production site remains the November 9 version.

## Narrative and artifacts
18 slides retained. Category-growth statistics replaced with specific review/reconstruction pain; no invented buyer cost. Primary commercial proposal is shared team evidence/review at $500/month, enterprise separate. Source-backed engineering and a GitHub MCP Registry listing are distinguished from commercial traction. WebDevStudios plugin adoption is independently attributed; the number 21 and exact team-leadership scope remain excluded. Financing is proposed and compensation conflict explicit. A checkout regression replaces the finance arithmetic demonstration; real CaseFile/Eval runs and unchanged tests are retained. All current presenter notes and social cards follow the revised narrative.

| Slide | Before | After / reason |
|---|---|---|
| 1 | Trust at the speed of AI. | Trust at the speed of AI. |
| 2 | Software production is outpacing verification. | Software production is outpacing verification. |
| 3 | Greater autonomy requires stronger accountability. | Agents now work across the repository. |
| 4 | AI use is broad. Trust remains conditional. | A passing summary can hide a failed checkout. |
| 5 | Build with clarity. Operate with control. | Build with clarity. Operate with control. |
| 6 | Accountability spans the whole task. | Accountability spans the whole task. |
| 7 | The foundation is already being built. | A working foundation precedes this raise. |
| 8 | A claim becomes inspectable evidence. | Keep the failure. Verify the correction. |
| 9 | Adopt the ecosystem before the language. | Adopt the ecosystem before the language. |
| 10 | Start with teams already delegating engineering work. | Start with the platform engineering lead. |
| 11 | Open tooling can lead to a commercial operating layer. | Open tools today. A team service to validate. |
| 12 | A focused entry market can support a meaningful business. | One team subscription. Explicit revenue milestones. |
| 13 | Accountability requires more than generating code. | Portable evidence across existing workflows. |
| 14 | Meet developers inside their existing workflows. | Turn a first evidence run into a retained team. |
| 15 | Execution is visible. Demand still needs proof. | Public engineering and distribution are visible. |
| 16 | Built through sustained open-source engineering. | A founder with a public shipping record. |
| 17 | Capital turns a technical foundation into an adopted platform. | Fund commercialization with staged commitments. |
| 18 | Agents will build more software. | Discuss the raise. Inspect the evidence. |

## Required deliverables
- evidence-register.md and evidence/source-provenance.json: claims, classifications, pinned repositories, exact retrieval receipts and limitations.
- commercial-strategy.md: buyer, trigger, minimum product, funnel, unit economics and invalidation gates.
- financial-model.md/.json and quarterly-budget.csv: scenarios, staged cash plan, founder-compensation ambiguity and financing alternatives.
- demo-runbook.md, demo/ and public checkout-evidence/: repeatable failure, correction, unchanged tests and hashes.
- customer-validation-plan.md: 12 interviews, scoped partner offer, outreach drafts, consented notes and 30/60/90-day gates; nothing sent.
- investor-diligence.md: risks and eight founder decisions; linked public diligence text and appendix.
- workflow/: attached prompt, PackWrite manifest, prompts and validation receipts.
- ../../seo-audit/2026-11-11/: sealed baseline, full inventory, production probes, before/after, current guidance and measurement plan.

## Verification and limitations
- `node scripts/deck.mjs check --deck decks/kujo-investor --ready`: passed.
- `node scripts/build-investor-pages.mjs`: passed before and after; 24 social cards regenerated; static publication artifact `.build/investor-pages`.
- `node docs/investor/scripts/verify.mjs`: passed; model totals, ARR arithmetic, notes contract, placeholder gate, demo hashes/child exit statuses and schema.
- `node docs/investor/scripts/qa.mjs`: passed; all 18 slides at desktop/laptop/tablet/mobile sizes, native modes, evidence panels, financial controls, keyboard, reduced motion, focus, no detected overflow or axe violations. Desktop/mobile contact sheets visually inspected; PDF exported by native print path.
- `node docs/investor/scripts/public-qa.mjs`: passed on publication-adapter routes at desktop/mobile, no axe violations or horizontal overflow; keyboard navigation passed. Final screenshot of funding slide and mobile appendix inspected.
- `npm test`: build/contract/Node/start-smoke checks passed; initial browser run had 33 Chromium launch failures because its binary was missing, 64 Firefox/WebKit tests passed, 2 fullscreen tests skipped. Installed pinned Chromium/WebKit binaries, then `npx playwright test --project=chromium`: 33 passed. Combined completed browser coverage: 97 passed, 2 pre-existing skips. Do not call the initial npm command a pass.
- Loop Engineering initial run failed whitespace gates; fixed whitespace and retained original evidence. `.loop-engineering/verified/SUMMARY.md`: success for all four local gates. This is local verification, not founder approval.
- PackWrite provider calls failed and strict doctor reports missing API key. The documented offline interface compiled an explicitly assistant-authored manifest (Provider/Model: fake); pack validation passed with zero warnings on final validation. This is not a successful live-provider generation. Existing prior agent pack left intact.
- SEO: 24 generated pages, 21 indexable; no missing titles/descriptions/canonicals or broken internal links; no image-alt/dimension defects. WebPage schema on all indexable pages. Overview multiple H1s are inert/aria-hidden thumbnails. Production canonical host and crawlers responded; redirect chains retained; www.invest unavailable. No updated production verification because deployment is excluded.

## Reproduce and preview
From repository root, with documented Kujo/SSG/SiteKit dependencies and npm dependencies installed:

```sh
node scripts/deck.mjs check --deck decks/kujo-investor --ready
python3 decks/kujo-investor/scripts/appendix.py
node scripts/build-investor-pages.mjs
node docs/investor/scripts/verify.mjs
python3 docs/investor/scripts/preview.py .build/investor-pages 8097
```

Open http://127.0.0.1:8097/ (publication adapter), /reading/ or /assets/deck/appendix. Native QA uses output/ served on 8094, as documented in scripts/qa.mjs. Do not rerun historical author.py; direct deck.json and notes are canonical. Appendix reads current investor docs. The sealed baseline is outside .build and survives rebuilds.

## Remaining founder decisions
The eight decisions in investor-diligence.md are open. The final acceptance condition of a concrete approved financing ask is not met until founder approval. Hosted service and pilot readiness need actual product/customer work outside this presentation assignment. No exact team size or 21-plugin count verified. Search-console, analytics, log, field performance and AI-citation data require authorized access. Plan/recommendation documents are delivered, not evidence those activities occurred. SignalBox: no captures warranted; surviving commercial decisions and access needs are explicitly scoped owner follow-up, not new engineering findings.
