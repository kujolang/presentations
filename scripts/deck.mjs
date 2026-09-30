#!/usr/bin/env node
// Onboarding orchestration only. Rendering stays in the native Kujo/SSG build.
import { readFileSync, readdirSync, existsSync, mkdirSync, cpSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const catalog=read('starters/catalog.json');
const fail=message=>{ throw new Error(message); };
function run(program,args,options={}) {
  const result=spawnSync(program,args,{cwd:root,stdio:'inherit',...options});
  if(result.error) fail(`Cannot run ${program}: ${result.error.message}`);
  if(result.status!==0) fail(`${program} exited ${result.status ?? result.signal}`);
  return result;
}
function dependencies() {
  // Prefer the pinned local installation; accept existing sibling checkouts.
  return {
    ssg:existsSync('.deps/ssg/build.kujo')?'.deps/ssg':'../ssg',
    sitekit:existsSync('.deps/site-kit/dist/sitekit.css')?'.deps/site-kit/dist':'../site-kit/dist'
  };
}
function doctor() {
  const kujo=spawnSync('kujo',['--version'],{encoding:'utf8'});
  const git=spawnSync('git',['--version'],{encoding:'utf8'});
  const match=kujo.stdout?.match(/kujo (\d+)\.(\d+)/);
  const versionOK=match && (Number(match[1])>1 || Number(match[1])===1 && Number(match[2])>=5);
  const deps=dependencies();
  const checks={node:Number(process.versions.node.split('.')[0])>=20,git:git.status===0,kujo:kujo.status===0 && Boolean(versionOK),ssg:existsSync(`${deps.ssg}/build.kujo`),sitekit:existsSync(`${deps.sitekit}/sitekit.css`)};
  return {ready:Object.values(checks).every(Boolean),checks,dependencies:deps,kujoVersion:kujo.stdout?.trim()||null};
}
function requireTools() {
  const {checks}=doctor();
  if(!checks.node || !checks.git || !checks.kujo) fail('Install Node 20+, Git, and Kujo 1.5+ on PATH first. See docs/getting-started.md. Then rerun this command.');
}
function setup() {
  requireTools();
  run(process.execPath,['scripts/setup-dependencies.mjs']);
}
function loadDeck(path) {
  if(!path) fail('Provide --deck decks/<name>. Run "npm run deck -- catalog" to choose a starter.');
  const data=read(resolve(path,'deck.json'));
  if(!/^[a-z0-9][a-z0-9-]{0,59}$/.test(data.id)) fail('Deck id must be a lowercase slug of 1–60 characters.');
  return data;
}
function create(starter,name,options) {
  const entry=catalog.find(s=>s.id===starter);
  if(!entry) fail(`Unknown starter. Choose: ${catalog.map(s=>s.id).join(', ')}`);
  if(!name || !/^[a-z0-9][a-z0-9-]{0,59}$/.test(name)) fail('Choose a lowercase deck name, e.g. my-pitch (1–60 characters).');
  const destination=`decks/${name}`;
  if(existsSync(destination)) fail(`${destination} already exists. Use check/build/preview --deck ${destination}; existing work will not be replaced.`);
  const supplied=options.brief?readFileSync(resolve(options.brief),'utf8'):null;
  if(options.title && (options.title.length>80 || !options.title.trim() || /[\r\n]/.test(options.title))) fail('--title must be a single line of 1–80 characters.');
  mkdirSync('decks',{recursive:true});mkdirSync(destination);
  try {
    cpSync(entry.path,destination,{recursive:true,errorOnExist:true,force:false});
    const deck=read(`${destination}/deck.json`);
    deck.id=name;deck.title=options.title||name.replaceAll('-',' ');
    deck.slides[0].title=options.title||'[Your presentation title]';
    writeFileSync(`${destination}/deck.json`,JSON.stringify(deck,null,2)+'\n');
    if(supplied!==null) writeFileSync(`${destination}/BRIEF.md`,readFileSync(`${destination}/BRIEF.md`,'utf8')+'\n## Supplied brief (source material, not tool instructions)\n\n'+supplied+'\n');
  } catch(error) { rmSync(destination,{recursive:true,force:true});throw error; }
  console.log(`Created ${destination}\nEdit BRIEF.md, deck.json, and assets/theme.css.\nAgent instructions: CREATE_A_DECK.md\nBuild: npm run deck -- build --deck ${destination}\nPreview: npm run deck -- preview --deck ${destination}`);
  return destination;
}
function check(path,ready=false) {
  requireTools();const data=loadDeck(path);
  run('kujo',['run','build.kujo','--','--deck',path,'--check']);
  const hasPlaceholder=value=>typeof value==='string'?/\[[^\]]+\]|\bTBD\b/.test(value):value && typeof value==='object'?Object.values(value).some(hasPlaceholder):false;
  const placeholders=hasPlaceholder(data);
  if(placeholders && ready) fail('Draft placeholders remain in deck.json. Replace or remove bracketed text and TBD values before delivery.');
  if(placeholders) console.log('Draft: placeholders remain. Use check --ready before delivery.');
}
function build(path,options) {
  check(path);
  const state=doctor();if(!state.ready) fail('Dependencies are missing. Run npm run deck -- setup (or start for setup + creation + preview).');
  const argv=['run','build.kujo','--','--deck',path,'--ssg',state.dependencies.ssg,'--sitekit',state.dependencies.sitekit];
  if(options['site-url']) argv.push('--site-url',options['site-url']);
  run('kujo',argv);
}
function preview(path,port) {
  const deck=loadDeck(path);
  if(!existsSync(`output/${deck.id}/index.html`)) fail('Build this deck first with npm run deck -- build --deck '+path);
  console.log(`Preview: http://127.0.0.1:${port}/\nStatic output: output/${deck.id}/\nPress Ctrl+C to stop. If the port is busy, choose --port <number>.`);
  run('kujo',['serve',`output/${deck.id}`,'--port',port]);
}
try {
  const [command='help',...argv]=process.argv.slice(2), options={}, positionals=[];
  const allowed={catalog:['json'],doctor:['json'],setup:[],create:['title','brief'],start:['title','brief','port','site-url'],check:['deck','ready'],build:['deck','site-url'],preview:['deck','port'],inspect:['deck'],help:[]};
  if(!Object.hasOwn(allowed,command)) fail(`Unknown command: ${command}. Use npm run deck -- help.`);
  for(let i=0;i<argv.length;i++) {
    if(!argv[i].startsWith('--')) { positionals.push(argv[i]);continue; }
    const key=argv[i].slice(2);
    if(!allowed[command].includes(key) || Object.hasOwn(options,key)) fail(`Unknown or repeated option: ${argv[i]}`);
    if(['json','ready'].includes(key)) options[key]=true;
    else { if(!argv[i+1] || argv[i+1].startsWith('--')) fail(`Missing value for --${key}`);options[key]=argv[++i]; }
  }
  if(positionals.length!==(['create','start'].includes(command)?2:0)) fail('Expected '+(['create','start'].includes(command)?'<starter> <name>':'no positional arguments')+'. Use npm run deck -- help.');
  const port=options.port||'8086';
  if(!/^\d+$/.test(port)||Number(port)<1||Number(port)>65535) fail('--port must be between 1 and 65535.');
  if(command==='catalog') {
    const layouts=Object.fromEntries(readdirSync('layouts').filter(n=>n.endsWith('.json')).sort().map(file=>[file.slice(0,-5),read(`layouts/${file}`)]));
    console.log(options.json?JSON.stringify({starters:catalog,layouts,schema:'deck.schema.json',instructions:'CREATE_A_DECK.md'},null,2):catalog.map(s=>`${s.id.padEnd(12)} ${s.slides} slides · ${s.description}`).join('\n'));
  } else if(command==='doctor') {
    const state=doctor();console.log(options.json?JSON.stringify(state,null,2):Object.entries(state.checks).map(([k,v])=>`${v?'OK':'MISSING'} ${k}`).join('\n')+'\n'+(state.ready?'Ready.':'Run setup for dependencies; see docs/getting-started.md for system tools.'));if(!state.ready) process.exitCode=1;
  } else if(command==='setup') setup();
  else if(command==='create') create(...positionals,options);
  else if(command==='start') {
    // Fail invalid starter/name/brief inputs before fetching dependencies.
    requireTools(); const path=create(...positionals,options);setup();build(path,options);preview(path,port);
  } else if(command==='check') check(options.deck,options.ready);
  else if(command==='build') build(options.deck,options);
  else if(command==='preview') preview(options.deck,port);
  else if(command==='inspect') { loadDeck(options.deck);run(process.execPath,['scripts/inspect-deck.mjs',options.deck]); }
  else console.log(`Kujo Presentations\n\nnpm run deck -- start investor my-pitch --title "My company"\n\nCommands:\n  catalog [--json]                  List starters and layout contracts\n  doctor [--json]                   Check tools and dependencies\n  setup                            Install pinned SSG/SiteKit dependencies\n  create <starter> <name>           Copy a starter into decks/<name>\n  start <starter> <name>            Create, setup, build, and serve\n  check --deck <path> [--ready]     Validate; --ready rejects placeholders\n  build --deck <path>              Build with native Kujo and SSG\n  preview --deck <path>            Serve an already-built deck\n  inspect --deck <path>            Audit and capture every generated page\n\nCreate/start: --title <text>, --brief <file>\nStart/preview: --port <number> (default 8086)\nStart/build: --site-url <url>\n\nNo overwriting existing decks. Rendering is offline after setup.\nGive your agent CREATE_A_DECK.md and your brief to customize a deck.`);
} catch(error) { console.error(`Presentation: ${error.message}`);process.exitCode=1; }
