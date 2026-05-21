// Check navigation type FIRST before anything
const nav = performance.getEntriesByType('navigation')[0];
const isReload = nav && nav.type === 'reload';
const isFirstVisit = !sessionStorage.getItem('intro-played');

// Clear everything on reload or first visit
if (isReload || isFirstVisit) {
  sessionStorage.removeItem('intro-played');
  sessionStorage.removeItem('scroll-pos');
  sessionStorage.removeItem('pipe-canvas');
  sessionStorage.removeItem('pipe-drawX');
  sessionStorage.removeItem('pipe-drawY');
  sessionStorage.removeItem('pipe-totalSteps');
}

const SHOULD_SKIP = sessionStorage.getItem('intro-played') === 'true';

const DEV = true;
if (DEV && !SHOULD_SKIP) {
  document.getElementById('ui')?.style.setProperty('opacity', '1');
  document.getElementById('intro-video')?.classList.remove('opacity-0');
  document.getElementById('intro-heading')?.classList.add('hidden');
  document.getElementById('spine-canvas')?.style.setProperty('opacity', '1');
  const sh = document.getElementById('scroll-hint');
  if (sh) { sh.style.opacity = '1'; sh.textContent = 'scroll down to explore...'; }
  const sc = document.getElementById('scroll-container');
  if (sc) { sc.classList.remove('overflow-hidden'); sc.classList.add('overflow-y-scroll'); }
  positionHint();
  sessionStorage.setItem('intro-played', 'true');
}

const flickerFonts = [
  '"Space Mono", monospace',
  '"VT323", monospace',
  '"Major Mono Display", monospace',
  '"Instrument Serif", serif',
];
const defaultFont = "'Montserrat', sans-serif";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const typeText = (el, text, speed = 70) => {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
};

const deleteText = (el, speed = 40) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (el.textContent.length <= 0) {
        clearInterval(interval);
        resolve();
        return;
      }
      el.textContent = el.textContent.slice(0, -1);
    }, speed);
  });
};

const glitchFlicker = (el, duration = 500, speed = 40) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      el.style.fontFamily = flickerFonts[Math.floor(Math.random() * flickerFonts.length)];
    }, speed);
    setTimeout(() => {
      clearInterval(interval);
      el.style.fontFamily = defaultFont;
      resolve();
    }, duration);
  });
};

function positionHint() {
  const video = document.getElementById('intro-video');
  const hint = document.getElementById('scroll-hint');
  if (!video || !hint) return;

  const videoBottom = video.getBoundingClientRect().bottom;
  const viewportBottom = window.innerHeight;
  const middle = videoBottom + (viewportBottom - videoBottom) / 2;

  hint.style.top = middle + 'px';
  hint.style.left = '50%';
  hint.style.transform = 'translateX(-50%)';
}

function skipIntro() {
  const heading = document.getElementById('intro-heading');
  const video = document.getElementById('intro-video');
  const ui = document.getElementById('ui');
  const scrollContainer = document.getElementById('scroll-container');
  const spine = document.getElementById('spine-canvas');
  const scrollHint = document.getElementById('scroll-hint');

  if (heading) heading.classList.add('hidden');
  if (video) { video.classList.remove('opacity-0'); video.play().catch(() => {}); }
  if (ui) ui.style.opacity = '1';
  if (spine) spine.style.opacity = '1';
  if (scrollHint) {
    scrollHint.style.opacity = '1';
    scrollHint.textContent = 'scroll down to explore...';
    positionHint();
  }
  if (scrollContainer) {
    scrollContainer.classList.remove('overflow-hidden');
    scrollContainer.classList.add('overflow-y-scroll');
    const saved = sessionStorage.getItem('scroll-pos');
    if (saved) {
      setTimeout(() => { scrollContainer.scrollTop = parseInt(saved); }, 150);
    }
  }
}

const run = async () => {
  const heading = document.getElementById('intro-heading');
  const video = document.getElementById('intro-video');
  const ui = document.getElementById('ui');
  const scrollContainer = document.getElementById('scroll-container');
  const spine = document.getElementById('spine-canvas');
  const scrollHint = document.getElementById('scroll-hint');

  if (!heading) return;

  if (SHOULD_SKIP || DEV) {
    skipIntro();
    return;
  }

  await wait(500);
  await typeText(heading, '< hello human />');

  await wait(600);
  await glitchFlicker(heading);

  await wait(400);
  await deleteText(heading);

  await wait(300);
  await typeText(heading, '< welcome />');

  await wait(800);
  heading.classList.add('hidden');
  if (video) {
    video.currentTime = 0;
    video.classList.remove('opacity-0');
    video.play().catch(() => {
      document.addEventListener('touchstart', () => {
        video.currentTime = 0;
        video.play();
      }, { once: true });
    });
  }

  await wait(500);
  if (ui) ui.style.opacity = '1';
  if (spine) spine.style.opacity = '1';

  await wait(300);
  if (scrollContainer) {
    scrollContainer.classList.remove('overflow-hidden');
    scrollContainer.classList.add('overflow-y-scroll');
  }

  if (scrollHint) {
    positionHint();
    scrollHint.style.opacity = '1';
    await typeText(scrollHint, 'scroll down to explore...', 50);
  }

  sessionStorage.setItem('intro-played', 'true');
};

run();

const sc = document.getElementById('scroll-container');
if (sc) sc.addEventListener('scroll', () => {
  sessionStorage.setItem('scroll-pos', sc.scrollTop);
});