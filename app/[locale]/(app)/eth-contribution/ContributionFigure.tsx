'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formatCount } from '@/utils/format';
import { useDonationsBoth } from '@/hooks/useApiQuery';
import { summarizeContributions } from '@/components/contributions/summary';
import { Amount } from '@/components/ui/amount';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

/** The /eth-contribution header figures. */
export type ContributionMetric = 'records' | 'totalEth' | 'contributors';

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
  // A headline figure: "30 ETH", not the table's "30.0000 ETH".
  if (metric === 'totalEth') return <Amount value={summary.totalEth} unit="ETH" context="hero" />;
  return <>{formatCount(summary[metric], locale)}</>;
}
