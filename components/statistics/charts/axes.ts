'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';

import { formatCount, formatDuration, formatDurationTick } from '@/utils/format';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { formatTimeTick } from './labels';
import { durationScale, elapsedTicks, linearScale, timeAxisTicks } from './ticks';

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
  /** The YAxis `width` its widest tick label needs (`yAxisWidth`). */
  width: number;
}

/**
 * Room a Y axis needs for its widest tick label: the label at the 12px tick
 * size (tabular digits, narrow separators, anything else a letter's width,
 * CJK a full em) plus the space Recharts keeps between the label and the plot
 * (its tick size and our tick margin, 6px each) and 2px of air. A fixed width
 * clipped "10,000" and "100,000" at a phone's width.
 */
export function yAxisWidth(labels: readonly string[], min = 28): number {
  const glyph = (char: string): number => {
    if (/[0-9]/.test(char)) return 7.8;
    if (/[.,:'’\s\u00a0\u202f]/.test(char)) return 4;
    if (/[\u3000-\u9fff\uac00-\ud7af]/.test(char)) return 12;
    return 7.6;
  };
  const widest = labels.reduce(
    (max, label) =>
      Math.max(
        max,
        [...label].reduce((sum, char) => sum + glyph(char), 0),
      ),
    0,
  );
  return Math.max(min, Math.ceil(widest + 14));
}

/** An axis with its labels measured into `width`. */
function measured(axis: Omit<NumericAxis, 'width'>): NumericAxis {
  return { ...axis, width: yAxisWidth(axis.ticks.map(axis.format)) };
}

/** A date axis over Unix seconds: calendar ticks and their labels ("Aug 12", "14:00", "Sep"). */
export function useTimeAxis(fromTs: number, toTs: number, count?: number): NumericAxis {
  const locale = useLocale();
  const tickCount = useTickCount();
  const wanted = count ?? tickCount;
  return useMemo(() => {
    const { step, ticks } = timeAxisTicks(fromTs, toTs, wanted);
    const first = ticks[0];
    return measured({
      ticks,
      domain: [fromTs, toTs],
      format: (ts: number) => formatTimeTick(ts, step, locale, { first: ts === first }),
    });
  }, [fromTs, toTs, wanted, locale]);
}

/**
 * Time into a cycle, in hours on the data and whole days or hours on the
 * ticks. Its labels are short ("14d"), so a phone takes four of them, not
 * the date axes' three: "0 · 30d" gave a six-week cycle no scale.
 */
export function useElapsedHoursAxis(maxHours: number, count?: number): NumericAxis {
  const locale = useLocale();
  const tickCount = useTickCount(6, 4);
  const wanted = count ?? tickCount;
  return useMemo(() => {
    const seconds = elapsedTicks(Math.max(0, maxHours) * HOUR, wanted);
    const label = durationTick((seconds[1] ?? HOUR) - (seconds[0] ?? 0), locale);
    const ticks = seconds.map((s) => s / HOUR);
    return measured({
      ticks,
      domain: [0, Math.max(maxHours, ticks[ticks.length - 1] ?? 0)],
      format: (hours: number) => label(hours * HOUR),
    });
  }, [maxHours, wanted, locale]);
}

/** A duration axis in seconds on whole minutes, hours or days. */
export function useDurationAxis(minSeconds: number, maxSeconds: number, count = 4): NumericAxis {
  const locale = useLocale();
  return useMemo(() => {
    const scale = durationScale(minSeconds, maxSeconds, count);
    const step = (scale.ticks[1] ?? HOUR) - (scale.ticks[0] ?? 0);
    return measured({ ...scale, format: durationTick(step, locale) });
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
    return measured({ ...scale, format: (value: number) => formatCount(value, locale) });
  }, [minValue, maxValue, count, locale]);
}

/** A count axis from zero on 1-2-5 steps, grouped in the locale's style. */
export function useCountAxis(maxValue: number, count = 4): NumericAxis {
  const locale = useLocale();
  return useMemo(() => {
    // Never finer than one: a count axis has no "2.5 gestures".
    const scale = linearScale(0, Math.max(count, maxValue), count);
    return measured({ ...scale, format: (value: number) => formatCount(value, locale) });
  }, [maxValue, count, locale]);
}
