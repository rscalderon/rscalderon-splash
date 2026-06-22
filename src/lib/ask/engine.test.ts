import { describe, it, expect } from 'vitest';
import { createAskEngine, type Embedder } from './engine';
import type { Entry } from './knowledge';

const VECS: Record<string, number[]> = {
  cat: [1, 0, 0, 0],
  dog: [0, 1, 0, 0],
};

function fakeEmbedder(): Embedder {
  return async (text: string) => {
    const t = text.toLowerCase();
    const key = Object.keys(VECS).find((k) => t.includes(k));
    return new Float32Array(key ? VECS[key] : [0, 0, 0, 1]); // unknown → orthogonal to all topics
  };
}

const entries: Entry[] = [
  { id: 'cat', questions: ['tell me about the cat'], answer: 'Meow.' },
  { id: 'dog', questions: ['tell me about the dog'], answer: 'Woof.' },
];

function makeEngine() {
  return createAskEngine({ entries, threshold: 0.45, loadEmbedder: async () => fakeEmbedder() });
}

describe('ask engine', () => {
  it('returns the curated answer for a matching question', async () => {
    const engine = makeEngine();
    await engine.init();
    expect(await engine.answer('what about the cat?')).toEqual({ kind: 'answer', text: 'Meow.' });
    expect(await engine.answer('the dog please')).toEqual({ kind: 'answer', text: 'Woof.' });
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
