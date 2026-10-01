import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

test('native build preserves plain text, language and reading notes; ships only needed motion', () => {
  const id = `review-${process.pid}`, source = `.build/source-${id}`;
  mkdirSync(`${source}/assets`, { recursive: true });
  writeFileSync(`${source}/assets/theme.css`, '');
  writeFileSync(`${source}/speaker-notes.private.json`, 'PRIVATE-NOTES-SENTINEL');
  const title = 'Literal <b> "quotes" & {{content}} : #';
  const deck = {id, title, brand:'Review', description:'Plain <text> & "quotes" {{content}}', lang:'fr-CA',
    transitions:{enabled:true,effect:'fade'}, slides:[{layout:'statement',title,eyebrow:'Context',note:'Source: review'}]};
  writeFileSync(`${source}/deck.json`, JSON.stringify(deck));
  try {
    const result = spawnSync(process.env.KUJO_BIN || 'kujo', ['run','build.kujo','--','--deck',source,'--site-url','https://example.com/talk/'], {encoding:'utf8'});
    assert.equal(result.status,0,result.stdout+result.stderr);
    const html=readFileSync(`output/${id}/1/index.html`,'utf8');
    assert(html.includes('lang="fr-CA"'));
    assert.equal((html.match(/<!doctype html>/gi)||[]).length,1);
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
    assert(html.includes('href="https://example.com/talk/1/"'));
    assert(html.includes('content="Plain &lt;text&gt; &amp; &quot;quotes&quot; &#123;&#123;content&#125;&#125;"'));
    assert(html.includes('href="../assets/sitekit/sitekit.css"'));
    assert(!html.includes('<b>'), 'plain text must not become HTML');
    assert(html.includes('&lt;b&gt;'), 'literal angle brackets preserved');
    const heading=html.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1];
    assert(heading.includes('&#123;&#123;content&#125;&#125;'), 'body slots must encode template-shaped text');
    const pageTitle=html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert(pageTitle.includes('Literal &lt;b&gt; &quot;quotes&quot; &amp; &#123;&#123;content&#125;&#125; : #'), `metadata must preserve literal text: ${pageTitle}`);
    const reading=readFileSync(`output/${id}/reading/index.html`,'utf8');
    assert(reading.includes('Context') && reading.includes('Source: review'));
    assert(existsSync(`output/${id}/assets/presentation/motion/motion-mini.js`));
    assert(!existsSync(`output/${id}/assets/presentation/motion/motion-hybrid.js`));
    console.log(`Basic-motion output omits ${statSync('vendor/motion/motion-hybrid.js').size} bytes of unused hybrid JavaScript.`);
    // Keep the SSG interpreter fast path byte-identical to the default VM.
    const parity=spawnSync(process.env.KUJO_BIN||'kujo',['run',resolve('.deps/ssg/build.kujo'),'--','--output','parity-site','--no-aux','--no-aliases','--no-webmcp'],{cwd:`.build/${id}`,encoding:'utf8',timeout:120000});
    assert.equal(parity.status,0,parity.stdout+parity.stderr);
    const files=(path)=>readdirSync(path,{recursive:true}).filter(name=>statSync(`${path}/${name}`).isFile()).sort();
    const expected=files(`output/${id}`), actual=files(`.build/${id}/parity-site`);
    assert.deepEqual(actual,expected);
    assert(!expected.some(file=>file.includes('private')));
    for(const file of expected.filter(file=>file.endsWith('.html')))assert(!readFileSync(`output/${id}/${file}`,'utf8').includes('PRIVATE-NOTES-SENTINEL'));
    for(const file of expected) assert(readFileSync(`output/${id}/${file}`).equals(readFileSync(`.build/${id}/parity-site/${file}`)),`SSG execution-mode mismatch: ${file}`);
    const duplicate=spawnSync(process.env.KUJO_BIN || 'kujo',['run','build.kujo','--','--deck',source,'--deck',source,'--check'],{encoding:'utf8'});
    assert.notEqual(duplicate.status,0);assert(duplicate.stdout.includes('Repeated option'));
  } finally {
    for(const path of [source,`.build/${id}`,`output/${id}`]) rmSync(path,{recursive:true,force:true});
  }
});
