import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  // Switches theme with a circle that grows out of the clicked button
  // (View Transitions API; instant where unsupported or motion is reduced).
  const toggle = (event) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced) {
      setTheme(next);
      return;
    }
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    root.style.setProperty('--reveal-x', rect ? `${rect.left + rect.width / 2}px` : '100%');
    root.style.setProperty('--reveal-y', rect ? `${rect.top + rect.height / 2}px` : '0px');
    root.dataset.themeSwitching = '';
    const transition = document.startViewTransition(() => {
      root.dataset.theme = next;
      flushSync(() => setTheme(next));
    });
    transition.finished.finally(() => delete root.dataset.themeSwitching);
  };

  return [theme, toggle];
}
