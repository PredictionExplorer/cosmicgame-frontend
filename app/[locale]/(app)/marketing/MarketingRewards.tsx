'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { PageShell } from '@/components/ui/page-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketingRewards } from '@/hooks/useApiQuery';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import type { MarketingReward } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { MarketingHero } from '@/components/marketing/MarketingHero';
import { MarketingStats } from '@/components/marketing/MarketingStats';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { TopMarketersLeaderboard } from '@/components/marketing/TopMarketersLeaderboard';
import { RewardsHistorySection } from '@/components/marketing/RewardsHistorySection';
import { MarketingCTA } from '@/components/marketing/MarketingCTA';

/** The three figures' places while they load, at their finished height. */
function StatsPlaceholder() {
  return (
    <div aria-hidden className="grid gap-6 pb-8 sm:grid-cols-3 sm:pb-10">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-[7.5rem] rounded-xl" />
      ))}
    </div>
  );
}

/** The leaderboard's and history's place while the allocations load. */
function LedgerPlaceholder({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 py-8 sm:py-10">
      <Skeleton className="mx-auto mb-8 h-8 w-64 max-w-full" />
      {[0, 1, 2, 3, 4].map((index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * The outreach page. `seoSummary` is the server-rendered page header, the
 * page's only header: it carries the program's figures, so the body does not
 * repeat them. What does not depend on the chain (how it works, the call to
 * action) renders at once; the two ledgers hold their places with placeholders
 * until their reads land, rather than the whole page waiting behind one spinner.
 */
const MarketingRewards = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('marketing');
  const { data: marketingRewards, isLoading: rewardsLoading } = useMarketingRewards();
  const { data: dashboard, isLoading: dashboardLoading } = useDashboardInfo();

  // The stat row, drawn only when there is no server header, needs both reads.
  const statsLoading = rewardsLoading || dashboardLoading;

  const rewards = useMemo(() => (marketingRewards ?? []) as MarketingReward[], [marketingRewards]);

  // `null` until the list is read, so a failed read shows as unknown rather than 0.
  const activeMarketers = useMemo(
    () => (marketingRewards ? new Set(rewards.map((r) => r.MarketerAddr)).size : null),
    [marketingRewards, rewards],
  );

  // `TotalMktRewardsEth` is a CST amount despite its wire name. A figure the dashboard read
  // did not return stays `null` (unknown), never a confident 0.
  const totalAllocatedCst = toFiniteNumber(dashboard?.MainStats?.TotalMktRewardsEth);
  const rewardTransactions = toFiniteNumber(dashboard?.MainStats?.NumMktRewards);

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <>
          <MarketingHero />
          {statsLoading ? (
            <StatsPlaceholder />
          ) : (
            <MarketingStats
              totalAllocatedCst={totalAllocatedCst}
              activeMarketers={activeMarketers}
              rewardTransactions={rewardTransactions}
            />
          )}
        </>
      )}
      <HowItWorks />
      {rewardsLoading ? (
        <LedgerPlaceholder label={t('loadingAria')} />
      ) : (
        <>
          <TopMarketersLeaderboard rewards={rewards} />
          <RewardsHistorySection rewards={rewards} />
        </>
      )}
      <MarketingCTA />
    </PageShell>
  );
};

export default MarketingRewards;
