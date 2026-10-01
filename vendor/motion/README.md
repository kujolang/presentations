# Local Motion bundles

Generated from `motion@13.4.6` through its public `motion/mini` and `motion`
exports with `esbuild@0.25.12`. `package-lock.json` records transitive versions.
To rebuild from the repository root, run:

```sh
npm ci && npm run bundle:motion
```

The [animate API documentation](https://motion.dev/docs/animate) describes the
public API. Motion, motion-dom, and motion-utils use `LICENSE.md`. Included
framer-motion code uses `LICENSE-framer-motion.md`. Both licenses are MIT.

Only decks with transitions enabled copy these bundles into their output.
The browser imports them from local files when needed; no CDN is required.
Baseline effects load the mini bundle. Coordinated content animations use the
hybrid bundle's `animate`, `stagger`, and `frame` exports.
