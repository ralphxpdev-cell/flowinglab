// ── Intro ──
const chars = document.querySelectorAll('.ic');
chars.forEach((c, i) => {
  setTimeout(() => {
    c.style.transition = 'transform .55s cubic-bezier(.16,1,.3,1),opacity .45s ease';
    c.style.transform = 'translateY(0)';
    c.style.opacity = '1';
  }, 180 + i * 55);
});
setTimeout(() => {
  document.getElementById('intro').classList.add('out');
  setTimeout(() => {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('page').classList.add('show');
  }, 600);
}, 180 + chars.length * 55 + 900);

// ── Portfolio stagger ──
const pItems = document.querySelectorAll('.project-item');
const pObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 150);
      pObs.unobserve(e.target);
    }
  });
}, { threshold: .15 });
pItems.forEach(el => pObs.observe(el));

// ── Reveal ──
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: .1 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ── Process ──
const pio = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('in'), i * 110);
      pio.unobserve(e.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll('#procGrid .proc-item').forEach(el => pio.observe(el));

// ── 커스텀 커서 ──
(function () {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const hoverEls = 'a, button, .feature, .project-item, .hcta, .cta-btn, .ncta';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ── 스크롤 관성 ──
(function () {
  let current = 0, target = 0, ease = 0.08;

  if ('ontouchstart' in window) return;
  if (window.innerWidth < 768) return;

  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.top = '0';
  document.body.style.left = '0';
  document.documentElement.style.overflow = 'hidden';

  const scrollHeight = () => document.body.scrollHeight - window.innerHeight;

  window.addEventListener('wheel', e => {
    target += e.deltaY * 0.85;
    target = Math.max(0, Math.min(target, scrollHeight()));
  }, { passive: true });

  function update() {
    current += (target - current) * ease;
    if (Math.abs(target - current) < 0.5) current = target;
    document.body.style.transform = `translateY(${-current}px)`;
    window.dispatchEvent(new CustomEvent('scroll'));
    requestAnimationFrame(update);
  }
  update();

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      target = Math.max(0, Math.min(current + rect.top, scrollHeight()));
    });
  });
})();

// ── Smooth scroll fallback ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── FLOWING 02: 펼침 → 수렴 → 3시 발사 루프 ──
(function () {
  const svg = document.getElementById('radiate-lines');
  const wrap = document.getElementById('radiate-svg');
  const rays = svg ? Array.from(svg.querySelectorAll('.ray')) : [];
  const shooter = document.getElementById('ray-shoot');
  if (!svg || !rays.length || !shooter) return;

  const CX = 200, CY = 130;
  let isVisible = false;

  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function animateAttr(el, attr, from, to, duration) {
    return new Promise(resolve => {
      const start = performance.now();
      function tick(now) {
        if (!isVisible) { resolve(); return; }
        const t = Math.min((now - start) / duration, 1);
        el.setAttribute(attr, from + (to - from) * ease(t));
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }

  async function spread() {
    const ps = rays.map((ray, i) => new Promise(resolve => {
      setTimeout(() => {
        const tx2 = parseFloat(ray.dataset.x2);
        const ty2 = parseFloat(ray.dataset.y2);
        const cx2 = parseFloat(ray.getAttribute('x2'));
        const cy2 = parseFloat(ray.getAttribute('y2'));
        Promise.all([
          animateAttr(ray, 'x2', cx2, tx2, 600),
          animateAttr(ray, 'y2', cy2, ty2, 600)
        ]).then(resolve);
      }, i * 50);
    }));
    await Promise.all(ps);
  }

  async function converge() {
    const ps = rays.map((ray, i) => new Promise(resolve => {
      setTimeout(() => {
        const ox2 = parseFloat(ray.dataset.x2);
        const oy2 = parseFloat(ray.dataset.y2);
        Promise.all([
          animateAttr(ray, 'x2', ox2, CX + (ox2 - CX) * 0.06, 700),
          animateAttr(ray, 'y2', oy2, CY + (oy2 - CY) * 0.06, 700)
        ]).then(resolve);
      }, i * 55);
    }));
    await Promise.all(ps);
  }

  async function shoot() {
    shooter.setAttribute('opacity', '1');
    shooter.setAttribute('x2', '202');
    await animateAttr(shooter, 'x2', 202, 420, 1000);
  }

  function hideShooter() {
    shooter.setAttribute('opacity', '0');
    shooter.setAttribute('x2', '202');
  }

  function resetRays() {
    rays.forEach(ray => {
      ray.setAttribute('x2', ray.dataset.x2);
      ray.setAttribute('y2', ray.dataset.y2);
      ray.style.stroke = '';
    });
  }

  async function loop() {
    if (!isVisible) return;

    wrap.classList.remove('converged');
    hideShooter();
    resetRays();
    await spread();
    if (!isVisible) return;
    await new Promise(r => setTimeout(r, 400));
    if (!isVisible) return;

    await converge();
    if (!isVisible) return;
    wrap.classList.add('converged');
    await new Promise(r => setTimeout(r, 300));
    if (!isVisible) return;

    await shoot();
    if (!isVisible) return;
    await new Promise(r => setTimeout(r, 500));
    if (!isVisible) return;

    wrap.classList.remove('converged');
    hideShooter();
    await new Promise(r => setTimeout(r, 400));
    if (isVisible) loop();
  }

  function reset() {
    isVisible = false;
    wrap.classList.remove('converged');
    hideShooter();
    resetRays();
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { isVisible = true; loop(); }
      else { reset(); }
    });
  }, { threshold: 0.4 });

  obs.observe(wrap);
})();

// ── Hero 타이핑 루프 ──
(function () {
  const el = document.getElementById('htCycle');
  if (!el) return;
  const words = ['AI?', '로고?', '광고?'];
  let wi = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 120, SPEED_DEL = 80, PAUSE = 1400;

  function tick() {
    const word = words[wi];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) { deleting = true; setTimeout(tick, PAUSE); return; }
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 300); return; }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  setTimeout(tick, 800);
})();

// ── Feature 마우스 트래킹 (플래시라이트) ──
document.querySelectorAll('.feature').forEach(el => {
  el.addEventListener('mousemove', e => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
    el.style.setProperty('--my', (e.clientY - rect.top) + 'px');
  });
});
