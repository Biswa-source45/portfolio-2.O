import { useEffect, useState } from 'react';
import CursorTrail from '../apex/ApexUI-Kit/CursorTrail/CursorTrail.jsx';

const readAccent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff5b1f';

// ApexUI's sparkle cursor trail across the whole page, coloured with the
// current theme's accent and updated whenever the theme changes.
export default function ThemedCursorTrail() {
  const [color, setColor] = useState(readAccent);

  useEffect(() => {
    const observer = new MutationObserver(() => setColor(readAccent()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return <CursorTrail variant="sparkles" color={color} size={1.3} length={1.2} global />;
}
