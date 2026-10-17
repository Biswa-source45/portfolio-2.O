// Portfolio behaviour: loader, themes, GSAP scroll effects, anime.js 3D + mascots, rope + rocket.
class DCLogic { constructor() { this.props = {}; } }

class Component extends DCLogic {

  componentDidMount() {
    this._t = setTimeout(() => {
      try { this.initTheme(); } catch (e) { console.warn('theme', e); }
      try { this.boot(); } catch (e) { console.warn('portfolio motion', e); this.hideLoader(); }
    }, 140);
  }
  componentWillUnmount() {
    clearTimeout(this._t);
    try { if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach((s) => s.kill()); if (this._lenis) this._lenis.destroy(); } catch (e) {}
  }

  hideLoader() {
    const l = document.querySelector('.pf .loader');
    if (l) l.style.display = 'none';
    document.querySelector('.pf').classList.remove('loading');
  }

  initTheme() {
    const root = document.querySelector('.pf');
    const btn = root && root.querySelector('.tog');
    const pal = root && root.querySelector('.pal');
    if (!root || !btn || !pal || btn.dataset.bound) return;
    btn.dataset.bound = '1';
    const names = ['sunrise', 'ember', 'paper', 'noir', 'meadow', 'matrix'];
    const sws = Array.from(pal.querySelectorAll('.swb'));
    const mark = (t) => sws.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.th === t)));
    const apply = (t, animate) => {
      if (animate) { root.classList.add('themeswap'); setTimeout(() => root.classList.remove('themeswap'), 700); }
      root.setAttribute('data-theme', t);
      mark(t);
      try { window.localStorage.setItem('pf-theme2', t); } catch (e) {}
    };
    let saved = null;
    try { saved = window.localStorage.getItem('pf-theme2'); } catch (e) {}
    if (saved && names.indexOf(saved) > -1) { root.setAttribute('data-theme', saved); mark(saved); }
    else mark(root.getAttribute('data-theme') || 'sunrise');
    const close = () => { pal.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !pal.classList.contains('open');
      pal.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (window.anime) window.anime({ targets: btn.querySelector('svg'), rotate: [-25, 0], scale: [0.7, 1], duration: 600, easing: 'easeOutElastic(1, .6)' });
    });
    sws.forEach((s) => s.addEventListener('click', () => {
      apply(s.dataset.th, true);
      if (window.anime) window.anime({ targets: s.querySelector('i'), scale: [0.6, 1], duration: 600, easing: 'easeOutBack' });
      setTimeout(close, 220);
    }));
    document.addEventListener('click', (e) => { if (!pal.contains(e.target) && e.target !== btn) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  runLoader(A, loader, dur, cb) {
    const q = (s) => Array.from(loader.querySelectorAll(s));
    const pct = loader.querySelector('.lpct'), fill = loader.querySelector('.lfill'), msg = loader.querySelector('.lmsg');
    const msgs = ['Booting neural nets…', 'Feeding the robot chai…', 'Compiling pixels…', 'Almost there…'];
    const o = { v: 0 };
    let last = -1;
    A({ targets: loader.querySelector('.lrobot'), translateY: [0, -14], duration: 900, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    A({ targets: loader.querySelector('.lturn'), rotateY: [-30, 30], duration: 1700, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    A({ targets: loader.querySelector('.lant'), rotate: [-16, 16], duration: 500, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    A({ targets: loader.querySelector('.larm-l'), rotate: [0, -35], duration: 420, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    A({ targets: loader.querySelector('.larm-r'), rotate: [0, 35], duration: 420, direction: 'alternate', loop: true, easing: 'easeInOutSine', delay: 210 });
    A({ targets: loader.querySelector('.lshadow'), scaleX: [1, 0.62], opacity: [0.28, 0.12], duration: 900, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
    A({ targets: loader.querySelector('.lorbit'), rotateY: [0, 360], duration: 7000, easing: 'linear', loop: true });
    A({ targets: q('.oi'), rotateY: (el, i) => [-(i * 60), -(i * 60) - 360], duration: 7000, easing: 'linear', loop: true });
    A({ targets: q('.lmid > *'), opacity: [0, 1], translateY: [30, 0], delay: A.stagger(120), duration: 700, easing: 'easeOutExpo' });
    const exit = () => {
      loader.parentNode.classList.remove('loading');
      const tl = A.timeline({ complete: () => { loader.style.display = 'none'; cb(); } });
      tl.add({ targets: [loader.querySelector('.lbar'), loader.querySelector('.lrow'), loader.querySelector('.lorbitw')], opacity: 0, duration: 260, easing: 'easeInQuad' })
        .add({ targets: loader.querySelector('.lfly'), translateY: -(window.innerHeight * 0.9), scale: 0.55, rotate: 8, duration: 760, easing: 'easeInBack' }, 0)
        .add({ targets: q('.lc'), scaleY: [1, 0], duration: 850, delay: A.stagger(70, { from: 'center' }), easing: 'easeInOutQuart' }, 480);
    };
    A({ targets: o, v: 100, duration: dur, easing: 'easeInOutQuad',
      update: () => {
        const p = Math.round(o.v);
        if (p === last) return;
        last = p;
        pct.textContent = p + '%'; fill.style.width = p + '%'; msg.textContent = msgs[Math.min(3, Math.floor(p / 26))];
      },
      complete: exit });
  }

  boot() {
    const g = window.gsap, ST = window.ScrollTrigger, A = window.anime;
    const root = document.querySelector('.pf');
    if (!root) return;
    if (!g || !ST || root.dataset.booted) { this.hideLoader(); return; }
    root.dataset.booted = '1';
    g.registerPlugin(ST);
    const q = (s) => Array.from(root.querySelectorAll(s));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;

    g.to(root.querySelector('.prog'), { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
    if (reduce) { this.hideLoader(); return; }

    // smooth scroll
    let lenis = null;
    if (window.Lenis) {
      try {
        lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
        this._lenis = lenis;
        lenis.on('scroll', ST.update);
        g.ticker.add((t) => lenis.raf(t * 1000));
        g.ticker.lagSmoothing(0);
      } catch (e) { lenis = null; }
    }
    q('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const t = root.querySelector(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -58, duration: 1.4 });
      else t.scrollIntoView({ behavior: 'smooth' });
    }));

    // hero intro (starts after the loader)
    const tl = g.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.from('.nav .in > *', { y: -24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0)
      .from('.h1 .ch', { yPercent: 115, rotate: 7, duration: 1.2, stagger: 0.035 }, 0.1)
      .from('.hero-in', { y: 34, opacity: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.hero-3d', { opacity: 0, scale: 0.85, duration: 1.4 }, 0.4);

    const loader = root.querySelector('.loader');
    let seen = false;
    try { seen = window.sessionStorage.getItem('pf-seen') === '1'; window.sessionStorage.setItem('pf-seen', '1'); } catch (e) {}
    if (A && loader) this.runLoader(A, loader, seen ? 1100 : 2700, () => tl.play());
    else { this.hideLoader(); tl.play(); }

    // ---- anime.js: 3D scene + mascots ----
    if (A) {
      A({ targets: '.cube', rotateX: [0, 360], rotateY: [0, 360], duration: 18000, easing: 'linear', loop: true });
      A({ targets: '.ring3d .r1', rotateZ: [0, 360], duration: 22000, easing: 'linear', loop: true });
      A({ targets: '.ring3d .r2', rotateZ: [360, 0], duration: 30000, easing: 'linear', loop: true });
      A({ targets: '.badge .spin', rotate: [0, 360], duration: 14000, easing: 'linear', loop: true });
      A({ targets: '.fc', translateY: [-9, 9], rotate: [-2, 2], duration: 2400, direction: 'alternate', loop: true, easing: 'easeInOutSine', delay: A.stagger(500) });
      A({ targets: '.m-env', translateY: [0, -8], duration: 800, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
      A({ targets: '.m-bot', translateY: [0, -5], rotate: [-3, 3], duration: 1100, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
      A({ targets: '.m-ant', rotate: [-14, 14], duration: 600, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
      A({ targets: '.m-bub', scale: [1, 1.08], rotate: [-3, 3], duration: 900, direction: 'alternate', loop: true, easing: 'easeInOutQuad' });
      A({ targets: '.m-pin', translateY: [0, -12], duration: 620, direction: 'alternate', loop: true, easing: 'easeOutQuad' });
      A({ targets: '.m-shadow', scaleX: [1, 0.6], duration: 620, direction: 'alternate', loop: true, easing: 'easeOutQuad' });
      A({ targets: '.m-cup', rotate: [-4, 4], duration: 1300, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
      A({ targets: '.m-rocket', translateY: [0, -9], rotate: [-5, 5], duration: 1000, direction: 'alternate', loop: true, easing: 'easeInOutSine' });
      A({ targets: '.m-flame', scaleY: [1, 1.5], scaleX: [1, 0.85], duration: 180, direction: 'alternate', loop: true, easing: 'linear' });
      A({ targets: '.rkt .flm', scaleY: [1, 1.7], duration: 140, direction: 'alternate', loop: true, easing: 'linear' });
      q('.cc').forEach((card) => {
        const svg = card.querySelector('svg');
        card.addEventListener('mouseenter', () => A({ targets: svg, rotate: [0, -10, 10, -6, 0], scale: [1, 1.14, 1], duration: 750, easing: 'easeInOutSine' }));
      });
      q('.f3d').forEach((el, i) => {
        A.set(el, { opacity: 0, rotateY: -75, translateY: 50 });
        ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => A({ targets: el, opacity: [0, 1], rotateY: [-75, 0], translateY: [50, 0], duration: 1100, delay: (i % 3) * 140, easing: 'easeOutBack' }) });
      });
    }

    // ---- logo: real lightning arcs ----
    const logo = root.querySelector('.logo');
    const arcs = logo ? Array.from(logo.querySelectorAll('.arc')) : [];
    const iarc = logo ? logo.querySelector('.iarc') : null;
    if (logo) {
      const ends = [[13, 20, 2, 5], [57, 19, 68, 4], [14, 57, 3, 68], [58, 56, 68, 67]];
      const jag = (x1, y1, x2, y2, n, amp) => {
        let d = 'M' + x1 + ' ' + y1;
        for (let i = 1; i < n; i++) {
          const t = i / n;
          d += ' L' + (x1 + (x2 - x1) * t + (Math.random() - 0.5) * amp).toFixed(1) + ' ' + (y1 + (y2 - y1) * t + (Math.random() - 0.5) * amp).toFixed(1);
        }
        return d + ' L' + x2 + ' ' + y2;
      };
      let striking = false;
      const strike = (frames) => {
        if (striking) return;
        striking = true;
        let k = 0;
        const tick = () => {
          arcs.forEach((a, i) => {
            const e = ends[i];
            a.setAttribute('d', jag(e[0], e[1], e[2], e[3], 5 + Math.floor(Math.random() * 3), 11));
            a.style.opacity = Math.random() > 0.3 ? '1' : '0';
          });
          if (iarc) { iarc.setAttribute('d', jag(23 + (Math.random() - 0.5) * 12, -2, 23 + (Math.random() - 0.5) * 12, 48, 8, 14)); iarc.style.opacity = Math.random() > 0.2 ? '1' : '0'; }
          logo.classList.add('zap');
          if (++k < frames) setTimeout(tick, 55 + Math.random() * 70);
          else { arcs.forEach((a) => { a.style.opacity = '0'; }); if (iarc) iarc.style.opacity = '0'; logo.classList.remove('zap'); striking = false; }
        };
        tick();
      };
      const loop = () => { strike(4 + Math.floor(Math.random() * 4)); setTimeout(loop, 1800 + Math.random() * 2800); };
      setTimeout(loop, 3600);
      logo.addEventListener('mouseenter', () => strike(11));
      // icon box keeps changing: B -> code -> rocket -> robot -> bolt (3D flip, thunder on every swap)
      const icons = Array.from(logo.querySelectorAll('.lgi'));
      if (A && icons.length > 1) {
        A.set(icons.slice(1), { opacity: 0, rotateY: -90 });
        let ix = 0, busy = false;
        const swap = () => {
          if (busy) return;
          busy = true;
          const cur = icons[ix], nxt = icons[(ix + 1) % icons.length];
          ix = (ix + 1) % icons.length;
          strike(5);
          A({ targets: cur, rotateY: [0, 90], opacity: [1, 0], scale: [1, 0.7], duration: 260, easing: 'easeInQuad',
            complete: () => { A({ targets: nxt, rotateY: [-90, 0], opacity: [0, 1], scale: [0.7, 1], duration: 420, easing: 'easeOutBack', complete: () => { busy = false; if (nxt.querySelector('.rk-g')) { nxt.classList.remove('fly'); void nxt.getBoundingClientRect(); nxt.classList.add('fly'); } } }); } });
        };
        setInterval(swap, 2800);
        logo.addEventListener('click', swap);
      }
    }

    const vn = root.querySelector('.vnum');
    if (vn) {
      const to = parseFloat(vn.dataset.to) || 0, o = { v: 0 };
      vn.textContent = '0';
      ST.create({ trigger: vn, start: 'top 98%', once: true, onEnter: () => g.to(o, { v: to, duration: 2.2, ease: 'power3.out', onUpdate: () => { vn.textContent = Math.round(o.v).toLocaleString('en-US'); } }) });
    }

    // ---- marquee reacts to scroll speed + direction ----
    const anims = q('.mqr .track').map((t) => (t.getAnimations ? t.getAnimations()[0] : null)).filter(Boolean);
    if (anims.length) {
      let target = 1, rate = 1, lastRate = 1;
      ST.create({ trigger: root, start: 'top top', end: 'bottom bottom', onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) > 40) target = (v < 0 ? -1 : 1) * (1 + Math.min(Math.abs(v) / 350, 7));
      } });
      g.ticker.add(() => {
        target += (1 - target) * 0.05;
        rate += (target - rate) * 0.08;
        if (Math.abs(rate - 1) < 0.002 && Math.abs(target - 1) < 0.002) { rate = 1; target = 1; }
        if (rate !== lastRate) { lastRate = rate; anims.forEach((a) => { a.playbackRate = rate; }); }
      });
    }

    // ---- rope + rocket travelling between sections ----
    const rope = root.querySelector('.rope');
    const rsvg = rope && rope.querySelector('.rsvg');
    const track = rope && rope.querySelector('.rtrack');
    const draw = rope && rope.querySelector('.rdraw');
    const knots = rope ? Array.from(rope.querySelectorAll('.knot')) : [];
    const rkt = rope && rope.querySelector('.rkt');
    const R = { ready: false, xs: [], ys: [], ls: [], len: 0, cur: 0, top: 0 };
    const buildRope = () => {
      if (!rope) return;
      const W = root.clientWidth, H = root.offsetHeight;
      rsvg.setAttribute('width', W); rsvg.setAttribute('height', H); rsvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      const mob = window.innerWidth <= 900;
      const xl = mob ? 18 : Math.max(32, (W - 1054) / 2 - 34), xr = W - xl;
      const pts = [{ x: xl, y: 150 }];
      ['about', 'experience', 'work', 'skills', 'recognition', 'contact'].forEach((id, i) => {
        const el = root.querySelector('#' + id);
        pts.push({ x: i % 2 === 0 ? xr : xl, y: el.offsetTop + Math.min(el.offsetHeight * 0.1, 140) });
      });
      pts.push({ x: xr, y: H - 150 });
      let d = 'M' + pts[0].x + ' ' + pts[0].y;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = (b.y - a.y) * 0.55;
        d += ' C' + a.x + ' ' + (a.y + dy) + ' ' + b.x + ' ' + (b.y - dy) + ' ' + b.x + ' ' + b.y;
      }
      track.setAttribute('d', d); draw.setAttribute('d', d);
      knots.forEach((k, i) => { const p = pts[i + 1]; if (p) { k.setAttribute('cx', p.x); k.setAttribute('cy', p.y); } });
      // sample the rope so the rocket can be pinned to the viewport height; computed from the
      // Bezier maths because getPointAtLength is very slow on a path this long
      R.xs = [pts[0].x]; R.ys = [pts[0].y]; R.ls = [0];
      const N = 60;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dy = (b.y - a.y) * 0.55;
        for (let s = 1; s <= N; s++) {
          const t = s / N, u = 1 - t, w0 = u * u * u, w1 = 3 * u * u * t, w2 = 3 * u * t * t, w3 = t * t * t;
          const x = w0 * a.x + w1 * a.x + w2 * b.x + w3 * b.x, y = w0 * a.y + w1 * (a.y + dy) + w2 * (b.y - dy) + w3 * b.y;
          const l = R.ls[R.ls.length - 1] + Math.hypot(x - R.xs[R.xs.length - 1], y - R.ys[R.ys.length - 1]);
          R.xs.push(x); R.ys.push(y); R.ls.push(l);
        }
      }
      R.len = R.ls[R.ls.length - 1];
      draw.style.strokeDasharray = R.len;
      R.ready = true;
      R.top = root.getBoundingClientRect().top + window.scrollY;
      R.cur = window.scrollY - R.top + window.innerHeight * 0.55;
      place(R.cur);
    };
    const place = (y) => {
      if (!R.ready) return;
      const ys = R.ys, last = ys.length - 1;
      const yy = Math.min(Math.max(y, ys[0]), ys[last]);
      let lo = 0, hi = last;
      while (lo < hi) { const m = (lo + hi) >> 1; if (ys[m] < yy) lo = m + 1; else hi = m; }
      const i1 = Math.max(1, lo), i0 = i1 - 1;
      const t = ys[i1] === ys[i0] ? 0 : (yy - ys[i0]) / (ys[i1] - ys[i0]);
      const x = R.xs[i0] + (R.xs[i1] - R.xs[i0]) * t;
      const l = R.ls[i0] + (R.ls[i1] - R.ls[i0]) * t;
      const a = Math.max(0, i0 - 1), b = Math.min(last, i1 + 1);
      const ang = Math.atan2(ys[b] - ys[a], R.xs[b] - R.xs[a]) * 180 / Math.PI;
      const hs = (rkt.offsetWidth || 46) / 2;
      g.set(rkt, { x: x - hs, y: yy - hs, rotation: ang + 90 });
      draw.style.strokeDashoffset = R.len - l;
      knots.forEach((k) => k.classList.toggle('on', parseFloat(k.getAttribute('cy')) < yy));
    };
    if (rope) {
      buildRope();
      g.ticker.add(() => {
        if (!R.ready || root.classList.contains('loading')) return;
        const target = window.scrollY - R.top + window.innerHeight * 0.55;
        if (Math.abs(target - R.cur) < 0.3) return;
        R.cur += (target - R.cur) * 0.14;
        place(R.cur);
      });
      ST.addEventListener('refresh', buildRope);
      setTimeout(buildRope, 1800);
    }

    // hero 3D tilt follows pointer + glow
    const hero = root.querySelector('.hero');
    const sin = root.querySelector('.sin');
    const glow = root.querySelector('.glow');
    if (hero && fine) {
      const rx = sin ? g.quickTo(sin, 'rotateX', { duration: 0.9, ease: 'power3' }) : null;
      const ry = sin ? g.quickTo(sin, 'rotateY', { duration: 0.9, ease: 'power3' }) : null;
      const gx = glow ? g.quickTo(glow, 'x', { duration: 1.2, ease: 'power3' }) : null;
      const gy = glow ? g.quickTo(glow, 'y', { duration: 1.2, ease: 'power3' }) : null;
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        if (rx) { rx(-py * 16); ry(px * 24); }
        if (gx) { gx(px * 120); gy(py * 80); }
      });
      hero.addEventListener('mouseleave', () => { if (rx) { rx(0); ry(0); } });
    }
    g.to('.glow', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    g.to('.h1', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

    q('.hb').forEach((el) => g.fromTo(el, { backgroundPositionX: '0px' }, { backgroundPositionX: '160px', ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));

    q('.sh').forEach((el, i) => {
      g.from(el, { yPercent: 112, duration: 1.2, ease: 'expo.out', delay: (i % 2) * 0.1, scrollTrigger: { trigger: el.closest('h2'), start: 'top 86%', once: true } });
    });
    q('.lab').forEach((el) => g.from(el, { x: -24, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

    ST.batch(q('.rv'), { start: 'top 90%', once: true, onEnter: (els) => g.from(els, { y: 56, opacity: 0, duration: 1.1, ease: 'back.out(1.3)', stagger: 0.12, clearProps: 'transform,opacity' }) });

    g.fromTo('.about-p .w', { opacity: 0.16 }, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '.about-p', start: 'top 82%', end: 'bottom 58%', scrub: 0.6 } });

    q('.num').forEach((el) => {
      const to = parseFloat(el.dataset.to || el.textContent) || 0;
      const o = { v: 0 };
      el.textContent = '0';
      ST.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => g.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } }) });
    });

    g.to('.tl-line', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 60%', scrub: 0.5 } });

    const cards = q('.pcard');
    cards.forEach((card, i) => {
      if (i < cards.length - 1 && window.innerWidth > 900) {
        g.to(card, { scale: 0.94, opacity: 0.6, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top 14%', scrub: true } });
      }
      const draws = card.querySelectorAll('.draw'), bars = card.querySelectorAll('.bar'), pops = card.querySelectorAll('.pop');
      const reveal = g.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      if (pops.length) reveal.from(pops, { scale: 0.5, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'back.out(2.2)' }, 0);
      if (draws.length) reveal.from(draws, { strokeDashoffset: 1, duration: 1.4, stagger: 0.15 }, 0.1);
      if (bars.length) reveal.from(bars, { scaleX: 0, duration: 1.1, stagger: 0.12 }, 0.2);
      const mockEl = card.querySelector('.pv .mock');
      if (mockEl) reveal.from(mockEl, { y: 60, opacity: 0, scale: 0.92, rotateX: 12, transformPerspective: 900, duration: 1.1, ease: 'power3.out' }, 0);
      ST.create({ trigger: card, start: 'top 75%', once: true, onEnter: () => reveal.play() });
      const svg = card.querySelector('.pv .mock');
      if (svg) g.fromTo(svg, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    q('.links a[data-sec]').forEach((a) => {
      const sec = root.querySelector('#' + a.dataset.sec);
      if (sec) ST.create({ trigger: sec, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => a.classList.toggle('on', s.isActive) });
    });

    if (fine) {
      q('.mag').forEach((el) => {
        const mx = g.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1,0.5)' });
        const my = g.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1,0.5)' });
        el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.5); });
        el.addEventListener('mouseleave', () => { mx(0); my(0); });
      });
      q('.tilt').forEach((el) => {
        el.addEventListener('mousemove', (e) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
          g.to(el, { rotateY: px * 9, rotateX: -py * 9, transformPerspective: 900, duration: 0.5, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => g.to(el, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'elastic.out(1,0.45)' }));
      });
      const cur = root.querySelector('.cur'), dot = root.querySelector('.curd');
      if (cur && dot) {
        const rx = g.quickTo(cur, 'x', { duration: 0.5, ease: 'power3' }), ry = g.quickTo(cur, 'y', { duration: 0.5, ease: 'power3' });
        const dx = g.quickTo(dot, 'x', { duration: 0.07, ease: 'power2' }), dy = g.quickTo(dot, 'y', { duration: 0.07, ease: 'power2' });
        let shown = false;
        window.addEventListener('mousemove', (e) => {
          if (!shown) { shown = true; g.set([cur, dot], { x: e.clientX, y: e.clientY }); g.to([cur, dot], { opacity: 1, duration: 0.3 }); }
          rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
        });
        document.addEventListener('mouseleave', () => { shown = false; g.to([cur, dot], { opacity: 0, duration: 0.25 }); });
        window.addEventListener('mousedown', () => cur.classList.add('down'));
        window.addEventListener('mouseup', () => cur.classList.remove('down'));
        q('a,button,.chips span,.mag').forEach((el) => {
          el.addEventListener('mouseenter', () => { cur.classList.add('hov'); dot.classList.add('hov'); });
          el.addEventListener('mouseleave', () => { cur.classList.remove('hov'); dot.classList.remove('hov'); });
        });
      }
    }
    ST.refresh();
  }
}

const app = new Component();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => app.componentDidMount());
else app.componentDidMount();
