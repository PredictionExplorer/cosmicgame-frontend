'use client';

import { useTranslations } from 'next-intl';

import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '@/components/tables/GlobalMarketingRewardsTable';
import type { LedgerStateProps } from '@/components/tables/ledger-props';

export interface RewardsHistorySectionProps extends LedgerStateProps {
  rewards: MarketingReward[];
}

/**
 * Every Outreach Reserve allocation, newest first, as the site's one ledger:
 * a titled table whose pager says how many there are, and the shared empty,
 * loading and error states.
 */
export function RewardsHistorySection({ rewards, ...state }: RewardsHistorySectionProps) {
  const t = useTranslations('marketing.history');

  return (
    <GlobalMarketingRewardsTable
      list={rewards}
      title={t('title')}
      description={t('description')}
      emptyDescription={t('emptyDescription')}
      {...state}
    />
  );
}
