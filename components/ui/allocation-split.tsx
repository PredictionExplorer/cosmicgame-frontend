'use client';

import { ALLOCATION_TRACK_COLORS, type AllocationTrackId } from '@/config/allocationTracks';
import { Amount } from '@/components/ui/amount';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useFormat } from '@/hooks/useFormat';
import { cn } from '@/lib/utils';

/** One allocation track of a split. */
export interface AllocationSplitSegment {
  id: AllocationTrackId;
  label: string;
  /** What the track is; the label explains itself with it. */
  definition?: string;
  /** The track's share of the whole, in percent (0–100); `null` when unknown. */
  percent: number | null;
  /** The ETH the track carried, when the split is of a real cycle. */
  amount?: number | null;
  /** The share and amount are approximate (the compounding remainder): shown with "~". */
  approximate?: boolean;
}

interface AllocationSplitBarProps {
  segments: readonly AllocationSplitSegment[];
  /** Names the bar for assistive technology ("How Cycle 1's ETH was split"). */
  label: string;
  /** Read by screen readers instead of the unknown dash. */
  unavailableLabel: string;
  className?: string;
}

/**
 * How the Cycle Reserve splits across the allocation tracks, the one compact
 * drawing of it in the app (/statistics, /allocation, a cycle record): a
 * proportional bar that spans 100%, in the track colours and order every
 * chart of the split uses (config/allocationTracks), the remainder solid in
 * the compounding track's neutral, then a two-column legend in tabular
 * figures: each track's 2px-edged swatch, its name (explained), its ETH where
 * known, and its share, "~" on the approximate remainder. The landing's
 * AllocationBar is the same split drawn tall with its figures inside. The
 * bar itself is one image with a text alternative; the legend carries the
 * numbers, so nothing depends on colour or hover.
 */
export function AllocationSplitBar({
  segments,
  label,
  unavailableLabel,
  className,
}: AllocationSplitBarProps) {
  const format = useFormat();
  const drawn = segments.filter((segment) => (segment.percent ?? 0) > 0);
  const showAmounts = segments.some((segment) => segment.amount !== undefined);

  const percentText = (segment: AllocationSplitSegment) =>
    segment.percent === null
      ? null
      : `${segment.approximate ? '~' : ''}${format.percent(segment.percent)}`;

  return (
    <div className={cn('min-w-0', className)} data-testid="allocation-split">
      <div
        role="img"
        aria-label={`${label}: ${segments
          .map((segment) => `${segment.label} ${percentText(segment) ?? unavailableLabel}`)
          .join(', ')}`}
        className="flex h-2.5 w-full gap-0.5"
      >
        {drawn.map((segment) => (
          <span
            key={segment.id}
            data-track={segment.id}
            className={cn(
              'h-full min-w-1 first:rounded-l-pill last:rounded-r-pill',
              ALLOCATION_TRACK_COLORS[segment.id],
            )}
            style={{ flexGrow: segment.percent ?? 0, flexBasis: 0 }}
          />
        ))}
      </div>

      {/* Columns stop at 20rem, so a share sits near its label on a wide screen. */}
      <dl className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-10 sm:grid-cols-[repeat(2,minmax(0,20rem))]">
        {segments.map((segment) => {
          const percent = percentText(segment);
          return (
            <div
              key={segment.id}
              data-track={segment.id}
              // A long track name (uk "Накопичувальний резерв" at 320px) keeps its
              // words whole: the figures wrap under it, at the end edge.
              className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule-faint py-2.5"
            >
              {/* The swatch belongs to the term: a dl's div holds only dt and dd. */}
              <dt className="flex min-w-0 flex-1 items-center gap-3 type-body-sm text-muted-foreground">
                <span
                  aria-hidden
                  data-slot="swatch"
                  className={cn(
                    'size-2.5 shrink-0 rounded-edge',
                    ALLOCATION_TRACK_COLORS[segment.id],
                  )}
                />
                <span className="min-w-0">
                  {segment.definition ? (
                    <ExplainedTerm definition={segment.definition}>{segment.label}</ExplainedTerm>
                  ) : (
                    segment.label
                  )}
                </span>
              </dt>
              <dd className="ms-auto flex shrink-0 items-baseline gap-3 type-figure-sm text-foreground">
                {showAmounts ? (
                  segment.amount === null || segment.amount === undefined ? (
                    <UnknownValue label={unavailableLabel} />
                  ) : (
                    <span className="whitespace-nowrap">
                      {segment.approximate ? '~' : null}
                      <Amount value={segment.amount} unit="ETH" context="table" />
                    </span>
                  )
                ) : null}
                <span
                  className={cn(
                    'min-w-[3.5rem] text-end',
                    showAmounts ? 'text-subtle' : 'text-foreground',
                  )}
                >
                  {percent ?? <UnknownValue label={unavailableLabel} />}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
