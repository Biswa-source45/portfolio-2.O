import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { api } from '../lib/api.js';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { ScrollContext } from '../components/site/scroll.js';
import Loader from '../components/site/Loader.jsx';
import Cursor from '../components/site/Cursor.jsx';
import Nav from '../components/site/Nav.jsx';
import Hero from '../components/site/Hero.jsx';
import Marquee from '../components/site/Marquee.jsx';
import About from '../components/site/About.jsx';
import Experience from '../components/site/Experience.jsx';
import Work from '../components/site/Work.jsx';
import Skills from '../components/site/Skills.jsx';
import Recognition from '../components/site/Recognition.jsx';
import Contact from '../components/site/Contact.jsx';
import ChatWidget from '../components/site/ChatWidget.jsx';

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);
  const [lenis, setLenis] = useState(null);
  const main = useRef(null);

  useEffect(() => {
    api('/portfolio').then(setData).catch((e) => setError(e.message));
    try {
      if (!sessionStorage.getItem('visited')) {
        sessionStorage.setItem('visited', '1');
        api('/visit', { method: 'POST' }).catch(() => {});
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({ duration: 1.15, smoothWheel: true });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lenis) return;
    ready ? lenis.start() : lenis.stop();
  }, [lenis, ready]);

  // Shared scroll reveals: masked lines slide up, [data-fade] blocks rise in.
  useGSAP(
    () => {
      if (!ready || prefersReducedMotion()) return;
      gsap.utils.toArray('[data-reveal="lines"]').forEach((el) => {
        gsap.from(el.querySelectorAll('.js-line'), {
          yPercent: 110,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });
      gsap.utils.toArray('[data-fade]').forEach((el) => {
        gsap.from(el, {
          y: 48,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          delay: Number(el.dataset.fade) || 0,
          scrollTrigger: { trigger: el, start: 'top 90%' },
        });
      });
      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener('load', refresh);
      return () => window.removeEventListener('load', refresh);
    },
    { scope: main, dependencies: [ready] }
  );

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="font-display text-3xl font-bold">Couldn't load the portfolio.</p>
          <p className="mt-2 text-muted">{error}. Is the API server running?</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollContext.Provider value={lenis}>
      <div className="has-cursor grain" ref={main}>
        <Loader name={data?.profile.name} dataReady={Boolean(data)} onDone={() => setReady(true)} />
        <Cursor />
        {data && (
          <>
            <Nav profile={data.profile} />
            <main>
              <Hero profile={data.profile} ready={ready} />
              <Marquee items={data.profile.marquee} />
              <About profile={data.profile} />
              <Experience items={data.experience} />
              <Work projects={data.projects} />
              <Skills groups={data.skills} />
              <Recognition achievements={data.achievements} profile={data.profile} />
              <Contact profile={data.profile} />
            </main>
            {data.profile.ai?.available && <ChatWidget profile={data.profile} />}
          </>
        )}
      </div>
    </ScrollContext.Provider>
  );
}
