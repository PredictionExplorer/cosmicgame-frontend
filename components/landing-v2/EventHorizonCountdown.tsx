'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, Radio, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import api from '@/services/api';
import { getCycleState, getDashboardActivationTime, type CyclePhase } from '@/lib/cycleState';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { getStableClientTargetTime } from '@/utils/time';
import type { DashboardInfo } from '@/services/api';

const POLL_INTERVAL_MS = 12_000;

type TimerPhase = CyclePhase;

type LandingCycleTimerSample = {
  targetServerTimeSec: number | null;
  currentServerTimeSec: number | null;
  dashboard: DashboardInfo | null;
  sampledAtMs: number;
};

type TimeShard = {
  label: string;
  value: number;
};

type LandingCycleTimerSnapshot = {
  phase: TimerPhase;
  targetMs: number;
  finalizationTargetMs: number;
  remainingMs: number;
  showCountdown: boolean;
  shards: TimeShard[];
  cycleNumber: number | null;
  gestureCount: number;
  title: string;
  body: string;
  ariaLabel: string;
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function getShards(remainingMs: number): TimeShard[] {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  return [
    { label: 'Days', value: Math.floor(totalSeconds / 86_400) },
    { label: 'Hours', value: Math.floor((totalSeconds % 86_400) / 3_600) },
    { label: 'Min', value: Math.floor((totalSeconds % 3_600) / 60) },
    { label: 'Sec', value: totalSeconds % 60 },
  ];
}

function getShardsFromCountdown(
  {
    days,
    hours,
    minutes,
    seconds,
  }: Pick<CountdownRenderProps, 'days' | 'hours' | 'minutes' | 'seconds'>,
  labels: { days: string; hours: string; minutes: string; seconds: string },
): TimeShard[] {
  return [
    { label: labels.days, value: days },
    { label: labels.hours, value: hours },
    { label: labels.minutes, value: minutes },
    { label: labels.seconds, value: seconds },
  ];
}

function copyForPhase(phase: TimerPhase, cycleNumber: number | null) {
  const cycleLabel = cycleNumber == null ? 'the current cycle' : `Cycle #${cycleNumber}`;

  switch (phase) {
    case 'loading':
      return {
        title: 'Synchronizing the cycle horizon',
        body: 'Reading the live protocol clock before the countdown appears.',
      };
    case 'opening-soon':
      return {
        title: `${cycleLabel} opens soon`,
        body: 'The next cycle is preparing to open. When this countdown reaches zero, Gestures become available.',
      };
    case 'waiting-first-gesture':
      return {
        title: `${cycleLabel} is waiting for its first Gesture`,
        body: 'The first Gesture ignites the Cycle Finalization Time and starts shaping the next Signature.',
      };
    case 'approach':
      return {
        title: `${cycleLabel} finalizes in`,
        body: 'The cycle is live. Each Gesture shapes the Signature and can extend the finalization clock.',
      };
    case 'final-hour':
      return {
        title: `${cycleLabel} is entering the final hour`,
        body: 'Every new Gesture can extend the horizon and leave one more trace on the evolving Signature.',
      };
    case 'final-ten':
    case 'final-minute':
      return {
        title: `${cycleLabel} is near the horizon`,
        body: 'The Cycle Finalization Time is almost here. The next moments decide the final shape.',
      };
    case 'ready-to-finalize':
      return {
        title: `${cycleLabel} is ready to finalize`,
        body: 'The horizon has closed. The protocol is ready to transform the cycle into a final Signature.',
      };
    case 'unavailable':
      return {
        title: 'Live cycle clock unavailable',
        body: 'The landing page could not reach the protocol clock. Open the app for the latest cycle state.',
      };
    case 'live':
    default:
      return {
        title: `${cycleLabel} finalizes in`,
        body: 'This is the same live Cycle Finalization Time shown in the app. Each Gesture shapes the Signature and can extend the horizon.',
      };
  }
}

function landingStaticTextForPhase(phase: TimerPhase): string {
  if (phase === 'waiting-first-gesture') return 'Awaiting first Gesture';
  if (phase === 'ready-to-finalize') return '00:00';
  if (phase === 'unavailable') return 'Clock unavailable';
  return 'Syncing';
}

function LandingStaticClock({ phase }: { phase: TimerPhase }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 px-4 py-8 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      <p className="font-display text-3xl font-semibold tracking-tight text-[rgb(var(--impact-green-rgb))] sm:text-4xl">
        {landingStaticTextForPhase(phase)}
      </p>
    </div>
  );
}

function LandingShardGrid({
  shards,
  isFinalMinutes,
  isUrgent,
  isOpeningSoon,
  isWaitingForFirstGesture,
}: {
  shards: TimeShard[];
  isFinalMinutes: boolean;
  isUrgent: boolean;
  isOpeningSoon: boolean;
  isWaitingForFirstGesture: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {shards.map((shard) => (
        <div
          key={shard.label}
          className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 px-3 py-4 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-md"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          <div
            className={[
              'font-mono text-4xl font-semibold leading-none tabular-nums sm:text-5xl',
              isFinalMinutes
                ? 'text-[rgb(var(--chrono-rose-rgb))]'
                : isUrgent
                  ? 'text-[rgb(var(--solar-gold-rgb))]'
                  : isOpeningSoon || isWaitingForFirstGesture
                    ? 'text-[rgb(var(--impact-green-rgb))]'
                    : 'text-white',
            ].join(' ')}
          >
            {pad(shard.value)}
          </div>
          <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
            {shard.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function getLandingCycleTimerSnapshot({
  sample,
  nowMs,
}: {
  sample: LandingCycleTimerSample | null;
  nowMs: number;
}): LandingCycleTimerSnapshot {
  if (!sample) {
    const copy = copyForPhase('loading', null);
    return {
      phase: 'loading',
      targetMs: 0,
      finalizationTargetMs: 0,
      remainingMs: 0,
      showCountdown: false,
      shards: getShards(0),
      cycleNumber: null,
      gestureCount: 0,
      ariaLabel: copy.title,
      ...copy,
    };
  }

  const finalizationTargetMs = getStableClientTargetTime({
    targetServerTimeSec: sample.targetServerTimeSec,
    currentServerTimeSec: sample.currentServerTimeSec,
    currentServerTimeUpdatedAtMs: sample.sampledAtMs,
    fallbackNowMs: nowMs,
  });
  const activationTime = getDashboardActivationTime(sample.dashboard);
  const state =
    !sample.dashboard || (finalizationTargetMs <= 0 && activationTime == null)
      ? getCycleState({
          data: null,
          loading: false,
          allocationTime: finalizationTargetMs,
          activationTime,
          now: nowMs,
        })
      : getCycleState({
          data: sample.dashboard,
          loading: false,
          allocationTime: finalizationTargetMs,
          activationTime,
          now: nowMs,
        });
  const targetMs =
    state.isOpeningSoon && state.activationTime != null
      ? state.activationTime * 1000
      : finalizationTargetMs;
  const showCountdown = state.isOpeningSoon || state.isFinalizationCountdownActive;
  const remainingMs = showCountdown ? Math.max(0, targetMs - nowMs) : 0;
  const phase = state.phase;
  const cycleNumber = sample.dashboard?.CurRoundNum ?? null;
  const copy = copyForPhase(phase, cycleNumber);

  return {
    phase,
    targetMs,
    finalizationTargetMs,
    remainingMs,
    showCountdown,
    shards: getShards(remainingMs),
    cycleNumber,
    gestureCount: sample.dashboard?.CurNumBids ?? 0,
    ariaLabel: showCountdown
      ? `${copy.title}: ${getShards(remainingMs)
          .map((shard) => `${shard.value} ${shard.label}`)
          .join(', ')}`
      : copy.title,
    ...copy,
  };
}

async function fetchLandingCycleTimerSample(): Promise<LandingCycleTimerSample> {
  const sampledAtMs = Date.now();
  const [targetServerTimeSec, currentServerTimeSec, dashboard] = await Promise.all([
    api.get_prize_time(),
    api.get_current_time(),
    api.get_dashboard_info(),
  ]);

  return {
    targetServerTimeSec,
    currentServerTimeSec,
    dashboard,
    sampledAtMs,
  };
}

export function EventHorizonCountdown() {
  const locale = useLocale();
  const formatT = useTranslations('formats');
  const [sample, setSample] = useState<LandingCycleTimerSample | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const nextSample = await fetchLandingCycleTimerSample();
        if (!cancelled) {
          setSample(nextSample);
          setLoadFailed(false);
          setNowMs(Date.now());
        }
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
          setNowMs(Date.now());
        }
      }
    };

    void refresh();
    const pollId = window.setInterval(refresh, POLL_INTERVAL_MS);
    const tickId = window.setInterval(() => setNowMs(Date.now()), 1000);

    return () => {
      cancelled = true;
      window.clearInterval(pollId);
      window.clearInterval(tickId);
    };
  }, []);

  const snapshot = useMemo(() => {
    if (loadFailed && !sample) {
      const copy = copyForPhase('unavailable', null);
      return {
        phase: 'unavailable' as const,
        targetMs: 0,
        finalizationTargetMs: 0,
        remainingMs: 0,
        showCountdown: false,
        shards: getShards(0),
        cycleNumber: null,
        gestureCount: 0,
        ariaLabel: copy.title,
        ...copy,
      };
    }
    return getLandingCycleTimerSnapshot({ sample, nowMs: nowMs ?? sample?.sampledAtMs ?? 0 });
  }, [loadFailed, nowMs, sample]);

  const isOpeningSoon = snapshot.phase === 'opening-soon';
  const isWaitingForFirstGesture = snapshot.phase === 'waiting-first-gesture';
  const isUrgent =
    snapshot.phase === 'final-hour' ||
    snapshot.phase === 'final-ten' ||
    snapshot.phase === 'final-minute';
  const isFinalMinutes = snapshot.phase === 'final-ten' || snapshot.phase === 'final-minute';
  const isReady = snapshot.phase === 'ready-to-finalize';
  const longUnitLabels = {
    days: formatT('countdownLong.days'),
    hours: formatT('countdownLong.hours'),
    minutes: formatT('countdownLong.minutes'),
    seconds: formatT('countdownLong.seconds'),
  };
  const timerAriaLabel =
    locale === 'zh'
      ? snapshot.showCountdown
        ? `${formatT('liveCycleCountdown')}：${snapshot.shards
            .map(
              (shard, index) =>
                `${shard.value}${
                  [
                    longUnitLabels.days,
                    longUnitLabels.hours,
                    longUnitLabels.minutes,
                    longUnitLabels.seconds,
                  ][index] ?? ''
                }`,
            )
            .join('，')}`
        : formatT('liveCycleCountdown')
      : snapshot.ariaLabel;
  const renderShardGrid = (props: CountdownRenderProps) => (
    <LandingShardGrid
      shards={getShardsFromCountdown(props, longUnitLabels)}
      isFinalMinutes={isFinalMinutes}
      isUrgent={isUrgent}
      isOpeningSoon={isOpeningSoon}
      isWaitingForFirstGesture={isWaitingForFirstGesture}
    />
  );

  return (
    <section
      aria-label={formatT('liveCycleCountdown')}
      className="relative w-full max-w-4xl"
      data-testid="event-horizon-countdown"
    >
      <div
        className={[
          'relative overflow-hidden rounded-[2rem] border p-4 shadow-[0_28px_120px_-50px_rgb(var(--aurora-cyan-rgb)/0.75)] backdrop-blur-xl sm:p-5',
          isOpeningSoon
            ? 'border-[rgb(var(--nebula-violet-rgb)/0.42)] bg-[linear-gradient(135deg,rgb(var(--nebula-violet-rgb)/0.20),rgb(var(--cosmic-indigo-rgb)/0.50)_42%,rgb(var(--aurora-cyan-rgb)/0.12))]'
            : isWaitingForFirstGesture
              ? 'border-[rgb(var(--impact-green-rgb)/0.38)] bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.15),rgb(var(--cosmic-indigo-rgb)/0.50)_42%,rgb(var(--aurora-cyan-rgb)/0.15))]'
              : isFinalMinutes
                ? 'border-[rgb(var(--chrono-rose-rgb)/0.45)] bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.18),rgb(var(--cosmic-indigo-rgb)/0.50)_42%,rgb(var(--nebula-violet-rgb)/0.20))]'
                : isUrgent
                  ? 'border-[rgb(var(--solar-gold-rgb)/0.38)] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.13),rgb(var(--cosmic-indigo-rgb)/0.50)_48%,rgb(var(--nebula-violet-rgb)/0.18))]'
                  : 'border-white/15 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.12),rgb(var(--cosmic-indigo-rgb)/0.54)_46%,rgb(var(--nebula-violet-rgb)/0.18))]',
        ].join(' ')}
      >
        <div className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[rgb(var(--aurora-cyan-rgb)/0.22)] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[rgb(var(--nebula-violet-rgb)/0.28)] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 opacity-70 animate-orbit-slow" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 opacity-80 animate-cosmic-drift" />

        <div className="relative grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
              <span
                className={[
                  'h-2 w-2 rounded-full',
                  isReady
                    ? 'bg-emerald-300 animate-signature-pulse'
                    : isOpeningSoon
                      ? 'bg-[rgb(var(--nebula-violet-rgb))] animate-cosmic-drift'
                      : isWaitingForFirstGesture
                        ? 'bg-[rgb(var(--impact-green-rgb))] animate-live-dot'
                        : 'bg-primary animate-live-dot',
                ].join(' ')}
              />
              Live cycle clock
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/50">
                {snapshot.cycleNumber == null
                  ? 'Performance Cycle'
                  : `Cycle #${snapshot.cycleNumber}`}
              </p>
              <h2 className="mt-2 max-w-xl text-balance font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {snapshot.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {snapshot.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {snapshot.gestureCount} Gesture{snapshot.gestureCount === 1 ? '' : 's'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                Same clock as the app
              </span>
            </div>
          </div>

          <div role="timer" aria-live="off" aria-label={timerAriaLabel} className="relative">
            {snapshot.showCountdown ? (
              <SmoothCountdown date={snapshot.targetMs} renderer={renderShardGrid} />
            ) : (
              <LandingStaticClock phase={snapshot.phase} />
            )}

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-white/70 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" aria-hidden />
                {isReady
                  ? 'Ready to finalize'
                  : isOpeningSoon
                    ? 'Countdown to cycle opening'
                    : isWaitingForFirstGesture
                      ? 'Open and waiting for the first Gesture'
                      : 'Countdown synchronized to protocol time'}
              </span>
              <a
                href={localeHref(APP_ORIGIN, '/', locale)}
                rel="noopener"
                className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-white"
              >
                Open live cycle
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-5 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          Event horizon
        </div>
      </div>
    </section>
  );
}
