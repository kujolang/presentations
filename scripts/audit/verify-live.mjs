// Read-only production verification. Run after build:site and deployment.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
const origin='https://presentations.robertdevore.com';
const root='.build/public-site';
const receipts=[];
const paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.html')).map(p=>p.endsWith('index.html')?'/'+p.slice(0,-10):'/'+p);
for(const path of [...paths,'/robots.txt','/sitemap.xml']){
 const r=await fetch(origin+path);const body=await r.text();
 assert.equal(r.status,200,path);assert.equal(r.headers.get('x-content-type-options'),'nosniff');
 if(path!='/404.html'&&r.headers.get('content-type')?.includes('text/html')){
  assert(body.includes(`href="${origin+path}"`),`canonical ${path}`);
  assert(r.headers.get('content-security-policy'));
 }
 if(path==='/robots.txt'||path==='/sitemap.xml') writeFileSync(`seo-audit/2026-10-01/raw/production-${path.slice(1)}`,body);
 receipts.push({path,status:r.status,headers:Object.fromEntries(r.headers),bytes:Buffer.byteLength(body)});
}
for(const path of ['/missing/deep/page','/blog/']){
 const r=await fetch(origin+path);assert.equal(r.status,404,path);receipts.push({path,status:r.status});
}
for(const path of ['/1?demo=1','/1/index.html?demo=1']){
 const r=await fetch(origin+path,{redirect:'manual'});assert([301,308].includes(r.status));
 const dest=new URL(r.headers.get('location'),origin);assert.equal(dest.href,origin+'/1/?demo=1');
 const final=await fetch(dest,{redirect:'manual'});assert.equal(final.status,200);
 receipts.push({path,status:r.status,destination:dest.href,finalStatus:final.status,hops:1});
}
for(const crawler of ['Googlebot','bingbot','OAI-SearchBot','ChatGPT-User','GPTBot']){
 const r=await fetch(origin+'/reading/',{headers:{'User-Agent':crawler}});assert.equal(r.status,200);
 receipts.push({crawler,path:'/reading/',status:r.status,verifiedCrawlerIP:false});
}
const assets=readdirSync(root,{recursive:true}).filter(p=>/\.(?:webp|woff2|css|js)$/.test(p));
for(const asset of assets){const r=await fetch(origin+'/'+asset);assert.equal(r.status,200,asset);assert.equal((await r.arrayBuffer()).byteLength,readFileSync(root+'/'+asset).byteLength,asset);}
const result={time:new Date().toISOString(),origin,routes:receipts,assetsVerified:assets.length};
writeFileSync('seo-audit/2026-10-01/raw/production-after.json',JSON.stringify(result,null,2)+'\n');
console.log(`Verified ${paths.length} HTML routes, robots/sitemap, missing routes, redirects, five crawler user agents and ${assets.length} assets.`);
