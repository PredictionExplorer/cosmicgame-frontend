import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { getRelativeTime } from '@/utils/time';

import { UNAVAILABLE_VALUE } from './numbers';

/**
 * Dates and times, one standard for the whole app (docs/i18n/README.md §4):
 *
 * - `compact` (tables, cards): "Sep 22, 23:04", plus the year when it is not
 *   the current one ("Sep 22, 2025, 23:04"), so a row stays unambiguous
 *   after 1 January.
 * - `full` (detail pages): always the year and seconds, "Sep 22, 2026, 23:04:45".
 * - title (hover): `full` plus the zone, "Sep 22, 2026, 23:04:45 UTC+3".
 *
 * Each locale keeps its documented template (style-guide-*.md §5). Rendered
 * through `<DateTime>` (components/ui/date-time.tsx), which prints every
 * record in UTC on the server and in the browser alike inside
 * `<time dateTime title>`, with the reader's own time on hover.
 *
 * Import from `@/utils/format` (the public entry), not from this module.
 */

/** `local` is the runtime's zone; `utc`; or an IANA zone such as `Asia/Tokyo`. */
export type DateTimeZone = 'local' | 'utc' | (string & {});

/** The two zones the hydration-safe path switches between. */
export type TimestampTimeZone = 'local' | 'utc';

const MONTH_LABELS = [
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
];

interface CalendarParts {
  readonly year: number;
  readonly monthIndex: number;
  readonly day: number;
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

const pad2 = (value: number): string => String(value).padStart(2, '0');

const zonedFormatters = new Map<string, Intl.DateTimeFormat>();

function zonedFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = zonedFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });
    zonedFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** Calendar fields of an instant in a zone. */
function calendarParts(date: Date, timeZone: DateTimeZone): CalendarParts {
  if (timeZone === 'local' || timeZone === 'utc') {
    const utc = timeZone === 'utc';
    return {
      year: utc ? date.getUTCFullYear() : date.getFullYear(),
      monthIndex: utc ? date.getUTCMonth() : date.getMonth(),
      day: utc ? date.getUTCDate() : date.getDate(),
      hours: pad2(utc ? date.getUTCHours() : date.getHours()),
      minutes: pad2(utc ? date.getUTCMinutes() : date.getMinutes()),
      seconds: pad2(utc ? date.getUTCSeconds() : date.getSeconds()),
    };
  }
  const fields = Object.fromEntries(
    zonedFormatter(timeZone)
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(fields.year),
    monthIndex: Number(fields.month) - 1,
    day: Number(fields.day),
    hours: pad2(Number(fields.hour)),
    minutes: pad2(Number(fields.minute)),
    seconds: pad2(Number(fields.second)),
  };
}

/**
 * One `Intl.DateTimeFormat` per locale and option set, built once:
 * construction is the expensive part, and a ledger formats two dates per
 * cell on every poll (the value and its hover title), as numbers.ts caches
 * its number formatters.
 */
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function dateFormatter(
  intlLocale: string,
  kind: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${intlLocale}|${kind}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(intlLocale, { ...options, timeZone: 'UTC' });
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

/** Each locale's twelve abbreviated months, computed once. */
const shortMonthLabels = new Map<string, readonly string[]>();

/**
 * Locale-abbreviated month through Intl, so a locale never needs a
 * hand-kept month array. `en` keeps its historical array.
 */
const shortMonthLabel = (locale: string, monthIndex: number): string => {
  const intlLocale = getLocaleConfig(locale).intlLocale;
  let labels = shortMonthLabels.get(intlLocale);
  if (!labels) {
    const formatter = dateFormatter(intlLocale, 'month-short', { month: 'short' });
    labels = Array.from({ length: 12 }, (_, month) =>
      formatter.format(new Date(Date.UTC(2000, month, 1))),
    );
    shortMonthLabels.set(intlLocale, labels);
  }
  return labels[monthIndex] ?? '';
};

/** `DD.MM.YYYY`, the numeric short date of Ukrainian (and most of Europe). */
const numericDate = (locale: string, year: number, monthIndex: number, day: number): string =>
  dateFormatter(getLocaleConfig(locale).intlLocale, 'numeric-2-digit', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, monthIndex, day)));

/**
 * `2026. 1. 5.`, the Korean numeric date (KS X ISO 8601 as Intl renders it
 * for ko-KR: year first, unpadded, a dot and a space after each part).
 */
const koreanNumericDate = (year: number, monthIndex: number, day: number): string =>
  dateFormatter(getLocaleConfig('ko').intlLocale, 'numeric', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, monthIndex, day)));

interface DateTimeTemplateInput extends CalendarParts {
  readonly withYear: boolean;
  readonly withSeconds: boolean;
  /** Pad a one-digit day ("Jan 05") so a column of compact dates lines up. */
  readonly padDay: boolean;
}

const clock = ({ hours, minutes, seconds, withSeconds }: DateTimeTemplateInput): string =>
  `${hours}:${minutes}${withSeconds ? `:${seconds}` : ''}`;

/**
 * Han-character template. The calendar characters 年/月/日 and the 24-hour
 * clock are identical in Simplified and Traditional script, in every Chinese
 * region, and in Japanese (style-guide-ja §5: 2026年9月2日, 9月2日 22:44).
 */
const hanDateTime = (input: DateTimeTemplateInput): string =>
  `${input.withYear ? `${input.year}年` : ''}${input.monthIndex + 1}月${input.day}日 ${clock(input)}`;

const DATE_TIME_TEMPLATES: LocaleRecord<(input: DateTimeTemplateInput) => string> = {
  // Compact "Jan 05, 12:34" / "Jan 05, 2025, 12:34": the padded day keeps a
  // column of dates aligned. Full "Jan 5, 2025, 12:34:56": a record page, a
  // hover title or a sentence, where a padded day just reads wrong.
  en: (input) =>
    `${MONTH_LABELS[input.monthIndex]} ${input.padDay ? pad2(input.day) : input.day}${
      input.withYear ? `, ${input.year}` : ''
    }, ${clock(input)}`,
  zh: hanDateTime,
  'zh-TW': hanDateTime,
  'zh-HK': hanDateTime,
  // "5 січ., 12:34" / "5 січ. 2025 р., 12:34": Intl's own day-first order.
  uk: (input) =>
    `${input.day} ${shortMonthLabel('uk', input.monthIndex)}${
      input.withYear ? ` ${input.year} р.` : ''
    }, ${clock(input)}`,
  // "1월 5일 12:34" / "2025년 1월 5일 12:34": Sino-Korean counters attach to the digits.
  ko: (input) =>
    `${input.withYear ? `${input.year}년 ` : ''}${input.monthIndex + 1}월 ${input.day}일 ${clock(
      input,
    )}`,
  ja: hanDateTime,
  // "05/01, 12:34" / "05/01/2025, 12:34": Vietnamese writes numeric
  // DD/MM/YYYY dates (style-guide-vi §5), padded like the chart labels, so a
  // column of dates lines up; CLDR's standalone "Tháng 1" reads wrong mid-string.
  vi: (input) =>
    `${pad2(input.day)}/${pad2(input.monthIndex + 1)}${
      input.withYear ? `/${input.year}` : ''
    }, ${clock(input)}`,
};

/**
 * Appends the zone to a date-time in the locale's style: a space and the
 * label in Latin-spaced locales, full-width parentheses in Han-script ones
 * (the same shape as the data stamps: 2026年8月28日 08:13（UTC）).
 */
const hanZone = (dateTime: string, zone: string): string => `${dateTime}（${zone}）`;
const spacedZone = (dateTime: string, zone: string): string => `${dateTime} ${zone}`;
const ZONE_TEMPLATES: LocaleRecord<(dateTime: string, zone: string) => string> = {
  en: spacedZone,
  zh: hanZone,
  'zh-TW': hanZone,
  'zh-HK': hanZone,
  uk: spacedZone,
  ko: spacedZone,
  ja: hanZone,
  vi: spacedZone,
};

export interface DateTimeOptions {
  readonly locale?: string;
  /** `compact` (default) for tables and cards; `full` for detail pages. */
  readonly style?: 'compact' | 'full';
  /** Seconds in `compact` style (always shown in `full`). */
  readonly seconds?: boolean;
  /** `auto` (default) shows the year only when it differs from `now`'s; `full` always shows it. */
  readonly year?: 'auto' | 'always' | 'never';
  /** Default `local`; `<DateTime>` passes `utc`, the zone of every record. */
  readonly timeZone?: DateTimeZone;
  /** Reference instant (epoch ms) for `year: 'auto'`. Default `Date.now()`. */
  readonly now?: number;
  /**
   * Print the zone after the date-time in the locale's style ("Sep 22,
   * 23:04 UTC-5", "9月22日 23:04（UTC-5）"), for a date that stands alone: a
   * record page, a header figure. A table states its zone once instead
   * (`<TimeZoneNote>`).
   */
  readonly showZone?: boolean;
}

/** The instant of a Unix timestamp in seconds, or `null` when it is not a real date. */
function toDate(timestamp: number | null | undefined): Date | null {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) return null;
  const date = new Date(timestamp * 1000);
  return Number.isFinite(date.getTime()) ? date : null;
}

/**
 * A Unix timestamp (seconds) as a locale date-time. See the module comment
 * for the tiers; an invalid timestamp renders `UNAVAILABLE_VALUE`.
 *
 *     formatDateTime(ts)                                  // "Sep 22, 23:04"
 *     formatDateTime(ts, { style: 'full', locale: 'ja' }) // "2026年9月22日 23:04:45"
 */
export function formatDateTime(
  timestamp: number | null | undefined,
  {
    locale = 'en',
    style = 'compact',
    seconds = false,
    year = style === 'full' ? 'always' : 'auto',
    timeZone = 'local',
    now,
    showZone = false,
  }: DateTimeOptions = {},
): string {
  const date = toDate(timestamp);
  if (!date) return UNAVAILABLE_VALUE;
  if (showZone) {
    const zoned = formatZonedDateTimeParts(timestamp, {
      locale,
      style,
      seconds,
      year,
      timeZone,
      now,
    });
    return zoned ? `${zoned.lead}${zoned.zone}${zoned.trail}` : UNAVAILABLE_VALUE;
  }
  const parts = calendarParts(date, timeZone);
  const withYear =
    year === 'always' ||
    (year === 'auto' && parts.year !== calendarParts(new Date(now ?? Date.now()), timeZone).year);
  return pickByLocale(
    DATE_TIME_TEMPLATES,
    locale,
  )({
    ...parts,
    withYear,
    withSeconds: style === 'full' || seconds,
    padDay: style === 'compact',
  });
}

/**
 * The zone a date-time is shown in, as a UTC offset: "UTC", "UTC+3",
 * "UTC+5:30", "UTC-8". Offsets read the same in every language, unlike zone
 * abbreviations (PDT, 日本標準時). Captions state it once per table or chart.
 */
export function formatTimeZoneLabel(
  timeZone: DateTimeZone = 'local',
  at: Date = new Date(),
): string {
  if (timeZone === 'utc') return 'UTC';
  const parts = calendarParts(at, timeZone);
  const zonedAsUtc = Date.UTC(
    parts.year,
    parts.monthIndex,
    parts.day,
    Number(parts.hours),
    Number(parts.minutes),
    Number(parts.seconds),
  );
  const offsetMinutes = Math.round((zonedAsUtc - Math.floor(at.getTime() / 1000) * 1000) / 60_000);
  if (offsetMinutes === 0) return 'UTC';
  const sign = offsetMinutes > 0 ? '+' : '-';
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return `UTC${sign}${hours}${minutes ? `:${pad2(minutes)}` : ''}`;
}

/** A date-time with its zone, split so the zone can be set apart from the value. */
export interface ZonedDateTimeParts {
  /** Everything before the zone: "Sep 22, 23:04 ", "9月22日 23:04（". */
  readonly lead: string;
  /** The zone label: "UTC-5". */
  readonly zone: string;
  /** Anything after it: "", "）". */
  readonly trail: string;
}

/**
 * `formatDateTime(…, { showZone: true })` in three parts, so `<DateTime
 * showZone>` can set the zone in the subtle tier like a unit. `null` when the
 * timestamp is not a real date.
 */
export function formatZonedDateTimeParts(
  timestamp: number | null | undefined,
  options: Omit<DateTimeOptions, 'showZone'> = {},
): ZonedDateTimeParts | null {
  const date = toDate(timestamp);
  if (!date) return null;
  const { locale = 'en', timeZone = 'local' } = options;
  const plain = formatDateTime(timestamp, { ...options, showZone: false });
  const marker = '\u0000';
  const [lead = '', trail = ''] = pickByLocale(ZONE_TEMPLATES, locale)(plain, marker).split(marker);
  return { lead, zone: formatTimeZoneLabel(timeZone, date), trail };
}

export interface DateTimeTitleOptions {
  readonly locale?: string;
  readonly timeZone?: DateTimeZone;
  /** Reference instant (epoch ms) for the relative suffix; omit to leave it out. */
  readonly now?: number;
}

/**
 * The hover text for a date-time: the full date with seconds and the zone,
 * then the age when `now` is known ("Sep 22, 2026, 23:04:45 UTC+3 · 3 hours ago").
 */
export function formatDateTimeTitle(
  timestamp: number | null | undefined,
  { locale = 'en', timeZone = 'local', now }: DateTimeTitleOptions = {},
): string {
  const date = toDate(timestamp);
  if (!date) return UNAVAILABLE_VALUE;
  const full = formatDateTime(timestamp, { locale, style: 'full', timeZone });
  const zoned = pickByLocale(ZONE_TEMPLATES, locale)(full, formatTimeZoneLabel(timeZone, date));
  if (now == null || now <= 0) return zoned;
  return `${zoned} · ${formatRelativeTime(timestamp, { locale, now })}`;
}

/**
 * ISO 8601 instant for `<time dateTime>` ("2026-09-22T23:04:45.000Z"), or
 * `undefined` when the timestamp is not a real date.
 */
export function toIsoDateTime(timestamp: number | null | undefined): string | undefined {
  return toDate(timestamp)?.toISOString();
}

/**
 * Age of a Unix timestamp in the locale's style ("3 hours ago", "3 小时前",
 * "3時間前", "just now"). For live surfaces (header chips, chat); `now` is
 * epoch ms, usually from `useNow()` so it stays hydration-safe.
 */
export function formatRelativeTime(
  timestamp: number | null | undefined,
  { locale = 'en', now }: { readonly locale?: string; readonly now: number },
): string {
  if (typeof timestamp !== 'number' || !toDate(timestamp)) return UNAVAILABLE_VALUE;
  return getRelativeTime(timestamp, Math.floor(now / 1000), locale);
}

const hanCalendarDate = (year: number, monthIndex: number, day: number): string =>
  `${year}/${monthIndex + 1}/${day}`;

const CALENDAR_DATE_LABEL_FORMATS: LocaleRecord<
  (year: number, monthIndex: number, day: number) => string
> = {
  en: (year, monthIndex, day) => `${MONTH_LABELS[monthIndex] ?? ''} ${day}, ${year}`,
  zh: hanCalendarDate,
  'zh-TW': hanCalendarDate,
  'zh-HK': hanCalendarDate,
  uk: (year, monthIndex, day) => numericDate('uk', year, monthIndex, day),
  ko: koreanNumericDate,
  // "2026/1/5": the slash-separated numeric date Intl renders for ja-JP.
  ja: hanCalendarDate,
  // "05/01/2026": the DD/MM/YYYY numeric date Intl renders for vi-VN.
  vi: (year, monthIndex, day) => numericDate('vi', year, monthIndex, day),
};

/** Formats YYYYMMDD for chart axis / tooltip labels. */
export function formatYyyymmddLabel(yyyymmdd: string, locale: string = 'en'): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  const year = Number(yyyymmdd.slice(0, 4));
  const monthIndex = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return pickByLocale(CALENDAR_DATE_LABEL_FORMATS, locale)(year, monthIndex, day);
}

const hanUtcDateTime = (
  year: number,
  monthIndex: number,
  day: number,
  hh: string,
  mm: string,
): string => `${year}年${monthIndex + 1}月${day}日 ${hh}:${mm}（UTC）`;

const UTC_DATETIME_LABEL_FORMATS: LocaleRecord<
  (year: number, monthIndex: number, day: number, hh: string, mm: string) => string
> = {
  en: (year, monthIndex, day, hh, mm) =>
    `${MONTH_LABELS[monthIndex] ?? ''} ${day}, ${year} ${hh}:${mm} UTC`,
  zh: hanUtcDateTime,
  'zh-TW': hanUtcDateTime,
  'zh-HK': hanUtcDateTime,
  uk: (year, monthIndex, day, hh, mm) =>
    `${numericDate('uk', year, monthIndex, day)} ${hh}:${mm} UTC`,
  ko: (year, monthIndex, day, hh, mm) =>
    `${koreanNumericDate(year, monthIndex, day)} ${hh}:${mm} UTC`,
  // Japanese writes 年月日 dates and full-width parentheses like Chinese.
  ja: hanUtcDateTime,
  vi: (year, monthIndex, day, hh, mm) =>
    `${numericDate('vi', year, monthIndex, day)} ${hh}:${mm} UTC`,
};

/** Formats a Unix timestamp (seconds) for chart axis / tooltip labels, in UTC. */
export function formatUnixTsLabel(ts: number, withTime = false, locale: string = 'en'): string {
  const d = new Date(ts * 1000);
  const day = d.getUTCDate();
  const monthIndex = d.getUTCMonth();
  const year = d.getUTCFullYear();
  if (!withTime) {
    return pickByLocale(CALENDAR_DATE_LABEL_FORMATS, locale)(year, monthIndex, day);
  }
  return pickByLocale(UTC_DATETIME_LABEL_FORMATS, locale)(
    year,
    monthIndex,
    day,
    pad2(d.getUTCHours()),
    pad2(d.getUTCMinutes()),
  );
}
