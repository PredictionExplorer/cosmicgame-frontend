import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Participant';

/**
 * Best-effort 0x address truncation. We cannot import `viem` (~100 KB,
 * pulls in node-only deps) into the edge OG runtime, so we validate the
 * shape inline. Anything that does not look like a 20-byte address
 * falls back to "Participant".
 */
function shortenAddress(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (/^0x[0-9a-f]{40}$/.test(trimmed)) {
    return `${trimmed.slice(0, 6)}\u2026${trimmed.slice(-4)}`;
  }
  return 'Participant';
}

export default async function Image({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  const display = shortenAddress(address);

  return new ImageResponse(
    <CosmicOgCard
      eyebrow="Participant"
      title={display}
      subhead="Gestures, allocations, anchors, and contributions across every Performance Cycle."
      chips={['Gestures', 'Allocations', 'Anchors']}
    />,
    size,
  );
}
