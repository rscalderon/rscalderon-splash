import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const dynamic = 'force-static';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rscalderon.com'),
  title: 'Rodrigo S. Calderon',
  description: 'Full-Stack AI Engineer based in Miami.',
  openGraph: {
    title: 'Rodrigo S. Calderon',
    description: 'Full-Stack AI Engineer based in Miami.',
    url: 'https://www.rscalderon.com',
    type: 'website',
  },
};

// Runs before paint to set the theme class and avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('rsc-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
