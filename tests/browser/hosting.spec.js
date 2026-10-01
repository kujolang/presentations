import { test, expect } from '@playwright/test';
import { openPage } from './helpers.js';
test('static hosting supports a mounted deck, MIME types, revalidation and CSP', async ({page,request})=>{
  const violations=[];
  await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',event=>console.error(`CSP violation: ${event.violatedDirective}`)));
  page.on('console',message=>{if(message.text().startsWith('CSP violation:')) violations.push(message.text());});
  await openPage(page,'/mounted/reference/1/');
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/mounted\/reference\/2\/$/);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('h1')).toBeVisible();
  for(const [path,type] of [['1/','text/html'],['assets/presentation/viewer.js','text/javascript'],['assets/presentation/presentation.css','text/css'],['assets/presentation/motion/motion-mini.js','text/javascript']]) {
    const response=await request.get(`/mounted/reference/${path}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(type);
    expect(response.headers()['cache-control']).toBe('no-cache');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
  }
  expect(violations).toEqual([]);
});
