import Link from 'next/link';

// Force static generation - pages are pre-rendered at build time
export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 py-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='space-y-4'>
        <h1 className='text-xl font-semibold'>Welcome! I&apos;m Rodrigo S. Calderon</h1>
        <section className='flex space-x-1 justify-center w-full'>
          <Link
            href='https://www.linkedin.com/in/rodrigosamourcalderon/'
            target='_blank'
            className='hover:underline hover:underline-offset-4'
          >
            LinkedIn
          </Link>
          <p>{'|'}</p>
          <Link
            href='https://www.github.com/rscalderon/'
            target='_blank'
            className='hover:underline hover:underline-offset-4'
          >
            GitHub
          </Link>
          <p>{'|'}</p>
          <Link
            href='https://medium.com/@samourcalderon'
            target='_blank'
            className='hover:underline hover:underline-offset-4'
          >
            Medium
          </Link>
        </section>
      </main>
    </div>
  );
}
