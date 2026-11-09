(function () {
  const storageKey = 'meme-generator/theme';
  const darkSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;

  function getStoredTheme() {
    try {
      const theme = window.localStorage.getItem(storageKey);
      return theme === 'light' || theme === 'dark' ? theme : 'system';
    } catch {
      return 'system';
    }
  }

  function getSystemTheme() {
    return darkSchemeMediaQuery.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme === 'system' ? getSystemTheme() : theme);
  }

  function setThemeWithTransition(theme, evt) {
    const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
    if (root.getAttribute('data-bs-theme') === resolvedTheme) return;

    const toggle = evt?.composedPath?.().find(node => node?.localName === 'theme-toggle')
      || document.querySelector('theme-toggle');
    const rect = toggle?.getBoundingClientRect?.();

    if (rect) {
      root.style.setProperty('--theme-origin-x', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--theme-origin-y', `${rect.top + rect.height / 2}px`);
    }

    const update = () => applyTheme(resolvedTheme);

    const cleanUpOrigin = () => {
      root.style.removeProperty('--theme-origin-x');
      root.style.removeProperty('--theme-origin-y');
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      update();
      cleanUpOrigin();
      return;
    }

    if (typeof document.startViewTransition === 'function') {
      try {
        const transition = document.startViewTransition(update);
        transition.finished.then(cleanUpOrigin, cleanUpOrigin);
        return;
      } catch {
        // Fall back to a regular CSS transition if a view transition is busy.
      }
    }

    root.classList.add('theme-transitioning');
    update();
    window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
      cleanUpOrigin();
    }, 1650);
  }

  darkSchemeMediaQuery.addEventListener('change', () => applyTheme('system'));
  document.addEventListener('theme-change', evt => {
    setThemeWithTransition(evt.detail.resolvedTheme, evt);
  });

  // Set the initial theme before the first paint; do not animate page load.
  applyTheme(getStoredTheme());
})();
