import {mkdirSync,writeFileSync,readFileSync,readdirSync,statSync,rmSync} from 'node:fs';
import {spawnSync,spawn} from 'node:child_process';
import {performance} from 'node:perf_hooks';
import {platform,cpus,totalmem} from 'node:os';
import {chromium} from '@playwright/test';
const counts=process.argv.slice(2).length?process.argv.slice(2).map(Number):[10,100,500];
if(counts.some(n=>!Number.isInteger(n)||n<1||n>500))throw Error('Use slide counts from 1 to 500');
const budgets=JSON.parse(readFileSync('benchmarks/budgets.json','utf8'));
const report={platform:platform(),budgets,cpu:cpus()[0].model,memoryBytes:totalmem(),fixture:'statement, text-only, no motion',results:[]};
const bytes=path=>readdirSync(path).reduce((sum,name)=>sum+(statSync(`${path}/${name}`).isDirectory()?bytes(`${path}/${name}`):statSync(`${path}/${name}`).size),0);
const server=spawn(process.execPath,['tests/static-host.mjs'],{stdio:'ignore',env:{...process.env,PORT:'8094'}});
const browser=await chromium.launch();
try {
 for(const n of counts){
  const id=`benchmark-${n}`,source=`.build/source-${id}`;
  mkdirSync(`${source}/assets`,{recursive:true});writeFileSync(`${source}/assets/theme.css`,'');
  writeFileSync(`${source}/deck.json`,JSON.stringify({id,title:'Measured presentation',brand:'Benchmark',description:'Deterministic text-only fixture',slides:Array.from({length:n},(_,i)=>({layout:'statement',title:`Slide ${i+1}`,copy:'A repeatable fixture for measuring generation and overview costs.'}))}));
  const started=performance.now();
  const result=spawnSync('/usr/bin/time',[...(platform()==='darwin'?['-l']:['-v']),process.env.KUJO_BIN||'kujo','run','build.kujo','--','--deck',source],{encoding:'utf8',timeout:1800000,maxBuffer:8*1024*1024});
  const row={slides:n,buildMs:Math.round(performance.now()-started),status:result.status};
  const memory=result.stderr.match(/(\d+)\s+maximum resident set size/)||result.stderr.match(/Maximum resident set size \(kbytes\):\s*(\d+)/);
  row.peakRssBytes=memory?Number(memory[1])*(platform()==='darwin'?1:1024):null;
  if(result.status!==0){row.error=(result.stdout+result.stderr).slice(-3000);report.results.push(row);break;}
  row.outputBytes=bytes(`output/${id}`);
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),ready=performance.now();
  await page.goto(`http://127.0.0.1:8094/${id}/`,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
  row.overviewReadyMs=Math.round(performance.now()-ready);
  row.scroll=await page.evaluate(async()=>{const intervals=[];let previous=performance.now();for(let i=0;i<60;i++){scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*i/59);await new Promise(requestAnimationFrame);const now=performance.now();intervals.push(now-previous);previous=now;}return {frames:60,meanFrameMs:intervals.reduce((a,b)=>a+b)/60,maxFrameMs:Math.max(...intervals),lastVisible:document.querySelector('.p-thumbnail:last-child').getBoundingClientRect().top<innerHeight};});
  await page.close();
  row.budgetViolations=[];
  for(const [key,limit] of [['buildMs',budgets.buildMs[n]||budgets.buildMs['500']],['peakRssBytes',budgets.peakRssBytes],['outputBytes',budgets.baseOutputBytes+n*budgets.outputBytesPerSlide],['overviewReadyMs',budgets.overviewReadyMs]])if(row[key]===null||row[key]>limit)row.budgetViolations.push(key);
  if(row.scroll.meanFrameMs>budgets.meanScrollFrameMs||row.scroll.maxFrameMs>budgets.maxScrollFrameMs||!row.scroll.lastVisible)row.budgetViolations.push('scroll');
  report.results.push(row);console.log(JSON.stringify(row));
  rmSync(source,{recursive:true,force:true});
 }
}finally{await browser.close();server.kill();mkdirSync('docs/evidence',{recursive:true});writeFileSync(counts.join(',')==='10,100,500'?'docs/evidence/benchmarks.json':`docs/evidence/benchmarks-${counts.join('-')}.json`,JSON.stringify(report,null,2)+'\n');}
if(report.results.some(r=>r.status!==0||r.budgetViolations?.length))process.exitCode=1;
