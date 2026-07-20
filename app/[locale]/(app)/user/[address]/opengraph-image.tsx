import { COSMIC_OG_SIZE } from '@/lib/og/CosmicOgCard';
import { getOgCopy, getOgImageMetadata } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';

export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;

/**
 * Best-effort 0x address truncation. We cannot import `viem` (~100 KB,
 * pulls in node-only deps) into the edge OG runtime, so we validate the
 * shape inline. Anything that does not look like a 20-byte address
 * falls back to "Participant".
 */
function shortenAddress(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (/^0x[0-9a-f]{40}$/.test(trimmed)) {
    return `${trimmed.slice(0, 6)} ${trimmed.slice(-4)}`;
  }
  return null;
}

interface ImageProps {
  params: Promise<{ locale: string; address: string }>;
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { locale } = await params;
  return getOgImageMetadata(locale, 'participant');
}

export default async function Image({ params }: ImageProps) {
  const { locale, address } = await params;
  const copy = getOgCopy(locale, 'participant');
  const title = shortenAddress(address) ?? copy.title;

  return createCosmicOgImage(locale, { ...copy, title });
}
