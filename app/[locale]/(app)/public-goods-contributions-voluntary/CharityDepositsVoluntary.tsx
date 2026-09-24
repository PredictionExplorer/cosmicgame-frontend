'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { LedgerPage } from '@/components/ledger/LedgerPage';
import { AddressChip } from '@/components/ui/address-chip';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { useCharityVoluntary } from '@/hooks/useApiQuery';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

/**
 * Voluntary Public Goods contributions: ETH sent straight to the Public Goods
 * Vault. `header` is the server-rendered page header, with the group's tabs
 * on its rule.
 */
const CharityDepositsVoluntary = ({ header }: { header: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const tFormats = useTranslations('formats');
  const { charity } = useContractAddresses();
  const { data, isLoading, isError, refetch } = useCharityVoluntary();

  return (
    <LedgerPage header={header}>
      <CharityDepositTable
        list={(data ?? []) as PublicGoodsContributionEntry[]}
        loading={isLoading}
        error={isError ? t('loadError') : undefined}
        onRetry={() => void refetch()}
        title={tTables('names.publicGoodsContributions')}
        emptyDescription={tTables('publicGoods.voluntaryEmpty')}
        emptyAction={
          charity ? (
            // The vault by name, with its address to copy: a bare hex chip
            // gave no hint which address it was.
            <p className="flex flex-col items-center gap-1.5">
              <span className="type-label text-subtle">
                {tFormats('address.known.publicGoods')}
              </span>
              <AddressChip address={charity} label={false} href={false} display="responsive" />
            </p>
          ) : null
        }
      />
    </LedgerPage>
  );
};

export default CharityDepositsVoluntary;
