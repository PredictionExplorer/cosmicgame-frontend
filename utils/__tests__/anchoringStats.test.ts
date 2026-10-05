import { countActiveAnchorHolders, distributionPerAnchoredNft } from '../anchoringStats';

describe('distributionPerAnchoredNft', () => {
  it('divides the pool by the anchored count', () => {
    expect(distributionPerAnchoredNft(2, 4)).toEqual({ status: 'available', perNftEth: 0.5 });
  });

  it('reports no per-NFT figure when nothing is anchored, instead of the whole pool', () => {
    // Regression: with 0 NFTs anchored the hub showed the full 0.172488 ETH pool as the
    // "Distribution per NFT".
    expect(distributionPerAnchoredNft(0.172488, 0)).toEqual({ status: 'noneAnchored' });
  });

  it('keeps an empty pool as a real zero share', () => {
    expect(distributionPerAnchoredNft(0, 10)).toEqual({ status: 'available', perNftEth: 0 });
  });

  it.each([
    [undefined, 10],
    [1, undefined],
    [Number.NaN, 10],
    [-1, 10],
  ])('reports pool %p and count %p as unavailable', (pool, count) => {
    expect(distributionPerAnchoredNft(pool, count)).toEqual({ status: 'unavailable' });
  });
});

describe('countActiveAnchorHolders', () => {
  it('counts a wallet anchoring both kinds once', () => {
    // Regression: /statistics/anchoring added 7 + 9 holders into "16 Active Anchor-holders"
    // while 5 wallets anchor both kinds.
    const cst = [
      { StakerAddr: '0xAAA', TotalTokensStaked: 9 },
      { StakerAddr: '0xBBB', TotalTokensStaked: 5 },
    ];
    const rwlk = [
      { StakerAddr: '0xbbb', TotalTokensStaked: 14 },
      { StakerAddr: '0xCCC', TotalTokensStaked: 1 },
    ];
    expect(countActiveAnchorHolders(cst, rwlk)).toBe(3);
  });

  it('drops wallets that released every NFT', () => {
    expect(countActiveAnchorHolders([{ StakerAddr: '0xAAA', TotalTokensStaked: 0 }], [])).toBe(0);
  });

  it('is unknown until both lists are available', () => {
    expect(countActiveAnchorHolders(undefined, [])).toBeNull();
    expect(countActiveAnchorHolders([], null)).toBeNull();
  });
});
