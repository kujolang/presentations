# Video review — 2026-11-09

Source-faithful 18-slide slideshow, no new narrative. All source slides are real browser captures. One scene per slide, eight-second reading holds and clean cuts. No teaser, vertical rewrite, soundtrack or voiceover was added.

First visual pass found native motion controls overlaying the bottom of some captured slides. Capture CSS now hides navigation/help/status outside the slide; all 18 images were regenerated. Second pass reviewed the actual composition midpoint captures for all slides, plus full-resolution opening/problem frames. No text cropping or leftover controls observed. Main titles and figures remain readable at landscape size. Small citation/supporting text is the weakest phone-sized element; viewers should rotate or pause. Improving portrait readability requires a separate content rewrite, beyond preserving the deck.

Full HyperFrames check passed with no errors. One deliberate warning: film_silent; the silent deck preserves the requested slide-through and leaves soundtrack choice to the sharing app. Final preflight reran lint/runtime/layout/contrast after the capture correction; craft was not repeated because timing and intentional silence were unchanged. Contrast audit checked zero raster-text nodes: no claim of automated text contrast certification. The original presentation's accessibility evidence is separate.

Review sheets include original slide claims and explicit assumptions; no interaction is implied by the MP4. No publication/upload performed. Final encode must additionally pass ffprobe duration/codec/frame-count checks and decoded-frame comparison against every captured slide; see qa/verification.json when available.

Final encode verified: 144.000 seconds, 4,320 frames, 1920×1080, 30 fps, H.264/yuv420p, progressive-download metadata, 1,750,286 bytes, zero audio streams. Every slide midpoint and the first/last frames matched the source within the 3/255 mean absolute pixel-error threshold. Representative decoded funding frame visually inspected. All 18 slides retain their ordering; no blank lead-in/tail. `qa/verification.json` records individual comparisons and SHA-256.

Repository `npm test` was attempted: build/contracts/Node/starter stages completed, 31 browser tests passed, one skipped, and the matrix failed. 66 failures were unavailable pinned Chromium/WebKit binaries; Firefox hosting exposed a data-URI favicon blocked by strict CSP. Replaced the data URI with a same-origin transparent SVG favicon and extended the existing hosting test to verify its MIME type. Targeted Firefox hosting regression now passes, static contracts pass, and the investor deck rebuild passes. No full browser-matrix pass is claimed. This does not affect the verified local MP4.

SignalBox: no captures warranted. The discovered application defect was resolved; missing browser binaries are an already disclosed local verification limit.
