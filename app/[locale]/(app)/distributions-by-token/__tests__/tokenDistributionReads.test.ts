import { get_staking_rewards_by_user_by_token_details } from '@/services/api/anchoring';
import { get_cst_info } from '@/services/api/tokens';

import { readTokenDistributionSeeds } from '../[address]/[tokenId]/tokenDistributionReads';

jest.mock('@/services/api/anchoring', () => ({
  get_staking_rewards_by_user_by_token_details: jest.fn(),
}));
jest.mock('@/services/api/tokens', () => ({ get_cst_info: jest.fn() }));
// The real checksum (the shared viem mock returns addresses unchanged).
jest.mock('viem', () => jest.requireActual('viem'));

const mockDetails = get_staking_rewards_by_user_by_token_details as jest.MockedFunction<
  typeof get_staking_rewards_by_user_by_token_details
>;
const mockCstInfo = get_cst_info as jest.MockedFunction<typeof get_cst_info>;

const HOLDER = '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c';

describe('readTokenDistributionSeeds', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    mockCstInfo.mockResolvedValue({ TokenId: 47, RoundNum: 2 } as Awaited<
      ReturnType<typeof get_cst_info>
    >);
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('seeds an NFT with no deposit yet as the empty answer, keyed like the client hooks', async () => {
    mockDetails.mockResolvedValue({});
    const seeds = await readTokenDistributionSeeds(HOLDER, 47);
    expect(seeds).toEqual([
      { queryKey: ['stakingRewardsByUserByToken', HOLDER, 47], data: {}, at: expect.any(Number) },
      {
        queryKey: ['cstInfo', 47],
        data: { TokenId: 47, RoundNum: 2 },
        at: expect.any(Number),
      },
    ]);
  });

  it('leaves a failed read to the client', async () => {
    mockDetails.mockRejectedValue(new Error('Network response was not OK'));
    const seeds = await readTokenDistributionSeeds(HOLDER, 47);
    expect(seeds[0]).toMatchObject({ data: null });
  });

  it('reads with the checksummed address, never the raw segment', async () => {
    mockDetails.mockResolvedValue({});
    const seeds = await readTokenDistributionSeeds(HOLDER.toLowerCase(), 47);
    expect(mockDetails).toHaveBeenCalledWith(HOLDER, 47);
    expect(seeds[0]).toMatchObject({ queryKey: ['stakingRewardsByUserByToken', HOLDER, 47] });
  });

  it('reads nothing for a segment that is not an address', async () => {
    for (const raw of ['0x12/../../dashboard', `${HOLDER}?x=1`, 'not-an-address', '']) {
      await expect(readTokenDistributionSeeds(raw, 47)).resolves.toEqual([]);
    }
    expect(mockDetails).not.toHaveBeenCalled();
  });

  it('reads nothing for a token id that is not one, or under the e2e harness', async () => {
    await expect(readTokenDistributionSeeds(HOLDER, Number.NaN)).resolves.toEqual([]);
    process.env.PLAYWRIGHT = '1';
    await expect(readTokenDistributionSeeds(HOLDER, 47)).resolves.toEqual([]);
    expect(mockDetails).not.toHaveBeenCalled();
  });
});
