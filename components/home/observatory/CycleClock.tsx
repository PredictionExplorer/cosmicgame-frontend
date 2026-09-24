'use client';

import { Fragment } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, CalendarPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Duration } from '@/components/ui/duration';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { Link } from '@/i18n/navigation';
import { buildCalendarInviteDataUri } from '@/lib/calendarInvite';
import { getCycleState } from '@/lib/cycleState';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { formatAmount, sameAddress } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';

import { PHASE_TEXT_CLASS, viewForPhase } from './phaseView';
import { ValuePending } from './ValuePending';

export interface CycleClockProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  account?: string | null;
  /** True once the deadline passed, on-chain state confirms it, and the cycle can close. */
  canClaim: boolean;
  isClaiming: boolean;
  /** Timestamp (ms) after which any wallet, not only the Last Gesture holder, may finalize. */
  claimWait: number;
  onFinalize: () => void;
  /** ETH price in USD for the allocation conversion; 0 hides the USD line. */
  ethUsdPrice?: number;
  className?: string;
}

/**
 * The clock's one size, fitted to its column: four two-digit groups and three
 * colons never outgrow a 288px phone column or a 380px laptop column. Words
 * that replace the figures (at zero, before the first Gesture) take the
 * slightly smaller word size so "Ready to finalize" stays on one line, but
 * the readout keeps its height: nothing on the clock shrinks at zero.
 */
const FIGURE_SIZE = 'text-[clamp(2.25rem,12cqi,3.5rem)]';
const WORD_SIZE = 'text-[clamp(1.625rem,7.5cqi,2.75rem)]';
const READOUT_HEIGHT = 'min-h-[calc(clamp(2.25rem,12cqi,3.5rem)+1.5rem)]';

type UnitId = 'days' | 'hours' | 'minutes' | 'seconds';

interface ClockGroup {
  id: UnitId;
  value: number;
}

/** DD:HH:MM:SS while days remain, then HH:MM:SS: the width never jumps within a phase. */
function clockGroups({ days, hours, minutes, seconds }: CountdownRenderProps): ClockGroup[] {
  const groups: ClockGroup[] = [
    { id: 'hours', value: hours },
    { id: 'minutes', value: minutes },
    { id: 'seconds', value: seconds },
  ];
  return days > 0 ? [{ id: 'days', value: days }, ...groups] : groups;
}

/**
 * The clock as type: tabular Inter figures with hairline colons and a
 * localized caption unit under each group. No tiles, rings or glows.
 */
function ClockFigures(props: CountdownRenderProps) {
  const t = useTranslations('home.observatory.clock.units');
  const groups = clockGroups(props);

  return (
    <div
      data-testid="clock-figures"
      className={cn(
        'flex items-start justify-center gap-[0.12em] font-normal leading-none tracking-[-0.03em] text-foreground tabular-nums lining-nums slashed-zero',
        FIGURE_SIZE,
      )}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && (
            <span aria-hidden className="font-light text-subtle">
              :
            </span>
          )}
          <span className="flex flex-col items-center">
            <span>{String(group.value).padStart(2, '0')}</span>
            <span className="type-caption mt-1 tracking-normal text-subtle">
              {t(group.id, { count: group.value })}
            </span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function renderClockFigures(props: CountdownRenderProps) {
  return <ClockFigures {...props} />;
}

function renderWindowCountdown({ total }: CountdownRenderProps) {
  return (
    <Duration
      seconds={Math.ceil(total / 1000)}
      variant="clock"
      className="type-figure-sm text-foreground"
    />
  );
}

/**
 * The observatory's first reading: the Cycle Finalization Time as type, the
 * phase in words, and what the cycle is for (the Signature Allocation). It
 * owns the finalize action: closing the cycle is the clock reaching zero, not
 * a form concern. At zero nothing shrinks: the figures give way to "Ready to
 * finalize" at the clock's size, with who may finalize and from when.
 */
export function CycleClock({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  account = null,
  canClaim,
  isClaiming,
  claimWait,
  onFinalize,
  ethUsdPrice = 0,
  className,
}: CycleClockProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const cycleState = getCycleState({
    data,
    loading,
    allocationTime,
    activationTime,
    now,
    finalizationConfirmed,
  });
  const phase = cycleState.phase;
  const view = viewForPhase(phase);
  const eyebrow = t(`chrono.phase.${view.messageKey}.eyebrow`);
  const label = t(`chrono.phase.${view.messageKey}.label`);
  const status = t(`chrono.phase.${view.messageKey}.status`);
  const tooltip = t(`chrono.phase.${view.messageKey}.tooltip`);
  const targetMs = cycleState.isOpeningSoon
    ? (cycleState.activationTime ?? activationTime) * 1000
    : allocationTime;
  const showCountdown = cycleState.isOpeningSoon || cycleState.isFinalizationCountdownActive;
  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;

  // The word that stands in for the figures (only phases without a countdown
  // have one in the catalog).
  const displayText = (() => {
    if (showCountdown) return null;
    if (cycleState.isReadyToFinalize) return t('observatory.clock.state.ready');
    if (cycleState.isConfirmingFinalization) return t('observatory.clock.state.confirming');
    if (phase === 'unavailable') return label;
    return t(`chrono.phase.${view.messageKey}.display`);
  })();

  const reserveEth = toFiniteNumber(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth);
  const reserveUsd = reserveEth != null && ethUsdPrice > 0 ? reserveEth * ethUsdPrice : null;

  // At zero the Last Gesture holder has an exclusive window; after it, anyone
  // may finalize. Both facts are stated, with the time, for every viewer.
  const isHolder = sameAddress(account, data?.LastBidderAddr);
  const windowOpen = claimWait > now;
  const canFinalizeHere =
    !loading && cycleState.isReadyToFinalize && canClaim && !!account && (isHolder || !windowOpen);

  return (
    <section
      id="cycle-clock"
      tabIndex={-1}
      aria-labelledby="cycle-clock-title"
      className={cn(
        'print-motion-visible relative min-w-0 scroll-mt-24 focus:outline-none',
        className,
      )}
      data-testid="cycle-clock"
      data-phase={phase}
    >
      <h2 id="cycle-clock-title" className="sr-only">
        {t('chrono.sectionAria')}
      </h2>
      <div className="flex items-center justify-center gap-1.5">
        <p className="type-eyebrow text-subtle">{eyebrow}</p>
        <InfoTooltip content={tooltip} label={eyebrow} />
      </div>

      <div
        className={cn('@container mt-3 flex items-end', READOUT_HEIGHT)}
        role="timer"
        aria-live="off"
        aria-label={t('chrono.timerAria', { label, status })}
      >
        <div className="w-full">
          {showCountdown ? (
            <SmoothCountdown
              date={targetMs}
              initialNowMs={now}
              renderer={renderClockFigures}
              intervalMs={1000}
            />
          ) : (
            <p
              data-testid="clock-display"
              className={cn(
                'text-center font-medium leading-tight tracking-[-0.02em] text-balance',
                WORD_SIZE,
                cycleState.isReadyToFinalize ? PHASE_TEXT_CLASS.positive : 'text-foreground',
              )}
            >
              {displayText}
            </p>
          )}
        </div>
      </div>

      <p
        data-testid="clock-status"
        className={cn(
          'type-body-sm mx-auto mt-2 max-w-[46ch] text-center',
          view.tone === 'attention' ? PHASE_TEXT_CLASS.attention : 'text-muted-foreground',
        )}
      >
        {status}
      </p>

      {cycleState.isReadyToFinalize && (
        <div data-testid="clock-finalize-window" className="mx-auto mt-4 w-full max-w-sm">
          {windowOpen ? (
            <p className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5 text-center">
              <span className="type-label text-subtle">
                {isHolder
                  ? t('observatory.clock.finalize.exclusiveFor')
                  : t('observatory.clock.finalize.openIn')}
              </span>
              <SmoothCountdown
                date={claimWait}
                initialNowMs={now}
                renderer={renderWindowCountdown}
                intervalMs={1000}
              />
            </p>
          ) : (
            <p className="type-label text-center text-muted-foreground">
              {t('observatory.clock.finalize.openNow')}
            </p>
          )}
          {canFinalizeHere && (
            <ChainGuard className="mt-3" buttonClassName="w-full">
              <Button
                variant="commit"
                size="xl"
                data-testid="clock-finalize"
                onClick={onFinalize}
                loading={isClaiming}
                className="mt-3 w-full"
              >
                {t('form.finalize')}
                <ArrowRight aria-hidden />
              </Button>
            </ChainGuard>
          )}
        </div>
      )}

      {/* What the cycle is for: the Signature Allocation. */}
      <div
        data-testid="clock-reserve"
        className="mt-4 border-t border-rule-faint pt-3.5 text-center"
      >
        <p className="type-label text-subtle">
          <Term id="signatureAllocation">{t('observatory.clock.reserveLabel')}</Term>
        </p>
        <p className="mt-1.5 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          {reserveEth != null ? (
            <Amount
              value={reserveEth}
              unit="ETH"
              context="card"
              data-testid="clock-reserve-amount"
              className="type-figure-lg text-foreground"
            />
          ) : loading ? (
            <ValuePending ch={9} className="type-figure-lg" />
          ) : (
            <UnknownValue label={tCommon('status.unavailable')} className="type-figure-lg" />
          )}
          {reserveUsd != null && (
            <span data-testid="clock-reserve-usd" className="type-caption text-subtle">
              {t('observatory.clock.reserveUsd', {
                amount: formatAmount(reserveUsd, { unit: 'USD', locale, withUnit: false }),
              })}
            </span>
          )}
        </p>
        <p className="type-caption mt-1 text-subtle">{t('observatory.clock.reserveExtras')}</p>
      </div>

      {/* Between cycles: a calendar invite and the cycle-details path. */}
      {!loading && !isRoundActive && (
        <div className="mt-4 flex flex-col items-center gap-1">
          {cycleState.isOpeningSoon && (cycleState.activationTime ?? 0) > 0 && (
            <a
              data-testid="clock-calendar-link"
              href={buildCalendarInviteDataUri({
                uid: `cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening`,
                title: t('observatory.clock.calendarTitle', {
                  number: String(data?.CurRoundNum ?? ''),
                }),
                description: t('observatory.clock.calendarBody'),
                url: 'https://app.cosmicsignature.com/',
                startSeconds: cycleState.activationTime ?? 0,
              })}
              download={`cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening.ics`}
              className={cn(
                'link-quiet inline-flex items-center gap-2 text-sm font-medium text-primary',
                TOUCH_TARGET_HEIGHT_CLASS,
              )}
            >
              <CalendarPlus className="size-4" aria-hidden />
              {t('observatory.clock.calendarCta')}
            </a>
          )}
          <Link
            href="/current-cycle"
            className={cn(
              'link-quiet inline-flex items-center gap-2 text-sm font-medium text-primary',
              TOUCH_TARGET_HEIGHT_CLASS,
            )}
          >
            {t('chrono.cta.viewCycle')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
