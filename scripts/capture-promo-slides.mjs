import { createServer } from 'node:http';
import { copyFile, mkdir, readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

const targets = [
  ['kujo-demo-investor', 'investor'],
  ['kujo-demo-sales', 'sales'],
  ['kujo-demo-talk', 'live-talk'],
  ['kujo-demo-editorial', 'editorial'],
];

const outputRoot = await realpath('output');
const destinationRoot = resolve('videos/kujo-presentations-promo/assets/variants');
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const server = createServer(async (request, response) => {
  try {
    let path = resolve(outputRoot, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    path = await realpath(path);
    if (!path.startsWith(`${outputRoot}${sep}`)) throw new Error('Outside output root');
    response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});

await new Promise((done, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', done);
});

const browser = await chromium.launch();
try {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const origin = `http://127.0.0.1:${server.address().port}`;

  for (const [deck, variant] of targets) {
    const destination = resolve(destinationRoot, variant);
    await mkdir(destination, { recursive: true });
    for (let slide = 1; slide <= 9; slide += 1) {
      await page.goto(`${origin}/${deck}/${slide}/`, { waitUntil: 'networkidle' });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((image) => image.decode()));
      });
      const canvas = page.locator('.p-canvas');
      await canvas.screenshot({ path: resolve(destination, `slide-${String(slide).padStart(2, '0')}.png`) });
    }
  }

  for (let slide = 1; slide <= 9; slide += 1) {
    await copyFile(
      resolve(destinationRoot, 'investor', `slide-${String(slide).padStart(2, '0')}.png`),
      resolve('videos/kujo-presentations-promo/assets/slides', `slide-${String(slide).padStart(2, '0')}.png`),
    );
  }
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}

console.log(`Captured ${targets.length * 9} fullscreen slide images in ${destinationRoot}`);
