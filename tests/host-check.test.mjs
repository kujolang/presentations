import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';

test('host checker rejects public private-deck routes and unsafe caching',async()=>{
 let protect=true,cache='no-cache';
 const server=createServer((req,res)=>{
  if(protect&&req.headers.authorization!=='Bearer fixture'){res.writeHead(401);res.end();return;}
  const type=req.url.endsWith('.js')?'text/javascript':req.url.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':cache,'Content-Security-Policy':"default-src 'self'",'X-Content-Type-Options':'nosniff'});res.end('fixture');
 });
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const run=async()=>{const child=spawn(process.execPath,['scripts/verify-host.mjs',`http://127.0.0.1:${server.address().port}/deck/`,'--private'],{env:{...process.env,PRESENTATION_AUTHORIZATION:'Bearer fixture'}});let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);const [code]=await once(child,'exit');return {code,output};};
 try{
  const pass=await run();assert.equal(pass.code,0,pass.output);assert(!pass.output.includes('Bearer fixture'));
  protect=false;assert.notEqual((await run()).code,0);
  protect=true;cache='max-age=31536000, immutable';assert.notEqual((await run()).code,0);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
