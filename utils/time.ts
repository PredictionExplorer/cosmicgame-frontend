import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 2592000; // 30 days
const YEAR = 31536000; // 365 days

type RelativeTimeUnit = 'minute' | 'hour' | 'day' | 'month' | 'year';

interface RelativeTimeLabels {
  readonly justNow: string;
  readonly ago: (count: number, unit: RelativeTimeUnit) => string;
}

const ZH_RELATIVE_UNITS: Record<RelativeTimeUnit, string> = {
  minute: '分钟',
  hour: '小时',
  day: '天',
  month: '个月',
  year: '年',
};

/** Traditional-script units, shared by Taiwan and Hong Kong. */
const ZH_HANT_RELATIVE_UNITS: Record<RelativeTimeUnit, string> = {
  minute: '分鐘',
  hour: '小時',
  day: '天',
  month: '個月',
  year: '年',
};

/** Japanese units; か月 (not 個月/ヶ月) is the style guide's spelling for months. */
const JA_RELATIVE_UNITS: Record<RelativeTimeUnit, string> = {
  minute: '分',
  hour: '時間',
  day: '日',
  month: 'か月',
  year: '年',
};

/**
 * Chinese has no plural inflection, so every count shares one form; the
 * style guides ask for a space between the numeral and the CJK unit
 * ("2 个月前" / "2 個月前") and "刚刚" / "剛剛" for the just-now case.
 */
const chineseRelativeTime = (units: Record<RelativeTimeUnit, string>, justNow: string) => ({
  justNow,
  ago: (count: number, unit: RelativeTimeUnit) => `${count} ${units[unit]}前`,
});

/**
 * `en` keeps the historical forms ("2 months ago", "1 year ago", "just now");
 * the Chinese locales follow their style guides' §4 with CJK–Latin spacing.
 * `uk` delegates to `Intl.RelativeTimeFormat`, which owns the four-way plural
 * agreement ("1 хвилину", "2 хвилини", "5 хвилин тому"); so does `ko`, whose
 * counters attach to the digit ("2시간 전", "3개월 전"). `ja` does not: CLDR
 * renders "2 時間前" with a space, while the Japanese style guide (§4) runs
 * digits and counters together ("2時間前", "3か月前", "たった今").
 */
const intlRelativeTime = (locale: string) => ({
  ago: (count: number, unit: RelativeTimeUnit) =>
    new Intl.RelativeTimeFormat(getLocaleConfig(locale).intlLocale, { numeric: 'always' }).format(
      -count,
      unit,
    ),
});
const RELATIVE_TIME_LABELS: LocaleRecord<RelativeTimeLabels> = {
  en: {
    justNow: 'just now',
    ago: (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`,
  },
  zh: chineseRelativeTime(ZH_RELATIVE_UNITS, '刚刚'),
  'zh-TW': chineseRelativeTime(ZH_HANT_RELATIVE_UNITS, '剛剛'),
  'zh-HK': chineseRelativeTime(ZH_HANT_RELATIVE_UNITS, '剛剛'),
  uk: { justNow: 'щойно', ...intlRelativeTime('uk') },
  ko: { justNow: '방금', ...intlRelativeTime('ko') },
  ja: {
    justNow: 'たった今',
    ago: (count, unit) => `${count}${JA_RELATIVE_UNITS[unit]}前`,
  },
};

/** Converts a Unix timestamp (seconds) to a human-readable relative time string. */
export function getRelativeTime(timestamp: number, nowSeconds?: number, locale = 'en'): string {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  const labels = pickByLocale(RELATIVE_TIME_LABELS, locale);

  if (diff < MINUTE) return labels.justNow;
  if (diff < HOUR) return labels.ago(Math.floor(diff / MINUTE), 'minute');
  if (diff < DAY) return labels.ago(Math.floor(diff / HOUR), 'hour');
  if (diff < MONTH) return labels.ago(Math.floor(diff / DAY), 'day');
  if (diff < YEAR) return labels.ago(Math.floor(diff / MONTH), 'month');
  return labels.ago(Math.floor(diff / YEAR), 'year');
}

/**
 * Formats an ISO `YYYY-MM-DD` date for display. English keeps the raw ISO
 * form (the historical byte-pinned rendering); other locales render their
 * long date form.
 */
const longIsoDateLabel = (locale: string) => (isoDate: string) =>
  new Intl.DateTimeFormat(getLocaleConfig(locale).intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));

const ISO_DATE_LABEL_FORMATS: LocaleRecord<(isoDate: string) => string> = {
  en: (isoDate) => isoDate,
  zh: longIsoDateLabel('zh'),
  'zh-TW': longIsoDateLabel('zh-TW'),
  'zh-HK': longIsoDateLabel('zh-HK'),
  uk: longIsoDateLabel('uk'),
  ko: longIsoDateLabel('ko'),
  ja: longIsoDateLabel('ja'),
};

/** Locale-appropriate display form of an ISO `YYYY-MM-DD` date string. */
export function formatIsoDateLabel(isoDate: string, locale: string = 'en'): string {
  return pickByLocale(ISO_DATE_LABEL_FORMATS, locale)(isoDate);
}

export interface ServerTimingSample {
  targetServerTimeSec: number;
  currentServerTimeSec: number;
  sampledAtMs: number;
  cycleNumber?: number;
}

interface StableClientTargetTimeArgs {
  targetServerTimeSec: number | null | undefined;
  currentServerTimeSec: number | null | undefined;
  currentServerTimeUpdatedAtMs?: number;
  fallbackNowMs?: number;
  previousTargetMs?: number;
  correctionToleranceMs?: number;
}

/**
 * Converts a server-side target timestamp into a stable client epoch-ms target.
 * The result is anchored to the time the server clock sample was fetched, so it
 * does not drift forward as the local client clock ticks between API refetches.
 */
export function getStableClientTargetTime({
  targetServerTimeSec,
  currentServerTimeSec,
  currentServerTimeUpdatedAtMs = 0,
  fallbackNowMs = Date.now(),
  previousTargetMs = 0,
  correctionToleranceMs = 0,
}: StableClientTargetTimeArgs): number {
  if (targetServerTimeSec == null || currentServerTimeSec == null) return 0;

  const anchorMs = currentServerTimeUpdatedAtMs > 0 ? currentServerTimeUpdatedAtMs : fallbackNowMs;
  const targetMs = anchorMs + (targetServerTimeSec - currentServerTimeSec) * 1000;
  if (
    previousTargetMs > 0 &&
    correctionToleranceMs > 0 &&
    Math.abs(targetMs - previousTargetMs) <= correctionToleranceMs
  ) {
    return previousTargetMs;
  }
  return targetMs;
}
