import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { galleryCard, ogImageMetadata } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

/**
 * The gallery: its title above the three newest Signatures.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
// The strip shows the newest Signatures; regenerate as new ones are imprinted.
export const revalidate = 3600;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(getOgCopy(locale, 'gallery').alt);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return galleryCard(locale);
}
