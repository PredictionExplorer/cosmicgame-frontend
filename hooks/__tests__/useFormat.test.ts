import { renderHook } from '@testing-library/react';

import { useFormat } from '@/hooks/useFormat';
import { formatAmount, formatCount, formatDuration, formatPercent } from '@/utils/format';

const nextIntl = jest.requireMock('next-intl') as { useLocale: () => string };

describe('useFormat', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('binds every formatter to the active locale', () => {
    jest.spyOn(nextIntl, 'useLocale').mockReturnValue('vi');
    const { result } = renderHook(() => useFormat());
    const format = result.current;

    expect(format.locale).toBe('vi');
    // Vietnamese: dot grouping, comma decimal, unit after a no-break space.
    expect(format.amount(8.07351, { unit: 'ETH' })).toBe('8,0735 ETH');
    expect(format.amount(1000, { unit: 'CST' })).toBe('1.000 CST');
    expect(format.count(1135)).toBe('1.135');
    expect(format.percent(45.3)).toBe(formatPercent(45.3, 'vi'));
    expect(format.duration(93_784)).toBe(formatDuration(93_784, { locale: 'vi' }));
  });

  it('matches the plain functions called with the same locale', () => {
    jest.spyOn(nextIntl, 'useLocale').mockReturnValue('uk');
    const { result } = renderHook(() => useFormat());

    expect(result.current.amount(263113.6, { unit: 'ETH', context: 'table' })).toBe(
      formatAmount(263113.6, { unit: 'ETH', context: 'table', locale: 'uk' }),
    );
    expect(result.current.count(60764)).toBe(formatCount(60764, 'uk'));
  });

  it('keeps one bound object per locale and rebinds when the locale changes', () => {
    const locale = jest.spyOn(nextIntl, 'useLocale').mockReturnValue('en');
    const { result, rerender } = renderHook(() => useFormat());
    const first = result.current;

    rerender();
    expect(result.current).toBe(first);

    locale.mockReturnValue('ja');
    rerender();
    expect(result.current).not.toBe(first);
    expect(result.current.locale).toBe('ja');
    expect(result.current.count(1135)).toBe('1,135');
  });
});
