// Explicit setup only; ordinary builds are offline and never fetch dependencies.
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const lock=JSON.parse(readFileSync('dependencies.json','utf8'));
mkdirSync('.deps',{recursive:true});
for (const [name, dep] of Object.entries(lock)) {
  const path=`.deps/${name === 'sitekit' ? 'site-kit' : name}`;
  if (!existsSync(path)) {
    execFileSync('git',['clone','--no-checkout',dep.repository,path],{stdio:'inherit'});
    execFileSync('git',['-C',path,'checkout','--detach',dep.commit],{stdio:'inherit'});
  } else {
    const head=execFileSync('git',['-C',path,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
    const dirty=execFileSync('git',['-C',path,'status','--porcelain'],{encoding:'utf8'}).trim();
    if (head!==dep.commit || dirty) throw new Error(`Refusing to overwrite ${path}; use a clean checkout at ${dep.commit}`);
  }
  if (name==='sitekit' && !existsSync(`${path}/dist/sitekit.css`)) {
    execFileSync('npm',['ci'],{cwd:path,stdio:'inherit'});
    execFileSync('npm',['run','build'],{cwd:path,stdio:'inherit'});
  }
}
