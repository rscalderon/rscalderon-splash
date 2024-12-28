import Link from 'next/link';

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center'>
        <h1 className='text-xl'>Contact me</h1>
        <ol className='list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-sans)]'>
          <li className='flex justify-between space-x-6'>
            <p>First Name:</p> <p>Rodrigo</p>
          </li>
          <li className='flex justify-between space-x-6'>
            <p>Last Names:</p> <p>Samour Calderon</p>
          </li>
          <li className='flex justify-between space-x-6'>
            <p>Phone:</p> <p>+1-786-519-4074</p>
          </li>
          <li className='flex justify-between space-x-6'>
            <p>Email:</p> <p>carry_overage.8k@icloud.com</p>
          </li>
          <li className='flex justify-between space-x-6'>
            <p>GitHub:</p> <p>@rscalderon</p>
          </li>
          <li className='flex justify-between space-x-6'>
            <p>LinkedIn:</p> <p>rodrigosamourcalderon</p>
          </li>
        </ol>
        <button className='p-4 rounded-2xl self-center'>
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
