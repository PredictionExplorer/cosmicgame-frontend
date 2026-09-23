import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { latestArtworkCard, ogImageMetadata } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

/**
 * About defines page-level Open Graph metadata, so its co-located card keeps
 * the route-specific metadata object from replacing the brand card.
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
