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
  mobileScroll.appendChild(titleSlide);

  // All panels as individual cards
  const panels = document.querySelectorAll('.panel');
  const totalCards = panels.length + 1; // +1 for title

  panels.forEach((panel, i) => {
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

  // Track scroll position
  let currentIndex = 0;
  function updateCounter() {
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

  mobileScroll.addEventListener('scroll', updateCounter, { passive: true });

  // Make panels visible (they start with opacity: 0 for desktop animation)
  mobileScroll.querySelectorAll('.panel-caption').forEach(c => {
    c.style.opacity = '1';
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

  function revealSection(index) {
    if (index === currentSection) return;

    // Fade out old section panels
    if (currentSection >= 0 && currentSection !== index) {
      const oldPanels = sections[currentSection].querySelectorAll('.panel');
      if (oldPanels.length) {
        gsap.to(oldPanels, {
          opacity: 0,
          y: -20,
          scale: 0.96,
          duration: 0.35,
          ease: 'power2.in',
          stagger: { each: 0.03, from: 'end' },
        });
      }
      const oldCaptions = sections[currentSection].querySelectorAll('.panel-caption');
      if (oldCaptions.length) {
        gsap.to(oldCaptions, {
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
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
      gsap.killTweensOf(panels);

      gsap.fromTo(panels,
        { opacity: 0, y: 40, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: { each: 0.08, from: 'start' },
        }
      );

      const captions = sections[index].querySelectorAll('.panel-caption');
      gsap.killTweensOf(captions);
      gsap.fromTo(captions,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { each: 0.08, from: 'start' },
          delay: 0.25,
        }
      );

      const frames = sections[index].querySelectorAll('.panel-frame');
      gsap.fromTo(frames,
        { borderColor: 'rgba(212, 146, 90, 0.2)' },
        {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          duration: 1.2,
          ease: 'power1.out',
          stagger: { each: 0.08 },
          delay: 0.1,
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
      end: () => '+=' + (totalSections * window.innerHeight * 1.2),
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      snap: {
        snapTo: 1 / (totalSections - 1),
        duration: { min: 0.3, max: 0.6 },
        delay: 0.05,
        ease: 'power2.inOut',
        inertia: false,
      },
      onUpdate: (self) => {
        progressBar.style.width = (self.progress * 100) + '%';
        const sectionIndex = Math.round(self.progress * (totalSections - 1));
        revealSection(sectionIndex);
      },
    },
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index);
      const st = scrollTween.scrollTrigger;
      const sectionProgress = idx / (totalSections - 1);
      const targetScroll = st.start + sectionProgress * (st.end - st.start);
      gsap.to(window, { scrollTo: targetScroll, duration: 0.8, ease: 'power2.inOut' });
    });
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

  function openModal(panel) {
    const img = panel.querySelector('.panel-img');
    const desc = panel.querySelector('.panel-desc');
    const shotNum = panel.dataset.shot;

    modalImg.src = img.src;
    modalShotNum.textContent = shotNum ? shotNum.padStart(2, '0') : '';
    modalDesc.textContent = desc ? desc.textContent : '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

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
        document.body.style.overflow = '';
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
