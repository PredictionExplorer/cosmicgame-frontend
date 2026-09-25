import {
  get_staking_cst_actions_info,
  get_staking_rwalk_actions_info,
} from '@/services/api/anchoring';
import { get_cst_info } from '@/services/api/tokens';

import { readAnchorActionSeeds } from '../[IsRwalk]/[actionId]/anchorActionReads';

jest.mock('@/services/api/anchoring', () => ({
  get_staking_cst_actions_info: jest.fn(),
  get_staking_rwalk_actions_info: jest.fn(),
}));
jest.mock('@/services/api/tokens', () => ({ get_cst_info: jest.fn() }));

const mockCstAction = get_staking_cst_actions_info as jest.MockedFunction<
  typeof get_staking_cst_actions_info
>;
const mockRwalkAction = get_staking_rwalk_actions_info as jest.MockedFunction<
  typeof get_staking_rwalk_actions_info
>;
const mockCstInfo = get_cst_info as jest.MockedFunction<typeof get_cst_info>;

type ActionInfo = NonNullable<Awaited<ReturnType<typeof get_staking_cst_actions_info>>>;
const anchored = { Stake: { EvtLogId: 7, TokenId: 12 }, Unstake: {} } as unknown as ActionInfo;
const released = {
  Stake: { EvtLogId: 7, TokenId: 12 },
  Unstake: { EvtLogId: 9, TokenId: 12 },
} as unknown as ActionInfo;

describe('readAnchorActionSeeds', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    mockCstInfo.mockResolvedValue(null);
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('keeps a released anchor for a day: its record is final', async () => {
    mockCstAction.mockResolvedValue(released);
    const read = await readAnchorActionSeeds({ isRwalk: 0, actionId: 1 });
    expect(read.cacheWindow).toBe('final');
    expect(read.seeds.map((seed) => seed.queryKey)).toEqual([
      ['stakingCSTActionsInfo', 1],
      ['cstInfo', 12],
    ]);
  });

  it('keeps an anchor still held five minutes: its release is still to come', async () => {
    mockRwalkAction.mockResolvedValue(anchored);
    const read = await readAnchorActionSeeds({ isRwalk: 1, actionId: 2 });
    expect(read.cacheWindow).toBe('live');
    expect(mockCstInfo).not.toHaveBeenCalled();
  });

  it('keeps a record the API does not hold a minute, seeded as absent', async () => {
    mockCstAction.mockResolvedValue(null);
    const read = await readAnchorActionSeeds({ isRwalk: 0, actionId: 3 });
    expect(read.cacheWindow).toBe('pending');
    expect(read.seeds[0]).toMatchObject({ data: null, absent: true });
  });

  it('keeps a render whose read failed a minute, seeding nothing', async () => {
    mockCstAction.mockRejectedValue(new Error('Network response was not OK'));
    await expect(readAnchorActionSeeds({ isRwalk: 0, actionId: 4 })).resolves.toEqual({
      seeds: [],
      cacheWindow: 'pending',
    });
  });
});
