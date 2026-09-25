'use client';

import type { HTMLAttributes, ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  UNAVAILABLE_VALUE,
  formatDateTime,
  formatDateTimeTitle,
  formatRelativeTime,
  formatTimeZoneLabel,
  formatZonedDateTimeParts,
  toIsoDateTime,
  type DateTimeZone,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import { useHydrated } from '@/hooks/useHydrated';
import { useNow } from '@/hooks/useNow';

/*
 * Every protocol record is dated in UTC, the block explorers' convention, on
 * the server and in the browser alike: the server HTML and every later render
 * agree, so a date never rewrites itself after load (it once flipped to the
 * reader's zone at hydration, sometimes to another calendar day, and moved the
 * record pages). The reader's own time is on hover, added once the page has
 * hydrated (a `title` change never moves anything). `timeZone="local"` still
 * exists for a surface that must show the reader's clock; it renders UTC until
 * hydration.
 */

/**
 * The compact date-time of a timestamp as a string, in UTC on the server and
 * in the browser, for attributes and composed strings; render `<DateTime>`
 * wherever markup is possible. `locale` defaults to the active locale.
 */
export function useHydrationSafeDateTime(
  timestamp: number,
  showSecond: boolean = false,
  locale?: string,
): string {
  const activeLocale = useLocale();
  return formatDateTime(timestamp, {
    locale: locale ?? activeLocale,
    seconds: showSecond,
    timeZone: 'utc',
  });
}

/**
 * The zone every date-time is shown in ("UTC"), for a table or chart caption
 * and for a date that names its zone inline.
 */
export function useTimeZoneLabel(): string {
  return formatTimeZoneLabel('utc');
}

/** Whether the reader's clock differs from UTC at that instant. */
function localDiffersFromUtc(timestamp: number): boolean {
  return new Date(timestamp * 1000).getTimezoneOffset() !== 0;
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
   * Default `utc`, the zone of every record, rendered the same on the server
   * and in the browser. `local` shows the reader's clock after hydration
   * (UTC until then), for the rare surface that must.
   */
  timeZone?: DateTimeZone;
  /**
   * Print the zone after the value ("Sep 23, 2026, 04:04:45 UTC"): a date
   * that stands alone (a record page, a header figure) says which zone it is
   * in; a table says it once with `<TimeZoneNote>`.
   */
  showZone?: boolean;
  /** Render prop for composing the formatted value into other markup. */
  children?: (value: string) => ReactNode;
}

/**
 * One date-time, rendered as `<time dateTime title>`: the visible value in
 * the locale's compact or full form (UTC), the exact instant for machines,
 * and on hover the full date with seconds and zone, the reader's own time
 * and the age. The same text on the server and after hydration, never
 * wrapping.
 */
export function DateTime({
  timestamp,
  variant = 'compact',
  seconds = false,
  year,
  locale,
  timeZone = 'utc',
  showZone = false,
  className,
  children,
  ...rest
}: DateTimeProps) {
  const activeLocale = useLocale();
  const resolvedLocale = locale ?? activeLocale;
  const hydrated = useHydrated();
  const nowMs = useNow(60_000);
  const zone: DateTimeZone = timeZone === 'local' && !hydrated ? 'utc' : timeZone;
  const iso = toIsoDateTime(timestamp);

  if (!iso) {
    return (
      <span className={className} {...rest}>
        {children ? children(UNAVAILABLE_VALUE) : UNAVAILABLE_VALUE}
      </span>
    );
  }

  const now = nowMs > 0 ? nowMs : undefined;
  const options = {
    locale: resolvedLocale,
    style: variant === 'full' ? ('full' as const) : ('compact' as const),
    seconds,
    year,
    timeZone: zone,
    now,
  };
  const absolute = formatDateTime(timestamp, { ...options, showZone });
  const relative = variant === 'relative' && now;
  const value = relative
    ? formatRelativeTime(timestamp, { locale: resolvedLocale, now })
    : absolute;
  // On hover: the full date in its zone, then (once hydrated, where it
  // differs) the reader's own time, then the age.
  const readerTime =
    hydrated && zone !== 'local' && typeof timestamp === 'number' && localDiffersFromUtc(timestamp)
      ? formatDateTimeTitle(timestamp, { locale: resolvedLocale, timeZone: 'local' })
      : null;
  const title = [
    formatDateTimeTitle(timestamp, { locale: resolvedLocale, timeZone: zone }),
    readerTime,
    now ? formatRelativeTime(timestamp, { locale: resolvedLocale, now }) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  // The zone reads like a unit: subtle, and in proportional figures, so
  // "UTC-5" does not take a tabular figure's spacing inside a readout.
  const zoned =
    showZone && !relative && !children ? formatZonedDateTimeParts(timestamp, options) : null;

  return (
    <time dateTime={iso} title={title} className={cn('whitespace-nowrap', className)} {...rest}>
      {children ? (
        children(value)
      ) : zoned ? (
        <>
          {zoned.lead}
          <span data-slot="zone" className="text-subtle [font-variant-numeric:normal]">
            {zoned.zone}
          </span>
          {zoned.trail}
        </>
      ) : (
        value
      )}
    </time>
  );
}

/**
 * "Time zone: UTC", once per table or chart that shows date-times, so no
 * single cell has to carry the zone.
 */
export function TimeZoneNote({ className }: { className?: string }) {
  const t = useTranslations('formats');
  const zone = useTimeZoneLabel();
  return <span className={className}>{t('dateTime.timeZone', { zone })}</span>;
}
