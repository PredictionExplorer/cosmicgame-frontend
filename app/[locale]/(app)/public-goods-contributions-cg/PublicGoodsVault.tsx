'use client';

import { useId } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import type { DashboardInfo } from '@/services/api';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatPercent } from '@/utils/format';
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicGoodsVaultProps {
  /** The dashboard read; `null` or `undefined` while it loads or after it fails. */
  dashboard: DashboardInfo | null | undefined;
  loading: boolean;
}

/**
 * The Public Goods Vault between the cycles that fill it and the retrievals
 * that empty it: what the live cycle will forward when it is finalized, what
 * the vault holds now and what has left it, with the vault's address to
 * copy. A figure that could not be read shows the unavailable dash, never 0.
 */
export function PublicGoodsVault({ dashboard, loading }: PublicGoodsVaultProps) {
  const t = useTranslations('publicGoods');
  const tFormats = useTranslations('formats');
  const locale = useLocale();
  const { charity } = useContractAddresses();
  const headingId = useId();

  const percent = toFiniteNumber(dashboard?.CharityPercentage);
  const reserve = toFiniteNumber(dashboard?.CosmicGameBalanceEth);
  const due = percent !== null && reserve !== null ? (reserve * percent) / 100 : null;

  const eth = (value: number | null) =>
    loading ? (
      <Skeleton className="h-7 w-28" />
    ) : value === null ? null : (
      <Amount value={value} unit="ETH" />
    );

  const figures: PageHeaderFigure[] = [
    {
      id: 'due',
      label: t('vault.due'),
      value: eth(due),
      caption:
        percent !== null
          ? t('vault.dueCaption', { percent: formatPercent(percent, locale) })
          : undefined,
    },
    {
      id: 'inVault',
      label: t('vault.inVault'),
      value: eth(toFiniteNumber(dashboard?.CharityBalanceEth)),
    },
    {
      id: 'retrieved',
      label: t('vault.retrieved'),
      value: eth(toFiniteNumber(dashboard?.MainStats?.SumWithdrawals)),
    },
  ];

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader
        headingId={headingId}
        title={tFormats('address.known.publicGoods')}
        description={t('vault.description', {
          beneficiary: protocolFacts.publicGoodsBeneficiary.name,
        })}
        actions={
          charity ? (
            <AddressChip address={charity} label={false} href={false} display="responsive" />
          ) : null
        }
      />
      <PageHeaderFigures figures={figures} className="mt-0 sm:mt-0" />
    </section>
  );
}
