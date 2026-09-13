import { MetadataRoute } from 'next';
import { getAllPolicyMetadata, getCompanyLegalConfig } from '@/lib/legal';

export default function sitemap(): MetadataRoute.Sitemap {
  const company = getCompanyLegalConfig();
  const baseUrl = company.website || 'https://histeriamails.vercel.app';
  const policies = getAllPolicyMetadata();

  const legalEntries: MetadataRoute.Sitemap = policies.map((p) => ({
    url: `${baseUrl}/legal/${p.documentType}`,
    lastModified: new Date(p.lastUpdated),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...legalEntries,
  ];
}
