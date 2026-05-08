import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 How It Works';

export default function Image() {
  return new ImageResponse(
    <CosmicOgCard
      eyebrow="How It Works"
      title="From Calibration to Allocation, in four stages."
      subhead="Open the cycle. Make a gesture. Finalize. The protocol distributes the reserve."
      chips={['Calibration', 'Gestures', 'Allocations']}
    />,
    size,
  );
}
