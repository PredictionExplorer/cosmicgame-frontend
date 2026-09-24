import { summarizePendingRetrievals } from '../pendingRetrievals';

describe('summarizePendingRetrievals', () => {
  it('adds the Prizes Wallet ETH, Chrono-Warrior included', () => {
    expect(
      summarizePendingRetrievals({ ETHRaffleToClaim: 0.1, ETHChronoWarriorToClaim: 0.25 }),
    ).toEqual({ eth: 0.35, anchorEth: 0, nfts: 0, hasAny: true });
  });

  it('counts Anchor Distributions only with a retrievable action', () => {
    expect(
      summarizePendingRetrievals({ UnretrievedAnchorDistribution: 0.5, claimableActionIds: [] }),
    ).toEqual({ eth: 0, anchorEth: 0, nfts: 0, hasAny: false });
    expect(
      summarizePendingRetrievals({
        UnretrievedAnchorDistribution: 0.5,
        claimableActionIds: [{ DepositId: 1 }],
      }).anchorEth,
    ).toBe(0.5);
  });

  it('keeps dust as a real amount rather than rounding it away', () => {
    const pending = summarizePendingRetrievals({ ETHRaffleToClaim: 0.00001 });
    expect(pending.hasAny).toBe(true);
    expect(pending.eth).toBe(0.00001);
  });

  it('ignores negative, missing and non-numeric fields', () => {
    expect(summarizePendingRetrievals({ ETHRaffleToClaim: -1, NumDonatedNFTToClaim: 'x' })).toEqual(
      { eth: 0, anchorEth: 0, nfts: 0, hasAny: false },
    );
    expect(summarizePendingRetrievals(null).hasAny).toBe(false);
  });
});
