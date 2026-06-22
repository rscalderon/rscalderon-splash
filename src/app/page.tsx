import CommandLayer from './_components/CommandLayer';
import { links } from '@/lib/links';

export const dynamic = 'force-static';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-[18px] p-8 text-center">
      <p className="rsc-rise text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]" style={{ animationDelay: '0.05s' }}>
        Miami
      </p>
      <h1
        className="rsc-rise text-[clamp(30px,5vw,46px)] font-semibold tracking-[-0.038em] leading-[1.02]"
        style={{ animationDelay: '0.14s' }}
      >
        Rodrigo S. Calderon
      </h1>
      <p className="rsc-rise max-w-[380px] text-base text-[var(--muted)]" style={{ animationDelay: '0.27s' }}>
        Full-Stack AI Engineer
      </p>
      <div className="rsc-fade h-px w-9 bg-[var(--line)]" style={{ animationDelay: '0.4s' }} />
      <nav className="rsc-rise flex gap-[22px]" style={{ animationDelay: '0.5s' }}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rsc-underline relative pb-[3px] text-[15px] text-[var(--fg)]"
          >
            {l.label}
          </a>
        ))}
      </nav>

      <CommandLayer />
    </main>
  );
}
