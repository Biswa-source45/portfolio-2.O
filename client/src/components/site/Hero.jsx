import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, GithubLogo } from '@phosphor-icons/react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import { useScrollTo } from './scroll.js';
import Magnetic from './Magnetic.jsx';

function useClock(timeZone = 'Asia/Kolkata') {
  const fmt = () => new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15_000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return time;
}

const Chars = ({ text }) =>
  [...text].map((c, i) => (
    <span key={i} className="reveal-mask">
      <span className="hero-char inline-block">{c}</span>
    </span>
  ));

export default function Hero({ profile, ready }) {
  const root = useRef(null);
  const time = useClock();
  const scrollTo = useScrollTo();
  const [first, ...rest] = profile.name.split(' ');
  const last = rest.join(' ');

  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.from('.hero-char', { yPercent: 115, duration: 1.3, stagger: 0.035 })
        .fromTo('.hero-photo', { clipPath: 'inset(100% 0 0 0 round 24px)' }, { clipPath: 'inset(0% 0 0 0 round 24px)', duration: 1.4, ease: 'expo.inOut' }, 0.35)
        .from('.hero-photo img', { scale: 1.35, duration: 1.8 }, 0.35)
        .from('.hero-fade', { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
        .from('.hero-rule', { scaleX: 0, duration: 1.4, ease: 'expo.inOut' }, 0.3);

      // Scroll parallax: the two name lines drift apart.
      const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-l1', { xPercent: -12, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-l2', { xPercent: 10, ease: 'none', scrollTrigger: st });
    },
    { scope: root, dependencies: [ready] }
  );

  return (
    <section id="top" ref={root} className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 md:pt-32">
      <div className="mx-auto w-full max-w-7xl">
        <div className="hero-fade flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>
            {profile.location} · {time} IST
          </span>
          <span className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {profile.availability}
          </span>
        </div>

        <h1 className="mt-[clamp(2.5rem,9vh,6rem)] font-display font-extrabold uppercase leading-[0.84] tracking-[-0.045em]" aria-label={profile.name}>
          <span aria-hidden="true" className="hero-l1 block whitespace-nowrap text-[clamp(2.9rem,11.6vw,11.5rem)]">
            <Chars text={first} />
          </span>
          <span aria-hidden="true" className="hero-l2 block whitespace-nowrap text-[clamp(2.9rem,11.6vw,11.5rem)]">
            <Chars text={last} />
            <span className="reveal-mask">
              <span className="hero-char inline-block text-accent">.</span>
            </span>
          </span>
        </h1>

        <div className="hero-rule mt-8 h-px origin-left bg-line" />

        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          {profile.photo && (
            <figure className="hero-photo relative w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-white md:col-span-4 lg:col-span-3">
              <img src={profile.photo} alt={`Portrait of ${profile.name}`} className="block h-auto w-full transition-transform duration-700 ease-out-expo hover:scale-[1.03]" />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-bg backdrop-blur">
                {profile.name}
              </figcaption>
            </figure>
          )}
          <div className={profile.photo ? 'md:col-span-8 lg:col-span-6' : 'md:col-span-9'}>
            <p className="hero-fade font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {profile.role} & AI Engineer
            </p>
            <p className="hero-fade mt-4 max-w-xl text-lg leading-relaxed text-ink/80 md:text-xl">{profile.headline}</p>
          </div>
          <div className="hero-fade flex flex-wrap gap-3 md:col-span-12 lg:col-span-3 lg:justify-end">
            <Magnetic>
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('#work');
                }}
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
              >
                Selected work
                <ArrowDownRight size={16} weight="bold" className="transition-transform duration-300 group-hover:rotate-[-45deg]" />
              </a>
            </Magnetic>
            {profile.socials?.github && (
              <Magnetic>
                <a href={profile.socials.github} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold transition-colors hover:bg-ink hover:text-bg">
                  <GithubLogo size={16} weight="bold" />
                  GitHub
                  <ArrowUpRight size={14} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
