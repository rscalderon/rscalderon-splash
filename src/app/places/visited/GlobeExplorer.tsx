'use client';

import { useEffect, useState } from 'react';
import Globe, { type GlobeMarker, type GlobeArc } from './Globe';
import { PLACES } from '@/constants/travel';
import { getTally, focusAngles, buildArcs, type FocusAngles } from '@/lib/travel';
import { prefersReducedMotion } from '@/lib/motion';

const TALLY = getTally(PLACES);

// Warm amber so home (Miami) reads distinct from the destination markers,
// which fall back to the global markerColor. Starting value — tweak freely.
const HOME_COLOR: [number, number, number] = [1.0, 0.55, 0.15];
// The selected route pops against the faint global arcColor. Starting value.
const SELECTED_ARC_COLOR: [number, number, number] = [1.0, 0.6, 0.2];

const MARKERS: GlobeMarker[] = PLACES.map((p) => ({
  location: [p.lat, p.lng],
  size: p.home ? 0.1 : 0.045,
  ...(p.home ? { color: HOME_COLOR } : {}),
}));

// Index of each arc in BASE_ARCS by the PLACES index it terminates at, so a
// selection can emphasize exactly that route. buildArcs skips home, so the
// arc list is offset from PLACES — this map bridges the two.
const BASE_ARCS: GlobeArc[] = buildArcs(PLACES);
const ARC_INDEX_BY_PLACE: Record<number, number> = {};
{
  let a = 0;
  PLACES.forEach((p, i) => {
    if (!p.home) ARC_INDEX_BY_PLACE[i] = a++;
  });
}

function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export default function GlobeExplorer() {
  const [selected, setSelected] = useState<number | null>(null);
  const focus: FocusAngles | null = selected === null ? null : focusAngles(PLACES[selected]);

  // Every arc stays faint (global arcColor) except the selected non-home route,
  // which gets an emphasized per-arc color. cobe has no per-arc width/height, so
  // color is the only emphasis lever.
  const selectedArc = selected === null ? undefined : ARC_INDEX_BY_PLACE[selected];
  const arcs: GlobeArc[] =
    selectedArc === undefined
      ? BASE_ARCS
      : BASE_ARCS.map((arc, i) => (i === selectedArc ? { ...arc, color: SELECTED_ARC_COLOR } : arc));

  const places = useCountUp(TALLY.places);
  const countries = useCountUp(TALLY.countries);
  const continents = useCountUp(TALLY.continents);

  return (
    <main className="flex w-full max-w-[960px] flex-col items-center gap-10">
      <header className="flex flex-col items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">Where I&apos;ve traveled</h1>

        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">I&apos;ve been to</p>

        <dl className="flex gap-10 text-center" aria-label="travel summary">
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Places</dt>
            <dd className="text-2xl font-semibold tabular-nums">{places}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Countries</dt>
            <dd className="text-2xl font-semibold tabular-nums">{countries}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Continents</dt>
            <dd className="text-2xl font-semibold tabular-nums">{continents}</dd>
          </div>
        </dl>
      </header>

      <div className="flex w-full flex-col items-center gap-10 md:flex-row md:items-center md:justify-center md:gap-14">
        <Globe markers={MARKERS} arcs={arcs} focus={focus} />

        <ul className="grid w-full max-w-[440px] grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3 md:max-w-[280px] md:grid-cols-1">
          {PLACES.map((p, i) => (
            <li key={`${p.city}-${p.country}`}>
              <button
                type="button"
                aria-pressed={selected === i}
                onClick={() => setSelected((prev) => (prev === i ? null : i))}
                className={`w-full text-left text-sm transition-colors ${
                  selected === i ? 'text-[var(--fg)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {p.city}
                <span className="sr-only">, {p.country}</span>
                {p.home && (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">home</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
