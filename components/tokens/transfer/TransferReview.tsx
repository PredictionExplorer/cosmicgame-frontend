'use client';

import { useId, type ReactNode, type Ref } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Address } from 'viem';

import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

import type { RecipientCheck } from './useRecipientFacts';

export interface TransferReviewProps {
  /** What leaves the wallet: an `<Amount>`, or the NFTs being sent. */
  sending: ReactNode;
  /** The checksummed recipient, shown in full so every character can be compared. */
  recipient: Address;
  /** What the chain says about the recipient; a warning asks for an acknowledgement. */
  check: RecipientCheck;
  acknowledged: boolean;
  onAcknowledgedChange: (acknowledged: boolean) => void;
  /** The person tried to send without acknowledging a warning. */
  acknowledgementMissing?: boolean;
  acknowledgementRef?: Ref<HTMLInputElement>;
  /** One more caveat before the final line (a balance that could not be read). */
  note?: ReactNode;
  className?: string;
}

/**
 * Whether a transfer to this recipient must be acknowledged before it is
 * sent: the chain flagged it (new, a contract, a protocol contract), or the
 * check could not run, so nothing vouches for it.
 */
export function needsAcknowledgement(check: RecipientCheck): boolean {
  return check.status === 'failed' || (check.status === 'ready' && check.warning !== null);
}

/**
 * Where an otherwise valid transfer stands before the wallet opens:
 *
 * - `checking`: the recipient check has not answered yet, so nobody knows
 *   whether it needs an acknowledgement; the send waits (the commit button
 *   says so) instead of racing the check
 * - `acknowledge`: the review shows a warning that is not yet acknowledged
 * - `ready`: the wallet may open
 */
export type TransferGate = 'checking' | 'acknowledge' | 'ready';

export function transferGate(check: RecipientCheck, acknowledged: boolean): TransferGate {
  // `idle` means there is no address to check yet, so there is nothing to send.
  if (check.status === 'checking' || check.status === 'idle') return 'checking';
  if (needsAcknowledgement(check) && !acknowledged) return 'acknowledge';
  return 'ready';
}

/**
 * The review of an irreversible transfer, shown above the send button as
 * soon as the recipient and amount are valid: what leaves, the full
 * recipient address (the short form hides a typo in the middle), and —
 * when the address is new, a contract or a protocol contract, or could not
 * be checked — a warning that must be acknowledged before the wallet opens.
 * The warning is said here only: the recipient field's hint just reports
 * that the check ran (see `RecipientField`'s `reviewShown`).
 */
export function TransferReview({
  sending,
  recipient,
  check,
  acknowledged,
  onAcknowledgedChange,
  acknowledgementMissing = false,
  acknowledgementRef,
  note,
  className,
}: TransferReviewProps) {
  const t = useTranslations('forms.transfer.review');
  const tRecipient = useTranslations('forms.transfer.recipient');
  const tFormats = useTranslations('formats');
  const headingId = useId();
  const acknowledgeId = useId();
  const network = REQUIRED_CHAIN_NAME;
  const mustAcknowledge = needsAcknowledgement(check);

  let warningSentence: string | null = null;
  if (check.status === 'failed') {
    warningSentence = tRecipient('check.failed', { network });
  } else if (check.status === 'ready' && check.warning) {
    warningSentence =
      check.warning === 'protocol'
        ? tRecipient('check.protocol', { name: tFormats(`address.known.${check.known}`) })
        : check.warning === 'contract'
          ? tRecipient('check.contract')
          : tRecipient('check.fresh', { network });
  }

  return (
    <section
      aria-labelledby={headingId}
      data-testid="transfer-review"
      className={cn('rounded-control bg-surface-sunken px-4 py-3.5 sm:px-5', className)}
    >
      <h3 id={headingId} className="type-eyebrow text-subtle">
        {t('title')}
      </h3>
      <dl className="mt-2 divide-y divide-rule-faint">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5">
          <dt className="type-label text-subtle">{t('sending')}</dt>
          <dd className="type-figure-md text-foreground">{sending}</dd>
        </div>
        <div className="grid gap-1 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-6">
          <dt className="type-label text-subtle">{t('to')}</dt>
          <dd className="min-w-0 type-hash text-foreground sm:text-end">{recipient}</dd>
        </div>
      </dl>

      {warningSentence ? (
        <p className="mt-2 flex items-start gap-2 type-body-sm text-foreground">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-attention" />
          {warningSentence}
        </p>
      ) : null}

      {note ? (
        <p className="mt-2 flex items-start gap-2 type-body-sm text-foreground">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-attention" />
          {note}
        </p>
      ) : null}

      <p className="mt-2 type-caption text-subtle">{t('final')}</p>

      {mustAcknowledge ? (
        <div className="mt-3 flex items-start gap-3">
          <Checkbox
            id={acknowledgeId}
            ref={acknowledgementRef}
            checked={acknowledged}
            onChange={(event) => onAcknowledgedChange(event.target.checked)}
            aria-invalid={acknowledgementMissing || undefined}
            aria-describedby={acknowledgementMissing ? `${acknowledgeId}-error` : undefined}
            className="mt-0.5"
          />
          <div className="min-w-0">
            <label htmlFor={acknowledgeId} className="type-body-sm text-foreground">
              {t('acknowledge')}
            </label>
            {acknowledgementMissing ? (
              <p id={`${acknowledgeId}-error`} className="mt-1 type-caption text-critical">
                {t('acknowledgeRequired')}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
