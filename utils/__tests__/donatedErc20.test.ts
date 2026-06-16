import { getDonatedErc20RawClaimAmount, toDonatedErc20ClaimAmountBigInt } from '../donatedErc20';

describe('donatedErc20 claim amount helpers', () => {
  it('prefers DonateClaimDiff over other raw amount fields', () => {
    expect(
      getDonatedErc20RawClaimAmount({
        DonateClaimDiff: '1999999999999999988000',
        Amount: '2000000000000000000000',
        AmountDonated: '2000000000000000000000',
      }),
    ).toBe('1999999999999999988000');
  });

  it('falls back to raw Amount and then AmountDonated', () => {
    expect(getDonatedErc20RawClaimAmount({ Amount: '42' })).toBe('42');
    expect(getDonatedErc20RawClaimAmount({ AmountDonated: '43' })).toBe('43');
  });

  it('does not treat display-denominated decimals as raw amounts', () => {
    expect(getDonatedErc20RawClaimAmount({ DonateClaimDiff: '1.5', Amount: '7' })).toBe('7');
    expect(() => toDonatedErc20ClaimAmountBigInt('1.5')).toThrow('Missing raw ERC-20 claim amount');
  });

  it('converts valid raw amounts to bigint', () => {
    expect(toDonatedErc20ClaimAmountBigInt('0')).toBe(0n);
    expect(toDonatedErc20ClaimAmountBigInt(5)).toBe(5n);
    expect(toDonatedErc20ClaimAmountBigInt(6n)).toBe(6n);
  });
});
