'use client';

import Link from 'next/link';

// Force static generation - pages are pre-rendered at build time
export const dynamic = 'force-static';

const contactInfo = [
  { label: 'First Name:', value: 'Rodrigo' },
  { label: 'Last Names:', value: 'Samour Calderon' },
  { label: 'Phone:', value: '+1-510-990-5400' },
  { label: 'Email:', value: 'samourcalderon@gmail.com' },
  { label: 'GitHub:', value: '@rscalderon' },
  { label: 'LinkedIn:', value: 'rodrigosamourcalderon' },
];

function downloadContactCard() {
  // Generate vCard (VCF) format
  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:Rodrigo Samour Calderon`,
    `N:Samour Calderon;Rodrigo;;;`,
    `TEL;TYPE=CELL:+1-510-990-5400`,
    `EMAIL:samourcalderon@gmail.com`,
    `URL:https://github.com/rscalderon`,
    `URL:https://www.linkedin.com/in/rodrigosamourcalderon`,
    'END:VCARD',
  ].join('\n');

  // Create a blob with the vCard content
  const blob = new Blob([vCard], { type: 'text/vcard' });

  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Rodrigo_Samour_Calderon.vcf';
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-8 row-start-2 items-center'>
        <h1 className='text-2xl'>Contact info</h1>
        <ol className='list-inside text-center sm:text-left font-[family-name:var(--font-geist-sans)]'>
          {contactInfo.map(({ label, value }) => (
            <li key={label} className='flex justify-between space-x-6'>
              <p>{label}</p> <p>{value}</p>
            </li>
          ))}
        </ol>
        <button
          type='button'
          className='p-4 rounded-2xl self-center animate-pulse'
          onClick={downloadContactCard}
        >
          <p className=''>Download contact</p>
        </button>
      </main>
      <Link
        className='flex row-start-3 text-xs items-center gap-2 hover:underline hover:underline-offset-4'
        href='/'
      >
        Go to main page
      </Link>
    </div>
  );
}
