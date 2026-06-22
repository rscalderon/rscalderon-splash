import { knowledge, MATCH_THRESHOLD, type Entry } from './knowledge';
import { matchEntry, type IndexItem } from './match';

const MODEL = 'Xenova/all-MiniLM-L6-v2';

export type AskResult = { kind: 'answer'; text: string } | { kind: 'nomatch' };

/** Turns text into a normalized embedding vector. */
export type Embedder = (text: string) => Promise<Float32Array>;

export interface AskEngine {
  /** Load the model and embed the knowledge base. `onProgress` reports 0–100 during model download. */
  init(onProgress?: (pct: number) => void): Promise<void>;
  /** Embed the question and return the closest curated answer, or a no-match. */
  answer(question: string): Promise<AskResult>;
}

export type CreateOpts = {
  entries?: Entry[];
  threshold?: number;
  /** Override for tests; defaults to the real Transformers.js embedder (lazy-loaded). */
  loadEmbedder?: (onProgress?: (pct: number) => void) => Promise<Embedder>;
};

/** Real embedder: dynamically imports Transformers.js so it stays out of the landing bundle. */
async function defaultLoadEmbedder(onProgress?: (pct: number) => void): Promise<Embedder> {
  const { pipeline, env } = await import('@huggingface/transformers');
  // Skip the local-file probe (which 404s in the browser) and go straight to the HF CDN.
  env.allowLocalModels = false;
  const extractor = await pipeline('feature-extraction', MODEL, {
    progress_callback: (p) => {
      const pct = (p as { progress?: number }).progress;
      if (onProgress && typeof pct === 'number') onProgress(Math.round(pct));
    },
  });
  return async (text: string) => {
    const out = await extractor(text, { pooling: 'mean', normalize: true });
    return out.data as Float32Array;
  };
}

export function createAskEngine(opts: CreateOpts = {}): AskEngine {
  const entries = opts.entries ?? knowledge;
  const threshold = opts.threshold ?? MATCH_THRESHOLD;
  const loadEmbedder = opts.loadEmbedder ?? defaultLoadEmbedder;
  const byId = new Map(entries.map((e) => [e.id, e]));
  const index: IndexItem[] = [];
  let embed: Embedder | null = null;

  return {
    async init(onProgress) {
      embed = await loadEmbedder(onProgress);
      for (const entry of entries) {
        for (const q of entry.questions) {
          index.push({ entryId: entry.id, vec: await embed(q) });
        }
      }
    },
    async answer(question) {
      const text = question.trim();
      if (!text || !embed) return { kind: 'nomatch' };
      const id = matchEntry(await embed(text), index, threshold);
      const entry = id ? byId.get(id) : undefined;
      return entry ? { kind: 'answer', text: entry.answer } : { kind: 'nomatch' };
    },
  };
}
