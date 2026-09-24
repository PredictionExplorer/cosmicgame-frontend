'use client';

import { useLocale, useTranslations } from 'next-intl';
import { isAddress } from 'viem';

import { formatCount } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useDonationsBoth } from '@/hooks/useApiQuery';
import { Amount } from '@/components/ui/amount';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

/** The /eth-contribution header figures. */
export type ContributionMetric = 'records' | 'totalEth' | 'contributors';

/** What the header figures count, from the contribution rows. */
export function summarizeContributions(
  rows: readonly { AmountEth?: unknown; DonorAddr?: unknown }[],
): { records: number; totalEth: number; contributors: number } {
  const contributors = new Set<string>();
  let totalEth = 0;
  for (const row of rows) {
    totalEth += toFiniteNumber(row.AmountEth) ?? 0;
    if (typeof row.DonorAddr === 'string' && isAddress(row.DonorAddr, { strict: false })) {
      contributors.add(row.DonorAddr.toLowerCase());
    }
  }
  return { records: rows.length, totalEth, contributors: contributors.size };
}

/**
 * One /eth-contribution header figure, read from the same client query as the
 * ledger below it (`useDonationsBoth`, seeded from the server's read), so the
 * server HTML is unchanged and a new contribution moves the figure and its
 * row together instead of leaving the header on the page's ISR snapshot.
 */
export function ContributionFigure({ metric }: { metric: ContributionMetric }) {
  const t = useTranslations('common');
  const locale = useLocale();
  const { data, isLoading } = useDonationsBoth();

  if (data === undefined) {
    return isLoading ? (
      <Skeleton className="h-7 w-20" />
    ) : (
      <UnknownValue label={t('status.unavailable')} />
    );
  }
  const summary = summarizeContributions(data);
  if (metric === 'totalEth') return <Amount value={summary.totalEth} unit="ETH" />;
  return <>{formatCount(summary[metric], locale)}</>;
}
