# Reproducible performance checks

Run `npm run benchmark` for deterministic 10/100/500-slide, text-only decks.
The script records full native build wall time, `/usr/bin/time` maximum resident
set size, output bytes, Chromium overview readiness, and 60 scrolling frames.
Results include machine details in `docs/evidence/benchmarks.json`. Memory is the
OS-reported maximum, not a sum of every process's simultaneous allocations.
These fixtures do not predict the cost of a photograph-heavy custom theme.

The original page adapter exceeded its ten-minute SSG timeout at 100 slides.
That failed baseline is retained in `benchmarks-before.json`. The final adapter
uses SSG's public post route/template contracts for numbered slides, hides
utility pages from website navigation, and invokes SSG with Kujo's supported
`--interpreter` flag. A regression fixture compares every generated file against
the VM result byte for byte. No runtime or SSG source was patched.

On this machine, a ten-slide SSG probe took about 28 seconds through the VM and
0.29 seconds through the interpreter, with 39 identical output files. This is an
observed execution-mode difference, not a diagnosed compiler defect or a universal
speed ratio. The full adapter benchmark includes validation, rendering, copying,
locking and publication, so its time is higher than that isolated SSG probe.

Overview thumbnails use `content-visibility: auto` to defer offscreen layout and
painting. The reading edition remains ordinary accessible HTML. Inspect real
image-heavy decks separately; do not turn these text fixtures into a marketing
claim about all presentations.

The checked-in budgets are conservative regression limits, not latency promises.
CI runs all three sizes. Change a budget only with recorded measurements and an
explanation; never raise it merely to hide a failed run.
