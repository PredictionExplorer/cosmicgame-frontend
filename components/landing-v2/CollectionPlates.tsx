'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { ArtFrame, PendingPlate, WallLabelMeta } from '@/components/ui/art-frame';

import { showcaseArtworks, showcaseSources, type ShowcaseArtwork } from './showcase-art';
import { useLandingShowcaseTokens, type LandingShowcase } from './useLandingShowcaseTokens';
import styles from './Landing.module.css';

/**
 * Which Signatures a collection strip shows.
 *
 * - `recent`: the newest imprints.
 * - `anchored`: Signatures anchored to the protocol right now, newest first.
 *
 * Either list is topped up with the newest remaining pieces (the bundled
 * featured ones included), so a strip is always full once the collection
 * answers, and shows the bundled pieces before it does.
 */
export type CollectionPick = 'recent' | 'anchored';

export function pickCollection(
  showcase: LandingShowcase,
  pick: CollectionPick,
  count: number,
): readonly (ShowcaseArtwork | null)[] {
  const artworks = showcaseArtworks(showcase.tokens);
  const newestFirst = [...artworks].sort((a, b) => b.TokenId - a.TokenId);
  const preferred = pick === 'anchored' ? newestFirst.filter((art) => art.Staked) : newestFirst;
  const picked = [...preferred];
  for (const art of newestFirst) {
    if (picked.length >= count) break;
    if (!picked.includes(art)) picked.push(art);
  }
  const shown: (ShowcaseArtwork | null)[] = picked.slice(0, count);
  // Until the collection answers, the places the bundled pieces cannot fill wait.
  while (shown.length < count && showcase.status === 'loading') shown.push(null);
  return shown;
}

interface CollectionPlatesProps {
  pick: CollectionPick;
  count: number;
  /** Template with `{tokenLabel}`. */
  artworkAlt: string;
  /** Template with `{tokenLabel}`. */
  viewAriaLabel: string;
  unavailableLabel: string;
  /** The plates' rendered width, for the srcset choice. */
  sizes: string;
  className?: string;
}

/**
 * A set of Signatures from the collection, each a plate that opens its page
 * in the app, with a one-line wall label (token number and cycle) beneath.
 */
export function CollectionPlates({
  pick,
  count,
  artworkAlt,
  viewAriaLabel,
  unavailableLabel,
  sizes,
  className,
}: CollectionPlatesProps) {
  const locale = useLocale();
  const timerT = useTranslations('landing.timer');
  const showcase = useLandingShowcaseTokens();
  const plates = useMemo(() => pickCollection(showcase, pick, count), [showcase, pick, count]);

  return (
    <ul className={cn(styles.collection, className)} data-testid={`collection-${pick}`}>
      {plates.map((artwork, index) => {
        if (!artwork) {
          return (
            <li key={`pending-${index}`} className={styles.collectionItem}>
              <PendingPlate busy density="compact" />
            </li>
          );
        }
        const tokenLabel = formatId(artwork.TokenId);
        return (
          <li key={artwork.TokenId} className={styles.collectionItem}>
            <a
              href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${artwork.TokenId}`, locale)}
              aria-label={viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
              className="block rounded-edge"
            >
              <ArtFrame
                sources={showcaseSources(artwork)}
                alt={artworkAlt.replace('{tokenLabel}', tokenLabel)}
                sizes={sizes}
                unavailableLabel={unavailableLabel}
                unavailableDetail={tokenLabel}
                density="compact"
              />
            </a>
            <WallLabelMeta
              className="mt-2"
              items={[
                <span key="id" className="type-mono text-muted-foreground">
                  {tokenLabel}
                </span>,
                artwork.RoundNum === undefined
                  ? null
                  : timerT('cycle.numbered', { number: artwork.RoundNum }),
              ]}
            />
          </li>
        );
      })}
    </ul>
  );
}
