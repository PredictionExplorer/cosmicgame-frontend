import {
  CST_RECORD_TYPES,
  ERC20_RECORD_TYPES,
  ETH_ALLOCATION_RECORD_TYPES,
  ETH_RECORD_TYPES,
  ETH_RETRIEVAL_RECORD_TYPES,
  NFT_RECORD_TYPES,
  STELLAR_SELECTION_RECORD_TYPES,
  allocationAmountUnit,
  countRecipients,
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

describe('countRecipients', () => {
  const ANCHOR_HOLDERS_PLACEHOLDER = '(All CS NFT Stakers)'; // lexicon-allow-backend-type
  const walletA = '0x1Ec1CCEF3e1735bdA3F4BA698e8a524AA7c93274';
  const walletB = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

  it('counts each wallet once, whatever the address case', () => {
    // The allocation page's badge counted records (54) beside a table that
    // lists one row per recipient (12).
    expect(
      countRecipients([
        { WinnerAddr: walletA },
        { WinnerAddr: walletA.toLowerCase() },
        { WinnerAddr: walletB },
        { WinnerAddr: null },
        {},
      ]),
    ).toBe(2);
  });

  it('skips the anchor-holder placeholder a type-15 row carries', () => {
    // Regression: Cycle #1 read "Recipients 10" beside nine wallets and one
    // "All Cosmic Signature NFT anchor-holders" row.
    expect(
      countRecipients([
        { WinnerAddr: walletA },
        { WinnerAddr: ANCHOR_HOLDERS_PLACEHOLDER },
        { WinnerAddr: walletB },
      ]),
    ).toBe(2);
  });
});
