import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

/**
 * About defines page-level Open Graph metadata, so its co-located image keeps
 * the route-specific metadata object from replacing the landing fallback.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return getOgImageMetadata(locale, 'default');
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return createCosmicOgImage(locale, getOgCopy(locale, 'default'));
}
