import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { List, X } from '@phosphor-icons/react';
import ThemePicker from '../ThemePicker.jsx';
import { useScrollTo } from './scroll.js';
import Magnetic from './Magnetic.jsx';

const LINKS = [
  ['about', 'About'],
  ['experience', 'Experience'],
  ['work', 'Work'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
];

export default function Nav({ profile }) {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const scrollTo = useScrollTo();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240);
    setScrolled(y > 40);
  });

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    LINKS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(`#${id}`);
  };

  const initials = profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-3 py-2 transition-colors duration-500 ${
            scrolled ? 'border-line bg-bg/75 backdrop-blur-xl' : 'border-transparent'
          }`}
        >
          <a href="#top" onClick={go('top')} className="group flex items-center gap-2.5 pl-1" aria-label="Back to top">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-display text-sm font-bold text-bg transition-transform duration-500 group-hover:rotate-[360deg]">
              {initials}
            </span>
            <span className="hidden font-mono text-xs uppercase tracking-widest sm:inline">{profile.name.split(' ')[0]}</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {LINKS.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={go(id)} className="relative px-4 py-2 text-sm">
                {active === id && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-ink/[0.07]" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
                <span className={`relative transition-colors ${active === id ? 'text-ink' : 'text-muted hover:text-ink'}`}>{label}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemePicker />
            <Magnetic className="hidden sm:inline-block">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg transition-colors hover:bg-accent hover:text-accent-ink">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                Hire me
              </a>
            </Magnetic>
            <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} className="grid h-9 w-9 place-items-center rounded-full bg-ink text-bg md:hidden">
              {open ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-12 text-bg md:hidden"
          >
            {LINKS.map(([id, label], i) => (
              <div key={id} className="overflow-hidden">
                <motion.a
                  href={`#${id}`}
                  onClick={go(id)}
                  initial={{ y: '100%' }}
                  animate={{ y: '0%' }}
                  exit={{ y: '100%' }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline gap-4 py-1 font-display text-5xl font-bold"
                >
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  {label}
                </motion.a>
              </div>
            ))}
            <a href={`mailto:${profile.email}`} className="mt-8 font-mono text-sm opacity-70">
              {profile.email}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
