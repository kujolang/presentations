import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const d='decks/kujo-investor',deck=JSON.parse(fs.readFileSync(`${d}/deck.json`));assert.equal(deck.slides.length,18);
const notes=JSON.parse(fs.readFileSync(`${d}/investor-notes.json`));assert.equal(notes.notes.length,18);
for(const s of deck.slides)assert(!/TODO|TBD|data not supplied|complete before investor distribution|lorem ipsum/i.test(JSON.stringify(s)));
const model=JSON.parse(fs.readFileSync('docs/investor/financial-model.json'));const total=Object.values(model.quarterlyCosts).flat().reduce((a,b)=>a+b,0);assert.equal(total+model.reserve,model.raise);assert.equal(total,5100000);assert.equal(model.quarterlyCosts['Founder total cash'].reduce((a,b)=>a+b),375000);
for(const [teams,arr] of [[17,102000],[167,1002000],[1000,6000000]])assert.equal(teams*500*12,arr);
const root=`${d}/assets/checkout-evidence`,manifest=JSON.parse(fs.readFileSync(`${root}/manifest.json`));for(const [path,hash] of Object.entries(manifest))assert.equal(createHash('sha256').update(fs.readFileSync(`${root}/${path}`)).digest('hex'),hash,path);
const commands=JSON.parse(fs.readFileSync(`${root}/commands.json`));assert(commands.some(x=>x.exit===1&&x.stderr.includes('5099 != 4500')));assert(commands.some(x=>x.command.includes('run')&&x.command.includes('eval.json')&&x.exit===0));
const caseDirs=fs.readdirSync(`${root}/casefile`);for(const kind of ['before','after']){const dir=caseDirs.find(x=>x.endsWith(kind));const c=JSON.parse(fs.readFileSync(`${root}/casefile/${dir}/case.json`));assert.equal(c.command.exit_code,kind==='before'?1:0);}
const html=fs.readFileSync(`${d}/assets/appendix.html`,'utf8');assert(html.includes('application/ld+json'));assert(!/data not supplied|complete before investor distribution/i.test(html));
console.log('PASS: deck/notes, placeholder gate, quarterly budget, ARR arithmetic, immutable demo hashes and child exits, appendix schema.');
