const ORDER = [
  'city', 'shecanplay', 'aaben', 'projmap',
  'three', 'blender', 'gamedesign', 'motion',
];

let current = 0;

function show(index) {
  current = index;
  document.querySelectorAll('[data-project]').forEach((el, i) => {
    el.classList.toggle('hidden', i !== current);
  });
  document.getElementById('project-counter').textContent = `${current + 1} / ${ORDER.length}`;
  history.replaceState(null, '', `#${ORDER[current]}`);
  window.scrollTo(0, 0);
}

function init() {
  const hash = location.hash.replace('#', '');
  const index = ORDER.indexOf(hash);
  show(index >= 0 ? index : 0);

  document.getElementById('proj-prev').addEventListener('click', () => {
    show((current - 1 + ORDER.length) % ORDER.length);
  });

  document.getElementById('proj-next').addEventListener('click', () => {
    show((current + 1) % ORDER.length);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show((current + 1) % ORDER.length);
    if (e.key === 'ArrowLeft') show((current - 1 + ORDER.length) % ORDER.length);
  });

  window.addEventListener('hashchange', () => {
    const i = ORDER.indexOf(location.hash.replace('#', ''));
    if (i >= 0) show(i);
  });
}

document.addEventListener('DOMContentLoaded', init);