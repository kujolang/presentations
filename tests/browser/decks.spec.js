import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('overview, all direct routes, local assets, canvas geometry and accessible semantics', async ({ page }) => {
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
  for (const [deck,count] of [['reference',9],['field-notes',3]]) {
    await page.goto(`/${deck}/`);
    await expect(page.locator('.p-thumbnail')).toHaveCount(count);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    await expect(page.locator('h1:visible').first()).toContainText(deck === 'reference' ? 'A new perspective' : 'A season');
    for (let n=1; n<=count; n++) {
      await page.goto(`/${deck}/${n}/`);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i=>i.decode())); });
      await expect(page.locator('.p-counter')).toHaveText(`${n} / ${count}`);
      const result = await page.locator('.p-canvas').evaluate(canvas => {
        const c = canvas.getBoundingClientRect();
        const overflow = [...canvas.querySelectorAll('h1,h2,p,.p-metric,.p-features,.p-image')].filter(e => {
          const b=e.getBoundingClientRect();
          return b.right>c.right+1 || b.bottom>c.bottom+1 || b.left<c.left-1 || b.top<c.top-1;
        }).map(e=>e.className || e.tagName);
        return {ratio:c.width/c.height,overflow,images:[...canvas.querySelectorAll('img')].every(e=>e.complete && e.naturalWidth>0)};
      });
      expect(result.ratio).toBeCloseTo(16/9,2);
      expect(result.overflow,`${deck}/${n} overflow`).toEqual([]);
      expect(result.images).toBe(true);
      const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
      expect(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
    }
  }
  expect(errors).toEqual([]); expect(failed).toEqual([]);
});

test('native keyboard navigation, reload, history, endpoints and focus guards', async ({page}) => {
  await page.goto('/reference/1/');
  for (const [key,n] of [['ArrowRight',2],[' ',3],['ArrowLeft',2],['End',9],['Home',1]]) {
    await page.waitForLoadState('load');
    await page.keyboard.press(key); await expect(page).toHaveURL(new RegExp(`/reference/${n}/$`));
    await page.waitForLoadState('load');
  }
  await page.keyboard.press('ArrowLeft'); await expect(page).toHaveURL(/\/1\/$/);
  await page.locator('[data-nav="next"]').focus();
  await page.keyboard.press(' '); await expect(page).toHaveURL(/\/1\/$/);
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(/\/2\/$/);
  await page.reload(); await expect(page.locator('.p-counter')).toHaveText('2 / 9');
  await page.goBack(); await expect(page).toHaveURL(/\/1\/$/);
  await page.goForward(); await expect(page).toHaveURL(/\/2\/$/);
  await page.evaluate(()=>{let input=document.createElement('input');input.ariaLabel='Test input';document.querySelector('main').append(input);input.focus();});
  await page.keyboard.press('ArrowRight'); await expect(page).toHaveURL(/\/2\/$/);
  await page.keyboard.press('f'); await expect(page.locator('input')).toHaveValue('f');
});

test('fixed composition on small screens; readable transcript and no JavaScript', async ({browser}) => {
  for (const size of [{width:390,height:844},{width:844,height:390},{width:768,height:1024}]) {
    const context=await browser.newContext({viewport:size,javaScriptEnabled:false});
    const page=await context.newPage(); await page.goto('/reference/',{waitUntil:'domcontentloaded'});
    await page.locator('.p-thumbnail').nth(5).click();
    await expect(page).toHaveURL(/\/6\/$/);
    const box=await page.locator('.p-canvas').boundingBox(); expect(box.width/box.height).toBeCloseTo(16/9,2);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole('link',{name:'Next →'}).click(); await expect(page).toHaveURL(/\/7\/$/);
    await page.getByRole('link',{name:'Read text'}).click(); await expect(page.locator('section')).toHaveCount(9);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await context.close();
  }
});

test('fullscreen keeps the slide, navigation, and browser history together',async ({page,browserName})=>{
  test.skip(browserName!=='chromium','Fullscreen browser support is exercised in Chromium; native behavior varies in headless WebKit/Firefox.');
  await page.goto('/reference/1/');
  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(true);
  await page.keyboard.press('ArrowRight'); await expect(page).toHaveURL(/\/2\/$/);
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(true);
  await page.getByRole('link',{name:'Next →'}).click(); await expect(page).toHaveURL(/\/3\/$/);
  await page.goBack(); await expect(page.locator('.p-counter')).toHaveText('2 / 9');
  await page.goForward(); await expect(page.locator('.p-counter')).toHaveText('3 / 9');
  await page.keyboard.press('Escape');
  await expect.poll(()=>page.evaluate(()=>Boolean(document.fullscreenElement))).toBe(false);
});

test('overview visual artifact and reduced motion',async ({page},testInfo)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/reference/');await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode();}));});
  await page.screenshot({path:testInfo.outputPath('reference-overview.png'),fullPage:true});
  await page.goto('/field-notes/');await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode();}));});await page.screenshot({path:testInfo.outputPath('field-notes-overview.png'),fullPage:true});
});

for(const [deck,count] of [['investor',9],['live-talk',7],['sales',7]]) {
  test(`${deck} purpose starter fits and stays accessible`,async({page},testInfo)=>{
    for(let n=1;n<=count;n++) {
      await page.goto(`/${deck}/${n}/`);
      await page.evaluate(()=>document.fonts.ready);
      await expect(page.locator('.p-counter')).toHaveText(`${n} / ${count}`);
      const overlaps=await page.locator('.p-canvas').evaluate(c=>{
        const box=c.getBoundingClientRect(),h=c.querySelector('h1').getBoundingClientRect(),p=c.querySelector('.p-intro')?.getBoundingClientRect();
        return {outside:[...c.querySelectorAll('h1,h2,p,.p-features')].some(e=>{const r=e.getBoundingClientRect();return r.right>box.right+1||r.bottom>box.bottom+1;}),text:Boolean(p&&h.left<p.right&&h.right>p.left&&h.top<p.bottom&&h.bottom>p.top)};
      });
      expect(overlaps).toEqual({outside:false,text:false});
      expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
    }
    await page.goto(`/${deck}/`);await page.screenshot({path:testInfo.outputPath(`${deck}-overview.png`),fullPage:true});
  });
}
