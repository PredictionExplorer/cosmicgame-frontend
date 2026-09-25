import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata } from '@/lib/og/cards';

import { learnArticleCard, learnArticleCardAlt } from '../articleCard';

/**
 * Each guide's own share card: its Signature and its title, so the guides
 * no longer unfurl as one identical brand card.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale, slug } = await params;
  return ogImageMetadata(await learnArticleCardAlt(locale, slug));
}

export default async function Image({ params }: ImageProps) {
  const { locale, slug } = await params;
  return learnArticleCard(locale, slug);
}
