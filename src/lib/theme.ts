export type Theme = 'light' | 'dark';

export const THEME_KEY = 'rsc-theme';

export function nextTheme(t: Theme): Theme {
  return t === 'dark' ? 'light' : 'dark';
}

/** Decide the initial theme from a stored preference + the OS preference. */
export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

/** Client-only: reflect the theme on <html> and persist it. */
export function applyTheme(t: Theme): void {
  document.documentElement.classList.toggle('dark', t === 'dark');
}

/**
 * Client-only: keep the theme in sync with the OS color scheme while the user
 * has no explicit override stored. An explicit choice (via the `theme` command)
 * always wins. Returns a cleanup that removes the listener.
 */
export function watchSystemTheme(): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = (e: MediaQueryListEvent) => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      /* storage unavailable — follow the system */
    }
    if (stored === 'light' || stored === 'dark') return; // explicit choice wins
    applyTheme(e.matches ? 'dark' : 'light');
  };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function persistTheme(t: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* storage unavailable — ignore */
  }
}

export function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
