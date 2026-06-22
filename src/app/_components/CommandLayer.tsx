'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';

// Lazy: the Terminal chunk is only fetched on first open (and cached thereafter).
const Terminal = dynamic(() => import('./Terminal'), { ssr: false });

export default function CommandLayer() {
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState('');

  const openTerminal = useCallback((withSeed = '') => {
    setSeed(withSeed);
    setOpen(true);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // ⌘K / Ctrl+K toggles
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSeed('');
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      // type-to-open: a single printable char, no modifiers, while closed —
      // seed that char so the first keystroke isn't lost.
      if (
        !open &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        e.key.length === 1 &&
        /\S/.test(e.key)
      ) {
        openTerminal(e.key);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, openTerminal]);

  return (
    <>
      <button
        onClick={() => openTerminal()}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 font-mono text-xs text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
        aria-label="Open command terminal"
      >
        <span className="rounded-md border border-[var(--line)] px-1.5 py-0.5 text-[11px]">⌘ K</span>
        <span>
          or just start typing<span className="animate-blink">_</span>
        </span>
      </button>

      {open && <Terminal seed={seed} onClose={() => setOpen(false)} />}
    </>
  );
}
