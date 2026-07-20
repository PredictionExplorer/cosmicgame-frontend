import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return getOgImageMetadata(locale, 'currentCycle');
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return createCosmicOgImage(locale, getOgCopy(locale, 'currentCycle'));
}
