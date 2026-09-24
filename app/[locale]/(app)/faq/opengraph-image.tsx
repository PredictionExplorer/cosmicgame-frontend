import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { textCard, ogImageMetadata } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

/**
 * The FAQ's text card.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(getOgCopy(locale, 'faq').alt);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return textCard(locale, 'faq', 'app');
}
