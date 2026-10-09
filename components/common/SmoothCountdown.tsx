'use client';

import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';

import { useNow } from '@/hooks/useNow';
import { clockUnitLabels, type ClockUnit } from '@/utils/format/durations';

/** The locale's unit captions, for a renderer that labels its figures. */
export type CountdownUnitLabels = Readonly<Record<ClockUnit, string>>;

/** The time left, split into whole units, plus its total. */
export interface CountdownParts {
  /** Milliseconds left, never negative. */
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  completed: boolean;
}

/** What a renderer receives: the parts and the locale's unit captions. Nothing else. */
export interface LocalizedCountdownRenderProps extends CountdownParts {
  unitLabels: CountdownUnitLabels;
}

interface SmoothCountdownProps {
  date: number;
  /** Serialized clock sample shared by SSR and the first hydration render. */
  initialNowMs?: number;
  intervalMs?: number;
  /**
   * Draws the remaining time. Every clock sets its own figures (the home
   * clock, the dock, the finalize window), so the countdown only supplies
   * the parts and the locale's unit captions (the Cycle clock's one catalog).
   */
  renderer: (props: LocalizedCountdownRenderProps) => ReactNode;
}

/** The whole units between now and a target, clamped at zero. */
export function getCountdownParts(targetMs: number, nowMs: number): CountdownParts {
  const total = Math.max(0, Math.ceil(targetMs - nowMs));
  const days = Math.floor(total / 86_400_000);
  const afterDays = total - days * 86_400_000;
  const hours = Math.floor(afterDays / 3_600_000);
  const afterHours = afterDays - hours * 3_600_000;
  const minutes = Math.floor(afterHours / 60_000);
  const afterMinutes = afterHours - minutes * 60_000;
  const seconds = Math.floor(afterMinutes / 1000);
  const milliseconds = afterMinutes - seconds * 1000;

  return {
    total,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    completed: total <= 0,
  };
}

/**
 * A countdown to `date` on the app's shared ticker. It renders the page's
 * clock sample through hydration (so server and client agree), then the live
 * browser clock.
 */
export function SmoothCountdown({
  date,
  initialNowMs = 0,
  intervalMs = 100,
  renderer,
}: SmoothCountdownProps) {
  const locale = useLocale();
  // The shared ticker reports 0 during SSR/hydration. An epoch deadline
  // must use the page's clock sample until the live browser ticker takes over.
  const nowMs = useNow(intervalMs) || initialNowMs;
  return (
    <>{renderer({ ...getCountdownParts(date, nowMs), unitLabels: clockUnitLabels(locale) })}</>
  );
}
