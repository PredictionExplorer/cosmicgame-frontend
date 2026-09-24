'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { LedgerPage } from '@/components/ledger/LedgerPage';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits, useDashboardInfo } from '@/hooks/useApiQuery';

import { PublicGoodsVault } from './PublicGoodsVault';

/**
 * The protocol's Public Goods contributions: the vault they fill (what the
 * live cycle will forward, what it holds, what has been retrieved), then
 * every cycle's share forwarded to it. `header` is the server-rendered page
 * header, with the group's tabs on its rule.
 */
const CharityCGDeposits = ({ header }: { header: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const { data, isLoading, isError, refetch } = useCharityCGDeposits();
  const dashboard = useDashboardInfo(undefined, { poll: false });

  return (
    <LedgerPage header={header}>
      <PublicGoodsVault dashboard={dashboard.data} loading={dashboard.isLoading} />
      <CharityDepositTable
        list={(data ?? []) as PublicGoodsContributionEntry[]}
        loading={isLoading}
        error={isError ? t('loadError') : undefined}
        onRetry={() => void refetch()}
        title={tTables('names.publicGoodsContributions')}
      />
    </LedgerPage>
  );
};

export default CharityCGDeposits;
