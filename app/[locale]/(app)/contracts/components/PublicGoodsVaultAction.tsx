'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Inbox } from 'lucide-react';

import { protocolFacts } from '@/content/protocol-facts';

import { cn } from '@/lib/utils';
import { formatPercent, sameAddress } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { ForwardVaultFunds } from '@/components/donations/ForwardVaultFunds';
import { useVaultBalance, vaultBalanceEth } from '@/components/donations/useVaultBalance';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';

export interface PublicGoodsVaultActionProps {
  /** The Public Goods Vault contract. */
  vaultAddress: string;
  /** `charityAddress()` on the vault: `undefined` while it is read, `null` when it failed. */
  beneficiaryAddress: string | null | undefined;
  /**
   * ETH in the vault as the dashboard reports it; `undefined` while it loads.
   * The chain's own reading replaces it whenever the chain answers.
   */
  vaultBalanceEth: number | null | undefined;
  /** The Public Goods share of each Cycle Reserve, percent. */
  sharePercent: number | null | undefined;
}

/**
 * Public Goods: the vault, its beneficiary and share, the balance waiting in
 * the vault (read from the chain, so a forward that just happened is not
 * offered again), and, only when there is a balance, the action that
 * forwards it, in a well beside the figures. With nothing to forward, a
 * caption under the balance says why and the figures take the width. A
 * balance that could not be read is said as such: the panel neither calls
 * the vault empty nor offers an action it cannot vouch for.
 */
export function PublicGoodsVaultAction({
  vaultAddress,
  beneficiaryAddress,
  vaultBalanceEth: dashboardBalanceEth,
  sharePercent,
}: PublicGoodsVaultActionProps) {
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const chainBalance = useVaultBalance(vaultAddress);

  if (!vaultAddress) return null;

  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const balance = vaultBalanceEth(chainBalance, dashboardBalanceEth);
  const hasFunds = typeof balance === 'number' && balance > 0;
  const share = toFiniteNumber(sharePercent);
  // Named only when it is the documented beneficiary; any other address reads as hex.
  const { name: beneficiaryName, address: documentedBeneficiary } =
    protocolFacts.publicGoodsBeneficiary;

  const rows = [
    {
      id: 'vault',
      label: t('vault.vaultAddress'),
      definition: t('vault.tooltip'),
      value: <AddressChip address={vaultAddress} variant="plain" label={false} href={false} />,
    },
    {
      id: 'beneficiary',
      label: t('parameters.publicGoodsAddress'),
      definition: t('parameters.publicGoodsAddressTooltip'),
      value:
        beneficiaryAddress === undefined ? (
          <Skeleton className="h-4 w-28" />
        ) : beneficiaryAddress === null ? (
          unknown
        ) : (
          <AddressChip
            address={beneficiaryAddress}
            variant="plain"
            href={false}
            label={
              sameAddress(beneficiaryAddress, documentedBeneficiary) ? beneficiaryName : undefined
            }
          />
        ),
    },
    {
      id: 'share',
      label: t('vault.share'),
      definition: null,
      value:
        sharePercent === undefined ? (
          <Skeleton className="h-4 w-10" />
        ) : share === null ? (
          unknown
        ) : (
          formatPercent(share, locale)
        ),
    },
    {
      id: 'balance',
      label: t('vault.balance'),
      definition: null,
      value:
        balance === undefined ? (
          <Skeleton className="h-4 w-20" />
        ) : balance === null ? (
          unknown
        ) : (
          <Amount value={balance} unit="ETH" />
        ),
    },
  ];

  return (
    <section aria-labelledby="public-goods-heading">
      <SectionHeader
        headingId="public-goods-heading"
        title={t('vault.title')}
        description={t('vault.description')}
      />
      <div
        className={cn(
          'mt-6',
          hasFunds &&
            'grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start',
        )}
      >
        <div className={cn(!hasFunds && 'max-w-3xl')}>
          <dl>
            {rows.map((row) => (
              <div
                key={row.id}
                data-row={row.id}
                className="flex min-h-12 items-center justify-between gap-4 border-b border-rule-faint py-2.5"
              >
                <dt className="min-w-0 type-body-sm text-muted-foreground">
                  {row.definition ? (
                    <ExplainedTerm definition={row.definition} announce="moreInformation">
                      {row.label}
                    </ExplainedTerm>
                  ) : (
                    row.label
                  )}
                </dt>
                <dd className="min-w-0 text-end type-figure-sm text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
          {/* Why there is no action, said under the balance it is about. */}
          {balance === null ? (
            <p
              data-testid="vault-balance-unavailable"
              className="mt-3 type-caption text-muted-foreground"
            >
              {t('vault.balanceUnavailable')}
            </p>
          ) : balance === 0 ? (
            <p
              data-testid="vault-empty"
              className="mt-3 flex items-start gap-2 type-caption text-muted-foreground"
            >
              <Inbox aria-hidden className="mt-px size-3.5 shrink-0 text-subtle" />
              {t('vault.empty')}
            </p>
          ) : null}
        </div>

        {hasFunds ? <ForwardVaultFunds vaultAddress={vaultAddress} note={t('vault.note')} /> : null}
      </div>
    </section>
  );
}
