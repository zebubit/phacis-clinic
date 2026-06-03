/* ============================================================
   PHÁCIS CLINIC — interações editoriais
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNav();
  initBurger();
  initScrollReveal();
  initCounters();
  initBeforeAfter();
  initReviewsCarousel();
  initEspacoCarousel();
});

/* ---------- Carrossel do Espaço (uma foto por vez) ---------- */
function initEspacoCarousel() {
  const root = document.getElementById('espacoCarousel');
  const img  = document.getElementById('espacoImg');
  const cap  = document.getElementById('espacoCaption');
  const cnt  = document.getElementById('espacoCounter');
  const dots = document.getElementById('espacoDots');
  const prev = document.getElementById('espacoPrev');
  const next = document.getElementById('espacoNext');
  if (!root || !img || !dots) return;

  const slides = [
    { src: 'assets/img/AMBIENTE/unnamed (1)11.webp', caption: 'Fachada noturna' },
    { src: 'assets/img/AMBIENTE/unnamed.webp',       caption: 'Recepção' },
    { src: 'assets/img/AMBIENTE/22.webp',            caption: 'Balcão de atendimento' },
    { src: 'assets/img/AMBIENTE/453.webp',           caption: 'Corredor texturizado' },
    { src: 'assets/img/AMBIENTE/222.webp',           caption: 'Sala de procedimento' },
    { src: 'assets/img/AMBIENTE/231.webp',           caption: 'Sala de espera' },
    { src: 'assets/img/AMBIENTE/unnamed (1)1.webp',  caption: 'Consultório' },
    { src: 'assets/img/AMBIENTE/234.webp',           caption: 'Vista externa' }
  ];

  let index = 0;
  let paused = false;
  let autoTimer = null;
  const INTERVAL = 6000;

  const total = slides.length;
  const pad = (n) => String(n).padStart(2, '0');

  // Render dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'espaco-dot' + (i === 0 ? ' espaco-dot--active' : '');
    b.setAttribute('aria-label', `Foto ${i + 1}`);
    b.addEventListener('click', () => { go(i); pause(); });
    dots.appendChild(b);
  });

  function show(i) {
    index = (i + total) % total;
    img.classList.add('is-fading');
    setTimeout(() => {
      img.src = slides[index].src;
      img.alt = slides[index].caption + ' — Phácis Clinic';
      if (cap) cap.textContent = slides[index].caption;
      if (cnt) cnt.textContent = pad(index + 1) + ' / ' + pad(total);
      Array.from(dots.children).forEach((d, i2) =>
        d.classList.toggle('espaco-dot--active', i2 === index)
      );
      img.classList.remove('is-fading');
    }, 320);
  }
  function go(i)   { show(i); }
  function nextFn(){ show(index + 1); }
  function prevFn(){ show(index - 1); }
  function pause(){ paused = true; clearTimeout(pause._t); pause._t = setTimeout(()=>paused=false, 9000); }

  prev && prev.addEventListener('click', () => { prevFn(); pause(); });
  next && next.addEventListener('click', () => { nextFn(); pause(); });

  // Hover pausa
  root.addEventListener('mouseenter', () => paused = true);
  root.addEventListener('mouseleave', () => paused = false);

  // Touch swipe
  let tx = 0;
  root.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; pause(); }, { passive: true });
  root.addEventListener('touchend',   (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) dx < 0 ? nextFn() : prevFn();
  });

  // Teclado
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { prevFn(); pause(); }
    if (e.key === 'ArrowRight') { nextFn(); pause(); }
  });
  root.tabIndex = 0;

  // Auto-slide só quando visível
  const start = () => { stop(); autoTimer = setInterval(()=>{ if (!paused) nextFn(); }, INTERVAL); };
  const stop  = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting ? start() : stop());
    }, { threshold: 0.3 });
    io.observe(root);
  } else {
    start();
  }
}

/* ---------- 1. Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- 2. Nav escurece após scroll ---------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 80) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------- 3. Burger menu mobile ---------- */
function initBurger() {
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('navMenu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => menu.classList.toggle('is-open'));
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => menu.classList.remove('is-open'))
  );
}

/* ---------- 4. Scroll Reveal (IntersectionObserver) ---------- */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .reveal-stagger')
      .forEach(el => el.classList.add('is-visible'));
    return;
  }
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!targets.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  targets.forEach(el => io.observe(el));
}

/* ---------- 5. Números animados ---------- */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(el => el.textContent = formatNum(+el.dataset.count));
    return;
  }
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * eased);
      el.textContent = formatNum(val);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  els.forEach(el => io.observe(el));
}
function formatNum(n) {
  if (n >= 1000) {
    if (n >= 10000) return (n/1000).toFixed(1).replace('.0','') + 'K';
    return n.toLocaleString('pt-BR');
  }
  return n.toString();
}

/* ---------- 6. Antes / Depois — slider arrastável ---------- */
function initBeforeAfter() {
  const slider = document.getElementById('baSlider');
  const after  = document.getElementById('baAfter');
  const handle = document.getElementById('baHandle');
  const title  = document.getElementById('baTitle');
  const desc   = document.getElementById('baDesc');
  const before = document.getElementById('baBefore');
  const thumbs = document.getElementById('baThumbs');
  if (!slider || !after || !handle) return;

  let pct = 50;

  const setPct = (newPct) => {
    pct = Math.max(0, Math.min(100, newPct));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = pct + '%';
  };
  setPct(50);

  const fromEvent = (e) => {
    const rect = slider.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return (x / rect.width) * 100;
  };

  let dragging = false;
  const startDrag = (e) => { dragging = true; e.preventDefault(); setPct(fromEvent(e)); };
  const onMove    = (e) => { if (!dragging) return; setPct(fromEvent(e)); };
  const endDrag   = () => { dragging = false; };

  slider.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', endDrag);

  slider.addEventListener('touchstart', startDrag, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: true });
  window.addEventListener('touchend', endDrag);

  // Click anywhere on the slider also positions
  slider.addEventListener('click', (e) => {
    if (dragging) return;
    setPct(fromEvent(e));
  });

  // Thumbnails: troca de caso (manual + auto-rotate 3s)
  if (thumbs) {
    const allThumbs = Array.from(thumbs.querySelectorAll('.ba-thumb'));
    let activeIdx = 0;
    let paused = false;
    let autoTimer = null;
    const INTERVAL = 3000;

    const showCase = (i, scrollIntoView = false) => {
      activeIdx = (i + allThumbs.length) % allThumbs.length;
      const btn = allThumbs[activeIdx];
      allThumbs.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const newSrc = btn.dataset.img;
      before.src = newSrc;
      after.src  = newSrc;
      if (title && btn.dataset.title) title.innerHTML = btn.dataset.title;
      if (desc  && btn.dataset.desc)  desc.textContent = btn.dataset.desc;
      setPct(50);
      if (scrollIntoView) btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    allThumbs.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        showCase(i);
        paused = true;
        clearTimeout(allThumbs._resume);
        allThumbs._resume = setTimeout(() => paused = false, 9000);
      });
    });

    const startAuto = () => {
      stopAuto();
      autoTimer = setInterval(() => { if (!paused) showCase(activeIdx + 1, true); }, INTERVAL);
    };
    const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };

    // Pausa no hover
    slider.addEventListener('mouseenter', () => paused = true);
    slider.addEventListener('mouseleave', () => paused = false);

    // Só roda quando visível
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => e.isIntersecting ? startAuto() : stopAuto());
      }, { threshold: 0.3 });
      io.observe(slider);
    } else {
      startAuto();
    }
  }
}

/* ---------- 7. Carrossel de depoimentos ---------- */
function initReviewsCarousel() {
  const root  = document.getElementById('reviewsCarousel');
  const track = document.getElementById('reviewsTrack');
  const dots  = document.getElementById('reviewsDots');
  if (!root || !track || !dots) return;

  const reviews = Array.from(track.children);
  const total = reviews.length;
  if (!total) return;

  let index = 0;
  let paused = false;
  let autoTimer = null;

  const cardsPerView = () => {
    const w = window.innerWidth;
    if (w <= 720)  return 1;
    if (w <= 1024) return 2;
    return 3;
  };

  const maxIndex = () => Math.max(0, total - cardsPerView());

  const go = (n) => {
    index = Math.max(0, Math.min(n, maxIndex()));
    const slide = reviews[0];
    if (!slide) return;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    const w = slide.getBoundingClientRect().width + gap;
    track.style.transform = `translateX(-${index * w}px)`;
    renderDots();
  };

  const next = () => {
    if (index >= maxIndex()) go(0);
    else go(index + 1);
  };
  const prev = () => {
    if (index <= 0) go(maxIndex());
    else go(index - 1);
  };

  const renderDots = () => {
    const count = maxIndex() + 1;
    if (dots.children.length !== count) {
      dots.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const b = document.createElement('button');
        b.className = 'reviews__dot' + (i === index ? ' reviews__dot--active' : '');
        b.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
        b.addEventListener('click', () => { go(i); pause(); });
        dots.appendChild(b);
      }
    } else {
      Array.from(dots.children).forEach((d, i) =>
        d.classList.toggle('reviews__dot--active', i === index)
      );
    }
  };

  // Auto-slide
  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(() => { if (!paused) next(); }, 5500);
  };
  const stopAuto = () => { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } };
  const pause = () => { paused = true; clearTimeout(pause._t); pause._t = setTimeout(() => paused = false, 9000); };

  // Setas
  root.querySelectorAll('.reviews-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = +btn.dataset.dir;
      dir > 0 ? next() : prev();
      pause();
    });
  });

  // Hover pausa
  root.addEventListener('mouseenter', () => paused = true);
  root.addEventListener('mouseleave', () => paused = false);

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; pause(); }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

  // Resize re-render
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { go(0); }, 200);
  });

  go(0);
  startAuto();
}
