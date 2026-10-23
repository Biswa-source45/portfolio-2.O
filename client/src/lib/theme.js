import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

// Keep in sync with the :root[data-theme] blocks in src/index.css.
export const THEMES = [
  { id: 'light', name: 'Sunrise', scheme: 'light', bg: '#f4f2ed', ink: '#121110', accent: '#ff5b1f' },
  { id: 'dark', name: 'Ember', scheme: 'dark', bg: '#0e0d0c', ink: '#f1efe9', accent: '#ff7a3d' },
  { id: 'paper', name: 'Paper', scheme: 'light', bg: '#fafaf7', ink: '#111111', accent: '#111111' },
  { id: 'noir', name: 'Noir', scheme: 'dark', bg: '#0c0c0c', ink: '#f5f5f2', accent: '#f5f5f2' },
  { id: 'meadow', name: 'Meadow', scheme: 'light', bg: '#f2f7ef', ink: '#10200f', accent: '#2fb562' },
  { id: 'matrix', name: 'Matrix', scheme: 'dark', bg: '#07110a', ink: '#d7f5dd', accent: '#4ade80' },
  { id: 'ocean', name: 'Ocean', scheme: 'light', bg: '#eef3fa', ink: '#0c1a2b', accent: '#2563eb' },
  { id: 'grape', name: 'Grape', scheme: 'dark', bg: '#0f0b1a', ink: '#ece8f7', accent: '#a78bfa' },
];

const byId = Object.fromEntries(THEMES.map((t) => [t.id, t]));

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (byId[set]) return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(id) {
  const root = document.documentElement;
  root.dataset.theme = id;
  root.dataset.scheme = byId[id].scheme;
}

export function useTheme() {
  const [theme, setThemeState] = useState(currentTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  // Switches theme with a soft-edged circle that grows out of `origin`
  // (the clicked element). Instant where View Transitions are unsupported
  // or the visitor prefers reduced motion.
  const setTheme = (next, origin) => {
    if (!byId[next] || next === theme) return;
    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced) {
      setThemeState(next);
      return;
    }
    const rect = origin?.getBoundingClientRect?.();
    root.style.setProperty('--reveal-x', rect ? `${rect.left + rect.width / 2}px` : '100%');
    root.style.setProperty('--reveal-y', rect ? `${rect.top + rect.height / 2}px` : '0px');
    root.dataset.themeSwitching = '';
    const transition = document.startViewTransition(() => {
      applyTheme(next);
      flushSync(() => setThemeState(next));
    });
    // A transition can be skipped (tab hidden, another one started); the theme still applies.
    transition.ready.catch(() => {});
    transition.finished.finally(() => delete root.dataset.themeSwitching);
  };

  return [theme, setTheme];
}
