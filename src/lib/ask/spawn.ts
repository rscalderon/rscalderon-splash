import type { WorkerHandle } from './worker-engine';

/**
 * Spawn the ask engine's Web Worker.
 *
 * The `new Worker(new URL(...))` form is what lets the bundler (Turbopack in
 * dev, webpack in build) discover `ask.worker.ts`, give it its own chunk, and
 * bundle Transformers.js into THAT chunk rather than the main one. Kept in its
 * own tiny module so the testable transport in `worker-engine.ts` never trips
 * the bundler's worker transform.
 */
export function spawnAskWorker(): WorkerHandle {
  return new Worker(new URL('./ask.worker.ts', import.meta.url), { type: 'module' });
}
