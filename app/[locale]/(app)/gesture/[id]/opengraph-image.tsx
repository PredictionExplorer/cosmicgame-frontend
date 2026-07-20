import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { formatOgEyebrow, getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

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

interface ImageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return getOgImageMetadata(locale, 'gesture');
}

export default async function Image({ params }: ImageProps) {
  const { locale, id } = await params;
  const copy = getOgCopy(locale, 'gesture');
  const eyebrow = formatOgEyebrow(copy, await fetchGesturePosition(id));

  return createCosmicOgImage(locale, { ...copy, eyebrow });
}
