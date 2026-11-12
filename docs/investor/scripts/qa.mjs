import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=path.resolve('docs/investor/verification'),base='http://127.0.0.1:8094/kujo-investor/';await fs.mkdir(dir+'/screenshots',{recursive:true});
const browser=await chromium.launch(process.env.KUJO_BROWSER_PATH ? {executablePath:process.env.KUJO_BROWSER_PATH} : {channel:"chrome"});const context=await browser.newContext();const page=await context.newPage();const report=process.env.QA_INTERACTIONS ? JSON.parse(await fs.readFile(dir+'/visual-report.json','utf8')) : {date:'2026-11-11',viewports:[],checks:[],errors:[],axe:[],overflow:[]};
page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(30000);
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon'))report.errors.push(m.text()+" @ "+m.location().url);});
if(!process.env.QA_INTERACTIONS) for(const [name,width,height] of [['desktop',1920,1080],['laptop',1366,768],['tablet',768,1024],['mobile',390,844]]){
 await page.setViewportSize({width,height});
 for(let n=1;n<=18;n++){
  await page.goto(base+n+'/');await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>document.documentElement.dataset.transitioning!=='true');
  const overflow=await page.evaluate(()=>{const c=document.querySelector('.p-canvas'),r=c.getBoundingClientRect();return [...c.querySelectorAll('h1,.ki-lead,.p-features,.p-metrics,.ki-milestones,.ki-closing')].filter(e=>e.getBoundingClientRect().height>0).filter(e=>{const b=e.getBoundingClientRect();return b.bottom>r.bottom-20*r.width/1000||b.right>r.right+1||b.left<r.left-1;}).map(e=>e.className||e.tagName);});
  if(overflow.length)report.overflow.push({name,n,overflow});
  await page.screenshot({path:`${dir}/screenshots/${name}-${String(n).padStart(2,'0')}.png`,fullPage:true});
  if(name==='desktop'){const a=await new AxeBuilder({page}).analyze();report.axe.push({route:`${n}/`,violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))});}
 }
 await page.goto(base+'assets/deck/appendix.html');await page.screenshot({path:`${dir}/screenshots/${name}-appendix.png`,fullPage:true});
 report.viewports.push({name,width,height,slides:18,appendix:true});
}
await fs.writeFile(dir+'/visual-report.json',JSON.stringify(report,null,2));
await page.setViewportSize({width:1440,height:900});
await page.goto(base+'1/');await page.keyboard.press('ArrowRight');await page.waitForURL('**/2/');await page.keyboard.press('Home');await page.waitForURL('**/1/');await page.keyboard.press('End');await page.waitForURL('**/18/');await page.locator('[data-nav=previous]').click();await page.waitForURL('**/17/');report.checks.push('keyboard Home/End/arrows and pointer previous');
await page.goto(base+'1/');await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);await page.keyboard.press('ArrowRight');await page.waitForURL('**/2/');await page.evaluate(()=>document.exitFullscreen());report.checks.push('fullscreen entry, navigation and exit');
await page.goto(base+'5/');await page.getByText('Inspect the execution boundary',{exact:true}).click();assert(await page.locator('details[open]').count());report.checks.push('architecture details');
await page.goto(base+'8/');await page.getByText('Inspect the correction',{exact:true}).click();assert((await page.locator('pre').innerText()).includes('subtotal_cents'));report.checks.push('inline evidence detail');
await page.goto(base+'presenter/');await page.locator('[data-notes-file]').setInputFiles('decks/kujo-investor/investor-notes.json');await page.waitForFunction(()=>document.querySelector('[data-notes]').textContent.includes('accountable'));await page.locator('[data-next]').click();assert.equal(await page.locator('[data-position]').innerText(),'2 / 18');await page.screenshot({path:dir+'/screenshots/presenter.png',fullPage:true});report.checks.push('presenter notes import and slide navigation');
await page.goto(base+'reading/');assert.equal(await page.locator('h2').count(),18);await page.screenshot({path:dir+'/screenshots/reading.png',fullPage:true});report.checks.push('reading edition 18 headings');
await page.goto(base+'print/');assert.equal(await page.locator('.p-canvas').count(),18);await page.emulateMedia({media:'print'});await page.pdf({path:dir+'/kujo-investor.pdf',printBackground:true,preferCSSPageSize:true});await page.emulateMedia({media:'screen'});report.checks.push('print route 18 slides and PDF');
await page.goto(base+'assets/deck/appendix.html');for(const type of ['request','diff','before','after','eval','decision']){await page.locator(`[data-evidence="${type}"]`).click();await page.waitForTimeout(100);assert(!(await page.locator('#evidence-output').innerText()).includes('could not load'));}report.checks.push('six evidence artifact panels');
await page.locator('#raise').selectOption('3000000');assert((await page.locator('#funding-output').innerText()).includes('10.00%'));await page.locator('#raise').selectOption('2000000');assert((await page.locator('#funding-output').innerText()).includes('6.67%'));await page.locator('#postmoney').fill('1000000');assert((await page.locator('#funding-output').innerText()).includes('must be at least'));await page.locator('#postmoney').fill('30000000');await page.locator('#raise').selectOption('6000000');await page.locator('#organizations').fill('3000');assert((await page.locator('#market-output').innerText()).includes('18,000,000'));report.checks.push('funding, market, invalid-input controls');
const download=page.waitForEvent('download');await page.locator('#export').click();await (await download).saveAs(dir+'/exported-assumptions.json');report.checks.push('assumptions export');
const a=await new AxeBuilder({page}).analyze();report.axe.push({route:'appendix',violations:a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))});
await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'1/');await page.keyboard.press('ArrowRight');await page.waitForURL('**/2/');assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches));report.checks.push('reduced motion navigation');
await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.activeElement!==document.body));report.checks.push('keyboard focus');
report.pass=report.errors.length===0&&report.overflow.length===0&&report.axe.every(x=>x.violations.length===0);await fs.writeFile(dir+'/browser-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,axe:report.axe.filter(x=>x.violations.length)},null,2));await browser.close();if(!report.pass)process.exitCode=1;
