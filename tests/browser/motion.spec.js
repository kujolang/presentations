import {test,expect} from '@playwright/test';

test('Motion presets animate static slides; toggle, reload and history stay usable',async({page})=>{
  const requests=[];page.on('request',r=>{if(r.url().includes('motion-mini'))requests.push(r.url());});
  await page.addInitScript(()=>{
    window.motionFrames=[];
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){window.motionFrames.push({frames,options});return animate.call(this,frames,options);};
  });
  await page.goto('/reference/1/');
  await expect(page.locator('[data-motion-toggle]')).toHaveText('Transitions: on');
  expect(requests).toHaveLength(0);
  for(const effect of ['fade','slide','zoom']) {
    await page.evaluate(effect=>{document.querySelector('.p-viewer').dataset.motion=effect;window.motionFrames=[];window.retained=true;},effect);
    await page.getByRole('link',{name:'Next →'}).click();
    await expect(page).toHaveURL(/\/2\/$/);
    expect(await page.evaluate(()=>window.retained)).toBe(true);
    const frames=await page.evaluate(()=>window.motionFrames);
    expect(frames.length).toBeGreaterThan(0);
    expect(frames.some(a=>JSON.stringify(a.frames).includes(effect==='slide'?'translateX':effect==='zoom'?'scale':'opacity'))).toBe(true);
    await page.goBack();await expect(page.locator('.p-counter')).toHaveText('1 / 9');
  }
  expect(requests).toHaveLength(1);
  await page.getByRole('button',{name:'Transitions: on'}).click();
  await expect(page.locator('[data-motion-toggle]')).toHaveAttribute('aria-pressed','false');
  await page.getByRole('link',{name:'Next →'}).click();await expect(page).toHaveURL(/\/2\/$/);
  expect(await page.evaluate(()=>window.retained)).toBeUndefined();
  await page.reload();await expect(page.locator('[data-motion-toggle]')).toHaveText('Transitions: off');
});

test('reduced motion, disabled decks and failed optional module preserve navigation',async({page})=>{
  let motionRequests=0;page.on('request',r=>{if(r.url().includes('motion-mini'))motionRequests++;});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/reference/1/');
  await expect(page.locator('[data-motion-toggle]')).toBeDisabled();
  await page.getByRole('link',{name:'Next →'}).click();await expect(page).toHaveURL(/\/2\/$/);
  expect(motionRequests).toBe(0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/field-notes/1/');
  await expect(page.locator('[data-motion-toggle]')).toBeHidden();
  await page.getByRole('link',{name:'Next →'}).click();await expect(page).toHaveURL(/\/field-notes\/2\/$/);
  expect(motionRequests).toBe(0);
  await page.route('**/motion/motion-mini.js',r=>r.abort());
  await page.goto('/reference/1/');await page.getByRole('link',{name:'Next →'}).click();
  await expect(page).toHaveURL(/\/reference\/2\/$/);await expect(page.locator('.p-counter')).toHaveText('2 / 9');
  await expect(page.locator('.p-frame')).toHaveCSS('opacity','1');
});
