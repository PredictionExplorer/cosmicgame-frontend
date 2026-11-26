import { offerRowsFromLogs, type OfferLogEntry } from '@/hooks/useLotOfferHistory';

const entry = (overrides: Partial<OfferLogEntry>): OfferLogEntry => ({
  patron: '0x1111111111111111111111111111111111111111',
  total: 0n,
  blockNumber: 0n,
  logIndex: 0,
  txHash: '0xaaa',
  ...overrides,
});

describe('offerRowsFromLogs', () => {
  it('orders by block then log index and returns the newest first', () => {
    const rows = offerRowsFromLogs(
      [
        entry({ total: 3n * 10n ** 18n, blockNumber: 7n, logIndex: 2, txHash: '0x3' }),
        entry({ total: 1n * 10n ** 18n, blockNumber: 5n, logIndex: 0, txHash: '0x1' }),
        entry({ total: 2n * 10n ** 18n, blockNumber: 7n, logIndex: 1, txHash: '0x2' }),
      ],
      new Map(),
    );
    expect(rows.map((row) => row.txHash)).toEqual(['0x3', '0x2', '0x1']);
  });

  it('derives each raise over its predecessor, truncated to basis points', () => {
    const rows = offerRowsFromLogs(
      [
        entry({ total: 1_000n, blockNumber: 1n, logIndex: 0 }),
        entry({ total: 1_100n, blockNumber: 2n, logIndex: 0 }),
        entry({ total: 1_237n, blockNumber: 3n, logIndex: 0 }),
      ],
      new Map(),
    );
    // Newest first: 1237 over 1100 is +12.45%, 1100 over 1000 is +10%.
    expect(rows.map((row) => row.raisePercent)).toEqual([12.45, 10, null]);
  });

  it('marks the opening offer with a null raise', () => {
    const rows = offerRowsFromLogs([entry({ total: 5n, blockNumber: 1n })], new Map());
    expect(rows).toHaveLength(1);
    expect(rows[0]!.raisePercent).toBeNull();
  });

  it('dates each offer by its block and falls back to 0 for unknown blocks', () => {
    const rows = offerRowsFromLogs(
      [
        entry({ total: 1n, blockNumber: 5n, logIndex: 0 }),
        entry({ total: 2n, blockNumber: 6n, logIndex: 0 }),
      ],
      new Map([[5n, 1_700_000_000]]),
    );
    expect(rows.map((row) => row.placedAt)).toEqual([0, 1_700_000_000]);
  });

  it('returns no rows for a lot never offered on', () => {
    expect(offerRowsFromLogs([], new Map())).toEqual([]);
  });
});
