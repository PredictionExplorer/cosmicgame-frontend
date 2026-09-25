import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';

import type { TimeStep } from './ticks';

/**
 * Axis labels for dates, one short form per locale: the month and day on a
 * daily axis ("Aug 12", 8月12日, 8월 12일, 12 серп., 12/08), the hour on an
 * hourly one ("14:00"), and the month, with its year where the year turns,
 * on a monthly one. Ticks never repeat "2026 … UTC": the figure's summary
 * states the range once, and every chart axis is UTC.
 */

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const utcDate = (ts: number) => new Date(ts * 1000);

/** Intl's own short month-and-day, in UTC: 8月12日, 8월 12일, 12 серп. */
const intlMonthDay = (locale: string) => (date: Date) =>
  new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);

/** A Vietnamese day and month, zero-padded: 12/08, as in 12/08/2026. */
const viDayMonth = (date: Date) =>
  `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

const MONTH_DAY: LocaleRecord<(date: Date) => string> = {
  en: (date) => `${EN_MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`,
  zh: intlMonthDay('zh'),
  'zh-TW': intlMonthDay('zh-TW'),
  'zh-HK': intlMonthDay('zh-HK'),
  uk: intlMonthDay('uk'),
  ko: intlMonthDay('ko'),
  ja: intlMonthDay('ja'),
  // Vietnamese writes numeric DD/MM dates (style-guide-vi §5), zero-padded like the
  // DD/MM/YYYY of a readout's full date beside them.
  vi: (date) => viDayMonth(date),
};

/** The month ("Aug", 8月, трав.), or with its year ("Aug 2026", 2026年8月). */
function monthLabel(date: Date, locale: string, withYear: boolean): string {
  return new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date);
}

/** A calendar date's short label: "Aug 12", 8月12日, 12/08. */
export function formatMonthDay(ts: number, locale: string): string {
  return pickByLocale(MONTH_DAY, locale)(utcDate(ts));
}

/**
 * A moment's short label, its date and UTC hour: "Aug 12 09:00",
 * 8月12日 09:00 (the style guides' timestamp form, a space before the time).
 */
export function formatMonthDayHour(ts: number, locale: string): string {
  const hours = String(utcDate(ts).getUTCHours()).padStart(2, '0');
  return `${formatMonthDay(ts, locale)} ${hours}:00`;
}

/**
 * The label of a date-axis tick at `step`: "14:00" (a midnight reads as its
 * date), "Aug 12", or "Aug" ("Jan 2027" at a year change, and the year on the
 * first tick).
 */
export function formatTimeTick(
  ts: number,
  step: TimeStep,
  locale: string,
  { first = false }: { first?: boolean } = {},
): string {
  const date = utcDate(ts);
  if (step.unit === 'hour') {
    const hours = date.getUTCHours();
    if (hours === 0) return formatMonthDay(ts, locale);
    return `${String(hours).padStart(2, '0')}:00`;
  }
  if (step.unit === 'day') return formatMonthDay(ts, locale);
  return monthLabel(date, locale, first || date.getUTCMonth() === 0);
}

/** Intl's own date range, which writes the year once when both ends share it. */
const intlRange = (locale: string) => (from: Date, to: Date) =>
  new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatRange(from, to);

const DATE_RANGE: LocaleRecord<(from: Date, to: Date) => string> = {
  en: intlRange('en'),
  zh: intlRange('zh'),
  'zh-TW': intlRange('zh-TW'),
  'zh-HK': intlRange('zh-HK'),
  uk: intlRange('uk'),
  ko: intlRange('ko'),
  ja: intlRange('ja'),
  vi: (from, to) =>
    from.getUTCFullYear() === to.getUTCFullYear()
      ? `${viDayMonth(from)} – ${viDayMonth(to)}/${to.getUTCFullYear()}`
      : `${viDayMonth(from)}/${from.getUTCFullYear()} – ${viDayMonth(to)}/${to.getUTCFullYear()}`,
};

/**
 * A date range in the locale's own form, the year written once when both
 * ends share it: "Aug 12 – Sep 24, 2026", 2026年8月12日至9月24日, 12/08 – 24/09/2026.
 */
export function formatDateRange(fromTs: number, toTs: number, locale: string): string {
  return pickByLocale(DATE_RANGE, locale)(utcDate(fromTs), utcDate(Math.max(fromTs, toTs)));
}
