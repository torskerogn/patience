const toggle = document.getElementById('darkToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

if (toggle) {
    toggle.checked = html.classList.contains('dark');

    toggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    });
}