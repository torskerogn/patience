// Font flicker effect — triggers when element scrolls into view
// Add class "glitch-hover" to any text element to activate

const flickerFonts = [
  '"Space Mono", monospace',
  '"VT323", monospace',
  '"Major Mono Display", monospace',
  '"Instrument Serif", serif',
];

const flickerColors = [
  '#FC7A1E',
  '#2622F7',
];

const defaultFont = "'Montserrat', sans-serif";
const DELAY = 300;
const DURATION = 500;
const SPEED = 40;

document.querySelectorAll('.glitch-hover').forEach((el) => {
  let intervalId = null;
  let delayId = null;
  let durationId = null;
  const originalColor = getComputedStyle(el).color;

  const startFlicker = () => {
    intervalId = setInterval(() => {
      el.style.fontFamily = flickerFonts[Math.floor(Math.random() * flickerFonts.length)];
      el.style.color = flickerColors[Math.floor(Math.random() * flickerColors.length)];
    }, SPEED);

    durationId = setTimeout(() => {
      clearInterval(intervalId);
      el.style.fontFamily = defaultFont;
      el.style.color = originalColor;
    }, DURATION);
  };

  const stopFlicker = () => {
    clearTimeout(delayId);
    clearTimeout(durationId);
    clearInterval(intervalId);
    el.style.fontFamily = defaultFont;
    el.style.color = originalColor;
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