# Kujo investor deck — social slideshow

A source-faithful video of all 18 primary investor slides: 1920×1080, 30 fps, 2:24, eight seconds per slide, clean cuts, silent. Original financial assumptions and diligence qualifications remain visible. No appendix interactions are simulated. Best viewed landscape; viewers can pause to read smaller supporting text. This is the full deck, not a rewritten vertical teaser.

## Delivery

`renders/kujo-investor-1080p.mp4` is the shareable H.264 MP4. It is an export, not a public social post. No upload was performed.

## Reproduce / edit

1. Build the original deck from the repository root: `node scripts/deck.mjs build --deck decks/kujo-investor`.
2. Serve `output/` on localhost:8094.
3. From repository root: `node videos/kujo-investor-slideshow/scripts/capture.mjs`. This captures only the real slide canvas, without browser navigation.
4. `python3 videos/kujo-investor-slideshow/scripts/compose.py` regenerates the ordered eight-second scene timeline.
5. From this directory: `npm run check`, then `npx hyperframes snapshot --review`.
6. `npx hyperframes preview --background --port 3028` opens the editable preview. Timing is in `index.html` and the sub-compositions; the original copy remains in `decks/kujo-investor/deck.json`.
7. `npm run render -- --quality delivery --fps 30 --workers 2 --output renders/kujo-investor-1080p.mp4`.

CLI pinned at HyperFrames 0.9.26. Screenshots are from the official Kujo Presentations output, captured locally in installed Chrome; original mark/font rights are documented in the deck's ASSETS.md and FONT-LICENSE.txt. Registry crossfade options were inspected; clean cuts were chosen to avoid blended small text. Sound is intentionally absent; add licensed music in the sharing app if desired. No generated narration or changed claims.

Verification and deliberate limitations: REVIEW.md and qa/. The check cannot OCR rasterized slide text; visual review is necessary. Social platform recompression and platform-specific upload constraints were not tested.
