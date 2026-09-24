'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Address } from 'viem';
import { useBalance, useConnection } from 'wagmi';

import { cosmicGameAbi } from '@/contracts/generated';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useDashboardInfo } from '@/hooks/useApiQuery';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';
import { decimalMarkFor, formatAmount } from '@/utils/format';
import { AmountField } from '@/components/tokens/transfer/AmountField';
import { parseTokenAmount } from '@/components/tokens/transfer/amount';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { MessageTextarea } from '@/components/ui/message-textarea';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import {
  EMPTY_NOTE,
  contributionPayload,
  isNoteUrl,
  type ContributionNote,
} from './contributionNote';

interface EthContributionFormProps {
  /** Anchor id, so a header action can jump to the form on phones. */
  id?: string;
  /** Runs once a contribution confirms (refresh the history). */
  onSuccess?: () => void | Promise<unknown>;
  className?: string;
}

/**
 * Contribute ETH to the Cycle Reserve, open to every visitor: the amount (with
 * the wallet's balance once connected), an optional public note — title,
 * message and link, stored as JSON the record page reads — and one commit
 * button that names the amount. Without a wallet the button connects one; on
 * the wrong network it switches. The write runs through `useTxFlow`, and the
 * plain `donateEth` is used when there is no note.
 */
export function EthContributionForm({ id, onSuccess, className }: EthContributionFormProps) {
  const t = useTranslations('ethContribution.form');
  const tToast = useTranslations('toasts');
  const locale = useLocale();
  const titleId = useId();
  const { address } = useConnection();
  const { cosmicGame } = useContractAddresses();
  const { data: dashboard } = useDashboardInfo(undefined, { poll: false });
  const { notify } = useNotify();
  const { run, stage, isBusy } = useTxFlow();
  const stageLabel = useTxStageLabel();
  const { data: balance } = useBalance({
    address,
    chainId: activeChain.id,
    query: { enabled: Boolean(address) },
  });

  const [amountText, setAmountText] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [note, setNote] = useState<ContributionNote>(EMPTY_NOTE);
  const [urlTouched, setUrlTouched] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const amount = parseTokenAmount(amountText, {
    max: balance?.value ?? null,
    decimalMark: decimalMarkFor(locale) === ',' ? ',' : '.',
  });
  const urlValid = isNoteUrl(note.url);
  const sendable = amount.error === null ? amount.wei : null;
  const amountLabel =
    sendable !== null ? formatAmount(sendable, { unit: 'ETH', locale, context: 'exact' }) : null;
  const cycle = dashboard?.CurRoundNum;

  const updateNote = (field: keyof ContributionNote, value: string) =>
    setNote((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAmountTouched(true);
    setUrlTouched(true);
    if (sendable === null) {
      amountRef.current?.focus();
      return;
    }
    if (!urlValid) {
      setNoteOpen(true);
      urlRef.current?.focus();
      return;
    }

    const payload = contributionPayload(note);
    const value = sendable;
    const shown = formatAmount(value, { unit: 'ETH', locale, context: 'exact', withUnit: false });
    await run({
      prepare: async () => {
        if (cosmicGame) return true;
        notify('error', tToast('contribution.contractUnavailable'));
        return false;
      },
      // Explicit generics: inference through `TxWriteRequest` loses the
      // function name, and with it the payable `value`.
      write: (ctx) =>
        payload
          ? ctx.writeContract<typeof cosmicGameAbi, 'donateEthWithInfo', [string]>({
              address: cosmicGame as Address,
              abi: cosmicGameAbi,
              functionName: 'donateEthWithInfo',
              args: [payload],
              value,
            })
          : ctx.writeContract<typeof cosmicGameAbi, 'donateEth', []>({
              address: cosmicGame as Address,
              abi: cosmicGameAbi,
              functionName: 'donateEth',
              value,
            }),
      successMessage: tToast(
        payload ? 'contribution.formSubmittedWithInfo' : 'contribution.formSubmitted',
        { amount: shown },
      ),
      failureMessage: tToast('contribution.formFailed'),
      errorContext: 'eth-contribution',
      onConfirmed: async () => {
        setAmountText('');
        setAmountTouched(false);
        setNote(EMPTY_NOTE);
        setUrlTouched(false);
        setNoteOpen(false);
        await onSuccess?.();
      },
    });
  };

  const noteFilled = contributionPayload(note) !== null;
  const busyLabel = isBusy ? stageLabel(stage) : null;

  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'scroll-mt-[var(--sticky-offset)] rounded-surface bg-surface p-5 sm:p-6',
        className,
      )}
    >
      <h2 id={titleId} className="type-heading-3 text-foreground">
        {t('title')}
      </h2>
      <p className="mt-1.5 type-body-sm text-muted-foreground">{t('description')}</p>

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
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

        <details
          open={noteOpen}
          onToggle={(event) => setNoteOpen(event.currentTarget.open)}
          className="group border-t border-rule-faint pt-4"
        >
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-control type-label text-foreground sm:min-h-8 [&::-webkit-details-marker]:hidden">
            <span>
              {t('noteSummary')}
              <span className="ms-1.5 font-normal text-subtle">
                {noteFilled && !noteOpen ? t('noteAdded') : t('optional')}
              </span>
            </span>
            <ChevronDown
              aria-hidden
              className="size-4 shrink-0 text-subtle transition-transform duration-fast group-open:rotate-180"
            />
          </summary>
          <div className="mt-3 flex flex-col gap-5">
            <p className="type-caption text-subtle">{t('noteHint')}</p>
            <FormField label={t('titleLabel')}>
              {(control) => (
                <Input
                  {...control}
                  value={note.title}
                  onChange={(event) => updateNote('title', event.target.value)}
                  placeholder={t('titlePlaceholder')}
                  maxLength={120}
                  autoComplete="off"
                  disabled={isBusy}
                />
              )}
            </FormField>
            <FormField label={t('messageLabel')}>
              {(control) => (
                <MessageTextarea
                  {...control}
                  value={note.message}
                  onChange={(event) => updateNote('message', event.target.value)}
                  placeholder={t('messagePlaceholder')}
                  rows={3}
                  disabled={isBusy}
                />
              )}
            </FormField>
            <FormField label={t('urlLabel')} error={urlTouched && !urlValid ? t('urlError') : null}>
              {(control) => (
                <Input
                  {...control}
                  ref={urlRef}
                  type="url"
                  inputMode="url"
                  value={note.url}
                  onChange={(event) => updateNote('url', event.target.value)}
                  onBlur={() => setUrlTouched(true)}
                  placeholder="https://"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isBusy}
                />
              )}
            </FormField>
          </div>
        </details>

        <div className="flex flex-col gap-3 border-t border-rule-faint pt-5">
          {amountLabel ? (
            <p className="type-body-sm text-muted-foreground">
              {cycle != null
                ? t('summary', { amount: amountLabel, cycle })
                : t('summaryNoCycle', { amount: amountLabel })}
            </p>
          ) : null}
          {!address ? (
            <p className="type-body-sm text-muted-foreground">
              {t('connectHint', { network: REQUIRED_CHAIN_NAME })}
            </p>
          ) : null}
          <ChainGuard requireConnection buttonClassName="w-full">
            <Button type="submit" variant="commit" size="lg" loading={isBusy} className="w-full">
              {busyLabel ??
                (amountLabel ? t('submitAmount', { amount: amountLabel }) : t('contributeEth'))}
            </Button>
          </ChainGuard>
          <TxStatus stage={stage} />
        </div>
      </form>
    </section>
  );
}
