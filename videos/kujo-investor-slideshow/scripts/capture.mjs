import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const base=new URL('../',import.meta.url), browser=await chromium.launch({channel:'chrome'});
const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
const captures=[];
for(let i=1;i<=18;i++){
 await page.goto(`http://127.0.0.1:8094/kujo-investor/${i}/`);
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:`html,body{margin:0!important;padding:0!important;overflow:hidden!important}.p-viewer{padding:0!important;gap:0!important}.p-frame{position:fixed!important;inset:0!important;width:1920px!important;height:1080px!important;max-width:none!important;max-height:none!important;margin:0!important;box-shadow:none!important;border:0!important}.p-canvas{width:1920px!important;height:1080px!important;transform:none!important;zoom:1!important}.p-nav,.p-help,.p-skip,[data-status]{display:none!important}`});
 const canvas=page.locator('.p-canvas');const box=await canvas.boundingBox();
 await canvas.screenshot({path:new URL(`assets/slides/${String(i).padStart(2,'0')}.png`,base).pathname});
 captures.push({slide:i,box,title:await page.locator('h1').innerText()});
}
await fs.writeFile(new URL('qa/captures.json',base),JSON.stringify(captures,null,2));await browser.close();
