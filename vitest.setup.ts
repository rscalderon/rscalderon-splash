import '@testing-library/jest-dom/vitest';

// jsdom does not implement Element.prototype.scrollTo (it has no layout engine),
// so components that auto-scroll a container (e.g. the Terminal output body) throw
// "scrollTo is not a function" under test. Provide a no-op polyfill so the real
// component code can run unchanged.
if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

// jsdom has no matchMedia; components query prefers-reduced-motion / color-scheme.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
