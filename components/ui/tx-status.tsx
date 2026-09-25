'use client';

import type { ReactNode } from 'react';
import { AlertCircle, Check, CircleSlash, ExternalLink, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTxStageLabel } from '@/hooks/useTxStageLabel';
import { stateTone } from '@/lib/stateTone';
import type { TxStage } from '@/lib/txStage';
import { cn } from '@/lib/utils';
import { getExplorerUrl } from '@/utils/urls';

interface TxExplorerLinkProps {
  hash: string;
  /** Localized "View on Arbiscan". */
  label: string;
  className?: string;
}

/** Link to a transaction on the configured block explorer. Opens in a new tab. */
export function TxExplorerLink({ hash, label, className }: TxExplorerLinkProps) {
  return (
    <a
      href={getExplorerUrl('tx', hash)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('link inline-flex items-center gap-1 font-medium', className)}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </a>
  );
}

type StepState = 'done' | 'current' | 'upcoming' | 'failed';

const STEP_KEYS = ['signature', 'pending', 'confirmed'] as const;

function stepStates(stage: TxStage): Record<(typeof STEP_KEYS)[number], StepState> | null {
  switch (stage.status) {
    case 'preparing':
    case 'switching-network':
    case 'approving':
    case 'awaiting-signature':
      return { signature: 'current', pending: 'upcoming', confirmed: 'upcoming' };
    case 'pending':
      return { signature: 'done', pending: 'current', confirmed: 'upcoming' };
    case 'confirmed':
      return { signature: 'done', pending: 'done', confirmed: 'done' };
    case 'failed':
      return stage.hash
        ? { signature: 'done', pending: 'failed', confirmed: 'upcoming' }
        : { signature: 'failed', pending: 'upcoming', confirmed: 'upcoming' };
    default:
      return null;
  }
}

function StepDot({ state }: { state: StepState }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex h-2 w-2 shrink-0 rounded-full',
        state === 'done' && stateTone.positiveDot,
        state === 'current' && 'bg-primary',
        state === 'upcoming' && 'bg-muted-foreground/40',
        state === 'failed' && stateTone.criticalDot,
      )}
    />
  );
}

export interface TxStatusProps {
  stage: TxStage;
  /**
   * `line` (default): one status sentence with an icon and explorer link.
   * `steps`: the lifecycle strip — Signature · Pending · Confirmed — with the
   * sentence under it, for commit buttons that deserve more presence.
   */
  variant?: 'line' | 'steps';
  className?: string;
}

/**
 * Inline transaction progress for the area under a commit button. Pair it with
 * `useTxFlow().stage`. It is a polite live region, so screen readers hear each
 * stage change once; it renders an empty region while idle so the first
 * announcement is not lost.
 */
export function TxStatus({ stage, variant = 'line', className }: TxStatusProps) {
  const t = useTranslations('toasts');
  const stageLabel = useTxStageLabel();
  const explorerLabel = t('tx.viewOnExplorerShort');
  const hash = 'hash' in stage ? stage.hash : undefined;
  const steps = variant === 'steps' ? stepStates(stage) : null;

  let icon: ReactNode = null;
  let message: string | null = null;
  let tone = 'text-muted-foreground';

  switch (stage.status) {
    case 'idle':
      break;
    case 'confirmed':
      icon = <Check className={cn('h-4 w-4 shrink-0', stateTone.positiveText)} aria-hidden />;
      message = t('tx.status.confirmed');
      tone = 'text-foreground';
      break;
    case 'failed':
      icon = <AlertCircle className={cn('h-4 w-4 shrink-0', stateTone.criticalText)} aria-hidden />;
      message = stage.message;
      tone = 'text-foreground';
      break;
    case 'cancelled':
      icon = <CircleSlash className="h-4 w-4 shrink-0" aria-hidden />;
      // With a hash, the wallet replaced a sent transaction: the replacement
      // paid a fee, so "nothing was sent" would be wrong.
      message = stage.replaced
        ? t('tx.status.replacedInWallet')
        : stage.hash
          ? t('tx.status.cancelledInWallet')
          : t('tx.status.cancelled');
      break;
    default:
      icon = <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />;
      message = stageLabel(stage);
      tone = 'text-foreground';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-tx-status={stage.status}
      className={cn('text-sm', className)}
    >
      {steps && (
        <ol className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {STEP_KEYS.map((key, index) => (
            <li key={key} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden className="h-px w-4 bg-border sm:w-6" />}
              <StepDot state={steps[key]} />
              <span
                className={cn(
                  steps[key] === 'current' && 'font-semibold text-foreground',
                  steps[key] === 'failed' && stateTone.criticalText,
                )}
              >
                {t(`tx.steps.${key}`)}
              </span>
            </li>
          ))}
        </ol>
      )}
      {message && (
        <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', tone)}>
          {icon}
          <span className="min-w-0">{message}</span>
          {hash && <TxExplorerLink hash={hash} label={explorerLabel} />}
        </p>
      )}
    </div>
  );
}
