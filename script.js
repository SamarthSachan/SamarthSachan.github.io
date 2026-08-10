/* Samarth Sachan — Portfolio v2 */

// ---- Reduced-motion preference ----
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Footer year ----
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---- Nav: .scrolled class ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ---- Hamburger menu ----
const hamburger = document.getElementById('navHamburger');
const navLinks  = document.querySelector('.nav-links');

function openMenu() {
  navLinks.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navLinks.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
  });

  // Close when a nav link is clicked (mobile SPA-style navigation)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) closeMenu();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMenu();
    }
  });
}

// ---- Scroll reveal ----
if (prefersReducedMotion) {
  // Skip animation entirely — mark all as visible immediately
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
} else {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Fallback: ensure elements become visible even if IntersectionObserver misfires
  // (e.g. document very short, element already in viewport on load)
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 2500);
}

// ---- Active nav link (scroll spy) ----
const sections    = document.querySelectorAll('section[id]');
const navLinkEls  = document.querySelectorAll('.nav-links a[href^="#"]');

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinkEls.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`);
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });

sections.forEach(s => navObs.observe(s));

// ---- Carousel ----
(function () {
  const wrap    = document.getElementById('carousel');
  const track   = document.getElementById('carouselTrack');
  const caption = document.getElementById('carouselCaption');
  const counter = document.getElementById('carouselCounter');
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');
  if (!track) return;

  const slides  = [...track.querySelectorAll('.carousel-slide')];
  const total   = slides.length;
  let current   = 0;
  let startX    = 0;
  let dragDelta = 0;
  let dragging  = false;

  function update(animate) {
    if (!animate) track.classList.add('no-transition');
    track.style.transform = 'translateX(-' + (current * 100) + '%)';
    if (!animate) {
      void track.offsetWidth; // force reflow
      track.classList.remove('no-transition');
    }
    if (caption) {
      caption.style.opacity = '0';
      setTimeout(function () {
        caption.textContent = slides[current].dataset.caption || '';
        caption.style.opacity = '1';
      }, 130);
    }
    if (counter) counter.textContent = (current + 1) + ' / ' + total;
    if (btnPrev) btnPrev.disabled = current === 0;
    if (btnNext) btnNext.disabled = current === total - 1;
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(total - 1, idx));
    update(true);
  }

  if (btnPrev) btnPrev.addEventListener('click', function () { goTo(current - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { goTo(current + 1); });

  // Keyboard: only respond when focus is within the carousel region
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const focused = document.activeElement;
    if (!wrap || !wrap.contains(focused)) return;
    e.preventDefault();
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Mouse drag
  wrap.addEventListener('mousedown', function (e) {
    dragging  = true;
    startX    = e.clientX;
    dragDelta = 0;
    wrap.classList.add('is-dragging');
    track.classList.add('no-transition');
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    dragDelta = e.clientX - startX;
    track.style.transform =
      'translateX(calc(-' + (current * 100) + '% + ' + dragDelta + 'px))';
  });

  document.addEventListener('mouseup', function () {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-dragging');
    track.classList.remove('no-transition');
    if      (dragDelta < -60) goTo(current + 1);
    else if (dragDelta >  60) goTo(current - 1);
    else    update(true);
    dragDelta = 0;
  });

  // Touch swipe
  wrap.addEventListener('touchstart', function (e) {
    startX    = e.touches[0].clientX;
    dragDelta = 0;
    track.classList.add('no-transition');
  }, { passive: true });

  wrap.addEventListener('touchmove', function (e) {
    dragDelta = e.touches[0].clientX - startX;
    track.style.transform =
      'translateX(calc(-' + (current * 100) + '% + ' + dragDelta + 'px))';
  }, { passive: true });

  wrap.addEventListener('touchend', function () {
    track.classList.remove('no-transition');
    if      (dragDelta < -60) goTo(current + 1);
    else if (dragDelta >  60) goTo(current - 1);
    else    update(true);
    dragDelta = 0;
  });

  update(false);
})();
