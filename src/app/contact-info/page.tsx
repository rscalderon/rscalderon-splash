import Link from 'next/link';

// Force static generation - pages are pre-rendered at build time
export const dynamic = 'force-static';

const contactInfo = [
  { label: 'First Name:', value: 'Rodrigo' },
  { label: 'Last Names:', value: 'Samour Calderon' },
  { label: 'Phone:', value: '+1-786-519-4074' },
  { label: 'Email:', value: 'carry_overage.8k@icloud.com' },
  { label: 'GitHub:', value: '@rscalderon' },
  { label: 'LinkedIn:', value: 'rodrigosamourcalderon' },
];

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center'>
        <h1 className='text-xl'>Contact me</h1>
        <ol className='list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-sans)]'>
          {contactInfo.map(({ label, value }) => (
            <li key={label} className='flex justify-between space-x-6'>
              <p>{label}</p> <p>{value}</p>
            </li>
          ))}
        </ol>
        <button type='button' className='p-4 rounded-2xl self-center'>
          <p className=''>Download contact (coming soon!) </p>
        </button>
        <Link
          className='flex items-center gap-2 hover:underline hover:underline-offset-4'
          href='/'
        >
          Go to main page
        </Link>
      </main>
    </div>
  );
}
