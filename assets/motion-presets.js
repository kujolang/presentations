// Optional content choreography. No markup splitting or numerical data mutation.
import { animate, stagger, frame } from './motion/motion-hybrid.js';

export function choreograph(main, { effect, duration, intensity, spacing, easing, direction }) {
  const canvas = main.querySelector('.p-canvas');
  const sequence = [], saved = new Map();
  let controls;
  const remember = node => { if (!saved.has(node)) saved.set(node, node.getAttribute('style')); };
  const targets = (role, fallback) => [...canvas.querySelectorAll(`[data-motion-part="${role}"]`)].length
    ? [...canvas.querySelectorAll(`[data-motion-part="${role}"]`)] : [...canvas.querySelectorAll(fallback)];
  function add(nodes, frames, at, span, spring = false) {
    if (!nodes.length) return;
    const gap = Math.min(spacing, duration * 0.2 / Math.max(1, nodes.length - 1));
    nodes.forEach(node => {
      remember(node);
      // Establish the starting pose before paint, including delayed elements.
      for (const [key, values] of Object.entries(frames)) node.style[key] = String(values[0]);
    });
    sequence.push([nodes, frames, {
      at: duration * at, duration: duration * span,
      delay: stagger(gap, { from: direction < 0 ? 'last' : 'first' }),
      ease: easing, ...(spring ? { type: 'spring', bounce: 0.2 * intensity } : {})
    }]);
  }
  const titles = targets('title', 'h1');
  const images = targets('image', '.p-image');
  const copy = targets('copy', '.p-intro, .p-heading > p');
  const details = targets('detail', '.p-features > li, .p-metric');
  const accent = targets('accent', '.p-accent');
  const bars = targets('chart', '.p-chart rect');
  const distance = 40 * intensity;
  const reveal = direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
  try {
    if (effect === 'editorial') {
      add(titles, { opacity: [0, 1], transform: [`translateY(${distance}px)`, 'translateY(0px)'], clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, 0, 0.6);
      add(images, { clipPath: [reveal, 'inset(0% 0% 0% 0%)'] }, 0.08, 0.65);
    } else if (effect === 'focus') {
      add(titles, { opacity: [0, 1], filter: [`blur(${8 * intensity}px)`, 'blur(0px)'], transform: [`scale(${1 + 0.04 * intensity})`, 'scale(1)'] }, 0.12, 0.6);
      add(images, { opacity: [0, 1], clipPath: ['inset(8% 8% 8% 8%)', 'inset(0% 0% 0% 0%)'] }, 0, 0.75);
    } else {
      add(titles, { opacity: [0, 1], transform: [`translateX(${direction * distance * 2}px)`, 'translateX(0px)'] }, 0, 0.55, true);
      add(images, { opacity: [0, 1], transform: [`translateY(${distance}px) rotate(${direction * -2 * intensity}deg)`, 'translateY(0px) rotate(0deg)'] }, 0.05, 0.6, true);
    }
    add(images.flatMap(node => [...node.querySelectorAll('img')]), {
      transform: [`scale(${1 + 0.15 * intensity})`, 'scale(1)']
    }, 0, 0.85);
    add(copy, { opacity: [0, 1], transform: [`translateY(${distance * 0.4}px)`, 'translateY(0px)'] }, 0.25, 0.4);
    add(details, { opacity: [0, 1], transform: [`translateY(${distance * 0.75}px)`, 'translateY(0px)'] }, 0.3, 0.45, effect === 'kinetic');
    add(accent, { opacity: [0, 1], transform: [effect === 'kinetic' ? `rotate(${-90 * direction}deg) scale(0.5)` : 'scale(0.3)', effect === 'kinetic' ? 'rotate(0deg) scale(1)' : 'scale(1)'] }, 0.25, 0.5, true);
    bars.forEach(node => { remember(node); node.style.transformBox = 'fill-box'; node.style.transformOrigin = 'center bottom'; });
    add(bars, { transform: ['scaleY(0)', 'scaleY(1)'] }, 0.2, 0.55);
    controls = animate(sequence);
    return { controls, cleanup };
  } catch (error) { cleanup(); throw error; }
  async function cleanup() {
    if (controls) {
      controls.cancel();
      // Restore after Motion has flushed its final render, including interruptions.
      await new Promise(resolve => frame.postRender(resolve));
    }
    for (const [node, style] of saved) {
      if (style === null) node.removeAttribute('style'); else node.setAttribute('style', style);
    }
  }
}
