import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('public showcase stages four complete decks behind a collection landing page', () => {
  const root = '.build/public-site';
  const landing = readFileSync(`${root}/index.html`, 'utf8');
  const sitemap = readFileSync(`${root}/sitemap.xml`, 'utf8');
  for (const deck of ['investor', 'sales', 'live-talk', 'editorial']) {
    assert(landing.includes(`href="/${deck}/"`));
    assert(existsSync(`${root}/${deck}/index.html`));
    assert(existsSync(`${root}/${deck}/1/index.html`));
    assert(existsSync(`${root}/${deck}/reading/index.html`));
    assert(existsSync(`${root}/assets/previews/${deck}.png`));
    assert(sitemap.includes(`<loc>https://presentations.kujolang.ai/${deck}/</loc>`));
    assert(!readFileSync(`${root}/${deck}/index.html`, 'utf8').includes('https://example.com/'));
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, 45);
  assert(readFileSync(`${root}/404.html`, 'utf8').includes('noindex,follow'));
});
