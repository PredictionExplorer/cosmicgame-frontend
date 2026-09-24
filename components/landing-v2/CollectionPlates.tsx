'use client';

import { useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { classifyHref } from '@/config/siteNav';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { ArtFrame, PendingPlate, WallLabelMeta } from '@/components/ui/art-frame';

import { showcaseArtworks, showcaseSources, type ShowcaseArtwork } from './showcase-art';
import { useIdleAfterLoad, useOnScreen } from './useArtMotion';
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

/** Another strip on the page, whose plates this one leaves out. */
export interface CollectionExclusion {
  pick: CollectionPick;
  count: number;
}

/**
 * The plates of a strip. While the collection loads, every place waits
 * (`null`, a skeleton plate): only the collection knows which pieces are the
 * newest or anchored. When it cannot be read, the strip is empty and not
 * drawn; when it has fewer matches than `count`, only those are shown.
 *
 * Only Signatures the collection answered with are candidates: the bundled
 * featured pieces paint the hero before any answer, but they are never
 * presented as "the newest" or "anchored" on their own authority. Pieces in
 * `exclude` (another strip's plates) are skipped, so the page never ends on
 * art it already showed.
 */
export function pickCollection(
  showcase: LandingShowcase,
  pick: CollectionPick,
  count: number,
  exclude: ReadonlySet<number> = new Set(),
): readonly (ShowcaseArtwork | null)[] {
  if (showcase.status === 'loading') return Array.from({ length: count }, () => null);
  if (showcase.status === 'failed') return [];
  const answered = new Set(showcase.tokens.map((token) => token.TokenId));
  const newestFirst = showcaseArtworks(showcase.tokens)
    .filter((art) => answered.has(art.TokenId) && !exclude.has(art.TokenId))
    .sort((a, b) => b.TokenId - a.TokenId);
  const matching =
    pick === 'anchored' ? newestFirst.filter((art) => art.Staked === true) : newestFirst;
  return matching.slice(0, count);
}

/**
 * How far below the screen a strip starts fetching its plates: one screen.
 * Past that point, or once the page is idle after loading, the images load
 * eagerly, so a visitor who flicks down the page (or jumps to the end) never
 * meets a strip of empty plates. The thumbnails are about 20 KB each; under
 * Save-Data or on a slow connection only the screen margin applies.
 */
const PREFETCH_MARGIN = '100% 0px';

interface CollectionPlatesProps {
  pick: CollectionPick;
  count: number;
  /** A strip shown earlier on the page: its plates are left out of this one. */
  excluding?: CollectionExclusion;
  /** Template with `{tokenLabel}`. */
  artworkAlt: string;
  /** Template with `{tokenLabel}`. */
  viewAriaLabel: string;
  /** Caption of a plate whose artwork cannot load; defaults to "Artwork unavailable". */
  unavailableLabel?: string;
  /** The plates' rendered width, for the srcset choice. */
  sizes: string;
  /**
   * The first plate's width when the layout draws it across the row over the
   * others (the anchored strip does, unless exactly two plates share a row),
   * so only that plate asks for the larger rendition.
   */
  leadSizes?: string;
  className?: string;
}

/**
 * A set of Signatures from the collection, each a plate with a one-line
 * wall label (token number and cycle) beneath, plate and label one link to
 * its page in the app. Renders nothing when the collection cannot be read or
 * has no match, so a layout around it should read well without it.
 */
export function CollectionPlates({
  pick,
  count,
  excluding,
  artworkAlt,
  viewAriaLabel,
  unavailableLabel,
  sizes,
  leadSizes,
  className,
}: CollectionPlatesProps) {
  const locale = useLocale();
  const t = useTranslations('landing.artwork');
  const timerT = useTranslations('landing.timer');
  const showcase = useLandingShowcaseTokens();
  const listRef = useRef<HTMLUListElement>(null);
  const near = useOnScreen(listRef, PREFETCH_MARGIN);
  const idle = useIdleAfterLoad();
  // Latched: once the strip has come within a screen, its plates load now.
  const [armed, setArmed] = useState(false);
  if ((near || idle) && !armed) setArmed(true);

  const excludedPick = excluding?.pick;
  const excludedCount = excluding?.count ?? 0;
  const plates = useMemo(() => {
    const shownAbove = excludedPick
      ? pickCollection(showcase, excludedPick, excludedCount).flatMap((art) =>
          art ? [art.TokenId] : [],
        )
      : [];
    return pickCollection(showcase, pick, count, new Set(shownAbove));
  }, [showcase, pick, count, excludedPick, excludedCount]);

  if (plates.length === 0) return null;

  const leadSpans = leadSizes !== undefined && plates.length !== 2;
  const sizesFor = (index: number) => (index === 0 && leadSpans ? leadSizes : sizes);

  return (
    <ul
      ref={listRef}
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
              className="group block rounded-edge"
            >
              <ArtFrame
                sources={showcaseSources(artwork)}
                alt={artworkAlt.replace('{tokenLabel}', tokenLabel)}
                sizes={sizesFor(index)}
                loading={armed ? 'eager' : 'lazy'}
                unavailableLabel={unavailableLabel ?? t('unavailable')}
                unavailableDetail={tokenLabel}
                density="compact"
              />
              <WallLabelMeta
                className="mt-2"
                items={[
                  <span
                    key="id"
                    className="type-mono text-muted-foreground group-hover:text-foreground"
                  >
                    {tokenLabel}
                  </span>,
                  artwork.RoundNum === undefined
                    ? null
                    : timerT('cycle.numbered', { number: artwork.RoundNum }),
                ]}
              />
            </SiteLink>
          </li>
        );
      })}
    </ul>
  );
}
