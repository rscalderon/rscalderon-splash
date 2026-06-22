import type { Metadata } from 'next';
import Link from 'next/link';
import GlobeExplorer from './GlobeExplorer';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: "Where I've traveled — Rodrigo S. Calderon",
  description: "An interactive globe of the places I've traveled to, and where I'm based.",
};

export default function GlobePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-8">
      <GlobeExplorer />
      <Link
        href="/"
        className="absolute bottom-8 flex justify-center gap-2 text-xs text-[var(--muted)] hover:underline hover:underline-offset-4"
      >
        Go to main page
      </Link>
    </div>
  );
}
