import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { startWaveform } from './waveform';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

// Everything created for the current page, torn down before the next page swaps in.
let ctx: gsap.Context | undefined;
let lenis: Lenis | undefined;
let cleanups: Array<() => void> = [];

function initLenis() {
  lenis = new Lenis({ lerp: 0.1, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  cleanups.push(() => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = undefined;
  });
}

function initClock() {
  const els = document.querySelectorAll<HTMLTimeElement>('[data-clock]');
  if (!els.length) return;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });
  const update = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
  update();
  const id = window.setInterval(update, 15_000);
  cleanups.push(() => clearInterval(id));
}

function initThemeToggle() {
  const btn = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!btn) return;
  const root = document.documentElement;

  const onClick = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch {}
    };
    if (!document.startViewTransition || reducedMotion()) return apply();

    // Circular reveal expanding from the toggle button.
    const r = btn.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);
    root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    root.classList.add('theme-vt');
    const vt = document.startViewTransition(apply);
    vt.ready.catch(() => {}); // aborted transitions (e.g. tab hidden) still apply the theme
    vt.finished.catch(() => {}).finally(() => root.classList.remove('theme-vt'));
  };
  btn.addEventListener('click', onClick);
  cleanups.push(() => btn.removeEventListener('click', onClick));
}

// Nav labels briefly scramble through glyphs on hover.
function initScramble() {
  if (!finePointer() || reducedMotion()) return;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ/_#';
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    const original = el.textContent ?? '';
    let frame = 0;
    const run = () => {
      let i = 0;
      cancelAnimationFrame(frame);
      const step = () => {
        el.textContent = original
          .split('')
          .map((ch, idx) => (idx < i ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]))
          .join('');
        i += 0.5;
        if (i <= original.length) frame = requestAnimationFrame(step);
        else el.textContent = original;
      };
      step();
    };
    const host = el.closest('a') ?? el;
    host.addEventListener('mouseenter', run);
    cleanups.push(() => {
      host.removeEventListener('mouseenter', run);
      cancelAnimationFrame(frame);
      el.textContent = original;
    });
  });
}

// Buttons drift toward the cursor.
function initMagnetic() {
  if (!finePointer() || reducedMotion()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    });
  });
}

function initAnimations() {
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Headlines rise out of a mask, character by character.
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el, i) => {
    SplitText.create(el, {
      type: 'lines,words,chars',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.chars, {
          yPercent: 115,
          rotate: 6,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.025,
          delay: 0.1 + i * 0.15,
        });
      },
    });
  });

  // Generic blur-up reveal. Above-the-fold items join the intro timeline; the rest reveal on scroll.
  const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  const fold = innerHeight * 0.9;
  const initial = reveals.filter((el) => el.getBoundingClientRect().top < fold);
  const later = reveals.filter((el) => !initial.includes(el));
  const from = { autoAlpha: 0, y: 24, filter: 'blur(8px)' };
  const to = { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 1, clearProps: 'filter,transform' };
  intro.fromTo(initial, from, { ...to, stagger: 0.08 }, 0.35);
  ScrollTrigger.batch(later, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch, from, { ...to, ease: 'expo.out', stagger: 0.08 }),
  });

  // Timeline: a moss line draws down as you scroll; nodes light up as it passes them.
  const timeline = document.querySelector<HTMLElement>('[data-timeline]');
  if (timeline) {
    gsap.fromTo(
      '[data-timeline-progress]',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
      },
    );
    timeline.querySelectorAll<HTMLElement>('[data-timeline-item]').forEach((item) => {
      const node = item.querySelector<HTMLElement>('[data-node]');
      const dot = item.querySelector<HTMLElement>('[data-node-dot]');
      ScrollTrigger.create({
        trigger: item,
        start: 'top 60%',
        onToggle: ({ isActive, direction }) => {
          const on = isActive || direction === 1;
          node?.classList.toggle('border-moss', on);
          dot?.classList.toggle('scale-0', !on);
        },
      });
    });
  }

  // About paragraph: words brighten as they scroll through the viewport.
  document.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
    const split = SplitText.create(el, { type: 'words' });
    gsap.fromTo(
      split.words,
      { opacity: 0.18 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
      },
    );
  });

  // Portrait: clip-path wipe in, then a gentle parallax.
  document.querySelectorAll<HTMLElement>('[data-clip-reveal]').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(100% 0% 0% 0% round 1rem)' },
      { clipPath: 'inset(0% 0% 0% 0% round 1rem)', duration: 1.6, ease: 'expo.inOut', delay: 0.3 },
    );
    const img = el.querySelector('[data-parallax]');
    if (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  // Skills marquee: loops forever, speeds up and reverses with scroll velocity.
  document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((track) => {
    const loop = gsap.to(track, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    let direction = 1;
    ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        direction = self.direction;
        const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 300);
        gsap.to(loop, { timeScale: boost * direction, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.2, ease: 'power2.out' });
      },
    });
  });
}

function init() {
  initClock();
  initThemeToggle();

  if (reducedMotion()) {
    // Skip motion entirely; just make sure nothing stays hidden.
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => (el.style.opacity = '1'));
    const canvas = document.querySelector<HTMLCanvasElement>('[data-waveform]');
    if (canvas) cleanups.push(startWaveform(canvas, { static: true }));
    return;
  }

  initLenis();
  initScramble();
  initMagnetic();
  ctx = gsap.context(initAnimations);

  const canvas = document.querySelector<HTMLCanvasElement>('[data-waveform]');
  if (canvas) cleanups.push(startWaveform(canvas));

  // Fonts can shift layout after first paint; re-measure once they're in.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function teardown() {
  ctx?.revert();
  ctx = undefined;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  cleanups.forEach((fn) => fn());
  cleanups = [];
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', teardown);
