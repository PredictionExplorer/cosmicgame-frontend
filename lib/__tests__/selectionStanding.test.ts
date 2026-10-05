import { getSelectionShare } from '../selectionStanding';

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
