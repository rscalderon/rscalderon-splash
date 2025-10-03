import { socialEmailDraft } from '@/constants/emailTemplates';
import SocialLink from './SocialLink';

export default function SocialLinksSection() {
  const socialProfilesInfo = [
    {
      children: 'LinkedIn',
      href: 'https://www.linkedin.com/in/rodrigosamourcalderon/',
    },
    { children: 'GitHub', href: 'https://www.github.com/rscalderon/' },
    {
      children: 'Resume',
      href: socialEmailDraft,
    },
    { children: 'Medium', href: 'https://medium.com/@samourcalderon' },
  ] as const;
  return (
    <section className='flex space-x-1 justify-center w-full'>
      {socialProfilesInfo.map(({ href, children }, i) => (
        <div className='flex space-x-1' key={href}>
          <SocialLink href={href}>{children}</SocialLink>
          {i < socialProfilesInfo.length - 1 && <p>{'|'}</p>}
        </div>
      ))}
    </section>
  );
}
