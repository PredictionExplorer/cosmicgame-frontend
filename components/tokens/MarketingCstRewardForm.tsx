'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, SendHorizontal } from 'lucide-react';
import { getAddress, isAddress, parseUnits } from 'viem';
import { usePublicClient } from 'wagmi';

import { cosmicTokenAbi, marketingWalletAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useNotify } from '@/hooks/useNotify';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { Link } from '@/i18n/navigation';
import { sameAddress } from '@/utils/address';
import { reportError } from '@/utils/errors';
import { formatAmountParts, NBSP } from '@/utils/format';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { RecipientField } from '@/components/tokens/transfer/RecipientField';
import { TransferReview, transferGate } from '@/components/tokens/transfer/TransferReview';
import { parseRecipient } from '@/components/tokens/transfer/recipient';
import { useRecipientFacts } from '@/components/tokens/transfer/useRecipientFacts';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

/** CST is an 18-decimal ERC-20; the contract's own `decimals()` is read when it answers. */
const DEFAULT_DECIMALS = 18;

interface MarketingCstRewardFormProps {
  marketingWalletAddress: string;
  ownerAddress: string | null | undefined;
  treasurerAddress: string | null | undefined;
  historyHref?: string;
}

interface ReserveBalance {
  balanceWei: bigint;
  decimals: number;
}

function normalizeAddress(value: string | null | undefined): `0x${string}` | null {
  const trimmed = value?.trim() ?? '';
  return isAddress(trimmed) ? getAddress(trimmed) : null;
}

const groupMarks = new Map<string, string>();

/** The thousands separator the reader's locale prints (a comma in en, a dot in vi). */
function groupMarkFor(locale: string): string {
  const { intlLocale } = getLocaleConfig(locale);
  let mark = groupMarks.get(intlLocale);
  if (mark === undefined) {
    const parts = new Intl.NumberFormat(intlLocale).formatToParts(10_000);
    mark = parts.find((part) => part.type === 'group')?.value ?? ',';
    groupMarks.set(intlLocale, mark);
  }
  return mark;
}

/**
 * A typed amount as base units: digits with at most one decimal separator, a
 * dot or a comma (uk and vi readers type commas). `null` when it is not a
 * number, `'precision'` when it has more decimals than the token, and
 * `'grouping'` when it carries a thousands separator: whitespace between
 * digits, both marks, a mark used twice, or the locale's own thousands mark
 * before exactly three digits. The transfer cannot be undone, so "1,000" in
 * English is refused rather than read as 1 CST.
 */
export function parseCstAmount(
  text: string,
  decimals: number,
  locale: string = 'en',
): bigint | null | 'precision' | 'grouping' {
  const trimmed = text.trim();
  // `\s` covers the no-break and narrow no-break spaces uk grouping prints.
  if (/^[\d\s.,]+$/.test(trimmed) && /\d\s+\d/.test(trimmed)) return 'grouping';
  const marks = trimmed.match(/[.,]/g) ?? [];
  if (marks.length > 1 && /^\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?$/.test(trimmed)) return 'grouping';
  if (marks.length === 1 && marks[0] === groupMarkFor(locale) && /^\d+[.,]\d{3}$/.test(trimmed)) {
    return 'grouping';
  }
  const normalized = trimmed.replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const fraction = normalized.split('.')[1] ?? '';
  if (fraction.length > decimals) return 'precision';
  return parseUnits(normalized, decimals);
}

/** A CST amount in full precision, grouped in the reader's style: "1,000.5 CST". */
function exactCst(amountWei: bigint, decimals: number, locale: string): string {
  const parts = formatAmountParts(amountWei, { unit: 'CST', locale, context: 'exact', decimals });
  return parts.exact ?? `${parts.number}${NBSP}${parts.unit ?? 'CST'}`;
}

/** The Outreach Reserve's CST balance and the token's decimals. */
function useReserveBalance(reserve: `0x${string}` | null) {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicToken } = useContractAddresses();
  return useQuery<ReserveBalance>({
    queryKey: ['outreachReserveBalance', cosmicToken, reserve],
    enabled: Boolean(publicClient && cosmicToken && reserve),
    retry: 1,
    queryFn: async () => {
      const token = cosmicToken as `0x${string}`;
      const decimals = await publicClient!
        .readContract({ address: token, abi: cosmicTokenAbi, functionName: 'decimals' })
        .then((value) => Number(value))
        .catch(() => DEFAULT_DECIMALS);
      try {
        const balanceWei = (await publicClient!.readContract({
          address: token,
          abi: cosmicTokenAbi,
          functionName: 'balanceOf',
          args: [reserve],
        })) as bigint;
        return {
          balanceWei,
          decimals: Number.isFinite(decimals) ? decimals : DEFAULT_DECIMALS,
        };
      } catch (error) {
        reportError(error, 'MarketingWallet CST balance read');
        throw error;
      }
    },
  });
}

/**
 * Sends CST from the Outreach Reserve (`payReward`), for its treasurer: the
 * reserve's balance and roles beside a two-field form whose mistakes are
 * named under the field, and one commit action that runs through the shared
 * transaction flow behind the chain guard. The recipient is the transfer
 * kit's (checked on-chain as it is typed), and a valid send is reviewed
 * before the wallet opens: the send waits for the recipient check, and an
 * address the check flags (new, a contract, or not checked) needs an
 * acknowledgement.
 */
export function MarketingCstRewardForm({
  marketingWalletAddress,
  ownerAddress,
  treasurerAddress,
  historyHref,
}: MarketingCstRewardFormProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const queryClient = useQueryClient();

  const tReview = useTranslations('forms.transfer.review');
  const tToast = useTranslations('toasts');
  const { notify } = useNotify();

  const tx = useTxFlow();
  const stageLabel = useTxStageLabel();
  const amountId = useId();

  const [recipientText, setRecipientText] = useState('');
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgementMissing, setAcknowledgementMissing] = useState(false);

  const recipientRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const acknowledgementRef = useRef<HTMLInputElement>(null);

  const reserve = normalizeAddress(marketingWalletAddress);
  const treasurer = normalizeAddress(treasurerAddress);
  const owner = normalizeAddress(ownerAddress);
  const balance = useReserveBalance(reserve);
  const decimals = balance.data?.decimals ?? DEFAULT_DECIMALS;
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  // What the typed amount will send, in the reader's own number style, so a
  // misread separator shows before the irreversible transfer, not after it.
  const typed = parseCstAmount(amount, decimals, locale);
  const sends = typeof typed === 'bigint' && typed > 0n ? exactCst(typed, decimals, locale) : null;

  const recipient = parseRecipient(recipientText, { from: reserve });
  const check = useRecipientFacts(recipient.address);
  const gate = transferGate(check, acknowledged);

  /** Why the typed amount cannot be sent, or null when it can. */
  const amountProblem = (): string | null => {
    if (typed === 'precision') return t('outreachTransfer.form.errors.precision', { decimals });
    if (typed === 'grouping') return t('outreachTransfer.form.errors.grouping');
    if (typed === null || typed <= 0n) return t('outreachTransfer.form.errors.amount');
    if (balance.data && typed > balance.data.balanceWei) {
      return t('outreachTransfer.form.errors.insufficient');
    }
    return null;
  };
  // The review appears once both fields hold something that can be sent.
  const reward =
    recipient.address && typeof typed === 'bigint' && amountProblem() === null
      ? { recipient: recipient.address, amountWei: typed }
      : null;

  const changeRecipient = (value: string) => {
    setRecipientText(value);
    setAcknowledged(false);
    setAcknowledgementMissing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reserve || !balance.data) return;
    setRecipientTouched(true);
    const problem = amountProblem();
    setAmountError(problem);
    // In the order the form reads: the recipient, then the amount.
    if (recipient.error || !recipient.address) {
      recipientRef.current?.focus();
      return;
    }
    if (problem || !reward) {
      amountRef.current?.focus();
      return;
    }
    // Never race the recipient check: its answer decides whether the send
    // needs an acknowledgement. The button says it is checking meanwhile.
    if (gate === 'checking') return;
    if (gate === 'acknowledge') {
      setAcknowledgementMissing(true);
      acknowledgementRef.current?.focus();
      return;
    }

    await tx.run({
      // The page shows this form to the treasurer only (the contract checks
      // again); a wallet switched meanwhile is told why nothing opened.
      prepare: async (ctx) => {
        if (sameAddress(ctx.account, treasurer)) return true;
        notify('error', tToast('transfer.marketingCst.treasurerRequired'));
        return false;
      },
      write: (ctx) =>
        ctx.writeContract({
          address: reserve,
          abi: marketingWalletAbi,
          functionName: 'payReward',
          args: [reward.recipient, reward.amountWei],
        }),
      successMessage: t('outreachTransfer.form.confirmed'),
      failureMessage: t('outreachTransfer.form.failed'),
      errorContext: 'MarketingWallet payReward',
      onConfirmed: async () => {
        setRecipientText('');
        setRecipientTouched(false);
        setAmount('');
        setAmountError(null);
        setAcknowledged(false);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['outreachReserveBalance'] }),
          queryClient.invalidateQueries({ queryKey: ['userBalance'] }),
          queryClient.invalidateQueries({ queryKey: ['ctTransfers'] }),
          queryClient.invalidateQueries({ queryKey: ['ctBalancesDistribution'] }),
        ]);
      },
    });
  };

  const facts = [
    {
      id: 'reserve',
      label: t('outreachTransfer.form.reserve'),
      value: reserve ? (
        <AddressChip address={reserve} variant="plain" href={false} label={false} />
      ) : (
        unknown
      ),
    },
    {
      id: 'balance',
      label: t('outreachTransfer.form.balance'),
      value: balance.data ? (
        <Amount value={balance.data.balanceWei} decimals={decimals} unit="CST" />
      ) : balance.isError ? (
        unknown
      ) : (
        <Skeleton className="h-4 w-24" />
      ),
    },
    {
      id: 'treasurer',
      label: t('outreachTransfer.treasurer'),
      value: treasurer ? (
        <AddressChip address={treasurer} variant="plain" href={false} label={false} />
      ) : (
        unknown
      ),
    },
    {
      id: 'owner',
      label: t('outreachTransfer.owner'),
      value: owner ? (
        <AddressChip address={owner} variant="plain" href={false} label={false} />
      ) : (
        unknown
      ),
    },
  ];

  const busy = tx.isBusy;
  const canSubmit = Boolean(reserve && treasurer && balance.data);
  const checkingRecipient = !busy && reward !== null && gate === 'checking';

  return (
    <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
      <section aria-labelledby="outreach-send-heading" className="max-w-xl">
        <SectionHeader
          size="panel"
          headingId="outreach-send-heading"
          title={t('outreachTransfer.form.title')}
          description={t('outreachTransfer.form.description')}
        />
        <form noValidate onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
          <RecipientField
            inputRef={recipientRef}
            value={recipientText}
            onChange={changeRecipient}
            onBlur={() => setRecipientTouched(true)}
            error={recipientTouched ? recipient.error : null}
            check={check}
            reviewShown={reward !== null}
            disabled={busy}
          />

          <div className="space-y-2">
            <Label htmlFor={amountId}>{t('outreachTransfer.form.amount')}</Label>
            <div className="relative">
              <Input
                ref={amountRef}
                id={amountId}
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setAmountError(null);
                }}
                placeholder="0"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={amountError ? true : undefined}
                aria-describedby={[
                  `${amountId}-hint`,
                  sends ? `${amountId}-sends` : null,
                  amountError ? `${amountId}-error` : null,
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={busy}
                className="pe-14 tabular-nums"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 end-3 flex items-center type-label text-subtle"
              >
                CST
              </span>
            </div>
            <p id={`${amountId}-hint`} className="type-caption text-subtle">
              {t('outreachTransfer.form.amountHint')}
            </p>
            {sends ? (
              <p
                id={`${amountId}-sends`}
                data-testid="outreach-sends"
                className="type-body-sm text-foreground tabular-nums"
              >
                {t('outreachTransfer.form.sends', { amount: sends })}
              </p>
            ) : null}
            {amountError ? (
              <p id={`${amountId}-error`} className="type-caption text-critical">
                {amountError}
              </p>
            ) : null}
          </div>

          {reward ? (
            <TransferReview
              sending={
                <Amount value={reward.amountWei} decimals={decimals} unit="CST" context="exact" />
              }
              recipient={reward.recipient}
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

          <div className="space-y-3 pt-2">
            <ChainGuard>
              <Button
                type="submit"
                variant="commit"
                size="lg"
                loading={busy || checkingRecipient}
                disabled={!canSubmit}
                className="w-full sm:w-auto"
              >
                <SendHorizontal aria-hidden />
                {(busy && stageLabel(tx.stage)) ||
                  (checkingRecipient ? tReview('checking') : t('outreachTransfer.form.submit'))}
              </Button>
            </ChainGuard>
            <TxStatus stage={tx.stage} />
          </div>
        </form>
      </section>

      <section
        aria-labelledby="outreach-reserve-heading"
        className="lg:border-s lg:border-rule-faint lg:ps-10"
      >
        <SectionHeader
          size="panel"
          as="h2"
          headingId="outreach-reserve-heading"
          title={t('outreachTransfer.form.reserveHeading')}
        />
        <dl className="border-t border-rule-faint">
          {facts.map((fact) => (
            <div
              key={fact.id}
              data-fact={fact.id}
              className="flex min-h-12 items-center justify-between gap-4 border-b border-rule-faint py-2.5"
            >
              <dt className="type-body-sm text-muted-foreground">{fact.label}</dt>
              <dd className="min-w-0 text-end type-figure-sm text-foreground">{fact.value}</dd>
            </div>
          ))}
        </dl>
        {balance.isError ? (
          <p className="mt-3 type-caption text-critical">
            {t('outreachTransfer.form.balanceError')}
          </p>
        ) : null}
        {historyHref ? (
          <Link
            href={historyHref}
            className="link-quiet mt-5 inline-flex min-h-6 items-center gap-1.5 type-body-sm text-muted-foreground hover:text-foreground"
          >
            {t('outreachTransfer.form.history')}
            <ArrowRight aria-hidden className="size-3.5 text-subtle" />
          </Link>
        ) : null}
      </section>
    </div>
  );
}
