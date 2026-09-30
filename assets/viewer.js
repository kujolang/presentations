/* Progressive enhancement: ordinary navigation remains native static links.
 * Only fullscreen swaps a server-generated <main>, to retain browser fullscreen. */
(() => {
  'use strict';
  const viewer = () => document.querySelector('.p-viewer');
  const status = message => { const node = document.querySelector('[data-status]'); if (node) node.textContent = message; };
  const enhance = () => {
    const button = document.querySelector('[data-fullscreen]');
    if (button && document.fullscreenEnabled) {
      button.hidden = false;
      button.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
      button.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
    }
  };
  let busy = false;
  async function navigate(href, push = true) {
    if (!document.fullscreenElement) { location.assign(href); return; }
    if (busy) return;
    busy = true;
    const url = new URL(href, location.href);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error('Navigation failed');
      const next = new DOMParser().parseFromString(await response.text(), 'text/html');
      const main = next.querySelector('.p-viewer');
      if (!main) { location.assign(url); return; }
      // Resolve relative assets before inserting against the current document URL.
      for (const node of main.querySelectorAll('[src],[href]')) {
        for (const attr of ['src', 'href']) if (node.hasAttribute(attr)) node.setAttribute(attr, new URL(node.getAttribute(attr), url).href);
      }
      viewer().replaceWith(main);
      document.title = next.title;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = next.querySelector('link[rel="canonical"]')?.href || url.href;
      if (push) history.pushState(null, '', url);
      enhance();
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
      status(`Slide ${main.dataset.slide} of ${main.dataset.count}`);
    } catch { location.assign(url); }
    finally { busy = false; }
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen();
    } catch { status('Fullscreen is unavailable. You can continue with the normal viewer.'); }
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-fullscreen]')) { fullscreen(); return; }
    const link = event.target.closest('a[data-nav]');
    if (link && document.fullscreenElement && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault(); navigate(link.href);
    }
  });
  document.addEventListener('keydown', event => {
    const main = viewer();
    if (!main || event.defaultPrevented || event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    if (event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="slider"]')) return;
    if (event.key === ' ' && event.target.closest('button,a,summary,[role="button"]')) return;
    let href;
    const n = Number(main.dataset.slide), count = Number(main.dataset.count);
    if (event.key === 'ArrowLeft') href = main.querySelector('[data-nav="previous"]')?.href;
    else if (event.key === 'ArrowRight' || event.key === ' ') href = main.querySelector('[data-nav="next"]')?.href;
    else if (event.key === 'Home' && n !== 1) href = new URL('../1/', location.href).href;
    else if (event.key === 'End' && n !== count) href = new URL(`../${count}/`, location.href).href;
    else if (event.key.toLowerCase() === 'f' && document.fullscreenEnabled) { event.preventDefault(); fullscreen(); return; }
    else if (event.key === 'Escape' && document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
    if (href) { event.preventDefault(); navigate(href); }
  });
  window.addEventListener('popstate', () => { if (document.fullscreenElement) navigate(location.href, false); });
  document.addEventListener('fullscreenchange', enhance);
  enhance();
})();
