(() => {
  const key = 'pocitel-appearance-v1';
  const themes = { light: '#f7f1e6', dark: '#191815', romantic: '#fff2f0', kids: '#fff7df' };
  const valid = value => Object.hasOwn(themes, value);

  function updateButtons() {
    document.querySelectorAll('[data-theme-choice]').forEach(button => {
      button.setAttribute('aria-pressed', button.dataset.themeChoice === document.documentElement.dataset.theme);
    });
  }

  function apply(theme, persist = false) {
    if (!valid(theme)) theme = 'light';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = themes[theme];
    document.querySelector('meta[name="color-scheme"]').content = theme === 'dark' ? 'dark' : 'only light';
    updateButtons();
    if (persist) {
      try { localStorage.setItem(key, theme); } catch { /* The current page still works without storage. */ }
    }
  }

  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Use the brand's light style. */ }
  // This classic script runs before the stylesheets, avoiding a light flash.
  apply(saved);
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-theme-choice]');
    if (button) apply(button.dataset.themeChoice, true);
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
  document.addEventListener('DOMContentLoaded', () => {
    updateButtons();
    const header = document.querySelector('.top');
    const measure = () => document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
    else window.addEventListener('resize', measure);
  });
})();
