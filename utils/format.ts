import { formatUnits } from 'viem';

import enFormats from '@/messages/en/formats.json';
import ukFormats from '@/messages/uk/formats.json';
import zhFormats from '@/messages/zh/formats.json';
import zhHkFormats from '@/messages/zh-HK/formats.json';
import zhTwFormats from '@/messages/zh-TW/formats.json';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';

type BigNumberish = bigint | string | number;

/**
 * Rendered wherever a numeric value cannot be shown (missing API field, NaN,
 * unparseable wei). Formatters return this instead of throwing or printing
 * `NaN`, so a single bad record never takes down the surrounding render.
 */
export const UNAVAILABLE_VALUE = '—';

/** Maps app locale codes to stable Intl locales. */
export const toIntlLocale = (locale: string = 'en'): string => getLocaleConfig(locale).intlLocale;

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

interface DurationUnitLabels {
  readonly days: string;
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

/**
 * Compact duration units, sourced from the `formats.durationCompact` message
 * catalog so plain formatting utils (chart ticks, `formatSeconds`) render
 * exactly the units that components using `useTranslations('formats')` do.
 */
const DURATION_UNITS: LocaleRecord<DurationUnitLabels> = {
  en: enFormats.durationCompact,
  zh: zhFormats.durationCompact,
  'zh-TW': zhTwFormats.durationCompact,
  'zh-HK': zhHkFormats.durationCompact,
  uk: ukFormats.durationCompact,
};

/**
 * Locale-abbreviated month for a month index, via Intl so a locale never
 * needs a hand-maintained month array. `en` keeps its historical array
 * (byte-pinned output); everything else comes through here.
 */
const shortMonthLabel = (locale: string, monthIndex: number): string =>
  new Intl.DateTimeFormat(toIntlLocale(locale), { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2000, monthIndex, 1)),
  );

/** `DD.MM.YYYY`, the numeric short date convention of Ukrainian (and most of Europe). */
const numericDate = (locale: string, year: number, monthIndex: number, day: number): string =>
  new Intl.DateTimeFormat(toIntlLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, day)));

/** Shortens a hex string (e.g., address) for display. */
export function shortenHex(hex: string, length = 4): string {
  if (hex) {
    return `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}`;
  }
  return '';
}

/**
 * Parses wei/smallest-unit balance to a fixed-decimal string.
 *
 * Total by construction: `BigInt()` throws on fractional numbers and
 * non-numeric strings, and `toFixed` throws on out-of-range precision, so
 * anything unparseable renders `UNAVAILABLE_VALUE` rather than escaping as an
 * uncaught RangeError/SyntaxError mid-render.
 */
export const parseBalance = (value: BigNumberish, decimals = 18, decimalsToDisplay = 4): string => {
  try {
    const parsed = parseFloat(formatUnits(BigInt(value), decimals));
    if (!Number.isFinite(parsed)) return UNAVAILABLE_VALUE;
    return parsed.toFixed(decimalsToDisplay);
  } catch {
    return UNAVAILABLE_VALUE;
  }
};

/**
 * `toFixed` that cannot throw. Finite input is byte-identical to
 * `value.toFixed(digits)`; null/undefined/NaN/Infinity render `fallback`.
 * Use at display sites where the value comes from an API field that the
 * schema types as required but the backend can still omit.
 */
export const formatFixed = (
  value: number | null | undefined,
  digits: number,
  fallback: string = UNAVAILABLE_VALUE,
): string =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : fallback;

/**
 * Converts a wei amount to an ETH `number` without the precision loss of
 * `Number(wei) / 1e18`, which rounds the integer to a double *before*
 * dividing and so goes wrong above 2^53 wei (~0.009 ETH). Formatting the
 * exact decimal string first means only one rounding step, at the end.
 */
export const weiToEthNumber = (value: BigNumberish, fallback = 0): number => {
  try {
    const eth = Number(formatUnits(BigInt(value), 18));
    return Number.isFinite(eth) ? eth : fallback;
  } catch {
    return fallback;
  }
};

/** Pads numeric ID with leading zeros for display (e.g., #000123). */
export const formatId = (id: number | string): string => {
  return `#${id.toString().padStart(6, '0')}`;
};

export type TimestampTimeZone = 'local' | 'utc';

interface TimestampParts {
  monthIndex: number;
  day: number;
  hours: string;
  minutes: string;
}

/**
 * Chinese date templates. The calendar characters 年/月/日 and the 24-hour
 * clock are identical in Simplified and Traditional script and in every
 * Chinese region, so the three Chinese locales share one implementation
 * (unlike catalog copy, which differs by vocabulary and register).
 */
const chineseTimestamp = ({ monthIndex, day, hours, minutes }: TimestampParts): string =>
  `${monthIndex + 1}月${day}日 ${hours}:${minutes}`;

const TIMESTAMP_DATETIME_FORMATS: LocaleRecord<(parts: TimestampParts) => string> = {
  en: ({ monthIndex, day, hours, minutes }) =>
    `${MONTH_LABELS[monthIndex]} ${('0' + day).slice(-2)}, ${hours}:${minutes}`,
  zh: chineseTimestamp,
  'zh-TW': chineseTimestamp,
  'zh-HK': chineseTimestamp,
  uk: ({ monthIndex, day, hours, minutes }) =>
    `${day} ${shortMonthLabel('uk', monthIndex)}, ${hours}:${minutes}`,
};

/**
 * Converts Unix timestamp to a locale-style date string.
 * `en` output is byte-identical to the historical format ("Jan 01, 12:34");
 * `zh` renders "1月1日 12:34" (docs/i18n/README.md §4); `uk` renders
 * "1 січ., 12:34" (the day-first order Intl itself produces for uk-UA).
 *
 * Browser-local time is the historical/default behavior. Pass `utc` only for
 * deterministic server snapshots; hydration-safe UI should use
 * `HydrationSafeDateTime` or `useHydrationSafeDateTime`.
 */
export const convertTimestampToDateTime = (
  timestamp: number,
  showSecond: boolean = false,
  locale: string = 'en',
  timeZone: TimestampTimeZone = 'local',
): string => {
  const date_ob = new Date(timestamp * 1000);
  const monthIndex = timeZone === 'utc' ? date_ob.getUTCMonth() : date_ob.getMonth();
  const day = timeZone === 'utc' ? date_ob.getUTCDate() : date_ob.getDate();
  const hour = timeZone === 'utc' ? date_ob.getUTCHours() : date_ob.getHours();
  const minute = timeZone === 'utc' ? date_ob.getUTCMinutes() : date_ob.getMinutes();
  const second = timeZone === 'utc' ? date_ob.getUTCSeconds() : date_ob.getSeconds();
  const hours = ('0' + hour).slice(-2);
  const minutes = ('0' + minute).slice(-2);
  const seconds = ('0' + second).slice(-2);

  let result = pickByLocale(
    TIMESTAMP_DATETIME_FORMATS,
    locale,
  )({
    monthIndex,
    day,
    hours,
    minutes,
  });

  if (showSecond) {
    result += `:${seconds}`;
  }

  return result;
};

/** Deterministic value used for SSR and the first hydration render. */
export const convertTimestampToServerDateTime = (
  timestamp: number,
  showSecond: boolean = false,
  locale: string = 'en',
): string => convertTimestampToDateTime(timestamp, showSecond, locale, 'utc');

/**
 * Converts seconds into a human-readable duration string.
 * `en`: "1d 2h 30m 45s" (unchanged); `zh`: "1天2小时30分45秒"
 * (docs/i18n/style-guide-zh.md §5 compact duration form); `uk`:
 * "1д 2год 30хв 45с" (docs/i18n/style-guide-uk.md §5).
 */
export const formatSeconds = (seconds: number, locale: string = 'en'): string => {
  if (seconds < 0) return ' ';

  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  const days = Math.floor(hours / 24);
  hours = hours % 24;

  const units = pickByLocale(DURATION_UNITS, locale);
  const sep = getLocaleConfig(locale).wordSpacing ? ' ' : '';

  let str = '';
  if (days) str += `${days}${units.days}${sep}`;
  if (hours || (str && (minutes || seconds))) str += `${hours}${units.hours}${sep}`;
  if (minutes || (str && seconds)) str += `${minutes}${units.minutes}${sep}`;
  if (seconds) str += `${seconds}${units.seconds}`;

  return str || `0${units.seconds}`;
};

/** Compact "hours into cycle" label for chart axes, e.g. "45m", "1.5h", "2d". */
export function formatHoursTick(hours: number, locale: string = 'en'): string {
  const units = pickByLocale(DURATION_UNITS, locale);
  if (hours >= 24) {
    const d = hours / 24;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}${units.days}`;
  }
  if (hours >= 1) {
    return `${Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)}${units.hours}`;
  }
  return `${Math.round(hours * 60)}${units.minutes}`;
}

/** Compact duration for chart axis ticks, e.g. "45m", "1.5h", "2d". */
export function formatDurationTick(secs: number, locale: string = 'en'): string {
  if (secs <= 0) return '0';
  const units = pickByLocale(DURATION_UNITS, locale);
  if (secs >= 86400) {
    const d = secs / 86400;
    return `${Number.isInteger(d) ? d.toFixed(0) : d.toFixed(1)}${units.days}`;
  }
  if (secs >= 3600) {
    const h = secs / 3600;
    return `${Number.isInteger(h) ? h.toFixed(0) : h.toFixed(1)}${units.hours}`;
  }
  return `${Math.round(secs / 60)}${units.minutes}`;
}
/**
 * Calculates the difference between the current time and a given timestamp.
 * Returns the time difference in a human-readable format (e.g., "1d 2h 30m 45s").
 */
export const calculateTimeDiff = (timestamp: number, locale: string = 'en'): string => {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  return seconds < 0 ? '' : formatSeconds(seconds, locale);
};

/**
 * Formats ETH for display: 4 decimals when < 10, else 2.
 * Guards on finiteness rather than truthiness so a legitimate negative (a
 * net-loss ROI figure, say) renders its real value instead of "0 ETH".
 */
export const formatEthValue = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value) || value === 0) return '0 ETH';
  return value < 10 ? `${value.toFixed(4)} ETH` : `${value.toFixed(2)} ETH`;
};

/**
 * Formats a numeric table amount without the misleading `0.000000` wall that
 * fixed-precision output produces: zero renders as "0", dust renders as
 * "<0.0001", and everything else gets up to 6 decimals with trailing zeros
 * trimmed. Unit-free — append " ETH"/" CST" at the call site if needed.
 */
export const formatTableAmount = (
  value: number | null | undefined,
  locale: string = 'en',
): string => {
  if (value == null || !Number.isFinite(value)) return UNAVAILABLE_VALUE;
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude < 0.0001) return value > 0 ? '<0.0001' : '>-0.0001';
  return new Intl.NumberFormat(toIntlLocale(locale), {
    maximumFractionDigits: 6,
  }).format(value);
};

/** Locale-aware grouped number; Chinese data displays keep Western grouping. */
export const formatGroupedNumber = (
  value: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(toIntlLocale(locale), options).format(value);

/**
 * Formats CST for display: 4 decimals when < 10, else 2.
 * Finiteness guard (not truthiness) so negatives survive — see `formatEthValue`.
 */
export const formatCSTValue = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value) || value === 0) return '0 CST';
  return value < 10 ? `${value.toFixed(4)} CST` : `${value.toFixed(2)} CST`;
};

/** Converts HTML date input value (YYYY-MM-DD) to API date param (YYYYMMDD). */
export function toYyyymmdd(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/** Converts API date param (YYYYMMDD) to HTML date input value (YYYY-MM-DD). */
export function fromYyyymmdd(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

const chineseCalendarDate = (year: number, monthIndex: number, day: number): string =>
  `${year}/${monthIndex + 1}/${day}`;

const CALENDAR_DATE_LABEL_FORMATS: LocaleRecord<
  (year: number, monthIndex: number, day: number) => string
> = {
  en: (year, monthIndex, day) => `${MONTH_LABELS[monthIndex] ?? ''} ${day}, ${year}`,
  zh: chineseCalendarDate,
  'zh-TW': chineseCalendarDate,
  'zh-HK': chineseCalendarDate,
  uk: (year, monthIndex, day) => numericDate('uk', year, monthIndex, day),
};

/** Formats YYYYMMDD for chart axis / tooltip labels. */
export function formatYyyymmddLabel(yyyymmdd: string, locale: string = 'en'): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  const year = Number(yyyymmdd.slice(0, 4));
  const monthIndex = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  return pickByLocale(CALENDAR_DATE_LABEL_FORMATS, locale)(year, monthIndex, day);
}

/** Returns UTC YYYYMMDD for today minus `days` calendar days. */
export function yyyymmddDaysAgoUtc(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Returns UTC YYYYMMDD for today. */
export function yyyymmddTodayUtc(): string {
  return yyyymmddDaysAgoUtc(0);
}

const chineseUtcDateTime = (
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
  zh: chineseUtcDateTime,
  'zh-TW': chineseUtcDateTime,
  'zh-HK': chineseUtcDateTime,
  uk: (year, monthIndex, day, hh, mm) =>
    `${numericDate('uk', year, monthIndex, day)} ${hh}:${mm} UTC`,
};

const chineseUtcStamp = (date: Date): string =>
  chineseUtcDateTime(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    String(date.getUTCHours()).padStart(2, '0'),
    String(date.getUTCMinutes()).padStart(2, '0'),
  );

const UTC_STAMP_FORMATS: LocaleRecord<(date: Date) => string> = {
  en: (date) => `${date.toISOString().replace('T', ' ').slice(0, 16)} UTC`,
  zh: chineseUtcStamp,
  'zh-TW': chineseUtcStamp,
  'zh-HK': chineseUtcStamp,
  uk: (date) =>
    `${numericDate('uk', date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())} ${String(
      date.getUTCHours(),
    ).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`,
};

/**
 * "Data updated at" stamp for SEO summaries: `en` keeps the ISO-style
 * "2026-08-28 08:13 UTC"; every Chinese locale renders
 * "2026年8月28日 08:13（UTC）"; `uk` renders "28.08.2026 08:13 UTC".
 */
export function formatUtcDateTimeStamp(date: Date, locale: string = 'en'): string {
  return pickByLocale(UTC_STAMP_FORMATS, locale)(date);
}

/** Formats a Unix timestamp (seconds) for chart axis / tooltip labels. */
export function formatUnixTsLabel(ts: number, withTime = false, locale: string = 'en'): string {
  const d = new Date(ts * 1000);
  const day = d.getUTCDate();
  const monthIndex = d.getUTCMonth();
  const year = d.getUTCFullYear();
  if (!withTime) {
    return pickByLocale(CALENDAR_DATE_LABEL_FORMATS, locale)(year, monthIndex, day);
  }
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return pickByLocale(UTC_DATETIME_LABEL_FORMATS, locale)(year, monthIndex, day, hh, mm);
}

/** Wide date range used to bootstrap CST supply history (all available days). */
export function supplyHistoryBootstrapRange(): { from: string; to: string } {
  return { from: '19700101', to: yyyymmddTodayUtc() };
}

/** Min/max YYYYMMDD dates from supply history API rows. */
export function supplyHistoryDateBounds(
  records: readonly { Date: string }[],
): { from: string; to: string } | null {
  if (records.length === 0) return null;
  const first = records[0];
  if (!first) return null;
  let from = first.Date;
  let to = first.Date;
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    if (!row) continue;
    const date = row.Date;
    if (date < from) from = date;
    if (date > to) to = date;
  }
  return { from, to };
}
