// Pixel resolve effect — starts pixelated, resolves on scroll, re-pixelates when leaving
// Add class "pixel-resolve" to any <img> to activate

const DELAY = 600;
const STEPS = 8;
const STEP_SPEED = 80;
const MAX_PIXEL = Math.pow(2, STEPS);

document.querySelectorAll('.pixel-resolve').forEach((img) => {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.overflow = 'hidden';
  wrapper.style.borderRadius = getComputedStyle(img).borderRadius;
  img.parentNode.insertBefore(wrapper, img);
  wrapper.appendChild(img);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
  wrapper.appendChild(canvas);

  let delayId = null;
  let stepId = null;

  const getCoverCrop = () => {
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    const dispW = canvas.width;
    const dispH = canvas.height;
    const scale = Math.max(dispW / natW, dispH / natH);
    const cropW = dispW / scale;
    const cropH = dispH / scale;
    return { sx: (natW - cropW) / 2, sy: (natH - cropH) / 2, sw: cropW, sh: cropH };
  };

  const sizeCanvas = () => {
    canvas.width = img.offsetWidth * window.devicePixelRatio;
    canvas.height = img.offsetHeight * window.devicePixelRatio;
  };

  const drawPixelated = (pixelSize) => {
    const w = canvas.width;
    const h = canvas.height;
    const smallW = Math.max(1, Math.floor(w / pixelSize));
    const smallH = Math.max(1, Math.floor(h / pixelSize));
    const crop = getCoverCrop();

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, smallW, smallH);
    ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, w, h);
  };

  const showPixelated = () => {
    sizeCanvas();
    drawPixelated(MAX_PIXEL);
  };

  // Draw pixelated as soon as image is ready
  const initPixelated = () => {
    if (img.complete && img.naturalWidth > 0) {
      showPixelated();
    } else {
      img.addEventListener('load', showPixelated, { once: true });
    }
  };

  initPixelated();

  const startResolve = () => {
    if (!img.complete) return;
    sizeCanvas();

    let currentStep = 0;
    drawPixelated(MAX_PIXEL);

    stepId = setInterval(() => {
      currentStep++;
      if (currentStep >= STEPS) {
        clearInterval(stepId);
        canvas.style.display = 'none';
        return;
      }
      drawPixelated(Math.pow(2, STEPS - currentStep));
    }, STEP_SPEED);
  };

  const rePixelate = () => {
    clearTimeout(delayId);
    clearInterval(stepId);
    canvas.style.display = '';
    showPixelated();
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        delayId = setTimeout(startResolve, DELAY);
      } else {
        rePixelate();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(wrapper);
});