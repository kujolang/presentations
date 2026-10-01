import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const read=p=>readFileSync(p,'utf8');
for (const [deck,count] of [['reference',9],['field-notes',3]]) {
  const root=`output/${deck}`;
  assert.equal((read(`${root}/index.html`).match(/class="p-thumbnail"/g)||[]).length,count);
  assert(!read(`${root}/index.html`).includes('viewer.js'),'overview does not need a JS runtime');
  assert(!read(`${root}/reading/index.html`).includes('viewer.js'),'reading mode does not need a JS runtime');
  for(let n=1;n<=count;n++) {
    const html=read(`${root}/${n}/index.html`);
    assert(html.includes(`data-slide="${n}"`));
    assert(!html.includes('{{'),'unresolved template placeholder');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
    assert(!/https?:\/\/[^" ]+\.(jpg|png|webp|woff2)/.test(html),'assets must be local');
  }
}
for(const file of readdirSync('src')) assert(!/FORM \/ MEDIA|ff4b23|Innovating media/.test(read(`src/${file}`)),'reference data leaked into engine');
assert(!read('assets/presentation.css').includes('#ff4b23'));
assert(!read('output/field-notes/index.html').includes('FORM / MEDIA'));
assert(existsSync('output/reference/assets/presentation/motion/motion-mini.js'));
assert(!existsSync('output/field-notes/assets/presentation/motion/motion-mini.js'));
const tmp='.build/contract-fixture'; mkdirSync(tmp,{recursive:true}); cpSync('examples/reference/assets',`${tmp}/assets`,{recursive:true});
const base=JSON.parse(read('examples/reference/deck.json'));
const cases=[
  ['unknown deck field',d=>d.typo=true,false],
  ['unknown slide field',d=>d.slides[0].titel='Typo',false],
  ['unknown motion field',d=>d.transitions.duraton=1,false],
  ['unknown image field',d=>d.slides[0].images[0].position=1,false],
  ['unknown metric field',d=>d.slides[0].metrics[0].unit='items',false],
  ['unknown feature field',d=>d.slides[1].features[0].text='Typo',false],
  ['unknown chart field',d=>d.slides[4].chart[0].percent=40,false],
  ['invalid inverse',d=>d.slides[0].inverse='yes',false],
  ['language tag',d=>d.lang='pt-BR',true],
  ['RTL',d=>d.dir='rtl',true],
  ['invalid direction',d=>d.dir='diagonal',false],
  ['custom controls',d=>d.labels={next:'Continue'},true],
  ['unknown control',d=>d.labels={wat:'Continue'},false],
  ['invalid language',d=>d.lang='en" onload="bad',false],
  ['invalid motion intensity',d=>d.transitions={intensity:4},false],
  ['invalid slide motion',d=>d.slides[0].transitions={effect:'spin'},false],
  ['invalid stagger',d=>d.transitions={stagger:-1},false],
  ['cinematic slide override',d=>d.slides[0].transitions={effect:'focus',intensity:0.5},true],
  ['invalid motion enabled',d=>d.transitions={enabled:'yes'},false],
  ['invalid motion effect',d=>d.transitions={effect:'spin'},false],
  ['invalid motion duration',d=>d.transitions={duration:10},false],
  ['invalid motion easing',d=>d.transitions={easing:'surprise'},false],
  ['disabled motion',d=>d.transitions={enabled:false},true],
  ['empty deck',d=>d.slides=[],false],
  ['unsafe id',d=>d.id='../escape',false],
  ['unknown layout',d=>d.slides[0].layout='not-a-layout',false],
  ['non-array features',d=>d.slides[0].features={},false],
  ['remote image',d=>d.slides[0].images[0].src='https://example.com/image.jpg',false],
  ['traversal image',d=>d.slides[0].images[0].src='../city.jpg',false],
  ['missing alt',d=>delete d.slides[0].images[0].alt,false],
  ['bad position',d=>d.slides[0].images[0].x=110,false],
  ['chart out of range',d=>d.slides[4].chart[0].value=101,false],
  ['negative chart',d=>d.slides[4].chart[0].value=-1,false],
  ['one slide',d=>d.slides=d.slides.slice(0,1),true],
  ['ten slides',d=>d.slides.push(structuredClone(d.slides[0])),true],
];
for(const [label,change,valid] of cases){
 const deck=structuredClone(base); change(deck);writeFileSync(`${tmp}/deck.json`,JSON.stringify(deck));
 const result=spawnSync(process.env.KUJO_BIN||'kujo',['run','build.kujo','--','--deck',tmp,'--check'],{encoding:'utf8'});
 assert.equal(result.status===0,valid,`${label}: ${result.stdout}${result.stderr}`);
 if(!valid) assert(result.stdout.includes('Presentation error:'),`${label} must return an actionable validation error`);
}
writeFileSync(`${tmp}/escape.kujo`,'from src.model import text\nprint(text("<script> & \\\" {{body}}"))\n');
const escaped=spawnSync(process.env.KUJO_BIN||'kujo',['run',`${tmp}/escape.kujo`],{encoding:'utf8'});
assert.equal(escaped.status,0,escaped.stderr);
assert(escaped.stdout.includes('&lt;script&gt; &amp; &quot; &#123;&#123;body&#125;&#125;'));
rmSync(tmp,{recursive:true});
console.log('Static contracts, escaping, variable deck length and invalid content checks passed.');
