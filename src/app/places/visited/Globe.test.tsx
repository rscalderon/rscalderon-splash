import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { COBEOptions } from 'cobe';
import Globe from './Globe';

const { createGlobe, destroy } = vi.hoisted(() => {
  const destroy = vi.fn();
  const update = vi.fn();
  return { destroy, createGlobe: vi.fn(() => ({ update, destroy })) };
});
vi.mock('cobe', () => ({ default: createGlobe }));

beforeEach(() => {
  createGlobe.mockClear();
  destroy.mockClear();
});
afterEach(() => {
  document.documentElement.classList.remove('dark');
});

describe('Globe', () => {
  it('renders an accessible canvas', () => {
    render(<Globe markers={[{ location: [0, 0], size: 0.05 }]} focus={null} />);
    expect(screen.getByRole('img', { name: /globe/i })).toBeInTheDocument();
  });

  it('creates the cobe globe with the given markers', async () => {
    render(<Globe markers={[{ location: [10, 20], size: 0.1 }]} focus={null} />);
    await vi.waitFor(() => expect(createGlobe).toHaveBeenCalled());
    const [, opts] = createGlobe.mock.calls[0] as unknown as [HTMLCanvasElement, COBEOptions];
    expect(opts.markers).toEqual([{ location: [10, 20], size: 0.1 }]);
  });

  it('destroys the globe on unmount', async () => {
    const { unmount } = render(<Globe markers={[{ location: [0, 0], size: 0.05 }]} focus={null} />);
    await vi.waitFor(() => expect(createGlobe).toHaveBeenCalled());
    unmount();
    expect(destroy).toHaveBeenCalled();
  });

  it('re-creates the globe when the theme class changes', async () => {
    render(<Globe markers={[{ location: [0, 0], size: 0.05 }]} focus={null} />);
    await vi.waitFor(() => expect(createGlobe).toHaveBeenCalledTimes(1));
    document.documentElement.classList.add('dark');
    await vi.waitFor(() => expect(createGlobe).toHaveBeenCalledTimes(2));
  });
});
