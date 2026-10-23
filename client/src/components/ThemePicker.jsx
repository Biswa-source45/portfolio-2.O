import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Palette } from '@phosphor-icons/react';
import { THEMES, useTheme } from '../lib/theme.js';

// Palette button with a dropdown of themes; picking one reveals it in a
// circle growing from the clicked swatch.
export default function ThemePicker({ placement = 'down', className = '', buttonClassName = '', label }) {
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !root.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const up = placement === 'up';

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose colour theme"
        aria-expanded={open}
        aria-haspopup="true"
        className={buttonClassName || 'group relative grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:bg-ink hover:text-bg'}
      >
        <Palette size={label ? 18 : 16} weight={label ? 'regular' : 'bold'} className="shrink-0" />
        {label ? (
          <>
            <span className="flex-1">{label}</span>
            <span className="text-xs">{current.name}</span>
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </>
        ) : (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: up ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 8 : -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{ transformOrigin: up ? 'bottom left' : 'top right' }}
            className={`absolute z-[80] w-64 rounded-2xl border border-line bg-surface p-3 shadow-2xl shadow-black/15 ${
              up ? 'bottom-full left-0 mb-2' : 'right-0 top-full mt-2'
            }`}
          >
            <p className="px-1 pb-2 font-mono text-[11px] uppercase tracking-widest text-muted">Pick a colour vibe</p>
            <div className="grid grid-cols-2 gap-1.5">
              {THEMES.map((t, i) => {
                const active = t.id === current.id;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    aria-pressed={active}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    onClick={(e) => {
                      setTheme(t.id, e.currentTarget.querySelector('[data-swatch]'));
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-xl px-2 py-2 text-left text-sm transition-colors ${
                      active ? 'bg-ink/[0.07] font-semibold' : 'hover:bg-ink/[0.05]'
                    }`}
                  >
                    <span data-swatch className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line" style={{ background: t.bg }}>
                      <span className="h-3 w-3 rounded-full" style={{ background: t.accent, boxShadow: `0 0 0 2px ${t.bg}, 0 0 0 3px ${t.ink}22` }} />
                    </span>
                    <span className="flex-1">{t.name}</span>
                    {active && <Check size={14} weight="bold" className="text-accent" />}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
