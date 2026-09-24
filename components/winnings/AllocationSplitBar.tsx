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
  /** The share is approximate (the compounding remainder): shown with "~". */
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
 * How ETH splits across the allocation tracks: one proportional bar that
 * spans 100%, in the track colours every chart of the split uses
 * (config/allocationTracks), then a two-column legend in tabular figures:
 * each track's name (explained), its ETH where known, and its share. The
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

      <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
        {segments.map((segment) => {
          const percent = percentText(segment);
          return (
            <div
              key={segment.id}
              data-track={segment.id}
              className="flex min-h-11 items-center gap-3 border-b border-rule-faint py-2.5"
            >
              {/* The swatch belongs to the term: a dl's div holds only dt and dd. */}
              <dt className="flex min-w-0 flex-1 items-center gap-3 type-body-sm text-muted-foreground">
                <span
                  aria-hidden
                  className={cn(
                    'size-2.5 shrink-0 rounded-full',
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
              <dd className="flex shrink-0 items-baseline gap-3 type-figure-sm text-foreground">
                {showAmounts ? (
                  segment.amount === null || segment.amount === undefined ? (
                    <UnknownValue label={unavailableLabel} />
                  ) : (
                    <Amount value={segment.amount} unit="ETH" context="table" />
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
