import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.cosmicsignature.com';

const staticPages = [
  '',
  '/admin',
  '/admin/admin',
  '/changed-parameters',
  '/charity-deposits-cg',
  '/charity-deposits-voluntary',
  '/charity-withdrawals',
  '/code',
  '/contracts',
  '/detail/sample',
  '/eth-donation',
  '/faq',
  '/gallery',
  '/how-to-play',
  '/marketing',
  '/mint',
  '/mint-artblocks',
  '/my-staking',
  '/my-statistics',
  '/my-tokens',
  '/my-winnings',
  '/named-nfts',
  '/nft-donations',
  '/prize',
  '/prize-claimed',
  '/site-map',
  '/staking',
  '/statistics',
  '/used-rwlk-nfts',
  '/winning-history',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPages.map((page) => ({
    url: `${BASE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));
}
