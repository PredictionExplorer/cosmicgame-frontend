import { anchoredArtworks, summarizeAllocations, summarizeGestures } from '../profileSummary';

describe('summarizeGestures', () => {
  it('sums what was paid in each currency and counts the cycles', () => {
    const summary = summarizeGestures([
      { RoundNum: 0, GestureType: 0, GestureCostEth: 0.1 },
      { RoundNum: 2, GestureType: 2, CstCost: 250 },
      { RoundNum: 2, GestureType: 1, GestureCostEth: 0.05 },
    ]);
    expect(summary).toMatchObject({ count: 3, cycles: 2, firstCycle: 0, cstSpent: 250 });
    expect(summary.ethSpent).toBeCloseTo(0.15);
  });

  it('reads the raw price fields when the normalized ones are missing', () => {
    const summary = summarizeGestures([
      { RoundNum: 1, EthPriceEth: 0.2 },
      { RoundNum: 1, CstPriceEth: 10 },
    ]);
    expect(summary.ethSpent).toBeCloseTo(0.2);
    expect(summary.cstSpent).toBe(10);
  });

  it('ignores the API’s "none" markers (-1, -1e-18) instead of subtracting them', () => {
    const summary = summarizeGestures([
      { RoundNum: 2, EthPriceEth: -1e-18, CstPriceEth: 269.74 },
      { RoundNum: 2, EthPriceEth: 0.0943, CstPriceEth: -1 },
    ]);
    expect(summary.ethSpent).toBeCloseTo(0.0943);
    expect(summary.cstSpent).toBeCloseTo(269.74);
  });

  it('reports no first cycle for an empty history', () => {
    expect(summarizeGestures([])).toEqual({
      count: 0,
      cycles: 0,
      firstCycle: null,
      ethSpent: 0,
      cstSpent: 0,
    });
  });
});

describe('summarizeAllocations', () => {
  const history = [
    { RecordType: 0, RoundNum: 1, AmountEth: 11.0616 },
    { RecordType: 1, RoundNum: 1, AmountEth: 1000 },
    { RecordType: 2, RoundNum: 1, AmountEth: 0 },
    { RecordType: 3, RoundNum: 1, AmountEth: 0 },
    { RecordType: 0, RoundNum: 0, AmountEth: 6.1741 },
    { RecordType: 10, RoundNum: 0, AmountEth: 0.5 },
    { RecordType: 18, RoundNum: 0, AmountEth: 0.5 },
  ];

  it('counts ETH once: CST rows and timeout retrievals are not ETH received', () => {
    expect(summarizeAllocations(history).ethReceived).toBeCloseTo(11.0616 + 6.1741 + 0.5);
  });

  it('names each title once with the cycles it was held in, oldest first', () => {
    expect(summarizeAllocations(history).titles).toEqual([
      { title: 'signatureAllocation', cycles: [0, 1] },
      { title: 'finalCstGesture', cycles: [1] },
    ]);
  });

  it('counts every record', () => {
    expect(summarizeAllocations(history).records).toBe(7);
  });
});

describe('anchoredArtworks', () => {
  it('reads each anchored token from its nested TokenInfo', () => {
    expect(
      anchoredArtworks([
        {
          StakeActionId: 1,
          TokenInfo: { TokenId: 0, TokenName: '', RoundNum: 0, Seed: '2a34' },
        },
        { TokenInfo: { TokenId: 41, TokenName: 'Twisted Mind', RoundNum: 1, Seed: 'ff' } },
      ]),
    ).toEqual([
      { TokenId: 0, TokenName: '', RoundNum: 0, Seed: '2a34' },
      { TokenId: 41, TokenName: 'Twisted Mind', RoundNum: 1, Seed: 'ff' },
    ]);
  });

  it('skips rows without a readable token id', () => {
    expect(
      anchoredArtworks([null, {}, { TokenInfo: { TokenId: 'x' } }, { TokenInfo: { TokenId: -1 } }]),
    ).toEqual([]);
  });
});
