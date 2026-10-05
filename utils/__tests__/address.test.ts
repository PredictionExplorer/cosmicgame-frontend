import { sameAddress } from '../format';

describe('sameAddress', () => {
  const checksummed = '0x1Ec14a3F6C1D5E4b7C2A9a0b9D3E8f7A6B5cD7E9';

  it('matches the same account whatever the letter case', () => {
    expect(sameAddress(checksummed, checksummed.toLowerCase())).toBe(true);
    expect(sameAddress(checksummed.toUpperCase().replace('0X', '0x'), checksummed)).toBe(true);
  });

  it('tells different accounts apart', () => {
    expect(sameAddress(checksummed, '0x0000000000000000000000000000000000000001')).toBe(false);
  });

  it('never matches an empty side', () => {
    expect(sameAddress(null, null)).toBe(false);
    expect(sameAddress(undefined, checksummed)).toBe(false);
    expect(sameAddress(checksummed, '')).toBe(false);
  });
});
