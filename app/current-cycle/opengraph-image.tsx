import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 The Performance Cycle, live.';

export default function Image() {
  return new ImageResponse(
    <CosmicOgCard
      eyebrow="Current Cycle"
      title="The Performance Cycle, live."
      subhead="Gesture history, leaderboards, attached contributions, and allocation distribution \u2014 in real time."
      chips={['Live', 'Arbitrum One', 'On-Chain']}
    />,
    size,
  );
}
