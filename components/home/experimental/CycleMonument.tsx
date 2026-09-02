'use client';

import type { ReactNode } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, BellRing, CalendarPlus, Clock3, Radio } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { isV3Mechanics, protocolFacts } from '@/content/protocol-facts';
import { shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import Counter from '@/components/common/Counter';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Surface } from '@/components/ui/surface';
import { buildCalendarInviteDataUri } from '@/lib/calendarInvite';
import { getAttachedAssetValues, getAttachedAssetVariant } from '@/lib/attachedAssets';
import { getCycleState } from '@/lib/cycleState';
import { TOUCH_TARGET_EXTENDED_CLASS, TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { useLivePulse } from '@/hooks/useLivePulse';
import { cn } from '@/lib/utils';
import { formatGesturePayment, hasRandomWalkToken } from '@/utils/gesturePayment';
import type { DashboardInfo, GestureInfo } from '@/services/api';

import { viewForPhase } from './phaseView';

/** Cosmic Signature NFTs in the Signature Allocation: V3 awards 3 sequential NFTs, V2 awards 1. */
const signatureNftCount = isV3Mechanics ? protocolFacts.v3.mainPrizeNftsPerCycleDefault : 1;

/** Selectable "notify me before finalization" thresholds, in minutes. */
export const NOTIFY_THRESHOLD_CHOICES_MIN = [5, 30, 60] as const;

type HomeTranslator = ReturnType<typeof useTranslations>;

interface CycleMonumentProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  latestGesture: GestureInfo | null;
  pulseKey?: number;
  account?: string | null;
  /**
   * The full gesture console (form, submit/finalize actions, connect prompt),
   * rendered inside the monument so the cycle clock and the act of gesturing
   * are one surface. Owned by HomePage, which keeps all form state.
   */
  gestureConsole?: ReactNode;
  /**
   * Optional full-height panel beside the monument body (the gesture's
   * Advanced options). At `xl` the card becomes two columns; the panel is
   * absolutely positioned inside its column so it never makes the card
   * taller — it scrolls within the body's height instead.
   */
  sidePanel?: ReactNode;
  /** Minutes before finalization at which the browser notification fires. */
  notifyThresholdMin?: number;
  onNotifyThresholdChange?: (minutes: number) => void;
  /** Attached assets that ride along with the Signature Allocation. */
  attachedNFTCount?: number;
  attachedERC20Count?: number;
}

function getGestureKindSelectValue(gestureType: unknown): 'eth' | 'randomWalk' | 'cst' {
  if (gestureType === 2) return 'cst';
  if (gestureType === 1) return 'randomWalk';
  return 'eth';
}

function formatRelativeGestureAge(timestamp: unknown, nowMs: number, t: HomeTranslator): string {
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp) || numericTimestamp <= 0) return t('ticker.age.justNow');
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - numericTimestamp * 1000) / 1000));
  if (elapsedSeconds < 60) return t('ticker.age.seconds', { count: String(elapsedSeconds) });
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return t('ticker.age.minutes', { count: String(elapsedMinutes) });
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return t('ticker.age.hours', { count: String(elapsedHours) });
  return t('ticker.age.days', { count: String(Math.floor(elapsedHours / 24)) });
}

/**
 * The Deck centerpiece: countdown, Signature Allocation reserve, latest
 * gesture, method pills, and the primary gesture/finalize action fused into
 * one monument so the whole core loop is visible in a single glance.
 */
export function CycleMonument({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  latestGesture,
  pulseKey = 0,
  account = null,
  gestureConsole,
  sidePanel,
  notifyThresholdMin,
  onNotifyThresholdChange,
  attachedNFTCount = 0,
  attachedERC20Count = 0,
}: CycleMonumentProps) {
  const t = useTranslations('home');
  const isPulsing = useLivePulse(pulseKey);

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

  const reserveEth = data?.PrizeAmountEth ?? data?.CurPrizeAmountEth ?? 0;
  const attachedAssetVariant = getAttachedAssetVariant(attachedNFTCount, attachedERC20Count);
  const attachedAssetValues = getAttachedAssetValues(
    attachedAssetVariant,
    attachedNFTCount,
    attachedERC20Count,
  );

  const renderMonumentCounter = (props: CountdownRenderProps) => (
    <Counter {...props} size="xl" tone={cycleState.isOpeningSoon ? 'impact' : 'default'} />
  );

  return (
    <section
      aria-label={t('chrono.sectionAria')}
      className="print-motion-visible relative z-[1] h-full min-w-0"
      data-testid="cycle-monument"
      data-phase={phase}
    >
      <Surface
        variant="gradient-border-accent"
        radius="xl"
        padding="none"
        className={cn('isolate h-full overflow-hidden', view.toneClass, view.glowClass)}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <div
          className={cn(
            'relative h-full',
            sidePanel &&
              // The panel column is exactly the deck's chat column plus its
              // gutter (HomePage `home-deck-layout`), so the monument body keeps
              // its width and nothing inside it shifts when the panel opens.
              'xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(24.25rem,28.25rem)] xl:items-stretch 2xl:grid-cols-[minmax(0,1fr)_minmax(26.5rem,31.5rem)]',
          )}
          data-testid="monument-body"
        >
          <div className="relative flex h-full flex-col px-4 py-4 text-center sm:px-6 sm:py-5">
            <div className="liquid-glass-control mx-auto mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.24em]">
              <Clock3 className={cn('h-3.5 w-3.5', view.iconClass)} aria-hidden />
              {eyebrow}
              <InfoTooltip content={tooltip} className="ml-0" />
            </div>

            <div
              className={cn(
                // `@container`: the fluid `xl` Counter sizes its digits in cqw
                // against this box, so the clock always fits the monument column.
                '@container rounded-[1.75rem] border border-white/[0.10] bg-black/20 p-3 text-center backdrop-blur-md sm:p-4',
                phase === 'final-minute' && 'motion-safe:animate-urgency-pulse',
              )}
              role="timer"
              aria-live="off"
              aria-label={t('chrono.timerAria', { label, status })}
            >
              {showCountdown ? (
                <SmoothCountdown date={targetMs} renderer={renderMonumentCounter} />
              ) : (
                <div className="flex min-h-[96px] items-center justify-center">
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

            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{status}</p>

            {/* Signature Allocation reserve */}
            <div
              data-testid="monument-reserve"
              className="mx-auto mt-3.5 w-full max-w-md rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-2.5"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {t('deck.monument.reserveLabel')}
                <InfoTooltip
                  content={t(`status.metrics.signatureTooltip.${attachedAssetVariant}`, {
                    cscNftCount: signatureNftCount,
                    ...attachedAssetValues,
                  })}
                  className="ml-1.5"
                />
              </p>
              <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-gradient-signature">
                {reserveEth.toFixed(4)} ETH
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('deck.monument.reserveExtras')}
              </p>
            </div>

            {/* Latest gesture line */}
            {latestGesture ? (
              <Link
                href={`/gesture/${latestGesture.EvtLogId}`}
                data-testid="monument-latest-gesture"
                className={cn(
                  'mx-auto mt-2.5 flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-left text-sm transition-colors hover:border-primary/35 hover:bg-white/[0.05]',
                  isPulsing && 'animate-live-flash',
                )}
                aria-label={t('ticker.openLatestAria', { id: String(latestGesture.EvtLogId) })}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/20">
                    <Radio className="h-3.5 w-3.5" />
                    {isPulsing && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300" />
                    )}
                  </span>
                  <span className="min-w-0">
                    {/* Wraps on narrow phones instead of truncating — the
                      address is the useful part and an ellipsis cuts it off
                      (flagged by the mobile overflow audit). */}
                    <span className="block break-words text-sm font-medium text-foreground">
                      {t('ticker.gestureLine', {
                        address: shortenHex(latestGesture.BidderAddr, 6),
                        kind: getGestureKindSelectValue(latestGesture.GestureType),
                      })}
                      {account && latestGesture.BidderAddr === account && (
                        <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                          {t('deck.monument.youChip')}
                        </span>
                      )}
                    </span>
                    {/* Exactly what the previous gesture paid — the number every
                      next participant wants before deciding their own move. */}
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                      <span
                        data-testid="monument-latest-payment"
                        className="font-mono font-semibold tabular-nums text-primary"
                      >
                        {formatGesturePayment(latestGesture, t('ticker.paymentUnavailable'))}
                      </span>
                      {hasRandomWalkToken(latestGesture) && (
                        <>
                          <span aria-hidden>·</span>
                          <span>
                            {t('ticker.rwlkToken', { id: String(latestGesture.RWalkNFTId) })}
                          </span>
                        </>
                      )}
                      <span aria-hidden>·</span>
                      <span>{formatRelativeGestureAge(latestGesture.TimeStamp, now, t)}</span>
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ) : null}

            {gestureConsole ? (
              <div
                className="mx-auto mt-4 w-full max-w-xl space-y-3 text-left"
                data-testid="monument-console"
              >
                {gestureConsole}
                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                  {t('deck.monument.microcopy')}
                </p>
                {/* Notify-before-finalization threshold */}
                {onNotifyThresholdChange && cycleState.isFinalizationCountdownActive && (
                  <div
                    data-testid="monument-notify-control"
                    role="group"
                    aria-label={t('deck.monument.notifyAria')}
                    className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-muted-foreground"
                  >
                    <BellRing
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70"
                      aria-hidden
                    />
                    <span>{t('deck.monument.notifyLabel')}</span>
                    {NOTIFY_THRESHOLD_CHOICES_MIN.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onClick={() => onNotifyThresholdChange(minutes)}
                        aria-pressed={notifyThresholdMin === minutes}
                        data-touch-target="extended"
                        className={cn(
                          'rounded-full border px-2 py-0.5 font-semibold transition-colors',
                          TOUCH_TARGET_EXTENDED_CLASS,
                          notifyThresholdMin === minutes
                            ? 'border-primary/50 bg-primary/12 text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-muted-foreground hover:text-white',
                        )}
                      >
                        {t('deck.monument.notifyMinutes', { minutes: String(minutes) })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="mt-5 flex flex-col items-center gap-1">
                  {/* Between cycles, offer the opening as a calendar event. */}
                  {cycleState.isOpeningSoon && (cycleState.activationTime ?? 0) > 0 && (
                    <a
                      data-testid="monument-calendar-link"
                      href={buildCalendarInviteDataUri({
                        uid: `cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening`,
                        title: t('deck.monument.calendarTitle', {
                          number: String(data?.CurRoundNum ?? ''),
                        }),
                        description: t('deck.monument.calendarBody'),
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
                      {t('deck.monument.calendarCta')}
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
              )
            )}
          </div>
          {sidePanel ? (
            <div
              data-testid="monument-side-panel"
              className="relative min-h-0 border-t border-white/[0.08] xl:border-l xl:border-t-0"
            >
              <div className="p-4 sm:p-5 xl:absolute xl:inset-0 xl:overflow-y-auto">
                {sidePanel}
              </div>
            </div>
          ) : null}
        </div>
      </Surface>
    </section>
  );
}
