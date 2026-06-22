import { describe, it, expect, vi } from 'vitest';
import { parseInput, createRegistry, runCommand } from './registry';
import type { Command, CommandContext } from './types';

const ctx: CommandContext = {
  setTheme: vi.fn(),
  getTheme: () => 'light',
  clear: vi.fn(),
  enterAsk: vi.fn(),
  links: [],
  commands: [],
};

const echo: Command = {
  name: 'echo',
  description: 'echo args',
  run: (_c, args) => [[{ text: args.join(' ') }]],
};

describe('parseInput', () => {
  it('lowercases the command and splits args', () => {
    expect(parseInput('  ECHO  a   b ')).toEqual({ name: 'echo', args: ['a', 'b'] });
  });
  it('handles empty input', () => {
    expect(parseInput('   ')).toEqual({ name: '', args: [] });
  });
});

describe('runCommand', () => {
  const reg = createRegistry([echo]);

  it('dispatches to a known command', () => {
    expect(runCommand(reg, 'echo hi there', ctx)).toEqual([[{ text: 'hi there' }]]);
  });
  it('returns nothing for empty input', () => {
    expect(runCommand(reg, '   ', ctx)).toEqual([]);
  });
  it('returns a not-found line for unknown commands', () => {
    const out = runCommand(reg, 'nope', ctx);
    expect(out[0][0].text).toContain("command not found: nope");
  });
});
