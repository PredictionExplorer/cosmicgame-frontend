import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

/**
 * Shared by the Learn hub and every article below it. The locale segment is
 * resolved by Next.js before image generation, so visual copy and alt text
 * stay aligned with the page language.
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
