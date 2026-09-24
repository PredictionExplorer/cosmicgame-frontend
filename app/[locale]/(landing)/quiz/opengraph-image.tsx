import { getQuizContent } from '@/content/quiz';

import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata } from '@/lib/og/cards';

import { readingShareCard } from '../readingCard';

/** The quiz's card, shared by its tiers: the question it asks beside a Signature. */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

const PLATE = 40;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(getQuizContent(locale).hub.h1);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  const { hub } = getQuizContent(locale);
  return readingShareCard(locale, { eyebrow: hub.eyebrow, title: hub.h1 }, PLATE);
}
