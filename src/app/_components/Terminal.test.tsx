import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from './Terminal';

describe('Terminal', () => {
  it('runs a command on Enter and shows output', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'about{Enter}');
    expect(await screen.findByText(/Full-Stack AI Engineer/i)).toBeInTheDocument();
  });

  it('clears output when the clear command runs', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'about{Enter}');
    expect(await screen.findByText(/Full-Stack AI Engineer/i)).toBeInTheDocument();
    await user.type(input, 'clear{Enter}');
    expect(screen.queryByText(/Full-Stack AI Engineer/i)).not.toBeInTheDocument();
  });
});
