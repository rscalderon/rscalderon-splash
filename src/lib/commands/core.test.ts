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

  it('help lists the live commands but not the removed ask command', () => {
    const text = byName('help').run(makeCtx(), []).flat().map((s) => s.text).join('\n');
    expect(text).toContain('about');
    expect(text).toContain('travel');
    expect(text).toContain('game');
    expect(text).not.toContain('ask');
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

  it('game is live: opens /game in a new tab via ctx.open', () => {
    const open = vi.fn();
    const cmd = byName('game');
    const out = cmd.run(makeCtx({ open }), []);
    expect(cmd.soon).toBeFalsy();
    expect(open).toHaveBeenCalledWith('/game');
    expect(out.flat().some((s) => s.href === '/game')).toBe(true);
  });

  it('no longer registers the ask command (ask-as-default replaced it)', () => {
    expect(coreCommands.some((c) => c.name === 'ask')).toBe(false);
  });

  it('travel is a real command that links to /places/visited', () => {
    const travel = byName('travel');
    expect(travel.soon).toBeFalsy();
    expect(travel.description).toBe("places I've visited");
    const segments = travel.run(makeCtx(), []).flat();
    expect(segments.some((s) => s.href === '/places/visited' && s.tone === 'accent')).toBe(true);
  });
});
