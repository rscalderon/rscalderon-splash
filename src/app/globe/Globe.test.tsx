import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Globe from './Globe';

const destroy = vi.fn();
const createGlobe = vi.fn((..._args: unknown[]) => ({ destroy }));
vi.mock('cobe', () => ({ default: (...args: unknown[]) => createGlobe(...args) }));

describe('Globe', () => {
  beforeEach(() => {
    createGlobe.mockClear();
    destroy.mockClear();
  });

  it('renders an accessible canvas', () => {
    render(<Globe markers={[{ location: [0, 0], size: 0.05 }]} focus={null} />);
    expect(screen.getByRole('img', { name: /globe/i })).toBeInTheDocument();
  });

  it('creates the cobe globe with the given markers', async () => {
    render(<Globe markers={[{ location: [10, 20], size: 0.1 }]} focus={null} />);
    await vi.waitFor(() => expect(createGlobe).toHaveBeenCalled());
    const opts = createGlobe.mock.calls[0][1] as { markers: unknown };
    expect(opts.markers).toEqual([{ location: [10, 20], size: 0.1 }]);
  });
});
