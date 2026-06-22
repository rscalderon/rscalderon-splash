export type Link = {
  /** Display label, e.g. "GitHub" */
  label: string;
  /** Absolute URL */
  href: string;
  /** Short handle shown in the terminal, e.g. "github.com/rscalderon" */
  handle: string;
};

export const links: Link[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/rodrigosamourcalderon/',
    handle: '/in/rodrigosamourcalderon',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/rscalderon',
    handle: 'github.com/rscalderon',
  },
  {
    label: 'Medium',
    href: 'https://medium.com/@samourcalderon',
    handle: '@samourcalderon',
  },
];
