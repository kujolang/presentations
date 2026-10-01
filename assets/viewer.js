/* Static links are enhanced only for optional transitions or fullscreen. */
(() => {
  'use strict';
  const viewer = () => document.querySelector('.p-viewer');
  const label = key => JSON.parse(viewer()?.dataset.labels || '{}')[key] || key;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const moduleURL = new URL('./motion/motion-mini.js', document.currentScript.src).href;
  const presetURL = new URL('./motion-presets.js', document.currentScript.src).href;
  const cinematic = effect => ['editorial', 'focus', 'kinetic'].includes(effect);
  let choreographyModule;
  const preferenceKey = 'presentation-motion:' + new URL('../', location.href).pathname;
  let disabled = false, motionModule, activeAnimation, enhancedHistory = false;
  try { disabled = sessionStorage.getItem(preferenceKey) === 'off'; } catch {}
  const wantsMotion = () => Boolean(viewer()?.dataset.motion) && !disabled && !reduced.matches;
  const finishAnimation = () => { activeAnimation?.complete(); };
  async function animateSlide(main, entering, direction) {
    if (!wantsMotion()) return;
    let cleanup = () => {};
    try {
      const effect = main.dataset.motion;
      if (entering && cinematic(effect)) {
        choreographyModule ||= import(presetURL);
        const { choreograph } = await choreographyModule;
        if (!wantsMotion()) return;
        const result = choreograph(main, {effect, direction, duration: Number(main.dataset.duration) * 0.8,
          intensity: Number(main.dataset.intensity), spacing: Number(main.dataset.stagger), easing: main.dataset.easing});
        cleanup = result.cleanup;
        activeAnimation = result.controls;
        await activeAnimation;
        return;
      }
      motionModule ||= import(moduleURL);
      const { animate } = await motionModule;
      if (!wantsMotion()) return;
      const frame = main.querySelector('.p-frame');
      const transform = effect === 'slide' ? `translateX(${(entering ? 1 : -1) * direction * 5}%)` : 'scale(0.96)';
      const keyframes = { opacity: entering ? [0, 1] : [1, 0] };
      if (effect !== 'fade' && !cinematic(effect)) keyframes.transform = entering ? [transform, 'none'] : ['none', transform];
      activeAnimation = animate(frame, keyframes, { duration: Number(main.dataset.duration) * (cinematic(effect) ? 0.2 : 0.5), ease: main.dataset.easing });
      await activeAnimation;
      frame.style.removeProperty('opacity');
      frame.style.removeProperty('transform');
    } catch { /* A blocked optional module never prevents navigation. */ }
    finally { await cleanup(); activeAnimation = null; }
  }
  const status = message => { const node = document.querySelector('[data-status]'); if (node) node.textContent = message; };
  const enhance = () => {
    const replay = document.querySelector('[data-replay]');
    if (replay) { replay.hidden = !viewer()?.dataset.motion; replay.disabled = !wantsMotion() || busy; }
    const toggle = document.querySelector('[data-motion-toggle]');
    if (toggle) {
      toggle.hidden = !viewer()?.dataset.motion;
      toggle.disabled = reduced.matches;
      toggle.textContent = reduced.matches ? label('reducedMotion') : `${label('transitions')}: ${label(disabled ? 'off' : 'on')}`;
      toggle.setAttribute('aria-pressed', String(wantsMotion()));
    }
    const button = document.querySelector('[data-fullscreen]');
    if (button && document.fullscreenEnabled) {
      button.hidden = false;
      button.textContent = label(document.fullscreenElement ? 'exitFullscreen' : 'fullscreen');
      button.setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
    }
  };
  let busy = false, pendingNavigation;
  async function navigate(href, push = true) {
    if (!document.fullscreenElement && !wantsMotion() && push) { location.assign(href); return; }
    if (busy) { pendingNavigation = {href, push}; return; }
    busy = true;
    document.documentElement.dataset.transitioning = 'true';
    enhance();
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
      if (!main || !viewer()) { location.assign(url); return; }
      const direction = Number(main.dataset.slide) >= Number(viewer().dataset.slide) ? 1 : -1;
      await animateSlide(viewer(), false, direction);
      viewer().replaceWith(main);
      enhance();
      await animateSlide(main, true, direction);
      enhancedHistory = true;
      document.title = next.title;
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = next.querySelector('link[rel="canonical"]')?.href || url.href;
      if (push) history.pushState(null, '', url);
      enhance();
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
      status(label('slideStatus').replace('{slide}', main.dataset.slide).replace('{count}', main.dataset.count));
    } catch { location.assign(url); }
    finally { releaseNavigation(); }
  }
  function releaseNavigation() {
    busy = false;
    delete document.documentElement.dataset.transitioning;
    enhance();
    if (pendingNavigation) {
      const pending = pendingNavigation; pendingNavigation = null;
      if (new URL(pending.href, location.href).href !== location.href) navigate(pending.href, pending.push);
    }
  }
  async function replay() {
    if (busy || !wantsMotion()) return;
    busy = true; document.documentElement.dataset.transitioning = 'true'; enhance();
    try { await animateSlide(viewer(), true, 1); }
    finally { releaseNavigation(); }
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.fullscreenEnabled) await document.documentElement.requestFullscreen();
    } catch { status(label('fullscreenUnavailable')); }
  }
  document.addEventListener('click', event => {
    if (event.target.closest('[data-replay]')) { replay(); return; }
    if (event.target.closest('[data-motion-toggle]')) {
      disabled = !disabled;
      try { sessionStorage.setItem(preferenceKey, disabled ? 'off' : 'on'); } catch {}
      finishAnimation(); enhance(); return;
    }
    if (event.target.closest('[data-fullscreen]')) { fullscreen(); return; }
    const link = event.target.closest('a[data-nav]');
    if (link && (document.fullscreenElement || wantsMotion()) && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
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
  window.addEventListener('popstate', () => { if (busy) { location.reload(); return; } if (document.fullscreenElement || enhancedHistory) navigate(location.href, false); });
  reduced.addEventListener('change', () => { finishAnimation(); enhance(); });
  document.addEventListener('fullscreenchange', enhance);
  enhance();
  document.documentElement.dataset.viewerReady = 'true';
})();
