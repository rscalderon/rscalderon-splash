import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('lists home, contact-info, and places/visited', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toHaveLength(3);
    expect(urls.some((u) => u.endsWith('/contact-info'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/places/visited'))).toBe(true);
    expect(urls.some((u) => !u.endsWith('/contact-info') && !u.endsWith('/places/visited'))).toBe(true);
  });
});
