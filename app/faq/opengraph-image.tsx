import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 FAQ';

export default function Image() {
  return new ImageResponse(
    <CosmicOgCard
      eyebrow="FAQ"
      title="Questions worth answering plainly."
      subhead="Performance Cycles, gestures, allocations, anchoring, Protocol Coordination."
    />,
    size,
  );
}
