import { describe, it, expect, vi } from 'vitest';
import { coreCommands } from './core';
import type { Command, CommandContext } from './types';

function byName(name: string): Command {
  const c = coreCommands.find((x) => x.name === name);
  if (!c) throw new Error(`missing command ${name}`);
  return c;
}

function makeCtx(over: Partial<CommandContext> = {}): CommandContext {
  return {
    setTheme: vi.fn(),
    getTheme: () => 'light',
    clear: vi.fn(),
    enterAsk: vi.fn(),
    open: vi.fn(),
    links: [{ label: 'GitHub', href: 'https://github.com/rscalderon', handle: 'github.com/rscalderon' }],
    commands: coreCommands.map((c) => ({ name: c.name, description: c.description, soon: c.soon })),
    ...over,
  };
}

describe('core commands', () => {
  it('about returns at least one line', () => {
    expect(byName('about').run(makeCtx(), []).length).toBeGreaterThan(0);
  });

  it('links lists each link with its href', () => {
    const out = byName('links').run(makeCtx(), []);
    const flat = out.flat();
    expect(flat.some((s) => s.href === 'https://github.com/rscalderon')).toBe(true);
  });

  it('help groups core and coming-soon commands', () => {
    const text = byName('help').run(makeCtx(), []).flat().map((s) => s.text).join('\n');
    expect(text).toContain('about');
    expect(text).toContain('coming soon');
    expect(text).toContain('globe');
  });

  it('theme toggles via ctx and reports the new theme', () => {
    const setTheme = vi.fn();
    const out = byName('theme').run(makeCtx({ getTheme: () => 'light', setTheme }), []);
    expect(setTheme).toHaveBeenCalledWith('dark');
    expect(out.flat().map((s) => s.text).join(' ')).toContain('dark');
  });

  it('clear calls ctx.clear and prints nothing', () => {
    const clear = vi.fn();
    const out = byName('clear').run(makeCtx({ clear }), []);
    expect(clear).toHaveBeenCalledOnce();
    expect(out).toEqual([]);
  });

  it('exposes globe as a soon-flagged roadmap toy', () => {
    for (const n of ['globe']) {
      expect(byName(n).soon).toBe(true);
      expect(byName(n).run(makeCtx(), []).length).toBeGreaterThan(0);
    }
  });

  it('game is live: opens /game in a new tab via ctx.open', () => {
    const open = vi.fn();
    const cmd = byName('game');
    const out = cmd.run(makeCtx({ open }), []);
    expect(cmd.soon).toBeFalsy();
    expect(open).toHaveBeenCalledWith('/game');
    expect(out.flat().some((s) => s.href === '/game')).toBe(true);
  });

  it('ask is a real command that enters ask-mode via ctx.enterAsk and prints nothing', () => {
    const enterAsk = vi.fn();
    const out = byName('ask').run(makeCtx({ enterAsk }), []);
    expect(enterAsk).toHaveBeenCalledOnce();
    expect(out).toEqual([]);
    expect(byName('ask').soon).toBeUndefined();
  });
});
