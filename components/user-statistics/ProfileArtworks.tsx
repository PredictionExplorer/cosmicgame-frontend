'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { formatId } from '@/utils/format/ids';
import { Link } from '@/i18n/navigation';
import type { CSTTokenInfo } from '@/services/api';
import { signatureMedia, signatureSources, useSignatureAlt } from '@/components/nft/signatureArt';
import { ArtFrame } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SignatureWallLabel } from '@/components/ui/signature-label';
import { SkeletonNFTCard } from '@/components/ui/skeleton';

import type { AnchoredArtwork } from './profileSummary';

/** Plates shown before "Show all". Two rows at the widest grid. */
const FIRST_PAGE = 8;

export interface ProfileArtworksProps {
  /** The NFTs the address holds. */
  tokens: readonly CSTTokenInfo[];
  /** The NFTs it has anchored, which the anchoring wallet holds for it. */
  anchored?: readonly AnchoredArtwork[];
  loading: boolean;
  /** The held NFTs could not be read: say so with a retry, never "no NFTs". */
  error?: boolean;
  onRetry?: () => void;
}

interface Plate {
  TokenId: number;
  TokenName?: string;
  RoundNum?: number;
  Seed?: string | number;
  anchored: boolean;
}

/**
 * The Cosmic Signature NFTs an address holds or has anchored, as the gallery
 * hangs them: each Signature on its black plate at the native ratio, nothing
 * over the art, and the shared wall label beneath (name or number, token
 * number, cycle, and the quiet anchor for the ones the anchoring wallet
 * holds).
 * Newest first; the first two rows show until "Show all".
 */
export function ProfileArtworks({
  tokens,
  anchored = [],
  loading,
  error = false,
  onRetry,
}: ProfileArtworksProps) {
  const t = useTranslations('myPages');
  const tDetail = useTranslations('detail');
  const signatureAlt = useSignatureAlt();
  const [showAll, setShowAll] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonNFTCard key={i} announce={i === 0} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        headingLevel={3}
        variant="inline"
        title={t('statistics.page.sectionLoadErrorTitle')}
        message={t('statistics.page.loadErrorMessage')}
        onRetry={onRetry}
      />
    );
  }

  const held = new Set(tokens.map((token) => token.TokenId));
  const plates: Plate[] = [
    ...tokens.map((token) => ({ ...token, anchored: false })),
    ...anchored
      .filter((token) => !held.has(token.TokenId))
      .map((token) => ({ ...token, anchored: true })),
  ];

  if (plates.length === 0) {
    return (
      <EmptyState
        headingLevel={3}
        variant="inline"
        title={t('statistics.artworks.emptyTitle')}
        description={t('statistics.artworks.emptyDescription')}
      />
    );
  }

  const ordered = plates.sort((a, b) => b.TokenId - a.TokenId);
  const visible = showAll ? ordered : ordered.slice(0, FIRST_PAGE);

  return (
    <div>
      {/* One plate spans a phone's column instead of sitting at half width beside nothing. */}
      <ul
        className={cn(
          'grid gap-x-5 gap-y-8 md:grid-cols-3 xl:grid-cols-4',
          ordered.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2',
        )}
      >
        {visible.map((token) => {
          const id = formatId(token.TokenId);
          const name = token.TokenName?.trim() || null;
          const media = signatureMedia(token.Seed);
          return (
            <li key={token.TokenId} className="min-w-0">
              <Link
                href={`/detail/${token.TokenId}`}
                className="group block no-underline focus-ring-within"
              >
                <figure className="space-y-3">
                  <ArtFrame
                    sources={signatureSources(media)}
                    alt={signatureAlt({ id, name })}
                    sizes={
                      ordered.length === 1
                        ? '(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20rem'
                        : '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20rem'
                    }
                    unavailableLabel={tDetail('image.artworkUnavailable')}
                    unavailableDetail={id}
                    density="compact"
                    className="group-hover:after:shadow-[var(--art-edge-active)]"
                  />
                  <SignatureWallLabel
                    as="figcaption"
                    tokenId={token.TokenId}
                    name={name}
                    cycle={token.RoundNum}
                    anchored={token.anchored}
                  />
                </figure>
              </Link>
            </li>
          );
        })}
      </ul>
      {ordered.length > FIRST_PAGE ? (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll
              ? t('statistics.artworks.showFewer')
              : t('statistics.artworks.showAll', { count: ordered.length })}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
