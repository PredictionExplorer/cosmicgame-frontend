'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, BellRing, CalendarPlus, Clock3 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import Counter from '@/components/common/Counter';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Spinner } from '@/components/ui/spinner';
import { Surface } from '@/components/ui/surface';
import { buildCalendarInviteDataUri } from '@/lib/calendarInvite';
import { getCycleState } from '@/lib/cycleState';
import { TOUCH_TARGET_EXTENDED_CLASS, TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { Link } from '@/i18n/navigation';

import { viewForPhase } from './phaseView';

/** Selectable "notify me before finalization" thresholds, in minutes. */
export const NOTIFY_THRESHOLD_CHOICES_MIN = [5, 30, 60] as const;

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
  /** Timestamp (ms) after which non-final-gesture wallets may also finalize. */
  claimWait: number;
  onFinalize: () => void;
  /** Minutes before finalization at which the browser notification fires. */
  notifyThresholdMin?: number;
  onNotifyThresholdChange?: (minutes: number) => void;
  /** ETH price in USD for the reserve conversion; 0 hides the USD line. */
  ethUsdPrice?: number;
  /** Removes the standalone card treatment inside the unified control desk. */
  embedded?: boolean;
  className?: string;
}

/**
 * The observatory centerpiece: the finalization clock, its phase, and what is
 * at stake (the Signature Allocation reserve). Owns the finalize action —
 * closing the cycle is the clock reaching zero, not a form concern.
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
  notifyThresholdMin,
  onNotifyThresholdChange,
  ethUsdPrice = 0,
  embedded = false,
  className,
}: CycleClockProps) {
  const t = useTranslations('home');
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
  const displayText = view.hasDisplayText
    ? t(`chrono.phase.${view.messageKey}.display`)
    : undefined;
  const targetMs = cycleState.isOpeningSoon
    ? (cycleState.activationTime ?? activationTime) * 1000
    : allocationTime;
  const showCountdown = cycleState.isOpeningSoon || cycleState.isFinalizationCountdownActive;
  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;

  const reserveEth = data?.PrizeAmountEth ?? data?.CurPrizeAmountEth ?? 0;
  const reserveUsd = ethUsdPrice > 0 ? reserveEth * ethUsdPrice : 0;
  const finalizeWaiting = data?.LastBidderAddr !== account && claimWait > now;

  const renderInlineCountdown = ({ total }: CountdownRenderProps) => (
    <span className="font-mono tabular-nums">{formatSeconds(Math.ceil(total / 1000), locale)}</span>
  );
  const renderClockCounter = (props: CountdownRenderProps) => (
    <Counter
      {...props}
      size={embedded ? 'md' : 'xl'}
      tone={cycleState.isOpeningSoon ? 'impact' : 'default'}
    />
  );

  return (
    <section
      aria-label={t('chrono.sectionAria')}
      className="print-motion-visible relative z-[1] min-w-0"
      data-testid="cycle-clock"
      data-phase={phase}
    >
      <Surface
        variant={embedded ? 'plain' : 'gradient-border-accent'}
        radius={embedded ? 'none' : 'xl'}
        padding="none"
        className={cn(
          'isolate h-full overflow-hidden',
          embedded ? 'border-0 bg-transparent shadow-none' : [view.toneClass, view.glowClass],
          className,
        )}
      >
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl',
            embedded ? 'h-64 w-64 opacity-60' : 'h-[26rem] w-[26rem]',
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-70',
            embedded ? 'h-56 w-56 sm:h-64 sm:w-64' : 'h-72 w-72 sm:h-96 sm:w-96',
            view.haloClass,
            view.pulseClass,
          )}
        />
        {!embedded && (
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        )}

        <div
          className={cn(
            'relative flex h-full flex-col text-center',
            embedded ? 'px-3 py-3' : 'px-4 py-5 sm:px-6 sm:py-6',
          )}
        >
          <div
            className={cn(
              'mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground',
              embedded ? 'mb-2 px-2.5 py-1' : 'mb-3.5 px-3 py-1.5 sm:tracking-[0.24em]',
            )}
          >
            <Clock3 className={cn('h-3.5 w-3.5', view.iconClass)} aria-hidden />
            {eyebrow}
            <InfoTooltip content={tooltip} className="ml-0" />
          </div>

          <div
            className={cn(
              // `@container`: the fluid `xl` Counter sizes its digits in cqw
              // against this box, so the clock always fits its column.
              '@container border border-white/[0.10] bg-black/20 text-center backdrop-blur-md',
              embedded ? 'rounded-xl p-2.5' : 'rounded-[1.75rem] p-4 sm:p-5',
              phase === 'final-minute' && 'motion-safe:animate-urgency-pulse',
            )}
            role="timer"
            aria-live="off"
            aria-label={t('chrono.timerAria', { label, status })}
          >
            {showCountdown ? (
              <SmoothCountdown date={targetMs} renderer={renderClockCounter} />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center',
                  embedded ? 'min-h-16' : 'min-h-[96px]',
                )}
              >
                <p
                  className={cn(
                    'font-display text-3xl font-bold tracking-tight sm:text-5xl',
                    view.clockTextClass,
                  )}
                >
                  {displayText}
                </p>
              </div>
            )}
          </div>

          <p
            className={cn(
              'mx-auto max-w-xl text-muted-foreground',
              embedded ? 'mt-2 text-xs leading-relaxed' : 'mt-3 text-sm',
            )}
          >
            {status}
          </p>

          {/* What is at stake: the Signature Allocation reserve. */}
          <div
            data-testid="clock-reserve"
            className={cn(
              'mx-auto w-full max-w-md border border-primary/20 bg-primary/[0.05]',
              embedded ? 'mt-2.5 rounded-lg px-3 py-2' : 'mt-4 rounded-2xl px-4 py-3',
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('observatory.clock.reserveLabel')}
              <InfoTooltip content={t('status.metrics.signatureTooltip.base')} className="ml-1.5" />
            </p>
            <p
              className={cn(
                'mt-0.5 font-display font-bold tabular-nums text-gradient-signature',
                embedded ? 'text-xl' : 'text-3xl',
              )}
            >
              {reserveEth.toFixed(4)} ETH
            </p>
            {reserveUsd > 0 && (
              <p
                data-testid="clock-reserve-usd"
                className="mt-0.5 text-xs font-medium tabular-nums text-muted-foreground"
              >
                {t('observatory.clock.reserveUsd', {
                  amount: reserveUsd.toLocaleString(locale, { maximumFractionDigits: 0 }),
                })}
              </p>
            )}
            <p
              className={cn(
                'text-muted-foreground',
                embedded ? 'mt-0.5 text-[10px]' : 'mt-1 text-xs',
              )}
            >
              {t('observatory.clock.reserveExtras')}
            </p>
          </div>

          {/* Finalize is the clock's own action: it exists because the clock hit zero. */}
          {!loading && canClaim && account && (
            <div className={cn('mx-auto w-full max-w-md space-y-2', embedded ? 'mt-2.5' : 'mt-4')}>
              <Button
                size="lg"
                data-testid="clock-finalize"
                onClick={onFinalize}
                className="h-12 w-full border-0 bg-gradient-to-r from-emerald-500 to-emerald-600 text-base font-semibold text-white hover:opacity-90"
                disabled={isClaiming || finalizeWaiting}
              >
                {isClaiming ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> {t('form.processing')}
                  </span>
                ) : (
                  <>
                    {t('form.finalize')}
                    <span className="flex items-center">
                      {finalizeWaiting && (
                        <>
                          &nbsp;{t('form.finalizeAvailableIn')}&nbsp;
                          <SmoothCountdown
                            date={claimWait}
                            renderer={renderInlineCountdown}
                            intervalMs={1000}
                          />
                        </>
                      )}
                      &nbsp;
                      <ArrowRight className="h-[22px] w-[22px]" />
                    </span>
                  </>
                )}
              </Button>
              {finalizeWaiting && (
                <p className="text-xs italic text-primary">{t('form.finalizeWaitNote')}</p>
              )}
            </div>
          )}

          {/* Notify-before-finalization threshold. */}
          {onNotifyThresholdChange && cycleState.isFinalizationCountdownActive && (
            <div
              data-testid="clock-notify-control"
              role="group"
              aria-label={t('observatory.clock.notifyAria')}
              className={cn(
                'mx-auto flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted-foreground',
                embedded ? 'mt-2.5' : 'mt-4',
              )}
            >
              <BellRing className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden />
              <span>{t('observatory.clock.notifyLabel')}</span>
              {NOTIFY_THRESHOLD_CHOICES_MIN.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => onNotifyThresholdChange(minutes)}
                  aria-pressed={notifyThresholdMin === minutes}
                  data-touch-target="extended"
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-semibold transition-colors',
                    // Inline pills beside text: growing them would bloat the
                    // row, so a pseudo-element extends the hit area instead.
                    TOUCH_TARGET_EXTENDED_CLASS,
                    notifyThresholdMin === minutes
                      ? 'border-primary/50 bg-primary/12 text-white'
                      : 'border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-white',
                  )}
                >
                  {t('observatory.clock.notifyMinutes', { minutes: String(minutes) })}
                </button>
              ))}
            </div>
          )}

          {/* Between cycles: calendar invite and the cycle-details path. */}
          {!loading && !isRoundActive && (
            <div className={cn('flex flex-col items-center gap-1', embedded ? 'mt-2.5' : 'mt-4')}>
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
                    'inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-foreground',
                    TOUCH_TARGET_HEIGHT_CLASS,
                  )}
                >
                  <CalendarPlus className="h-4 w-4" aria-hidden />
                  {t('observatory.clock.calendarCta')}
                </a>
              )}
              <Link
                href="/current-cycle"
                className={cn(
                  'inline-flex items-center gap-2 font-semibold text-primary transition hover:text-foreground',
                  TOUCH_TARGET_HEIGHT_CLASS,
                )}
              >
                {t('chrono.cta.viewCycle')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          )}
        </div>
      </Surface>
    </section>
  );
}
