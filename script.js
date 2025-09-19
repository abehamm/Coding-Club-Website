// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#nav-menu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    navMenu.classList.toggle('open');
  });
  // Close menu when a link is clicked (mobile)
  navMenu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Join form validation + status
const form = document.querySelector('#join-form');
const status = document.querySelector('.form-status');
if (form && status) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    if (!form.checkValidity()) {
      status.textContent = 'Please fill in the required fields.';
      const firstInvalid = form.querySelector(':invalid');
      firstInvalid?.focus();
      return;
    }
    status.textContent = 'Thanks! We’ll email you meeting details soon.';
    form.reset();
  });
}

// Improve focus outline visibility for keyboard users only
document.body.addEventListener('mousedown', () => {
  document.body.classList.add('using-mouse');
});
document.body.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') document.body.classList.remove('using-mouse');
});

// Sprinkled shape layer with multi-rect exclusions (title, tagline, buttons, title icons)
(function(){
  const COLORS = ['#f52c7a', '#ec8a14', '#2de2e6', '#f2c94c'];
  const TYPES  = ['circle','square','diamond','pill'];

  const layer = document.querySelector('.shape-layer');
  if (!layer) return;

  const hero       = layer.closest('.hero') || document.body;
  const title      = hero.querySelector('.title-wrap') || hero.querySelector('.hero-title');
  const tagline    = hero.querySelector('.tagline') || hero.querySelector('#home + .tagline, .hero .tagline');
  const buttons    = [...hero.querySelectorAll('.btn, .cta .btn, [data-cta]')];
  const titleIcons = [...hero.querySelectorAll('.title-icon')];

  // helpers
  const pct = (value, total) => (value / total) * 100;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function rectToPct(rect, ref){
    return {
      x: pct(rect.left - ref.left, ref.width),
      y: pct(rect.top  - ref.top , ref.height),
      w: pct(rect.width,  ref.width),
      h: pct(rect.height, ref.height),
    };
  }

  function expandRectPct(rectPct, pxMargin, ref){
    const mx = pct(pxMargin, ref.width);
    const my = pct(pxMargin, ref.height);
    return {
      x: clamp(rectPct.x - mx, 0, 100),
      y: clamp(rectPct.y - my, 0, 100),
      w: clamp(rectPct.w + 2*mx, 0, 100),
      h: clamp(rectPct.h + 2*my, 0, 100),
    };
  }

  function overlaps(px, py, rect){
    return px > rect.x && px < rect.x + rect.w && py > rect.y && py < rect.y + rect.h;
  }

  function distance(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy); }

  function getExclusions(){
    const ref = layer.getBoundingClientRect();
    const rects = [];

    // Larger buffers around important UI to keep shapes visually clear
    if (title){
      const r = expandRectPct(rectToPct(title.getBoundingClientRect(), ref), 36, ref);
      rects.push(r);
    }
    if (tagline){
      const r = expandRectPct(rectToPct(tagline.getBoundingClientRect(), ref), 24, ref);
      rects.push(r);
    }
    for (const el of buttons){
      const r = expandRectPct(rectToPct(el.getBoundingClientRect(), ref), 22, ref);
      rects.push(r);
    }
    for (const el of titleIcons){
      const r = expandRectPct(rectToPct(el.getBoundingClientRect(), ref), 16, ref);
      rects.push(r);
    }

    // Narrow left/right gutters only; allow shapes near top/bottom edges
    rects.push({x:0,    y:0, w:2.5, h:100});
    rects.push({x:97.5, y:0, w:2.5, h:100});

    return rects;
  }

  function generateShapes(){
    layer.innerHTML = '';
    const ref = layer.getBoundingClientRect();
    if (!ref.width || !ref.height) return;

    const exclusions = getExclusions();
    const count = Math.max(12, Math.min(18, Math.round(ref.width / 100)));
    const placed = [];

    let tries = 0;
    while (placed.length < count && tries < count * 140){
      tries++;

      const type  = TYPES[Math.floor(Math.random()*TYPES.length)];
      const color = COLORS[Math.floor(Math.random()*COLORS.length)];
      const sz    = Math.floor(14 + Math.random()*22); // 14–36 px

      // random position anywhere (no vertical bias)
      let px = Math.random()*100;
      let py = Math.random()*100;

      // small left/right padding only
      if (px < 2.5 || px > 97.5) continue;

      // reject inside any exclusion
      if (exclusions.some(r => overlaps(px, py, r))) continue;

      // keep shapes separated
      const minGap = 6.5;
      const candidate = {x:px, y:py};
      if (placed.some(p => distance(p, candidate) < minGap)) continue;

      const el = document.createElement('span');
      el.className = `shape ${type}`;
      el.style.setProperty('--color', color);
      el.style.setProperty('--sz', `${sz}px`);
      el.style.left = `${px}%`;
      el.style.top  = `${py}%`;
      // Random per-shape animation settings
      // HERO shapes: slightly stronger motion for visibility
      const dur   = (18 + Math.random()*8).toFixed(2);    // 18–26s
      const delay = (Math.random()*6).toFixed(2);         // 0–6s stagger
      const ax    = (12 + Math.random()*10).toFixed(1) + 'px'; // 12–22px
      const ay    = (8  + Math.random()*8 ).toFixed(1) + 'px'; // 8–16px
      const rAmp  = (2 + Math.random()*2).toFixed(2) + 'deg';  // 2–4deg
      const spin  = (40 + Math.random()*20).toFixed(1);   // 40–60s
      el.style.setProperty('--dur',     dur + 's');
      el.style.setProperty('--delay',   delay + 's');
      el.style.setProperty('--ax',      ax);
      el.style.setProperty('--ay',      ay);
      el.style.setProperty('--rAmp',    rAmp);
      el.style.setProperty('--spinDur', spin + 's');
      if (type !== 'circle'){
        const rot = (Math.random()*16 - 8).toFixed(1);
        el.style.setProperty('--rot', `${rot}deg`);
      }

      layer.appendChild(el);
      placed.push(candidate);
    }
  }

  let t; const reflow = () => { clearTimeout(t); t = setTimeout(generateShapes, 140); };
  window.addEventListener('load', generateShapes);
  window.addEventListener('resize', reflow);
  window.addEventListener('orientationchange', reflow);
  document.fonts && document.fonts.ready && document.fonts.ready.then(reflow);
})();

// Eligibility left-rail subtle floating shapes (left of the timeline only)
(function(){
  const side = document.querySelector('#eligibility .elig__side');
  const layer = side?.querySelector('.elig-shapes');
  const rail  = side?.querySelector('.elig-tl-line');
  const icons = side ? [...side.querySelectorAll('.elig-tl-icon')] : [];
  if (!side || !layer || !rail) return;

  const COLORS = ['#f52c7a', '#ec8a14', '#2de2e6', '#f2c94c'];
  const TYPES  = ['circle','square','diamond'];

  function distance(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.hypot(dx,dy); }

  function generate(){
    layer.innerHTML = '';
    const sideR = side.getBoundingClientRect();
    const railR = rail.getBoundingClientRect();
    if (!sideR.width || !sideR.height || !railR.width || !railR.height) return;

    // rail center X relative to side
    const railCenterX = railR.left - sideR.left + railR.width/2;
    // usable area: from left edge to just before the rail center (minus a buffer)
    const rightBound = railCenterX - 16; // px buffer from rail

    // Build avoidance zones for icons (centers and radius)
    const avoid = icons.map(el => {
      const r = el.getBoundingClientRect();
      return { x: r.left - sideR.left + r.width/2, y: r.top - sideR.top + r.height/2, rad: Math.max(r.width, r.height)/2 + 18 };
    });

    const count = Math.max(8, Math.min(14, Math.round(sideR.height/80)));
    const placed = [];

    let tries = 0;
    while (placed.length < count && tries < count*120){
      tries++;
      const type  = TYPES[Math.floor(Math.random()*TYPES.length)];
      const color = COLORS[Math.floor(Math.random()*COLORS.length)];
      const sz    = 10 + Math.random()*18; // 10–28 px
      const ax    = 4 + Math.random()*6;   // sway
      const ay    = 3 + Math.random()*6;   // bob
      const dur   = 18 + Math.random()*18; // 18–36s
      const delay = -Math.random()*10;     // negative to desync
      const rot   = (Math.random()*8 - 4).toFixed(1) + 'deg';
      const op    = (0.08 + Math.random()*0.07).toFixed(3); // 0.08–0.15

      // random position within left portion
      const x = Math.random() * Math.max(0, rightBound - 8); // keep 8px from left edge via CSS overflow
      const y = Math.random() * sideR.height;

      // keep inside vertical bounds with a little padding
      if (y < 8 || y > sideR.height - 8) continue;

      const candidate = { x, y, rad: Math.max(10, sz/2) + 10 };

      // avoid timeline icons
      if (avoid.some(a => distance(a, candidate) < (a.rad + candidate.rad))) continue;

      // avoid other shapes
      if (placed.some(p => distance(p, candidate) < (p.rad + candidate.rad + 6))) continue;

      const el = document.createElement('span');
      el.className = `elig-shape ${type}`;
      el.style.color = color;
      el.style.setProperty('--sz', `${sz}px`);
      el.style.setProperty('--ax', `${ax}px`);
      el.style.setProperty('--ay', `${ay}px`);
      el.style.setProperty('--dur', `${dur}s`);
      el.style.setProperty('--delay', `${delay}s`);
      el.style.setProperty('--rot', rot);
      el.style.setProperty('--op', op);
      el.style.left = `${x}px`;
      el.style.top  = `${y}px`;

      layer.appendChild(el);
      placed.push(candidate);
    }
  }

  let t; const reflow = () => { clearTimeout(t); t = setTimeout(generate, 140); };
  window.addEventListener('load', generate);
  window.addEventListener('resize', reflow);
  window.addEventListener('orientationchange', reflow);
})();

// Meetings: compute next "1st or 3rd Friday" and randomize meet-shape motion
(function(){
  // Next 1st or 3rd Friday helper
  function nextFirstOrThirdFriday(from = new Date()){
    function nthFriday(year, month, n){
      const FRI = 5; // 0=Sun
      const d = new Date(year, month, 1);
      while (d.getDay() !== FRI) d.setDate(d.getDate() + 1); // first Friday
      d.setDate(d.getDate() + 7 * (n - 1));
      return d;
    }
    const y = from.getFullYear();
    const m = from.getMonth();
    const first = nthFriday(y, m, 1);
    const third = nthFriday(y, m, 3);
    if (from < first) return first;
    if (from < third) return third;
    // otherwise next month's first Friday
    const nm = (m + 1) % 12; const ny = m === 11 ? y + 1 : y;
    return nthFriday(ny, nm, 1);
  }

  const monthEl = document.querySelector('.meet-date__month');
  const dayEl   = document.querySelector('.meet-date__day');
  if (monthEl && dayEl){
    const n = nextFirstOrThirdFriday(new Date());
    const m = n.toLocaleString(undefined, { month: 'short' });
    monthEl.textContent = m.toUpperCase();
    dayEl.textContent   = String(n.getDate());
  }

  // Randomize shapes in meetings background layer
  document.querySelectorAll('.meet-bg-shapes .meet-bg-shape').forEach(el => {
    el.style.setProperty('--delay',   (Math.random()*6).toFixed(2)+'s');
    el.style.setProperty('--dur',     (18 + Math.random()*10).toFixed(2)+'s');
    el.style.setProperty('--spinDur', (40 + Math.random()*24).toFixed(2)+'s');
    el.style.opacity = (0.09 + Math.random()*0.08).toFixed(2);
  });
})();

// Global section glow controller (IntersectionObserver toggles body classes)
(function(){
  const map = [
    ['home',        'section-hero-active'],
    ['about',       'section-about-active'],
    ['eligibility', 'section-eligibility-active'],
    ['meetings',    'section-meetings-active'],
    ['officers',    'section-officers-active'],
    ['join-us',     'section-join-us-active'],
    ['faqs',        'section-faqs-active'],
  ];
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const found = map.find(([id]) => e.target.id === id);
      if (!found) return;
      const cls = found[1];
      if (e.isIntersecting) document.body.classList.add(cls);
      else document.body.classList.remove(cls);
    });
  }, { rootMargin: '0px 0px -25% 0px', threshold: 0.5 });
  map.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
})();

// Join Us form submission (minimal JSON POST)
(function(){
  const form = document.querySelector('#join-us-form');
  const status = form?.querySelector('.form-status');
  // Google Apps Script Web App endpoint (can be overridden by setting window.JOIN_ENDPOINT)
  const JOIN_ENDPOINT = window.JOIN_ENDPOINT || 'https://script.google.com/macros/s/AKfycbxxo2G9Du-eIhG-Mo5h-rlgH1U8QO3ItaVBKE4OZWFbyQbhzjIz3PzSMuOjBrZEJNWX/exec';
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    if (!form.checkValidity()){
      status.textContent = 'Please fill in the required fields.';
      const firstInvalid = form.querySelector(':invalid');
      firstInvalid?.focus();
      return;
    }
    
  const fd = new FormData(form);
  // (optional) remove interests if not checked
  (fd.getAll('interests').length === 0) && fd.delete('interests');

    try {
      if (!JOIN_ENDPOINT) {
        // Endpoint not configured yet; mimic success for now
        status.textContent = 'Thanks! We’ll be in touch soon.';
        form.reset();
        return;
      }
      const res = await fetch(JOIN_ENDPOINT, {
        method: 'POST',
        body: fd,
        //mode: 'no-cors', // no-cors to avoid preflight; can’t read response but at least sends
      });
      // If you use no-cors, always assume success here because you can’t read res.ok
      status.textContent = 'Thanks! We’ll be in touch soon.';
      form.reset();
    } catch(err) {
      status.textContent = 'Something went wrong. Please try again later.';
      console.error('Join Us submit error:', err);
    }
  });
})();
