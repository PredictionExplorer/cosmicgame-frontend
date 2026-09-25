'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { useCharityVoluntary } from '@/hooks/useApiQuery';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { VaultAddressRow } from '@/components/donations/VaultAddressRow';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { SectionHeader } from '@/components/ui/section-header';

/**
 * How to take part, whatever the ledger holds: the vault by name, where the
 * ETH goes, and its address to copy and check on the explorer.
 */
function ContributeToVault() {
  const t = useTranslations('publicGoods');
  const { charity } = useContractAddresses();
  const headingId = useId();

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader
        headingId={headingId}
        title={t('contribute.title')}
        description={t('contribute.description', {
          beneficiary: protocolFacts.publicGoodsBeneficiary.name,
        })}
      />
      {charity ? <VaultAddressRow address={charity} /> : null}
    </section>
  );
}

/**
 * Voluntary Public Goods contributions: how to send one to the Public Goods
 * Vault (kept above the ledger, so the page says how to take part once it
 * holds rows too), then every one sent. `header` is the server-rendered page
 * header, with the group's tabs on its rule.
 */
const CharityDepositsVoluntary = ({ header }: { header: ReactNode }) => {
  const t = useTranslations('publicGoods');
  const tTables = useTranslations('tables');
  const { data, isLoading, isError, refetch } = useCharityVoluntary();

  return (
    <LedgerPage header={header}>
      <ContributeToVault />
      <CharityDepositTable
        list={(data ?? []) as PublicGoodsContributionEntry[]}
        loading={isLoading}
        error={isError ? t('loadError') : undefined}
        onRetry={() => void refetch()}
        title={t('ledger.contributions')}
        emptyDescription={tTables('publicGoods.voluntaryEmpty')}
      />
    </LedgerPage>
  );
};

export default CharityDepositsVoluntary;
