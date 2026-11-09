// Howl owns SVG composition. Chrome only rasterizes its self-contained SVGs.
import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const deck='decks/kujo-investor',manifest=`${deck}/howl.json`,out=`${deck}/social/generated`;
const env={...process.env,KUJO:process.env.KUJO||resolve('../kujo/target/release/kujo')};
const howl=process.env.HOWL_BIN||resolve('../howl/bin/howl');
for(const args of [['validate'],['render','--out',out,'--format','svg']])execFileSync(howl,[...args,'--manifest',manifest],{env,stdio:'inherit'});
const {cards}=JSON.parse(await readFile(manifest,'utf8'));
await mkdir(`${deck}/assets/social`,{recursive:true});
const browser=await chromium.launch(process.env.KUJO_BROWSER_PATH?{executablePath:process.env.KUJO_BROWSER_PATH}:{channel:'chrome'});
const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
const images={};
try{for(const card of cards){
 await page.goto(pathToFileURL(resolve(out,`${card.id}.svg`)).href);
 await page.evaluate(()=>document.fonts.ready);
 const metrics=await page.locator('svg').evaluate(svg=>({width:svg.width.baseVal.value,height:svg.height.baseVal.value,overflow:[...svg.querySelectorAll('text')].filter(t=>{const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>1200||b.y+b.height>630;}).length}));
 if(metrics.width!==1200||metrics.height!==630||metrics.overflow)throw new Error(`Invalid social composition: ${card.id}`);
 const png=await page.screenshot({type:'png'});const hash=createHash('sha256').update(png).digest('hex').slice(0,12);
 const file=`${card.id}.${hash}.png`;await writeFile(`${deck}/assets/social/${file}`,png);
 images[card.id]={path:`/assets/deck/social/${file}`,alt:card.alt,width:1200,height:630,type:'image/png'};
}}finally{await browser.close();}
await writeFile(`${deck}/social/images.json`,JSON.stringify(images,null,2)+'\n');
console.log(`Rasterized ${cards.length} Howl social cards (1200×630 PNG).`);
