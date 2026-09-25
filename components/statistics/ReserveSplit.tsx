'use client';

import { useTranslations } from 'next-intl';

import { ALLOCATION_TRACK_COPY_KEYS, withNextCycleShare } from '@/config/allocationTracks';
import { toFiniteNumber } from '@/utils/finiteNumber';
import type { DashboardInfo } from '@/services/api/types';
import { AllocationSplitBar, type AllocationSplitSegment } from '@/components/ui/allocation-split';

/** A track's share of the reserve, clamped into [0, 100]; `null` when it could not be read. */
function share(value: unknown): number | null {
  const numeric = toFiniteNumber(value);
  return numeric === null ? null : Math.min(100, Math.max(0, numeric));
}

/**
 * Where the Cycle Reserve goes when a cycle finalizes, from the live
 * dashboard's shares, drawn by the one compact split (AllocationSplitBar):
 * the same bar, swatches, remainder and "~" as /allocation. A share that
 * could not be read shows as unavailable with no segment, never as 0%.
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
  const tStatistics = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const shares = withNextCycleShare([
    { id: 'signature', percent: share(data.PrizePercentage) },
    { id: 'chrono', percent: share(data.ChronoWarriorPercentage) },
    { id: 'stellar', percent: share(data.RafflePercentage) },
    { id: 'anchor', percent: share(data.StakingPercentage) },
    { id: 'publicGoods', percent: share(data.CharityPercentage) },
  ]);
  const segments: AllocationSplitSegment[] = shares.map(({ id, percent }) => ({
    id,
    label: t(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.label`),
    definition: t(`funds.segments.${ALLOCATION_TRACK_COPY_KEYS[id]}.tooltip`),
    percent,
    // What is left after the tracks rolls forward: approximate, as every page says.
    approximate: id === 'nextCycle',
  }));

  return (
    <AllocationSplitBar
      segments={segments}
      label={tStatistics('hub.cycle.splitTitle')}
      unavailableLabel={tCommon('status.unavailable')}
      className={className}
    />
  );
}
