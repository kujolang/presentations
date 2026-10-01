import {test,expect} from './fixtures.js';
import AxeBuilder from '@axe-core/playwright';
import {openPage} from './helpers.js';

test('Arabic controls, RTL composition, font loading and print pages',async({page,browserName},testInfo)=>{
 await openPage(page,'/arabic/1/');
 await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 await expect(page.locator('[data-nav=next]')).toContainText('التالي');
 expect(await page.evaluate(()=>document.fonts.check('16px "Noto Sans Arabic"'))).toBe(true);
 await page.screenshot({path:testInfo.outputPath('arabic-slide.png')});
 await page.keyboard.press('ArrowRight');await expect(page).toHaveURL(/\/arabic\/2\/$/);
 const violations=(await new AxeBuilder({page}).analyze()).violations;expect(violations).toEqual([]);
 await page.goto('/arabic/print/');
 await expect(page.locator('.p-print > section')).toHaveCount(2);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('.p-frame').first().evaluate(el=>Math.abs(el.getBoundingClientRect().width/el.getBoundingClientRect().height-16/9))).toBeLessThan(.01);
 if(browserName==='chromium'){
  const pdf=await page.pdf({preferCSSPageSize:true,printBackground:true});
  expect((pdf.toString('latin1').match(/\/Type \/Page\b/g)||[]).length).toBe(2);
 }
});

test('presenter notes remain local; navigation, audience window and timer work',async({page})=>{
 const requests=[];page.on('request',r=>requests.push(r.url()+String(r.postData()||'')));
 await page.goto('/reference/presenter/');
 await expect(page.locator('[data-current] .p-frame')).toBeVisible();
 const secret='PRIVATE-NOTES-DO-NOT-PUBLISH';
 await page.locator('[data-notes-file]').setInputFiles({name:'notes.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({deck:'reference',notes:Array.from({length:9},(_,i)=>`${secret}-${i+1}`)}))});
 await expect(page.locator('[data-notes]')).toHaveText(`${secret}-1`);
 const popup=page.waitForEvent('popup');await page.locator('[data-audience]').click();const audience=await popup;
 await expect(audience).toHaveURL(/\/reference\/1\/$/);
 await page.locator('[data-next]').click();await expect(page.locator('[data-notes]')).toHaveText(`${secret}-2`);
 await expect(audience).toHaveURL(/\/reference\/2\/$/);
 expect(await audience.content()).not.toContain(secret);
 expect(requests.some(x=>x.includes(secret))).toBe(false);
 await page.locator('[data-timer-toggle]').click();await expect(page.locator('[data-timer]')).not.toHaveText('00:00');
 await page.locator('[data-timer-reset]').click();await expect(page.locator('[data-timer]')).toHaveText('00:00');
 await page.locator('[data-clear]').click();await expect(page.locator('[data-notes]')).toBeEmpty();
 await page.reload();await expect(page.locator('[data-notes]')).toBeEmpty();
 await audience.close();
});
