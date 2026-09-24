'use client';

import type { ReactNode } from 'react';

import { DateTime } from '@/components/ui/date-time';

export { useHydrationSafeDateTime, useHydrationSafeNowSeconds } from '@/components/ui/date-time';

interface HydrationSafeDateTimeProps {
  timestamp: number;
  showSecond?: boolean;
  /** Defaults to the active locale, like `<DateTime>`. */
  locale?: string;
  children?: (value: string) => ReactNode;
}

/**
 * Hydration-safe client boundary for server or client component owners:
 * the compact `<DateTime>` (UTC through hydration, then local time, inside
 * `<time dateTime title>` with the year whenever it is not the current one).
 *
 * @deprecated Render `<DateTime>` from `@/components/ui/date-time`, which
 * adds the `full` and `relative` variants.
 */
export function HydrationSafeDateTime({
  timestamp,
  showSecond = false,
  locale,
  children,
}: HydrationSafeDateTimeProps) {
  return (
    <DateTime timestamp={timestamp} seconds={showSecond} locale={locale}>
      {children}
    </DateTime>
  );
}
