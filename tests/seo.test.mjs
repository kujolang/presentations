import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root='output/reference';
const read=path=>readFileSync(`${root}/${path}`,'utf8');
test('search routes, metadata and utility exclusions remain consistent',()=>{
 const routes=['',...Array.from({length:9},(_,i)=>`${i+1}/`),'reading/'];
 const titles=new Set(), descriptions=new Set();
 const sitemap=read('sitemap.xml');
 for(const route of routes){
  const html=read(`${route}index.html`);
  const canonical=html.match(/rel="canonical" href="([^"]+)"/)[1];
  assert(sitemap.includes(`<loc>${canonical}</loc>`));
  assert(!html.includes('noindex'));
  const data=JSON.parse(html.match(/type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert.equal(data.url,canonical);assert.equal(data['@type'],'WebPage');
  titles.add(html.match(/<title>(.*?)<\/title>/s)[1]);
  descriptions.add(html.match(/name="description" content="([^"]+)"/)[1]);
 }
 assert.equal(titles.size,routes.length);assert.equal(descriptions.size,routes.length);
 assert.equal((sitemap.match(/<loc>/g)||[]).length,routes.length);
 for(const route of ['print/','presenter/']){
  assert(read(`${route}index.html`).includes('content="noindex,follow"'));
  assert(!sitemap.includes(`/${route}</loc>`));
 }
 assert(read('404.html').includes('content="noindex,follow"'));
 assert(!existsSync(`${root}/blog`));
 assert(read('robots.txt').includes('Sitemap:'));
});
