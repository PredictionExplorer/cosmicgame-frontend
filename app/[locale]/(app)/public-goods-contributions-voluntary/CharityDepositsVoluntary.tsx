'use client';

import { useId, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

import { protocolFacts } from '@/content/protocol-facts';

import { EXPLORER_NAME, REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { useCharityVoluntary } from '@/hooks/useApiQuery';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { VaultContributionForm } from '@/components/contributions/VaultContributionForm';
import { ContractEvidence } from '@/components/legal/ContractEvidence';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import {
  CharityDepositTable,
  type PublicGoodsContributionEntry,
} from '@/components/tables/CharityDepositTable';
import { AddressChip } from '@/components/ui/address-chip';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';

/**
 * How to take part, whatever the ledger holds: the vault by name, the one
 * network it exists on, its full address to check and copy, and the form
 * that sends ETH to it from a connected wallet (switching the wallet to that
 * network first). Sending to the address from another network loses the ETH,
 * so the network is named three times: in the description, beside the
 * address, and in a warning line.
 */
function ContributeToVault({ onContributed }: { onContributed: () => void }) {
  const t = useTranslations('publicGoods');
  const tFormats = useTranslations('formats');
  const { charity } = useContractAddresses();
  const headingId = useId();
  const beneficiary = protocolFacts.publicGoodsBeneficiary.name;

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader
        headingId={headingId}
        title={t('contribute.title')}
        description={t('contribute.description', { network: REQUIRED_CHAIN_NAME, beneficiary })}
      />
      {charity ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-12">
          <div className="flex min-w-0 flex-col gap-4">
            <dl className="flex flex-col gap-4 border-y border-rule-faint py-4">
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className="type-label text-subtle">{tFormats('address.known.publicGoods')}</dt>
                <dd className="flex min-w-0 flex-col items-start gap-2">
                  {/* The whole checksummed address, wrapping on a phone, so it
                      can be checked against a wallet's by eye. */}
                  <AddressChip
                    address={charity}
                    variant="plain"
                    label={false}
                    href={false}
                    display="full"
                    className="type-hash whitespace-normal text-foreground [overflow-wrap:anywhere]"
                  />
                  <ContractEvidence
                    address={charity}
                    labels={{ explorer: EXPLORER_NAME, sourcify: 'Sourcify' }}
                  />
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <dt className="type-label text-subtle">{t('contribute.network')}</dt>
                <dd>
                  <Badge tone="neutral" size="md">
                    {REQUIRED_CHAIN_NAME}
                  </Badge>
                </dd>
              </div>
            </dl>
            <p className="flex gap-2 type-body-sm text-muted-foreground">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-attention" />
              <span>{t('contribute.networkWarning', { network: REQUIRED_CHAIN_NAME })}</span>
            </p>
          </div>
          <VaultContributionForm
            vaultAddress={charity as Address}
            beneficiary={beneficiary}
            onSuccess={onContributed}
          />
        </div>
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
      <ContributeToVault onContributed={() => void refetch()} />
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
