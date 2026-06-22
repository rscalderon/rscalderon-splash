'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { links } from '@/lib/links';
import {
  REGISTRY,
  COMMAND_META,
  runCommand,
  suggestCompletion,
  type CommandContext,
  type Line,
} from '@/lib/commands';
import { applyTheme, persistTheme, currentTheme } from '@/lib/theme';
import type { AskEngine } from '@/lib/ask/engine';

type Mode = 'command' | 'ask';
type HistoryEntry =
  | { kind: 'input'; text: string; prompt?: Mode }
  | { kind: 'output'; line: Line };

const COMMAND_NAMES = COMMAND_META.map((c) => c.name);

const toneClass: Record<string, string> = {
  normal: 'text-zinc-200',
  dim: 'text-zinc-500',
  accent: 'text-amber-300',
  soon: 'text-purple-300',
};

const ASK_READY = "ready — ask me anything about Rodrigo. Type 'exit' to leave.";
const ASK_NOMATCH =
  "I don't have a curated answer for that — try asking about my work, background, or how to reach me (or run 'help').";
const ASK_ERROR =
  "Couldn't load the model (network or unsupported browser). Try 'about' or 'links' instead.";

/** Colored prompt label, shared by the live input and echoed history lines. */
function PromptInner({ mode }: { mode: Mode }) {
  if (mode === 'ask') {
    return (
      <>
        <span className="text-amber-300">ask</span>
        <span className="text-zinc-500"> › </span>
      </>
    );
  }
  return (
    <>
      <span className="text-emerald-400">rsc</span>
      <span className="text-zinc-500">@</span>
      <span className="text-sky-400">~</span>
      <span className="text-zinc-500">$ </span>
    </>
  );
}

export default function Terminal({ onClose, seed = '' }: { onClose: () => void; seed?: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { kind: 'output', line: [{ text: "Type 'help' to see what it can do.", tone: 'dim' }] },
  ]);
  const [value, setValue] = useState(seed);
  const [mode, setMode] = useState<Mode>('command');
  const [askStatus, setAskStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadPct, setLoadPct] = useState(0);
  const suggestion = useMemo(
    () => (mode === 'command' ? suggestCompletion(value, COMMAND_NAMES) : null),
    [value, mode],
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AskEngine | null>(null);
  // Questions typed while the model is still loading — answered, in order, once ready.
  const pendingRef = useRef<string[]>([]);

  const pushOutput = useCallback((...lines: Line[]) => {
    setHistory((h) => [...h, ...lines.map((line) => ({ kind: 'output' as const, line }))]);
  }, []);

  // Prefetch the model the moment the terminal opens — but never before (this
  // component only mounts when the terminal is opened). By the time the user
  // types `ask` the model is usually ready; if not, ask-mode shows the loading
  // bar and keeps whatever they type.
  useEffect(() => {
    let cancelled = false;
    setAskStatus('loading');
    setLoadPct(0);
    (async () => {
      try {
        const { createAskEngine } = await import('@/lib/ask/engine');
        const engine = createAskEngine();
        await engine.init((pct) => {
          if (!cancelled) setLoadPct(pct);
        });
        if (cancelled) return;
        engineRef.current = engine;
        setAskStatus('ready');
      } catch {
        if (!cancelled) setAskStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enterAsk = useCallback(() => {
    if (askStatus === 'error') {
      pushOutput([{ text: ASK_ERROR, tone: 'dim' }]);
      return;
    }
    setMode('ask');
  }, [askStatus, pushOutput]);

  const ctx: CommandContext = useMemo(
    () => ({
      links,
      commands: COMMAND_META,
      getTheme: () => currentTheme(),
      setTheme: (t) => {
        applyTheme(t);
        persistTheme(t);
      },
      clear: () => setHistory([]),
      enterAsk: () => enterAsk(),
      open: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
    }),
    [enterAsk],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [history, askStatus, loadPct]);

  const runAsk = useCallback(
    async (question: string) => {
      const engine = engineRef.current;
      if (!engine) return;
      const res = await engine.answer(question);
      pushOutput(res.kind === 'answer' ? [{ text: res.text }] : [{ text: ASK_NOMATCH, tone: 'dim' }]);
    },
    [pushOutput],
  );

  // When the engine settles while we're in ask-mode: show the ready hint, flush
  // any questions kept during loading (in order), or surface a load error.
  useEffect(() => {
    if (mode !== 'ask') return;
    if (askStatus === 'error') {
      pendingRef.current = [];
      setMode('command');
      pushOutput([{ text: ASK_ERROR, tone: 'dim' }]);
      return;
    }
    if (askStatus !== 'ready') return;
    const queued = pendingRef.current;
    pendingRef.current = [];
    if (queued.length === 0) {
      pushOutput([{ text: ASK_READY, tone: 'dim' }]);
      return;
    }
    let chain = Promise.resolve();
    for (const q of queued) chain = chain.then(() => runAsk(q));
  }, [mode, askStatus, runAsk, pushOutput]);

  const submit = useCallback(() => {
    const raw = value;
    setValue('');

    if (mode === 'ask') {
      const trimmed = raw.trim();
      if (!trimmed) return;
      const lower = trimmed.toLowerCase();
      if (lower === 'exit' || lower === 'quit') {
        pendingRef.current = [];
        setHistory((h) => [...h, { kind: 'input', text: raw, prompt: 'ask' }]);
        setMode('command');
        return;
      }
      if (lower === 'clear') {
        pendingRef.current = [];
        setHistory([]);
        return;
      }
      // Always echo the question so it's visible immediately and never lost.
      setHistory((h) => [...h, { kind: 'input', text: raw, prompt: 'ask' }]);
      if (askStatus === 'ready') {
        void runAsk(trimmed);
      } else {
        pendingRef.current.push(trimmed); // model still loading — keep it for when it's ready
      }
      return;
    }

    setHistory((h) => [...h, { kind: 'input', text: raw }]);
    const out = runCommand(REGISTRY, raw, ctx);
    if (out.length) {
      setHistory((h) => [...h, ...out.map((line) => ({ kind: 'output' as const, line }))]);
    }
  }, [value, mode, askStatus, ctx, runAsk]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[11vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command terminal"
        className="flex h-[min(440px,70vh)] w-[min(680px,92vw)] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#0b0b0e] text-left shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-1.5 font-mono text-xs text-zinc-500">rsc — terminal</span>
          <button
            onClick={onClose}
            className="ml-auto rounded border border-zinc-800 px-1.5 font-mono text-[11px] text-zinc-500 hover:text-zinc-300"
            aria-label="Close terminal"
          >
            esc
          </button>
        </div>

        <div
          ref={bodyRef}
          className="flex-1 cursor-text overflow-auto px-4 py-3.5 font-mono text-[13.5px] leading-relaxed text-zinc-300"
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((entry, i) =>
            entry.kind === 'input' ? (
              <div key={i} className="whitespace-pre-wrap break-words">
                <PromptInner mode={entry.prompt ?? 'command'} />
                {entry.text}
              </div>
            ) : (
              <div key={i} className="whitespace-pre-wrap break-words">
                {entry.line.map((seg, j) =>
                  seg.href ? (
                    <a
                      key={j}
                      href={seg.href}
                      target={seg.href.startsWith('/') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="text-sky-400 underline underline-offset-2"
                    >
                      {seg.text}
                    </a>
                  ) : (
                    <span key={j} className={toneClass[seg.tone ?? 'normal']}>
                      {seg.text}
                    </span>
                  ),
                )}
              </div>
            ),
          )}

          {mode === 'ask' && askStatus === 'loading' && (
            <div className="whitespace-pre-wrap break-words text-zinc-500">
              loading model… {loadPct}%
            </div>
          )}

          <div className="flex items-baseline">
            <span className="shrink-0 whitespace-pre">
              <PromptInner mode={mode} />
            </span>
            <div className="relative flex-1">
              {suggestion && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre font-mono text-[13.5px] leading-relaxed"
                >
                  <span className="text-transparent">{value}</span>
                  <span className="text-zinc-600">{suggestion}</span>
                </div>
              )}
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submit();
                    return;
                  }
                  if (e.key === 'Escape' && mode === 'ask') {
                    // Leave ask-mode instead of closing the whole terminal.
                    e.preventDefault();
                    e.nativeEvent.stopImmediatePropagation();
                    pendingRef.current = [];
                    setMode('command');
                    return;
                  }
                  if (!suggestion) return;
                  // Accept the ghost completion: Tab anywhere, or ArrowRight at line end.
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    setValue(value + suggestion);
                  } else if (e.key === 'ArrowRight') {
                    const el = e.currentTarget;
                    if (el.selectionStart === value.length && el.selectionEnd === value.length) {
                      e.preventDefault();
                      setValue(value + suggestion);
                    }
                  }
                }}
                className="relative w-full border-none bg-transparent p-0 font-mono text-[13.5px] leading-relaxed text-zinc-200 caret-emerald-400 outline-none"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-label="Terminal input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
