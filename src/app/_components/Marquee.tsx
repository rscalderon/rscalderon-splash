'use client';

import {
  MarqueeContent,
  studyMarqueeContent,
  workMarqueeContent,
} from '@/constants/marqueeContent';
import Image from 'next/image';

type MarqueeProps = {
  variant: 'work' | 'study';
};

export default function Marquee({ variant }: MarqueeProps) {
  const marqueeHeight = 100;

  let marqueeHeader: string;
  let marqueeContent: MarqueeContent;

  switch (variant) {
    case 'work':
      marqueeContent = workMarqueeContent;
      marqueeHeader = 'Trusted by';
      break;
    case 'study':
      marqueeContent = studyMarqueeContent;
      marqueeHeader = 'Educated at';
      break;
    default:
      throw new Error('Missing variant argument for Marquee');
  }

  return (
    <section className='space-y-5 w-[50vw]'>
      <h2 className='text-xl'>{marqueeHeader}</h2>
      <div className='overflow-hidden'>
        <div className='imagecarousel'>
          {marqueeContent.map(({ id, src, alt, w }) => (
            <Image
              key={id + 1}
              id={id}
              src={src}
              alt={alt}
              height={marqueeHeight}
              width={w}
              draggable={false}
            />
          ))}
          {marqueeContent.map(({ id, src, alt, w }) => (
            <Image
              priority={false}
              key={id + 2}
              id={id}
              src={src}
              alt={alt}
              height={marqueeHeight}
              width={w}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
