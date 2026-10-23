import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import { getTechIcon } from '../../lib/techIcons.js';

function TechTile({ name }) {
  const icon = getTechIcon(name);
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[var(--band-ink)] bg-[#fffaf2] shadow-[4px_4px_0_var(--band-ink)] md:h-14 md:w-14">
      {icon ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 md:h-7 md:w-7" fill={`#${icon.hex}`}>
          <path d={icon.path} />
        </svg>
      ) : (
        <span className="font-display text-sm font-extrabold text-[#14110d] md:text-base">
          {name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}

const Diamond = ({ className = '' }) => <span aria-hidden="true" className={`mx-5 h-2.5 w-2.5 shrink-0 rotate-45 md:mx-8 md:h-3 md:w-3 ${className}`} />;

// Two tilted bands crossing each other: the accent band carries icon tiles,
// the band behind it runs the other way. Both speed up with scroll velocity.
export default function Marquee({ items = [] }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const front = gsap.to('.mq-front', { xPercent: -50, duration: 45, ease: 'none', repeat: -1 });
      const back = gsap.fromTo('.mq-back', { xPercent: -50 }, { xPercent: 0, duration: 55, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
          const dir = self.direction;
          [front, back].forEach((loop) => {
            gsap.to(loop, { timeScale: dir * boost, duration: 0.25, overwrite: true });
            gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.25 });
          });
        },
      });
    },
    { scope: root }
  );

  if (!items.length) return null;
  const row = [...items, ...items];

  return (
    <div ref={root} className="relative overflow-hidden pb-24 pt-14 md:pb-32 md:pt-20" aria-label={`Tech stack: ${items.join(', ')}`}>
      {/* Band behind, tilted the other way */}
      <div className="absolute inset-x-[-5%] top-[60%] -translate-y-1/2 rotate-[3deg] border-y-2 border-ink bg-ink py-3 md:py-4" aria-hidden="true">
        <div className="mq-back flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {row.map((item, i) => (
                <span key={i} className="flex items-center font-display text-lg font-bold uppercase tracking-tight text-bg/80 md:text-2xl">
                  {item}
                  <Diamond className="bg-accent" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Front accent band with icon tiles */}
      <div className="relative -mx-[5%] -rotate-[3deg] border-y-2 border-[var(--band-ink)] bg-accent py-4 shadow-[0_10px_0_rgb(0_0_0/0.08)] md:py-5" aria-hidden="true">
        <div className="mq-front flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {row.map((item, i) => (
                <span key={i} className="flex items-center gap-4 md:gap-5">
                  <TechTile name={item} />
                  <span className="whitespace-nowrap font-display text-[clamp(1.5rem,3.4vw,3rem)] font-extrabold uppercase leading-none tracking-tight text-[var(--band-ink)]">
                    {item}
                  </span>
                  <Diamond className="bg-[var(--band-ink)]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
