import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.cosmicsignature.com';

type Freq = MetadataRoute.Sitemap[number]['changeFrequency'];

interface SitemapEntry {
  path: string;
  priority: number;
  changeFrequency: Freq;
}

const pages: SitemapEntry[] = [
  { path: '', priority: 1.0, changeFrequency: 'hourly' },
  { path: '/current-round', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/gallery', priority: 0.9, changeFrequency: 'hourly' },
  { path: '/statistics', priority: 0.8, changeFrequency: 'hourly' },
  { path: '/how-to-play', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/faq', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/staking', priority: 0.8, changeFrequency: 'daily' },
  { path: '/prize', priority: 0.8, changeFrequency: 'daily' },
  { path: '/marketing', priority: 0.7, changeFrequency: 'daily' },
  { path: '/mint', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/mint-artblocks', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contracts', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/code', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/eth-donation', priority: 0.6, changeFrequency: 'daily' },
  { path: '/nft-donations', priority: 0.6, changeFrequency: 'daily' },
  { path: '/winning-history', priority: 0.7, changeFrequency: 'daily' },
  { path: '/prize-claimed', priority: 0.6, changeFrequency: 'daily' },
  { path: '/named-nfts', priority: 0.6, changeFrequency: 'daily' },
  { path: '/used-rwlk-nfts', priority: 0.5, changeFrequency: 'daily' },
  { path: '/changed-parameters', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/charity-deposits-cg', priority: 0.5, changeFrequency: 'daily' },
  { path: '/charity-deposits-voluntary', priority: 0.5, changeFrequency: 'daily' },
  { path: '/charity-withdrawals', priority: 0.5, changeFrequency: 'daily' },
  { path: '/detail/sample', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/site-map', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/my-tokens', priority: 0.5, changeFrequency: 'daily' },
  { path: '/my-staking', priority: 0.5, changeFrequency: 'daily' },
  { path: '/my-statistics', priority: 0.5, changeFrequency: 'daily' },
  { path: '/my-winnings', priority: 0.5, changeFrequency: 'daily' },
  { path: '/admin', priority: 0.3, changeFrequency: 'monthly' },
  { path: '/admin/admin', priority: 0.2, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
