/* ===================================================
   mGanik Group (MGMI) — Homepage Interactions
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleNavbarScroll);

  // --- Scroll reveal animations ---
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach((el) => {
    revealObserver.observe(el);
  });

  // --- Counter animation ---
  const counters = document.querySelectorAll('.milestone__stat-number');
  let countersAnimated = false;

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return num.toLocaleString() + '+';
    } else if (num >= 100) {
      return num.toLocaleString() + '+';
    }
    return num.toString();
  };

  const animateCounters = () => {
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const startTime = performance.now();
      const finalText = counter.textContent;

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
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

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const milestoneStats = document.querySelector('.milestone__stats');
  if (milestoneStats) {
    counterObserver.observe(milestoneStats);
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      }
    });
  });

  // --- Why We Exist Carousel (clone-based infinite loop) ---
  const wweTrack = document.querySelector('.why-we-exist__carousel-track');
  const wweCarousel = document.getElementById('wweCarousel');

  if (wweCarousel && wweTrack) {
    const origSlides = Array.from(wweTrack.querySelectorAll('.why-we-exist__slide'));
    const slideCount = origSlides.length;

    // Clone all slides for seamless wrapping
    origSlides.forEach(slide => {
      const clone = slide.cloneNode(true);
      wweTrack.appendChild(clone);
    });
    const allSlides = Array.from(wweTrack.querySelectorAll('.why-we-exist__slide'));
    const totalDom = allSlides.length; // 10
    const half = Math.floor(totalDom / 2); // 5

    // Virtual positions: continuous number line, no wrapping during animation
    const vPos = new Array(totalDom);
    for (let i = 0; i < totalDom; i++) {
      vPos[i] = ((i + half) % totalDom) - half;
    }
    // Result: 0,1,2,3,4,-5,-4,-3,-2,-1
    // Visible slots: 0(center), ±1(adjacent), ±2(edge)

    // Sizing config — responsive
    var isMobile = window.innerWidth <= 768;
    var BASE_W = isMobile ? 240 : 480;
    const GAP = isMobile ? 10 : 20;

    function getScale(absPos) {
      if (absPos === 0) return 1;
      if (absPos === 1) return 0.72;
      if (isMobile) return 0; // hide ±2 on mobile
      return 0.5;
    }
    function getOpacity(absPos) {
      if (absPos === 0) return 1;
      if (absPos === 1) return 0.7;
      if (isMobile) return 0; // hide ±2 on mobile
      if (absPos === 2) return 0.5;
      return 0;
    }

    // Recalc on resize
    window.addEventListener('resize', function() {
      isMobile = window.innerWidth <= 768;
      BASE_W = isMobile ? 240 : 480;
      var currentGap = isMobile ? 10 : 20;
      // Recompute slot offsets
      slotOffsets.length = 1;
      for (let p = 1; p <= half; p++) {
        const prevVW = BASE_W * getScale(p - 1);
        const currVW = BASE_W * getScale(p);
        slotOffsets[p] = slotOffsets[p - 1] + prevVW / 2 + currentGap + currVW / 2;
      }
      renderAll();
    });

    // Precompute center offsets for positions 0-5
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
      const scale = getScale(absPos);
      const opacity = getOpacity(absPos);
      const left = getCenterLeft(pos);

      allSlides[i].style.left = `${left}px`;
      allSlides[i].style.transform = `translate(-50%, -50%) scale(${scale})`;
      allSlides[i].style.opacity = opacity;
      allSlides[i].style.zIndex = 10 - absPos;
    }

    function renderAll() {
      for (let i = 0; i < totalDom; i++) {
        renderSlide(i);
      }
    }

    function recycle() {
      for (let i = 0; i < totalDom; i++) {
        if (vPos[i] < -half) {
          allSlides[i].classList.add('no-transition');
          vPos[i] += totalDom;
          renderSlide(i);
          allSlides[i].offsetHeight; // force reflow
          allSlides[i].classList.remove('no-transition');
        } else if (vPos[i] >= half) {
          allSlides[i].classList.add('no-transition');
          vPos[i] -= totalDom;
          renderSlide(i);
          allSlides[i].offsetHeight;
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

    // Auto-play
    let autoInterval = null;
    let autoTimeout = null;

    function startAutoPlay() {
      stopAutoPlay();
      autoInterval = setInterval(advance, 4000);
    }
    function stopAutoPlay() {
      if (autoInterval) { clearInterval(autoInterval); autoInterval = null; }
    }
    function pauseAndResume() {
      stopAutoPlay();
      clearTimeout(autoTimeout);
      autoTimeout = setTimeout(startAutoPlay, 5000);
    }

    // Drag support
    let isDragging = false;
    let startX = 0;
    let dragDist = 0;

    wweCarousel.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX;
      dragDist = 0;
      wweCarousel.classList.add('dragging');
      pauseAndResume();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      dragDist = e.clientX - startX;
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      wweCarousel.classList.remove('dragging');
      if (dragDist < -60) advance();
      else if (dragDist > 60) retreat();
    });

    // Touch events
    wweCarousel.addEventListener('touchstart', (e) => {
      isDragging = true; startX = e.touches[0].clientX; dragDist = 0;
      wweCarousel.classList.add('dragging'); pauseAndResume();
    }, { passive: true });
    wweCarousel.addEventListener('touchmove', (e) => {
      if (isDragging) dragDist = e.touches[0].clientX - startX;
    }, { passive: true });
    wweCarousel.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      wweCarousel.classList.remove('dragging');
      if (dragDist < -60) advance();
      else if (dragDist > 60) retreat();
    });

    // Initialize
    renderAll();
    startAutoPlay();
  }



  // --- Awards Horizontal Carousel ---
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
    var N = allSlides.length; // 3
    var center = 0;
    var autoTimer = null, resumeTimer = null;

    // Positions: center + left/right overlapping slightly
    var posMap = {
      '0':  { pct: 50, scale: 1 },
      '1':  { pct: 75, scale: 0.7 },
      '-1': { pct: 25, scale: 0.7 }
    };

    function renderAll(animate) {
      for (var i = 0; i < N; i++) {
        var slide = allSlides[i];
        var diff = i - center;
        // Wrap into range for 3 items
        if (diff > Math.floor(N / 2)) diff -= N;
        if (diff < -Math.floor(N / 2)) diff += N;

        if (animate === false) {
          slide.classList.add('no-transition');
        } else {
          slide.classList.remove('no-transition');
        }

        var key = String(diff);
        var pos = posMap[key];

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
          slide.style.filter = 'none';
          slide.style.boxShadow = 'none';
        }
      }
    }

    function updateCaption() {
      var idx = ((center % N) + N) % N;
      var titleEl = document.getElementById('awardTitle');
      var descEl = document.getElementById('awardDesc');
      if (titleEl) titleEl.textContent = captions[idx].title;
      if (descEl) descEl.textContent = captions[idx].desc;
    }

    function advance() {
      center = (center + 1) % N;
      renderAll(true);
      updateCaption();
    }

    function retreat() {
      center = (center - 1 + N) % N;
      renderAll(true);
      updateCaption();
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(advance, 6000);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    function pauseAndResume() {
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 6000);
    }

    // Drag support (horizontal)
    var dragging = false, startX = 0, dist = 0;
    carousel.addEventListener('mousedown', function(e) {
      e.preventDefault();
      dragging = true; startX = e.clientX; dist = 0;
      pauseAndResume();
    });
    window.addEventListener('mousemove', function(e) {
      if (dragging) dist = e.clientX - startX;
    });
    window.addEventListener('mouseup', function() {
      if (!dragging) return;
      dragging = false;
      if (dist < -40) advance();
      else if (dist > 40) retreat();
    });
    carousel.addEventListener('touchstart', function(e) {
      dragging = true; startX = e.touches[0].clientX; dist = 0;
      pauseAndResume();
    }, { passive: true });
    carousel.addEventListener('touchmove', function(e) {
      if (dragging) dist = e.touches[0].clientX - startX;
    }, { passive: true });
    carousel.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
      if (dist < -40) advance();
      else if (dist > 40) retreat();
    });

    renderAll(false);
    updateCaption();
    startAuto();
  })();

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        document.querySelectorAll('.navbar__links a').forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav);
});
