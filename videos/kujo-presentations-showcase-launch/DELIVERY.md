# Kujo Presentations Showcase launch film

This 15-second HyperFrames film announces the Presentations 0.3.0 Showcase launch and introduces its source-backed browser-native deck workflow.

## Deliverables

- `renders/kujo-presentations-showcase-launch.mp4` — complete 1920×1080 film with narration, original procedural music, and synchronized interface effects.
- `renders/kujo-presentations-showcase-launch-silent.mp4` — matching silent picture master.
- `renders/kujo-presentations-showcase-launch-contact-sheet.jpg` — visual review sheet.
- `index.html`, `film.js`, `style.css`, `content.js`, and `timing.js` — editable HyperFrames composition.
- `release.json`, `plan.json`, `claims.json`, `VOICEOVER.md`, and `BRIEF.md` — source facts, narrative plan, claim mapping, script, and production brief.
- `audio/` — original narration takes, music, sound effects, mixed voice, master, cue data, and mix receipt. The ignored `audio/premaster.wav` is reproducible from the included sources.
- `verification/`, `run.json`, `RIGHTS.md`, and `VISUAL-LICENSES.md` — technical checks, run receipt, and rights records.

## Verification

The final build passed the bundled HyperFrames release-video checks on HyperFrames 0.8.116: 15 seconds, 360 frames, full decode, deterministic picture match, seek checks, five ElevenLabs v4 narration cues, browser audio playback, stereo AAC at 48 kHz, −16.05 LUFS, and −2.36 dBTP. HyperFrames reported zero runtime, layout, motion, or contrast errors and 80/80 text contrast checks passed WCAG AA. The final SHA-256 is `64dd6507d7e8323991ab43bf524ec6942232bb27ab32f5f8e1425c2ed741205e`. The project dependency audit reports zero known vulnerabilities.

The contact sheet and five representative snapshots were visually reviewed for grid alignment, clipping, copy, and scene progression. Automated signal checks passed, but the final narration was not independently auditioned in this environment; listen once for voice preference and the spoken `Kujolang.ai` pronunciation before publication.
