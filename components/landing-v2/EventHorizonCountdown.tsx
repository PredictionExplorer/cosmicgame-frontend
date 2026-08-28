'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Radio, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { getCycleState, getDashboardActivationTime, type CyclePhase } from '@/lib/cycleState';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { getLiveDataPollIntervalMs } from '@/lib/pollingCadence';
import { getStableClientTargetTime } from '@/utils/time';

// Zod-free fetch helpers, NOT the services/api barrel: importing the barrel
// pulled axios + the full schema module (~90 KB gzip) into the marketing
// host's bundle for three display-only reads.
import {
  fetchLandingCurrentTimeSec,
  fetchLandingDashboardSnapshot,
  fetchLandingFinalizationTimeSec,
  type LandingDashboardSnapshot,
} from './landing-cycle-data';

const POLL_INTERVAL_MS = 12_000;

type TimerPhase = CyclePhase;

type LandingCycleTimerSample = {
  targetServerTimeSec: number | null;
  currentServerTimeSec: number | null;
  dashboard: LandingDashboardSnapshot | null;
  sampledAtMs: number;
};

type TimeShard = {
  unit: 'days' | 'hours' | 'minutes' | 'seconds';
  value: number;
};

type DisplayTimeShard = TimeShard & {
  label: string;
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
};

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function getShards(remainingMs: number): TimeShard[] {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  return [
    { unit: 'days', value: Math.floor(totalSeconds / 86_400) },
    { unit: 'hours', value: Math.floor((totalSeconds % 86_400) / 3_600) },
    { unit: 'minutes', value: Math.floor((totalSeconds % 3_600) / 60) },
    { unit: 'seconds', value: totalSeconds % 60 },
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
): DisplayTimeShard[] {
  return [
    { unit: 'days', label: labels.days, value: days },
    { unit: 'hours', label: labels.hours, value: hours },
    { unit: 'minutes', label: labels.minutes, value: minutes },
    { unit: 'seconds', label: labels.seconds, value: seconds },
  ];
}

function LandingStaticClock({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/20 px-4 py-8 text-center shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
      <p className="font-display text-3xl font-semibold tracking-tight text-[rgb(var(--impact-green-rgb))] sm:text-4xl">
        {text}
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
  shards: DisplayTimeShard[];
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
    return {
      phase: 'loading',
      targetMs: 0,
      finalizationTargetMs: 0,
      remainingMs: 0,
      showCountdown: false,
      shards: getShards(0),
      cycleNumber: null,
      gestureCount: 0,
    };
  }

  const finalizationTargetMs = getStableClientTargetTime({
    targetServerTimeSec: sample.targetServerTimeSec,
    currentServerTimeSec: sample.currentServerTimeSec,
    currentServerTimeUpdatedAtMs: sample.sampledAtMs,
    fallbackNowMs: nowMs,
  });
  const rawActivationTime = getDashboardActivationTime(sample.dashboard);
  const projectedActivationTargetMs = getStableClientTargetTime({
    targetServerTimeSec: rawActivationTime,
    currentServerTimeSec: sample.currentServerTimeSec,
    currentServerTimeUpdatedAtMs: sample.sampledAtMs,
    fallbackNowMs: nowMs,
  });
  const activationTime =
    projectedActivationTargetMs > 0 ? projectedActivationTargetMs / 1000 : null;
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

  return {
    phase,
    targetMs,
    finalizationTargetMs,
    remainingMs,
    showCountdown,
    shards: getShards(remainingMs),
    cycleNumber,
    gestureCount: sample.dashboard?.CurNumBids ?? 0,
  };
}

async function fetchLandingCycleTimerSample(): Promise<LandingCycleTimerSample> {
  const sampledAtMs = Date.now();
  const [targetServerTimeSec, currentServerTimeSec, dashboard] = await Promise.all([
    fetchLandingFinalizationTimeSec(),
    fetchLandingCurrentTimeSec(),
    fetchLandingDashboardSnapshot(),
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
  const timerT = useTranslations('landing.timer');
  const [sample, setSample] = useState<LandingCycleTimerSample | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const sampleRef = useRef<LandingCycleTimerSample | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollId: number | undefined;

    const refresh = async () => {
      try {
        const nextSample = await fetchLandingCycleTimerSample();
        if (!cancelled) {
          sampleRef.current = nextSample;
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

    // Adaptive cadence: the base 12s poll ramps up near the finalization
    // deadline so the landing timer doesn't sit on a stale target while a
    // last-second gesture extends the cycle (see lib/pollingCadence).
    const nextDelayMs = () => {
      const snapshot = getLandingCycleTimerSnapshot({
        sample: sampleRef.current,
        nowMs: Date.now(),
      });
      const remainingMs =
        snapshot.finalizationTargetMs > 0 ? snapshot.finalizationTargetMs - Date.now() : null;
      return getLiveDataPollIntervalMs(remainingMs, POLL_INTERVAL_MS);
    };

    const loop = async () => {
      await refresh();
      if (!cancelled) pollId = window.setTimeout(loop, nextDelayMs());
    };

    void loop();
    const tickId = window.setInterval(() => setNowMs(Date.now()), 1000);

    return () => {
      cancelled = true;
      if (pollId !== undefined) window.clearTimeout(pollId);
      window.clearInterval(tickId);
    };
  }, []);

  const snapshot = useMemo(() => {
    if (loadFailed && !sample) {
      return {
        phase: 'unavailable' as const,
        targetMs: 0,
        finalizationTargetMs: 0,
        remainingMs: 0,
        showCountdown: false,
        shards: getShards(0),
        cycleNumber: null,
        gestureCount: 0,
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
  const cycleLabel =
    snapshot.cycleNumber == null
      ? timerT('cycle.current')
      : timerT('cycle.numbered', { number: snapshot.cycleNumber });
  const phaseCopy = (() => {
    switch (snapshot.phase) {
      case 'loading':
        return {
          title: timerT('phases.loading.title'),
          body: timerT('phases.loading.body'),
        };
      case 'opening-soon':
        return {
          title: timerT('phases.openingSoon.title', { cycle: cycleLabel }),
          body: timerT('phases.openingSoon.body'),
        };
      case 'waiting-first-gesture':
        return {
          title: timerT('phases.waitingFirstGesture.title', { cycle: cycleLabel }),
          body: timerT('phases.waitingFirstGesture.body'),
        };
      case 'approach':
        return {
          title: timerT('phases.approach.title', { cycle: cycleLabel }),
          body: timerT('phases.approach.body'),
        };
      case 'final-hour':
        return {
          title: timerT('phases.finalHour.title', { cycle: cycleLabel }),
          body: timerT('phases.finalHour.body'),
        };
      case 'final-ten':
      case 'final-minute':
        return {
          title: timerT('phases.nearHorizon.title', { cycle: cycleLabel }),
          body: timerT('phases.nearHorizon.body'),
        };
      case 'ready-to-finalize':
        return {
          title: timerT('phases.ready.title', { cycle: cycleLabel }),
          body: timerT('phases.ready.body'),
        };
      case 'unavailable':
        return {
          title: timerT('phases.unavailable.title'),
          body: timerT('phases.unavailable.body'),
        };
      case 'live':
      default:
        return {
          title: timerT('phases.live.title', { cycle: cycleLabel }),
          body: timerT('phases.live.body'),
        };
    }
  })();
  const staticClockText =
    snapshot.phase === 'waiting-first-gesture'
      ? timerT('staticClock.waitingFirstGesture')
      : snapshot.phase === 'ready-to-finalize'
        ? timerT('staticClock.ready')
        : snapshot.phase === 'unavailable'
          ? timerT('staticClock.unavailable')
          : timerT('staticClock.syncing');
  const statusText = isReady
    ? timerT('status.ready')
    : isOpeningSoon
      ? timerT('status.openingSoon')
      : isWaitingForFirstGesture
        ? timerT('status.waitingFirstGesture')
        : timerT('status.synchronized');
  const longUnitLabels = {
    days: formatT('countdownLong.days'),
    hours: formatT('countdownLong.hours'),
    minutes: formatT('countdownLong.minutes'),
    seconds: formatT('countdownLong.seconds'),
  };
  const timerAriaLabel = snapshot.showCountdown
    ? timerT('countdownAria', {
        label: phaseCopy.title,
        duration: snapshot.shards
          .map((shard) =>
            timerT('durationPart', {
              value: shard.value,
              unit: longUnitLabels[shard.unit],
            }),
          )
          .join(timerT('durationSeparator')),
      })
    : phaseCopy.title;
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
              {timerT('liveClock')}
            </div>

            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/50">
                {snapshot.cycleNumber == null
                  ? timerT('cycle.generic')
                  : timerT('cycle.numbered', { number: snapshot.cycleNumber })}
              </p>
              <h2 className="mt-2 max-w-xl text-balance font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {phaseCopy.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                {phaseCopy.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/55">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {timerT('gestureCount', { count: snapshot.gestureCount })}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                {timerT('sameClock')}
              </span>
            </div>
          </div>

          <div role="timer" aria-live="off" aria-label={timerAriaLabel} className="relative">
            {snapshot.showCountdown ? (
              <SmoothCountdown date={snapshot.targetMs} renderer={renderShardGrid} />
            ) : (
              <LandingStaticClock text={staticClockText} />
            )}

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-white/70 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" aria-hidden />
                {statusText}
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
                <a
                  href={localeHref(APP_ORIGIN, '/', locale)}
                  rel="noopener"
                  className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-white"
                >
                  {timerT('openLiveCycle')}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={CST_GECKOTERMINAL_POOL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-white/65 transition hover:text-white"
                >
                  <Image
                    src="/images/brands/geckoterminal-symbol.svg"
                    width={16}
                    height={16}
                    alt=""
                    aria-hidden
                  />
                  {timerT('viewCstPool')}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-5 hidden items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35 sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
          {timerT('eventHorizon')}
        </div>
      </div>
    </section>
  );
}
