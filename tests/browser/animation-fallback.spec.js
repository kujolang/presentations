import { test, expect } from '@playwright/test';
test('a stalled optional animation releases the navigation lock', async ({page}) => {
  await page.route('**/field-notes/1/', async route => {
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('class="p-viewer"','class="p-viewer" data-motion="fade" data-duration="0.1" data-easing="easeOut"')});
  });
  await page.route('**/motion-mini.js', route => route.fulfill({contentType:'application/javascript',body:`export function animate(node) { window.stalledAnimations=(window.stalledAnimations||0)+1; node.style.opacity='0'; return { then() {}, complete() {} }; }`}));
  await page.goto('/field-notes/1/');
  await expect.poll(()=>page.evaluate(()=>window.stalledAnimations||0)).toBeGreaterThan(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-transitioning','true',{timeout:15000});
  await expect(page.locator('.p-frame').first()).toHaveCSS('opacity','1');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/field-notes\/2\/$/,{timeout:15000});
});
