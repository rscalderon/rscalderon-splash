'use client';

import dynamic from 'next/dynamic';

// Lazy + client-only: the three.js / R3F chunk is fetched only when this route
// mounts (i.e. when someone actually opens /game), never on the homepage.
const PlanetScene = dynamic(() => import('./PlanetScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#07070b] font-mono text-sm text-zinc-500">
      loading the planet<span className="animate-pulse">…</span>
    </div>
  ),
});

export default function GameClient() {
  return <PlanetScene />;
}
