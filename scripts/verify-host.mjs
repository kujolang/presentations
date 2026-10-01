import assert from 'node:assert/strict';
const [target,mode]=process.argv.slice(2);
if(!target||process.argv.length>4||(mode&&mode!=='--private'))throw Error('Usage: node scripts/verify-host.mjs https://host/deck/ [--private]');
const base=new URL(target);
if(!['http:','https:'].includes(base.protocol)||base.username||base.password||base.search||base.hash||!base.pathname.endsWith('/'))throw Error('Use an HTTP(S) deck URL ending in /, without credentials, query or fragment');
const authorization=process.env.PRESENTATION_AUTHORIZATION;
if(mode==='--private'&&!authorization)throw Error('Provide PRESENTATION_AUTHORIZATION through the environment; it is never written to the report');
const results=[];
for(const [path,type] of [['1/','text/html'],['reading/','text/html'],['print/','text/html'],['assets/presentation/viewer.js','javascript'],['assets/presentation/presentation.css','text/css']]){
 const url=new URL(path,base);
 if(mode==='--private'){
  const denied=await fetch(url,{redirect:'manual'});
  assert([401,403].includes(denied.status),`${path}: unauthenticated access must return 401/403 (redirect-based login needs manual browser verification)`);
 }
 const response=await fetch(url,{headers:authorization?{Authorization:authorization}:{},redirect:'manual'});
 assert.equal(response.status,200,`${path}: direct URL failed`);
 assert(response.headers.get('content-type')?.includes(type),`${path}: incorrect MIME type`);
 assert.equal(response.headers.get('x-content-type-options'),'nosniff',`${path}: missing nosniff`);
 const cache=response.headers.get('cache-control')||'';
 assert(/no-cache|no-store|max-age=(?:0|[1-9]\d{0,2})(?:\D|$)/.test(cache),`${path}: use revalidation or a short cache lifetime`);
 if(type==='text/html')assert(response.headers.get('content-security-policy'),`${path}: missing enforced CSP`);
 results.push({path,status:response.status,type:response.headers.get('content-type'),cache});
}
console.log(JSON.stringify({host:base.href,private:mode==='--private',checks:results},null,2));
