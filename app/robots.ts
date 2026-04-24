import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

import { isAppHost, normalizeHost } from '@/lib/hostRouting';

const LANDING_URL = 'https://www.cosmicsignature.com';
const APP_URL = 'https://app.cosmicsignature.com';

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'Claude-Web',
  'Anthropic',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'cohere-ai',
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = normalizeHost(h.get('x-forwarded-host') ?? h.get('host'));
  const onAppHost = isAppHost(host);

  const siteUrl = onAppHost ? APP_URL : LANDING_URL;

  // On the landing host, disallow dApp paths. Everything dApp-related lives on
  // app.cosmicsignature.com and the proxy redirects there. Cosmic-lexicon-only.
  const landingDisallow = [
    '/admin/',
    '/allocation',
    '/anchor-action/',
    '/anchoring',
    '/api/',
    '/coordination-changes',
    '/current-cycle',
    '/eth-contribution',
    '/gallery/',
    '/gesture/',
    '/my-',
    '/nft-donations',
    '/public-goods-',
    '/recipient-history',
    '/statistics',
  ];

  const appDisallow = ['/admin/', '/api/'];

  const disallow = onAppHost ? appDisallow : landingDisallow;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow,
      },
      {
        userAgent: AI_BOTS,
        allow: '/',
        disallow,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
