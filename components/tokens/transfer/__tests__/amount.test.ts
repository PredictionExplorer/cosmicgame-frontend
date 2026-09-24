import { commaIsDecimal, parseTokenAmount, toPlainDecimal } from '../amount';

const WEI = 1_000_000_000_000_000_000n;

describe('parseTokenAmount', () => {
  it('reads whole and fractional amounts exactly, without float rounding', () => {
    expect(parseTokenAmount('25')).toEqual({ wei: 25n * WEI, error: null });
    expect(parseTokenAmount('0.1')).toEqual({ wei: 100_000_000_000_000_000n, error: null });
    expect(parseTokenAmount('.5')).toEqual({ wei: WEI / 2n, error: null });
    expect(parseTokenAmount('7.')).toEqual({ wei: 7n * WEI, error: null });
    expect(parseTokenAmount('0.000000000000000001')).toEqual({ wei: 1n, error: null });
    expect(parseTokenAmount('123456789.123456789123456789')).toEqual({
      wei: 123_456_789_123_456_789_123_456_789n,
      error: null,
    });
  });

  it('accepts digits grouped with spaces, including no-break ones', () => {
    expect(parseTokenAmount('1 000').wei).toBe(1000n * WEI);
    expect(parseTokenAmount('1 000 000').wei).toBe(1_000_000n * WEI);
    expect(parseTokenAmount('  12  ').wei).toBe(12n * WEI);
  });

  it('names the reason an amount cannot be sent', () => {
    expect(parseTokenAmount('').error).toBe('required');
    expect(parseTokenAmount('   ').error).toBe('required');
    expect(parseTokenAmount('abc').error).toBe('format');
    expect(parseTokenAmount('-1').error).toBe('format');
    expect(parseTokenAmount('1e3').error).toBe('format');
    expect(parseTokenAmount('.').error).toBe('format');
    expect(parseTokenAmount('1.2.3').error).toBe('format');
    expect(parseTokenAmount('0').error).toBe('zero');
    expect(parseTokenAmount('0.000').error).toBe('zero');
    expect(parseTokenAmount('0.0000000000000000001').error).toBe('precision');
    expect(parseTokenAmount('1.5', { decimals: 0 }).error).toBe('precision');
  });

  it('caps the amount at the balance once it is known', () => {
    expect(parseTokenAmount('11', { max: 10n * WEI }).error).toBe('exceedsBalance');
    expect(parseTokenAmount('10', { max: 10n * WEI }).error).toBeNull();
    expect(parseTokenAmount('11', { max: null }).error).toBeNull();
  });

  it('refuses a comma where it could group thousands, rather than guess', () => {
    // "1,000" is one thousand to an English reader and one to a Ukrainian one.
    expect(parseTokenAmount('1,000').error).toBe('format');
    expect(parseTokenAmount('0,5').error).toBe('format');
  });

  it('reads a comma or a dot as the decimal mark where a comma cannot group', () => {
    expect(parseTokenAmount('0,5', { decimalComma: true }).wei).toBe(WEI / 2n);
    expect(parseTokenAmount('0.5', { decimalComma: true }).wei).toBe(WEI / 2n);
    expect(parseTokenAmount('1 000,25', { decimalComma: true }).wei).toBe(
      1_000_250_000_000_000_000_000n,
    );
    expect(parseTokenAmount('1.000,5', { decimalComma: true }).error).toBe('format');
  });
});

describe('commaIsDecimal', () => {
  it('accepts a decimal comma in every locale that groups digits another way', () => {
    // Regression: uk prints a dot decimal, so "1,5" on /uk/transfer-cst was
    // refused, although a Ukrainian groups with spaces and writes 1,5 by hand.
    expect(commaIsDecimal('uk')).toBe(true);
    expect(commaIsDecimal('vi')).toBe(true);
    expect(parseTokenAmount('1,5', { decimalComma: commaIsDecimal('uk') }).wei).toBe(
      (3n * WEI) / 2n,
    );
  });

  it('refuses it where a comma groups thousands', () => {
    for (const locale of ['en', 'zh', 'zh-TW', 'zh-HK', 'ko', 'ja']) {
      expect(commaIsDecimal(locale)).toBe(false);
    }
  });
});

describe('toPlainDecimal', () => {
  it('writes base units back as an ungrouped, unrounded decimal', () => {
    expect(toPlainDecimal(12_345_678_900_000_000_000n)).toBe('12.3456789');
    expect(toPlainDecimal(25n * WEI)).toBe('25');
    expect(toPlainDecimal(1n)).toBe('0.000000000000000001');
    expect(toPlainDecimal(0n)).toBe('0');
    expect(toPlainDecimal(150n, 2)).toBe('1.5');
  });

  it('round-trips through parseTokenAmount', () => {
    const wei = 987_654_321_012_345_678n;
    expect(parseTokenAmount(toPlainDecimal(wei)).wei).toBe(wei);
  });
});
