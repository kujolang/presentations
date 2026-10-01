import assert from 'node:assert/strict';

const target = process.argv[2];
if (!target || process.argv.length !== 3) throw Error('Usage: node scripts/verify-showcase-host.mjs https://host/');
const base = new URL(target);
if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || !base.pathname.endsWith('/')) {
  throw Error('Use an HTTPS showcase URL ending in /, without credentials, query, or fragment');
}

const checks = [
  ['', 'text/html'],
  ['sitemap.xml', 'xml'],
  ['assets/site.css', 'text/css'],
  ...['original', 'investor', 'sales', 'live-talk'].flatMap(deck => [
    [`${deck}/`, 'text/html'],
    [`${deck}/1/`, 'text/html'],
    [`${deck}/reading/`, 'text/html'],
    [`${deck}/assets/presentation/viewer.js`, 'javascript'],
  ]),
];
const results = [];
for (const [path, type] of checks) {
  const response = await fetch(new URL(path, base), { redirect: 'manual' });
  assert.equal(response.status, 200, `${path || '/'}: direct URL failed`);
  assert(response.headers.get('content-type')?.includes(type), `${path || '/'}: incorrect MIME type`);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', `${path || '/'}: missing nosniff`);
  if (type === 'text/html') assert(response.headers.get('content-security-policy'), `${path || '/'}: missing enforced CSP`);
  results.push({ path: path || '/', status: response.status, type: response.headers.get('content-type') });
}
console.log(JSON.stringify({ host: base.href, decks: 4, checks: results }, null, 2));
