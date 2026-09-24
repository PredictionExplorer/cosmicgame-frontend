'use client';

import { useTranslations } from 'next-intl';

import type { SelectionShare as SelectionShareFigures } from '@/lib/selectionStanding';
import { StellarSelectionIcon } from '@/lib/conceptIcons';
import { useFormat } from '@/hooks/useFormat';

export interface SelectionShareProps {
  share: SelectionShareFigures;
  cycle: number;
  /** Stellar Selections drawn at finalization, when the dashboard carries them. */
  ethSelections: number | null;
  nftSelections: number | null;
}

/**
 * An address's place in this cycle's Stellar Selection pool, as the plain
 * count it comes from and its linear share: "291 of 1,135 gestures · 25.6%".
 * The bar is static and scaled to the share, never to a compounded chance
 * of selection (lib/selectionStanding.ts). The caption says how many
 * selections are drawn, with replacement, one entry per gesture.
 */
export function SelectionShare({
  share,
  cycle,
  ethSelections,
  nftSelections,
}: SelectionShareProps) {
  const t = useTranslations('myPages');
  const format = useFormat();
  const percent = format.percent(share.share, { scale: 'ratio' });

  return (
    <section
      aria-labelledby="selection-share-title"
      className="rounded-surface bg-surface-sunken px-5 py-5 sm:px-6"
    >
      <h2
        id="selection-share-title"
        className="flex items-center gap-2 type-label text-subtle [&_svg]:size-4"
      >
        <StellarSelectionIcon aria-hidden />
        {t('statistics.selection.title', { cycle })}
      </h2>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="type-figure-md text-foreground">
          {t('statistics.selection.share', {
            mine: format.count(share.myGestures),
            total: format.count(share.totalGestures),
          })}
        </span>
        <span className="type-figure-sm text-muted-foreground">{percent}</span>
      </p>
      <div aria-hidden className="mt-4 h-1.5 w-full overflow-hidden rounded-pill bg-rule">
        <div
          className="h-full rounded-pill bg-track-stellar-eth"
          style={{ width: `${Math.max(0.5, Math.min(100, share.share * 100))}%` }}
        />
      </div>
      <p className="mt-3 max-w-[var(--measure-prose)] type-caption text-subtle">
        {ethSelections !== null && nftSelections !== null
          ? t('statistics.selection.caption', {
              eth: format.count(ethSelections),
              nft: format.count(nftSelections),
            })
          : t('statistics.selection.captionGeneric')}
      </p>
    </section>
  );
}
