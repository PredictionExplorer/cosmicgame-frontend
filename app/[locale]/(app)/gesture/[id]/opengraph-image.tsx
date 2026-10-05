import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { gestureCard, gestureCardAlt, ogImageMetadata } from '@/lib/og/cards';

/**
 * A gesture's card: its position and cycle in the headline, its method above.
 * The route parameter is the event-log id, not the position, so the card
 * reads the gesture record; without it the card keeps the generic headline.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
// A gesture record never changes once indexed.
export const revalidate = 86400;

interface ImageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale, id } = await params;
  return ogImageMetadata(await gestureCardAlt(locale, id));
}

export default async function Image({ params }: ImageProps) {
  const { locale, id } = await params;
  return gestureCard(locale, id);
}
