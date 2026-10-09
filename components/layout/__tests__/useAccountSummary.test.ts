import { weiToEther } from '../useAccountSummary';

describe('weiToEther', () => {
  it('reads a wei amount from the API in ether', () => {
    expect(weiToEther('1500000000000000000')).toBe(1.5);
    expect(weiToEther(0)).toBe(0);
  });

  it('returns null, never 0, for a missing or malformed amount', () => {
    expect(weiToEther(undefined)).toBeNull();
    expect(weiToEther(null)).toBeNull();
    expect(weiToEther('')).toBeNull();
    expect(weiToEther('not a number')).toBeNull();
    expect(weiToEther('1.5')).toBeNull();
  });
});
