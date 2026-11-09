import {execFileSync} from 'node:child_process';
import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
execFileSync(process.execPath,['scripts/deck.mjs','build','--deck','decks/kujo-investor','--site-url','https://invest.kujolang.ai'],{stdio:'inherit'});
const dir='.build/investor-pages';await rm(dir,{recursive:true,force:true});await mkdir(dir,{recursive:true});await cp('output/kujo-investor',dir,{recursive:true});
await writeFile(`${dir}/_headers`,'/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Cache-Control: public, max-age=0, must-revalidate\n');
console.log(`Pages artifact: ${dir}`);
