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
      href: "mailto:carry_overage.8k@icloud.com?subject=Resume Request | Looking for <Enter position>&body=Hi Rodrigo, I hope you're doing well! %0D%0A %0D%0A Please share your most updated resume. I'm looking for <role you're looking for>. %0D%0A %0D%0A All the best, %0D%0A %0D%0A <Your name here>",
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
