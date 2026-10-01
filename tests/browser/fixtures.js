import {test as base, expect} from '@playwright/test';

// Juggler can omit navigationCommitted after reusing a Firefox process across
// contexts (see docs/firefox-fullscreen-review.md). Isolate the process, not the
// assertions: requests still go directly to the hardened native server.
export const test = base.extend({
  isolatedBrowser: async ({browser, browserName, playwright, launchOptions, headless, channel}, use) => {
    if (browserName !== 'firefox' || process.env.PRESENTATION_SHARED_FIREFOX === '1') { await use(browser); return; }
    const isolated = await playwright.firefox.launch({...launchOptions, headless, ...(channel ? {channel} : {})});
    try { await use(isolated); } finally { await isolated.close(); }
  },
  context: async ({isolatedBrowser, contextOptions, baseURL, viewport, javaScriptEnabled}, use) => {
    const context = await isolatedBrowser.newContext({...contextOptions, baseURL, viewport, javaScriptEnabled});
    try { await use(context); } finally { await context.close(); }
  }
});
export {expect};
