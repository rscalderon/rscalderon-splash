import { describe, it, expect } from 'vitest';
import { cosineSimilarity, rankBest, matchEntry } from './match';

describe('cosineSimilarity', () => {
  it('is 1 for identical direction', () => {
    expect(cosineSimilarity([1, 0, 0], [2, 0, 0])).toBeCloseTo(1);
  });
  it('is 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
  it('is -1 for opposite vectors', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });
  it('is 0 when either vector is all zeros', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});

describe('rankBest', () => {
  const index = [
    { entryId: 'a', vec: [1, 0, 0] },
    { entryId: 'b', vec: [0, 1, 0] },
  ];
  it('returns the highest-scoring entry', () => {
    expect(rankBest([0.9, 0.1, 0], index)?.entryId).toBe('a');
  });
  it('returns null for an empty index', () => {
    expect(rankBest([1, 0, 0], [])).toBeNull();
  });
});

describe('matchEntry', () => {
  const index = [{ entryId: 'a', vec: [1, 0, 0] }];
  it('returns the entry id above threshold', () => {
    expect(matchEntry([1, 0, 0], index, 0.45)).toBe('a');
  });
  it('returns null below threshold', () => {
    expect(matchEntry([0, 1, 0], index, 0.45)).toBeNull();
  });
  it('returns null for an empty index', () => {
    expect(matchEntry([1, 0, 0], [], 0.45)).toBeNull();
  });
});
