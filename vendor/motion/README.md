# Motion mini browser bundle

Generated from `motion@13.4.6` through the public `motion/mini` and `motion` exports with
`esbuild@0.25.12`. Exact transitive versions are recorded in package-lock.json.
Run `npm ci && npm run bundle:motion` from the repository root to reproduce it.

Source/API: https://motion.dev/docs/animate
Motion, motion-dom, and motion-utils use LICENSE.md. Included framer-motion
code uses LICENSE-framer-motion.md. Both are MIT licensed.

This directory is copied only when a deck opts into transitions. It is served
locally and imported lazily; no CDN connection is required.

The hybrid bundle supplies animate, stagger, and frame for optional content choreography; baseline effects load only the mini bundle.
