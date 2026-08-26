import { getSelectionStanding } from '../selectionStanding';

describe('getSelectionStanding', () => {
  it('returns null without any gestures of your own', () => {
    expect(
      getSelectionStanding({
        totalGestures: 100,
        myGestures: 0,
        ethRecipients: 3,
        nftRecipients: 10,
      }),
    ).toBeNull();
    expect(
      getSelectionStanding({
        totalGestures: 0,
        myGestures: 0,
        ethRecipients: 3,
        nftRecipients: 10,
      }),
    ).toBeNull();
  });

  it('computes the complement of missing every draw', () => {
    const standing = getSelectionStanding({
      totalGestures: 100,
      myGestures: 10,
      ethRecipients: 3,
      nftRecipients: 10,
    });
    expect(standing).not.toBeNull();
    // 1 - 0.9^3 = 27.1%
    expect(standing!.stellarEth).toBeCloseTo(27.1, 1);
    // 1 - 0.9^10 = 65.13%
    expect(standing!.nft).toBeCloseTo(65.13, 1);
  });

  it('caps at certainty when the wallet made every gesture', () => {
    const standing = getSelectionStanding({
      totalGestures: 5,
      myGestures: 5,
      ethRecipients: 3,
      nftRecipients: 10,
    });
    expect(standing!.stellarEth).toBe(100);
    expect(standing!.nft).toBe(100);
  });
});
