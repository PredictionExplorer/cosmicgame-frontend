import { execFileSync } from 'node:child_process';

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
  convertTimestampToDateTime,
  convertTimestampToServerDateTime,
  formatGroupedNumber,
} from '../format';

describe('formatTableAmount', () => {
  it('renders zero as a bare 0', () => {
    expect(formatTableAmount(0)).toBe('0');
  });

  it('renders dust below display precision as a bounded value', () => {
    expect(formatTableAmount(0.00000001)).toBe('<0.0001');
    expect(formatTableAmount(-0.00000001)).toBe('>-0.0001');
  });

  it('trims trailing zeros instead of padding to 6 decimals', () => {
    expect(formatTableAmount(0.1)).toBe('0.1');
    expect(formatTableAmount(1.5)).toBe('1.5');
  });

  it('keeps up to 6 decimals of precision', () => {
    expect(formatTableAmount(0.135830123)).toBe('0.13583');
    expect(formatTableAmount(3.100415642)).toBe('3.100416');
  });

  it('adds thousands separators for large values', () => {
    expect(formatTableAmount(12096.254179)).toBe('12,096.254179');
    expect(formatTableAmount(12096.254179, 'zh')).toBe('12,096.254179');
  });

  it('renders non-finite input as an em dash', () => {
    expect(formatTableAmount(undefined)).toBe('—');
    expect(formatTableAmount(null)).toBe('—');
    expect(formatTableAmount(Number.NaN)).toBe('—');
  });
});

describe('formatSeconds edge cases', () => {
  it('returns "1m " for exactly 60 seconds', () => {
    expect(formatSeconds(60)).toBe('1m ');
  });

  it('returns "1h " for exactly 3600 seconds', () => {
    expect(formatSeconds(3600)).toBe('1h ');
  });

  it('returns full breakdown for days+hours+minutes+seconds', () => {
    expect(formatSeconds(90061)).toBe('1d 1h 1m 1s');
    expect(formatSeconds(90061, 'zh')).toBe('1天1小时1分1秒');
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
    expect(result).toBe('1h 1m 1s');
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
    expect(calculateTimeDiff(oneDayAgo)).toBe('1d ');
  });

  it('returns multi-day difference with hours', () => {
    const threeDaysAgo = 1_700_000_000 - 3 * 86400 - 7200;
    expect(calculateTimeDiff(threeDaysAgo)).toBe('3d 2h ');
    expect(calculateTimeDiff(threeDaysAgo, 'zh')).toBe('3天2小时');
  });
});

describe('formatEthValue', () => {
  it('returns "0 ETH" for zero', () => {
    expect(formatEthValue(0)).toBe('0 ETH');
  });

  it('returns 4 decimals for values less than 10', () => {
    expect(formatEthValue(1.23456)).toBe('1.2346 ETH');
  });

  it('returns 2 decimals for values 10 or greater', () => {
    expect(formatEthValue(10)).toBe('10.00 ETH');
    expect(formatEthValue(99.999)).toBe('100.00 ETH');
  });

  it('returns "0 ETH" for NaN-ish falsy value', () => {
    expect(formatEthValue(NaN)).toBe('0 ETH');
  });
});

describe('formatCSTValue', () => {
  it('returns "0 CST" for zero', () => {
    expect(formatCSTValue(0)).toBe('0 CST');
  });

  it('returns 4 decimals for values less than 10', () => {
    expect(formatCSTValue(5.6789)).toBe('5.6789 CST');
  });

  it('returns 2 decimals for values 10 or greater', () => {
    expect(formatCSTValue(42.12345)).toBe('42.12 CST');
  });
});

describe('YYYYMMDD date helpers', () => {
  it('converts ISO date to YYYYMMDD', () => {
    expect(toYyyymmdd('2026-05-06')).toBe('20260506');
  });

  it('converts YYYYMMDD to ISO date', () => {
    expect(fromYyyymmdd('20260506')).toBe('2026-05-06');
  });

  it('formats YYYYMMDD label', () => {
    expect(formatYyyymmddLabel('20260506')).toBe('May 6, 2026');
    expect(formatYyyymmddLabel('20260506', 'zh')).toBe('2026/5/6');
  });

  it('formats Unix chart labels in English and Chinese without changing UTC semantics', () => {
    const timestamp = Date.UTC(2026, 0, 1, 12, 34) / 1000;
    expect(formatUnixTsLabel(timestamp, true)).toBe('Jan 1, 2026 12:34 UTC');
    expect(formatUnixTsLabel(timestamp, true, 'zh')).toBe('2026年1月1日 12:34（UTC）');
  });

  it('preserves historical browser-local output in English and Chinese', () => {
    const timestamp = new Date(2026, 0, 1, 12, 34, 56).getTime() / 1000;
    expect(convertTimestampToDateTime(timestamp, true)).toBe('Jan 01, 12:34:56');
    expect(convertTimestampToDateTime(timestamp, true, 'zh')).toBe('1月1日 12:34:56');
  });

  it('uses an explicit deterministic UTC value for server snapshots', () => {
    const timestamp = Date.UTC(2026, 0, 1, 12, 34, 56) / 1000;
    expect(convertTimestampToDateTime(timestamp, true, 'en', 'utc')).toBe('Jan 01, 12:34:56');
    expect(convertTimestampToServerDateTime(timestamp, true, 'zh')).toBe('1月1日 12:34:56');
  });

  it('keeps local semantics in a non-UTC timezone across a date boundary', () => {
    const script = `
      import('./utils/format.ts').then((format) => {
        const api = format.default ?? format;
        const timestamp = Date.UTC(2026, 0, 1, 0, 30, 45) / 1000;
        process.stdout.write(JSON.stringify([
          api.convertTimestampToDateTime(timestamp, true),
          api.convertTimestampToDateTime(timestamp, true, 'zh'),
          api.convertTimestampToServerDateTime(timestamp, true),
        ]));
      });
    `;
    const output = execFileSync(process.execPath, ['--import', 'tsx', '--eval', script], {
      cwd: process.cwd(),
      env: { ...process.env, TZ: 'America/Los_Angeles' },
      encoding: 'utf8',
    });

    expect(JSON.parse(output)).toEqual([
      'Dec 31, 16:30:45',
      '12月31日 16:30:45',
      'Jan 01, 00:30:45',
    ]);
  });

  it('uses Western grouping in both locales', () => {
    expect(formatGroupedNumber(1_000_000)).toBe('1,000,000');
    expect(formatGroupedNumber(1_000_000, 'zh')).toBe('1,000,000');
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
