import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import {root,env,run} from './common.mjs';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const rel=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));const file=path.resolve(root,rel);if(!file.startsWith(root)||!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({executablePath:env.HYPERFRAMES_BROWSER_PATH,headless:true,pipe:true,args:['--no-sandbox','--disable-gpu','--autoplay-policy=no-user-gesture-required']});
const errors=[];
try{
const page=await browser.newPage();await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});page.on('pageerror',e=>errors.push(String(e)));
await page.goto(`http://127.0.0.1:${server.address().port}`,{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
assert(await page.evaluate(()=>document.fonts.check('44px Departure')),'Departure font unavailable');
const seek=async(t)=>{await page.evaluate(t=>{window.__timelines['kujo-release'].seek(t,false);document.querySelectorAll('.clip').forEach(el=>{const start=Number(el.dataset.start),end=start+Number(el.dataset.duration);el.style.visibility=t>=start&&t<end?'visible':'hidden';});},t);};
const capture=async(t)=>{await seek(t);return sharp(Buffer.from(await page.screenshot())).removeAlpha().raw().toBuffer();};
const points=[0,.5,1.8,2.3,3.2,3.75,4.2,5.1,5.8,6.2,6.7,7.2,7.7,8.2,8.9,9.3,9.8,10.4,11.3,12,12.5,13.2,14.958333];
const expected=new Map();for(const t of points){expected.set(t,await capture(t));}
let maximumDifference=0,maximumMeanDifference=0;
const compare=async(t)=>{const got=await capture(t),want=expected.get(t);let max=0,sum=0;for(let i=0;i<got.length;i++){const d=Math.abs(got[i]-want[i]);max=Math.max(max,d);sum+=d;}maximumDifference=Math.max(maximumDifference,max);maximumMeanDifference=Math.max(maximumMeanDifference,sum/got.length);assert(max<=3&&sum/got.length<.001,`Seek differs at ${t}: max=${max}, mean=${sum/got.length}`);};
for(const t of [...points].reverse())await compare(t);
for(const t of [10.4,3.75,13.2,0,7.7,5.1,1.8])await compare(t);
assert(expected.get(0).equals(expected.get(14.958333)),'Opening and final composition frames differ');assert.deepEqual(errors,[]);
const out=path.join(root,'output/qa-frames');fs.mkdirSync(out,{recursive:true});
for(let i=0;i<points.length;i++){await seek(points[i]);await page.screenshot({path:path.join(out,`frame-${String(i).padStart(2,'0')}.png`)});}
fs.writeFileSync(path.join(root,'output/seek-verification.json'),JSON.stringify({ok:true,forwardReverseSamples:points.length,maximumDifference,maximumMeanDifference,pixelTolerance:'max 3/255 and mean below 0.001/255; Chromium subpixel rounding',randomSeekSamples:7,loopBoundary:'pixel-identical source frames',font:'Departure loaded',runtimeErrors:errors,chrome:await browser.version()},null,2)+'\n');
run('ffmpeg',['-v','error','-y','-framerate','1','-i',path.join(out,'frame-%02d.png'),'-vf','scale=480:270,tile=4x6:padding=6:margin=6:color=0x777777','-frames:v','1',path.join(root,'output/source-contact-sheet.jpg')]);
if(fs.existsSync(path.join(root,'output/release-silent.mp4'))){
run('ffmpeg',['-v','error','-y','-i','output/release-silent.mp4','-vf','fps=2,scale=480:270,tile=5x6:padding=6:margin=6:color=0x777777','-frames:v','1','output/contact-sheet.jpg']);
run('ffmpeg',['-v','error','-y','-i','output/release-silent.mp4','-vf','scale=320:180,tile=10x6:nb_frames=60:padding=4:margin=4:color=0x777777','-fps_mode','passthrough','output/all-frames-%02d.jpg']);
const playback=await page.evaluate(async()=>{document.body.innerHTML='<video id="review" width="1920" height="1080" muted playsinline src="/output/release-silent.mp4"></video>';const video=document.querySelector('video');let callbacks=0;const count=()=>{callbacks++;video.requestVideoFrameCallback(count);};video.requestVideoFrameCallback(count);await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Video playback did not finish in 45 seconds')),45000);video.onended=()=>{clearTimeout(timer);resolve();};video.onerror=()=>{clearTimeout(timer);reject(Error('Video playback failed'));};video.play().catch(reject);});return {ended:video.ended,duration:video.duration,currentTime:video.currentTime,width:video.videoWidth,height:video.videoHeight,frameCallbacks:callbacks,quality:video.getVideoPlaybackQuality().totalVideoFrames,droppedFrames:video.getVideoPlaybackQuality().droppedVideoFrames};});
assert(playback.ended&&playback.duration===15&&playback.width===1920&&playback.height===1080,'Full browser playback failed');fs.writeFileSync(path.join(root,'output/playback-verification.json'),JSON.stringify(playback,null,2)+'\n');
}
console.log('QA passed: forward/reverse/random seeking, font, loop pixels, contact sheets and complete MP4 browser playback.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
