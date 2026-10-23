import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import SectionHead from './SectionHead.jsx';

export default function Skills({ groups = [] }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray('.skill-row').forEach((row) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%' } });
        tl.from(row.querySelector('.skill-rule'), { scaleX: 0, duration: 1.2, ease: 'expo.inOut' })
          .from(row.querySelector('.skill-title'), { yPercent: 110, duration: 0.9, ease: 'expo.out' }, 0.2)
          .from(row.querySelectorAll('.skill-chip'), { y: 18, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'expo.out' }, 0.3);
      });
    },
    { scope: root }
  );

  if (!groups.length) return null;

  return (
    <section id="skills" ref={root} className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="04" label="Toolkit" lines={['The stack,', 'end to end.']} />
        <div className="mt-20">
          {groups.map((g, i) => (
            <div key={g._id} className="skill-row group relative grid gap-5 py-7 md:grid-cols-12 md:items-center">
              <div className="skill-rule absolute inset-x-0 top-0 h-px origin-left bg-line" />
              <div className="flex items-baseline gap-4 md:col-span-4">
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="reveal-mask">
                  <h3 className="skill-title font-display text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-accent md:text-3xl">{g.title}</h3>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 md:col-span-8">
                {g.items.map((item) => (
                  <span key={item} className="skill-chip rounded-full border border-line px-4 py-2 text-sm transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-bg">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="h-px bg-line" />
        </div>
      </div>
    </section>
  );
}
