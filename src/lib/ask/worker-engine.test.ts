import { describe, it, expect } from 'vitest';
import {
  createWorkerAskEngine,
  type WorkerHandle,
  type MainToWorker,
  type WorkerToMain,
} from './worker-engine';

type MessageListener = (event: MessageEvent<WorkerToMain>) => void;

/** Controllable fake of the dedicated worker: records posts, replays replies. */
function makeFakeWorker() {
  let onMessage: MessageListener | null = null;
  let onError: (() => void) | null = null;
  const sent: MainToWorker[] = [];
  let terminated = false;

  const handle: WorkerHandle = {
    postMessage: (message) => sent.push(message),
    addEventListener: ((type: 'message' | 'error', listener: MessageListener | (() => void)) => {
      if (type === 'message') onMessage = listener as MessageListener;
      else onError = listener as () => void;
    }) as WorkerHandle['addEventListener'],
    terminate: () => {
      terminated = true;
    },
  };

  return {
    handle,
    sent,
    reply: (message: WorkerToMain) => onMessage?.({ data: message } as MessageEvent<WorkerToMain>),
    crash: () => onError?.(),
    isTerminated: () => terminated,
  };
}

describe('createWorkerAskEngine', () => {
  it('resolves init when the worker reports ready, forwarding progress', async () => {
    const fake = makeFakeWorker();
    const engine = createWorkerAskEngine(() => fake.handle);
    const seen: number[] = [];
    const initDone = engine.init((pct) => seen.push(pct));

    expect(fake.sent).toEqual([{ type: 'init' }]);
    fake.reply({ type: 'progress', pct: 40 });
    fake.reply({ type: 'progress', pct: 100 });
    fake.reply({ type: 'ready' });

    await expect(initDone).resolves.toBeUndefined();
    expect(seen).toEqual([40, 100]);
  });

  it('rejects init when the worker reports an init error', async () => {
    const fake = makeFakeWorker();
    const engine = createWorkerAskEngine(() => fake.handle);
    const initDone = engine.init();
    fake.reply({ type: 'init-error', message: 'no webgpu' });
    await expect(initDone).rejects.toThrow('no webgpu');
  });

  it('routes answers back to the matching request by id', async () => {
    const fake = makeFakeWorker();
    const engine = createWorkerAskEngine(() => fake.handle);
    const a = engine.answer('about you');
    const b = engine.answer('your travels');

    // Two questions in flight, each tagged with a distinct id.
    expect(fake.sent).toEqual([
      { type: 'answer', id: 1, question: 'about you' },
      { type: 'answer', id: 2, question: 'your travels' },
    ]);

    // Reply out of order (id 2 first) to prove results route by id, not arrival.
    fake.reply({ type: 'answer-result', id: 2, result: { kind: 'command', command: 'travel' } });
    fake.reply({ type: 'answer-result', id: 1, result: { kind: 'answer', text: 'Hi.' } });

    await expect(a).resolves.toEqual({ kind: 'answer', text: 'Hi.' });
    await expect(b).resolves.toEqual({ kind: 'command', command: 'travel' });
  });

  it('rejects a single answer when the worker reports an answer error', async () => {
    const fake = makeFakeWorker();
    const engine = createWorkerAskEngine(() => fake.handle);
    const a = engine.answer('boom');
    fake.reply({ type: 'answer-error', id: 1, message: 'embed failed' });
    await expect(a).rejects.toThrow('embed failed');
  });

  it('dispose terminates the worker and rejects in-flight work', async () => {
    const fake = makeFakeWorker();
    const engine = createWorkerAskEngine(() => fake.handle);
    const initDone = engine.init();
    const a = engine.answer('hi');

    engine.dispose?.();

    expect(fake.isTerminated()).toBe(true);
    await expect(initDone).rejects.toThrow(/disposed/);
    await expect(a).rejects.toThrow(/disposed/);
  });

  it('a worker crash rejects in-flight work', async () => {
    const fake = makeFakeWorker();
    const engine = createWorkerAskEngine(() => fake.handle);
    const a = engine.answer('hi');
    fake.crash();
    await expect(a).rejects.toThrow(/crashed/);
  });
});
