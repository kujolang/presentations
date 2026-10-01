import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('native build preserves plain text, language and reading notes; ships only needed motion', () => {
  const id = `review-${process.pid}`, source = `.build/source-${id}`;
  mkdirSync(`${source}/assets`, { recursive: true });
  writeFileSync(`${source}/assets/theme.css`, '');
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
    const duplicate=spawnSync(process.env.KUJO_BIN || 'kujo',['run','build.kujo','--','--deck',source,'--deck',source,'--check'],{encoding:'utf8'});
    assert.notEqual(duplicate.status,0);assert(duplicate.stdout.includes('Repeated option'));
  } finally {
    for(const path of [source,`.build/${id}`,`output/${id}`]) rmSync(path,{recursive:true,force:true});
  }
});
