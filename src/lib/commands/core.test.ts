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

  it('exposes the three roadmap toys as soon-flagged', () => {
    for (const n of ['globe', 'ask', 'game']) {
      expect(byName(n).soon).toBe(true);
      expect(byName(n).run(makeCtx(), []).length).toBeGreaterThan(0);
    }
  });
});
