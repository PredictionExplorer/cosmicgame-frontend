import { ImageResponse } from 'next/og';

import { COSMIC_OG_SIZE, CosmicOgCard } from '@/lib/og/CosmicOgCard';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = COSMIC_OG_SIZE;
export const alt = 'Cosmic Signature \u2014 Allocation Distribution';

/**
 * Sanitize the route param to a printable cycle number. We intentionally
 * do not call the API here — the OG card is generated on the edge and
 * Discord/X cache aggressively, so live data has limited cosmetic value
 * and adds failure modes.
 */
function parseCycleLabel(raw: string): string {
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 0) return `Cycle #${n}`;
  return 'Allocation';
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eyebrow = parseCycleLabel(id);

  return new ImageResponse(
    <CosmicOgCard
      eyebrow={eyebrow}
      title="Allocation Distribution"
      subhead="How the Cycle Reserve was distributed across more than ten allocation tracks."
      chips={['Signature', 'Chrono-Warrior', 'Anchor']}
    />,
    size,
  );
}
