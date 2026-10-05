import { parseRecipient } from '../recipient';

// The global viem mock only pattern-matches addresses; checksum handling is
// what these tests are about, so they use viem's real address utilities.
jest.mock('viem', () => ({
  ...jest.requireActual('viem/utils'),
  zeroAddress: '0x0000000000000000000000000000000000000000',
}));

const CHECKSUMMED = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed';

describe('parseRecipient', () => {
  it('returns the checksummed address for a valid entry, lowercase or checksummed', () => {
    expect(parseRecipient(CHECKSUMMED)).toEqual({ address: CHECKSUMMED, error: null });
    expect(parseRecipient(` ${CHECKSUMMED.toLowerCase()} `)).toEqual({
      address: CHECKSUMMED,
      error: null,
    });
  });

  it('catches a mistyped character through the EIP-55 checksum', () => {
    const typo = CHECKSUMMED.replace('aAeb', 'aAEb');
    expect(parseRecipient(typo)).toEqual({ address: null, error: 'checksum' });
  });

  it('names what is wrong with an entry that cannot receive', () => {
    expect(parseRecipient('').error).toBe('required');
    expect(parseRecipient('0x123').error).toBe('invalid');
    expect(parseRecipient('5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed').error).toBe('invalid');
    expect(parseRecipient('0x0000000000000000000000000000000000000000').error).toBe('zero');
  });

  it('refuses the wallet the tokens leave from, in any letter case', () => {
    expect(parseRecipient(CHECKSUMMED, { from: CHECKSUMMED.toLowerCase() })).toEqual({
      address: null,
      error: 'self',
    });
    expect(parseRecipient(CHECKSUMMED, { from: null }).error).toBeNull();
  });
});
