import { defineConfig } from '@playwright/test';
import {preparedFirefoxExecutable} from './scripts/prepare-firefox.mjs';
const port = Number(process.env.PRESENTATION_TEST_PORT || 8087);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid test port');
const nativePreview = process.env.PRESENTATION_TEST_HOST === 'kujo';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, workers: 2, timeout: 120000,
  use: { baseURL: `http://127.0.0.1:${port}`, viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'firefox', use: { browserName: 'firefox', ...(process.env.PRESENTATION_STOCK_FIREFOX === '1' ? {} : {launchOptions: {executablePath: preparedFirefoxExecutable()}}) } }, { name: 'webkit', use: { browserName: 'webkit' } }],
  webServer: { command: nativePreview ? `kujo serve output --port ${port} --access-log` : 'node tests/static-host.mjs', env: { PORT: String(port) }, url: `http://127.0.0.1:${port}/reference/`, reuseExistingServer: false }
});
