import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cosmic Signature',
    short_name: 'CosmicSig',
    description:
      'A procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle\u2019s final Signature, and the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild.',
    start_url: '/',
    display: 'standalone',
    theme_color: '#15BFFD',
    background_color: '#0f1729',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['art', 'entertainment'],
  };
}
