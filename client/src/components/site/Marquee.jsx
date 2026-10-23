import { useRef } from 'react';
import { Asterisk } from '@phosphor-icons/react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../../lib/motion.js';

// Endless tech marquee that speeds up and flips direction with scroll velocity.
export default function Marquee({ items = [] }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const loop = gsap.to('.mq-track', { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
      let direction = 1;
      ScrollTrigger.create({
        onUpdate: (self) => {
          if (self.direction !== direction) direction = self.direction;
          const boost = Math.min(Math.abs(self.getVelocity()) / 300, 6);
          gsap.to(loop, { timeScale: direction * (1 + boost), duration: 0.3, overwrite: true });
          gsap.to(loop, { timeScale: direction, duration: 1.2, delay: 0.3 });
          gsap.to('.mq-skew', { skewX: -direction * boost * 1.5, duration: 0.3, overwrite: true });
          gsap.to('.mq-skew', { skewX: 0, duration: 0.8, delay: 0.3 });
        },
      });
    },
    { scope: root }
  );

  if (!items.length) return null;
  const row = [...items, ...items];

  return (
    <div ref={root} className="overflow-hidden border-y border-line py-6" aria-label="Tech stack">
      <div className="mq-skew">
        <div className="mq-track flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {row.map((item, i) => (
                <span key={i} className="flex items-center font-display text-[clamp(2rem,5vw,4.5rem)] font-bold uppercase tracking-tight">
                  <span className={i % 2 ? 'text-ink/20' : ''}>{item}</span>
                  <Asterisk size={36} weight="bold" className="mx-6 shrink-0 text-accent" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
