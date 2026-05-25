'use client';

import type { ReactNode } from 'react';
import type { CountdownRenderProps } from 'react-countdown';

import { useNow } from '@/hooks/useNow';

import Counter from './Counter';

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
  intervalMs?: number;
  renderer?: (props: CountdownRenderProps) => ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  intervalMs = 100,
  renderer,
  size = 'md',
}: SmoothCountdownProps) {
  const nowMs = useNow(intervalMs);
  const props = toCountdownRenderProps(getCountdownParts(date, nowMs));

  if (renderer) return <>{renderer(props)}</>;
  return <Counter {...props} size={size} />;
}
