import { ApiReadError } from '@/services/api/readError';
import { get_round_info } from '@/services/api/rounds';
import { get_cst_info } from '@/services/api/tokens';

import { readRoundList } from '../../publicDataReads';
import { readFinalizedCycleSeeds } from '../finalizedReads';

jest.mock('@/services/api/rounds', () => ({ get_round_info: jest.fn() }));
jest.mock('@/services/api/tokens', () => ({ get_cst_info: jest.fn() }));
jest.mock('../../publicDataReads', () => ({ readRoundList: jest.fn() }));

const mockRoundInfo = get_round_info as jest.MockedFunction<typeof get_round_info>;
const mockCstInfo = get_cst_info as jest.MockedFunction<typeof get_cst_info>;
const mockRoundList = readRoundList as jest.MockedFunction<typeof readRoundList>;

const RECORD = { RoundNum: 1, TokenId: 24, TokenSeed: '5084a8' } as Awaited<
  ReturnType<typeof get_round_info>
>;
const ROUNDS = [{ RoundNum: 1 }] as NonNullable<Awaited<ReturnType<typeof readRoundList>>['data']>;

describe('readFinalizedCycleSeeds', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    mockRoundList.mockResolvedValue({ data: ROUNDS, at: 1 });
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('seeds the record and its Signature, keyed like the client hooks', async () => {
    mockRoundInfo.mockResolvedValue(RECORD);
    mockCstInfo.mockResolvedValue({ TokenId: 24, TokenName: 'Orbit' } as Awaited<
      ReturnType<typeof get_cst_info>
    >);
    const seeds = await readFinalizedCycleSeeds(1);
    expect(seeds.map((seed) => seed.queryKey)).toEqual([
      ['roundInfo', 1],
      ['cstInfo', 24],
    ]);
    expect(seeds[0]).toMatchObject({ data: RECORD });
    expect(mockRoundList).not.toHaveBeenCalled();
  });

  it('keeps the record when its Signature cannot be read', async () => {
    mockRoundInfo.mockResolvedValue(RECORD);
    mockCstInfo.mockRejectedValue(new Error('Network response was not OK'));
    const seeds = await readFinalizedCycleSeeds(1);
    expect(seeds.map((seed) => seed.queryKey)).toEqual([['roundInfo', 1]]);
  });

  it.each([
    [
      'answers 400 for a cycle it holds no record of',
      new ApiReadError('Network response was not OK', 400, { error: 'record not found' }),
    ],
    ['answers with an empty record', null],
  ])(
    'seeds no record, with the cycle list that says why, when the API %s',
    async (_case, answer) => {
      if (answer instanceof Error) mockRoundInfo.mockRejectedValue(answer);
      else mockRoundInfo.mockResolvedValue(answer);
      const seeds = await readFinalizedCycleSeeds(2);
      expect(seeds).toEqual([
        { queryKey: ['roundInfo', 2], data: null, at: expect.any(Number), absent: true },
        { queryKey: ['roundList'], data: ROUNDS, at: 1 },
      ]);
    },
  );

  it('seeds nothing from a failed read, so the client asks again', async () => {
    mockRoundInfo.mockRejectedValue(new ApiReadError('Network response was not OK', 503));
    await expect(readFinalizedCycleSeeds(3)).resolves.toEqual([]);
  });

  it('reads nothing under the e2e harness, whose specs mock the API in the browser', async () => {
    process.env.PLAYWRIGHT = '1';
    await expect(readFinalizedCycleSeeds(1)).resolves.toEqual([]);
    expect(mockRoundInfo).not.toHaveBeenCalled();
  });
});
