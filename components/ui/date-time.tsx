'use client';

import { useSyncExternalStore, type HTMLAttributes, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  UNAVAILABLE_VALUE,
  formatDateTime,
  formatDateTimeTitle,
  formatRelativeTime,
  formatTimeZoneLabel,
  toIsoDateTime,
  type DateTimeZone,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import { useNow } from '@/hooks/useNow';

const subscribeToNothing = () => () => {};

/**
 * `false` during SSR and the hydration pass, `true` afterwards. Date-times
 * render in UTC until then, so the server HTML and the first client render
 * agree, and switch to the reader's zone without a hydration mismatch.
 */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * The compact date-time of a timestamp as a string: deterministic UTC during
 * SSR and hydration, then the browser's local time. For attributes and
 * composed strings; render `<DateTime>` wherever markup is possible.
 * `locale` defaults to the active locale.
 */
export function useHydrationSafeDateTime(
  timestamp: number,
  showSecond: boolean = false,
  locale?: string,
): string {
  const activeLocale = useLocale();
  const hydrated = useHydrated();
  return formatDateTime(timestamp, {
    locale: locale ?? activeLocale,
    seconds: showSecond,
    timeZone: hydrated ? 'local' : 'utc',
  });
}

/**
 * Returns a deterministic server fallback through hydration, then captures
 * browser time after mount (refreshed every minute). Use it for relative-time
 * labels that would otherwise call `Date.now()` during render.
 */
export function useHydrationSafeNowSeconds(serverFallbackSeconds: number): number {
  const nowMs = useNow(60_000);
  return nowMs > 0 ? Math.floor(nowMs / 1000) : serverFallbackSeconds;
}

/**
 * The zone date-times are shown in ("UTC" on the server, "UTC+3" in the
 * browser after hydration), for a table or chart caption.
 */
export function useTimeZoneLabel(): string {
  return formatTimeZoneLabel(useHydrated() ? 'local' : 'utc');
}

export interface DateTimeProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Unix timestamp in seconds. */
  timestamp: number | null | undefined;
  /**
   * `compact` (default): tables and cards, the year only when it is not the
   * current one. `full`: detail pages, always the year and seconds.
   * `relative`: live surfaces ("3 hours ago"), with the absolute date on hover.
   */
  variant?: 'compact' | 'full' | 'relative';
  /** Seconds in the `compact` variant. */
  seconds?: boolean;
  /** Override the `compact` year rule. */
  year?: 'auto' | 'always' | 'never';
  /** Defaults to the active locale. */
  locale?: string;
  /**
   * The zone shown after hydration. Default `local` (the reader's zone); pass
   * `utc` where a page states UTC. SSR always renders UTC.
   */
  timeZone?: DateTimeZone;
  /** Render prop for composing the formatted value into other markup. */
  children?: (value: string) => ReactNode;
}

/**
 * One date-time, rendered as `<time dateTime title>`: the visible value in
 * the locale's compact or full form, the exact instant for machines, and the
 * full date with seconds, zone and age on hover. Hydration-safe (UTC on the
 * server, the reader's zone after mount) and never wrapping.
 */
export function DateTime({
  timestamp,
  variant = 'compact',
  seconds = false,
  year,
  locale,
  timeZone = 'local',
  className,
  children,
  ...rest
}: DateTimeProps) {
  const activeLocale = useLocale();
  const resolvedLocale = locale ?? activeLocale;
  const hydrated = useHydrated();
  const nowMs = useNow(60_000);
  const zone: DateTimeZone = hydrated ? timeZone : 'utc';
  const iso = toIsoDateTime(timestamp);

  if (!iso) {
    return (
      <span className={className} {...rest}>
        {children ? children(UNAVAILABLE_VALUE) : UNAVAILABLE_VALUE}
      </span>
    );
  }

  const now = nowMs > 0 ? nowMs : undefined;
  const absolute = formatDateTime(timestamp, {
    locale: resolvedLocale,
    style: variant === 'full' ? 'full' : 'compact',
    seconds,
    year,
    timeZone: zone,
    now,
  });
  const value =
    variant === 'relative' && now
      ? formatRelativeTime(timestamp, { locale: resolvedLocale, now })
      : absolute;
  const title = formatDateTimeTitle(timestamp, { locale: resolvedLocale, timeZone: zone, now });

  return (
    <time dateTime={iso} title={title} className={cn('whitespace-nowrap', className)} {...rest}>
      {children ? children(value) : value}
    </time>
  );
}

/**
 * "Time zone: UTC+3", once per table or chart that shows local date-times,
 * so no single cell has to carry the zone.
 */
export function TimeZoneNote({ className }: { className?: string }) {
  const t = useTranslations('formats');
  const zone = useTimeZoneLabel();
  return <span className={className}>{t('dateTime.timeZone', { zone })}</span>;
}
