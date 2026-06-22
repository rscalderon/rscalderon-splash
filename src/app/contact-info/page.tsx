'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

// Force static generation - pages are pre-rendered at build time
export const dynamic = 'force-static';

const contactInfo = [
  { label: 'Phone:', value: '+1-510-990-5400' },
  { label: 'Email:', value: 'samourcalderon@gmail.com' },
  { label: 'GitHub:', value: 'rscalderon', url: 'https://github.com/rscalderon' },
  { label: 'LinkedIn:', value: 'rodrigosamourcalderon', url: 'https://www.linkedin.com/in/rodrigosamourcalderon' },
];

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

export default function Home() {
  const [vCardUrl, setVCardUrl] = useState<string | null>(null);

  // Generate vCard (VCF) format and create blob URL only on client side
  useEffect(() => {
    // Create a blob with the vCard content
    const blob = new Blob([vCard], { type: 'text/vcard' });

    // Create a temporary URL for the blob (only on client)
    const url = URL.createObjectURL(blob);
    setVCardUrl(url);

    // Clean up the blob URL on unmount
    return () => URL.revokeObjectURL(url);
  }, []);

  return (
    <div className='flex flex-col items-center justify-center p-8 min-h-screen'>
      <main className='flex flex-col gap-4 row-start-2 items-center'>
        <h1 className='text-3xl font-semibold'>Rodrigo Samour Calderon</h1>
        <ol className='flex w-full flex-col list-inside text-start sm:text-left'>
          {contactInfo.map(({ label, value, url }) => (
            <li key={label} className='flex justify-between space-x-1'>
              <p className='font-medium'>{label}</p>
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
        <a
          className={`m-8 p-4 rounded-full shadow bg-slate-100 text-semibold text-black inline-block ${!vCardUrl ? 'pointer-events-none opacity-50' : ''}`}
          href={vCardUrl || '#'}
          download='Rodrigo_Samour_Calderon.vcf'
          target='_blank'
          rel='noopener noreferrer'
          onClick={(e) => {
            if (!vCardUrl) {
              e.preventDefault();
            }
          }}
        >
          Download contact
        </a>
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
