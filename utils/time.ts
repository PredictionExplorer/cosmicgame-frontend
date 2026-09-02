import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

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

/**
 * `en` keeps the historical forms ("2 months ago", "1 year ago", "just now");
 * `zh` follows docs/i18n/style-guide-zh.md §4 with CJK–Latin spacing
 * ("2 个月前", "刚刚"). Chinese has no plural inflection, so both counts
 * share one form.
 */
const RELATIVE_TIME_LABELS: LocaleRecord<RelativeTimeLabels> = {
  en: {
    justNow: 'just now',
    ago: (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`,
  },
  zh: {
    justNow: '刚刚',
    ago: (count, unit) => `${count} ${ZH_RELATIVE_UNITS[unit]}前`,
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
const ISO_DATE_LABEL_FORMATS: LocaleRecord<(isoDate: string) => string> = {
  en: (isoDate) => isoDate,
  zh: (isoDate) =>
    new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${isoDate}T00:00:00Z`)),
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
