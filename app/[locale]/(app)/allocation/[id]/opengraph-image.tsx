import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { formatOgEyebrow, getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';
import { parseCanonicalNonNegativeSafeInteger } from '@/utils/routeParams';

export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return getOgImageMetadata(locale, 'allocation');
}

export default async function Image({ params }: ImageProps) {
  const { locale, id } = await params;
  const copy = getOgCopy(locale, 'allocation');
  const eyebrow = formatOgEyebrow(copy, parseCanonicalNonNegativeSafeInteger(id));

  return createCosmicOgImage(locale, { ...copy, eyebrow });
}
