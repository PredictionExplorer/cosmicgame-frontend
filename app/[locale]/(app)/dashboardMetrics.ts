import type { DashboardInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * The dashboard figures page headers show, shared by the server (which reads
 * the value for the server HTML) and `DashboardFigure` (which keeps it live).
 * Kept out of the client module so server components can call these.
 */
export type DashboardMetric =
  | 'cycle'
  | 'gestures'
  | 'reserve'
  | 'balance'
  | 'imprinted'
  | 'allocations'
  | 'opened';

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

/**
 * The server's value for a header figure: the metric's number (null when the
 * dashboard does not carry it), or undefined when the server read failed, so
 * the figure waits for the client's read instead of saying "unavailable".
 */
export function dashboardSeed(
  data: DashboardInfo | null | undefined,
  metric: DashboardMetric,
): number | null | undefined {
  return data ? dashboardMetricValue(data, metric) : undefined;
}

/** The number behind a metric, or null when the dashboard does not carry it. */
export function dashboardMetricValue(
  data: DashboardInfo | null | undefined,
  metric: DashboardMetric,
): number | null {
  if (!data) return null;
  switch (metric) {
    case 'cycle':
      return toFiniteNumber(data.CurRoundNum);
    case 'gestures':
      return toFiniteNumber(data.CurNumBids);
    case 'reserve':
      return toFiniteNumber(data.PrizeAmountEth ?? data.CurPrizeAmountEth);
    case 'balance':
      return toFiniteNumber(data.CosmicGameBalanceEth);
    case 'imprinted':
      return toFiniteNumber(data.MainStats?.NumCSTokenMints);
    case 'allocations':
      return totalAllocationsDistributed(data);
    case 'opened': {
      const opened = toFiniteNumber(data.TsRoundStart);
      return opened && opened > 0 ? opened : null;
    }
  }
}
