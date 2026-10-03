import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {root,env} from './common.mjs';
const server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1);
 const file=path.resolve(root,rel);
 if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',file.endsWith('.mp4')?'video/mp4':file.endsWith('.wav')?'audio/wav':'text/html');
 res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({executablePath:env.HYPERFRAMES_BROWSER_PATH,headless:true,pipe:true,args:['--autoplay-policy=no-user-gesture-required']});
try{
 const page=await browser.newPage();
 await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
 const result=await page.evaluate(async()=>{
  const context=new AudioContext();await context.resume();
  const master=await context.decodeAudioData(await (await fetch('/audio/master.wav')).arrayBuffer());
  document.body.innerHTML='<video playsinline src="/output/release-complete.mp4"></video>';
  const video=document.querySelector('video');const source=context.createMediaElementSource(video);
  const analyser=context.createAnalyser();const sink=context.createGain();sink.gain.value=0;
  source.connect(analyser);analyser.connect(sink);sink.connect(context.destination);
  let peak=0,nonzeroWindows=0,frames=0;
  const samples=new Float32Array(analyser.fftSize);
  const timer=setInterval(()=>{analyser.getFloatTimeDomainData(samples);let p=0;for(const n of samples)p=Math.max(p,Math.abs(n));peak=Math.max(peak,p);if(p>.0001)nonzeroWindows++;},50);
  const frame=()=>{frames++;video.requestVideoFrameCallback(frame);};video.requestVideoFrameCallback(frame);
  await new Promise((resolve,reject)=>{const deadline=setTimeout(()=>reject(Error('Audio playback did not finish in 45 seconds')),45000);video.onended=()=>{clearTimeout(deadline);resolve();};video.onerror=()=>{clearTimeout(deadline);reject(Error('Video failed'));};video.play().catch(reject);});
  clearInterval(timer);await context.close();
  return {ended:video.ended,duration:video.duration,width:video.videoWidth,height:video.videoHeight,frames,droppedFrames:video.getVideoPlaybackQuality().droppedVideoFrames,audioPeak:peak,nonzeroAudioWindows:nonzeroWindows,masterDuration:master.duration,masterChannels:master.numberOfChannels,masterSampleRate:master.sampleRate};
 });
 assert(result.ended&&result.duration===15&&result.width===1920&&result.height===1080);
 assert(result.audioPeak>.1&&result.nonzeroAudioWindows>200);
 assert(result.masterDuration===15&&result.masterChannels===2);
 fs.writeFileSync(path.join(root,'output/audio-browser-verification.json'),JSON.stringify({ok:true,...result,method:'Browser playback and Web Audio signal analysis; output sink silenced, not a subjective listening review.'},null,2)+'\n');
 console.log(result);
}finally{await browser.close();await new Promise(r=>server.close(r));}
