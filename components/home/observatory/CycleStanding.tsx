'use client';

import type { ReactNode } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AddressChip } from '@/components/ui/address-chip';
import { Button } from '@/components/ui/button';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { CycleParticipation, RetrieveStatus } from '@/hooks/useCycleParticipation';
import { useFormat } from '@/hooks/useFormat';
import type { PositionMoment } from '@/hooks/usePositionMoment';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

import { ValuePending } from './ValuePending';

export interface CycleStandingProps {
  /** The wallet holds the Last Gesture. */
  isLatest: boolean;
  /** The clock reached zero and on-chain state confirms it. */
  isReadyToFinalize: boolean;
  isConfirmingFinalization: boolean;
  /** The Last Gesture holder's exclusive finalization window is still running. */
  exclusiveWindowOpen: boolean;
  /** The current hold in seconds, or null while it cannot be measured. */
  holdSeconds: number | null;
  moment: PositionMoment | null;
  onDismissMoment?: () => void;
  /** The page clock, for the age of a "place taken" notice. */
  nowMs: number;
  participation: CycleParticipation;
  /** A confirmed Gesture of this wallet is still being indexed. */
  participationUpdating?: boolean;
  /** All Gestures of this cycle; null while unknown. */
  totalGestures: number | null;
  retrieve: RetrieveStatus;
  /** Moves to the clock's Finalize action. */
  onGoToFinalize?: () => void;
  className?: string;
}

function Row({
  testId,
  label,
  value,
  caption,
}: {
  testId: string;
  label: string;
  value: ReactNode;
  caption?: ReactNode;
}) {
  return (
    <div data-testid={testId} className="flex items-baseline justify-between gap-4 py-3">
      <dt className="type-label shrink-0 text-subtle">{label}</dt>
      <dd className="min-w-0 text-end">
        <div className="type-body-sm text-foreground">{value}</div>
        {caption && <div className="type-caption mt-0.5 text-subtle">{caption}</div>}
      </dd>
    </div>
  );
}

function Pending() {
  return <ValuePending ch={12} />;
}

/**
 * The connected wallet's cycle standing, beside the gesture form (under the
 * Calibration Window from 1024px, right after the form on phones): where it
 * stands (phase-aware, including its exclusive finalization window), how many
 * of this cycle's Gestures are its own, and whether anything waits to be
 * retrieved. Every figure is read, never assumed: while a read loads it shows
 * a skeleton, and after a failed read it says so and offers a retry.
 */
export function CycleStanding({
  isLatest,
  isReadyToFinalize,
  isConfirmingFinalization,
  exclusiveWindowOpen,
  holdSeconds,
  moment,
  onDismissMoment,
  nowMs,
  participation,
  participationUpdating = false,
  totalGestures,
  retrieve,
  onGoToFinalize,
  className,
}: CycleStandingProps) {
  const t = useTranslations('home.observatory.standing');
  const tHome = useTranslations('home');
  const format = useFormat();

  const position = (() => {
    if (isLatest && isReadyToFinalize) {
      return exclusiveWindowOpen
        ? {
            value: <span className="text-positive">{t('positionExclusive')}</span>,
            caption: onGoToFinalize ? (
              <button
                type="button"
                onClick={onGoToFinalize}
                className="link-quiet inline-flex min-h-6 items-center gap-1 text-primary"
              >
                {t('goToFinalize')}
                <ArrowRight className="size-3.5" aria-hidden />
              </button>
            ) : undefined,
          }
        : {
            value: <span className="text-attention">{t('positionWindowEnded')}</span>,
            caption: tHome('observatory.clock.finalize.openNow'),
          };
    }
    if (isLatest) {
      return {
        value: <span className="text-positive">{t('positionLatest')}</span>,
        caption: isConfirmingFinalization
          ? tHome('chrono.phase.confirming.label')
          : holdSeconds == null
            ? undefined
            : tHome('deck.personal.heldFor', { duration: format.duration(holdSeconds) }),
      };
    }
    if (moment?.kind === 'taken') {
      return {
        value: <span className="text-attention">{t('positionTaken')}</span>,
        caption: (
          <span className="inline-flex flex-wrap items-center justify-end gap-x-1.5">
            {moment.by && (
              <>
                {t('takenBy')}
                <AddressChip
                  address={moment.by}
                  variant="plain"
                  showCopy={false}
                  label={false}
                  className="type-hash text-muted-foreground"
                />
              </>
            )}
            <span>· {format.relativeTime(Math.floor(moment.atMs / 1000), nowMs)}</span>
            {onDismissMoment && (
              <button
                type="button"
                onClick={onDismissMoment}
                aria-label={t('dismiss')}
                data-touch-target="extended"
                className="relative inline-flex size-6 items-center justify-center rounded-control text-subtle hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            )}
          </span>
        ),
      };
    }
    if (
      !participationUpdating &&
      participation.status === 'ready' &&
      participation.gestures === 0
    ) {
      return { value: t('positionNone'), caption: undefined, none: true };
    }
    return { value: t('positionOther'), caption: undefined };
  })();
  // "No Gesture from you this cycle" already says what the count would: one
  // row, not two that repeat each other (F223).
  const showCount = !('none' in position && position.none);

  const thisCycle = (() => {
    if (participationUpdating) {
      return { value: <Pending />, caption: t('updating') };
    }
    if (participation.status === 'loading') return { value: <Pending />, caption: undefined };
    if (participation.status === 'error') {
      return {
        value: <UnknownValue label={t('checkFailed')} />,
        caption: (
          <Button
            variant="link"
            size="sm"
            onClick={participation.retry}
            className="h-auto min-h-6 px-0 sm:h-auto"
          >
            {t('retry')}
          </Button>
        ),
      };
    }
    const { gestures } = participation;
    const share =
      totalGestures != null && totalGestures > 0 && gestures > 0
        ? t('share', {
            percent: format.percent((gestures / totalGestures) * 100, {
              maximumFractionDigits: gestures / totalGestures < 0.01 ? 2 : 1,
            }),
          })
        : undefined;
    return {
      value: t('gestures', {
        count: gestures,
        total: totalGestures != null ? format.count(totalGestures) : '—',
      }),
      caption: share,
    };
  })();

  const waiting = (() => {
    switch (retrieve.state) {
      case 'loading':
        return { value: <Pending />, caption: undefined };
      case 'unknown':
        return {
          value: <UnknownValue label={t('checkFailed')} />,
          caption: (
            <Button
              variant="link"
              size="sm"
              onClick={retrieve.retry}
              className="h-auto min-h-6 px-0 sm:h-auto"
            >
              {t('retry')}
            </Button>
          ),
        };
      case 'none':
        return { value: t('waitingNothing'), caption: undefined };
      case 'waiting':
        return {
          value: (
            <Link
              href="/my-allocations"
              data-testid="personal-retrieve"
              className="link-quiet inline-flex items-center gap-1.5 text-primary"
            >
              {[
                retrieve.eth > 0
                  ? format.amount(retrieve.eth, { unit: 'ETH', context: 'card' })
                  : null,
                retrieve.nfts > 0 ? t('waitingNfts', { count: retrieve.nfts }) : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          ),
          caption: t('retrieveHint'),
        };
    }
  })();

  return (
    <section
      aria-labelledby="cycle-standing-title"
      data-testid="cycle-standing"
      className={cn('min-w-0', className)}
    >
      <h2 id="cycle-standing-title" className="type-heading-3 text-foreground">
        {t('title')}
      </h2>
      <dl className="mt-2 divide-y divide-rule-faint">
        <Row
          testId="personal-standing"
          label={t('position')}
          value={position.value}
          caption={position.caption}
        />
        {showCount && (
          <Row
            testId="personal-gesture-count"
            label={t('thisCycle')}
            value={thisCycle.value}
            caption={thisCycle.caption}
          />
        )}
        <Row
          testId="personal-retrieve-status"
          label={t('waiting')}
          value={waiting.value}
          caption={waiting.caption}
        />
      </dl>
    </section>
  );
}
