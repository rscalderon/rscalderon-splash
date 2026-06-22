import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTheme, resolveTheme, watchSystemTheme, THEME_KEY } from './theme';

describe('nextTheme', () => {
  it('toggles', () => {
    expect(nextTheme('light')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
  });
});

describe('resolveTheme', () => {
  it('prefers a valid stored value', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });
  it('falls back to system when stored is missing/invalid', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme('garbage', true)).toBe('dark');
  });
});

describe('watchSystemTheme', () => {
  type Listener = (e: { matches: boolean }) => void;
  let listeners: Set<Listener>;

  /** Simulate the OS flipping its color scheme. */
  function emitSystem(matches: boolean) {
    for (const l of [...listeners]) l({ matches });
  }

  beforeEach(() => {
    listeners = new Set();
    vi.stubGlobal('matchMedia', (query: string) => ({
      media: query,
      matches: false,
      addEventListener: (_type: string, cb: Listener) => listeners.add(cb),
      removeEventListener: (_type: string, cb: Listener) => listeners.delete(cb),
    }));
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('follows the system when no preference is stored', () => {
    watchSystemTheme();

    emitSystem(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    emitSystem(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('does not override an explicit stored preference', () => {
    localStorage.setItem(THEME_KEY, 'light');
    watchSystemTheme();

    emitSystem(true); // OS goes dark, but the user explicitly chose light
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('stops following the system after cleanup runs', () => {
    const stop = watchSystemTheme();
    stop();

    emitSystem(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
