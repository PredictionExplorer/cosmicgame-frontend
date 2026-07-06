import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

/**
 * Default Open Graph image for the marketing route group (`/about`,
 * `/learn/*`). Intentional parity with the (app) group default card so both
 * hosts share one visual identity in link previews. `/landing-site` overrides
 * with its own nested opengraph-image.
 */
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
