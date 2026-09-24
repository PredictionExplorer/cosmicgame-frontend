import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';

import { NBSP, UNAVAILABLE_VALUE, formatNumber } from './numbers';

/**
 * Durations and countdowns. Every token of one duration is joined by a
 * no-break space (or nothing, in languages without word spaces), so
 * "6d 22:23:44" never breaks across lines. Render through `<Duration>`
 * (components/ui/duration.tsx) for tabular figures and `<time dateTime>`.
 *
 * Import from `@/utils/format` (the public entry), not from this module.
 */

interface DurationUnitLabels {
  readonly days: string;
  readonly hours: string;
  readonly minutes: string;
  readonly seconds: string;
}

/**
 * Compact duration units (style-guide-*.md §5), kept here rather than read
 * from the eight `formats.json` catalogs so every bundle that formats a
 * number does not ship every locale's catalog. The catalogs keep the same
 * units under `formats.durationCompact` for `useTranslations('formats')`
 * consumers; `utils/__tests__/format-duration-units.test.ts` fails when the
 * two drift, so change both together.
 */
const DURATION_UNITS: LocaleRecord<DurationUnitLabels> = {
  en: { days: 'd', hours: 'h', minutes: 'm', seconds: 's' },
  zh: { days: '天', hours: '小时', minutes: '分', seconds: '秒' },
  'zh-TW': { days: '天', hours: '小時', minutes: '分', seconds: '秒' },
  'zh-HK': { days: '天', hours: '小時', minutes: '分', seconds: '秒' },
  uk: { days: 'д', hours: 'год', minutes: 'хв', seconds: 'с' },
  ko: { days: '일', hours: '시간', minutes: '분', seconds: '초' },
  ja: { days: '日', hours: '時間', minutes: '分', seconds: '秒' },
  vi: { days: 'ng', hours: 'g', minutes: 'ph', seconds: 's' },
};

/** Joins the tokens of one duration: a no-break space, or nothing without word spaces. */
const tokenJoiner = (locale: string): string => (getLocaleConfig(locale).wordSpacing ? NBSP : '');

interface DurationFields {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

/** Whole days, hours, minutes and seconds of a non-negative number of seconds. */
function durationFields(totalSeconds: number): DurationFields {
  const whole = Math.floor(totalSeconds);
  return {
    days: Math.floor(whole / 86_400),
    hours: Math.floor((whole % 86_400) / 3_600),
    minutes: Math.floor((whole % 3_600) / 60),
    seconds: whole % 60,
  };
}

export interface DurationOptions {
  readonly locale?: string;
  /**
   * `compact` (default): "1d 2h 30m 45s" (zh "1天2小时30分45秒"), with inner
   * zero units kept so the reading stays positional ("1d 0h 0m 5s").
   * `clock`: a countdown, "6d 22:23:44" / "22:23:44" (ja "6日22:23:44").
   */
  readonly style?: 'compact' | 'clock';
  /**
   * `compact` only: keep at most this many leading units ("1d 2h" for 2),
   * truncating the rest, for tight readouts.
   */
  readonly maxUnits?: number;
}

/**
 * A number of seconds as a duration. Fractions are truncated (a countdown
 * never shows time it has not got); negative values render as zero, and
 * non-finite values as `UNAVAILABLE_VALUE`.
 */
export function formatDuration(
  totalSeconds: number | null | undefined,
  { locale = 'en', style = 'compact', maxUnits }: DurationOptions = {},
): string {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds)) return UNAVAILABLE_VALUE;
  const fields = durationFields(Math.max(0, totalSeconds));
  const units = pickByLocale(DURATION_UNITS, locale);
  const join = tokenJoiner(locale);

  if (style === 'clock') {
    const time = [fields.hours, fields.minutes, fields.seconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
    return fields.days > 0 ? `${fields.days}${units.days}${join}${time}` : time;
  }

  const ordered = [
    [fields.days, units.days],
    [fields.hours, units.hours],
    [fields.minutes, units.minutes],
    [fields.seconds, units.seconds],
  ] as const;
  const first = ordered.findIndex(([value]) => value > 0);
  if (first === -1) return `0${units.seconds}`;
  // Keep the units from the largest nonzero one to the smallest nonzero one,
  // inner zeros included; drop trailing zero units.
  let last = ordered.length - 1;
  while (last > first && ordered[last]![0] === 0) last -= 1;
  const end = maxUnits && maxUnits > 0 ? Math.min(last, first + maxUnits - 1) : last;
  return ordered
    .slice(first, end + 1)
    .map(([value, unit]) => `${value}${unit}`)
    .join(join);
}

/**
 * ISO 8601 duration for `<time dateTime>` ("P6DT22H23M44S", "PT0S"), or
 * `undefined` for a non-finite input.
 */
export function toIsoDuration(totalSeconds: number | null | undefined): string | undefined {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds)) return undefined;
  const { days, hours, minutes, seconds } = durationFields(Math.max(0, totalSeconds));
  const time = `${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${
    seconds ? `${seconds}S` : ''
  }`;
  if (!days && !time) return 'PT0S';
  return `P${days ? `${days}D` : ''}${time ? `T${time}` : ''}`;
}

/**
 * Converts seconds into a compact duration: `en` "1d 2h 30m 45s", `zh`
 * "1天2小时30分45秒" (style-guide-zh §5), `uk` "1д 2год 30хв 45с"
 * (style-guide-uk §5). Delegates to `formatDuration`; kept for existing
 * callers, which rely on a negative input rendering a blank (" ").
 */
export const formatSeconds = (seconds: number, locale: string = 'en'): string =>
  seconds < 0 ? ' ' : formatDuration(seconds, { locale });

/**
 * Time elapsed since a Unix timestamp as a compact duration ("1d 2h 30m
 * 45s"), or an empty string for a timestamp in the future.
 */
export const calculateTimeDiff = (timestamp: number, locale: string = 'en'): string => {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  return seconds < 0 ? '' : formatDuration(seconds, { locale });
};

/** One decimal at most, in the locale's number style ("1.5", vi "1,5"). */
const tickNumber = (value: number, locale: string): string =>
  formatNumber(value, locale, { maximumFractionDigits: 1 });

/** Compact "hours into cycle" label for chart axes, e.g. "45m", "1.5h", "2d". */
export function formatHoursTick(hours: number, locale: string = 'en'): string {
  const units = pickByLocale(DURATION_UNITS, locale);
  if (hours >= 24) return `${tickNumber(hours / 24, locale)}${units.days}`;
  if (hours >= 1) return `${tickNumber(hours, locale)}${units.hours}`;
  return `${Math.round(hours * 60)}${units.minutes}`;
}

/** Compact duration for chart axis ticks, e.g. "45m", "1.5h", "2d". */
export function formatDurationTick(secs: number, locale: string = 'en'): string {
  if (secs <= 0) return '0';
  const units = pickByLocale(DURATION_UNITS, locale);
  if (secs >= 86_400) return `${tickNumber(secs / 86_400, locale)}${units.days}`;
  if (secs >= 3_600) return `${tickNumber(secs / 3_600, locale)}${units.hours}`;
  return `${Math.round(secs / 60)}${units.minutes}`;
}
