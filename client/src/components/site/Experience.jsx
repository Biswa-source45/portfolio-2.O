import { useRef } from 'react';
import { MapPin } from '@phosphor-icons/react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import SectionHead from './SectionHead.jsx';

export default function Experience({ items = [] }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray('.exp-list').forEach((list) => {
        gsap.fromTo(list.querySelector('.exp-line'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: true } });
        list.querySelectorAll('.exp-step').forEach((step) => {
          gsap.from(step, { x: 40, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: step, start: 'top 82%' } });
          ScrollTrigger.create({ trigger: step, start: 'top 65%', toggleClass: { targets: step.querySelector('.exp-dot'), className: 'is-on' } });
        });
      });
    },
    { scope: root }
  );

  if (!items.length) return null;

  return (
    <section id="experience" ref={root} className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="02" label="Experience" lines={["Where I'm", 'shipping now.']} />

        {items.map((job) => (
          <div key={job._id} className="mt-20 grid gap-12 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-32" data-fade>
                {job.current && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-widest">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Current
                  </span>
                )}
                <h3 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">{job.company}</h3>
                <p className="mt-2 text-lg font-semibold text-accent">{job.role}</p>
                <p className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">{job.period}</p>
                {job.location && (
                  <p className="mt-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-muted">
                    <MapPin size={14} /> {job.location}
                  </p>
                )}
              </div>
            </div>

            <ol className="exp-list relative md:col-span-7">
              <span className="absolute left-[11px] top-2 bottom-2 w-px bg-line" />
              <span className="exp-line absolute left-[11px] top-2 bottom-2 w-px origin-top bg-accent" />
              {job.highlights.map((h, i) => (
                <li key={i} className="exp-step relative pb-14 pl-14 last:pb-0">
                  <span className="exp-dot absolute left-1 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-line bg-bg transition-colors duration-500 [&.is-on]:border-accent [&.is-on]:bg-accent" />
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="mt-2 font-display text-2xl font-bold tracking-tight">{h.title}</h4>
                  <p className="mt-3 leading-relaxed text-muted">{h.text}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
