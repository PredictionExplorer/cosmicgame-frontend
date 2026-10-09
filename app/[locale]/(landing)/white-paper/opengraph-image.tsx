import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata } from '@/lib/og/cards';

import { readingShareCard } from '../readingCard';
import { whitePaperReadingCard } from '../readingCardCopy';

/** The white paper's card: its title and edition beside a Signature from the paper. */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(whitePaperReadingCard(locale).alt);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return readingShareCard(locale, whitePaperReadingCard(locale));
}
