'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PublicGoodsImpactCard } from '@/components/home/PublicGoodsImpactCard';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityCGDeposits, useDashboardInfo } from '@/hooks/useApiQuery';

/**
 * The protocol's Public Goods contributions: every cycle's share forwarded to
 * the Public Goods Vault. `header` is the server-rendered page header, with
 * the group's tabs on its rule.
 */
const CharityCGDeposits = ({ header }: { header: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const { data, isLoading, isError, refetch } = useCharityCGDeposits();
  const { data: dashboardData } = useDashboardInfo(undefined, { poll: false });

  return (
    <LedgerPage header={header}>
      <PublicGoodsImpactCard data={dashboardData ?? null} variant="compact" />
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
