'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';

import { formatCount, formatDuration, formatDurationTick } from '@/utils/format';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { formatTimeTick } from './labels';
import { durationScale, elapsedTicks, linearScale, timeStep, timeTicks } from './ticks';

const HOUR = 3_600;

/**
 * A duration tick's label at `step` seconds apart: the compact "45m" / "2h" /
 * "1.5d", or "2h 46m" when minute steps sit past the hour, so two ticks never
 * both read "2.8h".
 */
function durationTick(step: number, locale: string) {
  return (seconds: number) =>
    step < HOUR && seconds >= HOUR
      ? formatDuration(seconds, { locale })
      : formatDurationTick(seconds, locale);
}

/** Fewer ticks on a phone, where six date labels would collide. */
export function useTickCount(wide = 6, narrow = 3): number {
  return useMediaQuery('(min-width: 640px)') ? wide : narrow;
}

export interface NumericAxis {
  ticks: number[];
  domain: [number, number];
  format: (value: number) => string;
}

/** A date axis over Unix seconds: calendar ticks and their labels ("Aug 12", "14:00", "Sep"). */
export function useTimeAxis(fromTs: number, toTs: number, count?: number): NumericAxis {
  const locale = useLocale();
  const tickCount = useTickCount();
  const wanted = count ?? tickCount;
  return useMemo(() => {
    const step = timeStep(fromTs, toTs, wanted);
    const ticks = timeTicks(fromTs, toTs, step);
    const first = ticks[0];
    return {
      ticks,
      domain: [fromTs, toTs],
      format: (ts: number) => formatTimeTick(ts, step, locale, { first: ts === first }),
    };
  }, [fromTs, toTs, wanted, locale]);
}

/** Time into a cycle, in hours on the data and whole days or hours on the ticks. */
export function useElapsedHoursAxis(maxHours: number, count?: number): NumericAxis {
  const locale = useLocale();
  const tickCount = useTickCount();
  const wanted = count ?? tickCount;
  return useMemo(() => {
    const seconds = elapsedTicks(Math.max(0, maxHours) * HOUR, wanted);
    const label = durationTick((seconds[1] ?? HOUR) - (seconds[0] ?? 0), locale);
    const ticks = seconds.map((s) => s / HOUR);
    return {
      ticks,
      domain: [0, Math.max(maxHours, ticks[ticks.length - 1] ?? 0)],
      format: (hours: number) => label(hours * HOUR),
    };
  }, [maxHours, wanted, locale]);
}

/** A duration axis in seconds on whole minutes, hours or days. */
export function useDurationAxis(minSeconds: number, maxSeconds: number, count = 4): NumericAxis {
  const locale = useLocale();
  return useMemo(() => {
    const scale = durationScale(minSeconds, maxSeconds, count);
    const step = (scale.ticks[1] ?? HOUR) - (scale.ticks[0] ?? 0);
    return { ...scale, format: durationTick(step, locale) };
  }, [minSeconds, maxSeconds, count, locale]);
}

/**
 * A figure axis on 1-2-5 steps around the data (not from zero), grouped in
 * the locale's style: a supply level or a gesture number.
 */
export function useLinearAxis(minValue: number, maxValue: number, count = 4): NumericAxis {
  const locale = useLocale();
  return useMemo(() => {
    const scale = linearScale(minValue, maxValue, count);
    return { ...scale, format: (value: number) => formatCount(value, locale) };
  }, [minValue, maxValue, count, locale]);
}

/** A count axis from zero on 1-2-5 steps, grouped in the locale's style. */
export function useCountAxis(maxValue: number, count = 4): NumericAxis {
  const locale = useLocale();
  return useMemo(() => {
    // Never finer than one: a count axis has no "2.5 gestures".
    const scale = linearScale(0, Math.max(count, maxValue), count);
    return { ...scale, format: (value: number) => formatCount(value, locale) };
  }, [maxValue, count, locale]);
}
