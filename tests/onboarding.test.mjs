import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
const cli=(...args)=>spawnSync(process.execPath,['scripts/deck.mjs',...args],{encoding:'utf8'});
const read=p=>JSON.parse(readFileSync(p,'utf8'));
test('machine catalog and schema cover every reusable layout and starter',()=>{
 const result=cli('catalog','--json');assert.equal(result.status,0,result.stderr);
 const catalog=JSON.parse(result.stdout);
 assert.deepEqual(catalog.starters.map(s=>s.id),['investor','live-talk','sales']);
 assert.deepEqual(Object.keys(catalog.layouts).sort(),readdirSync('layouts').filter(p=>p.endsWith('.json')).map(p=>p.slice(0,-5)).sort());
 const schema=read('deck.schema.json');assert.equal(schema.properties.slides.items.oneOf.length,Object.keys(catalog.layouts).length);
 const before=readFileSync('deck.schema.json','utf8');const generate=spawnSync(process.execPath,['scripts/write-schema.mjs']);assert.equal(generate.status,0);assert.equal(readFileSync('deck.schema.json','utf8'),before);
});
test('scaffold independently, retain supplied brief, refuse overwrite, and enforce readiness',()=>{
 const name=`onboarding-${process.pid}`,path=`decks/${name}`,brief=`.build/brief-${process.pid}.md`;
 writeFileSync(brief,'Source fact: customer count is not yet available.\n');
 try {
  const made=cli('create','investor',name,'--title','My pitch','--brief',brief);assert.equal(made.status,0,made.stderr);
  const deck=read(`${path}/deck.json`);assert.equal(deck.id,name);assert.equal(deck.title,'My pitch');assert.equal(deck.slides[0].title,'My pitch');
  assert(readFileSync(`${path}/BRIEF.md`,'utf8').includes('customer count is not yet available'));
  const original=readFileSync(`${path}/deck.json`,'utf8');assert.notEqual(cli('create','sales',name).status,0);assert.equal(readFileSync(`${path}/deck.json`,'utf8'),original);
  assert.equal(cli('check','--deck',path).status,0);assert.notEqual(cli('check','--deck',path,'--ready').status,0);
  deck.brand='Company';deck.footer='Draft';deck.slides=[{layout:'statement',title:'A clear takeaway',copy:'Supported content supplied by the author.'}];writeFileSync(`${path}/deck.json`,JSON.stringify(deck));
  assert.equal(cli('check','--deck',path,'--ready').status,0);
  assert.equal(read('starters/investor/deck.json').id,'investor');
 } finally {rmSync(path,{recursive:true,force:true});rmSync(brief,{force:true});}
});
test('bad input fails before scaffold; doctor has structured output',()=>{
 for(const args of [['create','invalid','test'],['create','sales','../outside'],['create','sales','test','--brief','no-such-brief.md'],['create','sales','test','--unknown'],['preview','--deck','starters/sales','--port','0']]) assert.notEqual(cli(...args).status,0,args.join(' '));
 assert(!existsSync('decks/test'));
 const result=cli('doctor','--json');const data=JSON.parse(result.stdout);assert.equal(typeof data.ready,'boolean');assert.deepEqual(Object.keys(data.checks),['node','git','kujo','ssg','sitekit']);
});
test('every purpose starter validates and its generated pages exist',()=>{
 for(const entry of read('starters/catalog.json')) {
  const result=cli('check','--deck',entry.path);assert.equal(result.status,0,result.stdout+result.stderr);
  assert.equal(read(`${entry.path}/deck.json`).slides.length,entry.slides);
  for(let i=1;i<=entry.slides;i++) assert(existsSync(`output/${entry.id}/${i}/index.html`));
 }
});
