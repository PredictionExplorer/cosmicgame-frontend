'use client';

import type { ReactNode } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import { useTranslations } from 'next-intl';

import { useNow } from '@/hooks/useNow';

/** The locale's unit words, for a renderer that labels its figures. */
export interface CountdownUnitLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface LocalizedCountdownRenderProps extends CountdownRenderProps {
  unitLabels: CountdownUnitLabels;
}

export interface CountdownParts {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  completed: boolean;
}

interface SmoothCountdownProps {
  date: number;
  /** Serialized clock sample shared by SSR and the first hydration render. */
  initialNowMs?: number;
  intervalMs?: number;
  /**
   * Draws the remaining time. Every clock sets its own figures (the home
   * clock, the dock, the finalize window), so the countdown only supplies
   * the parts and the locale's unit words.
   */
  renderer: (props: LocalizedCountdownRenderProps) => ReactNode;
}

const EMPTY_API = {} as CountdownRenderProps['api'];
const EMPTY_FORMATTED = {} as CountdownRenderProps['formatted'];
const EMPTY_PROPS = {} as CountdownRenderProps['props'];

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

export function toCountdownRenderProps(parts: CountdownParts): CountdownRenderProps {
  return {
    ...parts,
    api: EMPTY_API,
    props: EMPTY_PROPS,
    formatted: EMPTY_FORMATTED,
  } as CountdownRenderProps;
}

export function SmoothCountdown({
  date,
  initialNowMs = 0,
  intervalMs = 100,
  renderer,
}: SmoothCountdownProps) {
  const t = useTranslations('formats');
  // The shared ticker reports 0 during SSR/hydration. An epoch deadline
  // must use the page's clock sample until the live browser ticker takes over.
  const nowMs = useNow(intervalMs) || initialNowMs;
  const props = toCountdownRenderProps(getCountdownParts(date, nowMs));
  const unitLabels: CountdownUnitLabels = {
    days: t('countdown.days'),
    hours: t('countdown.hours'),
    minutes: t('countdown.minutes'),
    seconds: t('countdown.seconds'),
  };
  return <>{renderer({ ...props, unitLabels })}</>;
}
