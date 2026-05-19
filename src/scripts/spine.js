import { palette } from './palette.js';

const THICKNESS = 20;
const STEP = 4;
const CYCLE_LENGTH = 2400;
const diag = STEP * Math.SQRT1_2;

const dirMap = {
  'up':         { dx:  0,    dy: -STEP },
  'up-right':   { dx:  diag, dy: -diag },
  'right':      { dx:  STEP, dy:  0    },
  'down-right': { dx:  diag, dy:  diag },
  'down':       { dx:  0,    dy:  STEP },
  'down-left':  { dx: -diag, dy:  diag },
  'left':       { dx: -STEP, dy:  0    },
  'up-left':    { dx: -diag, dy: -diag },
};

const startX = 3;

const path = [
{ dir: 'down',       steps: 100 },
{ dir: 'right',      steps: 10 },
{ dir: 'down-right', steps: 20 },
{ dir: 'down',       steps: 60 },
{ dir: 'down-right', steps: 20 },
{ dir: 'right',      steps: 200 },
{ dir: 'down',       steps: 170 },
{ dir: 'right',      steps: 100 },
{ dir: 'down',       steps: 100 },
{ dir: 'left',       steps: 200 },
{ dir: 'down-left',  steps: 40 },
{ dir: 'down', steps: 10 },
{ dir: 'left', steps: 150 },
{ dir: 'down', steps: 100 },
{ dir: 'right', steps: 100 },
{ dir: 'down-right', steps: 50 },
{ dir: 'right', steps: 100 },
{ dir: 'down-right', steps: 70 },
{ dir: 'down-left', steps: 130 },
{ dir: 'left', steps: 130 },
{ dir: 'down', steps: 300 },
{ dir: 'right', steps: 200 },
{ dir: 'down', steps: 70 },
{ dir: 'down-left', steps: 20 },
{ dir: 'down', steps: 100 },
{ dir: 'left', steps: 150 },
{ dir: 'down-left', steps: 80 },
{ dir: 'down', steps: 80 },
{ dir: 'down-right', steps: 60 },
{ dir: 'down', steps: 300 },

];

function getColor(step) {
  const seg = CYCLE_LENGTH / palette.length;
  const pos = step % CYCLE_LENGTH;
  const i = Math.floor(pos / seg);
  const t = (pos % seg) / seg;
  const a = palette[i], b = palette[(i + 1) % palette.length];
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)})`;
}

// Pre-calculate all points once
let allPoints = [];

function buildPath() {
  const w = window.innerWidth;
  let cx = (startX / 100) * w;
  let cy = 0;
  let totalStep = 0;

  allPoints = [];

  for (const segment of path) {
    const dir = dirMap[segment.dir];
    if (!dir) continue;

    for (let i = 0; i < segment.steps; i++) {
      cx += dir.dx;
      cy += dir.dy;
      totalStep++;
      allPoints.push({ x: cx, y: cy, color: getColor(totalStep) });
    }
  }
}

function draw(scrollY) {
  const canvas = document.getElementById('spine-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  for (const pt of allPoints) {
    const screenY = pt.y - scrollY;
    if (screenY < -THICKNESS || screenY > h + THICKNESS) continue;

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, screenY, THICKNESS / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function init() {
  const canvas = document.getElementById('spine-canvas');
  const container = document.getElementById('scroll-container');
  if (!canvas || !container) return;

  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.getContext('2d').scale(dpr, dpr);

  buildPath();
  draw(0);

  container.addEventListener('scroll', () => {
    draw(container.scrollTop);
  });
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}