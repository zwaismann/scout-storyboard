/* ============================================
   SCOUT MOTORS STORYBOARD -- Full Horizontal
   All pages scroll left-to-right via GSAP
   Mobile: native swipe cards via CSS scroll-snap
   ============================================ */

import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const isMobile = () => window.innerWidth <= 768;


/* --- Title card entrance animation --- */
function initTitleCard(container) {
  const root = container || document;
  const brand = root.querySelector('.tc-brand');
  const dividers = root.querySelectorAll('.tc-divider');
  const campaign = root.querySelector('.tc-campaign');
  const agency = root.querySelector('.tc-agency');
  const credit = root.querySelector('.tc-credit');

  if (!brand) return;

  const tl = gsap.timeline({ delay: 0.3 });

  tl.fromTo(brand,
    { opacity: 0, y: 12, letterSpacing: '10px' },
    { opacity: 1, y: 0, letterSpacing: isMobile() ? '4px' : '6px', duration: 0.8, ease: 'power3.out' }
  );

  tl.fromTo(dividers[0],
    { opacity: 0, width: 0 },
    { opacity: 0.4, width: 40, duration: 0.5, ease: 'power2.inOut' },
    '-=0.3'
  );

  tl.fromTo(campaign,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
    '-=0.2'
  );

  tl.fromTo(agency,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    '-=0.3'
  );

  tl.fromTo(dividers[1],
    { opacity: 0, width: 0 },
    { opacity: 0.4, width: 40, duration: 0.5, ease: 'power2.inOut' },
    '-=0.2'
  );

  tl.fromTo(credit,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
    '-=0.2'
  );
}


/* --- Mobile: swipe cards --- */
function initMobile() {
  const wrapper = document.getElementById('storyboardWrapper');
  const viewport = document.getElementById('storyboardViewport');
  const dotsContainer = document.getElementById('sectionDots');
  const progressBar = document.getElementById('progressBar');
  const nav = document.getElementById('nav');

  // Hide desktop dots
  dotsContainer.style.display = 'none';

  // Build mobile card layout
  document.body.classList.add('is-mobile');

  // Create mobile container
  const mobileScroll = document.createElement('div');
  mobileScroll.className = 'mobile-scroll';

  // Title card
  const titleCard = document.querySelector('.title-card-section');
  const titleSlide = document.createElement('div');
  titleSlide.className = 'mobile-card mobile-title-card';
  titleSlide.innerHTML = titleCard.querySelector('.title-card-inner').innerHTML;

  // Add swipe hint
  const hint = document.createElement('div');
  hint.className = 'mobile-swipe-hint';
  hint.innerHTML = `Swipe <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  titleSlide.appendChild(hint);

  mobileScroll.appendChild(titleSlide);

  // All panels as individual cards
  const panels = document.querySelectorAll('.panel');
  const totalCards = panels.length + 1; // +1 for title

  panels.forEach((panel) => {
    const card = document.createElement('div');
    card.className = 'mobile-card';
    card.dataset.shot = panel.dataset.shot;

    const frame = panel.querySelector('.panel-frame').cloneNode(true);
    const caption = panel.querySelector('.panel-caption').cloneNode(true);

    card.appendChild(frame);
    card.appendChild(caption);
    mobileScroll.appendChild(card);
  });

  // Hide original wrapper, insert mobile scroll
  wrapper.style.display = 'none';
  document.body.insertBefore(mobileScroll, wrapper);

  // Animate title card in mobile context
  initTitleCard(titleSlide);

  // Counter element
  const counter = document.createElement('div');
  counter.className = 'mobile-counter';
  counter.textContent = '';
  document.body.appendChild(counter);

  // Track scroll position with rAF throttle for smoothness
  let currentIndex = 0;
  let rafId = null;

  function updateCounter() {
    rafId = null;
    const scrollLeft = mobileScroll.scrollLeft;
    const cardWidth = mobileScroll.offsetWidth;
    const index = Math.round(scrollLeft / cardWidth);

    if (index !== currentIndex) {
      currentIndex = index;
    }

    // Update counter
    if (index === 0) {
      counter.textContent = '';
      nav.classList.remove('visible');
    } else {
      counter.textContent = `${String(index).padStart(2, '0')} / ${String(totalCards - 1).padStart(2, '0')}`;
      nav.classList.add('visible');
    }

    // Update progress bar
    const progress = scrollLeft / (mobileScroll.scrollWidth - cardWidth);
    progressBar.style.width = (progress * 100) + '%';
  }

  mobileScroll.addEventListener('scroll', () => {
    if (!rafId) {
      rafId = requestAnimationFrame(updateCounter);
    }
  }, { passive: true });

  // Make panels and captions visible (they start with opacity: 0 for desktop animation)
  mobileScroll.querySelectorAll('.panel-caption').forEach(c => {
    c.style.opacity = '1';
  });
  mobileScroll.querySelectorAll('.panel-frame').forEach(f => {
    f.style.opacity = '1';
  });
  // Also ensure any mobile cards with panels inherit visible state
  mobileScroll.querySelectorAll('.mobile-card').forEach(card => {
    card.style.opacity = '1';
  });

  // Init modal for mobile cards
  initMobileModal(mobileScroll);
}


/* --- Mobile modal --- */
function initMobileModal(container) {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const modalShotNum = document.getElementById('modalShotNum');
  const modalDesc = document.getElementById('modalDesc');
  const modalClose = document.getElementById('modalClose');

  function openModal(card) {
    const img = card.querySelector('.panel-img');
    const desc = card.querySelector('.panel-desc');
    const shotNum = card.dataset.shot;

    modalImg.src = img.src;
    modalShotNum.textContent = shotNum ? shotNum.padStart(2, '0') : '';
    modalDesc.textContent = desc ? desc.textContent : '';
    overlay.classList.add('open');

    gsap.fromTo(modal,
      { y: 30, scale: 0.95, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.05 }
    );
  }

  function closeModal() {
    gsap.to(modal, {
      y: 20, scale: 0.97, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('open');
      },
    });
  }

  container.querySelectorAll('.mobile-card[data-shot]').forEach(card => {
    card.querySelector('.panel-frame').addEventListener('click', () => openModal(card));
  });

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}


/* --- Desktop: horizontal scroll (all pages) --- */
function initStoryboard() {
  const wrapper = document.getElementById('storyboardWrapper');
  const viewport = document.getElementById('storyboardViewport');
  const sections = document.querySelectorAll('.board-section');
  const dots = document.querySelectorAll('.section-dots .dot');
  const dotsContainer = document.getElementById('sectionDots');
  const sectionLabel = document.getElementById('sectionLabel');
  const nav = document.getElementById('nav');
  const progressBar = document.getElementById('progressBar');
  const totalSections = sections.length;

  // Set viewport width
  viewport.style.width = (totalSections * 100) + 'vw';

  // Show dots immediately
  dotsContainer.classList.add('visible');

  let currentSection = -1;
  let isSnapping = false;

  function revealSection(index) {
    if (index === currentSection) return;

    // Fade out old section panels quickly
    if (currentSection >= 0 && currentSection !== index) {
      const oldPanels = sections[currentSection].querySelectorAll('.panel');
      if (oldPanels.length) {
        gsap.to(oldPanels, {
          opacity: 0,
          y: -15,
          duration: 0.25,
          ease: 'power2.in',
          stagger: { each: 0.02, from: 'end' },
          overwrite: true,
        });
      }
      const oldCaptions = sections[currentSection].querySelectorAll('.panel-caption');
      if (oldCaptions.length) {
        gsap.to(oldCaptions, {
          opacity: 0,
          duration: 0.15,
          ease: 'power1.in',
          overwrite: true,
        });
      }
    }

    currentSection = index;

    if (index === 0) {
      nav.classList.remove('visible');
    } else {
      nav.classList.add('visible');
    }

    const panels = sections[index].querySelectorAll('.panel');
    if (panels.length) {
      gsap.fromTo(panels,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: { each: 0.06, from: 'start' },
          overwrite: true,
        }
      );

      const captions = sections[index].querySelectorAll('.panel-caption');
      gsap.fromTo(captions,
        { opacity: 0, y: 6 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: { each: 0.06, from: 'start' },
          delay: 0.2,
          overwrite: true,
        }
      );

      const frames = sections[index].querySelectorAll('.panel-frame');
      gsap.fromTo(frames,
        { borderColor: 'rgba(212, 146, 90, 0.2)' },
        {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          duration: 1.0,
          ease: 'power1.out',
          stagger: { each: 0.06 },
          delay: 0.1,
          overwrite: 'auto',
        }
      );
    }

    const label = sections[index]?.dataset.label || '';
    if (sectionLabel.textContent !== label) {
      gsap.to(sectionLabel, {
        opacity: 0, duration: 0.15,
        onComplete: () => {
          sectionLabel.textContent = label;
          gsap.to(sectionLabel, { opacity: 1, duration: 0.2 });
        },
      });
    }

    dots.forEach((d, i) => {
      const isActive = i === index;
      d.classList.toggle('active', isActive);
      gsap.to(d, {
        scale: isActive ? 1.25 : 1,
        duration: 0.3,
        ease: 'back.out(2)',
      });
    });
  }

  const scrollTween = gsap.to(viewport, {
    x: () => -(viewport.scrollWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: wrapper,
      start: 'top top',
      end: () => '+=' + (totalSections * window.innerHeight),
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: 1 / (totalSections - 1),
        duration: { min: 0.25, max: 0.8 },
        delay: 0,
        ease: 'power2.inOut',
      },
      onUpdate: (self) => {
        progressBar.style.width = (self.progress * 100) + '%';
        const sectionIndex = Math.round(self.progress * (totalSections - 1));
        revealSection(sectionIndex);
      },
    },
  });

  // Dot navigation with smooth scroll
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index);
      const st = scrollTween.scrollTrigger;
      const sectionProgress = idx / (totalSections - 1);
      const targetScroll = st.start + sectionProgress * (st.end - st.start);
      gsap.to(window, { scrollTo: targetScroll, duration: 0.8, ease: 'power2.inOut' });
    });
  });

  // Keyboard navigation for accessibility
  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('modalOverlay');
    if (overlay.classList.contains('open')) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = Math.min(currentSection + 1, totalSections - 1);
      if (nextIdx !== currentSection) {
        const st = scrollTween.scrollTrigger;
        const sectionProgress = nextIdx / (totalSections - 1);
        const targetScroll = st.start + sectionProgress * (st.end - st.start);
        gsap.to(window, { scrollTo: targetScroll, duration: 0.6, ease: 'power2.inOut' });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = Math.max(currentSection - 1, 0);
      if (prevIdx !== currentSection) {
        const st = scrollTween.scrollTrigger;
        const sectionProgress = prevIdx / (totalSections - 1);
        const targetScroll = st.start + sectionProgress * (st.end - st.start);
        gsap.to(window, { scrollTo: targetScroll, duration: 0.6, ease: 'power2.inOut' });
      }
    }
  });

  revealSection(0);
}


/* --- Desktop modal --- */
function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const modalShotNum = document.getElementById('modalShotNum');
  const modalDesc = document.getElementById('modalDesc');
  const modalClose = document.getElementById('modalClose');

  // Store scroll position to prevent jump on modal close
  let savedScrollY = 0;

  function openModal(panel) {
    const img = panel.querySelector('.panel-img');
    const desc = panel.querySelector('.panel-desc');
    const shotNum = panel.dataset.shot;

    modalImg.src = img.src;
    modalShotNum.textContent = shotNum ? shotNum.padStart(2, '0') : '';
    modalDesc.textContent = desc ? desc.textContent : '';

    savedScrollY = window.scrollY;
    overlay.classList.add('open');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';

    gsap.fromTo(modal,
      { y: 30, scale: 0.95, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out', delay: 0.05 }
    );
  }

  function closeModal() {
    gsap.to(modal, {
      y: 20, scale: 0.97, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, savedScrollY);
      },
    });
  }

  document.querySelectorAll('.panel').forEach(panel => {
    panel.querySelector('.panel-frame').addEventListener('click', () => openModal(panel));
  });

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });
}


/* --- Init --- */
function init() {
  if (isMobile()) {
    initMobile();
  } else {
    initTitleCard();
    initStoryboard();
    initModal();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
