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
