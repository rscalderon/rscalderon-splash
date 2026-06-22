import { coreCommands } from './core';
import { createRegistry } from './registry';
import type { CommandMeta } from './types';

export const COMMANDS = coreCommands;
export const REGISTRY = createRegistry(coreCommands);
export const COMMAND_META: CommandMeta[] = coreCommands
  .filter((c) => !c.hidden)
  .map((c) => ({ name: c.name, description: c.description, soon: c.soon }));

export { runCommand, parseInput } from './registry';
export { suggestCompletion } from './suggest';
export type { Command, CommandContext, Line, Segment, Tone, CommandMeta } from './types';
