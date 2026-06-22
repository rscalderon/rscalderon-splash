/** Cosine similarity between two equal-length numeric vectors. Returns 0 if either is all-zero. */
export function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export type IndexItem = { entryId: string; vec: ArrayLike<number> };
export type Ranked = { entryId: string; score: number };

/** Highest-similarity item for a query vector, or null if the index is empty. First wins on ties. */
export function rankBest(query: ArrayLike<number>, index: IndexItem[]): Ranked | null {
  let best: Ranked | null = null;
  for (const item of index) {
    const score = cosineSimilarity(query, item.vec);
    if (best === null || score > best.score) best = { entryId: item.entryId, score };
  }
  return best;
}

/** Entry id of the best match if it clears the threshold, else null (→ no-match / honest redirect). */
export function matchEntry(
  query: ArrayLike<number>,
  index: IndexItem[],
  threshold: number,
): string | null {
  const best = rankBest(query, index);
  if (best === null || best.score < threshold) return null;
  return best.entryId;
}
