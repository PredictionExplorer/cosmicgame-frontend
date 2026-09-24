import { NFT_NAME_MAX_BYTES, signatureTitle, truncateToBytes, utf8ByteLength } from '../nftName';

describe('NFT names', () => {
  it('counts UTF-8 bytes the way the contract stores them', () => {
    expect(utf8ByteLength('Twisted Mind')).toBe(12);
    expect(utf8ByteLength('é')).toBe(2);
    expect(utf8ByteLength('星')).toBe(3);
    expect(utf8ByteLength('🌌')).toBe(4);
  });

  it('keeps a name that fits as it is', () => {
    expect(truncateToBytes('Twisted Mind')).toBe('Twisted Mind');
    expect(truncateToBytes('a'.repeat(NFT_NAME_MAX_BYTES))).toHaveLength(NFT_NAME_MAX_BYTES);
  });

  it('stops at the last whole character that fits 32 bytes', () => {
    expect(truncateToBytes('a'.repeat(40))).toBe('a'.repeat(32));
    // Ten 3-byte characters are 30 bytes; the eleventh would make 33.
    expect(truncateToBytes('星'.repeat(11))).toBe('星'.repeat(10));
    // 31 ASCII bytes leave no room for a 4-byte emoji.
    expect(truncateToBytes(`${'a'.repeat(31)}🌌`)).toBe('a'.repeat(31));
  });

  it('never splits a character made of several code points', () => {
    const family = '👩‍👩‍👧'; // 18 bytes joined by zero-width joiners
    expect(truncateToBytes(`${'a'.repeat(20)}${family}`)).toBe('a'.repeat(20));
  });
});

describe('signatureTitle', () => {
  const t = (_key: 'quickView.title', values: { id: string }) => `Cosmic Signature ${values.id}`;

  it('names a named Signature by its name', () => {
    expect(signatureTitle(t, { id: '#000025', name: ' Twisted Mind ' })).toBe('Twisted Mind');
  });

  it('titles an unnamed Signature by its number', () => {
    expect(signatureTitle(t, { id: '#000007', name: null })).toBe('Cosmic Signature #000007');
    expect(signatureTitle(t, { id: '#000007', name: '  ' })).toBe('Cosmic Signature #000007');
  });
});
