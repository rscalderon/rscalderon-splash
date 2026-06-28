import type { AskEngine, AskResult } from './engine';

/** Messages the main thread sends into the worker. */
export type MainToWorker =
  | { type: 'init' }
  | { type: 'answer'; id: number; question: string };

/** Messages the worker sends back to the main thread. */
export type WorkerToMain =
  | { type: 'progress'; pct: number }
  | { type: 'ready' }
  | { type: 'init-error'; message: string }
  | { type: 'answer-result'; id: number; result: AskResult }
  | { type: 'answer-error'; id: number; message: string };

/**
 * The slice of the DOM `Worker` API this proxy talks to. Narrowing to it (rather
 * than the full `Worker`) lets tests supply a lightweight fake, and documents
 * exactly how the two threads communicate. The real worker is wired up in
 * `spawn.ts`.
 */
export interface WorkerHandle {
  postMessage(message: MainToWorker): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerToMain>) => void): void;
  addEventListener(type: 'error', listener: () => void): void;
  terminate(): void;
}

/**
 * Main-thread `AskEngine` that runs the real engine inside a Web Worker.
 *
 * It implements the exact same interface as the in-process `createAskEngine`, so
 * the terminal is agnostic to where the work happens — the difference is that
 * init's corpus embedding and every per-question embedding run off the main
 * thread, keeping typing responsive while the model loads.
 *
 * `spawn` is injected so the transport can be unit-tested against a fake worker;
 * production wiring lives in `spawn.ts`.
 */
export function createWorkerAskEngine(spawn: () => WorkerHandle): AskEngine {
  const worker = spawn();
  let nextId = 1;
  const pending = new Map<number, { resolve: (r: AskResult) => void; reject: (e: Error) => void }>();
  let onProgress: ((pct: number) => void) | undefined;
  let settleInit: { resolve: () => void; reject: (e: Error) => void } | null = null;

  // Reject the in-flight init and every queued question — used when the worker
  // crashes or is disposed, so no caller is left awaiting a promise forever.
  const failAll = (message: string) => {
    const err = new Error(message);
    settleInit?.reject(err);
    settleInit = null;
    for (const { reject } of pending.values()) reject(err);
    pending.clear();
  };

  worker.addEventListener('message', (event) => {
    const msg = event.data;
    switch (msg.type) {
      case 'progress':
        onProgress?.(msg.pct);
        break;
      case 'ready':
        settleInit?.resolve();
        settleInit = null;
        break;
      case 'init-error':
        settleInit?.reject(new Error(msg.message));
        settleInit = null;
        break;
      case 'answer-result': {
        const p = pending.get(msg.id);
        if (p) {
          pending.delete(msg.id);
          p.resolve(msg.result);
        }
        break;
      }
      case 'answer-error': {
        const p = pending.get(msg.id);
        if (p) {
          pending.delete(msg.id);
          p.reject(new Error(msg.message));
        }
        break;
      }
    }
  });

  worker.addEventListener('error', () => failAll('ask worker crashed'));

  return {
    init(progress) {
      onProgress = progress;
      return new Promise<void>((resolve, reject) => {
        settleInit = { resolve, reject };
        worker.postMessage({ type: 'init' });
      });
    },
    answer(question) {
      const id = nextId++;
      return new Promise<AskResult>((resolve, reject) => {
        pending.set(id, { resolve, reject });
        worker.postMessage({ type: 'answer', id, question });
      });
    },
    dispose() {
      worker.terminate();
      failAll('ask worker disposed');
    },
  };
}
