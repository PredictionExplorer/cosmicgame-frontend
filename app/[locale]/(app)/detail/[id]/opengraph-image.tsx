import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata, tokenCard, tokenCardAlt } from '@/lib/og/cards';

/**
 * A token's card: the piece on its black plate at native ratio, its name (or
 * number) and cycle beside it. The page points `og:image` here instead of the
 * multi-megabyte source render, and the alt text is composed from the
 * token's traits in the page's language.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
// A render never changes; a name can, so the card refreshes hourly.
export const revalidate = 3600;

interface ImageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale, id } = await params;
  return ogImageMetadata(await tokenCardAlt(locale, id));
}

export default async function Image({ params }: ImageProps) {
  const { locale, id } = await params;
  return tokenCard(locale, id);
}
