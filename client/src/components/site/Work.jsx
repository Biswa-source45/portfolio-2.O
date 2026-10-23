import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, GithubLogo, LockSimple } from '@phosphor-icons/react';
import { gsap, useGSAP, prefersReducedMotion } from '../../lib/motion.js';
import SectionHead from './SectionHead.jsx';

const CHIP_SPOTS = [
  ['8%', '14%'],
  ['62%', '10%'],
  ['14%', '72%'],
  ['58%', '78%'],
  ['72%', '44%'],
  ['4%', '44%'],
];

// Minimal generated artwork used when a project has no screenshot.
function ProjectVisual({ project, index }) {
  const initials = project.title.split(/\s|-/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3);
  return (
    <motion.div initial="rest" whileHover="hover" animate="rest" className="relative h-full w-full overflow-hidden bg-ink text-bg" data-cursor="View">
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'linear-gradient(var(--bg) 1px, transparent 1px), linear-gradient(90deg, var(--bg) 1px, transparent 1px)', backgroundSize: '44px 44px' }}
      />
      <motion.div
        variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.15, rotate: -8 } }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        className="absolute left-1/2 top-1/2 h-[46%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[clamp(4rem,9vw,9rem)] font-extrabold tracking-tighter text-white">{initials}</span>
      </div>
      {project.tags?.slice(0, CHIP_SPOTS.length).map((tag, i) => (
        <motion.span
          key={tag}
          variants={{ rest: { x: 0, y: 0 }, hover: { x: (i % 2 ? 1 : -1) * 14, y: (i < 3 ? -1 : 1) * 12 } }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          className="absolute rounded-full border border-bg/25 bg-bg/10 px-3 py-1 font-mono text-[11px] backdrop-blur"
          style={{ left: CHIP_SPOTS[i][0], top: CHIP_SPOTS[i][1] }}
        >
          {tag}
        </motion.span>
      ))}
      <span className="absolute bottom-4 right-5 font-mono text-[11px] opacity-60">{String(index + 1).padStart(2, '0')}</span>
    </motion.div>
  );
}

function ProjectCard({ project, index, total }) {
  return (
    <article className="work-card flex w-full shrink-0 flex-col gap-8 rounded-[28px] border border-line bg-surface p-5 sm:p-7 lg:h-[72vh] lg:w-[78vw] lg:max-w-[1150px] lg:flex-row">
      <div className="flex flex-col justify-between lg:w-[42%]">
        <div>
          <div className="wc-part flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted">
            <span>{project.category}</span>
            <span>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
          <h3 className="wc-part mt-8 font-display text-4xl font-bold leading-[0.95] tracking-tight md:text-5xl">{project.title}</h3>
          <p className="wc-part mt-3 text-accent">{project.subtitle}</p>
          <p className="wc-part mt-6 leading-relaxed text-muted">{project.description}</p>
        </div>
        <div className="mt-8">
          <div className="flex flex-wrap gap-2">
            {project.tags?.map((t) => (
              <span key={t} className="wc-part rounded-full border border-line px-3 py-1 font-mono text-[11px]">
                {t}
              </span>
            ))}
          </div>
          <div className="wc-part mt-6 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg">
                Live site <ArrowUpRight size={14} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-bg">
                <GithubLogo size={14} weight="bold" /> Code
              </a>
            )}
            {project.note && (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                <LockSimple size={13} /> {project.note}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="wc-visual aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-auto lg:flex-1">
        {project.image ? (
          <img src={project.image} alt={`${project.title} preview`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" data-cursor="View" />
        ) : (
          <ProjectVisual project={project} index={index} />
        )}
      </div>
    </article>
  );
}

// Text, tags and links slide in one by one, then the artwork wipes open.
function cascade(card, scrollTrigger, x, y) {
  const tl = gsap.timeline({ scrollTrigger });
  tl.from(card.querySelectorAll('.wc-part'), { x, y, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06 }).fromTo(
    card.querySelector('.wc-visual'),
    { clipPath: 'inset(0 0 0 100% round 16px)' },
    { clipPath: 'inset(0 0 0 0% round 16px)', duration: 1.1, ease: 'expo.inOut' },
    0.1
  );
  return tl;
}

export default function Work({ projects = [] }) {
  const root = useRef(null);
  const track = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      // Desktop: pin the section and scroll the cards sideways.
      mm.add('(min-width: 1024px)', () => {
        const distance = () => track.current.scrollWidth - window.innerWidth + 48;
        const tween = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.work-pin',
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        gsap.to('.work-progress', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.work-pin', start: 'top top', end: () => `+=${distance()}`, scrub: true } });
        gsap.utils.toArray('.work-card').forEach((card, i) => {
          // Card swings in from the right as the track scrolls…
          gsap.fromTo(
            card,
            { xPercent: 18, rotateY: -14, scale: 0.9, opacity: 0.35, transformPerspective: 1400, transformOrigin: 'left center' },
            { xPercent: 0, rotateY: 0, scale: 1, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 105%', end: 'left 45%', scrub: true } }
          );
          // …then its contents cascade in one after another. The first card is
          // already in view when the section pins, so it plays on vertical scroll.
          const trigger = i === 0 ? { trigger: '.work-pin', start: 'top 65%' } : { trigger: card, containerAnimation: tween, start: 'left 80%' };
          cascade(card, { ...trigger, toggleActions: 'play none none reverse' }, 120, 0);
        });
      });
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray('.work-card').forEach((card) => {
          gsap.from(card, { y: 70, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } });
          cascade(card, { trigger: card, start: 'top 80%' }, 0, 36);
        });
      });
    },
    { scope: root, dependencies: [projects.length] }
  );

  if (!projects.length) return null;

  return (
    <section id="work" ref={root} className="py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead index="03" label="Selected work" lines={["Things I've", 'built & shipped.']} />
      </div>
      <div className="work-pin mt-16 lg:mt-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden">
        <div ref={track} className="flex flex-col gap-6 px-4 sm:px-6 lg:w-max lg:flex-row lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]">
          {projects.map((p, i) => (
            <ProjectCard key={p._id} project={p} index={i} total={projects.length} />
          ))}
        </div>
        <div className="mx-auto mt-8 hidden h-px w-full max-w-7xl bg-line px-6 lg:block">
          <div className="work-progress h-px origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </section>
  );
}
