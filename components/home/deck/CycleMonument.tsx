'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, Clock3, Radio } from 'lucide-react';
import { zeroAddress } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import Counter from '@/components/common/Counter';
import ConnectWalletButton from '@/components/common/ConnectWalletButton';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Button } from '@/components/ui/button';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Spinner } from '@/components/ui/spinner';
import { Surface } from '@/components/ui/surface';
import { getCycleState } from '@/lib/cycleState';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { useLivePulse } from '@/hooks/useLivePulse';
import { cn } from '@/lib/utils';
import { formatCstAmount, type CstGestureData } from '@/utils/cstGesture';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import type { DashboardInfo, GestureInfo } from '@/services/api';

import { getGestureSubmitLabel } from './gestureSubmitLabel';
import { viewForPhase } from './phaseView';

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
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
  gestureType: string;
  onSelectGestureType: (value: string) => void;
  canGesture: boolean;
  canClaim: boolean;
  isGesturing: boolean;
  isClaiming: boolean;
  claimWait: number;
  rwlkId: number;
  gestureCostPlus: number;
  onGesture: () => void;
  onFinalize: () => void;
  onOpenFullConsole: () => void;
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
  ethGestureInfo,
  cstGestureData,
  gestureType,
  onSelectGestureType,
  canGesture,
  canClaim,
  isGesturing,
  isClaiming,
  claimWait,
  rwlkId,
  gestureCostPlus,
  onGesture,
  onFinalize,
  onOpenFullConsole,
}: CycleMonumentProps) {
  const t = useTranslations('home');
  const locale = useLocale();
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

  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  const showActionArea = !loading && isRoundActive;
  const showCstOption = data?.LastBidderAddr !== zeroAddress;
  const reserveEth = data?.PrizeAmountEth ?? data?.CurPrizeAmountEth ?? 0;

  const submitLabel = getGestureSubmitLabel({
    t,
    gestureType,
    ethPrice: ethGestureInfo?.ETHPrice ?? 0,
    gestureCostPlus,
    rwlkId,
    cstGestureData,
  });
  const needsRwlkToken = gestureType === 'RandomWalk' && rwlkId === -1;
  const gestureDisabled = isGesturing || needsRwlkToken || gestureType === '';
  const finalizeWaiting = data?.LastBidderAddr !== account && claimWait > now;

  const renderInlineCountdown = ({ total }: CountdownRenderProps) => (
    <span className="font-mono tabular-nums">{formatSeconds(Math.ceil(total / 1000), locale)}</span>
  );
  const renderMonumentCounter = (props: CountdownRenderProps) => (
    <Counter {...props} size="xl" tone={cycleState.isOpeningSoon ? 'impact' : 'default'} />
  );

  const methodPills = [
    {
      value: 'ETH',
      label: t('form.method.eth.label'),
      cost: `${(ethGestureInfo?.ETHPrice ?? 0).toFixed(5)} ETH`,
      visible: true,
    },
    {
      value: 'RandomWalk',
      label: t('form.method.randomWalk.label'),
      cost: `${((ethGestureInfo?.ETHPrice ?? 0) / 2).toFixed(5)} ETH`,
      visible: showCstOption,
    },
    {
      value: 'CST',
      label: t('form.method.cst.label'),
      cost: cstGestureData.isFree
        ? t('status.metrics.free')
        : `${formatCstAmount(cstGestureData.CSTPrice)} CST`,
      visible: showCstOption,
    },
  ].filter((pill) => pill.visible);

  return (
    <section
      aria-label={t('chrono.sectionAria')}
      className="print-motion-visible relative z-[1] min-w-0"
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
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-70 sm:h-96 sm:w-96',
            view.haloClass,
            view.pulseClass,
          )}
        />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <div className="relative flex h-full flex-col px-4 py-6 text-center sm:px-7 sm:py-7">
          <div className="mx-auto mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:tracking-[0.24em]">
            <Clock3 className={cn('h-3.5 w-3.5', view.iconClass)} aria-hidden />
            {eyebrow}
            <InfoTooltip content={tooltip} className="ml-0" />
          </div>

          <div
            className={cn(
              'rounded-[1.75rem] border border-white/[0.10] bg-black/20 p-4 text-center backdrop-blur-md sm:p-6',
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

          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">{status}</p>

          {/* Signature Allocation reserve */}
          <div
            data-testid="monument-reserve"
            className="mx-auto mt-5 w-full max-w-md rounded-2xl border border-primary/20 bg-primary/[0.05] px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('deck.monument.reserveLabel')}
              <InfoTooltip content={t('status.metrics.signatureTooltip.base')} className="ml-1.5" />
            </p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums text-gradient-signature">
              {reserveEth.toFixed(4)} ETH
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t('deck.monument.reserveExtras')}</p>
          </div>

          {/* Latest gesture line */}
          {latestGesture ? (
            <Link
              href={`/gesture/${latestGesture.EvtLogId}`}
              data-testid="monument-latest-gesture"
              className={cn(
                'mx-auto mt-3 flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-left text-sm transition-colors hover:border-primary/35 hover:bg-white/[0.05]',
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
                  <span className="block truncate text-sm font-medium text-foreground">
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
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatRelativeGestureAge(latestGesture.TimeStamp, now, t)}
                  </span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ) : null}

          {showActionArea ? (
            <div className="mx-auto mt-5 w-full max-w-md space-y-3">
              {/* Method pills */}
              <div
                role="group"
                aria-label={t('form.methodLabel')}
                data-testid="monument-method-pills"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {methodPills.map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    onClick={() => onSelectGestureType(pill.value)}
                    aria-pressed={gestureType === pill.value}
                    className={cn(
                      'rounded-lg border px-2.5 py-2 text-center transition-all',
                      gestureType === pill.value
                        ? 'border-primary/50 bg-primary/10 text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-white',
                    )}
                  >
                    <span className="block text-xs font-medium">{pill.label}</span>
                    <span className="mt-0.5 block truncate text-[11px] font-mono tabular-nums opacity-70">
                      {pill.cost}
                    </span>
                  </button>
                ))}
              </div>

              {needsRwlkToken && (
                <button
                  type="button"
                  onClick={onOpenFullConsole}
                  className="w-full rounded-lg border border-amber-300/25 bg-amber-300/[0.07] px-3 py-2 text-xs text-amber-100 transition-colors hover:border-amber-300/45"
                >
                  {t('deck.monument.chooseRwlkToken')}
                </button>
              )}

              {/* Primary action */}
              {account ? (
                <>
                  {canGesture && (
                    <Button
                      id="deck-gesture-submit"
                      size="lg"
                      onClick={onGesture}
                      className="h-12 w-full border-0 bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] text-base font-semibold text-white hover:opacity-90"
                      disabled={gestureDisabled}
                    >
                      {isGesturing ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> {t('form.processing')}
                        </span>
                      ) : (
                        <>
                          {submitLabel} <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  )}
                  {canClaim && (
                    <Button
                      size="lg"
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
                  )}
                  {!canGesture && !canClaim && (
                    <p className="text-sm text-muted-foreground">{t('form.finalGestureMade')}</p>
                  )}
                </>
              ) : (
                <div
                  data-testid="monument-connect"
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p className="mb-3 text-sm text-muted-foreground">{t('form.connect.body')}</p>
                  <ConnectWalletButton
                    isMobileView={false}
                    loading={false}
                    balance={{ ETH: 0, CosmicToken: 0, CosmicSignature: 0, RWLK: 0 }}
                    stakedTokenCount={{ cst: 0, rwalk: 0 }}
                  />
                </div>
              )}

              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('deck.monument.microcopy')}
              </p>

              <button
                type="button"
                onClick={onOpenFullConsole}
                className={cn(
                  'mx-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-foreground',
                  TOUCH_TARGET_HEIGHT_CLASS,
                )}
              >
                {t('deck.monument.fullConsole')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : (
            !loading && (
              <div className="mt-5">
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
      </Surface>
    </section>
  );
}
