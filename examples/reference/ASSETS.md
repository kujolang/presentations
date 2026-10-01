# Reference example assets

The nine compositions follow the user's written reference description. The text
and metrics are fictional demo content.

## Generated artwork

Four images were created for this project with OpenAI Create Image on 2026-10-01.
No source photographs were supplied. The city, people, and studio scenes are
illustrative AI-generated artwork, not documentary photographs.

| File | Scene | Dimensions | Bytes |
| --- | --- | --- | --- |
| city.webp | Imagined city at dusk | 1536 × 1024 | 131,616 |
| collaboration.webp | Fictional media team planning stories | 1536 × 1024 | 91,158 |
| workshop.webp | Cinema camera in a production studio | 1536 × 1024 | 77,908 |
| digital.webp | Audio mixing console | 1536 × 1024 | 67,594 |

The four files total 368,276 bytes (360 KiB). They use WebP quality 76 with metadata
stripped. CSS crops the full-resolution files; no image library or network service
is needed at runtime. The release check enforces a 200 KiB per-image and 400 KiB
combined budget for this example.

[Generation prompts](IMAGE_PROMPTS.md) make the art direction editable.
[media-sources.json](assets/media-sources.json) records dimensions, encoding,
alt text, and SHA-256 hashes. Credits ship with the deck. The generated artwork
is supplied under the project MIT license to the extent applicable; we do not
claim exclusive rights to AI-generated images.

## Other assets

The reference uses Inter for body text and Oswald 700 for slide headings. Oswald
is self-hosted as a 32 KiB WOFF2, converted from the [Google Fonts v57 source](https://fonts.gstatic.com/s/oswald/v57/TK3_WkUHHAIjg75cFRf3bXL8LICs1xZogUE.ttf).
Its [SIL Open Font License](assets/fonts/Oswald-OFL.txt) ships with the font.
The overview title retains SiteKit's Departure Mono typography.

Decorative arrows reuse SiteKit's Tabler `arrow-up-right` symbol. The missing
`plus` symbol is bundled in the presentation layer from the same Tabler v3.46.0
release, with its MIT license. No icon JavaScript or remote asset requests are
needed. See [icon sources](../../assets/icons/README.md).

Inter and Bree Serif licenses remain in `assets/licenses/` at the repository
root and ship under `assets/presentation/licenses/`. SiteKit ships Departure Mono
and Tabler licenses. The Arabic example bundles Noto Sans Arabic with its OFL.
The field-notes SVG is original project artwork. Replacements remain deck-owned.

## Earlier versions

Earlier versions used photographs, first copied from SSG without recorded
photographer permissions and then replaced with credited NASA images. v0.3.0
ships neither set. Replacing the current files does not remove earlier Git
objects or CI screenshots; those must be reviewed before public visibility.
