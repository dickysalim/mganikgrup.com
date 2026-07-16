/* ===================================================
   mGanik Group (MGMI) — Homepage Interactions
   Optimized: Single scroll handler, batched canvas, GPU compositing
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== CACHED DOM REFERENCES =====
  const navbar = document.getElementById('navbar');
  const hero = document.querySelector('.hero');
  const heroBgGlow = document.querySelector('.hero__bg-glow');
  const heroContent = document.querySelector('.hero__content');
  const milestoneStats = document.querySelector('.milestone__stats');
  const sections = document.querySelectorAll('section[id]');
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  const isDesktop = window.innerWidth > 768;

  // ===== INTERSECTION OBSERVER — SCROLL REVEALS =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0.1 });

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .blur-in').forEach((el) => {
    revealObserver.observe(el);
  });

  // ===== INTERSECTION OBSERVER — TIMELINE ITEMS =====
  const timelineItems = document.querySelectorAll('.timeline__item');
  if (timelineItems.length) {
    const tObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          tObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });
    timelineItems.forEach((item) => tObserver.observe(item));
  }

  // ===== SINGLE UNIFIED SCROLL HANDLER =====
  let scrollTicking = false;

  function onScroll() {
    const scrollY = window.scrollY;

    // 1. Navbar background
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // 2. Hero parallax (only compute when hero is visible)
    if (scrollY < window.innerHeight * 1.5) {
      if (heroBgGlow) {
        heroBgGlow.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.1}px))`;
      }
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * 0.05}px)`;
        heroContent.style.opacity = Math.max(0, 1 - scrollY * 0.0015);
      }
    }

    // 3. Decorative elements parallax (desktop only)
    if (isDesktop && parallaxEls.length) {
      for (let i = 0; i < parallaxEls.length; i++) {
        const el = parallaxEls[i];
        const speed = parseFloat(el.dataset.parallax);
        const parent = el.parentElement;
        const rect = parent.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
          el.style.transform = `translateY(${scrollY * speed}px) translateZ(0)`;
        }
      }
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        onScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ===== AMBIENT PARTICLE CANVAS (desktop only) =====
  const particleCanvas = document.getElementById('ambientParticles');
  if (particleCanvas && isDesktop) {
    const pCtx = particleCanvas.getContext('2d');
    const pDpr = window.devicePixelRatio || 1;
    let pW, pH;

    function resizeParticles() {
      pW = window.innerWidth;
      pH = window.innerHeight;
      particleCanvas.width = pW * pDpr;
      particleCanvas.height = pH * pDpr;
      particleCanvas.style.width = pW + 'px';
      particleCanvas.style.height = pH + 'px';
      pCtx.setTransform(pDpr, 0, 0, pDpr, 0, 0);
    }
    resizeParticles();
    window.addEventListener('resize', resizeParticles);

    const PARTICLE_COUNT = 40;
    const particles = [];
    // Pre-compute colors (avoid string ops per frame)
    const COLORS_GOLD = [];
    const COLORS_WOOD = [];
    for (let i = 0; i <= 10; i++) {
      const o = (i / 10 * 0.4 + 0.1).toFixed(2);
      COLORS_GOLD.push(`rgba(201,169,110,${o})`);
      COLORS_WOOD.push(`rgba(137,128,120,${o})`);
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const opacity = Math.random() * 0.4 + 0.1;
      const colorIdx = Math.round((opacity - 0.1) / 0.4 * 10);
      particles.push({
        x: Math.random() * (pW || 1920),
        y: Math.random() * (pH || 1080),
        r: Math.random() * 2 + 0.5,
        vy: -(Math.random() * 0.25 + 0.08),
        vx: (Math.random() - 0.5) * 0.12,
        color: Math.random() > 0.5 ? COLORS_GOLD[colorIdx] : COLORS_WOOD[colorIdx],
      });
    }

    function drawParticles() {
      pCtx.clearRect(0, 0, pW, pH);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y * 0.008) * 0.08;

        if (p.y < -10) { p.y = pH + 10; p.x = Math.random() * pW; }
        if (p.x < -10) p.x = pW + 10;
        if (p.x > pW + 10) p.x = -10;

        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, 6.2832);
        pCtx.fillStyle = p.color;
        pCtx.fill();
      }
      requestAnimationFrame(drawParticles);
    }
    requestAnimationFrame(drawParticles);
  }

  // ===== HERO DOT WAVE CANVAS =====
  const waveCanvas = document.getElementById('heroWaveCanvas');
  if (waveCanvas && hero) {
    const ctx = waveCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let W, H;
    let heroVisible = true;

    function resizeWave() {
      const rect = hero.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      waveCanvas.width = W * dpr;
      waveCanvas.height = H * dpr;
      waveCanvas.style.width = W + 'px';
      waveCanvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeWave();
    window.addEventListener('resize', resizeWave);

    // Pause when hero is not visible
    const heroObserver = new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    heroObserver.observe(hero);

    const COLS = 35;
    const ROWS = 18;
    const scaleFactor = W > 1200 ? 1 : 0.7;

    function drawDotWave(time) {
      if (!heroVisible) {
        requestAnimationFrame(drawDotWave);
        return;
      }

      ctx.clearRect(0, 0, W, H);
      const t = time * 0.0008;

      for (let row = 0; row < ROWS; row++) {
        const ny = row / (ROWS - 1);
        const baseY = H * 0.3 + ny * H * 0.65;
        const depth = 0.4 + ny * 0.6;

        for (let col = 0; col < COLS; col++) {
          const nx = col / (COLS - 1);
          const baseX = nx * W;

          const wave1 = Math.sin(nx * 6 + t * 1.2) * Math.cos(ny * 4 + t * 0.7);
          const wave2 = Math.sin(nx * 3.5 - t * 0.9 + ny * 2.5) * 0.6;
          const wave3 = Math.cos(nx * 8 + ny * 3 + t * 1.5) * 0.3;
          const wave = (wave1 + wave2 + wave3) / 1.9;

          const y = baseY + wave * 25;
          const peakBoost = Math.max(0, wave) * 0.8;
          const radius = (0.6 + depth * 1.0 + peakBoost) * scaleFactor;
          const brightness = 0.10 + (wave + 1) * 0.5 * 0.32 * depth;

          ctx.beginPath();
          ctx.arc(baseX, y, radius, 0, 6.2832);
          ctx.fillStyle = `rgba(130,160,220,${brightness})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(drawDotWave);
    }
    requestAnimationFrame(drawDotWave);
  }

  // ===== COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.milestone__stat-number');
  let countersAnimated = false;

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const startTime = performance.now();
      const finalText = counter.textContent;

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        if (target >= 1000000) {
          counter.textContent = current.toLocaleString() + '+';
        } else if (target >= 100) {
          counter.textContent = current.toLocaleString() + '+';
        } else {
          counter.textContent = current.toString();
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = finalText;
        }
      };
      requestAnimationFrame(updateCounter);
    });
  };

  if (milestoneStats) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !countersAnimated) {
          countersAnimated = true;
          animateCounters();
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    counterObserver.observe(milestoneStats);
  }

  // ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  // ===== WHY WE EXIST CAROUSEL =====
  const wweTrack = document.querySelector('.why-we-exist__carousel-track');
  const wweCarousel = document.getElementById('wweCarousel');

  if (wweCarousel && wweTrack) {
    const origSlides = Array.from(wweTrack.querySelectorAll('.why-we-exist__slide'));
    origSlides.forEach(slide => wweTrack.appendChild(slide.cloneNode(true)));
    const allSlides = Array.from(wweTrack.querySelectorAll('.why-we-exist__slide'));
    const totalDom = allSlides.length;
    const half = Math.floor(totalDom / 2);

    const vPos = new Array(totalDom);
    for (let i = 0; i < totalDom; i++) vPos[i] = ((i + half) % totalDom) - half;

    var isMobile = window.innerWidth <= 768;
    var BASE_W = isMobile ? 240 : 480;
    const GAP = isMobile ? 10 : 20;

    function getScale(absPos) {
      if (absPos === 0) return 1;
      if (absPos === 1) return 0.72;
      if (isMobile) return 0;
      return 0.5;
    }
    function getOpacity(absPos) {
      if (absPos === 0) return 1;
      if (absPos === 1) return 0.7;
      if (isMobile) return 0;
      if (absPos === 2) return 0.5;
      return 0;
    }

    window.addEventListener('resize', function() {
      isMobile = window.innerWidth <= 768;
      BASE_W = isMobile ? 240 : 480;
      var currentGap = isMobile ? 10 : 20;
      slotOffsets.length = 1;
      for (let p = 1; p <= half; p++) {
        const prevVW = BASE_W * getScale(p - 1);
        const currVW = BASE_W * getScale(p);
        slotOffsets[p] = slotOffsets[p - 1] + prevVW / 2 + currentGap + currVW / 2;
      }
      renderAll();
    });

    const slotOffsets = [0];
    for (let p = 1; p <= half; p++) {
      const prevVW = BASE_W * getScale(p - 1);
      const currVW = BASE_W * getScale(p);
      slotOffsets[p] = slotOffsets[p - 1] + prevVW / 2 + GAP + currVW / 2;
    }

    function getCenterLeft(pos) {
      const centerX = wweCarousel.offsetWidth / 2;
      const absPos = Math.abs(pos);
      const idx = Math.min(absPos, half);
      const extra = absPos > half ? (absPos - half) * (BASE_W * 0.5 + GAP) : 0;
      return centerX + Math.sign(pos) * (slotOffsets[idx] + extra);
    }

    function renderSlide(i) {
      const pos = vPos[i];
      const absPos = Math.abs(pos);
      const s = allSlides[i].style;
      s.left = `${getCenterLeft(pos)}px`;
      s.transform = `translate(-50%, -50%) scale(${getScale(absPos)})`;
      s.opacity = getOpacity(absPos);
      s.zIndex = 10 - absPos;
    }

    function renderAll() {
      for (let i = 0; i < totalDom; i++) renderSlide(i);
    }

    function recycle() {
      for (let i = 0; i < totalDom; i++) {
        if (vPos[i] < -half) {
          allSlides[i].classList.add('no-transition');
          vPos[i] += totalDom;
          renderSlide(i);
          void allSlides[i].offsetHeight;
          allSlides[i].classList.remove('no-transition');
        } else if (vPos[i] >= half) {
          allSlides[i].classList.add('no-transition');
          vPos[i] -= totalDom;
          renderSlide(i);
          void allSlides[i].offsetHeight;
          allSlides[i].classList.remove('no-transition');
        }
      }
    }

    function advance() {
      for (let i = 0; i < totalDom; i++) vPos[i] -= 1;
      renderAll();
      setTimeout(recycle, 750);
    }
    function retreat() {
      for (let i = 0; i < totalDom; i++) vPos[i] += 1;
      renderAll();
      setTimeout(recycle, 750);
    }

    let autoInterval = null, autoTimeout = null;
    function startAutoPlay() { stopAutoPlay(); autoInterval = setInterval(advance, 4000); }
    function stopAutoPlay() { if (autoInterval) { clearInterval(autoInterval); autoInterval = null; } }
    function pauseAndResume() { stopAutoPlay(); clearTimeout(autoTimeout); autoTimeout = setTimeout(startAutoPlay, 5000); }

    let isDragging = false, startX = 0, dragDist = 0;
    wweCarousel.addEventListener('mousedown', (e) => { e.preventDefault(); isDragging = true; startX = e.clientX; dragDist = 0; pauseAndResume(); });
    window.addEventListener('mousemove', (e) => { if (isDragging) dragDist = e.clientX - startX; });
    window.addEventListener('mouseup', () => { if (!isDragging) return; isDragging = false; if (dragDist < -60) advance(); else if (dragDist > 60) retreat(); });
    wweCarousel.addEventListener('touchstart', (e) => { isDragging = true; startX = e.touches[0].clientX; dragDist = 0; pauseAndResume(); }, { passive: true });
    wweCarousel.addEventListener('touchmove', (e) => { if (isDragging) dragDist = e.touches[0].clientX - startX; }, { passive: true });
    wweCarousel.addEventListener('touchend', () => { if (!isDragging) return; isDragging = false; if (dragDist < -60) advance(); else if (dragDist > 60) retreat(); });

    renderAll();
    startAutoPlay();
  }

  // ===== AWARDS CAROUSEL =====
  (function() {
    var track = document.getElementById('awardsTrack');
    var carousel = document.getElementById('awardsCarousel');
    if (!track || !carousel) return;

    var captions = [
      { title: 'PIAGAM PENGHARGAAN mGANIK MULTIGRAIN', desc: 'Recognized as a pioneering superfood brand in Indonesia for metabolic health innovation.' },
      { title: 'TOP BRAND AWARD 2024', desc: 'Awarded for exceptional brand performance and consumer trust in the functional food category.' },
      { title: 'INDONESIA BEST INNOVATION', desc: 'Celebrated for breakthrough product development in science-based nutritional solutions.' }
    ];

    var allSlides = track.querySelectorAll('.awards__slide');
    var N = allSlides.length;
    var center = 0;
    var autoTimer = null, resumeTimer = null;

    var posMap = { '0': { pct: 50, scale: 1 }, '1': { pct: 75, scale: 0.7 }, '-1': { pct: 25, scale: 0.7 } };

    function renderAll(animate) {
      for (var i = 0; i < N; i++) {
        var slide = allSlides[i];
        var diff = i - center;
        if (diff > Math.floor(N / 2)) diff -= N;
        if (diff < -Math.floor(N / 2)) diff += N;

        if (animate === false) slide.classList.add('no-transition');
        else slide.classList.remove('no-transition');

        var pos = posMap[String(diff)];
        if (pos) {
          slide.style.left = pos.pct + '%';
          slide.style.transform = 'translate(-50%, -50%) scale(' + pos.scale + ')';
          slide.style.opacity = '1';
          if (diff === 0) {
            slide.style.filter = 'none';
            slide.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)';
            slide.style.zIndex = 5;
            slide.style.pointerEvents = 'auto';
          } else {
            slide.style.filter = 'blur(2px) saturate(0.5) brightness(0.85)';
            slide.style.boxShadow = 'none';
            slide.style.zIndex = 3;
            slide.style.pointerEvents = 'none';
          }
        } else {
          slide.style.opacity = '0';
          slide.style.pointerEvents = 'none';
          slide.style.zIndex = 0;
        }
      }
    }

    function updateCaption() {
      var idx = ((center % N) + N) % N;
      var t = document.getElementById('awardTitle');
      var d = document.getElementById('awardDesc');
      if (t) t.textContent = captions[idx].title;
      if (d) d.textContent = captions[idx].desc;
    }

    function advance() { center = (center + 1) % N; renderAll(true); updateCaption(); }
    function retreat() { center = (center - 1 + N) % N; renderAll(true); updateCaption(); }
    function startAuto() { stopAuto(); autoTimer = setInterval(advance, 6000); }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function pauseAndResume() { stopAuto(); clearTimeout(resumeTimer); resumeTimer = setTimeout(startAuto, 6000); }

    var dragging = false, startX = 0, dist = 0;
    carousel.addEventListener('mousedown', function(e) { e.preventDefault(); dragging = true; startX = e.clientX; dist = 0; pauseAndResume(); });
    window.addEventListener('mousemove', function(e) { if (dragging) dist = e.clientX - startX; });
    window.addEventListener('mouseup', function() { if (!dragging) return; dragging = false; if (dist < -40) advance(); else if (dist > 40) retreat(); });
    carousel.addEventListener('touchstart', function(e) { dragging = true; startX = e.touches[0].clientX; dist = 0; pauseAndResume(); }, { passive: true });
    carousel.addEventListener('touchmove', function(e) { if (dragging) dist = e.touches[0].clientX - startX; }, { passive: true });
    carousel.addEventListener('touchend', function() { if (!dragging) return; dragging = false; if (dist < -40) advance(); else if (dist > 40) retreat(); });

    renderAll(false);
    updateCaption();
    startAuto();
  })();

});
