import {
  UNAVAILABLE_VALUE,
  formatCSTValue,
  formatEthValue,
  formatFixed,
  parseBalance,
  weiToEthNumber,
} from '../format';

describe('parseBalance is total', () => {
  it('keeps the historical output for valid input', () => {
    expect(parseBalance('1000000000000000000', 18, 2)).toBe('1.00');
    expect(parseBalance(BigInt('1234567890123456789'), 18, 4)).toBe('1.2346');
    expect(parseBalance('0', 18, 4)).toBe('0.0000');
    expect(parseBalance(0, 18, 4)).toBe('0.0000');
  });

  it('returns the sentinel for non-numeric strings instead of throwing SyntaxError', () => {
    expect(parseBalance('error')).toBe(UNAVAILABLE_VALUE);
    expect(parseBalance('12.5')).toBe(UNAVAILABLE_VALUE);
    expect(parseBalance('1,000')).toBe(UNAVAILABLE_VALUE);
    expect(parseBalance('0x')).toBe(UNAVAILABLE_VALUE);
  });

  it('follows BigInt() for the empty string, which JS reads as zero', () => {
    // Documented so the sentinel path is not mistaken for covering an empty
    // API field: `BigInt('')` is 0n, not an error.
    expect(parseBalance('')).toBe('0.0000');
  });

  it('returns the sentinel for fractional/non-finite numbers instead of throwing RangeError', () => {
    expect(parseBalance(1.5)).toBe(UNAVAILABLE_VALUE);
    expect(parseBalance(Number.NaN)).toBe(UNAVAILABLE_VALUE);
    expect(parseBalance(Number.POSITIVE_INFINITY)).toBe(UNAVAILABLE_VALUE);
  });

  it('returns the sentinel for out-of-range display precision', () => {
    expect(parseBalance('1000000000000000000', 18, 101)).toBe(UNAVAILABLE_VALUE);
    expect(parseBalance('1000000000000000000', 18, -1)).toBe(UNAVAILABLE_VALUE);
  });

  it('never throws for any of the inputs the API can realistically produce', () => {
    const hostile: unknown[] = [
      undefined,
      null,
      {},
      [],
      'NaN',
      '1e18',
      '-',
      '  ',
      Number.MIN_SAFE_INTEGER - 0.5,
    ];
    for (const value of hostile) {
      expect(() => parseBalance(value as string)).not.toThrow();
    }
  });

  it('handles a negative wei balance without losing the sign', () => {
    expect(parseBalance('-1000000000000000000', 18, 2)).toBe('-1.00');
  });
});

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

describe('formatEthValue / formatCSTValue treat negatives as real values', () => {
  it('renders a negative ETH amount instead of "0 ETH"', () => {
    expect(formatEthValue(-0.5)).toBe('-0.5000 ETH');
    expect(formatEthValue(-42.5)).toBe('-42.5000 ETH');
  });

  it('renders a negative CST amount instead of "0 CST"', () => {
    expect(formatCSTValue(-0.5)).toBe('-0.5000 CST');
    expect(formatCSTValue(-42.5)).toBe('-42.5000 CST');
  });

  it('still collapses zero and non-finite values to the zero label', () => {
    expect(formatEthValue(0)).toBe('0 ETH');
    expect(formatEthValue(-0)).toBe('0 ETH');
    expect(formatEthValue(Number.NaN)).toBe('0 ETH');
    expect(formatEthValue(Number.POSITIVE_INFINITY)).toBe('0 ETH');
    expect(formatEthValue(undefined)).toBe('0 ETH');
    expect(formatEthValue(null)).toBe('0 ETH');

    expect(formatCSTValue(0)).toBe('0 CST');
    expect(formatCSTValue(Number.NaN)).toBe('0 CST');
    expect(formatCSTValue(undefined)).toBe('0 CST');
    expect(formatCSTValue(null)).toBe('0 CST');
  });

  it('keeps the historical positive output', () => {
    expect(formatEthValue(1.23456)).toBe('1.2346 ETH');
    expect(formatEthValue(10)).toBe('10.00 ETH');
    expect(formatCSTValue(5.6789)).toBe('5.6789 CST');
    expect(formatCSTValue(42.12345)).toBe('42.12 CST');
  });

  it('keeps the signed (not absolute) threshold, so every negative gets 4 decimals', () => {
    expect(formatEthValue(-20)).toBe('-20.0000 ETH');
    expect(formatCSTValue(-20)).toBe('-20.0000 CST');
  });
});
