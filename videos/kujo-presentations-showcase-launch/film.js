/* Six beats, one continuous stage. All state is set by this paused timeline. */
const C = window.FILM, B = window.BEATS;
const $ = (s) => document.querySelector(s);
C.task.split('').forEach(c => { const span = document.createElement('span'); span.className = 'char'; span.textContent = c; $('#typed').append(span); });
C.stages.forEach(([number,name,detail],i) => {
  const row=document.createElement('div');row.className='stage';row.id=`stage-${i}`;
  row.innerHTML=`<div class="stage-fill"></div><span class="stage-num"></span><span class="stage-name"></span><span class="stage-state">+</span>`;
  row.querySelector('.stage-num').textContent=number;row.querySelector('.stage-name').textContent=name;
  row.setAttribute('aria-label',`${name}: ${detail}`);$('#stage-list').append(row);
});
C.evidence.forEach((copy,i)=>{
  const row=document.createElement('div');row.className='receipt';row.id=`receipt-${i}`;
  row.innerHTML=`<div class="check-box"><svg viewBox="0 0 40 40"><path class="check-path" d="M7 20 L16 29 L33 10"/></svg></div><span class="receipt-copy"></span>`;
  row.querySelector('.receipt-copy').textContent=copy;$('#receipts').append(row);
});
// Original ordered pixel field; a fixed integer lattice, never random or raster plates.
for(let i=0;i<96;i++){
  const dot=document.createElement('i');dot.className='pixel';
  const column=i%12,row=Math.floor(i/12);
  dot.style.left=`${1390+column*30}px`;dot.style.top=`${260+row*60}px`;
  $('#pixels').append(dot);
}
const tl=gsap.timeline({paused:true});
tl.set('#lockup',{scale:1,y:0,opacity:1,filter:'blur(0px)'},0);
tl.set(['#corner','#footer'],{color:'#060606'},0);
tl.set('#corner .corner-mark',{filter:'invert(0)'},0);
tl.set('#grid',{opacity:.55},0);
tl.set(['#speed-visual','#task-camera','#loop-visual','#proof-visual'],{autoAlpha:0},0);
tl.set('#proof-visual',{scaleY:1},0);
tl.set('#closing-rule',{scaleX:0,autoAlpha:0},0);
tl.set('.pixel',{opacity:0,scale:0},0);
tl.set(['#pointer','#click-ring'],{autoAlpha:0},0);
tl.set('.char',{opacity:0},0);
tl.set('.stage-fill',{scaleX:0,transformOrigin:'left'},0);
tl.set('.stage-state',{opacity:0},0);
tl.set('.receipt',{opacity:0,x:70},0);
tl.set('#stop-stamp',{opacity:0,y:15},0);
tl.set('#rail-progress',{scaleY:0},0);
tl.set('.check-path',{strokeDasharray:50,strokeDashoffset:50},0);
tl.to('#lockup',{scale:1.035,duration:.4,ease:'power2.out'},.08);
tl.to('#lockup',{scale:1,duration:.45,ease:'power3.out'},.48);
tl.to('.pixel',{opacity:(i)=>.08+(i%4)*.055,scale:1,duration:.25,stagger:{each:.003,from:'start'},ease:'power2.out'},.12);
tl.to('.pixel',{x:-80,opacity:0,duration:.35,stagger:.001,ease:'power3.in'},1.1);
tl.to('#lockup',{y:-80,opacity:0,filter:'blur(8px)',duration:.26,ease:'power3.in'},1.3);
// Fast editorial interruption, then hard structure takes over.
tl.set('#speed-visual',{autoAlpha:1},B.speed);
tl.fromTo('#ai-moves',{y:240},{y:0,duration:.32,ease:'power4.out'},B.speed);
tl.fromTo('#fast',{x:650},{x:0,duration:.36,ease:'expo.out'},B.speed+.14);
tl.fromTo('#speed-bars i',{x:400,opacity:0},{x:0,opacity:1,duration:.28,stagger:.055,ease:'power3.out'},B.speed+.2);
tl.set(['#corner','#footer'],{color:'#f9f9f9'},B.speed);
tl.set('#corner .corner-mark',{filter:'invert(1)'},B.speed);
tl.to('#speed-visual',{y:-1080,duration:.32,ease:'power4.inOut'},B.task-.12);
tl.set(['#corner','#footer'],{color:'#060606'},B.task+.08);
tl.set('#corner .corner-mark',{filter:'invert(0)'},B.task+.08);
// Typing is indexed opacity, so backward/forward frame seeking is exact.
tl.set('#task-camera',{autoAlpha:1},B.task);
tl.fromTo('#task-camera',{scale:.82,y:150,rotation:-3},{scale:1,y:0,rotation:0,duration:.48,ease:'power4.out'},B.task);
tl.to('#task-camera',{scale:1.09,x:-25,y:0,duration:1.25,ease:'power2.inOut'},B.type-.15);
[...document.querySelectorAll('.char')].forEach((el,i)=>tl.set(el,{opacity:1},B.type+(i+1)*(.836/C.task.length)));
tl.fromTo('#caret',{x:-C.task.length*30.6},{x:0,duration:.836,ease:`steps(${C.task.length})`},B.type);
tl.to('#caret',{opacity:0,duration:.04,repeat:3,yoyo:true,repeatDelay:.14},4.25);
tl.set('#pointer',{autoAlpha:1},B.cursor);
tl.fromTo('#pointer',{x:210,y:155,rotation:13},{x:0,y:0,rotation:0,duration:.4,ease:'power3.out'},B.cursor);
tl.to(['#run','#pointer'],{scale:.94,duration:.08,ease:'power1.in'},B.click);
tl.to(['#run','#pointer'],{scale:1,duration:.18,ease:'back.out(2)'},B.click+.08);
tl.fromTo('#click-ring',{scale:.2,autoAlpha:.7},{scale:2.5,autoAlpha:0,duration:.35,ease:'power2.out'},B.click+.06);
tl.to('#task-camera',{scale:.88,y:-60,opacity:0,filter:'blur(6px)',duration:.27,ease:'power3.in'},B.loop-.17);
// The loop is a vertical architectural index. Each bounded stage lights once.
tl.set('#loop-visual',{autoAlpha:1},B.loop);
tl.fromTo('.loop-heading',{x:-90,opacity:0},{x:0,opacity:1,duration:.38,ease:'power4.out'},B.loop);
tl.fromTo('.stage',{y:75,opacity:0},{y:0,opacity:1,duration:.32,stagger:.055,ease:'power4.out'},B.loop+.02);
B.checkpoint.forEach((time,i)=>{
  tl.to(`#stage-${i} .stage-fill`,{scaleX:1,duration:.16,ease:'power3.out'},time);
  tl.to(`#stage-${i}`,{color:'#f9f9f9',duration:.08},time);
  tl.to(`#stage-${i} .stage-num`,{color:'#f9f9f9',duration:.08},time);
  tl.set(`#stage-${i} .stage-state`,{opacity:1},time+.12);
  tl.to('#rail-progress',{scaleY:(i+1)/5,duration:.3,ease:'power2.out'},time);
  if(i<4){tl.to(`#stage-${i} .stage-fill`,{scaleX:0,duration:.16,ease:'power2.in'},time+.35);tl.to(`#stage-${i}`,{color:'#060606',duration:.08},time+.35);tl.to(`#stage-${i} .stage-num`,{color:'#555',duration:.08},time+.35);}
});
tl.to('#loop-visual',{y:-75,opacity:0,duration:.24,ease:'power3.in'},B.proof-.1);
// Results arrive with separated 12-frame beats; checks draw after their rows settle.
tl.set('#proof-visual',{autoAlpha:1},B.proof);
tl.set(['#corner','#footer'],{color:'#f9f9f9'},B.proof);
tl.set('#corner .corner-mark',{filter:'invert(1)'},B.proof);
tl.fromTo('#proof-title',{y:70,filter:'blur(8px)'},{y:0,filter:'blur(0px)',duration:.4,ease:'power4.out'},B.proof);
B.checks.forEach((time,i)=>{tl.to(`#receipt-${i}`,{x:0,opacity:1,duration:.25,ease:'power3.out'},time);tl.to(`#receipt-${i} .check-path`,{strokeDashoffset:0,duration:.24,ease:'power2.out'},time+.18);});
tl.to('#stop-stamp',{y:0,opacity:1,duration:.23,ease:'power3.out'},10.62);
// Resolve through a thin aperture into the original brand lockup.
tl.set('#closing-rule',{autoAlpha:1},B.end);
tl.to('#closing-rule',{scaleX:1,duration:.25,ease:'expo.out'},B.end);
tl.to('#proof-visual',{scaleY:0,duration:.32,ease:'power3.inOut',transformOrigin:'center'},B.end+.19);
tl.set('#proof-visual',{autoAlpha:0},B.end+.48);
tl.set('#lockup',{y:0,scale:.94,opacity:1,filter:'blur(0px)'},B.end+.19);
tl.set('#closing-rule',{autoAlpha:0},B.end+.5);
tl.set(['#corner','#footer'],{color:'#060606'},B.end+.5);
tl.set('#corner .corner-mark',{filter:'invert(0)'},B.end+.5);
tl.to('#lockup',{scale:1,opacity:1,duration:.55,ease:'power3.out'},B.end+.19);
tl.to('#grid',{opacity:.55,duration:.1},B.loopReset);
tl.set('#lockup',{scale:1,y:0,opacity:1,filter:'blur(0px)'},B.loopReset);
tl.to({}, {duration:.01},B.duration-.01);
window.kujoTimeline=tl;
