import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rscalderon.com';
  const lastModified = new Date();

  return [
    { url: baseUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${baseUrl}/contact-info`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
