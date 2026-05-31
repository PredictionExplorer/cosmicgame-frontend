import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

import { APP_ORIGIN, LANDING_ORIGIN, isAppHost, normalizeHost } from '@/lib/hostRouting';

const LANDING_URL = LANDING_ORIGIN;
const APP_URL = APP_ORIGIN;

const AI_BOTS = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'Claude-Web',
  'Anthropic',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
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
  // `/landing-site` is the internal Next route that renders at `/`; it is
  // 308-redirected to `/` by the proxy but we disallow it here too so crawlers
  // never try to index the internal path in the first place.
  const landingDisallow = [
    '/admin/',
    '/allocation',
    '/anchor-action/',
    '/anchoring',
    '/api/',
    '/attached-nfts',
    '/coordination-changes',
    '/current-cycle',
    '/eth-contribution',
    '/gallery/',
    '/gesture/',
    '/landing-site',
    '/my-',
    '/public-goods-',
    '/recipient-history',
    '/privacy',
    '/risk-disclosures',
    '/audits',
    '/security',
    '/statistics',
    '/terms',
  ];

  const appDisallow = ['/api/', '/internal/', '/debug/', '/wallet/', '/account/', '/landing-site'];

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
