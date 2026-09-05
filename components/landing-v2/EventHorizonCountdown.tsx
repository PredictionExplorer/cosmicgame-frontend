'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Radio } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

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
import styles from './EventHorizonCountdown.module.css';

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

function LandingStaticClock({ text }: { text: string }) {
  return <p className={styles.staticClock}>{text}</p>;
}

function LandingShardGrid({ shards }: { shards: DisplayTimeShard[] }) {
  // Size by the available clock width and longest value, so even a distant
  // opening date keeps every digit visible in four columns on a narrow phone.
  const maxDigits = Math.max(...shards.map((shard) => pad(shard.value).length));
  const digitStyle = { '--digit-scale': `${18 / maxDigits}cqw` } as CSSProperties;

  return (
    <div
      className={styles.units}
      style={digitStyle}
      data-testid="countdown-units"
      aria-hidden="true"
    >
      {shards.map((shard) => (
        <div key={shard.unit} className={styles.unit} data-countdown-unit={shard.unit}>
          <span className={styles.value} data-testid="countdown-value">
            {pad(shard.value)}
          </span>
          <span className={styles.unitLabel}>{shard.label}</span>
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
  const statusText =
    snapshot.phase === 'loading' || snapshot.phase === 'unavailable'
      ? null
      : isReady
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
  const displayShards = snapshot.shards.map((shard) => ({
    ...shard,
    label: formatT(`countdown.${shard.unit}`),
  }));
  const tone = isFinalMinutes
    ? 'critical'
    : isUrgent
      ? 'urgent'
      : isReady || isWaitingForFirstGesture
        ? 'ready'
        : isOpeningSoon
          ? 'opening'
          : 'live';

  return (
    <section
      aria-label={formatT('liveCycleCountdown')}
      className={styles.clock}
      data-testid="event-horizon-countdown"
      data-tone={tone}
    >
      <div className={styles.panel}>
        <div className={styles.context}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} aria-hidden="true" />
            {timerT('liveClock')}
            <span className={styles.cycle}>
              {snapshot.cycleNumber == null
                ? timerT('cycle.generic')
                : timerT('cycle.numbered', { number: snapshot.cycleNumber })}
            </span>
          </div>
          <h2 className={styles.title}>{phaseCopy.title}</h2>
          <p className={styles.description}>{phaseCopy.body}</p>
          {sample?.dashboard && (
            <div className={styles.metadata}>
              <span>{timerT('gestureCount', { count: snapshot.gestureCount })}</span>
              <span>{timerT('sameClock')}</span>
            </div>
          )}
        </div>

        <div className={styles.instrument}>
          <div role="timer" aria-live="off" aria-label={timerAriaLabel}>
            {snapshot.showCountdown ? (
              <LandingShardGrid shards={displayShards} />
            ) : (
              <LandingStaticClock text={staticClockText} />
            )}
          </div>
          <div className={styles.footer}>
            {statusText && (
              <span className={styles.status}>
                <Radio aria-hidden="true" />
                {statusText}
              </span>
            )}
            <div className={styles.links}>
              <a href={localeHref(APP_ORIGIN, '/', locale)} rel="noopener">
                {timerT('openLiveCycle')}
                <ArrowRight aria-hidden="true" />
              </a>
              <a
                href={CST_GECKOTERMINAL_POOL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.poolLink}
              >
                <Image
                  src="/images/brands/geckoterminal-symbol.svg"
                  width={16}
                  height={16}
                  alt=""
                  aria-hidden="true"
                />
                {timerT('viewCstPool')}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
