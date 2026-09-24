import { getSelectionShare, getSelectionStanding } from '../selectionStanding';

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

describe('getSelectionShare', () => {
  it('is the linear share of the cycle’s gestures, next to its counts', () => {
    expect(getSelectionShare({ totalGestures: 1135, myGestures: 291 })).toEqual({
      myGestures: 291,
      totalGestures: 1135,
      share: 291 / 1135,
    });
  });

  it('never compounds: a 41% share stays 41%, not a 99% chance', () => {
    expect(getSelectionShare({ totalGestures: 100, myGestures: 41 })?.share).toBeCloseTo(0.41);
  });

  it('returns null without gestures in the cycle or of the wallet', () => {
    expect(getSelectionShare({ totalGestures: 0, myGestures: 0 })).toBeNull();
    expect(getSelectionShare({ totalGestures: 20, myGestures: 0 })).toBeNull();
    expect(getSelectionShare({ totalGestures: Number.NaN, myGestures: 2 })).toBeNull();
  });

  it('caps the wallet’s count at the cycle total when the reads disagree', () => {
    expect(getSelectionShare({ totalGestures: 5, myGestures: 7 })).toEqual({
      myGestures: 5,
      totalGestures: 5,
      share: 1,
    });
  });
});
