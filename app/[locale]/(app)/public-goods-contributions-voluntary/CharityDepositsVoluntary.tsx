'use client';

import { useId, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { EXPLORER_NAME } from '@/lib/chainGuard';
import { useCharityVoluntary } from '@/hooks/useApiQuery';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { ContractEvidence } from '@/components/legal/ContractEvidence';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { AddressChip } from '@/components/ui/address-chip';
import { SectionHeader } from '@/components/ui/section-header';

/**
 * How to take part, whatever the ledger holds: the vault by name, where the
 * ETH goes, and its address to copy and check on the explorer.
 */
function ContributeToVault() {
  const t = useTranslations('publicGoods');
  const tFormats = useTranslations('formats');
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
      {charity ? (
        <dl className="flex flex-col gap-1.5 border-y border-rule-faint py-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-6">
          <dt className="type-label text-subtle">{tFormats('address.known.publicGoods')}</dt>
          <dd className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
            <AddressChip
              address={charity}
              variant="plain"
              label={false}
              href={false}
              display="responsive"
              className="type-hash text-foreground"
            />
            <ContractEvidence
              address={charity}
              labels={{ explorer: EXPLORER_NAME, sourcify: 'Sourcify' }}
            />
          </dd>
        </dl>
      ) : null}
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
