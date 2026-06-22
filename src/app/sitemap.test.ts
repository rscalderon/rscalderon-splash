import { describe, it, expect } from 'vitest';
import sitemap from './sitemap';

describe('sitemap', () => {
  it('lists home, contact-info, and globe', () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/contact-info'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/globe'))).toBe(true);
  });
});
