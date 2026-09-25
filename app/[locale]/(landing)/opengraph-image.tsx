import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { latestArtworkCard, ogImageMetadata } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

/**
 * The marketing host's brand card. The home, About, Learn and its guides, the
 * white paper and the quiz (with its tiers) each draw their own card; a
 * landing route without one inherits this.
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
