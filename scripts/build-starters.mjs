import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
for(const starter of JSON.parse(readFileSync('starters/catalog.json','utf8'))) {
  execFileSync('kujo',['run','build.kujo','--','--deck',starter.path],{stdio:'inherit'});
}
