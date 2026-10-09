import { formatUnits } from 'viem/utils';

import { formatAmountParts, formatExactUnits } from '@/utils/format/numbers';

/**
 * utils/format/numbers.ts converts bigint base units itself, so the landing's
 * client islands never pull viem into the marketing bundle. Its result must
 * stay identical to viem's `formatUnits` for every sign, scale and length.
 */
describe('bigint base units to a decimal string', () => {
  const cases: ReadonlyArray<readonly [bigint, number]> = [
    [0n, 18],
    [1n, 18],
    [5n, 0],
    [-1n, 18],
    [10n ** 18n, 18],
    [10n ** 18n * 1234n + 5n, 18],
    [-(10n ** 18n) * 7n - 120_000_000_000_000_000n, 18],
    [123_456_789n, 6],
    [100_000_000n, 6],
    [999_999_999_999_999_999n, 18],
    [2n ** 255n, 18],
  ];

  it.each(cases)('%s with %s decimals matches viem', (value, decimals) => {
    expect(formatAmountParts(value, { unit: 'ETH', decimals }).machineValue).toBe(
      formatUnits(value, decimals),
    );
  });
});

describe('formatExactUnits', () => {
  it('keeps every digit and groups in the reader’s marks', () => {
    const thousand = 1000n * 10n ** 18n;
    expect(formatExactUnits(thousand, { decimals: 18, locale: 'en' })).toBe('1,000');
    expect(formatExactUnits(thousand, { decimals: 18, locale: 'vi' })).toBe('1.000');
    expect(formatExactUnits(thousand + 5n, { decimals: 18, locale: 'en' })).toBe(
      '1,000.000000000000000005',
    );
    expect(formatExactUnits(1_234_567n, { decimals: 6, locale: 'en' })).toBe('1.234567');
    expect(formatExactUnits(500_000n, { decimals: 6, locale: 'vi' })).toBe('0,5');
  });
});
