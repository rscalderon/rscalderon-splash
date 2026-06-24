import { describe, it, expect } from 'vitest';
import { commandIntents } from './intents';
import { coreCommands } from '../commands/core';

describe('commandIntents', () => {
  const names = coreCommands.map((c) => c.name);

  it('every intent routes to a real command', () => {
    for (const intent of commandIntents) {
      expect(names, `unknown command: ${intent.command}`).toContain(intent.command);
    }
  });

  it('every intent has at least one phrasing', () => {
    for (const intent of commandIntents) {
      expect(intent.phrases.length, intent.command).toBeGreaterThan(0);
    }
  });
});
