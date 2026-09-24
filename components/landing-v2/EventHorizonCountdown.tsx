'use client';

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getSiteRoute, resolveRouteHref } from '@/config/siteNav';
import { getLiveFreshness, type LiveFreshness } from '@/lib/liveFreshness';
import { getLiveDataPollIntervalMs } from '@/lib/pollingCadence';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';
import { LiveStatusView } from '@/components/ui/live-status-view';

import {
  getLandingCycleTimerSnapshot,
  mergeLandingCyclePoll,
  padClock,
  type ClockShard,
  type ClockUnit,
  type LandingCyclePoll,
  type LandingCycleReading,
  type LandingCycleTimerSnapshot,
} from './landing-cycle-clock';
// Zod-free fetch helpers, NOT the services/api barrel: importing the barrel
// pulled axios + the full schema module (~90 KB gzip) into the marketing
// host's bundle for three display-only reads.
import {
  fetchLandingCurrentTimeSec,
  fetchLandingDashboardSnapshot,
  fetchLandingFinalizationTimeSec,
} from './landing-cycle-data';
import styles from './EventHorizonCountdown.module.css';

/** The base cadence; it quickens near the deadline (lib/pollingCadence). */
export const POLL_INTERVAL_MS = 12_000;

const CLOCK_UNITS: readonly ClockUnit[] = ['days', 'hours', 'minutes', 'seconds'];

/** One poll of the three reads; each helper answers null on failure and never throws. */
async function pollLandingCycle(): Promise<LandingCyclePoll> {
  const sampledAtMs = Date.now();
  const [targetServerTimeSec, currentServerTimeSec, dashboard] = await Promise.all([
    fetchLandingFinalizationTimeSec(),
    fetchLandingCurrentTimeSec(),
    fetchLandingDashboardSnapshot(),
  ]);
  return { targetServerTimeSec, currentServerTimeSec, dashboard, sampledAtMs };
}

function subscribeOnline(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function readOnline(): boolean {
  return navigator.onLine !== false;
}

/**
 * Polls the three clock reads and keeps the last good value of each
 * (`mergeLandingCyclePoll`), so one failed request never blanks the clock;
 * ticks once a second; and follows the browser's online state.
 */
function useLandingCycleReading() {
  const [reading, setReading] = useState<LandingCycleReading | null>(null);
  const [nowMs, setNowMs] = useState<number | null>(null);
  const online = useSyncExternalStore(subscribeOnline, readOnline, () => true);
  const readingRef = useRef<LandingCycleReading | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollId: number | undefined;

    const refresh = async () => {
      const poll = await pollLandingCycle();
      if (cancelled) return;
      const next = mergeLandingCyclePoll(readingRef.current, poll);
      readingRef.current = next;
      setReading(next);
      setNowMs(Date.now());
    };

    // Adaptive cadence: the base poll ramps up near the finalization
    // deadline so the clock does not sit on a stale target while a
    // last-second gesture extends the cycle.
    const nextDelayMs = () => {
      const now = Date.now();
      const { finalizationTargetMs } = getLandingCycleTimerSnapshot({
        reading: readingRef.current,
        nowMs: now,
      });
      return getLiveDataPollIntervalMs(
        finalizationTargetMs > 0 ? finalizationTargetMs - now : null,
        POLL_INTERVAL_MS,
      );
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

  return { reading, nowMs, online };
}

/**
 * The clock as type: tabular figures joined by hairline colons, each unit
 * captioned beneath. The type scales with the room it has (a container
 * query over the digit count), so a three-digit day count still fits one
 * row on a 320px phone. `placeholder` draws the same structure with dashes
 * while the first reading is on its way, so nothing reflows when it lands.
 */
function ClockFigures({
  shards,
  labels,
  placeholder = false,
}: {
  shards: readonly ClockShard[];
  labels: Readonly<Record<ClockUnit, string>>;
  placeholder?: boolean;
}) {
  const digits = shards.reduce((total, shard) => total + padClock(shard.value).length, 0);
  return (
    <div
      className={cn(styles.units, placeholder && styles.placeholder)}
      style={{ '--clock-digits': digits } as CSSProperties}
      data-testid={placeholder ? 'countdown-placeholder' : 'countdown-units'}
      aria-hidden="true"
    >
      {shards.map((shard, index) => (
        <Fragment key={shard.unit}>
          {index > 0 ? <span className={styles.colon}>:</span> : null}
          <span className={styles.unit} data-countdown-unit={placeholder ? undefined : shard.unit}>
            <span
              className={cn('type-figure-xl', styles.value)}
              data-testid={placeholder ? undefined : 'countdown-value'}
            >
              {placeholder ? '––' : padClock(shard.value)}
            </span>
            <span className={cn('type-caption text-subtle', styles.unitLabel)}>
              {labels[shard.unit]}
            </span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

type PhaseCopyKey =
  | 'loading'
  | 'openingSoon'
  | 'waitingFirstGesture'
  | 'approach'
  | 'finalHour'
  | 'nearHorizon'
  | 'ready'
  | 'unavailable'
  | 'live';

function phaseCopyKey(phase: LandingCycleTimerSnapshot['phase']): PhaseCopyKey {
  switch (phase) {
    case 'opening-soon':
      return 'openingSoon';
    case 'waiting-first-gesture':
      return 'waitingFirstGesture';
    case 'final-hour':
      return 'finalHour';
    case 'final-ten':
    case 'final-minute':
      return 'nearHorizon';
    case 'ready-to-finalize':
    case 'confirming':
      return 'ready';
    case 'approach':
    case 'unavailable':
    case 'loading':
    case 'live':
      return phase;
  }
}

/**
 * The landing's live cycle clock: the same Cycle Finalization Time as the
 * app, read without the wallet stack. It never discards its last good
 * reading: a failed poll keeps the clock counting from that reading and the
 * freshness stamp says how old it is ("Reconnecting…", "Updates delayed ·
 * last update 2m ago", with the caveat that the clock may have moved). Only
 * when no reading ever arrived does it say the clock is unavailable, and
 * then it sends the visitor to the app instead of showing a dead instrument.
 */
export function EventHorizonCountdown() {
  const locale = useLocale();
  const formatT = useTranslations('formats');
  const timerT = useTranslations('landing.timer');
  const navT = useTranslations('nav');
  const { reading, nowMs, online } = useLandingCycleReading();

  const snapshot = getLandingCycleTimerSnapshot({
    reading,
    nowMs: nowMs ?? reading?.sampledAtMs ?? 0,
  });
  const { phase, showCountdown } = snapshot;
  const unavailable = phase === 'unavailable';
  const loading = phase === 'loading';
  const freshness: LiveFreshness =
    reading === null || nowMs === null
      ? 'connecting'
      : getLiveFreshness({
          lastSuccessAtMs: reading.lastSuccessAtMs,
          lastAttemptFailed: reading.lastAttemptFailed,
          online,
          pollIntervalMs: POLL_INTERVAL_MS,
          nowMs,
        });
  const ageMs =
    reading?.lastSuccessAtMs != null && nowMs !== null ? nowMs - reading.lastSuccessAtMs : 0;

  const cycleLabel =
    snapshot.cycleNumber == null
      ? timerT('cycle.current')
      : timerT('cycle.numbered', { number: snapshot.cycleNumber });
  const copyKey = phaseCopyKey(phase);
  const title = timerT(`phases.${copyKey}.title`, { cycle: cycleLabel });
  const body =
    copyKey === 'waitingFirstGesture' || copyKey === 'ready' || copyKey === 'unavailable'
      ? timerT(`phases.${copyKey}.body`)
      : null;

  const unitLabels = Object.fromEntries(
    CLOCK_UNITS.map((unit) => [unit, timerT(`units.${unit}`)]),
  ) as Record<ClockUnit, string>;
  const timerLabel = showCountdown
    ? timerT('countdownAria', {
        label: title,
        duration: snapshot.shards
          .map((shard) => timerT(`duration.${shard.unit}`, { count: shard.value }))
          .join(timerT('durationSeparator')),
      })
    : title;

  const app = resolveRouteHref(getSiteRoute('observatory'), 'landing', locale);
  const currentCycle = resolveRouteHref(getSiteRoute('currentCycle'), 'landing', locale);
  const gestureCount = snapshot.gestureCount;

  return (
    <section
      aria-label={formatT('liveCycleCountdown')}
      className={styles.clock}
      data-testid="event-horizon-countdown"
      data-phase={phase}
      data-fresh={freshness === 'live' ? 'true' : 'false'}
    >
      <div className={styles.panel}>
        <div className={styles.context}>
          <p className="type-eyebrow text-subtle">
            {unavailable ? timerT('cycleClock') : timerT('liveClock')}
          </p>
          <h2 className={cn('type-heading-1', styles.title, loading && styles.pending)}>{title}</h2>
          {gestureCount !== null && gestureCount > 0 ? (
            <p className={cn('type-body-sm text-muted-foreground', styles.fact)}>
              {timerT('gestureCount', { count: gestureCount })}
            </p>
          ) : null}
        </div>

        <div className={styles.readout}>
          <div role="timer" aria-live="off" aria-label={timerLabel}>
            {showCountdown ? (
              <ClockFigures shards={snapshot.shards} labels={unitLabels} />
            ) : loading ? (
              <ClockFigures shards={snapshot.shards} labels={unitLabels} placeholder />
            ) : (
              <p className={cn('type-body-md text-muted-foreground', styles.statement)}>{body}</p>
            )}
          </div>
          <noscript>
            <p className={cn('type-body-sm text-muted-foreground', styles.noscript)}>
              {timerT('noscript')}
            </p>
          </noscript>
        </div>

        <div className={styles.footer}>
          {unavailable ? (
            <span />
          ) : (
            <LiveStatusView
              state={freshness}
              ageMs={ageMs}
              variant="inline"
              clockCaveat={showCountdown}
              className={styles.stamp}
            />
          )}
          {showCountdown || loading ? (
            <SiteLink
              href={currentCycle.href}
              kind={currentCycle.kind}
              className="link-quiet type-body-sm inline-flex min-h-11 items-center gap-1.5 text-foreground sm:min-h-8"
            >
              {timerT('currentCycle')}
              <ArrowRight aria-hidden className="size-4 text-subtle" />
            </SiteLink>
          ) : (
            <SiteLink
              href={app.href}
              kind={app.kind}
              className={cn(buttonVariants({ variant: 'outline' }), 'no-underline')}
            >
              {navT('cta.openApp')}
              <ArrowRight aria-hidden />
            </SiteLink>
          )}
        </div>
      </div>
    </section>
  );
}
