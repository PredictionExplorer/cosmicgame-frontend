import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Gesture';

function parseGestureLabel(raw: string): string {
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 0) return `Gesture #${n}`;
  return 'Gesture';
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eyebrow = parseGestureLabel(id);

  return new ImageResponse(
    <CosmicOgCard
      eyebrow={eyebrow}
      title="An imprint on the Signature."
      subhead="Each gesture extends the Cycle Finalization Time, imprints Participation CST, and shapes the cycle\u2019s evolving Signature."
    />,
    size,
  );
}
