import { openPage } from './helpers.js';
import {test,expect} from './fixtures.js';

test('Motion presets animate static slides; toggle, reload and history stay usable',async({page})=>{
  const requests=[];page.on('request',r=>{if(r.url().includes('motion-mini'))requests.push(r.url());});
  await page.addInitScript(()=>{
    window.motionFrames=[];
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){window.motionFrames.push({frames,options});return animate.call(this,frames,options);};
  });
  await openPage(page, '/reference/1/');
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
  await page.reload({waitUntil: 'domcontentloaded'});await expect(page.locator('[data-motion-toggle]')).toHaveText('Transitions: off');
});

test('reduced motion, disabled decks and failed optional module preserve navigation',async({page})=>{
  let motionRequests=0;page.on('request',r=>{if(r.url().includes('motion-mini'))motionRequests++;});
  await page.emulateMedia({reducedMotion:'reduce'});
  await openPage(page, '/reference/1/');
  await expect(page.locator('[data-motion-toggle]')).toBeDisabled();
  await page.getByRole('link',{name:'Next →'}).click();await expect(page).toHaveURL(/\/2\/$/);
  expect(motionRequests).toBe(0);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await openPage(page, '/field-notes/1/');
  await expect(page.locator('[data-motion-toggle]')).toBeHidden();
  await page.getByRole('link',{name:'Next →'}).click();await expect(page).toHaveURL(/\/field-notes\/2\/$/);
  expect(motionRequests).toBe(0);
  await page.route('**/motion/motion-mini.js',r=>r.abort());
  await openPage(page, '/reference/1/');await page.getByRole('link',{name:'Next →'}).click();
  await expect(page).toHaveURL(/\/reference\/2\/$/);await expect(page.locator('.p-counter')).toHaveText('2 / 9');
  await expect(page.locator('.p-frame')).toHaveCSS('opacity','1');
});

test('cinematic presets choreograph content and restore authored markup',async({page})=>{
  for(const effect of ['editorial','focus','kinetic']) {
    await openPage(page, '/reference/1/');
    await page.evaluate(effect=>{
      const main=document.querySelector('.p-viewer');main.dataset.motion=effect;main.dataset.duration='1.2';main.dataset.intensity='1.4';
      window.before=document.querySelector('.p-canvas').innerHTML;window.poses=[];
      window.observer=new MutationObserver(records=>records.forEach(r=>window.poses.push({tag:r.target.tagName,css:r.target.getAttribute('style')})));
      window.observer.observe(document.querySelector('.p-canvas'),{subtree:true,attributes:true,attributeFilter:['style']});
    },effect);
    await page.getByRole('button',{name:'Replay entrance'}).click();
    await expect(page.locator('html')).toHaveAttribute('data-transitioning','true');
    await expect(page.locator('html')).not.toHaveAttribute('data-transitioning','true');
    const result=await page.evaluate(()=>{window.observer.disconnect();return {before:window.before,after:document.querySelector('.p-canvas').innerHTML,poses:window.poses};});
    expect(result.after).toBe(result.before);
    expect(result.poses.some(p=>p.tag==='H1'&&p.css?.includes('transform'))).toBe(true);
    expect(result.poses.some(p=>p.tag==='IMG'&&p.css?.includes('scale'))).toBe(true);
    expect(JSON.stringify(result.poses)).toContain(effect==='editorial'?'clip-path':effect==='focus'?'blur':'rotate');
    await expect(page.locator('.p-canvas h1')).toBeVisible();
  }
  await openPage(page, '/reference/5/');
  await page.evaluate(()=>{window.poses=[];new MutationObserver(rs=>rs.forEach(r=>window.poses.push(r.target.getAttribute('style')))).observe(document.querySelector('.p-chart'),{subtree:true,attributes:true});});
  await page.getByRole('button',{name:'Replay entrance'}).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-transitioning','true');
  expect(await page.evaluate(()=>window.poses.some(p=>p?.includes('scaleY')))).toBe(true);
});

test('cinematic entrances finish cleanly when motion is disabled mid-flight',async({page})=>{
  await openPage(page, '/reference/1/');
  await page.evaluate(()=>{document.querySelector('.p-viewer').dataset.duration='2';window.before=document.querySelector('.p-canvas').innerHTML;});
  await page.getByRole('button',{name:'Replay entrance'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-transitioning','true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('html')).not.toHaveAttribute('data-transitioning','true');
  await expect(page.locator('[data-replay]')).toBeDisabled();
  expect((await page.locator('.p-canvas').innerHTML()).replaceAll(' style=""','')).toBe((await page.evaluate(()=>window.before)).replaceAll(' style=""',''));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.route('**/motion/motion-hybrid.js',route=>route.abort());
  await page.reload({waitUntil: 'domcontentloaded'});
  await page.getByRole('button',{name:'Replay entrance'}).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-transitioning','true');
  await expect(page.locator('h1')).toBeVisible();
  await page.getByRole('link',{name:'Next →'}).click();await expect(page).toHaveURL(/\/2\/$/);
});
