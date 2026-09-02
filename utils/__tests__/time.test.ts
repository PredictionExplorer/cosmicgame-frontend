import { getStableClientTargetTime } from '@/utils/time';

describe('getStableClientTargetTime', () => {
  it('anchors the client target to the server-time query update moment', () => {
    const result = getStableClientTargetTime({
      targetServerTimeSec: 1_300,
      currentServerTimeSec: 1_000,
      currentServerTimeUpdatedAtMs: 50_000,
    });

    expect(result).toBe(350_000);
  });

  it('does not drift when local time advances between refetches', () => {
    const first = getStableClientTargetTime({
      targetServerTimeSec: 1_300,
      currentServerTimeSec: 1_000,
      currentServerTimeUpdatedAtMs: 50_000,
      fallbackNowMs: 60_000,
    });
    const later = getStableClientTargetTime({
      targetServerTimeSec: 1_300,
      currentServerTimeSec: 1_000,
      currentServerTimeUpdatedAtMs: 50_000,
      fallbackNowMs: 80_000,
    });

    expect(later).toBe(first);
  });

  it('uses fallbackNowMs when the query update time is unavailable', () => {
    expect(
      getStableClientTargetTime({
        targetServerTimeSec: 1_030,
        currentServerTimeSec: 1_000,
        currentServerTimeUpdatedAtMs: 0,
        fallbackNowMs: 10_000,
      }),
    ).toBe(40_000);
  });

  it('keeps the previous target for tiny server-clock corrections', () => {
    expect(
      getStableClientTargetTime({
        targetServerTimeSec: 1_300,
        currentServerTimeSec: 1_000,
        currentServerTimeUpdatedAtMs: 50_900,
        previousTargetMs: 350_000,
        correctionToleranceMs: 1500,
      }),
    ).toBe(350_000);
  });

  it('accepts meaningful target changes instead of clamping real extensions', () => {
    expect(
      getStableClientTargetTime({
        targetServerTimeSec: 1_305,
        currentServerTimeSec: 1_000,
        currentServerTimeUpdatedAtMs: 50_000,
        previousTargetMs: 350_000,
        correctionToleranceMs: 1500,
      }),
    ).toBe(355_000);
  });

  it('returns 0 when server timestamps are incomplete', () => {
    expect(
      getStableClientTargetTime({
        targetServerTimeSec: undefined,
        currentServerTimeSec: 1_000,
        currentServerTimeUpdatedAtMs: 10_000,
      }),
    ).toBe(0);
    expect(
      getStableClientTargetTime({
        targetServerTimeSec: 1_000,
        currentServerTimeSec: undefined,
        currentServerTimeUpdatedAtMs: 10_000,
      }),
    ).toBe(0);
  });
});
import { formatIsoDateLabel, getRelativeTime } from '../time';

const NOW = 1_700_000_000;

describe('formatIsoDateLabel', () => {
  it('keeps the raw ISO date in English', () => {
    expect(formatIsoDateLabel('2026-08-24')).toBe('2026-08-24');
    expect(formatIsoDateLabel('2026-08-24', 'en-US')).toBe('2026-08-24');
  });

  it('renders the Chinese long date without shifting the day across time zones', () => {
    expect(formatIsoDateLabel('2026-08-24', 'zh')).toBe('2026年8月24日');
    expect(formatIsoDateLabel('2026-01-01', 'zh-CN')).toBe('2026年1月1日');
  });

  it('renders the Ukrainian long date with the genitive month and year marker', () => {
    expect(formatIsoDateLabel('2026-08-24', 'uk')).toBe('24 серпня 2026 р.');
    expect(formatIsoDateLabel('2026-01-01', 'uk-UA')).toBe('1 січня 2026 р.');
  });
});

describe('getRelativeTime', () => {
  it('returns "just now" for timestamps less than a minute ago', () => {
    expect(getRelativeTime(NOW - 30, NOW)).toBe('just now');
  });

  it('returns "just now" for zero difference', () => {
    expect(getRelativeTime(NOW, NOW)).toBe('just now');
  });

  it('returns "just now" for future timestamps', () => {
    expect(getRelativeTime(NOW + 100, NOW)).toBe('just now');
  });

  it('returns "1 minute ago" for 60s diff', () => {
    expect(getRelativeTime(NOW - 60, NOW)).toBe('1 minute ago');
  });

  it('returns plural minutes', () => {
    expect(getRelativeTime(NOW - 300, NOW)).toBe('5 minutes ago');
  });

  it('returns "1 hour ago" for 3600s diff', () => {
    expect(getRelativeTime(NOW - 3600, NOW)).toBe('1 hour ago');
  });

  it('returns plural hours', () => {
    expect(getRelativeTime(NOW - 7200, NOW)).toBe('2 hours ago');
  });

  it('returns "1 day ago" for 86400s diff', () => {
    expect(getRelativeTime(NOW - 86400, NOW)).toBe('1 day ago');
  });

  it('returns plural days', () => {
    expect(getRelativeTime(NOW - 86400 * 15, NOW)).toBe('15 days ago');
  });

  it('returns "1 month ago" for ~30 day diff', () => {
    expect(getRelativeTime(NOW - 2592000, NOW)).toBe('1 month ago');
  });

  it('returns plural months', () => {
    expect(getRelativeTime(NOW - 2592000 * 6, NOW)).toBe('6 months ago');
  });

  it('returns "1 year ago" for ~365 day diff', () => {
    expect(getRelativeTime(NOW - 31536000, NOW)).toBe('1 year ago');
  });

  it('returns plural years', () => {
    expect(getRelativeTime(NOW - 31536000 * 3, NOW)).toBe('3 years ago');
  });

  it('renders natural Chinese relative units without plural inflection', () => {
    expect(getRelativeTime(NOW - 30, NOW, 'zh')).toBe('刚刚');
    expect(getRelativeTime(NOW - 7200, NOW, 'zh')).toBe('2 小时前');
    expect(getRelativeTime(NOW - 86400 * 3, NOW, 'zh')).toBe('3 天前');
  });

  it('inflects Ukrainian relative units across all four plural categories', () => {
    expect(getRelativeTime(NOW - 30, NOW, 'uk')).toBe('щойно');
    expect(getRelativeTime(NOW - 60, NOW, 'uk')).toBe('1 хвилину тому'); // one
    expect(getRelativeTime(NOW - 7200, NOW, 'uk')).toBe('2 години тому'); // few
    expect(getRelativeTime(NOW - 86400 * 5, NOW, 'uk')).toBe('5 днів тому'); // many
    expect(getRelativeTime(NOW - 3600 * 21, NOW, 'uk-UA')).toBe('21 годину тому'); // one (21)
    expect(getRelativeTime(NOW - 86400 * 60, NOW, 'uk')).toBe('2 місяці тому');
    expect(getRelativeTime(NOW - 86400 * 400, NOW, 'uk')).toBe('1 рік тому');
  });

  it('uses Date.now when nowSeconds is not provided', () => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW * 1000);
    expect(getRelativeTime(NOW - 120)).toBe('2 minutes ago');
    jest.restoreAllMocks();
  });
});
