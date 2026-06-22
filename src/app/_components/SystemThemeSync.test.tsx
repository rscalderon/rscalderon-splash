import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import SystemThemeSync from './SystemThemeSync';

describe('SystemThemeSync', () => {
  type Listener = (e: { matches: boolean }) => void;
  let listeners: Set<Listener>;

  const emitSystem = (matches: boolean) => {
    for (const l of [...listeners]) l({ matches });
  };

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

  it('applies the OS theme on a live system change while mounted', () => {
    render(<SystemThemeSync />);

    emitSystem(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('stops syncing after unmount', () => {
    const { unmount } = render(<SystemThemeSync />);
    unmount();

    emitSystem(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
