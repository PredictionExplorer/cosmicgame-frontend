'use client';

import { useTranslations } from 'next-intl';

import {
  ALLOCATION_TRACK_COLORS,
  ALLOCATION_TRACK_COPY_KEYS,
  withNextCycleShare,
} from '@/config/allocationTracks';
import { cn } from '@/lib/utils';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
import type { DashboardInfo } from '@/services/api/types';
import { UnknownValue } from '@/components/ui/unknown-value';

/** A track's share of the reserve, clamped into [0, 100]; `null` when it could not be read. */
function share(value: unknown): number | null {
  const numeric = toFiniteNumber(value);
  return numeric === null ? null : Math.min(100, Math.max(0, numeric));
}

/**
 * Where the Cycle Reserve goes when a cycle finalizes: one proportional bar
 * across 100% in the allocation tracks' order and colours (the same map as
 * /current-cycle, /allocation and /contracts), and a legend of shares in
 * tabular figures. Shares come from the live dashboard; a share that could
 * not be read shows as unavailable with no segment, never as 0%.
 */
export function ReserveSplit({
  data,
  className,
}: {
  data: Pick<
    DashboardInfo,
    | 'PrizePercentage'
    | 'ChronoWarriorPercentage'
    | 'RafflePercentage'
    | 'StakingPercentage'
    | 'CharityPercentage'
  >;
  className?: string;
}) {
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const shares = withNextCycleShare([
    { id: 'signature', percent: share(data.PrizePercentage) },
    { id: 'chrono', percent: share(data.ChronoWarriorPercentage) },
    { id: 'stellar', percent: share(data.RafflePercentage) },
    { id: 'anchor', percent: share(data.StakingPercentage) },
    { id: 'publicGoods', percent: share(data.CharityPercentage) },
  ]);
  const label = (id: (typeof shares)[number]['id']) =>
    t(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.label`);

  return (
    <div className={cn('min-w-0', className)}>
      <div aria-hidden className="flex h-2.5 w-full gap-px overflow-hidden rounded-pill bg-rule">
        {shares.map(({ id, percent }) =>
          percent ? (
            <span
              key={id}
              data-track={id}
              className={cn('h-full', ALLOCATION_TRACK_COLORS[id])}
              style={{ width: `${percent}%` }}
            />
          ) : null,
        )}
      </div>
      {/* Columns stop at 15rem, so a share sits near its label on a wide screen. */}
      <ul className="mt-5 grid gap-x-10 gap-y-2.5 sm:grid-cols-[repeat(2,minmax(0,15rem))] xl:grid-cols-[repeat(3,minmax(0,15rem))]">
        {shares.map(({ id, percent }) => (
          <li key={id} className="flex items-baseline justify-between gap-4 type-body-sm">
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span
                aria-hidden
                className={cn('size-2.5 shrink-0 rounded-edge', ALLOCATION_TRACK_COLORS[id])}
              />
              {label(id)}
            </span>
            <span className="shrink-0 type-figure-sm text-foreground">
              {percent === null ? (
                <UnknownValue label={tCommon('status.unavailable')} />
              ) : (
                format.percent(percent)
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
