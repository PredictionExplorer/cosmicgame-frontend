import api from '@/services/api';

import { readProfile } from '../[address]/profileReads';

jest.mock('@/services/api', () => {
  const actual = jest.requireActual('@/services/api');
  const reads = Object.fromEntries(
    [
      'get_user_info',
      'get_claim_history_by_user',
      'get_user_balance',
      'get_cst_tokens_by_user',
      'get_staking_cst_actions_by_user',
      'get_staking_rwalk_actions_by_user',
      'get_staking_rewards_by_user',
      'get_staking_cst_by_user_by_deposit_rewards',
      'get_staking_rwalk_mints_by_user',
      'get_marketing_rewards_by_user',
      'get_claimed_donated_nft_by_user',
      'get_unclaimed_donated_nft_by_user',
      'get_donations_erc20_by_user',
    ].map((name) => [name, jest.fn(async () => [])]),
  );
  return { __esModule: true, ...actual, default: { ...actual.default, ...reads } };
});

const ADDRESS = '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c';
const mockApi = api as unknown as Record<string, jest.Mock>;

describe('readProfile', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    delete process.env.PLAYWRIGHT;
    for (const read of Object.values(mockApi)) {
      if (jest.isMockFunction(read)) read.mockReset().mockResolvedValue([]);
    }
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  // Each seed must land under the key of the hook UserStatisticsView calls, or the
  // browser reads it again and the server HTML showed placeholders for nothing.
  it('seeds every read of the profile under its hook’s key', async () => {
    const { seeds, cacheWindow } = await readProfile(ADDRESS);
    expect(seeds.map((seed) => seed.queryKey)).toEqual(
      [
        'userInfo',
        'claimHistoryByUser',
        'userBalance',
        'cstTokensByUser',
        'stakingCSTActionsByUser',
        'stakingRWLKActionsByUser',
        'stakingRewardsByUser',
        'stakingCSTByUserByDeposit',
        'stakingRWLKMintsByUser',
        'marketingRewardsByUser',
        'claimedDonatedNFTByUser',
        'unclaimedDonatedNFTByUser',
        'donationsERC20ByUser',
      ].map((key) => [key, ADDRESS]),
    );
    expect(cacheWindow).toBe('live');
  });

  it('seeds an address with no record as the null its hook answers', async () => {
    mockApi.get_user_info!.mockResolvedValue(null);
    const { seeds } = await readProfile(ADDRESS);
    expect(seeds[0]).toMatchObject({ queryKey: ['userInfo', ADDRESS], data: null, absent: true });
  });

  it('leaves a failed read to the browser and keeps the render a minute', async () => {
    mockApi.get_claim_history_by_user!.mockRejectedValue(new Error('Network response was not OK'));
    const { seeds, cacheWindow } = await readProfile(ADDRESS);
    expect(seeds.some((seed) => seed.queryKey[0] === 'claimHistoryByUser')).toBe(false);
    expect(seeds).toHaveLength(12);
    expect(cacheWindow).toBe('pending');
  });

  it('reads nothing under the e2e harness, whose browser mocks the API', async () => {
    process.env.PLAYWRIGHT = '1';
    await expect(readProfile(ADDRESS)).resolves.toEqual({ seeds: [], cacheWindow: 'pending' });
    expect(mockApi.get_user_info).not.toHaveBeenCalled();
  });
});
