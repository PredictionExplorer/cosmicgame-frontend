import { formatSeconds, calculateTimeDiff, formatEthValue, formatCSTValue } from '../format';

describe('formatSeconds edge cases', () => {
  it('returns "1m " for exactly 60 seconds', () => {
    expect(formatSeconds(60)).toBe('1m ');
  });

  it('returns "1h " for exactly 3600 seconds', () => {
    expect(formatSeconds(3600)).toBe('1h ');
  });

  it('returns full breakdown for days+hours+minutes+seconds', () => {
    expect(formatSeconds(90061)).toBe('1d 1h 1m 1s');
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
