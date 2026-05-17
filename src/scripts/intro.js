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

const run = async () => {
  const heading = document.getElementById('intro-heading');
  const video = document.getElementById('intro-video');
  const cta = document.getElementById('intro-cta');
  const ui = document.getElementById('ui');
  const scrollContainer = document.getElementById('scroll-container');

  if (!heading) return;

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
    video.classList.remove('opacity-0', 'h-0', 'overflow-hidden');
    video.play();
  }
  await wait(500);
  if (ui) ui.style.opacity = '1';

  await wait(600);
  if (cta) cta.classList.remove('opacity-0');

  await wait(300);
  if (scrollContainer) {
    scrollContainer.classList.remove('overflow-hidden');
    scrollContainer.classList.add('overflow-y-scroll');
  }
};

run();