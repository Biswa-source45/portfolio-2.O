import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';

const WORDS = ['Design', 'Engineer', 'Ship'];

// Shortest time the intro stays up, so it reads as a beat rather than a flash.
// Second visits in the same tab session get a quicker one.
const MIN_FIRST = 0.6;
const MIN_REPEAT = 0.15;

// Read once per page load (not in an effect, which React may run twice in dev).
const REPEAT_VISIT = (() => {
  try {
    const seen = sessionStorage.getItem('intro-seen') === '1';
    sessionStorage.setItem('intro-seen', '1');
    return seen;
  } catch {
    return false;
  }
})();

// The counter creeps toward 90% while the portfolio loads, then races to 100
// and the curtain lifts as soon as the data is in (after a short minimum),
// instead of always playing a fixed-length count.
export default function Loader({ name = 'Biswabhusan Sahoo', dataReady, onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const progress = useRef({ v: 0, tween: null, start: performance.now() });
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const p = progress.current;
    const ctx = gsap.context(() => {
      gsap.from('.ld-word', { yPercent: 110, duration: 0.7, ease: 'expo.out', stagger: 0.08 });
      p.tween = gsap.to(p, {
        v: 90,
        duration: 2.4,
        ease: 'power2.out',
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(p.v)).padStart(3, '0');
          gsap.set('.ld-bar', { scaleX: p.v / 100 });
        },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!dataReady) return;
    if (prefersReducedMotion()) {
      setGone(true);
      onDone();
      return;
    }
    const p = progress.current;
    const elapsed = (performance.now() - p.start) / 1000;
    const wait = Math.max(0, (REPEAT_VISIT ? MIN_REPEAT : MIN_FIRST) - elapsed);
    p.tween?.kill();

    const tl = gsap.timeline({ delay: wait, onComplete: () => setGone(true) });
    tl.to(p, {
      v: 100,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => {
        if (count.current) count.current.textContent = String(Math.round(p.v)).padStart(3, '0');
        gsap.set(root.current.querySelector('.ld-bar'), { scaleX: p.v / 100 });
      },
    })
      .to(root.current.querySelectorAll('.ld-fade'), { yPercent: -110, duration: 0.35, ease: 'power3.in', stagger: 0.03 })
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'expo.inOut' }, '-=0.1')
      // Hero starts its intro while the curtain lifts.
      .call(onDone, null, '-=0.45');
    return () => tl.kill();
  }, [dataReady]); // eslint-disable-line react-hooks/exhaustive-deps

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading portfolio"
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 text-bg sm:p-10"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="flex justify-between font-mono text-xs uppercase tracking-widest opacity-70">
        <span className="reveal-mask">
          <span className="ld-fade inline-block">{name}</span>
        </span>
        <span className="reveal-mask">
          <span className="ld-fade inline-block">Portfolio ©{new Date().getFullYear()}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 font-display text-[11vw] font-bold leading-[0.95] tracking-tight sm:text-[7vw]">
        {WORDS.map((w, i) => (
          <span key={w} className="reveal-mask">
            <span className="ld-word ld-fade inline-block">
              {w}
              {i === WORDS.length - 1 ? <span className="text-accent">.</span> : <span className="opacity-40">,</span>}
            </span>
          </span>
        ))}
      </div>

      <div>
        <div className="flex items-end justify-between">
          <span className="reveal-mask">
            <span className="ld-fade inline-block font-mono text-xs uppercase tracking-widest opacity-70">Loading experience</span>
          </span>
          <span className="reveal-mask">
            <span ref={count} className="ld-fade inline-block font-display text-6xl font-bold tabular-nums sm:text-8xl">
              000
            </span>
          </span>
        </div>
        <div className="mt-4 h-px w-full bg-bg/20">
          <div className="ld-bar h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </div>
  );
}
