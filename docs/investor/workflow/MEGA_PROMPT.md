# Kujo Investor Deck — Research, Repositioning, and Production Megaprompt

> **Mission:** Audit, rebuild, and validate the investor presentation at **https://invest.kujolang.ai/** so it accurately represents Kujo's existing technical achievements, a coherent commercial strategy, and a credible $6M fundraising case. Work in the repository, produce a polished deployable result, and leave an auditable record of every substantive claim.
>
> **Important:** This is an execution assignment, not a request for generic pitch-deck advice. Inspect the actual site, source code, linked repositories, and available documentation before changing anything. Never fabricate customers, interviews, usage, revenue, benchmarks, endorsements, partnerships, or dates.

## 0. Operating rules

1. Start by discovering the local repository, framework, build/test commands, deploy configuration, existing slide content, and any accompanying pitch documents. Read `AGENTS.md`, project conventions, and relevant instructions. Do not assume the deck is exactly as described below; the live source of truth is the current repository.
2. Inspect **all slides**, their speaker notes, citations, footnotes, charts, calls to action, and mobile behavior. The earlier deck was approximately 18 slides; preserve a coherent narrative, not an arbitrary slide count.
3. Research the actual Kujo ecosystem from `https://kujolang.ai/`, its documentation and comparison pages, and public `kujolang` GitHub repositories. Prefer local checked-out sources and release artifacts when available. Record repository, commit/tag, date, and evidence URL for each material assertion.
4. Separate **verified facts**, **commercial hypotheses**, **financial scenarios**, and **planned work**. Never visually imply that projections are existing traction. Do not delete material risk disclosures simply to make the story more flattering.
5. Make changes in a feature branch. Preserve existing assets, links, analytics, accessibility, and deployment workflows. Avoid destructive operations or publishing without authorization.
6. Implement the finished presentation and its supporting materials. Run the project's available checks. Report unresolved claims or decisions explicitly rather than silently inventing answers.
7. Use natural, precise developer/founder language. Avoid generic AI copy, three-part slogan endings, repeated “not X, but Y” constructions, and exaggerated superlatives. Confident, evidence-first, readable.

## 1. Business context and intended positioning

Kujo is an AI-native programming language and ecosystem for accountable agentic software development. The broader system includes language/runtime capabilities and tools for orchestration, execution, evidence capture, evaluation, specifications, release assurance, and integrations with existing agent platforms.

The proposed investment thesis is **not** “fund a speculative programming-language prototype.” A significant technical foundation already exists. The capital is intended to accelerate commercialization, developer distribution, enterprise readiness, and the team needed to turn this foundation into durable recurring revenue.

Core positioning to test against actual functionality:

> Kujo helps organizations make agent-driven software work inspectable, repeatable, and accountable across existing workflows. Its open-source ecosystem is a distribution path; its commercial offerings monetize the operational need for reliable, reviewable agent execution.

Do not claim Kujo is the only possible solution or has proven superiority without reproducible comparison evidence. Differentiate clearly between the language, open-source tooling, hosted offerings, and prospective commercial products. Identify the **initial buyer, initial product, initial purchasing trigger, and route to the first $100K ARR**. If these remain undecided, state the leading hypothesis and provide a decision memo rather than making up a definitive answer.

## 2. Existing review notes to address

The investor-deck review raised these specific criticisms:

- **Slide 4:** General AI coding-agent adoption statistics show category growth, not evidence that Kujo's buyers suffer an expensive problem. Replace or supplement them with buyer-specific pain and evidence. Do not invent quotes from platform leads.
- **Slide 8:** The previous demo reportedly relied on an “assistant-authored seeded fixture,” including an investment-calculation example. A staged example is not proof of operational value. Create a compelling, honest, reproducible demonstration of an actual agent-workflow failure, evidence capture, correction, and review. Label fixtures as fixtures; never imply a staged run was a production incident.
- **Slide 10:** “No customer interviews or demand validation” was presented too prominently. Retain truthful stage disclosure, but move detailed gaps into a concise “What we know / What we are testing” treatment and the diligence appendix. Prepare a practical buyer-validation plan.
- **Slide 11:** “Proposals, not available SKUs” confused the product story. Clearly mark **available now**, **pilot/beta**, and **planned** offerings based on verification.
- **Slide 13:** “No exclusivity or benchmark superiority” weakened differentiation. Build a grounded competitive argument around capabilities, interoperability, and evidence portability; do not assert exclusivity or measurable superiority without proof.
- **Slide 15:** “Data not supplied. Complete before investor distribution” is an internal TODO and must not appear in a published investor deck. Replace it with real, dated, attributable engineering and distribution signals. If commercial traction is absent, say so accurately without confusing it with technical momentum.
- **Slide 16:** Founder credentials were understated. Investigate and substantiate leadership of a commercial engineering team, long-term independent shipping, third-party plugin adoption (including the reported WebDevStudios use of 21 plugins), and development of the Kujo language and VM. Do not publish unverifiable numbers.
- **Slide 17 / close:** Clarify the financing ask, milestones, terms and immediate next step. No fabricated close date. The previous deck reportedly specified **$6M at a $30M post-money cap**; treat this as a proposal pending founder confirmation, not a settled market valuation.
- **Across slides:** Repeated disclaimers drown out the claims. Consolidate nonmaterial caveats into a concise diligence section, while retaining material qualifications adjacent to any claim they change.
- **Business model mismatch:** An earlier deck reportedly modeled **100 customers × $24K ACV = $2.4M ARR**, while a later planning discussion modeled **1,000 subscribers × $500/month = $6M ARR**, with enterprise and other products as potential upside. These are **different hypothetical models**, not achieved results. Resolve them into one coherent commercial architecture with a clearly chosen primary wedge and separate sensitivity cases.

The reviewer also recommended lowering the valuation. **Do not automatically do so.** Build an evidence-based fundraising assessment with alternatives and tradeoffs. Preserve the founder's ability to choose terms.

## 3. Required discovery and evidence audit

Create `docs/investor/evidence-register.md` (or equivalent) with a table containing:

| Claim | Exact wording proposed | Evidence/source | As-of date | Confidence | Publicly defensible? | Slide | Action |
|---|---|---|---|---|---|---|---|

Investigate and verify, where possible:

- Kujo language, compiler, VM, runtime features, release history, tests, and contract counts. Use current numbers, not old remembered counts.
- Public repositories and substantive products in the ecosystem. Avoid counting trivial wrappers as distinct commercial products.
- Integrations with Command Code, Hermes, OpenCode, Pi, Claude Code, Cursor, and other platforms: distinguish shipped/working, experimental, in-progress, and aspirational.
- GitHub MCP Directory listing and any other independently verifiable distribution milestones.
- Verified benchmarks, demonstrations, test suites, acceptance runs, and multi-agent experiments (including any claimed 100-agent test). Describe methodology and limitations.
- GitHub releases, unique contributors, stars, download counts, package installs, clones, and usage signals where accessible. Treat clones as noisy, not unique active users. Never substitute cumulative releases for active adoption.
- Existing commercial products, live deployments, pilots, and pricing: establish what is actually purchasable today.
- Founder career and technical execution evidence. Confirm exact team size and third-party adoption before using those figures.
- Competitive capabilities and integration constraints, based on documentation and reproducible tests.

Classify every important fact as **VERIFIED**, **SUPPORTED WITH LIMITATIONS**, **UNVERIFIED**, or **FUTURE PLAN**. Exclude unsupported headline metrics. Provide a source appendix accessible from the deck or diligence package.

## 4. Commercial strategy: resolve the apparent contradiction

Prepare `docs/investor/commercial-strategy.md` that answers:

1. Who is the **first economic buyer**: solo developers, engineering managers, platform leads, security/compliance teams, or enterprises?
2. What painful workflow triggers purchase? What existing budget or tool does the purchase replace or augment?
3. What is the **first paid product** and the minimum complete paid feature set? Is it available, piloted, or planned?
4. How does the open-source language/tool ecosystem generate qualified adoption and conversion without requiring developers to abandon existing stacks?
5. What are the pricing hypotheses and their evidence? Are $500/month self-serve and $24K/year enterprise genuinely aimed at different segments?
6. What are the distribution channels, activation events, conversion steps, onboarding requirements, retention drivers, and unit-economics assumptions?
7. What is the most credible path to **$100K ARR**, then **$1M ARR**, and ultimately the modeled $6M ARR scenario?
8. What would invalidate the current commercial thesis, and what would we do instead?

Build **one primary base case** plus clearly labeled conservative and upside scenarios. Show formulas and assumptions for customer counts, pricing, churn, sales cycle, conversion, gross margin, and time to revenue. Avoid false precision. Keep enterprise and additional-product revenue separate unless there is evidence to include them in the base case.

## 5. Demonstration: show why accountability matters

Replace or improve the current showcase with a truthful engineering demo. Prefer a real, reproducible repository workflow with a genuine failing command or test:

1. Show the agent's task and the initial repository revision.
2. Capture the command executed, output, exit status, relevant environment metadata, and failure.
3. Show what Kujo's existing tools actually record and which component is responsible (e.g., RunLedger, Workcell, Dispatch, Eval, Shipcheck, CaseFile, or others, **only if verified**).
4. Apply a real correction and rerun the relevant check.
5. Show reviewable evidence tied to the revision, commands, and results.
6. Where feasible, run a controlled comparison **without the Kujo workflow** and record actual time/steps/evidence completeness. No made-up efficiency percentages.

Deliver `docs/investor/demo-runbook.md`, reproducible commands, input fixture(s) if used, screenshots/video capture plan, and a short investor-friendly narration. Clearly distinguish a controlled demo from production use. Make the deck understandable without relying on video playback.

## 6. Proposed slide architecture

Rebuild the narrative around the following sequence, adjusting count only if it improves clarity:

1. **Cover:** Kujo — Trust at the speed of AI; clear one-sentence business description.
2. **Problem:** Why agent execution creates an accountability gap.
3. **Why now:** Agent workflows are growing in scope; cite credible, dated market context.
4. **Buyer pain:** Concrete failure/reconstruction workflow and validated or explicitly hypothetical cost.
5. **Solution:** What Kujo does in terms a technical investor and a nontechnical partner both understand.
6. **Architecture:** Language + execution + evidence + assurance + integrations; accurate product boundaries.
7. **Built before investment:** Verified technical assets and shipped milestones.
8. **Proof in action:** A real reproducible workflow with failure, correction, and independently reviewable evidence.
9. **Adoption:** How Kujo enters existing developer workflows; practical distribution wedges.
10. **Initial buyer:** Specific ICP, purchasing trigger, and validation status.
11. **Commercial offering:** Current/pilot/planned SKUs, packaging, and pricing hypotheses.
12. **Business model:** Base case and scenarios, transparently labeled as projections.
13. **Competition:** What alternatives do, where Kujo fits, and which advantages are demonstrated versus proposed.
14. **Go-to-market:** Integration-led distribution, developer activation, buyer conversion, and milestones.
15. **Momentum:** Dated engineering and external adoption signals; commercial traction separately disclosed.
16. **Founder and team:** Verifiable technical/commercial record, missing capabilities, and initial hiring priorities.
17. **Use of funds:** $6M deployment plan, runway, milestones, and financing assumptions.
18. **Ask:** Specific investment conversation, technical diligence offer, next step, and contact details already approved for publication.

Add an appendix or linked diligence pages for assumptions, references, financial model, technical architecture, risks, customer-validation plan, and FAQs. The slide titled **“What we know and what we're testing”** can appear as an appendix slide or be integrated near the commercial model; don't bury a material lack of customer validation.

## 7. Financing and hiring model

Treat the following as **founder discussion inputs requiring confirmation**, not final approved numbers:

- Target raise: **$6,000,000**.
- Earlier proposed valuation: **$30,000,000 post-money**, implying **20%** investor ownership before any additional dilution complexities; distinguish a priced round from a post-money SAFE cap.
- Founder compensation: a later discussion explored **$375,000 total across two years**. The earlier deck may still say **$150,000 annually**. Surface and reconcile this conflict; don't quietly choose.
- Engineering staffing: avoid assuming a $2.4M engineering allocation is mandatory up front. Consider a smaller, staged international engineering team with lawful, competitive compensation and appropriate employment/compliance costs. Earlier founder discussion mentioned possible $50K–$60K annual roles, but do **not** assume any specific individual would accept those rates.
- Prioritize sufficient go-to-market, product design, developer experience, and commercial capacity, alongside engineering and infrastructure.

Create a **24-month budget** with monthly or quarterly cash deployment, hiring sequence, employer/contractor overhead, cloud and model usage, legal/security/compliance, distribution, contingency, and runway. Tie spending to measurable milestones and decision gates. Explain what $6M enables versus a $2M–$3M initial round. Provide a dilution/financing sensitivity table rather than insisting that the $30M cap is justified by technical work alone.

No invented investor commitments, term sheets, close dates, or financial results.

## 8. Customer discovery and commercial evidence plan

Deliver `docs/investor/customer-validation-plan.md` with:

- 10–15 interviews across likely economic buyers, prioritizing platform/engineering leaders running agents in real repositories.
- Interview questions that elicit actual incidents, reconstruction time, audit obligations, budgets, purchase processes, and current alternatives rather than leading respondents toward Kujo.
- A consistent note-taking template and evidence classification.
- Design-partner offer, qualification criteria, success metrics, and conversion milestones.
- A 30/60/90-day validation schedule, owner, and measurable exit criteria.
- A clear instruction that interviews, testimonials, pilots, and quotes **must not be represented as completed until they actually occur**.

If interviews cannot be conducted from the current environment, produce the outreach assets and plan; do not pretend they happened.

## 9. Visual, editorial, and UX direction

- Respect the existing Kujo brand, logo, and design system. Use the **actual** project SVG logo from the official assets; do not substitute a fabricated icon.
- Prefer restrained black/white or dark mechanical visual language, excellent typography, purposeful diagrams, and minimal decoration.
- Keep slides scannable: one primary claim, limited copy, supporting proof, and source access. Avoid dense legalistic footnotes.
- Use clear distinctions for **live / beta / planned**, **observed / projected**, and **verified / hypothesis**.
- Provide mobile-friendly reading mode, desktop presentation mode, keyboard navigation, accessible contrast, reduced-motion support, and sensible print/PDF behavior if supported by the stack.
- Do not make the deck sound like generic venture-capital marketing. Write with the voice of a founder who built the technology and can defend its details.
- Ensure the deck still makes sense if a prospective investor opens a single shared slide without the surrounding narration.

## 10. Technical implementation and quality gates

1. Inspect the existing project and implement changes using its established framework and design patterns.
2. Verify the production build, lint/typecheck, tests, internal/external links, slide navigation, images, metadata, analytics preservation, and accessibility checks where available.
3. Capture representative desktop and mobile screenshots and inspect for clipping, overflow, tiny text, broken assets, and unreadable diagrams.
4. Verify every numeric claim against the evidence register. Spot-check sources independently.
5. Remove all placeholder language: `TODO`, `TBD`, `data not supplied`, `complete before investor distribution`, lorem ipsum, unsupported customer quotes, and mock metrics presented as real.
6. Do not publish or deploy without explicit approval. Provide a preview or local verification instructions.
7. Produce a clear change summary, file list, commands run, test results, and remaining risks.

## 11. Required deliverables

- **Updated investor-deck source** in a reviewable branch, ready for approval and deployment.
- `docs/investor/evidence-register.md` — claims, sources, dates, limitations, and status.
- `docs/investor/commercial-strategy.md` — initial buyer, product wedge, packaging, revenue architecture, and $100K ARR path.
- `docs/investor/financial-model.md` (or machine-readable model) — scenarios, assumptions, 24-month spending plan, financing alternatives.
- `docs/investor/demo-runbook.md` — reproducible real-world demo and capture plan.
- `docs/investor/customer-validation-plan.md` — interviews, pilots, success criteria, and 90-day schedule.
- `docs/investor/investor-diligence.md` — factual risks, open questions, sources, and technical verification instructions.
- `docs/investor/revision-report.md` — before/after slide map, what changed and why, validation results, and outstanding founder decisions.

If this repository uses different documentation conventions, adapt the paths while preserving these deliverables.

## 12. Decisions to surface rather than guess

Flag these for founder approval, with a recommendation and rationale:

1. Is the primary paid wedge hosted agent evidence/assurance, team subscriptions, enterprise deployment, or another verified product?
2. Which pricing model is the **base case**, and what evidence supports it?
3. Is $6M the firm target, and is $30M post-money the opening ask, an internal aspiration, or a negotiable cap?
4. What is the approved 24-month founder compensation figure?
5. Which products and integrations can truthfully be labeled available now?
6. Which traction metrics are approved and reproducible?
7. Which hiring roles and spending allocations are necessary in the first six months?
8. What contact details, investor next step, and fundraising timing are approved for publication?

Proceed with all work that does not depend on these answers. For dependent items, use a clearly labeled proposed treatment in internal drafts, not a fabricated public assertion.

## 13. Final acceptance criteria

The work is complete only when:

- A reader can explain **what Kujo sells, who buys it, why now, and how the business acquires customers**.
- The technical achievement story is substantial, independently checkable, and not confused with commercial traction.
- The demonstration shows a real capability and preserves honest provenance.
- Every material number is sourced or explicitly labeled as a scenario/assumption.
- The $6M use of funds and the proposed valuation are explained, with alternatives and milestone gates.
- Founder credibility is evidenced, not merely asserted.
- The deck ends with a concrete, approved investment ask.
- No internal drafting instructions, fake proof, or misleading omissions remain.
- The site builds successfully, is readable on mobile, and is ready for founder review.

## 14. Execution sequence

**Phase A — Audit:** Inspect the deck, code, docs, releases, and ecosystem. Produce the evidence register and a slide-by-slide gap analysis.

**Phase B — Strategy:** Recommend the commercial wedge, revenue model, financing scenarios, and revised narrative. Explicitly mark decisions needing approval.

**Phase C — Build:** Rewrite and implement the deck, architecture visuals, momentum evidence, demo presentation, and appendix.

**Phase D — Verify:** Recheck claims, run builds/tests, inspect desktop/mobile, validate links, and audit all numbers and labels.

**Phase E — Handoff:** Provide a concise executive summary, before/after mapping, preview instructions, unresolved decisions, and the exact commands/results used for verification.

**Begin now with repository discovery and the evidence audit. Do not stop at a high-level plan. Implement everything that can be completed responsibly without inventing facts or requiring unapproved public deployment.**
