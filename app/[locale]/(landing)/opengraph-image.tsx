import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { latestArtworkCard, ogImageMetadata } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

/**
 * The marketing host's brand card: the fallback for a landing page without
 * a card of its own, which inherits it through `createPageMetadata`. Every
 * landing page today has its own (the home, about, learn and each guide, the
 * white paper, the quiz and its tiers), so this one is what a new page shows
 * until it gets one.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
// The card shows the newest Signature; regenerate as new ones are imprinted.
export const revalidate = 3600;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(getOgCopy(locale, 'default').alt);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return latestArtworkCard(locale, 'default', 'landing');
}
