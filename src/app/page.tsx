import Link from 'next/link';

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 py-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='space-y-4'>
        <h1 className='text-xl'>Welcome! I&apos;m Rodrigo S. Calderon.</h1>
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
            href={`mailto:carry_overage.8k@icloud.com?subject=Resume Request | Looking for <Enter position>&body=Hi Rodrigo, I hope you're doing well! %0D%0A %0D%0A Please share your most updated resume. I'm looking for <role you're looking for>. %0D%0A %0D%0A All the best, %0D%0A %0D%0A <Your name here>`}
            target='_blank'
            className='hover:underline hover:underline-offset-4'
          >
            Resume
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
