import type { Command, CommandContext, Line } from './types';

export function parseInput(input: string): { name: string; args: string[] } {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  return { name: (parts[0] ?? '').toLowerCase(), args: parts.slice(1) };
}

export function createRegistry(commands: Command[]): Map<string, Command> {
  const m = new Map<string, Command>();
  for (const c of commands) m.set(c.name, c);
  return m;
}

export function runCommand(
  registry: Map<string, Command>,
  input: string,
  ctx: CommandContext,
): Line[] {
  const { name, args } = parseInput(input);
  if (!name) return [];
  const cmd = registry.get(name);
  if (!cmd) {
    return [[{ text: `command not found: ${name} — try 'help'`, tone: 'dim' }]];
  }
  return cmd.run(ctx, args);
}
