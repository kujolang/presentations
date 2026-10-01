import { expect } from '@playwright/test';

// Check the resources we use rather than a browser-wide load event. Firefox can
// leave that event pending after the document, styles and deferred viewer arrive.
export async function openPage(page, url) {
  await page.goto(url, { waitUntil: 'commit' });
  await expect(page.locator('main')).toBeVisible();
  await expect.poll(() => page.evaluate(() =>
    [...document.querySelectorAll('link[rel="stylesheet"]')].length === 3 &&
    [...document.querySelectorAll('link[rel="stylesheet"]')].every(link => link.sheet)
  )).toBe(true);
  if (await page.locator('.p-viewer').count()) {
    await expect(page.locator('html')).toHaveAttribute('data-viewer-ready', 'true');
  }
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => {
      img.loading = 'eager';
      return img.decode();
    }));
  });
}
