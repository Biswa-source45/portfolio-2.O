import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/motion.js';

// Dot + trailing ring. Grows over links and shows a label for [data-cursor="..."].
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState('');
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches);

  useEffect(() => {
    if (!enabled) return;
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08 });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3' });

    gsap.set([dot.current, ring.current], { opacity: 0 });
    let seen = false;
    const move = (e) => {
      if (!seen) {
        seen = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY, opacity: 1 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e) => {
      const target = e.target.closest('a, button, [data-cursor], input, textarea');
      const text = target?.dataset.cursor || '';
      setLabel(text);
      gsap.to(ring.current, { scale: text ? 2.6 : target ? 1.7 : 1, duration: 0.35, ease: 'power3' });
      gsap.to(dot.current, { scale: target ? 0 : 1, duration: 0.25 });
    };
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });

    window.addEventListener('pointermove', move);
    document.addEventListener('pointerover', over);
    document.documentElement.addEventListener('pointerleave', leave);
    document.documentElement.addEventListener('pointerenter', enter);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.removeEventListener('pointerenter', enter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[90] -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full border border-ink/40 mix-blend-difference"
        style={{ borderColor: 'rgb(255 255 255 / .55)' }}
      >
        <span className="font-mono text-[5px] font-medium uppercase tracking-wider text-white">{label}</span>
      </div>
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[91] -ml-1 -mt-1 h-2 w-2 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
