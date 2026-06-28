/**
 * Web Worker host for the ask engine.
 *
 * Running the embedder here keeps MiniLM's model download, the corpus
 * embeddings built during init, and every per-question embedding OFF the main
 * thread — so typing in the terminal stays responsive while the model loads.
 * This file is one end of the message protocol in `worker-engine.ts`; the
 * main-thread proxy `createWorkerAskEngine` is the other.
 */
import { createAskEngine } from './engine';
import type { MainToWorker, WorkerToMain } from './worker-engine';

const engine = createAskEngine();

// In a Worker, `self` is a DedicatedWorkerGlobalScope. The project's tsconfig
// loads only the `dom` lib (not `webworker`), under which `self.postMessage` is
// typed as Window's — which demands a targetOrigin. Cast to the one method we use.
const post = (message: WorkerToMain): void =>
  (self as unknown as { postMessage(message: WorkerToMain): void }).postMessage(message);

async function handle(msg: MainToWorker): Promise<void> {
  if (msg.type === 'init') {
    try {
      await engine.init((pct) => post({ type: 'progress', pct }));
      post({ type: 'ready' });
    } catch (err) {
      post({ type: 'init-error', message: messageOf(err) });
    }
  } else {
    try {
      const result = await engine.answer(msg.question);
      post({ type: 'answer-result', id: msg.id, result });
    } catch (err) {
      post({ type: 'answer-error', id: msg.id, message: messageOf(err) });
    }
  }
}

self.addEventListener('message', (event: MessageEvent<MainToWorker>) => {
  void handle(event.data);
});

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
