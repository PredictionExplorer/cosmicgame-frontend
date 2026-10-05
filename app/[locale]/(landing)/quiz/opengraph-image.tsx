import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata } from '@/lib/og/cards';

import { readingShareCard } from '../readingCard';
import { quizReadingCard } from '../readingCardCopy';

/** The quiz's card, shared by its tiers: the question it asks beside a Signature. */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(quizReadingCard(locale).alt);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return readingShareCard(locale, quizReadingCard(locale));
}
