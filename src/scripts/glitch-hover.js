// Font flicker effect — triggers when element scrolls into view
// Add class "glitch-hover" to any text element to activate

const flickerFonts = [
  '"Space Mono", monospace',
  '"VT323", monospace',
  '"Major Mono Display", monospace',
  '"Instrument Serif", serif',
];

const defaultFont = "'Montserrat', sans-serif";
const DELAY = 300;     // ms before flicker starts after entering view
const DURATION = 500;  // ms the flicker runs
const SPEED = 40;      // ms between font swaps

document.querySelectorAll('.glitch-hover').forEach((el) => {
  let intervalId = null;
  let delayId = null;
  let durationId = null;

  const startFlicker = () => {
    intervalId = setInterval(() => {
      const randomFont = flickerFonts[Math.floor(Math.random() * flickerFonts.length)];
      el.style.fontFamily = randomFont;
    }, SPEED);

    durationId = setTimeout(() => {
      clearInterval(intervalId);
      el.style.fontFamily = defaultFont;
    }, DURATION);
  };

  const stopFlicker = () => {
    clearTimeout(delayId);
    clearTimeout(durationId);
    clearInterval(intervalId);
    el.style.fontFamily = defaultFont;
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        delayId = setTimeout(startFlicker, DELAY);
      } else {
        stopFlicker();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(el);
});