import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion.js';

const SECTIONS = ['about', 'experience', 'work', 'skills', 'recognition', 'contact'];
const PUFFS = 18;

// A dotted rope that zig-zags between the page margins through every section,
// with a rocket riding it as you scroll (ported from the original static site).
// The rope fills in behind the rocket, checkpoints light up as they are passed,
// the rocket turns to face its direction of travel, and its flame and exhaust
// grow with scroll speed. Desktop only; skipped for reduced motion.
export default function RocketTrail() {
  const wrap = useRef(null);
  const svg = useRef(null);
  const track = useRef(null);
  const draw = useRef(null);
  const rocket = useRef(null);
  const flame = useRef(null);
  const puffs = useRef(null);
  const [knots, setKnots] = useState([]);
  const [enabled] = useState(() => !prefersReducedMotion() && window.matchMedia('(min-width: 768px)').matches);

  useEffect(() => {
    if (!enabled) return;
    const main = wrap.current.parentElement;
    const R = { ready: false, xs: [], ys: [], ls: [], len: 0, cur: null, flip: 0, puff: 0, lastEmit: 0, on: new Set() };

    const build = () => {
      const W = main.clientWidth;
      const H = main.offsetHeight;
      const mainTop = main.getBoundingClientRect().top;
      const margin = (W - 1280) / 2;
      const xl = Math.max(16, margin - 8);
      const xr = W - xl;
      const pts = [];
      SECTIONS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top - mainTop;
        // Launch pad sits in the gap above the first section, clear of the hero.
        if (!pts.length) pts.push({ x: xl, y: top - 220 });
        pts.push({ x: i % 2 === 0 ? xr : xl, y: top + Math.min(el.offsetHeight * 0.1, 140), n: i + 1 });
      });
      if (!pts.length) return;
      pts.push({ x: pts.at(-1).x === xl ? xr : xl, y: H - 120 });

      // The rope runs straight down a margin and only swings across to the
      // other side in the empty gap just before the next checkpoint.
      let d = `M${pts[0].x} ${pts[0].y}`;
      R.xs = [pts[0].x];
      R.ys = [pts[0].y];
      R.ls = [0];
      const add = (x, y) => {
        R.ls.push(R.ls.at(-1) + Math.hypot(x - R.xs.at(-1), y - R.ys.at(-1)));
        R.xs.push(x);
        R.ys.push(y);
      };
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1];
        const q = pts[i];
        const swing = Math.min(240, (q.y - p.y) * 0.7);
        const sy = q.y - swing;
        d += ` L${p.x} ${sy} C${p.x} ${sy + swing * 0.5} ${q.x} ${q.y - swing * 0.5} ${q.x} ${q.y}`;
        for (let s = 1; s <= 8; s++) add(p.x, p.y + ((sy - p.y) * s) / 8);
        // Sample the Bezier directly; getPointAtLength is slow on a path this long.
        for (let s = 1; s <= 48; s++) {
          const t = s / 48;
          const u = 1 - t;
          const x = (u * u * u + 3 * u * u * t) * p.x + (3 * u * t * t + t * t * t) * q.x;
          const y = u * u * u * sy + 3 * u * u * t * (sy + swing * 0.5) + 3 * u * t * t * (q.y - swing * 0.5) + t * t * t * q.y;
          add(x, y);
        }
      }
      R.len = R.ls.at(-1);
      svg.current.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.current.setAttribute('width', W);
      svg.current.setAttribute('height', H);
      track.current.setAttribute('d', d);
      draw.current.setAttribute('d', d);
      draw.current.style.strokeDasharray = R.len;
      setKnots(pts.filter((p) => p.n));
      R.on.clear();
      R.ready = true;
    };

    const target = () => window.scrollY - (main.getBoundingClientRect().top + window.scrollY) + window.innerHeight * 0.55;

    const emitPuff = (x, y, angle) => {
      const c = puffs.current?.children[R.puff++ % PUFFS];
      if (!c) return;
      const rad = (angle * Math.PI) / 180;
      const jitter = (Math.random() - 0.5) * 10;
      gsap.fromTo(
        c,
        { attr: { cx: x + jitter, cy: y, r: 2.5 }, opacity: 0.55 },
        { attr: { cx: x + jitter - Math.sin(rad) * 22, cy: y + Math.cos(rad) * 22, r: 7 + Math.random() * 5 }, opacity: 0, duration: 0.9, ease: 'power2.out' }
      );
    };

    const place = (y, speed, goingUp) => {
      const { xs, ys, ls } = R;
      const last = ys.length - 1;
      const yy = Math.min(Math.max(y, ys[0]), ys[last]);
      let lo = 0;
      let hi = last;
      while (lo < hi) {
        const m = (lo + hi) >> 1;
        if (ys[m] < yy) lo = m + 1;
        else hi = m;
      }
      const i1 = Math.max(1, lo);
      const i0 = i1 - 1;
      const t = ys[i1] === ys[i0] ? 0 : (yy - ys[i0]) / (ys[i1] - ys[i0]);
      const x = xs[i0] + (xs[i1] - xs[i0]) * t;
      const len = ls[i0] + (ls[i1] - ls[i0]) * t;
      const a = Math.max(0, i0 - 1);
      const b = Math.min(last, i1 + 1);
      const ang = (Math.atan2(ys[b] - ys[a], xs[b] - xs[a]) * 180) / Math.PI + 90;

      // Ease the 180° turn so the rocket swings round instead of snapping.
      R.flip += ((goingUp ? 180 : 0) - R.flip) * 0.12;
      const heading = ang + R.flip;
      gsap.set(rocket.current, { x, y: yy, rotation: heading });
      gsap.set(flame.current, { scaleY: 0.8 + Math.min(speed / 6, 1.8) });
      draw.current.style.strokeDashoffset = R.len - len;

      // Exhaust: puffs from the tail, more of them the faster it goes.
      const now = performance.now();
      if (speed > 0.6 && now - R.lastEmit > Math.max(28, 120 - speed * 12)) {
        R.lastEmit = now;
        const rad = (heading * Math.PI) / 180;
        emitPuff(x - Math.sin(rad) * 20, yy + Math.cos(rad) * 20, heading);
      }

      wrap.current.querySelectorAll('[data-knot]').forEach((k) => {
        const passed = Number(k.dataset.y) < yy;
        if (passed === R.on.has(k.dataset.n)) return;
        k.classList.toggle('is-on', passed);
        if (passed) {
          R.on.add(k.dataset.n);
          gsap.fromTo(k.querySelector('.knot-ring'), { scale: 1, opacity: 0.7 }, { scale: 2.6, opacity: 0, duration: 0.9, ease: 'power2.out' });
        } else R.on.delete(k.dataset.n);
      });
    };

    const tick = () => {
      if (!R.ready) return;
      const goal = target();
      if (R.cur === null) R.cur = goal;
      const delta = (goal - R.cur) * 0.12;
      if (Math.abs(delta) < 0.02 && R.settled) return;
      R.settled = Math.abs(delta) < 0.02;
      R.cur += delta;
      if (Math.abs(delta) > 0.3) R.goingUp = delta < 0;
      place(R.cur, Math.abs(delta), R.goingUp);
    };

    build();
    gsap.ticker.add(tick);
    ScrollTrigger.addEventListener('refresh', build);
    const late = setTimeout(() => ScrollTrigger.refresh(), 2200);
    return () => {
      clearTimeout(late);
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', build);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={wrap} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg ref={svg} className="absolute left-0 top-0 -z-10 block overflow-visible">
        <path ref={track} fill="none" stroke="var(--muted)" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" />
        <path ref={draw} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        <g ref={puffs}>
          {Array.from({ length: PUFFS }, (_, i) => (
            <circle key={i} cx="0" cy="0" r="0" fill="var(--muted)" opacity="0" />
          ))}
        </g>
      </svg>

      {knots.map((k) => (
        <span
          key={k.n}
          data-knot
          data-n={k.n}
          data-y={k.y}
          className="group absolute -z-10 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-muted/50 bg-bg font-mono text-[10px] font-medium text-muted transition-colors duration-500 [&.is-on]:border-ink [&.is-on]:bg-accent [&.is-on]:text-accent-ink"
          style={{ left: k.x, top: k.y }}
        >
          <span className="knot-ring absolute inset-0 rounded-full border-2 border-accent opacity-0" />
          {String(k.n).padStart(2, '0')}
        </span>
      ))}

      <div ref={rocket} className="absolute left-0 top-0 z-30 -ml-[22px] -mt-[22px] h-11 w-11 will-change-transform">
        <svg viewBox="0 0 46 46" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id="rocket-flame" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd25e" />
              <stop offset="1" stopColor="var(--accent)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <g ref={flame} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
            <path className="animate-[flicker_0.12s_ease-in-out_infinite_alternate]" d="M17 34Q23 54 29 34Z" fill="url(#rocket-flame)" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }} />
          </g>
          <path d="M23 3C32 11 34 24 31 36H15C12 24 14 11 23 3Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
          <circle cx="23" cy="18" r="5" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.2" />
          <path d="M15 27 7 38l9-3Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M31 27l8 11-9-3Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M23 30v6" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
