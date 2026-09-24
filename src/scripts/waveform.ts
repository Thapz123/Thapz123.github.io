// Hero background: layered audio waveforms that swell around the cursor.
// Drawn on a 2D canvas in the theme's earth tones; pauses when off-screen or the tab is hidden.

type Options = { static?: boolean };

const LINES = 9;

export function startWaveform(canvas: HTMLCanvasElement, opts: Options = {}): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  let visible = true;

  // Pointer is tracked in canvas-space and eased toward, so the swell glides.
  const target = { x: 0.7, y: 0.5, energy: 0 };
  const pointer = { x: 0.7, y: 0.5, energy: 0 };

  let colors = readColors();
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    const get = (v: string) => s.getPropertyValue(v).trim();
    return { moss: get('--moss'), umber: get('--umber'), muted: get('--muted'), accent: get('--accent') };
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    width = r.width;
    height = r.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!running) draw(performance.now());
  }

  function draw(now: number) {
    const t = now / 1000;
    pointer.x += (target.x - pointer.x) * 0.06;
    pointer.y += (target.y - pointer.y) * 0.06;
    target.energy *= 0.96;
    pointer.energy += (target.energy - pointer.energy) * 0.08;

    ctx!.clearRect(0, 0, width, height);
    const mid = height * (width < 768 ? 0.72 : 0.55);
    const spread = Math.min(height * 0.045, 34);
    const step = Math.max(3, width / 260);

    for (let i = 0; i < LINES; i++) {
      const center = i === Math.floor(LINES / 2);
      const offset = (i - (LINES - 1) / 2) * spread;
      const phase = i * 0.55;

      ctx!.beginPath();
      for (let x = 0; x <= width + step; x += step) {
        const u = x / width;
        // Gaussian swell around the pointer, plus a resting amplitude so it's never flat.
        const d = u - pointer.x;
        const swell = Math.exp(-(d * d) / 0.02) * (0.6 + pointer.energy * 1.6);
        const amp = spread * (0.5 + swell * 2.4) * (1 - Math.abs(offset) / (spread * LINES) * 0.8);
        const y =
          mid +
          offset +
          amp *
            (Math.sin(u * 9 + t * 1.1 + phase) * 0.6 +
              Math.sin(u * 23 - t * 1.7 + phase * 2) * 0.25 +
              Math.sin(u * 51 + t * 2.3 + phase * 3) * 0.15 * swell);
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }

      if (center) {
        ctx!.strokeStyle = colors.accent;
        ctx!.lineWidth = 2;
        ctx!.globalAlpha = 0.95;
      } else {
        ctx!.strokeStyle = i % 2 ? colors.umber : colors.moss;
        ctx!.lineWidth = 1;
        ctx!.globalAlpha = 0.25 + (1 - Math.abs(i - (LINES - 1) / 2) / LINES) * 0.45;
      }
      ctx!.stroke();
    }
    ctx!.globalAlpha = 1;
  }

  function loop(now: number) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }
  function play() {
    if (running || opts.static || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    const moved = Math.hypot(nx - target.x, ny - target.y);
    target.x = nx;
    target.y = ny;
    target.energy = Math.min(1, target.energy + moved * 4);
  };
  const onVisibility = () => (document.hidden ? pause() : play());

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? play() : pause();
  });
  io.observe(canvas);
  // Re-read colors when the theme flips.
  const mo = new MutationObserver(() => {
    colors = readColors();
    if (!running) draw(performance.now());
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  play();

  return () => {
    pause();
    ro.disconnect();
    io.disconnect();
    mo.disconnect();
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
