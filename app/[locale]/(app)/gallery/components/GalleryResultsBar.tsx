'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface GalleryResultsBarProps {
  /** Signatures the current filters show; `null` while the archive loads. */
  count: number | null;
  /** The whole collection. */
  total: number;
  /** A filter narrows the view: the count reads "3 of 48" and "Clear all" appears. */
  filtered: boolean;
  onClearAll: () => void;
  /** The active filter chips. */
  chips?: ReactNode;
  /** A control at the row's end (the Collection DNA disclosure). */
  end?: ReactNode;
  className?: string;
}

/**
 * The line between the toolbar and the grid: how many Signatures the view
 * shows (announced politely as filters change), the active filter chips and
 * "Clear all".
 */
export function GalleryResultsBar({
  count,
  total,
  filtered,
  onClearAll,
  chips,
  end,
  className,
}: GalleryResultsBarProps) {
  const t = useTranslations('gallery');
  const tTraits = useTranslations('traits');

  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}
      data-testid="gallery-results-bar"
    >
      <p
        role="status"
        aria-live="polite"
        className="inline-flex min-h-8 items-center type-label tabular-nums text-muted-foreground"
        data-testid="gallery-result-count"
      >
        {count === null
          ? null
          : filtered
            ? t('results.filtered', { count, total })
            : t('results.total', { count: total })}
      </p>
      {chips}
      {filtered ? (
        <Button variant="quiet" size="sm" onClick={onClearAll} className="px-1.5">
          {tTraits('facets.clearAll')}
        </Button>
      ) : null}
      {end ? <div className="ms-auto">{end}</div> : null}
    </div>
  );
}
