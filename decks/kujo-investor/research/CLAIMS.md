# Claims and evidence register

Research cut: 2026-11-09. Release labels refer to repository documentation, not an assertion that every HEAD feature shipped. Pinned README snapshots are retained for review. No commercial traction evidence supplied.

## T01 — kujo
- Claim: VM-first bytecode runtime, compiler and CLI
- Maturity: 1.9.0 release documented
- Source: https://github.com/kujolang/kujo/blob/7a13207019a51e61d3db448bc13f59d5b0e332e5/README.md
- Supporting paths: src/vm.rs; src/compiler.rs; docs/RELEASE_NOTES_1_9_0.md
- Accessed: 2026-11-09; commit: 7a13207019a51e61d3db448bc13f59d5b0e332e5
- Confidence: High for documented scope; local verification only where stated
- Limitations: No complete language safety or live-provider certification claim.

## T02 — dispatch
- Claim: Persisted workflow state, approval gates, retries and recovery
- Maturity: 1.4.1 release documented
- Source: https://github.com/kujolang/dispatch/blob/18b5c737a73904ae942f0bd1c3baa1f77c2bfb40/README.md
- Supporting paths: src; docs/RELEASE_1_4_1.md
- Accessed: 2026-11-09; commit: 18b5c737a73904ae942f0bd1c3baa1f77c2bfb40
- Confidence: High for documented scope; local verification only where stated
- Limitations: Trusted local host; effect assurance beta and participant interoperability alpha are experimental.

## T03 — workcell
- Claim: Disposable Git workspace, Docker/Podman resource bounds, declared exports, receipt verification
- Maturity: 1.3.0 stable local contract documented
- Source: https://github.com/kujolang/workcell/blob/189d7ab6e975301a0e5100b65e8ad3fe4a584573/README.md
- Supporting paths: src; docs/compatibility.md
- Accessed: 2026-11-09; commit: 189d7ab6e975301a0e5100b65e8ad3fe4a584573
- Confidence: High for documented scope; local verification only where stated
- Limitations: Requires pinned runtime and supported host; no compromised-host protection. Remote adapters alpha, not certified here.

## T04 — eval
- Claim: Deterministic checks and machine-readable evaluation results
- Maturity: source inspected; local demo separately verified
- Source: https://github.com/kujolang/eval/blob/c1b263a10702c2fa8ab61ed507029a6bfec2e03d/README.md
- Supporting paths: main.kujo; src; examples/agent_output.json
- Accessed: 2026-11-09; commit: c1b263a10702c2fa8ab61ed507029a6bfec2e03d
- Confidence: High for documented scope; local verification only where stated
- Limitations: Only configured checks; no proof of semantic correctness or independent attestation.

## T05 — spec
- Claim: Task contracts and acceptance criteria
- Maturity: 1.0.2 release documented
- Source: https://github.com/kujolang/spec/blob/36da0d7216587809e32dedb91dee3cf4b9e50af1/README.md
- Supporting paths: src; README.md
- Accessed: 2026-11-09; commit: 36da0d7216587809e32dedb91dee3cf4b9e50af1
- Confidence: High for documented scope; local verification only where stated
- Limitations: A contract does not enforce all runtime boundaries.

## T06 — runledger
- Claim: Local JSON run receipts, supplied commands/results and Git facts
- Maturity: 1.2.1 release documented
- Source: https://github.com/kujolang/runledger/blob/ab0ec5d2edb7ffd913f48d092aa6fc17cab58d13/README.md
- Supporting paths: runledger.kujo; README.md
- Accessed: 2026-11-09; commit: ab0ec5d2edb7ffd913f48d092aa6fc17cab58d13
- Confidence: High for documented scope; local verification only where stated
- Limitations: Does not execute or independently prove recorded tests.

## T07 — shipcheck
- Claim: Explicit release-readiness scans and CI gates
- Maturity: 1.0.2 production-forward alpha
- Source: https://github.com/kujolang/shipcheck/blob/7eedd9e02d8730d65e06e16f4984d909d23539bc/README.md
- Supporting paths: shipcheck.kujo; README.md
- Accessed: 2026-11-09; commit: 7eedd9e02d8730d65e06e16f4984d909d23539bc
- Confidence: High for documented scope; local verification only where stated
- Limitations: Not release certification; a human decides to ship.

## T08 — casefile
- Claim: Capture executed command output and exit code into debugging bundles
- Maturity: 1.0.2 documented; demo locally verified
- Source: https://github.com/kujolang/casefile/blob/92e1d9bee2faaba322476e82dcea7510850885e0/README.md
- Supporting paths: casefile.kujo; FLAGS.md
- Accessed: 2026-11-09; commit: 92e1d9bee2faaba322476e82dcea7510850885e0
- Confidence: High for documented scope; local verification only where stated
- Limitations: Trusted local host, bounded/redacted logs; successful capture can contain failed command.

## T09 — watchdog
- Claim: OpenAI-compatible proxy and local telemetry database/dashboard
- Maturity: 1.2.2 release documented
- Source: https://github.com/kujolang/watchdog/blob/7a0bd9a63d68421831ed66d6eed29805c48e1b24/README.md
- Supporting paths: README.md; docs/DEPLOYMENT_HARDENING_RUNBOOK.md
- Accessed: 2026-11-09; commit: 7a0bd9a63d68421831ed66d6eed29805c48e1b24
- Confidence: High for documented scope; local verification only where stated
- Limitations: Estimated costs are not invoices. Authentication/TLS/retention are deployment responsibilities.

## T10 — kennel
- Claim: Kujo package manifests, resolution and installation
- Maturity: source inspected
- Source: https://github.com/kujolang/kennel/blob/6e2fc20560037970df5202e1b1ca8f61c3395570/README.md
- Supporting paths: src/resolver.kujo; src/installer.kujo
- Accessed: 2026-11-09; commit: 6e2fc20560037970df5202e1b1ca8f61c3395570
- Confidence: High for documented scope; local verification only where stated
- Limitations: Package distribution is not adoption evidence.

## T11 — mcp
- Claim: Kujo MCP server framework and guarded repo scaffolding
- Maturity: 1.3.3 release documented
- Source: https://github.com/kujolang/mcp/blob/77180a3a6c104f0c5b185cefa1f6d0835edb704b/README.md
- Supporting paths: src; README.md
- Accessed: 2026-11-09; commit: 77180a3a6c104f0c5b185cefa1f6d0835edb704b
- Confidence: High for documented scope; local verification only where stated
- Limitations: Remote deployments need ingress/auth/capacity review; not blanket agent integration.

## T12 — packwrite
- Claim: Compiles prompt/context into validated agent execution packs
- Maturity: 1.1.1 installed
- Source: https://github.com/kujolang/packwrite/blob/b8467535c74263abc59fd3f48028b67d42cd7e68/README.md
- Supporting paths: src/ai.kujo; src/pack.kujo; src/validate.kujo
- Accessed: 2026-11-09; commit: b8467535c74263abc59fd3f48028b67d42cd7e68
- Confidence: High for documented scope; local verification only where stated
- Limitations: Does not implement the project. Provider availability depends on credentials/model.

## T13 — kujo-workflows
- Claim: Portable bounded execution/evaluation workflow harness
- Maturity: source inspected; task gates run locally
- Source: https://github.com/kujolang/kujo-workflows/blob/d766eae4fd9a131e51c34796d029fd3bc6974689/README.md
- Supporting paths: loop-engineering/scripts/run-workflow.sh
- Accessed: 2026-11-09; commit: d766eae4fd9a131e51c34796d029fd3bc6974689
- Confidence: High for documented scope; local verification only where stated
- Limitations: Bash harness records/gates actions; editorial judgment is performed by this assistant, not a built-in investor judge.

## T14 — presentations
- Claim: Kujo SSG/SiteKit static deck rendering, notes console, print/read editions
- Maturity: 0.3.1 preview; built locally
- Source: https://github.com/kujolang/presentations/blob/879211bbf3707ec1ec6a9e19bb9ce2b1f9691bfa/README.md
- Supporting paths: src/render.kujo; docs/presentation-features.md
- Accessed: 2026-11-09; commit: 879211bbf3707ec1ec6a9e19bb9ce2b1f9691bfa
- Confidence: High for documented scope; local verification only where stated
- Limitations: Preview APIs may change; fixed 16:9 canvas needs reading edition on small screens.

## M01
- Claim: 84% of respondents use or plan to use AI development tools; 46% distrust output accuracy
- Source: https://survey.stackoverflow.co/2025/ai
- Published: 2025 survey; accessed 2026-11-09
- Confidence: High for cited text; Medium for generalization; assumptions unvalidated.
- Limitations: Self-selected survey; different question denominators (33,662 usage; 33,244 trust). Neither statistic measures autonomous production deployment.

## M02
- Claim: 52% do not use agents or use simpler tools
- Source: https://survey.stackoverflow.co/2025/ai
- Published: 2025 survey; accessed 2026-11-09
- Confidence: High for cited text; Medium for generalization; assumptions unvalidated.
- Limitations: Agent question includes work beyond development; 31,877 responses. Do not imply remaining respondents all run production agents.

## C01
- Claim: Copilot offers agentic tasks, code review and session continuity
- Source: https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github
- Published: 2026-10-28 availability noted; accessed 2026-11-09
- Confidence: High for cited text; Medium for generalization; assumptions unvalidated.
- Limitations: Strong incumbent distribution and existing review controls. No superiority benchmark.

## C02
- Claim: LangGraph checkpoints support interruption/recovery and human review
- Source: https://docs.langchain.com/oss/python/langgraph/persistence
- Published: Undated living documentation; accessed 2026-11-09
- Confidence: High for cited text; Medium for generalization; assumptions unvalidated.
- Limitations: Application-specific persistence and idempotency remain important; not a complete release approval system by itself.

## F01
- Claim: Robert DeVore describes years of WordPress/WooCommerce work and current Kujo infrastructure
- Source: https://robertdevore.com/about/
- Published: Undated first-person biography; accessed 2026-11-09
- Confidence: High for cited text; Medium for generalization; assumptions unvalidated.
- Limitations: Self-reported; no invented employers, tenure counts, employees, advisors, or security credentials. Ecosystem output may include collaborators and AI assistance.

## P01
- Claim: Financing, commercial model, December 2026 campaign and customer targets
- Source: MEGA_PROMPT.md
- Published: 2026-11-09 assignment; accessed 2026-11-09
- Confidence: High for cited text; Medium for generalization; assumptions unvalidated.
- Limitations: User-provided scenario / analyst assumptions. No agreed financing, validated valuation or customer interviews.

## Discovery and brand
Inspected official website via HTTP (web reader failed twice), docs root, GitHub org, releases, tooling, showcases (HTTP fallback), and workflows collection. Docs release inventory is dated 2026-10-22; local repositories can be newer. SiteKit source uses #060606, #ffffff, gray surfaces, monospace typography and Departure Mono. Original official kujo-logomark.svg and Departure Mono copied unchanged from website checkout. No invented brand accent.

## Evidence relationship
CaseFile runs and captures the command; Eval evaluates configured conditions; RunLedger stores user-supplied outcomes. This deck demonstrates CaseFile plus Eval via an explicit local script, not a universal turnkey integration, cryptographic attestation, Workcell isolation, or production agent deployment. Benchmark is a correctness fixture, not a speed or competitor benchmark.

## C03 / C04 — existing infrastructure
OpenTelemetry documents telemetry signals and instrumentation: https://opentelemetry.io/docs/ (living docs, accessed 2026-11-09). GitHub Actions documents repository automation/CI workflows: https://docs.github.com/en/actions (living docs, accessed 2026-11-09). High confidence for documented purpose; no comparative benchmark or exclusive Kujo capability inferred.

## M03 / M04 — current 2026 survey, supersedes 2025 slide data
- Claims: 65.9% use AI coding assistants or coding agents at work; 26.2% use AI agents or automated workflows. Usage question n=17,464, multi-select, overlapping categories. Separate trust question n=14,304: 6,872 respondents (48.0%) trust when output is easy to verify.
- Sources: https://survey.stackoverflow.co/2026/ai/data/ai-select and https://survey.stackoverflow.co/2026/ai/data
- Published: results released 2026-10-06 (https://stackoverflow.blog/2026/10/06/the-results-of-the-2026-developer-survey-are-here); accessed 2026-11-09.
- Confidence: High for exact usage and trust tables; limited generalizability from self-selected respondents.
- Limitations: Coding assistants include agents; workflow category overlaps. Do not sum, infer production deployment, or compare directly to 2025's different questions. M01/M02 retained as historical research only, removed from production slide. Attribution: Stack Exchange Inc. (2026), Stack Overflow Developer Survey; data ODbL 1.0.
