// Exercise the advertised one-command path, including a real preview server.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { rmSync } from 'node:fs';
const name=`start-smoke-${process.pid}`;
const socket=createServer();await new Promise(done=>socket.listen(0,'127.0.0.1',done));
const port=socket.address().port;await new Promise(done=>socket.close(done));
const child=spawn(process.execPath,['scripts/deck.mjs','start','live-talk',name,'--title','A smoke test talk','--port',String(port)],{detached:true,stdio:['ignore','pipe','pipe']});
const closed=new Promise(done=>child.once('close',done));
let log='',exit=null;child.stdout.on('data',d=>log+=d);child.stderr.on('data',d=>log+=d);child.on('exit',code=>exit=code);
try {
 const deadline=Date.now()+180000;
 let html='';
 while(Date.now()<deadline) {
  if(exit!==null) throw new Error(log);
  try {const response=await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(1000)});if(response.ok){html=await response.text();break;}} catch {}
  await new Promise(done=>setTimeout(done,200));
 }
 assert(html.includes('A smoke test talk'),log||'Preview did not start');
 assert(log.includes('Created decks/'+name));
 const slide=await fetch(`http://127.0.0.1:${port}/7/`);assert.equal(slide.status,200);assert((await slide.text()).includes('7 / 7'));
 console.log('PASS one-command start: scaffold → cached setup → native build → HTTP preview.');
} finally {
 try {process.kill(-child.pid,'SIGTERM');} catch {}
 await closed;
 for(const path of [`decks/${name}`,`output/${name}`,`.build/${name}`]) rmSync(path,{recursive:true,force:true});
}
