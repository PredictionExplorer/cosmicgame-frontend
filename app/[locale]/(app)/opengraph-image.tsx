import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

/**
 * Site-wide default Open Graph image.
 *
 * Inherited by every route that does not declare its own
 * `opengraph-image.tsx`, so this single file fixes Discord / Slack / X /
 * Facebook / LinkedIn previews for the canonical site root and every
 * unspecialized dApp page.
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
