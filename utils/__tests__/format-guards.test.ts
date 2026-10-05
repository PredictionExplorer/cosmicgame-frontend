import { weiToEthNumber } from '../format';

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
