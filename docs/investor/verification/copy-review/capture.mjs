import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),page=await context.newPage();
const report=[];
for(const n of [12,18]){
 await page.goto(`http://127.0.0.1:8097/${n}/`);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.documentElement.dataset.transitioning!=='true');
 const canvas=page.locator('.p-canvas');await canvas.screenshot({path:`docs/investor/verification/copy-review/slide-${n}.png`});
 const outside=await canvas.evaluate(c=>{const r=c.getBoundingClientRect();return [...c.querySelectorAll('h1,.ki-lead,.p-metrics,.ki-closing')].filter(e=>{const b=e.getBoundingClientRect();return b.right>r.right+1||b.bottom>r.bottom+1;}).map(e=>e.className||e.tagName)});
 if(outside.length)throw Error(JSON.stringify({n,outside}));report.push({slide:n,desktop:'pass',title:await page.locator('h1').innerText()});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:`docs/investor/verification/copy-review/mobile-${n}.png`,fullPage:true});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error(`Mobile overflow slide ${n}`);
 await page.setViewportSize({width:1920,height:1080});
}
await fs.writeFile('docs/investor/verification/copy-review/result.json',JSON.stringify(report,null,2)+'\n');await browser.close();console.log('PASS: slides 12 and 18 captured; desktop bounds and mobile width checked.');
