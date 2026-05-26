/* ════════════════════════════════════════════════════════════
   Starr Fintech Global — motion layer (shared)
   GSAP core + ScrollTrigger via CDN. Degrades gracefully:
   no GSAP / reduced-motion → content fully visible, no canvas loop.
   ════════════════════════════════════════════════════════════ */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* year */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  /* US East-coast clock — set in any [data-clock]. Abbreviation (EST/EDT)
     resolves automatically for America/New_York. */
  const estClock = () => {
    const p = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'America/New_York', timeZoneName: 'short',
    }).formatToParts(new Date());
    const get = t => (p.find(x => x.type === t) || {}).value || '';
    return `${get('hour')}:${get('minute')} ${get('timeZoneName')}`;
  };
  const setClock = () => $$('[data-clock]').forEach(el => el.textContent = estClock());
  if ($('[data-clock]')) { setClock(); setInterval(setClock, 30000); }

  /* mobile menu */
  const menuBtn = $('.menu-btn'), tabs = $('.tabs');
  if (menuBtn && tabs) menuBtn.addEventListener('click', () => tabs.classList.toggle('open'));

  /* ── node-graph network background ── */
  initNet();

  /* ── scramble decode (runs once, on load) ── */
  const CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#%<>';
  function scramble(el) {
    const target = el.dataset.scramble;
    el.setAttribute('aria-label', target);
    if (reduced) { el.textContent = target; return Promise.resolve(); }
    let f = 0;
    return new Promise(res => {
      const id = setInterval(() => {
        f++; let out = '';
        for (let i = 0; i < target.length; i++) {
          if (target[i] === ' ') { out += ' '; continue; }
          out += (f / 2 > i) ? target[i] : CH[Math.floor(Math.random() * CH.length)];
        }
        el.textContent = out;
        if (f / 2 > target.length) { clearInterval(id); el.textContent = target; res(); }
      }, 28);
    });
  }

  const hasGSAP = typeof window.gsap !== 'undefined';
  if (!hasGSAP || reduced) {
    // static fallback: reveal everything, resolve scrambles instantly
    $$('[data-scramble]').forEach(el => { el.textContent = el.dataset.scramble; });
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* scroll progress */
  if ($('.scanbar')) gsap.to('.scanbar', { scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });

  /* nav condense */
  ScrollTrigger.create({ start: 'top -60', toggleClass: { targets: 'nav.bar', className: 'scrolled' } });

  /* hero scramble → then fade rest of hero */
  const scrambles = $$('.hero [data-scramble]');
  const heroFades = $$('.hero [data-fade]');
  gsap.set(heroFades, { y: 18, opacity: 0 });
  (async () => {
    for (const el of scrambles) await scramble(el);
    gsap.to(heroFades, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' });
    $$('.hero [data-count]').forEach(b => countUp(b));
  })();

  /* non-hero scrambles decode on scroll-in */
  $$('[data-scramble]').forEach(el => {
    if (el.closest('.hero')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => scramble(el) });
  });

  /* generic scroll reveals */
  $$('[data-fade]').forEach(el => {
    if (el.closest('.hero')) return;
    gsap.from(el, { y: 34, opacity: 0, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* stagger groups: cards */
  $$('[data-stagger]').forEach(group => {
    gsap.from(group.children, { y: 46, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: group, start: 'top 82%' } });
  });

  /* non-hero count-ups */
  $$('[data-count]').forEach(b => {
    if (b.closest('.hero')) return;
    ScrollTrigger.create({ trigger: b, start: 'top 88%', once: true, onEnter: () => countUp(b) });
  });

  function countUp(b) {
    const t = +b.dataset.count, sfx = b.dataset.suffix || '', o = { v: 0 };
    gsap.to(o, { v: t, duration: 1.4, ease: 'power2.out', onUpdate: () => b.textContent = Math.round(o.v) + sfx });
  }

  /* ── node-graph canvas ── */
  function initNet() {
    const cv = $('canvas.net'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, nodes = [], mouse = { x: -999, y: -999 }, raf;
    const DPR = Math.min(devicePixelRatio || 1, 2);
    function size() {
      W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      const n = Math.min(64, Math.floor(innerWidth * innerHeight / 26000));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .22 * DPR, vy: (Math.random() - .5) * .22 * DPR,
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const a of nodes) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const dx = a.x - mouse.x * DPR, dy = a.y - mouse.y * DPR, dm = Math.hypot(dx, dy);
        if (dm < 140 * DPR && dm > 0) { a.x += dx / dm * .5; a.y += dy / dm * .5; }
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 150 * DPR) {
          ctx.strokeStyle = `rgba(55,224,200,${(1 - d / (150 * DPR)) * .25})`;
          ctx.lineWidth = DPR; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (const a of nodes) { ctx.fillStyle = 'rgba(199,249,72,.75)'; ctx.fillRect(a.x - 1.2 * DPR, a.y - 1.2 * DPR, 2.4 * DPR, 2.4 * DPR); }
      raf = requestAnimationFrame(frame);
    }
    size();
    if (!reduced) frame();
    addEventListener('resize', () => { cancelAnimationFrame(raf); size(); if (!reduced) frame(); });
    addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  }
})();
