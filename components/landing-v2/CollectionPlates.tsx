'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { classifyHref } from '@/config/siteNav';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { ArtFrame, PendingPlate, WallLabelMeta } from '@/components/ui/art-frame';

import { showcaseArtworks, showcaseSources, type ShowcaseArtwork } from './showcase-art';
import { useLandingShowcaseTokens, type LandingShowcase } from './useLandingShowcaseTokens';
import styles from './Landing.module.css';

/**
 * Which Signatures a collection strip shows, newest first.
 *
 * - `recent`: the newest imprints.
 * - `anchored`: only Signatures the collection reports as anchored right
 *   now. The strip is never topped up with pieces that are not anchored.
 */
export type CollectionPick = 'recent' | 'anchored';

/**
 * The plates of a strip. While the collection loads, every place waits
 * (`null`, a skeleton plate): only the collection knows which pieces are the
 * newest or anchored. When it cannot be read, the strip is empty and not
 * drawn; when it has fewer matches than `count`, only those are shown.
 */
export function pickCollection(
  showcase: LandingShowcase,
  pick: CollectionPick,
  count: number,
): readonly (ShowcaseArtwork | null)[] {
  if (showcase.status === 'loading') return Array.from({ length: count }, () => null);
  if (showcase.status === 'failed') return [];
  const newestFirst = [...showcaseArtworks(showcase.tokens)].sort((a, b) => b.TokenId - a.TokenId);
  const matching =
    pick === 'anchored' ? newestFirst.filter((art) => art.Staked === true) : newestFirst;
  return matching.slice(0, count);
}

interface CollectionPlatesProps {
  pick: CollectionPick;
  count: number;
  /** Template with `{tokenLabel}`. */
  artworkAlt: string;
  /** Template with `{tokenLabel}`. */
  viewAriaLabel: string;
  /** Caption of a plate whose artwork cannot load; defaults to "Artwork unavailable". */
  unavailableLabel?: string;
  /** The plates' rendered width, for the srcset choice. */
  sizes: string;
  className?: string;
}

/**
 * A set of Signatures from the collection, each a plate that opens its page
 * in the app, with a one-line wall label (token number and cycle) beneath.
 * Renders nothing when the collection cannot be read or has no match, so a
 * layout around it should read well without it.
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
  const t = useTranslations('landing.artwork');
  const timerT = useTranslations('landing.timer');
  const showcase = useLandingShowcaseTokens();
  const plates = useMemo(() => pickCollection(showcase, pick, count), [showcase, pick, count]);

  if (plates.length === 0) return null;

  return (
    <ul
      className={cn(styles.collection, className)}
      data-testid={`collection-${pick}`}
      aria-busy={showcase.status === 'loading' || undefined}
    >
      {plates.map((artwork, index) => {
        if (!artwork) {
          return (
            <li key={`pending-${index}`} className={styles.collectionItem}>
              <PendingPlate busy density="compact" />
            </li>
          );
        }
        const tokenLabel = formatId(artwork.TokenId);
        const detailHref = localizeCrossHostHref(`${APP_ORIGIN}/detail/${artwork.TokenId}`, locale);
        return (
          <li key={artwork.TokenId} className={styles.collectionItem}>
            <SiteLink
              href={detailHref}
              kind={classifyHref(detailHref, 'landing')}
              aria-label={viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
              className="block rounded-edge"
            >
              <ArtFrame
                sources={showcaseSources(artwork)}
                alt={artworkAlt.replace('{tokenLabel}', tokenLabel)}
                sizes={sizes}
                unavailableLabel={unavailableLabel ?? t('unavailable')}
                unavailableDetail={tokenLabel}
                density="compact"
              />
            </SiteLink>
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
