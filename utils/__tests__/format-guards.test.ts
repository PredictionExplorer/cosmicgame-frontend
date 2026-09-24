import { UNAVAILABLE_VALUE, formatFixed, weiToEthNumber } from '../format';

describe('formatFixed', () => {
  it('matches toFixed byte-for-byte for finite input', () => {
    expect(formatFixed(3.1, 2)).toBe('3.10');
    expect(formatFixed(3.1, 2)).toBe((3.1).toFixed(2));
    expect(formatFixed(0, 4)).toBe('0.0000');
    expect(formatFixed(-0.5, 4)).toBe('-0.5000');
    expect(formatFixed(12096.254179, 6)).toBe('12096.254179');
  });

  it('returns the sentinel instead of throwing on missing values', () => {
    expect(formatFixed(undefined, 4)).toBe(UNAVAILABLE_VALUE);
    expect(formatFixed(null, 4)).toBe(UNAVAILABLE_VALUE);
    expect(formatFixed(Number.NaN, 4)).toBe(UNAVAILABLE_VALUE);
    expect(formatFixed(Number.POSITIVE_INFINITY, 4)).toBe(UNAVAILABLE_VALUE);
    expect(formatFixed(Number.NEGATIVE_INFINITY, 4)).toBe(UNAVAILABLE_VALUE);
  });

  it('accepts a caller-supplied fallback', () => {
    expect(formatFixed(undefined, 4, '0.0000')).toBe('0.0000');
  });

  it('does not add grouping separators (unlike formatTableAmount)', () => {
    expect(formatFixed(1234567.5, 2)).toBe('1234567.50');
  });
});

describe('weiToEthNumber', () => {
  it('converts whole ETH amounts exactly', () => {
    expect(weiToEthNumber('1000000000000000000')).toBe(1);
    expect(weiToEthNumber(0n)).toBe(0);
    expect(weiToEthNumber('100000000000000000')).toBeCloseTo(0.1);
  });

  it('keeps precision above 2^53 wei, where Number(wei) / 1e18 drifts', () => {
    // 12345.678901234567890123 ETH — more significant digits than a double
    // holds once the integer is coerced first.
    const wei = '12345678901234567890123';
    const lossy = Number(BigInt(wei)) / 1e18;
    const exact = weiToEthNumber(wei);

    expect(exact).toBe(Number('12345.678901234567890123'));
    expect(Math.abs(exact - 12345.678901234567)).toBeLessThanOrEqual(
      Math.abs(lossy - 12345.678901234567),
    );
  });

  it('rounds once instead of twice for a large odd wei value', () => {
    const wei = 2n ** 70n + 1n;
    expect(weiToEthNumber(wei)).toBe(
      Number(`${wei / 10n ** 18n}.${(wei % 10n ** 18n).toString().padStart(18, '0')}`),
    );
  });

  it('falls back rather than throwing on unparseable input', () => {
    expect(weiToEthNumber('not-wei')).toBe(0);
    expect(weiToEthNumber('1.5')).toBe(0);
    expect(weiToEthNumber('not-wei', -1)).toBe(-1);
  });
});
