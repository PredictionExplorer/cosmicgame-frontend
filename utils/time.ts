const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 2592000; // 30 days
const YEAR = 31536000; // 365 days

/**
 * Converts a Unix timestamp (seconds) to a human-readable relative time string.
 * `en` returns e.g. "2 months ago", "1 year ago", "just now" (unchanged);
 * `zh` returns "2 个月前", "1 年前", "刚刚" (CJK–Latin spacing per
 * docs/i18n/style-guide-zh.md §4). Chinese has no plural inflection, so both
 * counts share one form. Site-wide locale formatting lands in Sprint 5.
 */
export function getRelativeTime(timestamp: number, nowSeconds?: number, locale = 'en'): string {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const diff = now - timestamp;
  const zh = locale === 'zh';

  if (diff < MINUTE) return zh ? '刚刚' : 'just now';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    if (zh) return `${mins} 分钟前`;
    return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    if (zh) return `${hrs} 小时前`;
    return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  }
  if (diff < MONTH) {
    const days = Math.floor(diff / DAY);
    if (zh) return `${days} 天前`;
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    if (zh) return `${months} 个月前`;
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diff / YEAR);
  if (zh) return `${years} 年前`;
  return years === 1 ? '1 year ago' : `${years} years ago`;
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
