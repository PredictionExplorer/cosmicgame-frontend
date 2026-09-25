'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatId } from '@/utils/format';
import { randomWalkImageUrl } from '@/utils/urls';
import { useCSTInfo } from '@/hooks/useApiQuery';
import { ArtFrame, PendingPlate, type ArtSource } from '@/components/ui/art-frame';
import { signatureMedia, signatureSources } from '@/components/nft/signatureMedia';

import type { AnchorCollection } from './anchorLinks';

/**
 * A Random Walk NFT's published images, best first: the black-ground
 * thumbnail and the full-size black-ground render. Both are about the
 * Signature's own ratio, so a Random Walk NFT sits on the same black plate.
 */
export function randomWalkSources(tokenId: number): readonly ArtSource[] {
  return [randomWalkImageUrl(tokenId), randomWalkImageUrl(tokenId, 'black.png')];
}

export interface TokenPlateProps {
  collection: AnchorCollection;
  tokenId: number;
  /**
   * A Cosmic Signature's seed when the caller already has it. `undefined`
   * looks it up by token id; `null` means the indexer has none yet.
   */
  seed?: string | number | null;
  /**
   * The caller is still reading the seed (a ledger's batched read): show the
   * pending plate instead of starting a lookup of its own.
   */
  seedPending?: boolean;
  /**
   * Alt text. Pass `''` where the plate sits beside its own caption (a grid
   * card, a ledger cell), so the token is not announced twice.
   */
  alt: string;
  /** The plate's rendered width at each breakpoint. */
  sizes: string;
  /** `compact` (default) for thumbnails: the missing-art state draws the mark alone. */
  density?: 'full' | 'compact';
  priority?: boolean;
  className?: string;
}

/**
 * An anchorable NFT on its black plate at the art's native ratio: a Cosmic
 * Signature through its published renditions, a Random Walk NFT through its
 * black-ground renders. Nothing is drawn over the art; captions go below it.
 */
export function TokenPlate({
  collection,
  tokenId,
  seed,
  seedPending = false,
  alt,
  sizes,
  density = 'compact',
  priority,
  className,
}: TokenPlateProps) {
  const t = useTranslations('anchoring');
  const waiting = collection === 'cosmicSignature' && seed === undefined && seedPending;
  const needsLookup = collection === 'cosmicSignature' && seed === undefined && !seedPending;
  const lookup = useCSTInfo(needsLookup ? tokenId : null);
  const resolvedSeed = needsLookup ? lookup.data?.Seed : seed;

  if (waiting || (needsLookup && lookup.isLoading)) {
    return (
      <PendingPlate busy density="compact" alt={alt} className={cn('rounded-edge', className)} />
    );
  }

  const sources =
    collection === 'randomWalk'
      ? randomWalkSources(tokenId)
      : signatureSources(signatureMedia(resolvedSeed));

  return (
    <ArtFrame
      sources={sources}
      alt={alt}
      sizes={sizes}
      priority={priority}
      density={density}
      unavailableLabel={t('art.unavailable')}
      unavailableDetail={formatId(tokenId)}
      className={className}
    />
  );
}
