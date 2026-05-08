import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Anchoring';

export default function Image() {
  return new ImageResponse(
    <CosmicOgCard
      eyebrow="Anchoring"
      title="Anchor a Signature. Receive a share each cycle."
      subhead="Anchored Cosmic Signature NFTs receive a proportional share of the per-cycle Anchor Distribution. Release any time."
      chips={['No Lockup', 'Per-Cycle ETH', 'Stellar Selection']}
    />,
    size,
  );
}
