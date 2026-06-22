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

  it('shows a ghost completion for a command prefix and accepts it with Tab', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'he');
    expect(screen.getByText('lp')).toBeInTheDocument(); // ghost remainder of "help"

    await user.keyboard('{Tab}');
    expect(input.value).toBe('help');
    expect(screen.queryByText('lp')).not.toBeInTheDocument(); // nothing left to suggest
  });

  it('accepts the ghost completion with ArrowRight at the end of the line', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'wr'); // prefix of "writing"
    await user.keyboard('{ArrowRight}');
    expect(input.value).toBe('writing');
  });

  it('submits the typed text on Enter without auto-accepting the suggestion', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ab{Enter}'); // "ab" suggests "about", but Enter runs "ab"
    expect(await screen.findByText(/command not found: ab/i)).toBeInTheDocument();
  });
});
