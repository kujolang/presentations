import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { transformSync } from 'esbuild';
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.env.KUJO_BIN || 'kujo', ['run', 'build.kujo', '--', '--site-url', 'https://presentations.robertdevore.com'], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
const target = '.build/public-site';
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync('output/reference', target, { recursive: true });
cpSync('deployment/_headers', `${target}/_headers`);
// Minify deployment CSS without changing the authored themes or reusable output.
for (const path of readdirSync(target, { recursive: true }).filter(path => path.endsWith('.css'))) {
  const file = `${target}/${path}`;
  writeFileSync(file, transformSync(readFileSync(file, 'utf8'), { loader: 'css', minify: true, legalComments: 'inline' }).code);
}
// Explicit permanent aliases take precedence over the host's temporary HTML redirects.
const routes = ['', 'reading', 'print', 'presenter', ...readdirSync('output/reference').filter(name => /^\d+$/.test(name))];
const redirects = routes.flatMap(route => {
  const base = route ? `/${route}` : '';
  return [...(route ? [`${base} ${base}/ 301`] : []), `${base}/index.html ${base}/ 301`];
});
writeFileSync(`${target}/_redirects`, redirects.join('\n') + '\n');
