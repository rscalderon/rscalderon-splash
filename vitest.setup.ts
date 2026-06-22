import '@testing-library/jest-dom/vitest';

// jsdom does not implement Element.prototype.scrollTo (it has no layout engine),
// so components that auto-scroll a container (e.g. the Terminal output body) throw
// "scrollTo is not a function" under test. Provide a no-op polyfill so the real
// component code can run unchanged.
if (typeof Element !== 'undefined' && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
