import {
  CST_RECORD_TYPES,
  ERC20_RECORD_TYPES,
  ETH_ALLOCATION_RECORD_TYPES,
  ETH_RECORD_TYPES,
  ETH_RETRIEVAL_RECORD_TYPES,
  NFT_RECORD_TYPES,
  STELLAR_SELECTION_RECORD_TYPES,
  allocationAmountUnit,
  sumAllocatedCst,
  sumAllocatedEth,
} from '../allocationRecords';

describe('allocation record types', () => {
  it('classifies every record type 0–18 into exactly one unit', () => {
    const unitSets = [ETH_RECORD_TYPES, CST_RECORD_TYPES, NFT_RECORD_TYPES, ERC20_RECORD_TYPES];
    for (let type = 0; type <= 18; type += 1) {
      expect(unitSets.filter((set) => set.has(type))).toHaveLength(1);
    }
  });

  it('keeps timeout retrievals out of the ETH allocation set', () => {
    for (const type of ETH_RETRIEVAL_RECORD_TYPES) {
      expect(ETH_RECORD_TYPES.has(type)).toBe(true);
      expect(ETH_ALLOCATION_RECORD_TYPES.has(type)).toBe(false);
    }
    expect([...ETH_ALLOCATION_RECORD_TYPES].sort((a, b) => a - b)).toEqual([0, 7, 10, 15]);
  });

  it('includes the timeout retrieval among Stellar Selection rows', () => {
    expect(STELLAR_SELECTION_RECORD_TYPES.has(18)).toBe(true);
  });

  it('names the unit of AmountEth per record type', () => {
    expect(allocationAmountUnit(0)).toBe('eth');
    expect(allocationAmountUnit(4)).toBe('cst');
    expect(allocationAmountUnit(14)).toBe('nft');
    expect(allocationAmountUnit(17)).toBe('erc20');
    expect(allocationAmountUnit(99)).toBe('unknown');
  });
});

describe('allocation totals', () => {
  // Production history at the time of the fix: 17.2357 Signature + 5.5154 Chrono-Warrior
  // + 2.7577 Stellar + 2.6548 Anchor Distribution ETH, plus 48 CST rows of 1,000 each.
  const history = [
    { RecordType: 0, AmountEth: 17.2357 },
    { RecordType: 7, AmountEth: 5.5154 },
    { RecordType: 10, AmountEth: 2.7577 },
    { RecordType: 15, AmountEth: 2.6548 },
    ...Array.from({ length: 48 }, (_, index) => ({
      RecordType: [1, 4, 6, 8, 11, 13][index % 6],
      AmountEth: 1000,
    })),
    { RecordType: 2, AmountEth: 0 },
    { RecordType: 18, AmountEth: 2.7577 },
  ];

  it('sums ETH allocations only', () => {
    expect(sumAllocatedEth(history)).toBeCloseTo(28.1636, 4);
  });

  it('sums CST allocations only', () => {
    expect(sumAllocatedCst(history)).toBe(48_000);
  });

  it('skips rows without a record type or a finite amount', () => {
    expect(
      sumAllocatedEth([
        { AmountEth: 5 },
        { RecordType: 0, AmountEth: Number.NaN },
        { RecordType: 0 },
      ]),
    ).toBe(0);
  });
});
