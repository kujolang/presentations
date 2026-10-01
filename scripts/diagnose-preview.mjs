import {firefox} from '@playwright/test';
import {spawn} from 'node:child_process';
import {writeFileSync} from 'node:fs';
const port=8093, logs=[], observations=[];
const server=spawn(process.env.KUJO_BIN||'kujo',['serve','output','--port',String(port),'--cache-max-age',process.env.PREVIEW_CACHE||'300','--access-log']);
server.stdout.on('data',d=>logs.push(d.toString()));server.stderr.on('data',d=>logs.push(d.toString()));
let browser;
try {
 for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${port}/reference/`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await firefox.launch();
 for(let i=0;i<30;i++) {
  const context=await browser.newContext(),page=await context.newPage(),pending=new Set();
  page.on('request',r=>pending.add(r.url()));page.on('requestfinished',r=>pending.delete(r.url()));page.on('requestfailed',r=>pending.delete(r.url()));
  page.on('response',r=>observations.push({iteration:i,url:r.url(),status:r.status()}));
  try{for(const route of ['reference/1/','investor/1/','reference/2/','reference/1/'])await page.goto(`http://127.0.0.1:${port}/${route}`,{timeout:10000,waitUntil:'load'});}
  catch(error){observations.push({error:error.message,pending:[...pending]});process.exitCode=1;break;}
  finally{await context.close();}
 }
} finally {await browser?.close();server.kill();writeFileSync('docs/evidence/native-preview.json',JSON.stringify({cache:process.env.PREVIEW_CACHE||'300',contexts:30,navigations:120,responses:observations.filter(x=>!x.error).length,failures:observations.filter(x=>x.error),...(process.exitCode?{logs}:{} )},null,2)+'\n');}
