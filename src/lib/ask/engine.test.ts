import { describe, it, expect } from 'vitest';
import { createAskEngine, readDownloadProgress, type Embedder } from './engine';
import type { Entry } from './knowledge';
import type { CommandIntent } from './intents';

const VECS: Record<string, number[]> = {
  cat: [1, 0, 0, 0, 0],
  dog: [0, 1, 0, 0, 0],
  visit: [0, 0, 1, 0, 0], // routes the travel intent
  essay: [0, 0, 0, 1, 0], // matches the rich (linked) answer entry
};

function fakeEmbedder(): Embedder {
  return async (text: string) => {
    const t = text.toLowerCase();
    const key = Object.keys(VECS).find((k) => t.includes(k));
    return new Float32Array(key ? VECS[key] : [0, 0, 0, 0, 1]); // unknown → orthogonal to all topics
  };
}

const entries: Entry[] = [
  { id: 'cat', questions: ['tell me about the cat'], answer: 'Meow.' },
  { id: 'dog', questions: ['tell me about the dog'], answer: 'Woof.' },
  {
    id: 'rich',
    questions: ['show me the essay'],
    answer: [{ text: 'Read it ' }, { text: 'here', href: 'https://example.test' }],
  },
];

const intents: CommandIntent[] = [{ command: 'travel', phrases: ['places I have visited'] }];

function makeEngine() {
  return createAskEngine({
    entries,
    intents,
    threshold: 0.45,
    loadEmbedder: async () => fakeEmbedder(),
  });
}

describe('ask engine', () => {
  it('returns the curated answer for a matching question', async () => {
    const engine = makeEngine();
    await engine.init();
    expect(await engine.answer('what about the cat?')).toEqual({ kind: 'answer', line: [{ text: 'Meow.' }] });
    expect(await engine.answer('the dog please')).toEqual({ kind: 'answer', line: [{ text: 'Woof.' }] });
  });

  it('returns a pre-built line answer (segments with a link) unchanged', async () => {
    const engine = makeEngine();
    await engine.init();
    expect(await engine.answer('the essay please')).toEqual({
      kind: 'answer',
      line: [{ text: 'Read it ' }, { text: 'here', href: 'https://example.test' }],
    });
  });

  it('routes a matching intent phrase to its command', async () => {
    const engine = makeEngine();
    await engine.init();
    expect(await engine.answer('the places you visit')).toEqual({ kind: 'command', command: 'travel' });
  });

  it('returns nomatch when nothing is similar enough', async () => {
    const engine = makeEngine();
    await engine.init();
    expect(await engine.answer('quantum physics')).toEqual({ kind: 'nomatch' });
  });

  it('returns nomatch before init and for empty input', async () => {
    const engine = makeEngine();
    expect(await engine.answer('cat')).toEqual({ kind: 'nomatch' }); // not initialized yet
    await engine.init();
    expect(await engine.answer('   ')).toEqual({ kind: 'nomatch' });
  });
});

describe('readDownloadProgress', () => {
  it('ignores per-file progress events (the source of the 0→100→0 jumps)', () => {
    // transformers.js emits a per-file 'progress' (0-100 for THAT file) alongside
    // the aggregate. Honoring it is what made the bar reset to 0 on each new file.
    expect(
      readDownloadProgress({ status: 'progress', file: 'tokenizer.json', progress: 100, loaded: 5, total: 5 }),
    ).toBeNull();
  });

  it('reports the aggregate progress_total percentage, rounded', () => {
    expect(
      readDownloadProgress({ status: 'progress_total', progress: 42.7, loaded: 10, total: 23 }),
    ).toBe(43);
  });

  it('reports 0 at the start of the aggregate download', () => {
    expect(readDownloadProgress({ status: 'progress_total', progress: 0, loaded: 0, total: 23 })).toBe(0);
  });

  it('clamps out-of-range aggregate values into 0..100', () => {
    expect(readDownloadProgress({ status: 'progress_total', progress: 150 })).toBe(100);
    expect(readDownloadProgress({ status: 'progress_total', progress: -3 })).toBe(0);
  });

  it('ignores lifecycle events that carry no aggregate', () => {
    for (const status of ['initiate', 'download', 'done', 'ready']) {
      expect(readDownloadProgress({ status })).toBeNull();
    }
  });

  it('ignores a progress_total without a numeric progress', () => {
    expect(readDownloadProgress({ status: 'progress_total' })).toBeNull();
  });
});
