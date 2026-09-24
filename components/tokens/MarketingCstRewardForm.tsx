'use client';

import { useId, useState, type FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, SendHorizontal } from 'lucide-react';
import { getAddress, isAddress, parseUnits, zeroAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import { cosmicTokenAbi, marketingWalletAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useTxFlow, useTxStageLabel } from '@/hooks/useTxFlow';
import { Link } from '@/i18n/navigation';
import { sameAddress } from '@/utils/address';
import { reportError } from '@/utils/errors';
import { formatAmountParts, NBSP } from '@/utils/format';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
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

type FieldErrors = Partial<Record<'recipient' | 'amount', string>>;

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
 * transaction flow behind the chain guard.
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

  const tx = useTxFlow();
  const stageLabel = useTxStageLabel();
  const recipientId = useId();
  const amountId = useId();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

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

  const validate = (): { recipient: `0x${string}`; amountWei: bigint } | null => {
    const next: FieldErrors = {};
    const to = normalizeAddress(recipient);
    if (!to || to.toLowerCase() === zeroAddress)
      next.recipient = t('outreachTransfer.form.errors.recipient');
    const parsed = parseCstAmount(amount, decimals, locale);
    if (parsed === 'precision') {
      next.amount = t('outreachTransfer.form.errors.precision', { decimals });
    } else if (parsed === 'grouping') {
      next.amount = t('outreachTransfer.form.errors.grouping');
    } else if (parsed === null || parsed <= 0n) {
      next.amount = t('outreachTransfer.form.errors.amount');
    } else if (balance.data && parsed > balance.data.balanceWei) {
      next.amount = t('outreachTransfer.form.errors.insufficient');
    }
    setErrors(next);
    if (next.recipient || next.amount || !to || typeof parsed !== 'bigint') return null;
    return { recipient: to, amountWei: parsed };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reserve || !balance.data) return;
    const reward = validate();
    if (!reward) return;

    await tx.run({
      // The page shows this form to the treasurer only; the contract checks again.
      prepare: async (ctx) => sameAddress(ctx.account, treasurer),
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
        setRecipient('');
        setAmount('');
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
          <div className="space-y-2">
            <Label htmlFor={recipientId}>{t('outreachTransfer.form.recipient')}</Label>
            <Input
              id={recipientId}
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x…"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={errors.recipient ? true : undefined}
              aria-describedby={errors.recipient ? `${recipientId}-error` : undefined}
              disabled={busy}
              className="font-mono"
            />
            {errors.recipient ? (
              <p id={`${recipientId}-error`} className="type-caption text-critical">
                {errors.recipient}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={amountId}>{t('outreachTransfer.form.amount')}</Label>
            <div className="relative">
              <Input
                id={amountId}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={errors.amount ? true : undefined}
                aria-describedby={[
                  `${amountId}-hint`,
                  sends ? `${amountId}-sends` : null,
                  errors.amount ? `${amountId}-error` : null,
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
            {errors.amount ? (
              <p id={`${amountId}-error`} className="type-caption text-critical">
                {errors.amount}
              </p>
            ) : null}
          </div>

          <div className="space-y-3 pt-2">
            <ChainGuard>
              <Button
                type="submit"
                variant="commit"
                size="lg"
                loading={busy}
                disabled={!canSubmit}
                className="w-full sm:w-auto"
              >
                <SendHorizontal aria-hidden />
                {(busy && stageLabel(tx.stage)) || t('outreachTransfer.form.submit')}
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
