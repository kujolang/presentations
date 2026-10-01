import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync, renameSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import { once } from 'node:events';

const kujo = process.env.KUJO_BIN || 'kujo';
function fixture(suffix) {
  const id = `safety-${process.pid}-${suffix}`, source = `.build/source-${id}`;
  mkdirSync(`${source}/assets`, {recursive:true});
  writeFileSync(`${source}/assets/theme.css`, '');
  writeFileSync(`${source}/deck.json`, JSON.stringify({id,title:'Build safety',brand:'Test',description:'Test',slides:[{layout:'statement',title:'Build safety'}]}));
  const output=`output/${id}`, lock=`.build/.locks/${id}`, backup=`.build/${id}.previous`;
  mkdirSync(output,{recursive:true}); writeFileSync(`${output}/index.html`,'last good deck');
  const args=['run','build.kujo','--','--deck',source];
  return {id,source,output,lock,backup,args,
    run: (...extra)=>spawnSync(kujo,[...args,...extra],{encoding:'utf8',timeout:120000}),
    clean: ()=>{for(const path of [source,output,lock,backup,`.build/${id}`]) rmSync(path,{recursive:true,force:true});}};
}

test('deck assets reject symlinks, cycles, hidden files and special files before publication', () => {
  const f=fixture('assets');
  const cases=[
    ['file-link', p=>symlinkSync('theme.css',p)],
    ['external-link', p=>symlinkSync('/etc/hosts',p)],
    ['directory-link', p=>symlinkSync('.',p)],
    ['dangling-link', p=>symlinkSync('missing',p)],
    ['.env', p=>writeFileSync(p,'private fixture')],
    ['pipe', p=>assert.equal(spawnSync('mkfifo',[p]).status,0)],
  ];
  try {
    for(const [name,create] of cases) {
      const path=`${f.source}/assets/${name}`;create(path);
      for(const flags of [[],['--check']]) {
        const result=f.run(...flags);assert.notEqual(result.status,0,`${name} accepted`);
        assert.match(result.stdout,/symlinks|Hidden assets|regular file/);
        assert.equal(readFileSync(`${f.output}/index.html`,'utf8'),'last good deck');
        assert(!existsSync(f.lock));
      }
      rmSync(path,{force:true});
    }
    const deep=`${f.source}/assets/${'nested/'.repeat(17)}`;
    mkdirSync(deep,{recursive:true});
    const tooDeep=f.run('--check');
    assert.match(tooDeep.stdout+tooDeep.stderr,/exceeds 16/);
    rmSync(`${f.source}/assets/nested`,{recursive:true});
    renameSync(`${f.source}/assets`,`${f.source}/public`);
    symlinkSync('public',`${f.source}/assets`);
    assert.match(f.run().stdout,/symlinks/);
  } finally {f.clean();}
});

test('failed and conflicting builds preserve output; interrupted publication is recovered', async () => {
  const f=fixture('recovery'), ssg=`${f.source}/ssg`;
  mkdirSync(`${ssg}/assets/fonts`,{recursive:true});
  for(const font of ['bree-serif-latin-400.woff2','inter-latin-400.woff2','inter-latin-700.woff2']) writeFileSync(`${ssg}/assets/fonts/${font}`,'fixture');
  writeFileSync(`${ssg}/build.kujo`,'spawn_process(["sleep", "2"], {})\nprint("Expected SSG failure")\nexit(7)\n');
  let child;
  try {
    child=spawn(kujo,[...f.args,'--ssg',ssg],{stdio:'ignore'});
    const finished=once(child,'exit');
    for(let i=0;!existsSync(f.lock)&&i<200;i++) await new Promise(r=>setTimeout(r,20));
    assert(existsSync(f.lock),'first build acquired lock');
    const competing=f.run('--ssg',ssg);
    assert.notEqual(competing.status,0);assert.match(competing.stdout,/Build locked/);
    assert.notEqual((await finished)[0],0);
    assert(!existsSync(f.lock),'failed worker releases lock');
    assert.equal(readFileSync(`${f.output}/index.html`,'utf8'),'last good deck');
    // Reproduce the on-disk state after interruption between the two renames.
    renameSync(f.output,f.backup);mkdirSync(f.lock);
    assert.match(f.run('--ssg',ssg).stdout,/Build locked/);
    rmSync(f.lock,{recursive:true}); // Operator has confirmed no build remains.
    const recovered=f.run('--ssg',ssg);
    assert.notEqual(recovered.status,0);assert.match(recovered.stdout,/Expected SSG failure/);
    assert.equal(readFileSync(`${f.output}/index.html`,'utf8'),'last good deck');
    assert(!existsSync(f.backup));assert(!existsSync(f.lock));
    const success=f.run();assert.equal(success.status,0,success.stdout+success.stderr);
    assert(readFileSync(`${f.output}/index.html`,'utf8').includes('Build safety'));
    assert(!existsSync(f.backup));assert(!existsSync(f.lock));
  } finally {if(child?.exitCode===null) child.kill();f.clean();}
});
