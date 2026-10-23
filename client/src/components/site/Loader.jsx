import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion.js';

const WORDS = ['Design', 'Engineer', 'Ship'];

export default function Loader({ name = 'Biswabhusan Sahoo', dataReady, onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const [counted, setCounted] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setCounted(true);
      return;
    }
    const state = { v: 0 };
    const ctx = gsap.context(() => {
      gsap.from('.ld-word', { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.12 });
      gsap.to(state, {
        v: 100,
        duration: 1.6,
        ease: 'power3.inOut',
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(state.v)).padStart(3, '0');
        },
        onComplete: () => setCounted(true),
      });
      gsap.to('.ld-bar', { scaleX: 1, duration: 1.6, ease: 'power3.inOut' });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!counted || !dataReady) return;
    if (prefersReducedMotion()) {
      setGone(true);
      onDone();
      return;
    }
    const tl = gsap.timeline({ onComplete: () => setGone(true) });
    tl.to(root.current.querySelectorAll('.ld-fade'), { yPercent: -110, duration: 0.6, ease: 'expo.in', stagger: 0.04 })
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.1');
    // Hero starts its intro while the curtain lifts.
    tl.call(onDone, null, '-=0.55');
    return () => tl.kill();
  }, [counted, dataReady]); // eslint-disable-line react-hooks/exhaustive-deps

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
