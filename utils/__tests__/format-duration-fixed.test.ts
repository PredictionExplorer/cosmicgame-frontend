import { NBSP, formatDuration } from '@/utils/format';

/**
 * The fixed shape for elapsed and held times (V224): one grammar for every
 * "how long" figure, three units from the largest, inner units two digits
 * wide, so a live hold reads the same in the standings and the gesture log.
 */
const fixed = (seconds: number, locale = 'en') =>
  formatDuration(seconds, { locale, style: 'fixed' }).replaceAll(NBSP, ' ');

describe('formatDuration style "fixed"', () => {
  it('keeps three units from the largest, the inner ones two digits wide', () => {
    expect(fixed(6768)).toBe('1h 52m 48s');
    expect(fixed(4 * 3600 + 67)).toBe('4h 01m 07s');
    expect(fixed(9 * 86_400 + 3600 + 36 * 60 + 42)).toBe('9d 01h 36m');
    expect(fixed(44 * 86_400 + 6 * 3600)).toBe('44d 06h 00m');
  });

  it('keeps the trailing zero units a compact duration drops', () => {
    expect(fixed(4 * 3600 + 10 * 60)).toBe('4h 10m 00s');
    expect(formatDuration(4 * 3600 + 10 * 60, { style: 'compact' }).replaceAll(NBSP, ' ')).toBe(
      '4h 10m',
    );
  });

  it('starts at the largest unit below an hour and a minute', () => {
    expect(fixed(52 * 60 + 8)).toBe('52m 08s');
    expect(fixed(7)).toBe('7s');
    expect(fixed(0)).toBe('0s');
  });

  it('joins with no-break spaces, or nothing where a language has no word spaces', () => {
    expect(formatDuration(6768, { locale: 'en', style: 'fixed' })).toBe(`1h${NBSP}52m${NBSP}48s`);
    expect(formatDuration(6768, { locale: 'zh', style: 'fixed' })).toBe('1小时52分48秒');
    expect(formatDuration(4 * 3600 + 67, { locale: 'ja', style: 'fixed' })).toBe('4時間01分07秒');
  });

  it('reads an unknown length as unavailable, like the other styles', () => {
    expect(formatDuration(Number.NaN, { style: 'fixed' })).toBe(
      formatDuration(Number.NaN, { style: 'compact' }),
    );
  });
});
