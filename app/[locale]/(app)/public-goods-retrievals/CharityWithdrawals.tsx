'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { LedgerPage } from '@/components/ledger/LedgerPage';
import CharityWithdrawalTable, {
  type CharityWithdrawal,
} from '@/components/tables/CharityWithdrawalTable';
import { useCharityWithdrawals } from '@/hooks/useApiQuery';

/**
 * Public Goods retrievals: ETH forwarded out of the Public Goods Vault to its
 * beneficiary. `header` is the server-rendered page header, with the group's
 * tabs on its rule.
 */
const CharityWithdrawals = ({ header }: { header: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const { data, isLoading, isError, refetch } = useCharityWithdrawals();

  return (
    <LedgerPage header={header}>
      <CharityWithdrawalTable
        list={(data ?? []) as CharityWithdrawal[]}
        loading={isLoading}
        error={isError ? t('loadError') : undefined}
        onRetry={() => void refetch()}
        title={t('ledger.retrievals')}
      />
    </LedgerPage>
  );
};

export default CharityWithdrawals;
