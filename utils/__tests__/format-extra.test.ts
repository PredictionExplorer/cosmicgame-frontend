import {
  formatSeconds,
  calculateTimeDiff,
  formatEthValue,
  formatCSTValue,
  formatTableAmount,
  toYyyymmdd,
  fromYyyymmdd,
  supplyHistoryBootstrapRange,
  supplyHistoryDateBounds,
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

describe('formatTableAmount', () => {
  it('keeps the column digits for zero, so decimals line up', () => {
    expect(formatTableAmount(0, 'en')).toBe('0.0000');
  });

  it('renders dust below display precision as a bounded value', () => {
    expect(formatTableAmount(0.00000001, 'en')).toBe('<0.0001');
    expect(formatTableAmount(-0.00000001, 'en')).toBe('>-0.0001');
  });

  it('pads ETH to 4 fixed decimals so a column lines up', () => {
    expect(formatTableAmount(0.1, 'en')).toBe('0.1000');
    expect(formatTableAmount(1.5, 'en')).toBe('1.5000');
    expect(formatTableAmount(0.135830123, 'en')).toBe('0.1358');
    expect(formatTableAmount(3.100415642, 'en')).toBe('3.1004');
  });

  it('uses 2 fixed decimals for CST columns', () => {
    expect(formatTableAmount(60872.256, 'en', 'CST')).toBe('60,872.26');
  });

  it('adds thousands separators for large values', () => {
    expect(formatTableAmount(12096.254179, 'en')).toBe('12,096.2542');
    expect(formatTableAmount(12096.254179, 'zh')).toBe('12,096.2542');
  });

  it('groups Ukrainian with a no-break space and keeps the token-amount dot', () => {
    // docs/i18n/style-guide-uk.md §4: amounts keep the dot in every context.
    expect(formatTableAmount(12096.254179, 'uk')).toBe('12\u00a0096.2542');
  });

  it('uses the Vietnamese dot grouping and comma decimal', () => {
    expect(formatTableAmount(12096.254179, 'vi')).toBe('12.096,2542');
  });

  it('renders non-finite input as an em dash', () => {
    expect(formatTableAmount(undefined, 'en')).toBe('—');
    expect(formatTableAmount(null, 'en')).toBe('—');
    expect(formatTableAmount(Number.NaN, 'en')).toBe('—');
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

describe('formatEthValue', () => {
  it('returns "0 ETH" for zero', () => {
    expect(formatEthValue(0, 'en')).toBe('0\u00a0ETH');
  });

  it('returns 4 decimals for values less than 10', () => {
    expect(formatEthValue(1.23456, 'en')).toBe('1.2346\u00a0ETH');
  });

  it('keeps 4 decimals for values 10 or greater, so one figure never reads two ways', () => {
    expect(formatEthValue(10, 'en')).toBe('10.0000\u00a0ETH');
    expect(formatEthValue(32.29391, 'en')).toBe('32.2939\u00a0ETH');
    expect(formatEthValue(99.99999, 'en')).toBe('100.0000\u00a0ETH');
  });

  it('returns "0 ETH" for NaN-ish falsy value', () => {
    expect(formatEthValue(NaN, 'en')).toBe('0\u00a0ETH');
  });
});

describe('formatCSTValue', () => {
  it('returns "0 CST" for zero', () => {
    expect(formatCSTValue(0, 'en')).toBe('0\u00a0CST');
  });

  it('returns up to 2 decimals at any size', () => {
    expect(formatCSTValue(5.6789, 'en')).toBe('5.68\u00a0CST');
    expect(formatCSTValue(42.12345, 'en')).toBe('42.12\u00a0CST');
  });

  it('groups thousands and keeps whole amounts whole', () => {
    expect(formatCSTValue(60872.26, 'en')).toBe('60,872.26\u00a0CST');
    expect(formatCSTValue(1000, 'en')).toBe('1,000\u00a0CST');
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

  it('converts ISO date to YYYYMMDD', () => {
    expect(toYyyymmdd('2026-05-06')).toBe('20260506');
  });

  it('converts YYYYMMDD to ISO date', () => {
    expect(fromYyyymmdd('20260506')).toBe('2026-05-06');
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

  it('returns min and max dates from supply history records', () => {
    const bounds = supplyHistoryDateBounds([
      { Date: '20260315' },
      { Date: '20260101' },
      { Date: '20260210' },
    ]);
    expect(bounds).toEqual({ from: '20260101', to: '20260315' });
  });

  it('returns null bounds for empty records', () => {
    expect(supplyHistoryDateBounds([])).toBeNull();
  });
});
