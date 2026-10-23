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
    <motion.div initial="rest" whileHover="hover" animate="rest" className="relative h-full w-full overflow-hidden bg-ink text-bg">
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
          className="absolute rounded-full border border-bg/25 bg-bg/15 px-3 py-1 font-mono text-[11px]"
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
    <article className="work-card relative flex w-full origin-top flex-col gap-8 overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-[0_-18px_50px_-30px_rgb(0_0_0/0.25)] will-change-transform sm:p-7 lg:h-[min(72vh,640px)] lg:flex-row">
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
          <img src={project.image} alt={`${project.title} preview`} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
        ) : (
          <ProjectVisual project={project} index={index} />
        )}
      </div>
      {/* Fades the card into the page background as the next card stacks over it. */}
      <div className="wc-shade pointer-events-none absolute inset-0 bg-bg opacity-0" />
    </article>
  );
}

// Text, tags and links rise in one by one while the artwork wipes open. Runs
// once as the card starts to enter, so a card never slides up looking empty.
function cascade(card, trigger) {
  gsap
    .timeline({ scrollTrigger: { trigger, start: 'top 95%', once: true } })
    .from(card.querySelectorAll('.wc-part'), { y: 26, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05 })
    .fromTo(
      card.querySelector('.wc-visual'),
      { clipPath: 'inset(100% 0 0 0 round 16px)' },
      { clipPath: 'inset(0% 0 0 0 round 16px)', duration: 0.9, ease: 'power3.inOut' },
      0
    );
}

// Sticky offsets: each card parks a little lower than the one before it.
const STACK_TOP = 104;
const STACK_STEP = 26;

export default function Work({ projects = [] }) {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const slots = gsap.utils.toArray('.work-slot');
      const last = slots.at(-1);
      const mm = gsap.matchMedia();
      // Desktop: cards stick and stack. From the moment the next card enters until
      // the last card lands, each card keeps sinking back (smaller, more faded),
      // so the pile gets deeper as you scroll. Only transform and opacity animate.
      mm.add('(min-width: 768px)', () => {
        slots.forEach((slot, i) => {
          const card = slot.querySelector('.work-card');
          cascade(card, slot);
          const next = slots[i + 1];
          if (!next) return;
          const depth = slots.length - 1 - i;
          const sink = {
            trigger: next,
            start: 'top bottom',
            endTrigger: last,
            end: `top ${STACK_TOP + (slots.length - 1) * STACK_STEP}px`,
            scrub: true,
          };
          gsap.to(card, { scale: 1 - 0.05 * depth, force3D: true, ease: 'none', scrollTrigger: { ...sink } });
          gsap.to(card.querySelector('.wc-shade'), { opacity: Math.min(0.6, 0.3 * depth), ease: 'none', scrollTrigger: { ...sink } });
        });
      });
      mm.add('(max-width: 767px)', () => {
        slots.forEach((slot) => {
          gsap.from(slot, { y: 70, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: slot, start: 'top 88%' } });
          cascade(slot.querySelector('.work-card'), slot);
        });
      });
    },
    { scope: root, dependencies: [projects.length] }
  );

  if (!projects.length) return null;

  return (
    <section id="work" ref={root} className="px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-7xl">
        <SectionHead index="03" label="Selected work" lines={["Things I've", 'built & shipped.']} />
        <div className="mt-16 md:mt-20">
          {projects.map((p, i) => (
            <div
              key={p._id}
              className="work-slot mb-8 last:mb-0 md:sticky md:mb-[18vh] md:last:mb-0"
              style={{ top: STACK_TOP + i * STACK_STEP }}
            >
              <ProjectCard project={p} index={i} total={projects.length} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
