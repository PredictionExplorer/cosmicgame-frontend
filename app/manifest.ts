import type { MetadataRoute } from 'next';

import { DEFAULT_SITE_THEME, THEME_CHROME } from '@/lib/theme/config';

import { FAVICON_SVG_URL } from './root-metadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cosmic Signature',
    short_name: 'CosmicSig',
    description:
      'A procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle\u2019s final Signature, and the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild.',
    start_url: '/',
    display: 'standalone',
    theme_color: THEME_CHROME[DEFAULT_SITE_THEME],
    background_color: THEME_CHROME[DEFAULT_SITE_THEME],
    icons: [
      {
        src: FAVICON_SVG_URL,
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['art', 'entertainment'],
  };
}
