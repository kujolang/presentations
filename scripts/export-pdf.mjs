import {chromium} from '@playwright/test';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [deckPath,destination]=process.argv.slice(2);
if(!deckPath||!destination||process.argv.length!==4)throw Error('Usage: node scripts/export-pdf.mjs <deck-directory> <new-file.pdf>');
const deck=JSON.parse(readFileSync(resolve(deckPath,'deck.json'),'utf8'));
if(!/^[a-z0-9][a-z0-9-]{0,59}$/.test(deck.id))throw Error('Invalid deck ID');
if(existsSync(destination))throw Error('Refusing to overwrite an existing PDF');
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 await page.goto(pathToFileURL(resolve('output',deck.id,'print/index.html')).href);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});
 await page.pdf({path:destination,preferCSSPageSize:true,printBackground:true});
 console.log(`Exported ${deck.slides.length} slides to ${destination}`);
}finally{await browser.close();}
