import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandLayer from './CommandLayer';

describe('CommandLayer', () => {
  it('shows the reveal hint and no dialog initially', () => {
    render(<CommandLayer />);
    expect(screen.getByText(/start typing/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the terminal on Meta+K and closes on Escape', async () => {
    const user = userEvent.setup();
    render(<CommandLayer />);
    await user.keyboard('{Meta>}k{/Meta}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens when the user starts typing a letter, seeding that character', async () => {
    const user = userEvent.setup();
    render(<CommandLayer />);
    await user.keyboard('a');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(await screen.findByRole('textbox')).toHaveValue('a');
  });
});
