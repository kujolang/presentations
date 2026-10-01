import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: true, workers: 2, timeout: 120000,
  use: { baseURL: 'http://127.0.0.1:8086', viewport: { width: 1440, height: 1000 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'firefox', use: { browserName: 'firefox' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
  webServer: { command: 'kujo serve output --port 8086', url: 'http://127.0.0.1:8086/reference/', reuseExistingServer: !process.env.CI }
});
