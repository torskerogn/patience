// Auto-create lightbox if it doesn't exist
if (!document.getElementById('lightbox')) {
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-dark/70 backdrop-blur-md cursor-pointer';
    lb.innerHTML = '<img id="lightbox-img" class="max-w-[90vw] max-h-[90vh] object-contain rounded-xl" src="">';
    document.body.appendChild(lb);

    lb.addEventListener('click', () => {
        lb.classList.add('hidden');
        lb.classList.remove('flex');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            lb.classList.add('hidden');
            lb.classList.remove('flex');
        }
    });
}

document.querySelectorAll('.fullSize').forEach((img) => {
    img.classList.add('cursor-pointer');
    img.style.transition = 'transform 0.3s ease, outline 0.3s ease, outline-offset 0.3s ease';

    img.addEventListener('mouseenter', () => {
        const isDark = document.documentElement.classList.contains('dark');
        img.style.transform = 'scale(0.93)';
        img.style.outline = isDark ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(0,0,0,0.3)';
        img.style.outlineOffset = '6px';
    });

    img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
        img.style.outline = '2px solid transparent';
        img.style.outlineOffset = '0px';
    });

    img.addEventListener('click', () => {
        const lb = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        if (lb && lbImg) {
            lbImg.src = img.src;
            lb.classList.remove('hidden');
            lb.classList.add('flex');
        }
    });
});