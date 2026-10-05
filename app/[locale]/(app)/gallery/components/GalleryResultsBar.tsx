'use client';

import { useEffect, useRef, type ReactNode } from 'react';
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

/** Id of the result count, where focus lands when the last filter goes. */
export const GALLERY_RESULT_COUNT_ID = 'gallery-result-count';

/**
 * The line between the toolbar and the grid: how many Signatures the view
 * shows (announced politely as filters change), the active filter chips and
 * "Clear all". "Clear all" removes itself, so it hands focus to the count.
 * On a phone the count alone is a 24px caption over the plates; once filters
 * apply, the chips and "Clear all" set the row's height.
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
  const countRef = useRef<HTMLParagraphElement>(null);
  const clearing = useRef(false);

  useEffect(() => {
    if (filtered || !clearing.current) return;
    clearing.current = false;
    countRef.current?.focus();
  }, [filtered]);

  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-3 gap-y-2', className)}
      data-testid="gallery-results-bar"
    >
      <p
        ref={countRef}
        id={GALLERY_RESULT_COUNT_ID}
        role="status"
        aria-live="polite"
        tabIndex={-1}
        className="inline-flex min-h-6 items-center rounded-edge type-label tabular-nums text-muted-foreground sm:min-h-8"
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
        <Button
          variant="quiet"
          size="sm"
          onClick={() => {
            clearing.current = true;
            onClearAll();
          }}
          className="px-1.5"
        >
          {tTraits('facets.clearAll')}
        </Button>
      ) : null}
      {end ? <div className="ms-auto">{end}</div> : null}
    </div>
  );
}
