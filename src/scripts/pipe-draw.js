import p5 from 'p5';
import { palette } from './palette.js';

new p5((p) => {
  const MIN_BRUSH = 40;
  const MAX_BRUSH = 10;
  const STUBBORNNESS = 35;
  const GRAIN_FACTOR = 30;
  const STEP = 4;
  const CYCLE_LENGTH = 2400;
  const diag = STEP * Math.SQRT1_2;

  const dirs = [
    { dx:  0,    dy: -STEP },
    { dx:  diag, dy: -diag },
    { dx:  STEP, dy:  0    },
    { dx:  diag, dy:  diag },
    { dx:  0,    dy:  STEP },
    { dx: -diag, dy:  diag },
    { dx: -STEP, dy:  0    },
    { dx: -diag, dy: -diag },
  ];

  let totalSteps = 0;
  let drawX, drawY;
  let prevMouseX = -1, prevMouseY = -1;
  let currentDir = null;
  let brush = MIN_BRUSH;
  let pg, qrImage;

  function getColor() {
    const seg = CYCLE_LENGTH / palette.length;
    const pos = totalSteps % CYCLE_LENGTH;
    const i = Math.floor(pos / seg);
    const t = (pos % seg) / seg;
    const a = palette[i], b = palette[(i + 1) % palette.length];
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }

  function snapDir(dx, dy) {
    let best = 0, bestDot = -Infinity;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / len, ny = dy / len;
    for (let i = 0; i < dirs.length; i++) {
      const dLen = Math.sqrt(dirs[i].dx * dirs[i].dx + dirs[i].dy * dirs[i].dy) || 1;
      const dot = nx * (dirs[i].dx / dLen) + ny * (dirs[i].dy / dLen);
      if (dot > bestDot) { bestDot = dot; best = i; }
    }
    return best;
  }

  function addGrain() {
    pg.loadPixels();
    for (let i = 0; i < pg.pixels.length; i += 4) {
      const n = (Math.random() - 0.5) * GRAIN_FACTOR;
      pg.pixels[i]     = p.constrain(pg.pixels[i] + n, 0, 255);
      pg.pixels[i + 1] = p.constrain(pg.pixels[i + 1] + n, 0, 255);
      pg.pixels[i + 2] = p.constrain(pg.pixels[i + 2] + n, 0, 255);
    }
    pg.updatePixels();
  }

  function saveState() {
    try {
      sessionStorage.setItem('pipe-canvas', pg.canvas.toDataURL('image/png'));
      sessionStorage.setItem('pipe-drawX', drawX);
      sessionStorage.setItem('pipe-drawY', drawY);
      sessionStorage.setItem('pipe-totalSteps', totalSteps);
    } catch (e) {}
  }

  function restoreState(w, h) {
    const saved = sessionStorage.getItem('pipe-canvas');
    if (!saved) return false;

    const img = new Image();
    img.onload = () => {
      pg.drawingContext.drawImage(img, 0, 0, w, h);
    };
    img.src = saved;

    drawX = parseFloat(sessionStorage.getItem('pipe-drawX')) || w / 2;
    drawY = parseFloat(sessionStorage.getItem('pipe-drawY')) || h / 2;
    totalSteps = parseInt(sessionStorage.getItem('pipe-totalSteps')) || 0;
    return true;
  }

  function handleMove(e) {
    const mx = e.clientX, my = e.clientY;
    if (prevMouseX === -1) { prevMouseX = mx; prevMouseY = my; return; }

    const dx = mx - prevMouseX, dy = my - prevMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    prevMouseX = mx; prevMouseY = my;
    if (dist < 2) return;

    const wanted = snapDir(dx, dy);
    if (currentDir === null) {
      currentDir = wanted;
    } else if (wanted !== currentDir) {
      const cd = dirs[currentDir];
      const cdLen = Math.sqrt(cd.dx * cd.dx + cd.dy * cd.dy) || 1;
      const perpDist = Math.abs(dx * (-cd.dy / cdLen) + dy * (cd.dx / cdLen));
      if (perpDist > STUBBORNNESS) currentDir = wanted;
    }

    const dir = dirs[currentDir];
    for (let i = 0; i < Math.max(1, Math.floor(dist / STEP)); i++) {
      drawX += dir.dx; drawY += dir.dy;
      if (drawX < 5) drawX = pg.width - 5;
      if (drawX > pg.width - 5) drawX = 5;
      if (drawY < 5) drawY = pg.height - 5;
      if (drawY > pg.height - 5) drawY = 5;

      totalSteps++;
      const col = getColor();
      pg.noStroke();
      pg.fill(col[0], col[1], col[2], 153);
      pg.ellipse(drawX, drawY, brush * 2);
    }
  }

  function handleScroll(e) {
    const el = e.target;
    const scrollRatio = el.scrollTop / (el.scrollHeight - el.clientHeight || 1);
    brush = MIN_BRUSH + (MAX_BRUSH - MIN_BRUSH) * scrollRatio;
  }

  function drawFooter() {
    const ctx = pg.drawingContext;
    const w = pg.width;
    const h = pg.height;
    const footerH = 70;
    const y = h - footerH;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, y, w, footerH);

    if (qrImage) {
      ctx.drawImage(qrImage, 8, y + 8, 55, 55);
    }

    const textX = 70;
    ctx.fillStyle = '#212121';
    ctx.font = 'bold italic 16px Montserrat, sans-serif';
    ctx.fillText('Valdemar Verup', textX, y + 22);
    ctx.font = '12px Montserrat, sans-serif';
    ctx.fillText('Coded Design, DMJX', textX, y + 38);
    ctx.font = '9px Montserrat, sans-serif';
    ctx.fillText('+45 3049 2005', textX, y + 54);
    ctx.fillText('valdemar@verup.biz', textX + 68, y + 54);
  }

  function matchVideoHeight() {
    const video = document.getElementById('intro-video');
    const wrapper = document.getElementById('pipe-wrapper');
    if (!video || !wrapper) return;

    const rect = video.getBoundingClientRect();
    wrapper.style.top = rect.top + 'px';
    wrapper.style.bottom = (window.innerHeight - rect.bottom) + 'px';
  }

  p.setup = () => {
    const container = document.getElementById('pipe-canvas');
    if (!container) return;

    matchVideoHeight();

    const w = container.offsetWidth, h = container.offsetHeight;
    p.createCanvas(w, h).parent(container);
    pg = p.createGraphics(w, h);

    const shouldRestore = sessionStorage.getItem('intro-played') === 'true';

    if (shouldRestore && restoreState(w, h)) {
      // Restored from session
    } else {
      const isDark = document.documentElement.classList.contains('dark');
      pg.background(isDark ? 29 : 255);
      drawX = w / 2; drawY = h / 2;
    }

    const img = new Image();
    img.onload = () => { qrImage = img; };
    img.src = '/icons/QR.svg';

    document.addEventListener('mousemove', handleMove);

    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);

    document.querySelectorAll('a[href^="/projects"]').forEach((link) => {
      link.addEventListener('click', saveState);
    });

    const collapseBtn = document.getElementById('pipe-collapse');
    const wrapper = document.getElementById('pipe-wrapper');
    if (collapseBtn && wrapper) {
      wrapper.classList.add('translate-x-[calc(100%-24px)]')
      collapseBtn.textContent = '<'

      collapseBtn.addEventListener('click', () => {
        wrapper.classList.toggle('translate-x-[calc(100%-24px)]');
        collapseBtn.textContent = wrapper.classList.contains('translate-x-[calc(100%-24px)]') ? ' ' : ' ';
      });
    }

    document.getElementById('pipe-save')?.addEventListener('click', () => {
      const snapshot = pg.get();
      addGrain();
      drawFooter();
      p.image(pg, 0, 0);
      p.saveCanvas('thx_4_ur_visit', 'png');
      pg.image(snapshot, 0, 0);
    });
  };

  p.draw = () => { if (pg) p.image(pg, 0, 0); };
});