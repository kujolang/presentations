# Phase 00: Project Brief

## Goal
Initialize the project environment and verify the Kujo Presentations toolchain.

## Read before starting
Review the MEGA PROMPT to understand the sophisticated target audience (VCs) and the strict brand guidelines.

## Scope
- Toolchain verification (`doctor --strict`).
- Folder structure setup.
- Baseline demo run.

## Out of scope
- Writing actual slide content.

## Implementation notes
Use `packwrite` to inspect help/docs and ensure the local environment is capable of compiling the native static builder.

## Acceptance criteria
- [ ] `doctor --strict` runs without critical errors.
- [ ] Demo presentation builds and renders in browser.
- [ ] Project directory structure initialized.

## Suggested checks
- Check if `kujolang.ai` and docs are accessible for reference.

## Handoff requirements
- Confirm environment readiness in `agent/HANDOFF.md`.