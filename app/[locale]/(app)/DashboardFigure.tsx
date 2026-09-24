'use client';

import { useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useFormat } from '@/hooks/useFormat';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import type { DashboardInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';

/** Allocation rows: the cg_prize row count, else the aggregated recipient counts. */
export function totalAllocationsDistributed(data: DashboardInfo): number | null {
  return toFiniteNumber(
    data.CgPrizeRowCount ??
      data.MainStats?.CgPrizeRowCount ??
      data.TotalPrizeAwards ??
      data.MainStats?.TotalPrizeAwards ??
      data.TotalPrizes,
  );
}

export type DashboardMetric =
  | 'cycle'
  | 'gestures'
  | 'reserve'
  | 'balance'
  | 'imprinted'
  | 'allocations'
  | 'opened';

/**
 * One figure of the live dashboard for a page header. It reads the same
 * polled query as the page body (seeded on the server by `DashboardQuerySeed`),
 * so the header and the body can never show two values for one metric, and
 * the server HTML already holds the number.
 */
export function DashboardFigure({ metric }: { metric: DashboardMetric }) {
  const t = useTranslations('common');
  const format = useFormat();
  const { data, isLoading } = useDashboardInfo();

  if (!data) {
    return isLoading ? (
      <Skeleton className="mt-1 h-6 w-20" aria-hidden />
    ) : (
      <UnknownValue label={t('status.unavailable')} />
    );
  }

  const unknown = <UnknownValue label={t('status.unavailable')} />;
  const count = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : format.count(numeric);
  };
  const eth = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? unknown : <Amount value={numeric} unit="ETH" />;
  };

  switch (metric) {
    case 'cycle':
      return count(data.CurRoundNum);
    case 'gestures':
      return count(data.CurNumBids);
    case 'reserve':
      return eth(data.PrizeAmountEth ?? data.CurPrizeAmountEth);
    case 'balance':
      return eth(data.CosmicGameBalanceEth);
    case 'imprinted':
      return count(data.MainStats?.NumCSTokenMints);
    case 'allocations':
      return count(totalAllocationsDistributed(data));
    case 'opened': {
      const opened = toFiniteNumber(data.TsRoundStart);
      return opened ? <DateTime timestamp={opened} /> : unknown;
    }
  }
}
