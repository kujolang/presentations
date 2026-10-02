import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('public showcase stages four complete decks behind a collection landing page', () => {
  const root = '.build/public-site';
  const landing = readFileSync(`${root}/index.html`, 'utf8');
  const sitemap = readFileSync(`${root}/sitemap.xml`, 'utf8');
  for (const deck of ['original', 'investor', 'sales', 'live-talk']) {
    assert(landing.includes(`href="/${deck}/"`));
    assert(existsSync(`${root}/${deck}/index.html`));
    assert(existsSync(`${root}/${deck}/1/index.html`));
    assert(existsSync(`${root}/${deck}/reading/index.html`));
    assert(existsSync(`${root}/assets/previews/${deck}.webp`));
    assert(existsSync(`${root}/assets/social/${deck}.png`));
    assert(sitemap.includes(`<loc>https://presentations.kujolang.ai/${deck}/</loc>`));
    const deckLanding = readFileSync(`${root}/${deck}/index.html`, 'utf8');
    assert(!deckLanding.includes('https://example.com/'));
    assert(deckLanding.includes(`property="og:image" content="https://presentations.kujolang.ai/assets/social/${deck}.png"`));
    assert(deckLanding.includes('name="twitter:card" content="summary_large_image"'));
  }
  assert(!landing.includes('/editorial/'));
  assert(!landing.includes('Night Shift'));
  assert(!landing.includes('View demo'));
  assert(landing.indexOf('href="/original/"') < landing.indexOf('href="/investor/"'));
  assert(landing.includes('class="page-title"'));
  assert(landing.includes('One presentation layer.'));
  assert(landing.includes('Infinite ways to tell the story.'));
  assert(landing.includes('Vela Investor Briefing'));
  assert(!landing.includes('Signal Foundry'));
  assert(landing.includes('property="og:image" content="https://presentations.kujolang.ai/assets/social/kujo-presentations.png"'));
  assert(readFileSync(`${root}/assets/site.css`, 'utf8').includes('font-size:3.5rem'));
  assert.equal((sitemap.match(/<loc>/g) || []).length, 45);
  assert(readFileSync(`${root}/404.html`, 'utf8').includes('noindex,follow'));
});
