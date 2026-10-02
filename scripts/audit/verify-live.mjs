// Read-only production verification. Run after build:site and deployment.
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';

const origin='https://presentations.kujolang.ai';
const root='.build/public-site';
const audit=process.env.AUDIT_DIR || 'seo-audit/2026-10-02';
const receipts=[];
const paths=readdirSync(root,{recursive:true})
  .filter(path=>path.endsWith('.html'))
  .map(path=>path.endsWith('index.html')?'/'+path.slice(0,-10):'/'+path);

for(const path of [...paths,'/robots.txt','/sitemap.xml']){
  const response=await fetch(origin+path);
  const body=await response.text();
  assert.equal(response.status,200,path);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  if(response.headers.get('content-type')?.includes('text/html')){
    assert(response.headers.get('content-security-policy'));
    if(!path.endsWith('/404.html') && path!=='/404.html'){
      assert(body.includes(`href="${origin+path}"`),`canonical ${path}`);
      if(!body.includes('name="robots" content="noindex')){
        assert(body.includes('property="og:image"'),`Open Graph image ${path}`);
        assert(body.includes('name="twitter:card" content="summary_large_image"'),`Twitter card ${path}`);
      }
    }
  }
  if(path==='/robots.txt'||path==='/sitemap.xml') writeFileSync(`${audit}/raw/production-${path.slice(1)}`,body);
  receipts.push({path,status:response.status,headers:Object.fromEntries(response.headers),bytes:Buffer.byteLength(body)});
}

for(const path of ['/missing/deep/page','/blog/']){
  const response=await fetch(origin+path);
  assert.equal(response.status,404,path);
  receipts.push({path,status:response.status});
}

for(const [path,expected] of [['/index.html?demo=1','/?demo=1'],['/investor/1?demo=1','/investor/1/?demo=1'],['/investor/1/index.html?demo=1','/investor/1/?demo=1']]){
  const response=await fetch(origin+path,{redirect:'manual'});
  assert([301,308].includes(response.status),path);
  const destination=new URL(response.headers.get('location'),origin);
  assert.equal(destination.href,origin+expected);
  const final=await fetch(destination,{redirect:'manual'});
  assert.equal(final.status,200);
  receipts.push({path,status:response.status,destination:destination.href,finalStatus:final.status,hops:1});
}

for(const crawler of ['Googlebot','bingbot','OAI-SearchBot','ChatGPT-User','GPTBot','ClaudeBot','Claude-SearchBot','PerplexityBot']){
  const response=await fetch(origin+'/live-talk/reading/',{headers:{'User-Agent':crawler}});
  if(crawler==='ClaudeBot') assert([200,403].includes(response.status),crawler);
  else assert.equal(response.status,200,crawler);
  receipts.push({crawler,path:'/live-talk/reading/',status:response.status,verifiedCrawlerIP:false});
}

const assets=readdirSync(root,{recursive:true}).filter(path=>/\.(?:png|svg|webp|woff2|css|js)$/.test(path));
for(const asset of assets){
  const response=await fetch(origin+'/'+asset);
  assert.equal(response.status,200,asset);
  assert.equal((await response.arrayBuffer()).byteLength,readFileSync(root+'/'+asset).byteLength,asset);
}

const result={time:new Date().toISOString(),origin,routes:receipts,assetsVerified:assets.length};
writeFileSync(`${audit}/raw/production-after.json`,JSON.stringify(result,null,2)+'\n');
console.log(`Verified ${paths.length} HTML routes, robots/sitemap, missing routes, redirects, eight crawler user agents and ${assets.length} assets.`);
