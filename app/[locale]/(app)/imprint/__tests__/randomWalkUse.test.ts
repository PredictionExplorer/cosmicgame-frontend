import { randomWalkUse } from '../randomWalkImprint';

describe('randomWalkUse', () => {
  const chain = new Map([
    [1, true],
    [2, false],
  ]);

  it('takes the game contract’s record as the answer', () => {
    expect(randomWalkUse(1, chain, new Set())).toBe('used');
    expect(randomWalkUse(2, chain, new Set([2]))).toBe('unused');
  });

  it('lets the indexer say "used" without a chain reading, never "unused"', () => {
    expect(randomWalkUse(3, null, new Set([3]))).toBe('used');
    expect(randomWalkUse(4, null, new Set([3]))).toBe('unknown');
    expect(randomWalkUse(4, null, null)).toBe('unknown');
    expect(randomWalkUse(5, chain, new Set())).toBe('unknown');
  });
});
