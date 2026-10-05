import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { textCard, ogImageMetadata } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

/**
 * How It Works: the four stages on the text card.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(getOgCopy(locale, 'howItWorks').alt);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return textCard(locale, 'howItWorks', 'app');
}
