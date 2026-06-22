import { describe, it, expect } from 'vitest';
import { suggestCompletion } from './suggest';

// Mirrors the public command order; 'contact' precedes 'clear' on purpose.
const NAMES = ['help', 'about', 'links', 'contact', 'clear', 'theme'];

describe('suggestCompletion', () => {
  it('returns the remainder still to type for a prefix', () => {
    expect(suggestCompletion('h', NAMES)).toBe('elp');
    expect(suggestCompletion('he', NAMES)).toBe('lp');
  });

  it('matches case-insensitively, returning the canonical remainder', () => {
    expect(suggestCompletion('HE', NAMES)).toBe('lp');
  });

  it('picks the first command in list order when several match', () => {
    // 'contact' and 'clear' both start with 'c'; list order wins.
    expect(suggestCompletion('c', NAMES)).toBe('ontact');
  });

  it('returns null when nothing matches', () => {
    expect(suggestCompletion('z', NAMES)).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(suggestCompletion('', NAMES)).toBeNull();
  });

  it('returns null once the full command name is typed', () => {
    expect(suggestCompletion('help', NAMES)).toBeNull();
  });

  it('returns null when the input runs past the command name', () => {
    expect(suggestCompletion('help ', NAMES)).toBeNull();
    expect(suggestCompletion('theme dark', NAMES)).toBeNull();
  });
});
