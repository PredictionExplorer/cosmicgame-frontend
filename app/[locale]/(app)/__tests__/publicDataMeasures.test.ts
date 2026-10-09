import { measureRows, measureUnit } from '../publicDataMeasures';

const A = '0x1111111111111111111111111111111111111111';
const B = '0x2222222222222222222222222222222222222222';
/** The history's Anchor Distribution recipient: a placeholder, not a wallet. */
const ANCHOR_DISTRIBUTION_RECIPIENT = '(All CS NFT Stakers)'; // lexicon-allow-backend-type

describe('public header measures', () => {
  it('counts rows and distinct addresses, case-insensitively, skipping placeholders', () => {
    const rows = [
      { WinnerAddr: A },
      { WinnerAddr: A.toUpperCase().replace('0X', '0x') },
      { WinnerAddr: B },
      { WinnerAddr: ANCHOR_DISTRIBUTION_RECIPIENT },
    ];
    expect(measureRows(rows, { kind: 'count' })).toBe(4);
    expect(measureRows(rows, { kind: 'distinct', fields: ['WinnerAddr'] })).toBe(2);
  });

  it('reads the first owner field a row sets, and says unknown when no row carries one', () => {
    const owners = {
      kind: 'distinct',
      fields: ['CurOwnerAddr', 'OwnerAddr'],
      unknownWhenAbsent: true,
    } as const;
    expect(measureRows([{ CurOwnerAddr: A }, { OwnerAddr: B }], owners)).toBe(2);
    // An endpoint that omits owners says nothing about ownership: never "0 owners".
    expect(measureRows([{ TokenId: 1 }, { TokenId: 2 }], owners)).toBeNull();
    expect(measureRows([], owners)).toBe(0);
  });

  it('sums a nested count, ETH, and only the ETH allocation record types', () => {
    const rounds = [{ RoundStats: { TotalBids: 10 } }, { RoundStats: {} }, { AmountEth: 2 }];
    expect(measureRows(rounds, { kind: 'sum', path: ['RoundStats', 'TotalBids'] })).toBe(10);
    expect(measureRows([{ AmountEth: 1.25 }, { AmountEth: '2.5' }], { kind: 'ethSum' })).toBe(3.75);
    // A CST row's AmountEth carries CST: never summed as ETH.
    expect(
      measureRows(
        [
          { RecordType: 0, AmountEth: 1 },
          { RecordType: 1, AmountEth: 5_000 },
        ],
        { kind: 'allocatedEth' },
      ),
    ).toBe(1);
  });

  it('dates the newest row, and has no date for an empty list', () => {
    expect(
      measureRows([{ TimeStamp: 10 }, { TimeStamp: 30 }, { TimeStamp: 20 }], { kind: 'latest' }),
    ).toBe(30);
    expect(measureRows([], { kind: 'latest' })).toBeNull();
  });

  it('names the unit each measure is shown in', () => {
    expect(measureUnit({ kind: 'count' })).toBe('count');
    expect(measureUnit({ kind: 'sum', path: [] })).toBe('count');
    expect(measureUnit({ kind: 'ethSum' })).toBe('eth');
    expect(measureUnit({ kind: 'allocatedEth' })).toBe('eth');
    expect(measureUnit({ kind: 'latest' })).toBe('date');
  });
});
