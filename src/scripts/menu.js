const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const overlay = document.getElementById('menu-overlay');
const closeBtn = document.getElementById('menu-close');
let open = false;

function toggle() {
    open = !open;

    menu?.classList.toggle('translate-x-full', !open);
    menu?.classList.toggle('translate-x-0', open);

    overlay?.classList.toggle('opacity-0', !open);
    overlay?.classList.toggle('pointer-events-none', !open);
    overlay?.classList.toggle('opacity-100', open);

    burger?.classList.toggle('opacity-0', open);
    burger?.classList.toggle('pointer-events-none', open);

    burger?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
}

burger?.addEventListener('click', toggle);
closeBtn?.addEventListener('click', toggle);
overlay?.addEventListener('click', toggle);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) toggle();
});