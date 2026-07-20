'use client';

import { useSyncExternalStore, type ReactNode } from 'react';

import { convertTimestampToDateTime } from '@/utils';

import { useNow } from '@/hooks/useNow';

const subscribeToHydration = () => () => {};

/**
 * Returns deterministic UTC during SSR and the first hydration pass, then
 * switches to the browser's local time without producing a hydration mismatch.
 */
export function useHydrationSafeDateTime(
  timestamp: number,
  showSecond: boolean = false,
  locale: string = 'en',
): string {
  const localValue = convertTimestampToDateTime(timestamp, showSecond, locale);
  const serverValue = convertTimestampToDateTime(timestamp, showSecond, locale, 'utc');

  return useSyncExternalStore(
    subscribeToHydration,
    () => localValue,
    () => serverValue,
  );
}

/**
 * Returns a deterministic server fallback through hydration, then captures
 * browser time after mount. Use it for relative-time labels that would
 * otherwise call `Date.now()` during render.
 */
export function useHydrationSafeNowSeconds(serverFallbackSeconds: number): number {
  const nowMs = useNow(60_000);

  return nowMs > 0 ? Math.floor(nowMs / 1000) : serverFallbackSeconds;
}

interface HydrationSafeDateTimeProps {
  timestamp: number;
  showSecond?: boolean;
  locale?: string;
  children?: (value: string) => ReactNode;
}

/** Hydration-safe client boundary for server or client component owners. */
export function HydrationSafeDateTime({
  timestamp,
  showSecond = false,
  locale = 'en',
  children,
}: HydrationSafeDateTimeProps) {
  const value = useHydrationSafeDateTime(timestamp, showSecond, locale);
  return <>{children ? children(value) : value}</>;
}
