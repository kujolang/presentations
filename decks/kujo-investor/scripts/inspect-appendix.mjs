import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const b=await chromium.launch(process.env.KUJO_BROWSER_PATH ? {executablePath:process.env.KUJO_BROWSER_PATH} : {channel:'chrome'}), c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage();
const out='decks/kujo-investor/qa';
await p.setViewportSize({width:1440,height:900});await p.goto('https://kujolang.ai',{waitUntil:'domcontentloaded',timeout:30000});await p.screenshot({path:out+'/brand-reference.png'});
const reports=[];for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:8094/kujo-investor/assets/deck/appendix.html');await p.evaluate(()=>document.fonts.ready);
 await p.locator('[data-evidence=before]').click();await p.waitForFunction(()=>document.querySelector('#evidence-output').textContent.includes('exit'));
 for(const id of ['architecture','evidence','funding'])await p.locator('#'+id).screenshot({path:`${out}/screenshots/${name}-appendix-${id}.png`});
 reports.push({viewport:name,violations:(await new AxeBuilder({page:p}).analyze()).violations.map(x=>x.id),horizontalOverflow:await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
}
await p.goto('http://127.0.0.1:8094/kujo-investor/');reports.push({route:'overview',thumbnails:await p.locator('.p-thumbnail').count(),nestedLinks:await p.locator('a a').count(),violations:(await new AxeBuilder({page:p}).analyze()).violations.map(x=>x.id)});
await fs.writeFile(out+'/appendix-review.json',JSON.stringify(reports,null,2));console.log(reports);await b.close();
