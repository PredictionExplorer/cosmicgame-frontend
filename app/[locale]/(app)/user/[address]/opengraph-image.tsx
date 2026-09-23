import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { ogImageMetadata, participantCard, participantCardAlt } from '@/lib/og/cards';

/**
 * A participant's card: the checksummed, shortened address in the headline,
 * with up to three of the Signatures they hold.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
// Holdings change as Signatures move; regenerate hourly.
export const revalidate = 3600;

interface ImageProps {
  params: Promise<{ locale: string; address: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale, address } = await params;
  return ogImageMetadata(participantCardAlt(locale, address));
}

export default async function Image({ params }: ImageProps) {
  const { locale, address } = await params;
  return participantCard(locale, address);
}
