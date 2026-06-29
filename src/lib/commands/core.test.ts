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

  it('help lists the live commands but not the removed ask or writing commands', () => {
    const text = byName('help').run(makeCtx(), []).flat().map((s) => s.text).join('\n');
    expect(text).toContain('about');
    expect(text).toContain('travel');
    expect(text).toContain('game');
    expect(text).not.toContain('ask');
    expect(text).not.toContain('writing');
  });

  it('lists the help commands in alphabetical order', () => {
    const names = byName('help')
      .run(makeCtx(), [])
      .filter((l) => l[0]?.tone === 'accent')
      .map((l) => l[0].text.trim());
    expect(names.length).toBeGreaterThan(1);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
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
    const link = out.flat().find((s) => s.href === '/game');
    expect(link?.text).toBe('click here');
    expect(link?.tone).toBe('accent');
  });

  it('no longer registers the ask command (ask-as-default replaced it)', () => {
    expect(coreCommands.some((c) => c.name === 'ask')).toBe(false);
  });

  it('no longer registers the writing command (decluttered; no essays yet)', () => {
    expect(coreCommands.some((c) => c.name === 'writing')).toBe(false);
  });

  it('travel opens /places/visited in a new tab with a clickable fallback', () => {
    const open = vi.fn();
    const travel = byName('travel');
    expect(travel.soon).toBeFalsy();
    const segments = travel.run(makeCtx({ open }), []).flat();
    expect(open).toHaveBeenCalledWith('/places/visited');
    const link = segments.find((s) => s.href === '/places/visited');
    expect(link?.text).toBe('click here');
    expect(link?.tone).toBe('accent');
  });

  it('contact opens /contact-info in a new tab with a clickable fallback', () => {
    const open = vi.fn();
    const segments = byName('contact').run(makeCtx({ open }), []).flat();
    expect(open).toHaveBeenCalledWith('/contact-info');
    const link = segments.find((s) => s.href === '/contact-info');
    expect(link?.text).toBe('click here');
    expect(link?.tone).toBe('accent');
  });

  it('links stays a clickable list and does not auto-open a tab', () => {
    const open = vi.fn();
    byName('links').run(makeCtx({ open }), []);
    expect(open).not.toHaveBeenCalled();
  });
});
