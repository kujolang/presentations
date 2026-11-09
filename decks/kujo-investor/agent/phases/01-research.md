# Phase 01: Research & Claims Evidence

## Goal
Create a rigorous evidence base for all technical and market claims to prevent hallucination.

## Read before starting
Refer to the "Evidence and guardrails" section of the MEGA PROMPT.

## Scope
- Create `research/CLAIMS.md`.
- Source capabilities from: `kujolang.ai`, docs, GitHub, local compiler, VM, CLI, and specific tools (Dispatch, Workcell, etc.).
- Distinguish between source-inspected, released, and planned features.

## Out of scope
- Designing slides.

## Implementation notes
Every claim must have a source URL, commit hash, or local file path. Explicitly mark missing commercial data as "unavailable."

## Acceptance criteria
- [ ] `research/CLAIMS.md` exists and is populated.
- [ ] All 18 slide topics have at least one verified evidence point.
- [ ] No invented metrics or citations present.

## Suggested checks
- Cross-reference local `RunLedger` and `ShipCheck` functionality with the claims made.

## Handoff requirements
- `research/CLAIMS.md` finalized.