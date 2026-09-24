'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { SendHorizontal } from 'lucide-react';

import { charityWalletAbi as CHARITY_WALLET_ABI } from '@/contracts/abis';
import { protocolFacts } from '@/content/protocol-facts';

import { formatPercent, sameAddress } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { useActiveWeb3React } from '@/hooks/web3';

export interface PublicGoodsVaultActionProps {
  /** The Public Goods Vault contract. */
  vaultAddress: string;
  /** `charityAddress()` on the vault: `undefined` while it is read, `null` when it failed. */
  beneficiaryAddress: string | null | undefined;
  /** ETH in the vault now; `undefined` while the dashboard loads. */
  vaultBalanceEth: number | null | undefined;
  /** The Public Goods share of each Cycle Reserve, percent. */
  sharePercent: number | null | undefined;
}

/**
 * Public Goods: the vault, its beneficiary and share, the balance waiting in
 * the vault, and, only when there is a balance, the action that forwards it.
 * Anyone may call the vault's send(); it pays out to the beneficiary, never to
 * the caller, so the action is offered to every connected wallet. A balance
 * that could not be read is said as such: the panel neither calls the vault
 * empty nor offers an action it cannot vouch for.
 */
export function PublicGoodsVaultAction({
  vaultAddress,
  beneficiaryAddress,
  vaultBalanceEth,
  sharePercent,
}: PublicGoodsVaultActionProps) {
  const t = useTranslations('contracts');
  const toastT = useTranslations('toasts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { active, account } = useActiveWeb3React();
  const tx = useTxFlow();
  const stageLabel = useTxStageLabel();

  if (!vaultAddress) return null;

  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const balance = vaultBalanceEth === undefined ? undefined : toFiniteNumber(vaultBalanceEth);
  const hasFunds = typeof balance === 'number' && balance > 0;
  const share = toFiniteNumber(sharePercent);
  // Named only when it is the documented beneficiary; any other address reads as hex.
  const { name: beneficiaryName, address: documentedBeneficiary } =
    protocolFacts.publicGoodsBeneficiary;

  const forward = () =>
    tx.run({
      write: (ctx) =>
        ctx.writeContract({
          address: vaultAddress as `0x${string}`,
          abi: CHARITY_WALLET_ABI,
          functionName: 'send',
          args: [],
        }),
      successMessage: toastT('contribution.publicGoodsVault.forwarded'),
      failureMessage: toastT('contribution.publicGoodsVault.failed'),
      onConfirmed: async () => {
        await queryClient.invalidateQueries({ queryKey: ['dashboardInfo'] });
      },
      errorContext: 'forward public goods vault funds',
    });

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
      <div className="mt-6 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
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

        <div className="space-y-3">
          {balance === undefined ? null : balance === null ? (
            <p
              data-testid="vault-balance-unavailable"
              className="type-body-sm text-muted-foreground"
            >
              {t('vault.balanceUnavailable')}
            </p>
          ) : hasFunds ? (
            <>
              <p className="type-body-sm text-muted-foreground">{t('vault.note')}</p>
              {active && account ? (
                <ChainGuard>
                  <Button
                    type="button"
                    onClick={() => void forward()}
                    loading={tx.isBusy}
                    className="w-full sm:w-auto"
                  >
                    <SendHorizontal aria-hidden className="size-4" />
                    {(tx.isBusy && stageLabel(tx.stage)) ||
                      toastT('contribution.publicGoodsVault.forward')}
                  </Button>
                </ChainGuard>
              ) : (
                <ConnectWalletAction variant="outline" className="w-full sm:w-auto" />
              )}
              <TxStatus stage={tx.stage} />
            </>
          ) : (
            <p data-testid="vault-empty" className="type-body-sm text-muted-foreground">
              {t('vault.empty')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
