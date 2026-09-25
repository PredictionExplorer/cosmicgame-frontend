'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { useBalance, useConnection } from 'wagmi';

import { activeChain } from '@/config/chains';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';
import { formatAmount } from '@/utils/format';
import { AmountField } from '@/components/tokens/transfer/AmountField';
import { commaIsDecimal, parseTokenAmount } from '@/components/tokens/transfer/amount';
import { Button } from '@/components/ui/button';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

export interface VaultContributionFormProps {
  /** The Public Goods Vault: ETH sent to it lands in its `receive()`. */
  vaultAddress: Address;
  /** Who the vault's funds are retrieved for (Protocol Guild). */
  beneficiary: string;
  /** Runs once a contribution confirms (refresh the ledger). */
  onSuccess?: () => void | Promise<unknown>;
  className?: string;
}

/**
 * Send ETH to the Public Goods Vault from a connected wallet: the amount (with
 * the wallet's balance), a line that says where it goes, and one button that
 * names the amount. Without a wallet the button connects one; on another
 * network it switches to the protocol's, so the ETH can only arrive on the
 * chain where the vault exists. The transfer is a plain send to the vault's
 * `receive()`, which records the contribution on-chain, through `useTxFlow`.
 */
export function VaultContributionForm({
  vaultAddress,
  beneficiary,
  onSuccess,
  className,
}: VaultContributionFormProps) {
  const t = useTranslations('publicGoods.contribute.form');
  const locale = useLocale();
  const { address } = useConnection();
  const { run, stage, isBusy } = useTxFlow();
  const stageLabel = useTxStageLabel();
  const { data: balance } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: Boolean(address) },
  });

  const [amountText, setAmountText] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  const amount = parseTokenAmount(amountText, {
    max: balance?.value ?? null,
    decimalComma: commaIsDecimal(locale),
  });
  const sendable = amount.error === null ? amount.wei : null;
  const amountLabel =
    sendable !== null ? formatAmount(sendable, { unit: 'ETH', locale, context: 'exact' }) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAmountTouched(true);
    if (sendable === null) {
      amountRef.current?.focus();
      return;
    }
    const value = sendable;
    const shown = formatAmount(value, { unit: 'ETH', locale, context: 'exact', withUnit: false });
    await run({
      write: (ctx) => ctx.sendTransaction({ to: vaultAddress, value }),
      successMessage: t('confirmed', { amount: shown }),
      failureMessage: t('failed'),
      errorContext: 'public-goods-vault-contribution',
      onConfirmed: async () => {
        setAmountText('');
        setAmountTouched(false);
        await onSuccess?.();
      },
    });
  };

  const busyLabel = isBusy ? stageLabel(stage) : null;

  return (
    <form
      noValidate
      aria-label={t('label')}
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-5 rounded-surface bg-surface p-5 sm:p-6', className)}
    >
      <AmountField
        inputRef={amountRef}
        value={amountText}
        onChange={setAmountText}
        onBlur={() => setAmountTouched(true)}
        error={amountTouched ? amount.error : null}
        unit="ETH"
        available={address ? (balance?.value ?? null) : undefined}
        hint={address ? undefined : t('amountHint', { network: REQUIRED_CHAIN_NAME })}
        disabled={isBusy}
      />
      <div className="flex flex-col gap-3 border-t border-rule-faint pt-5">
        {amountLabel ? (
          <p className="type-body-sm text-muted-foreground">
            {t('summary', { amount: amountLabel, beneficiary })}
          </p>
        ) : null}
        {!address ? (
          <p className="type-body-sm text-muted-foreground">
            {t('connectHint', { network: REQUIRED_CHAIN_NAME })}
          </p>
        ) : null}
        <ChainGuard requireConnection buttonClassName="w-full">
          <Button type="submit" variant="commit" size="lg" loading={isBusy} className="w-full">
            {busyLabel ?? (amountLabel ? t('submitAmount', { amount: amountLabel }) : t('submit'))}
          </Button>
        </ChainGuard>
        <TxStatus stage={stage} />
      </div>
    </form>
  );
}
