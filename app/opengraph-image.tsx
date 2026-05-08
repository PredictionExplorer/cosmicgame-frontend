import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

/**
 * Site-wide default Open Graph image.
 *
 * Inherited by every route that does not declare its own
 * `opengraph-image.tsx`, so this single file fixes Discord / Slack / X /
 * Facebook / LinkedIn previews for the canonical site root and every
 * unspecialized dApp page.
 */
export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Every Gesture Shapes the Signature.';

export default function Image() {
  return new ImageResponse(
    <CosmicOgCard
      eyebrow="Cosmic Signature"
      title="Every Gesture Shapes the Signature."
      subhead="A procedural on-chain art protocol on Arbitrum."
    />,
    size,
  );
}
