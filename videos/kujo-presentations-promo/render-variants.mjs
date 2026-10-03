import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const project = process.cwd();
const allVariants = [
  ['investor', '#00C2D7'],
  ['sales', '#B21F5B'],
  ['live-talk', '#7447FF'],
  ['editorial', '#FF3C8F'],
];
const requested = new Set(process.argv.slice(2));
const variants = requested.size
  ? allVariants.filter(([variant]) => requested.has(variant))
  : allVariants;
const unknown = [...requested].filter((variant) => !allVariants.some(([name]) => name === variant));
if (unknown.length) throw new Error(`Unknown variant(s): ${unknown.join(', ')}`);
const slideNumbers = Array.from({ length: 9 }, (_, index) => String(index + 1).padStart(2, '0'));
const indexPath = resolve(project, 'index.html');
const originalIndex = await readFile(indexPath, 'utf8');

await mkdir(resolve(project, 'renders'), { recursive: true });

try {
  for (const [variant, accent] of variants) {
    for (const slide of slideNumbers) {
      await copyFile(
        resolve(project, 'assets', 'variants', variant, `slide-${slide}.png`),
        resolve(project, 'assets', 'slides', `slide-${slide}.png`),
      );
    }

    await writeFile(indexPath, originalIndex.replace('--promo-accent: #00C2D7;', `--promo-accent: ${accent};`));

    const result = spawnSync(
      'npx',
      [
        '--yes',
        'hyperframes@0.8.114',
        'render',
        '.',
        '--quality',
        'looks',
        '--skill',
        'product-launch-video',
        '--output',
        `renders/kujo-presentations-${variant}.mp4`,
      ],
      { cwd: project, stdio: 'inherit' },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Render failed for ${variant} with exit ${result.status ?? result.signal}`);
  }
} finally {
  await writeFile(indexPath, originalIndex);
  for (const slide of slideNumbers) {
    await copyFile(
      resolve(project, 'assets', 'variants', 'investor', `slide-${slide}.png`),
      resolve(project, 'assets', 'slides', `slide-${slide}.png`),
    );
  }
}

console.log(`Rendered ${variants.length} Kujo Presentations promo variant${variants.length === 1 ? '' : 's'}.`);
