import { getWhitePaperContent } from '@/content/white-paper';

import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata } from '@/lib/og/cards';

import { readingShareCard } from '../readingCard';

/** The white paper's card: its title and edition beside a Signature from the paper. */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

/** The Signature beside the paper on its card (the paper's §6 figure shows #23 and #24). */
const PLATE = 24;

interface ImageProps {
  params: Promise<{ locale: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  const { hero } = getWhitePaperContent(locale);
  return ogImageMetadata(`${hero.title}: ${hero.subtitle}`);
}

export default async function Image({ params }: ImageProps) {
  const { locale } = await params;
  const { hero } = getWhitePaperContent(locale);
  return readingShareCard(
    locale,
    {
      eyebrow: hero.eyebrow,
      title: hero.title,
      subhead: hero.subtitle,
      fact: `${hero.versionLabel} · ${hero.dateLabel}`,
    },
    PLATE,
  );
}
