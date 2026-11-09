# Investor social previews — Howl

`../howl.json` is the reviewed manifest: 18 slide cards plus overview, reading,
print, presenter, appendix and not-found cards. Titles use existing slide topics;
taglines use existing headlines. Inputs reference the real deck JSON or appendix,
not invented executable examples. Howl renders text; it does not execute them.

`background.svg` incorporates the official Kujo logomark; the manifest embeds the
existing Departure Mono font. Howl 1.2.0 renders branded 1200×630 SVGs in `generated/`.
Chrome rasterizes those SVGs to PNG in `../assets/social/`; Howl itself remains
offline and unchanged. All 24 cards were visually reviewed in `../qa/social/contact.jpg`.

Run from the presentations repository:

```sh
node scripts/build-investor-social.mjs
node scripts/build-investor-pages.mjs
python3 decks/kujo-investor/scripts/verify-social.py
# After the authorized Pages deployment:
python3 decks/kujo-investor/scripts/verify-social.py --live
```

The Pages builder regenerates cards and writes one matching og:image per HTML
page, including dimensions, MIME type, alt text, secure URL and matching Twitter
summary_large_image metadata. Images use absolute HTTPS URLs and content-hashed
PNG filenames. Preserve previous PNG versions when updating cards so previously
scraped image URLs remain valid. Redirect aliases inherit the destination card;
404 remains a 404 and utility pages keep their existing noindex policy.

Set `HOWL_BIN`, `KUJO`, or `KUJO_BROWSER_PATH` for alternative installed tool paths.
Defaults use sibling Howl/Kujo checkouts and installed Google Chrome. Python QA
uses BeautifulSoup and Pillow. PNG bytes are deterministic in the recorded browser
and font environment; different Chrome versions may produce new image hashes.

Production check uses a Facebook crawler user-agent, verifies all 24 page mappings,
fetches every image, checks actual PNG dimensions/MIME and byte equality with the
published artifact. This does not claim social platforms have refreshed their
own preview caches. Previously shared links can retain old previews until those
services rescrape them. It sends no social posts or preview-debugger submissions.

Evidence: `../qa/social/` includes actual Howl help-derived validate/list/show/
caption/render receipts, clean rebuild checks, local and deployed verification.
The older SEO audit remains immutable; its optional SOCIAL-01 image recommendation
is resolved by this subsequent change.
