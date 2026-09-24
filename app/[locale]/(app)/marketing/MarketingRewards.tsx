'use client';

import { useTranslations } from 'next-intl';

import { useMarketingRewards } from '@/hooks/useApiQuery';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { MarketingReward } from '@/services/api/types';
import { TopMarketersLeaderboard } from '@/components/marketing/TopMarketersLeaderboard';
import { RewardsHistorySection } from '@/components/marketing/RewardsHistorySection';

const NO_REWARDS: MarketingReward[] = [];

/**
 * The outreach page's two ledgers, from one read of every allocation: the
 * top contributors and the full history. Both hold their places with
 * placeholder rows while the read is in flight; a failed read is reported
 * once, by the history, with a retry. The page's figures are in the
 * server-rendered header.
 */
export default function MarketingRewards() {
  const t = useTranslations('marketing');
  const { data, isLoading, isError, refetch } = useMarketingRewards();
  const rewards = data ?? NO_REWARDS;

  const state: LedgerStateProps = {
    loading: isLoading,
    error: isError ? t('loadError') : undefined,
    onRetry: () => void refetch(),
  };

  // With no allocations yet, or none readable, the history's empty or error
  // state says so once; the ranking above it would only repeat it.
  const showRanking = isLoading || rewards.length > 0;

  return (
    <>
      {showRanking && <TopMarketersLeaderboard rewards={rewards} {...state} />}
      <RewardsHistorySection rewards={rewards} {...state} />
    </>
  );
}
