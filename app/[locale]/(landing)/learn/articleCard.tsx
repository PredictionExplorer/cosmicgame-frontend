import type { ImageResponse } from 'next/og';

import { latestArtworkCard } from '@/lib/og/cards';
import { getOgCopy } from '@/lib/og/copy';

import { readingCardAlt, readingShareCard } from '../readingCard';
import { learnArticleReadingCard } from '../readingCardCopy';

/** The card's alt text: the guide's title, as the card draws it. */
export async function learnArticleCardAlt(locale: string, slug: string): Promise<string> {
  const card = learnArticleReadingCard(locale, slug);
  return card ? readingCardAlt(locale, card) : getOgCopy(locale, 'default').alt;
}

/** One guide's card: its Signature, its title and its place on the reading path. */
export async function learnArticleCard(locale: string, slug: string): Promise<ImageResponse> {
  const card = learnArticleReadingCard(locale, slug);
  if (!card) return latestArtworkCard(locale, 'default', 'landing');
  return readingShareCard(locale, card);
}
