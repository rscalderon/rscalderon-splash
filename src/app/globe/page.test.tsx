import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobePage from './page';

vi.mock('./GlobeExplorer', () => ({ default: () => <div data-testid="explorer" /> }));

describe('GlobePage', () => {
  it('renders the explorer and a link back to the main page', () => {
    render(<GlobePage />);
    expect(screen.getByTestId('explorer')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /main page/i })).toHaveAttribute('href', '/');
  });
});
