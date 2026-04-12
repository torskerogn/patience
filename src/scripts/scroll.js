const container = document.querySelector('.snap-container');
let isScrolling;

container?.addEventListener('scroll', () => {
    clearTimeout(isScrolling);
    isScrolling = setTimeout(() => {
        const sectionHeight = window.innerHeight;
        const nearest = Math.round(container.scrollTop / sectionHeight) * sectionHeight;
        container.scrollTo({ top: nearest, behavior: 'smooth' });
    }, 5);
});