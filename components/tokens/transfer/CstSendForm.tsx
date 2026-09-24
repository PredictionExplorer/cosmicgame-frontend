'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import type { Address, Hash } from 'viem';

import { cn } from '@/lib/utils';
import { formatAmount } from '@/utils/format';
import { useTxFlow, useTxStageLabel, type TxContext, type TxRunOptions } from '@/hooks/useTxFlow';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import { AmountField } from './AmountField';
import { RecipientField } from './RecipientField';
import { TransferReview, transferGate } from './TransferReview';
import { commaIsDecimal, parseTokenAmount, toPlainDecimal } from './amount';
import { parseRecipient } from './recipient';
import { CST_BALANCE_QUERY_KEY, CST_DECIMALS, useCstBalance } from './useCstBalance';
import { useRecipientFacts } from './useRecipientFacts';

/** A validated transfer, handed to `write`. */
export interface CstTransfer {
  recipient: Address;
  amountWei: bigint;
}

export interface CstSendFormProps {
  /** The address the CST leaves: its balance is shown and caps the amount. */
  source: Address | null;
  /** Sends the transfer through the flow's `ctx.writeContract` (a `transfer`, a `payReward`…). */
  write: (ctx: TxContext, transfer: CstTransfer) => Promise<Hash>;
  /**
   * Checks before the wallet opens (the signing wallet's role, a contract
   * address that must be known); return `false` after telling the person why.
   */
  prepare?: TxRunOptions['prepare'];
  /** The send button's label for a valid amount ("Send 25 CST"). */
  submitLabel: (amount: string) => string;
  /** The send button's label before the amount is valid ("Send CST"). */
  idleLabel: string;
  successMessage: string;
  failureMessage: string;
  errorContext: string;
  /** Extra query keys to refresh once the transfer confirms. */
  invalidateKeys?: readonly (readonly unknown[])[];
  /** Content under the send button (a history link). */
  footer?: ReactNode;
  className?: string;
}

/** The query keys every CST transfer changes. */
const CST_TRANSFER_KEYS = [
  [CST_BALANCE_QUERY_KEY],
  ['userBalance'],
  ['ctTransfers'],
  ['ctBalancesDistribution'],
  ['dashboardInfo'],
] as const;

/**
 * Sends CST from one address: the recipient (checked on-chain as it is typed),
 * the amount (capped by the live balance, with Max), then a review of both
 * before the one commit button opens the wallet. Errors appear under their
 * field once it has been left or the form submitted, and a submit with an
 * error moves focus to the first field that needs fixing. The transaction
 * runs through `useTxFlow`: chain guard, one lifecycle toast, and the stage
 * under the button.
 */
export function CstSendForm({
  source,
  write,
  prepare,
  submitLabel,
  idleLabel,
  successMessage,
  failureMessage,
  errorContext,
  invalidateKeys = [],
  footer,
  className,
}: CstSendFormProps) {
  const locale = useLocale();
  const tReview = useTranslations('forms.transfer.review');
  const queryClient = useQueryClient();
  const { run, stage, isBusy } = useTxFlow();
  const stageLabel = useTxStageLabel();

  const [recipientText, setRecipientText] = useState('');
  const [amountText, setAmountText] = useState('');
  const [touched, setTouched] = useState({ recipient: false, amount: false });
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementMissing, setAcknowledgementMissing] = useState(false);

  const recipientRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const acknowledgementRef = useRef<HTMLInputElement>(null);

  const balance = useCstBalance(source);
  const available = balance.data ?? null;
  const recipient = parseRecipient(recipientText, { from: source });
  const amount = parseTokenAmount(amountText, {
    decimals: CST_DECIMALS,
    max: available,
    decimalComma: commaIsDecimal(locale),
  });
  const check = useRecipientFacts(recipient.address);
  const gate = transferGate(check, acknowledged);
  const sendable = amount.error === null ? amount.wei : null;
  const transfer: CstTransfer | null =
    recipient.address && sendable !== null
      ? { recipient: recipient.address, amountWei: sendable }
      : null;
  const amountLabel =
    sendable !== null ? formatAmount(sendable, { unit: 'CST', locale, context: 'exact' }) : null;

  const changeRecipient = (value: string) => {
    setRecipientText(value);
    setAcknowledged(false);
    setAcknowledgementMissing(false);
  };

  const fillMax = () => {
    if (available === null) return;
    setAmountText(toPlainDecimal(available, CST_DECIMALS));
    setTouched((current) => ({ ...current, amount: true }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ recipient: true, amount: true });
    if (recipient.error) {
      recipientRef.current?.focus();
      return;
    }
    if (amount.error || amount.wei === null) {
      amountRef.current?.focus();
      return;
    }
    if (!transfer) return;
    // Never race the recipient check: its answer decides whether the send
    // needs an acknowledgement. The button says it is checking meanwhile.
    if (gate === 'checking') return;
    if (gate === 'acknowledge') {
      setAcknowledgementMissing(true);
      acknowledgementRef.current?.focus();
      return;
    }

    const result = await run({
      prepare,
      write: (ctx) => write(ctx, transfer),
      successMessage,
      failureMessage,
      errorContext,
      onConfirmed: async () => {
        setRecipientText('');
        setAmountText('');
        setTouched({ recipient: false, amount: false });
        setAcknowledged(false);
        await Promise.all(
          [...CST_TRANSFER_KEYS, ...invalidateKeys].map((queryKey) =>
            queryClient.invalidateQueries({ queryKey: [...queryKey] }),
          ),
        );
      },
    });
    if (result.status === 'confirmed') recipientRef.current?.focus();
  };

  const busyLabel = isBusy ? stageLabel(stage) : null;
  const checkingRecipient = !isBusy && recipient.address !== null && gate === 'checking';

  return (
    <form noValidate onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)}>
      <RecipientField
        inputRef={recipientRef}
        value={recipientText}
        onChange={changeRecipient}
        onBlur={() => setTouched((current) => ({ ...current, recipient: true }))}
        error={touched.recipient ? recipient.error : null}
        check={check}
        reviewShown={transfer !== null}
        disabled={isBusy}
      />

      <AmountField
        inputRef={amountRef}
        value={amountText}
        onChange={setAmountText}
        onBlur={() => setTouched((current) => ({ ...current, amount: true }))}
        error={touched.amount ? amount.error : null}
        unit="CST"
        available={available}
        availableUnknown={balance.isError}
        onMax={fillMax}
        decimals={CST_DECIMALS}
        disabled={isBusy}
      />

      {transfer ? (
        <TransferReview
          sending={<Amount value={transfer.amountWei} unit="CST" context="exact" />}
          recipient={transfer.recipient}
          check={check}
          acknowledged={acknowledged}
          onAcknowledgedChange={(next) => {
            setAcknowledged(next);
            if (next) setAcknowledgementMissing(false);
          }}
          acknowledgementMissing={acknowledgementMissing}
          acknowledgementRef={acknowledgementRef}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <ChainGuard requireConnection buttonClassName="w-full sm:w-auto">
          <Button
            type="submit"
            variant="commit"
            size="lg"
            loading={isBusy || checkingRecipient}
            className="w-full sm:w-auto sm:self-start"
          >
            {busyLabel ??
              (checkingRecipient
                ? tReview('checking')
                : amountLabel
                  ? submitLabel(amountLabel)
                  : idleLabel)}
          </Button>
        </ChainGuard>
        <TxStatus stage={stage} />
        {footer}
      </div>
    </form>
  );
}
