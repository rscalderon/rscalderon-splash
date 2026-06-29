import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Terminal from './Terminal';

// Terminal builds its engine from the worker proxy (`createWorkerAskEngine`) fed
// the worker spawner (`spawnAskWorker`). Mock both so tests exercise the real
// Terminal logic against a controllable fake engine — no Web Worker, no model
// download in jsdom. `askInit` is controllable so tests can hold the model in a
// "still loading" state.
const { askAnswer, askInit, askDispose } = vi.hoisted(() => ({
  askAnswer: vi.fn(),
  askInit: vi.fn(() => Promise.resolve()),
  askDispose: vi.fn(),
}));
vi.mock('@/lib/ask/worker-engine', () => ({
  createWorkerAskEngine: () => ({
    init: askInit,
    answer: askAnswer,
    dispose: askDispose,
  }),
}));
vi.mock('@/lib/ask/spawn', () => ({
  spawnAskWorker: () => ({}),
}));

describe('Terminal', () => {
  beforeEach(() => {
    askAnswer.mockReset();
    askInit.mockReset();
    askInit.mockResolvedValue(undefined);
  });

  it('runs a command on Enter and shows output', async () => {
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'about{Enter}');
    expect(await screen.findByText(/Full-Stack AI Engineer/i)).toBeInTheDocument();
  });

  it('renders terminal links with target=_blank so the splash page stays open', async () => {
    // Even an internal route (/game) must open in a new tab — the whole point is
    // the visitor never navigates away from the terminal and forgets about it.
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'game{Enter}');
    const link = await screen.findByRole('link', { name: /open \/game/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    openSpy.mockRestore();
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
    // "ab" suggests "about", but Enter must submit "ab" verbatim (free text),
    // not the completed command — so it routes through the fallback, not `about`.
    askAnswer.mockResolvedValue({ kind: 'nomatch' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
    const input = screen.getByRole('textbox');
    await user.type(input, 'ab{Enter}');
    expect(await screen.findByText(/I don't have a curated answer for that/i)).toBeInTheDocument();
    expect(screen.queryByText(/Full-Stack AI Engineer/i)).not.toBeInTheDocument(); // not "about"
    expect(askAnswer).toHaveBeenCalledWith('ab');
  });
});

describe('Terminal — smart fallback (ask-as-default)', () => {
  beforeEach(() => {
    askAnswer.mockReset();
    askInit.mockReset();
    askInit.mockResolvedValue(undefined);
  });

  it('prefetches the model as soon as the terminal opens', async () => {
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
  });

  it('answers plain-English input once the model is ready', async () => {
    askAnswer.mockResolvedValue({ kind: 'answer', text: 'I build AI products end to end.' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
    const input = screen.getByRole('textbox');
    await user.type(input, 'what is your background?{Enter}');
    expect(await screen.findByText('I build AI products end to end.')).toBeInTheDocument();
    expect(askAnswer).toHaveBeenCalledWith('what is your background?');
  });

  it('shows the honest-redirect line when there is no match', async () => {
    askAnswer.mockResolvedValue({ kind: 'nomatch' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
    const input = screen.getByRole('textbox');
    await user.type(input, 'what is the meaning of life?{Enter}');
    expect(await screen.findByText(/I don't have a curated answer for that/i)).toBeInTheDocument();
  });

  // THE BUG WE FIXED: cold window — free text typed before the model is ready
  // must be echoed and kept (NOT "command not found"), then answered once ready.
  it('keeps plain English typed before the model is ready and answers it once ready', async () => {
    let resolveInit!: () => void;
    askInit.mockImplementationOnce(() => new Promise<void>((r) => (resolveInit = r)));
    askAnswer.mockResolvedValue({ kind: 'answer', text: 'Deferred answer.' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    const input = screen.getByRole('textbox');

    await user.type(input, 'what do you do?{Enter}'); // typed mid-load — must be kept, not lost
    expect(screen.getByText('what do you do?')).toBeInTheDocument(); // echoed immediately
    expect(screen.getByText(/loading model/i)).toBeInTheDocument(); // reads as "thinking"
    expect(screen.queryByText(/command not found/i)).not.toBeInTheDocument(); // never a dead end
    expect(askAnswer).not.toHaveBeenCalled(); // not answered while still loading

    resolveInit(); // model finishes loading
    expect(await screen.findByText('Deferred answer.')).toBeInTheDocument();
    expect(askAnswer).toHaveBeenCalledWith('what do you do?');
  });

  it('offers a routed command and runs it on a bare Enter', async () => {
    askAnswer.mockResolvedValue({ kind: 'command', command: 'about' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
    const input = screen.getByRole('textbox');
    await user.type(input, 'tell me who you are{Enter}');
    expect(await screen.findByText(/looks like you want/i)).toBeInTheDocument();

    await user.type(input, '{Enter}'); // bare ↵ confirms the guess → runs `about`
    expect(await screen.findByText(/Full-Stack AI Engineer/i)).toBeInTheDocument();
  });

  it('dismisses a routed command offer when the user keeps typing instead', async () => {
    askAnswer.mockResolvedValue({ kind: 'command', command: 'about' });
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
    const input = screen.getByRole('textbox');
    await user.type(input, 'who are you{Enter}');
    expect(await screen.findByText(/looks like you want/i)).toBeInTheDocument();

    // Typing a real command instead of ↵ dismisses the offer and runs that command.
    await user.type(input, 'links{Enter}');
    expect(await screen.findByText(/github\.com\/rscalderon/i)).toBeInTheDocument();
    // `about` was never run (its offer was dismissed, not confirmed).
    expect(screen.queryByText(/Full-Stack AI Engineer/i)).not.toBeInTheDocument();
  });

  it('shows the load-error line for plain English when the engine fails to load', async () => {
    askInit.mockRejectedValueOnce(new Error('no webgpu'));
    const user = userEvent.setup();
    render(<Terminal onClose={vi.fn()} />);
    await waitFor(() => expect(askInit).toHaveBeenCalled());
    const input = screen.getByRole('textbox');
    await user.type(input, 'what do you do?{Enter}');
    expect(await screen.findByText(/Couldn't load the model/i)).toBeInTheDocument();
  });
});
