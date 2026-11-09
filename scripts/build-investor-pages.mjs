import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {cp,mkdir,rm,writeFile,readFile,readdir} from 'node:fs/promises';
const origin='https://invest.kujolang.ai';
execFileSync(process.execPath,['scripts/deck.mjs','build','--deck','decks/kujo-investor','--site-url',origin],{stdio:'inherit'});
const dir='.build/investor-pages';await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});await cp('output/kujo-investor',dir,{recursive:true});
// Publication adapter: preserve the native renderer, slide markup and viewer.
// The audience entry point is slide one; overview remains a separate edition.
const publicCSS=await readFile(`${dir}/assets/deck/public-view.css`);
const publicStyle=`public-view.${createHash('sha256').update(publicCSS).digest('hex').slice(0,12)}.css`;
await writeFile(`${dir}/assets/deck/${publicStyle}`,publicCSS);
const overview=await readFile(`${dir}/index.html`,'utf8');
await mkdir(`${dir}/overview`,{recursive:true});await writeFile(`${dir}/overview/index.html`,overview);
await writeFile(`${dir}/index.html`,await readFile(`${dir}/1/index.html`,'utf8'));
async function walk(folder){for(const e of await readdir(folder,{withFileTypes:true})){const file=`${folder}/${e.name}`;if(e.isDirectory())await walk(file);else if(e.name.endsWith('.html')){
 const rel=file.slice(dir.length),isRoot=rel==='/index.html',isOverview=rel==='/overview/index.html';
 const originalURL=origin+(isRoot?'/1/':isOverview?'/':rel.replace(/index\.html$/,''));
 let html=await readFile(file,'utf8');
 // Resolve all local resources against their original native route before moving.
 html=html.replace(/\b(href|src)="([^"]*)"/g,(all,key,value)=>{
  if(!value||value.startsWith('#')||/^(https?:|mailto:|data:)/.test(value))return all;
  const url=new URL(value,originalURL);let pathname=url.pathname;
  if(pathname==='/')pathname='/overview/';else if(pathname==='/1/')pathname='/';
  if(pathname==='/assets/deck/appendix.html')pathname='/assets/deck/appendix';
  return `${key}="${pathname}${url.search}${url.hash}"`;
 });
 if(isRoot)html=html.replaceAll(origin+'/1/',origin+'/');
 if(isOverview){html=html.replaceAll(origin+'/',origin+'/overview/');html=html.replace('<title>','<title>Overview — ');}
 if(html.includes('class="p-viewer"')){
  html=html.replace('<body>','<body class="ki-public-view">').replace('</head>',`<link rel="stylesheet" href="/assets/deck/${publicStyle}"></head>`);
  html=html.replace(/<nav class="p-nav sk-cluster"[\s\S]*?<\/nav>/,nav=>{
   const previous=nav.match(/<a[^>]*data-nav="previous"[^>]*>[\s\S]*?<\/a>/)?.[0];
   const next=nav.match(/<a[^>]*data-nav="next"[^>]*>[\s\S]*?<\/a>/)?.[0];
   const arrow=(link,direction,glyph)=>link?link.replace('class="sk-button"',`class="ki-arrow ki-${direction}" aria-label="${direction==='previous'?'Previous':'Next'} slide"`).replace(/>[^<]*<\/a>$/,`><span aria-hidden="true">${glyph}</span></a>`):`<span class="ki-arrow ki-${direction} ki-disabled" aria-label="${direction==='previous'?'Previous':'Next'} slide unavailable" aria-disabled="true">${glyph}</span>`;
   const counter=nav.match(/<span class="p-counter"[^>]*>.*?<\/span>/)[0];
   const extras=nav.replace(/^<nav[^>]*>/,'').replace(/<\/nav>$/,'').replace(previous||'__absent__','').replace(next||'__absent__','').replace(counter,'').replace(/<span class="p-disabled"[^>]*>.*?<\/span>/g,'');
   return `<nav class="ki-navigation" aria-label="Slide navigation">${arrow(previous,'previous','←')}${counter}${arrow(next,'next','→')}</nav><details class="ki-menu"><summary aria-label="Presentation options">⋯</summary><nav aria-label="Presentation editions">${extras}<a href="/presenter/">Presenter</a></nav></details>`;
  });
 }
 await writeFile(file,html);
}}}await walk(dir);
await rm(`${dir}/1`,{recursive:true,force:true});
let sitemap=await readFile(`${dir}/sitemap.xml`,'utf8');sitemap=sitemap.replace(`<url><loc>${origin}/1/</loc></url>`,'').replace('</urlset>',`<url><loc>${origin}/overview/</loc></url><url><loc>${origin}/assets/deck/appendix</loc></url></urlset>`);await writeFile(`${dir}/sitemap.xml`,sitemap);
await writeFile(`${dir}/_redirects`,'/1/ / 301\n/1 / 301\n');
await writeFile(`${dir}/_headers`,'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Cache-Control: public, max-age=0, must-revalidate\n');
console.log(`Pages artifact: ${dir}`);
