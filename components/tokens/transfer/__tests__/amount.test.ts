import { routing } from '@/i18n/routing';
import { formatCount, formatNumber } from '@/utils/format';

import { amountMarks, parseTokenAmount, toPlainDecimal } from '../amount';

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

  it('accepts digits grouped in threes with spaces, including no-break ones', () => {
    expect(parseTokenAmount('1 000').wei).toBe(1000n * WEI);
    expect(parseTokenAmount('1 000 000').wei).toBe(1_000_000n * WEI);
    expect(parseTokenAmount('  12  ').wei).toBe(12n * WEI);
    // A space that does not group thousands is a typo, not a number to guess.
    expect(parseTokenAmount('12 34').error).toBe('format');
    expect(parseTokenAmount('1 0.5').error).toBe('format');
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

  // The transfers cannot be undone: an English operator typing "1,000" once sent 1 CST.
  it("refuses the locale's thousands mark instead of reading it as a decimal point", () => {
    for (const locale of ['en', 'zh', 'zh-TW', 'zh-HK', 'ko', 'ja']) {
      expect(parseTokenAmount('1,000', { locale }).error).toBe('grouping');
      expect(parseTokenAmount('1,000.5', { locale }).error).toBe('grouping');
      expect(parseTokenAmount('12,500,000', { locale }).error).toBe('grouping');
      // Not a thousands group either, and never guessed as a decimal comma.
      expect(parseTokenAmount('2,5', { locale }).error).toBe('format');
    }
  });

  // Regression: vi prints one thousand as "1.000" and the shared parser read it as 1.
  it('reads Vietnamese amounts the way the app prints them', () => {
    const vi = { locale: 'vi' };
    expect(formatCount(1000, 'vi')).toBe('1.000');
    expect(parseTokenAmount('1.000', vi)).toEqual({ wei: null, error: 'grouping' });
    expect(parseTokenAmount('1.500', vi).error).toBe('grouping');
    expect(parseTokenAmount('1.000,5', vi).error).toBe('grouping');
    expect(parseTokenAmount('1,5', vi).wei).toBe((3n * WEI) / 2n);
    expect(parseTokenAmount('0,125', vi).wei).toBe(125_000_000_000_000_000n);
    expect(parseTokenAmount('1000', vi).wei).toBe(1000n * WEI);
    // A dot is vi's thousands mark: never a decimal point, even before one digit.
    expect(parseTokenAmount('0.5', vi).error).toBe('format');
  });

  it('reads both marks as the decimal point in Ukrainian, which groups with spaces', () => {
    const uk = { locale: 'uk' };
    expect(parseTokenAmount('1,5', uk).wei).toBe((3n * WEI) / 2n);
    expect(parseTokenAmount('1.5', uk).wei).toBe((3n * WEI) / 2n);
    expect(parseTokenAmount('1 000,25', uk).wei).toBe(1_000_250_000_000_000_000_000n);
    expect(parseTokenAmount('1.000,5', uk).error).toBe('format');
  });

  it('reads back every amount the app prints, in every locale', () => {
    for (const locale of routing.locales) {
      const printed = formatNumber(1234.5, locale, { useGrouping: false });
      expect(parseTokenAmount(printed, { locale }).wei).toBe(1_234_500_000_000_000_000_000n);
      const { group } = amountMarks(locale);
      if (group === ' ') {
        expect(parseTokenAmount(formatCount(1000, locale), { locale }).wei).toBe(1000n * WEI);
      } else {
        expect(parseTokenAmount(formatCount(1000, locale), { locale }).error).toBe('grouping');
      }
    }
  });
});

describe('amountMarks', () => {
  it('takes the thousands mark from the locale and never reads it as a decimal', () => {
    expect(amountMarks('en')).toEqual({ group: ',', decimals: ['.'] });
    expect(amountMarks('vi')).toEqual({ group: '.', decimals: [','] });
    expect(amountMarks('uk')).toEqual({ group: ' ', decimals: ['.', ','] });
    for (const locale of routing.locales) {
      const { group, decimals } = amountMarks(locale);
      expect(decimals).not.toContain(group);
      expect(decimals.length).toBeGreaterThan(0);
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

  it("uses the locale's decimal mark, so a Max fill reads back in every locale", () => {
    expect(toPlainDecimal(1_234_567n * 10n ** 15n, 18, 'vi')).toBe('1234,567');
    const wei = 987_654_321_012_345_678n;
    for (const locale of routing.locales) {
      expect(parseTokenAmount(toPlainDecimal(wei, 18, locale), { locale }).wei).toBe(wei);
    }
  });
});
