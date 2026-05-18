import p5 from 'p5';

new p5((p) => {
  const MIN_BRUSH = 10;
  const MAX_BRUSH = 40;
  const STUBBORNNESS = 20;
  const GRAIN_FACTOR = 30;
  const STEP = 4;
  const CYCLE_LENGTH = 2400;
  const diag = STEP * Math.SQRT1_2;

  const palettes = [
    [[38,34,247],[255,248,225],[252,122,30],[33,33,33]],
    [[250,201,184],[229,212,192],[197,222,205],[161,232,204]],
    [[255,227,220],[226,132,19],[162,173,145],[222,60,75]],
    [[255,164,0],[0,159,253],[42,42,114],[35,37,40]],
    [[242,239,234],[252,119,83],[73,145,103],[63,69,49]],
  ];

  const palette = palettes[Math.floor(Math.random() * palettes.length)];

  const dirs = [
    { dx: -diag, dy: -diag },
    { dx:  diag, dy: -diag },
    { dx: -diag, dy:  diag },
    { dx:  diag, dy:  diag },
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
    for (let i = 0; i < dirs.length; i++) {
      const dot = (dx * dirs[i].dx + dy * dirs[i].dy) / (len * STEP);
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
      if (Math.abs(dx * (-cd.dy) + dy * cd.dx) / STEP > STUBBORNNESS) currentDir = wanted;
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

    // White background bar
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, y, w, footerH);

    // QR code
    if (qrImage) {
      const qrSize = 55;
      ctx.drawImage(qrImage, 8, y + 8, qrSize, qrSize);
    }

    // Text
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

  p.setup = () => {
    const container = document.getElementById('pipe-canvas');
    if (!container) return;

    const w = container.offsetWidth, h = container.offsetHeight;
    p.createCanvas(w, h).parent(container);
    pg = p.createGraphics(w, h);

    const isDark = document.documentElement.classList.contains('dark');
    pg.background(isDark ? 29 : 255);
    drawX = w / 2; drawY = h / 2;

    const img = new Image();
    img.onload = () => { qrImage = img; };
    img.src = '/icons/QR.svg';

    document.addEventListener('mousemove', handleMove);

    const scrollContainer = document.getElementById('scroll-container');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);

    const collapseBtn = document.getElementById('pipe-collapse');
    const wrapper = document.getElementById('pipe-wrapper');
    if (collapseBtn && wrapper) {
      collapseBtn.addEventListener('click', () => {
        wrapper.classList.toggle('translate-x-[calc(100%-24px)]');
        collapseBtn.textContent = wrapper.classList.contains('translate-x-[calc(100%-24px)]') ? '<' : '>';
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