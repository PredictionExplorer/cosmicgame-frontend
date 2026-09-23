import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { allocationCard, allocationCardAlt, ogImageMetadata } from '@/lib/og/cards';

/**
 * A cycle's allocations: the cycle in the headline, beside the cycle's
 * Signature once the cycle has finalized and imprinted it.
 */
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
// A cycle gains its Signature when it finalizes; regenerate hourly until then.
export const revalidate = 3600;

interface ImageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale, id } = await params;
  return ogImageMetadata(allocationCardAlt(locale, id));
}

export default async function Image({ params }: ImageProps) {
  const { locale, id } = await params;
  return allocationCard(locale, id);
}
