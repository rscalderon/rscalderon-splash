import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobeExplorer from './GlobeExplorer';
import { PLACES } from '@/constants/travel';
import { getTally } from '@/lib/travel';

vi.mock('./Globe', () => ({ default: () => <div data-testid="globe" /> }));

beforeEach(() => {
  // Reduced motion → the count-up renders final values immediately (deterministic).
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

describe('GlobeExplorer', () => {
  it('shows the headline tally', () => {
    const t = getTally(PLACES);
    render(<GlobeExplorer />);
    const summary = screen.getByLabelText('travel summary');
    expect(within(summary).getByText(String(t.places))).toBeInTheDocument();
    expect(within(summary).getByText(String(t.countries))).toBeInTheDocument();
    expect(within(summary).getByText(String(t.continents))).toBeInTheDocument();
  });

  it('lists every place as a button', () => {
    render(<GlobeExplorer />);
    for (const p of PLACES) {
      expect(screen.getByRole('button', { name: new RegExp(`^${p.city}`, 'i') })).toBeInTheDocument();
    }
  });

  it('renders the places alphabetically by city', () => {
    render(<GlobeExplorer />);
    const cities = screen.getAllByRole('button').map((b) => b.textContent!.split(',')[0].trim());
    expect(cities).toHaveLength(PLACES.length);
    expect(cities).toEqual([...cities].sort((a, b) => a.localeCompare(b)));
  });

  it('selects a place when clicked', async () => {
    const user = userEvent.setup();
    render(<GlobeExplorer />);
    const paris = screen.getByRole('button', { name: /^Paris/i });
    expect(paris).toHaveAttribute('aria-pressed', 'false');
    await user.click(paris);
    expect(paris).toHaveAttribute('aria-pressed', 'true');
  });
});
