import { describe, it, expect } from 'vitest';
import { commandIntents } from './intents';
import { REGISTRY } from '@/lib/commands';

describe('command intents', () => {
  it('every intent routes to a registered command', () => {
    for (const intent of commandIntents) {
      expect(REGISTRY.has(intent.command)).toBe(true);
    }
  });

  it('every intent has at least one non-empty phrase', () => {
    for (const intent of commandIntents) {
      expect(intent.phrases.length).toBeGreaterThan(0);
      for (const phrase of intent.phrases) {
        expect(phrase.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('routes travel (not the removed globe command) with travel-flavored phrases', () => {
    const travel = commandIntents.find((i) => i.command === 'travel');
    expect(travel).toBeDefined();
    expect(commandIntents.some((i) => i.command === 'globe')).toBe(false);
    expect(travel!.phrases.join(' ').toLowerCase()).toMatch(/travel|been|visit/);
  });

  it('has no ask intent (ask-as-default replaced ask-mode)', () => {
    expect(commandIntents.some((i) => i.command === 'ask')).toBe(false);
  });
});
