import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Gesture';

/**
 * The route param is the event-log id, not the gesture position. Unlike the
 * other OG cards (which intentionally avoid the API), we must fetch to resolve
 * the human-facing "Gesture Position". The lookup is best-effort: any failure
 * falls back to a plain "Gesture" eyebrow so card generation never breaks.
 */
async function fetchGesturePosition(rawId: string): Promise<number | null> {
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id < 0) return null;

  const base = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
  if (!base) return null;

  try {
    // lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract
    const res = await fetch(`${base}/bid/info/${id}`, { next: { revalidate: 300 } });
    // lexicon-allow-end
    if (!res.ok) return null;
    const data = await res.json();
    const position = data?.BidInfo?.BidPosition;
    return typeof position === 'number' && position >= 0 ? position : null;
  } catch {
    return null;
  }
}

function gesturePositionLabel(position: number | null): string {
  return position !== null ? `Gesture Position #${position}` : 'Gesture';
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eyebrow = gesturePositionLabel(await fetchGesturePosition(id));

  return new ImageResponse(
    <CosmicOgCard
      eyebrow={eyebrow}
      title="An imprint on the Signature."
      subhead="Each gesture extends the Cycle Finalization Time, imprints Participation CST, and shapes the cycle\u2019s evolving Signature."
    />,
    size,
  );
}
