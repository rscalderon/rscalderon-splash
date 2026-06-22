import { describe, it, expect } from 'vitest';
import { links } from './links';

describe('links', () => {
  it('exposes LinkedIn, GitHub, Medium with absolute https hrefs', () => {
    const labels = links.map((l) => l.label);
    expect(labels).toEqual(['LinkedIn', 'GitHub', 'Medium']);
    for (const l of links) {
      expect(l.href).toMatch(/^https:\/\//);
      expect(l.handle.length).toBeGreaterThan(0);
    }
  });
});
