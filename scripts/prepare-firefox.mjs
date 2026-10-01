// A narrowly pinned source fix for Firefox's Juggler channel identity collision.
// Deck builds and published output never consume this development-only browser.
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import {mkdir, mkdtemp, readFile, rename, rm} from 'node:fs/promises';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {firefox} from 'playwright';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = join(root, 'patches/firefox-channel-identity/manifest.json');
export const firefoxFix = JSON.parse(readFileSync(manifestPath, 'utf8'));
const fingerprint = createHash('sha256').update(readFileSync(manifestPath)).digest('hex').slice(0, 16);
export const firefoxFixDirectory = join(root, '.build', 'firefox-transport', `${process.platform}-${process.arch}-${fingerprint}`);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function checkPin() {
  if (require('playwright/package.json').version !== firefoxFix.playwrightVersion)
    throw new Error('Playwright changed. Review patches/firefox-channel-identity before updating the browser fix.');
  const playwrightRequire = createRequire(require.resolve('playwright/package.json'));
  const browsers = JSON.parse(readFileSync(join(dirname(playwrightRequire.resolve('playwright-core/package.json')), 'browsers.json'), 'utf8'));
  if (browsers.browsers.find(browser => browser.name === 'firefox')?.revision !== firefoxFix.firefoxRevision)
    throw new Error('Firefox revision changed. Review the channel identity fix before running tests.');
}

export function preparedFirefoxExecutable() {
  checkPin();
  const receiptPath = join(firefoxFixDirectory, 'receipt.json');
  if (!existsSync(receiptPath)) throw new Error('Run npm run prepare:browser before invoking Playwright directly.');
  const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
  if (receipt.patchedSHA256 !== firefoxFix.patchedSHA256 || receipt.originalSHA256 !== firefoxFix.originalSHA256)
    throw new Error('Firefox preparation receipt does not match the reviewed source fix.');
  const executable = resolve(firefoxFixDirectory, receipt.executable);
  if (!existsSync(executable)) throw new Error('Prepared Firefox is missing. Run npm run prepare:browser.');
  return executable;
}

export async function prepareFirefox() {
  checkPin();
  if (existsSync(firefoxFixDirectory)) {
    const receipt = JSON.parse(await readFile(join(firefoxFixDirectory, 'receipt.json'), 'utf8'));
    const archive = await readFile(join(firefoxFixDirectory, receipt.archive));
    if (sha256(archive) === receipt.archiveSHA256 && receipt.patchedSHA256 === firefoxFix.patchedSHA256) {
      const original = await readFile(join(firefoxFixDirectory, 'upstream/main.js'));
      const channel = await readFile(join(firefoxFixDirectory, 'upstream/SimpleChannel.js'));
      if (sha256(original) === firefoxFix.originalSHA256 && sha256(channel) === firefoxFix.channelSHA256)
        return preparedFirefoxExecutable();
    }
    throw new Error('Prepared Firefox integrity check failed. Remove its .build/firefox-transport directory and prepare again.');
  }
  const installed = firefox.executablePath();
  if (!existsSync(installed)) throw new Error('Install the pinned browser first: npx playwright install firefox');
  let sourceRoot, archive;
  if (process.platform === 'darwin') {
    sourceRoot = resolve(dirname(installed), '../..');
    archive = 'Contents/Resources/omni.ja';
  } else if (process.platform === 'linux') {
    sourceRoot = dirname(installed);
    archive = 'omni.ja';
  } else {
    throw new Error('Firefox source-fix preparation is currently verified on macOS and Linux.');
  }
  const parent = dirname(firefoxFixDirectory);
  await mkdir(parent, {recursive:true});
  const temporary = await mkdtemp(join(parent, '.prepare-'));
  try {
    const result = spawnSync('python3', ['-B', join(root, 'scripts/prepare-firefox.py'), sourceRoot, relative(sourceRoot, installed), archive, temporary, manifestPath], {encoding:'utf8'});
    if (result.error) throw new Error(`Python 3 is required for browser test preparation: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`Firefox source fix failed: ${result.stderr.trim()}`);
    try { await rename(temporary, firefoxFixDirectory); }
    catch (error) {
      // Another independent invocation may have completed the same immutable cache.
      if (!['EEXIST','ENOTEMPTY'].includes(error.code)) throw error;
      return await prepareFirefox();
    }
    return preparedFirefoxExecutable();
  } finally { await rm(temporary, {recursive:true, force:true}); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`Prepared Firefox with channel identity fix: ${await prepareFirefox()}`);
}
