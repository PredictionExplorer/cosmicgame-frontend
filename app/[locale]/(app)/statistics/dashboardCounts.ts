import { toFiniteNumber } from '@/utils/finiteNumber';
import type { DashboardInfo } from '@/services/api/types';

/**
 * The dashboard counts the statistics section headers show, shared by the
 * server (which reads the value for the server HTML) and
 * `DashboardCountFigure` (which keeps it live). Kept out of the client module
 * so server components can call it.
 */
export type DashboardCountMetric =
  | 'uniqueParticipants'
  | 'uniqueRecipients'
  | 'uniqueContributors'
  | 'attachedNfts';

/** The number behind a dashboard count, or null when the dashboard does not carry it. */
export function dashboardCount(
  data: DashboardInfo | null | undefined,
  metric: DashboardCountMetric,
): number | null {
  if (!data) return null;
  switch (metric) {
    case 'uniqueParticipants':
      return toFiniteNumber(data.MainStats?.NumUniqueBidders);
    case 'uniqueRecipients':
      return toFiniteNumber(data.MainStats?.NumUniqueWinners);
    case 'uniqueContributors':
      return toFiniteNumber(data.MainStats?.NumUniqueDonors);
    case 'attachedNfts':
      return toFiniteNumber(data.NumDonatedNFTs);
  }
}
