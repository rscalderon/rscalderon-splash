import Link from 'next/link';
import { JSX } from 'react';

type SocialLinkProps = {
  href: string;
  className?: string;
  children: string | JSX.Element;
};

export default function SocialLink({
  href,
  className = 'hover:underline hover:underline-offset-4 hover:animate-pulse',
  children,
}: SocialLinkProps) {
  return (
    <Link href={href} target='_blank' className={className}>
      {children}
    </Link>
  );
}
