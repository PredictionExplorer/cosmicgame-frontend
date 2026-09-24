import {
  formatSeconds,
  calculateTimeDiff,
  supplyHistoryBootstrapRange,
  formatYyyymmddLabel,
  formatUnixTsLabel,
  formatUtcDateTimeStamp,
  formatHoursTick,
  formatDurationTick,
  convertTimestampToDateTime,
  convertTimestampToServerDateTime,
  formatGroupedNumber,
} from '../format';

describe('chart tick formatters', () => {
  it('formats hours into compact minute, hour, and day ticks', () => {
    expect(formatHoursTick(0.75)).toBe('45m');
    expect(formatHoursTick(1)).toBe('1h');
    expect(formatHoursTick(1.5)).toBe('1.5h');
    expect(formatHoursTick(24)).toBe('1d');
    expect(formatHoursTick(36)).toBe('1.5d');
  });

  it('formats seconds into compact minute, hour, and day ticks', () => {
    expect(formatDurationTick(0)).toBe('0');
    expect(formatDurationTick(-5)).toBe('0');
    expect(formatDurationTick(2700)).toBe('45m');
    expect(formatDurationTick(3600)).toBe('1h');
    expect(formatDurationTick(5400)).toBe('1.5h');
    expect(formatDurationTick(86400)).toBe('1d');
    expect(formatDurationTick(129600)).toBe('1.5d');
  });

  it('uses the shared durationCompact catalog units in Chinese', () => {
    expect(formatHoursTick(0.75, 'zh')).toBe('45分');
    expect(formatHoursTick(1.5, 'zh')).toBe('1.5小时');
    expect(formatHoursTick(48, 'zh-CN')).toBe('2天');
    expect(formatDurationTick(2700, 'zh')).toBe('45分');
    expect(formatDurationTick(5400, 'zh')).toBe('1.5小时');
    expect(formatDurationTick(172800, 'zh-CN')).toBe('2天');
  });

  it('uses the shared durationCompact catalog units in Ukrainian', () => {
    expect(formatHoursTick(0.75, 'uk')).toBe('45хв');
    expect(formatHoursTick(1.5, 'uk')).toBe('1.5год');
    expect(formatHoursTick(48, 'uk-UA')).toBe('2д');
    expect(formatDurationTick(2700, 'uk')).toBe('45хв');
    expect(formatDurationTick(172800, 'uk-UA')).toBe('2д');
  });
});

describe('formatUtcDateTimeStamp', () => {
  const stamp = new Date('2026-08-28T08:13:45Z');

  it('keeps the ISO-style English stamp used by SEO summaries', () => {
    expect(formatUtcDateTimeStamp(stamp)).toBe('2026-08-28 08:13 UTC');
    expect(formatUtcDateTimeStamp(stamp, 'en-US')).toBe('2026-08-28 08:13 UTC');
  });

  it('renders the Chinese long form with fullwidth parentheses', () => {
    expect(formatUtcDateTimeStamp(stamp, 'zh')).toBe('2026年8月28日 08:13（UTC）');
    expect(formatUtcDateTimeStamp(new Date('2026-01-05T00:07:00Z'), 'zh-Hans')).toBe(
      '2026年1月5日 00:07（UTC）',
    );
  });

  it('renders the Ukrainian numeric day-first date', () => {
    expect(formatUtcDateTimeStamp(stamp, 'uk')).toBe('28.08.2026 08:13 UTC');
    expect(formatUtcDateTimeStamp(new Date('2026-01-05T00:07:00Z'), 'uk-UA')).toBe(
      '05.01.2026 00:07 UTC',
    );
  });
});

describe('formatSeconds edge cases', () => {
  it('returns "1m" for exactly 60 seconds, without a trailing space', () => {
    expect(formatSeconds(60)).toBe('1m');
  });

  it('returns "1h" for exactly 3600 seconds', () => {
    expect(formatSeconds(3600)).toBe('1h');
  });

  it('returns full breakdown for days+hours+minutes+seconds', () => {
    expect(formatSeconds(90061)).toBe('1d\u00a01h\u00a01m\u00a01s');
    expect(formatSeconds(90061, 'zh')).toBe('1天1小时1分1秒');
    // Ukrainian separates words, so tokens keep a (no-break) space.
    expect(formatSeconds(90061, 'uk')).toBe('1д\u00a01год\u00a01хв\u00a01с');
  });

  it('truncates fractional seconds', () => {
    expect(formatSeconds(1.9)).toBe('1s');
  });

  it('returns "0s" for very small positive value', () => {
    expect(formatSeconds(0.1)).toBe('0s');
  });
});

describe('calculateTimeDiff', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns formatted duration for a past timestamp', () => {
    const timestamp = 1_700_000_000 - 3661;
    const result = calculateTimeDiff(timestamp);
    expect(result).toBe('1h\u00a01m\u00a01s');
  });

  it('returns empty string when timestamp is in the future', () => {
    const futureTimestamp = 1_700_000_000 + 1000;
    expect(calculateTimeDiff(futureTimestamp)).toBe('');
  });

  it('returns "0s" when timestamp is exactly now', () => {
    expect(calculateTimeDiff(1_700_000_000)).toBe('0s');
  });

  it('returns days for large differences', () => {
    const oneDayAgo = 1_700_000_000 - 86400;
    expect(calculateTimeDiff(oneDayAgo)).toBe('1d');
  });

  it('returns multi-day difference with hours', () => {
    const threeDaysAgo = 1_700_000_000 - 3 * 86400 - 7200;
    expect(calculateTimeDiff(threeDaysAgo)).toBe('3d\u00a02h');
    expect(calculateTimeDiff(threeDaysAgo, 'zh')).toBe('3天2小时');
  });
});

describe('YYYYMMDD date helpers', () => {
  // Timestamps below are in 2026; pin the clock there so the compact form
  // keeps omitting the (current) year in every future year the suite runs.
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 5, 15));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('formats YYYYMMDD label', () => {
    expect(formatYyyymmddLabel('20260506')).toBe('May 6, 2026');
    expect(formatYyyymmddLabel('20260506', 'zh')).toBe('2026/5/6');
    expect(formatYyyymmddLabel('20260506', 'uk')).toBe('06.05.2026');
  });

  it('formats Unix chart labels in every locale without changing UTC semantics', () => {
    const timestamp = Date.UTC(2026, 0, 1, 12, 34) / 1000;
    expect(formatUnixTsLabel(timestamp, true)).toBe('Jan 1, 2026 12:34 UTC');
    expect(formatUnixTsLabel(timestamp, true, 'zh')).toBe('2026年1月1日 12:34（UTC）');
    expect(formatUnixTsLabel(timestamp, true, 'uk')).toBe('01.01.2026 12:34 UTC');
    expect(formatUnixTsLabel(timestamp, false, 'uk')).toBe('01.01.2026');
  });

  it('preserves historical browser-local output in every locale', () => {
    const timestamp = new Date(2026, 0, 1, 12, 34, 56).getTime() / 1000;
    expect(convertTimestampToDateTime(timestamp, true)).toBe('Jan 01, 12:34:56');
    expect(convertTimestampToDateTime(timestamp, true, 'zh')).toBe('1月1日 12:34:56');
    expect(convertTimestampToDateTime(timestamp, true, 'uk')).toBe('1 січ., 12:34:56');
  });

  it('uses an explicit deterministic UTC value for server snapshots', () => {
    const timestamp = Date.UTC(2026, 0, 1, 12, 34, 56) / 1000;
    expect(convertTimestampToDateTime(timestamp, true, 'en', 'utc')).toBe('Jan 01, 12:34:56');
    expect(convertTimestampToServerDateTime(timestamp, true, 'zh')).toBe('1月1日 12:34:56');
    expect(convertTimestampToServerDateTime(timestamp, true, 'uk')).toBe('1 січ., 12:34:56');
  });

  it('abbreviates every Ukrainian month through Intl rather than a hand-kept array', () => {
    const labels = Array.from({ length: 12 }, (_, month) =>
      convertTimestampToDateTime(Date.UTC(2026, month, 15, 9, 0) / 1000, false, 'uk', 'utc'),
    );
    expect(labels[0]).toBe('15 січ., 09:00');
    expect(labels[4]).toBe('15 трав., 09:00');
    expect(labels[11]).toBe('15 груд., 09:00');
    expect(new Set(labels).size).toBe(12);
  });

  it('groups per locale: Western commas for en/zh, spaces for uk', () => {
    expect(formatGroupedNumber(1_000_000)).toBe('1,000,000');
    expect(formatGroupedNumber(1_000_000, 'zh')).toBe('1,000,000');
    expect(formatGroupedNumber(1_000_000, 'uk').replace(/[\u00a0\u202f]/g, ' ')).toBe('1 000 000');
  });

  it('returns bootstrap range from epoch to today', () => {
    const range = supplyHistoryBootstrapRange();
    expect(range.from).toBe('19700101');
    expect(range.to).toMatch(/^\d{8}$/);
  });
});
