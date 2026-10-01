import { defineConfig } from '@playwright/test';
const nativePreview = process.env.PRESENTATION_TEST_HOST === 'kujo';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, workers: 2, timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:8087', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'firefox', use: { browserName: 'firefox' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
  webServer: { command: nativePreview ? 'kujo serve output --port 8087' : 'node tests/static-host.mjs', url: 'http://127.0.0.1:8087/reference/', reuseExistingServer: false }
});
