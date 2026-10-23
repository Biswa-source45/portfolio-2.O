import { createContext, useContext } from 'react';

export const ScrollContext = createContext(null);

// Smooth-scrolls to a section through Lenis, falling back to native scrolling.
export function useScrollTo() {
  const lenis = useContext(ScrollContext);
  return (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  };
}
