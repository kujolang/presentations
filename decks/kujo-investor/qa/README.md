# QA evidence index

Authoritative final deck checks: browser-report.json, browser-refinement.log, visual-report.json, appendix-review.json, external-links.json. Screenshots include all 18 slides at four viewport sizes plus appendix, presenter and reading captures. The three review contact sheets were regenerated from the final slide images. The final appendix-specific screenshots include the corrected 55% allocation display; earlier full-page appendix captures precede that formatting-only correction.

Regression: chromium-regression.log contains 33 passing tests with Chromium 149 headless shell, one worker. The default npm test and system-Chrome regression attempts are retained as failed environment/timing attempts, not passes. Main deck interaction QA uses installed Chrome. Lens PASS evidence is in lens/; the repeat-environment log records a later missing bridge dependency. No Firefox/WebKit pass is claimed.

PackWrite: *-final logs supersede earlier provider/bootstrap attempts. Loop *-final logs supersede earlier same-stage gates; B/D/F original logs remain authoritative. Generated agent documents were updated, then validate and strict doctor rerun successfully. Review decisions are in ../loops/*-review.md.

PDF is supplemental; the native browser deck remains the primary deliverable. These artifacts contain local execution paths and are review evidence, not secrets or credentials. Publish only built static output as described in ../README.md.
