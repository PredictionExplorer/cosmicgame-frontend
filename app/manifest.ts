import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cosmic Signature',
    short_name: 'CosmicSig',
    description:
      'A strategy bidding game on Arbitrum featuring generative NFT art, ETH prizes, staking rewards, and charitable giving.',
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
    categories: ['games', 'entertainment'],
  };
}
