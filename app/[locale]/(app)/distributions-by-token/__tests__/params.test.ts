import { parseTokenDistributionParams } from '../[address]/[tokenId]/params';

// The real checksum (the shared viem mock returns addresses unchanged).
jest.mock('viem', () => jest.requireActual('viem'));

const HOLDER = '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c';

describe('parseTokenDistributionParams', () => {
  it('checksums an address in any case and reads a canonical token id', () => {
    expect(parseTokenDistributionParams(HOLDER.toLowerCase(), '45')).toEqual({
      address: HOLDER,
      tokenId: 45,
    });
    expect(parseTokenDistributionParams(HOLDER, '0')).toEqual({ address: HOLDER, tokenId: 0 });
  });

  it('rejects a segment that is not an address, so nothing raw reaches a read', () => {
    for (const raw of ['0x12/../dashboard', `${HOLDER}?x=1`, `${HOLDER}#x`, 'abc', '']) {
      expect(parseTokenDistributionParams(raw, '45')).toBeNull();
    }
  });

  it('rejects a token id that is not canonical', () => {
    for (const raw of ['045', '4.5', '-1', 'NaN', '1e3', '']) {
      expect(parseTokenDistributionParams(HOLDER, raw)).toBeNull();
    }
  });
});
