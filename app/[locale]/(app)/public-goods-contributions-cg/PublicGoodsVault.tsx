'use client';

import { useId } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { OUTBOUND_LINKS } from '@/config/siteNav';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import type { DashboardInfo } from '@/services/api';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatPercent } from '@/utils/format';
import { ForwardVaultFunds } from '@/components/donations/ForwardVaultFunds';
import { useVaultBalance, vaultBalanceEth } from '@/components/donations/useVaultBalance';
import { VaultAddressRow } from '@/components/donations/VaultAddressRow';
import { SiteLink } from '@/components/layout/SiteLink';
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicGoodsVaultProps {
  /** The dashboard read; `null` or `undefined` while it loads or after it fails. */
  dashboard: DashboardInfo | null | undefined;
  loading: boolean;
}

const PROTOCOL_GUILD_URL = OUTBOUND_LINKS.find((link) => link.id === 'protocolGuild')!.href;

/**
 * The Public Goods Vault between the cycles that fill it and the retrievals
 * that empty it: who it pays (Protocol Guild, linked), the vault's address
 * with its evidence in the same labelled row as the Voluntary tab's, what the
 * live cycle will forward when it is finalized, what the vault holds now
 * (read from the chain when it answers) and what has left it, and, while it
 * holds ETH, the forward anyone may make. A figure that could not be read
 * shows the unavailable dash, never 0.
 */
export function PublicGoodsVault({ dashboard, loading }: PublicGoodsVaultProps) {
  const t = useTranslations('publicGoods');
  const tFormats = useTranslations('formats');
  const locale = useLocale();
  const { charity } = useContractAddresses();
  const headingId = useId();
  const chainBalance = useVaultBalance(charity);
  const inVault = vaultBalanceEth(chainBalance, toFiniteNumber(dashboard?.CharityBalanceEth));

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
      // The chain's reading once it answers; a skeleton while it is being read.
      value: inVault === undefined ? <Skeleton className="h-7 w-28" /> : eth(inVault),
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
      />
      <p className="-mt-3 mb-5 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground sm:-mt-5">
        {t.rich('vault.beneficiaryNote', {
          guild: (chunks) => (
            <SiteLink
              href={PROTOCOL_GUILD_URL}
              kind="external"
              externalIcon={false}
              className="link"
            >
              {chunks}
              <ArrowUpRight aria-hidden className="ms-0.5 inline size-3.5 align-[-0.125em]" />
            </SiteLink>
          ),
        })}
      </p>
      {charity ? <VaultAddressRow address={charity} className="mb-2" /> : null}
      <PageHeaderFigures figures={figures} className="mt-0 sm:mt-0" />
      {charity && typeof inVault === 'number' && inVault > 0 ? (
        <ForwardVaultFunds
          vaultAddress={charity}
          note={t('vault.forwardNote')}
          className="mt-6 max-w-xl"
        />
      ) : null}
    </section>
  );
}
