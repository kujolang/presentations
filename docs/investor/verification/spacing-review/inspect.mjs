import {chromium} from '@playwright/test';import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome'}),c=await b.newContext({viewport:{width:1920,height:1080}}),p=await c.newPage(),rows=[];
for(const [width,height,label] of [[1920,1080,'desktop'],[390,844,'mobile']]){
 await p.setViewportSize({width,height});
 for(let n=1;n<=18;n++){
  await p.goto(`http://127.0.0.1:8097/${n}/`);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.documentElement.dataset.transitioning!=='true');
  const data=await p.evaluate(()=>{const canvas=document.querySelector('.p-canvas'),r=canvas.getBoundingClientRect(),sels=['h1','.ki-lead','.p-features','.p-metrics','.ki-closing','.ki-milestones','.ki-explore','.ki-foundation','.ki-boundary','.ki-resource'];const boxes=sels.flatMap(sel=>[...canvas.querySelectorAll(sel)].filter(e=>e.offsetHeight>0).map(e=>{const b=e.getBoundingClientRect();return {sel,left:b.left,top:b.top,right:b.right,bottom:b.bottom,padding:getComputedStyle(e).paddingTop}}));return {boxes,canvas:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},pageOverflow:document.documentElement.scrollWidth>innerWidth+1}});
  rows.push({n,label,...data});
  if(label==='desktop')await p.locator('.p-canvas').screenshot({path:`docs/investor/verification/spacing-review/${label}-${String(n).padStart(2,'0')}.png`});else await p.screenshot({path:`docs/investor/verification/spacing-review/${label}-${String(n).padStart(2,'0')}.png`,fullPage:true});
 }
}
await fs.writeFile('docs/investor/verification/spacing-review/geometry.json',JSON.stringify(rows,null,2)+'\n');await b.close();console.log('Captured all 18 slides at desktop and mobile.');
