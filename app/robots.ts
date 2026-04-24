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

  // On the landing host, disallow all paths except the root and legal docs
  // (those that are OK to crawl on the marketing site). Everything else
  // exists on app.cosmicsignature.com and the proxy redirects there.
  const landingDisallow = [
    '/admin/',
    '/api/',
    '/gallery/',
    '/current-round/',
    '/current-cycle/',
    '/staking/',
    '/anchoring/',
    '/my-',
    '/prize/',
    '/allocation/',
    '/charity-',
    '/public-goods-',
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
