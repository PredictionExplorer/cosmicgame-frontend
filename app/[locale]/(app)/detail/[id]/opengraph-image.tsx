import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

/**
 * Share card for a token page. The page no longer points `og:image` at the
 * multi-megabyte source PNG, so this route owns the preview.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return getOgImageMetadata(locale, 'default');
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return createCosmicOgImage(locale, getOgCopy(locale, 'default'));
}
