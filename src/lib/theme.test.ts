import { describe, it, expect } from 'vitest';
import { nextTheme, resolveTheme } from './theme';

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
