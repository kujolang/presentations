/* Private notes are user-selected local data; never fetched, stored or broadcast. */
(() => {
  const root=document.querySelector('.p-presenter');if(!root)return;
  const find=s=>root.querySelector(s),count=Number(root.dataset.count);
  let slide=1,notes=[],audience=null,elapsed=0,started=null,revision=0,notesRevision=0;
  const url=n=>new URL(`../${n}/`,location.href).href;
  async function preview(node,n,version) {
    if(n>count){node.hidden=true;node.replaceChildren();return;}
    node.hidden=false;
    try {
      const response=await fetch(url(n),{signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw Error('Slide unavailable');
      const document=new DOMParser().parseFromString(await response.text(),'text/html');
      const frame=document.querySelector('.p-frame');if(!frame)throw Error('Slide unavailable');
      for(const image of frame.querySelectorAll('[src]'))image.src=new URL(image.getAttribute('src'),url(n)).href;
      if(version===revision)node.replaceChildren(frame);
    }catch {if(version===revision)node.textContent='Preview unavailable. Open the audience window to continue.';}
  }
  function show(n){
    slide=Math.max(1,Math.min(count,Math.trunc(n)||1));
    find('[data-slide]').value=slide;find('[data-position]').textContent=`${slide} / ${count}`;
    revision++;preview(find('[data-current]'),slide,revision);preview(find('[data-upcoming]'),slide+1,revision);
    find('[data-notes]').textContent=notes[slide-1]||'';
    find('[data-previous]').disabled=slide===1;find('[data-next]').disabled=slide===count;
    if(audience&&!audience.closed){try{audience.location.href=url(slide);}catch{audience=null;}}
  }
  find('[data-previous]').onclick=()=>show(slide-1);find('[data-next]').onclick=()=>show(slide+1);
  find('[data-slide]').onchange=e=>show(Number(e.target.value));
  find('[data-audience]').onclick=()=>{audience=window.open(url(slide),'presentation-audience');};
  find('[data-notes-file]').onchange=async e=>{
    const version=++notesRevision;
    notes=[];find('[data-notes]').textContent='';
    try{
      const file=e.target.files[0];if(!file)return;
      if(file.size>1024*1024)throw Error('Notes file must be under 1 MB.');
      const data=JSON.parse(await file.text());
      if(version!==notesRevision)return;
      if(data.deck!==root.dataset.deck||!Array.isArray(data.notes)||data.notes.length!==count||data.notes.some(x=>typeof x!=='string'||x.length>20000))throw Error('Use this deck ID and exactly one plain-text note per slide (maximum 20,000 characters each).');
      notes=data.notes;find('[data-notes]').textContent=notes[slide-1];find('[data-notes-status]').textContent='Local notes loaded. Do not share this console.';
    }catch(error){if(version===notesRevision)find('[data-notes-status]').textContent=error.message;}
    finally{e.target.value='';}
  };
  find('[data-clear]').onclick=()=>{notesRevision++;notes=[];find('[data-notes]').textContent='';find('[data-notes-status]').textContent='Notes cleared.';};
  function tick(){const seconds=Math.floor((elapsed+(started===null?0:performance.now()-started))/1000);find('[data-timer]').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
  find('[data-timer-toggle]').onclick=()=>{if(started===null){started=performance.now();}else{elapsed+=performance.now()-started;started=null;}find('[data-timer-toggle]').textContent=started===null?'Start timer':'Pause timer';tick();};
  find('[data-timer-reset]').onclick=()=>{elapsed=0;started=null;find('[data-timer-toggle]').textContent='Start timer';tick();};
  setInterval(tick,250);show(1);
})();
