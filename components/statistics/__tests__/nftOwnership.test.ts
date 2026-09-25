import { nftOwnership } from '../nftOwnership';

const CUSTODY = '0xC0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0C0';
const ALICE = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';
const BOB = '0xB0b0000000000000000000000000000000000B0b';

describe('nftOwnership', () => {
  it('credits anchored NFTs to their anchor-holders, not to the Anchoring Wallet', () => {
    // V304: the ledger counted the wallet holding 33 anchored NFTs as one of the holders,
    // while the profile credited an anchored NFT to the address that anchored it.
    const { holders, custody } = nftOwnership(
      [
        { OwnerAddr: CUSTODY.toLowerCase(), OwnerAid: 1, NumTokens: 3 },
        { OwnerAddr: BOB, OwnerAid: 2, NumTokens: 2 },
      ],
      [
        { StakerAddr: ALICE, TotalTokensStaked: 1 },
        { StakerAddr: BOB, TotalTokensStaked: 2 },
      ],
      CUSTODY,
    );
    expect(custody).toBe(3);
    expect(holders).toEqual([
      { address: BOB, held: 2, anchored: 2, total: 4 },
      { address: ALICE, held: 0, anchored: 1, total: 1 },
    ]);
  });

  it('leaves out addresses that released everything and rows with nothing held', () => {
    const { holders, custody } = nftOwnership(
      [{ OwnerAddr: BOB, OwnerAid: 2, NumTokens: 0 }],
      [{ StakerAddr: ALICE, TotalTokensStaked: 0 }],
      CUSTODY,
    );
    expect(holders).toEqual([]);
    expect(custody).toBeNull();
  });
});
