# Reviewer Prompt: KUJO Investor Presentation

Evaluate the implemented presentation against the original MEGA PROMPT and the provided design guardrails.

## Required Evaluation Metrics
1. **Overall Score:** (0-100)
2. **Category Scores:**
    - Brand Fidelity (Monochrome/Editorial/No Stock Art)
    - Technical Accuracy (Claims vs. Evidence)
    - Financial Logic (Arithmetic consistency)
    - UX/Navigation (Responsive/Accessibility)
3. **Scope Drift:** Did the agent add unnecessary features or omit required slides/appendix items?
4. **Critical Issues:** List any bugs, broken links, or contrast/overflow problems.
5. **Security/Privacy:** Ensure no secrets or internal keys were leaked into the static build.

## Comparison Analysis
- Compare the final output against the 18-slide sequence requested. Identify any missing or out-of-order slides.
- Verify that no "invented" metrics (ARR, customers) were used.

## Repair Checklist
Provide a step-by-step, actionable checklist for the implementation agent to resolve all identified issues.