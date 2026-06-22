import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from './Terminal';

// Mock the lazy ask-engine chunk: no model download in jsdom.
// `askInit` is controllable so tests can hold the model in a "still loading" state.
const { askAnswer, askInit } = vi.hoisted(() => ({
  askAnswer: vi.fn(),
  askInit: vi.fn(() => Promise.resolve()),
}));
vi.mock('@/lib/ask/engine', () => ({
  createAskEngine: () => ({
    init: askInit,
    answer: askAnswer,
  }),
}));

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

describe('Terminal — ask mode', () => {
  beforeEach(() => {
    askAnswer.mockReset();
    askInit.mockReset();
    askInit.mockResolvedValue(undefined);
  });

  it('prefetches the model as soon as the terminal opens (before ask is typed)', async () => {
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
  });

  it('keeps a question typed while the model is still loading and answers it once ready', async () => {
    let resolveInit!: () => void;
    askInit.mockImplementationOnce(() => new Promise<void>((r) => (resolveInit = r)));
    askAnswer.mockResolvedValue({ kind: 'answer', text: 'Deferred answer.' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'ask{Enter}'); // enter ask-mode while the model is still loading
    expect(await screen.findByText(/loading model/i)).toBeInTheDocument();

    await user.type(input, 'what do you do?{Enter}'); // typed mid-load — must be kept, not lost
    expect(screen.getByText('what do you do?')).toBeInTheDocument(); // echoed immediately
    expect(askAnswer).not.toHaveBeenCalled(); // not answered while still loading

    resolveInit(); // model finishes loading
    expect(await screen.findByText('Deferred answer.')).toBeInTheDocument();
    expect(askAnswer).toHaveBeenCalledWith('what do you do?');
  });

  it('enters ask mode and shows the ready hint', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ask{Enter}');
    expect(await screen.findByText(/ask me anything about Rodrigo/i)).toBeInTheDocument();
  });

  it('answers a question via the engine', async () => {
    askAnswer.mockResolvedValue({ kind: 'answer', text: 'I build AI products end to end.' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ask{Enter}');
    await screen.findByText(/ask me anything/i);
    await user.type(input, 'what is your background?{Enter}');
    expect(await screen.findByText('I build AI products end to end.')).toBeInTheDocument();
    expect(askAnswer).toHaveBeenCalledWith('what is your background?');
  });

  it('shows the honest-redirect line when there is no match', async () => {
    askAnswer.mockResolvedValue({ kind: 'nomatch' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ask{Enter}');
    await screen.findByText(/ask me anything/i);
    await user.type(input, 'what is the meaning of life?{Enter}');
    expect(await screen.findByText(/I don't have a curated answer for that/i)).toBeInTheDocument();
  });

  it("exits ask mode with 'exit' so commands run again", async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ask{Enter}');
    await screen.findByText(/ask me anything/i);
    await user.type(input, 'exit{Enter}');
    await user.type(input, 'about{Enter}');
    expect(await screen.findByText(/Full-Stack AI Engineer/i)).toBeInTheDocument();
  });

  it('leaves ask mode on Escape (command autocomplete works again)', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ask{Enter}');
    await screen.findByText(/ask me anything/i);
    await user.keyboard('{Escape}');
    await user.type(input, 'he');
    expect(await screen.findByText('lp')).toBeInTheDocument();
  });

  it('disables command autocomplete while in ask mode', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'ask{Enter}');
    await screen.findByText(/ask me anything/i);
    await user.type(input, 'he');
    expect(screen.queryByText('lp')).not.toBeInTheDocument();
  });
});
