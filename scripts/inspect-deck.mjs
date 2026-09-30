import { createServer } from 'node:http';
import { readFile, realpath, stat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
let server,browser;
try {
  if(process.argv.length!==3) throw new Error('Provide the authored deck directory.');
  const deck=JSON.parse(await readFile(resolve(process.argv[2],'deck.json'),'utf8'));
  if(!/^[a-z0-9][a-z0-9-]{0,59}$/.test(deck.id)) throw new Error('Invalid deck id.');
  const root=await realpath(`output/${deck.id}`);
  await stat(`${root}/index.html`);
  const review=resolve(`.build/${deck.id}/review`);await mkdir(review,{recursive:true});
  const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff'};
  // Ephemeral loopback-only server for the generated deck under inspection.
  server=createServer(async(req,res)=>{
    try {
      let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
      if((await stat(path)).isDirectory()) path=resolve(path,'index.html');
      path=await realpath(path);
      if(!path.startsWith(root+sep)) throw new Error('Outside output root');
      const data=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(data);
    } catch {res.writeHead(404);res.end('Not found');}
  });
  await new Promise((done,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',done);});
  let chromium,AxeBuilder;
  try {({chromium}=await import('playwright'));({default:AxeBuilder}=await import('@axe-core/playwright'));}
  catch {throw new Error('Inspection requires npm ci and npx playwright install chromium.');}
  browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
  const pages=[];
  for(const route of ['',...deck.slides.map((_,i)=>`${i+1}/`),'reading/']) {
    await page.goto(`http://127.0.0.1:${server.address().port}/${route}`,{waitUntil:'domcontentloaded'});
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode();}));});
    const geometry=await page.locator('.p-viewer .p-canvas').evaluateAll(canvases=>canvases.flatMap(c=>{
      const box=c.getBoundingClientRect();
      const failures=[...c.querySelectorAll('h1,h2,p,.p-metric,.p-features,.p-image')].filter(e=>{const r=e.getBoundingClientRect();return r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1;}).map(e=>`Outside canvas: ${e.className||e.tagName}`);
      const title=c.querySelector('h1')?.getBoundingClientRect(),intro=c.querySelector('.p-intro')?.getBoundingClientRect();
      if(title&&intro&&title.left<intro.right&&title.right>intro.left&&title.top<intro.bottom&&title.bottom>intro.top) failures.push('Title overlaps supporting copy; shorten text or choose another layout.');
      return failures;
    }));
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    const screenshot=`${route.replace('/','')||'overview'}.png`;
    await page.screenshot({path:resolve(review,screenshot),fullPage:true});
    pages.push({route:'/'+route,geometry,violations:scan.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)})),screenshot});
  }
  const passed=errors.length===0&&pages.every(p=>p.geometry.length===0&&p.violations.length===0);
  await writeFile(resolve(review,'report.json'),JSON.stringify({deck:deck.id,passed,errors,pages},null,2)+'\n');
  console.log(`${passed?'PASS':'FAIL'} ${deck.id}: ${pages.length} pages inspected.\nReport and screenshots: ${review}\nReview screenshots and factual content before delivery.`);
  if(!passed) process.exitCode=1;
} catch(error){console.error(`Inspection: ${error.message}`);process.exitCode=1;}
finally {if(browser) await browser.close();if(server) await new Promise(done=>server.close(done));}
