import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Gallery';

export default function Image() {
  return new ImageResponse(
    <CosmicOgCard
      eyebrow="Gallery"
      title="Three-body trajectories, rendered on-chain."
      subhead="Every Signature is a deterministic three-body simulation, spectrally rendered. Same seed, identical pixels."
      chips={['CC0', 'Deterministic', 'Reproducible Art']}
    />,
    size,
  );
}
