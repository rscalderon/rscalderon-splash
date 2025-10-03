import SocialLinksSection from './_components/SocialLinksSection';
import Marquee from './_components/Marquee';

export default function Home() {
  return (
    <main className='grid grid-rows-[100px_1fr_100px] items-center justify-items-center min-h-screen p-8 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <section className='space-y-2'>
        <h1 className='text-xl text-center'>
          Welcome! I&apos;m Rodrigo S. Calderon.
        </h1>
        <SocialLinksSection />
        <p className='text-center animate-pulse'>
          This is an active construction (web)site 🚧
        </p>
      </section>
      <section>
        <Marquee variant='work' />
        <Marquee variant='study' />
      </section>
      <footer className='flex gap-6 flex-wrap items-center justify-center'>
        <p className='flex gap-1'>
          {/* Built with
          <a
            className='flex items-center hover:underline hover:underline-offset-4'
            href='https://nextjs.org'
            target='_blank'
            rel='noopener noreferrer'
          >
            Next.js
          </a>
          | */}
          <a
            className='flex items-center hover:underline hover:underline-offset-4'
            href='https://github.com/rscalderon/rscalderon-splash'
            target='_blank'
            rel='noopener noreferrer'
          >
            Check out my code
          </a>
          or
          <a
            className='flex items-center hover:underline hover:underline-offset-4'
            href='https://monte-carlo-simulator-seven.vercel.app/'
            target='_blank'
            rel='noopener noreferrer'
          >
            some toy projects
          </a>
        </p>
      </footer>
    </main>
  );
}
