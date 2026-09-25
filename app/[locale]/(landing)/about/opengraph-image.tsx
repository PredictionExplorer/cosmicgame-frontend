import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata } from '@/lib/og/cards';

import { readingCardAlt, readingShareCard } from '../readingCard';
import { aboutReadingCard } from '../readingCardCopy';

/**
 * About's own card: its title beside the Signature that opens the page, so
 * the page no longer unfurls as the landing's brand card. About defines
 * page-level Open Graph metadata, so the card must be co-located here.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return ogImageMetadata(await readingCardAlt(locale, aboutReadingCard(locale)));
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  return readingShareCard(locale, aboutReadingCard(locale));
}
