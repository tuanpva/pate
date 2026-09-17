const musicToggle = document.querySelector('#musicToggle');
const music = document.querySelector('#bgMusic');
const secretButton = document.querySelector('#secretButton');
const secretMessage = document.querySelector('#secretMessage');
music.volume = 0.22;

music.addEventListener('error', () => {
  musicToggle.querySelector('.music-label').textContent = 'sound off';
  musicToggle.setAttribute('aria-label', 'Turn music on');
});

musicToggle.addEventListener('click', async () => {
  if (!music.src) {
    musicToggle.querySelector('.music-label').textContent = 'add song';
    return;
  }
  if (music.paused) {
    try {
      await music.play();
      musicToggle.classList.add('is-playing');
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggle.setAttribute('aria-label', 'Turn music off');
      musicToggle.querySelector('.music-label').textContent = 'sound on';
    } catch {
      musicToggle.querySelector('.music-label').textContent = 'add song';
    }
  } else {
    music.pause();
    musicToggle.classList.remove('is-playing');
    musicToggle.setAttribute('aria-pressed', 'false');
    musicToggle.setAttribute('aria-label', 'Turn music on');
    musicToggle.querySelector('.music-label').textContent = 'sound off';
  }
});

let secretTimer;
secretButton.addEventListener('click', () => {
  clearTimeout(secretTimer);
  secretMessage.classList.add('is-visible');
  secretTimer = setTimeout(() => secretMessage.classList.remove('is-visible'), 3600);
});

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 })
  : { observe: (element) => element.classList.add('is-visible'), unobserve: () => {} };

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const header = document.querySelector('.site-header');
const cursorGlow = document.createElement('div');
cursorGlow.className = 'cursor-glow';
document.body.append(cursorGlow);

const lightboxImages = [...document.querySelectorAll('.hero-image img, .memory-card img, .film-strip img, .cinematic-section img, .polaroid img, .final-image img')];
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('role', 'dialog');
lightbox.setAttribute('aria-modal', 'true');
lightbox.setAttribute('aria-label', 'Memory image viewer');
lightbox.innerHTML = `
  <div class="lightbox-backdrop"></div>
  <div class="lightbox-content">
    <button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>
    <button class="lightbox-prev" type="button" aria-label="Previous memory">&#8592;</button>
    <img class="lightbox-image" alt="" />
    <button class="lightbox-next" type="button" aria-label="Next memory">&#8594;</button>
    <p class="lightbox-caption"></p>
  </div>
`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector('.lightbox-image');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
let activeImageIndex = 0;
let lastFocusedElement;
let touchStartX = 0;
let touchStartY = 0;

function showLightbox(index) {
  activeImageIndex = (index + lightboxImages.length) % lightboxImages.length;
  const image = lightboxImages[activeImageIndex];
  const caption = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = caption;
  lightbox.classList.add('is-open');
  document.body.classList.add('lightbox-open');
  lightbox.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  document.body.classList.remove('lightbox-open');
  lastFocusedElement?.focus();
}

lightboxImages.forEach((image, index) => {
  const target = image.closest('figure') || image;
  image.loading = image.closest('.hero') ? 'eager' : 'lazy';
  target.setAttribute('tabindex', '0');
  target.setAttribute('role', 'button');
  target.setAttribute('aria-label', `Open ${image.alt}`);
  target.addEventListener('click', () => {
    lastFocusedElement = target;
    showLightbox(index);
  });
  target.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      lastFocusedElement = target;
      showLightbox(index);
    }
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showLightbox(activeImageIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showLightbox(activeImageIndex + 1));
lightbox.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });
lightbox.addEventListener('touchend', (event) => {
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY)) return;
  showLightbox(activeImageIndex + (deltaX < 0 ? 1 : -1));
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showLightbox(activeImageIndex - 1);
  if (event.key === 'ArrowRight') showLightbox(activeImageIndex + 1);
});

let frameRequested = false;
window.addEventListener('scroll', () => {
  if (frameRequested) return;
  frameRequested = true;
  requestAnimationFrame(() => {
    const scrollProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
    document.documentElement.style.setProperty('--scroll-progress', scrollProgress.toFixed(3));
    header.classList.toggle('is-scrolled', window.scrollY > 30);
    frameRequested = false;
  });
}, { passive: true });

window.addEventListener('pointermove', (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
}, { passive: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && !music.paused) music.pause();
});