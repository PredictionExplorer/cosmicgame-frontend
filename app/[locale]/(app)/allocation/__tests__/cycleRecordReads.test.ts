import { ApiReadError } from '@/services/api/readError';
import { get_round_info, get_round_list } from '@/services/api/rounds';
import { get_cst_info, get_cst_list } from '@/services/api/tokens';
import type { CSTTokenInfo, RoundInfo } from '@/services/api/types';

import { readCycleRecord } from '../[id]/cycleRecordReads';

jest.mock('@/services/api/rounds', () => ({
  get_round_info: jest.fn(),
  get_round_list: jest.fn(),
}));
jest.mock('@/services/api/tokens', () => ({ get_cst_info: jest.fn(), get_cst_list: jest.fn() }));

const mockRoundInfo = get_round_info as jest.MockedFunction<typeof get_round_info>;
const mockRoundList = get_round_list as jest.MockedFunction<typeof get_round_list>;
const mockCstInfo = get_cst_info as jest.MockedFunction<typeof get_cst_info>;
const mockCstList = get_cst_list as jest.MockedFunction<typeof get_cst_list>;

const record = (cycle: number) =>
  ({ RoundNum: cycle, TokenId: 24, TokenSeed: '5084a8', WinnerAddr: '0x1' }) as RoundInfo;
const ROUNDS = [{ RoundNum: 0 }, { RoundNum: 1 }, { RoundNum: 2 }] as RoundInfo[];

describe('readCycleRecord', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    mockRoundList.mockResolvedValue(ROUNDS);
    mockCstInfo.mockResolvedValue({ TokenId: 24 } as CSTTokenInfo);
    mockCstList.mockResolvedValue([{ TokenId: 24, Seed: '5084a8' }] as CSTTokenInfo[]);
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('seeds a finalized cycle with its Signature, the cycle list and the plates', async () => {
    mockRoundInfo.mockResolvedValue(record(1));
    const read = await readCycleRecord(1);
    expect(read.seeds.map((seed) => seed.queryKey)).toEqual([
      ['roundInfo', 1],
      ['cstInfo', 24],
      ['roundList'],
    ]);
    expect(read.roleSeeds).toEqual({ '24': { seed: '5084a8' } });
  });

  it('keeps a finalized cycle behind the newest one for a day: its page is final', async () => {
    mockRoundInfo.mockResolvedValue(record(1));
    expect((await readCycleRecord(1)).cacheWindow).toBe('final');
  });

  it('keeps the newest finalized cycle five minutes: its pager gains the next cycle', async () => {
    mockRoundInfo.mockResolvedValue(record(2));
    expect((await readCycleRecord(2)).cacheWindow).toBe('live');
  });

  it('keeps a cycle with no record yet a minute, seeded as absent beside the list', async () => {
    mockRoundInfo.mockRejectedValue(new ApiReadError('record not found', 400));
    const read = await readCycleRecord(3);
    expect(read.cacheWindow).toBe('pending');
    expect(read.seeds).toEqual([
      { queryKey: ['roundInfo', 3], data: null, at: expect.any(Number), absent: true },
      { queryKey: ['roundList'], data: ROUNDS, at: expect.any(Number) },
    ]);
    expect(read.roleSeeds).toBeUndefined();
  });

  it('keeps a render whose record read failed a minute', async () => {
    mockRoundInfo.mockRejectedValue(new ApiReadError('Network response was not OK', 503));
    const read = await readCycleRecord(4);
    expect(read.cacheWindow).toBe('pending');
    expect(read.seeds.map((seed) => seed.queryKey)).toEqual([['roundList']]);
  });

  it('reads nothing under the e2e harness, whose specs mock the API in the browser', async () => {
    process.env.PLAYWRIGHT = '1';
    await expect(readCycleRecord(5)).resolves.toEqual({
      seeds: [],
      roleSeeds: undefined,
      cacheWindow: 'pending',
    });
    expect(mockRoundInfo).not.toHaveBeenCalled();
  });
});
