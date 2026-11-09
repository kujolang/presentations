# Changes
- Deck publication adapter makes / the first slide, /overview/ the gallery, /1/ a 301 alias. Resolves local resource URLs before relocation; keeps native print/reading/presenter output.
- Audience CSS removes the bottom utility row, fills viewport width, keeps a compact options menu; visible arrows and the bottom navigation rail were removed at the user’s final request. Phone/tablet content reflows; no navigation overlay covers the content.
- Native viewer respects final fetch URL after redirects for history and resource resolution.
- Refreshed only the investor public-view.css cache through the signed-in Cloudflare dashboard. A fingerprinting attempt was reverted after provider publishing failures; source matches the successful arrow-free release.
- Appendix gains truthful description, canonical, social metadata and WebPage JSON-LD; sitemap includes it.
- Cover mark receives intrinsic dimensions. No narrative, market, funding or traction claims changed; no crawler policy changed.
- All 18 slides captured at desktop/laptop/tablet/mobile; interaction, axe, print and evidence tests retained. Native npm test environment limitations are explicit in verification.md.
