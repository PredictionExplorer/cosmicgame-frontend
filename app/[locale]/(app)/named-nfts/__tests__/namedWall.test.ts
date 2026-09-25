import { currentNaming, newestNamedFirst, readNamedWall, type NamedSignature } from '../namedWall';

const mockNamed = jest.fn();
const mockInfo = jest.fn();
const mockHistory = jest.fn();
// lexicon-allow-start: test mocks mirror sealed API module filenames.
jest.mock('../../../../../services/api/tokens', () => ({
  get_named_nfts: (...args: unknown[]) => mockNamed(...args),
  get_cst_info: (...args: unknown[]) => mockInfo(...args),
  get_name_history: (...args: unknown[]) => mockHistory(...args),
}));
// lexicon-allow-end

const tx = (overrides: Record<string, unknown>) => ({
  EvtLogId: 1,
  BlockNum: 1,
  TxId: 1,
  TxHash: '0xabc',
  TimeStamp: 100,
  DateTime: '',
  TokenName: 'x',
  ...overrides,
});

describe('currentNaming', () => {
  it('takes the latest naming whatever order the history arrives in', () => {
    const history = [
      tx({ TimeStamp: 100, TokenName: 'First' }),
      tx({ TimeStamp: 300, TokenName: 'Third' }),
      tx({ TimeStamp: 200, TokenName: 'Second' }),
    ];
    expect(currentNaming(history)?.TokenName).toBe('Third');
    expect(currentNaming([])).toBeNull();
  });
});

describe('newestNamedFirst', () => {
  it('puts the most recently named first and unknown naming times last', () => {
    const rows = [
      { tokenId: 1, namedAt: 100 },
      { tokenId: 2, namedAt: null },
      { tokenId: 3, namedAt: 300 },
    ] as NamedSignature[];
    expect(newestNamedFirst(rows).map((row) => row.tokenId)).toEqual([3, 1, 2]);
  });
});

describe('readNamedWall', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads only the named tokens and joins their records and naming history', async () => {
    mockNamed.mockResolvedValue([
      { TokenId: 1, TokenName: 'NUMBA 1', MintTimeStamp: 10 },
      { TokenId: 25, TokenName: 'Twisted Mind', MintTimeStamp: 20 },
    ]);
    mockInfo.mockImplementation(async (id: number) => ({
      TokenId: id,
      Seed: `seed-${id}`,
      Staked: id === 25,
    }));
    mockHistory.mockImplementation(async (id: number) => [
      tx({ TimeStamp: id * 100, TxHash: `0x${id}`, ChangedBy: '0xNamer' }),
    ]);

    const rows = await readNamedWall();
    expect(rows.map((row) => row.tokenId)).toEqual([25, 1]);
    expect(rows[0]).toEqual({
      tokenId: 25,
      name: 'Twisted Mind',
      seed: 'seed-25',
      anchored: true,
      imprintedAt: 20,
      namedAt: 2500,
      namedBy: '0xNamer',
      namedTx: '0x25',
    });
    expect(mockInfo).toHaveBeenCalledTimes(2);
  });

  it('still hangs a token whose record or history cannot be read', async () => {
    mockNamed.mockResolvedValue([{ TokenId: 7, TokenName: 'Lone', MintTimeStamp: 5 }]);
    mockInfo.mockRejectedValue(new Error('down'));
    mockHistory.mockRejectedValue(new Error('down'));
    await expect(readNamedWall()).resolves.toEqual([
      expect.objectContaining({ tokenId: 7, name: 'Lone', seed: null, namedAt: null }),
    ]);
  });

  it('rejects when the name list cannot be read, so the wall says so', async () => {
    mockNamed.mockRejectedValue(new Error('Network response was not OK'));
    await expect(readNamedWall()).rejects.toThrow();
  });
});
