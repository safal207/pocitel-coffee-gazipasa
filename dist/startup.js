(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  // A shared product link should keep opening the requested product directly.
  if (root.dataset.shareItem || params.get('item')) return;

  const languages = ['tr', 'en', 'ru'];
  let language = params.get('lang');
  if (!languages.includes(language)) {
    try { language = localStorage.getItem('pocitel-language'); } catch { /* Default to Turkish. */ }
  }
  root.dataset.startupLanguage = languages.includes(language) ? language : 'tr';
  root.classList.add('startup-pending');

  const started = performance.now();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let finished = false;
  let readyTimer;
  let maximumTimer;
  function finish(immediate = false) {
    if (finished) return;
    finished = true;
    clearTimeout(maximumTimer);
    clearTimeout(readyTimer);
    document.removeEventListener('pointerdown', skip, true);
    document.removeEventListener('keydown', skip, true);
    root.classList.add('startup-complete');
    const clean = () => root.classList.remove('startup-pending', 'startup-complete');
    if (immediate || reducedMotion) clean();
    else setTimeout(clean, 220);
  }
  function skip() { finish(true); }
  // Independent of the menu module and every image/network request.
  maximumTimer = setTimeout(finish, 1600);
  document.addEventListener('pointerdown', skip, { once: true, capture: true, passive: true });
  document.addEventListener('keydown', skip, { once: true, capture: true });
  window.addEventListener('pagehide', skip, { once: true });
  window.addEventListener('pageshow', event => { if (event.persisted) skip(); });

  document.addEventListener('DOMContentLoaded', async () => {
    const artwork = [...document.querySelectorAll('.startup-screen img')];
    await Promise.allSettled(artwork.map(img => {
      if (img.complete) return img.decode?.();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
    if (finished) return;
    // A brief welcome on a fast connection, with no minimum for reduced motion.
    readyTimer = setTimeout(finish, reducedMotion ? 0 : Math.max(0, 650 - (performance.now() - started)));
  }, { once: true });
})();
