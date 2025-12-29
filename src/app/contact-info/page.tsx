'use client';

import Link from 'next/link';

// Force static generation - pages are pre-rendered at build time
export const dynamic = 'force-static';

const contactInfo = [
  { label: 'Phone:', value: '+1-510-990-5400' },
  { label: 'Email:', value: 'samourcalderon@gmail.com' },
  { label: 'GitHub:', value: 'rscalderon', url: 'https://github.com/rscalderon' },
  { label: 'LinkedIn:', value: 'rodrigosamourcalderon', url: 'https://www.linkedin.com/in/rodrigosamourcalderon' },
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
    <div className='flex flex-col items-center justify-center p-8 min-h-screen'>
      <main className='flex flex-col gap-4 row-start-2 items-center'>
        <h1 className='text-3xl font-semibold'>Rodrigo Samour Calderon</h1>
        <ol className='flex w-full flex-col list-inside text-start sm:text-left'>
          {contactInfo.map(({ label, value, url }) => (
            <li key={label} className='flex justify-between space-x-1'>
              <p className='font-semibold'>{label}</p>
              {url ? (
                <Link href={url} target='_blank' rel='noopener noreferrer' className='hover:underline'>
                  {value}
                </Link>
              ) : (
                <p>{value}</p>
              )}
            </li>
          ))}
        </ol>
        <button
          type='button'
          className='m-8 p-4 rounded-full shadow bg-slate-100'
          onClick={downloadContactCard}
        >
          <p className='text-semibold text-black'>Download contact</p>
        </button>
      </main>
      <Link
        className='flex justify-center absolute bottom-8 text-xs gap-2 hover:underline hover:underline-offset-4 text-secondary'
        href='/'
      >
        Go to main page
      </Link>
    </div>
  );
}
