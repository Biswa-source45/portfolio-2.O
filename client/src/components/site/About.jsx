import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import SectionHead from './SectionHead.jsx';

export default function About({ profile }) {
  const root = useRef(null);
  const words = (profile.about || '').split(/\s+/);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Words light up one by one as the paragraph scrolls through.
      gsap.fromTo(
        '.about-word',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.about-text', start: 'top 80%', end: 'bottom 45%', scrub: true } }
      );
      gsap.utils.toArray('.stat-num').forEach((el) => {
        const to = Number(el.dataset.to);
        const state = { v: 0 };
        gsap.to(state, {
          v: to,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
          onUpdate: () => (el.textContent = Math.round(state.v)),
        });
      });
      gsap.from('.stat-rule', { scaleX: 0, duration: 1.4, ease: 'expo.inOut', stagger: 0.15, scrollTrigger: { trigger: '.stats', start: 'top 85%' } });
    },
    { scope: root }
  );

  return (
    <section id="about" ref={root} className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="01" label="About" />
        <p className="about-text mt-10 max-w-6xl font-display text-[clamp(1.75rem,4.2vw,4rem)] font-medium leading-[1.1] tracking-tight">
          {words.map((w, i) => (
            <span key={i} className="about-word">
              {w}{' '}
            </span>
          ))}
        </p>

        {profile.stats?.length > 0 && (
          <div className="stats mt-24 grid gap-10 md:grid-cols-3">
            {profile.stats.map((s, i) => (
              <div key={i}>
                <div className="stat-rule h-px origin-left bg-ink" />
                <div className="mt-6 font-display text-7xl font-bold tracking-tight md:text-8xl">
                  <span className="stat-num tabular-nums" data-to={s.value}>
                    {s.value}
                  </span>
                  <span className="text-accent">{s.suffix}</span>
                </div>
                <p className="mt-3 max-w-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
