import { forwardRef, useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../../lib/motion.js';
import { useScrollTo } from './scroll.js';

const SECTIONS = [
  ['top', 'Intro'],
  ['about', 'About'],
  ['experience', 'Experience'],
  ['work', 'Work'],
  ['skills', 'Skills'],
  ['recognition', 'Awards'],
  ['contact', 'Contact'],
];
const PUFFS = 14;
const RING = 2 * Math.PI * 22; // circumference of the compact progress ring

// The rocket drawing; `flameRef` targets the flame so it can grow with speed.
const Rocket = forwardRef(function Rocket({ flameRef, className = '' }, ref) {
  return (
    <svg ref={ref} viewBox="0 0 46 46" aria-hidden="true" className={`h-full w-full overflow-visible ${className}`}>
      <g ref={flameRef} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
        <path d="M17 34Q23 54 29 34Z" fill="#ffb347" className="animate-[flicker_0.12s_ease-in-out_infinite_alternate]" style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }} />
        <path d="M20 34Q23 46 26 34Z" fill="#fff3b0" />
      </g>
      <path d="M23 3C32 11 34 24 31 36H15C12 24 14 11 23 3Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="23" cy="18" r="5" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.2" />
      <path d="M15 27 7 38l9-3Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M31 27l8 11-9-3Z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M23 30v6" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
});

// Scroll rocket. On large screens (1280px+) it rides a progress rail on the
// right edge with section dots; below that it is a compact button in the
// bottom-left corner whose ring fills with scroll progress. Either way the
// rocket faces the scroll direction, its flame grows with speed, and
// clicking it launches you back to the top.
export default function ScrollRocket() {
  const rail = useRef(null);
  const fill = useRef(null);
  const rocket = useRef(null);
  const body = useRef(null);
  const flame = useRef(null);
  const puffs = useRef(null);
  const mini = useRef(null);
  const miniRing = useRef(null);
  const miniBody = useRef(null);
  const miniFlame = useRef(null);
  const activeRef = useRef(0);
  const [marks, setMarks] = useState([]);
  const [active, setActive] = useState(0);
  const scrollTo = useScrollTo();

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const s = { cur: 0, flip: 180, goingUp: false, puff: 0, lastPuff: 0, shown: null };
    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const measure = () => {
      const max = maxScroll();
      setMarks(
        SECTIONS.map(([id, label]) => {
          const el = document.getElementById(id);
          if (!el) return null;
          const y = el.getBoundingClientRect().top + window.scrollY;
          return { id, label, at: Math.min(1, Math.max(0, (y - window.innerHeight * 0.3) / max)) };
        }).filter(Boolean)
      );
    };

    const emitPuff = (y, up) => {
      const p = puffs.current?.children[s.puff++ % PUFFS];
      if (!p) return;
      const dir = up ? 1 : -1; // exhaust trails behind the nose
      gsap.fromTo(
        p,
        { x: (Math.random() - 0.5) * 6, y: y + dir * 20, scale: 0.4, opacity: 0.55 },
        { x: (Math.random() - 0.5) * 22, y: y + dir * (34 + Math.random() * 14), scale: 1.5 + Math.random(), opacity: 0, duration: 0.8, ease: 'power2.out' }
      );
    };

    const tick = () => {
      const h = rail.current?.offsetHeight || 0; // 0 while the rail is hidden
      const goal = Math.min(1, Math.max(0, window.scrollY / maxScroll()));
      const delta = goal - s.cur;
      s.cur += reduced ? delta : delta * 0.14;
      const speed = Math.abs(delta) * (h || 420);
      if (speed > 0.4) s.goingUp = delta < 0;
      s.flip += ((s.goingUp ? 0 : 180) - s.flip) * (reduced ? 1 : 0.15);
      const flameScale = 0.6 + Math.min(speed / 4, 1.8);

      // Compact button: ring progress, rocket heading, shown once past the hero.
      gsap.set(miniRing.current, { strokeDashoffset: RING * (1 - s.cur) });
      gsap.set(miniBody.current, { rotation: s.flip });
      gsap.set(miniFlame.current, { scaleY: flameScale });
      const show = window.scrollY > window.innerHeight * 0.5;
      if (show !== s.shown) {
        s.shown = show;
        gsap.to(mini.current, { autoAlpha: show ? 1 : 0, scale: show ? 1 : 0.6, duration: 0.35, ease: show ? 'back.out(2)' : 'power2.in' });
      }

      if (!h) return;
      const y = s.cur * h;
      gsap.set(rocket.current, { y });
      gsap.set(body.current, { rotation: s.flip });
      gsap.set(fill.current, { scaleY: s.cur });
      gsap.set(flame.current, { scaleY: flameScale });

      const now = performance.now();
      if (!reduced && speed > 0.8 && now - s.lastPuff > Math.max(30, 110 - speed * 10)) {
        s.lastPuff = now;
        emitPuff(y, s.goingUp);
      }

      let idx = 0;
      rail.current.querySelectorAll('[data-at]').forEach((m, i) => {
        const passed = Number(m.dataset.at) <= s.cur + 0.002;
        m.classList.toggle('is-on', passed);
        if (passed) idx = i;
      });
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        setActive(idx);
      }
    };

    gsap.set(mini.current, { autoAlpha: 0, scale: 0.6 });
    measure();
    gsap.ticker.add(tick);
    ScrollTrigger.addEventListener('refresh', measure);
    window.addEventListener('resize', measure);
    const late = setTimeout(measure, 2200);
    return () => {
      clearTimeout(late);
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener('refresh', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);

  const launch = () => {
    gsap
      .timeline()
      .to(body.current, { x: 1.5, duration: 0.04, yoyo: true, repeat: 7, ease: 'none' })
      .set(body.current, { x: 0 })
      .add(() => scrollTo('#top'));
  };

  // Compact version: the rocket shoots out of the top of the button, then drops back in.
  const launchMini = () => {
    gsap
      .timeline()
      .to(miniBody.current, { x: 1.2, duration: 0.04, yoyo: true, repeat: 5, ease: 'none' })
      .set(miniBody.current, { x: 0 })
      .add(() => scrollTo('#top'))
      .to(miniBody.current.parentElement, { y: -70, opacity: 0, duration: 0.45, ease: 'power2.in' })
      .set(miniBody.current.parentElement, { y: 30 })
      .to(miniBody.current.parentElement, { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, '+=0.5');
  };

  const current = marks[active];

  return (
    <>
      <div className="fixed right-2 top-1/2 z-40 hidden h-[56vh] w-7 -translate-y-1/2 xl:block">
        <div ref={rail} className="relative h-full w-full">
          <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rounded-full bg-line" />
          <span ref={fill} className="absolute left-1/2 top-0 h-full w-[2px] origin-top -translate-x-1/2 scale-y-0 rounded-full bg-accent" />

          {marks.map((m) => (
            <button
              key={m.id}
              type="button"
              data-at={m.at}
              onClick={() => scrollTo(`#${m.id}`)}
              aria-label={`Go to ${m.label}`}
              className="group absolute left-1/2 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center"
              style={{ top: `${m.at * 100}%` }}
            >
              <span className="h-2 w-2 rounded-full border-2 border-muted/60 bg-bg transition-all duration-300 group-hover:scale-150 group-[.is-on]:border-accent group-[.is-on]:bg-accent" />
              <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-bg opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
                {m.label}
              </span>
            </button>
          ))}

          <div ref={puffs} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0">
            {Array.from({ length: PUFFS }, (_, i) => (
              <span key={i} className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-muted/50 opacity-0" />
            ))}
          </div>

          <div ref={rocket} className="absolute left-1/2 top-0">
            <button type="button" onClick={launch} aria-label="Back to top" className="group absolute -left-4 -top-4 h-8 w-8">
              <Rocket ref={body} flameRef={flame} className="drop-shadow-[0_4px_10px_rgb(0_0_0/0.18)]" />
            </button>
            {current && (
              <span
                key={current.id}
                className="pointer-events-none absolute right-7 top-0 -translate-y-1/2 animate-[label-in_0.4s_cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap rounded-full border border-line bg-surface/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted shadow-sm backdrop-blur"
              >
                {String(active + 1).padStart(2, '0')} · {current.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        ref={mini}
        type="button"
        onClick={launchMini}
        aria-label="Back to top"
        className="invisible fixed bottom-5 left-4 z-30 grid h-12 w-12 place-items-center rounded-full border border-line bg-surface/90 shadow-lg shadow-black/10 backdrop-blur xl:hidden"
      >
        <svg viewBox="0 0 48 48" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="24" cy="24" r="22" fill="none" stroke="var(--line)" strokeWidth="2.5" />
          <circle ref={miniRing} cx="24" cy="24" r="22" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} />
        </svg>
        <span className="relative block h-6 w-6">
          <Rocket ref={miniBody} flameRef={miniFlame} />
        </span>
      </button>
    </>
  );
}
