import { MetadataRoute } from 'next';
import { getCompanyLegalConfig } from '@/lib/legal';

export default function robots(): MetadataRoute.Robots {
  const company = getCompanyLegalConfig();
  const baseUrl = company.website || 'https://histeriamails.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/legal/*', '/pricing'],
      disallow: ['/dashboard/*', '/api/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
