import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { spawnSync } from 'node:child_process';

const origin = 'https://presentations.kujolang.ai';
const decks = [
  { source: 'examples/reference', id: 'reference', route: 'original', previewSource: 'deployment/previews/original.png' },
  { source: 'decks/kujo-demo-investor', id: 'kujo-demo-investor', route: 'investor', preview: 'investor' },
  { source: 'decks/kujo-demo-sales', id: 'kujo-demo-sales', route: 'sales', preview: 'sales' },
  { source: 'decks/kujo-demo-talk', id: 'kujo-demo-talk', route: 'live-talk', preview: 'live-talk' },
];

for (const deck of decks) {
  const result = spawnSync(
    process.env.KUJO_BIN || 'kujo',
    ['run', 'build.kujo', '--', '--deck', deck.source, '--site-url', `${origin}/${deck.route}/`],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}

const target = '.build/public-site';
rmSync(target, { recursive: true, force: true });
mkdirSync(`${target}/assets/previews`, { recursive: true });
mkdirSync(`${target}/assets/fonts`, { recursive: true });

cpSync('deployment/index.html', `${target}/index.html`);
cpSync('deployment/404.html', `${target}/404.html`);
cpSync('deployment/site.css', `${target}/assets/site.css`);
cpSync('deployment/_headers', `${target}/_headers`);
cpSync('videos/kujo-presentations-promo/assets/generated/kujo-logomark.svg', `${target}/assets/kujo-logomark.svg`);
cpSync('.deps/site-kit/dist/fonts/DepartureMono-Regular.woff2', `${target}/assets/fonts/DepartureMono-Regular.woff2`);
cpSync('videos/kujo-presentations-promo/assets/fonts/captured-inter-latin-400.woff2', `${target}/assets/fonts/inter-latin-400.woff2`);
cpSync('videos/kujo-presentations-promo/assets/fonts/captured-inter-latin-700.woff2', `${target}/assets/fonts/inter-latin-700.woff2`);

for (const deck of decks) {
  cpSync(`output/${deck.id}`, `${target}/${deck.route}`, { recursive: true });
  cpSync(
    deck.previewSource || `videos/kujo-presentations-promo/assets/variants/${deck.preview}/slide-01.png`,
    `${target}/assets/previews/${deck.route}.png`,
  );
}

for (const path of readdirSync(target, { recursive: true }).filter(path => path.endsWith('.css'))) {
  const file = `${target}/${path}`;
  writeFileSync(file, transformSync(readFileSync(file, 'utf8'), { loader: 'css', minify: true, legalComments: 'inline' }).code);
}

const redirects = ['/index.html / 301'];
for (const deck of decks) {
  const routes = ['', 'reading', 'print', 'presenter', ...readdirSync(`output/${deck.id}`).filter(name => /^\d+$/.test(name))];
  for (const route of routes) {
    const base = `/${deck.route}${route ? `/${route}` : ''}`;
    redirects.push(`${base} ${base}/ 301`, `${base}/index.html ${base}/ 301`);
  }
}
writeFileSync(`${target}/_redirects`, `${redirects.join('\n')}\n`);

const urls = [`${origin}/`];
for (const deck of decks) {
  urls.push(`${origin}/${deck.route}/`);
  for (let slide = 1; slide <= 9; slide += 1) urls.push(`${origin}/${deck.route}/${slide}/`);
  urls.push(`${origin}/${deck.route}/reading/`);
}
writeFileSync(
  `${target}/sitemap.xml`,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`,
);
writeFileSync(`${target}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);

console.log(`Public showcase built: ${target} (${decks.length} decks, ${urls.length} indexed routes)`);
