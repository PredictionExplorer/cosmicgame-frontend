const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const MONTH = 2592000; // 30 days
const YEAR = 31536000; // 365 days

/**
 * Converts a Unix timestamp (seconds) to a human-readable relative time string.
 * Returns e.g. "2 months ago", "1 year ago", "just now".
 */
export function getRelativeTime(timestamp: number, nowSeconds?: number): string {
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 0) return 'just now';
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
  }
  if (diff < DAY) {
    const hrs = Math.floor(diff / HOUR);
    return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  }
  if (diff < MONTH) {
    const days = Math.floor(diff / DAY);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  const years = Math.floor(diff / YEAR);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

interface StableClientTargetTimeArgs {
  targetServerTimeSec: number | null | undefined;
  currentServerTimeSec: number | null | undefined;
  currentServerTimeUpdatedAtMs?: number;
  fallbackNowMs?: number;
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
}: StableClientTargetTimeArgs): number {
  if (targetServerTimeSec == null || currentServerTimeSec == null) return 0;

  const anchorMs = currentServerTimeUpdatedAtMs > 0 ? currentServerTimeUpdatedAtMs : fallbackNowMs;
  return anchorMs + (targetServerTimeSec - currentServerTimeSec) * 1000;
}
