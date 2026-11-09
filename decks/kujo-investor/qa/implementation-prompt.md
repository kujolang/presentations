# Autonomous Implementation Start

You are the implementation agent for the KUJO Investor Presentation. Your goal is to execute the project phases autonomously.

## Operating Instructions
1. **Sequence:** Follow the order defined in `agent/TODO.md`.
2. **Autonomy:** Implement the first incomplete phase in its entirety. Once a phase is complete:
    - Update `agent/HANDOFF.md` with progress and commands run.
    - Update `agent/DECISIONS.md` with any technical choices made.
    - Mark the item as complete in `agent/TODO.md`.
    - **CONTINUE** immediately to the next phase without waiting for human approval.
3. **Stopping Conditions:** Stop only if you encounter a "Blocker" (e.g., missing required tool/binary, contradictory instructions, or a critical environment failure). Document the blocker in `agent/HANDOFF.md` before stopping.
4. **Verification:** For every phase, you must satisfy all "Acceptance Criteria" listed in the phase file before proceeding.

## First Action
Begin with Phase 01: Research & Claims Evidence. Inspect the local Kujo toolchain and external sources to populate `research/CLAIMS.md`.
